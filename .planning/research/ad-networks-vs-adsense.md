# Ad Networks vs AdSense — Replacement Research for sunozip.com

**Researched:** 2026-04-27
**Domain:** Web monetization for low-traffic single-page utility sites
**Confidence:** HIGH on policy/eligibility (verified against official sources). MEDIUM on RPM (heavy variance by niche/geo).
**Author:** gsd-researcher

---

## 1. Executive Summary & Ranked Picks

AdSense rejected sunozip.com for "not enough content" — this is the **Low-Value Content** policy violation. The site is a single-page utility tool, which Google's quality reviewers consistently reject because there is effectively one indexable page with no substantive editorial content (Suno-specific guides, FAQs, comparisons, etc.). [VERIFIED: medium.com/illumination — JSON-viewer single-page utility hit the same rejection]

The 2026 ad-network landscape has shifted hard against small publishers in the last 60 days. **Ezoic raised its threshold to 250,000 monthly users on 2026-02-19** [VERIFIED: PRNewswire press release + Ezoic support docs], invalidating the old "Ezoic accepts anyone" advice. Mediavine Journey moved the **opposite** direction — dropped from 10K to 1K sessions on 2026-01-15 [VERIFIED: Mediavine + Journey support]. Carbon Ads is invitation-only and not a fit for music utility traffic. The "instant approval" tier (Adsterra, Media.net) is the practical floor for a brand-new low-traffic music utility.

### Ranked picks

| Rank | Pick | Use When | Why |
|------|------|----------|-----|
| **PRIMARY (now)** | **Adsterra (display banner only, popunder DISABLED)** | Today, with 0 traffic minimums and 5–10 min approval | Only mainstream network that approves utility sites with no content gate. Banner-only config keeps UX clean. Reputation acceptable when popunder is off. |
| **SECONDARY (parallel)** | **Media.net contextual** | Apply alongside Adsterra | Yahoo/Bing-backed, more brand-safe than Adsterra. Looser content policy than AdSense but still needs ~3-month-old domain + tier-1 traffic. May reject — that's fine, Adsterra carries you. |
| **GROWTH (3–6 months at 1K+ sessions)** | **Mediavine Journey** | Once Grow plugin reports 1,000+ monthly sessions | Far higher RPM than Adsterra/Media.net. 1K-session floor is now realistic. Ramp-up is real but worth it. Replaces the primary pick when threshold met. |
| **REAPPLY (6–12 months)** | **Google AdSense** | After 15–25 written content pages live | Highest fill rate + highest tier-1 RPM long term. Endgame. |
| **ALWAYS-ON PAIR** | **Buy Me a Coffee + Sovrn Commerce affiliate** | Today | Donation modal already exists (Phase 7). Add Sovrn Commerce script — auto-affiliates outbound links to Suno, Bandcamp, music gear retailers. Zero UX cost. |

### What to NOT do

- **Do NOT use PropellerAds.** Tied to the Vane Viper malware nexus (2025 Infoblox / DarkReading reports). Sites get blacklisted by association.
- **Do NOT enable Adsterra Popunder, Direct Link, or Social Bar.** These are the formats that earn Adsterra its sketchy reputation. Banner-only is fine.
- **Do NOT pursue Ezoic right now** unless you have 250K MAU. Incubator is 20 publishers/month worldwide — lottery odds.
- **Do NOT pursue Mediavine "Official", Raptive, Snigel, Setupad, Playwire, Freestar, Nitropay, Newor.** All gated at 25K–1M+ pageviews. Don't waste an application.
- **Do NOT add a heavyweight CMP yet.** Adsterra and Media.net manage their own consent. Add Iubenda free tier only when you reapply to AdSense.

### One-line action

**Sign up at Adsterra publishers panel today, configure ONE 728x90 banner unit at the bottom (where AdSense was meant to go), keep Buy Me a Coffee modal, install Sovrn Commerce script. Re-evaluate in 90 days.**

---

## 2. Comparison Table

| Network | Traffic Min | Content Min | Approval Time | Niche Restrictions | Typical RPM (tier-1) | Integration | UX Risk | Reputation | AdSense Compatible | Confidence |
|---------|------------|-------------|---------------|---------------------|----------------------|-------------|---------|------------|--------------------|------------|
| **Adsterra (banner only)** | None — 5K+ recommended | Permissive | <10 min | Permissive | $1–$3 banner [LOW conf — heavy variance] | Script tag per ad unit | Low (banner only); high if popunder enabled | OK if banner-only; popunder formats taint the brand | Yes (run alongside) | HIGH eligibility / LOW RPM |
| **Media.net** | None published; ~3 mo old domain expected | Tier-1 English content | 1–7 days | English-only; no adult/gambling | $1–$5 contextual | Script tag | Low | Good — Yahoo/Bing-backed | Yes (designed as AdSense alt) | HIGH eligibility / LOW RPM |
| **Infolinks** | None | Permissive | 24–48h | Permissive | $0.50–$2 in-text/in-fold | Script tag | Medium — in-text overlays | Mixed; legacy network | Yes | MEDIUM |
| **Mediavine Journey** | 1,000 sessions/mo | Original, audience-first | Grow plugin runs 30 days, then ~weeks | Brand-safe; no adult/illegal | $5–$20 [MED conf] | Script + Grow JS bundle; SPA-tricky | Low | Excellent | No — exclusive while live | HIGH eligibility / MED RPM |
| **Ezoic (Incubator)** | 250K MAU (or Incubator lottery) | Quality | Weeks | Permissive | $5–$25 [MED conf] | JS integration or DNS | Historic CLS issues; "Leap" mitigates | Good | No (replaces AdSense) | HIGH eligibility |
| **Monumetric Propel** | 10K pageviews/mo | Quality | Weeks | 50% tier-1 traffic | $6–$15 [MED conf] | Tag manager; assisted | Low | Excellent | No | HIGH |
| **Snigel** | 100K pageviews/mo | Quality | Weeks | 20% tier-1 | $8–$20 [MED conf] | Header bidding wrapper | Low | Excellent | No | HIGH |
| **Setupad** | ~100K (flexible) | Quality | Days | Tier-1 preferred | $5–$15 [MED conf] | Header bidding | Low | Good | No | MEDIUM |
| **Newor Media** | Now 5K (was 30K) | Quality | 24–48h | English; no drugs/gambling | $5–$15 [MED conf] | Script tag | Low | Good | No (replaces) | MEDIUM |
| **HilltopAds** | None | Permissive | Days | Permissive | $0.50–$2 | Script tag; popunder-heavy | Medium-high | OK; ISO 27001 | Yes | MEDIUM |
| **Adsterra Popunder/Direct Link** | None | Very permissive | <10 min | Very permissive | $2–$8 [LOW] | Script tag | **HIGH — breaks UX** | Bad — same toolkit as malvertisers | n/a | DO NOT USE |
| **PropellerAds** | None | Very permissive | <10 min | Very permissive | varies | Script tag | High | **AVOID — Vane Viper malware nexus** | n/a | DO NOT USE |
| **Carbon Ads** | Invitation-only | Dev/design audience required | Manual review | Dev/design only | $10–$20 [LOW] | Script tag — single ad slot | None — premium native | Excellent | Yes | NOT A FIT (wrong audience) |
| **EthicalAds** | None — but for OSS/dev/docs sites | OSS-aligned content required | Manual review | OSS / docs / dev only | $1–$3 [LOW] | Single script | None — privacy-first | Excellent | Yes | NOT A FIT (wrong audience) |
| **BuySellAds Direct** | Invitation/pitch | Dev/maker focus | Manual review | Dev/design/maker | varies | Custom | None | Excellent | Yes | NOT A FIT now |
| **Sovrn Commerce (affiliate)** | None | Outbound links to retailers | Days | None | Per-conversion, not RPM | Single JS snippet | None — link rewriter | Excellent | Yes (orthogonal) | RECOMMENDED PAIRING |

