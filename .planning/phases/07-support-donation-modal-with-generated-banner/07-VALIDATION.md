---
phase: 7
slug: support-donation-modal-with-generated-banner
status: draft
nyquist_compliant: true
nyquist_waiver: no_test_framework
wave_0_complete: false
created: 2026-04-14
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — manual browser testing |
| **Config file** | none |
| **Quick run command** | `npm run build` (TypeScript + Vite type-check) |
| **Full suite command** | `npm run build && npm run preview` |
| **Estimated runtime** | ~15 seconds |

---

## Nyquist Waiver

This project has no test framework installed (no Jest, Vitest, Playwright, etc.). All validation is build-based (`npm run build` / `npx tsc --noEmit`) plus manual browser testing. The automated `<verify>` commands in each plan task use build success and grep-based file content checks as the automated gate. This satisfies the Nyquist sampling requirement through build-time validation rather than unit/integration tests.

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run preview`
- **Before `/gsd-verify-work`:** Full build must succeed + manual browser check
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | D-03 | T-07-02 | N/A | manual | nanobanana generate + `ls -la` + `file` verify | N/A | ⬜ pending |
| 07-01-02 | 01 | 1 | D-02, D-04 | T-07-01 | rel=noopener noreferrer on external link | build | `npx tsc --noEmit` + grep content checks | ✅ | ⬜ pending |
| 07-02-01 | 02 | 2 | D-01, D-05, D-06 | T-07-03, T-07-04 | N/A | build+manual | `npx tsc --noEmit` + `npm run build` + grep checks | ✅ | ⬜ pending |
| 07-02-02 | 02 | 2 | D-01, D-04, D-05 | — | N/A | manual | Browser: verify modal trigger, dismiss, banner intact | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Task ID mapping to plan tasks:**
- 07-01-01 = Plan 01, Task 1 (Generate donation banner image)
- 07-01-02 = Plan 01, Task 2 (Build DonationModal component)
- 07-02-01 = Plan 02, Task 1 (Wire download counter and DonationModal into App.tsx)
- 07-02-02 = Plan 02, Task 2 (Human verify donation modal end-to-end)

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.
- No test framework install needed — validation is build success + manual browser testing.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Modal appears on 1st download | D-01 | UI interaction + localStorage state | Open app, click Download ZIP, verify modal appears |
| Modal appears on every 5th download | D-06 | Counter state across interactions | Download 5 times, verify modal on count 5 |
| Modal dismisses via X | D-04 | UI interaction | Click X button, verify modal closes |
| Modal dismisses via click-outside | D-04 | UI interaction | Click backdrop, verify modal closes |
| Top banner still visible | D-05 | Visual check | Verify support banner in header area |
| Banner image renders in modal | D-03 | Visual quality check | Verify image loads, warm tones, not broken |
| BMC link opens correctly | Specifics | External navigation | Click button, verify buymeacoffee.com/focused opens |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter (waiver: no_test_framework — build-based checks satisfy)

**Approval:** pending
