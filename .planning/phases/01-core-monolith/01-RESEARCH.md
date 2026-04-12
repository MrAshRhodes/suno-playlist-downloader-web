# Phase 01: Core Monolith - Research

**Researched:** 2026-04-12
**Domain:** CSS theming, typography, card depth — Mantine v6 override patterns
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Card Depth**
- D-01: Dark mode — `inset 0 1px 0 rgba(255,255,255,0.05)` inner glow + `0 4px 24px rgba(0,0,0,0.4)` soft shadow
- D-02: Light mode — `0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)` drop shadow
- D-03: Uniform card treatment — every content section gets 24px radius + identical depth (no tiered elevation)

**Typography**
- D-04: Hero 24pt Extra Bold (app title only), playlist name 20pt semi-bold, section headings 18pt semi-bold, body 14pt regular
- D-05: Inter from Google Fonts (`@import`) with `-apple-system, BlinkMacSystemFont, sans-serif` fallback
- D-06: Hero -0.03em, headers -0.02em, body -0.01em, captions 0.06em letter-spacing

**Accent Color**
- D-07: Deep Blue `#3B4A6B` replaces `#4a90ff` everywhere (buttons, focus rings, progress, badges, logo, links)
- D-08: Hover `~#4E5F80`, active `~#2F3D58`, disabled 45% opacity. No glow on hover.
- D-09: Logo via nanobanana MCP (chromakey), ImageMagick background removal. Design at Claude's discretion.

**Theme Transition**
- D-10: CSS `transition: background-color, color, border-color, box-shadow 0.3s ease`. classList swap. No JS overlay.
- D-11: Mantine v6 overrides via CSS `var()` + `!important` where needed. MantineProvider: colorScheme only.

### Claude's Discretion
- Logo design direction
- Exact shadow tuning (within decided intensity level)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| THME-01 | Dark mode: `#0A0A0A` bg, `#1A1A1A` cards, `#FFFFFF` text, `#3B4A6B` accent | CSS var swap in `:root.dark-mode` block in `index.css` |
| THME-02 | Light mode: `#F2EFE9` bg, `#E8E4DB` cards, `#332F2E` text, `#3B4A6B` accent | CSS var swap in `:root.light-mode` block in `index.css` |
| THME-03 | Smooth theme toggle — no flash of unstyled content | `transition` on CSS vars + fix hardcoded `body.style` in `main.tsx` AppWrapper |
| CARD-01 | 24px radius cards with mode-appropriate depth (inner glow dark / drop shadow light) | Update `.glass-card` → `.monolith-card` in `App.css`; update every usage in `App.tsx` |
| CARD-02 | Cards visually lift from background in both modes | `box-shadow` values from D-01/D-02 applied via `--shadow-card` var |
| TYPO-01 | Inter/system font, semi-bold 18-24pt headers, 14pt body, tight letter-spacing | Google Fonts `@import` in `index.html`, update `:root` font-family and `.section-heading` |
| TYPO-02 | Hero/title elements bold, visually prominent | `.app-title` → 24pt Extra Bold, add `.hero-title` class rule |
</phase_requirements>

---

## Summary

This phase is a pure CSS variable and class update — no new components, no logic changes. The entire theming system is already in place: `useDarkMode.ts` swaps `:root.dark-mode` / `:root.light-mode` classes, and all components consume CSS custom properties. The work is:

1. Update variable values in `index.css` to Monolith palette
2. Update component-level CSS in `App.css` (radius, shadows, font sizes, accent color)
3. Fix one bug in `main.tsx` where `AppWrapper` applies hardcoded body colors (`#1a1a1a` / `#f5f5f7`) that override the CSS variable system — this is the cause of any flash on toggle
4. Add Inter font via Google Fonts import
5. Generate logo via nanobanana MCP and wire into header

The biggest risk is the `AppWrapper` inline style injection in `main.tsx` — it runs on mount and permanently overrides CSS vars. This must be deleted or converted to use CSS vars.

