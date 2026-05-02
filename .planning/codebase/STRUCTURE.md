# Codebase Structure

**Analysis Date:** 2026-05-02

## Directory Layout

```
suno-playlist-downloader/           # Project root — deployed server
├── server.js                       # Express server entry point
├── package.json                    # Root server dependencies
├── package-lock.json               # Lockfile
├── build.sh                        # Replit deploy build script
├── deploy.sh                       # Manual deploy helper
├── Procfile                        # Process definition (npm start)
├── .replit                         # Replit environment config
├── replit.json                     # Replit JSON config
├── CLAUDE.md                       # Claude Code instructions
├── README.md                       # Project README
├── REPLIT_SETUP.md                 # Replit setup guide
├── routes/                         # Express route handlers
│   ├── playlist.js                 # GET /api/playlist/:id/all (+ @username)
│   ├── download.js                 # POST /api/download/playlist, GET progress SSE
│   └── settings.js                 # GET/POST/DELETE /api/settings
├── utils/                          # Server utility modules
│   └── fileManager.js              # Temp dir lifecycle (create/cleanup/sweep)
├── public/                         # Pre-built React bundle served by Express
│   ├── index.html                  # SPA entry (Vite-hashed)
│   ├── ads.txt                     # Adsterra ads.txt
│   ├── robots.txt                  # SEO robots
│   ├── sitemap.xml                 # SEO sitemap
│   ├── og-card.png                 # Open Graph image
│   └── assets/                     # Hashed JS/CSS/image bundles
├── client/                         # React frontend source (separate npm workspace)
│   ├── package.json                # Client dependencies (React, Mantine, Vite, p5)
│   ├── vite.config.ts              # Vite build + dev proxy config
│   ├── index.html                  # HTML shell (Vite entry)
│   ├── public/                     # Static pass-through assets
│   │   └── assets/
│   │       └── og-card.png
│   ├── dist/                       # Vite build output (generated, not committed)
│   └── src/
│       ├── main.tsx                # React bootstrap (MantineProvider)
│       ├── App.tsx                 # Root component — all main UI + state
│       ├── App.css                 # App-level CSS
│       ├── index.css               # Global CSS vars + theme tokens
│       ├── vite-env.d.ts           # Vite ambient type declarations
│       ├── assets/                 # Images imported at build time
│       │   ├── hero-banner.png
│       │   └── donation-banner.png
│       ├── icons/                  # Static icon assets
│       │   └── icons8-playlist-96.png
│       ├── components/             # React components
│       │   ├── WaveformBackground.tsx   # p5.js full-screen canvas
│       │   ├── DonationModal.tsx        # Buy-me-a-coffee prompt
│       │   ├── AdSlot.tsx               # Adsterra banner (single-instance)
│       │   ├── ThemeToggle.tsx          # Light/dark switch
│       │   ├── StatusIcon.tsx           # Per-song download status badge
│       │   ├── Footer.tsx               # Static footer
│       │   ├── SimpleSettingsModal.tsx  # Settings UI
│       │   ├── DirectSettingsButton.tsx # Settings open button
│       │   ├── SectionHeading.tsx       # Styled heading primitive
│       │   ├── BasicModal.tsx           # Generic modal wrapper
│       │   ├── ContextModal.tsx         # Context-aware modal
│       │   ├── OptionsModal.tsx         # Options panel modal
│       │   └── TestModal.tsx            # Dev testing modal
│       ├── hooks/                  # Custom React hooks
│       │   ├── useDarkMode.ts      # Theme state + localStorage sync
│       │   └── useP5.ts            # p5.js instance lifecycle
│       ├── services/               # Client-side business logic + API clients
│       │   ├── Suno.ts             # Playlist/user fetch (calls /api/playlist)
│       │   ├── WebApi.ts           # Download + SSE progress (calls /api/download)
│       │   ├── SettingsManager.ts  # Settings singleton (localStorage + server)
│       │   ├── Logger.ts           # Structured localStorage logging
│       │   └── Utils.ts            # showError / showSuccess UI helpers
│       └── sketches/               # p5.js sketch factories
│           └── waveformSketch.ts   # Animated waveform background sketch
├── temp/                           # Runtime temp dirs for downloads (auto-cleaned)
├── web-version/                    # ARCHIVE — historical reference copy, not deployed
│   ├── server.js
│   ├── routes/
│   ├── utils/
│   └── client/
├── node_modules/                   # Root server dependencies (not committed)
└── .planning/                      # GSD planning artifacts
    ├── codebase/                   # Architecture analysis docs
    ├── phases/                     # Per-phase implementation plans
    ├── milestones/
    ├── intel/
    ├── research/
    └── todos/
```

