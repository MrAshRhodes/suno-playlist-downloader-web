# Architecture

**Analysis Date:** 2026-04-11

## Pattern Overview

**Overall:** Client-Server Web Application with Backend API Proxy

**Key Characteristics:**
- Dual-layer frontend (React client + Vite) communicates with Node.js/Express backend
- Backend acts as proxy to Suno.com APIs and handles file operations
- Streaming ZIP download for playlist aggregation
- Session-based state management with server-side cleanup
- Browser automation (Puppeteer) for profile scraping fallback

## Layers

**Client Layer (React Frontend):**
- Purpose: User interface for playlist discovery and download management
- Location: `client/src/`
- Contains: React components, custom hooks, TypeScript services
- Depends on: Mantine UI framework, Tabler icons
- Used by: Browser users via Vite dev server (port 5173) or production static serving

**API Service Layer (TypeScript in Client):**
- Purpose: Abstracts HTTP communication to backend endpoints
- Location: `client/src/services/` (Suno.ts, WebApi.ts, SettingsManager.ts)
- Contains: Fetch wrappers, playlist/download/settings API calls
- Depends on: Express backend API endpoints
- Used by: React components and App.tsx

**Backend API Layer (Node.js/Express):**
- Purpose: Routes HTTP requests, orchestrates file operations, proxies external APIs
- Location: `server.js`, `routes/` directory
- Contains: Express route handlers, middleware configuration
- Depends on: Puppeteer for browser automation, node-fetch for HTTP requests, AdmZip for ZIP creation
- Used by: Client frontend via REST API calls

**File Management Layer:**
- Purpose: Handles temporary file creation, cleanup, and disk operations
- Location: `utils/fileManager.js`
- Contains: Directory creation, file writing, periodic cleanup scheduler
- Depends on: Node.js fs module, path module
- Used by: Download routes to create session directories and clean up after transfers

**External Integration Layer:**
- Purpose: Communicates with Suno.com APIs and services
- Location: `routes/playlist.js` for playlist fetching, `routes/download.js` for audio
- Contains: Puppeteer browser automation, API endpoint requests
- Depends on: Puppeteer browser instance, node-fetch HTTP client
- Used by: Download flow and playlist data retrieval

## Data Flow

**Playlist Retrieval Flow:**

1. User enters Suno URL or username in `App.tsx`
2. `Suno.getSongsFromPlayList()` called in `client/src/services/Suno.ts`
3. Fetch to `GET /api/playlist/{id}/all` endpoint
4. `routes/playlist.js` receives request, extracts playlist ID from URL
5. Fetches playlist metadata from Suno API
6. Launches Puppeteer browser to scrape full song list (handles infinite scroll)
7. Returns `{ playlist, clips }` object with song metadata
8. Client updates state with `IPlaylist` and `IPlaylistClip[]`

**Download Flow:**

1. User clicks download in UI, triggering `downloadPlaylist()` in `client/src/services/WebApi.ts`
2. POST to `/api/download/playlist` with `{ playlist, clips, embedImage }`
3. `routes/download.js` creates session temp directory via `createTempDirectory()`
4. For each clip:
   - Downloads MP3 audio file from `clip.audio_url`
   - If embedImage enabled: downloads image from `clip.image_url`
   - Uses node-id3 to embed metadata and cover art into MP3
   - Names file as `{clip.no} - {clip.title}.mp3` (sanitized with filenamify)
5. Adds all processed files to AdmZip archive
6. Streams ZIP to client as `Content-Type: application/zip`
7. On stream completion or client disconnect, schedules cleanup of temp directory (after 15 seconds)

**Settings Flow:**

1. `SettingsManager.ts` initializes on app load via `initializeSettingsManager()`
2. First tries localStorage key `'suno-downloader-settings'`
3. Falls back to `GET /api/settings` to retrieve server session settings
4. User modifies settings in modal, triggers `POST /api/settings`
5. `routes/settings.js` saves to `req.session.settings`
6. Client updates local state and localStorage

**State Management:**

- **Client-side:** React hooks (useState, useEffect) in App.tsx
  - `playlistUrl` - user input
  - `playlistData` - IPlaylist metadata
  - `playlistClips` - array of IPlaylistClip with status tracking
  - `downloadPercentage`, `completedItems` - download progress
  - `isDownloading`, `isGettingPlaylist` - operation flags

- **Server-side:** Express sessions
  - Stored in `req.session.settings`
  - TTL: 24 hours
  - Persisted across requests for same client

- **Persistent client-side:** localStorage
  - Key: `'suno-downloader-settings'`
  - Stores user preferences locally
  - Synced with server on login

## Key Abstractions

