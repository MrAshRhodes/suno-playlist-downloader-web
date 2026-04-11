# Architecture Patterns: p5.js Integration

**Domain:** Generative art background layer in React 18 + Mantine v6
**Researched:** 2026-04-11
**Confidence:** HIGH (official docs + multiple verified sources)

---

## Recommended Architecture

Three-layer DOM stack with the canvas sitting behind the React tree:

```
<body>
  <div id="root">
    <MantineProvider>                     ← existing, unchanged
      <AppWrapper>
        <ArtCanvas />                     ← NEW: fixed-position canvas layer (z-index: 0)
        <div class="app-shell">           ← existing content (z-index: 1)
          <Header />
          <MainContent />                 ← glassmorphism cards sit here
          <Footer />
        </div>
      </AppWrapper>
    </MantineProvider>
  </div>
</body>
```

`ArtCanvas` renders a `<div ref>` that p5 mounts into. CSS positions it `fixed`, `inset: 0`, `z-index: 0`. All existing UI sits at `z-index: 1` or higher.

---

## Component Boundaries

| Component | File | Responsibility | Communicates With |
|-----------|------|---------------|-------------------|
| `ArtCanvas` | `client/src/components/ArtCanvas.tsx` | Mounts p5 sketch, owns canvas DOM node, passes theme props to sketch | `App.tsx` via props |
| `waveformSketch` | `client/src/sketches/waveformSketch.ts` | Pure p5 sketch function — setup/draw logic, no React imports | Imported by `ArtCanvas` |
| `useArtCanvas` | `client/src/hooks/useArtCanvas.ts` | Encapsulates p5 lifecycle (create/update/destroy), exposes nothing | Used internally by `ArtCanvas` |
| `App.tsx` | (existing) | Passes `isDark` boolean down to `ArtCanvas` | `useDarkMode` hook (already present) |

Keep the sketch function (`waveformSketch.ts`) as a plain TypeScript file with no React imports. This makes it independently testable and avoids coupling p5 logic to the React lifecycle.

---

## Data Flow

```
useDarkMode (existing hook)
  └─► isDark: boolean
        └─► App.tsx
              └─► <ArtCanvas isDark={isDark} seed={42} />
                    └─► useArtCanvas(containerRef, sketch, { isDark, seed })
                          ├─► new p5(sketch, containerRef.current)   [on mount]
                          ├─► p5.updateWithProps({ isDark, seed })   [on prop change]
                          └─► p5.remove()                            [on unmount]
```

Theme changes propagate via props only — no global variables, no event emitters. The sketch's `updateWithProps` callback reads the current `isDark` flag and swaps its color palette on the next `draw()` frame.

---

## p5.js Mounting Strategy

**Use manual instance mode via `useEffect` + `useRef`.** Do not use `@p5-wrapper/react`.

Reason: `@p5-wrapper/react` v5+ requires React ≥ 19 and p5 ≥ 2.0. This project is on React 18.2 and Mantine v6. Introducing a wrapper that forces a React upgrade would violate the "no dependency upgrades" constraint.

The manual pattern is straightforward, well-documented, and gives full control:

```typescript
// client/src/hooks/useArtCanvas.ts
import { useEffect, useRef } from 'react';
import p5 from 'p5';

export function useArtCanvas(
  containerRef: React.RefObject<HTMLDivElement>,
  sketch: (p: p5) => void,
  props: { isDark: boolean; seed: number }
) {
  const p5Ref = useRef<p5 | null>(null);

  // Mount once
  useEffect(() => {
    if (!containerRef.current) return;
    p5Ref.current = new p5(sketch, containerRef.current);
    return () => {
      p5Ref.current?.remove();
      p5Ref.current = null;
    };
  }, []); // empty deps — intentional, sketch is stable

  // Sync props without remounting
  useEffect(() => {
    if (p5Ref.current) {
      (p5Ref.current as any)._updateWithProps?.(props);
    }
  }, [props.isDark, props.seed]);
}
```

**React 18 StrictMode double-invocation:** In development, React 18 Strict Mode will mount → unmount → remount. The cleanup (`p5.remove()`) must fully destroy the canvas and cancel the draw loop. p5's built-in `remove()` handles this correctly. The empty-deps `useEffect` is safe here because the sketch is a stable reference defined outside the component — not a closure over changing state.

---

## Sketch Architecture (`waveformSketch.ts`)

