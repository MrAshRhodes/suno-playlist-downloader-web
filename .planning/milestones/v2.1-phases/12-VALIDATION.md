---
phase: 12
slug: per-song-checkbox-selection
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-12
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test harness installed in web-version/client |
| **Config file** | none |
| **Quick run command** | `npm run build` (TypeScript compile) |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~10 seconds |

No vitest, jest, or test scripts exist in `web-version/client/`. Installing a test framework is out of scope for Phase 12. Manual verification via `checkpoint:human-verify` task replaces automated test coverage.

---

## Sampling Rate

- **After every task commit:** Run `npm run build` in `web-version/client/`
- **After every plan wave:** Run `npm run build` green + manual checklist at human-verify checkpoint
- **Before `/gsd-verify-work`:** Build must be green + all checklist items ticked

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 12-01-01 | 01 | 1 | SEL-01, SEL-03, SEL-04, SEL-05 | build | `npm run build` | ⬜ pending |
| 12-01-02 | 01 | 1 | SEL-01, SEL-02, SEL-03, SEL-04 | build | `npm run build` | ⬜ pending |
| 12-01-03 | 01 | 1 | SEL-01 – SEL-05 | manual | checklist at checkpoint | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No test harness to install — existing `npm run build` TypeScript compile gate covers all auto tasks. Manual verification covers the remainder.

*No Wave 0 setup required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Individual checkbox toggle | SEL-01 | No test harness | Uncheck one song → count decrements; recheck → count increments |
| Header tri-state cycle | SEL-02 | No test harness | Partial → indeterminate; click → all checked; click → all unchecked |
| Count label updates | SEL-03 | No test harness | 3/10 selected → button shows "Download 3 songs as ZIP" |
| Zero-selection disabled | SEL-04 | No test harness | Uncheck all → button disabled; recheck one → enabled |
| Opt-out default | SEL-05 | No test harness | Load playlist → all songs checked, count = total |
| Bulk-status guard | SEL-01 | No test harness | Download subset → only selected songs show status icons |
| Checkboxes disabled during download | UI-SPEC | No test harness | Start download → all checkboxes unclickable |
| Singular grammar | UI-SPEC | No test harness | 1 song selected → "Download 1 song as ZIP" / "Download 1 Song" |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify (`npm run build`) or human-verify checkpoint
- [x] Sampling continuity: build check after each auto task, checkpoint after last
- [x] Wave 0: no setup required — build tool already installed
- [x] No watch-mode flags
- [x] Feedback latency < 30s per task
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
