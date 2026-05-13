# Feature Research — v2.2 Batch Downloads & Ops

**Domain:** Music archive tool — batch ZIP, SEO hygiene, deploy automation
**Researched:** 2026-05-13
**Confidence:** HIGH (backed by official docs, npm ecosystem data, Replit docs inspection)

---

## Area 1: Batch ZIP Downloading

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Auto-queue all batches sequentially | 1000 songs ≠ 10 manual clicks. Any batch-download tool (game installers, cloud backups, torrent clients) auto-advances. Manual-per-batch would feel broken | MEDIUM | Client-side loop: iterate batch indices 0..N, call API per batch, auto-advance on success. Existing `downloadPlaylist()` call becomes the inner body |
| Per-batch progress display | User must see "Batch 2 of 10 — 47 songs downloading…" to trust the system didn't stall | LOW | Reuse existing SSE progress monitor (`setupProgressMonitor`). Reset display labels per batch iteration. No new infra needed |
| Partial save — no restart on failure | If batch 7 fails, batches 1–6 already downloaded. Restarting from zero is a dealbreaker for 1000-song libraries | LOW | Sequential auto-queue gives partial save for free: each batch ZIP lands on user's disk before next batch starts |
| Streaming ZIP (no in-memory build) | The actual memory fix — without this, 100-song batches still risk OOM on Replit's constrained VM | MEDIUM | Replace `AdmZip` in `routes/download.js` with `archiver`. Pipe directly to `res`. This is the infrastructure prerequisite for all batch work |
| Fixed default batch size | 100 songs/batch is the convention (game mods, NFT art packs, cloud backup chunking). Users don't need to configure it | LOW | Hardcode `batchSize = 100`. No settings UI needed |
| ZIP naming with batch index | `PlaylistName-batch-01-of-10.zip` — zero-padded so OS alphabetic sort matches download order | LOW | Format string on server: `${playlistName}-batch-${String(i+1).padStart(2,'0')}-of-${total}.zip` |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Works with existing checkbox selection | User selects 200 songs, gets 2 auto-batched ZIPs of their custom selection — no tool does this today | LOW | Batch slicing builds on `selectedIds` Set already in place. Filter clips by selection, then slice into batches server-side or client-side |
| Batch count preview before download | "Your selection will produce 4 ZIPs (100 songs each)" — surfaces the scope before commit | LOW | `Math.ceil(selectedIds.size / batchSize)` in the UI, shown alongside the download button |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| User-configurable batch size | Power users want control | Adds settings UI, docs, edge-case handling (0, 1, 9999). No real user benefit — 100 is always right for memory safety | Fixed 100, document it as the default in UI copy |
| Pause/resume mid-batch queue | Partial-queue recovery | Requires persistent queue state machine in browser — localStorage or IndexedDB. Adds 3x implementation complexity for a rare edge case | Sequential auto-queue already gives partial-save per-batch. User can restart from failed batch manually using checkbox deselect |
| Server-side multi-ZIP combining ("download all as one archive") | Single file is simpler | Defeats the entire memory fix. Concatenating batch ZIPs server-side rebuilds the in-memory problem | Deliver N separate ZIPs. OS file managers handle multiple ZIPs easily |
| Parallel batch downloads | Speed | Browser allows ~6 parallel requests, but server-side parallel ZIP builds multiply RAM usage N-fold — exactly the problem being solved | Sequential is memory-safe and fast enough (IO-bound, not CPU-bound) |
| Retry logic per song within batch | Robustness | Adds retry state, exponential backoff, max-retry config. Suno CDN errors are transient; user can re-run failed batch via checkbox | Log failed songs in batch summary, let user manually retry that batch |

---

