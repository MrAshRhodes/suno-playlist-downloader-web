---
phase: 16-seo-hygiene
plan: "01"
subsystem: seo
tags: [webp, structured-data, sitemap, privacy, json-ld, core-web-vitals]
dependency_graph:
  requires: []
  provides: [hero-banner.webp, privacy.html, faqpage-schema, sitemap-v2]
  affects: [client/src/App.tsx, client/index.html, public/index.html, public/sitemap.xml]
tech_stack:
  added: [cwebp]
  patterns: [FAQPage JSON-LD, WebApplication JSON-LD, WebP image import]
key_files:
  created:
    - client/src/assets/hero-banner.webp
    - public/privacy.html
  modified:
    - client/src/App.tsx
    - client/index.html
    - public/index.html
    - public/sitemap.xml
  deleted:
    - client/src/assets/hero-banner.png
decisions:
  - "WebP at q=80 produced 124KB output (under 150KB threshold) — no quality reduction needed"
  - "FAQPage JSON-LD injected into both client/index.html and public/index.html separately since build.sh skips Vite when public/index.html exists"
  - "Privacy page created as static HTML in public/ — served directly by Express static middleware, bypasses SPA catch-all"
metrics:
  duration: "5min"
  completed: "2026-05-13"
  tasks: 4
  files: 6
---

# Phase 16 Plan 01: SEO Hygiene Summary

Four targeted SEO improvements — WebP hero conversion, static privacy page, sitemap extension, and FAQPage JSON-LD structured data in both HTML entry points.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Convert hero banner to WebP (SEO-02) | bbec900 | hero-banner.webp, App.tsx, hero-banner.png (deleted) |
| 2 | Add privacy page and sitemap entry (SEO-03) | 167b7a9 | public/privacy.html, public/sitemap.xml |
| 3 | Inject FAQPage JSON-LD into both HTML files (SEO-04) | 70935dc | client/index.html, public/index.html |
| 4 | Regression verification (SEO-01) | n/a — verification only | — |

## Verification Results

| Check | Result |
|-------|--------|
| hero-banner.webp size | 124,350 bytes (~121KB) — PASS |
| hero-banner.png deleted | PASS |
| App.tsx imports .webp | PASS |
| canonical in client/index.html | PASS |
| canonical in public/index.html | PASS |
| FAQPage count client/index.html | 1 — PASS |
| FAQPage count public/index.html | 1 — PASS |
| sitemap <loc> entries | 2 (/ and /privacy.html) — PASS |
| public/privacy.html exists | PASS (1.9KB) |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — no new network endpoints, auth paths, or file access patterns introduced. Privacy page is static HTML served by existing Express static middleware.

## Self-Check: PASSED

- `client/src/assets/hero-banner.webp` — FOUND
- `public/privacy.html` — FOUND
- `public/sitemap.xml` updated with /privacy.html — FOUND
- `client/index.html` FAQPage count = 1 — FOUND
- `public/index.html` FAQPage count = 1 — FOUND
- Commit bbec900 — FOUND
- Commit 167b7a9 — FOUND
- Commit 70935dc — FOUND