**IPlaylist (TypeScript Interface):**
- Purpose: Represents a single Suno playlist or user profile
- Location: `client/src/services/Suno.ts`
- Pattern: Simple data object with name and image URL
- Example: `{ name: "My Playlist", image: "https://..." }`

**IPlaylistClip (TypeScript Interface):**
- Purpose: Represents a single song/audio track
- Location: `client/src/services/Suno.ts`
- Pattern: Aggregates metadata, URLs, and status tracking
- Fields: id, no (track number), title, duration, tags, audio_url, image_url, status
- Status enum: None, Processing, Skipped, Success, Error

**SettingsManager (Singleton Class):**
- Purpose: Central hub for reading/writing user preferences
- Location: `client/src/services/SettingsManager.ts`
- Pattern: Private constructor, static `create()` factory method
- Manages: name_templates, overwrite_files, embed_images flags
- Fallback behavior: Returns default settings if server unavailable

**fileManager Module (Export Functions):**
- Purpose: Isolated file system operations
- Location: `utils/fileManager.js`
- Functions:
  - `createTempDirectory()` - Creates session-specific temp folder with 1-hour auto-cleanup
  - `cleanupTempDirectory()` - Recursive delete with safety checks
  - `schedulePeriodicCleanup()` - Hourly cleanup of stale directories (auto-started on module load)
  - `writeFile()` - Synchronous file write wrapper
  - `fileExists()` - File existence check

## Entry Points

**Server:**
- Location: `server.js`
- Triggers: `npm start` or `npm run dev`
- Responsibilities:
  - Initializes Express app with middleware (CORS, session, body parsing)
  - Mounts route handlers: `/api/playlist/*`, `/api/download/*`, `/api/settings/*`
  - Discovers and serves client dist folder (checks 14+ paths for Replit compatibility)
  - Falls back to API-only mode if client build not found
  - Error handling middleware catches all unhandled errors

**Client:**
- Location: `client/src/main.tsx`
- Triggers: Browser loads HTML, Vite builds bundle
- Responsibilities:
  - Initializes React app
  - Sets up Mantine provider with theme (light/dark)
  - Wraps App component with theme, notification, and modal providers
  - Detects system dark mode preference and restores saved theme from localStorage

**API Routes:**
- `GET /api/playlist/{id}/all` - Fetches playlist metadata + all songs
- `GET /api/playlist/@{username}/all` - Fetches user profile + all songs (browser automation)
- `POST /api/download/playlist` - Downloads entire playlist as ZIP
- `GET /api/settings` - Retrieves current settings
- `POST /api/settings` - Updates settings
- `DELETE /api/settings` - Resets to defaults

## Error Handling

**Strategy:** Try-catch wrapping with specific error messages and graceful degradation

**Patterns:**

- **Client-side:** Try-catch in service functions, errors passed to UI via `showError()` helper
  - Displays toasts to user: "Failed to fetch playlist data. Make sure you entered a valid link"
  - Logs to console and Logger service for debugging

- **Server-side:** Try-catch in route handlers, JSON error responses
  - Returns status codes: 400 (invalid input), 404 (not found), 500 (server error)
  - Error details hidden in production (only message shown)
  - Includes error stack in development mode

- **File Operations:** Safety checks in `fileManager.js`
  - Validates cleanup paths contain `TEMP_DIR` to prevent accidental deletion
  - Catches fs operations errors, logs, and returns gracefully
  - Scheduled cleanup survives individual directory failures

- **Browser Automation:** Timeout handling and fallback
  - 30-second timeout for page load in Puppeteer
  - Detects scroll completion via consecutive "no new content" checks
  - Falls back to multiple API endpoint patterns if scraping fails

## Cross-Cutting Concerns

**Logging:**
- Client: Console.log throughout, Logger service for structured events
- Server: Morgan middleware for HTTP request logging, console.log for operations
- Verbose output during playlist fetch (browser automation progress) and file operations

**Validation:**
- Client-side: URL validation in Suno.ts (regex match for playlist ID or @ username format)
- Server-side: Express request validation in download route
  - Checks playlist and clips array present and non-empty
  - Validates file paths for cleanup operations

**Authentication:**
- No explicit auth layer (public service)
- Session-based state via express-session with 24-hour TTL
- CORS configured for localhost dev and production origins

**Cleanup & Resource Management:**
- Automatic temp directory creation on session start
- Auto-cleanup after 1 hour if request hangs
- Hourly periodic cleanup sweep removes directories >24 hours old
- On successful stream: cleanup scheduled 15 seconds after transfer
- On client disconnect: cleanup scheduled 5 seconds after disconnect detection

---

*Architecture analysis: 2026-04-11*
