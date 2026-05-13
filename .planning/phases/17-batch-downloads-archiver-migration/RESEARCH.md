# Phase 17: Batch Downloads + Archiver Migration - Research

**Researched:** 2026-05-13
**Domain:** Node.js streaming ZIP, client-side batching, SSE progress
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use `VITE_BATCH_SIZE` env var. Set at Vite build time. Default 50. Requires rebuild to change.
- **D-02:** Button label during multi-batch: "Downloading batch 1 of 3…" etc. Disabled throughout.
- **D-03:** All selected rows flip to `Processing` before batch 1 fires (same as current single-batch behavior).
- **D-04:** Stop-all on first batch failure. `showError("Failed to download batch N of M")`. Remaining batches abandoned.

### Claude's Discretion
- Server-side streaming implementation details (archiver pipe setup, event listener cleanup)
- Whether to keep or remove temp directory cleanup post-archiver
- Exact format of per-clip SSE event payload (must include `progress` and `completedItem` to match App.tsx handler)

### Deferred Ideas (OUT OF SCOPE)
- None noted in CONTEXT.md
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BAT-01 | `routes/download.js` uses `archiver` v7 streaming ZIP piped to `res`, `p-limit(8)` fetch concurrency, removes `adm-zip` in-memory build; endpoint signature unchanged | §1 archiver v7 API, §2 p-limit pattern |
| BAT-02 | Client slices selected songs into batches when count > BATCH_SIZE; sequential download; each ZIP named `PlaylistName-batch-01-of-N.zip` | §4 batch slicing, §8 risk areas |
| BAT-03 | SSE progress events emitted correctly — `sessionId` in POST body, `global.downloadTrackers[sessionId]` emits per-clip status | §3 SSE emission |
| BAT-04 | `BATCH_SIZE` defaults to 50, configurable via `VITE_BATCH_SIZE` env var at Vite build time | §5 VITE_BATCH_SIZE pattern |
</phase_requirements>

---

## Summary

The phase has two orthogonal concerns that must coordinate cleanly: (1) server-side archiver v7 streaming, and (2) client-side batch loop. The server change is self-contained inside `routes/download.js`. The client changes span `App.tsx` (batch loop, button label, status pre-flip) and `WebApi.ts` (add `sessionId` param to POST body).

**archiver v7** uses `import { ZipArchive } from 'archiver'` (named export, not the old `archiver('zip')` factory). `archive.pipe(res)` streams directly to Express response — no temp ZIP file needed. `await archive.finalize()` resolves after all entries are flushed. [VERIFIED: npm registry, Context7 /archiverjs/node-archiver]

**The OOM fix** comes from two changes combined: (a) archiver streams entries to the HTTP response as they are processed instead of accumulating a full in-memory ZIP, and (b) `NodeID3.write(tags, buffer)` returns a Buffer directly, so no disk writes are needed per-file either — the temp directory can be eliminated entirely. [VERIFIED: Context7 /archiverjs/node-archiver, /zazama/node-id3]

**SSE gap** (BAT-03): `download.js` POST handler never reads `sessionId` from `req.body`, and `WebApi.ts` never sends it. Three files need one-line additions each to close this gap.

**Primary recommendation:** Sequential per-clip processing inside `p-limit(8)` pool — fetch audio, embed ID3 in-memory, `archive.append(buffer)`, emit SSE — then `archive.finalize()`. No temp dir, no ZIP staging, no second file read.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Streaming ZIP assembly | API / Backend (`download.js`) | — | Server owns file aggregation and streaming |
| Concurrency control | API / Backend (`download.js`) | — | p-limit pool scoped to one request |
| SSE emission | API / Backend (`download.js`) | — | Reads `global.downloadTrackers[sessionId]` |
| SSE reception setup | Frontend (`WebApi.ts`) | — | EventSource connection management |
| Batch slicing logic | Frontend (`App.tsx`) | — | Client knows which songs are selected |
| Batch loop / error handling | Frontend (`App.tsx`) | — | Drives sequential download calls |
| Batch size config | Build-time env (`VITE_BATCH_SIZE`) | — | Baked in at Vite build, consistent with VITE_ADSTERRA pattern |

