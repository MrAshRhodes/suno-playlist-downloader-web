# Phase 06: Premium Title Banner and Modern Step Cards — Research

**Researched:** 2026-04-14
**Domain:** React/CSS UI composition — hero banner image, card layout, step number indicators
**Confidence:** HIGH

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Use nanobanana MCP to generate a wide hero banner image (music/vinyl/audio theme) displayed behind the title text. Full-width within app-wrapper.
- **D-02:** Banner height 200–250px. Content (step 1) visible without scrolling on standard viewports.
- **D-03:** All 3 steps get a `.monolith-card` wrapper: 24px border-radius, `--bg-card`, `--shadow-card`, 1px `--border-color` border. Step number + heading inside the card.
- **D-04:** Numbered step indicators — circled numbers or similar. `SectionHeading.tsx` is reference only; final implementation uses solid surfaces (no gradients — Monolith system).
- **D-05:** Support Server Costs banner at top of page stays exactly as-is. Hero banner goes BELOW it, replacing current plain h1 title area.
- **D-06:** Banner and cards are theme-aware using existing CSS variables. Banner image warm/dark tones (works against both themes).

### Claude's Discretion

- Exact banner image prompt wording and nanobanana parameters
- Whether step number circle is pure CSS or a small inline SVG
- Text-shadow vs semi-transparent overlay for title contrast on banner
- Whether info-banner moves inside the hero card or sits below it

### Deferred Ideas (OUT OF SCOPE)

- None listed

</user_constraints>

---

## Summary

This phase is a pure CSS + JSX composition task. There are no new npm dependencies. All building blocks already exist in the codebase: `.monolith-card`, CSS variables for both themes, and the `SectionHeading.tsx` reference component. The primary unknowns are (1) how to structure the hero banner HTML/CSS for image + overlay text, and (2) the solid-surface step number indicator pattern that replaces the gradient circles in `SectionHeading.tsx`.

