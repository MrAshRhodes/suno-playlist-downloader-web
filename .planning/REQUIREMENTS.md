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

- [x] **PLSH-01**: Support Server Costs banner styled to match Monolith theme
- [x] **PLSH-02**: All colors meet WCAG AA contrast ratios
- [x] **PLSH-03**: Scrollbar styled to match theme

### Ads & Monetization

- [ ] **ADS-01**: Google AdSense Auto Ads script tag present in index.html head with async loading
- [ ] **ADS-02**: Real publisher ID (ca-pub-XXXXX) hardcoded in script — no .env complexity
- [ ] **ADS-03**: No manual ad units — Auto Ads only, Google controls placement
- [ ] **ADS-04**: Graceful degradation when ad-blockers active — no broken layout, no detection messages

### Donation Modal

- [ ] **DON-01**: Modal triggers on 1st download and every 5th download after (1, 5, 10, 15...) via localStorage counter
- [x] **DON-02**: Modal uses gratitude-first tone — "Thanks for using Suno Downloader!" heading, soft support ask
- [x] **DON-03**: Banner image generated via nanobanana MCP — cozy coffee + music mashup, warm tones, inviting not corporate
- [x] **DON-04**: Centered overlay modal with banner image top, gratitude text middle, Buy Me a Coffee CTA button bottom
- [ ] **DON-05**: Existing top support banner remains alongside modal — both serve different purposes
- [ ] **DON-06**: localStorage download counter with no permanent opt-out — modal re-appears per trigger formula

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
| PLSH-01 | Phase 3 | Complete |
| PLSH-02 | Phase 3 | Complete |
| PLSH-03 | Phase 3 | Complete |
| ADS-01 | Phase 4 | Pending |
| ADS-02 | Phase 4 | Pending |
| ADS-03 | Phase 4 | Pending |
| ADS-04 | Phase 4 | Pending |
| DON-01 | Phase 7 | Pending |
| DON-02 | Phase 7 | Complete |
| DON-03 | Phase 7 | Complete |
| DON-04 | Phase 7 | Complete |
| DON-05 | Phase 7 | Pending |
| DON-06 | Phase 7 | Pending |

**Coverage:**
- v2.0 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-14 after Phase 7 planning*
