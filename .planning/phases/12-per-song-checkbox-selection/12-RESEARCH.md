# Phase 12: Per-Song Checkbox Selection - Research

**Researched:** 2026-05-12
**Domain:** React state management, Mantine Checkbox, App.tsx surgery
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use a separate `useState<Set<string>>` of selected song IDs in App.tsx — do NOT modify `IPlaylistClip` interface in `Suno.ts`.
- **D-02:** When playlist loads, initialize the Set with all clip IDs (opt-out model, SEL-05).
- **D-03:** When downloading (either mode), filter `playlistClips` by Set membership before passing to `downloadIndividualSongs` / `downloadPlaylistAsZip`.
- **D-04:** ZIP mode button always shows count: `"Download N songs as ZIP"` — even when all songs are selected.
- **D-05:** Individual mode button also shows count: `"Download N Songs"` — consistent with ZIP mode.
- **D-06:** Button disabled when `selectedIds.size === 0` (in addition to existing guards).
- **D-07:** New leftmost column. Column order: `[Checkbox] | Img | Title | Length | Status`.
- **D-08:** Checkbox column width: compact (~40px).
- **D-09:** Indeterminate → click → all selected. All selected → click → none selected.
- **D-10:** Use Mantine v6 `Checkbox` component with `indeterminate` prop.

### Claude's Discretion
None specified.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEL-01 | User can select/deselect individual songs via checkbox before downloading | Row checkboxes in Table.Td, toggle selectedIds Set on onChange |
| SEL-02 | User can select all or deselect all via header checkbox (with indeterminate state) | Header Checkbox with `indeterminate` prop at Table.Th line 466 |
| SEL-03 | Download button shows count of selected songs | Replace label at line 581 with count-aware strings; `selectedIds.size` |
| SEL-04 | Download button disabled when zero songs selected | Add `selectedIds.size === 0` to disabled prop at line 567 |
| SEL-05 | Selection defaults to all songs selected when playlist loads | Seed Set at line 80 alongside `setPlaylistClips(data[1])` |
</phase_requirements>

---

## Summary

This phase adds per-song checkbox selection to the existing song table in `web-version/client/src/App.tsx`. All decisions are locked; the implementation is a focused, additive change to a single 621-line file. No new packages are required — `Checkbox` is already available from the installed Mantine package.

**Critical finding:** Planning artifacts (CLAUDE.md, CONTEXT.md, REQUIREMENTS.md, UI-SPEC.md) all reference Mantine v6, but the actual installed package is **Mantine v7.17.5** (`web-version/client/package.json` declares `^7.15.3`, installed version confirmed as `7.17.5`). This does not block implementation — the v7 `Checkbox` component uses the same event-based `onChange: (e: ChangeEvent<HTMLInputElement>) => void` signature as v6 (verified from `.d.ts`). The REQUIREMENTS.md warning about "Mantine v7 (checked) => pattern" is a strawman that does NOT apply to v7's Checkbox. The planner should treat the Mantine version as v7 for implementation, not v6.

**Second critical finding:** REQUIREMENTS.md states "Three bulk-status maps in App.tsx (~lines 89, 116, 125)". The actual file has **four** bulk `prevClips.map(...)` resets at lines **131, 181, 212, and 223**. All four need the `selectedIds.has(clip.id)` guard added (or behavior limited to selected clips), otherwise unselected songs will incorrectly receive status updates during download.

**Primary recommendation:** Implement state initialization at lines 76+80, add checkbox column at lines 464-502, update download button at lines 565-583, and add selectedIds guard to all four bulk status maps.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Selection state | Browser / Client | — | UI-only state in App.tsx; never sent to server |
| Checkbox rendering | Browser / Client | — | Mantine component, JSX in App.tsx table |
| Download filtering | Browser / Client | — | Filter applied before calling WebApi.ts, no backend change |
| Button label/disabled | Browser / Client | — | Derived from selectedIds.size, pure UI |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @mantine/core | 7.17.5 (installed) | Checkbox, Table components | Already in dependency tree; no new packages |
| React | 18.3.1 | State management (useState) | Project framework |

