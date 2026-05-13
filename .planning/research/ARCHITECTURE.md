# Architecture Research

**Domain:** Suno Playlist Downloader — v2.2 Batch Downloads, SEO Fixes, Deploy Automation
**Researched:** 2026-05-13
**Confidence:** HIGH (based on direct source reading of all integration files)

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     Browser (React SPA)                       │
│  App.tsx              WebApi.ts             Suno.ts           │
│  - selectedIds Set    - downloadPlaylist()  - getSongsFrom*() │
│  - downloadPlaylist() - setupProgressMonitor() (SSE)          │
│  - batch slice (NEW)  - sessionId in POST body (MISSING NOW)  │
└───────────────────────────────┬──────────────────────────────┘
                                │ HTTP / SSE
┌───────────────────────────────▼──────────────────────────────┐
│                   Express Server (server.js)                   │
│  /api/download    routes/download.js   utils/fileManager.js   │
│  /api/playlist    routes/playlist.js   global.downloadTrackers│
│  /api/settings    routes/settings.js                          │
│  express.static   public/                                     │
└──────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | v2.2 Change |
|-----------|----------------|-------------|
| `App.tsx` | UI state, selectedIds Set, kicks off download | Add batch slicing before calling downloadPlaylistApi |
| `WebApi.ts:downloadPlaylist()` | POST /api/download/playlist, blob to anchor click | Add `sessionId` field to POST body |
| `WebApi.ts:setupProgressMonitor()` | Opens SSE stream at /api/download/progress/:id | No change to SSE client |
| `routes/download.js POST /playlist` | Downloads clips, builds ZIP, streams response | Replace AdmZip with archiver; emit SSE progress events; read `sessionId` from body |
| `routes/download.js GET /progress/:id` | SSE endpoint — registers `global.downloadTrackers[sessionId]` | No change needed |
| `utils/fileManager.js` | Temp dir create/cleanup per session | No change |
| `public/sitemap.xml` | Static sitemap served by Express | `lastmod` auto-updated by deploy.sh sed command |
| `public/index.html` | SPA shell | Add canonical `<link>` tag |
| `deploy.sh` | build + git push | Add sitemap lastmod update; add conditional push guard |

## Integration Points — Detailed

### 1. Batch Download

**Current flow** (`routes/download.js:28-163`):
- `POST /api/download/playlist` receives `{ playlist, clips, embedImage }`
- `Promise.all` downloads all clips in parallel into `sessionDir` (line 40-100)
- AdmZip builds entire ZIP in memory then writes to `zipPath` (lines 110-111) — full memory spike before streaming
- Streams from file via `fs.createReadStream(zipPath)` piped to `res` (line 149)

**Critical bug — SSE is not wired:**
- POST handler (`routes/download.js:28-163`) never calls `global.downloadTrackers[sessionId].sendProgress()`
- `WebApi.ts:downloadPlaylist()` (lines 74-82) never sends `sessionId` in the POST body
- Progress bar in `App.tsx` (lines 108-116) opens SSE connection but receives zero events during download
- v2.2 must fix both sides — `sessionId` in POST body, and emit from per-clip loop — before progress works

**v2.2 batch architecture — client-side slicing (recommended):**

Client (`App.tsx:downloadPlaylist()`, starting at line 85):
```
selectedClips = playlistClips.filter(c => selectedIds.has(c.id))  // line 88
batches = chunk(selectedClips, BATCH_SIZE)   // e.g. 25 songs per batch — NEW
for each [i, batch] of batches.entries():
    await downloadPlaylistApi(playlistData, batch, embedImages, sessionId, i, batches.length)
```

Server (`routes/download.js POST /playlist`):
```
const { playlist, clips, embedImage, sessionId } = req.body   // sessionId added
// inside per-clip loop after clip completes:
global.downloadTrackers[sessionId]?.sendProgress({ progress, completedItem, batchIndex, batchTotal })
```

**Why client-side batching over server-side:**
- Server stays stateless — no cross-request batch state to coordinate
- Each batch produces one browser download prompt (user gets one ZIP per batch)
- SSE reuse: same `sessionId` across all batches; server emits `batchIndex` field; client progress bar resets per batch
- No new API route needed — reuses existing `POST /api/download/playlist`

**Memory reduction from switching to archiver:**
- Current: N x MP3 buffer in memory + N x MP3 files on disk + full ZIP in memory + ZIP file on disk
- With archiver pipe: per-clip MP3 buffer lives only while adding entry to archive; no ZIP file written to disk; `res` receives streaming bytes as entries are finalized
- Temp dir still needed only when `embedImage=true` (cover image buffer written to disk for ID3 embed, then read by archiver)

