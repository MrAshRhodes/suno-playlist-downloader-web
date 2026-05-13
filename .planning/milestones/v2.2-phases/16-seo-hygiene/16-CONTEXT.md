# Phase 16: SEO Hygiene - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

SEO-only changes: canonical tag (already present), hero banner WebP via nanobanana, sitemap + static privacy.html, and FAQPage JSON-LD schema. All changes confined to `client/src/`, `client/index.html`, and `public/`. No functional code changes.

**SEO-01 pre-verified:** `<link rel="canonical" href="https://sunozip.com/" />` already exists in `client/index.html:8`. No work needed — regression protect in build is the only concern.

</domain>

<decisions>
## Implementation Decisions

### Hero Banner (SEO-02)
- **D-01:** Generate a new hero banner using nanobanana MCP at orchestrator level (not subagent — nanobanana MCP doesn't propagate to subagents).
- **D-02:** Aesthetic: music-focused reimagining — dark neon palette (purple/teal/cyan), sound waves, equalizer bars, audio spectrum. Dark background.
- **D-03:** Target dimensions: 1920×600px. Wide cinematic strip matching the hero banner aspect ratio. CSS uses `object-fit: cover` so this works.
- **D-04:** Nanobanana outputs PNG → convert to WebP with `cwebp -q 80`. Target <150KB.
- **D-05:** Straight swap: save as `client/src/assets/hero-banner.webp`. Update import in `App.tsx:9` from `./assets/hero-banner.png` → `./assets/hero-banner.webp`. No `<picture>` fallback needed (WebP >97% global support).
- **D-06:** Delete original `client/src/assets/hero-banner.png` after conversion. No confusion, no accidental Vite bundling of old PNG.
- **D-07:** The built PNG in `public/assets/hero-banner-pO09Fwl-.png` (2.4MB) will be replaced by the Vite-hashed WebP on next build.

### Privacy Page + Sitemap (SEO-03)
- **D-08:** Create `public/privacy.html` as a static file served directly by Express. Express `app.use(express.static(...))` already serves `public/` — no server.js changes needed.
- **D-09:** Privacy policy content: "no data collected" framing. App collects no PII — no user accounts, no tracking. Session state is temporary (download session only). Include disclosure of Google AdSense (third-party ads) and Google Fonts (external font load). Keep it simple.
- **D-10:** Add `/privacy` to `public/sitemap.xml` with a static `lastmod` date. Set `changefreq` to `yearly`, `priority` to `0.3`.
- **D-11:** Sitemap lastmod strategy: static hardcoded dates, manually bumped only when content actually changes. `deploy-safe.sh` does NOT touch sitemap. No automation.

### FAQPage JSON-LD (SEO-04)
- **D-12:** Add a second `<script type="application/ld+json">` block in `client/index.html` with `@type: "FAQPage"`. Keep existing `WebApplication` block — add alongside, not replace.
- **D-13:** 5 Q&A pairs (all approved):
  1. Q: "How do I download songs from Suno?" / A: "Paste your Suno playlist URL or @username into SunoZip.com and click Download. Your songs are packaged into a ZIP archive of MP3 files and downloaded to your device — no account required."
  2. Q: "Can I download a Suno playlist as MP3?" / A: "Yes. SunoZip downloads all songs from a Suno playlist as MP3 files in a single ZIP archive, with embedded ID3 metadata including title, track number, and cover art."
  3. Q: "Is SunoZip free to use?" / A: "Yes, SunoZip is completely free. No account, no signup, and no limits on playlist size."
  4. Q: "Does the download include cover art and song metadata?" / A: "Yes. Each MP3 includes embedded ID3 tags — song title, track number, and album cover art — so your music player displays everything correctly."
  5. Q: "Can I download songs from a Suno @username profile?" / A: "Yes. Paste the @username or the full suno.com/@username URL into SunoZip and all public songs from that profile will be fetched and packaged for download."

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §SEO Hygiene — SEO-01 through SEO-04 define exact success criteria

### Files to modify
- `client/index.html` — add FAQPage JSON-LD block (canonical already present at line 8)
- `client/src/App.tsx:9` — update hero import from `.png` → `.webp`
- `client/src/assets/hero-banner.png` — delete after WebP generated
- `public/sitemap.xml` — add /privacy entry
- `public/privacy.html` — new static file to create

### Files to read before touching
- `client/src/App.tsx` — understand hero-banner usage (lines 9, 185-187)
- `client/src/App.css` — `.hero-banner-img` styles (confirm no CSS references to PNG extension)
- `public/index.html` — production copy of index.html (kept in sync with `client/index.html` via build)
- `server.js` — confirms `public/` is served statically; `privacy.html` will be reachable at `/privacy.html` (Express static) and `/privacy` via the SPA catch-all serving `index.html` — create as `privacy.html` and add explicit route OR just rely on static serving

### Tooling
- `cwebp` available at `/opt/homebrew/bin/cwebp` — use `cwebp -q 80 input.png -o output.webp`
- nanobanana MCP (`mcp__nanobanana-vertex-mcp__generate_image`) — call at orchestrator level only

</canonical_refs>

<code_context>
## Existing Code Insights

### Hero banner import chain
- Source: `client/src/assets/hero-banner.png` (2.4MB) — imported in `App.tsx:9`
- Build output: `public/assets/hero-banner-pO09Fwl-.png` — Vite adds content hash
- After swap: `client/src/assets/hero-banner.webp` → builds to `public/assets/hero-banner-[hash].webp`

### Sitemap current state
- `public/sitemap.xml` — exists, only has `https://sunozip.com/` with `lastmod: 2026-04-14`
- `public/robots.txt` — already references `Sitemap: https://sunozip.com/sitemap.xml`

### Static file serving
- `server.js` uses `app.use(express.static(staticPath))` where `staticPath` = `public/`
- `public/privacy.html` will be automatically served at `/privacy.html`
- Server catch-all `app.get('*')` serves `index.html` for all unmatched routes — `/privacy` (without .html) will serve SPA, not the privacy page. Add explicit route in server.js OR use `public/privacy.html` and link to `/privacy.html` in sitemap.

### Index.html JSON-LD
- Existing `WebApplication` JSON-LD block at lines 28-43 in `client/index.html`
- New `FAQPage` block goes after it, as a second `<script type="application/ld+json">` tag

### Canonical tag
- Already present at `client/index.html:8` — SEO-01 complete, no changes needed

</code_context>

<specifics>
## Specific Ideas

- Privacy page URL in sitemap: `https://sunozip.com/privacy.html` (static file path) unless server.js gets a `/privacy` route added
- nanobanana prompt direction: "AI-generated music visualization, dark neon background, sound waves and equalizer bars, audio spectrum, purple teal cyan glow, dark atmospheric, cinematic wide banner"
- FAQPage answers use "SunoZip" as the brand name (consistent with og:site_name and page title)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 16-seo-hygiene*
*Context gathered: 2026-05-13*