**Version verification:** [VERIFIED: node_modules/@mantine/core/package.json] — `7.17.5` installed.

### No new packages required
All needed components are already installed.

---

## Architecture Patterns

### Recommended Implementation Structure

No new files — all changes in `web-version/client/src/App.tsx`.

```
src/
├── App.tsx           ← All changes confined here
│   ├── selectedIds state (new)
│   ├── Table header checkbox (new)
│   ├── Table row checkboxes (new)
│   ├── Download button label + disabled guard (modified)
│   └── Four bulk status maps (modified)
├── services/Suno.ts  ← Read-only, IPlaylistClip.id: string confirmed
└── services/WebApi.ts ← Read-only, downloadPlaylist(playlist, clips, embedImage) confirmed
```

### Pattern 1: selectedIds State Initialization

**What:** `useState<Set<string>>` seeded with all clip IDs on playlist load.

**Exact insertion points:**
- Line 69 area (after existing state declarations): add `const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());`
- Line 76: `setPlaylistClips([])` — also add `setSelectedIds(new Set())` to clear on new playlist fetch
- Line 80: `setPlaylistClips(data[1])` — also add `setSelectedIds(new Set(data[1].map((c: IPlaylistClip) => c.id)))` to seed all IDs

**No state change on catch (line 87):** playlist load failed, clips are empty, Set stays empty (correct behavior).

```typescript
// Source: [VERIFIED: App.tsx line 69 area]
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

// On playlist load success (line 80 area):
setPlaylistClips(data[1]);
setSelectedIds(new Set(data[1].map((c: IPlaylistClip) => c.id)));

// On new playlist fetch start (line 76 area):
setPlaylistClips([]);
setSelectedIds(new Set());
```

### Pattern 2: Header Checkbox Tri-State

**What:** Derived booleans from `selectedIds` + `playlistClips` control the header checkbox state.

```typescript
// Source: [VERIFIED: Mantine v7 Checkbox .d.ts — indeterminate prop confirmed]
const allSelected = playlistClips.length > 0 && selectedIds.size === playlistClips.length;
const someSelected = selectedIds.size > 0 && selectedIds.size < playlistClips.length;

// Header checkbox behavior (D-09):
// indeterminate → click → all selected
// all selected → click → none selected
const handleHeaderCheckbox = () => {
  if (allSelected) {
    setSelectedIds(new Set());
  } else {
    setSelectedIds(new Set(playlistClips.map(c => c.id)));
  }
};
```

**Insert at:** Table.Th at line 466 (currently `<Table.Th>Img</Table.Th>`) — prepend a new `<Table.Th>` column before it.

### Pattern 3: Row Checkbox onChange

**What:** Toggle individual clip ID in/out of Set.

Mantine v7 Checkbox `onChange` type (verified from `Checkbox.d.ts`): inherits `ElementProps<'input', 'size' | 'children'>` → native `onChange: (e: React.ChangeEvent<HTMLInputElement>) => void`. The warning in REQUIREMENTS.md about "v7 (checked) =>" does NOT apply — v7 uses the same event-based signature.

```typescript
// Source: [VERIFIED: node_modules/@mantine/core/lib/components/Checkbox/Checkbox.d.ts]
<Checkbox
  checked={selectedIds.has(clip.id)}
  disabled={isDownloading}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (e.currentTarget.checked) {
        next.add(clip.id);
      } else {
        next.delete(clip.id);
      }
      return next;
    });
  }}
/>
```

**Insert at:** New leftmost `<Table.Td>` before line 475 (current `<Table.Td w={50}>` for image).

### Pattern 4: Download Filter

**What:** Filter clips before passing to either download handler.

`downloadPlaylist(playlist, clips, embedImage)` — second arg `clips: any[]` confirmed at `WebApi.ts:97-101`. Filtered array is a drop-in replacement.

```typescript
// Source: [VERIFIED: WebApi.ts line 97-101]
// In downloadPlaylistAsZip (line 204 area):
const selectedClips = playlistClips.filter(c => selectedIds.has(c.id));
await downloadPlaylist(playlistData, selectedClips, settings.embed_images === "true");

// In downloadIndividualSongs (line 143 area):
const selectedClips = playlistClips.filter(c => selectedIds.has(c.id));
const downloadPromises = selectedClips.map((song) => { ... });
```

