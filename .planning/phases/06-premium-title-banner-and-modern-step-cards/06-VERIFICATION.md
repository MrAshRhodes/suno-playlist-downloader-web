---
phase: 06-premium-title-banner-and-modern-step-cards
verified: 2026-04-14T10:00:00Z
status: human_needed
score: 5/6 must-haves verified programmatically
overrides_applied: 0
human_verification:
  - test: "Toggle between dark and light mode"
    expected: "Hero banner text stays white in both modes; step cards switch bg/border with theme; ThemeToggle is visible and functional inside the hero banner top-right"
    why_human: "Theme behavior requires visual inspection — CSS variables and dynamic class switching cannot be asserted from static file analysis"
---

# Phase 06: Premium Title Banner and Modern Step Cards Verification Report

**Phase Goal:** Replace the plain header with a generated hero banner image and wrap all 3 step sections in monolith-card containers with solid-surface numbered step indicators
**Verified:** 2026-04-14T10:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A hero banner image with title overlay renders below the Support Server Costs banner | VERIFIED | `hero-banner.png` (2.7MB) imported at App.tsx:9; `.hero-banner` div at App.tsx:163 contains `.hero-content` with `<h1 class="app-title">` |
| 2 | The Support Server Costs banner at the top of the page is unchanged | VERIFIED | `className="support-banner"` at App.tsx:155 appears before the hero banner block; `.support-banner` CSS unchanged in App.css:18-41 |
| 3 | All 3 step sections are wrapped in monolith-card containers with step number circles | VERIFIED | `className="step-card monolith-card"` appears 3 times (App.tsx:179, 204, 250); `className="step-number"` appears 3 times (181, 206, 252) |
| 4 | Step number circles use solid var(--accent) background (no gradients) | VERIFIED | App.css:325 — `.step-number { background: var(--accent); }`. Only `linear-gradient` in App.css is inside `.hero-overlay` (line 266), not `.step-number` |
| 5 | Banner and cards render correctly in both dark and light mode | NEEDS HUMAN | CSS variables used correctly (`var(--accent)`, `var(--bg-card)`); hero text hardcoded `#ffffff` over dark overlay. Cannot visually verify without browser |
| 6 | The app builds without errors via npm run build | VERIFIED | Build output: `✓ built in 3.64s` with zero TypeScript or Vite errors |

**Score:** 5/6 truths verified (1 requires human)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `client/src/assets/hero-banner.png` | Generated hero banner image (music/vinyl/audio theme, warm tones) | VERIFIED | File exists, 2.7MB — substantive, not a stub |
| `client/src/App.tsx` | Hero banner JSX + step card wrapper JSX with numbered headings | VERIFIED | Contains `import heroBannerImg`, `.hero-banner`, `.step-card monolith-card`, `.step-number`, `.step-heading`, `.song-table-card` — all classes present and wired |
| `client/src/App.css` | Hero banner CSS + step card CSS + step number CSS | VERIFIED | Contains `.hero-banner`, `.hero-overlay`, `.hero-content .app-title`, `.hero-subtitle`, `.hero-actions`, `.step-card`, `.step-number`, `.song-table-card` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `client/src/App.tsx` | `client/src/assets/hero-banner.png` | `import heroBannerImg from './assets/hero-banner.png'` | WIRED | Import at App.tsx:9; used as `src={heroBannerImg}` at App.tsx:164 |
| `client/src/App.tsx` | `client/src/App.css` | `className="hero-banner"`, `step-card monolith-card` | WIRED | All classNames used in JSX match defined CSS rules in App.css |

### Data-Flow Trace (Level 4)

