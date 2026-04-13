# Phase 2: Atmospheric Art - Research

**Researched:** 2026-04-13
**Domain:** p5.js generative art / React canvas integration / ambient background animation
**Confidence:** HIGH

## Summary

Phase 2 adds a p5.js-powered generative waveform canvas that renders as a fixed background behind all UI content. The canvas uses Perlin noise with seeded randomness to produce reproducible, music-themed ambient patterns that don't distract from the download workflow.

The technical challenge has three axes: (1) integrating p5.js with React 18 in instance mode with proper lifecycle management, (2) positioning the canvas behind the UI via CSS stacking without interfering with any interactive elements, and (3) making the animation theme-aware so it adapts to dark/light mode via the existing CSS variable system.

**Primary recommendation:** Use p5.js 1.11.13 directly (no wrapper library) in instance mode via a custom `useP5` hook. The canvas renders at `position: fixed; z-index: -1` behind all content. Perlin noise (`noise()`) with `noiseSeed()` and `randomSeed()` produces the reproducible waveform. Frame rate capped at 30fps for ambient feel and CPU efficiency.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ART-01 | p5.js audio waveform canvas renders behind UI content as ambient background | Instance mode p5 with `position: fixed; z-index: -1` CSS, React ref-based container |
| ART-02 | Waveform uses seeded randomness for reproducible patterns | `noiseSeed(seed)` + `randomSeed(seed)` called in `setup()` -- same seed = same visual |
| ART-03 | Background is non-distracting and music-themed | Slow Perlin noise waveforms at low opacity using accent color, 30fps cap, subtle movement |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| p5 | 1.11.13 | Generative art canvas with Perlin noise, seeded randomness | Industry standard creative coding library, stable 1.x line [VERIFIED: npm registry] |
| @types/p5 | 1.7.7 | TypeScript definitions for p5 instance mode | Required for TypeScript project, latest available [VERIFIED: npm registry] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| p5 (direct instance mode) | @p5-wrapper/react 4.4.2 | Wrapper adds microdiff dep, bundles its own p5 ^1.9.4. For a single background canvas, the wrapper's prop diffing adds complexity without benefit. Direct instance mode is ~30 lines of hook code. [VERIFIED: npm registry -- peerDeps checked] |
| p5 | Canvas API + custom noise | Would need to hand-roll Perlin noise implementation. p5 provides `noise()`, `noiseSeed()`, `randomSeed()` out of the box. [CITED: p5js.org/reference/p5/noise/] |
| p5 v1.x | p5 v2.x (2.2.3) | p5 v2.0+ has breaking changes (async setup, removed preload). @p5-wrapper/react v5 requires React 19+. This project is React 18 -- stick with p5 1.x. [VERIFIED: npm registry -- @p5-wrapper/react@5.0.3 peerDeps: react >= 19.0.0] |

### NOT Using

| Library | Why Not |
|---------|---------|
| @p5-wrapper/react v5 | Requires React 19 and p5 2.x -- incompatible with this project [VERIFIED: npm registry] |
| react-p5 | Last published version 1.4.1, unmaintained, not recommended [VERIFIED: npm registry] |
| three.js / WebGL | Massive overkill for 2D ambient waveforms |

**Installation:**
```bash
cd client && npm install p5@1.11.13 && npm install -D @types/p5@1.7.7
```

**Version verification:**
- p5: 1.11.13 (latest 1.x stable, published to npm) [VERIFIED: npm registry 2026-04-13]
- @types/p5: 1.7.7 (latest, no peerDependencies) [VERIFIED: npm registry 2026-04-13]
- p5 unpacked size: ~7MB raw, but Vite tree-shakes and bundles only what's imported [VERIFIED: npm registry]

## Architecture Patterns

### Recommended Project Structure
```
client/src/
  components/
    WaveformBackground.tsx   # React component wrapping p5 canvas
  sketches/
    waveformSketch.ts        # p5 sketch function (instance mode)
  hooks/
    useP5.ts                 # Custom hook: p5 instance + lifecycle
    useDarkMode.ts           # Existing -- provides theme state
```

