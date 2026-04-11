# Suno Playlist Downloader — Visual Modernization

## What This Is

A web-based tool that downloads music from Suno playlists and user profiles as ZIP archives with embedded ID3 metadata. It's live on Replit and fully functional. This project focuses exclusively on visual modernization — upgrading the UI to a premium dark-first design with algorithmic art, while preserving all existing functionality.

## Core Value

The app must continue to work exactly as it does now — every download flow, every setting, every API call unchanged. Visual changes only.

## Requirements

### Validated

- ✓ Fetch playlist/profile songs from Suno URLs or @username — existing
- ✓ Download entire playlist as ZIP with MP3s and embedded ID3 tags — existing
- ✓ Light/dark theme toggle with system preference detection — existing
- ✓ Settings management (name templates, overwrite, embed images) — existing
- ✓ Progress tracking with per-song status updates during download — existing
- ✓ Session-based temp file management with automatic cleanup — existing
- ✓ Replit deployment with Node.js 20 — existing

### Active

- [ ] Full UI redesign with Monolith dark theme aesthetic (deep blue-black palette, frosted glass cards)
- [ ] Upgrade both light and dark themes to Monolith design language
- [ ] Audio waveform algorithmic art background (p5.js, seeded randomness)
- [ ] Modern typography, spacing, and layout overhaul
- [ ] Smooth animations and transitions throughout
- [ ] Frosted glass/glassmorphism card surfaces
- [ ] Refined table styling with better visual hierarchy
- [ ] Polished input, button, and progress bar designs
- [ ] Responsive and accessible (WCAG AA contrast)

### Out of Scope

- Any backend/API changes — functionality is frozen
- New features (search, filtering, audio preview, etc.) — this is visual only
- Database or auth changes — no backend modifications
- Migration to newer Mantine version — keep Mantine v6 for stability
- Mobile app or desktop (Tauri) work — web only

## Context

**Current state:** Apple-inspired design with basic light/dark mode. Heavy inline styles in App.tsx. CSS variables in index.css. Mantine v6 components partially used (mostly raw HTML elements). Minimal animations beyond a pulse keyframe. No visual flair or art.

**Target aesthetic:** Monolith dark theme from the weather app project:
- Backgrounds: `#0a0e1a` (primary), `#111627` (secondary)
- Text: `#f0f2f8` (primary), `#a0a8c0` (secondary), `#6b7394` (muted)
- Frosted glass: `rgba(255,255,255,0.1)` with backdrop-blur
- Softened shadows (0.6 opacity max)
- Subtle vignette/ambient color tints
- WCAG AA verified contrast ratios

**Art direction:** Audio waveform generative art using p5.js — music-themed, ambient, non-distracting background that reinforces the playlist/music context.

**Stack:** React 18 + Mantine v6 + Vite 4 + TypeScript (client), Express + Node.js 20 (server, untouched)

## Constraints

- **No functional changes**: Every download flow, API call, and setting must continue working identically
- **Mantine v6**: Cannot upgrade — too many breaking changes, risk to functionality
- **Replit deployment**: Must remain deployable on Replit with current build process
- **Build process**: `build.sh` and Vite config must continue to work
- **Client-only changes**: All modifications confined to `client/src/`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monolith dark theme as design foundation | Proven aesthetic from weather app, WCAG AA verified, premium feel | — Pending |
| Both themes upgraded (not dark-only) | User wants light mode option preserved with matching quality | — Pending |
| Audio waveform for algorithmic art | Music-themed — fits playlist context better than abstract particles | — Pending |
| p5.js for generative art | Lightweight, well-documented, seeded randomness for reproducibility | — Pending |
| Full redesign scope | Maximum visual impact — new layout, typography, spacing, animations | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-11 after initialization*
