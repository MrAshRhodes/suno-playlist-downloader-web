---
phase: 11
plan: 03
subsystem: web-version/dependencies
tags: [security, npm-overrides, transitive-deps, qs, on-headers]
dependency_graph:
  requires: [11-02]
  provides: [patched-qs, patched-on-headers]
  affects: [web-version/package.json, web-version/package-lock.json]
tech_stack:
  added: []
  patterns: [npm-overrides-for-transitive-patch]
key_files:
  created: []
  modified:
    - web-version/package.json
    - web-version/package-lock.json
decisions:
  - Used npm overrides (not parent version bumps) to patch qs and on-headers per D-01
  - qs resolved to 6.15.1 (satisfies >=6.14.1), on-headers resolved to 1.1.0 (satisfies >=1.1.0)
  - Smoke tested on port 3001 (port 3000 occupied by weather-app dev server)
metrics:
  duration: 5min
  completed: "2026-05-02"
  tasks: 3
  files: 2
---

# Phase 11 Plan 03: web-version qs + on-headers Transitive Patch Summary

**One-liner:** npm overrides patching qs to 6.15.1 and on-headers to 1.1.0 in web-version, verified via audit and smoke test.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Confirm dep trees for qs and on-headers | - | (read-only) |
| 2 | Add overrides and regenerate lockfile | 82176c5 | web-version/package.json, web-version/package-lock.json |
| 3 | Smoke test Express middleware behavior | 82176c5 | (read-only) |

## Findings from Task 1

- `qs@6.13.0` — transitive via `express@4.21.2 → qs` and `express → body-parser → qs`; NOT a direct dep
- `on-headers@1.0.2` — transitive via `express-session@1.18.1 → on-headers` and `morgan@1.10.0 → on-headers`; NOT a direct dep
- Both confirmed as transitive; overrides approach is correct

## Changes Made

**web-version/package.json** — added `overrides` field:
```json
"overrides": {
  "qs": ">=6.14.1",
  "on-headers": ">=1.1.0"
}
```

**web-version/package-lock.json** — regenerated; both packages now show `overridden` marker.

## Verification Results

- `npm ls qs` → `qs@6.15.1 overridden` (satisfies >=6.14.1) ✓
- `npm ls on-headers` → `on-headers@1.1.0 overridden` (satisfies >=1.1.0) ✓
- `npm audit` → zero findings for qs, zero findings for on-headers ✓
- Express server on port 3001: `GET /api/settings` returned HTTP 200 ✓
- No parent packages (express / express-session) bumped ✓

## Remaining Audit Findings (out of scope)

The following were present before this plan and are NOT in scope for 11-03:
- `path-to-regexp` / `express` (high) — plan 11-04
- `brace-expansion`, `lodash`, `minimatch`, `picomatch` (various) — plan 11-05

## Deviations from Plan

**1. [Rule 3 - Blocking] Port 3000 occupied by weather-app dev server**
- Found during: Task 3
- Issue: `node server.js` on default port 3000 failed with EADDRINUSE
- Fix: Used `PORT=3001 node server.js` for smoke test; identical behavior
- Files modified: none (runtime override only)
- Impact: None — server behavior identical on any port

## Self-Check

- [x] `web-version/package.json` contains `overrides.qs` and `overrides.on-headers`
- [x] Commit 82176c5 exists in git log
- [x] `qs` resolves to >=6.14.1 (6.15.1 confirmed)
- [x] `on-headers` resolves to >=1.1.0 (1.1.0 confirmed)
- [x] Server smoke test passed (HTTP 200)
- [x] No parent bumps (express still 4.21.2, express-session still 1.18.1)
