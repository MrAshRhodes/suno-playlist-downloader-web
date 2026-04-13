# Phase 3: Interactions & Polish - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Every interactive element responds with intent, the app passes WCAG AA, and no surface is left unstyled. This phase adds micro-animations (button glow, progress glow, state cross-fades), hover/active states, WCAG AA contrast compliance, and final polish (support banner, scrollbar). No new features, no layout changes, no functional modifications.

</domain>

<decisions>
## Implementation Decisions

### Glow Intensity
- **D-01:** Button hover uses subtle halo glow — `box-shadow: 0 0 12px rgba(59,74,107,0.3)` combined with existing shadow. Premium, understated.
- **D-02:** Button active/pressed dims the glow — opacity drops from 30% to 15%. Feels like the button "absorbs" the press.
- **D-03:** Table row hover stays flat background shift only (`var(--bg-card-hover)`). Glow is reserved for actionable elements (buttons, progress bar). No glow on rows.

### Progress Animation
- **D-04:** Progress bar fill gets a steady accent glow — `box-shadow: 0 0 8px rgba(59,74,107,0.5)`. No shimmer, no pulse. Width transitions smoothly via existing 0.3s ease.
- **D-05:** Progress bar height bumps from 4px to 6px. Glow reads better at 6px, still sleek.
- **D-06:** Define `--progress-glow` CSS variable (already referenced in `.progress-fill` but not yet defined in `index.css`).

### State Transitions
- **D-07:** State changes (loading → downloading → complete) use opacity cross-fade (0 → 1, 0.3s ease). No slide. Clean, matches the existing 0.3s transition pattern throughout the app.
- **D-08:** Keep the `.downloading` pulse animation but refine timing — tighten from `opacity: 0.6` to `0.7`, speed from `2s` to `1.5s`. Less dramatic, more premium.

### WCAG Compliance
- **D-09:** Bump muted text opacity until all color combinations pass WCAG AA (4.5:1 minimum). Expected shift from ~40% to ~55-60% opacity. Slightly less muted but fully accessible.
- **D-10:** If accent button text (#FFFFFF on #3B4A6B) fails contrast on light mode, darken the accent for light mode buttons only (e.g., `#2F3D58` instead of `#3B4A6B`). Keep white text, minimal visual change.
- **D-11:** Support banner keeps orange accent tones (#ffb74d dark, #e65100 light). Orange is intentional for CTA visibility — distinct from UI accent. Verify these pass AA contrast.

### Claude's Discretion
- Exact glow radius values can be tuned during implementation as long as they match the decided intensity level (subtle, not pronounced)
- Scrollbar styling refinements — already themed, just verify it matches both modes
- Any additional unstyled surfaces discovered during implementation — apply Monolith treatment consistent with existing patterns

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `~/Downloads/monolith_design_system_document.html` — The Monolith design system spec. Primary visual reference.

### Project Context
- `.planning/PROJECT.md` — Core value (visual only, no functional changes), constraints (Mantine v6, Replit, client-only)
- `.planning/REQUIREMENTS.md` — Phase 3 requirements: INTR-01, INTR-02, INTR-03, INTR-04, PLSH-01, PLSH-02, PLSH-03
- `.planning/ROADMAP.md` — Phase 3 success criteria (5 items)

### Prior Phase Context
- `.planning/phases/01-core-monolith/01-CONTEXT.md` — Phase 1 decisions (D-08: hover/active color values, D-10: transition timing, D-11: Mantine override pattern)

### Codebase
- `.planning/codebase/CONVENTIONS.md` — Naming patterns, import order, code style
- `.planning/codebase/STRUCTURE.md` — Directory layout

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/src/App.css` — All interactive styles already exist (`.btn-accent`, `.song-table`, `.progress-track/.progress-fill`, `.theme-toggle`). Phase 3 enhances these, doesn't create new classes.
- `client/src/index.css` — CSS variable system with `--accent-glow`, `--bg-card-hover`, `--shadow-button` already defined. Missing: `--progress-glow` (referenced in CSS but no value).
- `@keyframes fadeIn` and `@keyframes pulse` — Existing animations to build on/refine.

### Established Patterns
- **CSS variables drive all theming** — classList on `<html>` swaps variable sets. All enhancements go through this system.
- **Mantine v6 overrides via `!important`** — Proven pattern for `.mantine-Button-root`, `.mantine-Progress-bar`, `.mantine-Badge-root`.
- **0.3s ease transitions** — Consistent timing throughout. Phase 3 should maintain this.
- **No CSS modules** — Plain CSS classes in App.css/index.css.

### Integration Points
- `client/src/index.css` — Add `--progress-glow` variable to both `.dark-mode` and `.light-mode` blocks
- `client/src/App.css` — Enhance `.btn-accent:hover`, `.btn-accent:active`, `.progress-fill`, `.downloading` keyframe, muted text opacity values
- `client/src/App.css` — Mantine override section may need additional overrides for progress glow

</code_context>

<specifics>
## Specific Ideas

- **Progress glow variable:** `--progress-glow: 0 0 8px rgba(59,74,107,0.5)` (dark), `--progress-glow: 0 0 8px rgba(59,74,107,0.35)` (light, slightly softer)
- **Muted text target:** Current ~40% opacity → ~55-60% opacity for AA compliance. Test with Chrome DevTools contrast checker.
- **Button hover enhancement:** Add glow to existing hover rule, keep `translateY(-1px)` and `background: var(--accent-hover)`.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-interactions-polish*
*Context gathered: 2026-04-13*