### Pattern 5: Button Label + Disabled

**What:** Replace static label at line 581, add selectedIds guard to disabled at line 567.

```typescript
// Source: [VERIFIED: App.tsx lines 565-583]

// Disabled (line 567):
disabled={isGettingPlaylist || isDownloading || (!playlistData) || selectedIds.size === 0}

// Label (line 581) — singular/plural per UI-SPEC.md:
{downloadMode === "zip"
  ? `Download ${selectedIds.size} ${selectedIds.size === 1 ? "song" : "songs"} as ZIP`
  : `Download ${selectedIds.size} ${selectedIds.size === 1 ? "Song" : "Songs"}`}
```

### Pattern 6: Bulk Status Map Guards (CRITICAL — 4 locations)

**What:** All four `setPlaylistClips(prevClips => prevClips.map(...))` bulk status resets must be scoped to selected clips or the full reset will include unselected songs.

**The four locations (verified line numbers):**

| Line | Handler | Status Set To | Action |
|------|---------|---------------|--------|
| 131 | `downloadIndividualSongs` reset | `.None` | Scope to selected — unselected stay None anyway, or just leave (benign if reset to None) |
| 181 | `downloadPlaylistAsZip` reset | `.Processing` | **Must** scope — unselected songs should not show Processing |
| 212 | `downloadPlaylistAsZip` success | `.Success` | **Must** scope — unselected songs should not show Success |
| 223 | `downloadPlaylistAsZip` failure | `.Error` | **Must** scope — unselected songs should not show Error |

REQUIREMENTS.md referenced "three maps at ~lines 89, 116, 125" — **those line numbers are wrong**. The actual count is **four** and the actual lines are 131, 181, 212, 223. [VERIFIED: App.tsx full read]

The guard pattern for all four:
```typescript
setPlaylistClips((prevClips) =>
  prevClips.map((clip) =>
    selectedIds.has(clip.id)
      ? { ...clip, status: IPlaylistClipStatus.Processing }
      : clip
  )
);
```

Note: `updateClipStatus` at line 94 (targeted by-ID) does NOT need modification — it already operates on a single clip by ID.

Note: Individual mode reset at line 131 sets `.None` — unselected clips are likely already `.None`, so this particular reset is benign even without the guard. But it's safer and more correct to guard it anyway.

### Anti-Patterns to Avoid

- **Mutating the Set directly:** Always create a new Set (`new Set(prev)`) before `add`/`delete` — React requires new reference for re-render.
- **Deriving selection from IPlaylistClip:** Do not add a `selected` field to `IPlaylistClip` (D-01 locked). Selection state stays exclusively in `selectedIds`.
- **Trusting stale line number references from REQUIREMENTS.md:** Use the verified line numbers in this document.
- **Assuming Mantine v6 onChange pattern:** The installed version is v7. Use `(e: React.ChangeEvent<HTMLInputElement>) => e.currentTarget.checked` — confirmed correct for both v6 and v7 (same native event).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Indeterminate checkbox state | Custom CSS/SVG | Mantine `Checkbox` with `indeterminate` prop | Already handles the visual; prop wires to native `input.indeterminate` via useEffect |
| Checkbox disabled visual | Custom styling | Mantine `disabled` prop | v7 applies `data-disabled` and built-in opacity styling |

---

## Runtime State Inventory

> Omitted — this is a greenfield UI addition with no rename/refactor scope.

---

## Common Pitfalls

### Pitfall 1: Set Mutation Causing Missed Re-renders
**What goes wrong:** `prev.add(id); return prev` — same Set reference, React bails on re-render.
**Why it happens:** Set is a reference type; mutating it doesn't change the reference.
**How to avoid:** Always `const next = new Set(prev); next.add(id); return next;`
**Warning signs:** Checkbox checked state doesn't update visually on click.

