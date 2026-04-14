---
phase: 1
slug: core-monolith
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-12
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None detected — no test files, no test config |
| **Config file** | None |
| **Quick run command** | `yarn build` |
| **Full suite command** | `yarn build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn build`
- **After every plan wave:** Run `yarn build` + visual browser QA
- **Before `/gsd-verify-work`:** All 5 ROADMAP.md success criteria visually confirmed
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | THME-01 | — | N/A | manual-only | Visual inspection in browser | N/A | ⬜ pending |
| 01-01-02 | 01 | 1 | THME-02 | — | N/A | manual-only | Visual inspection in browser | N/A | ⬜ pending |
| 01-01-03 | 01 | 1 | THME-03 | — | N/A | manual-only | Toggle in browser, check for flash | N/A | ⬜ pending |
| 01-01-04 | 01 | 1 | CARD-01 | — | N/A | manual-only | Visual inspection in browser | N/A | ⬜ pending |
| 01-01-05 | 01 | 1 | CARD-02 | — | N/A | manual-only | Visual inspection in browser | N/A | ⬜ pending |
| 01-01-06 | 01 | 1 | TYPO-01 | — | N/A | manual-only | Browser + DevTools font inspection | N/A | ⬜ pending |
| 01-01-07 | 01 | 1 | TYPO-02 | — | N/A | manual-only | Visual inspection in browser | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework needed — this is a CSS-only visual phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark mode Monolith palette | THME-01 | CSS visual output | Open app in dark mode, verify #0A0A0A bg, #1A1A1A cards, #3B4A6B accent |
| Light mode Monolith palette | THME-02 | CSS visual output | Open app in light mode, verify #F2EFE9 bg, #E8E4DB cards, #3B4A6B accent |
| Smooth theme toggle | THME-03 | Animation quality | Toggle theme, verify cross-fade with no flash or unstyled frames |
| 24px radius cards with depth | CARD-01 | Visual rendering | Inspect cards — 24px radius, inner glow (dark) or drop shadow (light) |
| Cards lift from background | CARD-02 | Visual rendering | Cards should appear elevated from page background in both modes |
| Inter font + hierarchy | TYPO-01 | Font rendering | DevTools: verify Inter loaded, headers 18-24pt semi-bold, body 14pt |
| Hero title bold | TYPO-02 | Visual rendering | App title should be 24pt Extra Bold, visually dominant |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
