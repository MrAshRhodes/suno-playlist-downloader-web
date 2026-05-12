# Pitfalls Research

**Domain:** React 18 + Mantine v6 — adding checkbox selection + @username UX to existing download app
**Researched:** 2026-05-12
**Confidence:** HIGH — grounded in actual App.tsx, WebApi.ts, and Suno.ts code

---

## Critical Pitfalls

### Pitfall 1: Bulk-Status Updates Mark Unselected Clips

**What goes wrong:**
`App.tsx` lines 89–91, 116–118, and 125–127 run `prevClips.map(clip => ({ ...clip, status: X }))` unconditionally across the entire `playlistClips` array. After per-song selection exists, this sets Processing / Success / Error on clips the user never wanted downloaded.

**Why it happens:**
The original code had no selection concept — "all clips" and "clips to download" were the same thing. The bulk-status helpers predate selection and will be naively left unchanged.

**How to avoid:**
Keep `selectedIds` as a `Set<string>` in state. Thread it into all three status-map calls:
- Line 89 (Processing sweep): skip clips not in `selectedIds`
- Line 116 (post-download success sweep): same guard
- Line 125 (error recovery sweep): same guard

**Warning signs:**
Unselected rows show Processing spinner during download, then flip to Success/Error on completion.

**Phase to address:** Per-song checkbox phase.

---

### Pitfall 2: Selection State Leaks Into Backend Payload

**What goes wrong:**
`WebApi.ts:75` sends `clips` verbatim: `body: JSON.stringify({ playlist, clips, embedImage })`. If `selected: boolean` is added to `IPlaylistClip`, that field ships to the frozen Express backend. The backend is frozen — even if it currently ignores unknown fields, this pollutes the domain model permanently.

**Why it happens:**
Adding a convenience boolean to the existing interface is the path of least resistance. Developers forget the interface is serialized directly.

**How to avoid:**
Do not add selection state to `IPlaylistClip`. Keep selection in a separate `Set<string> selectedIds`. Before calling `downloadPlaylistApi`, filter: `playlistClips.filter(c => selectedIds.has(c.id))`. Pass only that slice. Backend receives only the clips to process — no interface changes, no payload pollution.

**Warning signs:**
`IPlaylistClip` gains a `selected` or `checked` field. Network tab shows `selected: true/false` in the POST body.

**Phase to address:** Per-song checkbox phase.

---

### Pitfall 3: Mantine v6 Checkbox `onChange` Signature Differs From v7

**What goes wrong:**
Mantine v6 `Checkbox.onChange` is `(event: ChangeEvent<HTMLInputElement>) => void`. Writing `onChange={(checked) => ...}` (the v7 pattern) silently passes the event object as `checked` — always truthy — making all checkboxes appear permanently checked.

**Why it happens:**
Mantine v7 changed the signature to `(checked: boolean)`. Any v7 example, docs snippet, or AI output will use the wrong pattern for this v6-frozen project.

**How to avoid:**
Read the value as `e.currentTarget.checked`. The "select all" header checkbox requires the `indeterminate` prop when `selectedIds.size > 0 && selectedIds.size < playlistClips.length` — Mantine v6 supports this prop on `Checkbox`.

**Warning signs:**
Checkboxes appear always-checked or never toggle. TypeScript may not catch this because `ChangeEvent` is truthy.

**Phase to address:** Per-song checkbox phase.

---

### Pitfall 4: Selection Not Cleared on `getPlaylist` Re-fetch

**What goes wrong:**
`getPlaylist()` calls `setPlaylistClips(data[1])` which replaces the clips array with fresh IDs. A `selectedIds` Set in separate state is not automatically cleared. Stale IDs from the previous playlist persist — on the next download, the filter matches nothing and a 0-song ZIP is produced.

**Why it happens:**
`useState` for clips and `useState` for selectedIds are independent. Clearing clips does not clear selection.

**How to avoid:**
In `getPlaylist()`, after `setPlaylistClips(data[1])`, also call `setSelectedIds(new Set())`. A `useEffect` keyed on `playlistData` as a safety net reinforces this.

**Warning signs:**
After loading a second playlist, selected IDs from the first persist in state. Download produces an empty ZIP or the download button is oddly disabled.

**Phase to address:** Per-song checkbox phase.

---

### Pitfall 5: Download Button Guard Misses Empty Selection

**What goes wrong:**
`App.tsx:259` disables the download button only on `isGettingPlaylist || isDownloading || !playlistData`. After selection exists, a user can load a playlist, deselect all songs, and click Download — resulting in a POST with an empty `clips` array, a broken ZIP, or a server error.

