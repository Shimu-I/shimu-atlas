# Tasks

## Phase 0 — Architecture
- [x] Architecture proposal approved (sqlite-vec, Tailscale, 1a–1f split)

## Phase 1 — Functional library
- [x] **1a Scaffold** — PR #1
- [ ] **1b Design system and app shell** — in review
  - [x] Tokens (Cherry Blossom palette), light + dark; contrast checker passes
  - [x] Shell: sidebar (rail on tablet), mobile bottom nav + drawer, breadcrumbs, skip link
  - [x] Ctrl/Cmd+K command palette (pages, theme, sign out)
  - [x] Components: Button, Input, Dialog, Toast, EmptyState, PageHeader
  - [x] Sign-in / first-run setup screen wired to the real API
  - [x] 11 sections incl. Analytics as honest empty states; Settings shows real server status
  - [x] 9 frontend tests; no horizontal overflow at 360/390/768/1024/1440
  - [ ] Checked by you on your own screen and phone
- [ ] 1c Library (upload, SHA-256 dedupe, metadata) — writes `status_events`
- [ ] 1d PDF reader (progress sync, bookmarks) — writes `reading_sessions` / `progress_events`
- [ ] 1e Dashboard (real data only)
- [ ] 1f Test on PC and phone

## Later phases
- [ ] Phase 2 Notes · 3 RAG · 4 Careers · 5 Recommendations
- [ ] Phase 6 Projects + **Analytics** (see docs/ANALYTICS_PLAN.md)
- [ ] Phase 7 PWA, remote access, backup/restore

## Known gaps (not built on purpose)
- Toasts exist but nothing triggers them yet.
- Global search currently covers pages and commands only; books and notes join when those exist.
- No PWA manifest or service worker yet (Phase 7).