**Primary recommendation:** Update `index.css` vars first, fix `main.tsx` inline styles, then update `App.css` class-by-class.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Mantine v6 | 6.0.13 (locked) | Component library | Already in project, frozen by constraint |
| React | 18.2.0 | UI framework | Already in project |
| Vite | 4.3.9 | Build tooling | Already in project |

No new dependencies required for this phase. All changes are CSS + one MCP call.

**Installation:** None needed.

---

## Architecture Patterns

### File Ownership Map

```
client/src/index.css        ← CSS custom properties for both themes (THME-01, THME-02)
client/src/App.css          ← Component CSS consuming vars (CARD-01, CARD-02, TYPO-01, TYPO-02)
client/src/main.tsx         ← AppWrapper inline style bug (THME-03 blocker)
client/index.html           ← Google Fonts @import link (TYPO-01)
client/public/assets/       ← Logo PNG (D-09)
```

### Pattern 1: CSS Variable Theme Swap

**What:** `:root.dark-mode` and `:root.light-mode` blocks define all custom properties. `useDarkMode.ts` toggles the class on `document.documentElement`. Components reference `var(--name)` only — no hardcoded values.

**Current state:** Already implemented and working. Values need updating to Monolith palette.

**Example — current dark vars that need changing:**
```css
/* Source: client/src/index.css (verified by Read tool) */
:root.dark-mode {
  --bg-primary: #0d0d12;        /* → #0A0A0A */
  --bg-card: rgba(255,255,255,0.04);  /* → #1A1A1A */
  --accent: #4a90ff;             /* → #3B4A6B */
  --shadow-card: 0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);  /* keep, matches D-01 */
}
```

### Pattern 2: Mantine v6 Override via !important

**What:** Mantine v6 injects body background via `<style>` tags. Already established in `App.css`:

```css
/* Source: client/src/App.css (verified by Read tool) */
body {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}
```

**Keep this pattern.** Do not add any other Mantine-specific overrides for things already handled by CSS vars.

### Pattern 3: Card Class Rename

`.glass-card` needs to become `.monolith-card` — the glassmorphism aesthetic (backdrop-filter blur) is being replaced by solid surfaces. The class is referenced in `App.tsx` line 269. One rename touch-point.

**New `.monolith-card` definition:**
```css
/* Dark mode: solid surface + inner glow + shadow */
.monolith-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  box-shadow: var(--shadow-card);
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
```

Shadow is mode-aware via CSS vars — no media query or JS needed.

### Pattern 4: Font Import

Google Fonts `@import` in `index.html` (in `<head>`) is the correct location per project structure. Do not add it in CSS — Vite handles HTML head injection cleanly, and `index.html` is the single entry point.

```html
<!-- Source: client/index.html (verified by Read tool) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap" rel="stylesheet">
```

Weights needed: 400 (body), 600 (semi-bold headers), 800 (Extra Bold hero). `display=swap` prevents FOUT.

### Anti-Patterns to Avoid

- **Hardcoded hex values in component CSS:** Everything goes through CSS vars. No `color: #3B4A6B` directly in component classes — use `var(--accent)`.
- **Adding backdrop-filter to monolith-card:** The Monolith aesthetic is solid surfaces, not glass. Remove `backdrop-filter` from the card class.
- **Using Mantine's `sx` prop for theming:** Mantine v6 `sx` bypasses CSS vars and creates per-render style injection. Use className-based CSS.
- **Inline `style` attributes for theme values:** Already a problem in `main.tsx` AppWrapper — must be removed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font loading | Manual font-face declarations | Google Fonts `@import` | Already CDN-hosted, correct weights, display=swap |
| Theme persistence | Custom localStorage manager | Existing `useDarkMode.ts` | Already works, no changes needed |
| Logo transparency | Manual pixel editing | ImageMagick chromakey (per CLAUDE.md) | Reliable, reproducible |
| Card elevation system | Multiple card classes | Single `--shadow-card` var per theme | Already the pattern in the codebase |

**Key insight:** 90% of this phase is updating values, not building new infrastructure. The architecture is correct; only the values are wrong.

---

## Common Pitfalls