**Why it happens:**
The existing guard predates selection. `!playlistData` was sufficient when all loaded songs were implicitly included.

**How to avoid:**
Add `|| selectedIds.size === 0` to the disabled condition. If "select all by default" behavior is implemented on playlist load, this still correctly prevents post-deselect accidental submits.

**Warning signs:**
Download button is clickable with 0 checkboxes selected.

**Phase to address:** Per-song checkbox phase.

---

### Pitfall 6: `@username` UX Change Bypasses Existing Validation Logic

**What goes wrong:**
`Suno.ts:41` contains the load-bearing routing:
```ts
if (url.startsWith('@') || (!url.includes('http') && !url.includes('playlist') && !url.includes('.')))
```
Any UX change that adds a separate input field, a mode toggle, or transforms the value before calling `getSongsFromPlayList` can bypass this branch. Routing logic lives in `Suno.ts`, not the UI — UX work that treats it as a pure UI change misses the coupling.

**Why it happens:**
The developer thinks "separate username input" is a pure UI change. The connection to the service layer through the raw string value is not obvious.

**How to avoid:**
Keep `getSongsFromPlayList` as the single entry point — do not bypass it or add a parallel call to `getSongsFromUser`. If adding a username-specific input, pass its value directly to `getSongsFromPlayList` unmodified (with or without `@` prefix — the service handles both). Do not pre-validate or transform in the UI.

**Warning signs:**
A user entering `@artist` in a new username field gets "Failed to fetch playlist data" — the service branch was never entered.

**Phase to address:** @username UX phase.

---

### Pitfall 7: Suno Profile URL `suno.com/@username` Falls Through Validation

**What goes wrong:**
Pasting `https://suno.com/@username` hits neither the `@`-prefix branch (no `@` at position 0) nor the bare-username branch (has `http` and `.`). It falls through to the playlist regex `/suno\.com\/playlist\/(.*)/` which produces no match, throwing "Invalid URL or no playlist ID found."

**Why it happens:**
The `@username` feature was added after the original URL-only design. The validation handles bare `@user` input but not full Suno profile URL format.

**How to avoid:**
If the UX work claims to support pasting full Suno profile URLs, add an explicit branch in `getSongsFromPlayList` before the playlist regex:
```ts
const profileMatch = url.match(/suno\.com\/@([^/?]+)/);
if (profileMatch) return this.getSongsFromUser(profileMatch[1]);
```
If UX changes are guidance/copy only (not new format support), the placeholder and error text must list only the formats that actually work — not imply "paste any Suno link."

**Warning signs:**
Any placeholder or copy that says "paste any Suno link" or "paste profile URL" without the corresponding code branch in Suno.ts.

**Phase to address:** @username UX phase.

---

### Pitfall 8: Placeholder Text and Validation Are Out of Sync

**What goes wrong:**
`App.tsx:190` currently shows `placeholder="https://suno.com/playlist/..."` — users don't discover that `@username` works. Updating the placeholder to "Paste playlist URL or @username" without verifying the full URL format case (Pitfall 7) creates a false promise.

**Why it happens:**
Placeholder updates feel like pure UI changes. The developer doesn't trace the shown format through `Suno.ts` validation.

**How to avoid:**
Map every example shown in the placeholder to a specific branch in `Suno.ts`. Update placeholder and error message text together so they agree on what is actually supported.

**Warning signs:**
Placeholder shows a format not covered by any branch in `getSongsFromPlayList`.

**Phase to address:** @username UX phase.

---

### Pitfall 9: Dependabot PRs Target `web-version/` Not the Deployed Root

**What goes wrong:**
Dependabot may have targeted the `web-version/` subtree (separate `package.json`) rather than the root. The root `server.js` is what Replit deploys. Closing `web-version/` PRs without checking the root audit gives a false clean bill of health.

**Why it happens:**
The repo has multiple `package.json` files. Dependabot creates PRs per package file. `web-version/` is not deployed — only root is.

**How to avoid:**
Verify what files Dependabot PRs #2 and #3 actually modified. Run `npm audit` from the repo root (not `web-version/`) to confirm the deployed tree is clean. Note: existing `overrides` in root `package.json` already cover transitively-pinned deps from previous Dependabot work — PRs touching only those paths may be no-ops for the deployed app.

**Warning signs:**
PR diff shows changes only under `web-version/`. Root `package-lock.json` is unmodified.

