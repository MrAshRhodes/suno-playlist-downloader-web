# Phase 1: CSS Variable Foundation - Research

**Researched:** 2026-04-11
**Domain:** CSS custom properties, React inline style refactoring, theme switching via classList
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| THME-01 | All inline `theme === 'dark' ? ...` ternaries in App.tsx extracted to CSS custom properties | Full ternary inventory documented below; all 25+ occurrences mapped to existing or new variables |
| THME-05 | `document.documentElement.className` clobber bug fixed — use `classList`, not assignment | Bug confirmed in App.tsx line 217; fix pattern documented; `useDarkMode` hook already uses `classList` correctly |

</phase_requirements>

---

## Summary

Phase 1 is a pure structural refactoring with zero visual change. The current App.tsx contains approximately 25 inline `theme === 'dark' ? ... : ...` ternaries applied as inline `style` props. These must be replaced with CSS custom property references (`var(--token)`). In parallel, a one-line bug in the theme-switching `useEffect` (line 217) must be fixed — it uses `.className =` assignment which clobbers any other classes on `<html>`.

The CSS token infrastructure is partially in place: `index.css` already declares `:root.dark-mode` and `:root.light-mode` blocks with 14 variables. The work is: (1) add ~10 missing tokens to both blocks, (2) replace all inline ternaries with `var(--token)` references, (3) fix the `useEffect` clobber bug, and (4) remove the `document.body.style.backgroundColor/color` direct assignments.

A subtlety: `useDarkMode.ts` already implements `classList` correctly. The bug is a *second* redundant `useEffect` in App.tsx (lines 214-221) that runs alongside the hook and overwrites both the class assignment and body styles directly. The fix removes or replaces the body of that `useEffect`.

**Primary recommendation:** Add 10 new CSS tokens to `index.css`, replace inline ternaries in App.tsx with `var()`, fix the `useEffect` body to use `classList` and drop `body.style.*` assignments.

---

## Existing CSS Token Inventory

### Variables already in `index.css` (usable without addition)

| Variable | Light value | Dark value |
|----------|-------------|------------|
| `--background-color` | `#f5f5f7` | `#1a1a1a` |
| `--text-color` | `#1d1d1f` | `#f5f5f7` |
| `--text-secondary` | `#86868b` | `#a1a1a6` |
| `--card-background` | `#ffffff` | `#2c2c2e` |
| `--border-color` | `rgba(0,0,0,0.1)` | `rgba(255,255,255,0.1)` |
| `--hover-color` | `rgba(0,0,0,0.05)` | `rgba(255,255,255,0.05)` |
| `--shadow-color` | `rgba(0,0,0,0.06)` | `rgba(0,0,0,0.3)` |
| `--progress-bg` | `rgba(0,0,0,0.05)` | `rgba(255,255,255,0.1)` |
| `--button-bg` | `#f5f5f7` | `#2c2c2e` |
| `--header-bg` | `rgba(255,255,255,0.8)` | `rgba(40,40,40,0.8)` |
| `--scrollbar-thumb` | `rgba(0,0,0,0.2)` | `rgba(255,255,255,0.2)` |

[VERIFIED: client/src/index.css lines 39-69]

### New variables required (not yet declared)

| Variable | Light value | Dark value | Replaces |
|----------|-------------|------------|---------|
| `--accent-color` | `#0071e3` | `#1a82e2` | Info icon color, badge bg, button bg, progress fill |
| `--input-bg` | `#ffffff` | `#3a3a3c` | URL input `backgroundColor` |
| `--text-secondary-muted` | `#666` | `rgba(255,255,255,0.7)` | Column header color |
| `--text-tertiary` | `rgba(0,0,0,0.3)` | `rgba(255,255,255,0.5)` | Tag text color |
| `--button-shadow` | `none` | `0 2px 5px rgba(0,0,0,0.2)` | CTA button `boxShadow` |
| `--badge-shadow` | `none` | `0 1px 3px rgba(0,0,0,0.3)` | Badge `boxShadow` |
| `--progress-fill` | `#0071e3` | `#1a82e2` | Progress bar fill `backgroundColor` |
| `--body-bg` | `#f5f5f7` | `#1a1a1a` | `document.body.style.backgroundColor` → CSS only |
| `--body-text` | `#1d1d1f` | `#f5f5f7` | `document.body.style.color` → CSS only |
| `--text-on-accent` | `#ffffff` | `#ffffff` | Button and badge text (same both modes) |

