# Technology Stack — Visual Modernization

**Project:** Suno Playlist Downloader — UI Redesign
**Researched:** 2026-04-11
**Scope:** CSS/animation/art additions only. No upgrades to existing React 18, Mantine v6, Vite 4, TypeScript stack.

---

## New Dependencies to Add

### Generative Art Background

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| p5 | ^1.11.13 | Canvas-based waveform animation | Mature 1.x line, stable API, supports instance mode for React, seeded randomness via `randomSeed()` built-in |

**Integration pattern: raw instance mode via `useEffect`, no wrapper library.**

Use `@p5-wrapper/react` only on React 18 — version 4.x is the last that supports React 18 (version 5 requires React 19 and p5 2.x). The wrapper adds ~15kb and another dep to manage. For a single background canvas component, raw instance mode in a `useEffect` is simpler, more predictable, and has zero extra dependencies.

Confidence: HIGH — verified against npm registry data and P5-wrapper/react GitHub releases.

```typescript
// Pattern: P5BackgroundCanvas.tsx
useEffect(() => {
  const sketch = (p: p5) => {
    p.setup = () => { /* ... */ };
    p.draw = () => { /* ... */ };
  };
  const instance = new p5(sketch, containerRef.current!);
  return () => instance.remove(); // React 18 Strict Mode safe
}, []);
```

React 18 Strict Mode calls `useEffect` twice in development (mount → cleanup → mount). The `instance.remove()` cleanup correctly destroys the canvas, preventing duplicate canvas bugs.

Do NOT use p5 2.x — it is a recent major release with API changes and @p5-wrapper/react v5 peer dependency conflicts with React 18.

---

### Animations

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| motion | ^12.x (latest) | Component enter/exit, stagger lists, smooth transitions | Renamed from framer-motion in 2025; actively maintained; React 18 fully supported; 34kb min/gz at full load, reducible to ~4.6kb with LazyMotion |

**Use `motion` (not the legacy `framer-motion` package).** Import from `motion/react`. The `framer-motion` package is now a compatibility shim — new projects must use `motion`.

Confidence: HIGH — confirmed via motion.dev official docs and npm registry (v12.38.0 current as of April 2026).

Use `LazyMotion` + `domAnimation` feature set to cap bundle addition at ~20kb. For this app — pure visual changes, no physics, no drag — `domAnimation` covers 100% of the needed feature set.

```typescript
import { LazyMotion, domAnimation, m } from 'motion/react';
// Wrap app root in <LazyMotion features={domAnimation}>
// Use <m.div> instead of <motion.div> throughout
```

Mantine v6 compatibility: works on all Mantine components without their own built-in animations. Wrap with `m.div` or use the `as` prop pattern with `forwardRef`. Confirmed via Mantine community discussion.

**CSS-only for trivial transitions (hover states, color changes, backdrop blur toggles) — motion only for orchestrated sequences (page load stagger, status row enters, settings panel slide).**

---

### Typography

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @fontsource-variable/inter | ^5.x | Variable weight Inter font, self-hosted | No Google Fonts external call; WOFF2 variable font covers wght 100–900 in one file; Vite bundles it at build time; Replit-safe |

Confidence: HIGH — Fontsource is the de facto self-hosting solution in the Vite/React ecosystem. Confirmed via fontsource.org docs.

```typescript
// client/src/main.tsx
import '@fontsource-variable/inter';
```

```css
:root {
  font-family: 'Inter Variable', -apple-system, BlinkMacSystemFont, sans-serif;
  font-feature-settings: 'cv11', 'ss01'; /* Inter optical sizing features */
}
```

---

## CSS Architecture

**No new CSS library needed.** The existing PostCSS + Vite + CSS Modules setup handles everything.

### Token System

Replace the existing `--apple-*` + dual `:root.light-mode` / `:root.dark-mode` approach with a single structured token layer in `index.css`. Mantine v6 generates its own `--mantine-*` CSS variables via `MantineProvider` — the custom token layer sits alongside them and is applied to `body[data-theme="dark"]` or `body[data-theme="light"]` to avoid selector specificity conflicts with Mantine's `:root` variables.

```css
/* Token naming convention */
--color-bg-base        /* #0a0e1a dark / #f4f5f9 light */
--color-bg-surface     /* frosted card surface */
--color-text-primary
--color-text-secondary
--color-text-muted
--color-accent         /* brand blue */
--glass-bg             /* rgba(255,255,255,0.08) dark / rgba(255,255,255,0.7) light */
--glass-border         /* rgba(255,255,255,0.12) dark / rgba(255,255,255,0.4) light */
--glass-blur           /* 16px */
--shadow-card
--radius-card
--transition-base      /* 0.2s ease */
```

