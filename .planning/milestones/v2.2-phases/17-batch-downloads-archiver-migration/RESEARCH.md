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

**archiver v7 uses the `archiver('zip', opts)` factory function** (default export), NOT the `{ ZipArchive }` named class that the README and Context7 docs show — that is the v8 API. At runtime on archiver@7.0.1, `import { ZipArchive } from 'archiver'` throws `SyntaxError: Named export 'ZipArchive' not found`. The correct v7 pattern is `import archiver from 'archiver'; const archive = archiver('zip', { zlib: { level: 6 } })`. [VERIFIED: runtime test on archiver@7.0.1, Node.js 23]

**The OOM fix** comes from two changes: (a) archiver streams entries to the HTTP response as they are processed instead of accumulating a full in-memory ZIP, and (b) `NodeID3.write(tags, buffer)` returns a Buffer directly — no disk writes needed per-file, eliminating the temp directory entirely. [VERIFIED: Context7 /zazama/node-id3, archiver streaming pattern]

**SSE gap** (BAT-03): `download.js` POST handler never reads `sessionId` from `req.body`, and `WebApi.ts` never sends it. Three files need one-line additions each to close this gap.

**Per-clip failure handling:** Failed clip fetches must emit an SSE error event or the row stays in `Processing` state forever (D-03 pre-flips all rows to Processing; without a failure event, failed clips never resolve). The App.tsx SSE handler only handles success (`IPlaylistClipStatus.Success`). The server must emit a distinct payload for failed clips, and the client handler needs a `status: 'error'` branch. [ASSUMED: behavioral spec not in CONTEXT.md — must be specified or the planner should default to emitting `{ completedItem, progress, error: true }` and App.tsx checking it]

**Memory note:** With `p-limit(8)`, peak memory per batch = 8 concurrent audio buffers (~5-10 MB each) + 8 tagged copies = ~80-160 MB. Vastly better than the current adm-zip accumulation of the full playlist, but not zero.

**Primary recommendation:** Sequential per-clip processing inside `p-limit(8)` pool — fetch audio, embed ID3 in-memory, `archive.append(buffer)`, emit SSE — then `archive.finalize()`. No temp dir, no ZIP staging.

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

### CRITICAL: Correct Import for archiver@7

```javascript
// archiver v7: default export is a factory function
import archiver from 'archiver';
const archive = archiver('zip', { zlib: { level: 6 } });

// WRONG — this is v8 API and will throw at runtime on v7:
// import { ZipArchive } from 'archiver'; // SyntaxError on v7
// [VERIFIED: runtime test — node --input-type=module on archiver@7.0.1 returns
//  "SyntaxError: Named export 'ZipArchive' not found. The requested module
//  'archiver' is a CommonJS module"]
```

The archiver v7.0.1 README and Context7 docs show `{ ZipArchive }` — **this is forward-looking v8 documentation embedded in the v7 tarball**. Do not use it with `archiver@^7`. [VERIFIED: runtime test on archiver@7.0.1]

### Express Streaming Pattern
```javascript
import archiver from 'archiver';

// Set headers BEFORE pipe (can't set headers after piping starts)
res.setHeader('Content-Type', 'application/zip');
res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

const archive = archiver('zip', { zlib: { level: 6 } });

// Register error handler BEFORE pipe
archive.on('error', (err) => {
  console.error('Archive error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Archive failed' });
  } else {
    // headers already sent — drop the connection
    res.destroy(err);
  }
});

archive.pipe(res);

// Append files (see §2 for p-limit wrapping)
archive.append(taggedMp3Buffer, { name: fileName });

// Finalize — returns a Promise in v7; await it
await archive.finalize();
// [VERIFIED: runtime test — archive.finalize() instanceof Promise === true on archiver@7.0.1]
```

### Per-Entry Event (for SSE timing)
```javascript
// 'entry' fires after each entry is fully queued to the stream
archive.on('entry', (entry) => {
  // entry.name available — but SSE is better emitted immediately after
  // clip processing completes (before append), so progress matches perception
});
// [VERIFIED: Context7 /archiverjs/node-archiver]
```

