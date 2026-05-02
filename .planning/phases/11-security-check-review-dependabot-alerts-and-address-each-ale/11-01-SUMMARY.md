---
phase: 11
plan: 01
subsystem: security
tags: [security, npm, dependabot, basic-ftp]
dependency_graph:
  requires: []
  provides: [basic-ftp-patched, alert-baseline]
  affects: [package-lock.json]
tech_stack:
  added: []
  patterns: [npm-overrides-not-needed, npm-audit-fix]
key_files:
  created:
    - .planning/phases/11-security-check-review-dependabot-alerts-and-address-each-ale/11-01-baseline.json
  modified:
    - package-lock.json
decisions:
  - "npm audit fix resolved basic-ftp without overrides — lockfile-only change, no package.json modification required"
  - "Baseline captured 12 alerts (not 11 as expected) — one new alert added since planning"
metrics:
  duration: 5min
  completed: 2026-05-02
  tasks: 3
  files: 2
---

# Phase 11 Plan 01: Baseline + Root basic-ftp Patch Summary

**One-liner:** Patched root basic-ftp 5.2.2 -> 5.3.1 via npm audit fix (lockfile-only) and captured 12-alert Dependabot baseline.

## What Was Done

**Task 1 — Capture Dependabot alert baseline:**
- Called `gh api repos/MrAshRhodes/suno-playlist-downloader-web/dependabot/alerts?state=open --paginate`
- Required clearing `GITHUB_TOKEN` env var (invalid token was overriding keyring auth)
- Saved 12 open alerts to `11-01-baseline.json`
- Confirmed alert #75 (basic-ftp) present in snapshot

**Task 2 — Confirm basic-ftp dep tree:**
- `npm ls basic-ftp` confirmed version `5.2.2` via chain: `puppeteer → @puppeteer/browsers → proxy-agent → pac-proxy-agent → get-uri → basic-ftp`
- Matches pre-research dep chain exactly

**Task 3 — Patch basic-ftp:**
- `npm audit fix` upgraded basic-ftp from `5.2.2` to `5.3.1` in `package-lock.json`
- No `overrides` field needed in `package.json` — audit fix handled it directly
- Post-patch `npm audit` reports `0 vulnerabilities`
- `npm ls basic-ftp` confirms `5.3.1`

## Files Changed

| File | Change |
|------|--------|
| `package-lock.json` | basic-ftp bumped 5.2.2 → 5.3.1 |
| `11-01-baseline.json` | Created — 12 Dependabot alert snapshot |

## Verification Results

- `npm ls basic-ftp` → `5.3.1` (>=5.3.0 satisfied)
- `npm audit` → `found 0 vulnerabilities`
- `jq 'length' 11-01-baseline.json` → `12`
- `jq '.[] | select(.number==75) | .security_vulnerability.package.name'` → `"basic-ftp"`

## Deviations from Plan

**1. [Rule 0 - Expected path] npm audit fix resolved without overrides**
- Plan said to try audit fix first, then add overrides if needed
- `npm audit fix` succeeded — `package.json` left unchanged (no overrides field added)
- This satisfies acceptance criteria: the plan allowed this outcome

**2. [Observation] 12 alerts instead of 11**
- Baseline snapshot contains 12 open alerts vs. 11 expected from planning docs
- One new alert (uuid, alert #76) was opened between planning and execution
- No action needed — baseline accurately captures current state

## Auth Gates

- `gh api` required `GITHUB_TOKEN=""` prefix to bypass an invalid `GITHUB_TOKEN` env var that was overriding the valid keyring token for `MrAshRhodes` account
- Resolved automatically — no user action required

## Self-Check: PASSED

- `11-01-baseline.json` exists: FOUND
- `package-lock.json` shows basic-ftp 5.3.1: FOUND
- Commit d81d401 exists: FOUND
- `npm audit` 0 vulnerabilities: VERIFIED