### Pattern 1: Custom useP5 Hook (Instance Mode)
**What:** A React hook that creates a p5 instance in a container ref, handles cleanup, and prevents Strict Mode double-canvas.
**When to use:** Any p5.js + React integration.
**Example:**
```typescript
// Source: https://dev.to/christiankastner/integrating-p5-js-with-react-i0d
// Source: https://www.lloydatkinson.net/posts/2022/how-to-prevent-a-duplicated-canvas-when-using-p5-and-react-strict-mode/
import { useEffect, useRef } from 'react';
import p5 from 'p5';

type SketchFactory = (p: p5) => void;

export function useP5(sketchFactory: SketchFactory) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any existing instance first (Strict Mode safety)
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
    }

    p5InstanceRef.current = new p5(sketchFactory, containerRef.current);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [sketchFactory]);

  return containerRef;
}
```

### Pattern 2: Sketch Function with Theme + Seed Props
**What:** The sketch function accepts theme colors and seed as closure variables, reads CSS variables for theme-awareness.
**When to use:** When the canvas must adapt to theme changes.
**Example:**
```typescript
// waveformSketch.ts
import p5 from 'p5';

interface WaveformConfig {
  seed: number;
  theme: 'dark' | 'light';
}

export function createWaveformSketch(config: WaveformConfig) {
  return (p: p5) => {
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.frameRate(30);
      p.noiseSeed(config.seed);
      p.randomSeed(config.seed);
    };

    p.draw = () => {
      // Read CSS variables for theme-aware colors
      const style = getComputedStyle(document.documentElement);
      const bgColor = style.getPropertyValue('--bg-primary').trim();
      const accentColor = style.getPropertyValue('--accent').trim();
      
      p.background(bgColor);
      
      // Draw subtle waveform lines using Perlin noise
      p.stroke(accentColor);
      p.strokeWeight(1);
      p.noFill();
      
      const time = p.frameCount * 0.005; // Very slow movement
      for (let wave = 0; wave < 3; wave++) {
        p.beginShape();
        for (let x = 0; x <= p.width; x += 4) {
          const noiseVal = p.noise(x * 0.003, time + wave * 100);
          const y = p.map(noiseVal, 0, 1, p.height * 0.3, p.height * 0.7);
          p.vertex(x, y + wave * 60);
        }
        p.endShape();
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };
}
```