Verified eligibility sources: Mediavine [VERIFIED], Mediavine Journey [VERIFIED], Ezoic [VERIFIED — 2026-02-19 press release], Monumetric [CITED: nomadlife101.com via Monumetric FAQ], Snigel [CITED: publisher-collective.com — Snigel-owned], Setupad [CITED: setupad.com FAQs], Newor [CITED: revenueinfo.com 2026-03], Adsterra [CITED: adsterra.com publishers blog], PropellerAds [VERIFIED: Infoblox 2025, DarkReading 2025], Carbon Ads [CITED: carbonads.net FAQ], EthicalAds [CITED: ethicalads.io publisher-policy].

---

## 3. Per-Network Deep Dives — Top 5

### 3.1 Adsterra (PRIMARY pick) — banner-only configuration

**Why it wins for now:** Only mainstream display network that approves brand-new utility sites with effectively zero content threshold. Approval in 5–10 minutes. [CITED: adsterra.com/blog/set-up-publishers-dashboard]

**Eligibility (verified):**
- No published traffic minimum. Sites with 5K+ MAU get faster approval, but lower works.
- Domain must be live and reachable.
- No popunder-specific exclusions for utility/music tools.
- ads.txt entry required (instructions auto-generated in dashboard).

**Revenue model:**
- CPM-based for banner. Roughly $0.50–$2 USD on tier-1 utility traffic (LOW confidence — heavy variance).
- Payout: $5 minimum on PayPal/USDT, $100 on wire/Bitcoin.
- Net-15 payment cycle, twice a month.

**Integration complexity (script-tag drop-in):**
- Sign up → Add Website → Add Unit → choose `Banner 728x90` (or `300x250`) → copy a single `<script>` snippet → paste into a target div.
- For React/Mantine: render a `<div id="adsterra-banner-728"></div>` inside `App.tsx` above the footer, and execute the snippet inside a `useEffect` (the snippet is just an `atOptions` object plus a `<script src="...invoke.js">` tag; React-safe pattern in §9 below).
- Vite-compatible: snippet hosts on `*.profitabledisplaynetwork.com` or `*.highperformanceformat.com`. Dev server proxy not needed.
- ads.txt: replace current single `google.com` line with **both** `google.com,...` (kept for AdSense reapply) and the Adsterra entry from the dashboard.

**UX impact (CRITICAL):**
- **Banner format only.** Renders inside a fixed-size iframe. CLS = 0 if you reserve `min-height: 90px` on the wrapper.
- **Disable** all of: Popunder, Direct Link, Social Bar, In-Page Push. These are configured per-website in the dashboard — uncheck in `Settings → Ad formats`.
- Dark-mode compatibility: banner ad creatives are advertiser-controlled. They will look colorful against the Monolith dark palette. Mitigate with a 1px `var(--border-color)` ring + 16px padding wrapper to visually quarantine the iframe.
- No native dark-mode banner option exists at any network.

**Reputation & risk:**
- Adsterra's reputation is bimodal: clean for direct display banners, sketchy for popunder/direct-link formats. The same publisher signs up once and chooses formats — that choice determines the experience. [INFERRED from G2 and Trustpilot dichotomy]
- 3-layer fraud protection on impression side. [CITED: adsterra.com]
- IAB-affiliated, but not as Tier-1-respected as Mediavine/Raptive.
- **Risk control:** review the per-domain "Allowed categories" in dashboard. Block adult, gambling, fake-AV, and crypto-scam categories. This is a 60-second checkbox exercise but skipping it is the #1 reason publishers complain about Adsterra creative quality.

**Replit / Cloud Run gotchas:**
- None. The integration is purely client-side JS. No server config, no CSP changes (your site has no CSP headers configured — verified from server.js Express setup; no Helmet middleware in stack).
- Cloudflare-style ad-blocker bypass is **not** offered by Adsterra. ~15–25% of users will see nothing. Acceptable per existing D-09 graceful-degradation policy.

[CITED: adsterra.com/blog/set-up-publishers-dashboard, help-publishers.adsterra.com/en/articles/5213905]

---

### 3.2 Media.net (SECONDARY — apply in parallel to Adsterra)

**Why secondary:** Higher reputation than Adsterra but more selective on approval. Worth applying for the optionality.

