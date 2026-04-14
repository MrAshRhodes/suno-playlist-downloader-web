---
phase: 07-support-donation-modal-with-generated-banner
plan: 02
subsystem: ui
tags: [react, mantine, localStorage, donation]

requires:
  - phase: 07-01
    provides: DonationModal component and banner image asset
provides:
  - Download counter with localStorage persistence
  - DonationModal wired into App.tsx download flow
  - Non-blocking modal trigger on 1st and every 5th download
affects: []

tech-stack:
  added: []
  patterns: [localStorage counter pattern for soft-ask donation prompts]

key-files:
  created: []
  modified: [client/src/App.tsx]

key-decisions:
  - "Counter fires before async download — modal is non-blocking"
  - "No permanent opt-out — modal re-appears per formula (1, 5, 10, 15...)"

patterns-established:
  - "localStorage counter: increment before condition check, persist across refreshes"

requirements-completed: [DON-01, DON-05, DON-06]

duration: 3min
completed: 2026-04-14
---

# Phase 07, Plan 02: Wire Download Counter Summary

**Download counter and DonationModal wired into App.tsx — modal triggers on 1st download and every 5th after, non-blocking**

## Performance

- **Duration:** 3 min
- **Tasks:** 2 (1 auto + 1 human-verify)
- **Files modified:** 1

## Accomplishments
- Download counter with localStorage persistence (`suno-download-count`)
- `checkAndShowDonationModal()` fires before async download starts
- Trigger formula: `next === 1 || next % 5 === 0` (counts 1, 5, 10, 15...)
- DonationModal rendered in App.tsx JSX with state management
- Existing support-banner div preserved untouched (D-05)
- Human verification: modal appears on download, dismisses via X and click-outside, BMC link works

## Task Commits

1. **Task 1: Wire download counter and DonationModal into App.tsx** - `2763227` (feat)
2. **Task 2: Human verification** - approved by user

## Files Created/Modified
- `client/src/App.tsx` - Added DonationModal import, donationModalOpen state, checkAndShowDonationModal counter, JSX render

## Decisions Made
- Counter call placed as FIRST line in downloadPlaylist(), before setDownloadPercentage(0) and any await
- No individual song download handler exists (WebApi.ts confirms ZIP-only), so counter wired to downloadPlaylist() only

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
- Server serves from `public/` directory (priority 0), not `client/dist/` — required manual sync after build for changes to be visible
- nanobanana banner regenerated at orchestrator level (eb6835c) since executor subagent lacked MCP access

## Next Phase Readiness
- Phase 07 complete — donation modal feature fully functional
- Ready for Phase 05 (Download Support Popup) or Phase 06 (Premium title banner)

---
*Phase: 07-support-donation-modal-with-generated-banner*
*Completed: 2026-04-14*
