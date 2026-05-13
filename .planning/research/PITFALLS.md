# Pitfalls Research

**Domain:** Streaming ZIP batch download on constrained VM — Node.js/Express/Replit
**Researched:** 2026-05-13
**Confidence:** HIGH (streaming/Node.js pitfalls from code review + docs), MEDIUM (Replit RAM tiers from official pricing page), HIGH (SEO/OG format from multi-source verification), MEDIUM (deploy race — inferred from deploy.sh + Replit architecture)

---

## Critical Pitfalls

### Pitfall 1: Unbounded Concurrency — The Real OOM Root Cause

**What goes wrong:**
`download.js` uses `Promise.all(downloadPromises)` with no concurrency limit despite `p-limit` being installed. On a 500-song playlist, every fetch fires simultaneously: 500 × (~10MB MP3 + ~500KB cover) = ~5GB in-flight buffers. This OOMs before AdmZip even runs. Switching to `archiver` without fixing this first just moves the OOM earlier in the pipeline.

**Why it happens:**
`p-limit` is listed in `package.json` as a dependency but is never imported in `download.js`. The in-memory ZIP build gets blamed for OOM, but concurrent `audioResponse.arrayBuffer()` calls are the first bottleneck.

**How to avoid:**
Import and apply `p-limit` around the per-song fetch+write loop before addressing the ZIP library. Set concurrency to 5–10 for Replit's 2GB Shared VM. This is a 10-minute fix and must be the first code change in the batch download phase.

**Warning signs:**
- Server RSS grows faster than songs complete during download
- Process killed with no stack trace (OOM kill, not a Node exception)
- Works on playlists under 50 songs, fails reliably above 200

**Phase to address:** Phase 1 (batch download implementation) — first line item before any ZIP library work

---

### Pitfall 2: Triple-Buffering of MP3 Files Under AdmZip

**What goes wrong:**
The current flow creates ~3× peak memory per song: `arrayBuffer()` → `Buffer.from(arrayBuffer)` → `fs.writeFileSync` → `addLocalFile` reads the file again into AdmZip's in-memory store → `writeZip` builds a second full copy on disk → `createReadStream` re-reads for piping. For 100 songs × 10MB = up to 3GB peak even for a "batched" download that should only use ~100MB.

**Why it happens:**
AdmZip builds the entire ZIP in memory before writing to disk. This was fine for small playlists but scales linearly with total playlist size, not with concurrency limit.

**How to avoid:**
Switch to `archiver`. With `archive.file(filePath, { name: fileName })`, archiver streams each file from disk into the ZIP transform stream on-demand. Peak memory per song drops to: fetch buffer + disk write + archiver's per-entry streaming overhead (small). Songs written to disk are eligible for GC after archiver reads them. Combined with `p-limit(8)`, peak heap usage scales with concurrency, not playlist size.

**Safe batch size math at Replit Shared VM (2GB RAM):**
- Node 20 default heap = 50% of container RAM = ~1GB
- Budget 30% headroom for V8, libuv, Express, session overhead = ~700MB usable
- Per song peak (fetch phase): ~12MB (MP3 + cover)
- At `p-limit(8)`: 8 × 12MB = ~96MB concurrent fetch + ~50MB archiver/Express overhead = ~150MB in-flight
- Safe batch size: **50–100 songs** (`p-limit(8)`, no Puppeteer running)
- If Puppeteer is potentially active: Chromium adds 200–400MB native heap outside V8 — drop to `p-limit(5)` and batch size 50

**Warning signs:**
- Heap grows linearly with total song count (not with `p-limit` concurrency setting)
- `process.memoryUsage().heapUsed` spikes to proportional to full playlist size

**Phase to address:** Phase 1 (batch download implementation)

---

### Pitfall 3: Archiver Client Disconnect — Silent Leak

