# Project Research Summary

**Project:** Suno Playlist Downloader
**Milestone:** v2.2 Batch Downloads & Ops
**Researched:** 2026-05-13
**Confidence:** MEDIUM-HIGH (three internal conflicts resolved below)

---

## Executive Summary

v2.2 has three tracks: fix a critical memory bug blocking large playlist downloads, apply high-ROI SEO improvements, and harden the deploy pipeline. The OOM root cause is two compounding bugs: `Promise.all()` with no concurrency limit fires 500+ simultaneous fetches, and `AdmZip` builds the full ZIP in memory before streaming. Fix: `archiver@8` piped directly to `res` + `p-limit(8)` server-side. Also discovered: SSE progress bar has never worked — `sessionId` is never sent in POST body, so server cannot emit progress events. Phase 17 fixes batch support, archiver migration, SSE wiring, and concurrency control as a coherent unit.

SEO work is high-ROI and low-risk: hero image compression (2.4MB PNG → WebP <150KB) directly improves LCP — a confirmed Google ranking signal. Canonical tag and sitemap completeness are hygiene fixes.

Deploy automation closes recurring friction: `deploy.sh` has an unconditional `git push` that fires even when nothing changed, and no documented Replit divergence recovery. Hard ceiling: Replit Cloud Run has no programmatic redeploy API — the Replit UI "Redeploy" button is unavoidable.

---

## Key Findings

### Recommended Stack

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| archiver | ^8.0.0 | Streaming ZIP to `res` | Replaces adm-zip; Node 20 compat confirmed |
| p-limit | ^4.0.0 (root) | Bounded fetch concurrency | Already in client/; add to root package.json |
| sharp | ^0.34.5 (devDep) | One-off hero WebP conversion | Build-time only; NOT deployed to Replit |

**Remove:** `adm-zip` from root dependencies after archiver migration.

---

### Expected Features

**P1 — Must ship:**

| Feature | Notes |
|---------|-------|
| `p-limit(8)` server-side | Fix OOM root cause — add BEFORE archiver migration |
| Streaming ZIP via archiver | Replaces AdmZip in-memory build; pipes directly to `res` |
| Client-side batch slicing loop | 50-song chunks of `selectedClips`; auto-queue all batches |
| SSE progress wiring fix | Add `sessionId` to POST body; server emits per-clip events |
| ZIP naming: `Name-batch-01-of-N.zip` | Zero-padded, OS sort-safe |
| Hero image WebP: <150KB | Direct LCP win; `public/assets/hero-*.png` only |
| Canonical tag guard in `client/index.html` | Verify current state first — may already exist |
| `deploy-safe.sh` | Claude-runnable build+commit; no bare `git push` |

**P2 — Should ship:**

| Feature | Notes |
|---------|-------|
| Sitemap `/privacy` URL | Completeness; update `lastmod` only on content change |
| `replit-sync.sh` | Documents + automates Replit divergence recovery |

**Defer to v2.3+:** Batch count preview UI, pause/resume mid-batch, FAQ JSON-LD schema, page title keyword tuning.

**Fixed batch size: 50 songs** (expose as `BATCH_SIZE` env var). Memory math: Replit Shared VM 2GB, Puppeteer adds 200–400MB outside V8 heap. 50 songs at ~6MB each = 300MB peak per batch — safe margin.

---

### Architecture Approach

**Client-side batching** — `App.tsx` slices `selectedClips` into 50-song chunks, calls `POST /api/download/playlist` once per batch. Server stays stateless; no new route or cross-request coordination needed.

**Modified files:**
1. `routes/download.js` — archiver + p-limit + sessionId from body + SSE emit + cleanup flag + event handler order
2. `client/src/App.tsx` — batch slicing loop, sessionId passed to API call
3. `client/src/services/WebApi.ts` — add `sessionId` field to POST body (currently missing — silent SSE bug)
4. `client/index.html` — canonical tag guard (verify state first)
5. `deploy.sh` — conditional push guard (`git diff --cached --quiet` check)

**New files:**
- `client/src/utils/batch.ts` — `chunk<T>(arr, size)` utility
- `deploy-safe.sh` — Claude-runnable build+commit script
- `replit-sync.sh` — Replit divergence recovery (`git reset --hard origin/main`)

---

### Critical Pitfalls

1. **`p-limit` before archiver** — unbounded `Promise.all()` is the primary OOM cause. Add p-limit first; archiver alone won't prevent OOM on large playlists.
2. **Archiver disconnect leak** — `stream.pipeline()` + `res.on('close', () => archive.abort())`. Open issue archiverjs#89 since 2015.
3. **`req.on('close')` fires on normal completion (Node 16+)** — causes premature temp dir cleanup. Guard: `let downloadComplete = false` flag.
4. **Event handler order** — `archive.on('error')` and `archive.on('warning')` MUST be registered BEFORE `archive.pipe()`/`pipeline()`. Unhandled errors crash process.
5. **SSE and ZIP cannot coexist on one response** — keep two-endpoint model: POST for ZIP bytes, GET SSE for progress.
6. **OG image must stay PNG** — `public/assets/og-card.png` must not be converted to WebP. Apply WebP to hero/banner assets only.
7. **Replit VM: 2GB RAM / 0.5 vCPU** — safe `p-limit` concurrency: 5–8; safe batch size: 50 songs.

---

## Conflict Resolutions

| Conflict | Resolution |
|----------|-----------|
| Canonical tag: already present (PITFALLS) vs missing (ARCHITECTURE) | Verify with `grep "rel=\"canonical\"" client/index.html` at phase start; guard either way |
| Sitemap lastmod: auto-update every deploy vs conservative | Conservative — update only on actual content change; avoids crawl budget waste |
| Batch size: 100 (FEATURES) vs 50 (PITFALLS) | Default 50 with Puppeteer RAM budget; expose as `BATCH_SIZE` env var |

---

## Recommended Phase Order

| Phase | Name | Rationale |
|-------|------|-----------|
| 15 | Deploy Hardening | Lowest risk; hardened pipeline gates all subsequent phases |
| 16 | SEO Hygiene | Zero functional risk; validates deploy pipeline cheaply |
| 17 | Batch Downloads + Archiver Migration | Highest complexity; ships last on proven rails |

Phases continue from v2.1 (Phase 14 was last).

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | npm registry + direct package.json inspection |
| Features | HIGH | Official Replit docs, SEO signals research |
| Architecture | HIGH | Line-level source inspection of all 7 files |
| Pitfalls | HIGH | Direct code inspection + verified upstream issues |

---

## Sources

- `routes/download.js`, `client/src/App.tsx`, `client/src/services/WebApi.ts` — direct line-level inspection
- archiver npm v8.0.0 — Node 18+ compat confirmed
- archiverjs/node-archiver#89 — disconnect leak (open since 2015)
- Replit deployment docs — 2GB/0.5vCPU Shared VM, no programmatic redeploy API
- Node.js stream docs — `pipeline()` cleanup semantics
- Google Core Web Vitals docs — LCP threshold 2.5s as ranking signal

---
*Research completed: 2026-05-13 | Ready for requirements: yes*
