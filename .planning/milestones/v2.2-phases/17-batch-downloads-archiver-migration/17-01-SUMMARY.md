---
phase: 17-batch-downloads-archiver-migration
plan: 01
subsystem: api
tags: [archiver, p-limit, streaming-zip, sse, node-id3, express]

requires: []
provides:
  - Streaming ZIP download handler — archiver v7 piped directly to HTTP response
  - p-limit(8) concurrency pool bounds peak RAM to ~8 audio buffers regardless of playlist size
  - Per-clip SSE progress events with error:true support
  - AbortController cancels in-flight fetches on client disconnect

affects: [17-02-PLAN.md]

tech-stack:
  added: [archiver@7.0.1, p-limit@4.0.0]
  patterns: [streaming-zip-response, append-inside-callback, in-memory-id3]

key-files:
  created: []
  modified: [routes/download.js, package.json, package-lock.json]

key-decisions:
  - "archive.append() called INSIDE the p-limit limit() callback — not after Promise.all — so buffers are GC'd immediately"
  - "NodeID3.write returns Buffer | false — false guard keeps original untagged buffer instead of passing null to append"
  - "Cover art fetched in-memory via arrayBuffer(); no fs.writeFileSync or disk I/O"
  - "res.destroy(err) used in archive.on('error') when headers already sent — not res.status(500)"
  - "AbortController.abort() + archive.abort() called in req.on('close') guarded by !res.writableEnded"
  - "global.downloadTrackers optional chaining (?.) — no-ops when sessionId absent"

patterns-established:
  - "Streaming ZIP: archive.pipe(res) before any append() calls"
  - "p-limit inside Promise.all: clips.map(clip => limit(async () => { ... archive.append ... }))"
  - "SSE emit shape: { progress, completedItem } on success; { progress, completedItem, error: true } on failure"

requirements-completed: [BAT-01, BAT-03]

duration: 15min
completed: 2026-05-13
---

# Phase 17 Plan 01: Server — Archiver v7 Streaming ZIP Summary

**adm-zip replaced with archiver v7 streaming piped to HTTP response; p-limit(8) bounds peak RAM; per-clip SSE progress with error support; AbortController cancels in-flight fetches on disconnect**

## Performance

- **Duration:** 15 min
- **Started:** 2026-05-13T00:00:00Z
- **Completed:** 2026-05-13T00:15:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Routes/download.js fully rewritten — adm-zip and all temp-file I/O eliminated
- archive.append() called inside each p-limit callback so buffers GC immediately (peak ~8 buffers × ~10MB = ~80MB vs previous full-playlist accumulation)
- SSE progress fires per clip with error:true support so client can flip rows to Error state
- AbortController cancels in-flight fetches when client disconnects; archive.abort() prevents stream leak

## Files Created/Modified
- `routes/download.js` - Streaming archiver v7 handler with p-limit(8), SSE, AbortController
- `package.json` - archiver@^7 + p-limit@^4 added; adm-zip removed
- `package-lock.json` - lockfile updated

## Decisions Made
- archive.append inside callback: single most important constraint — buffers GC'd immediately after archiver writes them to stream
- res.destroy(err) post-headers: avoids ERR_HTTP_HEADERS_SENT crash
- Optional chaining on downloadTrackers: no-ops cleanly when client omits sessionId

## Deviations from Plan
None — plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None.

## Next Phase Readiness
- Wave 2 (17-02) can proceed — routes/download.js now reads sessionId from req.body and emits SSE per clip
- Client needs: sessionId in POST body, batch loop, VITE_BATCH_SIZE

---
*Phase: 17-batch-downloads-archiver-migration*
*Completed: 2026-05-13*
