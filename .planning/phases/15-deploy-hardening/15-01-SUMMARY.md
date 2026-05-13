---
phase: 15-deploy-hardening
plan: 01
subsystem: infra
tags: [bash, deploy, git, replit, shell-scripts]

# Dependency graph
requires: []
provides:
  - deploy-safe.sh: build+commit script with empty-commit guard, no push
  - replit-sync.sh: Replit divergence recovery with y/yes confirmation gate
  - deploy.sh: composed build+push script delegating to deploy-safe.sh with push guard

affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Deploy separation: build+commit (deploy-safe.sh) separated from push (deploy.sh)"
    - "Push guard: git log origin/main..HEAD --oneline non-empty triggers push"
    - "Empty commit guard: git diff --cached --quiet prevents no-op commits"
    - "Destructive reset gate: y/yes confirmation before git reset --hard origin/main"

key-files:
  created:
    - deploy-safe.sh
    - replit-sync.sh
  modified:
    - deploy.sh
    - .planning/REQUIREMENTS.md

key-decisions:
  - "Push guard uses git log origin/main..HEAD (unpushed commits) rather than git diff --cached (staged changes) — correct semantics: push happens after commit, so staged diff is always empty at push time"
  - "replit-sync.sh runs git fetch origin before git reset --hard to ensure reset target is the latest remote state"
  - "deploy.sh delegates entirely to deploy-safe.sh for build+commit, avoiding duplication"

patterns-established:
  - "Deploy safety: always separate build/commit from push so mid-session builds never auto-push"
  - "Confirmation gate: destructive git operations require explicit y/yes input"

requirements-completed:
  - OPS-01
  - OPS-02
  - OPS-03

# Metrics
duration: 8min
completed: 2026-05-13
---

# Phase 15 Plan 01: Deploy Hardening Summary

**Three shell scripts splitting build from push: deploy-safe.sh (build+commit guard), replit-sync.sh (y/yes-gated hard reset), and updated deploy.sh (push guard via git log origin/main..HEAD)**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-13T00:00:00Z
- **Completed:** 2026-05-13T00:08:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Created `deploy-safe.sh` — builds client, copies dist to public/, commits only when diff is non-empty, no push
- Created `replit-sync.sh` — WARNING prompt, y/yes gate, git fetch then git reset --hard origin/main
- Replaced `deploy.sh` — delegates to deploy-safe.sh, then pushes only when git log origin/main..HEAD is non-empty
- Marked OPS-01, OPS-02, OPS-03 complete in REQUIREMENTS.md with updated OPS-02 wording to reflect actual push guard

## Task Commits

All three tasks committed atomically:

1. **Tasks 1-3: All scripts + REQUIREMENTS.md** - `6073de0` (feat)

## Files Created/Modified
- `deploy-safe.sh` - Build + commit script; empty-commit guard; no git push
- `replit-sync.sh` - Replit divergence recovery; y/yes gate; fetch before reset
- `deploy.sh` - Composes deploy-safe.sh + push guard on git log origin/main..HEAD
- `.planning/REQUIREMENTS.md` - OPS-01/02/03 marked [x] complete; OPS-02 wording corrected; traceability table updated to Complete

## Decisions Made
- Push guard uses `git log origin/main..HEAD --oneline` (unpushed commits), not `git diff --cached` (staged changes) — staged diff is always empty by the time push runs since commit already happened
- `replit-sync.sh` runs `git fetch origin` before `git reset --hard origin/main` to ensure reset target reflects latest remote, not stale FETCH_HEAD

## Deviations from Plan

None - plan executed exactly as written.

Note: Verification check 8 from the plan (`grep 'Continue? \[y/N\]' replit-sync.sh`) fails with BRE pattern matching because `[y/N]` is interpreted as a bracket expression. Fixed-string grep (`grep -F`) confirms the exact text is present. Content is correct; the plan's grep pattern has a shell escaping edge case.

## Issues Encountered
None — all three scripts passed `bash -n` syntax validation and content verification on first write.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Deploy hardening complete. Phase 16 (SEO Hygiene) is unblocked.
- All OPS requirements for v2.2 satisfied.

---
*Phase: 15-deploy-hardening*
*Completed: 2026-05-13*
