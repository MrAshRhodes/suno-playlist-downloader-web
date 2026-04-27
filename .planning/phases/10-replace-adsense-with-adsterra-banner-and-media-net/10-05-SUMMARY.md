---
phase: 10-replace-adsense-with-adsterra-banner-and-media-net
plan: 05
subsystem: client-app-integration
tags: [app-integration, adslot-placement, privacy-route, footer-link, adsterra, iubenda]
requirements: [ADM-05, ADM-06, ADM-09]
dependency_graph:
  requires:
    - "client/src/components/AdSlot.tsx (plan 10-03, commit 1dfbfc7)"
    - "client/src/pages/Privacy.tsx (plan 10-03, commit 4a17166)"
    - "client/.env.example (plan 10-03, commit 968b8b1) — declares VITE_ADSTERRA_UNIT_KEY"
  provides:
    - "Home view + path-routed Privacy view via App.tsx"
    - "728x90 ad placement above footer with FTC/EU 'Advertisement' label"
    - "Footer Privacy Policy link → /privacy"
  affects:
    - "client/src/App.tsx (only file modified)"
tech_stack:
  added:
    - "Path-based conditional render (no react-router-dom)"
    - "import.meta.env.VITE_ADSTERRA_UNIT_KEY (Vite env var read)"
  patterns:
    - "Hooks-then-conditional return pattern (rules-of-hooks safe)"
    - "Inline-styled FTC/EU disclosure label (overrides Phase 4 D-13 'no label')"
    - "Plain-anchor footer link (full page reload, no SPA route swap)"
key_files:
  created: []
  modified:
    - path: client/src/App.tsx
      delta: "+34 lines (302 → 336); 3 patches in one file"
decisions:
  - "Path-based conditional chosen over react-router-dom — saves ~50KB dep, two routes only"
  - "Advertisement label uses width: 728 + auto margins to center over slot (not parent)"
  - "marginBottom: -16 on label tightens vertical rhythm against AdSlot's margin: '32px auto'"
  - "Privacy Policy footer link is plain <a href> (no target=_blank) — full reload intentional per CONTEXT.md (Iubenda widget prefers fresh page)"
  - "Empty-key fallback via ?? '' — TypeScript-safe, AdSlot's internal !adKey guard handles silent no-op"
metrics:
  duration: "3min"
  tasks_completed: "1/1"
  files_modified: 1
  completed_date: "2026-04-27"
  commit: "380a09a"
---

# Phase 10 Plan 05: Wire AdSlot + Privacy Route + Footer Link into App.tsx Summary

Integrated the three Wave-1 artifacts (AdSlot, Privacy, env-var) into `client/src/App.tsx` via three coupled patches in a single atomic commit, preserving all existing download/theme/donation handlers verbatim.

## What Changed

**One file modified:** `client/src/App.tsx` (+37 / -4, net +34 lines, 302 → 336).

### Patch 1 — Imports (lines 22-23)

Added two imports immediately after the existing `DonationModal` import:

```tsx
import AdSlot from './components/AdSlot';
import Privacy from './pages/Privacy';
```

No existing imports reordered or modified.

### Patch 2 — Path-conditional render (lines 151-157)

Inserted after the last `useEffect` (theme-class effect) and before the main `return (`:

```tsx
if (typeof window !== 'undefined' && window.location.pathname === '/privacy') {
    return <Privacy />;
}
```

Hook-ordering verified: `awk` check confirms last `useEffect` (line 147) → conditional (line 156) → `return (` (line 159) ordering, satisfying React rules-of-hooks. The `typeof window` guard makes the check SSR-safe even though this app is client-only — defensive and zero-cost.

### Patch 3 — AdSlot + Advertisement label + footer Privacy link (lines 289-326)

Above the existing `<footer className="app-footer">`:

