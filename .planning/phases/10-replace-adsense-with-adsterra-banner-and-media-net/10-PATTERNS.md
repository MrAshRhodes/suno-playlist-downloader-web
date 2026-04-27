# Phase 10: Adsterra Monetisation (banner-only) + Media.net submission - Pattern Map

**Mapped:** 2026-04-27
**Files analyzed:** 11 (4 new, 7 modified)
**Analogs found:** 10 / 11 (one no-analog: `MEDIA-NET-SUBMISSION.md`)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `client/src/components/AdSlot.tsx` | component (3rd-party script-mount container) | event-driven (lifecycle: mount → injects script → external iframe takeover) | `client/src/components/WaveformBackground.tsx` (+ `client/src/hooks/useP5.ts` for the ref + useEffect lifecycle) | role-match (closest existing pattern of "ref + useEffect → external runtime claims the div"; AdSlot variant uses raw script tag instead of p5 instance) |
| `client/src/pages/Privacy.tsx` (NEW directory) | component (full-page route view) | request-response (renders Iubenda widget on mount; unmounts on nav) | `client/src/components/WaveformBackground.tsx` (functional component + useP5-style mount lifecycle) and `client/src/components/DonationModal.tsx` (Mantine container + var(--*) surface styling) | role-match (no existing "page" component — only embedded views) |
| `client/.env.example` | config | n/a | `web-version/.env.example` (per CLAUDE.md `## Configuration` section) — referenced; not in repo today; pattern derived from `client/src/vite-env.d.ts` + Vite `import.meta.env.VITE_*` conventions | partial (no committed analog; convention only) |
| `.planning/phases/10-…/MEDIA-NET-SUBMISSION.md` | doc artifact | n/a | (no existing analog — first submission log of its kind) | none |
| `client/src/App.tsx` | component (entry/router) | event-driven (state + render orchestration) | `client/src/App.tsx` itself — modify in place; pattern of "footer block + step cards" already present | exact (modify own structure) |
| `client/src/App.css` (optional `.app-ad-slot`) | stylesheet | n/a | `client/src/App.css` `.support-banner` block (banner-shaped wrapper rule with margin/border/transition) | exact |
| `client/index.html` | config (Vite source HTML head) | n/a | `client/index.html` itself — existing AdSense `<script async>` line is the in-file analog | exact |
| `public/index.html` | config (deployed mirror) | n/a | `public/index.html` itself — existing AdSense `<script async>` line; same dual-file head-sync pattern Phase 9 used for SEO meta | exact |
| `public/ads.txt` | config (publisher manifest) | n/a | `public/ads.txt` itself — current single AdSense entry; append-only edit | exact |
| `public/sitemap.xml` | config (SEO manifest) | n/a | `public/sitemap.xml` itself — Phase 9's existing single `<url>` block is the structural template | exact |
| `public/robots.txt` | config | n/a | `public/robots.txt` itself — verify-only; no edit expected | exact |
| `.planning/REQUIREMENTS.md` | doc | n/a | `.planning/REQUIREMENTS.md` itself — existing THME/CARD/INTR ID-prefix table is the template | exact |

---

## Pattern Assignments

### `client/src/components/AdSlot.tsx` (component, event-driven)

**Primary analog:** `client/src/components/WaveformBackground.tsx` + `client/src/hooks/useP5.ts`
**Why:** Both involve mounting a side-effecting external runtime into a div via `useRef` + `useEffect`. AdSlot replaces the p5 instance with a `<script>` tag append; the ref/lifecycle skeleton is identical.

**Imports pattern** (from `client/src/components/WaveformBackground.tsx` lines 1-3 + `client/src/hooks/useP5.ts` line 1):
```tsx
import { useEffect, useRef } from 'react';
```
AdSlot is leaner — no p5, no external sketch factory. Just the two React primitives. Matches project convention: relative imports, no path aliases (per CLAUDE.md `## Import Organization`).

**Core ref + useEffect pattern** (from `client/src/hooks/useP5.ts` lines 6-22):
```tsx
const containerRef = useRef<HTMLDivElement>(null);
const p5InstanceRef = useRef<p5 | null>(null);

useEffect(() => {
  if (!containerRef.current) return;

  // Clean up any existing instance first (React Strict Mode safety)
  if (p5InstanceRef.current) {
    p5InstanceRef.current.remove();
  }

  p5InstanceRef.current = new p5(sketchFactory, containerRef.current);

  return () => {
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
      p5InstanceRef.current = null;
    }
  };
}, [sketchFactory]);

return containerRef;
```
**Copy from this:** the `if (!ref.current) return;` guard, the dep-array discipline, the StrictMode-safe cleanup return. Adapt for AdSlot by appending a `<script>` element instead of constructing a p5 instance, and dependency array becomes `[adKey, height, width]` per RESEARCH §6.

