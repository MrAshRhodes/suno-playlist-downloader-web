# Phase 10: Adsterra Monetisation (banner-only) + Media.net submission - Research

**Researched:** 2026-04-27
**Domain:** Web monetization integration (Adsterra banner + Sovrn affiliate + Iubenda privacy + Media.net submission) on a Vite/React 18/Mantine v6 SPA deployed via Replit Express + custom domain
**Confidence:** HIGH on integration patterns (verified against the live codebase), HIGH on policy/eligibility (carried from canonical research), MEDIUM on Sovrn ads.txt exact format (confirmed direct-vs-reseller distinction; per-publisher account ID required), LOW on RPM forecasts (carried).

## Summary

Phase 10 is an *integration* phase, not an exploratory one. The canonical research file `.planning/research/ad-networks-vs-adsense.md` already settled which networks to use and why (Adsterra banner-only PRIMARY, Media.net submission SECONDARY, Sovrn Commerce affiliate paired, Iubenda free-tier privacy required by Sovrn ToS, AdSense kept dormant). Phase 10 RESEARCH.md's job is to **validate those research recommendations against the live codebase** and surface the implementation specifics — file paths, current head-tag layout, Vite/Express dual-file conventions, CSS variable hooks, and route mechanics for `/privacy`.

Three findings materially refine the upstream context:

1. **The canonical `ads.txt` location is `public/ads.txt`, not `client/public/ads.txt`.** CONTEXT.md guessed wrong. `client/public/` exists but contains only `assets/` (no `ads.txt`). The Phase 9 commit `336b11b` added `public/ads.txt`, `public/robots.txt`, `public/sitemap.xml` directly to the deploy mirror, and `server.js` lines 100–110 explicitly serve them via `app.get('/ads.txt')` etc. before the SPA catch-all. **Edit `public/ads.txt` directly. Do not create `client/public/ads.txt`** — doing so would create a duplicate that `deploy.sh` would silently overwrite.

2. **The project has no React Router and no test framework.** `react-router-dom` is not in `client/package.json`; no `BrowserRouter`/`useLocation` usage in `client/src/`. `client/package.json` has no `jest`/`vitest`/`@testing-library`/`playwright`. This means the `/privacy` route is best implemented as a **path-based conditional render in `App.tsx`** (Option B from CONTEXT.md "Claude's Discretion") — adding `react-router-dom` for one extra route is overkill and pulls a 50 KB+ dependency for no benefit on a two-route SPA. Validation is manual + Lighthouse.

3. **The Adsterra `useEffect` injection pattern in research §6 is correct for a single ad slot but breaks on multi-instance.** Verified at `joshwp.com` (the React-Adsterra integration guide): `atOptions` is a global, so simultaneous mounts overwrite each other and only the last ad renders. Sunozip.com has exactly **one** AdSlot, so the §6 pattern is safe — but if Phase 12+ ever adds a second slot, switch to the `<iframe srcDoc>` isolation pattern. Documented as an explicit "future-proofing footnote" in the AdSlot file.

**Primary recommendation:** Implement exactly per CONTEXT.md decisions, but: (a) edit `public/ads.txt` directly, not `client/public/ads.txt`; (b) implement `/privacy` as a `window.location.pathname === '/privacy'` conditional in `App.tsx` (no router); (c) add a code comment in `AdSlot.tsx` warning that `atOptions` is global and the component is single-instance-only.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Display network selection (research §1, §3.1):**
- **Primary network:** Adsterra (banner-only). Only mainstream network approving thin-content single-page utility sites today, 5–10 minute approval, no traffic minimums.
- **Secondary application:** Media.net submission filed in parallel as higher-reputation backup demand source — non-blocking; phase completes when application acknowledged.
- **Affiliate layer:** Sovrn Commerce — installed today regardless of display network choice (single script, orthogonal to display ads, zero UX cost).
- **Endgame retained:** AdSense snippet stays dormant in `client/index.html` and `public/index.html` for future reapply (currently rejected, harmless).
- **Explicitly forbidden formats:** popunder, direct link, social bar, in-page push must be DISABLED in the Adsterra dashboard immediately after site approval. ADM-01 requires this.

**`<AdSlot>` component contract (research §6 + ADM-02):**
- New file: `client/src/components/AdSlot.tsx`. Functional component with hooks. Pattern: `useEffect` injects per-unit `atOptions` global + appends `<script src="//www.highperformanceformat.com/{adKey}/invoke.js" async>` into the slot's div via ref.
- Props: `{ adKey: string; width: number; height: number; className?: string }`.
- CRITICAL: wrapper `style={{ minHeight: height, width, margin: '32px auto', padding: 16, border: '1px solid var(--border-color)', borderRadius: 12, background: 'transparent' }}`. The `minHeight` reservation is mandatory for CLS <0.1.
- DO NOT use Mantine `<Card>` wrapper — Card's elevated styling fights iframe transparent background. Use plain `<div>` with inline style + CSS variables.
- Border radius is **12px** (smaller than the 24px card radius — visually subordinate so the ad reads as a different class of element).

**Placement (ADM-05 + research §9.4):**
- One slot only — directly above the existing `<footer>` in `client/src/App.tsx`.
- 728x90 leaderboard format (desktop-only — accepted compromise per research §9.6).
- "Advertisement" label rendered in 11px `var(--text-muted)`, centered, immediately above the AdSlot wrapper. **This overrides Phase 4 D-13's "no label" decision** because Adsterra EU traffic policy + FTC require disclosure.
- Single ad unit only until 5K sessions/month — fill rate under 70% at low traffic punishes multi-slot layouts.

**`ads.txt` (ADM-03 + research §9.1):**
- Single source of truth: `public/ads.txt` (per validation in this RESEARCH — see Findings §2 below; CONTEXT.md was incorrect on path).
- Audit before edit: `find . -name ads.txt -not -path "*/node_modules/*"` — must return exactly one path.
- Contents: AdSense entry (kept inert), Adsterra DIRECT entry, Sovrn DIRECT entry. Comments allowed.
- Verify served at `https://sunozip.com/ads.txt` after deploy. Adsterra polls hourly.

**Script injection sites (research §6 + §9.2):**
- Edit `client/index.html` first (Vite source).
- Sync identical head changes into `public/index.html` (deploy survives `deploy.sh cp -r client/dist/* public/`).
- Three `<head>` script tags total:
  1. AdSense (kept inert — already present, no change required).
  2. Adsterra invoke: `<script type="text/javascript" src="//www.highperformanceformat.com/YOUR_ADSTERRA_UNIT_KEY/invoke.js" async></script>` — note: this top-level head injection is informational; the actual per-component injection happens inside `AdSlot.tsx` via the ref pattern. Decision: **only inject inside the component, NOT in `<head>`** — the `<head>` injection in research §9.2 is misleading because `atOptions` must be set per-unit before invoke.js runs. Treat the head-level Adsterra `<script>` as **unnecessary** and inject only inside the AdSlot component. (See Findings §3.)
  3. Sovrn Commerce: `<script async src="//ad.lijit.com/www/sovrn_signal/sovrn_signal.js?iid=YOUR_SOVRN_SITE_ID"></script>` in `<head>`. This one IS head-level — Sovrn is a global outbound-link rewriter, not a per-slot loader.

**Environment variables (research §9.5):**
- `client/.env` (gitignored): `VITE_ADSTERRA_UNIT_KEY=...`, `VITE_SOVRN_SITE_ID=...`, `VITE_ADSTERRA_PUB_ID=...`, `VITE_SOVRN_PUB_ID=...`, `VITE_ADSTERRA_TAG_HASH=...`.
- `client/.env.example` (committed): same keys with placeholder values + comments pointing to dashboard locations.
- Vite exposes `VITE_*` to the client bundle. Adsterra unit keys are public anyway. Tidiness, not security.

**Privacy policy page (ADM-06 + research §10):**
- Generate via Iubenda free tier (≤1K pageviews — adequate for current traffic).
- Route at `/privacy`. Implementation per Claude's Discretion below.
- Use Iubenda **standard embedding** widget (`<a class="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe " href="..."><script type="text/javascript" src="https://cdn.iubenda.com/iubenda.js"></script>`) so the page is part of sunozip.com (improves SEO + counts toward AdSense reapply page count).
- Add `/privacy` to `public/sitemap.xml` (Phase 9 location). Add a footer link.
- Robots.txt: confirm `/privacy` is not disallowed (audit `public/robots.txt`). No changes expected unless prior wildcard blocks it.

**Sitemap + robots.txt updates (ADM-06):**
- `public/sitemap.xml` — append `<url>` entry for `https://sunozip.com/privacy`.
- `public/robots.txt` — verify `/privacy` is allowed; no other changes needed.

**Sovrn Commerce wiring (ADM-08 + research §3.5, §9.2):**
- Install single script tag in head (alongside Adsterra invoke).
- ads.txt entry: `lijit.com, YOUR_SOVRN_PUB_ID, DIRECT, fafdf38b16bf6b2b` (verified — see Findings §4). Sovrn typically also requires a paired `sovrn.com` line; the dashboard provides exact lines per account.
- No code changes required beyond the script tag — Sovrn auto-rewrites outbound merchant links.
- Privacy policy page MUST exist before activating Sovrn (their ToS requires it). Plan task ordering reflects this.

**Media.net submission (ADM-07):**
- Submit publisher application via the Media.net web form using sunozip.com.
- Log submission date + ticket ID to a new artifact: `.planning/phases/10-replace-adsense-with-adsterra-banner-and-media-net/MEDIA-NET-SUBMISSION.md`.
- Application is non-blocking — phase completes when submission is acknowledged.

**Functional regression guard (ADM-09):**
- Plan must include a verification task that exercises the golden-path download flow (paste playlist URL → fetch songs → download ZIP) after deploy in a production build (`yarn build && yarn preview` or live sunozip.com). Confirms no script-tag injection regressed existing behavior.
- Lighthouse mobile run: CLS <0.1, no console errors from third-party scripts, no CSP violations.

**Mantine + dark-mode visual integration (research §3, §6, Pitfall 4):**
- Wrapper uses `1px solid var(--border-color)`, `background: transparent`, `border-radius: 12px`, padding 16px. Visually quarantines bright/saturated advertiser creatives.
- Do NOT attempt to invert iframe creatives via CSS filters — modern ad iframes use COEP/CORP that defeat color-filter tricks.
- Mobile <768px: keep desktop-only ad. The 728x90 will overflow on phones — accepted per research §9.6.