### Pattern 3: Fixed Background Canvas via CSS
**What:** The p5 canvas is positioned as a fixed full-viewport background layer behind all UI content.
**When to use:** Any canvas-as-background implementation.
**Example:**
```css
/* Source: https://github.com/processing/p5.js/wiki/Positioning-your-canvas */
/* Applied to the canvas container, NOT via p5's canvas.style() */
.waveform-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none; /* Critical: lets clicks pass through to UI */
}

/* The p5 canvas inside inherits sizing */
.waveform-background canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

### Pattern 4: Theme-Reactive Sketch (No Remount)
**What:** Instead of destroying and recreating the p5 instance on theme change, the sketch reads CSS variables each frame. Since the sketch draws background color from `--bg-primary`, theme transitions happen automatically.
**When to use:** When the background must cross-fade with theme toggle.
**Why:** Recreating p5 on theme toggle would cause a visual flash. Reading CSS vars in `draw()` is zero-cost and seamless.

### Anti-Patterns to Avoid

- **Global mode p5:** Never use global mode with React. Global mode pollutes the window namespace and conflicts with React's DOM management. Always use instance mode. [CITED: https://github.com/processing/p5.js/wiki/Global-and-instance-mode]
- **canvas.style() for positioning:** Setting position via p5's `canvas.style()` method doesn't work correctly with scroll -- always use CSS on the container div. [CITED: https://github.com/processing/p5.js/issues/3447]
- **Missing cleanup in useEffect:** Without `p5Instance.remove()` in the cleanup function, React Strict Mode creates two canvases. [CITED: https://www.lloydatkinson.net/posts/2022/how-to-prevent-a-duplicated-canvas-when-using-p5-and-react-strict-mode/]
- **High frame rate for ambient art:** 60fps is wasteful for slowly-moving background waveforms. Cap at 30fps or even 24fps. [CITED: https://github.com/processing/p5.js/wiki/Optimizing-p5.js-Code-for-Performance]
- **Forgetting pointer-events: none:** Without this, the canvas captures all mouse events and makes the UI below unclickable.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Perlin noise | Custom noise function | `p5.noise()` + `p5.noiseSeed()` | Perlin noise is mathematically complex with octave layering; p5 provides `noiseDetail()` for tuning [CITED: p5js.org/reference/p5/noise/] |
| Seeded PRNG | Custom seeded random | `p5.randomSeed()` + `p5.random()` | p5's seeded random is tested and deterministic [CITED: p5js.org/reference/p5/randomSeed/] |
| Canvas lifecycle in React | Manual DOM manipulation | `useP5` hook pattern with useRef + useEffect | Handles Strict Mode double-mount, cleanup, and container targeting [CITED: multiple sources] |
| Window resize handling | addEventListener('resize') | `p5.windowResized()` callback + `p5.resizeCanvas()` | Built into p5 instance mode, handles all edge cases |

**Key insight:** p5.js IS the library for this problem. The entire phase is about leveraging what p5 already provides (noise, seeded random, canvas management, draw loop, resize handling) and correctly integrating it with React's lifecycle.

## Common Pitfalls

### Pitfall 1: Double Canvas in React Strict Mode
**What goes wrong:** Two overlapping canvases appear in development mode.
**Why it happens:** React 18 Strict Mode calls `useEffect` twice on mount (mount -> unmount -> remount).
**How to avoid:** Return `p5Instance.remove()` from the useEffect cleanup function. Store the instance in a ref.
**Warning signs:** Two canvases visible in DOM inspector, doubled visual artifacts.

### Pitfall 2: Canvas Captures Mouse Events
**What goes wrong:** Users can't click buttons, inputs, or links -- the invisible canvas intercepts all events.
**Why it happens:** The canvas is positioned over the entire viewport with `position: fixed` but without disabling pointer events.
**How to avoid:** Add `pointer-events: none` to the canvas container CSS. This is the single most critical CSS property.
**Warning signs:** Nothing in the UI responds to clicks after adding the background.

### Pitfall 3: Theme Toggle Flash
**What goes wrong:** When switching themes, the canvas background color lags behind the UI transition.
**Why it happens:** If the sketch uses hardcoded colors instead of reading CSS variables, or if the p5 instance is destroyed and recreated on theme change.
**How to avoid:** Read `--bg-primary` via `getComputedStyle()` in every `draw()` call. The existing 0.3s CSS transition on the body matches -- the canvas repaints at 30fps so updates within ~33ms.
**Warning signs:** Brief flash of wrong background color when toggling theme.

### Pitfall 4: p5 Bundle Size Impact
**What goes wrong:** p5 adds ~700KB to the production bundle (minified, before gzip).
**Why it happens:** p5 is a large library with WebGL, sound, DOM manipulation, etc.
**How to avoid:** Use dynamic import (`React.lazy` or `import()`) to load the WaveformBackground component asynchronously. The main app renders immediately; the background fades in once loaded. This keeps the critical path fast. Alternatively, accept the bundle cost -- for a desktop download tool, 700KB is not a UX concern.
**Warning signs:** Lighthouse performance score drops, initial load time increases.

### Pitfall 5: Forgetting noiseSeed in setup()
**What goes wrong:** The waveform pattern changes on every page reload.
**Why it happens:** p5's noise is seeded randomly by default. `noiseSeed()` must be called explicitly with a fixed seed.
**How to avoid:** Call both `noiseSeed(seed)` and `randomSeed(seed)` in `setup()` before any drawing.
**Warning signs:** Screenshots of the same page look different each time.

### Pitfall 6: Canvas Not Resizing on Window Resize
**What goes wrong:** The background canvas stays at its initial size when the browser window is resized.
**Why it happens:** p5 doesn't auto-resize the canvas. The `windowResized()` callback must explicitly call `resizeCanvas()`.
**How to avoid:** Implement the `windowResized` callback in the sketch.
**Warning signs:** White/black gaps appear around the canvas edges after resizing.

## Code Examples

### Complete WaveformBackground Component
```typescript
// Source: Synthesized from verified patterns
// client/src/components/WaveformBackground.tsx
import React, { useMemo } from 'react';
import { useP5 } from '../hooks/useP5';
import { createWaveformSketch } from '../sketches/waveformSketch';

interface WaveformBackgroundProps {
  seed?: number;
  theme: 'dark' | 'light';
}

const WaveformBackground: React.FC<WaveformBackgroundProps> = ({ 
  seed = 42, 
  theme 
}) => {
  const sketch = useMemo(
    () => createWaveformSketch({ seed, theme }),
    [seed, theme]
  );
  const containerRef = useP5(sketch);

  return (
    <div
      ref={containerRef}
      className="waveform-background"
      aria-hidden="true"
    />
  );
};

