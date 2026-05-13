# Phase 16: SEO Hygiene - Research

**Researched:** 2026-05-13
**Domain:** SEO — static file generation, JSON-LD schema, WebP conversion, sitemap
**Confidence:** HIGH

## Summary

All four SEO tasks are directly implementable as stated in CONTEXT.md. Every file was verified on disk. The canonical tag at `client/index.html:9` is already present. The hero banner PNG exists at 2.4MB and is the only reference to `hero-banner.png` in source. The cwebp binary is installed at `/opt/homebrew/bin/cwebp` v1.6.0. The `public/sitemap.xml` has one URL entry and needs a `/privacy.html` addition. `public/privacy.html` does not yet exist. The FAQPage JSON-LD block insertion point is line 44 in `client/index.html` (after the closing `</script>` of the existing WebApplication block at line 43).

**Critical finding:** `public/index.html` is a separate production copy of the HTML file. It is NOT auto-generated from `client/index.html` by Vite — the Vite output (`public/index.html`) uses hashed asset paths. The FAQPage JSON-LD must be added to BOTH `client/index.html` AND `public/index.html` to work in production today, or the build must be re-run after editing `client/index.html`. The privacy page URL in the sitemap must be `https://sunozip.com/privacy.html` — the SPA catch-all in `server.js` serves `index.html` for `/privacy`, making a clean `/privacy` URL serve the SPA, not the static HTML file.

**Primary recommendation:** Edit `client/index.html` for FAQPage JSON-LD, re-run build (`build.sh`) to regenerate `public/index.html`, swap hero PNG to WebP, create `public/privacy.html`, update sitemap.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Generate hero banner via nanobanana MCP at orchestrator level (not subagent).
- **D-02:** Aesthetic: dark neon, purple/teal/cyan, sound waves, equalizer bars, audio spectrum. Dark background.
- **D-03:** Dimensions: 1920x600px.
- **D-04:** nanobanana → PNG → `cwebp -q 80` → WebP. Target <150KB.
- **D-05:** Save as `client/src/assets/hero-banner.webp`. Update `App.tsx:9` import.
- **D-06:** Delete `client/src/assets/hero-banner.png` after conversion.
- **D-07:** Built PNG at `public/assets/hero-banner-pO09Fwl-.png` replaced by Vite-hashed WebP on next build.
- **D-08:** `public/privacy.html` — static file served by Express `express.static`. No server.js changes.
- **D-09:** Privacy content: no data collected framing, disclose Google AdSense and Google Fonts.
- **D-10:** Add `/privacy` to `public/sitemap.xml` — `changefreq: yearly`, `priority: 0.3`.
- **D-11:** Sitemap lastmod: static hardcoded dates, manually bumped only when content changes.
- **D-12:** FAQPage JSON-LD as second `<script type="application/ld+json">` in `client/index.html`. Keep existing WebApplication block.
- **D-13:** 5 approved Q&A pairs (see CONTEXT.md for verbatim text).
- **SEO-01 pre-verified:** Canonical already at `client/index.html:9`. No work needed.

### Claude's Discretion
None specified.

### Deferred Ideas (OUT OF SCOPE)
None.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEO-01 | `client/index.html` contains `<link rel="canonical" href="https://sunozip.com/" />` — verified present and regression-protected | Confirmed at line 9. Present in both `client/index.html` and `public/index.html`. No change needed; include in build regression check. |
| SEO-02 | Hero banner image at `public/assets/hero-banner-*.png` converted to WebP <150KB | Source PNG verified at `client/src/assets/hero-banner.png` (2.4MB). cwebp v1.6.0 available at `/opt/homebrew/bin/cwebp`. Single PNG reference in source at `App.tsx:9`. CSS has no extension-specific reference. Vite hashes output filename. |
| SEO-03 | `public/sitemap.xml` includes `/privacy` page URL; `lastmod` updated only when content changes | Sitemap verified — single entry (sunozip.com/). `public/privacy.html` does not exist yet. URL must be `/privacy.html` (not `/privacy`) due to SPA catch-all routing. |
| SEO-04 | `client/index.html` includes FAQPage JSON-LD with 3-5 Q&A | WebApplication block is lines 27-43. FAQPage block inserts after line 43 (before `<link rel="preconnect"...` at line 44). Must also update `public/index.html` or rebuild. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| FAQPage JSON-LD | Frontend Server (static HTML) | — | Lives in `<head>` of HTML file served to crawlers |
| Hero WebP conversion | Build-time tooling | CDN/Static (public/) | cwebp runs locally; Vite bundles the .webp into public/assets/ |
| Privacy page | CDN/Static (public/) | — | Static HTML served by Express static middleware |
| Sitemap update | CDN/Static (public/) | — | Static XML, updated manually |
| Canonical tag | Frontend Server (static HTML) | — | Already present in `<head>` of both HTML files |

