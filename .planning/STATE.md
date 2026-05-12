---
gsd_state_version: 1.0
milestone: v2.1
milestone_name: UX & Discovery
status: planning
last_updated: "2026-05-12T09:51:08.883Z"
last_activity: 2026-05-12
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-12)

**Core value:** Visual modernization only — every download flow, setting, and API call unchanged
**Current focus:** Phase 11 — Dependabot Security Check + Full Website Regression

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-05-12 — Milestone v2.1 started

## Performance Metrics

**Velocity:**

- Total plans completed: 24
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2 | - | - |
| 03 | 2 | - | - |
| 07 | 2 | - | - |
| 05 | 0 | - | - |
| 04 | 1 | - | - |
| 06.1 | 1 | - | - |
| 08 | 2 | - | - |
| 09 | 2 | - | - |
| 10 | 6 | - | - |
| 11 | 5 | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01 P01 | 2min | 2 tasks | 4 files |
| Phase 01 P02 | 3min | 3 tasks | 3 files |
| Phase 03 P01 | 5 | 2 tasks | 3 files |
| Phase 07 P01 | 5min | 2 tasks | 2 files |
| Phase 06 P01 | 10 | 2 tasks | 2 files |
| Phase 08 P01 | 5 | 1 tasks | 2 files |
| Phase 08 P02 | 2min | 2 tasks | 5 files |
| Phase 09 P01 | 2min | 2 tasks | 6 files |
| Phase 09 P02 | 5min | 1 tasks | 1 files |
| Phase 10 P02 | 3min | 3 tasks | 3 files |
| Phase 10 P03 | 3min | 3 tasks | 3 files |
| Phase 10 P04 | 1min | 1 tasks | 1 files | (DEFERRED branch — Sovrn head injection skipped, only SUMMARY created)
| Phase 10 P05 | 3min | 1 tasks | 1 files |
| Phase 11 P01 | 5min | 3 tasks | 2 files |
| Phase 11 P02 | 3min | 2 tasks | 3 files |
| Phase 11 P03 | 5min | 3 tasks | 2 files |
| Phase 11 P05 | 25min | 6 tasks | 8 files |

## Accumulated Context

### Decisions