### Pitfall 2: Bulk Status Maps Updating Unselected Songs
**What goes wrong:** Lines 181, 212, 223 reset ALL clips' status — unselected songs show "Processing" or "Success" during a download of only selected clips.
**Why it happens:** Maps iterate all of `prevClips`, not just selected.
**How to avoid:** Add `selectedIds.has(clip.id) ? { ...clip, status: X } : clip` guard to all four maps.
**Warning signs:** Songs that were unchecked show a status icon during/after download.

### Pitfall 3: selectedIds Not Reset on New Playlist Fetch
**What goes wrong:** User fetches playlist A (10 songs), deselects 3, fetches playlist B (7 songs) — selectedIds still holds IDs from playlist A. Filter produces 0 matches.
**Why it happens:** `setPlaylistClips([])` at line 76 clears clips but selectedIds isn't cleared.
**How to avoid:** Call `setSelectedIds(new Set())` alongside `setPlaylistClips([])` at line 76, and `setSelectedIds(new Set(data[1].map(c => c.id)))` alongside `setPlaylistClips(data[1])` at line 80.
**Warning signs:** Download button immediately shows count 0 after second playlist load.

### Pitfall 4: Wrong Mantine Version Assumption
**What goes wrong:** Implementing against v6 Checkbox API docs when v7.17.5 is installed.
**Why it happens:** CLAUDE.md and planning docs say v6, but `package.json` and `node_modules` are v7.
**How to avoid:** The `onChange` event signature is identical in both versions (native `ChangeEvent<HTMLInputElement>`) — code as written will work correctly. Do not apply any v6-specific workarounds that don't exist in v7.
**Warning signs:** TypeScript errors on `indeterminate` prop (won't happen — it exists in v7).

### Pitfall 5: Import Not Added
**What goes wrong:** `Checkbox` not added to Mantine import at line 4.
**Why it happens:** Existing imports at line 4-23 don't include `Checkbox`.
**How to avoid:** Add `Checkbox` to the destructured import from `@mantine/core` at line 4.
**Warning signs:** TypeScript error `Cannot find name 'Checkbox'`.

---

## Code Examples

### Complete Header Checkbox
```typescript
// Source: [VERIFIED: App.tsx table structure lines 464-471, Mantine v7 .d.ts]
const allSelected = playlistClips.length > 0 && selectedIds.size === playlistClips.length;
const someSelected = selectedIds.size > 0 && !allSelected;

// In Table.Thead, prepend before existing <Table.Th>Img</Table.Th>:
<Table.Th w={40}>
  <Checkbox
    checked={allSelected}
    indeterminate={someSelected}
    disabled={isDownloading}
    aria-label={allSelected ? "Deselect all songs" : "Select all songs"}
    onChange={() => {
      if (allSelected) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set(playlistClips.map(c => c.id)));
      }
    }}
  />
</Table.Th>
```

### Complete Row Checkbox
```typescript
// Source: [VERIFIED: App.tsx table rows lines 474-501, Mantine v7 .d.ts]
// Prepend before existing <Table.Td w={50}> (image cell):
<Table.Td w={40}>
  <Checkbox
    checked={selectedIds.has(clip.id)}
    disabled={isDownloading}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (e.currentTarget.checked) {
          next.add(clip.id);
        } else {
          next.delete(clip.id);
        }
        return next;
      });
    }}
  />
</Table.Td>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Store selection in IPlaylistClip.selected | Separate Set<string> state | Phase 12 (D-01) | Keeps data model clean; selection is transient UI state |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Mantine v7 Checkbox `onChange` accepts native `ChangeEvent<HTMLInputElement>` | Code Examples | TypeScript compile error — verify with `tsc --noEmit` in Wave 0 |

Note: A1 was cross-checked against the installed `.d.ts` (`ElementProps<'input', 'size' \| 'children'>` → native event) and is HIGH confidence, but tagged ASSUMED for the planner to confirm via build.

---

## Open Questions

1. **Mantine version discrepancy**
   - What we know: package.json declares v7.15.3, installed is v7.17.5. Planning docs say v6.
   - What's unclear: Whether any existing App.tsx component uses a v6-only API that would break on v7.
   - Recommendation: This is a pre-existing condition; App.tsx already builds with v7 installed. No action needed for Phase 12.

2. **Header checkbox onChange vs onClick**
   - What we know: D-09 specifies "indeterminate → click → all selected". Mantine's `indeterminate` prop sets `input.indeterminate` but does not affect the `checked` prop — the underlying input fires `onChange` normally.
   - What's unclear: Whether `onChange` fires correctly when the visual indeterminate state is set.
   - Recommendation: Use `onChange` (not `onClick`) on the header checkbox. The `indeterminate` prop is visual-only; the input still has a `checked` value and fires normal change events. Logic reads `allSelected` to decide which action to take.

---

## Environment Availability

> SKIPPED — phase is client-side code changes only. No external tools, services, or CLIs required beyond existing `npm run dev` / `yarn build` build process.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed in web-version/client |
| Config file | None — no vitest.config.*, jest.config.*, or test scripts in package.json |
| Quick run command | N/A — no automated test runner |
| Full suite command | N/A |

No test files exist in `web-version/client/src/`. The only `.test.js` found is `node_modules/gensync/test/index.test.js` — a transitive dependency, not project tests.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEL-01 | Individual checkbox toggles selection | manual | N/A | ❌ no test harness |
| SEL-02 | Header checkbox cycles through all/none/indeterminate | manual | N/A | ❌ no test harness |
| SEL-03 | Button label reflects `selectedIds.size` | manual | N/A | ❌ no test harness |
| SEL-04 | Button disabled at zero selections | manual | N/A | ❌ no test harness |
| SEL-05 | All songs selected on playlist load | manual | N/A | ❌ no test harness |

### Sampling Rate
- **Per task:** `npm run build` (TypeScript compile) in `web-version/client/`
- **Phase gate:** `npm run build` green + manual verification checklist below

### Manual Verification Checklist (replaces automated tests)
- [ ] SEL-01: Uncheck one song → count decrements, recheck → count increments
- [ ] SEL-02: Uncheck some → header shows indeterminate; click header → all checked; click again → all unchecked; click again → all checked
- [ ] SEL-03: With 3/10 selected, button shows "Download 3 songs as ZIP" / "Download 3 Songs"
- [ ] SEL-04: Uncheck all → button disabled; recheck one → button enabled
- [ ] SEL-05: Load new playlist → all songs checked, button shows full count
- [ ] Bulk status: Download selected subset → only selected songs show Processing/Success/Error status icons; unchecked songs show no status

### Wave 0 Gaps
- No test harness to install — manual verification is the validation strategy for this phase. Installing vitest would be out of scope.

---

## Security Domain

> This phase introduces no authentication, session management, access control, cryptography, or external input. The only new data is `Set<string>` of IDs that are already present in `playlistClips` state. No ASVS categories apply.

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: App.tsx full read] — line numbers for all touch points confirmed
- [VERIFIED: node_modules/@mantine/core/package.json] — v7.17.5 installed
- [VERIFIED: node_modules/@mantine/core/lib/components/Checkbox/Checkbox.d.ts] — `indeterminate?: boolean`, `ElementProps<'input', ...>` confirms ChangeEvent onChange
- [VERIFIED: web-version/client/src/services/WebApi.ts lines 97-101] — `downloadPlaylist(playlist, clips, embedImage)` signature
- [VERIFIED: web-version/client/src/services/Suno.ts line 23] — `IPlaylistClip.id: string`
- [VERIFIED: web-version/client/package.json] — `@mantine/core: ^7.15.3`, no test scripts

### Secondary (MEDIUM confidence)
- [CITED: CONTEXT.md decisions D-01 through D-10] — locked decisions
- [CITED: 12-UI-SPEC.md] — copywriting contract, disabled guard matrix

### Tertiary (LOW confidence — none)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from node_modules
- Architecture: HIGH — verified from App.tsx full read with exact line numbers
- Pitfalls: HIGH — derived from verified source code

**Research date:** 2026-05-12
**Valid until:** 2026-06-12 (stable codebase)
