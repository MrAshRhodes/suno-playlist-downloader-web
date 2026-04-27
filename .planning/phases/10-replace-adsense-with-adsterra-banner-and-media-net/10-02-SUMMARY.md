---
phase: 10-replace-adsense-with-adsterra-banner-and-media-net
plan: 02
subsystem: monetization-static-config
tags: [ads-txt, sitemap, robots, requirements, traceability, deferred-credentials]
requires:
  - public/ads.txt (existing, single canonical path)
  - public/sitemap.xml (existing)
  - public/robots.txt (existing — verify-only)
  - .planning/REQUIREMENTS.md (existing)
  - .planning/ROADMAP.md Phase 10 ADM-01..09 definitions
provides:
  - public/ads.txt with 4 DIRECT publisher records (Google + Adsterra + Sovrn × 2)
  - public/sitemap.xml /privacy crawl entry
  - .planning/REQUIREMENTS.md ADM-01..09 backfilled (tickbox + traceability)
affects:
  - server.js explicit static-route handlers (no change — confirmed serving from public/)
  - .planning/REQUIREMENTS.md Coverage block (27 → 36 requirements)
tech-stack:
  added: []
  patterns:
    - ads.txt dual-entry transitional pattern (AdSense kept inert + new networks DIRECT)
    - Single-source-of-truth audit via find for static publisher manifests
    - Conventional sitemap legal-page metadata (changefreq=yearly, priority=0.3)
key-files:
  created: []
  modified:
    - public/ads.txt
    - public/sitemap.xml
    - .planning/REQUIREMENTS.md
decisions:
  - Use placeholder publisher IDs (YOUR_*) for Adsterra + Sovrn since plan 10-01 deferred — wave-0 directive overrides plan's strict regex verifier
  - Keep AdSense line verbatim per CONTEXT.md "kept inert pending reapply"
  - Sovrn cert hash fafdf38b16bf6b2b is literal constant (not substituted)
  - changefreq=yearly + priority=0.3 for /privacy per PATTERNS.md legal-page convention
  - robots.txt unchanged: existing Allow: / covers /privacy, no Disallow rule needed
  - Increment Coverage from 27 to 36 (add 9 ADM-* entries); preserve all pre-existing entries
metrics:
  duration: ~3min
  completed: 2026-04-27
  task_count: 3
  file_count: 3
---

# Phase 10 Plan 02: Static Config Patches (ads.txt + sitemap.xml + REQUIREMENTS) Summary

Patched the three public/ static config files (ads.txt, sitemap.xml, robots.txt-audit) and backfilled ADM-01..09 into REQUIREMENTS.md — all changes confined to deploy-static + planning artifacts, no Vite/React/server.js touched.

## What Changed

### public/ads.txt
- Preserved Google AdSense DIRECT line verbatim (`pub-2601322490070593`).
- Added Adsterra DIRECT line (`adsterra.com, YOUR_ADSTERRA_PUB_ID, DIRECT, YOUR_ADSTERRA_TAG_HASH`).
- Added Sovrn × 2 DIRECT lines (`lijit.com, YOUR_SOVRN_PUB_ID, ...` + `sovrn.com, YOUR_SOVRN_PUB_ID, ...`) with literal cert hash `fafdf38b16bf6b2b`.
- Inline comments mark each network's purpose plus `# DEFERRED:` markers on placeholder lines for plan 10-01 follow-up substitution.
- Final line count: **4 DIRECT entries** (full target — no Sovrn deferral branch taken).

### public/sitemap.xml
- Appended new `<url>` block for `https://sunozip.com/privacy` with `<lastmod>2026-04-27</lastmod>`, `<changefreq>yearly</changefreq>`, `<priority>0.3</priority>` per legal-page convention.
- Original home `<url>` block preserved verbatim.
- Final URL count: **2 `<url>` entries**.
- XML validity confirmed via `xml.etree.ElementTree.parse()`.

### public/robots.txt
- **No changes.** Existing `Allow: /` already covers `/privacy`; no `Disallow:.*privacy` rule found.
- `git diff public/robots.txt` confirms zero modifications.

### .planning/REQUIREMENTS.md
- Added new `### Ad Monetisation` section between `### Donation Modal` and `## Future Requirements`, containing 9 ADM-* tickbox entries (ADM-01..09) sourced from ROADMAP.md Phase 10.
- Appended 9 rows to Traceability table mapping ADM-01..09 → Phase 10 / Pending.
- Updated Coverage block: `v2.0 requirements: 27 total` → `36 total`; `Mapped to phases: 27` → `36`.
- Updated last-updated timestamp to `2026-04-27 after Phase 10 planning`.
- All pre-existing entries (THME/CARD/TYPO/ART/INTR/PLSH/ADS/DON) preserved exactly.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Patch public/ads.txt with Adsterra + Sovrn DIRECT lines | `1dbc67a` | public/ads.txt |
| 2 | Append /privacy to sitemap.xml; audit robots.txt | `9d407e1` | public/sitemap.xml |
| 3 | Backfill ADM-01..09 into REQUIREMENTS.md | `a089c99` | .planning/REQUIREMENTS.md |

## Verification Results

