# External Integrations

**Analysis Date:** 2026-04-11

## APIs & External Services

**Suno Music Platform:**
- Suno website scraping - `https://suno.com/@{username}`
  - Purpose: Extract user profiles and public playlists
  - Method: Browser automation with Puppeteer for infinite scroll
  - Auth: None (public profiles only)
- Suno Studio API - `https://studio-api.prod.suno.com/api/`
  - Endpoints queried:
    - `/api/playlist/{id}/` - Fetch playlist metadata and clips with pagination
    - `/api/clips` - Query clips by user handle or user ID
    - `/api/profile/{userId}` - User profile data with optional clip inclusion
    - `/api/search` - Search clips by user
    - `/api/feed/{userId}` - User feed/activity
  - Purpose: Retrieve playlist and song metadata (title, duration, audio URLs, images)
  - Auth: None required for public data
  - Implementation: `routes/playlist.js` - Multiple fallback strategies for robust retrieval

## Data Storage

**Databases:**
- None - Stateless architecture

**File Storage:**
- Local filesystem only
  - Temp directory: `./temp/` (created on server start)
  - MP3 downloads stored temporarily during ZIP creation
  - Session-based directory structure with UUID identifiers
  - Auto-cleanup: 1 hour per session, 24-hour max age
  - Implementation: `utils/fileManager.js`

**Caching:**
- None - No external caching service
- Browser localStorage: Client-side preference storage
  - `suno-name-template` - File naming convention
  - `suno-overwrite-files` - File overwrite behavior
  - `suno-embed-images` - Whether to embed cover art

## Authentication & Identity

**Auth Provider:**
- None - Public/anonymous access only
- Session Management: `express-session` with in-memory store
  - Purpose: Track download preferences per user session
  - Cookies: Secure in production, HttpOnly, 24-hour maxAge
  - Secret: `SESSION_SECRET` from environment (with fallback default)
  - Routes: `routes/settings.js` - GET/POST/DELETE for preferences

## Monitoring & Observability

**Error Tracking:**
- None - No external error tracking service

**Logs:**
- Console logging (stdout) via Morgan middleware
  - Development: 'dev' format (colorized, condensed)
  - Server logs: `console.log()` and `console.error()` throughout
  - Client logs: Browser console via `services/Logger.ts`
- No persistent log storage

## CI/CD & Deployment

**Hosting:**
- Google Cloud Run - Configured via `.replit` with `deploymentTarget = "cloudrun"`
- Alternative: Replit (web-version subfolder contains older setup)

**CI Pipeline:**
- Replit auto-deploy: Triggers `build.sh` on push
  - Builds client with Vite
  - Starts Express server on port 3000
  - Maps to Cloud Run deployment

## Environment Configuration

**Required env vars (runtime):**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode ('production' enables secure cookies)
- `SESSION_SECRET` - Session encryption key (critical for security)

**Optional env vars:**
- `CLEANUP_INTERVAL` - Temp file cleanup frequency in milliseconds (default: 1 hour)
- `MAX_FILE_AGE` - Temp file retention duration in milliseconds (default: 24 hours)
- `LOG_LEVEL` - Logging verbosity level (default: 'info')

**Secrets location:**
- Environment variables only (no secrets.json or credentials file)
- Replit Secrets tab for deployment
- Cloud Run Secret Manager integration (if configured)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## API Endpoints

**Playlist API:**
- `POST /api/playlist/fetch` - Fetch playlist by URL with flexible ID extraction
- `GET /api/playlist/:id` - Get paginated playlist data (page parameter)
- `GET /api/playlist/:id/all` - Get all playlist clips with automatic pagination
- `GET /api/playlist/user/:username/songs` - Extract all songs from user profile (experimental)
  - Uses browser automation fallback if API methods fail
  - Returns pagination metadata for incomplete results

**Download API:**
- `POST /api/download/playlist` - Initiate ZIP download of complete playlist
  - Parallel MP3 download with configurable concurrency
  - Optional ID3 tag embedding with cover art
  - 15-minute request timeout for large playlists
  - Streaming response for memory efficiency

**Progress Monitoring:**
- `GET /api/download/progress/:sessionId` - Server-Sent Events (SSE)
  - Purpose: Real-time download progress updates to client
  - Format: JSON events with progress percentage and completed item IDs

**Settings API:**
- `GET /api/settings` - Retrieve session preferences
- `POST /api/settings` - Update session preferences
- `DELETE /api/settings` - Reset to defaults
- Preferences stored in `express-session` (in-memory, not persistent)

**Debug:**
- `GET /api/debug` - Health check endpoint

## Web Scraping Implementation

**Puppeteer Configuration:**
- Headless Chrome with `--no-sandbox` for containerized environments
- User-Agent spoofing: Chrome 91 Windows 10
- Viewport: 1920x1080
- Timeout: 30 seconds per page load
- Infinite scroll detection: Waits for DOM updates, max 3 consecutive no-change iterations

**Fallback Strategies** (in `routes/playlist.js`):
1. API endpoint variations (6 different patterns)
2. Browser automation with infinite scroll
3. HTML page scraping with regex extraction
4. Graceful error messages with suggestions for users

---

*Integration audit: 2026-04-11*
