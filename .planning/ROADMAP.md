# Roadmap: Suno Playlist Downloader — Visual Modernization

## Overview

Six phases transform the existing Apple-inspired UI into a premium Monolith dark aesthetic. The dependency chain is strict: CSS variables must be extracted first (Phase 1), then the full theme system built (Phase 2), then the waveform background added (Phase 3), then glassmorphism layered over it (Phase 4), then typography and component polish applied (Phase 5), and finally animations layered on top (Phase 6). Functionality is never touched — all modifications are confined to client/src/.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: CSS Variable Foundation** - Extract ~60 inline ternaries from App.tsx into CSS custom properties
- [ ] **Phase 2: Theme System** - Apply full Monolith palette to both dark and light themes, sync Mantine
- [ ] **Phase 3: Generative Art Background** - p5.js audio waveform canvas behind all UI content
- [ ] **Phase 4: Glassmorphism Surfaces** - Frosted glass cards, header, and vignette layered over waveform
- [ ] **Phase 5: Typography & Component Polish** - Type hierarchy, Inter font, button/input/progress/thumbnail refinements
- [ ] **Phase 6: Animations** - State transitions, staggered table rows, shimmer, reduced-motion support

## Phase Details

### Phase 1: CSS Variable Foundation
**Goal**: All dynamic inline theme values live in CSS custom properties — no more inline ternaries
**Depends on**: Nothing (first phase)
**Requirements**: THME-01, THME-05
**Success Criteria** (what must be TRUE):
  1. App.tsx contains no `theme === 'dark' ? ... : ...` inline style ternaries
  2. Theme switching works correctly by toggling a class on `<html>` via classList (not assignment)
  3. All previously-inline colors and values are declared as CSS custom properties in index.css
**Plans**: TBD
**UI hint**: yes

### Phase 2: Theme System
**Goal**: Both dark and light themes render the full Monolith palette; Mantine components follow theme correctly
**Depends on**: Phase 1
**Requirements**: THME-02, THME-03, THME-04, THME-06, THME-07, THME-08
**Success Criteria** (what must be TRUE):
  1. Dark mode shows deep blue-black backgrounds (#0a0e1a, #111627) with correct text hierarchy
  2. Light mode shows warm ivory palette with matching Monolith polish (not default browser white)
  3. Mantine components (buttons, inputs, modals) respect the active theme without mismatched colors
  4. Theme toggle produces a smooth 200-300ms cross-fade with no flash of incorrect theme
  5. Subtle radial gradient tints appear at page edges, and all text/background combinations pass WCAG AA
**Plans**: TBD
**UI hint**: yes

### Phase 3: Generative Art Background
**Goal**: An ambient p5.js audio waveform canvas fills the page behind all UI content
**Depends on**: Phase 2
**Requirements**: ART-01, ART-02, ART-03, ART-04, ART-05, ART-06, ART-07
**Success Criteria** (what must be TRUE):
  1. A flowing waveform animation is visible behind all UI cards without blocking any interaction
  2. No microphone permission prompt appears — waveform uses Perlin noise only
  3. The waveform smoothly updates colors when the theme is toggled (no canvas flash or recreate)
  4. Animation runs at approximately 30fps without visible lag on a standard laptop
  5. Waveform pattern is consistent across page reloads (seeded randomness)
**Plans**: TBD
**UI hint**: yes

### Phase 4: Glassmorphism Surfaces
**Goal**: All major UI sections render as frosted glass cards floating above the waveform background
**Depends on**: Phase 3
**Requirements**: GLAS-01, GLAS-02, GLAS-03, GLAS-04, GLAS-05, GLAS-06, GLAS-07
**Success Criteria** (what must be TRUE):
  1. URL input, song table, and download sections each appear as frosted glass cards (backdrop-blur visible)
  2. Header floats above content with matching glass treatment
  3. On Firefox (or any browser without backdrop-filter), cards fall back to a high-opacity solid background — no transparent/broken cards
  4. A vignette darkens page edges, drawing visual focus to center content
  5. No more than 4 elements have active backdrop-filter simultaneously (GPU safety)
**Plans**: TBD
**UI hint**: yes

### Phase 5: Typography & Component Polish
**Goal**: Every interactive and display element meets Monolith visual standards — type hierarchy, custom font, polished controls
**Depends on**: Phase 4
**Requirements**: TYPO-01, TYPO-02, TYPO-03, TYPO-04, TYPO-05, TYPO-06, TYPO-07
**Success Criteria** (what must be TRUE):
  1. Column headers display in uppercase with letter-spacing; titles are weight 600; labels are weight 300
  2. Inter variable font renders (confirmed via browser DevTools font inspector — not system sans-serif)
  3. Buttons show gradient backgrounds, glow on hover, and compress slightly on click
  4. Focused inputs display an accent-color glow ring
  5. Progress bar has a gradient fill with a moving glow at the leading edge; song thumbnails have rounded corners and a colored border ring
**Plans**: TBD
**UI hint**: yes

### Phase 6: Animations
**Goal**: UI state changes, table population, and active download rows all animate smoothly and respect motion preferences
**Depends on**: Phase 5
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04
**Success Criteria** (what must be TRUE):
  1. Switching between loading, results, and downloading states produces visible opacity/transform transitions (no instant swaps)
  2. Song rows fade and slide in with a staggered delay when a playlist loads
  3. The currently-downloading row shows a visible shimmer animation
  4. All animations are absent (or instant) when the OS has reduced-motion enabled
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. CSS Variable Foundation | 0/TBD | Not started | - |
| 2. Theme System | 0/TBD | Not started | - |
| 3. Generative Art Background | 0/TBD | Not started | - |
| 4. Glassmorphism Surfaces | 0/TBD | Not started | - |
| 5. Typography & Component Polish | 0/TBD | Not started | - |
| 6. Animations | 0/TBD | Not started | - |
