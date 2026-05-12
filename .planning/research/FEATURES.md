# Feature Research — v2.1 UX & Discovery

**Domain:** Music download tool — per-song selection + input UX + housekeeping
**Researched:** 2026-05-12
**Confidence:** HIGH (grounded in existing codebase analysis; no speculative library choices)

---

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Checkbox per song row | Any multi-select list in 2024+ has row checkboxes — file managers, Gmail, GitHub | LOW | Mantine v6 `Checkbox` available in `@mantine/core` (same import used elsewhere). Add `<td>` column, manage via `useState<Set<string>>` |
| Select All / Deselect All header control | Standard in every file-picker, email client, Google Drive — users look for it automatically | LOW | Header `<th>` checkbox; indeterminate state when partially selected. Single `onClick` handler |
| Download button reflects selection count | "Download 4 songs as ZIP" — users need confirmation of what they're about to get | LOW | Derive from `selectedIds.size`. No new state. Update button label string only |
| Input placeholder hints at @username format | The @username backend route exists but is invisible. Users who don't know the format cannot discover it without a hint | LOW | Single `placeholder` attribute change. Zero risk |
| Helper text below URL input | Companion to placeholder — brief static description survives after the user starts typing | LOW | One `<p>` element styled with `var(--text-secondary)`. No state, no logic |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Selective ZIP download (filter by selection) | User grabs 3 tracks from a 40-song playlist without downloading everything — uniquely useful for curated listening | MEDIUM | `downloadPlaylistApi` already accepts arbitrary `clips[]`. Frontend filters `playlistClips` by `selectedIds` before passing — no backend change. This is the key insight |
| Default-all-selected on playlist load | Selection is opt-out, not opt-in — existing "Download as ZIP" behavior is preserved; user just now has the option to deselect | LOW | `useEffect` re-initialises `selectedIds` to full set when `playlistClips` changes |
| Selection count badge variant on button | Visible affordance that the button action is scoped to selection | LOW | `btn-accent` class already exists; count embedded in label text |
| Shift-click range selection | Power-user shortcut for large playlists | MEDIUM | Track `lastChecked` index in ref; toggle range between last and current on shift+click. Progressive enhancement — not blocking for MVP |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Individual per-song download (not ZIP) | Users may want a single file | Individual download route was explicitly removed from `download.js` ("Individual song download routes removed — ZIP download only"). Re-adding changes backend — violates "no functional changes" constraint | Selective ZIP + unzip achieves same end result |
| Audio preview / playback | Help users decide what to select | New feature, explicitly listed as Out of Scope in PROJECT.md. Adds media element complexity and Suno CDN dependency questions | Tags column visible; title visible — sufficient for recognition |
| Drag-to-reorder songs | Customise ZIP output order | Medium-high complexity (needs dnd library or custom drag logic). ZIP track order is cosmetic — ID3 track numbers already embedded | Track numbers in ID3 are the canonical sort key |
| Persist selection across page refresh | Power-user comfort | Playlist is refetched each session; persisting IDs from a previous fetch is meaningless if the playlist has changed | Clear-on-reload is expected behaviour for ephemeral download tools |
| Tag/genre filter panel | Advanced curation | Requires search/filter UI overhaul — out of scope for v2.1. Medium complexity with no dependency on other v2.1 work | Visible tags column enables manual scanning |
| Select by status (e.g. "only errored songs") | Re-download failures | Adds filter-layer complexity. Errors during download are already visible via StatusIcon | User can deselect successful songs manually after a partial failure |

---

## Feature Dependencies

```
[Per-song checkbox column]
    └──requires──> [selectedIds: Set<string> in App.tsx state]
                       └──requires──> [IPlaylistClip.id — already exists, no schema change]

[Select All / Deselect All]
    └──requires──> [Per-song checkbox column]
    └──uses──> [playlistClips.length to determine indeterminate state]

[Selective ZIP download]
    └──requires──> [selectedIds state]
    └──reuses──> [downloadPlaylistApi(playlist, clips, embedImage) — WebApi.ts]
                    └──clips param: filter playlistClips by selectedIds
                    └──no backend change required

[Download button count label]
    └──requires──> [selectedIds state]
    └──enhances──> [Selective ZIP download]

[Default-all-selected on load]
    └──requires──> [selectedIds state]
    └──triggers on──> [playlistClips state change (useEffect)]

[@username helper text]
    └──standalone — zero dependencies, zero state

[@username placeholder update]
    └──standalone — single attribute change

[Dependabot PR check]
    └──standalone — read-only gh CLI, not a code change
```