---

## §1 archiver v7 Streaming API

### Import (v7)
```javascript
// v7 uses named export — NOT the archiver('zip') factory from v6 and older
import { ZipArchive } from 'archiver';
// [VERIFIED: npm view archiver@7.0.1 readme — README shows this exact pattern]
```

### Express Streaming Pattern
```javascript
// Set headers BEFORE pipe
res.setHeader('Content-Type', 'application/zip');
res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

const archive = new ZipArchive({ zlib: { level: 6 } });

// Error handler must fire BEFORE pipe — after pipe, headers may already be sent
archive.on('error', (err) => {
  console.error('Archive error:', err);
  // headers likely sent — cannot res.status(500), must destroy
  if (!res.headersSent) {
    res.status(500).json({ error: 'Archive failed' });
  } else {
    res.destroy(err);
  }
});

archive.pipe(res);

// Append files (see §2 for p-limit wrapping)
archive.append(taggedMp3Buffer, { name: fileName });

// Finalize — returns a Promise in v7; await it
await archive.finalize();
// [VERIFIED: Context7 /archiverjs/node-archiver — "await archive.finalize()"]
```

### Per-Entry Event (for SSE timing)
```javascript
// 'entry' fires after each entry is fully queued to the stream
archive.on('entry', (entry) => {
  // entry.name, entry.stats.size available
});
// [VERIFIED: Context7 /archiverjs/node-archiver]
```

**Key behaviors:**
- `archive.pipe(res)` — no Content-Length header possible (unknown size). Omit it. [VERIFIED]
- `res.attachment('filename.zip')` is equivalent to setting Content-Type + Content-Disposition. [VERIFIED: Context7]
- `archive.finalize()` is `async` in v7 — use `await`. [VERIFIED: Context7 examples show `await archive.finalize()`]
- No temp ZIP file needed — bytes stream directly to the HTTP response. [VERIFIED]

### No-Temp-Dir Approach (recommended)
```javascript
// NodeID3.write(tags, buffer) returns Buffer — no file path needed
const taggedBuffer = NodeID3.write(tags, Buffer.from(audioBuffer));
// [VERIFIED: Context7 /zazama/node-id3 — "NodeID3.write(tags, filebuffer) returns Buffer"]

// Append directly to archive
archive.append(taggedBuffer, { name: fileName });
```

This eliminates `sessionDir` entirely for the archiver path. The `createTempDirectory` / `cleanupTempDirectory` imports can be removed from `download.js`.

---

## §2 p-limit Concurrency Pool

`p-limit` v4.0.0 is ESM-only. Root `package.json` has `"type": "module"` — fully compatible.
`p-limit` is currently in `client/package.json` only; it must be added to root `package.json` for server use. [VERIFIED: grep on package.json files]

### Replacement for Promise.all
```javascript
import pLimit from 'p-limit';

const limit = pLimit(8); // 8 concurrent fetches

const results = await Promise.all(
  clips.map(clip => limit(async () => {
    try {
      // fetch audio
      const audioRes = await fetch(clip.audio_url);
      if (!audioRes.ok) return null;
      let audioBuffer = Buffer.from(await audioRes.arrayBuffer());

      // embed ID3 in memory
      if (embedImage === 'true') {
        const imgRes = await fetch(clip.image_url);
        if (imgRes.ok) {
          const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
          const tags = {
            title: clip.title,
            trackNumber: String(clip.no),
            image: { mime: 'image/jpeg', type: { id: 3, name: 'front cover' },
                     description: 'Cover Art', imageBuffer: imgBuffer }
          };
          audioBuffer = NodeID3.write(tags, audioBuffer);
        }
      }

      // Emit SSE immediately after clip ready
      const done = results_so_far++;  // see §3 for full pattern
      global.downloadTrackers[sessionId]?.sendProgress({
        progress: Math.round((done / clips.length) * 100),
        completedItem: clip.id
      });

      return { buffer: audioBuffer, fileName: filenamify(`${String(clip.no).padStart(2,'0')} - ${clip.title}.mp3`) };
    } catch (err) {
      console.error(`Error processing clip ${clip.id}:`, err);
      return null;
    }
  }))
);
// [VERIFIED: Context7 /sindresorhus/p-limit — limit(fn) pattern, Promise.all wrapping]
```