## Verified File State

### `client/index.html` [VERIFIED: disk read]

| Line | Content |
|------|---------|
| 9 | `<link rel="canonical" href="https://sunozip.com/" />` |
| 27–43 | `<script type="application/ld+json">` WebApplication block |
| 44 | `<link rel="preconnect" href="https://fonts.googleapis.com">` ← FAQPage block inserts HERE (between line 43 and 44) |
| 47–48 | AdSense script tag |
| 49 | `</head>` |

The `client/index.html` file is 54 lines total.

### `public/index.html` [VERIFIED: disk read]

A separate production copy of the HTML. Contains the same WebApplication JSON-LD block. Does NOT include hashed asset references in `<head>` meta tags (those are in the JS bundle). Vite adds `<script type="module" crossorigin src="/assets/index-Dcg8g3NJ.js">` and `<link rel="stylesheet" ...>` at the bottom of `<head>`.

**Impact:** FAQPage JSON-LD added to `client/index.html` will appear in `public/index.html` only after `build.sh` is re-run. If deploying without a build, `public/index.html` must be patched directly as well.

### `client/src/App.tsx` [VERIFIED: disk read]

| Line | Content |
|------|---------|
| 9 | `import heroBannerImg from './assets/hero-banner.png';` ← change to `.webp` |
| 185 | `<div className="hero-banner">` |
| 186 | `<img src={heroBannerImg} alt="" className="hero-banner-img" aria-hidden="true" />` |

### `client/src/App.css` [VERIFIED: disk read]

`.hero-banner` (line 246) and `.hero-banner-img` (line 254) CSS rules contain no PNG extension references. Only `object-fit: cover` and `object-position: center` — extension-agnostic. WebP swap is safe.

### `client/src/assets/hero-banner.png` [VERIFIED: disk read]
- Exists at the expected path
- File size: 2.4MB

### `public/sitemap.xml` [VERIFIED: disk read]

Current content has one URL:
```xml
<url>
  <loc>https://sunozip.com/</loc>
  <lastmod>2026-04-14</lastmod>
  <changefreq>monthly</changefreq>
  <priority>1.0</priority>
</url>
```
New entry to add:
```xml
<url>
  <loc>https://sunozip.com/privacy.html</loc>
  <lastmod>2026-05-13</lastmod>
  <changefreq>yearly</changefreq>
  <priority>0.3</priority>
</url>
```

### `public/privacy.html` [VERIFIED: disk read]
Does NOT exist. Must be created.

### `public/assets/` [VERIFIED: disk read]
Contains `hero-banner-pO09Fwl-.png` (2.4MB). After Vite rebuild with `.webp` source, this will be replaced by `hero-banner-[newhash].webp`.

## Tooling

### cwebp [VERIFIED: shell probe]
- Path: `/opt/homebrew/bin/cwebp`
- Version: 1.6.0
- Correct invocation: `cwebp -q 80 input.png -o output.webp`
- Available and ready to use.

### nanobanana [ASSUMED — per CLAUDE.md]
- Must be called at orchestrator level only (MCP does not propagate to subagents).
- Tool: `mcp__nanobanana-vertex-mcp__generate_image`
- Output: PNG, then convert with cwebp.

## Static Serving Analysis [VERIFIED: disk read]

`server.js` uses `express.static(staticPath)` where `staticPath` resolves to `public/`. Key behavior:

1. `express.static` serves `public/privacy.html` at URL `/privacy.html` — no server.js changes needed.
2. Explicit routes defined for `ads.txt`, `robots.txt`, `sitemap.xml` (lines ~130-137) — these are GET route handlers that supplement static serving. `privacy.html` does NOT need an explicit route.
3. **SPA catch-all** `app.get('*', ...)` (at the end of distPath block) serves `index.html` for ALL unmatched routes. This means `/privacy` (no extension) will serve the SPA, not the static privacy page.

**Conclusion:** Use `public/privacy.html` as filename. Reference it as `/privacy.html` everywhere (sitemap, footer links). D-08 is correct — no server.js changes needed.

## Common Pitfalls

### Pitfall 1: public/index.html not updated after client/index.html edit
**What goes wrong:** FAQPage JSON-LD added to `client/index.html` but production serves `public/index.html` (the pre-built copy). Crawlers see the old file.
**Why it happens:** `public/index.html` is the Vite build output, a separate file. Editing `client/index.html` alone is not sufficient for production.
**How to avoid:** After editing `client/index.html`, run `build.sh` to regenerate `public/index.html`, OR manually patch `public/index.html` to match.
**Warning signs:** `public/index.html` does not contain FAQPage block after commit.

