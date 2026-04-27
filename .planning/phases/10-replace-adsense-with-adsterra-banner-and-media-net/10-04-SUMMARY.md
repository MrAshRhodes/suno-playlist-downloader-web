---
phase: 10-replace-adsense-with-adsterra-banner-and-media-net
plan: 04
subsystem: ads
tags: [head-script, sovrn, dual-file-sync, deferred, wave-0-blocked]
status: deferred

requires:
  - phase: 10-replace-adsense-with-adsterra-banner-and-media-net
    provides: Wave 0 (10-01) credentials — Adsterra/Sovrn account registration. Plan 10-01 has NOT been run; client/.env does not exist; VITE_SOVRN_SITE_ID is unset.
provides:
  - "Decision record: head injection deferred until plan 10-01 substitutes real Sovrn Site ID"
  - "Confirmation: AdSense script preserved verbatim (no accidental edits)"
  - "Audit pass: server.js has zero Helmet/CSP middleware — no CSP regression risk"
affects: [10-06-deploy-and-uat]

tech-stack:
  added: []
  patterns:
    - "Wave 0 deferral pattern (matches 10-02-SUMMARY): plan executes its DEFERRED branch when env file missing, files left untouched, ADM ticket stays unchecked"

key-files:
  created:
    - ".planning/phases/10-replace-adsense-with-adsterra-banner-and-media-net/10-04-SUMMARY.md (this file — deferral record)"
  modified: []

decisions:
  - "Executed plan 10-04 DEFERRED branch (Task 1 Step 1): client/.env absent → SKIP head injection in both index.html files"
  - "ADM-08 status remains unchecked in REQUIREMENTS.md — confirmed pending until Wave 0 unblocks"
  - "AdSense script tag (kept inert) verified preserved in both client/index.html and public/index.html (no accidental edits)"
  - "server.js audited for Helmet/CSP middleware — zero matches (no CSP regression risk for Wave 1+ when re-run)"

metrics:
  duration: "1min"
  completed: "2026-04-27T18:05:00Z"
  task_count: 1
  file_count: 1
---

# Phase 10 Plan 04: Sovrn Signal Head-Script Dual-File Sync Summary

**One-liner:** Plan executed the deferred branch — Sovrn signal head injection skipped because plan 10-01 (Wave 0 account registration) has not run; client/.env does not exist, so VITE_SOVRN_SITE_ID is unavailable. AdSense script verified preserved; server.js Helmet audit passes.

## Status: DEFERRED

This plan ran its built-in DEFERRED branch (defined in 10-04-PLAN.md Task 1 Step 1) because the Wave 0 prerequisite (plan 10-01) is intentionally postponed pending user account registration with Adsterra, Sovrn Commerce, Iubenda, and Media.net.

**Resolution path:** Re-run this plan (10-04) AFTER plan 10-01 has been executed and `client/.env` contains a valid `VITE_SOVRN_SITE_ID=...` line. At that point the executor will fall through to Steps 2-5 (head-script injection in both index.html files, plus the Helmet audit and Vite build verification).

## What Was Done

### Deferral check (Step 1 of plan 10-04 Task 1)

| Check | Expected for skip | Actual | Skip triggered? |
|-------|-------------------|--------|-----------------|
| `ls client/.env` | NOT_FOUND | NOT_FOUND | yes |
| `grep -E "^VITE_SOVRN_SITE_ID=.+" client/.env` | no match | no match (file absent) | yes |

Both conditions trigger the deferred branch — head injection skipped per plan instructions.

### Audit-only verifications (still executed during deferred branch)

| Audit | Expected | Actual | Pass |
|-------|----------|--------|------|
| `grep -c "adsbygoogle.js?client=ca-pub-2601322490070593" client/index.html` | 1 | 1 | yes |
| `grep -c "adsbygoogle.js?client=ca-pub-2601322490070593" public/index.html` | 1 | 1 | yes |
| `grep -c "sovrn_signal.js" client/index.html` | 0 (deferred) | 0 | yes |
| `grep -c "sovrn_signal.js" public/index.html` | 0 (deferred) | 0 | yes |
| `grep -E "highperformanceformat" client/index.html public/index.html` | empty | empty | yes |
| `grep -cE "helmet\|Content-Security-Policy" server.js` | 0 | 0 | yes |

The AdSense script (kept inert per CONTEXT.md decision) is verified preserved verbatim. Adsterra invoke.js correctly absent from `<head>` — it lives only in AdSlot.tsx's useEffect (set up by plan 10-03). No Helmet or CSP middleware in server.js, so when Sovrn is re-run it will not be blocked.

### Files NOT modified (per deferred branch)

- `client/index.html` — untouched (53 lines, unchanged)
- `public/index.html` — untouched (54 lines, unchanged)

### Files created

- `.planning/phases/10-replace-adsense-with-adsterra-banner-and-media-net/10-04-SUMMARY.md` (this file)

## ADM Closure Status