**Wrapper render contract** (per RESEARCH §6 + CONTEXT locked decision; no Mantine `<Card>`) — extract style values from existing CSS-variable convention in `client/src/App.css` `.support-banner` (lines 19-30):
```css
.support-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  margin-bottom: 24px;
  border-radius: 24px;
  background: var(--banner-bg);
  border: 1px solid var(--banner-border);
  transition: background 0.3s ease, border-color 0.3s ease;
}
```
**Copy from this:** the CSS-variable border + radius + margin convention. AdSlot inlines the same shape with `border-radius: 12` (not 24 — locked subordinate scale per UI-SPEC §Color), `border: 1px solid var(--border-color)`, `background: 'transparent'`, `margin: '32px auto'`, `padding: 16`, `minHeight: height`.

**TypeScript prop interface pattern** (from `client/src/components/ThemeToggle.tsx` lines 3-6):
```tsx
interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```
**Copy from this:** PascalCase `<Name>Props` interface, declared above the function. AdSlot uses:
```tsx
interface AdSlotProps {
  adKey: string;
  width: number;
  height: number;
  className?: string;
}
```

**Default-export functional component pattern** (from `client/src/components/ThemeToggle.tsx` lines 11-35 + `client/src/components/WaveformBackground.tsx` lines 9-25):
```tsx
function AdSlot({ adKey, width, height, className }: AdSlotProps) {
  // ...
}
export default AdSlot;
```
Matches project convention: `function PascalCase` + `export default`. No arrow-function default exports anywhere in `client/src/components/`.

**Env-var access pattern** (Vite `import.meta.env`) — used at AdSlot's call site in `App.tsx`, not inside AdSlot itself:
```tsx
adKey={import.meta.env.VITE_ADSTERRA_UNIT_KEY ?? ''}
```
Per RESEARCH §9.4. The `?? ''` fallback maps directly to AdSlot's `empty-key` state per UI-SPEC §State Diagram (silent empty wrapper, layout reserved).

**Error/empty-state handling pattern:** SILENT — no console error, no user-visible message, layout reserved. This is the project's "graceful degradation" stance (Phase 4 D-09 + UI-SPEC §State Diagram). No analog file does this explicitly because AdSlot is the first script-failure-tolerant component; the `if (!ref.current) return;` guard from `useP5.ts` is the closest stylistic precedent.

---

### `client/src/pages/Privacy.tsx` (component, request-response)

**Primary analog:** `client/src/components/DonationModal.tsx` (Mantine container + var(--*) surface)
**Secondary analog:** `client/src/components/WaveformBackground.tsx` (functional component skeleton + useEffect mount lifecycle for the Iubenda script)
**Why:** No "page" component exists yet (no router, no `pages/` dir). DonationModal is the closest existing example of a Mantine-wrapped surface that styles itself with CSS variables matching the Monolith theme. WaveformBackground is the closest example of a component that owns a `useEffect` lifecycle for a 3rd-party runtime.

**Imports pattern** (from `client/src/components/DonationModal.tsx` lines 1-3):
```tsx
import { Modal, Stack, Text, Button, Image } from '@mantine/core';
import { IconCoffee } from '@tabler/icons-react';
import bannerImg from '../assets/donation-banner.png';
```
**Copy from this:** Mantine named imports from `@mantine/core`, Tabler icons separately, then local relative imports. Privacy.tsx will import `Container, Title, Anchor` from `@mantine/core`, `IconArrowLeft` from `@tabler/icons-react`, plus `useEffect, useRef` from `react`. Note `client/src/pages/` directory does not exist — create alongside file (per UI-SPEC §Component Inventory item 2).

**Mantine surface styling pattern** (from `client/src/components/DonationModal.tsx` lines 13-19):
```tsx
styles={{
  header: { backgroundColor: 'var(--bg-card)', borderBottom: 'none' },
  body: { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' },
}}
```
**Copy from this:** the `var(--bg-card)` + `var(--text-primary)` token use. Privacy page wraps Iubenda embed inside a `<div className="monolith-card privacy-content">` (existing class from `App.css` line 11) — gets the 24px-radius surface for free.

