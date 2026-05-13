# Requirements: Suno Playlist Downloader v2.2

**Defined:** 2026-05-13
**Milestone:** v2.2 Batch Downloads & Ops
**Core Value:** Downloads work reliably. Visual quality matches a premium product. Zero functional regressions from UI changes.

## v2.2 Requirements

### Deploy Automation (OPS)

- [x] **OPS-01**: Developer can run `deploy-safe.sh` to build the client, copy dist to `public/`, and commit — without triggering a bare `git push`
- [x] **OPS-02**: `deploy.sh` only pushes when there are unpushed commits (`git log origin/main..HEAD --oneline` guard — non-empty output triggers push)
- [x] **OPS-03**: `replit-sync.sh` documents and automates Replit divergence recovery (`git reset --hard origin/main` on the Replit instance)

### SEO Hygiene (SEO)

- [ ] **SEO-01**: `client/index.html` contains `<link rel="canonical" href="https://sunozip.com/" />` — verified present and regression-protected in build
- [ ] **SEO-02**: Hero banner image (`public/assets/hero-banner-*.png`) is converted to WebP at <150KB — LCP bottleneck resolved (currently 2.4MB)
- [ ] **SEO-03**: `public/sitemap.xml` includes the `/privacy` page URL; `lastmod` updated only when content actually changes (not on every deploy)
- [ ] **SEO-04**: `client/index.html` includes `FAQPage` JSON-LD schema with 3–5 Q&A about the tool for AI Overview citation eligibility

### Batch Downloads (BAT)

- [ ] **BAT-01**: `routes/download.js` uses `archiver` v7 streaming ZIP (piped directly to `res`) and `p-limit(8)` fetch concurrency — replaces `adm-zip` in-memory ZIP build; existing `/api/download/playlist` endpoint signature unchanged
- [ ] **BAT-02**: When a playlist has more songs than `BATCH_SIZE`, the client automatically slices the selected songs into sequential batches and queues all downloads — each batch produces one ZIP named `PlaylistName-batch-01-of-N.zip`
- [ ] **BAT-03**: SSE download progress events are emitted correctly — `sessionId` is included in the POST body so `global.downloadTrackers[sessionId]` can emit per-clip status updates
- [ ] **BAT-04**: `BATCH_SIZE` defaults to 50 songs and is configurable via environment variable without code change

## Future Requirements

### Deferred from v2.2

- **BAT-05**: Batch count preview shown before download starts (how many ZIPs will be created)
- **BAT-06**: Pause/resume mid-batch queue
- **SEO-05**: Page title and H1 keyword-optimized for "download suno songs" search intent
- **OPS-04**: GitHub Actions workflow to trigger Replit auto-pull on push to `main`

## Out of Scope

| Feature | Reason |
|---------|--------|
| Existing download route signature changes | BAT-01 is additive only; existing `POST /api/download/playlist` behavior preserved |
| Mantine v7 upgrade | Breaking changes risk to existing components |
| OG image WebP conversion | WebP OG is unreliable across Facebook/Twitter scrapers — `og-card.png` stays PNG |
| Server-side multi-ZIP combining | Re-introduces the in-memory OOM being fixed |
| Replit programmatic redeploy API | No API exists — UI "Redeploy" button is unavoidable |
| Audio preview playback | Out of scope per PROJECT.md |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| OPS-01 | Phase 15 | Complete |
| OPS-02 | Phase 15 | Complete |
| OPS-03 | Phase 15 | Complete |
| SEO-01 | Phase 16 | Pending |
| SEO-02 | Phase 16 | Pending |
| SEO-03 | Phase 16 | Pending |
| SEO-04 | Phase 16 | Pending |
| BAT-01 | Phase 17 | Pending |
| BAT-02 | Phase 17 | Pending |
| BAT-03 | Phase 17 | Pending |
| BAT-04 | Phase 17 | Pending |

**Coverage:**
- v2.2 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-13*
*Last updated: 2026-05-13 — v2.2 milestone start*
