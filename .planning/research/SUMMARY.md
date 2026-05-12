# Project Research Summary

**Project:** Suno Playlist Downloader — v2.1 UX & Discovery
**Domain:** Music download tool — per-song selection, input UX, housekeeping
**Researched:** 2026-05-12
**Confidence:** HIGH

## Executive Summary

v2.1 is a pure client-side feature milestone with zero new dependencies and zero backend changes. All three work streams — per-song checkbox selection, @username input guidance, and Dependabot verification — are satisfied entirely by the existing stack: React 18, TypeScript 5, and Mantine 6.0.13. The download route already accepts an arbitrary `clips[]` array, so selective download is a frontend filter applied before the existing `downloadPlaylistApi` call; no new API parameters or route modifications are required.

Three independent, non-blocking work streams executable in any order. Per-song selection carries the highest implementation surface (5 state and UI changes to App.tsx) and the most traps. The @username stream is low-effort copy plus one optional Suno.ts branch addition. The Dependabot stream is a single CLI command. None depends on the others.

The primary risk is subtle state contamination in App.tsx. Three existing bulk-status map calls will mark unselected clips as Processing/Success/Error unless each is guarded against the `selectedIds` Set. A secondary risk is using the Mantine v7 Checkbox `onChange` signature (`(checked) => ...`) instead of the v6 pattern (`(e) => e.currentTarget.checked`) — this silently makes all checkboxes always-checked and TypeScript will not catch it.

## Key Findings

### Recommended Stack

No new packages. Zero changes to `package.json` or any backend file. The entire milestone is confined to `client/src/`. Mantine v6 `Checkbox` with `indeterminate` prop support ships in the already-installed `@mantine/core@6.0.13`.

**Core technologies:**
- `React 18.2.0` — `useState<Set<string>>` + `useEffect` are the entire selection state model
- `@mantine/core 6.0.13` — `Checkbox` (with `indeterminate`), `Badge`, `Text`, `Alert` — already installed
- `TypeScript 5.0.4` — extend existing `IPlaylistClip` usage; no new interfaces, no schema changes
- `Express.js 4.19.2` — backend frozen; `clips[]` param already accepted by download route

### Expected Features

**Must have (table stakes):**
- Checkbox per song row — `Checkbox` from existing Mantine install
- Select All / Deselect All header control — `indeterminate` state in header checkbox
- Download button reflects selection count — "Download 4 songs as ZIP"
- Input placeholder hints at `@username` format — single attribute change

**Should have (differentiator):**
- Default-all-selected on playlist load — opt-out preserves current behavior
- Selective ZIP download — client filter before `downloadPlaylistApi`, no backend change
- Helper text below input — one `<p>` element, no state

**Defer (v2.2+):**
- Shift-click range selection
- Tag/genre filter panel
- Audio preview (Out of Scope in PROJECT.md)

### Architecture Approach

The v2.1 architecture is minimal — one new `useState<Set<string>>` in App.tsx, one `useEffect` keyed on `playlistClips`, three guard additions to existing status-map calls, one filter applied before `downloadPlaylistApi`, and one new disabled condition on the download button.

**Key implementation surfaces:**
1. `App.tsx` state block — add `selectedIds: Set<string>`, init via `useEffect`
2. `App.tsx` song table — prepend `<th>` / `<td>` columns with Mantine `Checkbox`
3. `App.tsx` bulk-status maps (lines ~89, ~116, ~125) — add `selectedIds.has(clip.id)` guard to all three
4. `App.tsx` download call — filter `playlistClips` by `selectedIds` before `downloadPlaylistApi`
5. `App.tsx` input area — update placeholder; add helper `<p>` below input row
6. `Suno.ts` (optional) — add `suno.com/@username` URL format branch if that format is advertised

### Critical Pitfalls

1. **Bulk-status maps mark unselected clips** — `App.tsx` lines ~89, ~116, ~125 map unconditionally across all clips. Add `selectedIds.has(clip.id)` guard to all three; unselected rows must stay `IPlaylistClipStatus.None`.

2. **Mantine v6 Checkbox `onChange` signature** — v6 is `(e: ChangeEvent<HTMLInputElement>) => void`; read value as `e.currentTarget.checked`. The v7 pattern `(checked) => ...` always evaluates truthy. TypeScript will not catch this.

3. **Selection leaks into backend payload** — do not add `selected` field to `IPlaylistClip`; the interface is serialized to the frozen Express backend. Keep selection in a separate `Set<string>`, filter before POST.

4. **Stale selection on playlist re-fetch** — call `setSelectedIds(new Set())` in `getPlaylist()` after `setPlaylistClips(data[1])`; also use `useEffect` keyed on `playlistData` as a safety net.

5. **Download button enabled with 0 songs selected** — extend the existing `disabled` condition with `|| selectedIds.size === 0`.

6. **`suno.com/@username` URL falls through validation** — `Suno.ts` handles bare `@user` but not the full profile URL format. Decide scope before Phase 2 implementation.

## Implications for Roadmap

### Suggested Phases (3)

**Phase 12: Per-Song Checkbox Selection**
Delivers: `selectedIds` state, checkbox column, Select All header, filtered download call, button count label, empty-selection guard.
Prevents: Pitfalls 1–5 (bulk-status guards, v6 onChange, no interface pollution, stale clear, button gate).

**Phase 13: @Username Input UX**
Delivers: Updated placeholder, helper text, optional `suno.com/@username` URL branch in Suno.ts.
Prevents: Pitfalls 6–8 (no validation bypass, sync placeholder to actual supported formats).
Gate: Decide URL format scope before implementing.

**Phase 14: Dependabot Verification**
Delivers: Confirmed npm audit clean from root, PRs #2 and #3 closed.
Prevents: Pitfall 9 (root audit vs. web-version/ subtree confusion).

### Research Flags

No further research needed for any phase — all patterns documented with line-level specificity.

### Open Decisions

1. **`suno.com/@username` URL format scope** — advertise bare `@username` only (no Suno.ts change) or also support pasting full profile URLs (add regex branch in Suno.ts). Must be decided before Phase 13.
2. **Dependabot PR identity** — confirm which trees PRs #2 and #3 target with `gh pr view 2` and `gh pr view 3` before closing Phase 14.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Direct reads of package.json, download.js, App.tsx, Suno.ts |
| Features | HIGH | Grounded in existing codebase surface |
| Architecture | HIGH | v2.1 arch derived from App.tsx line-level analysis |
| Pitfalls | HIGH | Each pitfall traced to specific line numbers in source files |

**Overall confidence:** HIGH

## Sources

- `client/package.json` — confirmed `@mantine/core ^6.0.13`, React 18.2.0, TypeScript 5.0.4
- `web-version/routes/download.js` lines 96–98 — `clips` array destructured; no new param needed
- `client/src/App.tsx` lines 82–131, 211–248, 259 — bulk-status maps, song table, download button
- `client/src/services/Suno.ts` lines 38–75 — `getSongsFromPlayList` routing and validation
- `client/src/services/WebApi.ts` lines 64–99 — `downloadPlaylist` payload construction
- Mantine v6 changelog — `Checkbox` `indeterminate` prop confirmed in v6.0.13

---
*Research completed: 2026-05-12 | Ready for roadmap: yes*