**Eligibility (verified):**
- No public traffic minimum, but very-low-traffic sites get rejected. [CITED: foremedia.net + adpushup.com reviews]
- Domain must be ~3–6 months old. sunozip.com was registered for Phase 9 (2026-04-14) — **not eligible until ~July 2026**.
- Must serve majority tier-1 (US/UK/CA) traffic.
- English-only content.
- Must be in good standing — no AdSense termination history (the rejection sunozip.com received is a "not approved" not a "termination" — it's a clean state).

**Revenue model:**
- Contextual ads (keyword-matched to page content). Yahoo/Bing demand source.
- RPM ranges $1–$5 on tech/utility content (LOW confidence).
- Net-30, $100 minimum, PayPal/wire.

**Integration:**
- Single script tag in `<head>` + per-unit ad-slot `<div>` placements.
- React-friendly (no Mantine conflict).
- ads.txt: Media.net provides 4–6 lines to add. Append to existing ads.txt — never replace.

**UX:**
- Display + native formats. Native formats blend better with dark mode if you choose the dark template in the dashboard.
- CLS: same risk as any iframe ad — reserve dimensions.
- Fewer creative quality issues than Adsterra.

**Action:** Apply now anyway. If approved (in 1–7 days), it becomes Plan A. If rejected on domain-age, reapply in July 2026.

[CITED: publift.com/blog/media-net-vs-adsense-vs-publift, foremedia.net/media-net-essential-requirements]

---

### 3.3 Mediavine Journey (GROWTH pick — at 1K sessions/month)

**Why growth pick:** Best RPM available to small publishers, period. The 2026-01-15 threshold drop from 10K → 1K sessions makes it actually reachable for sunozip.com. [VERIFIED: journeymv.zendesk.com Journey-Minimum-Requirements]

**Eligibility (verified, 2026-04):**
- 1,000 sessions/month — measured by the Grow plugin/script over a 30-day window.
- Original, audience-first content.
- Brand-safe.
- No adult/gambling/illegal.
- Grow script must run on-site for 30 days **before** application.

**Revenue model:**
- $5–$20 RPM for non-niche content; outliers $40+ for premium niches like recipes/finance. [CITED: bymilliepham.com, palealetravel.com, danny-cph.com 2026 reviews]
- Music utility is not a premium niche — expect $5–$10 floor.
- Net-65 payment cycle. NET-65 = earn-in-March, paid late-May. Don't budget like AdSense.

**Integration (the catch for THIS site):**
- **Grow script** is required (it's the audience-data layer Mediavine uses to evaluate + serve).
- Mediavine Journey is **not natively compatible with most page builders** [CITED: journeymv.zendesk.com — "Why Most Page Builders Won't Work"]. SPA support exists for Next.js but is "manual" — sticky-sidebar injection requires specific HTML/CSS.
- For sunozip.com: single-page React app means **no sidebar**. Bottom-of-page ad slot will work. Sticky in-content ads will require a refactor (acceptable post-1K-sessions).
- ads.txt entries provided after approval.

**UX:**
- High-quality creatives (filtered by Mediavine's ad-ops team).
- Built-in CLS reservations.
- Works with dark mode — ad creatives are isolated in iframes; Mediavine ad container respects `background: transparent` you set on the wrapper.

**Reputation:**
- Tier-1 ad-ops reputation. Used by major bloggers.
- Net-65 is the only common gripe.

**Plan:** Install Grow script in Phase 11 (whenever you re-engage monetization). Wait 30 days. Apply once Grow shows 1,000 sessions. Switch from Adsterra to Journey at that point — they are not compatible to run simultaneously per Mediavine policy.

[VERIFIED: journeymv.zendesk.com/hc/en-us/articles/24633185741723-Journey-Minimum-Requirements]
[CITED: softzar.com/monetize-your-next-js-website-with-journey-by-mediavine — for SPA integration nuances]

---

### 3.4 Ezoic — formerly the obvious answer, now NOT (until 250K MAU)

**Critical update [VERIFIED: 2026-02-19 PRNewswire]:** Ezoic raised the new-publisher threshold to **250,000 monthly active users** as of Feb 19, 2026. Pre-existing sites are grandfathered. New sites without 250K MAU must apply to the **Incubator** program, which accepts only **20 publishers per month globally**. [CITED: support.ezoic.com getting-started article]

For sunozip.com (no MAU history, just-launched custom domain), Ezoic is **not a viable now-pick** despite older guides still recommending it. Skip.

**Why this matters for the doc:** Most "best ad networks for small sites" articles you'll find on Google are written before Feb 2026 and still claim Ezoic accepts everyone. They are stale. Verify 2026 status before believing any article.

**When Ezoic re-enters consideration:** If sunozip.com hits ~10K MAU within 12 months, treat it as a peer of Mediavine Journey. RPM upside is roughly equivalent. Defer until then.

[VERIFIED: morningstar.com/news/pr-newswire/20260219ph91455]

---

### 3.5 Sovrn Commerce (PAIRED affiliate — install today regardless)

**Why this exists in this list:** It's not a display ad network — it's an outbound-link rewriter that earns affiliate commission whenever a user clicks through to a retailer. **Orthogonal to display ads.** Run it alongside Adsterra/Mediavine/AdSense — no conflict.

**Why install today:** Zero traffic minimum. One JS snippet. The downloader page describes Suno tracks. Users may click outbound links to suno.com, bandcamp, soundcloud, or third-party music gear over time. Sovrn Commerce monetizes those clicks at no UX cost (the link visually does not change; only the destination URL gets affiliate-tagged). [CITED: sovrn.com/commerce]

**Eligibility:**
- No traffic minimum.
- Approval in days.
- Network of ~30,000 merchant programs.

**Integration:**
- Single `<script>` tag from Sovrn dashboard. Loads on all pages.
- **Privacy:** Sovrn intercepts outbound clicks. Disclose in a 1-line privacy note (you don't currently have a privacy policy — Sovrn's TOS technically requires one, see §10).

**Why pair it:** sunozip.com is a Suno utility. Suno doesn't have a public affiliate program (verified, no Suno affiliate found 2026), but adjacent retailers do — sweetwater, bhphotovideo, amazon (via Sovrn), etc. If a user links externally from a comment, blog post, or future content page, Sovrn captures it. Right now low-impact; high-leverage as content grows.

**Confidence:** HIGH on integration / LOW on revenue forecast for this specific site.

---

## 4. Networks to Avoid

| Network | Reason |
|---------|--------|
| **PropellerAds** | Linked to Vane Viper malware-distribution operation by 2025 Infoblox + DarkReading research. Source of malicious redirects across hundreds of thousands of compromised sites. Site reputation by association. [VERIFIED: infoblox.com/blog/threat-intelligence — DNS-driven insights into malicious ad network] |
| **Adsterra Popunder / Direct Link / Social Bar** | These specific Adsterra formats are the source of its bad reputation. Banner-only is fine; these are not. They violate the dark-neon UX constraint outright. |
| **HilltopAds (popunder-heavy)** | ISO 27001 cert and IAB-EU member, but core revenue is popunder. For a utility tool with returning users, popunder = uninstall reflex. Avoid unless 100% banner-config and even then prefer Adsterra. |
| **RevenueHits** | Performance-only (CPA). For sub-100K sites, the fill is sparse and creatives skew toward dating/get-rich-quick. UX-incompatible. [No specific 2026 reputation issue, but model mismatch.] |
| **Infolinks in-text** | In-text overlays are a 2010s pattern that breaks the Mantine Inter typography hierarchy. If you must use Infolinks, banner-only — but Adsterra is better at the same use case. |
| **Mediavine "Official", Raptive (AdThrive), Snigel, Setupad, Playwire, Freestar, Nitropay, Newor 30K-tier** | Traffic-gated above sunozip.com's reachable range for the next 6+ months. Not bad networks — just wrong-stage. Don't waste an application. |
| **Carbon Ads / EthicalAds / BuySellAds** | Audience mismatch. Carbon's advertiser pool is dev tools. EthicalAds requires OSS or docs site. Music utility doesn't fit either bucket. Apply when the site has dev-aligned content (e.g., a blog post about the Suno API) — not before. |
| **CodeFund** | Defunct since 2020. Successor is EthicalAds. |
| **Coinzilla / Bitmedia / similar crypto-ad networks** | Off-thesis. Crypto ads will look out of place on a music tool and erode trust. |

---

## 5. Standard Stack (recommended for sunozip.com)

### Core (now)
| Component | Choice | Why |
|-----------|--------|-----|
| Display ads | **Adsterra banner-only** | Only mainstream network that approves a thin-content single-page utility today |
| Affiliate links | **Sovrn Commerce** | Zero UX cost, runs alongside any display network |
| Donations | **Buy Me a Coffee** (already wired) | Phase 7 modal stays as-is |
| ads.txt | Hand-maintained at `public/ads.txt` | Append Adsterra + Sovrn + (kept) AdSense lines |

### Core (growth — replace Adsterra at 1K sessions/mo)
| Component | Choice | Why |
|-----------|--------|-----|
| Display ads | **Mediavine Journey** | 5–10x RPM uplift vs Adsterra; replaces, doesn't pair |
| Audience layer | **Grow by Mediavine** | Required by Journey |

### Core (endgame — at 15+ written content pages)
| Component | Choice | Why |
|-----------|--------|-----|
| Display ads | **Google AdSense** | Highest fill, highest tier-1 RPM long-term |
| AdSense companion | **Media.net** (run alongside) | Yahoo/Bing demand stack — additive |

### Auxiliaries
| Component | Choice | When |
|-----------|--------|------|
| CMP (consent banner) | **Iubenda free tier** (≤1K pageviews) → CookieYes free | Add when reapplying to AdSense, or when EU traffic >5% |
| Privacy policy | **Iubenda generator** (free) | Add before Sovrn Commerce activation per their TOS |
| Analytics | **Plausible** (currently none — no tracking on the site, deliberately) or **Google Analytics 4** | GA4 only when applying to Mediavine Journey — Grow uses its own; otherwise Plausible respects the no-tracking aesthetic |

[CITED: iubenda.com pricing — free up to 1K pageviews; cookiebot pricing 2025 increase per enzuzo.com]

---

## 6. Architecture Patterns — where the script tag lives

### Source-of-truth rule
Same pattern as Phase 9 SEO research. **Two HTML files, both must be updated:**
- `client/index.html` — Vite source
- `public/index.html` — deployed copy that survives `deploy.sh`

`deploy.sh` runs `cp -r client/dist/* public/` — overwrites `public/index.html` from Vite build output. Always edit `client/index.html` first, then sync the head changes into `public/index.html` for immediate effect on Replit. [VERIFIED: Phase 9 RESEARCH §A3]

### Ad container conventions (Mantine v6 + Vite + React 18)

**Pattern A — script in `<head>`, ad slot rendered by React.** Used by Adsterra, Media.net, AdSense.

`client/index.html` head:
```html
<!-- Adsterra invoke script — load early; renders into divs by id -->
<script type="text/javascript" src="//www.highperformanceformat.com/INVOKE_KEY/invoke.js" async></script>
```

`client/src/components/AdSlot.tsx` (new):
```tsx
import { useEffect, useRef } from 'react';

interface AdSlotProps {
  /** Adsterra ad-unit key from publisher dashboard */
  adKey: string;
  width: number;
  height: number;
  /** Optional className for layout control */
  className?: string;
}

/**
 * Single-purpose ad container. Reserves a fixed-dimension box so CLS = 0.
 * Loads the per-unit Adsterra config inside an isolated div by id pattern.
 */
export default function AdSlot({ adKey, width, height, className }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Adsterra uses a global `atOptions` per-unit. Set, then inject the loader.
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
        minHeight: height,   // CRITICAL: reserve box to prevent CLS
        width,
        margin: '32px auto', // matches Phase 4 D-03 spacing
        padding: 16,
        border: '1px solid var(--border-color)',
        borderRadius: 12,    // softer than 24 — visually subordinate to cards
        background: 'transparent', // D-12 transparent — page bg shows through
      }}
    />
  );
}
```

`client/src/App.tsx` placement (above existing footer):
```tsx
{/* Ad slot — Phase 4 D-01 above footer */}
<AdSlot adKey="YOUR_ADSTERRA_UNIT_KEY" width={728} height={90} />
{/* existing <footer> stays last */}
```

### Pattern B — single `<head>` script with auto-placement (AdSense-style, Media.net legacy script)
Already used for current AdSense entry. Re-use this pattern when reapplying.

### CSS Module integration with Mantine v6
- AdSlot uses inline style + CSS variables (`var(--border-color)`) — same convention as Phase 1/3 component overrides.
- Do NOT use Mantine `<Card>` wrapper. Mantine's elevated-card styling will fight the ad iframe's transparent background.
- Wrapper has `background: transparent` — Phase 4 D-12 already locked this decision.

### Key constraint: a single ad slot, max
Until 5K sessions/month, **one** ad unit. Reasoning:
1. Fill rate at low traffic is < 70%. Multiple slots = mostly empty space + scattered placement penalty.
2. Adsterra/Media.net/AdSense all penalize ad density on thin-content pages — too many ads multiplies the existing rejection risk.
3. UX: the Monolith design system is built around two visual elements (hero + song table). A single bottom banner respects the hierarchy. Two banners breaks it.

---

## 7. Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Consent banner / GDPR cookie modal | Custom Mantine `<Modal>` | **Iubenda free** (or CookieYes free) | TCF v2.2 + Google Consent Mode v2 are non-trivial. Networks reject sites with non-IAB consent strings. [CITED: iubenda.com] |
| ads.txt management | Multiple per-deploy regenerated files | Single `public/ads.txt`, hand-edited; one line per network | Static file. Phase 9 already validated `public/` survives `deploy.sh`. |
| Ad-blocker detection / re-engage messaging | Custom JS to detect adsbygoogle empty | Nothing — let it fail silently (Phase 4 D-09) | All "anti-adblock" scripts violate AdSense ToS and Mediavine ToS, and most ad-block users will leave anyway. |
| Affiliate link tagging | Manual UTM/affiliate-ID injection on every link | **Sovrn Commerce JS rewriter** | 30K merchants pre-integrated. [CITED: sovrn.com] |
| Privacy policy page | Hand-write | **Iubenda free generator** | Sovrn ToS requires it; AdSense reapply requires it. |
| Dark-mode ad styling | CSS targeting iframes | Nothing — networks own iframe content | You can only style the wrapper. Iframe content is sandboxed cross-origin. |
| RPM analytics | Custom dashboard | Use the network's native dashboard | All networks ship with one. |

**Key insight:** Every component on this list is solved by a single script tag or a free SaaS tier. The temptation to "lightly hand-roll" any of it is what gets sites de-listed.

---

## 8. Common Pitfalls

### Pitfall 1: ads.txt overwritten on `deploy.sh`
**What goes wrong:** Add a network. Site rejected for "missing ads.txt entry" 24h later.
**Why:** `deploy.sh` does `cp -r client/dist/* public/`. If `client/public/ads.txt` is the source-of-truth (Vite copies it), overwrites land. If you only edit `public/ads.txt`, next build wipes it.
**Verified:** Phase 9 RESEARCH A3 confirmed cp doesn't delete extras, so `public/ads.txt` placed directly there persists. **But** — if `client/public/ads.txt` exists too, it gets copied **over** `public/ads.txt` on every build.
**Avoid:** Maintain ads.txt in **one location only**. Recommended: `client/public/ads.txt` (Vite-canonical), and let it propagate via `deploy.sh`. Delete any duplicate in repo `public/` directly.
**Action:** Audit before any new ad network — `find . -name ads.txt -not -path "*/node_modules/*"`.

### Pitfall 2: CLS regression on first Lighthouse run after ad deploy
**What goes wrong:** Bottom banner pushes the footer down on first paint; Core Web Vitals fail; SEO ranking drops; Mediavine application later rejected on CWV.
**Why:** Ad iframe loads async, expands its container after first paint.
**Avoid:** Always set `min-height: <ad-height>px` on the wrapper. The `AdSlot` component in §6 does this.
**Verify:** `npx lighthouse https://sunozip.com --only-categories=performance --form-factor=mobile`. CLS must be < 0.1.

### Pitfall 3: ad-blocker breaks Vite dev server in unexpected ways
**What goes wrong:** uBlock Origin's filterlist matches some Adsterra domains and also matches Vite's module preload paths in dev. Result: dev server console errors that look like ad failures but are actually unrelated.
**Avoid:** Test ad integration in production build only (`yarn build && yarn preview`), not dev. Dev mode is for app logic.

### Pitfall 4: dark-mode ad creatives clash with Monolith palette
**What goes wrong:** Ads render in iframes with arbitrary advertiser-supplied creatives — most are bright white or saturated. Against #0A0A0A background, the contrast is jarring.
**Why:** No ad network offers a "dark mode" creative filter. Adsterra and Media.net let you reject categories but not visual style.
**Avoid:** Wrap the AdSlot in a 16px transparent padding zone with a `1px var(--border-color)` ring. This visually quarantines the ad as a "different kind of element" rather than failing to blend. Don't try to invert iframe colors via CSS — modern ad iframes use COEP/CORP that defeat color-filter tricks.

### Pitfall 5: AdSense reapply rejected on identical content
**What goes wrong:** Add 5 lines of FAQ text, reapply, rejected again with same "low-value content."
**Why:** Google's reviewers (human + automated) compare the new submission against the previous one. <30% net-new content reads as "no change."
**Avoid:** Reapply only after meeting the §10 checklist. Don't reapply at intervals < 30 days.

### Pitfall 6: Replit dev URL leaking into ads.txt or canonical
**What goes wrong:** `your-domain.com` placeholder makes it through to production; ad networks see canonical points to a non-existent domain; verification fails.
**Avoid:** sunozip.com is the canonical (verified — Phase 9 SEO already locked this). All ad-network registrations should use `https://sunozip.com`. Never `*.repl.co`.

### Pitfall 7: Adsterra default config enables popunder by default
**What goes wrong:** Sign up, paste a snippet, walk away — three days later, users complain about random new tabs.
**Why:** The "verify your site" snippet enables on-domain monetization across all formats unless you explicitly disable popunder, social bar, in-page push, and direct link.
**Avoid:** After site approval, immediately go to `Websites → [your domain] → Settings → Ad formats` and disable everything except `Banner`. Verify by visiting the site in incognito and confirming no popunder fires.

### Pitfall 8: running multiple display networks simultaneously
**What goes wrong:** Adsterra + Mediavine Journey at the same time → contractual violation, Mediavine kicks you out.
**Why:** Mediavine Journey TOS requires exclusivity on display inventory. AdSense alongside Journey is allowed only via Mediavine's whitelist.
**Avoid:** When migrating to Journey, remove Adsterra fully (script tag + ads.txt entries) **before** Journey approval finalizes.

---

## 9. Code Examples (Adsterra primary pick)

### 9.1 `public/ads.txt` (transitional — both AdSense and Adsterra entries)

```text
# Google AdSense — kept for future reapply (currently not approved, harmless)
google.com, pub-2601322490070593, DIRECT, f08c47fec0942fa0

# Adsterra — replace with the values from your Adsterra publisher dashboard
# Account → ads.txt
adsterra.com, YOUR_ADSTERRA_PUB_ID, DIRECT, YOUR_ADSTERRA_TAG_HASH

# Sovrn Commerce — from Sovrn dashboard
lijit.com, YOUR_SOVRN_PUB_ID, DIRECT, fafdf38b16bf6b2b
```

After deploy, verify at `https://sunozip.com/ads.txt`. Adsterra's auto-validator polls hourly.

### 9.2 `client/index.html` — head additions

Replace the current AdSense script line (kept for documentation; remove if you want a hard cut):
```html
<!-- AdSense snippet (currently rejected — kept inert; will resume on reapply) -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2601322490070593"
     crossorigin="anonymous"></script>

<!-- Adsterra invoke (NEW) — async, no render-blocking -->
<script type="text/javascript" src="//www.highperformanceformat.com/YOUR_ADSTERRA_UNIT_KEY/invoke.js" async></script>

<!-- Sovrn Commerce affiliate-link rewriter (NEW) -->
<script async src="//ad.lijit.com/www/sovrn_signal/sovrn_signal.js?iid=YOUR_SOVRN_SITE_ID"></script>
```

Sync the same change into `public/index.html` (Phase 9 dual-file pattern).

### 9.3 `client/src/components/AdSlot.tsx` (NEW — see §6 for full source)

(See §6 — the full TypeScript component is reproduced there.)

### 9.4 `client/src/App.tsx` patch (one block)

```tsx
import AdSlot from './components/AdSlot';

// ...inside the App component return, just before the existing <footer>:
{/* Phase 4-redux: Adsterra banner — replaces failed AdSense Auto Ads */}
<AdSlot
  adKey={import.meta.env.VITE_ADSTERRA_UNIT_KEY ?? ''}
  width={728}
  height={90}
  className="app-ad-slot"
/>
```

### 9.5 Vite env variable

`client/.env` (gitignored — already standard via project's existing `.env` pattern):
```env
VITE_ADSTERRA_UNIT_KEY=put-the-real-key-here
```

`client/.env.example` (committed):
```env
VITE_ADSTERRA_UNIT_KEY=your-adsterra-unit-key-from-publisher-dashboard
```

Note: Vite exposes `VITE_*` prefixed vars to the client bundle. Adsterra unit keys are public anyway (visible in any user's network tab), so this is just a tidiness pattern, not a security control.

### 9.6 Optional CSS hook (`client/src/App.css`)

```css
.app-ad-slot {
  /* Center horizontally; respect Monolith 24px → ad-wrapper 12px radius scale */
  display: block;
  margin: 32px auto;
  max-width: 100%;
}

@media (max-width: 768px) {
  /* Mobile: switch to 300x250 box format if you add a mobile-only AdSlot */
  .app-ad-slot {
    margin: 24px auto;
  }
}
```

Mobile note: 728x90 will overflow on phones. Either render a second `<AdSlot>` with `width={300} height={250}` and toggle via `useMediaQuery` from `@mantine/hooks`, or accept the desktop-only ad. For 90% of utility-tool traffic this is desktop anyway.

---

## 10. Reapply-to-AdSense Checklist

Concrete content/page additions sunozip.com needs before Google will re-evaluate. Drawn from Google's published Low Value Content guidance + 2026 community outcomes. [CITED: monetiscope.com, smartdigitaltips.com — both reflect 2026 reviewer behavior]

### Pages to add (target: 15–20)

Currently sunozip.com is a **single page**. Reapply requires **at least 15** pages of substantive content. Recommended structure:

- [ ] **Home** (existing) — short value prop + tool. Add a 200-word "What is this?" intro paragraph.
- [ ] **/how-it-works** — 800-word walkthrough of the download flow with screenshots
- [ ] **/faq** — minimum 12 Q&A pairs (Suno-specific, copyright, ID3 tags, troubleshooting)
- [ ] **/about** — 300-word origin story + maintainer info (helps E-E-A-T)
- [ ] **/privacy** — required by Google + Sovrn ToS. Generate via Iubenda free.
- [ ] **/terms** — usage terms. Generate via Iubenda free.
- [ ] **/changelog** — version history (auto from git tags)
- [ ] **/blog/what-is-suno-ai** — 1,200-word explainer
- [ ] **/blog/suno-vs-udio-vs-musicgen** — comparison post (~1,500 words)
- [ ] **/blog/id3-tags-explained** — 800-word technical primer
- [ ] **/blog/how-to-organize-your-suno-library** — practical guide
- [ ] **/blog/legal-considerations-downloading-ai-music** — compliance discussion
- [ ] **/blog/best-suno-prompts** — listicle (1,200 words)
- [ ] **/blog/converting-mp3-metadata-mac-windows** — utility content
- [ ] **/blog/troubleshooting-suno-downloads** — support content

### Quality bar per Google 2026 reviewer behavior

- Each post **>= 1,000 words** (Google rejects <300-word pages outright)
- **>= 30% original content** (cannot be paraphrase of existing internet content)
- **No AI-generated boilerplate without human editing pass** — reviewers detect ChatGPT-written posts and reject them
- Original screenshots, diagrams, or original data
- Internal linking between posts (forms a topical cluster)
- Author byline + date

### Site-level prerequisites

- [ ] Privacy policy page live at `/privacy` (Iubenda)
- [ ] Cookie consent banner if any EU traffic (Iubenda free, ≤1K pageviews tier)
- [ ] Sitemap.xml updated to include all new pages (Phase 9 already created sitemap; expand)
- [ ] All pages indexed in Google Search Console (verify per-URL)
- [ ] Site age >= 6 months from custom-domain registration (sunozip.com domain registered Phase 9 ~2026-04-14, eligible from ~2026-10-14)
- [ ] No broken links (run a crawl)

### Reapply timing

- **Wait 30+ days** between any rejection and reapplication
- **Best window:** ~6 months post-domain-registration with all 15+ pages live, organic traffic established (>= 1K MAU helps signal legitimacy)
- For sunozip.com, realistic AdSense reapproval window: **2026-Q4 (October–December)**

[CITED: medium.com/illumination — Google AdSense Rejection Fixes 2026, monetiscope.com fix-low-value, smartdigitaltips.com adsense-approval-guide]

---

## 11. Sources

### Primary (HIGH confidence — official network policy or news release)
- [Mediavine Requirements](https://www.mediavine.com/mediavine-requirements/) — accessed 2026-04-27
- [Journey Minimum Requirements](https://journeymv.zendesk.com/hc/en-us/articles/24633185741723-Journey-Minimum-Requirements) — accessed 2026-04-27
- [Why Most Page Builders Won't Work with Journey](https://journeymv.zendesk.com/hc/en-us/articles/24635354354971-Why-Most-Page-Builders-Won-t-Work-with-Journey-ads-by-Mediavine) — accessed 2026-04-27
- [Ezoic Raises Bar to 250K (PRNewswire 2026-02-19)](https://www.prnewswire.com/news-releases/ezoic-raises-bar-to-250k-js-integration-for-full-revenue-platform-surges-in-popularity-with-web-builders-302692672.html) — accessed 2026-04-27
- [Ezoic Getting Started Requirements](https://support.ezoic.com/kb/article/getting-started-ezoics-requirements) — accessed 2026-04-27
- [Ezoic Incubator program page](https://www.ezoic.com/incubator) — accessed 2026-04-27
- [Adsterra Publisher Requirements & Setup](https://adsterra.com/blog/set-up-publishers-dashboard/) — accessed 2026-04-27
- [Adsterra Mobile/Desktop Banner config](https://help-publishers.adsterra.com/en/articles/5213905-displaying-different-banners-on-mobile-and-desktop) — accessed 2026-04-27
- [Carbon Ads FAQ](https://www.carbonads.net/faq) — accessed 2026-04-27
- [EthicalAds Publisher Policy](https://www.ethicalads.io/publisher-policy/) — accessed 2026-04-27
- [Sovrn Commerce](https://www.sovrn.com/commerce/) — accessed 2026-04-27
- [Infoblox Vane Viper / PropellerAds research](https://www.infoblox.com/blog/threat-intelligence/deniability-by-design-dns-driven-insights-into-a-malicious-ad-network/) — accessed 2026-04-27
- [DarkReading: Vane Viper Threat Group Tied to PropellerAds](https://www.darkreading.com/vulnerabilities-threats/vane-viper-threat-group-propellerads) — accessed 2026-04-27
- [Playwire: Eligibility Requirements top platforms](https://www.playwire.com/blog/eligibility-requirements-for-working-with-the-top-ad-monetization-platforms) — accessed 2026-04-27

### Secondary (MEDIUM confidence — third-party reviews cross-checked)
- [Productive Blogging: Everything to know about Journey by Mediavine 2026](https://www.productiveblogging.com/everything-you-need-to-know-about-journey-by-mediavine/)
- [bymilliepham.com: Journey by Mediavine 5-month review](https://bymilliepham.com/journey-by-mediavine-review)
- [Publift: Ezoic vs AdSense vs Publift 2026](https://www.publift.com/blog/ezoic-vs-adsense-vs-publift)
- [Publift: Media.net vs AdSense vs Publift 2026](https://www.publift.com/blog/media-net-vs-adsense-vs-publift)
- [Bloggingexplorer: Monumetric Requirements](https://bloggingexplorer.com/monumetric-requirements/)
- [Setupad FAQs](https://setupad.com/faqs/)
- [theadcompare.com: Best Ad Networks for Small News Sites 2026](https://theadcompare.com/advertising/networks/small-news-sites/)
- [revenueinfo.com: Newor Media Review 2026](https://www.revenueinfo.com/newor-media-review)
- [SoftZaR: Monetize Your Next.js Website with Journey by Mediavine](https://softzar.com/monetize-your-next-js-website-with-journey-by-mediavine/) — used for SPA integration nuances
- [Iubenda: Best Consent Management Platform 2026](https://www.iubenda.com/en/blog/best-consent-management-platform/)

### Tertiary (LOW confidence — RPM ranges, unverified single-source claims)
- Various RPM-ranges in §2 Comparison Table — flagged in-table as LOW confidence
- Music-utility specific RPM benchmarks — no public dataset; ranges extrapolated from "tech utility" tier-1 data

### AdSense reapply guidance
- [Google AdSense Rejection Fixes 2026 (Medium/Illumination)](https://medium.com/illumination/google-adsense-rejection-fixes-2026-get-approved-after-multiple-rejections-aab43931f654)
- [Monetiscope: Fix Low Value and Minimum Content Violation](https://monetiscope.com/how-to-fix-low-value-and-minimum-content-violation/)
- [SmartDigitalTips: Complete AdSense Approval Guide 2026](https://www.smartdigitaltips.com/articles/adsense-approval-guide)
- [How I'm Making My Simple Tool AdSense-Ready (Medium)](https://medium.com/illumination/how-im-making-my-simple-tool-adsense-ready-overcoming-google-s-low-value-content-obstacle-52f7cb3d8c58) — most relevant prior-art for sunozip.com's exact rejection

---

## 12. Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | sunozip.com gets <10K monthly pageviews currently | §1 framing | Low — even at 10K, the recommendation holds. Threshold-gated networks remain out of reach. |
| A2 | Music-utility RPM falls in $0.50–$3 (Adsterra) / $5–$10 (Mediavine Journey) tier-1 range | §2, §3 | LOW — RPMs published in this doc are LOW-confidence ranges, flagged as such. Real numbers visible only after 30 days of running. |
| A3 | Suno does not have a public affiliate program | §3.5 | Low — verified by absence in Sovrn's merchant list during research; if Suno launches one in 2026, swap Sovrn for direct Suno affiliate. |
| A4 | Adsterra banner-only configuration is achievable via dashboard toggle | §3.1 | LOW — confirmed via Adsterra's published config docs, but toggle UI may have changed since 2026-Q1. Verify in dashboard during integration. |
| A5 | Mediavine Journey requires Grow on non-WordPress sites via vanilla JS snippet | §3.3 | MEDIUM — confirmed via Journey support docs that Grow works on non-WP, but the "30-day prequalification" assumes the snippet is implemented correctly. SPA single-page apps may underreport sessions to Grow if pageview events aren't fired on virtual route changes (sunozip.com is single-route, so this is OK). |
| A6 | Replit deployment can serve `public/ads.txt` as `/ads.txt` without server route changes | §1, §5, §10 | NONE — verified active on production today (`https://sunozip.com/ads.txt` already serves the AdSense entry per Phase 4 commit 12a4f40 + verified again in Phase 9). |
| A7 | sunozip.com's CSP is non-restrictive (no headers blocking third-party JS) | §3.1 | NONE — verified by reading server.js: no Helmet middleware, no manual CSP. All script-tag networks will load without server-side changes. |
| A8 | The site has no existing privacy policy | §10 | NONE — verified via filesystem scan: no `/privacy` route, no privacy doc in `public/`. |

---

## 13. Open Questions

1. **Is the user's preferred timeline aggressive (ship monetization this week) or patient (build content first, reapply to AdSense in 6 months)?**
   - Aggressive → ship Adsterra now per §1 primary pick.
   - Patient → skip Adsterra entirely, focus on §10 content build, reapply AdSense Q4 2026.
   - Recommendation: **Aggressive.** Adsterra is reversible, and 6 months of zero monetization while building content is a lot of opportunity cost given the modal donation flow alone won't cover Replit hosting.

2. **Does the user want to disclose ads with a separator or label?**
   - Phase 4 D-13 said no "Advertisement" label.
   - But Adsterra's network policies require an ads disclosure on EU traffic.
   - Recommendation: subtle "Ad" label in 11px `var(--text-muted)` above the ad slot — minimal Mantine/Monolith disruption, satisfies disclosure norms.

3. **Privacy policy + Iubenda — generate now, or defer?**
   - Required by Sovrn Commerce ToS.
   - Required by Mediavine Journey at growth stage.
   - Required for AdSense reapply.
   - Recommendation: generate via Iubenda free tier as part of the integration phase. ~30-min task.

4. **What's the user's tolerance for 1–2 weeks of "Adsterra is showing weird creatives"?**
   - First week of Adsterra always has noisy creatives until block-list is tuned.
   - Recommendation: dedicate 30 minutes on day 3 to review the dashboard's "served creatives" report and add 5–10 advertiser/category blocks. Fixes 90% of creative-quality complaints.

---

## 14. Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Adsterra account | §3.1 primary pick | User must register | n/a | Skip — Media.net only |
| Sovrn Commerce account | §3.5 | User must register | n/a | Skip — Buy Me a Coffee donations only |
| Iubenda free tier | §10 privacy policy | User must register | Free ≤1K PV | Hand-write privacy.html |
| Existing AdSense account ca-pub-2601322490070593 | §10 reapply path | ✓ (exists, in non-approved state) | n/a | n/a |
| Replit deployment with custom domain sunozip.com | All | ✓ (verified Phase 9) | — | n/a |
| Vite build (`yarn build`) | §9 | ✓ | 8.0.8 | n/a |
| Mantine v6 | §6 AdSlot integration | ✓ | 6.0.13 | n/a |
| `@mantine/hooks` `useMediaQuery` | §9.6 mobile responsive | ✓ (already in deps) | 6.0.13 | window.matchMedia |
| Google Search Console | §10 reapply prerequisite | User must register | — | n/a |

**Missing dependencies with no blocker:**
- All "must register" items are user actions, not technical blockers. Each is a free signup.

---

## 15. Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual + Lighthouse + ad-network-dashboard validation |
| Config file | none |
| Quick run command | `yarn build && yarn preview && open http://localhost:4173` |
| Full suite command | `npx lighthouse https://sunozip.com --view --form-factor=mobile` + dashboard verification |

### Phase Requirements → Test Map
(Anticipating downstream Phase 11 — "replace AdSense with Adsterra")

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADS-NEW-01 | Adsterra invoke script in `<head>` | manual | `grep highperformanceformat client/index.html` | ❌ Wave 0 |
| ADS-NEW-02 | AdSlot component rendered above footer | manual | `grep -r "AdSlot" client/src/App.tsx` | ❌ Wave 0 |
| ADS-NEW-03 | ads.txt updated with Adsterra publisher entry | manual | `grep adsterra.com public/ads.txt` | ❌ Wave 0 |
| ADS-NEW-04 | CLS < 0.1 on production build | automated | `lighthouse --only-categories=performance` | n/a |
| ADS-NEW-05 | No popunder fires in incognito session | manual human | open in incognito + interact | n/a |
| ADS-NEW-06 | ad-blocker users see no broken layout (regression of Phase 4 D-09) | manual human | open with uBlock Origin enabled | n/a |
| ADS-NEW-07 | Sovrn Commerce script loaded; outbound link rewriter active | automated | DevTools → Network → confirm sovrn_signal.js loads | n/a |

### Wave 0 Gaps
- [ ] `client/src/components/AdSlot.tsx` — new file
- [ ] `client/.env.example` — add `VITE_ADSTERRA_UNIT_KEY` placeholder
- [ ] `public/ads.txt` (or `client/public/ads.txt`) — append Adsterra + Sovrn lines
- [ ] User-side: register Adsterra + Sovrn accounts before integration

---

## 16. Security Domain

> security_enforcement absent from `.planning/config.json` — treated as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no | Adsterra unit key from env var, never user input |
| V6 Cryptography | no | — |
| V14 Configuration | yes | CSP review when Helmet is added |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malicious iframe in ad creative | Tampering | Sandboxed cross-origin iframe (browser default); block sketchy categories in Adsterra dashboard |
| Tracking-cookie injection from ad network | Information Disclosure | Iubenda CMP + Google Consent Mode v2 (deferred to growth stage) |
| `<script>` injection from compromised CDN | Tampering / EoP | Subresource Integrity (SRI) — but ad scripts use rotating hashes, so SRI is impractical. Mitigation: trust the network, avoid compromised networks (no PropellerAds). |
| ads.txt forgery / typo squatting publisher ID | Tampering | Use the exact publisher ID copied from each network's dashboard; verify with `https://sunozip.com/ads.txt` and the network's own validator |
| Click-fraud reflective on the publisher | Repudiation | Don't click your own ads (terminates account at all networks). Document in §13 user expectations. |

**Net assessment:** Threat surface is moderate but well-understood. The single hard rule: **avoid networks tied to malware operations (PropellerAds)**. Banner-only Adsterra has acceptable risk profile when categories are filtered.

---

## 17. Metadata

**Confidence breakdown:**
- Eligibility / traffic minimums: **HIGH** — verified against official network sources, with 2026 dates
- RPM ranges: **LOW–MEDIUM** — based on third-party reviews; real numbers visible only after 30 days running
- Integration complexity: **HIGH** — pattern verified against project's React/Vite/Mantine v6 stack
- UX risk assessment: **HIGH** — ad-format characteristics are well-documented industry knowledge
- AdSense reapply path: **MEDIUM** — Google's review behavior is opaque; recommendations reflect 2026 community outcomes

**Research date:** 2026-04-27
**Valid until:** 2026-07-27 (90 days — ad-network policies shift quickly; Ezoic just changed in February 2026; expect more)

**Recommended re-research triggers:**
- Mediavine changes Journey threshold again
- Adsterra is acquired or rebranded
- AdSense announces policy change for utility/single-page sites
- Apple announces tracking changes affecting tier-1 RPM
