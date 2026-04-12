# Phase 1: Core Monolith - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

The app looks like a Monolith product — correct palette in both modes, depth cards with 24px radius, and a clear type hierarchy. This phase delivers the complete visual transformation: palette swap, card rework, and typography system. No new features, no interactions/animations (Phase 3), no p5.js art (Phase 2).

</domain>

<decisions>
## Implementation Decisions

### Card Depth
- **D-01:** Dark mode cards use subtle inner glow — faint inner border glow (`inset 0 1px 0 rgba(255,255,255,0.05)`) plus soft shadow (`0 4px 24px rgba(0,0,0,0.4)`). Premium but not distracting.
- **D-02:** Light mode cards use soft float shadows — clean drop shadow (`0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)`). Professional, Apple-esque.
- **D-03:** Uniform card treatment — every content section (song table, input area, info banner, support banner) gets the same 24px radius card with identical depth. No tiered elevation.

### Typography Hierarchy
- **D-04:** Hero treatment (Extra Bold 24pt) on app title only. Playlist name at semi-bold 20pt, section headings at semi-bold 18pt, body at regular 14pt.
- **D-05:** Load Inter from Google Fonts (`@import`) with system font fallback stack (`-apple-system, BlinkMacSystemFont, sans-serif`).
- **D-06:** Moderate tight letter-spacing: hero -0.03em, headers -0.02em, body -0.01em, captions (uppercase) 0.06em.

### Accent Color
- **D-07:** Deep Blue #3B4A6B replaces current #4a90ff everywhere — buttons, input focus rings, progress bar, badges, logo, links, active states. Full consistency.
- **D-08:** Hover states lighten to ~#4E5F80, active states darken to ~#2F3D58, disabled at 45% opacity. No glow on hover (that's Phase 3 territory).
- **D-09:** Logo — generate via nanobanana MCP with chromakey green background, remove background with ImageMagick. Claude has discretion on the design direction.

### Theme Transition
- **D-10:** CSS cross-fade transitions (0.3s ease) on background-color, color, border-color, box-shadow. classList swap triggers transitions. No animated overlay or JS-driven transition.
- **D-11:** Mantine v6 components overridden via CSS using `var()` references and `!important` where needed. Keep MantineProvider minimal (colorScheme only). Proven pattern already in codebase.

### Claude's Discretion
- Logo design direction (generated via nanobanana MCP — see D-09)
- Exact shadow values can be tuned during implementation as long as they match the decided intensity level (subtle dark, soft light)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `~/Downloads/monolith_design_system_document.html` — The Monolith design system spec. Defines palette, typography, card styles, and overall aesthetic. Primary visual reference for this phase.

### Project Context
- `.planning/PROJECT.md` — Core value (visual only, no functional changes), constraints (Mantine v6, Replit deployment, client-only)
- `.planning/REQUIREMENTS.md` — Phase 1 requirements: THME-01, THME-02, THME-03, CARD-01, CARD-02, TYPO-01, TYPO-02
- `.planning/ROADMAP.md` — Phase 1 success criteria (5 items)

### Codebase
- `.planning/codebase/CONVENTIONS.md` — Naming patterns, import order, code style
- `.planning/codebase/STRUCTURE.md` — Directory layout, where to add new code

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/src/hooks/useDarkMode.ts` — classList-based theme toggle with localStorage persistence. Works as-is, no changes needed.
- `client/src/components/ThemeToggle.tsx` — Sun/moon toggle using Mantine ActionIcon. May need color updates for Deep Blue accent.
- `client/src/index.css` — Full CSS variable system for both themes. All variables need value updates to Monolith palette.
- `client/src/App.css` — All component CSS classes (`.glass-card`, `.btn-accent`, `.input-field`, `.song-table`, etc.) already consume CSS vars. Radius and shadow values need updates.

### Established Patterns
- **CSS variables drive theming** — classList on `<html>` swaps variable sets. All components reference `var(--name)`. This is the mechanism for palette swap.
- **Mantine v6 body bg needs `!important`** — Framework injects its own body background. Override pattern already established.
- **No CSS modules** — All styling via plain CSS classes in App.css/index.css. Components use className strings.

### Integration Points
- `client/src/main.tsx` — AppWrapper has hardcoded body colors (`#1a1a1a` / `#f5f5f7`) that need updating to Monolith values (#0A0A0A / #F2EFE9).
- `client/src/main.tsx` — MantineProvider theme object. Keep minimal, just colorScheme.
- `client/src/App.css` — `.glass-card` class referenced in App.tsx. Rename or replace with `.monolith-card`.
- `client/index.html` — Font import tag for Inter (Google Fonts) goes here or in index.css.

</code_context>

<specifics>
## Specific Ideas

- **Logo generation:** Use nanobanana MCP to generate a logo. Prompt with chromakey green background, then use ImageMagick (`magick input.png -fuzz 15% -transparent "#00FF00" output.png`) to remove background for transparency. Place result in `client/public/assets/`.
- **Monolith palette reference:** Dark (#0A0A0A bg, #1A1A1A cards, #FFFFFF text), Light (#F2EFE9 bg, #E8E4DB cards, #332F2E text), accent #3B4A6B both modes.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-core-monolith*
*Context gathered: 2026-04-12*