[VERIFIED: client/src/App.tsx — full ternary inventory below]

**Note:** `--body-bg` and `--body-text` are applied via `body { background-color: var(--body-bg); color: var(--body-text); }` in App.css or index.css, replacing the direct `document.body.style.*` assignments. `App.css` already sets `body { background-color: var(--background-color); color: var(--text-color); }` so `--background-color` and `--text-color` already cover this — no new variables needed for body. The `document.body.style.*` lines simply need removal.

---

## Complete Ternary Inventory (App.tsx)

Every `theme === 'dark' ? ... : ...` occurrence, with line number, replacement, and whether the variable already exists:

| Line | Property | Dark value | Light value | Replacement | Exists? |
|------|----------|------------|-------------|-------------|---------|
| 217 | `document.documentElement.className` | `'dark-mode'` | `'light-mode'` | `classList` fix (not a style prop) | — |
| 219 | `document.body.style.backgroundColor` | `#1a1a1a` | `#f5f5f7` | Remove — App.css covers this | Yes (via App.css) |
| 220 | `document.body.style.color` | `#f5f5f7` | `#1d1d1f` | Remove — App.css covers this | Yes (via App.css) |
| 229 | wrapper div `backgroundColor` | `#1a1a1a` | `#f5f5f7` | `var(--background-color)` | Yes |
| 230 | wrapper div `color` | `#f5f5f7` | `#1d1d1f` | `var(--text-color)` | Yes |
| 253 | theme button `color` | `#f5f5f7` | `#1d1d1f` | `var(--text-color)` | Yes |
| 263 | info box `border` | `1px solid rgba(255,255,255,0.1)` | `1px solid #e0e0e0` | `1px solid var(--border-color)` | Yes |
| 265 | info box `backgroundColor` | `#2c2c2e` | `#ffffff` | `var(--card-background)` | Yes |
| 267 | info icon `color` | `#1a82e2` | `#0071e3` | `var(--accent-color)` | New |
| 270 | info text `color` | `rgba(255,255,255,0.9)` | `inherit` | `var(--text-color)` | Yes |
| 287 | URL input `border` | `1px solid rgba(255,255,255,0.2)` | `1px solid #ccc` | `1px solid var(--border-color)` | Yes |
| 288 | URL input `backgroundColor` | `#3a3a3c` | `#ffffff` | `var(--input-bg)` | New |
| 289 | URL input `color` | `#f5f5f7` | `#1d1d1f` | `var(--text-color)` | Yes |
| 300 | "Get playlist" button `backgroundColor` | `#1a82e2` | `#0071e3` | `var(--accent-color)` | New |
| 306 | "Get playlist" button `boxShadow` | `0 2px 5px rgba(0,0,0,0.2)` | `none` | `var(--button-shadow)` | New |
| 330–347 (×4 th) | column header `color` | `rgba(255,255,255,0.7)` | `#666` | `var(--text-secondary-muted)` | New |
| 331–348 (×4 th) | column header `borderBottom` | `1px solid rgba(255,255,255,0.1)` | `1px solid #eee` | `1px solid var(--border-color)` | Yes |
| 317 | song table container `border` | `rgba(255,255,255,0.1)` | `#e0e0e0` | `var(--border-color)` | Yes |
| 322 | song table container `backgroundColor` | `#2c2c2e` | `#ffffff` | `var(--card-background)` | Yes |
| 367 | table row `borderBottom` | `1px solid rgba(255,255,255,0.1)` | `1px solid #eee` | `1px solid var(--border-color)` | Yes |
| 369 | table row `color` | `#f5f5f7` | `inherit` | `var(--text-color)` | Yes |
| 382 | badge `backgroundColor` | `#1a82e2` | `#0071e3` | `var(--accent-color)` | New |
| 388 | badge `boxShadow` | `0 1px 3px rgba(0,0,0,0.3)` | `none` | `var(--badge-shadow)` | New |
| 393 | tag text `color` | `rgba(255,255,255,0.5)` | `#666` | `var(--text-tertiary)` | New |
| 420 | "Download as ZIP" button `backgroundColor` | `#1a82e2` | `#0071e3` | `var(--accent-color)` | New |
| 428 | "Download as ZIP" button `boxShadow` | `0 2px 5px rgba(0,0,0,0.2)` | `none` | `var(--button-shadow)` | New |
| 441 | download % text `color` | `rgba(255,255,255,0.8)` | `inherit` | `var(--text-color)` | Yes |
| 445 | progress track `backgroundColor` | `rgba(255,255,255,0.1)` | `#eee` | `var(--progress-bg)` | Yes |
| 454 | progress fill `backgroundColor` | `#1a82e2` | `#0071e3` | `var(--progress-fill)` | New |
| 466 | footer `borderTop` | `1px solid rgba(255,255,255,0.1)` | `1px solid #eee` | `1px solid var(--border-color)` | Yes |
| 473 | footer text `color` | `rgba(255,255,255,0.6)` | `#666` | `var(--text-secondary-muted)` | New |
| 494 | footer text `color` | `rgba(255,255,255,0.6)` | `#666` | `var(--text-secondary-muted)` | New |

