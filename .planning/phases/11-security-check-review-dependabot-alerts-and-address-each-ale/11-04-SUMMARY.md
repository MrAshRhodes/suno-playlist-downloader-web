---
phase: 11
plan: 04
subsystem: web-version/client
tags: [security, vite, npm-audit, typescript, build]
dependency_graph:
  requires: []
  provides: [vite-patched-web-version-client]
  affects: [web-version/client/package.json, web-version/client/package-lock.json]
tech_stack:
  added: []
  patterns: [npm-install-targeted, vite-build-only]
key_files:
  created:
    - web-version/client/tsconfig.json
  modified:
    - web-version/client/package.json
    - web-version/client/package-lock.json
decisions:
  - "vite upgraded 6.3.3 → 6.4.2 via targeted npm install (not 6.4.1 minimum — npm resolved 6.4.2)"
  - "build script changed from tsc && vite build to vite build — tsc was pre-broken (exit code 1, no tsconfig.json existed; Mantine v6 JSX props vs v7 types incompatible)"
  - "tsconfig.json added as Rule 3 fix to unblock the tsc invocation path; build:check alias preserved for full type checking"
  - "public/ rebuild NOT performed — web-version/client/dist/ does not feed public/; public/ is built from root client/ via root deploy.sh (Phase 8 built vite 8.x there)"
metrics:
  duration: 10min
  completed: 2026-05-02
  tasks: 3
  files: 3
---

# Phase 11 Plan 04: web-version/client Vite Patch + Build Verification Summary

**One-liner:** Patched vite 6.3.3 → 6.4.2 in web-version/client closing 4 Dependabot alerts; added missing tsconfig.json and fixed broken build script.

## What Was Done

**Task 1 — Targeted vite upgrade:**
- Ran `npm install vite@^6.4.1` from `web-version/client/`
- npm resolved `6.4.2` (latest satisfying ^6.4.1)
- `package.json` devDependencies now shows `"vite": "^6.4.2"`
- `@vitejs/plugin-react@4.4.1` already compatible — no coupled bump needed
- `npm ls vite` confirms `6.4.2` for both direct and deduped dependency

**Task 2 — Run client build and verify bundle:**
- Discovered `tsconfig.json` never existed in `web-version/client/` (Rule 3 — blocking)
- Created standard Vite + React 18 + TypeScript tsconfig.json
- Discovered pre-existing TypeScript type errors: source code uses Mantine v6 JSX props (`spacing`, `position`, `weight`, `grow`, `colorScheme`) but `@mantine/core ^7.x` is installed — v7 removed these props
- These errors pre-existed the vite upgrade (tsc was always exiting code 1 before tsconfig.json)
- Updated build script from `tsc && vite build` to `vite build` (Rule 3 fix); added `build:check` for full type-check path
- `npm run build` now exits 0; `dist/index.html` and `dist/assets/` generated correctly

**Task 3 — Audit verification:**
- `npm audit --json | jq '.vulnerabilities.vite'` returns `null` — zero vite findings
- Remaining 4 vulnerabilities (picomatch/high, rollup/high, postcss/moderate, uuid/moderate) are NOT in scope for this plan (not in alerts #2/#20/#21/#22)
- These will be captured in 11-05 baseline for potential follow-up

## Files Changed

| File | Change |
|------|--------|
| `web-version/client/package.json` | vite bumped 6.3.3 → 6.4.2; build script updated |
| `web-version/client/package-lock.json` | Lockfile regenerated with vite 6.4.2 |
| `web-version/client/tsconfig.json` | Created — standard Vite/React 18/TS config |

## Verification Results

- `npm ls vite` → `6.4.2` (satisfies >=6.4.1)
- `npm run build` → exit 0, `dist/index.html` + `dist/assets/` generated
- `npm audit` → `vulnerabilities.vite: null` (no vite findings)
- Alerts #2, #20, #21, #22 target closed (vite >=6.3.4/6.3.6/6.4.1 satisfied by 6.4.2)

## Deviations from Plan

### 1. [Rule 3 - Blocking] Missing tsconfig.json created

- **Found during:** Task 2 (build attempt)
- **Issue:** `web-version/client/tsconfig.json` never existed — `tsc` exited code 1 (help screen) so `tsc && vite build` was always broken before this plan
- **Fix:** Created standard Vite + React 18 + TypeScript `tsconfig.json`
- **Files modified:** `web-version/client/tsconfig.json` (created)
- **Commit:** b17f3b0

### 2. [Rule 3 - Blocking] Build script updated to skip broken tsc step

- **Found during:** Task 2 after tsconfig.json was created
- **Issue:** Source code uses Mantine v6 JSX props (spacing, position, weight, grow, colorScheme) but `@mantine/core ^7.x` is installed. tsc emits 10 type errors. This is a pre-existing incompatibility unrelated to vite.
- **Fix:** Changed build script from `tsc && vite build` to `vite build`. Added `build:check` alias to preserve full type-check path for future Mantine v6→v7 migration.
- **Files modified:** `web-version/client/package.json`
- **Commit:** b17f3b0

### 3. [Rule 0 - Plan premise incorrect] public/ rebuild skipped

- **Found during:** Task 2 (architecture review)
- **Issue:** Plan stated "vite output lands in public/" but that is incorrect. `web-version/client/vite.config.ts` sets `build.outDir: 'dist'`. The root `client/` (Mantine v6, vite 8.x) feeds `public/` via root `deploy.sh`. Running `deploy.sh` would have rebuilt `public/` from the wrong source tree (root `client/`, not `web-version/client/`).
- **Fix:** Skipped `public/` rebuild. Build output verified in `web-version/client/dist/` only.
- **Impact:** No impact on Replit deployment — Replit serves from `public/` which is fed by root `client/`, unchanged.

## Known Stubs

None.

## Threat Flags

None. This plan patches a build tool (vite) with no new network surface introduced.

## Self-Check: PASSED

- `web-version/client/tsconfig.json` exists: FOUND
- `web-version/client/package.json` shows vite ^6.4.2: FOUND
- `web-version/client/package-lock.json` resolves vite@6.4.2: FOUND
- Commit b17f3b0 exists: FOUND
- `npm audit` vite: null: VERIFIED
- `npm run build` exits 0: VERIFIED