**Key behaviors (all verified):**
- No `Content-Length` header — unknown size when streaming. Omit it.
- `archive.finalize()` is async and returns a Promise in v7. Use `await`.
- No temp ZIP file needed — bytes stream directly to the HTTP response.
- `archive.abort()` cancels queued entries and detaches pipes (use on client disconnect).

### No-Temp-Dir Approach (recommended)
```javascript
// NodeID3.write(tags, buffer) returns Buffer — no file path needed
// [VERIFIED: Context7 /zazama/node-id3]
let audioBuffer = Buffer.from(await audioRes.arrayBuffer());
const result = NodeID3.write(tags, audioBuffer);
if (result) audioBuffer = result; // NodeID3.write returns Buffer | false

archive.append(audioBuffer, { name: fileName });
```

Eliminates `sessionDir` entirely. Remove `createTempDirectory` / `cleanupTempDirectory` imports from `download.js`.

---

## §2 p-limit Concurrency Pool

`p-limit` v4.0.0 is ESM-only. Root `package.json` has `"type": "module"` — fully compatible.
`p-limit` is currently in `client/package.json` only; it must be added to root `package.json` for server use. [VERIFIED: grep on both package.json files]

### Replacement for Promise.all
```javascript
import pLimit from 'p-limit';

const limit = pLimit(8); // max 8 concurrent fetch operations
let completedCount = 0;

const results = await Promise.all(
  clips.map(clip => limit(async () => {
    try {
      const audioRes = await fetch(clip.audio_url);
      if (!audioRes.ok) {
        completedCount++;
        // emit error SSE — see §3 for payload
        global.downloadTrackers[sessionId]?.sendProgress({
          progress: Math.round((completedCount / clips.length) * 100),
          completedItem: clip.id,
          error: true
        });
        return null;
      }
      let audioBuffer = Buffer.from(await audioRes.arrayBuffer());

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
          const tagged = NodeID3.write(tags, audioBuffer);
          if (tagged) audioBuffer = tagged;
        }
      }

      completedCount++;
      global.downloadTrackers[sessionId]?.sendProgress({
        progress: Math.round((completedCount / clips.length) * 100),
        completedItem: clip.id
      });

      const fileName = filenamify(`${String(clip.no).padStart(2, '0')} - ${clip.title}.mp3`);
      return { buffer: audioBuffer, fileName };
    } catch (err) {
      console.error(`Error processing clip ${clip.id}:`, err);
      completedCount++;
      global.downloadTrackers[sessionId]?.sendProgress({
        progress: Math.round((completedCount / clips.length) * 100),
        completedItem: clip.id,
        error: true
      });
      return null;
    }
  }))
);

// After Promise.all: append all results to archive in order, then finalize
for (const result of results) {
  if (result) {
    archive.append(result.buffer, { name: result.fileName });
  }
}
await archive.finalize();
// [VERIFIED: Context7 /sindresorhus/p-limit — limit(fn) pattern, Promise.all wrapping]
```

**Note:** `results` array preserves insertion order despite concurrent execution, same as current `Promise.all`. `completedCount++` is safe — Node.js is single-threaded, async tasks don't truly race.

---

## §3 SSE Progress Emission

### Existing SSE payload shape (read from App.tsx)
```typescript
// App.tsx onProgress handler (lines 109-113 — VERIFIED: direct file read):
if (data.progress) {
  setDownloadPercentage(data.progress);
  if (data.completedItem) {
    updateClipStatus(data.completedItem, IPlaylistClipStatus.Success);
    scrollToRow(data.completedItem);
  }
}
```

### Required extension for error path
App.tsx currently only handles `data.completedItem` as success. With D-03 pre-flipping all rows to `Processing`, failed clips will stay `Processing` forever unless the client handles an error SSE. The App.tsx `onProgress` handler must add:
```typescript
if (data.completedItem) {
  const status = data.error ? IPlaylistClipStatus.Error : IPlaylistClipStatus.Success;
  updateClipStatus(data.completedItem, status);
  scrollToRow(data.completedItem);
}
```

