# Phase 12: Per-Song Checkbox Selection - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Add per-song checkbox selection to the existing song table. Opt-out model: all songs checked by default on playlist load. Users can deselect individual songs or use a header checkbox (select-all / deselect-all / indeterminate). Download button reflects selection count and is disabled at zero selections.

Self-contained UI change in `web-version/client/src/App.tsx`. No backend changes required.

</domain>

<decisions>
## Implementation Decisions

### Selection State Storage
- **D-01:** Use a separate `useState<Set<string>>` of selected song IDs in App.tsx — do NOT modify `IPlaylistClip` interface in `Suno.ts`. Selection state is UI-only and should not pollute the data model.
- **D-02:** When playlist loads, initialize the Set with all clip IDs (opt-out model, SEL-05).
- **D-03:** When downloading (either mode), filter `playlistClips` by Set membership before passing to `downloadIndividualSongs` / `downloadPlaylistAsZip`.

### Button Label Format
- **D-04:** ZIP mode button always shows count: `"Download N songs as ZIP"` — even when all songs are selected. Count = `selectedIds.size`.
- **D-05:** Individual mode button also shows count: `"Download N Songs"` — consistent with ZIP mode.
- **D-06:** Button disabled when `selectedIds.size === 0` (in addition to existing `isGettingPlaylist || isDownloading || !playlistData` guards).

### Checkbox Column Layout
- **D-07:** Add a new leftmost column to the table. Column order becomes: `[Checkbox] | Img | Title | Length | Status`. The header row gets the select-all Checkbox in the new first `<Table.Th>`.
- **D-08:** Checkbox column width: compact (fits just the checkbox, ~40px).

### Header Checkbox Click Behavior
- **D-09:** Indeterminate → click → all selected. All selected → click → none selected. (Standard Gmail/GitHub pattern.)
- **D-10:** Use Mantine v6 `Checkbox` component with `indeterminate` prop — it's supported in v6.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §SEL-01 through SEL-05 — all 5 selection requirements, locked

### Source Files to Modify
- `web-version/client/src/App.tsx` — song table, download handlers, download button (primary implementation target)
- `web-version/client/src/services/Suno.ts` — IPlaylistClip interface (read only — do NOT add `selected` field)
- `web-version/client/src/services/WebApi.ts` — `downloadPlaylist(clips, ...)` signature (read to understand what gets passed)

### Codebase Maps
- `.planning/codebase/ARCHITECTURE.md` — layer overview
- `.planning/codebase/CONVENTIONS.md` — code style, naming, patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Checkbox` from Mantine v6 — supports `indeterminate` prop. Import from `@mantine/core`.
- `playlistClips` state (`useState<IPlaylistClip[]>`) — source of truth for song list; filter by selected IDs at download time.
- `isDownloading`, `isGettingPlaylist`, `playlistData` — existing disabled guards on the download button.

### Established Patterns
- Table rendering: `web-version/client/src/App.tsx:463` — `<Table verticalSpacing="sm">` with Thead/Tbody/Tr/Td/Th from Mantine v6.
- Download handlers: `downloadIndividualSongs` (line ~122) iterates `playlistClips.map(...)` — replace with filtered array. `downloadPlaylistAsZip` (line ~173) calls `downloadPlaylist(playlistData, playlistClips, ...)` — pass filtered array instead.
- Button label: current label at ~line 581 is `downloadMode === "zip" ? "Download ZIP" : "Download Songs"` — replace with count-aware strings.
- Playlist load resets clip state at `setPlaylistClips(...)` — also reset selectedIds Set to all IDs at same point.

### Integration Points
- New `selectedIds: Set<string>` state must be initialized alongside `playlistClips` on playlist fetch completion.
- `downloadIndividualSongs` and `downloadPlaylistAsZip` each need a `const selectedClips = playlistClips.filter(c => selectedIds.has(c.id))` line before their logic.

</code_context>

<specifics>
## Specific Ideas

No specific UI references — standard Mantine Checkbox component, leftmost column, standard indeterminate behavior.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 12-per-song-checkbox-selection*
*Context gathered: 2026-05-12*