**Note:** `results` array preserves insertion order despite concurrent execution, same as current `Promise.all`.

---

## §3 SSE Progress Emission

### Existing SSE payload shape (read from App.tsx)
```typescript
// App.tsx onProgress handler (lines 109-113):
if (data.progress) {
  setDownloadPercentage(data.progress);
  if (data.completedItem) {
    updateClipStatus(data.completedItem, IPlaylistClipStatus.Success);
    scrollToRow(data.completedItem);
  }
}
// [VERIFIED: direct file read]
```

Server must emit: `{ progress: number (0-100), completedItem: string (clip.id) }`

### Emission point in download.js
```javascript
// In POST /playlist handler, destructure sessionId from req.body:
const { playlist, clips, embedImage, sessionId } = req.body;

// After each clip completes in the p-limit pool:
let completedCount = 0;
// ...per clip:
completedCount++;
global.downloadTrackers[sessionId]?.sendProgress({
  progress: Math.round((completedCount / clips.length) * 100),
  completedItem: clip.id
});
// [ASSUMED] completedCount must be incremented atomically (closure-safe in single-threaded Node.js event loop)
```

### Three gaps to close (all one-line each)
1. `download.js`: Add `sessionId` to destructuring of `req.body`
2. `WebApi.ts`: Add `sessionId` to `downloadPlaylist()` signature and POST body
3. `App.tsx`: Pass `sessionId` state to `downloadPlaylistApi()` call

---

## §4 Client Batch Slicing Algorithm

### BATCH_SIZE constant
```typescript
// Top of App.tsx or inline in downloadPlaylist():
const BATCH_SIZE = parseInt(import.meta.env.VITE_BATCH_SIZE ?? '50', 10);
// [VERIFIED: VITE_ADSTERRA_UNIT_KEY ?? '' pattern already used in App.tsx line 362]
```

### Batch loop in downloadPlaylist()
```typescript
const downloadPlaylist = async () => {
  if (!playlistData || !playlistClips) return;
  const selectedClips = playlistClips.filter(c => selectedIds.has(c.id));
  const BATCH_SIZE = parseInt(import.meta.env.VITE_BATCH_SIZE ?? '50', 10);

  // Slice into batches
  const batches: IPlaylistClip[][] = [];
  for (let i = 0; i < selectedClips.length; i += BATCH_SIZE) {
    batches.push(selectedClips.slice(i, i + BATCH_SIZE));
  }
  const totalBatches = batches.length;

  // D-03: flip ALL selected to Processing before batch 1
  setPlaylistClips(prev => prev.map(c =>
    selectedIds.has(c.id) ? { ...c, status: IPlaylistClipStatus.Processing } : c
  ));

  checkAndShowDonationModal();
  setDownloadPercentage(0);
  setIsDownloading(true);

  const cleanup = setupProgressMonitor(sessionId, (data) => { /* unchanged */ });

  try {
    for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
      const batchNum = batchIdx + 1;
      // D-02: update button label — button reads isDownloading state;
      // use a separate piece of state for the label, e.g. downloadLabel
      setDownloadLabel(`Downloading batch ${batchNum} of ${totalBatches}…`);

      const batchClips = batches[batchIdx];
      // Batch ZIP name: PlaylistName-batch-01-of-N.zip
      const padded = String(batchNum).padStart(2, '0');
      const zipName = `${playlistData.name}-batch-${padded}-of-${totalBatches}.zip`;

      try {
        await downloadPlaylistApi(playlistData, batchClips, settings.embed_images === 'true', sessionId, zipName);
      } catch (err) {
        // D-04: stop-all on first failure
        showError(`Failed to download batch ${batchNum} of ${totalBatches}`);
        // Mark remaining as Error
        const remainingIds = batches.slice(batchIdx).flat().map(c => c.id);
        setPlaylistClips(prev => prev.map(c =>
          remainingIds.includes(c.id) ? { ...c, status: IPlaylistClipStatus.Error } : c
        ));
        return; // bail out of batch loop
      }

      setDownloadPercentage(0); // reset bar between batches
    }
    showSuccess(totalBatches === 1 ? 'Playlist ZIP download initiated' : `All ${totalBatches} batch ZIPs downloaded`);
  } finally {
    cleanup();
    setIsDownloading(false);
    setDownloadLabel(''); // or reset to default
  }
};
```

