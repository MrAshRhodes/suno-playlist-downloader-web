# Technology Stack — v2.2 Additions

**Project:** Suno Playlist Downloader
**Milestone:** v2.2 Batch Downloads & Ops
**Researched:** 2026-05-13
**Scope:** Additions and changes only. Existing stack not re-evaluated.

---

## Summary of Changes

| Area | Change | Why |
|------|--------|-----|
| ZIP library | Replace `adm-zip` with `archiver@8.0.0` | True streaming to `res`, no disk round-trip, no full-archive-in-RAM |
| Concurrency | Add `p-limit@4.0.0` to root `package.json` | Root server package missing it; only in client — currently unused server-side |
| Image optimization | Add `sharp@0.34.5` as root **devDependency** | One-time script to compress hero image to WebP; not a Replit runtime dep |
| Sitemap | No new dep — inline Node script | Project already has `sitemap.xml`; 20-line script beats adding a dep |
| Deploy automation | No new dep — harden `deploy.sh` | No official Replit API/CLI for Cloud Run redeploy; git push + manual Redeploy is ceiling |

---

## 1. Streaming ZIP: archiver 8.0.0

**Recommendation:** Replace `adm-zip` with `archiver@^8.0.0`.

**Version:** 8.0.0 (released May 2024). Node 18+ required — compatible with project's Node 20 runtime.
**Confidence:** HIGH — verified via npm registry and GitHub releases.

### Why archiver over alternatives

| Library | Streams to res | Express ergonomics | Notes |
|---------|---------------|-------------------|-------|
| `adm-zip` (current) | No — builds full ZIP in RAM, writes to disk, then streams file | N/A | Replace |
| `archiver` | Yes — `archive.pipe(res)` + `archive.finalize()` | Idiomatic, well-documented | **RECOMMENDED** |
| `yazl` | Yes — but low-level manual entry management | No pipe convenience; event-heavy | No ergonomic advantage on constrained VM |
| `zip-stream` | Yes — archiver wraps this internally | Indirect | Use archiver instead |
| `node-stream-zip` | N/A — ZIP reader, not writer | N/A | Wrong category entirely |

### Critical: use store mode (level 0)

MP3s are already DEFLATE-compressed audio data. Running ZIP DEFLATE on them burns Replit CPU for ~0% size reduction. This flag matters more than any library choice:

```js
const archive = archiver('zip', { store: true }); // no compression, max throughput
archive.pipe(res);
```

---

## 2. The Real Fix — Integration Pattern

Swapping the ZIP library alone does not solve the OOM problem. The current `routes/download.js` has two compounding issues that must be fixed together.

### Issue A: Uncapped parallelism (current line ~49)

`Promise.all(downloadPromises)` fires every fetch simultaneously. A 100-song playlist launches 100 concurrent HTTPS connections and holds 100 audio buffers in memory at once. `p-limit` is installed in `client/package.json` but **not in the root server `package.json`** — it is never used in the download route.

### Issue B: Triple buffering

Current flow: `fetch` → `arrayBuffer()` → `writeFileSync` to disk → AdmZip reads disk → AdmZip builds full ZIP in RAM → writes ZIP to disk → streams ZIP file.

Peak RAM = (all songs) × (avg song size) × ~3.

### Correct pattern — single pass, bounded concurrency, no disk

```js
import pLimit from 'p-limit';
import archiver from 'archiver';

router.post('/playlist', async (req, res) => {
  const { playlist, clips, embedImage } = req.body;

  if (!playlist || !clips || !Array.isArray(clips) || clips.length === 0) {
    return res.status(400).json({ error: 'Invalid playlist data' });
  }

  req.setTimeout(900000);
  res.setTimeout(900000);

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${filenamify(playlist.name)}.zip"`);

  const archive = archiver('zip', { store: true });
  archive.on('error', (err) => {
    console.error('Archive error:', err);
    if (!res.headersSent) res.status(500).end();
  });
  archive.pipe(res);

  const limit = pLimit(3); // 3 concurrent downloads — tune to Replit RAM budget

  await Promise.all(clips.map(clip => limit(async () => {
    try {
      const audioRes = await fetch(clip.audio_url);
      if (!audioRes.ok) {
        console.error(`Failed to download clip ${clip.id}: ${audioRes.statusText}`);
        return;
      }
      let audioBuffer = Buffer.from(await audioRes.arrayBuffer());

      if (embedImage === 'true' && clip.image_url) {
        const imgRes = await fetch(clip.image_url);
        if (imgRes.ok) {
          const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
          const tags = {
            title: clip.title,
            trackNumber: String(clip.no),
            image: { mime: 'image/jpeg', type: { id: 3, name: 'front cover' },
                     description: 'Cover Art', imageBuffer: imgBuffer }
          };
          audioBuffer = NodeID3.write(tags, audioBuffer) || audioBuffer;
        }
      }

      const fileName = filenamify(`${String(clip.no).padStart(2, '0')} - ${clip.title}.mp3`);
      archive.append(audioBuffer, { name: fileName });
    } catch (err) {
      console.error(`Error processing clip ${clip.id}:`, err);
    }
  })));

  archive.finalize();
});
```

**Peak RAM with this pattern:** 3 × avg song size (~3 × 8 MB = 24 MB) vs. current uncapped × all songs × 3.

No `sessionDir` needed for the batch route. Temp directory creation, disk writes, and cleanup logic all drop out of this route.

---

## 3. Server p-limit — Missing from Root Package

`p-limit@4.0.0` is in `client/package.json` but absent from root `package.json`. The download route currently imports nothing for concurrency control. Add it:

```bash
npm install p-limit@^4.0.0
```

Note: p-limit 4.x is ESM-only. Root `package.json` has `"type": "module"` — compatible.

---

## 4. Express Streaming — No Changes Needed

Express 4.19.2 supports piping a readable stream directly to `res` with no additional middleware. `archive.pipe(res)` works as-is. Retain the existing `req.setTimeout(900000)` / `res.setTimeout(900000)` — large playlists still need the extended window.

---

## 5. SEO — sharp for Hero Image Compression

Add as **devDependency only** — build-time script, not Replit runtime.

```bash
npm install --save-dev sharp@^0.34.5
```

Write `scripts/compress-hero.js` once, run it locally, commit the WebP output to `public/assets/`:

```js
import sharp from 'sharp';
sharp('public/assets/hero.png')
  .webp({ quality: 80 })
  .toFile('public/assets/hero.webp');
