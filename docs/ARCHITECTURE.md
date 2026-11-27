# Shimu Atlas — Architecture Proposal (Phase 0)
*My Personal Knowledge & Research System*

Status: **PROPOSAL — awaiting approval. No application code has been written.**

---

## 1. Summary of the recommendation

A single-user, local-first web app running on your Ubuntu laptop:

- **One backend process** (FastAPI) + **one SQLite file** + **a folder of PDFs**.
- **Frontend** React + TypeScript + Vite + Tailwind, installable as a PWA.
- **AI is a separate, optional layer.** Library, reader, notes and progress never import or call Ollama or the embedding model. If AI is off, those features are unaffected.
- **No Docker, Redis, or extra services** required for development or daily use.

```
Browser/PWA (phone, PC)
      │  HTTPS (Tailscale)
      ▼
FastAPI backend ──► SQLite (books, notes, progress, careers, FTS5 index)
      │        └──► data/books/<sha256>.pdf   (served with HTTP range requests)
      │
      └─ optional AI layer (separate Python package, lazy-loaded)
             ├─ extraction worker (PyMuPDF → chunks)
             ├─ embeddings (multilingual-e5-small)
             ├─ vector index
             └─ Ollama client (HTTP to localhost:11434)
```

---

## 2. Risks and missing requirements I found in the spec

| # | Risk / gap | Proposed default |
|---|-----------|------------------|
| 1 | **PWA needs HTTPS** on the phone (service worker, install prompt). Plain `http://laptop-ip` will not install. | Use `tailscale serve` (gives HTTPS on your tailnet with a real cert). Backend binds to `127.0.0.1` only. |
| 2 | **Laptop must be on** for phone access. | Accept for now; document it. Optional later: offline cache of current book. |
| 3 | **Sync conflicts** ("don't overwrite newer progress"). | Every progress write carries `device_id` + a client timestamp + monotonically increasing `revision`. Server rejects stale revisions and returns the current state. The user can always manually set a page. |
| 4 | **"Completed" must not be inferred** from opening the last page. | `Completed` is set only manually. The app may *suggest* it. |
| 5 | **PDF page labels vs. printed page numbers** differ (roman-numeral front matter, offsets). Citations will be wrong if ignored. | Store both `pdf_page_index` and `page_label`. Cite the PDF page index and the label when available. |
| 6 | **Chapter detection is unreliable.** | Use the PDF outline/bookmarks first; fall back to heading heuristics; mark each chapter as `source = outline / heuristic / manual` so uncertain ones are visible and editable. |
| 7 | **Bengali**: most of your books are probably English. Bengali queries against English text depend on the embedding model. | Evaluate multilingual-e5-small on a small Bengali↔English test set before claiming support. OCR for Bengali needs `tesseract-ocr-ben`. |
| 8 | **Highlights on PDFs** require storing geometry, not just text. | Store page + normalized rectangles + selected text. Re-render as an overlay on PDF.js. Never modify the PDF itself. |
| 9 | **Backup**: DB, PDFs and vector index have different recovery needs. | Back up DB + notes with a nightly `sqlite3 .backup`; PDFs separately (rsync/external disk); vector index is **rebuildable** and excluded from critical backup. |
| 10 | **Copyright / privacy**: PDFs must not be publicly reachable. | Files served only through authenticated endpoints, never as static files. |
| 11 | **Auth for a single user** is easy to over-build. | One account, Argon2 password hash, HttpOnly session cookie, login rate limiting. No OAuth. |
| 12 | Spec lists 19 books but I have not seen them. | I will not invent titles or content. Everything is populated from your PDFs. |

---

## 3. Build custom vs. integrate existing software

| Option | Covers | Why it does / doesn't fit |
|--------|--------|---------------------------|
| Calibre-Web / Kavita / Komga | Library, reading progress | No notes↔career↔concept graph, no RAG, hard to extend into the spec. |
| Paperless-ngx | Document archive + OCR | Built for documents/receipts, heavy (Redis, Postgres, Docker). |
| Obsidian / Logseq | Notes, links | No PDF page-tracking, sync or career mapping; not a web app for phone. |
| Open WebUI / AnythingLLM | Chat + RAG | Generic RAG; weak page-level citations and no library integration. |
| **Custom app using good libraries** | Everything | **Recommended.** The value is the *connections* (career → skill → concept → book → page → note), which no existing tool models. |

**Decision:** custom app, but reuse proven components rather than rewriting them: **PDF.js** (rendering), **PyMuPDF** (extraction), **SQLite FTS5** (keyword search), **CodeMirror** (Markdown editor), **Ollama** (LLM runtime).

---

## 4. Stack decisions

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | React 18 + TypeScript + Vite + Tailwind | As specified. TanStack Query for server state. Lucide icons. |
| PDF reader | `pdfjs-dist` | Own thin wrapper; pages rendered lazily; range requests so whole file is never loaded. |
| Backend | FastAPI + SQLModel/SQLAlchemy + Pydantic | Alembic for migrations. |
| DB | SQLite (WAL mode, foreign keys ON) | One file, trivial backup. |
| Background jobs | In-process worker + `jobs` table | No Redis/Celery. Survives restarts by resuming `pending` jobs. |
| Extraction | PyMuPDF (primary), Tesseract only for pages with no text layer | pdfplumber only if tables need it; not default. |
| Embeddings | `multilingual-e5-small` (384-dim) via `sentence-transformers` or ONNX | To be evaluated, not assumed. |
| Keyword search | SQLite **FTS5** | Built in, zero extra dependency. |
| Vector search | **Proposal: `sqlite-vec` in the same SQLite file** | See below. |
| LLM | Ollama, 1B–3B Q4 model, configurable | Nothing auto-downloaded. |