[VERIFIED: client/src/App.tsx — full read]

**Total ternaries:** ~31 occurrences (some repeat variables; 4 `th` elements share same pattern)
**New variables needed:** 8 distinct new tokens (accent-color, input-bg, text-secondary-muted, text-tertiary, button-shadow, badge-shadow, progress-fill, text-on-accent)

---

## Architecture Patterns

### Theme Application Pattern (current + target)

**Current (buggy):** App.tsx has a `useEffect` that calls both:
```ts
// Line 217 — clobbers other classes
document.documentElement.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
// Lines 219-220 — redundant with App.css
document.body.style.backgroundColor = ...
document.body.style.color = ...
```

`useDarkMode.ts` separately also updates classes via `classList` correctly (lines 35-43 in the hook). So there are TWO places writing the theme class — the hook (correct) and the App.tsx useEffect (buggy, clobbers).

**Target:** App.tsx `useEffect` body becomes:
```ts
// Fix: classList, not assignment
document.documentElement.classList.remove('dark-mode', 'light-mode');
document.documentElement.classList.add(theme === 'dark' ? 'dark-mode' : 'light-mode');
// Remove body.style.* lines — App.css handles this via var(--background-color) / var(--text-color)
```

[VERIFIED: client/src/App.tsx lines 214-221, client/src/hooks/useDarkMode.ts lines 35-43, client/src/App.css lines 4-7]

### CSS Custom Property Replacement Pattern

**Before:**
```tsx
style={{ backgroundColor: theme === 'dark' ? '#2c2c2e' : '#ffffff' }}
```

**After:**
```tsx
style={{ backgroundColor: 'var(--card-background)' }}
```

For properties where the CSS variable needs a full value with units (borders):
```tsx
// Before
style={{ border: theme === 'dark' ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e0e0e0" }}
// After
style={{ border: "1px solid var(--border-color)" }}
```

### New Token Declarations

Add to `:root.dark-mode` block in `index.css`:
```css
:root.dark-mode {
  --accent-color: #1a82e2;
  --input-bg: #3a3a3c;
  --text-secondary-muted: rgba(255, 255, 255, 0.7);
  --text-tertiary: rgba(255, 255, 255, 0.5);
  --text-on-accent: #ffffff;
  --button-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  --badge-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  --progress-fill: #1a82e2;
}
```

Add to `:root.light-mode` block in `index.css`:
```css
:root.light-mode {
  --accent-color: #0071e3;
  --input-bg: #ffffff;
  --text-secondary-muted: #666;
  --text-tertiary: rgba(0, 0, 0, 0.3);
  --text-on-accent: #ffffff;
  --button-shadow: none;
  --badge-shadow: none;
  --progress-fill: #0071e3;
}
```

