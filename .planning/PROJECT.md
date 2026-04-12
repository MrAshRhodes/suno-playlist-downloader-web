# Suno Playlist Downloader — Monolith UI

## What This Is

A web-based tool that downloads music from Suno playlists and user profiles as ZIP archives with embedded ID3 metadata. It's live on Replit and fully functional. This milestone rebuilds the UI using the Monolith design system — brutalist-minimalist, premium, authoritative — while preserving all existing functionality.

## Core Value

The app must continue to work exactly as it does now — every download flow, every setting, every API call unchanged. Visual changes only.

## Current Milestone: v2.0 Monolith UI

**Goal:** Rebuild the UI using the Monolith design system — brutalist-minimalist, premium, authoritative

**Target features:**
- Monolith dark mode (Rich Black #0A0A0A, Deep Gray #1A1A1A cards, inner glow depth)
- Monolith light mode (Warm Ivory #F2EFE9, Muted Beige #E8E4DB cards, soft drop shadows)
- Deep Blue accent #3B4A6B across both modes
- 24px radius cards with tactile depth
- Inter/system font type hierarchy
- p5.js atmospheric audio waveform background
- Micro-animations and state transitions
- Polished components (table, inputs, buttons, progress)

## Requirements

### Validated

- ✓ Fetch playlist/profile songs from Suno URLs or @username — existing
- ✓ Download entire playlist as ZIP with MP3s and embedded ID3 tags — existing
- ✓ Light/dark theme toggle with system preference detection — existing
- ✓ Settings management (name templates, overwrite, embed images) — existing
- ✓ Progress tracking with per-song status updates during download — existing
- ✓ Session-based temp file management with automatic cleanup — existing
- ✓ Replit deployment with Node.js 20 — existing
- ✓ CSS variable foundation with classList theme toggle — v1.0 commit 766c401
- ✓ Support Server Costs banner at top — v1.0 commit 766c401

### Active

- [ ] Monolith dark mode: Rich Black #0A0A0A bg, Deep Gray #1A1A1A cards, white text, inner glow/subtle border depth
- [ ] Monolith light mode: Warm Ivory #F2EFE9 bg, Muted Beige #E8E4DB cards, Dark Charcoal #332F2E text, soft drop shadows
- [ ] Deep Blue accent #3B4A6B for buttons, active states, links (both modes)
- [ ] 24px radius information cards with tactile depth (3D shadows light, glow dark)
- [ ] Inter/system font with type hierarchy (semi-bold headers 18-24pt, tight letter-spacing, body 14pt)
- [ ] p5.js atmospheric audio waveform background (music-themed, ambient, non-distracting)
- [ ] Micro-animations and smooth state transitions
- [ ] Polished table/song list with hover states and visual hierarchy
- [ ] Polished inputs, buttons, and progress bar with glow effects
- [ ] WCAG AA contrast ratios verified

### Out of Scope

- Any backend/API changes — functionality is frozen
- New features (search, filtering, audio preview, etc.) — this is visual only
- Database or auth changes — no backend modifications
- Migration to newer Mantine version — keep Mantine v6 for stability
- Mobile app or desktop (Tauri) work — web only
- Navigation sidebar — app is single-page, not multi-pane

## Context

**Current state:** Basic glassmorphism dark-first design (commit 766c401). CSS variables in place. classList-based theme toggle working. Support banner restored. Functional but "basic looking" per user feedback.

**Target aesthetic:** Monolith design system (brutalist-minimalist):
- Dark: Rich Black #0A0A0A, Deep Gray #1A1A1A, White text, Deep Blue #3B4A6B accent
- Light: Warm Ivory #F2EFE9, Muted Beige #E8E4DB, Dark Charcoal #332F2E, same accent
- Cards: 24px radius, soft shadows (light), inner glow (dark)
- Typography: Inter/system, Extra Bold for hero elements, Semi-bold 18-24pt headers, 14pt body
- Atmospheric effects: radial gradients behind key content

**Design reference:** ~/Downloads/monolith_design_system_document.html

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
| Monolith design system | Brutalist-minimalist, proven in weather app, premium feel | Active |
| Both themes from Monolith spec | Warm Ivory light + Rich Black dark, consistent Deep Blue accent | Active |
| Audio waveform for algorithmic art | Music-themed — fits playlist context | Active |
| p5.js for generative art | Lightweight, seeded randomness, reproducible | Active |
| Deliver visible results per phase | v1.0 lesson: invisible refactoring rejected, every phase must show progress | Active |

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