**Deployment + verification flow (research §7, §8):**
- Run `yarn build` in `client/`, then `deploy.sh` (which `cp -r client/dist/* public/`).
- Always test ad integration in `yarn preview` (production build), NOT `yarn dev`.
- Post-deploy checks: curl ads.txt, curl /privacy, incognito visual check, Lighthouse mobile, Adsterra dashboard verification.

**Project constraints retained:**
- No functional changes to download flow, API endpoints, settings, or session management. Visual/integration only.
- Mantine v6 — no upgrades.
- Replit deployment must continue working unchanged. `build.sh` and Vite config untouched.
- All modifications confined to `client/` directory + `public/` static assets.

### Claude's Discretion

- Exact method to render the `/privacy` route. The project does not currently use React Router. Pick the simplest pattern.
- Privacy page implementation: embedded Iubenda JS widget vs hosted iframe vs static HTML page in `public/`. Prefer embedded widget on a dedicated React route.
- File location for AdSense → Adsterra ads.txt audit script (if needed). Use `find` inline; no new tooling.
- Whether to hoist the AdSlot's hardcoded styles into a CSS module or keep inline. Inline preferred.
- Whether to wrap `MEDIA-NET-SUBMISSION.md` in any standard frontmatter. Use simple markdown.
- Cleanup: leave the existing `client/public/assets/copy-playlist.png` deletion (already in git status as `D ...`) untouched — unrelated.

**Research recommendations on the discretion items (consumed by planner):**

| Discretion item | Recommendation | Rationale |
|---|---|---|
| `/privacy` route mechanism | **Path-based conditional render in `App.tsx`** — `if (window.location.pathname === '/privacy') return <Privacy />;` at the top of the component | No router in package.json. Adding one for a 2-route SPA pulls 50 KB+ for no benefit. Verified by reading `client/package.json` and grepping `client/src/` for `react-router*` (zero matches). |
| Privacy page implementation | **Embedded Iubenda standard widget on a `Privacy.tsx` React component** | Improves SEO (page is on `sunozip.com/privacy`, not `iubenda.com`); counts toward future AdSense reapply page count; matches Monolith dark theme via wrapper card. |
| AdSlot styles | **Keep inline (research §6 pattern)** | Single ad slot. Adding a CSS module for one component fragments the styling story and adds a build artifact. Inline + CSS variables already gives full theming. |
| `MEDIA-NET-SUBMISSION.md` format | **Plain markdown** — fields: Date, Ticket ID, Account email, Status (`submitted` / `approved` / `rejected`), Decision-date, Notes | Lightweight log artifact. No frontmatter needed because it's not consumed by GSD agents. |

### Deferred Ideas (OUT OF SCOPE)

- Mobile 300x250 ad variant (`useMediaQuery` toggle) — research §9.6. Add when mobile traffic >30%.
- Mediavine Journey migration — gated on 1K sessions/month (research §3.3, §5).
- AdSense reapplication — gated on 15+ content pages, 30-day post-rejection cooldown, target 2026-Q4 (research §10).
- Cookie consent banner / Iubenda CMP — gated on EU traffic >5% OR AdSense reapply trigger (research §10, §13.3).
- Plausible / GA4 analytics — currently no tracking; revisit when applying to Mediavine Journey.
- AI-generated long-form content for AdSense reapply — separate content phase.
- Anti-adblock detection — explicitly forbidden (violates AdSense + Mediavine ToS).
- Multi-network simultaneous display ads — explicitly forbidden when Mediavine Journey activates.
- Mobile-only AdSlot wrapper — defer until traffic data shows mobile share matters.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

**Source:** `.planning/ROADMAP.md` Phase 10 entry. Note: REQUIREMENTS.md does NOT yet contain ADM-01..ADM-09 — only `ADS-01..ADS-04` (Phase 4) appear there. **Plan should include a task to backfill ADM-01..ADM-09 into REQUIREMENTS.md** for traceability per project convention.

| ID | Description | Research Support |
|----|-------------|------------------|
| **ADM-01** | Adsterra publisher account approved with popunder/direct-link/social-bar formats DISABLED in dashboard | Research §3.1 (banner-only config), §8 Pitfall 7 (popunder enabled by default — must explicitly disable). User-action requirement: log dashboard screenshot showing only "Banner" enabled. |
| **ADM-02** | `<AdSlot>` React component (Mantine v6 + CSS-vars + min-height reservation) rendering banner without layout shift (CLS <0.1) | Research §6 full source (consumed verbatim per CONTEXT lock). Findings §3 below adds single-instance-only caveat. Verification: Lighthouse `--form-factor=mobile` on production build. |
| **ADM-03** | `public/ads.txt` updated as transitional dual-entry containing AdSense, Adsterra, Sovrn publisher records, served at `https://sunozip.com/ads.txt` | Research §9.1 example + Findings §2 path correction (canonical is `public/ads.txt`, NOT `client/public/ads.txt`) + Findings §4 Sovrn line format verification. |
| **ADM-04** | Adsterra script tag wired with no CSP/CORS regressions on Replit/Cloud Run | Research §3.1 ("no CSP headers configured — verified from server.js Express setup; no Helmet middleware"), Findings §5 below confirms via direct read of `server.js`. Adsterra invoke loads from `//www.highperformanceformat.com/{key}/invoke.js`. |
| **ADM-05** | First banner placement at bottom of page, dark-mode friendly, "Advertisement" label visible per FTC | Research §6, §9.4. Phase 4 D-01/D-12/D-13 — D-13 is **explicitly overridden** this phase (CONTEXT.md `<decisions>` section: "This overrides the Phase 4 D-13 'no label' decision"). Label spec: 11px, `var(--text-muted)`, centered, above slot wrapper. |
| **ADM-06** | Privacy policy page added (required for Media.net + future AdSense reapply); robots.txt + sitemap.xml updated | Research §10 reapply checklist, §3.5 Sovrn ToS dependency. Iubenda standard embedding script tag (verified: `https://cdn.iubenda.com/iubenda.js`). Sitemap append + robots.txt audit. |
| **ADM-07** | Media.net publisher application submitted (logged with date and ticket ID) | Research §3.2 — non-blocking, async approval. Artifact: `.planning/phases/10-.../MEDIA-NET-SUBMISSION.md`. |
| **ADM-08** | Sovrn Commerce outbound-link rewriter integrated (one script, orthogonal to display ads) | Research §3.5. Single `<script async>` in `<head>` of both `client/index.html` and `public/index.html`. ads.txt `lijit.com, ...., DIRECT, fafdf38b16bf6b2b` line. Privacy policy MUST exist before activation (Sovrn ToS). |
| **ADM-09** | All download flows, settings, and API calls function identically — no functional regressions | Phase 4 verification template (read `04-VERIFICATION.md`). Manual UAT: paste playlist URL → fetch → download ZIP → confirm ZIP file appears, settings modal still works, theme toggle still works. Lighthouse confirms no console errors. |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

The planner MUST honor these — copying verbatim from `./CLAUDE.md` "Project" + "Constraints" sections plus `.claude/get-shit-done` GSD workflow rules.