**What goes wrong:**
When a client disconnects mid-stream, `archive.pipe(res)` receives an `unpipe` event, but `node-archiver` does not automatically abort. The internal queue continues processing: downloading more songs to temp files, compressing entries, running until all appended items complete — burning CPU, disk I/O, and memory against a closed socket.

**Why it happens:**
`node-archiver` issue #89 (open since 2015, still unresolved): premature close on the destination stream triggers `unpipe` which archiver ignores. The workaround is not built into the library — callers must implement it.

**How to avoid:**
Use `stream.pipeline()` instead of manual `.pipe()`. `pipeline()` automatically destroys all streams in the chain on error or close. Also add explicit abort on response close as defense-in-depth:

```javascript
const { pipeline } = require('stream/promises');
res.on('close', () => archive.abort());
req.on('close', () => { if (!downloadComplete) archive.abort(); });
await pipeline(archive, res);
```

Register `archive.on('error', handler)` and `archive.on('warning', handler)` BEFORE calling `pipeline()` or `pipe()`.

**Warning signs:**
- CPU stays elevated for 30–60 seconds after browser tab is closed during download
- Temp files not cleaned up after aborted sessions
- `global.downloadTrackers` entries accumulate without cleanup

**Phase to address:** Phase 1 (batch download implementation)

---

### Pitfall 4: `req.on('close')` Fires on Normal Completion in Node 16+

**What goes wrong:**
In Node.js 16+, `req.on('close')` fires on both client disconnect AND normal request completion (when the TCP connection closes cleanly). The current `download.js` uses `req.on('close')` to detect disconnects and schedule 5-second cleanup. This fires on every successful download and races with the 15-second cleanup in `fileStream.on('end')`. With archiver-based streaming there is no `fileStream.on('end')` — the race becomes a guaranteed premature cleanup.

**Why it happens:**
Node.js changed `req.on('close')` semantics in v16. Before: only abnormal closes. After: fires on all socket closes including normal completion.

**How to avoid:**
Track completion with a boolean flag. Check `downloadComplete` inside the `close` handler:

```javascript
let downloadComplete = false;
archive.on('finish', () => { downloadComplete = true; });
req.on('close', () => {
  if (!downloadComplete) {
    archive.abort();
    scheduleCleanup(sessionDir, 5000);
  }
  // normal close: cleanup is handled by archive finish handler
});
```

**Warning signs:**
- Temp directories cleaned up immediately after successful downloads
- Subsequent API calls fail because temp files were already removed
- 5-second cleanup fires even on 200 OK responses

**Phase to address:** Phase 1 (batch download implementation)

---

### Pitfall 5: `node-id3` Is File-Mutating — True Streaming ZIP Is Impossible

**What goes wrong:**
Any architecture that promises "stream MP3 bytes directly into archiver without touching disk" will fail for the `embedImages === 'true'` path. `node-id3` v0.2's `NodeID3.write(tags, filePath)` reads the file, modifies the ID3 block, and writes it back — it is sync and file-path based with no stream interface.

**Why it happens:**
`node-id3` is a sync, file-mutating library. Upgrading to a streaming ID3 library (like `music-metadata`) would require replacing the write path entirely — out of scope for v2.2.

**How to avoid:**
Accept that per-song temp files are required for the image embedding path. The correct sequence: fetch → `fs.promises.writeFile` → `NodeID3.write` (sync, in-place) → `archive.file(filePath, { name })` → delete temp file after archiver emits `entry` event for that file. Do not pass MP3 as a Buffer to `archive.append()` — this reintroduces full-song-in-memory.

**Warning signs:**
- Architecture plan mentions "stream directly from fetch to archive"
- No temp file writes in the new implementation despite embedImages being supported

**Phase to address:** Phase 1 (batch download implementation)

---

### Pitfall 6: SSE and Streaming ZIP Cannot Coexist on One Response

**What goes wrong:**
SSE requires `Content-Type: text/event-stream` with chunked text. ZIP streaming requires `Content-Type: application/zip`. These cannot be multiplexed on a single HTTP response. Any plan to "unify" progress and file delivery into one endpoint will fail.

