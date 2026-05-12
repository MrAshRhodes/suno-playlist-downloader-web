# Project Retrospective

## Milestone: v2.1 — UX & Discovery

**Shipped:** 2026-05-12
**Phases:** 3 | **Plans:** 3

### What Was Built

- Per-song checkbox selection — opt-out model, Set<string> state, header tri-state, download filter
- @username input UX — placeholder, helper text, full URL routing via usernameUrlMatch
- @username backend investigation — Puppeteer abandoned for POST /api/unified/feed (no auth, 156 songs)
- Security patch — ip-address XSS (GHSA-v2v4-37r5-5v8g) via npm audit fix

### What Worked

- Code review + fixer agent pattern — reviewer found 6 real bugs, fixer committed each atomically, browser tests verified all. No new phase needed.
- Integration checker confirmed full E2E wiring in one pass — 0 broken flows
- Audit → debt-clear → complete loop kept the milestone clean before tagging
- Seeds planted (SEED-001/002/003) during close — right time to capture deferred ideas

### What Was Inefficient

- STATE.md was stale — phases 12 and 13 were actually shipped but state said "phase 13 not started". State file fell behind execution; required manual correction.
- Git index.lock collisions on every commit — something in the environment creates lock files. Added `sleep 3-5` workarounds everywhere; root cause undiagnosed.
- Replit deploy divergent branch — remote tracking was stale, needed `git fetch` before push; then Replit needed manual reconciliation. Tracked as SEED-001.

### Patterns Established

- Code review inline (reviewer + fixer agents) without a dedicated phase — effective for <10 findings
- `trim()` at service boundary (not call site) — canonical input sanitization point
- `usernameUrlMatch[1]` for URL extraction — pass bare value, never raw URL, to service methods
- `selectedIds as Set<string>` — O(1) lookup; seed on load, reset on new fetch

### Key Lessons

- Always verify STATE.md matches git log after executing a phase — execution commits are truth, state file is a cache
- `git fetch` before `git push` when remote tracking is stale — prevents hook false-negatives
- Milestone audit before close is worth it — caught USR-01/02/03 documentation gap that would have been a surprise at v2.2 planning

### Cost Observations

- Sessions: ~1 long session (2026-05-12)
- Phase 12 and 13 were executed in a prior session (state was already stale when this session started)
- Code review + 6 fixes: efficient — reviewer, fixer, and browser test agents ran sequentially without much orchestrator overhead
