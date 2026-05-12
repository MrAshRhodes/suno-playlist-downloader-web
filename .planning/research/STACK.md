# Technology Stack

**Project:** Suno Playlist Downloader — v2.1 UX & Discovery
**Researched:** 2026-05-12
**Confidence:** HIGH

## Executive Finding

**Zero new dependencies required.** All three v2.1 features are satisfied by what is already installed. The backend route needs no changes.

---

## Recommended Stack

### Core Technologies (frozen — no changes)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | 18.2.0 | Component state and event handling | `useState<Set<string>>` is the entire selection state model |
| TypeScript | 5.0.4 | Type safety | Extend existing `IPlaylistClip` usage; no new types required |
| `@mantine/core` | 6.0.13 | UI components — `Checkbox` for row selection | Already installed; `Checkbox` with `indeterminate` prop is in this version |
| `@tabler/icons-react` | 2.20.0 | Icons for selection/guidance UI | Already installed |
| Express.js | 4.19.2 | Backend download route | Already accepts `clips` array — no route change needed |

### Supporting Libraries (no additions — all already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@mantine/core` → `Checkbox` | 6.0.13 | Per-song checkboxes in table rows + "select all" in header | `indeterminate` prop handles partial selection in header |
| `@mantine/core` → `Text`, `Alert`, `Badge` | 6.0.13 | @username discovery guidance — helper copy, format examples | Use `Badge` chips for clickable URL format examples below input |
| `@mantine/hooks` → `useListState` | 6.0.13 | Optional list toggle helper | Only if `Set<string>` state grows unwieldy — not expected |

---

## Installation

```bash
# No new packages. Zero changes to package.json.
```

---

## API Change: None Required

The download route (`POST /api/download/playlist`) already destructures:

```js
// web-version/routes/download.js line 96
const { playlist, clips, embedImage } = req.body;
```

`clips` is iterated directly. For selective download, the client filters before posting:

```ts
// App.tsx — selectedIds: Set<string>
const clipsToDownload = playlistClips.filter(c => selectedIds.has(c.id));
await downloadPlaylistApi(playlistData, clipsToDownload, embedImages);
```

Backend stays frozen. No new parameters, no route modification.

---

## Mantine v6 Checkbox Pattern for Tables

The song table in `App.tsx` is a plain HTML `<table>` — not Mantine's `Table` component. `Checkbox` from `@mantine/core` drops in as a cell child with no structural change.

```tsx
import { Checkbox } from '@mantine/core';

// Header — select all with indeterminate state
<th>
  <Checkbox
    checked={selectedIds.size === playlistClips.length && playlistClips.length > 0}
    indeterminate={selectedIds.size > 0 && selectedIds.size < playlistClips.length}
    onChange={handleSelectAll}
  />
</th>

// Row — individual
<td>
  <Checkbox
    checked={selectedIds.has(clip.id)}
    onChange={() => toggleSelected(clip.id)}
  />
</td>
```

`indeterminate` is available on Mantine v6 `Checkbox` — not a v7-only feature.

**Selection state — opt-out model** (all selected by default so users who want everything skip the UI):

```ts
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

useEffect(() => {
  // Pre-select all when clips load
  setSelectedIds(new Set(playlistClips.map(c => c.id)));
}, [playlistClips]);
```

---

## @username UX Improvements — No New Stack

`Suno.getSongsFromUser()` and `/api/playlist/user/{username}/songs` already work. The gap is purely UX copy and input guidance:

- Update `placeholder` on the URL input to include `@username` format
- Add clickable `Badge` chips ("@artist", "suno.com/playlist/...") that populate the input on click
- Surface `data.metadata.note` in the error message when the server returns 501 (current code swallows it)

All JSX + existing Mantine `Badge`/`Text` components. No stack change.

---

## Dependabot Verification — Not a Stack Concern

```bash
gh pr list --state closed --search "dependabot"
```

One-shot CLI command. Not a dependency or build concern.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `useState<Set<string>>` for selection | `@mantine/hooks` `useListState` | If list-level reorder/insert operations are needed — not the case here |
| Filter `clips` client-side before POST | Add `selectedIds` param to backend route | Only if server-side needs selection data independently (e.g. analytics). Violates "backend frozen" constraint here. |
| Mantine `Checkbox` | Native `<input type="checkbox">` | If Mantine were not installed. Mantine gives consistent dark/light styling for free. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Mantine v7 upgrade | Breaking API changes across `Checkbox`, `Table`, `Modal` — invalidates working components | Stay on 6.0.13 |
| New state library (Zustand, Jotai, Redux) | Overkill for a single `Set<string>` of IDs | `useState<Set<string>>` in App.tsx |
| New `selectedIds` parameter on download route | Changes API contract; violates "backend frozen" constraint | Client filters `playlistClips` before `downloadPlaylistApi` call |
| Separate route for selective download | Same as above | Client-side filter on existing route |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@mantine/core` 6.0.13 | React 18.2.0 | Confirmed — shipped as v2.0 |
| `@mantine/core` 6.0.13 | TypeScript 5.0.4 | Types ship with the package |
| Mantine `Checkbox` `indeterminate` prop | `@mantine/core` ≥ 5.x | Available in v6.0.13 |

---

## Sources

- `client/package.json` — Confirmed `@mantine/core ^6.0.13`, React 18.2.0, TypeScript 5.0.4 (HIGH — direct file read)
- `web-version/routes/download.js` lines 96–98 — Confirmed `clips` array already destructured from request body; no `selectedIds` needed (HIGH — direct file read)
- `client/src/App.tsx` lines 211–248 — Confirmed plain HTML `<table>` with `<th>`/`<td>` structure; `Checkbox` drops in without structural change (HIGH — direct file read)
- `client/src/services/Suno.ts` lines 77–112 — Confirmed `getSongsFromUser` exists; UX work is copy + guidance only (HIGH — direct file read)

---
*Stack research for: Suno Playlist Downloader v2.1 UX & Discovery*
*Researched: 2026-05-12*
