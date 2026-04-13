# Phase 4: Add Google Ads to the bottom of the site - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-13
**Phase:** 04-add-google-ads-to-the-bottom-of-the-site
**Areas discussed:** Ad placement & layout, Ad format & config, Visual integration

---

## Ad placement & layout

| Option | Description | Selected |
|--------|-------------|----------|
| Below existing footer | Ad renders after the attribution footer — last element on page | |
| Above existing footer | Ad sits between content and the attribution footer | ✓ |
| Sticky/fixed at viewport bottom | Ad anchored to bottom of viewport, always visible | |

**User's choice:** Above existing footer
**Notes:** Attribution footer stays as the very last element on the page

| Option | Description | Selected |
|--------|-------------|----------|
| Full container width | Ad stretches to match the app container width (~800px) | ✓ |
| Centered with max-width | Ad is narrower than the container, centered | |

**User's choice:** Full container width

| Option | Description | Selected |
|--------|-------------|----------|
| Generous (32-48px) | Clear separation, matches existing 48px footer margin | ✓ |
| Tight (16-24px) | Compact spacing | |
| You decide | Claude picks appropriate spacing | |

**User's choice:** Generous (32-48px)

| Option | Description | Selected |
|--------|-------------|----------|
| Always visible | Ad stays rendered regardless of app state | ✓ |
| Hide during downloads | Ad hidden when download is in progress | |

**User's choice:** Always visible

---

## Ad format & config

| Option | Description | Selected |
|--------|-------------|----------|
| Manual ad unit | AdSense script + specific <ins> ad unit in React | |
| Auto Ads | Just add the AdSense script tag. Google decides placement | ✓ |
| Google Ad Manager | Full ad management platform with GPT tags | |

**User's choice:** Auto Ads
**Notes:** Google handles placement automatically. Simplifies implementation significantly.

| Option | Description | Selected |
|--------|-------------|----------|
| I'll provide the ID | User shares ca-pub-XXXXX ID before implementation | ✓ |
| Use placeholder for now | Implementation uses a TODO/placeholder | |

**User's choice:** Will provide real publisher ID

| Option | Description | Selected |
|--------|-------------|----------|
| Auto Ads only | Just the AdSense script tag | ✓ |
| Auto Ads + manual bottom unit | Script for auto placement PLUS specific manual unit | |

**User's choice:** Auto Ads only

| Option | Description | Selected |
|--------|-------------|----------|
| Async | Script loads with async attribute | ✓ |
| Deferred | Script loads after page content is parsed | |
| You decide | Claude picks loading strategy | |

**User's choice:** Async

| Option | Description | Selected |
|--------|-------------|----------|
| No restrictions | Let Google place ads wherever it determines best | ✓ |
| Exclude interactive areas | Add exclusion hints for song table and download area | |

**User's choice:** No restrictions

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded in HTML | Publisher ID directly in script tag | ✓ |
| Environment variable | Load from .env and inject at build time | |

**User's choice:** Hardcoded in HTML

| Option | Description | Selected |
|--------|-------------|----------|
| Graceful degradation | Nothing shows if ad blocker active | ✓ |
| Subtle notice | Small message asking users to whitelist | |

**User's choice:** Graceful degradation

| Option | Description | Selected |
|--------|-------------|----------|
| No consent banner needed | Rely on Google's built-in consent mechanisms | ✓ |
| Add basic consent | Show cookie consent banner before loading AdSense | |

**User's choice:** No consent banner

---

## Visual integration

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal separator | Subtle border-top line matching existing footer separator | ✓ |
| Card container | Wrap ad in Monolith-style card (24px radius, depth shadows) | |
| No treatment | Raw Google ad injection with no wrapper | |

**User's choice:** Minimal separator

| Option | Description | Selected |
|--------|-------------|----------|
| Transparent | Page background shows through | ✓ |
| Theme-matched background | Ad wrapper gets var(--bg-card) background | |

**User's choice:** Transparent

| Option | Description | Selected |
|--------|-------------|----------|
| No label | Google Auto Ads handles its own labeling | ✓ |
| Subtle label | Small muted "Advertisement" text above ad | |

**User's choice:** No label

---

## Claude's Discretion

- Exact spacing values within the 32-48px range
- Whether Auto Ads needs any page-level meta tags beyond the script

## Deferred Ideas

None — discussion stayed within phase scope.