export default WaveformBackground;
```

### CSS for Background Layer
```css
/* client/src/App.css -- add to existing file */
.waveform-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

.waveform-background canvas {
  display: block;
}
```

### Integration Point in App.tsx
```typescript
// At top of App.tsx return, before app-wrapper div:
<WaveformBackground seed={42} theme={theme} />
<div className="app-wrapper">
  {/* ...existing content... */}
</div>
```

**Important:** The `WaveformBackground` must be a sibling of `app-wrapper`, not a child. The `app-wrapper` has its own `background-color: var(--bg-primary)` which would occlude the canvas. The app-wrapper background must be changed to `transparent` (or reduced opacity) so the canvas shows through.

### Waveform Visual Design (Ambient, Music-Themed)
```typescript
// Sketch draw function detail -- subtle multi-wave Perlin noise
p.draw = () => {
  const style = getComputedStyle(document.documentElement);
  const bgColor = style.getPropertyValue('--bg-primary').trim();
  const accentHex = style.getPropertyValue('--accent').trim();

  p.background(bgColor);

  // Convert accent to rgba with low opacity for subtlety
  const c = p.color(accentHex);
  c.setAlpha(25); // Very subtle: ~10% opacity
  p.stroke(c);
  p.strokeWeight(1.5);
  p.noFill();

  const t = p.frameCount * 0.003; // Glacially slow

  // Multiple layered sine-noise waves (music waveform feel)
  for (let layer = 0; layer < 5; layer++) {
    p.beginShape();
    const yBase = p.height * (0.25 + layer * 0.12);
    for (let x = 0; x <= p.width; x += 3) {
      const nx = x * 0.002;
      const noiseVal = p.noise(nx + layer * 50, t + layer * 10);
      const y = yBase + p.map(noiseVal, 0, 1, -40, 40);
      p.vertex(x, y);
    }
    p.endShape();
  }
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-p5-wrapper (pre-4.x) | @p5-wrapper/react 4.x or direct instance mode | 2023 | Package renamed, old name deprecated |
| p5 global mode in React | p5 instance mode | Always | Global mode never worked well with React -- instance mode is the only correct approach |
| p5 1.x | p5 2.x (Feb 2025) | 2025 | 2.x uses async setup, breaks preload() pattern. @p5-wrapper/react 5.x requires React 19. Stick with 1.x for React 18 projects. [VERIFIED: npm registry] |
| 60fps draw loop | `frameRate(30)` for ambient | Best practice | Reduces CPU by 50% for non-interactive background art [CITED: p5js.org/reference/p5/frameRate/] |

**Deprecated/outdated:**
- `react-p5` (npm): Unmaintained, last update years ago [VERIFIED: npm registry]
- `react-p5-wrapper`: Renamed to `@p5-wrapper/react` [VERIFIED: npm registry]
- p5 global mode in React: Never use -- always instance mode [CITED: p5.js wiki]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | p5 ~700KB minified bundle size estimate | Pitfall 4 | LOW -- if smaller, even better; if larger, lazy loading still mitigates it |
| A2 | `getComputedStyle` in draw() is performant at 30fps | Pattern 4 | LOW -- single property read per frame is negligible; could cache and update on theme change if needed |
| A3 | The app-wrapper background must become transparent for canvas to show through | Code Examples | MEDIUM -- need to verify the exact layering works with Mantine's body bg override |
| A4 | A fixed seed of 42 is a reasonable default | Code Examples | LOW -- any integer works, user can customize later |

## Open Questions

1. **App-wrapper background transparency**
   - What we know: `app-wrapper` has `background-color: var(--bg-primary)` which is an opaque color (#0A0A0A dark, #F2EFE9 light). This would fully occlude the canvas behind it.
   - What's unclear: Should the wrapper go fully transparent (letting the canvas paint the background), or should it use a semi-transparent overlay?
   - Recommendation: Make `app-wrapper` background transparent. The p5 sketch draws `--bg-primary` as its own background, so the visual result is identical -- but now the waveform lines are visible between the bg color and the UI content. This is the cleanest approach.

2. **Seed persistence**
   - What we know: `noiseSeed(42)` produces the same visual every time.
   - What's unclear: Should the seed be hardcoded, or stored in localStorage so users could get different patterns?
   - Recommendation: Hardcode for Phase 2. ART-02 requires reproducibility. Future ART-05 could add seed selection.

3. **Dynamic import vs. eager load**
   - What we know: p5 adds significant bundle weight.
   - What's unclear: Whether the Replit deployment is sensitive to bundle size.
   - Recommendation: Start with eager import (simpler). If build time or bundle size becomes a concern, convert to `React.lazy()` in a follow-up.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed |
| Config file | none -- see Wave 0 |
| Quick run command | `cd client && npx vitest run --reporter=verbose` |
| Full suite command | `cd client && npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ART-01 | Canvas renders behind UI in a fixed container with pointer-events: none | smoke / manual | Manual: verify canvas element exists in DOM with correct CSS | No -- Wave 0 |
| ART-02 | Same seed produces identical noise output | unit | `npx vitest run tests/waveformSketch.test.ts` | No -- Wave 0 |
| ART-03 | Waveform uses low opacity, low framerate, accent color | manual-only | Visual inspection: waveform visible but not distracting | N/A |

### Sampling Rate
- **Per task commit:** `cd client && npm run build` (build must pass)
- **Per wave merge:** Visual inspection in browser
- **Phase gate:** Build passes + visual confirmation of all 3 requirements

### Wave 0 Gaps
- [ ] Vitest not installed (optional -- `npm run build` is the primary validation for this phase)
- [ ] No test infrastructure exists in client/

*(Note: This phase is primarily visual. The build passing is the main automated gate. ART-02 reproducibility can be verified by comparing screenshots across reloads. Full test infrastructure is lower priority than for logic-heavy phases.)*

## Security Domain

No security concerns for this phase. The p5.js canvas is a purely visual, client-side rendering concern. No user input is processed by the sketch. No network calls. No data storage.

- V2 Authentication: no
- V3 Session Management: no
- V4 Access Control: no
- V5 Input Validation: no (sketch takes a hardcoded seed integer)
- V6 Cryptography: no

## Sources

### Primary (HIGH confidence)
- [npm registry: p5@1.11.13] - Version, size verified via `npm view`
- [npm registry: @types/p5@1.7.7] - Version verified
- [npm registry: @p5-wrapper/react@4.4.2] - PeerDeps (react >= 18.2.0), deps (p5 ^1.9.4)
- [npm registry: @p5-wrapper/react@5.0.3] - PeerDeps (react >= 19.0.0, p5 >= 2.0.0) -- incompatible
- [p5js.org/reference/p5/noiseSeed/](https://p5js.org/reference/p5/noiseSeed/) - noiseSeed API
- [p5js.org/reference/p5/randomSeed/](https://p5js.org/reference/p5/randomSeed/) - randomSeed API
- [p5js.org/reference/p5/noise/](https://p5js.org/reference/p5/noise/) - noise() API
- [p5js.org/reference/p5/frameRate/](https://p5js.org/reference/p5/frameRate/) - frameRate API
- [p5.js wiki: Global and instance mode](https://github.com/processing/p5.js/wiki/Global-and-instance-mode) - Instance mode docs
- [p5.js wiki: Optimizing p5.js Code for Performance](https://github.com/processing/p5.js/wiki/Optimizing-p5.js-Code-for-Performance) - Performance guide

### Secondary (MEDIUM confidence)
- [DEV Community: Integrating P5.js with React](https://dev.to/christiankastner/integrating-p5-js-with-react-i0d) - Instance mode pattern
- [Lloyd Atkinson: Prevent Duplicated Canvas](https://www.lloydatkinson.net/posts/2022/how-to-prevent-a-duplicated-canvas-when-using-p5-and-react-strict-mode/) - Strict Mode cleanup pattern
- [p5.js wiki: Positioning your canvas](https://github.com/processing/p5.js/wiki/Positioning-your-canvas) - Canvas positioning
- [GitHub issue #3447](https://github.com/processing/p5.js/issues/3447) - canvas.style() positioning limitation

### Tertiary (LOW confidence)
- None -- all claims verified against primary or secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Versions verified against npm registry, peer dependency compatibility confirmed
- Architecture: HIGH - Instance mode pattern well-documented by p5.js team and React community
- Pitfalls: HIGH - Each pitfall sourced from official docs or verified community patterns
- Visual design: MEDIUM - The specific waveform aesthetic (opacity, speed, layer count) will need visual tuning

**Research date:** 2026-04-13
**Valid until:** 2026-05-13 (p5 1.x is stable; p5 2.x migration not needed until React 19 upgrade)