## Area 2: SEO Hygiene

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Canonical tag pointing to `https://sunozip.com/` | sunozip.com + Replit URL both indexed = PageRank split = rankings diluted. Canonical is mandatory now that the custom domain is live | LOW | One `<link rel="canonical" href="https://sunozip.com/">` in `client/index.html`. Zero risk |
| Hero image compression (2.4MB → <200KB) | LCP is a confirmed Google ranking signal. A 2.4MB PNG above-the-fold directly fails the "good" LCP threshold (2.5s). This is the single highest-ROI fix in the entire SEO backlog | LOW | Convert to WebP via ImageMagick or Squoosh. Target <150KB. Update `src` reference in component. LCP improvement is immediate and measurable |
| Sitemap includes `/privacy` URL | Crawlers discover pages via sitemap. A page missing from sitemap may not be indexed | LOW | Add second `<url>` entry to `public/sitemap.xml`. Two lines |
| Dynamic `lastmod` in sitemap | Hardcoded `2026-04-14` becomes stale on every deploy — search engines deprioritize stale sitemaps | LOW | Update `build.sh` to inject `$(date +%Y-%m-%d)` into sitemap during build via `sed` |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| FAQ JSON-LD schema (3–5 Q&A) | FAQ schema no longer triggers Google rich results (dropped June 2026) but delivers 3.2x more likely appearance in Google AI Overviews and 47% citation lift in AI query responses. High value for AI search / GEO | LOW | Add second `<script type="application/ld+json">` block with `FAQPage` schema in `client/index.html`. 5 Q&A targeting "how to download suno songs", "suno playlist mp3", etc. Schema content must match visible page FAQ section |
| Visible FAQ section matching schema | Schema must match visible HTML — Google penalizes mismatch. Also improves page quality signal | LOW | Add collapsible FAQ `<section>` in the React page below the main tool, matching JSON-LD Q&A pairs |
| Refined page title targeting download-intent keywords | "Suno Playlist Downloader — Download Suno Music as MP3" is descriptive but not keyword-optimized. "Download Suno Songs & Playlists as MP3 ZIP — SunoZip" targets higher-intent queries | LOW | One string change in `<title>` and `<meta name="description">` in `client/index.html` |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Google Search Console sitemap submission as a code step | Automate everything | GSC submission is a one-time manual action via browser. No API exists that is practical to automate here | Document as a manual step in the phase PLAN |
| Automated Core Web Vitals monitoring in CI | Know when LCP regresses | Requires Lighthouse CI, puppeteer headless runner, CI pipeline changes. Disproportionate to the scope | Fix the hero image now; check manually in PageSpeed Insights after deploy |
| Blog/content pages for SEO | Long-tail keyword coverage | Scope creep requiring content creation, routing, CMS thinking. Tool pages rank on tool-specific keywords, not content authority | Strong FAQ schema covers the long-tail question queries |
| `hreflang` for multiple languages | International traffic | Single-language tool; no i18n infrastructure. Adds complexity with zero benefit | English-only is correct for this tool |

---

## Area 3: Replit Deploy Automation

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Claude-safe deploy script (build + push without bare git push) | Current `deploy.sh` ends with unguarded `git push` — unsafe for Claude to run. A safe variant that Claude CAN run unlocks automated deploy at end of every phase | LOW | Create `deploy-safe.sh`: `npm run build` → copy `client/dist/` to `public/` → `git add public/` → `git commit -m "chore: rebuild public for deploy"` → print "Run: git push to deploy" but do NOT execute push. Claude runs build+commit; human confirms push |
| Divergence-safe Replit resync script | `fatal: Need to specify how to reconcile divergent branches` is a recurring blocker. Replit's local git state drifts when edits happen in the UI | LOW | `replit-sync.sh` (runs on Replit, not Claude): `git fetch origin && git reset --hard origin/main`. Documents in README that this is the recovery step when Replit diverges |
| pre-push hook that validates public/ is rebuilt | Prevents pushing stale `public/` to Replit (which would serve old code) | LOW | Already exists (`.git/hooks/pre-push`). Document it clearly — confirm it works correctly and is not bypassed |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| `make deploy` single-command workflow | `Makefile` target: `build` → `copy-public` → `commit` → `push`. Memorable, IDE-integrated, standard Unix tooling | LOW | 10-line `Makefile`. Targets: `build`, `copy-public`, `commit-public`, `push`, `deploy` (chains all). Claude runs `make build copy-public commit-public`; human runs `make push` |
| Documented deploy runbook in `.planning/` | Every milestone ends the same way. A concise DEPLOY.md prevents the divergent-branch problem from recurring because the sequence is documented and followed | LOW | 1-page DEPLOY.md: build → copy → commit → push → verify on Replit. Include the `replit-sync.sh` rescue command |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| repl.deploy daemon (auto-pull on GitHub push) | Zero-click deploy | Last release May 2021 — unmaintained 4 years. Requires always-on Replit Repl (costs cycles/money). Security risk: RSA daemon running permanently in prod | Manual push + Replit UI redeploy button. One extra click but no attack surface |
| GitHub Actions → Replit auto-redeploy | CI/CD familiarity | Replit has no public webhook or API for triggering redeployments programmatically (confirmed: docs.replit.com has no deployment trigger API). Would require the unmaintained repl.deploy daemon | Push to GitHub, click Redeploy in Replit UI |
| Replit CLI deploy (`replit deploy`) | Standard CLI workflow | `replit deploy` CLI does not appear in Replit's public documentation (confirmed via docs inspection). May exist as internal/beta tool but unreliable to depend on | Current git push + Replit UI is the documented and stable path |
| Automatic Replit git pull on push | Zero-touch deploy | Replit Cloud Run deployment target (`deploymentTarget = "cloudrun"` in `.replit`) requires a manual Redeploy click in the Replit UI regardless of git state. No auto-pull hook available | Accept the one manual step — it's a 10-second operation |

---

## Feature Dependencies

