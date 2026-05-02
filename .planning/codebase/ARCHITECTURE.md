<!-- refreshed: 2026-05-02 -->
# Architecture

**Analysis Date:** 2026-05-02

## System Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React 18)                        │
│  App.tsx  →  WaveformBackground  │  DonationModal  │  AdSlot    │
│  client/src/App.tsx              client/src/components/         │
└──────────┬──────────────────────────────────────────────────────┘
           │  fetch() / EventSource (SSE)
           │  /api/playlist/*  /api/download/*  /api/settings/*
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express Server  (server.js)                   │
│  GET  /api/playlist/:id/all       POST /api/download/playlist   │
│  routes/playlist.js               routes/download.js            │
│  GET/POST/DELETE /api/settings                                  │
│                     routes/settings.js                          │
└──────┬──────────────────────────┬──────────────────────────────┘
       │                          │
       ▼                          ▼
┌──────────────┐        ┌─────────────────────┐
│  Suno.com    │        │  Local Filesystem    │
│  REST API    │        │  /temp/<session-id>/ │
│  (node-fetch)│        │  utils/fileManager.js│
│              │        │  → node-id3 (tags)   │
│  Puppeteer   │        │  → AdmZip → ZIP blob │
│  (profile    │        │  → streamed to client│
│   fallback)  │        └─────────────────────┘
└──────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `App` | Root state machine — URL input, playlist state, download trigger | `client/src/App.tsx` |
| `WaveformBackground` | Full-screen animated canvas backdrop (p5.js, 30 fps) | `client/src/components/WaveformBackground.tsx` |
| `DonationModal` | Mantine Modal shown after download 1, then every 5th download | `client/src/components/DonationModal.tsx` |
| `AdSlot` | Adsterra banner — single-instance global `window.atOptions` injection | `client/src/components/AdSlot.tsx` |
| `ThemeToggle` | Light/dark toggle, driven by `useDarkMode` hook | `client/src/components/ThemeToggle.tsx` |
| `StatusIcon` | Per-row status badge (None/Processing/Skipped/Success/Error) | `client/src/components/StatusIcon.tsx` |
| `Footer` | Static footer content | `client/src/components/Footer.tsx` |
| `Suno` | Client-side proxy — URL parsing, calls `/api/playlist/*` | `client/src/services/Suno.ts` |
| `WebApi` | Download orchestration — calls `/api/download/playlist`, handles blob + SSE | `client/src/services/WebApi.ts` |
| `SettingsManager` | localStorage + server session sync for user preferences | `client/src/services/SettingsManager.ts` |
| `Logger` | Structured event logging to `localStorage` | `client/src/services/Logger.ts` |
| `playlist.js` | Fetches Suno playlist/user-profile data; Puppeteer infinite-scroll fallback | `routes/playlist.js` |
| `download.js` | Downloads MP3s in parallel, embeds ID3 tags, streams ZIP blob | `routes/download.js` |
| `settings.js` | CRUD on `req.session.settings` | `routes/settings.js` |
| `fileManager.js` | Temp directory lifecycle (create, cleanup, periodic sweep) | `utils/fileManager.js` |

## Pattern Overview

**Overall:** Thin React frontend + Node.js backend proxy. Browser never calls Suno APIs directly — all external HTTP goes through Express.

**Key Characteristics:**
- Single-page app served as static bundle from `public/` by Express in production
- All Suno.com API calls are proxied server-side to avoid CORS and rate-limit issues
- File assembly (ZIP + ID3 tags) happens entirely on the server; client receives a binary blob
- Server-Sent Events (SSE) used for real-time download progress without WebSockets
- No Redux/Context — all state is `useState` in `App.tsx` plus `localStorage` for persistence

## Layers

**UI Layer:**
- Purpose: User interaction, visual feedback, settings
- Location: `client/src/`
- Contains: React components, custom hooks, CSS modules
- Depends on: Mantine v6, p5.js (via `useP5` hook), Tabler icons
- Used by: Browser; loaded from `public/index.html`

**Client Service Layer:**
- Purpose: Abstracts all HTTP communication to backend
- Location: `client/src/services/`
- Contains: `Suno.ts` (playlist fetch), `WebApi.ts` (download + SSE), `SettingsManager.ts`, `Logger.ts`, `Utils.ts`
- Depends on: Express backend API endpoints at `/api/*`
- Used by: `App.tsx` exclusively

**Express API Layer:**
- Purpose: Routes, middleware, external API proxy
- Location: `server.js`, `routes/`
- Contains: `playlist.js`, `download.js`, `settings.js`
- Depends on: `node-fetch`, `puppeteer`, `adm-zip`, `node-id3`, `express-session`
- Used by: Browser via fetch/SSE

**File System Layer:**
- Purpose: Temp file lifecycle management
- Location: `utils/fileManager.js`
- Contains: `createTempDirectory`, `cleanupTempDirectory`, `schedulePeriodicCleanup`, `writeFile`, `fileExists`
- Depends on: Node.js `fs`, `path`, `crypto`
- Used by: `routes/download.js`

**Static Serving Layer:**
- Purpose: Serves pre-built React bundle and SEO files
- Location: `public/` (served at `/` by Express in production)
- Contains: `index.html`, hashed JS/CSS bundles, `ads.txt`, `robots.txt`, `sitemap.xml`, `og-card.png`
- Built by: `build.sh` → `cd client && npm run build` → output lands in `client/dist/`, copied/served as `public/`

## Data Flow

### Playlist Fetch

1. User pastes Suno URL — `App.tsx` calls `getPlaylist()`
2. `Suno.getSongsFromPlayList(url)` parses URL regex, calls `GET /api/playlist/{id}/all` (`client/src/services/Suno.ts`)
3. `routes/playlist.js` calls `https://studio-api.suno.ai/api/playlist/{id}?page=0` via `node-fetch`
4. For `@username` profiles, `routes/playlist.js` launches Puppeteer with infinite-scroll automation
5. Response normalized into `{ playlist: IPlaylist, clips: IPlaylistClip[] }` and returned to client
6. `App.tsx` stores into `playlistData` / `playlistClips` state; song table renders

### Download Flow

1. User clicks "Download as ZIP" — `App.tsx` calls `downloadPlaylist()`
2. `checkAndShowDonationModal()` increments `localStorage` counter; triggers `DonationModal` on 1st and every 5th download
3. `WebApi.setupProgressMonitor(sessionId, cb)` opens `EventSource` to `GET /api/download/progress/{sessionId}` (SSE)
4. `WebApi.downloadPlaylist(playlist, clips, embedImage)` → `POST /api/download/playlist` with JSON body
5. `routes/download.js` calls `createTempDirectory()`, then parallel-fetches all MP3s via `node-fetch`
6. For each MP3: writes to `temp/<session>/`, optionally fetches cover art, runs `NodeID3.write()` to embed metadata
7. `AdmZip` assembles all files; `res.send(zip.toBuffer())` streams ZIP back to browser
8. `WebApi.downloadPlaylist` receives blob → creates object URL → programmatic `<a>` click → browser saves file
9. Temp dir removed 15s after stream completes, 5s after client disconnect detection
10. SSE emits `{ progress, completedItem }` events; `App.tsx` updates progress bar and per-row `StatusIcon`

### Settings Sync

1. `SettingsManager.create()` (lazy singleton) checks `localStorage` first, then `GET /api/settings`
2. Writes via `POST /api/settings` to sync server session; degrades silently if server unavailable
3. `App.tsx` reads settings directly from `localStorage` keys (`suno-name-template`, `suno-overwrite-files`, `suno-embed-images`) at download time

## Key Abstractions

**`IPlaylistClip` (TypeScript Interface):**
- Purpose: Represents one Suno track with all metadata + download status
- Location: `client/src/services/Suno.ts`
- Fields: `id`, `no`, `title`, `duration`, `tags`, `model_version`, `audio_url`, `image_url`, `status: IPlaylistClipStatus`

**`IPlaylistClipStatus` (enum):**
- Values: `None`, `Processing`, `Skipped`, `Success`, `Error`
- Used by: `StatusIcon.tsx` for per-row badge rendering

**`SettingsManager` (Singleton):**
- Pattern: Private constructor + static `create()` factory; module-level lazy promise (`settingsManagerPromise`)
- Location: `client/src/services/SettingsManager.ts`
- Falls back to defaults if server unreachable; never throws to callers

**`createTempDirectory` / `cleanupTempDirectory`:**
- Location: `utils/fileManager.js`
- Creates `temp/<crypto-hex-id>/` per download; auto-schedules 1-hour safety cleanup; periodic sweep every hour removes dirs >24h old

**`useP5` hook:**
- Location: `client/src/hooks/useP5.ts`
- Mounts/unmounts a p5.js instance into a React `ref`; used exclusively by `WaveformBackground`

**`AdSlot` (single-instance warning):**
- Location: `client/src/components/AdSlot.tsx`
- Injects `window.atOptions` + Adsterra `invoke.js` script on mount
- WARNING: mounting two instances overwrites `window.atOptions`; see component JSDoc for multi-slot `<iframe srcDoc>` refactor path

## Entry Points

**Server:**
- Location: `server.js`
- Triggers: `npm start` or `node server.js`
- Responsibilities: Express init, middleware (Morgan, CORS, session, body parse), route mounting, static serving from `public/` with multi-path fallback for Replit, periodic temp cleanup via imported `fileManager`

**Client:**
- Location: `client/src/main.tsx`
- Triggers: Browser loads `public/index.html`, executes bundled JS
- Responsibilities: Mounts `<App />` into `#root`, wraps with Mantine `MantineProvider`

**Build:**
- Location: `build.sh`
- Triggers: Replit deploy build, `npm run build`
- Responsibilities: `npm install` (server deps), then `cd client && npm run build` (Vite outputs to `client/dist/`); `server.js` discovers and serves it via `possiblePaths` fallback logic

**API Endpoints:**
- `GET /api/playlist/{id}/all` — playlist metadata + song list
- `GET /api/playlist/@{username}/all` — user profile + songs (Puppeteer)
- `POST /api/download/playlist` — assembles and streams ZIP
- `GET /api/download/progress/{sessionId}` — SSE stream for download progress
- `GET /api/settings` — read session settings
- `POST /api/settings` — update session settings
- `DELETE /api/settings` — reset to defaults
- `GET /api/debug` — liveness check

## Architectural Constraints

- **No direct Suno API from browser:** All `suno.ai` calls go through Express proxy (CORS avoidance)
- **Single AdSlot instance:** `window.atOptions` is global; only one `<AdSlot />` per page at a time
- **Mantine v6 locked:** Cannot upgrade without significant component rewrites
- **Temp dir on local filesystem:** `temp/` is local to the Express process; incompatible with multi-replica horizontal scaling
- **In-memory session store:** `express-session` default store; settings lost on process restart or in multi-instance deployments
- **`web-version/` is NOT deployed:** Historical reference copy only. Deployed code is root `server.js` + root `client/`

## Anti-Patterns

### Duplicate `API_BASE` definition

**What happens:** `API_BASE` is independently defined with identical logic in `Suno.ts`, `WebApi.ts`, and `SettingsManager.ts`.
**Why it's wrong:** Changing the base URL requires edits in three separate files.
**Do this instead:** Extract to `client/src/services/config.ts` and import from there.

### Settings bypassed in `App.tsx`

**What happens:** `downloadPlaylist()` in `App.tsx` reads `localStorage.getItem('suno-name-template')` etc. directly, bypassing `SettingsManager`.
**Why it's wrong:** `SettingsManager` is the canonical settings source; direct localStorage reads mean server-session and local state can silently diverge.
**Do this instead:** Call `SettingsManager.getSetting()` inside `downloadPlaylist()`.

## Error Handling

**Strategy:** try/catch at each async boundary; user-facing errors surfaced via `showError()` (Mantine notification in `Utils.ts`)

**Patterns:**
- Client service functions throw on non-OK HTTP; `App.tsx` catches and calls `showError(message)`
- Express routes return `res.status(400/500).json({ error: '...' })` for all failures
- `SettingsManager` degrades silently on init error; returns defaults, never throws to callers
- `fileManager.js` validates cleanup paths contain `TEMP_DIR` before deleting; catches fs errors gracefully
- Puppeteer scroll loop exits after 3 consecutive no-change iterations (timeout safety)

## Cross-Cutting Concerns

**Logging:**
- Client: `Logger.ts` stores structured events in `localStorage('suno-downloader-logs')`; `console.log`/`console.error` throughout
- Server: Morgan HTTP logging + `console.log`/`console.error` in routes

**Theme:**
- `useDarkMode` hook (`client/src/hooks/useDarkMode.ts`) reads/writes `localStorage('theme')`, applies `dark-mode`/`light-mode` class to `<html>`
- CSS vars (`--bg-primary`, `--text-primary`, `--border-color`, etc.) drive all component theming; p5 canvas reads them via `getComputedStyle`
- Default theme: dark (hardcoded fallback in `useDarkMode`)

**SEO / Compliance:**
- `public/ads.txt`, `public/robots.txt`, `public/sitemap.xml` served as static files before SPA catch-all in `server.js`
- FTC/EU ad disclosure label rendered inline in `App.tsx` above `<AdSlot />`

---

*Architecture analysis: 2026-05-02*