| Constraint | Phase 10 Implication |
|---|---|
| **No functional changes** — every download flow, API call, and setting must continue working identically | All AdSlot/Sovrn/Iubenda changes must be additive. No edits to `routes/*.js`, no edits to `services/*.ts`. ADM-09 verification gate. |
| **Mantine v6 — cannot upgrade** | AdSlot is plain `<div>` + inline style + CSS variables. No Mantine `<Card>` wrapper (research §6 explicitly excludes this — `Card`'s elevated background fights iframe transparency). |
| **Replit deployment must remain working** with current build process | Three constraints flow from this: (a) `build.sh` and `vite.config.ts` are untouched; (b) `public/` is the deploy mirror — `deploy.sh` runs `cp -r client/dist/* public/`; (c) static files added directly to `public/` (e.g., `ads.txt`) survive deploys per Phase 9 RESEARCH §A3. |
| **Client-only changes** — all modifications confined to `client/src/` | Exception: `public/ads.txt`, `public/sitemap.xml`, `public/robots.txt`, `public/index.html` are static deploy artifacts that this phase MUST edit. These are not "client/src/" but they ARE client-side static assets, fully consistent with the no-server-changes rule. |
| **Yarn vs npm** (per `MEMORY.md feedback_no_yarn`) | Project actually uses **npm** (`package-lock.json` present, no `yarn.lock`). Research/CONTEXT references to `yarn build` and `yarn preview` should be substituted with `npm run build` / `npm run preview` when the planner writes verification commands. |
| **Always rebuild `public/` before pushing** (per `MEMORY.md feedback_deploy_build`) | Plan must explicitly call `deploy.sh` (or `npm run client-build` + `cp -r client/dist/* public/`) before any verification curl against `https://sunozip.com`. |
| **GSD Workflow Enforcement** — direct edits forbidden outside a GSD command | Planner is operating inside `/gsd-plan-phase`, so this is satisfied. |

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Adsterra banner rendering | **Browser / Client** (React component) | — | Pure client-side iframe injection. Adsterra invoke.js runs in the browser, sandboxed by the cross-origin iframe it creates. No server involvement. |
| Adsterra invoke script loading | **Browser / Client** | — | `<script async>` loaded from `//www.highperformanceformat.com`. Browser handles fetch + execution. |
| Sovrn Commerce link rewriter | **Browser / Client** (head script) | — | Sovrn's `sovrn_signal.js` rewrites `<a href>` attributes on outbound clicks at runtime. No build-time or server-time involvement. |
| `ads.txt` serving | **Frontend Server (Express)** | CDN/Static (Replit edge) | `server.js` lines 100–110 explicitly route `/ads.txt`, `/robots.txt`, `/sitemap.xml` via `app.get()` before the SPA catch-all. File lives in `public/` and is served via `express.static`. |
| `/privacy` route rendering | **Browser / Client** (React conditional) | Frontend Server (SPA fallback) | Express's `app.get('*')` catch-all serves `index.html` for `/privacy`. The browser then runs React, which checks `window.location.pathname` and renders `<Privacy />`. No server route addition needed. |
| Iubenda widget content fetch | **Browser / Client** | — | `iubenda.js` script loads from CDN, fetches policy HTML at runtime, injects into the anchor element. |
| `MEDIA-NET-SUBMISSION.md` artifact | **Documentation** (planning artifact) | — | Repo-tracked log file. No runtime tier. |
| ads.txt verification | **Browser / Client + External validator** | — | `curl https://sunozip.com/ads.txt` (browser/CLI) + Adsterra dashboard's hourly poll (external). |

**Why this matters for the planner:** Every functional change in this phase is in the **client tier or static assets**. There are zero server.js, route handler, or backend service edits. If a plan task proposes editing `server.js` or `routes/*.js`, that task is misclassified — push it back.

---

## Standard Stack

### Core (in-use, no change required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.2.0 | AdSlot component, Privacy page component | Already in `client/package.json`; matches existing component conventions. [VERIFIED: `client/package.json`] |
| TypeScript | 5.0.4 | Type-safe AdSlot props | Project convention (`Suno.ts`, `WebApi.ts`, all components are `.tsx`/`.ts`). [VERIFIED] |
| Vite | 8.0.8 | Build pipeline; `client/index.html` is the source of truth | Already in use. `vite.config.ts` untouched. [VERIFIED] |
| Mantine v6 | 6.0.13 | UI primitives (used elsewhere — NOT used by AdSlot) | Locked by CLAUDE.md. AdSlot is plain `<div>` + CSS variables for styling, not Mantine `<Card>`. [VERIFIED] |
| `@mantine/hooks` | 6.0.13 | If/when mobile AdSlot variant added (`useMediaQuery`) | Already in `client/package.json`. Not used in this phase (desktop-only); listed for future-readiness. [VERIFIED] |
| Express | 4.19.2 | Serves `/ads.txt`, `/privacy` (SPA fallback) | Already running. `server.js` already has explicit `/ads.txt`, `/robots.txt`, `/sitemap.xml` route handlers — no changes needed. [VERIFIED: server.js lines 100-110] |

### New external dependencies (third-party scripts loaded via `<script>` — no npm install)

| Resource | Source | Purpose | Verification |
|---|---|---|---|
| Adsterra invoke.js | `//www.highperformanceformat.com/{adKey}/invoke.js` | Loads banner ad iframe per AdSlot mount | [CITED: help-publishers.adsterra.com/en/articles/5213905, joshwp.com/how-to-implement-adsterra-ads-in-react-js-next-js-projects] |
| Sovrn signal | `//ad.lijit.com/www/sovrn_signal/sovrn_signal.js?iid={siteId}` | Outbound-link rewriter | [CITED: research §3.5, §9.2; sovrn.com/commerce] |
| Iubenda iubenda.js | `https://cdn.iubenda.com/iubenda.js` | Privacy policy widget loader | [VERIFIED: WebFetch of iubenda.com help-78 + iubenda/cookie-law-solution-codesnippets GitHub repo] |
| AdSense adsbygoogle.js | `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2601322490070593` | Already in `<head>`, kept inert pending reapply | [VERIFIED: present in `client/index.html` line 51 + `public/index.html` line 50] |

### NOT used (deliberately)

| Package | Why excluded |
|---|---|
| `react-router-dom` | Project has zero existing router usage. Adding for one extra route is overkill. [VERIFIED: `grep -rn react-router client/` returned zero matches; not in `client/package.json`] |
| `react-iubenda-policy` (npm) | The Iubenda standard embedding pattern is one anchor + one script tag. Pulling an npm wrapper is unnecessary indirection. [CITED: npmjs.com/package/react-iubenda-policy — last meaningful publish 2022; project would be adding an unmaintained dependency] |
| `adsterra-components` (npm) | Same logic — Adsterra integration is a 30-line `useEffect`. The npm wrapper is a tiny unmaintained shim. [CITED: npmjs.com/package/adsterra-components — `0.1.1`, single contributor] |
| Helmet/CSP middleware | server.js has no Helmet — research confirmed CSP is non-restrictive. Adding Helmet now would block third-party scripts. **Do NOT add.** [VERIFIED: read `server.js` — no Helmet import, no CSP headers manually set] |
| Any test framework | Project has no Jest/Vitest/Playwright config. Validation is manual + Lighthouse. [VERIFIED: `client/package.json` `devDependencies` contains no test framework] |

**Installation:** None. Phase 10 adds **zero npm packages**. All third-party integrations are `<script>` tags + a new React component.

**Version verification:**
```bash
# All in-use libraries already locked in package-lock.json — no fresh installs.
# Sanity check the AdSense script-src on the live site to confirm baseline:
curl -s https://sunozip.com/ | grep adsbygoogle
# Expected: <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2601322490070593" crossorigin="anonymous"></script>
```

---

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  USER BROWSER (sunozip.com)                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React App (Vite-built bundle)                            │  │
│  │  ┌──────────────┐    ┌──────────────────────────────┐    │  │
│  │  │ App.tsx      │    │  pathname === '/privacy' ?   │    │  │
│  │  │              │───▶│  → render <Privacy />        │    │  │
│  │  │              │    │  : render <MainApp />        │    │  │
│  │  └──────┬───────┘    └──────────────────────────────┘    │  │
│  │         │                                                 │  │
│  │         │ (MainApp branch)                                │  │
│  │         ▼                                                 │  │
│  │  ┌─────────────────────────────────┐                     │  │
│  │  │  ...steps 1-3, footer...        │                     │  │
│  │  │  ┌───────────────────────────┐  │                     │  │
│  │  │  │ "Advertisement" label     │  │                     │  │
│  │  │  │ <AdSlot adKey={ENV} />    │  │  useEffect:         │  │
│  │  │  │   - sets atOptions         │──┼──▶ inject <script  │
│  │  │  │   - injects invoke.js     │  │   src="//hpf...">  │
│  │  │  │   - reserves min-height   │  │                     │  │
│  │  │  └───────────────────────────┘  │                     │  │
│  │  │  <footer> (existing, unchanged) │                     │  │
│  │  └─────────────────────────────────┘                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  <head> static scripts (loaded once per page)             │  │
│  │  - AdSense adsbygoogle.js  (inert, kept for reapply)     │  │
│  │  - Sovrn sovrn_signal.js   (outbound link rewriter)      │  │
│  │  - Iubenda iubenda.js      (loaded on /privacy only)     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────┬───────────────────────────────┬───────────────────────┘
          │                               │
          ▼ (HTTP)                        ▼ (HTTP)
┌──────────────────────┐         ┌─────────────────────────┐
│ Express server       │         │ Third-party CDNs        │
│ (server.js on Replit)│         │ - highperformanceformat │
│                      │         │   (Adsterra)            │
│ /              → SPA │         │ - ad.lijit.com (Sovrn)  │
│ /privacy       → SPA │         │ - cdn.iubenda.com       │
│ /ads.txt       → static│        │ - pagead2.gsy... (AS)  │
│ /robots.txt    → static│        └─────────────────────────┘
│ /sitemap.xml   → static│
│ /api/*         → routes│        ┌─────────────────────────┐
│ /api/playlist  → ...   │        │ External validators     │
│ /api/download  → ...   │        │ - Adsterra dashboard    │
└────────┬─────────────┘         │   (polls /ads.txt hourly)│
         │                       │ - Media.net submission  │
         ▼                       │   (web form)            │
   public/ (static)              │ - Lighthouse (CWV)      │
   - index.html (synced)         └─────────────────────────┘
   - ads.txt (3 networks)
   - robots.txt
   - sitemap.xml (+/privacy)
   - assets/...
```

**Trace for the primary use case (user arrives at sunozip.com homepage):**
1. Browser GETs `/` → Express returns `public/index.html` (catch-all `app.get('*')`).
2. Browser parses `<head>` → loads adsbygoogle.js (no-op, AS rejected), sovrn_signal.js (initializes link rewriter), Inter font.
3. Bundle hydrates → `App.tsx` runs, `window.location.pathname === '/'` → renders MainApp.
4. AdSlot mounts → `useEffect` runs: sets `window.atOptions = {key, format, height, width, params}`, creates a `<script>` element pointing to `//www.highperformanceformat.com/{adKey}/invoke.js`, appends to the AdSlot div ref.
5. invoke.js fetches → renders banner inside an Adsterra-controlled iframe within the reserved `min-height: 90px` div. CLS = 0.
6. User clicks an outbound link to (say) bandcamp.com → Sovrn's signal script intercepts, rewrites href with affiliate tag.

**Trace for `/privacy`:**
1. User GETs `/privacy` → Express SPA catch-all returns `public/index.html`.
2. Browser hydrates `App.tsx` → `window.location.pathname === '/privacy'` → renders `<Privacy />`.
3. `<Privacy />` mounts an `<a class="iubenda-..." href="...">` and a `<script src="https://cdn.iubenda.com/iubenda.js">` (or imports script via `useEffect`).
4. iubenda.js fetches the policy HTML and injects into the anchor.

### Recommended Project Structure

```
client/
├── src/
│   ├── App.tsx               # PATCH: add path-based conditional + AdSlot above footer
│   ├── components/
│   │   ├── AdSlot.tsx        # NEW — single Adsterra banner (CLS-safe)
│   │   └── Privacy.tsx       # NEW — Iubenda widget host
│   └── ...
├── index.html                # PATCH: add Sovrn script tag in <head>; AdSense stays
├── .env                      # NEW (gitignored): VITE_ADSTERRA_UNIT_KEY, VITE_SOVRN_SITE_ID, ...
└── .env.example              # NEW (committed): same keys with placeholder values

public/                       # Deploy mirror — also patched directly for immediate effect
├── index.html                # PATCH: same head changes as client/index.html
├── ads.txt                   # PATCH: append Adsterra + Sovrn lines (keep AdSense)
├── robots.txt                # AUDIT: ensure /privacy not disallowed (no change expected)
└── sitemap.xml               # PATCH: append <url>https://sunozip.com/privacy</url>

.planning/phases/10-.../
└── MEDIA-NET-SUBMISSION.md   # NEW — log artifact, plain markdown
```

### Pattern 1: AdSlot (single-instance, ref-based script injection)

**What:** A React component that renders a fixed-dimension `<div>` and, on mount, sets `window.atOptions` and appends a `<script>` element pointing to Adsterra's invoke.js. The iframe rendered by invoke.js fits inside the reserved space, so CLS is 0.

**When to use:** Exactly one place — above the footer in `App.tsx`. **Multi-instance is unsafe** because `atOptions` is a global; a second mount would overwrite the first's config (verified at joshwp.com).

**Source:** Verbatim from `.planning/research/ad-networks-vs-adsense.md` §6 — already locked in CONTEXT. [CITED: research §6]

```tsx
// client/src/components/AdSlot.tsx
// Source: research §6 (ad-networks-vs-adsense.md)
// SINGLE-INSTANCE COMPONENT. atOptions is a global — multiple mounts collide.
// If a second ad slot is ever needed, switch to the <iframe srcDoc> isolation
// pattern documented at https://joshwp.com/how-to-implement-adsterra-ads-in-react-js-next-js-projects/
import { useEffect, useRef } from 'react';

interface AdSlotProps {
  adKey: string;
  width: number;
  height: number;
  className?: string;
}

export default function AdSlot({ adKey, width, height, className }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !adKey) return;
    (window as unknown as { atOptions: unknown }).atOptions = {
      key: adKey,
      format: 'iframe',
      height,
      width,
      params: {},
    };
    const s = document.createElement('script');
    s.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
    s.async = true;
    ref.current.appendChild(s);
  }, [adKey, height, width]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        minHeight: height,
        width,
        margin: '32px auto',
        padding: 16,
        border: '1px solid var(--border-color)',
        borderRadius: 12,
        background: 'transparent',
      }}
      aria-label="Advertisement"
      role="complementary"
    />
  );
}
```

**Empty `adKey` guard:** the `if (!adKey) return;` line means that if `VITE_ADSTERRA_UNIT_KEY` is not set in `.env` (e.g., during local dev without an Adsterra account), the slot renders an empty placeholder rather than throwing. This keeps the build green for contributors without Adsterra credentials.

### Pattern 2: "Advertisement" label above the slot

**What:** A small, FTC-compliant text label sitting directly above the AdSlot wrapper.

**Why:** Phase 4 D-13 said "no label". This phase **overrides** that — Adsterra's EU policy + FTC require disclosure. CONTEXT.md `<decisions>` is explicit. [VERIFIED: CONTEXT.md, research §13.2]

```tsx
// In App.tsx, just above the footer:
<div style={{
  textAlign: 'center',
  fontSize: 11,
  color: 'var(--text-muted)',
  marginTop: 32,
  marginBottom: -16,  // pulls the AdSlot's 32px top-margin closer
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
}}>
  Advertisement
</div>
<AdSlot
  adKey={import.meta.env.VITE_ADSTERRA_UNIT_KEY ?? ''}
  width={728}
  height={90}
/>
```

### Pattern 3: Path-based conditional render (no router)

**What:** A top-of-component check on `window.location.pathname` to swap between MainApp and Privacy.

**When to use:** When you have 2 routes and don't want to ship a router.

**Why for sunozip.com:** No router in deps; one extra route doesn't justify ~50 KB of router code; SEO works fine because the SPA catch-all in Express returns `index.html` for any path, and React just chooses what to render based on path.

```tsx
// client/src/App.tsx — at the top of App() body:
function App() {
  // Path-based route — no router needed for two routes
  if (typeof window !== 'undefined' && window.location.pathname === '/privacy') {
    return <Privacy />;
  }
  // ...rest of MainApp implementation unchanged
}
```

**Caveat:** Client-side navigation between `/` and `/privacy` requires either a full page reload (`<a href="/privacy">`) or a manual `window.history.pushState` + state-trigger. For a footer link, plain `<a href="/privacy">` is fine — page reload is acceptable for a once-in-a-blue-moon privacy view.

### Pattern 4: Iubenda standard embedding

**What:** Iubenda provides an anchor + a script. The script reads the anchor's href and replaces the anchor's contents with the rendered policy HTML.

**Source:** [VERIFIED: iubenda.com/en/help/216 + cookie-law-solution-codesnippets GitHub repo]

```tsx
// client/src/components/Privacy.tsx
import { useEffect } from 'react';

export default function Privacy() {
  useEffect(() => {
    // Iubenda's standard embedding: append the loader script once.
    // The anchor below will be transformed into the rendered policy.
    const existing = document.querySelector(
      'script[src="https://cdn.iubenda.com/iubenda.js"]'
    );
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://cdn.iubenda.com/iubenda.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div className="app-wrapper" style={{ paddingTop: 48 }}>
      <h1 className="app-title">Privacy Policy</h1>
      <div className="monolith-card" style={{ padding: 24 }}>
        <a
          href="https://www.iubenda.com/privacy-policy/YOUR_IUBENDA_POLICY_ID"
          className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe"
          title="Privacy Policy"
        >
          Privacy Policy
        </a>
      </div>
      <p style={{ marginTop: 24, textAlign: 'center' }}>
        <a href="/">← Back to Suno Playlist Downloader</a>
      </p>
    </div>
  );
}
```

The placeholder `YOUR_IUBENDA_POLICY_ID` is a numeric ID generated at iubenda.com when the policy is created (free tier).

### Pattern 5: Dual-file head sync (Vite source + deploy mirror)

**What:** Edit `client/index.html` first (Vite source), then **manually mirror the head changes** into `public/index.html` for immediate effect on Replit (without a fresh build).

**Verified:** Phase 9 RESEARCH §A3 + commit `336b11b` — `deploy.sh` runs `cp -r client/dist/* public/` which overwrites `public/index.html` from the build, so anything in `client/index.html` will eventually land in `public/index.html`. The "manual mirror" step is for immediacy, not survival.

### Anti-Patterns to Avoid

- **Editing `public/index.html` only and skipping `client/index.html`** — next `deploy.sh` run wipes the changes. Always edit both. (Phase 9 Pitfall 1.)
- **Adding `react-router-dom` for the `/privacy` route** — overkill for a 2-route SPA, pulls a 50 KB+ dep, no benefit. Use the path-based conditional instead.
- **Mounting two `<AdSlot>` components on the same page** — `atOptions` is a global; the second mount overwrites the first. Single instance only until iframe-srcDoc isolation is implemented. [CITED: joshwp.com Adsterra React guide]
- **Wrapping AdSlot in Mantine `<Card>`** — Card's elevated background/border conflicts with the iframe's transparent background. Use plain `<div>` with inline style + `var(--border-color)`. (Research §6.)
- **Running multiple display ad networks simultaneously** (e.g., Adsterra + Mediavine Journey) — violates Mediavine TOS exclusivity rule. Phase 10 keeps AdSense inert; OK. (Research §8 Pitfall 8.)
- **Anti-adblock detection scripts** — violates AdSense + Mediavine ToS, hurts UX. (Research §7.)
- **Inverting iframe creatives via CSS filters** — modern ad iframes use COEP/CORP; filters don't apply across the iframe boundary. (Research §8 Pitfall 4.)
- **Editing `server.js` to add a `/privacy` route** — unnecessary; the SPA catch-all already returns `index.html` for `/privacy`. (See Architectural Responsibility Map.)
- **Hardcoding `VITE_*` keys** in committed source — use `client/.env.example` placeholders + real values in gitignored `.env`. (Note: keys are not secrets, just tidiness.)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Privacy policy text | Hand-written legal copy | **Iubenda free tier** standard embedding | Sovrn ToS + future AdSense reapply require a real privacy policy. Iubenda generates GDPR/CCPA-compliant text that updates as laws change. (Research §7, §10.) |
| Affiliate link tagging on outbound links | Manual UTM params on every `<a href>` | **Sovrn Commerce** single script tag | 30K+ merchants pre-integrated. Zero per-link work. (Research §3.5, §7.) |
| Cookie consent banner / GDPR modal | Custom Mantine `<Modal>` triggered on first load | **Iubenda CMP free** (deferred until EU traffic >5% or AdSense reapply) | TCF v2.2 + Google Consent Mode v2 are non-trivial. Hand-rolled banners get rejected by ad networks. (Research §7, §10. Deferred this phase.) |
| Ad-blocker detection | JS to check `adsbygoogle` array length | **Nothing — let it fail silently** | Phase 4 D-09 already locked. Anti-adblock scripts violate AdSense + Mediavine ToS. (Research §7.) |
| ads.txt management | Per-deploy regenerated file or YAML→txt build step | Single `public/ads.txt`, hand-edited | Static text file. One source of truth at `public/ads.txt`. (Research §9.1, Findings §2.) |
| Dark-mode ad creative styling | CSS targeting iframe contents | **Wrapper styling only** (1px border, transparent bg, 12px radius) | Iframes are sandboxed cross-origin; CSS does not penetrate. Visual quarantine via wrapper is the industry pattern. (Research §8 Pitfall 4.) |
| RPM / earnings dashboard | Custom analytics stack | **Adsterra + Sovrn + Media.net native dashboards** | Each network ships a dashboard. (Research §7.) |
| Adsterra React npm wrapper | `adsterra-components` package | **Hand-write the 30-line useEffect (research §6)** | npm package is unmaintained (`0.1.1`, single contributor), adds a dependency for trivial code. |
| Iubenda React npm wrapper | `react-iubenda-policy` package | **Hand-write the 12-line component above** | Unmaintained since 2022. Component is trivially small. |
| Multi-route SPA routing | `react-router-dom` for two routes | **Path-based conditional in `App.tsx`** | 50 KB+ dep saved; zero benefit for 2 routes. |

**Key insight:** Every monetization concern in Phase 10 is solved by **one external script tag, one config key, or one free SaaS tier**. The temptation to "lightly hand-roll" any of (privacy text, link tagging, consent, ad-blocker detection, custom analytics) is exactly what trips small publishers up. Trust the script tags, trust the dashboards, ship and move on.

---

## Common Pitfalls

(Compiled from research §8, plus three new ones surfaced by the live-codebase audit.)

### Pitfall 1: ads.txt path confusion (`public/` vs `client/public/`)

**What goes wrong:** Plan tells the executor "edit `client/public/ads.txt`". File doesn't exist there. Executor creates a new file at that path. `deploy.sh` runs `cp -r client/dist/* public/`. The new `client/public/ads.txt` may or may not get copied (depends on Vite's `publicDir` config). Now there are two `ads.txt` files in the repo, one stale, one current; future edits land on the wrong one. Adsterra polls and sees yesterday's content.

**Why it happens:** CONTEXT.md's locked decision references `client/public/ads.txt` based on Vite default conventions. **The actual project history (Phase 9 commit `336b11b`) put `ads.txt` directly in `public/`** because `server.js` explicitly serves files from there.

**How to avoid:** **Edit `public/ads.txt` directly.** Audit before edit:
```bash
find . -name ads.txt -not -path "*/node_modules/*" -not -path "*/.git/*"
# Expected output: ./public/ads.txt   (one path)
```
If output shows two paths, delete the duplicate first.

**Warning signs:** ads.txt edits not reflected on `https://sunozip.com/ads.txt` 5 minutes after deploy. Check `git log --follow public/ads.txt` and confirm the recent commit modified the right file.

### Pitfall 2: CLS regression on first Lighthouse run after ad deploy

**What goes wrong:** Bottom banner pushes the footer down on first paint. CWV fails. SEO drops. Future Mediavine application rejected on CWV.

**Why:** Ad iframe loads async, expands its container after first paint.

**How to avoid:** Always set `min-height: <ad-height>px` on the wrapper. AdSlot does this via inline style.

**Warning signs:** Lighthouse CLS > 0.1. Visible jump when scrolling on first load.

**Verification:**
```bash
npx lighthouse https://sunozip.com --only-categories=performance --form-factor=mobile --output=html --output-path=./lh-report.html
# CLS must be < 0.1
```

### Pitfall 3: Adsterra default config enables popunder by default

**What goes wrong:** Sign up, paste snippet, walk away. Three days later, users complain about random new tabs. Mantine UX integrity tanks.

**Why:** The "verify your site" flow enables on-domain monetization across all formats by default unless explicitly disabled.

**How to avoid:** After site approval, immediately go to `Websites → [domain] → Settings → Ad formats` and disable everything except `Banner`. Verify by visiting the site in incognito and confirming no popunder fires.

**Warning signs:** Reports of unexpected tabs, full-page redirects, or overlay social-bar elements.

### Pitfall 4: Dark-mode ad creatives clash with Monolith palette

**What goes wrong:** Ads render in iframes with arbitrary advertiser-supplied creatives — mostly bright white or saturated. Against #0B0D1A background, contrast is jarring.

**How to avoid:** 16px transparent padding zone with `1px var(--border-color)` ring (research §6 wrapper). Don't try to invert iframe colors via CSS — modern ad iframes use COEP/CORP that defeat color-filter tricks.

### Pitfall 5: Ad-blocker breaks Vite dev server in unexpected ways

**What goes wrong:** uBlock Origin's filterlist matches some Adsterra domains and also matches Vite's module preload paths in dev. Result: dev server console errors that look like ad failures but are actually unrelated.

**How to avoid:** Test ad integration in production build only (`npm run build && npm run preview`), not dev. Dev mode is for app logic.

### Pitfall 6: Multi-instance AdSlot collision *(NEW — surfaced this research)*

**What goes wrong:** Future phase adds a second AdSlot (e.g., mobile-only 300x250). Both mount nearly simultaneously. First sets `atOptions` for 728x90, second overwrites with 300x250. Both invoke.js scripts run, both render the 300x250 (the last config), or one fails silently.

**Why:** `atOptions` is a global window property. React mounts in render order, but invoke.js reads the global once.

**How to avoid:** This phase ships exactly one AdSlot. **Add a JSDoc comment in `AdSlot.tsx` warning future contributors.** If multi-instance is ever needed, refactor to the `<iframe srcDoc>` isolation pattern (joshwp.com guide).

**Warning signs:** Two AdSlot mounts in the React tree, one of them rendering unexpectedly.

### Pitfall 7: SPA `/privacy` route returns 404 in some Replit edge configurations *(NEW — verified safe but plan should test)*

**What goes wrong:** Express's `app.get('*')` catch-all handler is placed after the static-file serving setup but only inside the `if (distPath)` block (server.js lines 116–124). If Express boots in API-only fallback mode (no `distPath` found), `/privacy` returns 404.

**How to avoid:** This is a non-issue in normal operation — `public/` exists, so the catch-all is registered. The plan should still include a curl test:
```bash
curl -s -o /dev/null -w "%{http_code}" https://sunozip.com/privacy
# Expected: 200 (returns index.html)
```

**Warning signs:** 404 on `/privacy` after deploy.

### Pitfall 8: Iubenda widget loads policy from iubenda.com, not sunozip.com *(NEW — page count nuance for AdSense reapply)*

**What goes wrong:** Plan assumes `/privacy` "counts as a content page" for AdSense reapply (research §10 requires 15+ pages). Google's reviewers may consider a page that's 95% iframed/embedded third-party content as **not original content**, defeating the page-count purpose.

**How to avoid:**
- Use Iubenda **standard embedding** (which injects HTML inline, not as an iframe — script-rendered HTML is part of the page DOM and crawlable).
- Add ~150 words of original site-specific copy above/around the embedded policy block (e.g., a "Why we collect what we collect" section that sunozip-specifically discusses Adsterra cookies, Sovrn link tracking, AdSense (when reapplied)).
- Ensure `<title>` is "Privacy Policy — Suno Playlist Downloader" (not Iubenda's default title).

**Verification:**
```bash
curl -s https://sunozip.com/privacy | grep -c "iubenda"
# Should match the embedded policy script tag, but the page should also have site-specific text.
```

**Warning signs:** Future AdSense reapply rejected with "low value content" despite shipping 15 pages.

---

## Code Examples

### Example 1: Final `public/ads.txt` content

```text
# Google AdSense — kept inert pending reapply (currently rejected, harmless)
google.com, pub-2601322490070593, DIRECT, f08c47fec0942fa0

# Adsterra — replace placeholders with values from Adsterra publisher dashboard (Account → ads.txt)
adsterra.com, YOUR_ADSTERRA_PUB_ID, DIRECT, YOUR_ADSTERRA_TAG_HASH

# Sovrn Commerce — replace publisher ID with value from platform.sovrn.com/advertising/ads-txt
# Sovrn typically requires BOTH lijit.com and sovrn.com lines — check the dashboard for exact lines
lijit.com, YOUR_SOVRN_PUB_ID, DIRECT, fafdf38b16bf6b2b
sovrn.com, YOUR_SOVRN_PUB_ID, DIRECT, fafdf38b16bf6b2b
```

[VERIFIED: knowledge.sovrn.com/kb/ads-txt-and-sovrn-ad-exchange — DIRECT/RESELLER distinction confirmed; example: `lijit.com, 263669, DIRECT, fafdf38b16bf6b2b`. The hash `fafdf38b16bf6b2b` is the Sovrn certification authority hash and is consistent across publishers; the publisher ID is per-account.] [CITED: research §9.1]

### Example 2: `client/index.html` head additions (mirror to `public/index.html`)

```html
<!-- AdSense (UNCHANGED — kept inert; will resume on reapply) -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2601322490070593"
     crossorigin="anonymous"></script>

<!-- Sovrn Commerce affiliate-link rewriter (NEW) — Phase 10 ADM-08 -->
<script async src="//ad.lijit.com/www/sovrn_signal/sovrn_signal.js?iid=YOUR_SOVRN_SITE_ID"></script>
```

**Note on Adsterra head injection:** Research §9.2 shows a head-level Adsterra invoke.js script tag. **DO NOT add this.** Adsterra's invoke.js requires `atOptions` to be set in the same scope; a head-level invoke runs before any per-component config exists, producing unpredictable behavior. The AdSlot component's `useEffect` injects invoke.js with `atOptions` already set. Keep the head clean. (See Findings §3.)

### Example 3: `client/.env.example` (committed)

```env
# Adsterra publisher dashboard → Websites → [your site] → Banner unit → Code
VITE_ADSTERRA_UNIT_KEY=replace-with-adsterra-banner-unit-key
# Adsterra publisher dashboard → Account → ads.txt
VITE_ADSTERRA_PUB_ID=replace-with-adsterra-publisher-id
VITE_ADSTERRA_TAG_HASH=replace-with-adsterra-cert-authority-hash
# Sovrn dashboard → platform.sovrn.com → Account → Site ID
VITE_SOVRN_SITE_ID=replace-with-sovrn-site-id
# Sovrn dashboard → platform.sovrn.com → Advertising → Ads.txt
VITE_SOVRN_PUB_ID=replace-with-sovrn-publisher-id
```

`client/.env` (gitignored — confirmed in `.gitignore` line 2: `.env`) — same keys with real values supplied by the user.

### Example 4: `App.tsx` patch (above existing footer, just before closing `</div>`)

```tsx
// At top of App.tsx, after existing imports:
import AdSlot from './components/AdSlot';
import Privacy from './components/Privacy';

// Inside App() function, FIRST line:
function App() {
  // Path-based route — no router needed for two routes (research §6, Findings §1)
  if (typeof window !== 'undefined' && window.location.pathname === '/privacy') {
    return <Privacy />;
  }
  // ...rest of existing App() body unchanged...
```

```tsx
// Inside the existing return JSX, immediately BEFORE the existing <footer>:
{/* Phase 10 Advertisement label — overrides Phase 4 D-13 per FTC/EU compliance */}
<div style={{
  textAlign: 'center',
  fontSize: 11,
  color: 'var(--text-muted)',
  marginTop: 32,
  marginBottom: -16,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
}}>
  Advertisement
