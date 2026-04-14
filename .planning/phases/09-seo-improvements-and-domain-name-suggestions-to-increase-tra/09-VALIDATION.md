---
phase: 9
slug: seo-improvements-and-domain-name-suggestions-to-increase-tra
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-14
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (HTML inspection, structured data validator) |
| **Config file** | none — no test framework needed for static HTML/SEO changes |
| **Quick run command** | `grep -c 'og:title\|og:description\|og:image' client/src/index.html` |
| **Full suite command** | `grep -c 'og:title\|og:description\|og:image\|twitter:card\|application/ld+json\|canonical' client/src/index.html && test -f public/robots.txt && test -f public/sitemap.xml` |
| **Estimated runtime** | ~1 second |

---

## Sampling Rate

- **After every task commit:** Run quick grep command
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 1 second

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | D-02 | — | N/A | manual | `test -f public/assets/og-card.png` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | D-01,D-03,D-04 | — | N/A | grep | `grep -c 'og:title' client/src/index.html` | ✅ | ⬜ pending |
| 09-01-03 | 01 | 1 | D-08 | — | N/A | grep | `grep -c 'application/ld+json' client/src/index.html` | ✅ | ⬜ pending |
| 09-01-04 | 01 | 1 | D-06,D-07 | — | N/A | file | `test -f public/robots.txt && test -f public/sitemap.xml` | ❌ W0 | ⬜ pending |
| 09-01-05 | 01 | 1 | D-09 | — | N/A | grep | `grep -c 'canonical' client/src/index.html` | ✅ | ⬜ pending |
| 09-02-01 | 02 | 2 | D-05 | — | N/A | manual | N/A — domain list is documentation | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] OG card image generated via nanobanana MCP (orchestrator level) — saved to `public/assets/`
- [ ] `public/robots.txt` — created as new static file
- [ ] `public/sitemap.xml` — created as new static file

*OG image must exist before meta tags reference it.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| OG card renders correctly on social platforms | D-01, D-02 | Requires sharing URL on Twitter/Facebook/LinkedIn | Use og:image debugger tools (Facebook Sharing Debugger, Twitter Card Validator) |
| Domain name availability | D-05 | Requires live registrar API or manual lookup | Check suggested domains on namecheap.com or similar |
| JSON-LD passes Google validation | D-08 | Requires Google Rich Results Test tool | Paste HTML into search.google.com/test/rich-results |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 1s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
