---
id: SEED-003
status: dormant
planted: 2026-05-12
planted_during: v2.1 UX & Discovery
trigger_when: v2.2 milestone planning
scope: Small
---

# SEED-003: SEO optimization to expand reach

## Why This Matters

Phase 9 laid the foundation (OG tags, Twitter cards, JSON-LD WebApplication schema, sitemap, robots.txt). The next layer — keyword targeting, content signals, and technical SEO hygiene — could meaningfully grow organic traffic from Suno users searching for download tools.

Current gaps:
- Sitemap has only 1 URL (homepage). Privacy page, any future pages not listed.
- `lastmod` in sitemap is hardcoded to `2026-04-14` — stale on every deploy.
- No canonical tag — potential duplicate content if Replit URL and sunozip.com both indexed.
- Page title is generic — "Suno Playlist Downloader — Download Suno Music as MP3". Could target higher-intent keywords.
- No FAQ schema (common for tool pages, boosts rich results).
- Core Web Vitals: hero banner PNG is 2.4MB — likely hurts LCP score.
- No Google Search Console submission or sitemap ping on deploy.

## When to Surface

**Trigger:** v2.2 milestone planning.

Also surface if:
- sunozip.com domain is purchased (canonical tag becomes critical)
- Analytics show high bounce rate or low click-through from search
- Core Web Vitals score drops below threshold in Search Console

## Scope Estimate

**Small** — a focused phase. Likely 4–6 tasks:

1. Fix sitemap: add `/privacy` URL, auto-update `lastmod` on build
2. Add `<link rel="canonical">` pointing to `https://sunozip.com/`
3. Compress hero-banner.png (2.4MB → target <200KB via WebP or ImageMagick optimize) — direct LCP win
4. Add FAQ JSON-LD schema (3–5 Q&A about the tool, targets featured snippet)
5. Refine page title and H1 for target keywords ("download suno songs", "suno playlist to mp3")
6. Submit sitemap to Google Search Console (manual step, document in PLAN)

## Breadcrumbs

- `client/index.html` — all meta tags, OG, Twitter, JSON-LD schema (WebApplication + Offer)
- `public/sitemap.xml` — 1 URL, hardcoded lastmod
- `public/robots.txt` — `Disallow: /api/` (correct), points to sitemap
- `public/assets/hero-banner-pO09Fwl-.png` — 2,482 KB (uncompressed) — primary LCP bottleneck
- `client/src/pages/Privacy.tsx` — privacy page not in sitemap
- Phase 9 decisions: `sunozip.com` recommended domain, `WebApplication` JSON-LD type chosen over `SoftwareApplication`
- `.planning/research/ARCHITECTURE.md` — Phase 9 research artifacts

## Notes

sunozip.com is still unconfirmed purchased (noted in STATE.md pending todos). Canonical tag should be added regardless — if both sunozip.com and the Replit URL are live, Google needs a canonical signal to avoid splitting PageRank.

Hero banner compression is the highest-impact quick win — a 2.4MB PNG on the above-the-fold hero directly degrades LCP, which is a Core Web Vitals ranking factor.
