# Domain Pitfalls: Visual Redesign

**Domain:** Visual-only modernization of a working React app — glassmorphism, generative art, theme overhaul
**Researched:** 2026-04-11
**Stack in scope:** React 18, Mantine v6, Vite 4, p5.js (new), deployed on Replit

---

## Critical Pitfalls

Mistakes that cause rewrites, broken functionality, or major visual regressions.

---

### Pitfall 1: p5.js Instance Not Cleaned Up on Unmount

**What goes wrong:** A p5 sketch started in `useEffect` keeps its draw loop running after the component unmounts. The canvas element is removed from the DOM but the p5 instance continues calling `requestAnimationFrame`, consuming CPU and eventually leaking memory. In React 18 Strict Mode, `useEffect` fires twice in development — two p5 instances are created, two canvases render on top of each other, and only one is cleaned up.

**Why it happens:** p5 manages its own animation loop internally. Removing the container div does not stop the loop. The instance must be explicitly destroyed by calling `p5Instance.remove()`. The double-invoke behaviour of Strict Mode catches any missing cleanup.

**Consequences:** CPU pegged at 10-30% permanently. Canvas artifacts in dev mode (doubled waveform). Memory grows with each hot reload until the tab is killed.

**Prevention:**
```tsx
useEffect(() => {
  const p5Instance = new p5(sketch, containerRef.current);
  return () => {
    p5Instance.remove(); // stops draw loop AND removes canvas
  };
}, []); // empty dep array — mount/unmount only
```
Use instance mode (not global mode) so the sketch is scoped. Set the ref to `null` after remove.

**Warning signs:** CPU fan spinning on page with waveform. `performance.memory` growing in DevTools. Double canvas visible in Elements panel in dev.

**Phase:** Waveform background implementation phase.

---

### Pitfall 2: Mantine v6 `MantineProvider` Ignored Because It Wraps Nothing

**What goes wrong:** App.tsx currently applies theme via `useDarkMode()` and inline `style` props — it does not use `MantineProvider` at the root or pass `colorScheme` to it. If Mantine components are added during the redesign without a `MantineProvider` with `colorScheme` set, Mantine defaults to its own light theme, overriding any dark styling applied to wrapper divs. Modal backgrounds, tooltips, and portal-rendered components (dropdowns, popovers) render white-on-white in dark mode.

**Why it happens:** Mantine v6 components read `colorScheme` from context. The existing `useDarkMode` hook writes to `document.documentElement.className` and `document.body.style` — it does not update Mantine context. These are parallel systems that must be synchronized.

**Consequences:** Mantine-managed components (any future `Modal`, `Tooltip`, `Notification`, `Menu`) ignore the custom dark theme. Each new Mantine component added requires its own workaround. Portal-rendered elements are especially invisible because they live outside the component tree.

**Prevention:** Wrap the app in `MantineProvider` at the root, pass `colorScheme={theme}` derived from the same `useDarkMode` hook state, and use `theme` overrides to set the Monolith palette. The hook's `localStorage` and `document.documentElement.className` logic can stay for CSS variable driving, but Mantine's `colorScheme` must track the same value.

```tsx
<MantineProvider theme={{ colorScheme: theme, ...monolithTheme }}>
  <App />
</MantineProvider>
```

**Warning signs:** Dark wrapper div but white Mantine `Paper` inside it. `Notification` toast renders white background. Any `Modal` opened in dark mode has white background.

**Phase:** Theme foundation phase (must be done first before any Mantine components are redesigned).

---

### Pitfall 3: Inline Style `theme` Prop Drilling Breaks Silently During Extraction

**What goes wrong:** App.tsx contains ~60 inline style objects, all conditionally switching values based on `theme === 'dark'`. When migrating to CSS variables (the correct approach), it is easy to miss one or introduce a logic inversion. Because there are no TypeScript errors for wrong inline style values, these break silently — rendering with the wrong background colour or wrong text colour that is only visible in specific states.

**Why it happens:** The codebase has no linting for inline style values. Every `rgba(255,255,255,0.1)` in a dark branch and `rgba(0,0,0,0.06)` in a light branch is a separate migration target. The table rows, thead, badges, progress bar, footer, and info banner all have separate inline dark/light pairs.