Server emits:
- Success: `{ progress: number, completedItem: string }` — unchanged
- Failure: `{ progress: number, completedItem: string, error: true }` — new field

### Three gaps to close (one-line each)
1. `download.js`: Add `sessionId` to `req.body` destructuring — `const { playlist, clips, embedImage, sessionId } = req.body;`
2. `WebApi.ts`: Add `sessionId` param to `downloadPlaylist()` signature; include in POST body JSON
3. `App.tsx`: Pass `sessionId` state variable to `downloadPlaylistApi()` call

---

## §4 Client Batch Slicing Algorithm

### BATCH_SIZE constant
```typescript
// At function body or module level in App.tsx:
const BATCH_SIZE = parseInt(import.meta.env.VITE_BATCH_SIZE ?? '50', 10);
// [VERIFIED: VITE_ADSTERRA_UNIT_KEY ?? '' pattern used in App.tsx line 362 — same idiom]
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

  const cleanup = setupProgressMonitor(sessionId, (data) => {
    if (data.progress) {
      setDownloadPercentage(data.progress);
      if (data.completedItem) {
        const status = data.error ? IPlaylistClipStatus.Error : IPlaylistClipStatus.Success;
        updateClipStatus(data.completedItem, status);
        scrollToRow(data.completedItem);
      }
    }
  });

  const settings = {
    embed_images: localStorage.getItem('suno-embed-images') || 'true'
  };

  try {
    for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
      const batchNum = batchIdx + 1;

      // D-02: update button label via new downloadLabel state
      setDownloadLabel(`Downloading batch ${batchNum} of ${totalBatches}…`);
      setDownloadPercentage(0); // reset progress bar per batch

      const batchClips = batches[batchIdx];

      // Filename: plain for single batch, numbered for multi
      const zipName = totalBatches === 1
        ? `${playlistData.name}.zip`
        : `${playlistData.name}-batch-${String(batchNum).padStart(2, '0')}-of-${totalBatches}.zip`;

      try {
        await downloadPlaylistApi(
          playlistData,
          batchClips,
          settings.embed_images === 'true',
          sessionId,
          zipName
        );
      } catch (err) {
        // D-04: stop-all on first failure
        showError(`Failed to download batch ${batchNum} of ${totalBatches}`);
        // Mark remaining (this batch and all after) as Error
        const failedIds = new Set(batches.slice(batchIdx).flat().map(c => c.id));
        setPlaylistClips(prev => prev.map(c =>
          failedIds.has(c.id) ? { ...c, status: IPlaylistClipStatus.Error } : c
        ));
        return;
      }
    }

    showSuccess(
      totalBatches === 1
        ? 'Playlist ZIP download initiated'
        : `All ${totalBatches} batch ZIPs downloaded`
    );
  } finally {
    cleanup();
    setIsDownloading(false);
    setDownloadLabel('');
  }
};
```

**New state variable required:** `const [downloadLabel, setDownloadLabel] = useState('')`

**Button label renders:** `isDownloading && downloadLabel ? downloadLabel : \`Download ${selectedIds.size} songs as ZIP\``

### Single-batch path
When `totalBatches === 1` the loop runs once and `zipName` is plain `PlaylistName.zip` — matches current behavior exactly. [ASSUMED: plain name for single batch is better UX than "batch-01-of-01"]

### WebApi.ts downloadPlaylist signature change
```typescript
export async function downloadPlaylist(
  playlist: any,
  clips: any[],
  embedImage: boolean = true,
  sessionId: string = '',      // new param
  zipName?: string             // new param — client-controlled filename
): Promise<void> {
  // ...
  body: JSON.stringify({ playlist, clips, embedImage: embedImage.toString(), sessionId }),
  // ...
  // Use zipName for the download link:
  link.setAttribute('download', zipName ?? `${playlist.name}.zip`);
}
```

---

## §5 VITE_BATCH_SIZE Pattern

