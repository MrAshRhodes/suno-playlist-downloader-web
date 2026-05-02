# Roadmap: Suno Playlist Downloader — Monolith UI (v2.0)

## Overview

Three phases deliver the Monolith design system onto a fully working app. Phase 1 lands the biggest visible impact: palette, depth cards, and type hierarchy. Phase 2 adds the p5.js atmospheric waveform as a distinct technical concern. Phase 3 completes the experience with micro-animations, hover states, and accessibility polish.

## Milestones

- **v2.0 Monolith UI** - Phases 1-3 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (1.1, 2.1): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Core Monolith** - Palette, cards, and typography — the complete visual transformation
- [x] **Phase 2: Atmospheric Art** - p5.js ambient waveform background
- [x] **Phase 3: Interactions & Polish** - Micro-animations, hover states, and finishing touches
- [x] **Phase 4: Google Ads** - AdSense Auto Ads for monetization
- [x] **Phase 5: Download Support Popup** - fulfilled by Phase 7 donation modal on ZIP download
- [x] **Phase 6: Premium Title Banner & Step Cards** - Hero banner image and monolith-card step sections
- [x] **Phase 6.1: Match Site Styling to Banner** - Harmonize color palette, cards, buttons with neon design language (INSERTED)
- [x] **Phase 7: Donation Modal** - Gratitude-first donation modal with generated banner
- [x] **Phase 8: Dependabot Security** - Resolve dependabot alerts via GitHub CLI
- [x] **Phase 9: SEO & Domain** - SEO improvements and domain name suggestions
- [x] **Phase 10: Adsterra Monetisation** - Replace blocked AdSense with Adsterra banner + parallel Media.net submission (completed 2026-05-01)
- [ ] **Phase 11: Dependabot Security Check + Full Website Regression** - Resolve current Dependabot alerts with full regression coverage (all fixes applied 2026-05-02; awaiting manual regression sign-off)

## Phase Details

### Phase 1: Core Monolith
**Goal**: The app looks like a Monolith product — correct palette in both modes, depth cards with 24px radius, and a clear type hierarchy
**Depends on**: Nothing (CSS variable foundation in place from commit 766c401)
**Requirements**: THME-01, THME-02, THME-03, CARD-01, CARD-02, TYPO-01, TYPO-02
**Success Criteria** (what must be TRUE):
  1. Dark mode renders Rich Black #0A0A0A background with Deep Gray #1A1A1A card surfaces and Deep Blue #3B4A6B accent
  2. Light mode renders Warm Ivory #F2EFE9 background with Muted Beige #E8E4DB card surfaces and the same accent
  3. Toggling theme causes no flash — cross-fade is smooth with no unstyled frames
  4. All content sections sit inside 24px radius cards that visually lift from the page (inner glow dark, soft drop shadow light)
  5. Headers render at 18-24pt semi-bold, body at 14pt, using Inter or system font stack
**Plans:** 2/2 plans complete

Plans:
- [x] 01-01-PLAN.md — Theme palette, Inter font, and transition fix (THME-01, THME-02, THME-03)
- [x] 01-02-PLAN.md — Card system, typography hierarchy, accent consistency, and logo (CARD-01, CARD-02, TYPO-01, TYPO-02)

**UI hint**: yes

### Phase 2: Atmospheric Art
**Goal**: A p5.js audio waveform canvas renders as ambient background behind all UI content
**Depends on**: Phase 1
**Requirements**: ART-01, ART-02, ART-03
**Success Criteria** (what must be TRUE):
  1. A generative waveform is visible behind the UI without obscuring any interactive elements
  2. The waveform pattern is reproducible — same seed produces the same visual across page loads
  3. The animation is ambient enough that users can focus on the download workflow without distraction
**Plans:** 1/1 plans complete

Plans:
- [x] 02-01-PLAN.md — Install p5.js, create useP5 hook + waveform sketch, build WaveformBackground component, wire into App (ART-01, ART-02, ART-03)

**UI hint**: yes

