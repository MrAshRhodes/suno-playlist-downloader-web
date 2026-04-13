# Phase 3: Interactions & Polish - Research

**Researched:** 2026-04-13
**Domain:** CSS micro-animations, WCAG AA compliance, Mantine v6 overrides
**Confidence:** HIGH

## Summary

Phase 3 is pure CSS enhancement — no React logic changes, no new libraries, no functional modifications. All work lands in `client/src/index.css` (CSS variable definitions) and `client/src/App.css` (rule enhancements and Mantine overrides). The codebase already has the full variable system scaffolded; the only missing piece is `--progress-glow` which is referenced but never defined.

WCAG AA compliance requires concrete color value changes, not just opacity nudges. Contrast calculation reveals that the light mode `--text-muted` at 0.45 opacity (ratio 2.30:1) and `--text-secondary` (#8C867E, ratio 3.14:1) both fail outright. Dark mode `--text-muted` at 0.40 opacity (ratio 3.77:1) narrowly fails. Fixes are surgical: bump opacity values and darken one secondary color value.

The support banner's light mode text (#e65100) fails AA at 3.13:1 on its composited background. A darker orange (#bf360c) passes at 4.62:1 while staying intentionally distinct from the UI accent.

**Primary recommendation:** All changes are additive CSS enhancements to existing classes. No new components, no library additions, no React changes.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Button hover — `box-shadow: 0 0 12px rgba(59,74,107,0.3)` combined with existing shadow. Subtle halo glow.
**D-02:** Button active/pressed — opacity drops from 30% to 15% (glow weakens, feels like "absorbed" press).
**D-03:** Table row hover — flat background shift only (`var(--bg-card-hover)`). No glow on rows.
**D-04:** Progress bar fill — steady accent glow `box-shadow: 0 0 8px rgba(59,74,107,0.5)`. No shimmer, no pulse.
**D-05:** Progress bar height — bump from 4px to 6px.
**D-06:** Define `--progress-glow` CSS variable (referenced in `.progress-fill` but not defined in `index.css`).
**D-07:** State changes use opacity cross-fade (0 → 1, 0.3s ease). No slide.
**D-08:** `.downloading` pulse — tighten from `opacity: 0.6` to `0.7`, speed from `2s` to `1.5s`.
**D-09:** Bump muted text opacity until WCAG AA passes (4.5:1 minimum).
**D-10:** If accent button text fails on light mode, darken accent for light buttons only (`#2F3D58`). Keep white text.
**D-11:** Support banner keeps orange accents. Verify they pass AA.

### Claude's Discretion

- Exact glow radius values tunable during implementation (stay at decided intensity — subtle, not pronounced)
- Scrollbar styling — already themed, verify it matches both modes
- Unstyled surfaces discovered during implementation — apply Monolith treatment consistent with existing patterns

### Deferred Ideas (OUT OF SCOPE)

None.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INTR-01 | Buttons have hover/active states with accent glow effects | D-01/D-02: Add `box-shadow` glow to `.btn-accent:hover` and reduce opacity on `:active`. Mantine Button overrides also need glow. |
| INTR-02 | Progress bar has glow effect and smooth animation | D-04/D-05/D-06: Define `--progress-glow` variable in both theme blocks, bump height to 6px. `.progress-track` height must match. |
| INTR-03 | Table rows have hover states with subtle background transition | Already exists (`.song-table tbody tr:hover { background: var(--bg-card-hover) }` with 0.15s ease). Verify correct, no changes needed. |
| INTR-04 | State changes animate smoothly | D-07: Add `.fade-in` class or use existing `fadeIn` keyframe for progress section mount. D-08: Refine `.downloading` pulse. |
| PLSH-01 | Support Server Costs banner styled to match Monolith | Banner CSS exists. WCAG fix for light mode text: `#e65100` fails (3.13:1), use `#bf360c` (4.62:1). |
| PLSH-02 | All colors meet WCAG AA contrast ratios | Multiple values need concrete fixes — see WCAG Findings below. |
| PLSH-03 | Scrollbar styled to match theme | Already implemented via `::-webkit-scrollbar-*` rules using `--scrollbar-thumb` and `--scrollbar-hover`. Verify only. |
</phase_requirements>

---

## Standard Stack

No new dependencies. All work is plain CSS targeting existing classes and CSS variables.

### Files Modified
| File | What Changes |
|------|-------------|
| `client/src/index.css` | Add `--progress-glow` to `.dark-mode` and `.light-mode` blocks; fix WCAG color values |
| `client/src/App.css` | Enhance button hover/active, `.progress-track` height, `.downloading` keyframe refinement, add `--progress-glow` CSS var reference (already present) |

**Installation:** None required.

---

## Architecture Patterns

### CSS Variable Strategy (Existing Pattern)
All theming goes through CSS variables set on `:root.dark-mode` and `:root.light-mode`. Phase 3 follows this exactly — no hardcoded values in rule bodies for anything theme-sensitive.

**Pattern:** Add variable definition in `index.css` → reference `var(--name)` in `App.css`.

### Mantine v6 Override Pattern (Existing Pattern)
Already established: use `.mantine-Component-part[data-variant="x"] { property: value !important; }`.

For Phase 3, the Mantine `<Loader>` component in `StatusIcon.tsx` uses hardcoded `color="blue"`. This renders as a Mantine blue spinner that doesn't match the accent theme. Can be overridden in App.css:

```css
/* Source: [VERIFIED: codebase inspection] */
.mantine-Loader-root {
  color: var(--accent) !important;
}
```

Or change the prop in `StatusIcon.tsx` to `color="var(--accent)"` — but CSS override is the established pattern and keeps changes CSS-only.

### Animation Pattern (Existing Pattern)
Existing `@keyframes fadeIn` uses `opacity: 0 + translateY(8px)` → `opacity: 1 + translateY(0)`. For state change cross-fades (D-07), the progress section currently mounts/unmounts with `{isDownloading && (...)}` — this means it appears/disappears instantly. Adding a wrapper element with `animation: fadeIn 0.3s ease` on mount achieves the cross-fade on entry.

The exit (download complete) is handled by the `useEffect` with a 500ms delay before hiding footer view — that's the current mechanism. The progress bar div disappears when `isDownloading` becomes false. A CSS fade-out on unmount requires either a React transition library (out of scope) or a CSS class toggle approach. The simplest approach consistent with D-07: apply `animation: fadeIn 0.3s ease` on the container div that wraps the progress bar — this handles entry. Exit already has the 500ms delay from the footer useEffect, which is sufficient.

---

## WCAG AA Findings

**[VERIFIED: computed from actual codebase color values via node contrast calculator]**

### Failures Identified

| Color Token | Current Value | Current Ratio | Target | Fix |
|-------------|--------------|---------------|--------|-----|
| `--text-muted` (dark) | `rgba(255,255,255,0.40)` | 3.77:1 | ≥4.5:1 | Change to `rgba(255,255,255,0.50)` → 5.37:1 |
| `--text-muted` (light) | `rgba(51,47,46,0.45)` | 2.30:1 | ≥4.5:1 | Change to `rgba(51,47,46,0.70)` → 4.75:1 |
| `--text-secondary` (light) | `#8C867E` | 3.14:1 | ≥4.5:1 | Change to `#6E6860` (darkened by 30) → 4.80:1 |
| `--banner-text` (light) | `#e65100` | 3.13:1 on banner bg | ≥4.5:1 | Change to `#bf360c` → 4.62:1 |

### Values That Already Pass

| Color Token | Current Value | Ratio | Status |
|-------------|--------------|-------|--------|
| `--text-primary` (dark) | `#FFFFFF` on `#0A0A0A` | 19.80:1 | PASS |
| `--text-secondary` (dark) | `#B3B3B3` on `#0A0A0A` | 9.44:1 | PASS |
| Accent button (both) | `#FFFFFF` on `#3B4A6B` | 8.83:1 | PASS — D-10 not needed |
| `--text-primary` (light) | `#332F2E` on `#F2EFE9` | 11.53:1 | PASS |
| `--banner-text` (dark) | `#ffb74d` on `#1A1A1A` | 10.06:1 | PASS |

**Key insight:** `#FFFFFF` on `#3B4A6B` already passes at 8.83:1 — D-10 (darken light mode accent button) is NOT required. The concern was unfounded; accent button text passes in both modes.

### Light Mode Secondary Text
`--text-secondary: #8C867E` at 3.14:1 fails. Minimum fix: `#6E6860` (4.80:1). This is a label/auxiliary color — slightly darker stays within Monolith's subdued palette intent. [VERIFIED: computed]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| CSS transitions | Custom JS animation | CSS `transition` + `@keyframes` |
| Contrast checking | Custom checker | Already computed — use verified values above |
| Exit animations | React unmount lifecycle | Accept: entry fade-in is sufficient; 500ms delay exists for exit |

---

## Common Pitfalls

### Pitfall 1: `--progress-glow` Already Referenced, Not Defined
**What goes wrong:** `.progress-fill { box-shadow: var(--progress-glow); }` exists in App.css (line 186). Without the variable defined, `box-shadow` computes to `none` — no error, just silent no-op.
**Fix:** Add to BOTH `.dark-mode` and `.light-mode` blocks in `index.css`.
**Values:**
```css
/* dark-mode */ --progress-glow: 0 0 8px rgba(59,74,107,0.5);
/* light-mode */ --progress-glow: 0 0 8px rgba(59,74,107,0.35);
```
[VERIFIED: codebase inspection of index.css and App.css]

### Pitfall 2: Progress Track Height Must Match Fill Height
**What goes wrong:** Bumping `.progress-fill` height to 6px but leaving `.progress-track { height: 4px }` means the fill overflows the track.
**Fix:** Both `.progress-track` and `.progress-fill` heights change to 6px together. Border-radius also bumps to 6px to maintain pill shape.

### Pitfall 3: Mantine Loader Stays Mantine Blue
**What goes wrong:** `StatusIcon.tsx` uses `<Loader size="sm" color="blue" />`. Mantine v6 maps "blue" to its own blue, not `--accent`. During download, spinner shows brand-blue instead of Monolith deep-blue.
**Fix:** CSS override in App.css:
```css
.mantine-Loader-root svg { color: var(--accent) !important; }
```
Or add a `.mantine-Loader-root` stroke override. Test both; Mantine's Loader uses SVG strokes.
[VERIFIED: codebase inspection of StatusIcon.tsx]

### Pitfall 4: `:active` on Touch Devices
**What goes wrong:** `:active` pseudo-class on mobile requires `:focus-within` or JS touchstart to persist. For desktop-primary app (Replit web), this is not a concern.
**Decision:** `:active` CSS is sufficient — this is a desktop web app.

### Pitfall 5: Scrollbar CSS Not Cross-Browser
**What goes wrong:** `::-webkit-scrollbar-*` only works in Chrome/Edge/Safari. Firefox uses `scrollbar-color` and `scrollbar-width`.
**Current state:** Only webkit rules exist. Firefox users see default scrollbar.
**Recommendation:** Add Firefox fallback for completeness:
```css
* { scrollbar-color: var(--scrollbar-thumb) transparent; scrollbar-width: thin; }
```
[VERIFIED: MDN-equivalent knowledge — ASSUMED: current Firefox scrollbar coverage gap]

### Pitfall 6: Light Mode Banner Text — Wrong Orange
**What goes wrong:** `#e65100` on the composited light banner background (#f3e8d6) achieves only 3.13:1 — fails AA.
**Fix:** Change `--banner-text` in `.light-mode` to `#bf360c` (4.62:1). Dark mode `#ffb74d` is fine at 10.06:1.

---

## Code Examples

### Button Hover Glow (INTR-01)
```css
/* Source: [VERIFIED: codebase — enhancing existing .btn-accent:hover rule] */
.btn-accent:hover:not(:disabled) {
  background: var(--accent-hover);
  box-shadow: var(--shadow-button), 0 0 12px rgba(59, 74, 107, 0.3);
  transform: translateY(-1px);
}

.btn-accent:active:not(:disabled) {
  background: var(--accent-active);
  box-shadow: var(--shadow-button), 0 0 12px rgba(59, 74, 107, 0.15);
  transform: translateY(0);
}
```

### Progress Glow Variables (INTR-02 / D-06)
```css
/* Source: [VERIFIED: index.css structure] */
/* In :root.dark-mode block: */
--progress-glow: 0 0 8px rgba(59, 74, 107, 0.5);

/* In :root.light-mode block: */
--progress-glow: 0 0 8px rgba(59, 74, 107, 0.35);
```

### Progress Height Bump (INTR-02 / D-05)
```css
/* Source: [VERIFIED: App.css lines 173-187] */
.progress-track {
  height: 6px;         /* was 4px */
  background: var(--progress-track);
  border-radius: 6px;  /* was 4px */
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 6px;  /* was 4px */
  transition: width 0.3s ease;
  box-shadow: var(--progress-glow);
}
```

### Downloading Pulse Refinement (INTR-04 / D-08)
```css
/* Source: [VERIFIED: App.css lines 327-335] */
@keyframes pulse {
  0%   { opacity: 1; }
  50%  { opacity: 0.7; }   /* was 0.6 */
  100% { opacity: 1; }
}

.downloading {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;  /* was 2s */
}
```

### Progress Section Fade-In (INTR-04 / D-07)
```css
/* Source: [ASSUMED: new class to add] */
.progress-section {
  animation: fadeIn 0.3s ease;
}
```
Apply `.progress-section` to the wrapper div containing the progress bar in App.tsx (line 330).

### WCAG Fixes (PLSH-02)
```css
/* Source: [VERIFIED: contrast calculations above] */
/* In :root.dark-mode: */
--text-muted: rgba(255, 255, 255, 0.50);    /* was 0.40 — fixes ratio: 5.37:1 */

/* In :root.light-mode: */
--text-muted: rgba(51, 47, 46, 0.70);       /* was 0.45 — fixes ratio: 4.75:1 */
--text-secondary: #6E6860;                  /* was #8C867E — fixes ratio: 4.80:1 */
--banner-text: #bf360c;                     /* was #e65100 — fixes ratio: 4.62:1 */
```

### Mantine Button Glow Override
```css
/* Source: [VERIFIED: existing Mantine override pattern in App.css] */
.mantine-Button-root[data-variant="filled"]:hover {
  background-color: var(--accent-hover) !important;
  box-shadow: var(--shadow-button), 0 0 12px rgba(59, 74, 107, 0.3) !important;
}

.mantine-Button-root[data-variant="filled"]:active {
  background-color: var(--accent-active) !important;
  box-shadow: var(--shadow-button), 0 0 12px rgba(59, 74, 107, 0.15) !important;
}
```

### Firefox Scrollbar Fallback (PLSH-03)
```css
/* Source: [ASSUMED: standard Firefox scrollbar API] */
* {
  scrollbar-color: var(--scrollbar-thumb) transparent;
  scrollbar-width: thin;
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| `opacity: 0.6` pulse | `opacity: 0.7` — less dramatic | Premium feel, less distracting |
| 4px progress bar | 6px | Glow reads better, still sleek |
| No glow on buttons | `box-shadow` halo | Tactile, premium hover feedback |
| `0.40` muted opacity | `0.50` (dark) / `0.70` (light) | WCAG AA compliance |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `.mantine-Loader-root svg` stroke is overridable via CSS color | Pitfall 3 | May need `stroke: var(--accent)` instead of `color`. Test in browser; minimal risk. |
| A2 | Firefox `scrollbar-color` property syntax is valid for CSS variables | Code Examples | Low risk — CSS custom properties in scrollbar-color are spec-valid; may not work in older Firefox. |
| A3 | `animation: fadeIn 0.3s ease` on progress container achieves D-07 requirement | Code Examples / INTR-04 | If user expects a cross-fade of content swapping rather than just entry fade, more complex implementation needed. Current reading of D-07 is entry cross-fade only. |

---

## Open Questions (RESOLVED)

1. **Mantine Loader override mechanism** — RESOLVED
   - Answer: Mantine v6 Oval loader renders `<svg stroke={color}>` as inline attribute. The CSS `color` property does NOT cascade to SVG `stroke`. The correct override is `.mantine-Loader-root { stroke: var(--accent) !important; }` targeting `stroke` directly on the SVG root element (Box renders SVG as the root). Verified via `client/node_modules/@mantine/core/esm/Loader/loaders/Oval.js` source.

2. **WCAG for `--text-secondary` dark mode** — RESOLVED
   - Answer: `#B3B3B3` on `#0A0A0A` = 9.44:1 — already passes. No change needed.

---

## Environment Availability

Step 2.6: SKIPPED — phase is CSS-only changes in `client/src/`. No external tools, services, or CLI utilities required beyond `npm run dev` (already available).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | none |
| Quick run command | `npm run build` (TypeScript compile check) |
| Full suite command | `npm run build` |

No automated test framework exists in this project. All validation is visual/manual via browser.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INTR-01 | Button glow on hover, dim on active | manual-visual | `npm run build` (compile only) | N/A |
| INTR-02 | Progress bar glows, 6px height, smooth width transition | manual-visual | `npm run build` | N/A |
| INTR-03 | Table row hover background shift | manual-visual | `npm run build` | N/A |
| INTR-04 | State cross-fade, pulse refinement | manual-visual | `npm run build` | N/A |
| PLSH-01 | Support banner styled correctly in both modes | manual-visual | `npm run build` | N/A |
| PLSH-02 | WCAG AA contrast — spot-check with browser DevTools | manual-devtools | `npm run build` | N/A |
| PLSH-03 | Scrollbar matches active theme | manual-visual | `npm run build` | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` — confirms no TypeScript errors from any TSX edits
- **Per wave merge:** Visual browser review in both dark and light modes
- **Phase gate:** All 5 success criteria visually confirmed before `/gsd-verify-work`

### Wave 0 Gaps
None — no test files to create. Build check is the only automated gate for a CSS-only phase.

---

## Security Domain

Not applicable. Phase 3 is CSS-only visual changes with no user input, authentication, data handling, or network requests. No ASVS categories apply.

---

## Sources

### Primary (HIGH confidence)
- `client/src/index.css` — [VERIFIED: codebase] Current variable definitions, current color values
- `client/src/App.css` — [VERIFIED: codebase] Current rules, existing animation keyframes, Mantine overrides
- `client/src/App.tsx` — [VERIFIED: codebase] Progress bar implementation, state management, isDownloading flow
- `client/src/components/StatusIcon.tsx` — [VERIFIED: codebase] Loader color prop
- WCAG contrast calculations — [VERIFIED: computed via node.js against actual hex values from codebase]

### Secondary (MEDIUM confidence)
- `.planning/phases/03-interactions-polish/03-CONTEXT.md` — User decisions D-01 through D-11

### Tertiary (LOW confidence)
- Firefox `scrollbar-color` API — [ASSUMED: based on training knowledge; verify at MDN]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — CSS-only, no new dependencies
- Architecture: HIGH — direct continuation of established patterns
- WCAG findings: HIGH — computed from actual color values
- Pitfalls: HIGH — identified from codebase inspection

**Research date:** 2026-04-13
**Valid until:** N/A — CSS values are stable; no dependency versioning concerns