```typescript
const BATCH_SIZE = parseInt(import.meta.env.VITE_BATCH_SIZE ?? '50', 10);
// parseInt handles undefined, empty string, and missing Replit Secret gracefully
```

**Precedent:** `import.meta.env.VITE_ADSTERRA_UNIT_KEY ?? ''` is already in `App.tsx` line 362. Same idiom. [VERIFIED: direct file read]

**To deploy with custom batch size:**
1. Add `VITE_BATCH_SIZE=25` to `client/.env` (local) or Replit Secrets
2. Run `npm run build` — Vite inlines the value at build time
3. No server restart needed — server has no knowledge of BATCH_SIZE

**Update `client/.env.example`:** Add `VITE_BATCH_SIZE=50` with a comment (only `VITE_ADSTERRA_UNIT_KEY` is there currently). [VERIFIED: direct file read]

---

## §6 Temp Dir Cleanup with Streaming

### Current behavior
- Creates `sessionDir` via `createTempDirectory()`
- Writes individual MP3 files to disk
- Writes ZIP to disk, then streams it via `fs.createReadStream`
- Cleans up `sessionDir` on stream end (15s delay) or client disconnect (5s)

### New behavior with archiver streaming
- **No `sessionDir` needed.** Audio fetched as Buffer, ID3 embedded in-memory, appended directly to archive stream.
- **No ZIP on disk.** `archive.pipe(res)` streams bytes directly to HTTP response.
- **Remove** `createTempDirectory`, `cleanupTempDirectory` imports from `download.js`.
- **Remove** `fs` write calls and `path` usages that were only for temp files.

### Cleanup on client disconnect
```javascript
req.on('close', () => {
  console.log('Client disconnected, aborting archive');
  archive.abort(); // cancels queued entries, detaches pipes
  res.destroy();
});
```

`archive.abort()` is the correct cleanup call — it drains the queue gracefully. [VERIFIED: Context7 /archiverjs/node-archiver — "abort() cancels queued tasks and detaches stream pipes"]

### Timeout
Keep `req.setTimeout(900000)` — 50+ song batches with ID3 embedding still take time.

---

## §7 Dependency Changes

| Action | Package | Location | Notes |
|--------|---------|----------|-------|
| Add | `archiver@^7` | root `package.json` `dependencies` | v7.0.1 latest in v7 line [VERIFIED: npm registry] |
| Add | `p-limit@^4` | root `package.json` `dependencies` | ESM-only, v4.0.0; server uses ESM ("type":"module") [VERIFIED] |
| Remove | `adm-zip` | root `package.json` `dependencies` | Only used in `routes/download.js` [VERIFIED: grep] |

```bash
# From repo root:
npm install archiver@^7 p-limit@^4
npm uninstall adm-zip
```

**archiver v8 vs v7:** npm latest is `8.0.0`. CONTEXT.md / STATE.md locks to `archiver@^7`. Range installs 7.0.1, accepts 7.x patches only. [VERIFIED: npm registry]

**p-limit v4 vs v5+:** `p-limit@4` in client already. Adding same major to root keeps versions consistent.

---

## §8 Risk Areas / Gotchas

### Risk 1 (CRITICAL): archiver v7 import — factory, not named class
**Problem:** `import { ZipArchive } from 'archiver'` throws `SyntaxError: Named export 'ZipArchive' not found` on archiver@7.0.1. The README and Context7 docs show this as the v7 pattern — it is actually the v8 API embedded in the v7 tarball.
**Correct pattern:** `import archiver from 'archiver'; const archive = archiver('zip', { zlib: { level: 6 } });`
**Mitigation:** Executor must use default export + factory. Run `node -e "import a from 'archiver'; console.log(typeof a('zip'))"` to smoke-test after install.
[VERIFIED: runtime test on archiver@7.0.1]

### Risk 2: archive error after headers sent
**Problem:** `archive.on('error')` can fire after headers are flushed. `res.status(500)` throws.
**Mitigation:** `if (!res.headersSent) { res.status(500)... } else { res.destroy(err); }` [VERIFIED: Express behavior]