### Phase 3: Interactions & Polish
**Goal**: Every interactive element responds with intent, the app passes WCAG AA, and no surface is left unstyled
**Depends on**: Phase 2
**Requirements**: INTR-01, INTR-02, INTR-03, INTR-04, PLSH-01, PLSH-02, PLSH-03
**Success Criteria** (what must be TRUE):
  1. Buttons show accent glow on hover and a pressed state on active — visible at a glance
  2. The progress bar glows with the accent color and animates smoothly during active downloads
  3. Table rows highlight on hover with a subtle background shift, giving the list a tactile feel
  4. State changes (loading, downloading, complete) cross-fade rather than snap
  5. All color combinations pass WCAG AA contrast checks and the scrollbar matches the active theme
**Plans:** 2/2 plans complete

Plans:
- [x] 03-01-PLAN.md — Button glow, progress bar glow/height, state animations, Mantine Loader fix (INTR-01, INTR-02, INTR-03, INTR-04)
- [x] 03-02-PLAN.md — WCAG AA contrast fixes, banner text fix, Firefox scrollbar fallback (PLSH-01, PLSH-02, PLSH-03)
**UI hint**: yes

### Phase 4: Add Google Ads to the bottom of the site

**Goal:** Add Google AdSense Auto Ads via a single script tag in index.html for site monetization — Google determines ad placement automatically
**Requirements**: ADS-01, ADS-02, ADS-03, ADS-04
**Depends on:** Phase 3
**Plans:** 1 plan

Plans:
- [x] 04-01-PLAN.md — Add AdSense Auto Ads async script to index.html with publisher ID (ADS-01, ADS-02, ADS-03, ADS-04)

### Phase 5: Download Support Popup

**Goal:** Fulfilled by Phase 7 support donation modal: a Buy Me a Coffee support popup appears on ZIP download using a persistent download counter.
**Requirements**: DON-01, DON-02, DON-03, DON-04, DON-05, DON-06
**Depends on:** Phase 4
**Plans:** 1/1 reconciliation complete

Plans:
- [x] 05-01-PLAN.md — Retrospective reconciliation: Phase 5 Download Support Popup fulfilled by Phase 7 Donation Modal (DON-01 through DON-06)

**Note:** No additional code was required for Phase 5. The implementation and verification live in Phase 7 artifacts:
`07-01-SUMMARY.md`, `07-02-SUMMARY.md`, and `07-VERIFICATION.md`.

### Phase 6: Premium title banner and modern step cards

**Goal:** Replace the plain header with a generated hero banner image and wrap all 3 step sections in monolith-card containers with solid-surface numbered step indicators
**Requirements**: D-01, D-02, D-03, D-04, D-05, D-06
**Depends on:** Phase 5
**Plans:** 1/1 plans complete

Plans:
- [x] 06-01-PLAN.md — Hero banner image with title overlay + step card wrappers with numbered headings (D-01, D-02, D-03, D-04, D-05, D-06)

### Phase 6.1: Match site styling to the new modern vector/neon hero banner - update color palette, card styles, buttons, and overall aesthetic to harmonize with the dark navy/purple/blue neon design language (INSERTED)

**Goal:** Harmonize the full app color palette, card borders, buttons, and accent system with the neon navy/purple/cyan hero banner — CSS variable value swap with dual accent system (purple for actions, cyan for progress/status)
**Requirements**: D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09, D-10, D-11, D-12, D-13
**Depends on:** Phase 6
**Plans:** 1/1 plans complete

Plans:
- [x] 06.1-01-PLAN.md — Update CSS variable palette (both themes) and wire dual accent system (D-01 through D-13)

**UI hint**: yes

### Phase 7: Support donation modal with generated banner

**Goal:** A gratitude-first donation modal with generated coffee+music banner image appears at strategic download moments, encouraging users to support via Buy Me a Coffee
**Requirements**: DON-01, DON-02, DON-03, DON-04, DON-05, DON-06
**Depends on:** Phase 6
**Plans:** 2/2 plans complete

