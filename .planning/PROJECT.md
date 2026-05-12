# Suno Playlist Downloader

## What This Is

A web-based tool that downloads music from Suno playlists and user profiles as ZIP archives with embedded ID3 metadata. Live on Replit. v2.0 ships a premium dark-first UI (Monolith design system), p5.js atmospheric waveform, donation modal, AdSense + Adsterra monetization, full SEO infrastructure, and clean security posture across all dependency trees.

## Core Value

Downloads work reliably. Visual quality matches a premium product. Zero functional regressions from UI changes.

## Current Milestone: v2.1 UX & Discovery

**Goal:** Improve song selection UX and @username discovery while keeping all downloads intact.

**Target features:**
- Verify Dependabot PR #2 + #3 auto-closed (housekeeping)
- @username download UX — better discovery/guidance (backend route already works)
- Per-song selection — checkboxes in song table, selective ZIP download

## Previous: v2.0 Monolith UI — SHIPPED 2026-05-02

**Shipped this milestone:**
- Monolith design system — Rich Black dark / Warm Ivory light, Deep Blue accent, 24px depth cards, Inter typography
- p5.js atmospheric waveform background (seeded, reproducible, ambient)
- Micro-animations, WCAG AA contrast, theme-aware scrollbar
- Google AdSense Auto Ads + Adsterra CLS-safe banner component
- Gratitude-first donation modal (Buy Me a Coffee, triggers on 1st + every 5th download)
- Full SEO: OG/Twitter/JSON-LD, canonical, robots.txt, sitemap.xml, OG image pipeline
- Domain research: sunozip.com ranked #1 candidate
- 12 Dependabot alerts resolved (basic-ftp, multer removed, qs, on-headers, vite, uuid)
- public/ rebuilt with patched toolchain

## Requirements

### Validated — v2.0

- ✓ Monolith dark mode: Rich Black #0A0A0A, Deep Gray #1A1A1A cards, Deep Blue #3B4A6B accent — v2.0
- ✓ Monolith light mode: Warm Ivory #F2EFE9, Muted Beige #E8E4DB cards — v2.0
- ✓ Theme toggle: smooth cross-fade, no flash — v2.0
- ✓ 24px radius cards with depth (inner glow dark, soft shadow light) — v2.0
- ✓ Inter/system font hierarchy (semi-bold headers, 14pt body) — v2.0
- ✓ p5.js waveform canvas, seeded randomness, ambient/non-distracting — v2.0
- ✓ Button glow, progress bar glow, table hover, state animations — v2.0
- ✓ WCAG AA contrast, themed scrollbar — v2.0
- ✓ AdSense Auto Ads async script, publisher ID ca-pub-2601322490070593 — v2.0
- ✓ Donation modal: gratitude-first, BMC CTA, triggers 1st + every 5th download — v2.0
- ✓ Adsterra AdSlot banner component, CLS-safe, FTC label — v2.0
- ✓ SEO meta/OG/Twitter/JSON-LD, canonical, robots.txt, sitemap.xml — v2.0
- ✓ All Dependabot alerts resolved, npm audit clean at root — v2.0
- ✓ All download flows, settings, API calls unchanged throughout — v2.0

### Pre-existing (carried from v1.0)

- ✓ Fetch playlist/profile songs from Suno URLs or @username
- ✓ Download entire playlist as ZIP with MP3s and embedded ID3 tags
- ✓ Light/dark theme toggle with system preference detection
- ✓ Settings management (name templates, overwrite, embed images)
- ✓ Progress tracking with per-song status updates
- ✓ Session-based temp file management with automatic cleanup
- ✓ Replit deployment with Node.js 20

### Active (next milestone candidates)

- [ ] Download music by @username as well as playlist URL (backlog, api area)
- [ ] Select individual songs from playlist before download (backlog, ui area)
- [ ] Adsterra live publisher key wired (pending Adsterra account approval)
- ✓ sunozip.com domain purchased and live on Replit — v2.1

### Out of Scope

| Feature | Reason |
|---------|--------|
| Backend/API changes | Functionality is frozen |
| Mantine v7 upgrade | Breaking changes, risk to functionality |
| Mobile app / Tauri desktop | Web-only scope |
| Audio preview playback | New feature, not in current scope |
| Offline mode | Real-time download is core value |

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monolith design system | Brutalist-minimalist, premium feel, proven aesthetic | ✓ Shipped |
| Mantine v6 frozen | Upgrade breaks too many components | ✓ Maintained |
| Client-only UI changes | Preserve all server behavior | ✓ Zero functional regressions |
| multer removed (not upgraded) | Confirmed unused — removal safer than upgrade | ✓ Shipped |
| npm overrides for transitive deps | Avoid parent version bumps for qs/on-headers | ✓ Shipped |
| web-version/ is separate pkg tree | Not the Replit deployment — root server.js is deployed | ✓ Clarified |
| sunozip.com top domain candidate | 20/20 score: memorable, descriptive, .com available | ✓ Live on Replit |
| Adsterra minimal banner scope | AdSense blocked; minimal = no popunder/social/direct-link risk | ✓ Shipped (key pending) |

## Constraints

- **No functional changes**: Every download flow, API call, and setting must continue working identically
- **Mantine v6**: Cannot upgrade — too many breaking changes, risk to functionality
- **Replit deployment**: Must remain deployable on Replit with current build process
- **Node.js 20**: Minimum runtime requirement

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
*Last updated: 2026-05-12 — v2.1 UX & Discovery milestone started*