### Pitfall 2: Privacy page URL in sitemap uses /privacy without .html
**What goes wrong:** Sitemap lists `https://sunozip.com/privacy` — that URL serves the React SPA (`index.html`), not the privacy page. Google indexes the wrong content.
**Why it happens:** SPA catch-all route in `server.js` intercepts all routes without a matching static file, returning `index.html`.
**How to avoid:** Use `https://sunozip.com/privacy.html` in the sitemap and in any footer links.

### Pitfall 3: Old Vite-hashed PNG still in public/assets after WebP swap
**What goes wrong:** `public/assets/hero-banner-pO09Fwl-.png` (2.4MB) remains after the WebP is built, wasting bandwidth if served from cache.
**Why it happens:** Vite only generates new files on build; old hashed files are not auto-deleted.
**How to avoid:** Delete `public/assets/hero-banner-pO09Fwl-.png` after successful WebP build confirms a new `hero-banner-*.webp` is present.

### Pitfall 4: WebP file size exceeds 150KB target
**What goes wrong:** `cwebp -q 80` applied to a 1920×600 image may still exceed 150KB if the image has complex detail.
**Why it happens:** Quality 80 is not guaranteed to hit a target file size for complex imagery.
**How to avoid:** Check output file size after conversion. If >150KB, reduce quality (`-q 70` or `-q 60`) or reduce dimensions.

### Pitfall 5: Vite does not process .webp imports
**What goes wrong:** Vite might not bundle a `.webp` import correctly.
**How to avoid:** No action needed — Vite handles all static asset imports (PNG, WebP, SVG, etc.) identically via its asset pipeline. The import syntax does not change.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| WebP conversion | Custom canvas/sharp conversion | `cwebp -q 80` (already installed, industry standard) |
| JSON-LD validation | Manual schema inspection | Google Rich Results Test (post-deploy) |
| Sitemap generation | Dynamic server-side generation | Static XML file (sufficient for SPA with stable URLs) |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| cwebp | SEO-02 WebP conversion | Yes | 1.6.0 | — |
| nanobanana MCP | SEO-02 hero generation | Orchestrator-level only | — | Pre-existing PNG if nanobanana unavailable |
| build.sh | Syncing client/index.html → public/index.html | Yes (in repo) | — | Manual copy of JSON-LD block into public/index.html |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected (no jest/vitest/pytest config found) |
| Config file | None |
| Quick run command | Manual inspection |
| Full suite command | Manual inspection |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEQ-01 | Canonical tag present in public/index.html | smoke | `grep -c 'canonical.*sunozip.com' public/index.html` | N/A — shell one-liner |
| SEO-02 | WebP <150KB exists in public/assets | smoke | `ls -la public/assets/hero-banner-*.webp` | N/A — shell one-liner |
| SEO-03 | privacy.html served at /privacy.html | smoke | Manual browser check or `curl -s http://localhost:3000/privacy.html | head -5` | N/A |
| SEO-04 | FAQPage JSON-LD in public/index.html | smoke | `grep -c 'FAQPage' public/index.html` | N/A — shell one-liner |

### Wave 0 Gaps
None — all verification is shell one-liners, no test framework setup needed.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | nanobanana MCP is available at orchestrator level and can generate 1920x600 PNG | Tooling | If unavailable, hero banner generation blocked; fallback is keeping existing PNG |
| A2 | `build.sh` correctly copies/rebuilds `public/index.html` from `client/index.html` | Pitfall 1 | If build.sh does not update public/index.html, FAQPage JSON-LD won't be in production |

## Sources

### Primary (HIGH confidence)
- Disk read: `client/index.html` — exact line numbers verified
- Disk read: `public/index.html` — confirmed as separate file from client version
- Disk read: `client/src/App.tsx` — import at line 9, usage at lines 185-186
- Disk read: `client/src/App.css` — `.hero-banner-img` has no PNG extension reference
- Disk read: `public/sitemap.xml` — single URL entry confirmed
- Disk read: `server.js` — static serving via `express.static('public/')`, SPA catch-all confirmed
- Shell probe: `which cwebp` + `cwebp -version` — v1.6.0 at `/opt/homebrew/bin/cwebp`
- Shell probe: `ls public/privacy.html` — confirmed NOT present
- Shell probe: `ls client/src/assets/hero-banner.png` — confirmed present at 2.4MB

### Secondary (MEDIUM confidence)
- CONTEXT.md D-08: Express `express.static` serves `public/` — confirmed in server.js [VERIFIED]
- CONTEXT.md D-05: `.webp` import works in Vite — standard Vite asset handling [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tools verified on disk
- Architecture: HIGH — server.js routing behavior confirmed by reading code
- Pitfalls: HIGH — derived from actual file content and routing logic

**Research date:** 2026-05-13
**Valid until:** 2026-06-13 (stable domain)