| Check | Expected | Actual | Pass |
|-------|----------|--------|------|
| `find . -name ads.txt` (excl node_modules/git/dist) | exactly `./public/ads.txt` | `./public/ads.txt` | yes |
| `grep -c "DIRECT" public/ads.txt` | 4 (full Sovrn) | 4 | yes |
| `grep -cE "^(google\|adsterra\|lijit\|sovrn)\.com," public/ads.txt` | 4 | 4 | yes |
| `grep -c "fafdf38b16bf6b2b" public/ads.txt` | 2 | 2 | yes |
| `grep -c "<url>" public/sitemap.xml` | 2 | 2 | yes |
| `grep -c "<loc>https://sunozip.com/privacy</loc>"` | 1 | 1 | yes |
| `grep -E "^Disallow:.*privacy" public/robots.txt` | empty | empty | yes |
| XML validity (xml.etree.ElementTree.parse) | exit 0 | exit 0 | yes |
| `grep -cE "^- \[ \] \*\*ADM-0[1-9]\*\*:" REQUIREMENTS.md` | 9 | 9 | yes |
| `grep -cE "^\| ADM-0[1-9] \| Phase 10 \|" REQUIREMENTS.md` | 9 | 9 | yes |
| Coverage shows `36 total` | yes | yes | yes |
| Pre-existing ADS-01..04 + DON-01..06 preserved | 4 + 6 | 4 + 6 | yes |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used placeholder publisher IDs because plan 10-01 (Wave 0) is deferred**
- **Found during:** Task 1
- **Issue:** Plan task 1 Step 2 instructs reading real values from `client/.env`, which doesn't exist (Wave 0 — Adsterra/Sovrn account registration deferred). The verify regex `^adsterra\.com, [^Y][^,]+, DIRECT, [^Y]` would fail on `YOUR_*` placeholder values starting with `Y`.
- **Fix:** Per the orchestrator-supplied wave-0 directive ("emit the placeholder branch", "do NOT prompt the user for Adsterra/Sovrn credentials"), wrote 4 DIRECT lines with `YOUR_*` placeholder publisher IDs and added `# DEFERRED:` inline-comment markers identifying the substitution target for plan 10-01.
- **Why placeholder branch over Sovrn-omit branch:** Wave-0 note explicitly mentions Sovrn placeholders (`YOUR_SOVRN_PUB_ID`) — emitting all 4 lines preserves the file structure and traceability that plan 10-04 expects. Sovrn-omit branch (drop lijit/sovrn) would have created a diff churn when plan 10-01 unblocks.
- **Files modified:** public/ads.txt
- **Commit:** `1dbc67a`

## Authentication Gates

None. Plan 10-02 has no auth-required steps; all changes are local file edits to deploy-static config.

## Known Stubs

The placeholder publisher IDs in `public/ads.txt` (`YOUR_ADSTERRA_PUB_ID`, `YOUR_ADSTERRA_TAG_HASH`, `YOUR_SOVRN_PUB_ID` × 2) are deliberate transitional stubs:

- **File:** `public/ads.txt` (lines 6, 10, 11)
- **Reason:** Wave 0 (plan 10-01) deferred — Adsterra + Sovrn accounts not yet registered. Live `https://sunozip.com/ads.txt` will serve placeholder values until plan 10-01 substitutes them; Adsterra hourly poll + Sovrn validation will not pass until then. Documented inline with `# DEFERRED:` comments so a verifier sees the intent.
- **Resolves in:** Plan 10-01 task 1 (Adsterra registration) + plan 10-01 task 2 (Sovrn registration). After registration, real values written to `client/.env` and a follow-up ads.txt patch substitutes the placeholders.

This stub is **expected and intentional** per the wave-0 deferred directive — does not block plan 10-02 acceptance criteria for ADM-03/06/08 partial.

## Threat Flags

None. The threat-model entry T-10-typo (Spoofing — ads.txt forgery / typo squatting) is mitigated as designed: single-source-of-truth audit (`find . -name ads.txt` returns exactly `./public/ads.txt`) prevents stale duplicates; placeholder values are intentionally non-functional until plan 10-01 substitutes them, so no spoofing surface exposed yet.

## Output Confirmation

- Final ads.txt line count: **4 DIRECT entries** (Google + Adsterra + Sovrn × 2)
- Sitemap URL count: **2** (home + privacy)
- REQUIREMENTS.md ADM-01..09 backfilled: **yes** (9 tickbox + 9 traceability)
- No `client/public/ads.txt` duplicate exists: **confirmed** (`/usr/bin/find` returns exactly `./public/ads.txt`)

## Self-Check: PASSED

**Files verified to exist:**
- FOUND: public/ads.txt
- FOUND: public/sitemap.xml
- FOUND: .planning/REQUIREMENTS.md
- FOUND: .planning/phases/10-replace-adsense-with-adsterra-banner-and-media-net/10-02-SUMMARY.md (this file)

**Commits verified to exist:**
- FOUND: 1dbc67a (Task 1: ads.txt)
- FOUND: 9d407e1 (Task 2: sitemap.xml)
- FOUND: a089c99 (Task 3: REQUIREMENTS.md)
