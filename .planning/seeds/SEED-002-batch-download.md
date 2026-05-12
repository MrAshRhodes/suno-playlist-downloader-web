---
id: SEED-002
status: dormant
planted: 2026-05-12
planted_during: v2.1 UX & Discovery
trigger_when: v2.2 milestone planning
scope: Large
---

# SEED-002: Batch downloading for large playlists and user profiles

## Why This Matters

Suno users with large libraries (500–1000+ songs) currently hit two problems:
1. **Memory** — the backend builds the entire ZIP in-memory before streaming. A 1000-song playlist could exceed Replit's RAM limits mid-download.
2. **Timeout** — long downloads may exceed Replit's request timeout, leaving the client hanging with no partial result.
3. **No resume** — if a 900-song download fails at song 850, the user starts over from zero.

Batch downloading (e.g. 100 songs per ZIP) solves all three: smaller memory footprint per batch, timeout-safe, and partial progress is saved. Pairs naturally with the per-song checkbox selection (Phase 12) — users could pick which batch to download or auto-queue all batches.

## When to Surface

**Trigger:** v2.2 milestone planning session.

Also surface if:
- A user reports timeout/failure on large playlists
- A milestone touches `routes/download.js` or the ZIP streaming logic
- We add a job queue or background worker infrastructure

## Scope Estimate

**Large** — a full milestone. Key sub-problems:

1. **Backend batch API** — `POST /api/download/playlist/batch` accepts `clips[]` + `batchSize` + `batchIndex`, returns one ZIP per batch. Or: stream all batches as a multi-file response.
2. **ZIP streaming vs in-memory** — current `AdmZip` builds in RAM. Switch to streaming ZIP library (e.g. `archiver`) for large sets.
3. **Client batch queue** — UI shows "Batch 1 of 10 — downloading…", auto-advances, allows pause/resume.
4. **Progress per batch** — SSE progress monitor already wired; needs to reset per batch.
5. **Partial save** — if batch 3 fails, batches 1–2 are already downloaded. No restart from zero.

## Breadcrumbs

- `routes/download.js` — `POST /api/download/playlist` — current monolithic ZIP build (AdmZip, all in-memory, no batching)
- `client/src/App.tsx:85` — `downloadPlaylist()` — single-call handler; would need batch loop
- `client/src/App.tsx:16` — `setupProgressMonitor` — SSE progress already exists; reusable per batch
- `utils/fileManager.js` — temp directory per session; batch files could persist here between batches
- `p-limit` (installed) — already available for concurrency control within a batch
- Phase 12 SUMMARY — `selectedIds` Set already filters download scope; batch slicing builds on this

## Notes

Batch size of 100 is a reasonable default. Could be user-configurable (25/50/100/200).
ZIP naming convention: `PlaylistName-batch-1-of-10.zip`, `PlaylistName-batch-2-of-10.zip`.
Consider a "Download all batches" mode that queues them automatically vs "Download batch N" for manual control.
