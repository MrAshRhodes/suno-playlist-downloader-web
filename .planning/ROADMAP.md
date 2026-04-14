# Roadmap: Suno Playlist Downloader — Monolith UI (v2.0)

## Overview

Three phases deliver the Monolith design system onto a fully working app. Phase 1 lands the biggest visible impact: palette, depth cards, and type hierarchy. Phase 2 adds the p5.js atmospheric waveform as a distinct technical concern. Phase 3 completes the experience with micro-animations, hover states, and accessibility polish.

## Milestones

- **v2.0 Monolith UI** - Phases 1-3 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (1.1, 2.1): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Core Monolith** - Palette, cards, and typography — the complete visual transformation
- [ ] **Phase 2: Atmospheric Art** - p5.js ambient waveform background
- [ ] **Phase 3: Interactions & Polish** - Micro-animations, hover states, and finishing touches

## Phase Details

### Phase 1: Core Monolith
**Goal**: The app looks like a Monolith product — correct palette in both modes, depth cards with 24px radius, and a clear type hierarchy
**Depends on**: Nothing (CSS variable foundation in place from commit 766c401)
**Requirements**: THME-01, THME-02, THME-03, CARD-01, CARD-02, TYPO-01, TYPO-02
**Success Criteria** (what must be TRUE):
  1. Dark mode renders Rich Black #0A0A0A background with Deep Gray #1A1A1A card surfaces and Deep Blue #3B4A6B accent
  2. Light mode renders Warm Ivory #F2EFE9 background with Muted Beige #E8E4DB card surfaces and the same accent
  3. Toggling theme causes no flash — cross-fade is smooth with no unstyled frames
  4. All content sections sit inside 24px radius cards that visually lift from the page (inner glow dark, soft drop shadow light)
  5. Headers render at 18-24pt semi-bold, body at 14pt, using Inter or system font stack
**Plans:** 2 plans

Plans:
- [x] 03-01-PLAN.md — Button glow, progress bar glow/height, state animations, Mantine Loader fix (INTR-01, INTR-02, INTR-03, INTR-04)
- [x] 03-02-PLAN.md — WCAG AA contrast fixes, banner text fix, Firefox scrollbar fallback (PLSH-01, PLSH-02, PLSH-03)

Plans:
- [x] 01-01-PLAN.md — Theme palette, Inter font, and transition fix (THME-01, THME-02, THME-03)
- [x] 01-02-PLAN.md — Card system, typography hierarchy, accent consistency, and logo (CARD-01, CARD-02, TYPO-01, TYPO-02)

**UI hint**: yes

### Phase 2: Atmospheric Art
**Goal**: A p5.js audio waveform canvas renders as ambient background behind all UI content
**Depends on**: Phase 1
**Requirements**: ART-01, ART-02, ART-03
**Success Criteria** (what must be TRUE):
  1. A generative waveform is visible behind the UI without obscuring any interactive elements
  2. The waveform pattern is reproducible — same seed produces the same visual across page loads
  3. The animation is ambient enough that users can focus on the download workflow without distraction
**Plans:** 1 plan

Plans:
- [x] 02-01-PLAN.md — Install p5.js, create useP5 hook + waveform sketch, build WaveformBackground component, wire into App (ART-01, ART-02, ART-03)

**UI hint**: yes

### Phase 3: Interactions & Polish
**Goal**: Every interactive element responds with intent, the app passes WCAG AA, and no surface is left unstyled
**Depends on**: Phase 2
**Requirements**: INTR-01, INTR-02, INTR-03, INTR-04, PLSH-01, PLSH-02, PLSH-03
**Success Criteria** (what must be TRUE):
  1. Buttons show accent glow on hover and a pressed state on active — visible at a glance
  2. The progress bar glows with the accent color and animates smoothly during active downloads
  3. Table rows highlight on hover with a subtle background shift, giving the list a tactile feel
  4. State changes (loading, downloading, complete) cross-fade rather than snap
  5. All color combinations pass WCAG AA contrast checks and the scrollbar matches the active theme
**Plans:** 1/2 plans executed

Plans:
- [x] 03-01-PLAN.md — Button glow, progress bar glow/height, state animations, Mantine Loader fix (INTR-01, INTR-02, INTR-03, INTR-04)
- [x] 03-02-PLAN.md — WCAG AA contrast fixes, banner text fix, Firefox scrollbar fallback (PLSH-01, PLSH-02, PLSH-03)
**UI hint**: yes

### Phase 4: Add Google Ads to the bottom of the site

**Goal:** Add Google AdSense Auto Ads via a single script tag in index.html for site monetization — Google determines ad placement automatically
**Requirements**: ADS-01, ADS-02, ADS-03, ADS-04
**Depends on:** Phase 3
**Plans:** 1 plan

Plans:
- [ ] 04-01-PLAN.md — Add AdSense Auto Ads async script to index.html with publisher ID (ADS-01, ADS-02, ADS-03, ADS-04)

### Phase 5: Download Support Popup

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 4
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 5 to break down)

### Phase 6: Premium title banner and modern step cards

**Goal:** Replace the plain header with a generated hero banner image and wrap all 3 step sections in monolith-card containers with solid-surface numbered step indicators
**Requirements**: D-01, D-02, D-03, D-04, D-05, D-06
**Depends on:** Phase 5
**Plans:** 1 plan

Plans:
- [ ] 06-01-PLAN.md — Hero banner image with title overlay + step card wrappers with numbered headings (D-01, D-02, D-03, D-04, D-05, D-06)

### Phase 7: Support donation modal with generated banner

**Goal:** A gratitude-first donation modal with generated coffee+music banner image appears at strategic download moments, encouraging users to support via Buy Me a Coffee
**Requirements**: DON-01, DON-02, DON-03, DON-04, DON-05, DON-06
**Depends on:** Phase 6
**Plans:** 2 plans

Plans:
- [x] 07-01-PLAN.md — Generate banner image asset via nanobanana MCP and build DonationModal component (DON-02, DON-03, DON-04)
- [x] 07-02-PLAN.md — Wire download counter and modal trigger logic into App.tsx (DON-01, DON-05, DON-06)

### Phase 8: Using the GitHub CLI, check dependabot alerts and resolve security issues

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 7
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 8 to break down)
