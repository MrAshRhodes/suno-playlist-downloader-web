---
updated_at: "2026-05-02T12:00:00.000Z"
---

## Architecture Overview

Suno Playlist Downloader is a Node/Express API plus React/Vite frontend (Monolith design system, v2.0). The active root implementation is launched from `server.js`, serves API routes from `routes/*.js`, serves prebuilt files from `public/` when available, and can build `client/` assets when static files are missing. The `web-version/` directory contains an older duplicate implementation with similar API routes and a larger client workflow.

The v2.0 Monolith UI milestone added: animated p5.js waveform background, DonationModal, Adsterra AdSlot, Google AdSense in `public/index.html`, full OG/Twitter/JSON-LD SEO meta in `public/index.html`, `robots.txt`, `sitemap.xml`, and Inter font via Google Fonts. Security patches: `uuid` upgraded to ^14.0.0, `vite` to ^8.0.8, `@vitejs/plugin-react` to ^6.0.1, `multer` removed from root, `qs`/`on-headers` overrides in `web-version/package.json`.

## Key Components

| Component | Path | Responsibility |
|-----------|------|---------------|
| Express server | `server.js` | Configures middleware, sessions, CORS, API route mounting, debug endpoint, static asset selection, build fallback, SPA fallback, and error handling. |
| Playlist API | `routes/playlist.js` | Proxies Suno playlist pages, aggregates full playlist pages, parses playlist URLs, and implements experimental username song extraction with API and Puppeteer fallback strategies. |
| Download API | `routes/download.js` | Downloads MP3 audio, embeds optional cover art with `node-id3`, creates ZIP files with `adm-zip`, streams ZIP responses, exposes SSE progress registration, and cleans temp directories. |
| Settings API | `routes/settings.js` | Stores download settings in the Express session and provides get/update/reset endpoints. |
| Temp file utilities | `utils/fileManager.js` | Creates per-session temp directories, schedules periodic cleanup, writes files, and checks file existence. |
| React entry | `client/src/main.tsx` | Mounts React, Mantine providers, notifications, modals, and initial light/dark document class. |
| Main UI | `client/src/App.tsx` | Coordinates playlist input, playlist fetch, song review table, ZIP download, donation modal cadence, Adsterra slot, theme toggle, and progress UI. Imports WaveformBackground, DonationModal, and AdSlot added in v2.0. |
| Client API services | `client/src/services/Suno.ts`, `client/src/services/WebApi.ts`, `client/src/services/SettingsManager.ts` | Encapsulate backend API calls for playlist/user lookup, ZIP download, SSE progress, and settings persistence. |
| Visual background | `client/src/components/WaveformBackground.tsx`, `client/src/hooks/useP5.ts`, `client/src/sketches/waveformSketch.ts` | Mount a seeded p5.js waveform canvas behind the UI; 8-layer noise waveforms with dark/light mode color gradients; resizes with viewport. |
| Donation modal | `client/src/components/DonationModal.tsx` | Buy-me-a-coffee prompt using Mantine Modal with CSS variable theming and `donation-banner.png` asset. |
| Advertising slot | `client/src/components/AdSlot.tsx` | Injects the Adsterra banner script using `VITE_ADSTERRA_UNIT_KEY`, reserves layout height for CLS stability. Single-instance constraint documented inline. |
| Deployment assets | `public/`, `build.sh`, `deploy.sh`, `.replit`, `replit.json` | Support Replit/cloud deployment with prebuilt static files, npm script build/start flows, SEO files (ads.txt, robots.txt, sitemap.xml), and OG meta. |
| Legacy duplicate | `web-version/` | Preserves an earlier web implementation with similar Express routes and a client flow that still includes single-song download support. Has `qs`/`on-headers` security overrides. |

## Data Flow

User enters a Suno playlist URL in `client/src/App.tsx` -> `client/src/services/Suno.ts` extracts the playlist ID and calls `GET /api/playlist/:id/all` -> `routes/playlist.js` fetches paginated playlist data from `https://studio-api.prod.suno.com/api/playlist/:id/` -> normalized playlist and clip arrays return to the UI.

When the user downloads, `client/src/services/WebApi.ts` posts playlist metadata and clips to `POST /api/download/playlist` -> `routes/download.js` fetches each clip audio URL, optionally fetches cover images and writes ID3 tags, creates a ZIP in a temp session directory, streams the ZIP to the browser, and schedules cleanup through `utils/fileManager.js`.

Settings flow through `client/src/services/SettingsManager.ts` and browser `localStorage`, with session synchronization through `routes/settings.js`. Theme state is stored in `localStorage` by `client/src/hooks/useDarkMode.ts` and applied as `dark-mode` or `light-mode` classes on the document root.

## Conventions

The backend uses native ESM imports (`"type": "module"` in `package.json`) and default-exported Express routers from `routes/*.js`. API routes are mounted under `/api/playlist`, `/api/download`, and `/api/settings` in `server.js`.

The frontend uses React function components, colocated service modules under `client/src/services/`, custom hooks under `client/src/hooks/`, and CSS variables in `client/src/index.css` and `client/src/App.css` for theme-aware styling. Runtime API base URLs are selected by `process.env.NODE_ENV`, using `/api` in production and `http://localhost:3000/api` in development.

Visual styling uses CSS custom properties (`--bg-primary`, `--bg-card`, `--accent`, `--text-primary`, `--border-color`, etc.) consistently across App.css, component inline styles, and the p5.js sketch — enabling seamless dark/light mode switching without Mantine theme props.

Deployment prefers prebuilt files in `public/` for Replit compatibility. `server.js` checks `public/`, Replit workspace public paths, `client/dist`, and root `dist` before attempting a client build. SEO and ad files (`ads.txt`, `robots.txt`, `sitemap.xml`) are served explicitly before the SPA catch-all.
