---
phase: 10-replace-adsense-with-adsterra-banner-and-media-net
plan: 03
subsystem: ads
tags: [ads, monetization, react-component, third-party-script, privacy-policy, adsterra, iubenda, sovrn, vite-env]

requires:
  - phase: 10-replace-adsense-with-adsterra-banner-and-media-net
    provides: Wave 0 (10-01) credentials are deferred — components ship with placeholders so wave 2 (10-05) can wire them
provides:
  - "AdSlot.tsx — single-instance Adsterra banner React component (CLS-safe, empty-key silent fallback)"
  - "Privacy.tsx — Iubenda standard-embedding privacy policy page mounted via useEffect"
  - "client/.env.example — committed onboarding template for all 5 VITE_* keys"
affects: [10-05-app-tsx-integration, 10-06-deploy-and-uat]

tech-stack:
  added: []
  patterns:
    - "Path-based React route via path-conditional render (App.tsx will read window.location.pathname in plan 10-05) — avoids react-router-dom dependency"
    - "Component-scoped third-party script injection: external runtime appended to component-owned ref/body inside useEffect, not <head>"
    - "Empty-env-key silent fallback: components no-op without console.warn when credentials absent (Phase 4 D-09 + research §7)"
    - "CLS-safe ad slot: inline minHeight reservation BEFORE iframe paint (the only mechanism keeping CLS < 0.1)"

key-files:
  created:
    - "client/src/components/AdSlot.tsx — Adsterra banner component (89 lines)"
    - "client/src/pages/Privacy.tsx — Iubenda privacy policy page (68 lines, new pages/ directory)"
    - "client/.env.example — env-var onboarding template (25 lines, all 5 VITE_* keys)"
  modified: []

key-decisions:
  - "Q4 RESOLVED — empty-key behavior: silent fallback (no console.warn). Overrides original RESEARCH §13 recommendation per Phase 4 D-09 graceful degradation."
  - "Privacy.tsx committed with literal {IUBENDA_POLICY_ID} placeholder per Wave 0 deferred directive — pre-deploy gate (plan 10-06) will block deploy until substituted"
  - "AdSlot wrapper is plain <div> (NOT Mantine <Card>) — Card's elevated background fights iframe transparency"
  - "Adsterra invoke.js injected into component-owned ref via useEffect (NOT into <head>) — atOptions is per-unit global"
  - "Iubenda script appended to document.body inside Privacy.tsx useEffect — keeps cookie/tracking off home + download flow"
  - "useEffect deps [adKey, height, width] verbatim — avoids ESLint react-hooks/exhaustive-deps + spurious re-injection"

patterns-established:
  - "Single-instance ad component pattern: window.atOptions global means only one AdSlot per page; future multi-slot needs <iframe srcDoc> isolation"
  - "Iubenda standard embedding: 4-class anchor (iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe) + cdn.iubenda.com/iubenda.js script transforms it server-side"
  - ".env.example committed alongside gitignored .env — fresh contributor onboarding via dashboard-source comments per VITE_* key"

requirements-completed: [ADM-02, ADM-06]

duration: 3min
completed: 2026-04-27
---

# Phase 10 Plan 03: AdSlot, Privacy, and .env.example Summary

**Three new files committed: AdSlot.tsx (Adsterra banner React component, CLS-safe), Privacy.tsx (Iubenda-embedded privacy page), and client/.env.example (5-key onboarding template) — zero edits to existing files; all production builds green.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-27T17:56:27Z
- **Completed:** 2026-04-27T17:59:03Z
- **Tasks:** 3 / 3
- **Files created:** 3
- **Files modified:** 0

## Accomplishments

- AdSlot.tsx ships the load-bearing CLS primitive: inline minHeight reservation, transparent background, var(--border-color) ring, 12px radius — verbatim per RESEARCH §6
- Privacy.tsx introduces the new client/src/pages/ directory and lazy-loads cdn.iubenda.com/iubenda.js only when /privacy mounts (cookie/tracking off main flow)
- client/.env.example documents all 5 VITE_* keys (3 Adsterra + 2 Sovrn) with dashboard-source comments — committable, gitignore confirmed bypass-safe
- Empty-key silent-fallback path verified: AdSlot's `if (!ref.current || !adKey) return` short-circuits with no console output, layout still reserved
- TypeScript compile + production build green (no errors, no new warnings)

## Task Commits

1. **Task 1: AdSlot.tsx** — `1dfbfc7` (feat)
2. **Task 2: Privacy.tsx (new pages/ directory)** — `4a17166` (feat)
3. **Task 3: .env.example** — `968b8b1` (chore)

**Plan metadata commit:** Pending (this SUMMARY + STATE/ROADMAP updates)

## Files Created/Modified

### Created

- `client/src/components/AdSlot.tsx` (89 lines) — Single-instance Adsterra banner with useEffect script injection. Inline style enforces CLS reservation. Empty-key path renders silent empty wrapper (no error, no console.warn) per Q4 resolved.
- `client/src/pages/Privacy.tsx` (68 lines) — New `pages/` directory + Iubenda standard-embedding component. Script appended to document.body inside useEffect (guarded against StrictMode double-invoke). Uses existing `.monolith-card` + `.section-heading` classes. Contains literal `{IUBENDA_POLICY_ID}` placeholder pending Wave 0 unblock.
- `client/.env.example` (25 lines) — All 5 VITE_* keys with `replace-with-*` placeholder values + dashboard-source comments. Confirmed NOT gitignored; `.env` IS gitignored.

