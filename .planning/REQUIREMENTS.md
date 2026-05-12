# Requirements: v2.1 UX & Discovery

**Milestone:** v2.1 UX & Discovery
**Created:** 2026-05-12
**Status:** Active

## Milestone Requirements

### Song Selection

- [ ] **SEL-01**: User can select/deselect individual songs via checkbox before downloading
- [ ] **SEL-02**: User can select all or deselect all songs via header checkbox (with indeterminate state when partial)
- [ ] **SEL-03**: Download button shows count of selected songs ("Download 4 songs as ZIP") when a subset is selected
- [ ] **SEL-04**: Download button is disabled when zero songs are selected
- [ ] **SEL-05**: Selection defaults to all songs selected when playlist loads (opt-out model — existing behavior preserved if user doesn't interact)

### Input Discovery

- [ ] **INP-01**: Input placeholder shows @username format alongside playlist URL example
- [ ] **INP-02**: Helper text below input field describes accepted formats (playlist URL and @username)
- [ ] **INP-03**: Pasting a full `suno.com/@username` URL (e.g. `https://suno.com/@focusedbeats`) is accepted and routed correctly — adds regex branch to Suno.ts validation

### Housekeeping

- [ ] **SEC-01**: Dependabot PRs #2 and #3 confirmed closed via gh CLI (`gh pr view 2`, `gh pr view 3`)
- [ ] **SEC-02**: npm audit clean from root package tree

## Implementation Notes

- **Test profile for INP-03:** `https://suno.com/@focusedbeats` — use as UAT target to verify full URL acceptance
- **Backend frozen:** All changes confined to `client/src/` — zero Express route changes
- **No new dependencies:** `@mantine/core@6.0.13` `Checkbox` component already installed
- **Critical pitfall:** Three bulk-status maps in App.tsx (~lines 89, 116, 125) must add `selectedIds.has(clip.id)` guard or unselected songs will incorrectly receive status updates
- **Mantine v6 onChange:** `(e: ChangeEvent<HTMLInputElement>) => e.currentTarget.checked` — NOT the v7 `(checked) =>` pattern

## Future Requirements (Deferred)

- Shift-click range selection in song table (v2.2+)
- Tag/genre filter panel (v2.2+)
- Audio preview playback (Out of Scope — PROJECT.md)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend/API changes | Functionality frozen — client-side filter only |
| Mantine v7 upgrade | Breaking changes, risk to functionality |
| Audio preview | Explicitly excluded in PROJECT.md |
| Shift-click selection | Deferred pending user feedback |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEL-01 | — | Pending roadmap |
| SEL-02 | — | Pending roadmap |
| SEL-03 | — | Pending roadmap |
| SEL-04 | — | Pending roadmap |
| SEL-05 | — | Pending roadmap |
| INP-01 | — | Pending roadmap |
| INP-02 | — | Pending roadmap |
| INP-03 | — | Pending roadmap |
| SEC-01 | — | Pending roadmap |
| SEC-02 | — | Pending roadmap |