## Directory Purposes

**`routes/`:**
- Purpose: One file per API feature area
- Contains: Express `Router` instances exported as default
- Key files:
  - `playlist.js` (22KB) — Suno API calls + Puppeteer infinite-scroll for `@username` profiles
  - `download.js` (6KB) — Parallel MP3 fetch, ID3 embed, AdmZip assembly, blob stream
  - `settings.js` (2KB) — Session-backed settings CRUD

**`utils/`:**
- Purpose: Shared server utilities (no HTTP routing)
- Contains: `fileManager.js` — `createTempDirectory`, `cleanupTempDirectory`, `schedulePeriodicCleanup`, `writeFile`, `fileExists`

**`public/`:**
- Purpose: Production-ready static bundle served directly by Express at `/`
- Contains: Pre-built React app, SEO files, Open Graph assets
- Built by: `build.sh` → Vite → `client/dist/` → copied here or discovered via `possiblePaths` in `server.js`
- Committed: Yes (Replit requires pre-built assets)

**`client/src/components/`:**
- Purpose: All React UI components
- Pattern: Functional components, Mantine v6 primitives, CSS variable theming
- Key components: `WaveformBackground` (p5 canvas), `DonationModal`, `AdSlot` (Adsterra), `StatusIcon`

**`client/src/services/`:**
- Purpose: All HTTP communication + client business logic
- Pattern: Classes with static methods or lazy singletons; never imported directly in other services
- Key files: `Suno.ts` (playlist API), `WebApi.ts` (download + SSE), `SettingsManager.ts` (settings)

**`client/src/hooks/`:**
- Purpose: Custom React hooks encapsulating stateful behavior
- `useDarkMode.ts` — theme toggle + localStorage sync
- `useP5.ts` — p5.js instance mount/unmount lifecycle

**`client/src/sketches/`:**
- Purpose: p5.js sketch factory functions (not React components)
- `waveformSketch.ts` — 8-layer animated waveform using Perlin noise; reads CSS vars for theming

**`client/src/assets/`:**
- Purpose: Images imported at build time (Vite hashes and bundles them)
- Use: `import heroBannerImg from './assets/hero-banner.png'` — Vite inlines or emits with hash

**`temp/`:**
- Purpose: Runtime per-download working directories
- Generated: At request time by `fileManager.js`
- Committed: No
- Cleanup: Auto 1-hour safety timeout + 15s post-stream cleanup + hourly sweep for dirs >24h

**`web-version/`:**
- Purpose: Historical reference copy of an earlier standalone version
- Status: NOT deployed; root `server.js` and root `client/` are the deployed code
- Committed: Yes (kept as reference)

## Key File Locations

**Entry Points:**
- `server.js` — Server bootstrap, middleware, route mounting, static serving
- `client/src/main.tsx` — React app init, `MantineProvider` wrapper
- `client/src/App.tsx` — Root component, all primary UI state

**Configuration:**
- `package.json` (root) — Server deps: Express 4.19, Puppeteer 24.9, adm-zip, node-id3
- `client/package.json` — Client deps: React 18.2, Mantine 6.0.13, Vite 4.3.9, p5, Tabler icons
- `client/vite.config.ts` — Build outDir `dist`, dev proxy `/api` → `http://localhost:3000`
- `build.sh` — Replit deploy build orchestration
- `.replit` — Replit run command and deployment target

