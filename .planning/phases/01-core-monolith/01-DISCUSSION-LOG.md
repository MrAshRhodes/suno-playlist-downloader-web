# Phase 1: Core Monolith - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 01-core-monolith
**Areas discussed:** Card depth intensity, Typography hierarchy, Accent color reach, Theme transition

---

## Card Depth Intensity

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle glow | Faint inner border glow + soft shadow — premium but not distracting | ✓ |
| Bold glow | Visible inner glow ring + deeper shadow — dramatic, brutalist | |
| You decide | Claude picks based on design reference | |

**User's choice:** Subtle glow
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Soft float | Clean drop shadow, professional, Apple-esque | ✓ |
| Tactile lift | More pronounced shadow with slight offset — physically stacked feel | |
| You decide | Claude picks based on design reference | |

**User's choice:** Soft float
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Uniform cards | Every section gets same 24px radius card treatment | ✓ |
| Tiered elevation | Primary content full depth, secondary lighter, tertiary minimal | |

**User's choice:** Uniform cards
**Notes:** None

---

## Typography Hierarchy

| Option | Description | Selected |
|--------|-------------|----------|
| App title only | Only app title gets Extra Bold 24pt. Playlist name and headings semi-bold | ✓ |
| Title + playlist name | Both app title and playlist name get hero weight | |
| You decide | Claude applies Monolith type hierarchy from reference | |

**User's choice:** App title only
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Inter web font | Load Inter from Google Fonts with system font fallback | ✓ |
| System font stack | Keep current system fonts, no external dependency | |
| Bundle Inter locally | Download woff2 files into client/public/fonts/ | |

**User's choice:** Inter web font
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Moderate tight | Hero -0.03em, headers -0.02em, body -0.01em, captions 0.06em | ✓ |
| Aggressive tight | Hero -0.05em, headers -0.04em, body -0.02em, captions 0.08em | |
| You decide | Claude picks spacing from Monolith reference | |

**User's choice:** Moderate tight
**Notes:** None

---

## Accent Color Reach

| Option | Description | Selected |
|--------|-------------|----------|
| Everywhere | Deep Blue #3B4A6B on all interactive elements — full consistency | ✓ |
| Interactive only | Deep Blue on buttons/links, lighter variant for focus rings/progress/badges | |
| You decide | Claude applies based on design reference | |

**User's choice:** Everywhere
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Lighten on hover | Hover shifts to ~#4E5F80, simple and predictable | ✓ |
| Glow on hover | Same color + box-shadow glow, more dramatic | |
| Both | Lighten AND glow — maximum feedback | |

**User's choice:** Lighten on hover
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Solid Deep Blue | Single-color logo mark, clean brutalist | |
| Deep Blue gradient | Subtle gradient from Deep Blue to lighter shade | |
| You decide | Claude picks based on what looks best | ✓ |

**User's choice:** You decide
**Notes:** User requested logo be generated via nanobanana MCP with chromakey green background, then remove background with ImageMagick for transparency.

---

## Theme Transition

| Option | Description | Selected |
|--------|-------------|----------|
| CSS cross-fade | CSS transitions 0.3s ease on themed properties, classList swap triggers | ✓ |
| Animated toggle | Circular wipe or fade overlay on toggle click | |
| You decide | Claude picks approach ensuring no flash with Mantine v6 | |

**User's choice:** CSS cross-fade
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| CSS overrides | Override Mantine styles via CSS using var() and !important | ✓ |
| MantineProvider theme | Configure colors/components in theme object, needs re-render | |
| Hybrid | MantineProvider for base colorScheme, CSS overrides for Monolith styling | |

**User's choice:** CSS overrides
**Notes:** Proven pattern already in codebase (body bg uses !important).

---

## Claude's Discretion

- Logo design direction (generated via nanobanana MCP)
- Exact shadow tuning within decided intensity levels

## Deferred Ideas

None — discussion stayed within phase scope.
