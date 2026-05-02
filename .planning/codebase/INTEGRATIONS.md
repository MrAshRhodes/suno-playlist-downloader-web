# External Integrations

**Analysis Date:** 2026-05-02

## APIs & External Services

**Suno Music Platform:**
- Suno public pages — `https://suno.com/@{username}`
  - Purpose: Browser-based profile scraping with infinite scroll
  - Method: Puppeteer headless Chrome (`routes/playlist.js`)
  - Auth: None (public profiles only)
- Suno Studio API — `https://studio-api.prod.suno.com/api/`
  - Endpoints:
    - `GET /api/playlist/{id}/` — playlist metadata + clips with pagination
    - `GET /api/playlist/{id}/?page={n}` — paginated clips
    - `GET /api/clips` — clips query by user handle or user ID
    - `GET /api/profile/{userId}` — user profile data
    - `GET /api/search` — clip search by user
    - `GET /api/feed/{userId}` — user feed/activity
  - Auth: None required for public data
  - Implementation: `routes/playlist.js` — 4-tier fallback strategy (API variations → browser automation → HTML scraping → user-facing error)

**Google Fonts:**
- Inter font family loaded via CDN in `client/index.html`
- URL: `https://fonts.googleapis.com/css2?family=Inter:wght@400;600`
- Preconnect hints to `fonts.googleapis.com` and `fonts.gstatic.com`

## Monetization Services

**Google AdSense:**
- Script tag in `client/index.html` (auto ads)
- Client ID: `ca-pub-2601322490070593`
- Loaded via: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js`
- Status: Script present in HTML; AdSense auto ads active

**Adsterra (display banners):**
- Component: `client/src/components/AdSlot.tsx`
- Network host: `//www.highperformanceformat.com/{adKey}/invoke.js`
- Config: `window.atOptions` global set before `invoke.js` loads
- Integration: Single-instance banner above footer in `client/src/App.tsx` (line ~299)
- Ad key sourced from Vite env var (`VITE_ADSTERRA_KEY` or similar — set at build time)
- Graceful degradation: renders empty reserved space if `adKey` is falsy (no console error)
- Single-instance constraint: Two `<AdSlot />` on same page breaks due to shared `window.atOptions` global

**Buy Me a Coffee:**
- Link in `client/src/App.tsx` (line ~158) and `client/src/components/DonationModal.tsx` (line ~33)
- URL: `https://buymeacoffee.com/focused`
- Implementation: Plain `<a>` tag, no SDK

## Data Storage

**Databases:**
- None — stateless architecture

**File Storage:**
- Local filesystem only
  - Temp directory: `./temp/` (created on server start by `utils/fileManager.js`)
  - Session-based subdirectory per download (UUID-named)
  - MP3 files written temporarily during ZIP creation
  - Auto-cleanup: 1 hour after session completes, 24-hour max age sweep
  - On disconnect: cleanup scheduled 5 seconds after detection
  - On transfer complete: cleanup scheduled 15 seconds after stream end

**Caching:**
- None — no external caching service
- Browser localStorage (client-side preference persistence):
  - `suno-name-template` — file naming convention
  - `suno-overwrite-files` — overwrite behavior flag
  - `suno-embed-images` — cover art embedding flag

## Authentication & Identity

**Auth Provider:**
- None — fully public/anonymous access

**Session Management:**
- `express-session` with in-memory store (`server.js`)
- Purpose: Track download settings per browser session
- Cookies: `secure: true` in production, 24-hour `maxAge`
- Secret: `SESSION_SECRET` env var (insecure fallback string present in code)
- Routes: `routes/settings.js` — GET/POST/DELETE settings

## Monitoring & Observability

**Error Tracking:**
- None — no external error tracking service

**Logs:**
- Morgan middleware (`dev` format) for HTTP request logging (`server.js`)
- `console.log()` / `console.error()` throughout server routes
- Client: `client/src/services/Logger.ts` — structured logging to browser `localStorage`

## CI/CD & Deployment

**Hosting:**
- Google Cloud Run — configured via `.replit` `deploymentTarget = "cloudrun"`
- Replit platform — handles build and run commands

**Build Pipeline:**
- Push to git triggers Replit pull: `git reset --hard origin/main`
- `build.sh` runs on Replit: installs npm deps, skips client build if `public/` pre-populated
- `deploy.sh` (local): builds Vite → copies `client/dist/*` to `public/` → commits → pushes
- Static files in `public/` are committed to git and served directly by Express

**Ports:**
- 3000 (Express API + static serving) → external port 80
- 5000 (Vite dev server, dev only)

## Environment Configuration

**Required env vars:**
- `PORT` — server port (default: 3000)
- `NODE_ENV` — `production` enables secure cookies and relative API_BASE
- `SESSION_SECRET` — session signing key (critical for security)

**Optional env vars:**
- `CLEANUP_INTERVAL` — temp file cleanup frequency in ms (default: 3600000)
- `MAX_FILE_AGE` — temp file retention in ms (default: 86400000)
- `LOG_LEVEL` — logging verbosity (default: `info`)

**Secrets location:**
- Environment variables only (no secrets.json or credentials file)
- Replit Secrets tab for production deployment
- `.env` file for local development (not tracked in git)

## Internal API Endpoints

**Playlist:**
- `GET /api/playlist/:id/all` — fetch all clips with auto-pagination
- `GET /api/playlist/@:username/all` — fetch user profile + all songs (browser automation)

**Download:**
- `POST /api/download/playlist` — ZIP download; parallel MP3 fetch, optional ID3 tags, 15-min timeout, streaming response

**Progress (SSE):**
- `GET /api/download/progress/:sessionId` — Server-Sent Events for real-time progress

**Settings:**
- `GET /api/settings` — retrieve session preferences
- `POST /api/settings` — update preferences
- `DELETE /api/settings` — reset to defaults

**Debug:**
- `GET /api/debug` — health check

## Webhooks & Callbacks

**Incoming:** None

**Outgoing:** None

---

*Integration audit: 2026-05-02*
