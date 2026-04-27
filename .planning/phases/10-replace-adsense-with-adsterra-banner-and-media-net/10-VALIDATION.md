---
phase: 10
slug: replace-adsense-with-adsterra-banner-and-media-net
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-27
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Sourced from `10-RESEARCH.md` §Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — manual + Lighthouse + curl + dashboard verification (consistent with Phase 4/7/9 precedent). Project has no Jest/Vitest/Playwright/Testing-Library. |
| **Config file** | none |
| **Quick run command** | `cd client && npm run build && npm run preview` then open `http://localhost:4173` |
| **Full suite command** | `npx lighthouse https://sunozip.com --form-factor=mobile --view` + `curl https://sunozip.com/ads.txt` + curl `/privacy` + curl `/sitemap.xml` + visual incognito check + Adsterra dashboard status |
| **Estimated runtime** | ~120 seconds (build ~30s, lighthouse ~60s, curl + visual ~30s) |

**Why no automated tests:** Adding a test framework now would expand scope beyond Phase 10 and is explicitly out of scope per CLAUDE.md "Visual modernization only" framing. Phase 4 (AdSense), Phase 7 (donation modal), Phase 9 (SEO) all used manual + Lighthouse verification successfully.

---

## Sampling Rate

- **Per task commit:** `cd client && npm run build` (must succeed); `npm run preview` smoke check (visual confirmation slot renders).
- **Per wave merge:** `npm run build` + run `deploy.sh` to staging-equivalent + curl checks (ads.txt, /privacy, sitemap).
- **Phase gate (`/gsd-verify-work`):** Full UAT manual run + Lighthouse mobile CLS check + Adsterra dashboard "Approved" status.
- **Max feedback latency:** ~30 seconds per task (build only); ~120 seconds per wave.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-XX | 01 (AdSlot) | 1 | ADM-02 | T-10-iframe | Sandboxed iframe; min-height reservation prevents CLS | manual + automated | `npx lighthouse https://sunozip.com --only-categories=performance --form-factor=mobile` (CLS<0.1) | ❌ W0 — `client/src/components/AdSlot.tsx` | ⬜ pending |
| 10-01-XX | 01 (AdSlot) | 1 | ADM-02 | — | min-height inline style survives bundling | automated | `cd client && npm run build && grep -E 'min-height' dist/assets/index-*.js` | ❌ W0 | ⬜ pending |
| 10-02-XX | 02 (App.tsx patch) | 2 | ADM-05 | — | "Advertisement" 11px label above slot, banner above footer | manual visual | open `http://localhost:4173` → confirm placement | ❌ W0 | ⬜ pending |
| 10-03-XX | 03 (Privacy) | 1 | ADM-06 | T-10-cdn | Iubenda widget loads only on `/privacy`, not on home | automated + manual | `curl -s -o /dev/null -w "%{http_code}" https://sunozip.com/privacy` (200); visual render check | ❌ W0 — `client/src/pages/Privacy.tsx`, `App.tsx` path conditional | ⬜ pending |
| 10-04-XX | 04 (head/index.html) | 1 | ADM-04, ADM-08 | T-10-csp | No CSP/CORS regression; Sovrn signal loads | automated + manual | `grep -c "helmet" server.js` (=0); browser DevTools Network shows `sovrn_signal.js` 200 | ❌ W0 — `client/index.html`, `public/index.html` | ⬜ pending |
| 10-05-XX | 05 (ads.txt) | 1 | ADM-03, ADM-08 | T-10-typo | All four lines present (Google + Adsterra + Sovrn lijit + Sovrn sovrn); single source-of-truth | automated | `curl -s https://sunozip.com/ads.txt \| grep -E '(adsterra\|google\|lijit\|sovrn)'` (4 matches); `find . -name ads.txt -not -path "*/node_modules/*" -not -path "*/.git/*"` (one path = `./public/ads.txt`) | ❌ W0 — `public/ads.txt` patch | ⬜ pending |
| 10-06-XX | 06 (sitemap+robots) | 2 | ADM-06 | — | `/privacy` listed in sitemap; not disallowed in robots | automated | `curl -s https://sunozip.com/sitemap.xml \| grep "/privacy"`; `curl -s https://sunozip.com/robots.txt \| grep -v "Disallow.*privacy"` | ❌ W0 — sitemap.xml patch | ⬜ pending |
| 10-07-XX | 07 (env) | 0 | (build hygiene) | T-10-envleak | `.env.example` checked in with placeholders; `.env` gitignored | automated | `git ls-files client/.env` (empty); `cat client/.env.example` lists all VITE_* keys | ❌ W0 — `client/.env.example` | ⬜ pending |
| 10-08-XX | 08 (Media.net) | 0 | ADM-07 | — | Submission record committed | manual artifact | `cat .planning/phases/10-.../MEDIA-NET-SUBMISSION.md` (date + ticket ID) | ❌ W0 | ⬜ pending |
| 10-09-XX | 09 (Adsterra dashboard) | 0 | ADM-01 | T-10-formats | Banner only; popunder/social-bar/in-page-push DISABLED | manual human (dashboard screenshot) | n/a — log screenshot in commit message or adjacent file | n/a — user action | ⬜ pending |
| 10-10-XX | 10 (REQUIREMENTS backfill) | 1 | (traceability) | — | ADM-01..09 present in REQUIREMENTS.md | automated | `grep -c "ADM-0" .planning/REQUIREMENTS.md` (≥9) | ❌ W0 — `.planning/REQUIREMENTS.md` patch | ⬜ pending |
| 10-11-XX | 11 (UAT regression) | 3 | ADM-09 | — | Golden-path download flow unbroken | manual UAT | paste playlist URL → fetch → "Download as ZIP" → ZIP downloads with embedded ID3; theme toggle works; Phase 7 donation modal triggers | n/a | ⬜ pending |
| 10-12-XX | 11 (UAT regression) | 3 | ADM-09 | T-10-popunder | No popunder fires in incognito | manual human | open `https://sunozip.com` in incognito Chrome, interact 60s | n/a | ⬜ pending |
| 10-13-XX | 11 (UAT regression) | 3 | ADM-09 | — | No console errors on production load | manual human (DevTools Console) | n/a | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*Task IDs are placeholders; the planner will assign actual `{phase}-{plan}-{task}` IDs.*

