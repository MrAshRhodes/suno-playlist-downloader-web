---
phase: 06-premium-title-banner-and-modern-step-cards
plan: "01"
subsystem: client-ui
tags: [hero-banner, step-cards, visual, mantine-v6, monolith-design]
dependency_graph:
  requires: []
  provides: [hero-banner-ui, step-card-ui]
  affects: [client/src/App.tsx, client/src/App.css]
tech_stack:
  added: []
  patterns: [monolith-card, hero-overlay, step-number-circle]
key_files:
  created: []
  modified:
    - client/src/App.tsx
    - client/src/App.css
decisions:
  - Hero text hardcoded white (not var(--text-primary)) — renders over dark image in both themes
  - Step numbers use solid var(--accent) background, no gradients (D-04 constraint)
  - ThemeToggle moved into .hero-actions (absolute top-right inside hero banner)
  - IconVinyl and IconInfoCircle removed (no longer referenced after header/info-banner removal)
  - Inner table card in Step 2 uses .song-table-card with 16px radius and border-subtle
metrics:
  duration: "~10 minutes"
  completed: "2026-04-14T09:17:26Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 06 Plan 01: Premium Title Banner and Modern Step Cards Summary

Hero banner image replaces old app-header and info-banner; all 3 step sections wrapped in monolith-card containers with solid-accent numbered circle indicators.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Hero banner — replace app-header and info-banner | e95a65b | App.tsx, App.css |
| 2 | Step card wrappers with numbered heading indicators | 9ef4ace | App.tsx, App.css |

## What Was Built

**Task 1 — Hero banner:**
- Added `import heroBannerImg from './assets/hero-banner.png'` to App.tsx
- Removed `IconVinyl` and `IconInfoCircle` imports (unused after replacement)
- Replaced `<header className="app-header">` and `.info-banner` div with a single `.hero-banner` container
- Hero layout: full-width 220px tall image with `.hero-overlay` gradient, `.hero-content` bottom-aligned title+subtitle, `.hero-actions` top-right ThemeToggle
- Hero text is hardcoded white with text-shadow for legibility over the image in both themes
- Removed CSS: `.app-header`, `.app-logo`, `.app-logo img`, `.app-logo-fallback`, `.app-title` (standalone), `.info-banner`, `.info-banner p`
- Added CSS: `.hero-banner`, `.hero-banner-img`, `.hero-overlay`, `.hero-content`, `.hero-content .app-title`, `.hero-subtitle`, `.hero-actions`
- Support banner left completely untouched above the hero (D-05)

**Task 2 — Step cards:**
- Wrapped all 3 step sections in `.step-card.monolith-card` containers with `.step-heading` rows
- Each heading row has a `.step-number` circle (solid `var(--accent)`, no gradients) + `<h3>` with prefix numbers removed
- Step 2 inner table wrapped in `.monolith-card.song-table-card` (16px radius, border-subtle color)
- Old `marginBottom: "24px"` inline styles removed from step content divs — `.step-card` provides 20px bottom margin
- Added CSS: `.step-card`, `.step-heading`, `.step-number`, `.step-heading .section-heading`, `.song-table-card`

## Decisions Made

- Hero text hardcoded `#ffffff` (not `var(--text-primary)`) — the overlay is always dark regardless of theme, so white text is correct in both modes
- `.step-number` uses `background: var(--accent)` (solid `#3B4A6B`) — D-04 explicitly prohibits gradients
- ThemeToggle moved into hero rather than being removed — preserves existing theme-switching functionality
- `IconVinyl` / `IconInfoCircle` safely removed after verifying no other usages in the file

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None. This is a CSS/JSX-only change with a static local PNG asset. No new inputs, network calls, auth paths, or trust boundaries introduced.

## Self-Check: PASSED

- `client/src/App.tsx` — contains hero-banner, step-card, step-number, step-heading, song-table-card classes
- `client/src/App.css` — contains .hero-banner, .hero-overlay, .hero-content .app-title, .hero-subtitle, .hero-actions, .step-card, .step-number, .song-table-card
- `client/src/assets/hero-banner.png` — 2.7MB landscape image present
- Commits e95a65b and 9ef4ace verified in git log
- `npm run build` passes with zero errors