**Consequences:** Subtle colour regressions that are hard to catch in code review. The most common failure: a component that looks correct at the time of migration but breaks when the user toggles the theme, because the CSS variable was applied in the wrong direction.

**Prevention:** 
1. Extract all inline theme values to CSS custom properties in `index.css` before touching any component visuals.
2. Migrate one semantic group at a time (e.g. card backgrounds first, text colours second).
3. After each group, toggle theme and visually verify both states before moving to the next group.
4. Use browser DevTools computed styles panel to confirm the CSS variable resolves correctly in both modes.

**Warning signs:** Component looks correct in one theme but wrong after toggle. Background and text colours both wrong (usually indicates a light/dark inversion). Visible only after interaction (state change triggers re-render with wrong inline style).

**Phase:** Inline style extraction phase — must precede all visual redesign work.

---

### Pitfall 4: `backdrop-filter` Glassmorphism Has No Firefox Default Support

**What goes wrong:** `backdrop-filter: blur()` is not enabled by default in Firefox as of 2026. It requires the user to enable `layout.css.backdrop-filter.enabled` in `about:config`. This means all glassmorphism card effects are invisible in Firefox — cards render as fully transparent without the frosted glass blur, which against the dark waveform background can make text unreadable.

**Why it happens:** Mozilla has withheld default enablement citing performance concerns. This is a longstanding issue, not a recent regression.

**Consequences:** Firefox users see transparent cards with no background, making the app unusable. This affects a non-trivial percentage of users.

**Prevention:**
1. Always include `-webkit-backdrop-filter` alongside `backdrop-filter`.
2. Implement a solid fallback background for the `@supports not (backdrop-filter: blur(1px))` case:
```css
.glass-card {
  background: rgba(17, 22, 39, 0.85); /* solid fallback */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
@supports not (backdrop-filter: blur(1px)) {
  .glass-card {
    background: rgba(17, 22, 39, 0.95); /* higher opacity when no blur */
  }
}
```
3. Test in Firefox before marking any phase complete.

**Warning signs:** Cards invisible or text hard to read during Firefox testing. `backdrop-filter` shows in CSS but no visual blur effect.

**Phase:** Glassmorphism implementation phase.

---

### Pitfall 5: Glassmorphism Fails WCAG AA Contrast Against Animated Background

**What goes wrong:** A frosted glass card placed over a moving waveform animation fails WCAG AA (4.5:1 text contrast ratio) at certain frames of the animation. The background behind the blur changes continuously, so a contrast ratio that passes at rest fails when a bright wave passes behind the card. This is not detectable with a static contrast checker.

**Why it happens:** Contrast is measured against a fixed background. When the background is animated, the "effective background" changes frame by frame. Semi-transparent glass panels averaging `rgba(255,255,255,0.08)` over a dark base look fine on average but can spike to poor contrast when bright waveform peaks align with text.

**Consequences:** WCAG AA failure (stated requirement in PROJECT.md). Potentially unreadable UI at certain animation frames. More visible during active download (animation likely more intense).

**Prevention:**
1. Keep waveform art subdued — low opacity strokes (`0.15-0.3`), low brightness colours, seeded to stay in the dark register.
2. Apply a semi-opaque base tint to all glass cards: minimum `rgba(10, 14, 26, 0.65)` dark background.
3. Verify contrast against the *lightest possible frame* of the animation, not the average.
4. Use a vignette or radial gradient overlay on the canvas to darken the center where UI cards sit.

**Warning signs:** Text readable at page load but intermittently hard to read. Contrast checker passes but visual inspection shows legibility issues at peak wave moments.

**Phase:** Waveform background + glassmorphism integration phase.

---

## Moderate Pitfalls

---

### Pitfall 6: p5.js CPU Hammering on Retina Displays

**What goes wrong:** p5.js by default calls `pixelDensity(window.devicePixelRatio)` automatically, scaling canvas dimensions by 2x on Retina screens. A waveform drawn at 1200x800 is actually rendered at 2400x1600. Combined with a draw loop at 60fps, this can push CPU to 25-40% on Retina MacBooks — noticeable heat and fan activity while the user is trying to download music.