**Modification points:**

| File | Line(s) | Change |
|------|---------|--------|
| `routes/download.js` | 1-4 (imports) | Add `import archiver from 'archiver'` |
| `routes/download.js` | 29 | Add `sessionId` to destructured `req.body` |
| `routes/download.js` | 40 | Remove `new AdmZip()`, create archiver instance; pipe to `res` immediately |
| `routes/download.js` | 48-97 (clip loop) | After each clip completes, call `global.downloadTrackers[sessionId]?.sendProgress(...)` |
| `routes/download.js` | 103-107 (results loop) | Replace `zipFile.addLocalFile()` with `archive.file(filePath, { name: fileName })` |
| `routes/download.js` | 109-116 | Remove `zipFile.writeZip(zipPath)` — archiver finalizes instead |
| `routes/download.js` | 118-149 | Remove `fs.createReadStream` piping — archiver.pipe(res) replaces this |
| `WebApi.ts` | 74-82 (POST body) | Add `sessionId` field to request body JSON |
| `App.tsx` | 88 | Slice `selectedClips` into batches before API loop |
| `App.tsx` | 119 | Loop over batches, call `downloadPlaylistApi` per batch |

New file: `client/src/utils/batch.ts` — `chunk<T>(arr: T[], size: number): T[][]` helper.

### 2. SEO — sitemap.xml lastmod

**Current state** (`public/sitemap.xml`):
- Single `<url>` entry for `https://sunozip.com/`
- Hardcoded `<lastmod>2026-04-14</lastmod>` (line 5) — never updated

**Recommended approach: sed in deploy.sh** (build-time, not runtime)

In `deploy.sh`, after the `rm -rf public/assets && cp -r client/dist/* public/` step and before `git add public/`:
```bash
TODAY=$(date -u +%Y-%m-%d)
sed -i '' "s|<lastmod>.*</lastmod>|<lastmod>${TODAY}</lastmod>|" public/sitemap.xml
```

No new files needed. No runtime dependency added. `server.js` already serves `sitemap.xml` explicitly (lines 144-153) via the SEO file loop — no server changes required.

**Do not use runtime generation** — adding Node.js middleware for a single static file with one URL adds cold-start latency and complexity for no gain.

### 3. SEO — canonical tag

**Current state:** `public/index.html` (the built SPA shell) does not have a canonical tag.

**Recommended approach: static `<link>` in `client/index.html`** (the Vite source entry, not the built output)

```html
<link rel="canonical" href="https://sunozip.com/" />
```

Single-page app with one canonical URL and no server-side routing. A static tag in the Vite source HTML survives the build unchanged (Vite copies it verbatim). Do not use server injection — adds middleware complexity for zero gain on a single-origin SPA.

**Verify before writing:** Check `client/vite.config.ts` for `root` and `build.rollupOptions.input` to confirm which HTML file Vite reads as its entry. The canonical must be in that file, or it will be stripped at build time.

**Modification point:** `client/index.html` (source, not `public/index.html` which gets overwritten on each build)

### 4. Deploy automation

**Current state** (`deploy.sh`):
- Line 3: `set -e` — exits on first error, correct
- Lines 6: `cd client && npm run build && cd ..` — runs Vite build
- Lines 9-10: removes old assets, copies dist to public/
- Lines 13-14: `git commit` or echoes "No changes to commit"
- Line 16: `git push` — unconditional, fires even when nothing was committed

**Unsafe pattern:** `git commit || echo "..."` (line 14) means if commit no-ops, `git push` still fires on line 16. This can silently push unrelated local commits.

**Recommended additions to deploy.sh:**

```bash
# After "Updating public/..." step, before git add:
TODAY=$(date -u +%Y-%m-%d)
sed -i '' "s|<lastmod>.*</lastmod>|<lastmod>${TODAY}</lastmod>|" public/sitemap.xml

# Replace lines 13-19 with:
git add public/
if git diff --cached --quiet; then
    echo "No changes to commit — skipping push."
else
    git commit -m "build: rebuild public/ for deployment"
    git push
    echo "Done. Pull on Replit: git reset --hard origin/main"
fi
```

**Modification points:**

| File | Line(s) | Change |
|------|---------|--------|
| `deploy.sh` | after line 10 | Add sitemap sed command |
| `deploy.sh` | 13-19 | Replace unconditional push with `git diff --cached --quiet` guard |

