# Phase 4: Add Google Ads to the bottom of the site - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Add Google AdSense Auto Ads to the site for monetization. The AdSense script tag is added to index.html, Google determines ad placement automatically. No manual ad units, no new UI components beyond the script integration. Existing footer and all functionality remain unchanged.

</domain>

<decisions>
## Implementation Decisions

### Ad Placement & Layout
- **D-01:** Ad area sits above the existing attribution footer — content flows into ad zone, then footer stays at the very bottom as the last element.
- **D-02:** Full container width — ad stretches to match the app container width for visual consistency.
- **D-03:** Generous vertical spacing (32-48px) between content/ad and ad/footer. Matches existing 48px margin-top on the footer.
- **D-04:** Always visible — ad renders regardless of app state (idle, fetching playlist, downloading). No conditional hiding.

### Ad Format & Config
- **D-05:** Google Auto Ads only — single AdSense script tag in index.html `<head>`. Google determines optimal ad placement. No manual `<ins>` ad units.
- **D-06:** User will provide real AdSense publisher ID (ca-pub-XXXXX) before implementation. Hardcoded directly in index.html — it's a public value visible in page source.
- **D-07:** Script loads with `async` attribute — standard AdSense practice, doesn't block page render.
- **D-08:** No page region exclusions — let Google optimize placement across the entire page.
- **D-09:** Graceful ad-blocker degradation — if blocked, nothing shows. No detection message, no broken layout.
- **D-10:** No GDPR consent banner — rely on Google's built-in consent mechanisms.

### Visual Integration
- **D-11:** Minimal separator — subtle `border-top` line (matching existing footer separator style) marks the ad area. Google controls internal ad styling.
- **D-12:** Transparent background — page background shows through. No theme-matched wrapper background that might clash with Google's ad content.
- **D-13:** No "Advertisement" label — Google Auto Ads handles its own labeling per AdSense policies.

### Claude's Discretion
- Exact spacing values within the 32-48px range
- Whether Auto Ads needs any page-level meta tags beyond the script

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value (visual only, no functional changes), constraints (Mantine v6, Replit deployment, client-only)
- `.planning/ROADMAP.md` — Phase 4 details and dependency chain (depends on Phase 3)
- `.planning/REQUIREMENTS.md` — No specific requirement IDs for Phase 4 yet (TBD)

### Prior Phase Context
- `.planning/phases/01-core-monolith/01-CONTEXT.md` — Monolith palette, card system, typography decisions
- `.planning/phases/03-interactions-polish/03-CONTEXT.md` — Transition patterns (0.3s ease), WCAG AA compliance

### Codebase
- `.planning/codebase/STRUCTURE.md` — Directory layout, where files live
- `.planning/codebase/CONVENTIONS.md` — Naming patterns, code style

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/index.html` — HTML entry point where the AdSense `<script>` tag goes. Already has Google Fonts preconnect as a pattern for external script loading.
- `client/src/App.css` — `.app-footer` styles (margin-top: 48px, border-top) — the separator pattern to replicate for the ad area.

### Established Patterns
- **External scripts in index.html** — Google Fonts loaded via `<link>` tags in `<head>`. AdSense script follows same pattern.
- **CSS variable theming** — `var(--border-color)` used for separator lines. Ad area separator should use same variable.
- **0.3s ease transitions** — Consistent timing throughout, though ad area likely doesn't need transitions.

### Integration Points
- `client/index.html` `<head>` — Add AdSense `<script async>` tag here
- `client/src/App.tsx:340-363` — Existing `<footer>` element. Auto Ads script handles placement, so no React component changes needed unless spacing adjustments are required around the footer.
- `client/src/App.css` `.app-footer` — May need spacing adjustment if Auto Ads inserts content near the footer.

</code_context>

<specifics>
## Specific Ideas

- **Auto Ads simplicity:** Since Google Auto Ads is the chosen approach, the entire implementation is essentially one script tag in index.html. The phase is deliberately minimal — no React components, no CSS modules, no state management.
- **Publisher ID workflow:** User provides the real ca-pub-XXXXX value. It gets hardcoded into the async script tag. No .env complexity.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-add-google-ads-to-the-bottom-of-the-site*
*Context gathered: 2026-04-13*