**Why it happens:** p5.js's auto pixel density means every pixel written to the canvas is 4x the work on HiDPI screens. Background animations that feel lightweight on a 1080p monitor are expensive on a 2x display.

**Consequences:** Poor UX — user's machine heats up while using the downloader. Battery drain on laptops. Performance marks against Replit's free tier resource limits.

**Prevention:**
1. Cap `pixelDensity` explicitly: `p.pixelDensity(Math.min(window.devicePixelRatio, 1.5))`.
2. Use `p.frameRate(30)` instead of the default 60. Waveform art is ambient — 30fps is indistinguishable.
3. Use `p.noSmooth()` if fine details are not needed.
4. Size the canvas to the viewport, not larger.

**Warning signs:** CPU in Activity Monitor climbing when the waveform background is visible. Noticeable render jank during download.

**Phase:** Waveform background implementation phase.

---

### Pitfall 7: Mantine v6 Theme `colors` Array Format — Object Format Silently Breaks Components

**What goes wrong:** Mantine v6 requires colour scales to be arrays of exactly 10 shades (`string[]`). If a colour is passed as an object or a shorter array, Mantine components that reference `theme.colors.yourColor[N]` receive `undefined` and render with fallback styles (usually black backgrounds or invisible text). This fails silently — no TypeScript error at the call site for Mantine's internal component code.

