---
phase: 06-premium-title-banner-and-modern-step-cards
created: 2026-04-14
status: locked
---

# Phase 06: Premium Title Banner and Modern Step Cards — Context

## Domain Boundary

Upgrade the title/header area with a generated hero banner image and wrap all 3 step sections in card components. Visual modernization only — no functional changes.

<decisions>

### D-01: Generated hero banner image
Use nanobanana MCP to generate a wide banner image (music/vinyl/audio theme) displayed behind the title text. Title "Suno Playlist Downloader" and subtitle overlay the image. Full-width within the app-wrapper container.

### D-02: Medium banner height (200-250px)
Banner should be 200-250px tall — noticeable visual upgrade without eating viewport. Content (step 1) should be visible without scrolling on standard viewports. Not a landing page, still feels like a functional app.

### D-03: Full card wrap for all 3 steps
Each step section (Paste playlist link, Review songs, Download playlist) gets a `.monolith-card` wrapper with the existing card pattern: 24px border-radius, `--bg-card` background, `--shadow-card`, 1px `--border-color` border. Step number + heading inside the card.

### D-04: Numbered step indicators
Steps should show circled numbers (①②③) or similar visual indicators in the heading. The existing unused `SectionHeading.tsx` component has gradient numbered circles — can be used as reference or adapted, but the final implementation should match Monolith design system (solid surfaces, not gradients).

### D-05: Existing support-banner untouched
The "Support Server Costs" banner at the top of the page must remain exactly as-is. The hero banner goes BELOW it, replacing the current plain h1 title area.

### D-06: Theme-aware
Banner and cards must work in both dark and light modes using existing CSS variables. Banner image should work against both themes (dark/warm tones preferred — similar to the donation modal banner).

</decisions>

<specifics>

- Banner image style: music/vinyl/audio scene, warm tones, not corporate
- Title overlay on banner with adequate contrast (text-shadow or semi-transparent overlay)
- Step 2 already has a `.monolith-card` around the song table — the new outer card wraps the entire step including heading
- Settings gear icon stays in its current position (top-right area)
- Info banner ("Download music from your Suno playlists...") moves inside or below the hero banner

</specifics>

<codebase_context>

### Existing patterns to reuse
- `.monolith-card` CSS class: 24px border-radius, --bg-card, --shadow-card, --border-color
- `.section-heading` class: 20px, 600 weight, -0.02em tracking
- `SectionHeading.tsx` component exists (unused) with numbered circles — reference for step indicators
- WaveformBackground is at z-index 0, app-wrapper at z-index 1 — banner sits inside app-wrapper

### Key files
- `client/src/App.tsx` — main layout, title rendering (lines 164-172), step headings (lines 182, 202, 243)
- `client/src/index.css` — `.monolith-card`, `.section-heading`, CSS variables
- `client/src/components/SectionHeading.tsx` — unused component with numbered circles (reference only)
- `client/src/components/WaveformBackground.tsx` — background canvas, z-index layering

### CSS variables available
- `--bg-primary`, `--bg-card`, `--text-primary`, `--text-secondary`
- `--accent` (#3B4A6B), `--accent-hover` (#4E5F80)
- `--shadow-card`, `--border-color`, `--border-subtle`

</codebase_context>

<canonical_refs>
- client/src/App.tsx (title area lines 164-172, step headings lines 182/202/243)
- client/src/index.css (.monolith-card, .section-heading, CSS variables)
- client/src/components/SectionHeading.tsx (unused reference for numbered circles)
- .planning/phases/01-core-monolith/01-CONTEXT.md (Monolith design system decisions)
</canonical_refs>

<deferred>
None
</deferred>