</div>
<AdSlot
  adKey={import.meta.env.VITE_ADSTERRA_UNIT_KEY ?? ''}
  width={728}
  height={90}
/>

{/* Existing <footer> — UNCHANGED */}
<footer className="app-footer">
  <span>
    Based on <a href="..." target="_blank" rel="noopener noreferrer">DrummerSi's</a> original app
  </span>
  <a href="https://ko-fi.com/drummer_si" target="_blank" rel="noopener noreferrer">
    Support Original Author
  </a>
  {/* NEW — privacy footer link */}
  <a href="/privacy">Privacy Policy</a>
</footer>
```

### Example 5: `public/sitemap.xml` patch

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sunozip.com/</loc>
    <lastmod>2026-04-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://sunozip.com/privacy</loc>
    <lastmod>2026-04-27</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

### Example 6: `public/robots.txt` (audit — should already be correct)

Current contents (verified via `cat public/robots.txt`):
```text
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://sunozip.com/sitemap.xml
```

`/privacy` is **allowed** (covered by `Allow: /`). No edits needed.

### Example 7: `MEDIA-NET-SUBMISSION.md` template

```markdown
# Media.net Publisher Application — sunozip.com

**Submitted:** 2026-04-2X (fill on submission)
**Account email:** (the email used for the Media.net signup)
**Ticket ID:** (Media.net's confirmation number, displayed after submission)
**Status:** submitted | approved | rejected
**Decision date:** (fill on response)
**Notes:**
- Site URL submitted: https://sunozip.com
- Domain age at submission: ~13 days (registered 2026-04-14)
  - Likely too young — research §3.2 notes ~3-month-old domain expected
  - If rejected on domain-age, reapply 2026-07-14
- Privacy policy URL submitted: https://sunozip.com/privacy
- Traffic snapshot: (link to GSC or Replit analytics if available)
```

---

## State of the Art

| Old Approach | Current Approach (2026-Q2) | When Changed | Impact for Phase 10 |
|---|---|---|---|
| Apply for AdSense, get approved on minimal-content utility tools | Google rejects single-page utilities for "low value content" routinely | ~2023 onward | sunozip.com rejected; pivoting to Adsterra |
| Ezoic accepts everyone | Ezoic now requires 250K MAU; Incubator is 20 publishers/month globally | 2026-02-19 | Ezoic eliminated as small-publisher option |
| Mediavine Journey requires 10K sessions/mo | Lowered to 1K sessions/mo | 2026-01-15 | Mediavine Journey is now reachable as a growth-stage pick (not this phase) |
| Sovrn Commerce required heavy site verification | Approval in days; one script tag | 2024–2026 | Adopted in this phase as pair-with-display-ads |
| Iubenda free tier capped at 1K pageviews | Still 1K (verified 2026) | — | Adequate for sunozip.com current scale |
| Multi-network display ads OK | Mediavine TOS forbids running alongside Adsterra/AdSense | Mediavine policy ongoing | Phase 10 keeps AdSense inert + Adsterra active — OK because AdSense is not actually serving |
| `useState`/`useEffect` direct script injection for ad components | Same — but multi-instance requires `<iframe srcDoc>` isolation | 2024 (Adsterra + React patterns) | Phase 10 is single-instance, so direct injection is fine; flagged for future multi-instance |
| `react-helmet` for `<head>` management | Modern Vite/React 18 SPAs edit `index.html` directly | 2022 onward | Project already follows this pattern |

**Deprecated/outdated:**
- `react-helmet` for SPA head tags — Vite + index.html is the modern way. (Project already correct.)
- `CodeFund` (mentioned in research §4) — defunct since 2020, successor is EthicalAds.
- Cookie consent banners that use TCF v1 — TCF v2.2 + Google Consent Mode v2 is required for any IAB-compliant network.

---

## Runtime State Inventory

> Phase 10 is an **integration/additive** phase, not a rename or migration. This section is included for completeness but most categories are empty. Where applicable, the audit confirmed no runtime state needs migration.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — Adsterra/Sovrn/Iubenda store data in their own backends; sunozip.com has no DB | None |
| Live service config | **3 dashboards to configure**: (1) Adsterra publisher dashboard — disable popunder/social-bar/in-page-push (ADM-01), block low-quality categories. (2) Sovrn platform — verify ads.txt, configure outbound merchant categories. (3) Iubenda dashboard — generate policy, copy embed snippet/policy ID. | Manual user-action tasks per network. Plan must include explicit "user action" tasks for each. |
| OS-registered state | None — no Windows/macOS/Linux system services touched | None |
| Secrets / env vars | **5 new keys** in `client/.env`: `VITE_ADSTERRA_UNIT_KEY`, `VITE_ADSTERRA_PUB_ID`, `VITE_ADSTERRA_TAG_HASH`, `VITE_SOVRN_SITE_ID`, `VITE_SOVRN_PUB_ID`. Note: keys are **public** (visible in network tab), so this is tidiness not security. | Add to `client/.env` (gitignored) + commit `client/.env.example` with placeholders. |
| Build artifacts / installed packages | **No new npm installs.** The `client/dist/` cache may carry stale references from prior builds — but a fresh `npm run build` regenerates fully. | Run `cd client && rm -rf dist && npm run build` once after the AdSlot component is added, before deploy. |

**Net assessment:** The only true runtime state added by this phase is in third-party dashboards (Adsterra/Sovrn/Iubenda/Media.net) — managed via web UI, logged in `MEDIA-NET-SUBMISSION.md`. No DB migrations, no service restarts, no scheduler updates.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All build steps | ✓ | 20.x (per `.replit` + `package.json` engines >=16) | — |
| npm | Build (project uses npm, not yarn — per MEMORY.md) | ✓ | bundled with Node 20 | — |
| Vite | client build | ✓ | 8.0.8 | — |
| Mantine v6 | UI primitives (used elsewhere; not by AdSlot) | ✓ | 6.0.13 | — |
| `@mantine/hooks` (`useMediaQuery`) | If mobile AdSlot variant added (deferred) | ✓ | 6.0.13 | `window.matchMedia` |
| Express | `/ads.txt`, SPA fallback for `/privacy` | ✓ | 4.19.2 | — |
| Replit deployment with custom domain `sunozip.com` | All ad networks key off this | ✓ | — | — |
| Lighthouse | CLS verification | requires `npx lighthouse` (no install) | latest | Manual visual check + `web-vitals` CDN snippet |
| `curl` | ads.txt + /privacy verification | ✓ (macOS preinstalled, Replit shell available) | system | `wget` or browser DevTools Network tab |
| Adsterra publisher account | ADM-01, ADM-02, ADM-03 (provides keys) | ✗ — **user must register at adsterra.com/publishers** | — | None — phase blocks until account exists |
| Sovrn Commerce account | ADM-08 (provides site ID + ads.txt lines) | ✗ — **user must register at sovrn.com/commerce** | — | Skip Sovrn — Adsterra-only revenue (acceptable per research; lose ~10% potential affiliate revenue) |
| Iubenda free-tier account | ADM-06 (provides policy ID + embed snippet) | ✗ — **user must register at iubenda.com** | Free tier ≤1K pageviews | Hand-write `/privacy` content (NOT recommended — Iubenda is the standard; ~30 min effort for legal text) |
| Media.net publisher account submission | ADM-07 | ✗ — **user must submit at media.net** | — | Skip Media.net — Adsterra-only (acceptable; loses brand-safe demand source) |
| Existing AdSense account `ca-pub-2601322490070593` | Kept inert in head + ads.txt | ✓ — existing, in non-approved state | — | — |
| `react-router-dom` | NOT NEEDED — path-based conditional used | ✗ (intentional) | — | — (path conditional is the chosen path) |

**Missing dependencies with no fallback (BLOCKING):**
- **Adsterra publisher account** — user must create. Without it, ADM-01/02/03/04 cannot complete. Plan must surface this as a user-action prerequisite (Wave 0 blocking task).

**Missing dependencies with viable fallback:**
- Sovrn — fallback is no Sovrn (Adsterra-only). Phase still ships ADM-01..06, ADM-09; ADM-08 deferred.
- Iubenda — fallback is hand-written `/privacy` content. Acceptable for ADM-06.
- Media.net — fallback is no application (Adsterra-only). ADM-07 deferred.

**Recommended ordering for user-action tasks:**
1. Register Adsterra (5–10 min approval) — unblocks ADM-01..04.
2. Generate Iubenda policy (5 min) — unblocks ADM-06 (and Sovrn dependency).
3. Register Sovrn Commerce — unblocks ADM-08 (independent of display ads).
4. Submit Media.net application — unblocks ADM-07.

---

## Validation Architecture

> `workflow.nyquist_validation: true` in `.planning/config.json` (verified). This section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | **None — manual + Lighthouse + curl + dashboard verification.** Project has no Jest/Vitest/Playwright/Testing-Library. |
| Config file | none |
| Quick run command | `cd client && npm run build && npm run preview` then open `http://localhost:4173` |
| Full suite command | `npx lighthouse https://sunozip.com --form-factor=mobile --view` + `curl https://sunozip.com/ads.txt` + visual incognito check |

**Why no automated tests:** This is consistent with project precedent — Phase 4 (AdSense), Phase 7 (donation modal), Phase 9 (SEO) all used manual + Lighthouse verification. Adding a test framework now would expand scope beyond Phase 10 and is explicitly out of scope per CLAUDE.md "Visual modernization only" framing.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| **ADM-01** | Adsterra dashboard shows only `Banner` enabled (popunder/social-bar/in-page-push DISABLED) | manual human (dashboard screenshot) | n/a | ❌ User action — log screenshot in commit message or `MEDIA-NET-SUBMISSION.md` adjacent file |
| **ADM-02** | AdSlot renders banner with CLS <0.1 | automated + manual | `npx lighthouse https://sunozip.com --only-categories=performance --form-factor=mobile` | ❌ Wave 0 — `client/src/components/AdSlot.tsx` |
| **ADM-02** | AdSlot reserves min-height before iframe paints | automated | `curl -s https://sunozip.com/ \| grep -E 'min-height.*90'` (after build, the inline style is in the bundled JS — grep `min-height` in `dist/assets/index-*.js`) | ❌ Wave 0 |
| **ADM-03** | `public/ads.txt` contains all three networks | automated | `curl -s https://sunozip.com/ads.txt \| grep -E '(adsterra\\|google\\|lijit)'` — must match all three | ❌ Wave 0 — `public/ads.txt` patch |
| **ADM-03** | ads.txt is the only one in repo (no duplicate) | automated | `find . -name ads.txt -not -path "*/node_modules/*" -not -path "*/.git/*"` — must return exactly one path | ✓ verified now |
| **ADM-04** | Adsterra invoke.js loads with no CSP/CORS error | manual human (browser DevTools Network tab) | n/a | ❌ Wave 0 |
| **ADM-04** | server.js still has no Helmet middleware | automated | `grep -c "helmet" server.js` — must return 0 | ✓ |
| **ADM-05** | Banner appears above footer with "Advertisement" label | manual visual | open `https://sunozip.com` in incognito | ❌ Wave 0 — `App.tsx` patch |
| **ADM-06** | `/privacy` returns 200 and renders Iubenda policy | automated + manual | `curl -s -o /dev/null -w "%{http_code}" https://sunozip.com/privacy` (200) + visual check | ❌ Wave 0 — `Privacy.tsx`, `App.tsx` route conditional |
| **ADM-06** | `/privacy` is in sitemap.xml | automated | `curl -s https://sunozip.com/sitemap.xml \| grep "/privacy"` | ❌ Wave 0 — `public/sitemap.xml` patch |
| **ADM-06** | robots.txt does not disallow `/privacy` | automated | `curl -s https://sunozip.com/robots.txt \| grep -v "Disallow.*privacy"` (negative match) | ✓ already correct |
| **ADM-07** | Media.net submission logged | manual artifact | `cat .planning/phases/10-.../MEDIA-NET-SUBMISSION.md` | ❌ Wave 0 |
| **ADM-08** | Sovrn script loads | manual human (browser DevTools Network) — `sovrn_signal.js` request appears | n/a | ❌ Wave 0 — `client/index.html` + `public/index.html` head patch |
| **ADM-08** | Sovrn ads.txt entry present | automated | `curl -s https://sunozip.com/ads.txt \| grep lijit` | ❌ Wave 0 |
| **ADM-09** | Golden-path download flow works after deploy | manual human UAT | paste playlist URL → fetch → click "Download as ZIP" → confirm ZIP downloads with embedded ID3 tags | n/a |
| **ADM-09** | No console errors on production load | manual human (browser DevTools Console) | n/a | n/a |
| **ADM-09** | No popunder fires in incognito | manual human | open `https://sunozip.com` in incognito Chrome, interact for 60 seconds | n/a |
| **ADM-09** | Theme toggle still works | manual human | click theme toggle, confirm dark↔light transition | n/a |
| **ADM-09** | Settings persistence still works (donation modal counter) | manual human | click "Download as ZIP" twice, confirm modal triggers per Phase 7 logic | n/a |

### Sampling Rate

- **Per task commit:** `cd client && npm run build` (must succeed); `npm run preview` smoke check (visual confirmation slot renders).
- **Per wave merge:** `npm run build` + `deploy.sh` to staging-equivalent + curl checks (ads.txt, /privacy, sitemap).
- **Phase gate:** Full UAT manual run + Lighthouse CLS check + Adsterra dashboard "Approved" status.

### Wave 0 Gaps

- [ ] `client/src/components/AdSlot.tsx` — covers ADM-02 (new file)
- [ ] `client/src/components/Privacy.tsx` — covers ADM-06 (new file)
- [ ] `client/src/App.tsx` — patch: add path-based `/privacy` conditional, AdSlot above footer, Advertisement label, footer Privacy link (covers ADM-05, ADM-06)
- [ ] `client/index.html` — patch: add Sovrn `<script>` in `<head>` (covers ADM-08)
- [ ] `public/index.html` — mirror of `client/index.html` head changes (covers ADM-04, ADM-08 deploy survival)
- [ ] `public/ads.txt` — patch: append Adsterra + Sovrn lines (covers ADM-03)
- [ ] `public/sitemap.xml` — patch: append `/privacy` URL (covers ADM-06)
- [ ] `client/.env.example` — new file with placeholders (build hygiene)
- [ ] `client/.env` — new gitignored file with real values (user-supplied)
- [ ] `.planning/phases/10-.../MEDIA-NET-SUBMISSION.md` — covers ADM-07
- [ ] User actions: register Adsterra, register Sovrn, generate Iubenda policy, submit Media.net (Wave 0 prerequisite)

**No test framework install needed** — validation is manual + Lighthouse + curl, consistent with Phase 4/7/9 precedent.

---

## Security Domain

> `security_enforcement` is absent from `.planning/config.json` — treated as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth in this phase |
| V3 Session Management | no | Existing session middleware unchanged |
| V4 Access Control | no | All new content is public |
| V5 Input Validation | no | Adsterra unit key from env var, never user input |
| V6 Cryptography | no | — |
| V14 Configuration | yes | Confirm CSP remains permissive (no Helmet); env-var keys flow through `import.meta.env` only |

### Known Threat Patterns for sunozip.com + ad scripts

| Pattern | STRIDE | Standard Mitigation |
|---|---|---|
| Malicious iframe in ad creative | Tampering | Sandboxed cross-origin iframe (browser default). Block sketchy categories in Adsterra dashboard (60-second checkbox: adult, gambling, fake-AV, crypto-scam). |
| Compromised CDN serving Sovrn/Adsterra/Iubenda script | Tampering / EoP | SRI is impractical (rotating ad-script hashes). Mitigation: trust the network, avoid known-bad networks (no PropellerAds; research §4). |
| Tracking-cookie injection from ad networks | Information Disclosure | Iubenda CMP + Google Consent Mode v2 (deferred — gated on EU traffic >5%). For now, accept default browser cookie settings; Adsterra and Sovrn manage their own consent strings. |
| ads.txt forgery / typo squatting | Tampering | Use the exact publisher ID copied from each network's dashboard. Verify with `https://sunozip.com/ads.txt` and the network's own validator. |
| Click-fraud reflexive on the publisher | Repudiation | Don't click your own ads (terminates account). User-education note in the Adsterra/Sovrn account-setup steps. |
| Env-var leak via committed `.env` | Information Disclosure | `.env` is gitignored (verified `.gitignore` line 2). `client/.env.example` only contains placeholders. |
| `/privacy` injection via Iubenda widget compromise | Tampering | Low risk — Iubenda is a top-10 CMP. Mitigation: if `cdn.iubenda.com` is ever compromised, the widget would render attacker content; revert to hand-written privacy text. |

### Project Security Posture (Phase 10 inherits)

- No CSP headers — `server.js` has no Helmet middleware. **Do not add Helmet in this phase** — it would block third-party scripts and break Adsterra/Sovrn/Iubenda. (Adding CSP is a separate hardening phase if ever needed.)
- CORS: limited to `localhost:5173` and `localhost:3000` for dev (`server.js` lines 28–32). Production sunozip.com is same-origin.
- No XSS surface added — AdSlot renders advertiser content inside a sandboxed iframe; React escapes all interpolated strings.

**Net assessment:** Threat surface is moderate but well-understood. The single hard rule from research §4: **avoid networks tied to malware operations (PropellerAds — already excluded).** Banner-only Adsterra has acceptable risk profile when categories are filtered.

---

## Findings (codebase audit, this RESEARCH session)

### Finding §1: Project has no React Router and no test framework

**Verified:**
- `grep -rn "react-router" client/src/` → 0 matches
- `grep -rn "BrowserRouter\|useNavigate\|useLocation" client/src/` → 0 matches
- `client/package.json` `dependencies` does not contain `react-router-dom`
- `client/package.json` `devDependencies` does not contain `jest`, `vitest`, `@testing-library`, `playwright`

**Implication for plan:**
- `/privacy` route uses path-based conditional in `App.tsx` (Pattern 3 above). NO router install.
- All Phase 10 verification is manual + Lighthouse + curl. Consistent with Phase 4/7/9 precedent.

### Finding §2: Canonical `ads.txt` is `public/ads.txt`, NOT `client/public/ads.txt`

**Verified:**
- `find . -name ads.txt -not -path "*/node_modules/*" -not -path "*/.git/*"` → `./public/ads.txt` (one path)
- `client/public/` contains only `assets/` — no `ads.txt`
- `server.js` lines 100–110 explicitly route `/ads.txt` via `app.get()` from `staticPath` which resolves to `public/`
- Phase 9 commit `336b11b` ("fix(server): add explicit routes for ads.txt, robots.txt, sitemap.xml") confirms `public/` is the canonical location and the routes were added explicitly because the SPA catch-all was intercepting them
- Current contents (verified): `google.com, pub-2601322490070593, DIRECT, f08c47fec0942fa0`

**Implication for plan:**
- CONTEXT.md's locked decision references `client/public/ads.txt` — **the planner should treat this as a correctable error and edit `public/ads.txt` directly**. Document the deviation in the plan with a one-line note: "RESEARCH §2 corrects CONTEXT path."
- The audit step (`find . -name ads.txt`) is still required pre-edit.
- Vite has no `publicDir` override (default is `<root>/public` which would be `client/public`), so anything Vite-built into `client/public/ads.txt` would land in `client/dist/ads.txt` and then `cp -r client/dist/* public/` would copy it. But since no `client/public/ads.txt` exists, nothing collides — `public/ads.txt` survives.

### Finding §3: Adsterra invoke.js must NOT be in `<head>` — only inside the AdSlot component

**Verified:**
- WebFetch of `joshwp.com/how-to-implement-adsterra-ads-in-react-js-next-js-projects/` confirms `atOptions` is a global; head-level invoke runs before `atOptions` is set, producing undefined behavior.
- Research §9.2 shows a head-level Adsterra script tag in its example. **This is misleading.** The same research file's §6 (the AdSlot component) shows the correct pattern: `atOptions` set inside `useEffect`, then invoke.js appended.

**Implication for plan:**
- `client/index.html` and `public/index.html` head additions for Phase 10 should contain ONLY:
  - (existing) AdSense adsbygoogle.js — unchanged
  - (new) Sovrn `sovrn_signal.js` — head-level OK (it's a global link rewriter, not a per-slot loader)
- Adsterra invoke.js is injected inside `AdSlot.tsx` only.
- Iubenda `iubenda.js` is injected inside `Privacy.tsx` only (not in head — only loads on `/privacy` view).

### Finding §4: Sovrn ads.txt format requires both `lijit.com` and `sovrn.com` lines per dashboard

**Verified:**
- WebFetch of `knowledge.sovrn.com/kb/ads-txt-and-sovrn-ad-exchange` confirms the canonical format: `lijit.com, [pub-id], DIRECT, fafdf38b16bf6b2b` and a paired `sovrn.com, [pub-id], DIRECT, fafdf38b16bf6b2b`.
- The hash `fafdf38b16bf6b2b` is the Sovrn certification authority hash, consistent across publishers.
- The publisher ID is per-account (e.g., the public example shows `263669`).
- Per Sovrn KB: "the best way to receive the appropriate and most up to date Sovrn ads.txt information is to reach out directly to a Sovrn representative" — the dashboard provides exact lines.

**Implication for plan:**
- `public/ads.txt` should include BOTH `lijit.com` and `sovrn.com` lines. CONTEXT.md only has the `lijit.com` line.
- Plan task: copy ads.txt lines from Sovrn dashboard verbatim (could be 1–4 lines depending on Sovrn product mix).

### Finding §5: server.js has no CSP/Helmet — third-party scripts load freely

**Verified:**
- `grep -n "helmet\|Content-Security-Policy" server.js` → 0 matches
- All middleware visible in `server.js` lines 21–47: `morgan`, `cors`, `express.json`, `express.urlencoded`, `session`. No CSP.
- CORS allows only `localhost:5173` and `localhost:3000` — these are dev origins; in production same-origin requests are unaffected, and `<script src="//www.highperformanceformat.com/...">` is not a CORS request anyway (it's a script-tag include, which is exempt from CORS).

**Implication for plan:**
- ADM-04 (no CSP/CORS regressions) is a no-op verification — there's nothing to break. The verification command `grep -c "helmet" server.js` returning `0` is the affirmative test.

### Finding §6: Phase 4 D-13 "no label" is explicitly OVERRIDDEN by Phase 10

**Verified:**
- Phase 4 `04-CONTEXT.md` decision D-13: "No 'Advertisement' label — Google Auto Ads handles its own labeling per AdSense policies."
- Phase 4 `04-VERIFICATION.md`: confirms no label was added.
- Phase 10 CONTEXT.md `<decisions>` section: "'Advertisement' label rendered in 11px var(--text-muted)... This overrides the Phase 4 D-13 'no label' decision because Adsterra EU traffic policy + FTC require disclosure."

**Implication for plan:**
- The label is REQUIRED in Phase 10 — this is not contradictory, it's a deliberate override because Adsterra (unlike AdSense) does not handle its own labeling.
- The plan should call this out as a deliberate override, not silently change behavior.

### Finding §7: REQUIREMENTS.md does NOT contain ADM-* IDs yet

**Verified:**
- `grep -n "ADM-" .planning/REQUIREMENTS.md` → 0 matches
- ADM-01..09 are defined ONLY in `.planning/ROADMAP.md` Phase 10 section (lines 158–200)

**Implication for plan:**
- Plan should include a task to **backfill ADM-01..09 into REQUIREMENTS.md** (under a new `### Ads & Monetization v2` subsection) and into the Traceability table at the end of REQUIREMENTS.md.
- This keeps the project's standing convention (every ID-prefixed requirement is also tracked in REQUIREMENTS.md) intact.

### Finding §8: Project uses npm, not yarn — research/CONTEXT references should be substituted

**Verified:**
- `package-lock.json` exists at root; no `yarn.lock`
- `client/package.json` scripts use `vite` directly (not `yarn vite`)
- MEMORY.md `feedback_no_yarn` explicitly notes "Project uses npm, not yarn"

**Implication for plan:**
- All commands in plan tasks should use `npm run build`, `npm run preview`, NOT `yarn build`, `yarn preview`.
- Inside `client/` directory: `npm run build` (or `cd client && npm run build` from root).

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | Adsterra `<iframe srcDoc>` isolation pattern is required only for multi-instance; single-instance direct `useEffect` injection is safe | Pattern 1, Pitfall 6 | LOW — verified at joshwp.com; sunozip.com has exactly one slot. If Adsterra changes invoke.js semantics in a future version, swap to srcDoc. |
| A2 | Sovrn dashboard provides 1–4 ads.txt lines (typically `lijit.com` + `sovrn.com` pair) | Finding §4, Example 1 | LOW — confirmed by Sovrn KB. If the dashboard provides more lines, copy them all verbatim. |
| A3 | Iubenda standard embedding script + ~150 words of original site-specific copy makes `/privacy` count as "original content" for AdSense reapply | Pitfall 8 | MEDIUM — Google's "original content" threshold is opaque. Mitigation surfaced (add original copy), but absolute confirmation requires actual reapply outcome (deferred to 2026-Q4). |
| A4 | Path-based conditional render in `App.tsx` is sufficient for `/privacy` SEO indexing | Pattern 3, Architectural Responsibility Map | LOW — Express's SPA catch-all returns `index.html` for `/privacy`, React renders Privacy. Googlebot has executed JS since 2019. Confirmed working pattern for many SPAs. |
| A5 | The current ads.txt contents (verified `google.com, pub-2601322490070593, DIRECT, f08c47fec0942fa0`) is the AdSense entry for the rejected account, kept inert for reapply | Standard Stack, ADM-03 | NONE — verified by reading file. |
| A6 | Mobile traffic is <30% of sunozip.com sessions, justifying desktop-only 728x90 | Decision (research §9.6) | MEDIUM — no analytics installed (no GA4, no Plausible). Estimate is from research. If actual mobile share is higher, add a mobile 300x250 in a follow-up phase (deferred). |
| A7 | The deferred AdSense reapply window (2026-Q4) and the Mediavine Journey threshold (1K sessions/mo) are not gated by anything in Phase 10 | Deferred Ideas | NONE — phase 10 makes both options *more* available, not less. |
| A8 | Adsterra approval is reliably 5–10 minutes for sunozip.com | Phase Requirements ADM-01 | LOW — confirmed by Adsterra public docs and research. If approval takes >24h, the plan should not block; ADM-01 verification waits for approval. |

---

## Open Questions

1. **Will Sovrn approve a brand-new domain (sunozip.com, ~13 days old at submission) for Commerce?**
   - What we know: Sovrn Commerce has "no traffic minimum" and "approval in days" per research §3.5.
   - What's unclear: Whether they have an undocumented domain-age requirement.
   - Recommendation: Submit anyway. If rejected on domain age, the AdSense + Adsterra entries in ads.txt still work; just remove the Sovrn lines. ADM-08 deferred to a follow-up phase.

2. **Is "Privacy Policy" the correct footer link text, or should it be "Privacy & Cookies"?**
   - What we know: Sunozip.com does not yet have a cookie consent banner. Iubenda's free privacy policy covers data collection, not cookie consent.
   - What's unclear: Should the link foreshadow future cookie consent, or stay narrowly scoped now?
   - Recommendation: Use "Privacy Policy" now. When cookie consent is added (deferred), update to "Privacy & Cookies" or add a separate `/cookies` link.

3. **Should the `MEDIA-NET-SUBMISSION.md` artifact also track the Sovrn application separately?**
   - What we know: ADM-07 is specifically about Media.net.
   - What's unclear: Where Sovrn's application status lives.
   - Recommendation: Keep `MEDIA-NET-SUBMISSION.md` Media.net-specific (per ADM-07). Add a sibling `SOVRN-SUBMISSION.md` if Sovrn's application is non-trivial; or fold both into a single `EXTERNAL-APPLICATIONS-LOG.md` if the planner prefers consolidation.

4. **Should the AdSlot fail loudly (console.warn) when `VITE_ADSTERRA_UNIT_KEY` is empty, or fail silently?**
   - What we know: Empty key currently silently renders an empty placeholder (per the `if (!adKey) return;` guard in Pattern 1).
   - What's unclear: Whether contributors running locally without an Adsterra account benefit from a console warning.
   - Recommendation: Add a `console.warn('[AdSlot] VITE_ADSTERRA_UNIT_KEY not set — banner will not render');` once per mount when key is empty. Helps debugging without breaking dev.

---

## Sources

### Primary (HIGH confidence — official docs / verified codebase reads)

- **`.planning/research/ad-networks-vs-adsense.md`** — canonical research file (this phase's primary input). Sections cited: §1 ranked picks, §3.1 Adsterra deep dive, §3.2 Media.net, §3.5 Sovrn, §6 AdSlot.tsx full source, §7 Don't Hand-Roll, §8 Pitfalls, §9 code snippets, §10 reapply checklist, §13 open questions.
- **Project codebase** (read this session): `client/src/App.tsx`, `client/index.html`, `public/index.html`, `public/ads.txt`, `public/robots.txt`, `public/sitemap.xml`, `server.js`, `client/package.json`, `client/vite.config.ts`, `client/src/index.css`, `client/src/App.css`, `deploy.sh`, `build.sh`, `.gitignore`, `.planning/config.json`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`.
- **Phase 9 RESEARCH** (`.planning/phases/09-.../09-RESEARCH.md`) — confirms `deploy.sh` `cp -r` behavior preserves non-dist files in `public/`, validates dual-file head sync pattern.
- **Phase 4 CONTEXT + VERIFICATION** — confirms D-13 "no label" decision being overridden in this phase.
- **Sovrn Knowledge Base** — `https://knowledge.sovrn.com/kb/ads-txt-and-sovrn-ad-exchange` (WebFetch verified 2026-04-27): exact ads.txt format, DIRECT/RESELLER distinction, certification authority hash `fafdf38b16bf6b2b`.
- **Iubenda standard embedding** — `https://www.iubenda.com/en/help/216-privacy-policy-standard-embedding/` (WebSearch + GitHub repo `iubenda/cookie-law-solution-codesnippets` verified): script src `https://cdn.iubenda.com/iubenda.js`, anchor class pattern.

### Secondary (MEDIUM confidence — third-party guides cross-checked)

- **JoshWP Adsterra React/Next.js guide** — `https://joshwp.com/how-to-implement-adsterra-ads-in-react-js-next-js-projects/` (WebFetch verified 2026-04-27): confirmed multi-instance `atOptions` collision; recommended `<iframe srcDoc>` for multi-instance; single-instance `useEffect` is safe.
- **Adsterra Publishers Help Center** — `https://help-publishers.adsterra.com/en/articles/5213905` (cited from canonical research): banner config, mobile/desktop separation.
- **WebSearch results** for Adsterra invoke.js, Sovrn ads.txt, Iubenda embed — corroborated above primary sources.

### Tertiary (LOW confidence — carried from canonical research)

- RPM forecasts ($0.50–$3 Adsterra banner, $1–$5 Media.net, $5–$10 Mediavine Journey) — third-party reviews; real numbers visible only after 30 days running.
- Mobile traffic share assumption (~10% of utility-tool traffic) — research §9.6, no analytics installed to verify.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every library verified in `client/package.json`; no new installs; AdSense/Sovrn/Adsterra/Iubenda verified via WebFetch
- Architecture: HIGH — verified by reading `App.tsx`, `server.js`, `client/index.html`, `public/index.html`, `deploy.sh`
- Pitfalls: HIGH — 5 carried from canonical research (already verified) + 3 new ones surfaced this session (multi-instance, /privacy 404, Iubenda originality) and verified
- ads.txt format: HIGH — Sovrn KB WebFetch + canonical research cross-verified
- /privacy implementation choice: HIGH — verified zero router presence in codebase; path-conditional is the simplest approach
- RPM forecasts: LOW — carried, unverified

**Research date:** 2026-04-27
**Valid until:** 2026-07-27 (90 days — ad-network policies shift quickly; canonical research re-research triggers apply)

**Recommended re-research triggers:**
- Adsterra changes invoke.js semantics or atOptions interface
- Sovrn changes ads.txt requirements
- Iubenda changes embed script API
- Mediavine Journey threshold changes (currently 1K sessions/mo since 2026-01-15)
- AdSense announces utility-site policy update
- sunozip.com receives Media.net approval (would shift ads.txt + integration tasks to a follow-up phase)
