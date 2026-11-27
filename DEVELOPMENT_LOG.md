# Development Log

## Phase 1a — Backend scaffold
- FastAPI app factory (`backend/main.py`); settings from `ATLAS_*` environment variables.
- SQLite with foreign keys ON and WAL; Alembic with batch mode for SQLite-safe changes.
- Auth: one owner account created via `/api/auth/setup` (only while no user exists); Argon2 hashes; session cookie is HttpOnly/SameSite=Lax and only its SHA-256 is stored; failed logins rate-limited per client.
- Decision: `NaiveDatetime` fields storing UTC, because this SQLModel version rejects naive datetimes otherwise.
- A test fails if a model changes without a migration.
- The AI layer is not present yet; `/api/health` reports `ai: not_configured`.