```typescript
// client/src/sketches/waveformSketch.ts
import p5 from 'p5';

interface WaveformProps {
  isDark: boolean;
  seed: number;
}

export function waveformSketch(p: p5 & { _updateWithProps?: (props: WaveformProps) => void }) {
  let isDark = true;
  let seed = 42;

  // Called by useArtCanvas when props change
  p._updateWithProps = (props: WaveformProps) => {
    isDark = props.isDark;
    seed = props.seed;
    p.noiseSeed(seed);
    p.randomSeed(seed);
  };

  p.setup = () => {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.style('display', 'block');
    p.noiseSeed(seed);
    p.randomSeed(seed);
    p.frameRate(30); // Cap at 30fps — ambient art, not a game
    p.noFill();
  };

  p.draw = () => {
    // Waveform draw logic here
    // Use isDark to choose palette
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
}
```

Key decisions baked in:
- `p.frameRate(30)` — caps at 30fps. The art is ambient; running at 60fps wastes GPU for no visual gain.
- `p.noiseSeed(seed)` + `p.randomSeed(seed)` — both must be seeded for reproducibility (Perlin noise and `random()` are separate RNGs in p5).
- Canvas resizes on `windowResized` — required for correct coverage after browser resize.
- No p5.sound — do not import `p5.sound` library. The waveform is purely visual/generative, not driven by real audio FFT. This avoids microphone permission prompts and dependency bloat.

---

## Theme-Responsive Art

The sketch maintains its own `isDark` flag. When React's `useDarkMode` toggles, the new value flows down through props, is applied via `_updateWithProps`, and the next `draw()` frame picks up the new palette. No canvas teardown required for a theme change.

**Dark palette (Monolith):**
- Background: `rgba(10, 14, 26, 0)` — transparent, let CSS body provide the deep background
- Wave stroke: `rgba(100, 130, 220, 0.12)` to `rgba(60, 90, 180, 0.06)`
- Accent glow: `rgba(120, 160, 255, 0.08)`

**Light palette:**
- Wave stroke: `rgba(80, 100, 180, 0.08)` to `rgba(40, 60, 140, 0.04)`
- Background: transparent (CSS body provides white/near-white)

Keep canvas background transparent (`p.clear()` instead of `p.background()`). The CSS body color provides the base, and the canvas draws only the wave strokes on top. This correctly separates the "background color" concern (CSS) from the "art layer" concern (canvas), which also means theme transitions on the body can be CSS-transitioned without affecting the canvas.

---

## CSS Architecture for Glassmorphism

```css
/* index.css additions */

/* Art canvas layer */
.art-canvas-container {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none; /* CRITICAL: prevents canvas capturing mouse events */
  overflow: hidden;
}

/* App content layer */
.app-content {
  position: relative;
  z-index: 1;
}

/* Glassmorphism card surface */
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Safari */
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
}

/* Firefox fallback — backdrop-filter disabled by default in Firefox */
@supports not (backdrop-filter: blur(1px)) {
  .glass-card {
    background: rgba(17, 22, 39, 0.92); /* opaque fallback */
  }
}

/* Dark mode body */
.dark-mode body {
  background-color: #0a0e1a;
}

/* Light mode body */
.light-mode body {
  background-color: #f0f2f8;
}
```

**`pointer-events: none` is mandatory on the canvas container.** Without it, the canvas intercepts all mouse/keyboard events and makes the UI non-interactive. This is the most common p5.js-as-background integration mistake.

**Firefox `backdrop-filter` status:** As of 2026, Firefox still requires the `layout.css.backdrop-filter.enabled` flag in `about:config`. The `@supports` fallback ensures the UI remains fully usable in Firefox without the blur effect. Use progressive enhancement — design with glassmorphism, degrade to semi-opaque solid fills.

**Blur value:** Use `12px`. Values above 15px are exponentially more expensive on GPU. Limit glassmorphism to 2-3 active cards in the viewport simultaneously.

---

## Performance Considerations

| Concern | Approach | Rationale |
|---------|----------|-----------|
| Frame rate | Cap at 30fps via `p.frameRate(30)` | Ambient art doesn't need 60fps; halves GPU time |
| Canvas size | Match `windowWidth x windowHeight` | Avoids CSS scaling artifacts on retina |
| Draw complexity | Max 4-6 simultaneous Perlin noise waveforms | Beyond this, mobile mid-range devices lag |
| Glassmorphism elements | Max 2-3 `backdrop-filter` elements per viewport | GPU compositing cost scales with element count |
| Theme transition | CSS transition on body background only | Canvas palette swaps on next draw frame — no flicker |
| Mobile | `prefers-reduced-motion` media query to disable animation | Accessibility + battery |
| Resize | Debounce `windowResized` if needed | p5 calls it natively; add `setTimeout` debounce if redraws are expensive |

```css
/* Respect reduced motion — disable canvas animation */
@media (prefers-reduced-motion: reduce) {
  .art-canvas-container {
    display: none;
  }
}
```

Do not use `requestAnimationFrame` manually alongside p5 — p5 owns its own rAF loop. Interfering with it causes double-draw bugs.

---

## Component Hierarchy (annotated)

