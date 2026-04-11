# Requirements: Suno Playlist Downloader — Visual Modernization

**Defined:** 2026-04-11
**Core Value:** The app must continue to work exactly as it does now — every download flow, every setting, every API call unchanged. Visual changes only.

## v1 Requirements

Requirements for the visual modernization milestone. Each maps to roadmap phases.

### Theme Foundation

- [ ] **THME-01**: All inline `theme === 'dark' ? ...` ternaries in App.tsx extracted to CSS custom properties
- [ ] **THME-02**: Dark theme uses Monolith palette — #0a0e1a primary background, #111627 secondary
- [ ] **THME-03**: Light theme upgraded to Monolith light aesthetic — warm ivory palette with matching polish
- [ ] **THME-04**: Mantine v6 colorScheme synced with useDarkMode hook (Mantine components render correctly in both themes)
- [ ] **THME-05**: document.documentElement.className clobber bug fixed (use classList, not assignment)
- [ ] **THME-06**: Theme toggle triggers smooth cross-fade via CSS variable transition (200-300ms)
- [ ] **THME-07**: Ambient color bleed — subtle radial gradient tints at page edges using accent color
- [ ] **THME-08**: All color combinations pass WCAG AA contrast ratio (4.5:1 for text, 3:1 for large text)

### Glassmorphism

- [ ] **GLAS-01**: URL input section rendered as frosted glass card (backdrop-filter: blur, semi-transparent background)
- [ ] **GLAS-02**: Song table section rendered as frosted glass card
- [ ] **GLAS-03**: Download section rendered as frosted glass card
- [ ] **GLAS-04**: Header floats above content with frosted glass treatment
- [ ] **GLAS-05**: Firefox @supports fallback — high-opacity solid background when backdrop-filter unavailable
- [ ] **GLAS-06**: Vignette overlay — radial gradient pulling visual focus toward center content
- [ ] **GLAS-07**: Maximum 4 simultaneous backdrop-filter elements for GPU performance

### Typography & Polish

- [ ] **TYPO-01**: Type hierarchy established — weight 600 titles, 400 body, 300 labels, uppercase + letter-spacing on column headers
- [ ] **TYPO-02**: Inter variable font self-hosted via @fontsource-variable/inter
- [ ] **TYPO-03**: Buttons have gradient background, soft glow on hover, scale(0.98) on active
- [ ] **TYPO-04**: Inputs have visible focus ring with accent color glow
- [ ] **TYPO-05**: Progress bar has gradient fill, glow effect on active end, smooth width transition
- [ ] **TYPO-06**: Song thumbnails have rounded corners (6-8px), subtle colored border ring, faint drop shadow
- [ ] **TYPO-07**: Icon/logo treatment refined — subtle glow, better proportions

### Generative Art

- [ ] **ART-01**: p5.js audio waveform canvas renders as full-page background behind UI content
- [ ] **ART-02**: Waveform uses Perlin noise (not p5.sound) — no microphone permission prompts
- [ ] **ART-03**: Canvas has pointer-events: none so UI remains interactive
- [ ] **ART-04**: Canvas responds to theme changes without teardown/recreate (no flash)
- [ ] **ART-05**: Seeded randomness for reproducible waveform patterns
- [ ] **ART-06**: Runs at ~30fps, Retina-capped for performance
- [ ] **ART-07**: p5.js instance mode with proper useEffect cleanup (handles React 18 Strict Mode double-mount)

### Animation

- [ ] **ANIM-01**: Smooth state transitions between loading, results, and downloading states (300-400ms, opacity/transform)
- [ ] **ANIM-02**: Song table rows fade/slide in with staggered delay (20-30ms per row) on playlist load
- [ ] **ANIM-03**: Active download row has shimmer effect (moving gradient overlay)
- [ ] **ANIM-04**: All animations respect @media (prefers-reduced-motion: reduce)

## v2 Requirements

### Enhanced Animation

- **ANIM-05**: Page load entrance animation sequence
- **ANIM-06**: Settings panel slide/fade transition

### Extended Polish

- **TYPO-08**: Playlist name and song count displayed prominently above table with styled typography
- **TYPO-09**: Custom scrollbar styling for song table (minimal, neutral)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Particle systems / floating orbs | Visual noise, no music relevance, hard to tune to ambient |
| Animated gradient backgrounds | GPU-intensive, causes layout shifts, dates quickly |
| Parallax scrolling | Single-screen workflow, no scroll depth to justify it |
| Skeleton loading screens | Only one async operation, spinner sufficient |
| Heavy backdrop-blur (>4 elements) | GPU performance degradation on lower-end machines |
| Animated counter on download % | Gimmicky on utility tool, progress bar sufficient |
| Toast notification redesign | Mantine notifications work fine, low ROI for risk |
| p5.sound library | Triggers microphone permission prompt |
| Any backend/API changes | Functionality is frozen |
| New features (search, filter, preview) | Visual-only scope |
| Mantine v7 upgrade | Breaking changes, risk to stability |
| Mobile app / Tauri desktop | Web only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| THME-01 | — | Pending |
| THME-02 | — | Pending |
| THME-03 | — | Pending |
| THME-04 | — | Pending |
| THME-05 | — | Pending |
| THME-06 | — | Pending |
| THME-07 | — | Pending |
| THME-08 | — | Pending |
| GLAS-01 | — | Pending |
| GLAS-02 | — | Pending |
| GLAS-03 | — | Pending |
| GLAS-04 | — | Pending |
| GLAS-05 | — | Pending |
| GLAS-06 | — | Pending |
| GLAS-07 | — | Pending |
| TYPO-01 | — | Pending |
| TYPO-02 | — | Pending |
| TYPO-03 | — | Pending |
| TYPO-04 | — | Pending |
| TYPO-05 | — | Pending |
| TYPO-06 | — | Pending |
| TYPO-07 | — | Pending |
| ART-01 | — | Pending |
| ART-02 | — | Pending |
| ART-03 | — | Pending |
| ART-04 | — | Pending |
| ART-05 | — | Pending |
| ART-06 | — | Pending |
| ART-07 | — | Pending |
| ANIM-01 | — | Pending |
| ANIM-02 | — | Pending |
| ANIM-03 | — | Pending |
| ANIM-04 | — | Pending |

**Coverage:**
- v1 requirements: 33 total
- Mapped to phases: 0 (awaiting roadmap)
- Unmapped: 33 ⚠️

---
*Requirements defined: 2026-04-11*
*Last updated: 2026-04-11 after initial definition*
