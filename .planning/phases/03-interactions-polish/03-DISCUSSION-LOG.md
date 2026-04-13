# Phase 3: Interactions & Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-13
**Phase:** 03-interactions-polish
**Areas discussed:** Glow intensity, Progress animation, State transitions, WCAG compliance

---

## Glow Intensity

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle halo | Soft box-shadow glow (0 0 12px accent at 30% opacity). Premium, understated. | ✓ |
| Pronounced ring | Visible glow ring (0 0 20px accent at 50% opacity). More dramatic. | |
| You decide | Claude picks. | |

**User's choice:** Subtle halo
**Notes:** Matches Monolith's understated aesthetic.

| Option | Description | Selected |
|--------|-------------|----------|
| Glow dims on press | Active state keeps reduced glow (opacity 30% → 15%). Tactile. | ✓ |
| No glow on press | Active snaps to flat (darken + translateY only). | |
| You decide | Claude picks. | |

**User's choice:** Glow dims on press
**Notes:** Button "absorbs" the press feel.

| Option | Description | Selected |
|--------|-------------|----------|
| Flat bg shift only | Keep current var(--bg-card-hover). Glow reserved for actionable elements. | ✓ |
| Faint left-edge accent | 3px left border in accent color on hover. | |
| Subtle row glow | Light box-shadow glow on hovered row. | |

**User's choice:** Flat bg shift only
**Notes:** Tables stay clean and scannable. Glow reserved for buttons and progress.

---

## Progress Animation

| Option | Description | Selected |
|--------|-------------|----------|
| Steady accent glow | Constant box-shadow glow on fill bar. Width transitions smoothly. | ✓ |
| Shimmer sweep | CSS gradient animation sweeps left-to-right across fill bar. | |
| Pulsing glow | Glow oscillates in/out around the bar. | |

**User's choice:** Steady accent glow
**Notes:** Clean, non-distracting. Matches subtle halo decision.

| Option | Description | Selected |
|--------|-------------|----------|
| Keep 4px | Minimal, elegant. Glow subtle. | |
| Bump to 6px | Glow reads better. Still sleek. | ✓ |
| You decide | Claude picks. | |

**User's choice:** Bump to 6px
**Notes:** Better glow visibility without being chunky.

---

## State Transitions

| Option | Description | Selected |
|--------|-------------|----------|
| Opacity cross-fade | Elements fade out/in (opacity 0→1, 0.3s ease). Matches existing pattern. | ✓ |
| Fade + subtle slide | Opacity fade + 4-8px translateY. More polished but more complex. | |
| You decide | Claude picks. | |

**User's choice:** Opacity cross-fade
**Notes:** Clean, consistent with existing 0.3s transitions throughout app.

| Option | Description | Selected |
|--------|-------------|----------|
| Keep pulse, refine timing | Tighten from 0.6→0.7 opacity, 2s→1.5s. Less dramatic, more premium. | ✓ |
| Replace with steady glow | Drop pulse entirely. Rows show steady accent status icon. | |
| You decide | Claude picks. | |

**User's choice:** Keep pulse, refine timing
**Notes:** Refined pulse (0.7 floor, 1.5s cycle) pairs well with progress bar glow.

---

## WCAG Compliance

| Option | Description | Selected |
|--------|-------------|----------|
| Bump to pass AA | Increase muted text opacity to hit 4.5:1. May shift ~40% → ~55-60%. | ✓ |
| AA for body, AA-Large for small | Body meets AA, small text meets AA-Large (3:1) only. | |
| Strict AA everywhere | Every text element at every size meets 4.5:1. | |

**User's choice:** Bump to pass AA
**Notes:** Slightly less muted but fully accessible.

| Option | Description | Selected |
|--------|-------------|----------|
| White text, darken button bg slightly | Keep white text. Darken accent for light mode if needed (e.g. #2F3D58). | ✓ |
| Switch to dark text on light mode | Light mode buttons use dark text (#332F2E). | |
| You decide | Claude audits and picks. | |

**User's choice:** White text, darken button bg slightly
**Notes:** Minimal visual change. Keep consistent white button text across modes.

| Option | Description | Selected |
|--------|-------------|----------|
| Keep orange | Orange draws attention to support CTA. Distinct from UI accent. | ✓ |
| Align to Deep Blue | Match banner to Monolith accent. More cohesive but less pop. | |
| You decide | Claude picks. | |

**User's choice:** Keep orange
**Notes:** Intentional CTA color. Verify AA contrast.

---

## Claude's Discretion

- Exact glow radius tuning within the "subtle" intensity level
- Scrollbar styling refinements
- Any unstyled surfaces discovered during implementation

## Deferred Ideas

None — discussion stayed within phase scope.