### Dependency Notes

- **Selective download is a pure frontend filter:** `downloadPlaylistApi` in `WebApi.ts` already accepts `clips: any[]`. Passing `playlistClips.filter(c => selectedIds.has(c.id))` requires zero backend change. This is the critical finding that makes the feature LOW-risk.
- **Default-all-selected preserves existing behavior:** Current "Download as ZIP" downloads everything. With checkboxes defaulting to all-selected, clicking download without touching checkboxes produces identical output to today.
- **Select All is progressive enhancement:** Can ship checkboxes without it and add in the same PR — natural sequence.
- **@username features are independent:** No dependency on selection work. Can be done in any order.

---

## MVP Definition

### Launch With (v2.1)

- [ ] `selectedIds: Set<string>` state in `App.tsx`, initialised to all IDs on playlist load
- [ ] Checkbox column added to song table (`<th>` + `<td>` per row)
- [ ] Select All header checkbox with indeterminate state (partial selection)
- [ ] `downloadPlaylist()` filters clips by `selectedIds` before API call
- [ ] Download button label: `"Download ${selectedIds.size} song(s) as ZIP"`
- [ ] Input `placeholder` updated: `"https://suno.com/playlist/... or @username"`
- [ ] Helper text below input: `"Paste a playlist URL or @username to fetch all their songs"`
- [ ] Dependabot PR #2 + #3 status confirmed via `gh pr list`

### Add After Validation (v2.1.x)

- [ ] Shift-click range selection — add only if user feedback requests it

### Future Consideration (v2.2+)

- Tag/genre filter panel — requires search/filter UX overhaul, no v2.1 dependency

---

## Implementation Notes for Requirements Writer

### Per-song selection — existing surface

`App.tsx` lines 211–248: `<table ref={songTable}>` with `<tbody>` iterating `playlistClips`. Each `<tr>` already has `data-id={row-${clip.id}}`.

**State additions needed:**
```
useState<Set<string>>  — selectedIds
useEffect on playlistClips change  — reset to all-selected
```

**Checkbox component:** Mantine v6 `Checkbox` from `@mantine/core`. Confirmed available — same package already used for `Switch`, `Radio`, `TextInput`, `ActionIcon` throughout the codebase. No new dependency.

**Download call change:** In `downloadPlaylist()`, replace `playlistClips` with `playlistClips.filter(c => selectedIds.has(c.id))` in the `downloadPlaylistApi` call.

**Table column addition:** Prepend a `<th>` (Select All checkbox) and `<td>` (per-row checkbox) to the existing four-column table structure (Img, Title, Length, Status).

### @username UX — existing surface

`App.tsx` lines 185–201: `<input ... placeholder="https://suno.com/playlist/...">`.

**Changes:**
1. `placeholder` attribute — one string change
2. `<p>` element added below the `<div style={{ display: "flex", gap: "10px" }}>` row

**Backend is already complete:** `Suno.ts` lines 30–34 routes `@`-prefixed input to `getSongsFromUser()`. Zero backend change.

### Dependabot check

`gh pr list --state open --label dependencies` — one command, not a code change. Done when PRs #2 and #3 confirmed closed.

---

## Scope Boundaries

| Temptation | Why Out of Scope |
|------------|-----------------|
| Backend partial-ZIP endpoint | Not needed — frontend filter on existing `clips[]` param achieves identical result |
| Audio playback | Explicitly Out of Scope in PROJECT.md |
| Mantine upgrade for better Checkbox API | PROJECT.md: Mantine v6 frozen |
| Drag-to-reorder | No user value sufficient to justify dnd library addition |
| Persist selection to localStorage | Playlist is dynamic per-session; stale IDs are meaningless |
| Settings modal changes | Not in v2.1 scope |
