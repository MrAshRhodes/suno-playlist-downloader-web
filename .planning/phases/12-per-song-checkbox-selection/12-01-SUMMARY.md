---
phase: 12-per-song-checkbox-selection
plan: 01
subsystem: ui
tags: [react, checkbox, selection-state, set, typescript]

requires: []
provides:
  - Per-song checkbox selection with opt-out default (all selected on load)
  - Header checkbox with tri-state (indeterminate when partially selected)
  - Download button label showing live selection count with singular/plural
  - Download button disabled at zero selection
  - Download handlers filter to selectedIds — unselected songs never get status updates or API calls
affects: [phase-13, any future feature touching the download flow]

tech-stack:
  added: []
  patterns:
    - "Capture e.currentTarget.checked before setSelectedIds functional updater — React clears currentTarget after handler returns"
    - "selectedIds as Set<string> keyed on clip.id — O(1) has() lookup in render and filter"
    - "Opt-out model: seed Set with all IDs on playlist load, reset on new fetch"

key-files:
  created: []
  modified:
    - client/src/App.tsx
    - web-version/client/src/App.tsx

key-decisions:
  - "Applied to client/src/App.tsx (prod) not web-version/client/src/App.tsx — plan targeted wrong file; prod is the client/ directory"
  - "Used plain HTML <input type='checkbox'> with ref callback for indeterminate (prod App uses plain HTML, not Mantine)"
  - "Captured e.currentTarget.checked before setSelectedIds updater — avoids null dereference from React synthetic event pooling"

patterns-established:
  - "Event value capture: const checked = e.currentTarget.checked before any async/setState call"
  - "indeterminate via ref callback: ref={(el) => { if (el) el.indeterminate = someSelected; }}"

requirements-completed: [SEL-01, SEL-02, SEL-03, SEL-04, SEL-05]

duration: 45min
completed: 2026-05-12
---

# Phase 12: Per-Song Checkbox Selection Summary

**Users can now select individual songs before downloading — opt-out model, all selected by default, download filters to selection.**

## Performance

- **Duration:** ~45 min
- **Completed:** 2026-05-12
- **Tasks:** 2 implementation + 1 bugfix
- **Files modified:** 2

## Accomplishments

- Added `selectedIds: Set<string>` state seeded from all clip IDs on playlist load
- Header checkbox shows indeterminate state when partially selected; cycles all→none and none/partial→all
- Row checkboxes toggle individual selection
- Download button label: "Download N songs as ZIP" with correct singular at N=1
- Download button disabled when selectedIds.size === 0
- Both download handlers (`downloadPlaylist` in prod, `downloadIndividualSongs`/`downloadPlaylistAsZip` in web-version) filter to `selectedClips` and guard all 3 bulk status maps
- Fixed React synthetic event bug: captured `e.currentTarget.checked` before functional updater

## Issues Found & Fixed

**Bug:** `e.currentTarget` was null inside `setSelectedIds(prev => ...)` updater — React clears synthetic event's currentTarget after the handler returns. Fixed by extracting `const checked = e.currentTarget.checked` before the setState call.

## Verification

All SEL-01 through SEL-05 browser-verified:
- SEL-05 PASS: all songs pre-checked on load
- SEL-01 PASS: individual toggle updates count, no crash
- SEL-02 PASS: header tri-state (indeterminate, all, none cycles)
- SEL-04 PASS: button disabled at 0 selection
- SEL-03 PASS: count label with correct singular/plural