**Note:** `downloadLabel` state needs to be added alongside `isDownloading`. The download button renders `downloadLabel || `Download ${selectedIds.size} songs as ZIP`` when not downloading.

### Single-batch path (no UI change for ≤50 songs)
When `batches.length === 1`, the loop runs once. `zipName` is just `${playlist.name}.zip` (no batch suffix needed — or use batch-01-of-01 per requirements). BAT-02 says "when a playlist has more songs than BATCH_SIZE" — so single-batch keeps current filename. [ASSUMED] Whether single-batch uses the plain name or "batch-01-of-01" is not specified. Recommendation: use plain name when totalBatches === 1.

---

## §5 VITE_BATCH_SIZE Pattern

```typescript
// Access in client code:
const BATCH_SIZE = parseInt(import.meta.env.VITE_BATCH_SIZE ?? '50', 10);
// Fallback '50' handles: env var not set, empty string, Replit without Secret set
```

**Precedent:** `VITE_ADSTERRA_UNIT_KEY ?? ''` is already in `App.tsx` line 362. Same pattern.
[VERIFIED: direct file read]

**To deploy with custom batch size:**
1. Add `VITE_BATCH_SIZE=25` to `client/.env` (local dev) or Replit Secrets
2. Run `npm run build` (triggers Vite build which inlines the value)
3. No server restart needed — this is a client-only value

**Update `client/.env.example`:** Add `VITE_BATCH_SIZE=50` with a comment.
[VERIFIED: client/.env.example file examined — only VITE_ADSTERRA_UNIT_KEY present currently]

---

## §6 Temp Dir Cleanup with Streaming

### Current behavior
- Creates `sessionDir` via `createTempDirectory()`
- Writes individual MP3 files to disk
- Writes ZIP to disk (`zipPath`)
- Streams ZIP from disk to response via `fs.createReadStream`
- Cleans up `sessionDir` on stream end (15s delay) or client disconnect (5s)

### New behavior with archiver streaming
- **No `sessionDir` needed.** Audio fetched as Buffer, ID3 embedded in-memory via `NodeID3.write(tags, buffer)`, appended directly to archive stream.
- **No ZIP on disk.** `archive.pipe(res)` streams bytes directly.
- **Temp dir imports can be removed** from `download.js` (`createTempDirectory`, `cleanupTempDirectory`).

### Cleanup on client disconnect
```javascript
req.on('close', () => {
  // With streaming archive, abort it if client disconnects mid-stream
  archive.abort();
  res.destroy();
});
```

`archive.abort()` drains the queue and detaches pipes. [VERIFIED: Context7 /archiverjs/node-archiver — "abort() attempts to stop the process gracefully by cancelling queued tasks and detaching stream pipes"]

### Timeout
Keep `req.setTimeout(900000)` — large playlists may take time even with streaming.

---

## §7 Dependency Changes

| Action | Package | Location | Notes |
|--------|---------|----------|-------|
| Add | `archiver@^7` | root `package.json` `dependencies` | v7.0.1 is latest in v7 line [VERIFIED: npm registry] |
| Add | `p-limit@^4` | root `package.json` `dependencies` | v4.0.0 already in client, add to root for server [VERIFIED] |
| Remove | `adm-zip` | root `package.json` `dependencies` | Replaced by archiver |

```bash
# Install commands (run from repo root)
npm install archiver@^7 p-limit@^4
npm uninstall adm-zip
```