**useEffect lifecycle for external script** (from `client/src/hooks/useP5.ts` lines 10-22):
```tsx
useEffect(() => {
  if (!containerRef.current) return;
  // mount external runtime here
  return () => {
    // unmount on route change
  };
}, []);
```
**Copy from this:** the cleanup-return pattern. Privacy.tsx mounts Iubenda's loader script on mount, removes on unmount — keeps cookies/tracking off the home flow per CONTEXT lock.

**Default-export pattern** (from `client/src/components/DonationModal.tsx` lines 5, 56):
```tsx
function DonationModal({ opened, onClose }: DonationModalProps) {
  // ...
}
export default DonationModal;
```
**Copy from this:** named function + default export. Privacy.tsx follows identically.

**No router. Path-based render gate goes in `App.tsx`** per CONTEXT (locked Option B, ~50KB savings). See App.tsx modification below.

---

### `client/.env.example` (config)

**Primary analog:** Convention-only — no committed analog in repo. CLAUDE.md `## Configuration` references `web-version/.env.example` but it is not present in the working tree.
**Project convention to follow** (`client/src/vite-env.d.ts` + RESEARCH §9.5):
- `VITE_*` prefix for client-bundled vars
- Comment lines (`# …`) above each key explaining where to fetch the value
- Placeholder values, never real keys

**Template per RESEARCH §9.5 + CONTEXT lock:**
```env
# Adsterra ad-unit key — Adsterra publisher dashboard → Websites → [domain] → Ad Units
VITE_ADSTERRA_UNIT_KEY=your-adsterra-unit-key-from-publisher-dashboard

# Adsterra publisher ID — Account → ads.txt
VITE_ADSTERRA_PUB_ID=your-adsterra-publisher-id

# Adsterra ads.txt tag hash — Account → ads.txt (last column of the DIRECT line)
VITE_ADSTERRA_TAG_HASH=your-adsterra-tag-hash

# Sovrn Commerce site ID — Sovrn dashboard → Site settings → Signal IID
VITE_SOVRN_SITE_ID=your-sovrn-site-id

# Sovrn Commerce publisher ID — Sovrn dashboard → Account
VITE_SOVRN_PUB_ID=your-sovrn-publisher-id
```
**Note:** `client/.env` is gitignored via `.gitignore` line 2 (`.env`). Only `.env.example` is committed.

---

### `client/src/App.tsx` (modification — entry/router)

**Primary analog:** `client/src/App.tsx` itself (modify in place).
**Three patches required.**

**Patch 1 — path-based route guard at the top of return** (per CONTEXT locked Option B):
**Reference:** `client/src/App.tsx` line 138–147 (existing `useEffect` blocks). Insert the route guard above `return ( <> ...`:
```tsx
if (typeof window !== 'undefined' && window.location.pathname === '/privacy') {
  return <Privacy />;
}
```
**Note:** must be placed AFTER all hook calls (after line 147 `useEffect`) but BEFORE the `return (` on line 149 — React rules-of-hooks. Add `import Privacy from './pages/Privacy';` to the import block (after line 21 `import DonationModal …`).

**Patch 2 — AdSlot above existing footer**:
**Reference:** `client/src/App.tsx` lines 287–294 (existing `<footer className="app-footer">` block). Insert directly above:
```tsx
{/* Phase 10: Adsterra banner — replaces failed AdSense Auto Ads (ADM-02, ADM-05) */}
<div
  style={{
    width: 728,
    margin: '0 auto 4px',
    fontSize: 11,
    fontWeight: 400,
    color: 'var(--text-muted)',
    textAlign: 'center',
    lineHeight: 1,
    letterSpacing: '0.06em',
  }}
>
  Advertisement
</div>
<AdSlot
  adKey={import.meta.env.VITE_ADSTERRA_UNIT_KEY ?? ''}
  width={728}
  height={90}
  className="app-ad-slot"
/>
```
Add `import AdSlot from './components/AdSlot';` to the import block (alongside other component imports, lines 13-14).

