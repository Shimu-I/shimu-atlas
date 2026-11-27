# Development Log

## Phase 1a — Backend scaffold
- FastAPI app factory (`backend/main.py`); settings from `ATLAS_*` environment variables.
- SQLite with foreign keys ON and WAL; Alembic with batch mode for SQLite-safe changes.
- Auth: one owner account created via `/api/auth/setup` (only while no user exists); Argon2 hashes; session cookie is HttpOnly/SameSite=Lax and only its SHA-256 is stored; failed logins rate-limited per client.
- Decision: `NaiveDatetime` fields storing UTC, because this SQLModel version rejects naive datetimes otherwise.
- A test fails if a model changes without a migration.
- The AI layer is not present yet; `/api/health` reports `ai: not_configured`.

## Phase 1b — Design system and app shell
- Frontend: Vite + React + TypeScript + Tailwind v4, Lucide icons, Inter (UI) and Source Serif 4 (headings, reading).
- Tokens live in `frontend/src/styles/tokens.css`. `npm run check:contrast` reads that same file and checks WCAG AA in both themes.
- Palette: dark theme passes exactly as specified. Light theme needed two adjustments: secondary text `#69736a` to `#5a645b`, and control border to `#78837a`.
- Responsive design: phone gets bottom navigation plus a drawer; tablet gets an icon rail; desktop gets a collapsible labelled sidebar.
- Dialogs and the drawer use native `<dialog>` for focus trapping and Esc.
- Every page is a real empty state; no sample books, statistics or recommendations.
- Analytics module added to the roadmap (docs/ANALYTICS_PLAN.md). Its main effect today: the reader (1d) must record active-time reading sessions from the first release.
- Verified: type-check, production build, 9 tests, and screenshots at 360/390/768/1024/1440 in both themes against the live backend.

## Phase 1b (revision) — Cherry Blossom palette and fonts
- Replaced the forest-green identity with the supplied pink palette (Raisin Black, Silver Pink, Desert Sand, New York Pink, Deep Puce). Text pairings were sampled from the card itself; see docs/DESIGN_SYSTEM.md.
- Dark theme uses Raisin Black with pink headings; light theme uses a Desert Sand sidebar with navy headings and Deep Puce accents.
- Fonts: DM Serif Display (headings), DM Sans (interface), Source Serif 4 kept for reading. Inter removed.
- Contrast checker extended to 23 pairings per theme (headings, sidebar, errors, reading surface). One link colour was darkened to pass.
- Dependencies: frontend already on latest majors; backend minor updates applied (fastapi, httpx, pydantic).
