---
phase: 12
slug: per-song-checkbox-selection
status: approved 2026-05-12
shadcn_initialized: false
preset: none
created: 2026-05-12
---

# Phase 12 — UI Design Contract

> Visual and interaction contract for the per-song checkbox selection feature.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (Mantine v6 only) |
| Preset | not applicable |
| Component library | Mantine v6 (`@mantine/core`) |
| Icon library | @tabler/icons-react |
| Font | Existing app font (no change) |

---

## Spacing Scale

Inherited from existing app. Checkbox column specific values:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding |
| sm | 8px | Compact element spacing |
| md | 16px | Default element spacing |
| lg | 24px | Section padding |
| xl | 32px | Layout gaps |
| 2xl | 48px | Major section breaks |
| 3xl | 64px | Page-level spacing |

Exceptions: Checkbox column is fixed at ~40px wide — narrower than any spacing token.

---

## Typography

Inherited from existing app. No new type roles introduced.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 | 1.5 |
| Label | 12px | 500 | 1.4 |
| Heading | 16px | 600 | 1.4 |
| Display | n/a | n/a | n/a |

---

## Color

Inherited from existing dark-first theme. No new color roles.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | existing dark bg | Background, surfaces |
| Secondary (30%) | existing card/sidebar | Table row backgrounds |
| Accent (10%) | existing brand accent | Checked checkbox fill only |
| Destructive | existing destructive | Not used in this phase |

Accent reserved for: checked checkbox fill state only.

---

## Component Specifications

### Checkbox Column

| Property | Value |
|----------|-------|
| Column position | Leftmost (index 0) |
| Column width | ~40px, compact — fits checkbox only |
| Column header | Mantine v6 `<Checkbox>` with `indeterminate` support |
| Row cell | Mantine v6 `<Checkbox>` per row |
| Component | `import { Checkbox } from '@mantine/core'` |

**Column order after change:**
`[Checkbox] | Img | Title | Length | Status`

### Header Checkbox — Tri-State Behavior

| Current State | Click Result |
|---------------|-------------|
| All selected | None selected |
| Indeterminate (partial) | All selected |
| None selected | All selected |

Implementation: `checked={allSelected}` + `indeterminate={someSelected && !allSelected}`

### Row Checkboxes — Interaction Rules

| Condition | Behavior |
|-----------|----------|
| `isDownloading === true` | All checkboxes disabled (non-interactive) |
| `isDownloading === false` | Checkboxes interactive |
| Playlist loads | All checkboxes checked (opt-out model, SEL-05) |
| Playlist cleared | Selected IDs Set cleared |

Checkboxes are always rendered (never hidden). Disabled state applies the Mantine disabled visual — no custom styling needed.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| ZIP button — N > 1 | `"Download N songs as ZIP"` |
| ZIP button — N = 1 | `"Download 1 song as ZIP"` |
| Individual button — N > 1 | `"Download N Songs"` |
| Individual button — N = 1 | `"Download 1 Song"` |
| Button disabled (zero selected) | `"Download 0 songs as ZIP"` / `"Download 0 Songs"` (disabled, no separate empty label) |
| Tooltip / aria-label on header checkbox (all selected) | `"Deselect all songs"` |
| Tooltip / aria-label on header checkbox (none/partial) | `"Select all songs"` |

**Singular rule (locked):** When `selectedIds.size === 1`, use lowercase singular: `"1 song"` for ZIP mode, capitalized singular `"1 Song"` for individual mode (matches existing `"Download Songs"` cap convention).

---

## State Inventory

| State Variable | Type | Init Value | Reset On |
|----------------|------|------------|----------|
| `selectedIds` | `Set<string>` | `new Set()` | Playlist load → all IDs; playlist clear → empty Set |

**D-01 enforced:** `IPlaylistClip` interface in `Suno.ts` is NOT modified. Selection is UI-only state in `App.tsx`.

---

## Disabled Guard Matrix

Download button disabled when ANY of the following:

| Condition | Source |
|-----------|--------|
| `isGettingPlaylist === true` | Existing guard |
| `isDownloading === true` | Existing guard |
| `!playlistData` | Existing guard |
| `selectedIds.size === 0` | New guard (D-06) |

Checkboxes disabled when:

| Condition | Source |
|-----------|--------|
| `isDownloading === true` | New — D from conversation |

---

## Download Filter Contract

Before passing clips to either download handler, filter by selection:

```ts
const selectedClips = playlistClips.filter(c => selectedIds.has(c.id));
```

- `downloadIndividualSongs`: receives `selectedClips` instead of `playlistClips`
- `downloadPlaylistAsZip`: receives `selectedClips` instead of `playlistClips`
- Button count display: `selectedIds.size`

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| Mantine v6 official | `Checkbox` | not required — already in dependency tree |

No third-party registries. No new npm packages required.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS — singular/plural rules locked, all button states specified
- [x] Dimension 2 Visuals: PASS — column position, width, and checkbox states specified
- [x] Dimension 3 Color: PASS — inherits existing theme; accent reserved for checked fill only
- [x] Dimension 4 Typography: PASS — no new type roles; inherits existing
- [x] Dimension 5 Spacing: PASS — column fixed ~40px; all other spacing inherited
- [x] Dimension 6 Registry Safety: PASS — Mantine v6 Checkbox, already installed

**Approval:** approved 2026-05-12