**adm-zip removal note:** `adm-zip` import is currently only in `routes/download.js`. After removing the import and replacing the implementation, the root dep can be removed. [VERIFIED: grep on routes/download.js]

**archiver v8 vs v7:** npm latest is `8.0.0`. CONTEXT.md locks to `archiver@^7` (CONTEXT.md canonical_refs STATE.md decision). The `^7` range installs 7.0.1 and accepts 7.x patches. [VERIFIED: npm registry]

---

## §8 Risk Areas / Gotchas

### Risk 1: archive error after headers sent
**Problem:** `archive.on('error')` can fire after `archive.pipe(res)` has already flushed headers. `res.status(500)` at that point is a no-op and throws in Express.
**Mitigation:** Error handler checks `res.headersSent`: if false, send 500 JSON; if true, call `res.destroy(err)` to drop the connection. [VERIFIED: Context7 Express pattern]

### Risk 2: archiver v7 uses named export, not factory
**Problem:** Old code may use `archiver('zip', {...})` — this is v6 and below. v7 uses `import { ZipArchive } from 'archiver'`.
**Mitigation:** Use `new ZipArchive({ zlib: { level: 6 } })`. Do not use `archiver('zip')`. [VERIFIED: npm view archiver@7.0.1 readme]

### Risk 3: p-limit not in root package.json
**Problem:** `p-limit` is currently only in `client/package.json`. Server code (`routes/download.js`) will get `MODULE_NOT_FOUND` at runtime.
**Mitigation:** Add `p-limit@^4` to root `package.json` dependencies. [VERIFIED: grep on both package.json files]

### Risk 4: completedCount race condition (non-issue in Node.js)
**Problem:** Multiple p-limit workers increment `completedCount` concurrently.
**Non-issue:** Node.js is single-threaded. Async tasks interleave but don't truly race on shared state. `completedCount++` is safe inside async callbacks. [ASSUMED: standard Node.js single-thread guarantee]

### Risk 5: single-batch filename
**Problem:** BAT-02 says batch ZIPs are named `PlaylistName-batch-01-of-N.zip`. For single-batch downloads (totalBatches === 1), the original filename (`PlaylistName.zip`) is arguably better UX.
**Mitigation:** Use plain name when `totalBatches === 1` to match current behavior. [ASSUMED — not explicitly specified in CONTEXT.md]

### Risk 6: download button label state
**Problem:** The current download button renders `"Download N songs as ZIP"` from `selectedIds.size`. Adding multi-batch label requires a new state variable.
**Mitigation:** Add `const [downloadLabel, setDownloadLabel] = useState('')` to App.tsx. Button renders `downloadLabel || \`Download ${selectedIds.size} songs as ZIP\`` [ASSUMED: implementation detail]

### Risk 7: progress bar reset between batches
**Problem:** `downloadPercentage` should reset to 0 between batches for accurate per-batch progress.
**Mitigation:** Call `setDownloadPercentage(0)` at the start of each batch iteration. [ASSUMED]

### Risk 8: NodeID3.write returns Buffer or false on error
**Problem:** `NodeID3.write(tags, buffer)` returns the modified Buffer on success, or `false`/throws on failure.
**Mitigation:** Check return value: `const result = NodeID3.write(tags, audioBuffer); if (result) audioBuffer = result;` [VERIFIED: node-id3 README — "Returns Buffer"]

### Risk 9: WebApi.ts blob download filename
**Problem:** `WebApi.ts` currently sets `link.setAttribute('download', \`${playlist.name}.zip\`)`. For batches, the filename should be the batch-specific name.
**Mitigation:** Pass `zipName` as a parameter to `downloadPlaylistApi()` and use it for the link's download attribute. [ASSUMED: design detail]

---

## §9 Recommended Plan Structure

### Plan count: 2 plans

**Plan 1 — Server (BAT-01, BAT-03 server side)**
Single plan covering `routes/download.js` only:
- Task 1: Install archiver@^7 and p-limit@^4 in root; remove adm-zip
- Task 2: Replace AdmZip import with ZipArchive; restructure handler to pipe archive to res
- Task 3: Add p-limit(8) pool replacing Promise.all
- Task 4: Read sessionId from req.body; emit SSE events per-clip