| Requirement | Status | Note |
|-------------|--------|------|
| ADM-04 (Adsterra script + no CSP regression) | partial | server.js Helmet audit passes (no CSP) — script wiring proper still happens via AdSlot.tsx (plan 10-03, already done). No regression introduced. |
| ADM-08 (Sovrn outbound-link rewriter) | deferred | Head script omitted; ads.txt lines also placeholder per 10-02 deferral. Resolves when plan 10-01 + plan 10-04 re-run sequentially. |

ADM-08 stays `- [ ] **ADM-08**` in `.planning/REQUIREMENTS.md` (unchecked). The traceability table row for ADM-08 remains `Pending`.

## Deviations from Plan

### Deferred Branch (intentional — built into plan)

**1. [Rule 3 - Blocking → DEFERRED branch] client/.env missing → skip head injection**
- **Found during:** Task 1 Step 1
- **Issue:** Plan 10-04 Step 1 explicitly handles the case where Wave 0 (plan 10-01) has not yet substituted real credentials. `client/.env` does not exist; `VITE_SOVRN_SITE_ID` is unset.
- **Fix:** Executed the deferred branch as the plan instructs — do NOT inject the head script with a placeholder, because protocol-relative `<script src="//ad.lijit.com/.../sovrn_signal.js?iid={VITE_SOVRN_SITE_ID}">` would request a literal-`{...}` URL and fail at runtime. Document deferral here, leave ADM-08 unchecked, and let the user re-run after plan 10-01.
- **Why deferred over placeholder:** Unlike `public/ads.txt` (a static manifest where `YOUR_*` placeholder lines are inert until polled), an actual `<script src="...?iid={VITE_SOVRN_SITE_ID}">` would emit a network request to a malformed URL on every page load — visible 404 spam in DevTools and a false-positive Sovrn signal. Better to ship zero-script than broken-script.
- **Files modified:** none (intentional)
- **Commit:** see Final Commit below

## Authentication Gates

None during this plan. The implicit auth gate is the upstream plan 10-01, which the user has explicitly chosen to defer (ROADMAP.md still shows `- [ ] 10-01-PLAN.md`).

## Known Stubs

This plan ships zero stubs in code. The deferral itself is documented but not stubbed in any source file — `client/index.html` and `public/index.html` remain in their pre-plan-10-04 state with only the existing (inert) AdSense script.

The downstream stubs already documented elsewhere:

- `public/ads.txt` lines 6, 10, 11 — `YOUR_ADSTERRA_PUB_ID`, `YOUR_ADSTERRA_TAG_HASH`, `YOUR_SOVRN_PUB_ID` (×2). Documented in 10-02-SUMMARY. Same Wave 0 unblock resolves these.

These do NOT prevent ADM-04 partial closure, but they DO prevent ADM-08 closure — exactly as the plan anticipated.

## Threat Flags

None new. The plan's `<threat_model>` entry T-10-csp (Tampering / Denial — CSP regression) was audited:

```
grep -cE "helmet|Content-Security-Policy" server.js  →  0
```

server.js has no Helmet middleware. When plan 10-04 is re-run, the Sovrn script will load without CSP friction. If a future phase adds Helmet, it must whitelist `highperformanceformat.com`, `ad.lijit.com`, `cdn.iubenda.com`, and `pagead2.googlesyndication.com` in script-src — recorded here for the Phase 10 verifier.

## Output Confirmation

- Sovrn Site ID substituted: **deferred** (no real value available — Wave 0 not run)
- Files modified: **0** (deferred branch)
- AdSense script preserved: **yes** — verbatim, both files (verified by grep)
- Adsterra invoke.js head-tag absent: **confirmed** — neither file contains `highperformanceformat`
- Helmet/CSP audit (server.js): **zero matches** — no CSP middleware

## Phase 10 Re-run Checklist (when Wave 0 unblocks)

When the user is ready to register accounts and substitute real credentials:

1. Run plan 10-01 (Adsterra + Sovrn + Iubenda registration → populate `client/.env`).
2. Patch `public/ads.txt` to substitute `YOUR_*` placeholders with real publisher IDs (resolves 10-02 stubs).
3. Re-run plan 10-04 — this time `client/.env` exists and the executor falls through to Steps 2-5 (head-script injection + audit + Vite build).
4. Continue to plan 10-05 (App.tsx integration) and plan 10-06 (deploy + UAT).

## Self-Check: PASSED

**Files verified to exist:**
- FOUND: .planning/phases/10-replace-adsense-with-adsterra-banner-and-media-net/10-04-SUMMARY.md (this file)
- FOUND: client/index.html (unchanged)
- FOUND: public/index.html (unchanged)
- FOUND: server.js (unchanged)

**Files verified to NOT exist (deferred branch correctness):**
- ABSENT: client/.env (deferral trigger)

**Audit greps verified:**
- `grep -c "sovrn_signal.js" client/index.html` → 0 (correct for deferred)
- `grep -c "sovrn_signal.js" public/index.html` → 0 (correct for deferred)
- `grep -c "adsbygoogle.js?client=ca-pub-2601322490070593" client/index.html` → 1 (preserved)
- `grep -c "adsbygoogle.js?client=ca-pub-2601322490070593" public/index.html` → 1 (preserved)
- `grep -cE "helmet|Content-Security-Policy" server.js` → 0 (no CSP regression)