[ASSUMED] The `--text-on-accent` token is identical in both modes (`#ffffff`) — it can be declared once in `:root` rather than duplicated in both theme blocks, but declaring in both is safe and consistent.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme-specific colors | Inline ternaries | CSS custom properties | Native browser support, zero JS overhead on re-render |
| Placeholder styling | JS-injected `::placeholder` (invalid in inline styles) | CSS class (already `dark-placeholder`/`light-placeholder`) | `::placeholder` pseudo-element cannot be set via `style` prop |
| Body background | `document.body.style.backgroundColor` | `body { background-color: var(--background-color); }` in App.css | App.css already does this — JS assignment overrides it unnecessarily |

**Key insight:** The `::placeholder` ternary on line 290-293 (`"::placeholder": { color: ... }`) is dead code — inline style objects don't support pseudo-elements. The existing CSS class approach (`className={theme === 'dark' ? 'dark-placeholder' : 'light-placeholder'}`) already handles this correctly and should be left unchanged.

---

## Common Pitfalls

### Pitfall 1: `useEffect` clobber still present after fix
**What goes wrong:** Fixing only the `className =` line while leaving `body.style.*` assignments means body styles are set by JS inline, overriding the CSS variable-based declarations in App.css on every render.
**How to avoid:** Remove all three lines from the App.tsx `useEffect` (217, 219, 220) and rely on App.css + CSS variables entirely. The hook already applies the class.

### Pitfall 2: Double class-writing (hook + App.tsx useEffect)
**What goes wrong:** Both `useDarkMode.ts` and App.tsx write the `dark-mode`/`light-mode` class. After the fix, App.tsx `useEffect` will run *after* the hook's `useEffect` and could re-apply redundantly. They won't conflict if both use `classList`, but the App.tsx `useEffect` is entirely redundant once body styles are removed.
**How to avoid:** After removing `body.style.*` from App.tsx's useEffect, evaluate whether the useEffect can be removed entirely. The hook handles class application. If no other App.tsx-specific side effects are needed, remove the whole `useEffect` block (lines 214-221).
**Warning signs:** Theme flicker or double-class toggle in React DevTools.

### Pitfall 3: `border-color` value mismatch
**What goes wrong:** The existing `--border-color` in dark mode is `rgba(255,255,255,0.1)` but some inline ternaries use `rgba(255,255,255,0.2)` (URL input border). Using `var(--border-color)` for both would visually change the input border opacity.
**How to avoid:** The UI-SPEC maps both to `var(--border-color)`. Confirm this is intentional (light unification) before applying. If the input border must stay at 0.2 opacity, a separate `--input-border-color` token is needed.
**Decision:** UI-SPEC maps URL input border to `1px solid var(--border-color)` — treat as intentional consolidation. [CITED: 01-UI-SPEC.md line 188]

### Pitfall 4: Footer link colors not in ternary map but hardcoded
**What goes wrong:** Footer `<a>` tags have `color: "#0071e3"` hardcoded (lines 484, 499, 509) without a ternary. These are not inline ternaries but also not using variables.
**How to avoid:** These are out of scope for THME-01 (which targets `theme === 'dark' ? ...` ternaries). Leave hardcoded links unchanged in Phase 1. Flag for Phase 2 token cleanup.