**Patch 3 — Privacy Policy link in footer**:
**Reference:** `client/src/App.tsx` lines 287–294 (existing footer):
```tsx
<footer className="app-footer">
    <span>
        Based on <a href="https://github.com/DrummerSi/suno-downloader" target="_blank" rel="noopener noreferrer">DrummerSi's</a> original app
    </span>
    <a href="https://ko-fi.com/drummer_si" target="_blank" rel="noopener noreferrer">
        Support Original Author
    </a>
</footer>
```
**Modified shape per UI-SPEC §Component Inventory item 4:**
```tsx
<footer className="app-footer">
    <span>
        Based on <a href="https://github.com/DrummerSi/suno-downloader" target="_blank" rel="noopener noreferrer">DrummerSi's</a> original app
    </span>
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <a href="/privacy">Privacy Policy</a>
        <a href="https://ko-fi.com/drummer_si" target="_blank" rel="noopener noreferrer">
            Support Original Author
        </a>
    </div>
</footer>
```
**No new CSS required** — existing `.app-footer a` rule (`App.css` lines 217-225) styles both links automatically:
```css
.app-footer a {
  color: var(--accent);
  text-decoration: none;
  font-size: 13px;
  transition: opacity 0.2s ease;
}
.app-footer a:hover {
  opacity: 0.75;
}
```

---

### `client/src/App.css` (optional `.app-ad-slot` rule)

**Primary analog:** `.support-banner` block (lines 19-41) — closest in role (banner-shaped horizontal wrapper).
**Pattern:**
```css
/* ─── Ad slot wrapper hook (optional layout helper) ─── */
.app-ad-slot {
  display: block;
  margin: 32px auto;
  max-width: 100%;
}

@media (max-width: 768px) {
  .app-ad-slot {
    margin: 24px auto;
  }
}
```
**Copy from `App.css` style:** the `/* ─── Section ─── */` comment header convention (used throughout — lines 1, 9, 19, 44, 75, etc.). The `@media (max-width: 768px)` mobile breakpoint matches RESEARCH §9.6.
**Defer if unneeded** per CONTEXT — AdSlot's inline styles already handle centering/margin.

---

### `client/index.html` (head modifications — Vite source)

**Primary analog:** `client/index.html` itself, lines 47-48 (existing AdSense `<script async>` tag — the structural template for adding more head scripts).
**Existing pattern at lines 47-48:**
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2601322490070593"
     crossorigin="anonymous"></script>
```
**Patch — add Sovrn signal script directly after the AdSense line, before `</head>`:**
```html
<!-- AdSense (kept inert — currently rejected; will resume on reapply) -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2601322490070593"
     crossorigin="anonymous"></script>