Plans:
- [x] 07-01-PLAN.md — Generate banner image asset via nanobanana MCP and build DonationModal component (DON-02, DON-03, DON-04)
- [x] 07-02-PLAN.md — Wire download counter and modal trigger logic into App.tsx (DON-01, DON-05, DON-06)

### Phase 8: Dependabot Security

**Goal:** Resolve all open Dependabot security alerts by removing unused vulnerable packages, upgrading vite 4.x to 6.x, running npm audit fix across both root and client, and closing all alerts via GitHub CLI
**Requirements**: D-01, D-02, D-03, D-04, D-05, D-06, D-07
**Depends on:** Phase 7
**Plans:** 2/2 plans complete

Plans:
- [x] 08-01-PLAN.md — Remove unused multer, npm audit fix on root server deps (D-01, D-02, D-04, D-05)
- [x] 08-02-PLAN.md — Upgrade vite to 6.x, fix client audit, rebuild public/, close all GitHub alerts (D-01, D-02, D-03, D-04, D-05, D-06, D-07)

### Phase 9: SEO & Domain

**Goal:** Add comprehensive SEO infrastructure (meta tags, OG social cards, Twitter Cards, JSON-LD structured data, canonical URL, robots.txt, sitemap.xml) and research custom domain name candidates
**Requirements**: D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09, D-10, D-11
**Depends on:** Phase 8
**Plans:** 2/2 plans complete

Plans:
- [x] 09-01-PLAN.md — SEO meta tags, OG/Twitter cards, JSON-LD, canonical, robots.txt, sitemap.xml, OG image pipeline (D-01, D-02, D-03, D-04, D-06, D-07, D-08, D-09, D-10, D-11)
- [x] 09-02-PLAN.md — Domain name research and availability check with ranked suggestions (D-05)

### Phase 10: Adsterra Monetisation (minimal banner-only scope)

**Goal:** Ship a minimal, non-regressing Adsterra banner integration: CLS-safe `AdSlot` component above the footer, `VITE_ADSTERRA_UNIT_KEY` configuration only, no popunder/social/direct-link code, no broken privacy/Sovrn/Media.net placeholders, and full website behavior preserved when the ad key is absent.
**Requirements**: ADM-01, ADM-02, ADM-03, ADM-04, ADM-05, ADM-06, ADM-07, ADM-08, ADM-09
**Depends on:** Phase 9 (sunozip.com live, ads.txt route exists)
**Plans:** 6/6 plans complete

Plans:
- [x] 10-01-PLAN.md — Scope resolution: full account-gate scope superseded by minimal Adsterra banner-only path (ADM-01, ADM-07, ADM-08)
- [x] 10-02-PLAN.md — Wave 1: public/ads.txt + sitemap.xml + robots.txt audit + REQUIREMENTS.md backfill (ADM-03, ADM-06, ADM-08)
- [x] 10-03-PLAN.md — Wave 1: AdSlot.tsx + Privacy.tsx + .env.example new files (ADM-02, ADM-06)
- [x] 10-04-PLAN.md — Wave 1: Sovrn signal head-script dual-file sync in client/index.html + public/index.html (ADM-04, ADM-08) — **DEFERRED branch** executed (client/.env absent; head injection skipped; ADM-08 stays unchecked; re-run after plan 10-01)
- [x] 10-05-PLAN.md — Wave 2: App.tsx integration — imports, path conditional, AdSlot+label+footer link (ADM-05, ADM-06, ADM-09)
- [x] 10-06-PLAN.md — Minimal-scope build and local regression verification; production deploy/manual UAT intentionally not run (ADM-01..09)

**Reference:** `.planning/research/ad-networks-vs-adsense.md` — §6 AdSlot.tsx, §9 copy-paste snippets (ads.txt, index.html, App.tsx patch, .env.example), §10 AdSense reapply checklist, §13 open questions for planner.