### Risk 3: p-limit missing from root package.json
**Problem:** `Cannot find module 'p-limit'` at server startup.
**Root cause:** p-limit is only in `client/package.json`. Server runs from root node_modules.
**Mitigation:** `npm install p-limit@^4` from repo root.
[VERIFIED: grep on both package.json files]

### Risk 4: Failed clip rows stuck in Processing state
**Problem:** D-03 pre-flips all selected rows to `Processing`. When a clip fetch fails and returns `null`, no SSE success event fires for that clip — it stays `Processing` forever.
**Mitigation:** Emit `{ progress, completedItem: clip.id, error: true }` for failed clips on server. App.tsx `onProgress` handler must check `data.error` and call `updateClipStatus(id, IPlaylistClipStatus.Error)`.
[ASSUMED: behavioral spec — not explicitly in CONTEXT.md, but required for correctness]

### Risk 5: sessionId not in POST body — silent SSE failure
**Problem:** SSE monitor connects but nothing fires. Progress bar stays 0%, rows stay Processing.
**Root cause:** `global.downloadTrackers[undefined]?.sendProgress()` silently no-ops.
**Mitigation:** Three one-line changes (see §3).
[VERIFIED: grep confirmed download.js never reads sessionId from req.body]

### Risk 6: Memory per batch (not OOM, but notable)
**Context:** 8 concurrent clips × ~10 MB audio + ~10 MB tagged copy = ~160 MB peak per batch at p-limit(8). Far better than adm-zip full-playlist accumulation (could be GBs). Acceptable for 50-song batches.

### Risk 7: Single-batch filename (UX assumption)
**Problem:** BAT-02 implies multi-batch naming, but says nothing about single-batch.
**Mitigation:** Use plain `PlaylistName.zip` when `totalBatches === 1` (matches current behavior). [ASSUMED]

### Risk 8: downloadLabel state for D-02
**Problem:** No existing state var for the in-progress button label.
**Mitigation:** Add `const [downloadLabel, setDownloadLabel] = useState('')` alongside `isDownloading`. [ASSUMED: implementation detail]

---

## §9 Recommended Plan Structure

### Plan count: 2 plans

**Plan 1 — Server (BAT-01, BAT-03 server side)**
One plan, `routes/download.js` only:
- Task 1: `npm install archiver@^7 p-limit@^4 && npm uninstall adm-zip` — update root `package.json`
- Task 2: Replace `AdmZip` import with `archiver` factory; restructure handler to `archive.pipe(res)`, `await archive.finalize()`; remove temp dir logic
- Task 3: Wrap clip downloads in `p-limit(8)` pool; embed ID3 in-memory with `NodeID3.write(tags, buffer)`; append buffers to archive sequentially after `Promise.all`
- Task 4: Destructure `sessionId` from `req.body`; emit `sendProgress({ progress, completedItem, error? })` per clip

**Plan 2 — Client (BAT-02, BAT-03 client side, BAT-04)**
One plan, `App.tsx` + `WebApi.ts` + `client/.env.example`:
- Task 1: Add `sessionId` and `zipName` params to `downloadPlaylistApi()` in `WebApi.ts`; pass in POST body; use `zipName` for `link.setAttribute('download')`
- Task 2: Add `BATCH_SIZE` constant and `downloadLabel` state to `App.tsx`
- Task 3: Wrap `downloadPlaylist()` in batch loop (D-02 label updates, D-03 pre-flip, D-04 stop-all error handling); update `onProgress` handler to support `data.error` branch
- Task 4: Add `VITE_BATCH_SIZE=50` to `client/.env.example`

Plan 1 must be deployed before Plan 2 is testable end-to-end. Plans can be written in parallel.

---

## Validation Architecture

### Test Framework
No test infrastructure detected. [VERIFIED: no test/, tests/, __tests__ directories; no jest.config.*, vitest.config.* in project root]