```
main.tsx
└── MantineProvider (existing, theme prop unchanged)
    └── ModalsProvider (existing)
        └── Notifications (existing)
            └── AppWrapper (existing)
                └── App
                    ├── ArtCanvas                    ← NEW (first child, rendered first = behind)
                    │   └── <div ref={containerRef}> ← p5 canvas mounts here
                    └── <div class="app-content">    ← existing UI, z-index: 1
                        ├── AppShell (Mantine)
                        │   ├── Header
                        │   └── Main content
                        └── Footer
```

`ArtCanvas` must be the first child in `App`'s return so it renders before the content div in DOM order, and z-index layering keeps it behind.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Global p5 mode
**What:** `import 'p5'` without instance mode, letting p5 pollute global scope (`setup`, `draw`, `width`, `height` become globals).
**Why bad:** Conflicts with any other library using the same names; impossible to have multiple sketches; breaks in module bundlers.
**Instead:** Always use instance mode: `new p5(sketch, container)`.

### Anti-Pattern 2: Re-creating p5 on theme change
**What:** Including `isDark` in the `useEffect` dependency array, causing `p5.remove()` + `new p5()` on every theme toggle.
**Why bad:** Visible canvas flash, drops seeded art state, creates garbage.
**Instead:** Use `_updateWithProps` pattern — update internal variables, let `draw()` pick up on next frame.

### Anti-Pattern 3: Missing `pointer-events: none`
**What:** Forgetting to disable pointer events on the canvas container.
**Why bad:** Canvas silently captures all clicks, making buttons and inputs non-functional. Difficult to diagnose.
**Instead:** Always set `pointer-events: none` on the art canvas container.

### Anti-Pattern 4: Importing p5.sound
**What:** Adding `p5.sound` to get real audio waveform data.
**Why bad:** Triggers microphone permission prompt on page load. Suno app users expect no permissions. Also adds ~200KB to bundle.
**Instead:** Simulate audio waveform aesthetics with Perlin noise — visually equivalent, no permissions required.

### Anti-Pattern 5: `backdrop-filter` on table rows
**What:** Applying glassmorphism to every row in the songs table.
**Why bad:** 50+ table rows each compositing their own blur layer destroys performance.
**Instead:** Apply `backdrop-filter` only to card/panel wrappers (1-2 elements), not repeating table elements.

---

## Build Order

This is a visual-only milestone with zero backend changes. The natural dependency chain:

1. **Theme system first** — Establish CSS variables, body background colors, Mantine theme colors for dark/light Monolith palette. Everything else depends on having the right colors in place.

2. **Art canvas second** — Add `ArtCanvas` component with static dark-mode waveform. Validate that `pointer-events: none` is correct, canvas covers viewport, z-index is behind content, and `p5.remove()` cleanup works (check for canvas duplication in React Strict Mode dev).

3. **Theme-responsive art third** — Wire `isDark` prop through and validate palette swap works without canvas teardown.

4. **Glassmorphism on cards fourth** — Apply `backdrop-filter` to card surfaces. By this point the background art exists, so the glass effect is visible and tunable. Do not apply glassmorphism without background content — it's visually meaningless on a flat color.

5. **UI redesign and typography last** — Mantine component styling, spacing overhaul, animations, table visual hierarchy. These are independent of the art layer and can proceed in parallel once theme variables are locked.

**Rationale for this order:** Theme variables are a shared dependency — if you start with Mantine component styling before the palette is locked, you'll re-do the styling work. The art canvas is foundational to the glassmorphism effect (you can't tune glass blur against a flat background). Component polish is highest effort and lowest risk of breaking earlier decisions, so it goes last.

---

## Scalability Considerations

| Concern | Current (single viewport) | Future (if animated page sections) |
|---------|--------------------------|-------------------------------------|
| Canvas layers | Single full-page canvas | Keep single canvas — use p5.Graphics for offscreen layers |
| Multiple sketches | Not needed | One `p5` instance, multiple `p.Graphics` buffers drawn into main canvas |
| SSR | Not applicable (Vite SPA) | Would require `typeof window !== 'undefined'` guard around `new p5()` |
| Bundle size | p5 is ~800KB minified | Consider dynamic import: `const p5 = await import('p5')` to keep initial bundle lean |

---

## Sources

- [@p5-wrapper/react — peer deps require React 19+](https://github.com/P5-wrapper/react)
- [p5.js instance mode — official wiki](https://github.com/processing/p5.js/wiki/Global-and-instance-mode)
- [Manual p5 + React integration pattern](https://dev.to/christiankastner/integrating-p5-js-with-react-i0d)
- [p5.js noiseSeed reference](https://p5js.org/reference/p5/noiseSeed/)
- [CSS backdrop-filter browser support and Firefox caveat](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide)
- [React 18 useEffect cleanup behavior](https://react.dev/reference/react/useEffect)