<!-- Sovrn Commerce affiliate-link rewriter (Phase 10 — auto-tags outbound merchant links) -->
<script async src="//ad.lijit.com/www/sovrn_signal/sovrn_signal.js?iid=YOUR_SOVRN_SITE_ID"></script>
```
**Critical — DO NOT add Adsterra invoke script here.** Adsterra invoke lives ONLY inside `AdSlot.tsx` `useEffect` per CONTEXT locked decision — `atOptions` is a per-unit global; head injection breaks the integration.

---

### `public/index.html` (head modifications — deployed mirror)

**Primary analog:** `public/index.html` itself, lines 47-48 (mirrors `client/index.html` AdSense line).
**Phase 9 dual-file pattern:** identical edit to `client/index.html`. The `deploy.sh` `cp -r client/dist/* public/` flow propagates the build artefact, so `public/index.html` must be updated by hand to survive until next build, then the rebuilt artefact takes over.
**Apply the same Sovrn signal `<script async>` line.**

---

### `public/ads.txt` (publisher manifest)

**Primary analog:** `public/ads.txt` itself (current single line):
```
google.com, pub-2601322490070593, DIRECT, f08c47fec0942fa0
```
**Append-only patch per CONTEXT + RESEARCH §9.1:**
```text
# Google AdSense — kept inert for future reapply (Phase 4)
google.com, pub-2601322490070593, DIRECT, f08c47fec0942fa0

# Adsterra (Phase 10 primary display network)
adsterra.com, YOUR_ADSTERRA_PUB_ID, DIRECT, YOUR_ADSTERRA_TAG_HASH

# Sovrn Commerce (Phase 10 affiliate-link rewriter — both lijit.com + sovrn.com required per Sovrn KB)
lijit.com, YOUR_SOVRN_PUB_ID, DIRECT, fafdf38b16bf6b2b
sovrn.com, YOUR_SOVRN_PUB_ID, DIRECT, fafdf38b16bf6b2b
```
**Audit before edit** per CONTEXT:
```bash
find . -name ads.txt -not -path "*/node_modules/*"
```
must return exactly `./public/ads.txt`. Verified now — see `o.publicDir` listing.
**Server route:** `server.js` lines 153-160 already serve this via explicit `app.get('/ads.txt', ...)` — no Express change needed.

---

### `public/sitemap.xml` (SEO manifest)

**Primary analog:** `public/sitemap.xml` itself (current single `<url>` block):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sunozip.com/</loc>
    <lastmod>2026-04-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```
**Append-only patch — add a second `<url>` block before `</urlset>`:**
```xml
  <url>
    <loc>https://sunozip.com/privacy</loc>
    <lastmod>2026-04-27</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
```
**Lastmod = deploy date.** `changefreq=yearly` and `priority=0.3` are conventional for legal-policy pages (low update cadence, low ranking weight relative to the home page).

---

### `public/robots.txt` (verify-only)

**Primary analog:** `public/robots.txt` itself:
```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://sunozip.com/sitemap.xml
```
**Verification:** `Allow: /` covers `/privacy`. `Disallow: /api/` does not block it. **No edit expected.** If a tester reports indexing issues, that triggers a separate investigation — not a Phase 10 blocker.

---

### `.planning/phases/10-…/MEDIA-NET-SUBMISSION.md` (doc artifact)

**No analog.** First submission-log artefact in the project. Use plain markdown per CONTEXT `Claude's Discretion`:
```markdown
# Media.net Publisher Application — sunozip.com

**Submitted:** [YYYY-MM-DD]
**Ticket ID:** [from confirmation email]
**Submission method:** [web form URL]
**Domain submitted:** https://sunozip.com
**Application status:** [acknowledged / pending / approved / rejected]

## Notes

- Domain age at submission: [N days from 2026-04-14]
- AdSense status declared: rejected, kept inert for reapply
- Adsterra simultaneous-display disclosed: yes (no exclusivity conflict per Media.net ToS)

## Resolution

[fill in when decision arrives — out-of-band, not phase-blocking]
```

---

### `.planning/REQUIREMENTS.md` (backfill ADM-01..09)

**Primary analog:** `.planning/REQUIREMENTS.md` lines 9-30 — existing THME/CARD/TYPO/INTR/PLSH ID-prefix table.
**Pattern:**
```markdown
### Theme

- [x] **THME-01**: Dark mode uses Monolith Rich Black palette (...)
- [x] **THME-02**: Light mode uses Monolith Warm Ivory palette (...)
```
**Copy this style** for an `### Ad Monetisation` section with ADM-01..ADM-09 entries — tickbox + bold ID + concise behavior. IDs are already enumerated in CONTEXT (ADM-01 popunder/social-bar/direct-link DISABLED, ADM-02 AdSlot component contract, ADM-03 ads.txt dual-entry, ADM-05 placement above footer, ADM-06 privacy + sitemap, ADM-07 Media.net submission, ADM-08 Sovrn wiring, ADM-09 functional regression guard).

---

## Shared Patterns

### CSS-variable token use across all new visual surfaces

**Source:** `client/src/index.css` lines 21-77 (`:root.dark-mode` + `:root.light-mode` declarations).
**Apply to:** AdSlot wrapper, Privacy page surfaces, Advertisement label, footer Privacy link.
**Tokens used this phase:**
- `var(--border-color)` → AdSlot 1px ring (lines 38, 70)
- `var(--text-muted)` → "Advertisement" 11px label (lines 30, 62)
- `var(--bg-card)` → Privacy page `.monolith-card` surface (lines 25, 57)
- `var(--text-primary)` → Privacy page heading (lines 28, 60)
- `var(--accent)` → Privacy footer link (already wired through `.app-footer a`, lines 31, 63)
**Why:** Both light and dark themes resolve automatically — no theme-conditional code paths needed (matches `client/src/components/DonationModal.tsx` lines 13-19 + `client/src/components/ThemeToggle.tsx` lines 19-23 conventions).

### Functional component + default export

**Source:** Every file in `client/src/components/` (12 files audited).
**Apply to:** `AdSlot.tsx`, `Privacy.tsx`.
**Pattern:**
```tsx
function PascalCaseName({ ...props }: PascalCaseNameProps) {
  // hooks
  // return <jsx />
}
export default PascalCaseName;
```
**No** arrow-function default exports anywhere in the components directory. **No** named exports for components.

### `useEffect` + `useRef` lifecycle for 3rd-party runtimes

**Source:** `client/src/hooks/useP5.ts` lines 6-22 (canonical), echoed in `client/src/components/WaveformBackground.tsx` lines 14-19 (consumer side).
**Apply to:** `AdSlot.tsx` (Adsterra invoke script append), `Privacy.tsx` (Iubenda loader script append).
**Pattern:**
```tsx
const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!containerRef.current) return;
  // ... mount external runtime
  return () => {
    // ... unmount on cleanup
  };
}, [/* deps */]);
```
**Cleanup return is mandatory** — React Strict Mode double-invokes effects in development; missing cleanup causes duplicate script tags and broken state.

### Inline-style + var(--*) over CSS modules

**Source:** `client/src/App.tsx` repeated pattern (lines 174, 184, 217, 273, 277, 281) — `style={{ display: "flex", ... }}` with CSS-var values where theme-aware.
**Apply to:** AdSlot wrapper, Advertisement label `<div>`, Privacy page back-link.
**Why:** Matches RESEARCH §6 example + project pattern. Switch to a CSS module/class only if there are >2 distinct ad placements (there is exactly one).

### Append-only edits to deployed config files

**Source:** `public/ads.txt`, `public/sitemap.xml`, `public/robots.txt` — all single-source-of-truth files served via explicit Express routes (`server.js` lines 153-160).
**Apply to:** ads.txt (append Adsterra + Sovrn lines), sitemap.xml (append `/privacy` `<url>`), robots.txt (no change expected).
**Why:** `deploy.sh` does `rm -rf public/assets` + `cp -r client/dist/* public/` — `cp` does not delete extras, so files placed directly in `public/` (not via Vite) survive. Phase 9 commit 336b11b verified this.

### Dual-file head sync (`client/index.html` + `public/index.html`)

**Source:** Both files' lines 47-48 already contain identical AdSense script — that mirror is the precedent.
**Apply to:** Sovrn signal `<script async>` insertion.
**Order:** Edit `client/index.html` first (Vite source), then mirror into `public/index.html` (so the deployed Replit instance picks it up before the next build cycle).

### "Phase N — …" code comment convention

**Source:** `client/src/App.tsx` lines 158, 184, 207, 230 (e.g. `{/* Step 1: Paste link — per D-03, D-04 */}`).
**Apply to:** new AdSlot block in App.tsx — comment with phase + decision IDs:
```tsx
{/* Phase 10: Adsterra banner — replaces failed AdSense Auto Ads (ADM-02, ADM-05) */}
```
**Why:** Tracks decision provenance directly in the source. Existing convention.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `.planning/phases/10-…/MEDIA-NET-SUBMISSION.md` | doc artifact | n/a | First submission-log artefact in the project. Use plain markdown per CONTEXT `Claude's Discretion`. Template provided above. |

