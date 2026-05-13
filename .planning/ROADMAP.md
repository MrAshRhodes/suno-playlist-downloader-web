# Roadmap: Suno Playlist Downloader

## Milestones

- ✅ **v2.0 Monolith UI** — Phases 1-11 (shipped 2026-05-02)
- ✅ **v2.1 UX & Discovery** — Phases 12-14 (shipped 2026-05-12)
- 🔵 **v2.2 Batch Downloads & Ops** — Phases 15-17 (active)

## Phases

<details>
<summary>✅ v2.0 Monolith UI (Phases 1-11) — SHIPPED 2026-05-02</summary>

- [x] Phase 1: Core Monolith (2/2 plans) — Palette, cards, and typography
- [x] Phase 2: Atmospheric Art (1/1 plan) — p5.js ambient waveform background
- [x] Phase 3: Interactions & Polish (2/2 plans) — Micro-animations, hover states, WCAG AA
- [x] Phase 4: Google Ads (1/1 plan) — AdSense Auto Ads for monetization
- [x] Phase 5: Download Support Popup (1/1 plan) — fulfilled by Phase 7 donation modal
- [x] Phase 6: Premium Title Banner & Step Cards (1/1 plan) — Hero banner + card sections
- [x] Phase 6.1: Match Site Styling to Banner (1/1 plan) — Neon palette harmonization (INSERTED)
- [x] Phase 7: Donation Modal (2/2 plans) — Gratitude-first BMC donation modal
- [x] Phase 8: Dependabot Security (2/2 plans) — Resolve dependabot alerts via GitHub CLI
- [x] Phase 9: SEO & Domain (2/2 plans) — Full SEO meta, OG cards, sitemap, domain research
- [x] Phase 10: Adsterra Monetisation (6/6 plans) — CLS-safe AdSlot banner component
- [x] Phase 11: Security Check + Regression (5/5 plans) — 12 Dependabot alerts resolved, uuid 14 upgrade

See full details: `.planning/milestones/v2.0-ROADMAP.md`

</details>

<details>
<summary>✅ v2.1 UX & Discovery (Phases 12-14) — SHIPPED 2026-05-12</summary>

- [x] **Phase 12: Per-Song Checkbox Selection** — Individual song selection with select-all and download count
- [x] **Phase 13: @Username Input UX** — Placeholder, helper text, and full URL acceptance
- [x] **Phase 14: Dependabot Verification** — Confirm PRs #2 and #3 closed, npm audit clean

See full details: `.planning/milestones/v2.1-ROADMAP.md`

</details>

### v2.2 Batch Downloads & Ops

- [ ] **Phase 15: Deploy Hardening** — Automated, divergence-safe deploy and Replit sync scripts
- [ ] **Phase 16: SEO Hygiene** — Canonical tag, hero WebP compression, sitemap completeness, FAQ schema
- [ ] **Phase 17: Batch Downloads + Archiver Migration** — Streaming ZIP, client-side batching, SSE wiring, concurrency control

## Phase Details

### Phase 12: Per-Song Checkbox Selection
**Goal**: Users can select individual songs before downloading — opt-out model, all selected by default
**Depends on**: Nothing (self-contained UI change in song table)
**Requirements**: SEL-01, SEL-02, SEL-03, SEL-04, SEL-05
**Success Criteria** (what must be TRUE):
  1. Each song row in the table has a visible checkbox that toggles selection on click
  2. A header checkbox selects all, deselects all, and shows indeterminate state when partially selected
  3. The download button label reads "Download N songs as ZIP" reflecting the current selection count
  4. The download button is disabled and visually inactive when zero songs are selected
  5. When a playlist loads, all songs are checked by default — unmodified behavior for users who never touch checkboxes
**Plans**: 1 plan
Plans:
- [x] 12-01-PLAN.md — Selection state, checkbox column, download filter, and button label

**UI hint**: yes

### Phase 13: @Username Input UX
**Goal**: Users can discover and correctly use @username input — both as bare handle and full suno.com URL
**Depends on**: Nothing (isolated to input field and Suno.ts validation)
**Requirements**: INP-01, INP-02, INP-03
**Success Criteria** (what must be TRUE):
  1. The input placeholder shows both accepted formats (e.g. "Playlist URL or @username")
  2. Helper text below the input describes what formats are accepted
  3. Pasting `https://suno.com/@focusedbeats` into the input loads that user's songs correctly
**Plans**: 1 plan
Plans:
- [x] 13-01-PLAN.md — Placeholder text, helper text element, and Suno.ts full-URL routing branch

**UI hint**: yes

