# Phase 9: SEO & Domain - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Improve search engine visibility through meta tags, OG social cards, technical SEO (robots.txt, sitemap, JSON-LD, canonical), and optimized copy. Research and suggest 5-10 custom domain names. Generate OG card image using nanobanana MCP.

</domain>

<decisions>
## Implementation Decisions

### Meta Tags & OG Social Cards
- **D-01:** Add comprehensive Open Graph tags (og:title, og:description, og:image, og:url, og:type) and Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image) to index.html.
- **D-02:** Generate OG card image (1200x630px) using nanobanana MCP — hero banner style matching the neon navy/purple site aesthetic with title + tagline overlay. Save to public/assets/.
- **D-03:** Optimize the `<title>` tag with keywords — e.g. "Suno Playlist Downloader — Download Suno Music as MP3 with ID3 Tags".
- **D-04:** Rewrite `<meta description>` with SEO-rich copy — include key features (playlist download, ZIP, MP3, ID3 metadata, cover art).

### Domain Name Strategy
- **D-05:** Research and suggest 5-10 domain name options with availability check. Include .com, .io, .app TLDs. Rank by memorability, keyword relevance, and availability. User picks later — this phase just delivers the list.

### Technical SEO
- **D-06:** Create `robots.txt` — allow all crawlers, point to sitemap.xml.
- **D-07:** Create `sitemap.xml` — single-page app so just the root URL with lastmod date.
- **D-08:** Add JSON-LD structured data (SoftwareApplication schema) — name, description, applicationCategory, operatingSystem, offers (free).
- **D-09:** Add canonical URL `<link rel="canonical">` and `<html lang="en">` (already has lang="en").

### Content & Copy
- **D-10:** Optimize existing meta title and description for search keywords. No visible UI copy changes — keep the app-first experience.

### Image Generation
- **D-11:** Use nanobanana MCP (same technique as hero banner and donation modal banner) for the OG card image. Orchestrator generates at top level since MCP tools don't propagate to subagents.

### Claude's Discretion
- Exact keyword phrasing in meta title/description
- JSON-LD field values beyond the specified ones
- robots.txt crawl-delay or specific disallow rules
- Domain name research methodology and ranking criteria

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

### Key files to check during implementation
- `client/src/index.html` — Source HTML template (Vite injects assets at build time)
- `public/index.html` — Built output served by Replit
- `server.js` — Express static file serving config (needs to serve robots.txt and sitemap.xml)
- `deploy.sh` — Must rebuild public/ after any client changes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `public/assets/hero-banner-6cf9ad85.png` — Hero banner image, same aesthetic for OG card
- nanobanana MCP — used in Phase 6 (hero banner) and Phase 7 (donation banner) for image generation

### Established Patterns
- Static assets served from `public/` via Express in server.js
- Vite builds from `client/src/index.html` → `client/dist/` → copied to `public/`
- AdSense script already in index.html head

### Integration Points
- `client/src/index.html` — meta tags go here (source of truth)
- `server.js` — may need route for robots.txt/sitemap.xml if not served as static files
- `public/` — robots.txt and sitemap.xml go here as static files

</code_context>

<specifics>
## Specific Ideas

- OG card image should use the neon navy/purple/cyan palette with "Suno Playlist Downloader" title and a short tagline
- Domain suggestions should consider SEO value (keyword in domain) and brandability
- JSON-LD should mark the app as a free WebApplication for music download

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-seo-improvements-and-domain-name-suggestions-to-increase-tra*
*Context gathered: 2026-04-14*
