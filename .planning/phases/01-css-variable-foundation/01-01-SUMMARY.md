---
phase: 01-css-variable-foundation
plan: 01
subsystem: client/src
tags: [css-variables, theme, refactor, bug-fix]
dependency_graph:
  requires: []
  provides: [css-variable-foundation]
  affects: [client/src/index.css, client/src/App.tsx]
tech_stack:
  added: []
  patterns: [css-custom-properties, var-references]
key_files:
  created: []
  modified:
    - client/src/index.css
    - client/src/App.tsx
decisions:
  - "Retained theme var in App.tsx (needed for icon toggle and placeholder className)"
  - "Removed ::placeholder inline style (dead code — pseudo-elements cannot be set via inline styles)"
  - "Removed redundant useEffect entirely (useDarkMode hook already handles classList correctly)"
metrics:
  duration: ~5 minutes
  completed: 2026-04-12T07:22:52Z
  tasks_completed: 2
  tasks_total: 3
  files_modified: 2
---

# Phase 01 Plan 01: CSS Variable Foundation Summary

**One-liner:** Extracted 31 inline `theme === 'dark'` ternaries from App.tsx into 9 new CSS custom properties, and fixed the `className =` clobber bug in the theme-switching useEffect.

## What Was Built

**Task 1 (e385e3e):** Added 9 new CSS custom properties to both `:root.light-mode` and `:root.dark-mode` blocks in `client/src/index.css`:

- `--accent-color` — blue accent for buttons, badges, icons
- `--input-bg` — URL input background
- `--text-secondary-muted` — table header and footer muted text
- `--text-tertiary` — song tag text
- `--text-on-accent` — text on accent-colored elements
- `--button-shadow` — box shadow on primary buttons
- `--badge-shadow` — box shadow on model version badge
- `--progress-fill` — progress bar fill color
- `--progress-glow` — progress bar glow effect (dark mode only)

**Task 2 (9d7bfe1):** Replaced all 31 inline ternaries in `client/src/App.tsx` with `var(--token)` references and:

- Removed the `useEffect` that set `document.documentElement.className =` (clobber bug, THME-05)
- Removed `document.body.style.backgroundColor` and `document.body.style.color` assignments
- Removed dead `::placeholder` inline style property
- Retained `theme` variable for 2 non-style usages: icon toggle and placeholder className

**Task 3:** Checkpoint — awaiting human visual verification in browser.

## Acceptance Criteria Status

| Criterion | Status |
|-----------|--------|
| `grep -c "theme === 'dark'" App.tsx` = 2 | PASS (icon toggle + className) |
| `grep -c "documentElement.className ="` = 0 | PASS |
| `grep -c "document.body.style"` = 0 | PASS |
| All 9 tokens appear twice in index.css | PASS |
| `yarn build` exits 0 | PASS |
| Visual parity in both themes | Pending (Task 3 checkpoint) |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All style values are wired to CSS custom properties with both light and dark values defined.

## Threat Flags

None. Replacing inline JS DOM manipulation with CSS var() references reduces JS execution surface — net security improvement per T-01-02 in the plan's threat model.

## Self-Check

- [x] `client/src/index.css` modified with 9 new tokens per theme block
- [x] `client/src/App.tsx` modified — 31 ternaries replaced, clobber useEffect removed
- [x] Commit e385e3e exists (Task 1)
- [x] Commit 9d7bfe1 exists (Task 2)
- [x] Build passes (dist output confirmed)

## Self-Check: PASSED