**Why it happens:**
Developers conflate "streaming the download" (binary transfer) with "streaming progress updates" (text events). They look similar at the implementation level.

**How to avoid:**
Keep the two-endpoint model: `POST /api/download/playlist` for ZIP bytes, `GET /api/download/progress/:sessionId` for SSE. The shared state is `global.downloadTrackers` keyed by session UUID. The POST endpoint writes progress events into the tracker; the GET endpoint reads from it. Key isolation risk: `global.downloadTrackers` is process-global — concurrent users share the same map. Use a per-request UUID as tracker key and delete entries on SSE `close`.

**Warning signs:**
- Plan proposes a single endpoint that returns both progress and ZIP bytes
- `global.downloadTrackers` keyed by playlist ID instead of a unique session UUID

**Phase to address:** Phase 1 (batch download implementation)

---

### Pitfall 7: Archiver Event Handler Registration Order

**What goes wrong:**
Calling `archive.pipe(res)` or `archive.finalize()` before registering `archive.on('error')` means errors that occur during initialization or early entry processing go unhandled. Node.js throws unhandled error events, crashing the process.

**Why it happens:**
The archiver docs show `pipe()` first in examples, then event registration. Developers copy this order.

**How to avoid:**
Strict order: `archive.on('error')` → `archive.on('warning')` → `archive.pipe(res)` (or `pipeline()`) → start appending files → `archive.finalize()`. Never call `finalize()` before all `archive.file()` / `archive.append()` calls are set up (they can be called after `finalize()` starts if the queue isn't drained, but the append loop must complete before `finalize()` is invoked in practice).

**Warning signs:**
- Intermittent unhandled error crashes during download
- `archive.on('error')` registered after `archive.pipe()`

**Phase to address:** Phase 1 (batch download implementation)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `Promise.all()` without p-limit | Simple code | OOM on playlists > 50 songs | Never — p-limit is already installed, 5-minute fix |
| AdmZip for ZIP build | Single library, simple API | Full ZIP in memory before streaming | Never for batches > 20 songs on constrained VM |
| `global.downloadTrackers` without TTL or per-session keys | Simple cross-request state | Memory leak on sustained traffic; user isolation failure | Only acceptable with UUID keys + cleanup on SSE disconnect |
| Hardcoding `p-limit(8)` with no config | No config needed | Wrong tradeoff for smaller VMs or burst traffic | Acceptable for v2.2; expose as env var if Replit tier changes |
| `fs.writeFileSync` for MP3 writes | Simple code | Blocks event loop during writes | Acceptable at low concurrency; replace with `fs.promises.writeFile` in Phase 1 |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| archiver + Express res | `archive.pipe(res)` without error handler — any archiver error crashes the process | Register `archive.on('error', handler)` BEFORE calling `pipe()` |
| archiver + Express res | Registering events after `pipe()` — misses initialization errors | All event handlers registered before `pipe()` or `pipeline()` |
| archiver + p-limit | Calling `archive.finalize()` before all p-limit tasks resolve | `await Promise.all(allTasks)` then call `archive.finalize()` |
| archiver + node-id3 | Calling `archive.file(path)` before `NodeID3.write` finishes | NodeID3.write is sync — it completes before the next line, but be explicit |
| archiver + temp files | Not deleting temp files after archiver `entry` event | Attach handler: `archive.on('entry', () => fs.unlink(filePath, noop))` |
| archiver abort + cleanup | Calling `archive.abort()` without also scheduling sessionDir cleanup | Pair every `abort()` with a `cleanupTempDirectory(sessionDir, 5000)` call |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `arrayBuffer()` for large MP3s | Entire MP3 in V8 heap before disk write | Use `response.body.pipe(fs.createWriteStream(path))` instead | Every song > 5MB |
| `fs.writeFileSync` in high-concurrency loop | Event loop blocked during I/O | Use `fs.promises.writeFile` | > 20 concurrent writes |
| ZIP with deflate level 9 on MP3s | CPU spike, minimal size reduction | MP3 is already compressed — use store mode or deflate level 1 | Always for MP3 content |
| Temp files not deleted after archiver `entry` | Disk fills up mid-session on large playlists | Delete each temp file after archiver `entry` event | > 200 songs per session |
| Puppeteer running concurrently with batch download | OOM despite p-limit | Ensure profile scraping is complete before ZIP streaming begins | Anytime both are active |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `filenamify` only on filename, not full path | Path traversal if playlist name contains `../` | Already using `path.join(sessionDir, fileName)` — sessionDir is server-controlled, not user input |
| Session IDs predictable | Session hijacking to access another user's ZIP | Already using uuid v4 (random) — maintain this for batch session keys |
| Temp files world-readable on multi-tenant host | Other processes read downloaded audio | Replit Cloud Run is single-tenant per deployment — acceptable risk level |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No per-batch progress reset in SSE | Progress bar resets to 0% between batches with no context | Emit `batch_start` SSE event with `{ batchIndex, totalBatches }` — client updates label to "Batch 2 of 8" |
| Batch ZIP naming: `PlaylistName.zip` | Browser renames second download `PlaylistName (1).zip` silently | Name convention: `PlaylistName-batch-01-of-08.zip` |
| No signal when all batches complete | User unsure if more downloads are coming | Emit `all_batches_complete` SSE event; show "All 8 batches downloaded" toast |
| Download button re-enabled between batches | User clicks again thinking batch failed | Keep button in "Queuing next batch…" state between batches |

---

## "Looks Done But Isn't" Checklist

- [ ] **Streaming ZIP:** `archive.abort()` is called on client disconnect — verify with a real mid-download tab close, not just normal completion
- [ ] **Streaming ZIP:** `archive.on('error')` is registered before `archive.pipe()` — grep for registration order
- [ ] **p-limit applied:** `limit()` wraps both the fetch AND the ID3 write (not just fetch) — grep `download.js` for `limit(`
- [ ] **Temp file cleanup:** Each MP3 temp file is deleted after archiver `entry` event — verify disk usage doesn't grow linearly with batch size
- [ ] **Error path cleanup:** `archive.on('error')` triggers `cleanupTempDirectory(sessionDir)` — verify with a forced fetch failure
- [ ] **Batch progress:** SSE tracker key is tied to a specific session UUID, not a playlist ID — check `global.downloadTrackers` key format
- [ ] **OG image format:** `public/assets/og-card.png` is PNG not WebP — verify file extension and MIME type (`file public/assets/og-card.png`)
- [ ] **Canonical URL:** `public/index.html` canonical still points to `sunozip.com` after every `deploy.sh` run — add assertion to deploy.sh
- [ ] **Sitemap lastmod:** `sitemap.xml` `lastmod` is not modified by build.sh or any script — grep build.sh for sitemap references
- [ ] **`req.on('close')` guard:** `downloadComplete` flag is set before cleanup is triggered — no cleanup fires on successful 200 responses

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| OOM mid-download (no p-limit) | LOW | Add `import pLimit from 'p-limit'` + wrap loop in `limit()` — 10 min, deploy via deploy.sh |
| Memory leak from disconnect (no abort) | MEDIUM | Replace `pipe()` with `pipeline()`, add `abort()` on close — 1–2 hours |
| Temp files not cleaned (no entry handler) | LOW | Add `archive.on('entry', () => fs.unlink(...))` — 30 min |
| Premature cleanup on success (close event) | LOW | Add `downloadComplete` flag — 30 min |
| Canonical pointing to wrong domain after rebuild | LOW | Single line edit in `public/index.html` + re-run `deploy.sh` |
| OG image converted to WebP | LOW | Re-export as PNG, update `og:image` meta tag |
| deploy.sh git conflict on Replit | MEDIUM | SSH into Replit, run `git fetch && git reset --hard origin/main` manually |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Unbounded concurrency (no p-limit) | Phase 1: Batch download | Load test with 200-song playlist; `process.memoryUsage()` stays flat after initial rise |
| Triple-buffering (AdmZip in-memory) | Phase 1: Batch download | Heap profiler shows peak scales with `p-limit` setting, not playlist size |
| Archiver disconnect leak | Phase 1: Batch download | Kill browser tab mid-download; CPU returns to baseline within 10s; temp dir cleaned |
| `req.on('close')` premature cleanup | Phase 1: Batch download | Complete a normal download; temp dir survives 15s post-200 response |
| node-id3 requires temp files | Phase 1: Batch download | Architecture acknowledges this constraint — no disk-free path for embedImages |
| SSE + ZIP two-endpoint model | Phase 1: Batch download | Concurrent users test: two browsers downloading simultaneously, no progress crossover |
| Archiver event handler order | Phase 1: Batch download | Code review: all handlers before `pipe()` or `pipeline()` |
| OG image WebP incompatibility | Phase 2: SEO | Facebook Sharing Debugger shows preview without error |
| Canonical URL regression post-build | Phase 2: SEO | `grep sunozip.com public/index.html` passes after every deploy.sh run |
| Sitemap auto-update on build | Phase 2: SEO | `git diff public/sitemap.xml` shows no change after build |
| deploy.sh git conflict | Phase 3: Deploy automation | Script adds `git status --porcelain` check before commit; exits non-zero on unexpected state |

---

## Replit VM Constraints — Concrete Numbers

**RAM tiers (source: docs.replit.com/billing/deployment-pricing, verified 2026-05-13):**
- Shared VM: 0.5 vCPU / **2GB RAM** — $20/month (likely tier for sunozip.com)
- Dedicated small: 1 vCPU / 4GB RAM — $40/month
- Dedicated medium: 2 vCPU / 8GB RAM — $80/month

**Node.js 20 heap defaults (verified via Red Hat developer article, Node.js docs):**
- Node 20 auto-sets heap to 50% of container RAM up to 4GB ceiling
- On 2GB Shared VM: default heap = ~1GB
- Recommended `NODE_OPTIONS`: `--max-old-space-size=1280` (64% of 2GB = leaves ~720MB for V8 native, libuv, Puppeteer's Chromium)
- Critical: Chromium (Puppeteer) consumes 200–400MB native heap outside V8 heap. Budget this separately.

**OOM behavior in Cloud Run containers (Replit uses Cloud Run):**
- If Node heap hits `--max-old-space-size` limit → throws `JavaScript heap out of memory` (catchable, but process usually exits)
- If container hits cgroup memory limit → Linux OOM killer sends **SIGKILL** → instant unclean kill, no cleanup handlers run, no `finally` blocks, temp files stranded
- The SIGKILL scenario is worse than the Node exception scenario — it's silent and leaves disk state dirty

---

## SEO-Specific Pitfalls

### Canonical Already Correct — Regression Risk Only

Both `client/index.html` and `public/index.html` already have `<link rel="canonical" href="https://sunozip.com/" />`. The Replit `.replit.app` subdomain appears nowhere in meta tags. This is the correct state.

Risk vector: if Vite's build process ever regenerates `index.html` from a template that derives canonical from `VITE_BASE_URL` or `process.env`, a rebuild would corrupt it. `deploy.sh` currently copies `client/dist/*` into `public/` — verify that the built `index.html` preserves the hardcoded canonical and does not interpolate env vars.

**Prevention:** Never derive canonical URL from an environment variable. Hardcode `sunozip.com` in the source HTML.

### OG Image — Do Not Convert to WebP

`public/assets/og-card.png` is currently PNG. WebP support for OG images is inconsistent: Facebook's crawler has documented failures with WebP despite platform-level claims of support. Twitter/X does not reliably display OG images at all in current testing. PNG is universally supported by all scrapers.

**Prevention:** If hero image compression is added (e.g., converting the p5.js background export to WebP), use a `<picture>` element with WebP source + PNG fallback for the visible `<img>`. Keep `og:image` pointing to the PNG file always.

### Sitemap lastmod — Do Not Auto-Update

`public/sitemap.xml` has `<lastmod>2026-04-14</lastmod>` hardcoded. `deploy.sh` does not touch `sitemap.xml`. This is correct. If a future SEO script auto-updates `lastmod` on every build, search engines will see the page as constantly updating without content changes — this can waste crawl budget and trigger quality flags.

**Prevention:** Only bump `lastmod` when content actually changes. Grep `build.sh` and `deploy.sh` for any `sitemap` references before adding SEO tooling.

---

## Deploy Automation Pitfalls

### deploy.sh Model: Push to GitHub → Manual Pull on Replit

The deploy model (from `deploy.sh`) is:
1. Build client: `cd client && npm run build`
2. Copy to `public/`: `cp -r client/dist/* public/`
3. Commit `public/` to git
4. `git push` to GitHub
5. Then manually on Replit: `git reset --hard origin/main`

There is NO automatic webhook or auto-pull — Replit must be manually synced. The `.replit` config shows `deploymentTarget = cloudrun`, suggesting the deployment is re-triggered via the Replit UI Deploy button, not by git push alone.

**Race condition:** If `git push` and a Replit auto-deploy are somehow both triggered (e.g., via GitHub Actions webhook), the Replit build could start before `public/` assets arrive in the push. Prevention: `deploy.sh` should be atomic — push includes `public/` in the same commit, which it already does.

**Git conflict on Replit:** If someone edits files directly in the Replit workspace (common), the Replit working tree diverges from `origin/main`. `git reset --hard origin/main` (in the deploy.sh reminder line) discards those changes. This is intentional but destructive — any direct Replit edits are silently overwritten.

**Prevention:** All edits go through git, never directly in the Replit workspace. deploy.sh should warn if `git status` shows uncommitted changes before push.

---

## Sources

- Node.js backpressure docs: https://nodejs.org/learn/modules/backpressuring-in-streams
- archiver disconnect issue (open since 2015): https://github.com/archiverjs/node-archiver/issues/89
- archiver memory leak issue: https://github.com/archiverjs/node-archiver/issues/281
- archiver backpressure async.queue issue: https://github.com/archiverjs/node-archiver/issues/611
- Node.js stream error cleanup in production: https://medium.com/@1nick1patel1/the-7-node-stream-errors-that-skip-cleanup-ae22dcf66bfd
- Node.js memory management in containers (Red Hat, 2025): https://developers.redhat.com/articles/2025/10/10/nodejs-20-memory-management-containers
- Node.js --max-old-space-size container best practices: https://github.com/Wagner-Kazuhiko/Node.js-Best-Practices/blob/master/sections/docker/memory-limit.md
- Replit deployment pricing (RAM tiers, verified): https://docs.replit.com/billing/deployment-pricing
- OG image WebP compatibility across platforms: https://darekkay.com/blog/open-graph-image-formats/
- WebP OG image inconsistency: https://www.ctrl.blog/entry/webp-ogp.html
- archiver API docs (Context7, node-archiver): https://github.com/archiverjs/node-archiver/blob/master/website/docs/archiver_api.md
- Code inspection: routes/download.js (no p-limit import, Promise.all pattern, req.on close behavior)
- Code inspection: client/index.html, public/index.html (canonical sunozip.com confirmed)
- Code inspection: deploy.sh (manual git push + manual Replit pull model confirmed)

---
*Pitfalls research for: Suno Playlist Downloader v2.2 — streaming ZIP batch download on Replit/Node.js*
*Researched: 2026-05-13*
