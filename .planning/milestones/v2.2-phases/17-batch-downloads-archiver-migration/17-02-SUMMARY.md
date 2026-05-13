---
phase: 17-batch-downloads-archiver-migration
plan: 02
subsystem: ui
tags: [react, typescript, vite, sse, batch-download, websapi]

requires:
  - phase: 17-01
    provides: Server reads sessionId from POST body and emits per-clip SSE with error:true

provides:
  - Batch loop in App.tsx — splits selected clips into BATCH_SIZE chunks, downloads sequentially
  - downloadLabel state shows "Downloading batch N of M…" during multi-batch
  - SSE progress bar wired — sessionId now in POST body so server can emit events
  - Per-clip Error status from SSE error:true events
  - VITE_BATCH_SIZE TypeScript declaration + .env.example documentation

affects: []

tech-stack:
  added: []
  patterns: [sse-monitor-once-before-loop, batch-loop-with-error-stop, nan-guard-env-int]

key-files:
  created: []
  modified:
    - client/src/App.tsx
    - client/src/services/WebApi.ts
    - client/src/vite-env.d.ts
    - client/.env.example

key-decisions:
  - "setupProgressMonitor called ONCE before batch loop — calling inside loop opens new EventSource per batch and deletes downloadTrackers[sessionId] on cleanup, silently dropping all events for batch 2+"
  - "cleanup() + setIsDownloading(false) + setDownloadLabel('') all in finally block — D-04 return skips code after the loop without finally"
  - "batchHadError reset to false at top of each loop iteration — tracks only current batch errors"
  - "Zero-padded batch filenames: batch-01-of-N not batch-1-of-N — sorts correctly in file explorer"
  - "NaN guard on parseInt(VITE_BATCH_SIZE) — bad env value falls back to 50 instead of NaN breaking slice"

patterns-established:
  - "SSE monitor once before loop pattern: let cleanup = setupProgressMonitor(...); try { for loop } finally { cleanup() }"
  - "Batch filename padding: String(batchNum).padStart(2, '0') matches String(totalBatches).length"

requirements-completed: [BAT-02, BAT-03, BAT-04]

duration: 20min
completed: 2026-05-13
---

# Phase 17 Plan 02: Client — Batch Loop + SSE Wiring Summary

**Batch download loop with VITE_BATCH_SIZE, per-batch progress labels, SSE error handling, and sessionId wired to POST body so progress bar advances correctly**

## Performance

- **Duration:** 20 min
- **Started:** 2026-05-13T00:15:00Z
- **Completed:** 2026-05-13T00:35:00Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments
- App.tsx downloadPlaylist() rewritten with batch loop — playlists larger than BATCH_SIZE (default 50) produce sequential numbered ZIPs without OOM risk
- SSE progress bar now fires — sessionId is in the POST body so server can look up the tracker
- Per-clip Error status from SSE data.error:true — failed clips flip to Error not Success
- VITE_BATCH_SIZE TypeScript-safe via vite-env.d.ts ImportMetaEnv extension

## Files Created/Modified
- `client/src/App.tsx` - downloadLabel state, BATCH_SIZE constant, batch loop, fixed SSE handler
- `client/src/services/WebApi.ts` - sessionId + zipName params added to downloadPlaylist()
- `client/src/vite-env.d.ts` - ImportMetaEnv extended with VITE_BATCH_SIZE
- `client/.env.example` - VITE_BATCH_SIZE=50 documented

## Decisions Made
- setupProgressMonitor before loop (not inside): calling inside loop opens new EventSource per batch and previous cleanup() deletes the server-side tracker, silently dropping events
- finally block for all teardown: D-04 early return bypasses post-loop code; finally always runs
- NaN guard on parseInt: VITE_BATCH_SIZE env value could be empty string or non-numeric; guard falls back to 50

## Deviations from Plan
None — plan executed exactly as written.

## Issues Encountered
None. TypeScript compile clean, Vite build succeeds.

## User Setup Required
None — VITE_BATCH_SIZE defaults to 50; no Replit Secret required unless operator wants a different batch size.

## Next Phase Readiness
Phase 17 complete. All BAT-01..BAT-04 requirements fulfilled.

---
*Phase: 17-batch-downloads-archiver-migration*
*Completed: 2026-05-13*