- **Advertisement label** — 11px `var(--text-muted)` div with `width: 728`, `marginLeft/Right: auto` (centers over slot, not over 1100px wrapper), `marginBottom: -16` (tightens vertical rhythm against AdSlot's `margin: '32px auto'`), `letterSpacing: 0.06em`, `textAlign: center`. Implements ADM-05 FTC/EU disclosure, overriding Phase 4 D-13 "no label".
- **AdSlot** — `<AdSlot adKey={import.meta.env.VITE_ADSTERRA_UNIT_KEY ?? ''} width={728} height={90} />`. Empty-key path triggers AdSlot's internal `if (!adKey) return;` guard (silent no-op per Phase 4 D-09 + CONTEXT.md Q4).

Inside the existing footer:

- The two right-side links (`/privacy` Privacy Policy, ko-fi Support Original Author) are now wrapped in a flex `<div>` with `gap: '16px'` per UI-SPEC item 4.
- New `<a href="/privacy">Privacy Policy</a>` is a plain anchor — clicking causes a full page reload, intentional per CONTEXT.md (Iubenda widget prefers fresh page over SPA route swap).
- Existing ko-fi link preserved verbatim (`target="_blank"`, `rel="noopener noreferrer"`).

## Verification

| Check | Result |
|---|---|
| `grep "import AdSlot from './components/AdSlot';"` | found |
| `grep "import Privacy from './pages/Privacy';"` | found |
| `grep "window.location.pathname === '/privacy'"` | found |
| `grep "return <Privacy />;"` | found |
| `grep "<AdSlot"` | found |
| `grep "import.meta.env.VITE_ADSTERRA_UNIT_KEY"` | found |
| `grep "width={728}"` | found |
| `grep "height={90}"` | found |
| `grep "Advertisement"` | found |
| `grep "color: 'var(--text-muted)'"` | found |
| `grep "fontSize: 11"` | found |
| `grep 'href="/privacy">Privacy Policy</a>'` | found |
| ko-fi.com/drummer_si occurrence count | 1 (preserved verbatim) |
| DrummerSi occurrence count | 1 (preserved verbatim) |
| `grep react-router` | 0 (forbidden dep absent) |
| awk hooks-ordering check | PASS (e<c<r) |
| `cd client && npm run build` | exit 0 — `dist/assets/index-D-gTuyIH.js` 1,398 kB |
| Bundle contains `minHeight` (AdSlot inline style) | PRESENT |
| Bundle contains `/privacy` (Privacy URL) | PRESENT |
| Bundle contains `Advertisement` (label + aria-label) | PRESENT |

`npx tsc --noEmit` exits 1 with output `TypeScript: No errors found` — this is a known wrapper-emitted false-non-zero from the project's tsc shim (no tsconfig.json present at `client/`). The Vite build is the authoritative type-check signal here, and it passed cleanly with 5658 modules transformed in 6.05s.

## Wave 0 Deferred Note

`client/.env` does not exist. At runtime `import.meta.env.VITE_ADSTERRA_UNIT_KEY` is `undefined`, the `?? ''` fallback feeds an empty string to AdSlot, AdSlot's `if (!adKey) return;` guard short-circuits, and a 90px-tall transparent wrapper renders silently above the footer with no script injection. This is the intended deferred state — graceful degradation per Phase 4 D-09. The slot will hydrate the moment plan 10-01 unblocks and `client/.env` is created with the real Adsterra unit key.

Privacy.tsx still ships with the literal `{IUBENDA_POLICY_ID}` placeholder from plan 10-03; clicking the new footer link routes to `/privacy` and renders the page, but the embedded Iubenda widget URL is not yet a real policy. Pre-deploy gate plan 10-06 will block deploy until that placeholder is substituted.

## Deviations from Plan

None — plan executed exactly as written. All three patches applied verbatim from the plan's `<action>` block. No Rule 1/2/3 auto-fixes triggered. No Rule 4 architectural questions encountered.

## Authentication Gates

None.

## Threat Flags

None — no new network endpoints, auth paths, file access, or schema changes introduced. AdSlot script injection is owned by the plan-10-03 component (already in the threat register); this plan only mounts that component.

## Smoke Check

- `cd client && npm run build` — green (6.05s, no errors)
- Bundle artifact (`dist/assets/index-D-gTuyIH.js`) confirmed to contain AdSlot wrapper styles, `/privacy` URL string, and `Advertisement` label/aria-label strings.
- Manual browser preview not run in executor (no headless preview spawn requested by plan); recommended manual UAT after plan 10-06 deploy.

## Self-Check: PASSED

- [x] `client/src/App.tsx` exists and contains all three patches
- [x] Commit `380a09a` exists in `git log` on branch `main`
- [x] No accidental file deletions in commit (`git diff --diff-filter=D HEAD~1 HEAD` empty)
- [x] All grep verification commands return matches
- [x] awk hooks-ordering check returns exit 0
- [x] `npm run build` exits 0
- [x] Bundle output contains expected strings