### Pitfall 1: AppWrapper Inline Style Overrides
**What goes wrong:** Theme toggle works at CSS var level but body background doesn't change. Flash on toggle or on load.
**Why it happens:** `main.tsx` AppWrapper runs a `useEffect` that calls `document.body.style.backgroundColor = '#1a1a1a'` — inline styles win over CSS class-based vars. [VERIFIED: Read tool, main.tsx lines 30-36]
**How to avoid:** Delete the `document.body.style.*` assignments in `AppWrapper`. The `App.css` body rule with `!important` already handles this correctly.
**Warning signs:** Body background doesn't update when toggling theme; body color is always dark regardless of class.

### Pitfall 2: Transition on Non-Transitionable Properties
**What goes wrong:** `transition: all` or transitions on `--css-vars` don't work in most browsers.
**Why it happens:** CSS custom properties are not individually transitionable — only concrete properties that reference them can transition.
**How to avoid:** Transitions must be on concrete properties: `transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease`. Already the pattern in `App.css` — keep it. [ASSUMED: standard CSS behavior]
**Warning signs:** Theme toggle is instant even though transitions are declared.

### Pitfall 3: Missing Transition on body
**What goes wrong:** Body background flashes instantly on toggle while cards/text smoothly cross-fade.
**Why it happens:** `body` transition is declared in `index.css` but inline style in `main.tsx` bypasses it.
**How to avoid:** Fix Pitfall 1 (remove inline styles), and verify `body { transition: background-color 0.4s ease }` is present in `index.css`. [VERIFIED: index.css line 19]

### Pitfall 4: Accent Color in Mantine Components
**What goes wrong:** Mantine Buttons, Progress, and Badges retain their original blue after accent var update.
**Why it happens:** Mantine v6 components use their internal `theme.colors.blue` palette, not `var(--accent)`.
**How to avoid:** Override Mantine component colors via CSS targeting their internal class names:
```css
/* Override Mantine button background */
.mantine-Button-root[data-variant="filled"] {
  background-color: var(--accent) !important;
}
/* Override Mantine Progress bar */
.mantine-Progress-bar {
  background-color: var(--accent) !important;
}
```
Check if App.tsx uses any Mantine `Button`, `Progress`, or `Badge` components — if so, add targeted overrides. [ASSUMED: standard Mantine v6 behavior]

### Pitfall 5: Google Fonts blocked on Replit
**What goes wrong:** Inter doesn't load on deployed Replit instance, falls back to system font.
**Why it happens:** Some Replit networking restrictions or CSP headers.
**How to avoid:** The system font fallback (`-apple-system, BlinkMacSystemFont, sans-serif`) is already in the font-family stack — the visual result is acceptable. Not a blocking issue. [ASSUMED]

---

## Code Examples

### Full CSS Variable Update (index.css)

```css
/* Source: index.css — values derived from CONTEXT.md decisions + design system */
:root.dark-mode {
  --bg-primary: #0A0A0A;
  --bg-secondary: #111111;
  --bg-card: #1A1A1A;
  --bg-card-hover: #222222;
  --bg-input: rgba(255, 255, 255, 0.06);
  --text-primary: #FFFFFF;
  --text-secondary: #B3B3B3;
  --text-muted: rgba(255, 255, 255, 0.4);
  --accent: #3B4A6B;
  --accent-hover: #4E5F80;
  --accent-active: #2F3D58;
  --accent-glow: rgba(59, 74, 107, 0.25);
  --border-color: rgba(255, 255, 255, 0.08);
  --border-subtle: rgba(255, 255, 255, 0.04);
  --shadow-card: inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4);
  --shadow-button: 0 2px 8px rgba(59, 74, 107, 0.3);
  --banner-bg: rgba(255, 183, 77, 0.08);
  --banner-border: rgba(255, 183, 77, 0.2);
  --banner-text: #ffb74d;
  --progress-track: rgba(255, 255, 255, 0.06);
  --scrollbar-thumb: rgba(255, 255, 255, 0.15);
  --scrollbar-hover: rgba(255, 255, 255, 0.25);
}

:root.light-mode {
  --bg-primary: #F2EFE9;
  --bg-secondary: #EAE6DF;
  --bg-card: #E8E4DB;
  --bg-card-hover: #DDD9D0;
  --bg-input: rgba(0, 0, 0, 0.04);
  --text-primary: #332F2E;
  --text-secondary: #8C867E;
  --text-muted: rgba(51, 47, 46, 0.45);
  --accent: #3B4A6B;
  --accent-hover: #4E5F80;
  --accent-active: #2F3D58;
  --accent-glow: rgba(59, 74, 107, 0.15);
  --border-color: rgba(0, 0, 0, 0.08);
  --border-subtle: rgba(0, 0, 0, 0.04);
  --shadow-card: 0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04);
  --shadow-button: 0 2px 8px rgba(59, 74, 107, 0.2);
  --banner-bg: rgba(255, 152, 0, 0.08);
  --banner-border: rgba(255, 152, 0, 0.25);
  --banner-text: #e65100;
  --progress-track: rgba(0, 0, 0, 0.06);
  --scrollbar-thumb: rgba(0, 0, 0, 0.15);
  --scrollbar-hover: rgba(0, 0, 0, 0.25);
}
```