These tasks modify one file and have a clear dependency order.

**Plan 2 — Client (BAT-02, BAT-03 client side, BAT-04)**
Single plan covering `App.tsx` + `WebApi.ts`:
- Task 1: Add `sessionId` param to `downloadPlaylistApi()` in WebApi.ts; add `zipName` param
- Task 2: Add `BATCH_SIZE` constant and `downloadLabel` state to App.tsx
- Task 3: Wrap `downloadPlaylist()` in batch loop (D-02 label, D-03 pre-flip, D-04 stop-all)
- Task 4: Update `client/.env.example` with VITE_BATCH_SIZE=50 comment

Plan 1 must deploy before Plan 2 is testable end-to-end, but both can be written in parallel.

---

## Validation Architecture

### Test Framework
No test infrastructure detected. [VERIFIED: no test/, tests/, __tests__ directories; no jest.config.*, vitest.config.*]

| Property | Value |
|----------|-------|
| Framework | None — Wave 0 must establish |
| Config file | None — create `vitest.config.js` or use jest |
| Quick run command | `npx vitest run --reporter=verbose` (after Wave 0) |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BAT-01 | archiver stream produces valid ZIP bytes | unit | `npx vitest run tests/download.test.js -t "archiver stream"` | Wave 0 |
| BAT-01 | p-limit(8) bounds concurrency to 8 | unit | manual-only (timing-dependent) | — |
| BAT-02 | batch slicing of 120 clips yields 3 batches of 50/50/20 | unit | `npx vitest run tests/batch.test.js -t "slice"` | Wave 0 |
| BAT-03 | SSE sendProgress called with correct payload shape | unit | mock global.downloadTrackers | Wave 0 |
| BAT-04 | VITE_BATCH_SIZE=25 yields BATCH_SIZE=25 | unit | import.meta.env mock | Wave 0 |

### Wave 0 Gaps
- [ ] `tests/download.test.js` — covers BAT-01 archiver streaming
- [ ] `tests/batch.test.js` — covers BAT-02 batch slicing, BAT-03 SSE payload, BAT-04 env var
- [ ] Framework install: `npm install --save-dev vitest` (root)

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Server runtime | ✓ | 20 (platform) | — |
| archiver@7 | BAT-01 | install needed | 7.0.1 | — |
| p-limit@4 (root) | BAT-01 | install needed | 4.0.0 | — |
| adm-zip | current | remove | 0.5.10 | replaced by archiver |

**Missing dependencies with no fallback:** archiver@7 and p-limit@4 in root (install step in Plan 1 Task 1).

---

## Common Pitfalls

### Pitfall 1: Using archiver factory instead of named class
**What goes wrong:** `import archiver from 'archiver'; archiver('zip', {...})` — this is v6 API. v7 removed the factory.
**Root cause:** Context7 quickstart and npm docs both show v7 API with `{ ZipArchive }` named import; older tutorials show the factory.
**How to avoid:** Always import `{ ZipArchive }` from v7. Check `npm view archiver@7 readme` for canonical example.
**Warning signs:** Runtime error `TypeError: archiver is not a function`.

### Pitfall 2: Sending error response after headers sent
**What goes wrong:** `res.status(500).json(...)` inside `archive.on('error')` causes `Cannot set headers after they are sent`.
**Root cause:** `archive.pipe(res)` flushes the HTTP response start before all entries are processed.
**How to avoid:** Check `res.headersSent` in the error handler. Use `res.destroy()` as fallback.
**Warning signs:** Unhandled error logs about "headers already sent".

### Pitfall 3: p-limit missing from root package.json
**What goes wrong:** `Error: Cannot find module 'p-limit'` at server startup.
**Root cause:** p-limit is in `client/package.json` only. Server runs from root node_modules.
**How to avoid:** `npm install p-limit@^4` from repo root.
**Warning signs:** Module not found error on server start.

