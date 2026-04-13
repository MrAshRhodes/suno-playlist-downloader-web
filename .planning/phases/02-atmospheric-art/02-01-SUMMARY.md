---
phase: 02-atmospheric-art
plan: 01
subsystem: client/visual
tags: [p5js, generative-art, animation, waveform, css-variables]
dependency_graph:
  requires: [01-core-monolith]
  provides: [ART-01, ART-02, ART-03]
  affects: [client/src/App.tsx, client/src/App.css]
tech_stack:
  added: [p5@1.11.13, "@types/p5@1.7.7"]
  patterns: [p5-instance-mode, react-strict-mode-cleanup, css-variable-runtime-read, perlin-noise-waveform]
key_files:
  created:
    - client/src/hooks/useP5.ts
    - client/src/sketches/waveformSketch.ts
    - client/src/components/WaveformBackground.tsx
  modified:
    - client/package.json
    - client/src/App.css
    - client/src/App.tsx
decisions:
  - p5 instance mode (not global) eliminates window pollution and React lifecycle conflicts
  - useMemo wraps sketch factory to prevent p5 remount on every App render
  - CSS variables read via getComputedStyle each draw() frame — theme transitions without remount
  - seed=42 hardcoded per ART-02, not configurable at runtime
  - app-wrapper background set to transparent; canvas paints --bg-primary, keeping same visual
metrics:
  duration: ~4min
  completed: "2026-04-13T08:30:28Z"
  tasks_completed: 2
  tasks_pending: 1
  files_created: 3
  files_modified: 3
---

# Phase 02 Plan 01: Atmospheric Art Background Summary

**One-liner:** p5.js Perlin noise waveform canvas fixed behind UI, seeded for reproducibility, theme-reactive via CSS variable reads, pointer-events disabled for full UI pass-through.

## What Was Built

A generative waveform background using p5.js in instance mode. Five layered Perlin noise waves render at 30fps behind all UI content, using the `--accent` CSS variable at ~10% opacity. The canvas fills the viewport, stays fixed on scroll, and reads `--bg-primary` / `--accent` from `getComputedStyle` on every frame — meaning theme toggle (dark/light) transitions the waveform without any React remount.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1: Install + hook + sketch | `31772a4` | p5.js installed, useP5 hook, waveformSketch |
| Task 2: Component + CSS + App wire | `07defc6` | WaveformBackground component, CSS, App.tsx wired |

## Files Created

| File | Purpose |
|------|---------|
| `client/src/hooks/useP5.ts` | p5 instance lifecycle hook, React Strict Mode safe |
| `client/src/sketches/waveformSketch.ts` | Seeded Perlin noise waveform factory (ART-02) |
| `client/src/components/WaveformBackground.tsx` | React component wrapping useP5 + sketch |

## Files Modified

| File | Change |
|------|--------|
| `client/package.json` | Added p5@1.11.13 (dep), @types/p5@1.7.7 (devDep) |
| `client/src/App.css` | Added `.waveform-background` class; changed `.app-wrapper` bg to transparent |
| `client/src/App.tsx` | Imported + rendered `<WaveformBackground seed={42} />` as sibling before app-wrapper |

## Verification Results

Build: `npm run build` exits 0. Bundle size increased from ~300 kB to ~1,369 kB (p5.js is ~1MB — expected, informational chunk warning only, not an error).

All 21 acceptance criteria: PASS
- p5 and @types/p5 present in package.json
- useP5 exported with Strict Mode cleanup
- createWaveformSketch with noiseSeed + randomSeed (ART-02), frameRate(30), setAlpha(25), windowResized
- WaveformBackground with aria-hidden, useP5, createWaveformSketch, default seed=42
- App.css: position:fixed, z-index:-1, pointer-events:none, transparent app-wrapper
- App.tsx: WaveformBackground imported, rendered, seed={42}

## Task 3 Status: Pending Human Visual Verification

Task 3 is a `checkpoint:human-verify` — no code changes required. Awaiting visual approval.

**To verify:**
1. `cd client && npm run dev`
2. Open http://localhost:5173

**Checklist:**
- ART-01: Subtle waveform lines visible behind UI; all buttons/inputs clickable; fixed on scroll
- ART-02: Hard-refresh (Ctrl+Shift+R) produces the same wave pattern (seed 42)
- ART-03: Waves move glacially; ~10% opacity accent lines; workflow usability unaffected
- Theme toggle: waveform transitions with dark/light without flash
- Resize: canvas fills new viewport without gaps

**Resume signal:** Type "approved" to confirm, or describe issues (too visible, too faint, wrong color, UI blocked, etc.)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — the waveform reads live CSS variables and renders dynamically; no placeholder data.

## Threat Flags

None — purely client-side decorative canvas, no user input, no network calls, no data storage.

## Self-Check: PASSED

- `client/src/hooks/useP5.ts` — FOUND
- `client/src/sketches/waveformSketch.ts` — FOUND
- `client/src/components/WaveformBackground.tsx` — FOUND
- Commit `31772a4` — FOUND
- Commit `07defc6` — FOUND