### main.tsx AppWrapper Fix

```typescript
// Source: main.tsx — remove the inline style override (lines 30-36 currently)
// DELETE this entire useEffect in AppWrapper:
//   React.useEffect(() => {
//     document.body.style.backgroundColor = ...
//     document.body.style.color = ...
//     ...
//   }, []);
// The App.css body rule with !important handles this correctly.
```

### Typography Update (App.css additions)

```css
/* Update :root font-family (index.css) */
:root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Update .app-title for hero treatment */
.app-title {
  font-size: 24px;       /* was 18px */
  font-weight: 800;      /* Extra Bold (was 700) */
  letter-spacing: -0.03em;  /* hero tight */
}

/* Update .section-heading */
.section-heading {
  font-size: 18px;       /* was 16px */
  font-weight: 600;
  letter-spacing: -0.02em;  /* header tight */
}
```

### Logo Generation Workflow (nanobanana MCP)

Per CLAUDE.md and D-09:
1. Call nanobanana MCP with prompt: "A minimalist vinyl record icon on a chromakey green (#00FF00) background, flat design, white icon, suitable for app logo, 256x256"
2. Save output as `/tmp/logo-raw.png`
3. Remove background: `magick /tmp/logo-raw.png -fuzz 15% -transparent "#00FF00" client/public/assets/logo.png`
4. Replace `<IconVinyl>` in `App.tsx` header with `<img src="/assets/logo.png" width="38" height="38" />` wrapped in the existing `.app-logo` div

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `backdrop-filter` glassmorphism | Solid surface cards | Remove `backdrop-filter` from `.glass-card` |
| `#4a90ff` cyan-blue accent | `#3B4A6B` deep navy accent | Update all `--accent*` vars |
| `#0d0d12` near-black bg | `#0A0A0A` rich black bg | Update `--bg-primary` dark |
| `#f0f0f5` light bg | `#F2EFE9` warm ivory bg | Update `--bg-primary` light |
| 14px border-radius | 24px border-radius | Update `.monolith-card` (was `.glass-card`) |
| System font only | Inter + system fallback | Add Google Fonts link to `index.html` |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Mantine v6 Button/Progress/Badge components use internal theme palette, not `var(--accent)` | Common Pitfalls #4 | Low — may not need overrides if App.tsx uses custom HTML elements (which it does for most controls) |
| A2 | Google Fonts may be blocked on Replit | Common Pitfalls #5 | Low — system font fallback is acceptable |
| A3 | CSS transitions on concrete properties work cross-browser for this phase | Common Pitfalls #2 | Negligible — this is standard CSS behavior |

---

## Open Questions

