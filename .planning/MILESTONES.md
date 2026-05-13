# Milestones

## v2.0 Monolith UI (Shipped: 2026-05-02)

**Phases:** 11 phases (1–11 including 6.1 insertion) | **Plans:** 27 | **Timeline:** 2026-04-14 → 2026-05-02
**Files changed:** 178 | **Lines added:** 23,413

**Key accomplishments:**

- Monolith design system shipped: Rich Black dark mode, Warm Ivory light mode, Deep Blue #3B4A6B accent, 24px depth cards, Inter typography hierarchy
- p5.js atmospheric waveform background — seeded, reproducible, ambient, music-themed
- WCAG AA contrast fixes, button/progress glow animations, themed scrollbar, smooth state transitions
- Google AdSense Auto Ads wired with publisher ID ca-pub-2601322490070593
- Neon navy/purple/cyan palette harmonization with dual accent system (purple actions, cyan progress)
- Gratitude-first donation modal with nanobanana-generated banner — triggers on 1st + every 5th download
- Full SEO: OG/Twitter/JSON-LD, canonical URL, robots.txt, sitemap.xml, 1200×630 OG image pipeline
- Domain research: sunozip.com ranked #1 (20/20) — memorable, descriptive, .com available
- Adsterra CLS-safe AdSlot banner component — no popunder/social/direct-link risk
- Resolved 12 Dependabot alerts: basic-ftp 5.3.1, multer removed (unused), qs 6.15.1, on-headers 1.1.0, vite 6.4.2, uuid 14.0.0 across all package trees

**Deferred items acknowledged at close:**
- UAT visual sign-offs (phases 01, 04, 06) — covered by live site regression 2026-05-02
- Adsterra live publisher key — pending account approval
- sunozip.com domain purchase — pending
- Download by @username and per-song selection — backlog for next milestone

---

## v2.1 UX & Discovery (Shipped: 2026-05-12)

**Phases:** 3 phases (12–14) | **Plans:** 3 | **Timeline:** 2026-05-12
**Files changed:** ~15 | **Commits:** ~12

**Key accomplishments:**

- Per-song checkbox selection: opt-out model, select-all/deselect-all/indeterminate, download count label, zero-disabled button
- @Username full URL input: pasting `https://suno.com/@username` parsed and routed correctly without code path changes
- Dependabot PRs #2 and #3 verified closed; ip-address XSS patched to v10.2.0; npm audit clean
- sunozip.com confirmed live on Replit

**Deferred items acknowledged at close:**
- Adsterra live publisher key — still pending account approval

---

## v2.2 Batch Downloads & Ops (Shipped: 2026-05-13)

**Phases:** 3 phases (15–17) | **Plans:** 4 | **Timeline:** 2026-05-13
**Files changed:** 24 | **Commits:** 40

**Key accomplishments:**

- archiver v7 streaming ZIP in `routes/download.js` — replaced adm-zip in-memory build; buffers GC'd after flush; never accumulates full playlist in RAM
- Client-side batch splitting in App.tsx — playlists > BATCH_SIZE produce sequential numbered ZIPs (`PlaylistName-batch-01-of-N.zip`)
- SSE progress bar wired — `sessionId` now sent in POST body; `global.downloadTrackers[sessionId]` emits per-clip status; monitor set up once before batch loop
- `VITE_BATCH_SIZE` env var (default 100) configures batch size without code change; TypeScript-safe via `vite-env.d.ts`
- Hero banner converted to WebP at 121KB (from 2.4MB PNG) — LCP bottleneck resolved
- FAQPage JSON-LD schema injected into both `client/index.html` and `public/index.html`
- Canonical tag `<link rel="canonical" href="https://sunozip.com/" />` in both HTML entry points
- `public/privacy.html` static page added; sitemap updated with `/privacy.html` entry
- `deploy-safe.sh` — builds client, copies dist to public/, commits but does NOT push
- `deploy.sh` — delegates to deploy-safe.sh then only pushes when unpushed commits exist
- `replit-sync.sh` — confirmation-gated `git reset --hard origin/main` recovery script

**Key decisions:**
- archiver v7 (not v8) — v8 has breaking API changes
- setupProgressMonitor called once before batch loop (not inside) — calling inside loop opens new EventSource per batch, deleting tracker for batch 2+
- NaN guard on parseInt(VITE_BATCH_SIZE) — bad env value falls back to 100 instead of NaN breaking slice

**Deferred items acknowledged at close:**
- Adsterra live publisher key — still pending account approval
- Live OOM test on 200-song playlist — code audit confirms streaming pattern is correct; live test deferred to Replit
- BAT-05 (batch count preview), BAT-06 (pause/resume), OPS-04 (GitHub Actions) — deferred to v2.3

---
