# Phase 17: Batch Downloads + Archiver Migration - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace adm-zip in-memory ZIP assembly with archiver v7 streaming to eliminate OOM on large playlists. Add client-side batching so playlists larger than BATCH_SIZE split into sequential ZIP downloads automatically. Wire SSE progress events by including sessionId in the POST body. Concurrency controlled via p-limit(8) on the server.

</domain>

<decisions>
## Implementation Decisions

### BATCH_SIZE Configuration
- **D-01:** Use `VITE_BATCH_SIZE` environment variable for client-side batch size. Set at Vite build time. Default 50. Changing requires rebuild and redeploy — consistent with how `NODE_ENV` is already handled in this project.

### Batch Download UX
- **D-02:** Download button label updates during multi-batch: "Downloading batch 1 of 3…", "Downloading batch 2 of 3…" etc. Button disabled throughout all batches.
- **D-03:** All selected song rows flip to `Processing` status at the start of the full download (before batch 1 fires), same as current single-batch behavior. No per-batch row state distinction.

### Batch Error Handling
- **D-04:** Stop-all on first batch failure. Call `showError("Failed to download batch N of M")` with the specific batch number. Remaining batches are abandoned. User knows exactly what completed.

### Claude's Discretion
- Server-side streaming implementation details (archiver pipe setup, event listener cleanup)
- Whether to keep or remove temp directory cleanup delay post-archiver (adjust if archiver handles its own cleanup)
- Exact format of per-clip SSE event payload (must include `progress` percentage and `completedItem` clip id to match existing App.tsx SSE handler)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §Batch Downloads (BAT) — BAT-01..BAT-04, acceptance criteria, out-of-scope table

### Source files to modify
- `routes/download.js` — replace adm-zip with archiver v7, add p-limit(8), emit SSE events via sessionId from POST body
- `client/src/App.tsx` — add batch loop in `downloadPlaylist()`, update button label per D-02, D-03
- `client/src/services/WebApi.ts` — add `sessionId` parameter to `downloadPlaylist()`, pass in POST body

### Dependency changes
- `package.json` (root) — add `archiver@^7`, `p-limit@^4`; remove `adm-zip`

### Prior state decisions
- `.planning/STATE.md` §Decisions — archiver v7 (not v8), p-limit@4, BATCH_SIZE default 50, client-side batching in App.tsx, server stays stateless

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `setupProgressMonitor(sessionId, onProgress)` in `WebApi.ts` — SSE connection already set up; just needs sessionId in POST body and server to emit events
- `showError()` / `showSuccess()` from `Utils.ts` — use for batch failure/completion messages
- `updateClipStatus(id, status)` in `App.tsx` — per-clip status update already works; SSE events trigger it

### Established Patterns
- `Promise.all(downloadPromises)` in `download.js` — replace with `p-limit(8)` pool
- `filenamify(playlist.name)` already used for ZIP naming — extend pattern for `batch-01-of-N` suffix
- SSE handler in `App.tsx` reads `data.progress` (percentage) and `data.completedItem` (clip id) — server must emit this shape

### Integration Points
- `downloadPlaylist()` in `App.tsx` calls `downloadPlaylistApi()` — wrap in batch loop
- `downloadPlaylistApi()` in `WebApi.ts` receives `(playlist, clips, embedImage)` — add `sessionId` param
- `router.post('/playlist', ...)` in `download.js` — reads `req.body.sessionId` to emit SSE events

### Known Gaps
- `download.js` never calls `global.downloadTrackers[sessionId]?.sendProgress()` — SSE monitor connects but nothing fires (the whole reason BAT-03 exists)
- `p-limit` not in root `package.json` (present in `client/package.json` only)

</code_context>

<specifics>
## Specific Ideas

No specific references — open to standard archiver v7 streaming approach (archive.pipe(res), append-on-complete per clip).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 17-batch-downloads-archiver-migration*
*Context gathered: 2026-05-13*
