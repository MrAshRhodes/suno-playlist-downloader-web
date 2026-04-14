---
phase: 6
slug: premium-title-banner-and-modern-step-cards
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-14
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual visual verification (no automated test framework) |
| **Config file** | none |
| **Quick run command** | `cd client && npm run build` |
| **Full suite command** | `cd client && npm run build && npm run dev` |
| **Estimated runtime** | ~15 seconds (build) |

---

## Sampling Rate

- **After every task commit:** Run `cd client && npm run build`
- **After every plan wave:** Full visual review in browser (dark + light mode)
- **Before `/gsd-verify-work`:** All 6 decisions visually verified
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 0 | D-01 | — | N/A | asset | `test -f client/src/assets/hero-banner.png` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | D-01, D-02 | — | N/A | visual+build | `cd client && npm run build` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | D-03, D-04 | — | N/A | visual+build | `cd client && npm run build` | ❌ W0 | ⬜ pending |
| 06-01-04 | 01 | 1 | D-05, D-06 | — | N/A | visual | browser theme toggle | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `client/src/assets/hero-banner.png` — generated via nanobanana MCP at orchestrator level

*Existing infrastructure covers all other phase requirements — no test framework needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hero banner image renders correctly | D-01 | Visual quality assessment | Open app in browser, verify banner displays behind title text |
| Banner height 200-250px | D-02 | CSS computed value | DevTools → computed styles → verify height in range |
| Step cards wrap all 3 sections | D-03 | Visual layout | Verify each step section has card border, shadow, radius |
| Step numbers are solid, no gradient | D-04 | Visual inspection | DevTools → inspect step number → no linear-gradient |
| Support banner unchanged | D-05 | Visual comparison | Compare support banner before/after |
| Theme toggle works for banner + cards | D-06 | Visual toggle | Switch dark↔light, verify banner overlay and card variables |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
