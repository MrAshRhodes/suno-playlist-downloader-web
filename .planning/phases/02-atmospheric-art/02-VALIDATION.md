---
phase: 02
slug: atmospheric-art
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-13
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification + build check |
| **Config file** | client/vite.config.ts |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && grep -r "p5" client/src/` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && grep -r "p5" client/src/`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | ART-01 | — | N/A | build | `npm run build` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | ART-02 | — | N/A | grep | `grep "noiseSeed\|randomSeed" client/src/` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | ART-03 | — | N/A | visual | Manual check | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `p5` npm package installed
- [ ] `@types/p5` installed for TypeScript support

*Existing infrastructure covers build verification.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Canvas visible behind UI | ART-01 | Visual check needed | Open localhost:5173, verify waveform visible behind content |
| Seeded reproducibility | ART-02 | Requires page reload comparison | Reload page twice, compare visual output matches |
| Ambient non-distracting | ART-03 | Subjective visual assessment | Use download workflow, confirm waveform doesn't distract |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