### Pitfall 5: `--text-secondary-muted` vs existing `--text-secondary`
**What goes wrong:** `--text-secondary` already exists but has different values (`#86868b` light, `#a1a1a6` dark) than what the column headers use (`#666` / `rgba(255,255,255,0.7)`). Using the wrong variable produces incorrect header colors.
**How to avoid:** Introduce `--text-secondary-muted` as a distinct token per the UI-SPEC. Do not reuse `--text-secondary`.

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| `element.className = 'theme'` | `classList.remove(...); classList.add(...)` | Assignment clobbers other classes; classList is additive and safe |
| Inline ternary style props | CSS custom properties + `var()` | CSS vars react to class changes without React re-renders; better separation |
| `body.style.backgroundColor` JS assignment | `body { background-color: var(--token); }` in CSS | CSS declaration respects cascade; JS assignment creates specificity override |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `--text-on-accent: #ffffff` is same in both modes and can be declared once in `:root` | Architecture Patterns | Low — even if declared in both blocks it works; cosmetic only |
| A2 | App.tsx `useEffect` (lines 214-221) is safe to remove entirely after body.style.* removal, since `useDarkMode` already applies the class | Common Pitfalls — Pitfall 2 | Medium — if there's a timing edge case where hook fires after paint, the App.tsx effect was a safeguard. In practice React batches useEffects so both fire before browser paint. |
| A3 | URL input border consolidation to `var(--border-color)` (0.1 opacity) from existing 0.2 is intentional per UI-SPEC | Common Pitfalls — Pitfall 3 | Low — UI-SPEC explicitly documents this mapping; visual change is subtle |

---

## Open Questions

1. **Should the App.tsx `useEffect` (lines 214-221) be removed entirely or just fixed?**
   - What we know: `useDarkMode.ts` already applies the class correctly via `classList`. The App.tsx effect is redundant for class application and harmful for body styles.
   - What's unclear: Whether the original developer intended the App.tsx effect as a safety net.
   - Recommendation: Remove the App.tsx `useEffect` body entirely (keep the block empty or remove it). The hook is sufficient. Simplifies code.

2. **Is `--text-secondary-muted` the right name or should it be `--column-header-color`?**
   - What we know: UI-SPEC uses `--text-secondary-muted`. The value is used for column headers AND footer text.
   - Recommendation: Use `--text-secondary-muted` per UI-SPEC. Semantic naming is better than element-specific.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — visual/manual verification only |
| Config file | none |
| Quick run command | `yarn dev` + manual browser check |
| Full suite command | Manual check both themes in browser |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| THME-01 | No `theme === 'dark' ?` in App.tsx | grep assertion | `grep -c "theme === 'dark'" client/src/App.tsx` (expect 0) | ❌ Wave 0 — grep check only |
| THME-05 | `classList` used, not `.className =` | grep assertion | `grep -c "documentElement.className =" client/src/App.tsx` (expect 0) | ❌ Wave 0 — grep check only |
| THME-01 | Visual parity — both themes render correctly | manual | yarn dev + browser toggle | N/A |

### Wave 0 Gaps
- No automated test infrastructure exists. All verification is manual (yarn dev + browser) plus grep checks.
- Grep check: `grep -c "theme === 'dark'" client/src/App.tsx` should return 0 post-implementation.
- Grep check: `grep -c "documentElement.className =" client/src/App.tsx` should return 0 post-implementation.
- Grep check: `grep -c "document.body.style" client/src/App.tsx` should return 0 post-implementation.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 1 is code/config changes only (CSS and TypeScript edits). No external tools, services, or CLIs required beyond `yarn dev` which is already confirmed working.

---

## Security Domain

Step skipped — no authentication, session management, input handling changes, or cryptography involved. Phase 1 is CSS token declarations and JSX `style` prop refactoring only.

---

## Sources

### Primary (HIGH confidence)
- `client/src/App.tsx` — Full read; all ternaries inventoried by line number
- `client/src/index.css` — Full read; all existing tokens catalogued
- `client/src/App.css` — Full read; body background already handled via CSS vars
- `client/src/hooks/useDarkMode.ts` — Full read; classList implementation verified
- `.planning/phases/01-css-variable-foundation/01-UI-SPEC.md` — Full read; token names, values, migration map

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` — THME-01 and THME-05 definitions
- `.planning/ROADMAP.md` — Phase 1 success criteria

---

## Metadata

**Confidence breakdown:**
- Ternary inventory: HIGH — sourced from direct file read with line numbers
- Token mapping: HIGH — sourced from UI-SPEC and direct file read
- Fix pattern: HIGH — bug confirmed at App.tsx line 217, fix pattern from UI-SPEC
- Architecture: HIGH — both files read in full

**Research date:** 2026-04-11
**Valid until:** Stable — until App.tsx or index.css are modified