```

sharp is libvips-backed and does not need to be installed on Replit's runtime. The output `.webp` file is what gets served.

**Sitemap:** No new dep. Project already has `sitemap.xml`. Use a template-literal Node script to regenerate if URLs change. `sitemap@9.0.1` is the standard npm package if a dep becomes preferable later, but it is overkill for a file with 3 URLs.

---

## 6. Replit Deploy Automation — Honest Ceiling

There is no official Replit CLI or API for programmatic redeploy of Cloud Run deployments. The Replit docs confirm the manual "Redeploy" button is the only trigger. The third-party `repl.deploy` daemon conflicts with `.replit` line 31 (`deploymentTarget = "cloudrun"`).

**Realistic scope — harden `deploy.sh` with divergence guard and build verification:**

```bash
#!/bin/bash
set -e

# Guard: refuse if local diverges from origin/main
git fetch origin main
if ! git diff --quiet HEAD origin/main; then
  echo "ERROR: local diverges from origin/main. Pull or resolve before deploying." >&2
  exit 1
fi

echo "Building client..."
cd client && npm run build && cd ..

# Guard: verify build output exists before overwriting public/
if [ ! -f "client/dist/index.html" ]; then
  echo "ERROR: client build failed — client/dist/index.html missing." >&2
  exit 1
fi

echo "Updating public/..."
rm -rf public/assets
cp -r client/dist/* public/

echo "Committing..."
git add public/
git commit -m "build: rebuild public/ for deployment" || echo "No changes to commit"

echo "Pushing to origin/main..."
git push

echo ""
echo "DONE. Now go to Replit and click Redeploy."
echo "Replit does not support programmatic redeploy for Cloud Run targets."
```

This is Claude-runnable, divergence-safe, and honest about the manual step.

---

## Dependency Matrix

| Package | Version | Location | Action |
|---------|---------|----------|--------|
| `archiver` | `^8.0.0` | root `dependencies` | `npm install archiver@^8.0.0` |
| `p-limit` | `^4.0.0` | root `dependencies` | `npm install p-limit@^4.0.0` |
| `adm-zip` | `^0.5.10` | root | `npm uninstall adm-zip` |
| `sharp` | `^0.34.5` | root `devDependencies` | `npm install --save-dev sharp@^0.34.5` |

---

## What NOT to Add

| Candidate | Why Not |
|-----------|---------|
| `yazl` | Lower-level than archiver, no ergonomic advantage, adds complexity |
| `zip-stream` | archiver wraps it; redundant |
| `node-stream-zip` | ZIP reader not writer — wrong category |
| `sitemap` npm package | Overkill for a static 3-URL file; inline script is sufficient |
| Replit CLI / repl.deploy | No official API; repl.deploy conflicts with Cloud Run target |
| WebP CDN or transform proxy | Out of scope; one-off sharp script is sufficient |

---

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| archiver selection | HIGH | npm registry + GitHub releases verified; Node 20 compat confirmed |
| store mode recommendation | HIGH | MP3 audio entropy makes DEFLATE counterproductive — well-established |
| p-limit server gap | HIGH | Directly observed: absent from root `package.json`, present only in client |
| Integration pattern | HIGH | Derived from actual route code + archiver API |
| Replit deploy ceiling | HIGH | Replit docs confirm no programmatic redeploy API for Cloud Run |
| sharp for WebP | HIGH | npm verified; devDep-only build-time pattern is standard |
| sitemap as inline script | MEDIUM | Pragmatic; `sitemap@9.0.1` is valid alternative if URL set grows |

---

## Sources

- [archiver npm](https://www.npmjs.com/package/archiver) — v8.0.0, Node 18+
- [archiverjs/node-archiver releases](https://github.com/archiverjs/node-archiver/releases) — May 2024, breaking: Node 18+ for ESM
- [sharp npm](https://www.npmjs.com/package/sharp) — v0.34.5
- [npm-compare: adm-zip vs archiver vs yazl vs zip-stream](https://npm-compare.com/adm-zip,archiver,jszip,yazl,zip-lib,zip-stream) — streaming comparison matrix
- [Replit deployments docs](https://docs.replit.com/llms-full.txt) — confirms no programmatic redeploy API for Cloud Run; manual Redeploy only
- [How to Stream a Zip to the Browser in Express](https://codepunk.io/how-to-stream-a-zip-file-to-the-browser-in-express-and-node-js/) — archiver + Express pipe pattern
- Direct file reads: `routes/download.js`, `package.json`, `client/package.json`, `deploy.sh`, `.replit`

---

*Stack research for: Suno Playlist Downloader v2.2 Batch Downloads & Ops*
*Researched: 2026-05-13*