**Phase to address:** Dependabot verification phase.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Adding `selected` to `IPlaylistClip` | One fewer state variable | Interface serialized to backend — payload pollution, field leaks | Never |
| Bypassing `getSongsFromPlayList` for @username path | Simpler UI code | Two code paths for same operation, validation diverges silently | Never |
| Sharing full `playlistClips` as download list | No filter step | Unselected songs download; all rows get status updates | Never |
| Separate @username input that transforms value before service call | Cleaner UI intent | Breaks routing in Suno.ts silently | Never |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Mantine v6 Checkbox | Copy v7 `onChange={(checked) => ...}` pattern | `onChange={(e) => e.currentTarget.checked}` |
| Mantine v6 Checkbox header row | Omit `indeterminate` prop on partial selection | Pass `indeterminate={selectedIds.size > 0 && selectedIds.size < clips.length}` |
| `downloadPlaylistApi` (WebApi.ts) | Pass full `playlistClips` when selection exists | Pre-filter to `playlistClips.filter(c => selectedIds.has(c.id))` before call |
| SSE progress monitor | Think completedItem IDs outside selectedSet are a bug | They are safe no-ops — server fires for all completed items regardless |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Unselected rows show Processing/Success/Error | User confused — did they download things they didn't select? | Guard all three status-map calls with selectedIds |
| No "select all" / "deselect all" shortcut | 50-song playlist requires 50 clicks to undo deselect | Header checkbox with indeterminate state |
| Download button enabled with 0 songs selected | Empty ZIP or server error on click | Disable when `selectedIds.size === 0` |
| Placeholder claims format validation doesn't support | Valid-looking input fails with cryptic error | Match placeholder exactly to supported branches in Suno.ts |

---

## "Looks Done But Isn't" Checklist

- [ ] **Checkbox selection:** Unselected rows remain `IPlaylistClipStatus.None` throughout and after download.
- [ ] **Checkbox selection:** `selectedIds` is cleared when `getPlaylist` loads a new playlist.
- [ ] **Checkbox selection:** Download button is disabled when `selectedIds.size === 0`.
- [ ] **Checkbox selection:** POST body to `/api/download/playlist` contains only selected clips, not the full array.
- [ ] **Checkbox selection:** `IPlaylistClip` interface has no new `selected`/`checked` field.
- [ ] **@username UX:** `@username`, bare `username`, and `https://suno.com/playlist/...` all still resolve correctly.
- [ ] **@username UX:** Every input format shown in placeholder has a corresponding branch in Suno.ts.
- [ ] **Dependabot:** `npm audit` from repo root is clean (not just `web-version/` subtree).
- [ ] **Dependabot:** PRs #2 and #3 are confirmed closed (not "stale / awaiting review").

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Bulk-status marks unselected clips | LOW | Add `selectedIds.has(clip.id)` guard to three map calls in App.tsx |
| Selection leaks into backend payload | LOW | Move selection to `Set<string>`, filter before POST |
| getPlaylist does not clear selection | LOW | Add `setSelectedIds(new Set())` in getPlaylist after setPlaylistClips |
| Mantine v6 onChange wrong signature | LOW | Change handler to use `e.currentTarget.checked` |
| @username UX bypasses validation | MEDIUM | Revert UI changes, re-thread value through `getSongsFromPlayList` |
| Suno profile URL not handled | MEDIUM | Add regex branch to Suno.ts before playlist regex |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Bulk-status marks unselected clips | Per-song checkbox phase | Unselected rows stay None throughout download |
| Selection leaks into backend payload | Per-song checkbox phase | Network tab: POST body contains only selected clips |
| Mantine v6 Checkbox onChange signature | Per-song checkbox phase | Checkboxes toggle; TypeScript compiles |
| Selection not cleared on re-fetch | Per-song checkbox phase | Load playlist A, select some; load B — selection resets |
| Download button guard misses empty selection | Per-song checkbox phase | Button disabled with 0 checkboxes selected |
| @username UX breaks validation logic | @username UX phase | All input formats still resolve correctly |
| Suno profile URL falls through validation | @username UX phase | `suno.com/@artist` resolves if that format is claimed |
| Placeholder / validation out of sync | @username UX phase | Every placeholder example has a corresponding Suno.ts branch |
| Dependabot PRs target wrong package tree | Dependabot verification phase | Root `npm audit` clean; PRs closed |

---

## Sources

- App.tsx lines 82–131: download flow, bulk-status map calls
- App.tsx line 259: download button disabled condition
- App.tsx line 190: placeholder text
- Suno.ts lines 38–75: getSongsFromPlayList routing and playlist regex
- Suno.ts lines 77–112: getSongsFromUser
- WebApi.ts lines 64–99: downloadPlaylist payload construction
- Mantine v6 Checkbox API: onChange signature, indeterminate prop

---
*Pitfalls research for: Suno Playlist Downloader v2.1 — checkbox selection + @username UX + Dependabot verification*
*Researched: 2026-05-12*
