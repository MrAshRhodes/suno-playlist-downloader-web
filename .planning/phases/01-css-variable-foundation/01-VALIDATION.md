---
phase: 1
slug: css-variable-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-11
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — grep assertions + manual browser verification |
| **Config file** | none |
| **Quick run command** | `grep -c "theme === 'dark'" client/src/App.tsx` (expect 0) |
| **Full suite command** | `yarn dev` + manual browser check both themes |
| **Estimated runtime** | ~5 seconds (grep), ~30 seconds (manual) |

---

## Sampling Rate

- **After every task commit:** Run grep assertions (THME-01, THME-05, body.style)
- **After every plan wave:** Run `yarn build` to confirm no TS errors + manual browser check
- **Before `/gsd-verify-work`:** Full suite must be green — all grep checks pass, both themes render correctly
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | THME-01 | — | N/A | grep | `grep -c "theme === 'dark'" client/src/App.tsx` (expect 0) | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | THME-05 | — | N/A | grep | `grep -c "documentElement.className =" client/src/App.tsx` (expect 0) | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | THME-01 | — | N/A | grep | `grep -c "document.body.style" client/src/App.tsx` (expect 0) | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | THME-01 | — | N/A | build | `yarn build` (expect exit 0) | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements — verification is grep-based and manual browser testing only. No test framework installation needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual parity — both themes render correctly after refactor | THME-01 | Visual appearance cannot be grep-checked | 1. Run `yarn dev` 2. Open browser 3. Toggle dark/light 4. Verify all colors match pre-refactor appearance |
| Theme toggle produces correct class on `<html>` | THME-05 | Runtime DOM behavior | 1. Open DevTools Elements panel 2. Toggle theme 3. Verify `<html>` has `dark-mode` or `light-mode` class and no other classes are removed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
