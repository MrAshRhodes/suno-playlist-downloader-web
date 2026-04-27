# Phase 10: Adsterra Monetisation (banner-only) + Media.net submission - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning
**Source:** PRD Express Path (extracted from `.planning/research/ad-networks-vs-adsense.md` + ROADMAP.md Phase 10 requirements)

<domain>
## Phase Boundary

Replace the rejected AdSense integration with a live, revenue-earning Adsterra banner on sunozip.com — within 1 day of merge.

**Delivers:**
- A reusable, CLS-safe `<AdSlot>` React component (Mantine v6 + CSS variables) rendering a single 728x90 Adsterra banner above the existing footer.
- `public/ads.txt` updated as a transitional dual-entry containing AdSense (kept inert for future reapply), Adsterra, and Sovrn Commerce publisher records — served at `https://sunozip.com/ads.txt`.
- Adsterra invoke script wired into `client/index.html` head and synced to `public/index.html`.
- Sovrn Commerce outbound-link rewriter installed (single script tag) for affiliate revenue independent of display ads.
- Privacy policy page generated via Iubenda free tier and routed at `/privacy` (required by Sovrn ToS + Media.net submission + future AdSense reapply).
- Media.net publisher application submitted (logged with date and ticket ID — application is non-blocking; plan completes when submission acknowledged).
- AdSense snippet retained dormant for documented reapply path (no removal).
- Ad styling matches the dark-neon Monolith aesthetic: 1px `var(--border-color)` ring, transparent background, 12px radius, 32px vertical margin.
- FTC-compliant subtle "Advertisement" label in 11px `var(--text-muted)` directly above the ad slot — minimal Monolith disruption, satisfies disclosure norms (overrides Phase 4 D-13's "no label" decision).

**Does NOT deliver:**
- Mobile 300x250 ad variant (deferred — desktop-only banner accepted per research §9.6 — 90% of utility-tool traffic is desktop).
- Cookie consent banner (deferred until EU traffic >5% or AdSense reapply per research §10).
- AdSense reapply itself (deferred to 2026-Q4 — gated on 15+ content pages per §10 checklist).
- Mediavine Journey integration (deferred until 1K sessions/month per §3.3 + §5 growth tier).
- Functional changes to download flow, settings, or any API. Visual/integration only.

</domain>

<decisions>
## Implementation Decisions

### Display network selection (LOCKED from research §1, §3.1)
- **Primary network:** Adsterra (banner-only configuration). Rationale: only mainstream network approving thin-content single-page utility sites today, 5–10 minute approval, no traffic minimums. (Research §3.1)
- **Secondary application:** Media.net submission filed in parallel as a higher-reputation backup demand source — non-blocking; plan completes when application acknowledged. (Research §3.2)
- **Affiliate layer:** Sovrn Commerce — installed today regardless of display network choice (single script, orthogonal to display ads, zero UX cost). (Research §3.5)
- **Endgame retained:** AdSense snippet stays dormant in `client/index.html` and `public/index.html` for future reapply (currently rejected, harmless). (Research §1, §10)
- **Explicitly forbidden formats:** popunder, direct link, social bar, in-page push must be DISABLED in the Adsterra dashboard immediately after site approval. ADM-01 requires this. (Research §3.1, Pitfall 7)

### `<AdSlot>` component contract (LOCKED from research §6 + ADM-02)
- New file: `client/src/components/AdSlot.tsx`. Functional component with hooks. Pattern: useEffect injects per-unit `atOptions` global + appends `<script src="//www.highperformanceformat.com/{adKey}/invoke.js" async>` into the slot's div via ref.
- Props: `{ adKey: string; width: number; height: number; className?: string }`.
- CRITICAL: wrapper `style={{ minHeight: height, width, margin: '32px auto', padding: 16, border: '1px solid var(--border-color)', borderRadius: 12, background: 'transparent' }}`. The `minHeight` reservation is mandatory for CLS <0.1.
- DO NOT use Mantine `<Card>` wrapper — Card's elevated styling fights iframe transparent background. Use plain `<div>` with inline style + CSS variables (matches Phase 1/3 component override convention).
- Border radius is **12px** (smaller than the 24px card radius — visually subordinate so the ad reads as a different class of element).

### Placement (LOCKED from ADM-05 + research §9.4)
- One slot only — directly above the existing `<footer>` in `client/src/App.tsx`.
- 728x90 leaderboard format (desktop-only — accepted compromise per research §9.6).
- "Advertisement" label rendered in 11px `var(--text-muted)`, centered, immediately above the AdSlot wrapper. This overrides the Phase 4 D-13 "no label" decision because Adsterra EU traffic policy + FTC require disclosure.
- Single ad unit only until 5K sessions/month — fill rate under 70% at low traffic punishes multi-slot layouts. (Research §6 "Key constraint")

### `ads.txt` (LOCKED from ADM-03 + research §9.1 + Phase 10 RESEARCH §A1)
- Single source of truth: `public/ads.txt` (repo root `public/`, NOT `client/public/`). Verified by `find . -name ads.txt` returning exactly one path: `./public/ads.txt`. Phase 9 commit 336b11b + `server.js` lines 100–110 add explicit route handlers (`app.get('/ads.txt', ...)`) that resolve from `public/ads.txt` directly. CONTEXT.md initial draft was wrong — corrected per research validation.
- Edit `public/ads.txt` directly. No Vite propagation involved for this file (the explicit Express route serves it).
- Audit before edit: `find . -name ads.txt -not -path "*/node_modules/*"` — must return exactly one path (`./public/ads.txt`). If a duplicate exists, delete it before editing. (Research Pitfall 1)
- Contents: AdSense entry (kept inert), Adsterra DIRECT entry, Sovrn `lijit.com` DIRECT entry, Sovrn `sovrn.com` DIRECT entry (Sovrn KB requires both lines). Comments allowed and encouraged for human readability.
- Verify served at `https://sunozip.com/ads.txt` after deploy. Adsterra polls hourly.

### Script injection sites (LOCKED from research §6 source-of-truth rule + §9.2 + Phase 10 RESEARCH §A3)
- Edit `client/index.html` first (Vite source).
- Sync identical head changes into `public/index.html` (deploy survives `deploy.sh cp -r client/dist/* public/`).
- Head script tags:
  1. AdSense (kept inert — already present, no change required).
  2. Sovrn Commerce signal: `<script async src="//ad.lijit.com/www/sovrn_signal/sovrn_signal.js?iid=YOUR_SOVRN_SITE_ID"></script>` — global outbound-link rewriter, head-level is correct.
- **Adsterra invoke does NOT go in `<head>`.** `atOptions` is a per-unit global; head injection runs before any per-component config exists, breaking the integration. Inject Adsterra invoke ONLY inside `AdSlot.tsx`'s `useEffect` (per research §6 component pattern). Phase 10 RESEARCH §A3 verified this against canonical research and JoshWP integration guide.
- Iubenda widget script is mounted ONLY on the `/privacy` route, not head — keeps cookies/tracking off the main download flow.

### Environment variables (LOCKED from research §9.5)
- `client/.env` (gitignored): `VITE_ADSTERRA_UNIT_KEY=...`, `VITE_SOVRN_SITE_ID=...`, `VITE_ADSTERRA_PUB_ID=...`, `VITE_SOVRN_PUB_ID=...`, `VITE_ADSTERRA_TAG_HASH=...`.
- `client/.env.example` (committed): same keys with placeholder values + comments pointing to dashboard locations.
- Vite exposes `VITE_*` to the client bundle. Adsterra unit keys are public anyway (visible in network tab). This is tidiness, not security.

### Privacy policy page (LOCKED from ADM-06 + research §10 + Phase 10 RESEARCH §A2)
- Generate via Iubenda free tier (≤1K pageviews tier — adequate for current traffic).
- Route at `/privacy`. **Implementation: path-based conditional render in `App.tsx`** (`if (window.location.pathname === '/privacy') return <Privacy />`). Phase 10 RESEARCH verified `react-router-dom` is absent from `client/package.json` and zero matches in `client/src/`. Path-conditional saves ~50KB dependency and matches the project's "no functional changes" framing.
- New file: `client/src/pages/Privacy.tsx` — renders the Iubenda embedded widget script + a Mantine container styled to match the Monolith dark theme.
- Iubenda standard embedding pattern (mount script + `<a class="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe">` link OR direct `<iframe>` for instant SEO indexing — RESEARCH recommends the embed div + script for SEO).
- Add a "Privacy Policy" footer link in `App.tsx` pointing to `/privacy`.

### Sitemap + robots.txt updates (LOCKED from ADM-06 + Phase 10 RESEARCH §A1)
- Sitemap path: verify whether the canonical sitemap lives at `public/sitemap.xml` (mirrors `public/ads.txt` route pattern) or `client/public/sitemap.xml`. Phase 9 created it; check `server.js` route handlers around lines 100–110 for the served path. Edit the canonical file only.
- Append `<url>` entry for `https://sunozip.com/privacy` with `<lastmod>` set to deploy date.
- Robots.txt path: same audit pattern — find the canonical file and verify `/privacy` is not disallowed. No changes expected unless a wildcard blocks it.

### Sovrn Commerce wiring (LOCKED from ADM-08 + research §3.5, §9.2 + Phase 10 RESEARCH validation)
- Install single Sovrn signal script tag in `<head>` (alongside the dormant AdSense snippet — Adsterra invoke does NOT live in head; see AdSlot decision).
- ads.txt entries: TWO lines required per Sovrn KB —
  - `lijit.com, YOUR_SOVRN_PUB_ID, DIRECT, fafdf38b16bf6b2b`
  - `sovrn.com, YOUR_SOVRN_PUB_ID, DIRECT, fafdf38b16bf6b2b`
- No application code changes required beyond the head script tag — Sovrn auto-rewrites outbound merchant links.
- Privacy policy page MUST exist before activating Sovrn (their ToS requires it). Plan task ordering reflects this.

### Media.net submission (LOCKED from ADM-07)
- Submit publisher application via the Media.net web form using sunozip.com.
- Log submission date + ticket ID to a new artifact: `.planning/phases/10-replace-adsense-with-adsterra-banner-and-media-net/MEDIA-NET-SUBMISSION.md`.
- Application is non-blocking — phase completes when submission is acknowledged. Approval (or rejection) is handled out-of-band; integration code (if approved) is a follow-up task tracked in the backlog.

### Functional regression guard (LOCKED from ADM-09)
- The plan must include a verification task that exercises the golden-path download flow (paste playlist URL → fetch songs → download ZIP) after deploy in a production build (`yarn build && yarn preview` or live sunozip.com). Confirms no script-tag injection regressed existing behavior.
- Lighthouse mobile run: CLS <0.1, no console errors from third-party scripts, no CSP violations. Verified per research Pitfall 2.

### Mantine + dark-mode visual integration (LOCKED from research §3, §6, Pitfall 4)
- Wrapper uses `1px solid var(--border-color)`, `background: transparent`, `border-radius: 12px`, padding 16px. This visually quarantines the ad so bright/saturated advertiser creatives read as "different element class" rather than failing to blend.
- Do NOT attempt to invert iframe creatives via CSS filters — modern ad iframes use COEP/CORP that defeat color-filter tricks.
- Mobile <768px: keep desktop-only ad. The 728x90 will overflow on phones — accepted per research §9.6. Optional `@media (max-width: 768px) { .app-ad-slot { margin: 24px auto; } }` allowed.

### CSS hook (Claude's Discretion → defer if not needed)
- An optional `.app-ad-slot` class in `client/src/App.css` for layout (display block, margin, max-width). Add only if AdSlot's inline styles are insufficient for centering/responsiveness. Skip otherwise — inline style is already complete.

### Deployment + verification flow (LOCKED from research §7, §8)
- Run `yarn build` in `client/`, then `deploy.sh` (which `cp -r client/dist/* public/` and other steps). Verify `public/ads.txt`, `public/index.html` head, and `public/privacy.html` (or React route bundle) propagate.
- Always test ad integration in `yarn preview` (production build), NOT `yarn dev`. Ad-blocker filter lists collide with Vite's module preload paths in dev mode — false negatives. (Research Pitfall 3)
- Post-deploy checks:
  1. `curl https://sunozip.com/ads.txt` returns the dual-entry file with all three networks.
  2. `curl https://sunozip.com/privacy` returns the Iubenda-embedded page.
  3. Visit `https://sunozip.com` in incognito; confirm no popunder, no full-page redirect, no social bar — banner only. (Research Pitfall 7)
  4. Lighthouse mobile: CLS <0.1; no script-injected violations.
  5. Adsterra dashboard: site verification status flips to "Approved" within 60 minutes of `ads.txt` propagation.

### Constraints retained from project (LOCKED)
- No functional changes to download flow, API endpoints, settings, or session management. Visual/integration only — confirmed by ADM-09 + project CLAUDE.md "Visual Modernization" framing.
- Mantine v6 — no upgrades.
- Replit deployment must continue working unchanged. `build.sh` and Vite config untouched.
- All modifications confined to `client/` directory + `client/public/` static assets + the existing `public/` deploy mirror that `deploy.sh` writes into.

### Claude's Discretion (implementation details NOT pinned by research/roadmap)
- Exact method to render the `/privacy` route. The project does not currently use React Router — pick the simplest pattern that works:
  - Option A: add `react-router-dom` (heavier, but standard).
  - Option B: conditional render in `App.tsx` based on `window.location.pathname` (lightweight, sufficient for two routes).
  - Recommendation: Option B unless the project already imports a router elsewhere. Audit `client/src/App.tsx` and `package.json` first.
- Privacy page implementation: embedded Iubenda JS widget vs hosted iframe vs static HTML page in `public/`. Pick whichever produces the cleanest visual integration with the Monolith dark theme; embedded widget on a dedicated React route preferred.
- File location for AdSense → Adsterra ads.txt audit script (if needed). Use `find` inline; no new tooling.
- Whether to hoist the AdSlot's hardcoded styles into a CSS module or keep inline. Inline preferred (matches research §6 example + project pattern); only switch to module if there are >2 distinct ad placements (there is exactly one, so inline wins).
- Whether to wrap `MEDIA-NET-SUBMISSION.md` in any standard frontmatter. Use simple markdown — date, ticket ID, screenshots if any, resolution status.
- Cleanup: leave the existing `client/public/assets/copy-playlist.png` deletion (already in git status as `D client/public/assets/copy-playlist.png`) untouched — unrelated to this phase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Primary research
- `.planning/research/ad-networks-vs-adsense.md` — full network comparison, code examples, pitfalls, reapply checklist (THE source of truth for this phase)
  - §1 Executive summary + ranked picks
  - §3.1 Adsterra deep dive (banner-only configuration steps)
  - §3.2 Media.net submission requirements
  - §3.5 Sovrn Commerce integration
  - §6 AdSlot.tsx full source + Mantine v6 + CSS-vars integration pattern
  - §7 Don't Hand-Roll table (Iubenda for privacy, Sovrn for affiliate, do not build custom)
  - §8 Common pitfalls (esp. Pitfall 1 ads.txt, Pitfall 2 CLS, Pitfall 7 Adsterra default formats)
  - §9 Copy-paste snippets for ads.txt, index.html, App.tsx patch, .env.example
  - §10 AdSense reapply checklist (informs why we keep snippet inert)
  - §13 Open questions answered (label = subtle "Advertisement" override of Phase 4 D-13)
  - §14 Environment availability table

### Project history
- `.planning/ROADMAP.md` Phase 10 section — source of ADM-01 through ADM-09 requirements + canonical phase goal
- `.planning/phases/04-add-google-ads-to-the-bottom-of-the-site/` — D-01..D-13 prior decisions, especially:
  - D-01: ad placement above footer
  - D-03: 32px vertical margin around ad
  - D-12: transparent ad background
  - D-13: "no label" decision — OVERRIDDEN this phase due to FTC/EU disclosure
- `.planning/phases/09-seo-improvements-and-domain-name-suggestions-to-increase-tra/` — Phase 9 sitemap.xml, robots.txt, ads.txt route confirmation:
  - Phase 9 RESEARCH §A3 — `deploy.sh cp -r client/dist/* public/` survival pattern
  - Phase 9 commit history confirms `https://sunozip.com/ads.txt` already serves AdSense entry
- `CLAUDE.md` — project constraints: Mantine v6 locked, Replit deployment, client-only changes, no functional regression
- `client/src/App.tsx` — existing structure (read before adding AdSlot above footer)
- `client/index.html` + `public/index.html` — existing AdSense script tag location (read before adding Adsterra/Sovrn invokes)
- `client/public/ads.txt` (or repo `public/ads.txt`) — current AdSense-only entry (audit canonical location before edit)
- `client/public/sitemap.xml`, `client/public/robots.txt` — Phase 9 outputs (extend; do not regenerate)
- `deploy.sh` and `build.sh` — confirm propagation flow before relying on it

</canonical_refs>

<specifics>
## Specific Ideas

- AdSlot signature exactly per research §6 — width, height, adKey, optional className.
- 728x90 banner format. 300x250 mobile variant deferred.
- ads.txt single-source-of-truth at `public/ads.txt` (verified by Phase 10 RESEARCH §A1 — explicit Express route in server.js).
- AdSense snippet preserved inert in head — comment-tagged for clarity.
- "Advertisement" label: 11px, `var(--text-muted)`, centered, directly above the slot.
- Iubenda free tier for privacy policy. Embedded widget on `/privacy` React route.
- Sovrn Commerce single script tag in head + ads.txt entry; auto-rewrites outbound merchant links.
- Media.net application submitted via web form; submission record at `.planning/phases/10-.../MEDIA-NET-SUBMISSION.md`.
- All network keys via `VITE_*` env vars in `client/.env` (gitignored) + `client/.env.example` committed with placeholders.
- Lighthouse CLS verification mandatory: `<0.1` on mobile.

</specifics>

<deferred>
## Deferred Ideas

- Mobile 300x250 ad variant (`useMediaQuery` toggle) — research §9.6. Add when mobile traffic >30%.
- Mediavine Journey migration — gated on 1K sessions/month (research §3.3, §5).
- AdSense reapplication — gated on 15+ content pages, 30-day post-rejection cooldown, target 2026-Q4 (research §10).
- Cookie consent banner / Iubenda CMP — gated on EU traffic >5% OR AdSense reapply trigger (research §10, §13.3).
- Plausible / GA4 analytics — currently no tracking; revisit when applying to Mediavine Journey (research §5 auxiliaries).
- AI-generated long-form content for AdSense reapply — separate content phase (research §10).
- Anti-adblock detection — explicitly forbidden (violates AdSense + Mediavine ToS, research §7).
- Multi-network simultaneous display ads — explicitly forbidden when Mediavine Journey activates (research Pitfall 8).
- Mobile-only AdSlot wrapper — defer until traffic data shows mobile share matters.

</deferred>

---

*Phase: 10-replace-adsense-with-adsterra-banner-and-media-net*
*Context gathered: 2026-04-27 via PRD Express Path (extracted from existing research file + roadmap requirements)*
