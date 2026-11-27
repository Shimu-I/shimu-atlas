# Analytics Module — Plan

Status: **plan only.** The Analytics page is currently an honest empty state. Nothing here is implemented yet; this document fixes the decisions that earlier phases must respect so analytics can be built later without invented data.

Source: the "Personal Analytics Dashboard" feature prompt. Delivery stays in Phase 6, but **event recording starts in step 1d (reader)**. History cannot be recreated later, and we will never back-fill it.

## 1. What is recorded already (end of step 1b)

Nothing. Only the owner account and sessions exist. Analytics begins accumulating data when the reader ships.

## 2. Principles

1. Every metric has one definition and one source table (section 4).
2. Only recorded events count. No back-filling, no estimates presented as measurements.
3. Measured statistics and AI-written interpretations are shown separately and labelled.
4. Not enough data shows an empty state that says so, never a zero that looks like a result.
5. All timestamps are stored in UTC; the user's local day boundaries (Asia/Dhaka) are applied at query time.
6. Private query content never leaves the machine; no external analytics service.
7. Aggregation happens in SQL; the browser receives aggregates and paginated history, never the whole event log.

## 3. Event model (proposed tables)

All event tables carry `id`, `occurred_at` (UTC), `device_id`, and a client-generated `event_id` with a UNIQUE constraint so retries and refreshes cannot create duplicates.

| Table | Written when | Key fields |
|-------|--------------|-----------|
| `reading_sessions` | Reader is open **and active** | book_id, started_at, ended_at, active_seconds, start_page, end_page, pages_visited |
| `progress_events` | Current page changes | book_id, from_page, to_page, session_id |
| `status_events` | Reading status or skill status is changed by the user | entity, entity_id, old_status, new_status |
| `ai_queries` (Phase 3) | A question is submitted | conversation_id, text, category (rule-based), created_at |
| `ai_query_sources` (Phase 3) | An answer cites a source | query_id, book_id, chapter_id, page |
| `concept_interactions` (Phase 2+) | A concept note is opened, edited or its status changed | concept_id, kind |
| `note_events` (Phase 2) | A note is created or edited; may link to an AI query | note_id, query_id? |

Skill and concept status history is stored as events, so "progress over time" is possible. A single current-status column would lose it.

## 4. Metric definitions

| Metric | Definition | Reliable? |
|--------|------------|-----------|
| Active reading time | Sum of `active_seconds`. A second counts only while the tab is visible and the user did something (page turn, scroll, selection, annotation) in the last 60 s. An open, idle PDF does not count. | From 1d |
| Pages read | Distinct (book, page) pairs reached in a session with at least 5 s dwell. Refreshes and revisits on the same day count once. | From 1d |
| Session | Contiguous active period; closes after 5 min with no activity. | From 1d |
| Streak | Consecutive local days with at least 1 session of at least 60 active seconds. | From 1d |
| Average session length | active_seconds / sessions, in the selected range. | From 1d |
| Reading speed | Pages per active hour, shown only for books with at least 5 sessions. It is a rough figure because page density varies. | Later, caveated |
| Books completed | Count of books **manually** marked Completed. | From 1c |
| Subject distribution | Active time grouped by book category. | From 1d |
| AI queries per period | Count of `ai_queries`. | From Phase 3 |
| Top topics / books / chapters asked | Counts from `ai_query_sources` and concept links. | From Phase 3 |
| Query category | Rule-based keyword classification, labelled "auto-classified" and editable. Not presented as ground truth. | From Phase 3 |
| Recurring topics | Same concept or topic in at least 3 queries across at least 2 days. | From Phase 3 |
| Read / Understood / Practiced / Implemented / Confident | Read comes from reading events; the other four are **manual user statuses**. Reading never implies understanding. | From Phase 4 |
| Concepts with no recent activity | No `concept_interactions` in N days (N configurable). | From Phase 2 |
| Career skill matrices | Counts of skills per status. No composite "competency score" is computed. | From Phase 4 |
| "Subjects I struggle with" | Cannot be measured directly. Shown only as an AI interpretation, built from repeated questions plus low self-rated confidence, and labelled as such. | Interpretation only |

## 5. API shape (Phase 6)

`GET /api/analytics/summary?from&to`, `/reading/daily`, `/reading/by-book`, `/ai/queries` (paginated, searchable), `/skills/matrix?career=`. Each returns aggregates computed in SQL, plus `data_since` so the UI can say "tracking began on …".

## 6. UI direction

Editorial layout in the existing design system: a top band of five key figures, a daily heatmap, trend lines, subject distribution, then lower sections for most-read books, topics, career matrices and a searchable query history. Charts use the forest-green tokens, have text alternatives and an accessible table view, and respect reduced motion. Date filters: 7 / 30 / 90 days, this year, all time, custom.

## 7. What this changes in earlier phases

- **1d (reader):** must write `reading_sessions` and `progress_events` with the active-time rule above, idempotent via `event_id`.
- **1c (library):** reading-status changes write `status_events`.
- **Phase 2 and 3:** notes, concept interactions and AI queries write their events from day one.
- Retention: events are small (about 19 books); no pruning is planned.
