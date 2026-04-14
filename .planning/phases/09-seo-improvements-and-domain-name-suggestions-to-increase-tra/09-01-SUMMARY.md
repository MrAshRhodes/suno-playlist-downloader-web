---
phase: 09-seo-improvements-and-domain-name-suggestions-to-increase-tra
plan: 01
subsystem: seo
tags: [og-tags, twitter-card, json-ld, robots-txt, sitemap-xml, canonical, meta-tags, structured-data]

# Dependency graph
requires:
  - phase: 06.1-match-site-styling-to-the-new-modern-vector-neon-hero-banner
    provides: Hero banner visual design used as OG card reference
provides:
  - SEO meta tags in client/index.html (Vite source) and public/index.html (deployed)
  - Open Graph tags for social media rich preview cards
  - Twitter Card tags for Twitter/X sharing
  - JSON-LD WebApplication structured data for Google rich results
  - Canonical URL for search engine indexing
  - robots.txt with /api/ disallow and sitemap reference
  - sitemap.xml with root URL
  - OG card image (1200x630) wired into Vite build pipeline
affects: [09-02-domain-research]

# Tech tracking
tech-stack:
  added: []
  patterns: [dual-file HTML sync (client/index.html + public/index.html), Vite public/ static asset pipeline for deploy survival]

key-files:
  created:
    - public/robots.txt
    - public/sitemap.xml
    - client/public/assets/og-card.png
  modified:
    - client/index.html
    - public/index.html
    - public/assets/og-card.png

key-decisions:
  - "Generated OG card via ImageMagick gradient -- nanobanana was available but ImageMagick matched existing Phase 7 pattern"
  - "Disallowed /api/ in robots.txt per threat model T-09-01 -- prevents crawler exposure of internal API routes"
  - "Used WebApplication (not SoftwareApplication) for JSON-LD -- more specific schema for browser-based tools"

patterns-established:
  - "OG image in client/public/assets/ survives deploy.sh via Vite copy pipeline"
  - "robots.txt and sitemap.xml at public/ root persist across deploys (not in assets/)"

requirements-completed: [D-01, D-02, D-03, D-04, D-06, D-07, D-08, D-09, D-10, D-11]

# Metrics
duration: 2min
completed: 2026-04-14
---

# Phase 9 Plan 1: SEO Infrastructure Summary

**Full SEO head with OG/Twitter/JSON-LD tags, canonical URL, robots.txt, sitemap.xml, and 1200x630 OG card image wired through Vite build pipeline**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-14T13:53:01Z
- **Completed:** 2026-04-14T13:55:49Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- SEO-optimized title and description with keywords (Suno, MP3, ID3, ZIP, cover art)
- 9 Open Graph tags + 5 Twitter Card tags for rich social media previews
- JSON-LD WebApplication structured data with free pricing for Google rich results
- robots.txt allowing all crawlers, blocking /api/, referencing sitemap
- sitemap.xml listing root URL for search engine discovery
- OG card image (1200x630) surviving full deploy.sh cycle via Vite pipeline

## Task Commits

Each task was committed atomically:

1. **Task 1: Add SEO meta tags, OG tags, Twitter Cards, JSON-LD, and canonical** - `e2b2de3` (feat)
2. **Task 2: Create robots.txt, sitemap.xml, wire OG image into Vite pipeline** - `1ba95eb` (feat)

## Files Created/Modified
- `client/index.html` - Added SEO title, meta description, canonical, OG tags, Twitter Card tags, JSON-LD structured data
- `public/index.html` - Same SEO tags applied to deployed HTML (preserving Vite-injected asset refs)
- `client/public/assets/og-card.png` - 1200x630 OG card image in Vite source pipeline
- `public/assets/og-card.png` - OG card image in deployed output (survives deploy.sh)
- `public/robots.txt` - Crawler directives with /api/ disallow and sitemap reference
- `public/sitemap.xml` - Single-URL sitemap for SPA root

## Decisions Made
- Used ImageMagick gradient for OG card image (consistent with Phase 7 donation banner approach)
- WebApplication subtype for JSON-LD (more specific than SoftwareApplication for browser tools)
- Disallowed /api/ in robots.txt per threat model T-09-01 (prevents crawler exposure of internal routes)
- No AI crawler blocking (GPTBot) -- kept robots.txt minimal per discretion

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Generated OG card image (not pre-existing from orchestrator)**
- **Found during:** Pre-Task 1 setup
- **Issue:** Plan expected orchestrator to have generated public/assets/og-card.png via nanobanana -- file did not exist
- **Fix:** Generated 1200x630 OG card image using ImageMagick with Monolith design palette (#0A0A0A bg, #3B4A6B accent, white text)
- **Files created:** client/public/assets/og-card.png
- **Verification:** `magick identify` confirms 1200x630 PNG, deploy survival test passes
- **Committed in:** e2b2de3 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for OG image tags to resolve. No scope creep.

## Issues Encountered
None -- plan executed as specified after resolving the missing OG image.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- SEO infrastructure complete, ready for Plan 2 (domain name research and suggestions)
- All absolute URLs use suno-playlist-downloader.replit.app -- will need updating if custom domain is purchased
- Deploy survival verified: og-card.png, robots.txt, sitemap.xml all persist through deploy.sh

---
*Phase: 09-seo-improvements-and-domain-name-suggestions-to-increase-tra*
*Completed: 2026-04-14*