- v1.0: CSS variable extraction approach rejected — invisible refactoring with no visible improvement
- v1.0: Direct visual overhaul committed (766c401) — dark-first palette, support banner, classList theme toggle
- v2.0: Monolith design system adopted — brutalist-minimalist, proven in weather app project
- v2.0: 3 phases chosen (not 6) — fewer, meatier phases, every phase delivers visible results
- v2.0: Mantine v6 body bg override needs !important to beat framework injection
- [Phase 01]: Removed glass-morphism CSS variables -- Monolith uses solid surfaces, App.css refs gracefully degrade until Plan 02
- [Phase 01]: Removed inline body styles and repaint hack -- theme transitions now purely CSS-driven
- [Phase 01]: Used fallback accent-colored icon logo -- nanobanana MCP unavailable in environment
- [Phase 01]: All glass-morphism artifacts removed from App.css -- Monolith solid-surface system complete
- [Phase 01]: Mantine v6 overrides via data-variant CSS selectors with !important -- proven pattern
- [Phase 03]: Define --progress-glow in both theme blocks -- variable already referenced in App.css but silently unresolved
- [Phase 03]: Mantine Loader accent override via SVG stroke property -- Mantine v6 renders stroke as inline SVG attribute not CSS color
- [Phase 03]: Dark-mode --text-muted raised to rgba(255,255,255,0.50) — 5.37:1 exceeds AA 4.5:1 minimum
- [Phase 03]: Firefox scrollbar-color/scrollbar-width added before webkit block, reusing --scrollbar-thumb variable
- [Phase 07]: Used ImageMagick gradient for donation banner -- nanobanana MCP unavailable in executor tool set
- [Phase 07]: DonationModal uses body/header styles keys (not content) -- verified from SimpleSettingsModal.tsx Mantine v6 pattern
- [Phase 06]: Hero text hardcoded white (not var(--text-primary)) — renders over dark image in both themes
- [Phase 06]: Step numbers use solid var(--accent) background, no gradients per D-04
- [Phase 06]: ThemeToggle moved into hero-actions (absolute top-right inside hero banner)
- [Phase 08]: Removed multer entirely -- unused dep with HIGH CVEs is pure attack surface
- [Phase 08]: npm audit fix --force used to bump transitive deps past semver-major for path-to-regexp, lodash, minimatch, picomatch, qs
- [Phase 08]: vite upgraded to 8.x (latest) not 6.x as planned -- npm install pulled 8.0.8, all CVEs resolved, build passes, no config changes required
- [Phase 08]: All 21 Dependabot alerts dismissed via gh api with fix_started -- packages confirmed patched in installed versions before dismissal
- [Phase 09]: Generated OG card via ImageMagick gradient -- nanobanana available but ImageMagick matched existing Phase 7 pattern
- [Phase 09]: WebApplication (not SoftwareApplication) for JSON-LD -- more specific for browser-based tools
- [Phase 09]: Disallowed /api/ in robots.txt per threat model T-09-01 -- prevents crawler exposure of internal API routes
- [Phase 09]: sunozip.com recommended as top domain -- perfect suno+zip keyword match, .com trust, 8 chars
- [Phase 09]: Triple-check methodology for .app TLD availability: whois + RDAP + DNS NXDOMAIN
- [Phase 10]: Use placeholder publisher IDs in ads.txt while plan 10-01 deferred — wave-0 directive overrides plan's strict regex verifier
- [Phase 10]: Sovrn cert hash fafdf38b16bf6b2b is literal constant per RESEARCH §9.1 (not substituted)
- [Phase 10]: Sitemap legal-page convention — changefreq=yearly, priority=0.3 for /privacy
- [Phase 10]: REQUIREMENTS.md Coverage incremented 27 → 36 with 9 ADM-* backfill rows
- [Phase 10]: AdSlot empty-key path = silent no-op (no console.warn) — Q4 resolved overrides RESEARCH §13 per Phase 4 D-09 graceful degradation
- [Phase 10]: Privacy.tsx ships with literal {IUBENDA_POLICY_ID} placeholder + TODO comment — Wave 0 deferred; pre-deploy gate (10-06) blocks substitution
- [Phase 10]: Component-scoped third-party script injection (Adsterra invoke.js into AdSlot ref, Iubenda script appended to document.body inside Privacy useEffect) — keeps cookies/tracking off home flow
- [Phase 10]: Adsterra wrapper is plain <div> not Mantine <Card> — Card elevated bg fights iframe transparency
- [Phase 10]: New client/src/pages/ directory created for route-level components — App.tsx will use path-conditional render in plan 10-05 (no react-router-dom dep)
- [Phase 10]: Plan 10-04 executed DEFERRED branch — client/.env absent, Sovrn head injection skipped to avoid emitting a malformed `?iid={...}` URL on every page load. ADM-08 stays unchecked. Re-run 10-04 after plan 10-01 substitutes real VITE_SOVRN_SITE_ID.
- [Phase 10]: server.js Helmet/CSP audit confirmed zero matches — when Sovrn re-runs, no CSP regression risk for `ad.lijit.com` or `highperformanceformat.com`
- [Phase 10]: Path-based conditional render in App.tsx chosen over react-router-dom — saves ~50KB dep, two routes only, full reload on /privacy preferred for fresh Iubenda widget context
- [Phase 10]: Advertisement label uses width: 728 + auto margins to center over 728px slot (not parent 1100px wrapper); marginBottom: -16 tightens vertical rhythm against AdSlot's margin: '32px auto'
- [Phase 10]: AdSlot empty-key fallback via ?? '' in App.tsx — TypeScript-safe; AdSlot's internal `if (!adKey) return` guard handles silent no-op
- [Phase ?]: npm audit fix resolved basic-ftp without overrides — lockfile-only change satisfies SEC-02
- [Phase ?]: multer-unused-web-version: Confirmed zero usage via grep — removed instead of upgraded, closes alerts #23,#24,#25,#27
- [Phase ?]: Phase 11-03: npm overrides for qs (>=6.14.1) and on-headers (>=1.1.0) — no parent bumps per D-01, resolves SEC-04 and SEC-05
- [Phase 11]: uuid v14 ships own types — @types/uuid removed from both client trees — uuid v14 includes TypeScript types; @types/uuid conflicts
- [Phase 11]: deploy.sh bypassed during security closure to prevent unauthorized git push — deploy.sh ends with git push; manual copy used instead

### Pending Todos

- Download music by username as well as playlist (area: api)

### Roadmap Evolution

- Phase 4 added: Add Google Ads to the bottom of the site
- Phase 5 added: Download Support Popup — buymeacoffee.com/focused link on ZIP download
- Phase 6 added: Premium title banner and modern step cards
- Phase 8 added: Using the GitHub CLI, check dependabot alerts and resolve security issues
- Phase 9 added: SEO improvements and domain name suggestions to increase traffic usage and donations
- Phase 6.1 inserted after Phase 6: Match site styling to new modern vector/neon hero banner (URGENT)
- Phase 10 added: Replace blocked AdSense with Adsterra banner-only + parallel Media.net submission (research at .planning/research/ad-networks-vs-adsense.md)
- Phase 11 added: Dependabot security check and full website regression for 11 open GitHub alerts across root, web-version, and web-version/client

### Blockers/Concerns

- Codebase diverges from live Replit version (some features on live not in repo)

## Session Continuity

Last session: 2026-05-02T12:16:24.001Z
Stopped at: Phase 11 planning complete — 5 plans ready
Resume file: None