### Phase 14: Dependabot Verification
**Goal**: Security housekeeping is confirmed — open PRs closed and root package tree clean
**Depends on**: Nothing (read-only verification)
**Requirements**: SEC-01, SEC-02
**Success Criteria** (what must be TRUE):
  1. `gh pr view 2` and `gh pr view 3` both report a closed or merged state
  2. `npm audit` run from the repo root exits with zero vulnerabilities
**Plans**: 1 plan
Plans:
- [x] 14-01-PLAN.md — Verify PR closure (SEC-01) and fix ip-address XSS via npm audit fix (SEC-02)

### Phase 15: Deploy Hardening
**Goal**: Developer can build, commit, and recover Replit divergence using Claude-runnable scripts — no accidental bare pushes
**Depends on**: Nothing (standalone scripts, no code dependencies)
**Requirements**: OPS-01, OPS-02, OPS-03
**Success Criteria** (what must be TRUE):
  1. Running `deploy-safe.sh` builds the client, copies dist to `public/`, and commits without triggering a git push
  2. Running `deploy.sh` when nothing is staged exits cleanly without pushing
  3. `replit-sync.sh` documents the `git reset --hard origin/main` recovery step and can be run on the Replit instance to resolve divergence
**Plans**: TBD

### Phase 16: SEO Hygiene
**Goal**: Site scores cleanly on Core Web Vitals — LCP bottleneck resolved, structured data added, crawl hygiene correct
**Depends on**: Phase 15 (deploy pipeline hardens before SEO assets are shipped)
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04
**Success Criteria** (what must be TRUE):
  1. `client/index.html` contains exactly one `<link rel="canonical" href="https://sunozip.com/" />` tag
  2. The hero banner image in `public/assets/` is a WebP file under 150KB (down from 2.4MB PNG)
  3. `public/sitemap.xml` includes the `/privacy` page URL; `lastmod` on unchanged pages is not bumped on re-deploy
  4. `client/index.html` contains a `FAQPage` JSON-LD `<script type="application/ld+json">` block with 3-5 Q&A entries
**Plans**: TBD

**UI hint**: yes

### Phase 17: Batch Downloads + Archiver Migration
**Goal**: Large playlists download without OOM — streaming ZIP, bounded concurrency, client batching, and SSE progress all work correctly
**Depends on**: Phase 15, Phase 16
**Requirements**: BAT-01, BAT-02, BAT-03, BAT-04
**Success Criteria** (what must be TRUE):
  1. Downloading a 200-song playlist does not exhaust Replit VM RAM — archiver v7 streams ZIP bytes directly to the response, never building in memory
  2. When selected songs exceed `BATCH_SIZE`, the client automatically splits the download into sequential batches, each producing a ZIP named `PlaylistName-batch-01-of-N.zip`
  3. The SSE progress bar advances correctly during download — per-clip status events are emitted because `sessionId` is now included in the POST body
  4. Setting `BATCH_SIZE=25` in the environment changes batch behavior without any code change; the default (no env var) is 50
**Plans**: TBD

## Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 1. Core Monolith | v2.0 | 2/2 | Complete | 2026-04-14 |
| 2. Atmospheric Art | v2.0 | 1/1 | Complete | 2026-04-14 |
| 3. Interactions & Polish | v2.0 | 2/2 | Complete | 2026-04-14 |
| 4. Google Ads | v2.0 | 1/1 | Complete | 2026-04-14 |
| 5. Download Support Popup | v2.0 | 1/1 | Complete | 2026-04-14 |
| 6. Premium Title Banner | v2.0 | 1/1 | Complete | 2026-04-20 |
| 6.1. Match Site Styling | v2.0 | 1/1 | Complete | 2026-04-20 |
| 7. Donation Modal | v2.0 | 2/2 | Complete | 2026-04-25 |
| 8. Dependabot Security | v2.0 | 2/2 | Complete | 2026-04-28 |
| 9. SEO & Domain | v2.0 | 2/2 | Complete | 2026-04-30 |
| 10. Adsterra Monetisation | v2.0 | 6/6 | Complete | 2026-05-01 |
| 11. Security Check + Regression | v2.0 | 5/5 | Complete | 2026-05-02 |
| 12. Per-Song Checkbox Selection | v2.1 | 1/1 | Complete | 2026-05-12 |
| 13. @Username Input UX | v2.1 | 1/1 | Complete | 2026-05-12 |
| 14. Dependabot Verification | v2.1 | 1/1 | Complete | 2026-05-12 |
| 15. Deploy Hardening | v2.2 | 0/? | Not started | - |
| 16. SEO Hygiene | v2.2 | 0/? | Not started | - |
| 17. Batch Downloads + Archiver Migration | v2.2 | 0/? | Not started | - |