### Modified

- None

## Decisions Made

- **Empty-key silent fallback (Q4 resolved):** AdSlot `if (!ref.current || !adKey) return` — no console.warn. This explicitly overrides the original RESEARCH §13 "console.warn once per mount" recommendation. Source: Phase 4 D-09 + research §7 graceful degradation; Wave 0 deferral directive in spawning prompt.
- **Privacy.tsx ships with `{IUBENDA_POLICY_ID}` placeholder:** Wave 0 (plan 10-01) defers credential provisioning; this plan commits with the literal placeholder + a TODO comment so wave 1 plans 03/04/05 can run in parallel without blocking on Iubenda registration. Plan 10-06 pre-deploy gate (`! grep "{IUBENDA_POLICY_ID}" client/src/pages/Privacy.tsx`) will block production deploy until substitution.
- **Plain `<div>` wrapper, not Mantine `<Card>`:** Card's elevated styling conflicts with the transparent iframe background AdSlot needs.
- **Component-scoped script injection (not `<head>`):** Adsterra `atOptions` is a per-unit global; head injection would race the per-component config. Iubenda script in `<head>` would also leak cookies/tracking onto the home page.

## Deviations from Plan

None - plan executed exactly as written.

The Wave 0 deferral directive (Privacy.tsx ships with `{IUBENDA_POLICY_ID}` literal placeholder) is the plan's prescribed Wave-1 path, not a deviation — see plan task 2 step 3 final paragraph and the spawning prompt's `<wave_0_deferred_note>`.

## Issues Encountered

None. All three tasks completed sequentially without blockers. TypeScript and production build green after each task.

## Pre-Deploy Gates (deferred to plan 10-06)

The following gate MUST pass before plan 10-06 runs `deploy.sh`:

```bash
! grep -E "\{IUBENDA_POLICY_ID\}" client/src/pages/Privacy.tsx
```

When the real numeric Iubenda policy ID is provisioned (out-of-band Wave 0 user-action gate), substitute it for the literal `{IUBENDA_POLICY_ID}` token in `client/src/pages/Privacy.tsx`. Until then, `/privacy` would 404 against Iubenda — acceptable on staging, fatal on production.

## Known Stubs

- `client/src/pages/Privacy.tsx` line ~19: `IUBENDA_POLICY_URL` contains literal `{IUBENDA_POLICY_ID}` token. **Reason:** Wave 0 (plan 10-01) credential provisioning is deferred. **Resolution:** Plan 10-06 pre-deploy gate substitutes real policy ID before `deploy.sh`.

## User Setup Required

None directly from this plan. Wave 0 (plan 10-01) is the user-action gate (Adsterra/Sovrn/Iubenda account registration + Media.net submission). When Wave 0 completes, the user populates `client/.env` (gitignored) using `client/.env.example` as the template.

## Next Phase Readiness

- **Wave 1 plans 04 + 05** (Sovrn head-script sync + sitemap legal-page entry) are mutually parallel-safe with this plan — zero file overlap with AdSlot.tsx, Privacy.tsx, .env.example.
- **Wave 2 plan 05** (App.tsx integration) can now `import AdSlot from './components/AdSlot'` and `import Privacy from './pages/Privacy'` with zero further setup. AdSlot will be invoked as `<AdSlot adKey={import.meta.env.VITE_ADSTERRA_UNIT_KEY} width={728} height={90} />` above the footer.
- **Wave 3 plan 06** owns the pre-deploy gate that substitutes `{IUBENDA_POLICY_ID}` with the real numeric ID.

## Self-Check

Verified files exist on disk:

- `client/src/components/AdSlot.tsx` — FOUND (89 lines)
- `client/src/pages/Privacy.tsx` — FOUND (68 lines)
- `client/.env.example` — FOUND (25 lines)

Verified commits exist in git log:

- `1dfbfc7` — FOUND (feat(10-03): add AdSlot.tsx Adsterra banner component)
- `4a17166` — FOUND (feat(10-03): add Privacy.tsx Iubenda-embedded privacy policy page)
- `968b8b1` — FOUND (chore(10-03): add client/.env.example onboarding template)

Verified contracts:

- `git check-ignore client/.env.example` → exit 1 (NOT gitignored, committable) ✓
- `git check-ignore client/.env` → exit 0 (IS gitignored, sanity check) ✓
- `git diff client/src/App.tsx` → empty (zero edits to existing files) ✓
- `npx tsc --noEmit -p .` → "TypeScript: No errors found" ✓
- `npm run build` → built in 678ms, no errors ✓

## Self-Check: PASSED

---

*Phase: 10-replace-adsense-with-adsterra-banner-and-media-net*
*Plan: 03 — AdSlot.tsx + Privacy.tsx + .env.example*
*Completed: 2026-04-27*