**Core Logic:**
- `routes/playlist.js` — Suno API fetch + Puppeteer profile scraping
- `routes/download.js` — MP3 download, ID3 tagging, ZIP assembly, streaming
- `routes/settings.js` — Session settings CRUD
- `utils/fileManager.js` — Temp file lifecycle
- `client/src/services/Suno.ts` — URL parsing, backend playlist API calls
- `client/src/services/WebApi.ts` — Download initiation (blob) + SSE progress monitor
- `client/src/services/SettingsManager.ts` — Settings singleton, localStorage + server sync

**Styling:**
- `client/src/index.css` — Global CSS custom properties (`--bg-primary`, `--text-primary`, `--border-color`, etc.) for dark/light themes
- `client/src/App.css` — App layout, step cards, hero banner, progress bar, song table
- Mantine components via `MantineProvider` in `main.tsx`

**Testing:**
- No test files present. No test framework configured.

## Naming Conventions

**Files:**
- Backend route files: lowercase (`playlist.js`, `download.js`, `settings.js`)
- Backend utils: camelCase (`fileManager.js`)
- Frontend components: PascalCase `.tsx` (`WaveformBackground.tsx`, `DonationModal.tsx`)
- Frontend services: PascalCase `.ts` (`Suno.ts`, `WebApi.ts`, `SettingsManager.ts`)
- Frontend hooks: camelCase with `use` prefix (`useDarkMode.ts`, `useP5.ts`)
- Frontend sketches: camelCase (`waveformSketch.ts`)

**Directories:**
- All lowercase: `routes/`, `utils/`, `components/`, `services/`, `hooks/`, `sketches/`, `assets/`, `icons/`, `temp/`

## Where to Add New Code

**New UI component:**
- Create: `client/src/components/{ComponentName}.tsx`
- Style: CSS vars in `client/src/index.css` or inline `style` props using var references
- Import: Add to `App.tsx` or parent component directly

**New API endpoint:**
- Create or edit: `routes/{feature}.js` — export `router` as default
- Register: `server.js` — `import featureRoutes from './routes/{feature}.js'` + `app.use('/api/{feature}', featureRoutes)`
- Client call: Add method to `client/src/services/WebApi.ts` or create `client/src/services/{Feature}.ts`

**New client service:**
- Create: `client/src/services/{ServiceName}.ts`
- Follow `SettingsManager.ts` singleton pattern for stateful services
- Follow `Suno.ts` static-class pattern for stateless API clients

**New backend utility:**
- Add to: `utils/fileManager.js` if file-system related, or create `utils/{module}.js`
- Export: Named ES module exports (`export const fn = ...`)

**New custom hook:**
- Create: `client/src/hooks/use{HookName}.ts`
- Export: Named export (`export function useHookName() {}`)

**New p5.js sketch:**
- Create: `client/src/sketches/{sketchName}.ts`
- Export factory: `export function create{Name}Sketch(config) { return (p: p5) => { ... } }`
- Mount via `useP5` hook in a wrapper component

**Static/SEO files:**
- Place in: `public/` (Express serves these before SPA catch-all)
- Examples: `public/ads.txt`, `public/robots.txt`, `public/sitemap.xml`

**Images imported at build time:**
- Place in: `client/src/assets/`
- Import: `import img from './assets/image.png'` — Vite hashes and bundles

## Special Directories

**`client/dist/`:**
- Generated: Yes (Vite build)
- Committed: No
- Served by: Express via `possiblePaths` discovery in `server.js`

**`public/`:**
- Generated: Partially (copied from `client/dist/` during deploy)
- Committed: Yes (Replit needs pre-built files)
- Primary static serving path; takes priority over `client/dist/` in `server.js`

**`temp/`:**
- Generated: Yes (at runtime)
- Committed: No
- Lifecycle: Created per download request, auto-deleted within 1 hour

**`web-version/`:**
- Generated: No
- Committed: Yes
- Active: No — do not modify; exists as historical reference only

**`.planning/`:**
- Generated: Yes (GSD commands)
- Committed: Yes
- Contains: Phase plans, codebase docs, research notes, todos

---

*Structure analysis: 2026-05-02*