| Property | Value |
|----------|-------|
| Framework | None — Wave 0 must establish |
| Config file | None — create `vitest.config.js` |
| Quick run command | `npx vitest run --reporter=verbose` (after Wave 0) |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BAT-01 | archiver factory creates valid ZIP stream (not ZipArchive class) | unit | `npx vitest run tests/download.test.js -t "archiver"` | Wave 0 |
| BAT-01 | p-limit(8) wraps fetches (observable via mock) | unit | `npx vitest run tests/download.test.js -t "concurrency"` | Wave 0 |
| BAT-02 | 120 clips, BATCH_SIZE=50 → 3 batches [50, 50, 20] | unit | `npx vitest run tests/batch.test.js -t "slice"` | Wave 0 |
| BAT-03 | SSE sendProgress called with `{progress, completedItem}` | unit | mock `global.downloadTrackers` | Wave 0 |
| BAT-03 | Failed clip emits `{progress, completedItem, error: true}` | unit | mock fetch to fail | Wave 0 |
| BAT-04 | `VITE_BATCH_SIZE=25` yields `BATCH_SIZE=25` | unit | `import.meta.env` mock in vitest | Wave 0 |

### Wave 0 Gaps
- [ ] `tests/download.test.js` — BAT-01 archiver streaming, p-limit concurrency
- [ ] `tests/batch.test.js` — BAT-02 slice, BAT-03 SSE payload, BAT-04 env var
- [ ] Framework install: `npm install --save-dev vitest` (root)

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Server runtime | ✓ | 20 (platform) | — |
| archiver@7 | BAT-01 | install needed | 7.0.1 | — |
| p-limit@4 (root) | BAT-01 | install needed | 4.0.0 | — |
| adm-zip | current (remove) | ✓ | 0.5.10 | replaced by archiver |

**Missing dependencies with no fallback:** archiver@7 and p-limit@4 in root — install in Plan 1 Task 1.

---

## Common Pitfalls

### Pitfall 1 (CRITICAL): archiver v7 uses factory, not ZipArchive class
**What goes wrong:** `import { ZipArchive } from 'archiver'` throws `SyntaxError: Named export 'ZipArchive' not found` at runtime.
**Root cause:** The v7.0.1 tarball's README and Context7 docs both show `{ ZipArchive }` — this is the v8 API, not v7.
**How to avoid:** Use `import archiver from 'archiver'; const arc = archiver('zip', { zlib: { level: 6 } });`
**Verification:** `node -e "import a from 'archiver'; console.log(typeof a('zip').pipe)"` should print `function`.
[VERIFIED: runtime test]

### Pitfall 2: archive error after headers sent
**What goes wrong:** `res.status(500).json(...)` in `archive.on('error')` throws "Cannot set headers after they are sent".
**How to avoid:** Check `res.headersSent` first; use `res.destroy(err)` as fallback.
[VERIFIED: standard Express behavior]

### Pitfall 3: p-limit missing from root package.json
**What goes wrong:** `Error: Cannot find module 'p-limit'` on server start.
**How to avoid:** `npm install p-limit@^4` from repo root (not from client/).
[VERIFIED: grep on package.json files]

### Pitfall 4: sessionId not wired → silent SSE failure
**What goes wrong:** Progress bar stays 0%, rows stay `Processing`.
**How to avoid:** Three one-line changes in `download.js`, `WebApi.ts`, `App.tsx` (see §3).
[VERIFIED: grep confirmed gap in current code]

### Pitfall 5: Failed clips stuck in Processing state
**What goes wrong:** D-03 pre-flips rows to `Processing`. Failed clips never get an SSE event with the old success-only handler → rows stuck.
**How to avoid:** Server emits `error: true` field; App.tsx handler checks it.
[ASSUMED: required for correctness]

---

## Code Examples