No new scripts needed. Both changes contained in deploy.sh.

## Data Flow — Batch Download (v2.2 target)

```
User clicks "Download N songs as ZIP"
    |
App.tsx:downloadPlaylist() [line 85]
    |
selectedClips = filter by selectedIds [line 88]
    |
batches = chunk(selectedClips, BATCH_SIZE)    [NEW — client/src/utils/batch.ts]
    |
for each batch [i] of batches:
    |
    setupProgressMonitor(sessionId, onProgress)  [line 108 — sessionId from useState line 30]
    |
    POST /api/download/playlist                   [WebApi.ts:downloadPlaylist — FIXED: includes sessionId]
    body: { playlist, clips: batch, embedImage, sessionId, batchIndex: i, batchTotal }
    |
    routes/download.js:
        archiver.pipe(res)  [immediate — streaming starts before clips complete]
        for each clip in batch:
            fetch(clip.audio_url) -> arrayBuffer -> write to sessionDir [line ~56-63]
            if embedImage: fetch cover -> write -> NodeID3.write() [line ~66-86]
            archive.file(filePath, { name: fileName })
            global.downloadTrackers[sessionId]?.sendProgress({ progress, completedItem, batchIndex })
                -> SSE event reaches App.tsx:onProgress callback
                -> setDownloadPercentage(data.progress)
                -> updateClipStatus(data.completedItem, Success)
        archive.finalize()  -> streams remaining bytes -> ends response
    |
    WebApi.ts: response.blob() -> createObjectURL -> anchor click -> browser save dialog
    (browser names file: PlaylistName.zip or PlaylistName-1of3.zip)
    |
    cleanup SSE connection [App.tsx:cleanup() in finally block line 145]
    |
    [repeat for next batch if any]
```

## Recommended Project Structure Changes

```
routes/
├── download.js         # MODIFIED — archiver, SSE emit, sessionId from body
├── playlist.js         # unchanged
└── settings.js         # unchanged

utils/
└── fileManager.js      # unchanged

client/src/
├── App.tsx             # MODIFIED — batch slicing loop, sessionId passed to API
├── index.html          # MODIFIED — add canonical <link> tag
├── services/
│   └── WebApi.ts       # MODIFIED — sessionId in POST body
└── utils/
    └── batch.ts        # NEW — chunk<T>(arr, size) utility

public/
├── index.html          # AUTO-REBUILT by deploy.sh (do not edit directly)
└── sitemap.xml         # AUTO-UPDATED lastmod by deploy.sh

deploy.sh               # MODIFIED — sitemap sed, conditional push guard
```

## Recommended Build Order

**Phase 1 — Deploy hardening** (`deploy.sh` improvements + sitemap sed integration)

Rationale: every subsequent change ships through deploy.sh. Harden the pipeline before more changes land so the sitemap update and conditional push are in place from the first real deploy. Risk if skipped: sitemap lastmod stays stale, and unconditional push can bleed unrelated commits to Replit.

**Phase 2 — SEO** (canonical tag in `client/index.html`, validated via deploy pipeline)

Rationale: zero-functional-risk, single file edit. Validates the deploy pipeline end-to-end cheaply. Risk if skipped: none blocking, but ongoing crawler debt.

**Phase 3 — Batch downloads** (archiver migration + SSE wiring + client batching + progress fix)

Rationale: highest complexity — touches client, server, and SSE simultaneously. Ship last on known-good deploy pipeline. Also fixes the silent SSE bug that has existed since the progress bar was added. Risk if skipped: high for user experience — current SSE progress is non-functional.

**Alternative ordering:** If batch is the headline v2.2 feature and user value takes priority over pipeline safety, flip Phase 3 to first. Acceptable if team is confident in manual deploy steps.

## Architectural Patterns

### Pattern 1: Archiver Streaming to Response

**What:** `archiver` pipes a ZIP stream directly to `res`. Entries are appended as files become ready; the ZIP is transmitted incrementally without buffering the full output.

**When to use:** Any playlist download. The current AdmZip approach buffers the entire ZIP in memory before writing to disk then streaming — dangerous on Replit's constrained memory tier.

**Trade-offs:** `archiver` must call `finalize()` before `end` fires; error handling shifts from synchronous (`zipFile.writeZip()`) to event-based (`archiver.on('error', ...)`). Streaming starts before all clips are downloaded, so partial ZIPs can reach the browser if a mid-stream error occurs — handle `archiver.on('warning', ...)` and `archiver.on('error', ...)` carefully.