The banner image is generated once via nanobanana MCP at the orchestrator level (not inside an executor subagent — MCP tools don't propagate to subagents per project memory). The generated PNG is saved to `client/src/assets/` and imported statically, identical to the `donation-banner.png` pattern from Phase 7.

**Primary recommendation:** Generate the banner at orchestrator level, save to assets, then implement the CSS hero container and card wrappers as pure CSS/JSX edits — no new libraries.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.2.0 | JSX composition | Already in project |
| TypeScript | 5.0.4 | Type safety | Already in project |
| CSS custom properties | — | Theme-aware variables | Already fully defined |

### No new dependencies required

All visual elements needed are achievable with existing CSS and React. Confirmed by audit: `.monolith-card`, CSS variables, `background-image`, `position: relative/absolute` overlays — all native CSS. [VERIFIED: codebase grep of App.css and index.css]

**Installation:** None needed.

---

## Architecture Patterns

### Current layout structure (App.tsx lines 154–182)

```
app-wrapper
├── .support-banner              ← stays untouched (D-05)
├── .app-header (logo + title)   ← REPLACED by .hero-banner
├── .info-banner                 ← moves inside or below hero
├── h3.section-heading (Step 1)  ← wrapped in .monolith-card
├── input + button
├── h3.section-heading (Step 2)  ← wrapped in .monolith-card (outer)
│   └── .monolith-card (table)   ← existing inner card stays
├── h3.section-heading (Step 3)  ← wrapped in .monolith-card
│   └── download button
└── progress + footer
```

### Target layout structure

```
app-wrapper
├── .support-banner              ← unchanged
├── .hero-banner                 ← NEW: replaces app-header + info-banner
│   ├── img.hero-banner-img      ← generated PNG, objectFit: cover
│   ├── .hero-overlay            ← semi-transparent dark scrim
│   └── .hero-content
│       ├── h1.app-title         ← "Suno Playlist Downloader"
│       └── p.hero-subtitle      ← info text (moved from info-banner)
├── .step-card.monolith-card     ← Step 1
│   ├── .step-heading            ← number circle + "Paste playlist link"
│   └── input + button
├── .step-card.monolith-card     ← Step 2
│   ├── .step-heading            ← number circle + "Review songs"
│   └── .monolith-card (table)   ← existing inner card, padding/radius adjusted
├── .step-card.monolith-card     ← Step 3
│   ├── .step-heading            ← number circle + "Download playlist"
│   └── download button + progress
└── footer
```

### Pattern 1: Hero banner with image overlay

**What:** A relatively-positioned container with `background-image` or `<img>` child, an absolutely-positioned overlay div for contrast, and absolutely-positioned text.

**When to use:** Any time text must be legible over a generated image with unpredictable luminance.

**Implementation approach — `<img>` + overlay (preferred over background-image for Vite static asset handling):**

```tsx
// Source: Phase 7 pattern (donation-banner.png import in DonationModal.tsx)
import heroBannerImg from '../assets/hero-banner.png';

// In JSX:
<div className="hero-banner">
  <img src={heroBannerImg} alt="" className="hero-banner-img" aria-hidden="true" />
  <div className="hero-overlay" />
  <div className="hero-content">
    <h1 className="app-title">Suno Playlist Downloader</h1>
    <p className="hero-subtitle">Download music from your Suno playlists...</p>
  </div>
</div>
```

```css
/* App.css additions */
.hero-banner {
  position: relative;
  height: 220px;               /* D-02: 200-250px range */
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 24px;
}

.hero-banner-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.25) 0%,
    rgba(0, 0, 0, 0.55) 100%
  );
}

.hero-content {
  position: relative;     /* above overlay */
  z-index: 1;
  padding: 24px 28px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.hero-content .app-title {
  color: #ffffff;          /* always white — on image, not theme-variable */
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  margin: 0 0 6px;
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.80);
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}
```

**Theme note:** The overlay gradient is always dark — this works for both light and dark modes because the image itself provides the backdrop, not the theme. The info text previously had a theme-variable color; hardcode to white/80% inside the hero.

### Pattern 2: Step card with numbered heading

**What:** `.monolith-card` wrapper containing a heading row with a solid-surface numbered circle (replacing the gradient from `SectionHeading.tsx`) and the section content.

**Solid-surface step number (Monolith-compliant — no gradients):**

```tsx
// Inline in App.tsx — no separate component needed given only 3 uses
<div className="step-card monolith-card">
  <div className="step-heading">
    <div className="step-number">1</div>
    <h3 className="section-heading" style={{ margin: 0 }}>Paste playlist link</h3>
  </div>
  {/* step content */}
</div>
```

```css
.step-card {
  padding: 24px;
  margin-bottom: 20px;
}

.step-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);      /* solid surface, D-04 */
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-heading .section-heading {
  margin: 0;  /* override default 24px 0 12px margin */
}
```

### Step 2 nested card handling

Step 2 currently has: `<h3>` outside, then `.monolith-card` wrapping the table with `padding: 0`. The new structure nests the table card inside the outer step card. This requires adjusting the inner table card's border-radius and removing any conflicting outer margin.

```tsx
<div className="step-card monolith-card">
  <div className="step-heading">
    <div className="step-number">2</div>
    <h3 className="section-heading" style={{ margin: 0 }}>Review songs</h3>
  </div>
  {/* inner table card — keep padding:0 for full-bleed table, adjust radius */}
  <div className="monolith-card song-table-card" style={{ marginBottom: 0, padding: 0, maxHeight: '340px', overflowY: 'auto' }}>
    <table ref={songTable} className="song-table">...</table>
  </div>
</div>
```

**Radius consideration:** Nested `.monolith-card` inside another `.monolith-card` — the inner card's border-radius should be 16px (down from 24px) so it visually fits inside the outer 24px container with 24px padding. Or clip with `overflow: hidden` on outer and set inner radius to 0. Both work; explicit inner radius is cleaner.

### Anti-Patterns to Avoid

- **Using `background-image: url()` in CSS for Vite assets:** Vite doesn't transform CSS background-image `url()` references for assets in `src/`. Use `<img src={import}>` in JSX instead, as done in `DonationModal.tsx`. [VERIFIED: DonationModal.tsx pattern]
- **Using `SectionHeading.tsx` directly:** It uses `useMantineTheme()` gradient circles — violates D-04 (no gradients). Inline the step heading instead.
- **Theme-variable colors on hero text:** Text inside the hero banner should be hardcoded white (with text-shadow), not `var(--text-primary)`, because it sits over the image in both themes.
- **Forgetting `overflow: hidden` on `.hero-banner`:** Without it, the absolute-positioned image extends outside the border-radius.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image overlay text contrast | Custom JS luminance detection | CSS gradient overlay (semi-transparent linear-gradient) | Static image with controlled warm tones — gradient scrim is sufficient |
| Step numbering | Complex component hierarchy | Inline div with `var(--accent)` background | Only 3 instances; no abstraction needed |

---

## Common Pitfalls

### Pitfall 1: Vite static asset import for images

**What goes wrong:** CSS `background-image: url('../assets/hero-banner.png')` doesn't get hashed/bundled by Vite when in `src/assets/`. The image 404s in production.

**Why it happens:** Vite only processes CSS `url()` references for assets imported via JS/TS modules, not arbitrary strings in CSS files.

**How to avoid:** Import the PNG in `App.tsx` (`import heroBannerImg from '../assets/hero-banner.png'`) and set it as `<img src={heroBannerImg}>` or use inline style `style={{ backgroundImage: \`url(\${heroBannerImg})\` }}`.

**Warning signs:** Works in `vite dev` but 404s after `vite build`.

**Verification:** [VERIFIED: Phase 7 used `import bannerImg from '../assets/donation-banner.png'` in DonationModal.tsx — same pattern required here]

### Pitfall 2: Section-heading margin collapsing inside card

**What goes wrong:** `.section-heading` has `margin: 24px 0 12px` — inside a `.step-card` with `padding: 24px`, this creates 48px of top space on the first heading.

**Why it happens:** The h3 top margin adds to card padding.

**How to avoid:** Override `margin: 0` on the heading element when it's inside `.step-heading`. Already shown in the code example above.

### Pitfall 3: Double card border on nested cards

**What goes wrong:** Nesting `.monolith-card` inside `.monolith-card` creates a visible double-border where the inner card touches the outer card's padding edge.

**Why it happens:** Both cards have `border: 1px solid var(--border-color)`.

**How to avoid:** Give the inner table card a slightly reduced opacity border or use a dedicated `.song-table-card` modifier that sets `border-color: var(--border-subtle)`. Alternatively, remove the inner card's border entirely and rely on the outer card's padding to create visual separation.

### Pitfall 4: nanobanana unavailable in executor context

**What goes wrong:** nanobanana MCP is not available inside subagent/executor tool sets.

**Why it happens:** MCP tools don't propagate to spawned subagents. [VERIFIED: project memory `MCP tools unavailable in executors`]

**How to avoid:** Generate the banner at the orchestrator level (same session as this research), save to `client/src/assets/hero-banner.png`, then the plan treats it as an existing file. The plan must include a Wave 0 task: "Generate and save hero-banner.png" to be done at orchestrator level. If unavailable, fallback is an ImageMagick-generated gradient (same fallback used in Phase 7).

---

## Code Examples

### Asset import pattern (verified from DonationModal.tsx)

```tsx
// Source: client/src/components/DonationModal.tsx line 3
import bannerImg from '../assets/donation-banner.png';
// Then: <img src={bannerImg} ... />
```

### Existing .monolith-card definition (verified from App.css lines 8–15)

```css
/* Source: client/src/App.css */
.monolith-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  box-shadow: var(--shadow-card);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
```

### Existing section-heading definition (verified from App.css lines 118–125)

```css
/* Source: client/src/App.css */
.section-heading {
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
  margin: 24px 0 12px;
  letter-spacing: -0.02em;
}
```

### SectionHeading.tsx gradient circle (DO NOT copy — reference only)

```tsx
// Source: client/src/components/SectionHeading.tsx lines 27–38
// THIS USES GRADIENTS — violates D-04. Use solid var(--accent) instead.
background: 'linear-gradient(135deg, #0071e3, #40a9ff)',
```

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| nanobanana MCP | Hero banner image generation | ✓ (orchestrator only) | current | ImageMagick gradient (Phase 7 precedent) |
| ImageMagick | Banner fallback | — | — | Skip image, use CSS gradient background |
| Vite | Build | ✓ | 4.3.9 | — |
| React | JSX | ✓ | 18.2.0 | — |

**nanobanana note:** Available in this (orchestrator) session via MCP. NOT available inside executor subagents. [VERIFIED: project memory]

**Missing dependencies with no fallback:** None — all CSS/JSX work requires no external tools.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual visual verification (no automated test framework detected) |
| Config file | none |
| Quick run command | `cd /Users/ashley.rhodes/proj/scripts/learning-projects/suno-playlist-downloader/client && npm run dev` |
| Full suite command | `cd /Users/ashley.rhodes/proj/scripts/learning-projects/suno-playlist-downloader/client && npm run build` |

### Phase Requirements → Test Map

| ID | Behavior | Test Type | Automated Command | File Exists? |
|----|----------|-----------|-------------------|-------------|
| D-01 | Hero banner image renders | visual | `npm run dev` + browser check | ❌ Wave 0 |
| D-02 | Banner height 200–250px | visual | DevTools computed style check | ❌ Wave 0 |
| D-03 | All 3 steps wrapped in `.monolith-card` | visual/structural | `npm run build` (no build errors) | ❌ Wave 0 |
| D-04 | Step numbers: solid surface, no gradient | visual | Browser inspect — no `linear-gradient` on step circles | ❌ Wave 0 |
| D-05 | Support banner untouched | visual | Compare before/after | ❌ Wave 0 |
| D-06 | Theme toggle — banner + cards switch correctly | visual | Toggle theme in browser | ❌ Wave 0 |

### Sampling Rate

- **Per task:** `npm run build` — confirms no TypeScript or import errors
- **Per wave:** Full visual review in browser (dark + light mode)
- **Phase gate:** All 6 decisions visually verified before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `client/src/assets/hero-banner.png` — must exist before implementation tasks run (generate via nanobanana at orchestrator level, or ImageMagick fallback)
- [ ] No automated tests exist for this phase — visual verification is the acceptance criteria

---

## Security Domain

This phase is CSS/JSX-only with a static local PNG asset. No user input, no network calls, no authentication. ASVS categories V2, V3, V4, V6 do not apply. V5 (input validation) not applicable — no new inputs added.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Info banner text moves inside hero-content (subtitle) rather than remaining as a separate `.info-banner` card below | Architecture Patterns | If user prefers info-banner stays separate, the hero-content JSX structure changes slightly |
| A2 | Inner table card within Step 2 keeps existing inline style `maxHeight: 340px, overflowY: auto` | Architecture Patterns | Song table scroll behavior may break if this is removed |

---

## Sources

### Primary (HIGH confidence)

- `client/src/App.css` — verified `.monolith-card`, `.section-heading`, `.app-header`, `.info-banner`, `.hero-banner` (does not yet exist) definitions
- `client/src/App.tsx` (lines 155–282) — verified current JSX layout and step heading positions
- `client/src/components/DonationModal.tsx` — verified static PNG import + `<img>` pattern for Vite
- `client/src/index.css` — verified all CSS variables available in both themes
- `.planning/STATE.md` — confirmed nanobanana unavailable in executors (Phase 07 decision log)

### Secondary (MEDIUM confidence)

- `client/src/components/SectionHeading.tsx` — gradient circle pattern (used as anti-pattern reference per D-04)

### Tertiary (LOW confidence)

- None

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — no new dependencies; pure CSS/JSX confirmed by codebase audit
- Architecture: HIGH — JSX structure verified against live App.tsx, patterns verified against DonationModal.tsx
- Pitfalls: HIGH — Vite asset pitfall verified from Phase 7 implementation pattern; nanobanana pitfall verified from project memory

**Research date:** 2026-04-14
**Valid until:** Stable — CSS/React patterns; valid until project upgrades Mantine or Vite major version