### §1 archiver v7 Express streaming (VERIFIED pattern)
```javascript
// Source: runtime-verified on archiver@7.0.1
import archiver from 'archiver';

// ...inside POST handler...
res.setHeader('Content-Type', 'application/zip');
res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

const archive = archiver('zip', { zlib: { level: 6 } });

archive.on('error', (err) => {
  if (!res.headersSent) {
    res.status(500).json({ error: err.message });
  } else {
    res.destroy(err);
  }
});

req.on('close', () => {
  archive.abort();
  res.destroy();
});

archive.pipe(res);

// Append after all p-limit downloads complete
for (const result of results) {
  if (result) archive.append(result.buffer, { name: result.fileName });
}

await archive.finalize();
```

### §2 p-limit concurrency (VERIFIED pattern)
```javascript
// Source: Context7 /sindresorhus/p-limit
import pLimit from 'p-limit';

const limit = pLimit(8);
let completedCount = 0;

const results = await Promise.all(
  clips.map(clip => limit(async () => {
    // fetch + ID3 embed + SSE emit
    completedCount++;
    global.downloadTrackers[sessionId]?.sendProgress({
      progress: Math.round((completedCount / clips.length) * 100),
      completedItem: clip.id
    });
    return { buffer, fileName };
  }))
);
```

### §3 NodeID3 in-memory embedding (VERIFIED pattern)
```javascript
// Source: Context7 /zazama/node-id3
let audioBuffer = Buffer.from(await audioRes.arrayBuffer());
if (embedImage === 'true') {
  const imgRes = await fetch(clip.image_url);
  if (imgRes.ok) {
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
    const tags = { title: clip.title, trackNumber: String(clip.no),
      image: { mime: 'image/jpeg', type: { id: 3, name: 'front cover' },
               description: 'Cover Art', imageBuffer: imgBuffer } };
    const result = NodeID3.write(tags, audioBuffer);
    if (result) audioBuffer = result;
  }
}
```

### §4 VITE_BATCH_SIZE (VERIFIED pattern)
```typescript
// Source: existing App.tsx line 362 — same ?? pattern
const BATCH_SIZE = parseInt(import.meta.env.VITE_BATCH_SIZE ?? '50', 10);
```

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Failed clips must emit `{ completedItem, error: true }` SSE + App.tsx handles `data.error` | §3, §8 | HIGH — rows stuck in Processing if wrong (behavioral spec gap) |
| A2 | Single-batch uses plain `PlaylistName.zip` filename (not "batch-01-of-01") | §4 | Low — UX preference; easy to change |
| A3 | `downloadLabel` state added alongside `isDownloading` for D-02 button text | §4 | Low — implementation detail |
| A4 | `setDownloadPercentage(0)` between batches is correct UX | §4 | Low — could argue cumulative |
| A5 | `zipName` passed from client to `downloadPlaylistApi()`, used for `link.setAttribute('download')` | §4, WebApi | Low — client-controlled filename is standard pattern |

**A1 should be confirmed with the planner** — the CONTEXT.md does not specify the failure SSE event, but D-03 makes it a requirement for correctness.

---

## Sources

### Primary (HIGH confidence)
- Runtime test on archiver@7.0.1 — `import { ZipArchive }` fails; factory `archiver('zip')` works; `finalize()` returns Promise
- Context7 `/sindresorhus/p-limit` — limit(fn), Promise.all pattern, concurrency
- Context7 `/zazama/node-id3` — NodeID3.write(tags, buffer) returns Buffer
- Context7 `/archiverjs/node-archiver` — entry event, abort(), Express streaming pattern (ignoring ZipArchive import — runtime-corrected)
- Direct file reads — `routes/download.js`, `client/src/App.tsx`, `client/src/services/WebApi.ts`, both `package.json` files, `client/vite.config.ts`, `client/.env.example`

### Secondary (MEDIUM confidence)
- npm registry — archiver@7.0.1 latest in v7 line, archiver@8.0.0 is overall latest, p-limit@4.0.0

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — archiver factory pattern runtime-verified; p-limit verified via Context7
- Architecture: HIGH — implementation details verified from actual source files
- Pitfalls: HIGH — confirmed from real gaps in current code and runtime test

**Research date:** 2026-05-13
**Valid until:** 2026-06-13 (archiver/p-limit are stable libs)
