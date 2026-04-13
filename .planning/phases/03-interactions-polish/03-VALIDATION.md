---
phase: 3
slug: interactions-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-13
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (CSS-only phase, no unit test framework installed) |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + visual browser review (both modes)
- **Before `/gsd-verify-work`:** Full build green + all 5 success criteria visually confirmed
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | INTR-01 | — | N/A | manual-visual | `npm run build` | N/A | ⬜ pending |
| 03-01-02 | 01 | 1 | INTR-02 | — | N/A | manual-visual | `npm run build` | N/A | ⬜ pending |
| 03-01-03 | 01 | 1 | INTR-03 | — | N/A | manual-visual | `npm run build` | N/A | ⬜ pending |
| 03-01-04 | 01 | 1 | INTR-04 | — | N/A | manual-visual | `npm run build` | N/A | ⬜ pending |
| 03-02-01 | 02 | 1 | PLSH-01 | — | N/A | manual-visual | `npm run build` | N/A | ⬜ pending |
| 03-02-02 | 02 | 1 | PLSH-02 | — | N/A | manual-devtools | `npm run build` | N/A | ⬜ pending |
| 03-02-03 | 02 | 1 | PLSH-03 | — | N/A | manual-visual | `npm run build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework installation needed — this is a CSS-only phase. Build compilation (`npm run build`) confirms no TypeScript errors from any TSX edits.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Button glow on hover, dim on active | INTR-01 | Visual CSS effect | Hover `.btn-accent` in browser, verify glow. Click and hold, verify dimmed glow. Both modes. |
| Progress bar glow + height + smooth transition | INTR-02 | Visual CSS animation | Start a download, observe progress bar at 6px height with accent glow. Verify smooth width transition. |
| Table row hover background shift | INTR-03 | Visual CSS effect | Hover over song table rows, verify subtle background change with `var(--bg-card-hover)`. No glow. |
| State cross-fade, pulse refinement | INTR-04 | Visual animation timing | Trigger state changes (loading → downloading → complete). Verify opacity cross-fade (0.3s). Check `.downloading` pulse at 1.5s / opacity 0.7. |
| Support banner styling | PLSH-01 | Visual CSS styling | Verify support banner renders correctly in both dark and light modes with orange accent tones. |
| WCAG AA contrast | PLSH-02 | DevTools contrast checker | Open Chrome DevTools, inspect muted text, secondary text, banner text. All must show ≥4.5:1 ratio. |
| Scrollbar matches theme | PLSH-03 | Visual CSS effect | Scroll content area in both modes. Verify scrollbar thumb/track matches active theme colors. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