1. **Does App.tsx use any Mantine Button/Progress/Badge that would need overrides?**
   - What we know: App.tsx imports `Badge`, `Button`, `Progress` from Mantine (line 8-22) but the visible UI uses custom HTML buttons with `.btn-accent` class
   - What's unclear: Whether the Mantine imports are actually rendered or just imported but unused
   - Recommendation: Planner should include a task to audit Mantine component usage and add targeted CSS overrides only where needed

2. **Logo design direction**
   - What we know: Claude has full discretion (D-09)
   - What's unclear: Whether the vinyl icon should be retained or replaced with something more "Monolith"-branded
   - Recommendation: Generate 1-2 variations via nanobanana and pick the most premium-feeling one

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| ImageMagick (`magick`) | Logo background removal (D-09) | Unknown — probe at execution time | — | Skip logo, use SVG icon |
| Google Fonts CDN | Inter font (D-05) | Via browser at runtime | — | System font fallback in stack |
| nanobanana MCP | Logo generation (D-09) | Available (in MCP context) | — | Use Tabler IconVinyl as placeholder |

**Missing dependencies with fallback:**
- ImageMagick: If `magick` not available, defer logo to a later commit using the existing `IconVinyl` Tabler icon styled with Deep Blue background.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no test files, no test config |
| Config file | None |
| Quick run command | `yarn build` (TypeScript compile check) |
| Full suite command | `yarn build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| THME-01 | Dark mode renders Monolith Rich Black palette | manual-only | Visual inspection in browser | N/A |
| THME-02 | Light mode renders Monolith Warm Ivory palette | manual-only | Visual inspection in browser | N/A |
| THME-03 | Theme toggle — no flash | manual-only | Toggle in browser, check for flash | N/A |
| CARD-01 | 24px radius cards with depth | manual-only | Visual inspection in browser | N/A |
| CARD-02 | Cards lift from background | manual-only | Visual inspection in browser | N/A |
| TYPO-01 | Inter font, correct sizes and spacing | manual-only | Browser + DevTools font inspection | N/A |
| TYPO-02 | Hero/title bold and prominent | manual-only | Visual inspection in browser | N/A |

**Note:** This is a pure CSS/visual phase. No automated tests are practical — all validation is visual. The Nyquist check for this phase is `yarn build` succeeding (TypeScript compiles without errors) plus manual browser QA against the 5 success criteria in ROADMAP.md.

### Sampling Rate
- **Per task commit:** `yarn build` — verify TypeScript still compiles
- **Per wave merge:** `yarn build` + open in browser, compare against success criteria
- **Phase gate:** All 5 ROADMAP.md success criteria visually confirmed before `/gsd-verify-work`

### Wave 0 Gaps
None — no test infrastructure needed. The phase is CSS-only changes.

---

## Security Domain

Not applicable. This phase is CSS/visual changes only — no authentication, session management, input processing, or cryptography involved.

---

## Sources

### Primary (HIGH confidence)
- Read tool: `client/src/index.css` — full CSS variable system verified
- Read tool: `client/src/App.css` — all component classes verified
- Read tool: `client/src/main.tsx` — AppWrapper inline style bug verified (lines 30-36)
- Read tool: `client/src/App.tsx` — className usage verified (`.glass-card` at line 269)
- Read tool: `client/src/hooks/useDarkMode.ts` — classList mechanism verified
- Read tool: `client/index.html` — no font link present (needs adding)
- Read tool: `.planning/phases/01-core-monolith/01-CONTEXT.md` — all decisions D-01 through D-11
- Read tool: `~/Downloads/monolith_design_system_document.html` — Monolith palette and component spec

### Secondary (MEDIUM confidence)
- CLAUDE.md: ImageMagick chromakey workflow for logo transparency

---

## Metadata

**Confidence breakdown:**
- CSS variable update: HIGH — file contents verified, values from locked decisions
- AppWrapper bug: HIGH — code read directly, root cause confirmed
- Card rename: HIGH — single usage verified in App.tsx
- Font integration: HIGH — `index.html` has no font link, pattern is standard
- Mantine component overrides: MEDIUM — imports present but actual render usage needs audit
- Logo generation workflow: HIGH — per CLAUDE.md + D-09

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable CSS/Mantine stack)