**Prevention:** Always define custom colours as a 10-element tuple. Use a tool like [Mantine Colors Generator](https://v6.mantine.dev/colors-generator/) to derive the full scale from a single hex. Example for the Monolith primary blue `#1a82e2`:
```ts
primaryColor: 'monolith-blue',
colors: {
  'monolith-blue': ['#e6f1fc', '#c3d9f7', '#9cc0f2', '#72a6ed', '#4d8fe8', '#1a82e2', '#1570c5', '#0f5aa8', '#0a458a', '#06316d']
}
```

**Warning signs:** Mantine `Button` renders black instead of brand blue. `Badge` has no background. Any Mantine component with `color="primary"` renders incorrectly.

**Phase:** Theme foundation phase.

---

### Pitfall 8: Theme Toggle Triggers Full Page Repaint + p5.js Canvas Flicker

**What goes wrong:** The current `useDarkMode` hook writes `document.body.style.backgroundColor` directly on every theme change, which can trigger a full reflow. When a p5 canvas is in the background, this reflow causes a visible frame drop or flicker as the canvas is repainted alongside the DOM.

**Prevention:**
1. Remove direct `document.body.style` writes from the theme hook — drive all colours through CSS variables on `:root` only.
2. Ensure the p5 canvas is on a fixed `z-index` layer below the UI, not subject to layout reflow.
3. Use CSS `transition` only on elements that need it, not on the body element itself.

**Warning signs:** Visible flash when toggling theme. Canvas "resets" or stutters for one frame on toggle.

**Phase:** Inline style extraction + theme foundation phases.

---

### Pitfall 9: Vite 4 Build on Replit — p5.js Bundle Size

**What goes wrong:** p5.js is ~800KB minified. Added to the existing bundle, this could push total bundle size past 1.5MB+, causing slow initial load on Replit (which uses shared infrastructure). Replit has no explicit bundle size limit but slow cold starts and first-load latency degrade UX.

**Prevention:**
1. Import p5 as a dynamic import so it loads after initial paint:
```ts
const p5 = (await import('p5')).default;
```
2. Alternatively, load p5 from a CDN in `index.html` and reference it as a global — avoids bundling it with the app.
3. Check bundle output with `vite-bundle-visualizer` before deploying.

**Warning signs:** `yarn build` output shows chunk >1MB. Initial page load on Replit takes >3 seconds. Lighthouse performance score drops significantly post-redesign.

**Phase:** Waveform implementation phase, pre-deploy check.

---

## Minor Pitfalls

---

### Pitfall 10: CSS Animations Fighting Inline Style Transitions

**What goes wrong:** App.tsx already has inline `transition: "background-color 0.2s ease, box-shadow 0.2s ease"` on buttons. If CSS class animations are added on top, the two transition systems conflict — one takes precedence depending on specificity, and the other is silently ignored.

**Prevention:** During inline style extraction, remove all `transition` values from inline styles and consolidate them into CSS classes. Never have `transition` declared in both places on the same element.

**Phase:** Inline style extraction phase.

---

### Pitfall 11: Placeholder Styles Cannot Be Set Via React `style` Prop

**What goes wrong:** App.tsx has `"::placeholder": { color: ... }` inside an inline style object (line 290-292). This is not valid — React does not support pseudo-element styles inline. The code is currently non-functional (silently ignored), meaning placeholder text colour is unthemed. The redesign should not propagate this pattern.

**Prevention:** Placeholder styles must be in CSS. The existing `dark-placeholder`/`light-placeholder` class names on the input (line 294) are the right approach — define the actual `::placeholder` rules in `index.css` or a CSS module.

**Phase:** Inline style extraction phase.

---

### Pitfall 12: `document.documentElement.className = ...` Clobbers All Classes

**What goes wrong:** App.tsx line 217 uses `document.documentElement.className = theme === 'dark' ? 'dark-mode' : 'light-mode'` (assignment, not `classList.toggle`). This wipes any other classes on `<html>`. If a third-party library or Mantine adds classes to `<html>`, they are removed on every theme change.

**Prevention:** Replace with `classList.add`/`classList.remove` in `useDarkMode`. The hook already uses the correct approach on line 36-39 of `useDarkMode.ts` — but App.tsx overrides it via `useEffect` at line 217. Remove the `useEffect` in App.tsx that sets `className` directly.

**Phase:** Theme foundation phase (day one fix).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Inline style extraction | Silent colour inversion bugs | Migrate group-by-group, toggle test after each group |
| Theme foundation (MantineProvider) | Mantine components ignore custom dark theme | Sync `colorScheme` prop with `useDarkMode` state |
| Theme foundation | `document.documentElement.className` clobber | Replace assignment with `classList` in App.tsx |
| Theme foundation | Mantine colour array format | Use 10-element tuple, verify with generator |
| Glassmorphism implementation | Firefox has no backdrop-filter by default | `@supports` fallback with higher-opacity background |
| Glassmorphism + waveform integration | WCAG contrast fails at bright animation frames | Dark waveform palette + min 0.65 opacity card backgrounds |
| Waveform background | p5.js duplicate canvas in Strict Mode | Instance mode + `remove()` cleanup in useEffect return |
| Waveform background | Retina CPU thrash | `pixelDensity(1.5)` cap + `frameRate(30)` |
| Waveform background | p5.js bundle size (~800KB) | Dynamic import or CDN load |
| Theme toggle UX | Canvas flicker on toggle | CSS vars only on `:root`, no `document.body.style` writes |
| Pre-deploy | Bundle size regression | vite-bundle-visualizer check before push |

---

## Sources

- [p5.js remove() reference](https://p5js.org/reference/p5/remove/)
- [Preventing duplicate canvas in React Strict Mode with p5](https://www.lloydatkinson.net/posts/2022/how-to-prevent-a-duplicated-canvas-when-using-p5-and-react-strict-mode/)
- [p5.js retina/HiDPI issues](https://github.com/processing/p5.js/issues/220)
- [Mantine v6 dark theme guide](https://v6.mantine.dev/guides/dark-theme/)
- [Mantine v6 theme object](https://v6.mantine.dev/theming/theme-object/)
- [Glassmorphism meets accessibility — Axess Lab](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)
- [NN/G Glassmorphism best practices](https://www.nngroup.com/articles/glassmorphism/)
- [Glassmorphism implementation guide 2025](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide)
- [CSS variables for React theming — Josh W. Comeau](https://www.joshwcomeau.com/css/css-variables-for-react-devs/)
- [p5.js performance optimization wiki](https://github.com/processing/p5.js/wiki/Optimizing-p5.js-Code-for-Performance)