---

## Wave 0 Requirements

**User-action prerequisites (blocking — must complete before any code task can verify):**
- [ ] User registers Adsterra publisher account; site approved; popunder/social-bar/in-page-push DISABLED in dashboard (ADM-01).
- [ ] User registers Sovrn Commerce account; Site ID + Publisher ID + ads.txt lines obtained from dashboard (ADM-08).
- [ ] User generates Iubenda free privacy policy; embed code obtained (ADM-06).
- [ ] User submits Media.net publisher application; ticket ID logged (ADM-07).

**File creation prerequisites:**
- [ ] `client/src/components/AdSlot.tsx` — covers ADM-02 (new file).
- [ ] `client/src/pages/Privacy.tsx` — covers ADM-06 (new file).
- [ ] `client/.env.example` — placeholders for `VITE_ADSTERRA_UNIT_KEY`, `VITE_SOVRN_SITE_ID`, `VITE_ADSTERRA_PUB_ID`, `VITE_SOVRN_PUB_ID`, `VITE_ADSTERRA_TAG_HASH` (new file).
- [ ] `client/.env` — gitignored, populated with real values from user registrations (user-supplied, not committed).
- [ ] `.planning/phases/10-replace-adsense-with-adsterra-banner-and-media-net/MEDIA-NET-SUBMISSION.md` — covers ADM-07 (new file).

**No test framework install needed** — validation is manual + Lighthouse + curl, consistent with Phase 4/7/9 precedent.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Adsterra dashboard formats: only Banner enabled | ADM-01 | Dashboard is third-party UI; no API for verification | Log in to Adsterra → Websites → sunozip.com → Settings → Ad formats → confirm only `Banner` checked. Screenshot saved alongside commit. |
| Adsterra script loads with no CSP/CORS error | ADM-04 | Browser DevTools is the only oracle for live network requests | Open `https://sunozip.com` in Chrome incognito → DevTools → Network tab → filter `highperformanceformat` → verify 200 OK with no `Content-Security-Policy` violation in Console. |
| Sovrn signal script loads | ADM-08 | Same as above | DevTools → Network → filter `sovrn_signal` → verify 200 OK. |
| Banner visible above footer with "Advertisement" label | ADM-05 | Visual layout cannot be asserted programmatically | Open `https://sunozip.com` in incognito → scroll to bottom → verify 728x90 banner sits above footer; "Advertisement" label in 11px muted text directly above. |
| Iubenda policy renders correctly on `/privacy` | ADM-06 | Iubenda widget content is third-party; visual style integration matters | Open `https://sunozip.com/privacy` → verify policy text loads, dark theme matches, no console errors. |
| No popunder fires in incognito | ADM-09 + Pitfall 7 | Popunders only trigger on user interaction; cannot be asserted by curl | Open `https://sunozip.com` in incognito Chrome with no extensions → click around for 60 seconds → no new tabs/windows open. |
| Golden-path download flow | ADM-09 | UAT requires real Suno playlist URL and observing ZIP contents | Paste a known Suno playlist URL → click "Get Playlist" → wait for fetch → click "Download as ZIP" → verify ZIP downloads with correct filename and ID3 tags embedded. |
| Settings persistence still works | ADM-09 | Phase 7 modal trigger is integration-test-shaped; no test framework | Click "Download as ZIP" twice across sessions → confirm Phase 7 donation modal triggers per existing logic. |
| Theme toggle still works | ADM-09 | Visual state transition | Click theme toggle → confirm dark↔light transition with no console errors. |
| Lighthouse mobile CLS <0.1 | ADM-02 | Lighthouse is the standard oracle | `npx lighthouse https://sunozip.com --form-factor=mobile --only-categories=performance` → CLS metric must be <0.1. |
| Adsterra dashboard verification status flips to "Approved" | ADM-01, ADM-03 | Dashboard polling, third-party | Within 60 minutes of `ads.txt` propagating, Adsterra dashboard shows "Approved" for sunozip.com. |

---

## Validation Sign-Off

- [ ] All tasks have automated verify command OR Wave 0 manual instructions
- [ ] Sampling continuity: build runs after every task; full curl+lighthouse suite per wave
- [ ] Wave 0 user-action prerequisites flagged as blockers
- [ ] No watch-mode flags (no test framework)
- [ ] Feedback latency <30s per task, <120s per wave
- [ ] Manual UAT block listed for ADM-09 regression sweep
- [ ] `nyquist_compliant: true` set in frontmatter once planner assigns task IDs

**Approval:** pending
