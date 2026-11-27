# Tasks

## Phase 0 — Architecture
- [x] Architecture proposal approved (sqlite-vec, Tailscale, 1a–1f split)

## Phase 1 — Functional library
- [ ] **1a Scaffold** — in review
  - [x] Config via `ATLAS_*` env vars
  - [x] SQLite (WAL, foreign keys) + Alembic migrations
  - [x] Single-user auth (Argon2, hashed session tokens, rate limit)
  - [x] Health endpoint, tests (16 passing)
  - [ ] Verified on your Ubuntu machine
- [ ] 1b Design system and app shell
- [ ] 1c Library (upload, SHA-256 dedupe, metadata)
- [ ] 1d PDF reader (progress sync, bookmarks)
- [ ] 1e Dashboard (real data only)
- [ ] 1f Test on PC and phone
