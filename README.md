# Shimu Atlas

*My Personal Knowledge & Research System*

A local-first personal library, PDF reader, notes system and (later) AI research assistant.
Single user, runs on your own machine, no paid APIs. Personal data (`data/`, PDFs, databases, `.env`) is git-ignored.

**Status:** Phase 1b — design system and app shell on top of the 1a backend. No books or reading features yet.
Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Analytics plan: [docs/ANALYTICS_PLAN.md](docs/ANALYTICS_PLAN.md). Progress: [TASKS.md](TASKS.md), [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md).

## Setup (Ubuntu)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # adjust if needed
alembic upgrade head          # creates data/database/atlas.db
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000/api/health, or http://127.0.0.1:8000/docs for the API explorer.
The server binds to `127.0.0.1` only. Remote access will go through Tailscale (Phase 7).

## Frontend

```bash
cd frontend && npm install
npm run dev            # http://localhost:5173 (proxies /api to the backend on :8000)
npm test               # component tests
npm run check:contrast # WCAG contrast check for the design tokens
npm run build
```

Run the backend first (above), then the frontend. On first visit you create the owner account.

## First run

`GET /api/auth/status` returns `{"setup_required": true}` until the owner account exists.
Create it once with `POST /api/auth/setup` (username 3+ chars, password 10+ chars); after that, `/api/auth/setup` is closed.

## Tests

```bash
source .venv/bin/activate && python -m pytest
```

## Troubleshooting

- **`No module named 'backend'`** — run commands from the repository root.
- **Locked out by login rate limit** — wait 5 minutes (configurable via `ATLAS_LOGIN_*`) or restart the server.
- **Database location** — `data/database/atlas.db` unless `ATLAS_DATABASE_URL` is set.