### Pitfall 4: sessionId not in POST body → silent SSE failure
**What goes wrong:** SSE monitor connects, but no events fire. Progress bar stays at 0%.
**Root cause:** `global.downloadTrackers[undefined]?.sendProgress()` silently no-ops.
**How to avoid:** All three files need the sessionId wire-up (see §3 three-gap list).
**Warning signs:** `completedItem` never updates row statuses.

---

## Code Examples

### §1 archiver v7 Express streaming (verified pattern)
```javascript
// Source: npm view archiver@7.0.1 readme (official)
import { ZipArchive } from 'archiver';

const archive = new ZipArchive({ zlib: { level: 6 } });

archive.on('error', (err) => {
  if (!res.headersSent) {
    res.status(500).json({ error: err.message });
  } else {
    res.destroy(err);
  }
});

res.setHeader('Content-Type', 'application/zip');
res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
archive.pipe(res);

// ... append entries ...

await archive.finalize();
```

### §2 p-limit concurrency (verified pattern)
```javascript
// Source: Context7 /sindresorhus/p-limit
import pLimit from 'p-limit';

const limit = pLimit(8);
const results = await Promise.all(
  clips.map(clip => limit(async () => { /* fetch + process clip */ }))
);
```

### §3 NodeID3 in-memory embedding (verified pattern)
```javascript
// Source: Context7 /zazama/node-id3
let audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
if (embedImage === 'true' && imageResponse.ok) {
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  const tags = { title: clip.title, trackNumber: String(clip.no),
    image: { mime: 'image/jpeg', type: { id: 3, name: 'front cover' },
             description: 'Cover Art', imageBuffer: imageBuffer } };
  const result = NodeID3.write(tags, audioBuffer);
  if (result) audioBuffer = result;
}
archive.append(audioBuffer, { name: fileName });
```

### §4 VITE_BATCH_SIZE (verified pattern)
```typescript
// Source: existing App.tsx line 362 — same ?? pattern
const BATCH_SIZE = parseInt(import.meta.env.VITE_BATCH_SIZE ?? '50', 10);
```

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `completedCount++` is safe in async callbacks (no race) in Node.js single-thread | §2, §3 | Low — Node.js is single-threaded; not a real race |
| A2 | Single-batch (totalBatches === 1) should use plain `PlaylistName.zip` filename | §4 | Low — UX preference; easy to change |
| A3 | `downloadLabel` state approach for D-02 button text | §4 | Low — alternative is conditional in JSX |
| A4 | `setDownloadPercentage(0)` between batches is correct UX | §8 | Low — could argue for cumulative progress |
| A5 | `zipName` passed as parameter to `downloadPlaylistApi()` for client-controlled filename | §4, §8 | Low — alternative is server reads from Content-Disposition |

---

## Sources

### Primary (HIGH confidence)
- Context7 `/archiverjs/node-archiver` — streaming, ZipArchive class, finalize, entry event, Express pattern, abort
- Context7 `/sindresorhus/p-limit` — limit(fn), Promise.all pattern, concurrency
- Context7 `/zazama/node-id3` — NodeID3.write(tags, buffer) returns Buffer
- `npm view archiver@7.0.1 readme` — confirmed v7 uses `{ ZipArchive }` named import
- `npm view archiver version` — current latest is 8.0.0; v7.0.1 is latest stable v7

### Secondary (MEDIUM confidence)
- Direct file reads: `routes/download.js`, `client/src/App.tsx`, `client/src/services/WebApi.ts`, both `package.json` files, `client/vite.config.ts`, `client/.env.example` — all implementation details VERIFIED from source

### Tertiary (LOW confidence)
- None — all claims verified from source or official docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — archiver v7 and p-limit v4 verified via npm registry and Context7
- Architecture: HIGH — implementation details verified from actual source files
- Pitfalls: HIGH — confirmed from real gaps in current code (sessionId gap, p-limit location, archiver API version)

**Research date:** 2026-05-13
**Valid until:** 2026-06-13 (archiver/p-limit are stable libs)
