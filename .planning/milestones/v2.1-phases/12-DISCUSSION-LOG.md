# Phase 12: Per-Song Checkbox Selection — Discussion Log

**Date:** 2026-05-12
**Mode:** Default (interactive)
**Areas discussed:** 4 of 4

---

## Area 1: Selection State Storage

**Question:** Where should selection state live?

| Option | Description |
|--------|-------------|
| Separate Set<string> in App.tsx | IPlaylistClip stays pure, no interface change to Suno.ts |
| selected field on IPlaylistClip | Add `selected: boolean` to interface — simpler co-location |
| You decide | Claude picks |

**Selected:** Separate Set<string> in App.tsx

**Notes:** Keeps IPlaylistClip interface clean. Selection is UI-only state.

---

## Area 2: Button Label Format

**Question 1:** ZIP mode button label when subset selected?

| Option | Description |
|--------|-------------|
| "Download N songs as ZIP" always | Always show count, even when all selected |
| Count only when partial, revert when all | Smart label, more branching |

**Selected:** "Download N songs as ZIP" always

**Question 2:** Individual mode button label?

| Option | Description |
|--------|-------------|
| Yes, "Download N Songs" | Consistent with ZIP mode |
| No, stays "Download Songs" | Only ZIP gets count |
| You decide | Claude picks |

**Selected:** Yes, "Download N Songs"

---

## Area 3: Checkbox Column Layout

**Question:** Where does the checkbox column go?

| Option | Description |
|--------|-------------|
| New leftmost column | [Checkbox] \| Img \| Title \| Length \| Status |
| Replace Img column | Checkbox where image was — loses cover art |
| You decide | Claude picks |

**Selected:** New leftmost column

---

## Area 4: Header Checkbox Click Behavior

**Question:** Indeterminate state → click → ?

| Option | Description |
|--------|-------------|
| All selected | Standard Gmail/GitHub pattern |
| None selected | "Cancel all" pattern, less standard |

**Selected:** All selected (indeterminate → all → none)

---

## Deferred Ideas

None.

---

## Claude's Discretion Items

- Checkbox column width: ~40px compact
- Use Mantine v6 `Checkbox` component with `indeterminate` prop
