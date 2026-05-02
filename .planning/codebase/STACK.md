# Technology Stack

**Analysis Date:** 2026-05-02

## Languages

**Primary:**
- TypeScript 5.0.4 — Client-side frontend (`client/src/`)
- JavaScript (ES modules, `type: "module"`) — Server-side backend (`server.js`, `routes/`, `utils/`)

**Secondary:**
- HTML/CSS — Client shell (`client/index.html`) and Mantine-driven styling
- JSDoc — Documentation in server-side JS files

## Runtime

**Environment:**
- Node.js 20 (minimum 16.0.0 per root `package.json`; `web-version/` requires ≥18.0.0)
- Browser (ES2020+) — React 18 SPA served from `public/` (pre-built) or `client/dist/`

**Package Manager:**
- npm — root and `client/` each have independent `package.json` / `package-lock.json`
- Lockfile: present at root and `client/`

## Frameworks

**Core:**
- Express.js 4.19.2 — HTTP server, routing, session management (`server.js`)
- React 18.2.0 — Client-side SPA (`client/src/main.tsx`)
- Mantine 6.0.13 — React component library; **locked at v6 — cannot upgrade** (`client/src/`)
  - `@mantine/core`, `@mantine/hooks`, `@mantine/form`, `@mantine/modals`, `@mantine/notifications`

**Build/Dev:**
- Vite 8.0.8 — Client build tool and dev server (`client/vite.config.ts`)
  - Dev server: port 5000, proxies `/api` → `http://localhost:3000`
  - Build output: `client/dist/` (copied to `public/` for Replit deployment)
- `@vitejs/plugin-react` 6.0.1 — React Fast Refresh plugin
- PostCSS 8.4.24 — CSS processing
  - `postcss-preset-mantine` 1.8.0 — Mantine theme compatibility
  - `postcss-simple-vars` 7.0.1 — CSS custom properties
- TypeScript (`tsc`) — type-checking; `build:ts` script in `client/package.json`
- nodemon 3.1.0 — backend dev file-watcher
- concurrently 8.2.2 — runs server + Vite in parallel (`npm run dev-full`)

**Creative/Animation:**
- p5.js 1.11.13 — generative waveform background animation
  - Sketch factory: `client/src/sketches/waveformSketch.ts`
  - React hook: `client/src/hooks/useP5.ts`
  - Component: `client/src/components/WaveformBackground.tsx`
  - Types: `@types/p5` 1.7.7

## Key Dependencies

**Critical (server):**
- `puppeteer` 24.9.0 — headless Chrome for Suno profile scraping with infinite scroll (`routes/playlist.js`)
- `node-fetch` 3.3.2 — ESM-compatible HTTP client for Suno API proxy calls (`routes/playlist.js`, `routes/download.js`)
- `adm-zip` 0.5.10 — ZIP archive creation for batch playlist download (`routes/download.js`)
- `node-id3` 0.2.6 — MP3 ID3 tag embedding (title, track number, cover art) (`routes/download.js`)
- `express-session` 1.18.0 — session-based settings storage, 24-hour TTL (`server.js`)
- `filenamify` 6.0.0 — cross-platform filename sanitization (both server and client)

**Server middleware:**
- `cors` 2.8.5 — CORS for localhost dev + production origins (`server.js`)
- `morgan` 1.10.0 — HTTP request logging (`server.js`)
- `dotenv` 16.4.5 — environment variable loading (`server.js`)

**Client utilities:**
- `p-limit` 4.0.0 — concurrency control for parallel MP3 downloads
- `scroll-into-view-if-needed` 3.0.6 — smooth scroll to active download row
- `uuid` 14.0.0 — session ID generation
- `@tabler/icons-react` 2.20.0 — icon library

**Note on `web-version/`:** The `web-version/` subdirectory is an older reference copy (Mantine v7, no puppeteer, separate deployment). Active development uses root + `client/`.

## Dev vs Prod Dependency Split

**Server devDependencies (root `package.json`):**
- `nodemon` 3.1.0 — hot reload
- `concurrently` 8.2.2 — parallel process runner

**Client devDependencies (`client/package.json`):**
- `@vitejs/plugin-react` 6.0.1
- `postcss` + plugins
- `typescript` 5.0.4
- `@types/react`, `@types/react-dom`, `@types/p5`

**All server production dependencies** are listed in root `dependencies` (Express, puppeteer, node-fetch, adm-zip, node-id3, etc.).

## Configuration

**Environment:**
- `.env` at project root — not tracked in git
- Example at `web-version/.env.example`:
  - `PORT` (default: 3000)
  - `NODE_ENV` (`production` enables secure cookies)
  - `SESSION_SECRET` — required for session security
  - `CLEANUP_INTERVAL` (ms, default 3600000 = 1 hour)
  - `MAX_FILE_AGE` (ms, default 86400000 = 24 hours)
  - `LOG_LEVEL`
- Client reads `process.env.NODE_ENV` to set `API_BASE` (`/api` in production, `http://localhost:3000/api` in dev)

**Build:**
- `client/vite.config.ts` — Vite config; dev proxy, build output dir
- `client/postcss.config.cjs` — PostCSS plugins for Mantine
- `build.sh` — Replit build script; skips client build if `public/` is already populated
- `deploy.sh` — local workflow: builds `client/dist/`, copies to `public/`, commits, pushes to git

## Platform Requirements

**Development:**
- Node.js 20
- npm
- Unix shell for `build.sh` and `deploy.sh`
- Chromium installed automatically by Puppeteer

**Production:**
- Google Cloud Run (configured via `.replit` `deploymentTarget = "cloudrun"`)
- Node.js 20 runtime (Replit `modules = ["nodejs-20"]`)
- Static files served from committed `public/` directory
- Writable filesystem for `./temp/` download sessions
- `NODE_ENV=production` set by `.replit` `[env]` block
- Ports: 3000 (Express) → external port 80

---

*Stack analysis: 2026-05-02*