Not applicable — this phase delivers visual/structural JSX and CSS changes only. No dynamic data flows were added or modified. The hero banner is a static imported PNG; step cards wrap existing stateful UI.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Build succeeds without errors | `npm run build` in `client/` | `✓ built in 3.64s`, zero errors | PASS |
| Old `app-header` class absent from App.tsx | grep `className="app-header"` in App.tsx | No matches | PASS |
| Old `info-banner` class absent from App.tsx | grep `className="info-banner"` in App.tsx | No matches | PASS |
| `step-card monolith-card` present 3 times | grep count in App.tsx | 3 matches | PASS |
| `.step-number` uses solid accent, no gradient | grep `linear-gradient` inside `.step-number` in App.css | No matches (gradient only in `.hero-overlay`) | PASS |

### Requirements Coverage

**Issue: D-01 through D-06 are not defined in REQUIREMENTS.md.**

The PLAN frontmatter and ROADMAP.md both list `D-01, D-02, D-03, D-04, D-05, D-06` as Phase 6 requirements, but REQUIREMENTS.md contains no D-prefixed requirement IDs. REQUIREMENTS.md uses namespaces: THME-, CARD-, TYPO-, ART-, INTR-, PLSH-, ADS-, DON-. No D-* namespace exists.

These requirement IDs appear to be informal labels created during Phase 6 planning without being registered in REQUIREMENTS.md. They are internally consistent within the PLAN and ROADMAP but are orphaned from the traceability document.

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| D-01 | 06-01-PLAN.md | Hero banner image renders at full-width 220px height | SATISFIED | `.hero-banner { height: 220px }` in App.css:247; PNG imported and used in JSX |
| D-02 | 06-01-PLAN.md | Title and subtitle overlaid on hero banner | SATISFIED | `.hero-content` with `<h1 class="app-title">` and `<p class="hero-subtitle">` inside `.hero-banner` |
| D-03 | 06-01-PLAN.md | All 3 step sections wrapped in monolith-card containers | SATISFIED | 3 occurrences of `step-card monolith-card` in App.tsx |
| D-04 | 06-01-PLAN.md | Step number circles use solid var(--accent), no gradients | SATISFIED | `.step-number { background: var(--accent) }` — no gradient |
| D-05 | 06-01-PLAN.md | Support Server Costs banner unchanged above hero | SATISFIED | `.support-banner` div at App.tsx:155 precedes hero banner; CSS block unmodified |
| D-06 | 06-01-PLAN.md | Banner and cards work correctly in both themes | NEEDS HUMAN | CSS variables used correctly; requires visual inspection to confirm |

**Orphaned IDs:** D-01, D-02, D-03, D-04, D-05, D-06 — present in PLAN and ROADMAP but absent from REQUIREMENTS.md. These should be registered in REQUIREMENTS.md or the PLAN should reference existing REQUIREMENTS.md IDs. This is a traceability gap, not a functional gap.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | — |

No TODOs, FIXMEs, placeholder comments, empty returns, or stub implementations found in the modified files.

### Human Verification Required

#### 1. Theme Switching — Hero Banner and Step Cards

**Test:** Load the app in a browser. Toggle between dark and light mode using the ThemeToggle button (top-right of the hero banner).
**Expected:**
- In both modes, hero banner image is visible, title text ("Suno Playlist Downloader") is white, subtitle is white at 80% opacity
- ThemeToggle button is visible and functional inside the banner
- Step cards change surface color with theme (dark: `#1A1A1A`, light: `#E8E4DB`)
- Step number circles remain solid blue-gray (`#3B4A6B`) in both modes
- No flash of unstyled content on theme switch
**Why human:** Dynamic class switching (`dark-mode`/`light-mode` on `<html>`) and CSS variable resolution require a live browser to verify

### Gaps Summary

No functional gaps. The implementation matches all must-haves in the PLAN frontmatter. The one outstanding item (Truth #5 — theme rendering) is a visual verification that cannot be confirmed from static code analysis.

**Traceability note:** Requirement IDs D-01 through D-06 referenced by Phase 6 are not registered in REQUIREMENTS.md. Recommend adding them to maintain full traceability. This does not block goal achievement.

---

_Verified: 2026-04-14T10:00:00Z_
_Verifier: Claude (gsd-verifier)_