### Glassmorphism

Pure CSS via `backdrop-filter`. No library.

```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur)); /* Safari */
  border: 1px solid var(--glass-border);
}

@supports not (backdrop-filter: blur(1px)) {
  .glass-card { background: var(--color-bg-surface); } /* solid fallback */
}
```

Browser support for `backdrop-filter` is ~95% global as of 2025 (Chrome 76+, Firefox 103+, Safari 9.1+). The `@supports` fallback handles the remaining 5%.

Confidence: HIGH — MDN and multiple 2025 implementation guides confirm support figures.

Recommended blur value: **12–16px**. Values above 20px cause compositing layer thrash on lower-end hardware.

---

## What NOT to Use

| Rejected Option | Category | Reason |
|-----------------|----------|--------|
| `@p5-wrapper/react` v4 | p5 wrapper | Adds 15kb + a dependency. Raw instance mode is identical capability for a single canvas use case. |
| `@p5-wrapper/react` v5 | p5 wrapper | Requires React 19 and p5 2.x — incompatible with current stack. |
| `p5` v2.x | p5 core | Major version, recent release, not yet widely tested in production React setups, API changes from v1. Use 1.11.x. |
| `framer-motion` (old package) | animation | Now a shim for `motion`. No longer actively developed. |
| `react-spring` | animation | More complex API than `motion`; physics engine overkill for transition-only animations; larger bundle. |
| `anime.js` | animation | Good for DOM animations but no React integration layer; requires imperative refs throughout. |
| `three.js` | generative art | Massively overweight for 2D waveforms. 600kb+ for what p5 does in ~900kb (acceptable; p5 is already in scope). |
| Google Fonts CDN | typography | External network call on every load; GDPR risk; blocked on Replit restricted networks. Self-host via Fontsource. |
| Tailwind CSS | CSS utility | Would conflict with Mantine v6's styling system; not worth introducing for a CSS-variable-based redesign. |
| CSS Modules (new) | styling | Existing app uses global CSS + Mantine. Adding CSS Modules mid-project creates inconsistency without payoff. |

---

## Installation

```bash
# In client/ directory
npm install p5 motion @fontsource-variable/inter
npm install -D @types/p5
```

Bundle impact estimate:
- p5 ~950kb unminified, ~350kb min/gz (canvas-based, loads once, no render-thread cost after init)
- motion ~34kb min/gz base, ~20kb with LazyMotion + domAnimation
- @fontsource-variable/inter: single WOFF2 ~80kb loaded async, zero JS

---

## Mantine v6 Theme Integration

Mantine v6 `MantineProvider` accepts a `theme` object. Override the color palette to align with Monolith tokens:

```tsx
<MantineProvider
  theme={{
    colorScheme: colorScheme, // existing toggle
    colors: {
      dark: ['#f0f2f8', '#a0a8c0', '#6b7394', '#4a5172', '#2a3050',
             '#1a2040', '#111627', '#0d1220', '#0a0e1a', '#07090f'],
    },
    primaryColor: 'blue',
    fontFamily: 'Inter Variable, -apple-system, sans-serif',
    defaultRadius: 'md',
  }}
  withGlobalStyles
  withNormalizeCSS
>
```

The `dark[8]` slot (`#0a0e1a`) becomes Mantine's background in dark mode, `dark[7]` (`#0d1220`) becomes the card background. This aligns Mantine component defaults with the Monolith palette without needing to override every component manually.

Confidence: MEDIUM — based on Mantine v6 theming docs (v6.mantine.dev). Verify exact color slot mappings against component output during implementation.

---

## Sources

- motion.dev official docs: https://motion.dev/docs/react
- motion npm changelog: https://github.com/motiondivision/motion/blob/main/CHANGELOG.md
- @p5-wrapper/react GitHub (version + peer deps): https://github.com/P5-wrapper/react
- p5.js npm (1.11.13 current stable): https://p5js.org/download/
- Fontsource Inter variable: https://fontsource.org/fonts/inter/install
- Mantine v6 dark theme guide: https://v6.mantine.dev/guides/dark-theme/
- backdrop-filter browser support: https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide
- p5 React 18 Strict Mode canvas duplicate fix: https://www.lloydatkinson.net/posts/2022/how-to-prevent-a-duplicated-canvas-when-using-p5-and-react-strict-mode/