### Vector store: ChromaDB vs. sqlite-vec (needs your decision)

- **ChromaDB**: as in your spec; separate store, heavier dependency set, deletes/consistency are managed separately from SQLite.
- **sqlite-vec + FTS5 (my recommendation)**: ~20k chunks is tiny. One file, deleting a book removes its chunks and vectors in one transaction, hybrid search is two queries on one DB, and backup/restore is simpler.
- The retrieval code sits behind a `VectorStore` interface, so either can be used and swapped later. If you prefer Chroma, I will use Chroma.

---

## 5. Data model (overview)

Full schema comes in `DATABASE_SCHEMA.md` after approval. Core idea is many-to-many links through mapping tables:

```
careers ─< career_skills >─ skills ─< skill_concepts >─ concepts
                                         │
                      concept_sources ───┴──► (book, chapter, page range)
books ─< book_files (sha256 unique → no duplicate PDFs)
books ─< chapters ─< chunks (page, text, embedding)
books ─< reading_progress (per device, revision)
notes ─ links (polymorphic: book | chapter | page | concept | skill | project)
projects ─< project_skills >─ skills
user_skill_status (Not Explored … Confident, manual)
```

All 21 entities in your spec are covered. Notes carry an `origin` field (`user` | `ai_generated`) so your writing is never mixed up with generated text, and AI content is never saved over a user note.

---

## 6. Folder structure

Adapted from your layout; directories are created only when needed.

```
shimu-atlas/
├── frontend/            React app (features/library, reader, notes, ...)
├── backend/
│   ├── api/  models/  database/  services/  tests/
├── ai/                  OPTIONAL package: extraction, embeddings, retrieval, LLM client
├── data/                (git-ignored) books/ covers/ database/ backups/
├── docs/  scripts/
├── ARCHITECTURE.md  DEVELOPMENT_PLAN.md  DEVELOPMENT_LOG.md  TASKS.md  README.md
```

`ai/` is separate from `backend/services/` on purpose: the core app imports nothing from it, which enforces "library works without AI."

---

## 7. Estimates (to be measured, not promised)

Assumptions: 19 books, ~500 pages average.

| Item | Estimate |
|------|----------|
| PDFs on disk | 0.4–1.0 GB (depends on scanned vs. text PDFs; you must check) |
| Pages / chunks | ~9,500 pages → ~15–25k chunks |
| Vector data (384-dim float32) | ~25–40 MB |
| SQLite + FTS5 index | ~100–200 MB |
| Embedding model | ~120 MB on disk, ~0.5 GB RAM while indexing |
| Ollama 3B Q4 model | ~2 GB disk, ~3 GB RAM while running |
| Backend idle RAM | ~150–300 MB |
| Initial full indexing (CPU) | roughly 15–60 min; will be measured in Phase 3 |
| Peak RAM with everything running | ~4–5 GB, comfortably within 16 GB |

---

## 8. Build order (your plan + your design-first recommendation)

You asked for design system + **Dashboard, Library, PDF Reader** first. Proposed Phase 1 split into small, individually approvable steps:

1. **1a — Project scaffold**: repo, backend skeleton, DB + migrations, auth, health check.
2. **1b — Design system**: tokens (palette contrast-checked; now the Cherry Blossom palette, see DESIGN_SYSTEM.md), typography, app shell, core components (button, input, dialog, toast, command palette skeleton).
3. **1c — Library**: add book (PDF upload, SHA-256 dedupe, metadata edit), grid/list, search, filters, status.
4. **1d — PDF Reader**: PDF.js, page tracking, progress sync with conflict handling, bookmarks.
5. **1e — Dashboard**: only real data (continue reading, recent books, progress). No fake stats.
6. **1f — Test on PC + phone**, then review.

Then Notes → RAG → Careers → Recommendations → Analytics → PWA polish/backups.

**Minimum viable release (v0.1):** upload PDFs, library, reader with synced progress, bookmarks, dashboard — usable end to end and on your phone.

---

## 9. Commands to initialize on Ubuntu (for 1a, not run yet)

```bash
# prerequisites check
python3 --version; node --version; free -h; df -h ~

sudo apt install -y python3-venv sqlite3 tesseract-ocr   # tesseract-ocr-ben later
mkdir -p ~/shimu-atlas && cd ~/shimu-atlas && git init

# backend
python3 -m venv .venv && source .venv/bin/activate
pip install fastapi "uvicorn[standard]" sqlmodel alembic pydantic-settings argon2-cffi python-multipart pytest httpx

# frontend
npm create vite@latest frontend -- --template react-ts
cd frontend && npm i tailwindcss @tailwindcss/vite lucide-react @tanstack/react-query react-router-dom pdfjs-dist
```

---

## 10. Decisions I need from you

1. Vector store: **sqlite-vec (recommended)** or ChromaDB?
2. Is the phone access plan (Tailscale + `tailscale serve` for HTTPS) acceptable?
3. Are your PDFs mostly text-based or scanned? (Affects OCR priority and disk estimates.)
4. Approve the 1a–1f split, starting with the scaffold?