```
[Streaming ZIP via archiver]
    └──required by──> [Batch ZIP downloading]
                          └──enhanced by──> [Per-song checkbox selection (already shipped v2.1)]
                          └──requires──> [Auto-queue client loop in App.tsx]
                          └──requires──> [Batch-index-aware backend route POST /api/download/playlist/batch]

[Canonical tag]
    └──standalone — no dependencies

[Hero image compression]
    └──standalone — no dependencies
    └──improves──> [LCP score → Core Web Vitals pass threshold]

[FAQ JSON-LD schema]
    └──requires──> [Visible FAQ section in page HTML] (schema must match visible content)

[Dynamic sitemap lastmod]
    └──requires──> [build.sh modification]
    └──enhanced by──> [deploy-safe.sh] (ensures build.sh runs before every push)

[deploy-safe.sh]
    └──standalone — no code dependencies
    └──enhances──> [Every future phase deploy]

[replit-sync.sh]
    └──standalone — rescue script only, not in critical path
```

### Dependency Notes

- **Streaming ZIP is the infrastructure prerequisite for batch:** Without replacing `AdmZip` with `archiver`, any batch size is still in-memory. Must ship streaming first, batch API second.
- **FAQ schema requires visible FAQ HTML:** Google penalizes schema-without-matching-content. Build the `<section>` and the JSON-LD in the same task.
- **deploy-safe.sh enhances all future phases:** Once it exists, every phase ends with `./deploy-safe.sh` instead of a manual multi-step sequence.
- **Batch depends on per-song selection (already shipped):** `selectedIds` Set is the filter applied before batch slicing. v2.1 dependency is satisfied.

---

## MVP Definition for v2.2

### Launch With (v2.2)

- [ ] `archiver` replaces `AdmZip` in `routes/download.js` — streaming ZIP, no in-memory build
- [ ] `POST /api/download/playlist/batch` route — accepts `clips[]`, `batchIndex`, `batchSize=100`, returns one streaming ZIP
- [ ] Client batch loop in `downloadPlaylist()` — auto-queues all batches, resets progress per batch, shows "Batch N of M"
- [ ] ZIP naming: `PlaylistName-batch-01-of-10.zip` (zero-padded)
- [ ] Hero image compressed: `public/assets/hero-banner-*.png` → WebP <150KB
- [ ] `<link rel="canonical" href="https://sunozip.com/">` in `client/index.html`
- [ ] Sitemap updated: `/privacy` added, `lastmod` dynamic via `build.sh`
- [ ] `deploy-safe.sh` created — Claude-runnable build+commit without bare `git push`
- [ ] `replit-sync.sh` created — divergence recovery script for Replit

### Add After Validation (v2.2.x)

- [ ] FAQ JSON-LD schema + visible FAQ section — add if Google Search Console data shows question-format queries landing on the page
- [ ] Refined page title for keyword targeting — A/B test after GSC is connected

### Future Consideration (v2.3+)

- [ ] Batch count preview UI before download starts — low effort, add if users report confusion about number of ZIPs
- [ ] `Makefile` deploy workflow — only if team grows beyond solo; overkill for one-person project

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Streaming ZIP (archiver) | HIGH — unblocks large playlists | MEDIUM — replace AdmZip API calls | P1 |
| Batch download route + client loop | HIGH — core v2.2 goal | MEDIUM — new route + client state | P1 |
| Hero image compression | HIGH — LCP ranking factor, page speed | LOW — ImageMagick one-liner | P1 |
| Canonical tag | HIGH — prevents PageRank split | LOW — one HTML line | P1 |
| deploy-safe.sh | HIGH — removes recurring friction | LOW — shell script | P1 |
| Sitemap completeness + dynamic lastmod | MEDIUM — hygiene baseline | LOW — 2 lines XML + sed in build.sh | P2 |
| FAQ JSON-LD + visible FAQ section | MEDIUM — AI search citations | LOW — JSON-LD block + HTML section | P2 |
| replit-sync.sh | MEDIUM — rescue script | LOW — 3 lines of shell | P2 |
| Batch count preview in UI | LOW — nice UX signal | LOW — one `Math.ceil()` expression | P3 |

---

## Sources

- Replit Deployments documentation: https://docs.replit.com/category/replit-deployments (no programmatic redeploy API found)
- repl.deploy GitHub: https://github.com/khrj/repl.deploy (last release 2021 — considered unmaintained)
- archiver npm: npm-compare.com — confirmed leading streaming ZIP library for Node.js
- Google on Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals — LCP confirmed ranking signal
- FAQ schema status: https://www.frase.io/blog/faq-schema-ai-search-geo-aeo — rich results dropped June 2026, AI Overviews impact confirmed
- Core Web Vitals as tiebreaker: https://www.nicodigital.com/technical-seo/core-web-vitals-in-2025-why-page-experience-still-rules-seo-rankings/
- SEED-001, SEED-002, SEED-003 — project seeds planting the three feature areas

---

*Feature research for: Suno Playlist Downloader v2.2 — Batch Downloads & Ops*
*Researched: 2026-05-13*