**Example:**
```javascript
const archive = archiver('zip', { zlib: { level: 6 } });
archive.on('error', err => {
  if (!res.headersSent) res.status(500).json({ error: err.message });
});
res.setHeader('Content-Type', 'application/zip');
res.setHeader('Content-Disposition', `attachment; filename="${zipName}.zip"`);
archive.pipe(res);
// ... after each file is ready:
archive.file(filePath, { name: fileName });
// after all files appended:
await archive.finalize();
```

### Pattern 2: Client-Side Batching

**What:** `App.tsx` slices `selectedClips` into fixed-size chunks before calling the API. Server handles one batch per request and returns one ZIP per request.

**When to use:** When clip count exceeds safe single-request limits due to network timeout risk, memory pressure on the server, or browser download UX considerations.

**Trade-offs:** Multiple browser save dialogs per full download. Name batches `PlaylistName-1of3.zip` to orient the user. Consider a default batch size of 25 — balances ZIP size (~150 MB at 6 MB/song) against dialog count.

### Pattern 3: SSE Progress with Global Tracker Map

**What:** POST download handler looks up `global.downloadTrackers[sessionId]` inside the per-clip loop and emits progress events. SSE connection registered separately at `GET /progress/:sessionId`.

**When to use:** Long-running downloads that need per-item UI feedback.

**Trade-offs:** `global.downloadTrackers` is process-global — correct for single-process Replit deployment, unsafe for multi-process (not a concern for this project). Tracker entries must be cleaned up: the `req.on('close')` handler in `GET /progress/:id` already does this (lines 198-202 of download.js).

## Anti-Patterns

### Anti-Pattern 1: Full In-Memory ZIP Before Stream

**What people do:** Accumulate all MP3 buffers, build ZIP with AdmZip in memory, write ZIP file to disk, then stream the file. This is the current implementation (`download.js:40, 110-116, 118-149`).

**Why it's wrong:** Peak memory = sum of all MP3 sizes (in buffers) + full ZIP size (in AdmZip) + ZIP file on disk. For a 50-song playlist at ~6 MB/song that is ~600 MB before the response starts. Replit free tier will OOM.

**Do this instead:** Stream entries into archiver as each clip completes; archiver flushes bytes to `res` incrementally.

### Anti-Pattern 2: SSE Without sessionId in POST Body

**What people do:** Generate `sessionId` client-side, open SSE stream, but omit `sessionId` from the POST body. Current implementation: `WebApi.ts:downloadPlaylist()` lines 74-82.

**Why it's wrong:** Server registers SSE tracker on `GET /progress/:sessionId` but the POST handler can never look it up because it never receives the `sessionId`. Progress events are never emitted. Progress bar stays at 0%.

**Do this instead:** Include `sessionId` in POST body; POST handler reads it and calls `global.downloadTrackers[sessionId]?.sendProgress(...)` after each clip.

### Anti-Pattern 3: Unconditional Git Push in Deploy Script

**What people do:** `git commit -m "..." || echo "No changes"` followed by unconditional `git push`. Current implementation: `deploy.sh:13-16`.

**Why it's wrong:** If no files changed, `git commit` no-ops with `|| echo`, but `git push` fires unconditionally and can push previous local commits unintentionally.

**Do this instead:** Check `git diff --cached --quiet` after staging; push only when there are staged changes.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (Replit free) | Archiver streaming critical to avoid OOM; single-process SSE tracker works; temp dir per session sufficient |
| 1k concurrent users | `global.downloadTrackers` accumulates if connections drop without clean close — add TTL eviction (5 min max) |
| 10k+ users | Extract download worker to separate process or service; use job queue (Bull/BullMQ); SSE becomes pub/sub via Redis |

## Integration Points — External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Suno CDN (audio_url) | Direct `fetch()` from Node.js (`download.js:56`) | No auth required currently; rate limits unknown; may need p-limit throttling for large batches |
| Suno API (playlist data) | Proxied through `routes/playlist.js` | Puppeteer fallback for user profile routes |
| Replit deployment | Git push -> Replit git pull | `deploy.sh` owns this path; Replit side: `git reset --hard origin/main` |

## Sources

- Direct source reading: `routes/download.js`, `server.js`, `client/src/App.tsx`, `client/src/services/WebApi.ts`, `client/src/services/Suno.ts`, `utils/fileManager.js`, `public/sitemap.xml`, `deploy.sh`
- Confidence: HIGH — all claims based on line-level source inspection, no inference from documentation alone