---

## Metadata

**Analog search scope:**
- `client/src/components/` — 12 files (BasicModal, ContextModal, DirectSettingsButton, DonationModal, Footer, OptionsModal, SectionHeading, SimpleSettingsModal, StatusIcon, TestModal, ThemeToggle, WaveformBackground)
- `client/src/hooks/` — 2 files (useDarkMode, useP5)
- `client/src/services/` — 5 files (Logger, SettingsManager, Suno, Utils, WebApi) — none used as analogs (no service-layer files in this phase)
- `client/src/` root — App.tsx, App.css, index.css, main.tsx, vite-env.d.ts
- `client/index.html`, `public/index.html`, `public/ads.txt`, `public/sitemap.xml`, `public/robots.txt`
- `.planning/REQUIREMENTS.md`
- `server.js` (route handler verification only — no edit)

**Files scanned:** 27

**Pattern extraction date:** 2026-04-27

**Key project conventions confirmed:**
- React functional components + hooks (CLAUDE.md `## Code Style Guidelines` + every file in components/)
- Mantine v6 locked (CLAUDE.md `## Project — Constraints`)
- Inline styles + CSS variables for component-specific styling (App.tsx lines 174-281, DonationModal lines 13-19)
- TypeScript `.tsx` for components, `.ts` for hooks/services (CLAUDE.md `## File Naming`)
- No barrel files / no path aliases (CLAUDE.md `## Import Organization`)
- No router currently — confirmed by absence of `react-router-dom` in any import statement; CONTEXT-locked path-based gate (Option B)
- Default-export functional components with PascalCase names (every file in components/)
- camelCase variables, PascalCase components/types/interfaces (CLAUDE.md naming + observed throughout)
- `var(--*)` CSS custom properties for theming, never hardcoded colors in components (index.css lines 21-77 are the source of truth)