**Requirements detail:**
- ADM-01: Minimal Adsterra banner-only path selected; real publisher dashboard setup remains external before enabling a live key
- ADM-02: `<AdSlot>` React component (Mantine v6 + CSS-vars + min-height reservation) rendering banner without layout shift (CLS <0.1)
- ADM-03: `public/ads.txt` served with current AdSense record; Adsterra intentionally omitted because this integration does not require an ads.txt entry, Sovrn deferred
- ADM-04: Adsterra invoke loader wired in the `AdSlot` component with empty-key fallback; no head script or CSP regression introduced
- ADM-05: First banner placement at bottom of page, dark-mode friendly, "Advertisement" label visible per FTC
- ADM-06: Privacy/Iubenda route removed from selected minimal scope; sitemap and robots remain valid for current routes
- ADM-07: Media.net submission deferred/removed from selected minimal scope
- ADM-08: Sovrn Commerce deferred due business-account requirement; no broken placeholder script ships
- ADM-09: All download flows, settings, and API calls function identically — no functional regressions


### Phase 11: Dependabot Security Check + Full Website Regression

**Goal:** Resolve the 11 currently open GitHub Dependabot alerts across root, `web-version`, and `web-version/client` while preserving all website behavior: search, playlist loading, individual song selection, ZIP download, settings, support UI, ad UI, static SEO files, and deploy/build flows.
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06, SEC-07, SEC-08, SEC-09
**Depends on:** Phase 10
**Plans:** 5/5 plans complete

Plans:
- [x] 11-01-PLAN.md - Baseline and root lockfile patch: confirm GitHub Dependabot alert state, patch `package-lock.json` `basic-ftp` alert #75 to `>=5.3.0`, run root audit/build smoke checks (SEC-01, SEC-02, SEC-07)
- [x] 11-02-PLAN.md - Web server upload dependency patch: upgrade/adapt `web-version` `multer` alerts #23, #24, #25, #27 to `>=2.0.2`, preserve upload/download behavior (SEC-03, SEC-08)
- [x] 11-03-PLAN.md - Web server middleware transitive patch: resolve `web-version` `qs` #29 to `>=6.14.1` and `on-headers` #28 to `>=1.1.0` via parent updates or minimal overrides, preserve Express/session/header behavior (SEC-04, SEC-05, SEC-08)
- [x] 11-04-PLAN.md - Client toolchain patch: update `web-version/client` Vite alerts #2, #20, #21, #22 to `>=6.4.1`, keep TypeScript/Vite build and generated site assets working (SEC-06, SEC-07)
- [x] 11-05-PLAN.md - End-to-end security closure: run all audits, builds, deploy-equivalent checks, GitHub alert verification, and manual website regression before closing the phase (SEC-01..SEC-09)

**Reference:** `.planning/phases/11-security-check-review-dependabot-alerts-and-address-each-ale/DEPENDABOT-ALERTS.md` - GitHub CLI alert snapshot and sub-phase mapping.

**Requirements detail:**
- SEC-01: Open Dependabot alert baseline captured with GitHub CLI before changes and rechecked after changes.
- SEC-02: Root `package-lock.json` resolves `basic-ftp` alert #75 (`GHSA-rp42-5vxx-qpwr`, CVE-2026-41324) with `basic-ftp >=5.3.0`.
- SEC-03: `web-version/package-lock.json` resolves `multer` alerts #23, #24, #25, #27 by upgrading/adapting to `multer >=2.0.2`.
- SEC-04: `web-version/package-lock.json` resolves `qs` alert #29 (`GHSA-6rw7-vpxm-498p`, CVE-2025-15284) with `qs >=6.14.1`.
- SEC-05: `web-version/package-lock.json` resolves `on-headers` alert #28 (`GHSA-76c9-3jph-rj3q`, CVE-2025-7339) with `on-headers >=1.1.0`.
- SEC-06: `web-version/client/package-lock.json` resolves Vite alerts #2, #20, #21, #22 with `vite >=6.4.1`.
- SEC-07: Root, `web-version`, and `web-version/client` audit/build checks pass; generated public assets are rebuilt only when required.
- SEC-08: Website behavior remains intact across search, playlist fetch, song selection, ZIP download, settings, support UI, ad UI, static SEO files, and deployment path.
- SEC-09: GitHub Dependabot alert state is verified after patching; any scanner lag is documented with local audit evidence.
