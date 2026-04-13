# Requirements: Suno Playlist Downloader — Monolith UI

**Defined:** 2026-04-12
**Core Value:** Visual modernization only — every download flow, setting, and API call unchanged

## v2.0 Requirements

### Theme

- [x] **THME-01**: Dark mode uses Monolith Rich Black palette (#0A0A0A bg, #1A1A1A cards, #FFFFFF text, #3B4A6B accent)
- [x] **THME-02**: Light mode uses Monolith Warm Ivory palette (#F2EFE9 bg, #E8E4DB cards, #332F2E text, #3B4A6B accent)
- [x] **THME-03**: Theme toggle transitions smoothly between modes with no flash of unstyled content

### Cards & Surfaces

- [x] **CARD-01**: All content sections use 24px radius cards with Monolith depth (soft shadows light, inner glow dark)
- [x] **CARD-02**: Cards have distinct surface elevation from background in both modes

### Typography

- [x] **TYPO-01**: App uses Inter/system font with proper hierarchy (semi-bold 18-24pt headers, 14pt body, tight letter-spacing)
- [x] **TYPO-02**: Hero/title elements use bold weight with visual prominence

### Atmospheric Art

- [ ] **ART-01**: p5.js audio waveform canvas renders behind UI content as ambient background
- [ ] **ART-02**: Waveform uses seeded randomness for reproducible patterns
- [ ] **ART-03**: Background is non-distracting and music-themed

### Interactions

- [x] **INTR-01**: Buttons have hover/active states with accent glow effects
- [x] **INTR-02**: Progress bar has glow effect and smooth animation
- [x] **INTR-03**: Table rows have hover states with subtle background transition
- [x] **INTR-04**: State changes (loading, downloading) animate smoothly

### Polish

- [ ] **PLSH-01**: Support Server Costs banner styled to match Monolith theme
- [ ] **PLSH-02**: All colors meet WCAG AA contrast ratios
- [ ] **PLSH-03**: Scrollbar styled to match theme

## Future Requirements

### Enhanced Art

- **ART-04**: Waveform reacts to actual audio playback (requires audio preview feature)
- **ART-05**: Multiple waveform modes (particle, frequency bars, etc.)

### Responsive

- **RESP-01**: Mobile-optimized single-column layout
- **RESP-02**: Tablet two-column layout

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend/API changes | Functionality is frozen |
| New features (search, preview, etc.) | Visual only milestone |
| Mantine v7 upgrade | Breaking changes, risk to functionality |
| Navigation sidebar | Single-page app, not multi-pane |
| Desktop (Tauri) work | Web only |
| Mobile app | Web only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| THME-01 | Phase 1 | Complete |
| THME-02 | Phase 1 | Complete |
| THME-03 | Phase 1 | Complete |
| CARD-01 | Phase 1 | Complete |
| CARD-02 | Phase 1 | Complete |
| TYPO-01 | Phase 1 | Complete |
| TYPO-02 | Phase 1 | Complete |
| ART-01 | Phase 2 | Pending |
| ART-02 | Phase 2 | Pending |
| ART-03 | Phase 2 | Pending |
| INTR-01 | Phase 3 | Complete |
| INTR-02 | Phase 3 | Complete |
| INTR-03 | Phase 3 | Complete |
| INTR-04 | Phase 3 | Complete |
| PLSH-01 | Phase 3 | Pending |
| PLSH-02 | Phase 3 | Pending |
| PLSH-03 | Phase 3 | Pending |

**Coverage:**
- v2.0 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-12 after roadmap creation*
