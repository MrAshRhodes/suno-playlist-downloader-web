# Technology Stack

**Analysis Date:** 2026-04-11

## Languages

**Primary:**
- JavaScript (Node.js) - Server-side backend, ES modules with `type: "module"`
- TypeScript 5.0.4 - Client-side frontend with React components
- HTML/CSS - Client UI styling with Mantine framework

**Secondary:**
- JSDoc - Documentation in service files where TypeScript not used

## Runtime

**Environment:**
- Node.js 20 (minimum 16.0.0) - Server runtime on Replit and production
- Browser (ES2020+) - Client runtime, React 18

**Package Manager:**
- npm (root level for server and client dependencies)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Express.js 4.19.2 - HTTP server framework
- React 18.2.0 - Client-side UI framework
- Vite 4.3.9 - Client build tool and dev server

**UI Components:**
- Mantine 6.0.13 - React component library with hooks
  - `@mantine/core` - Base components
  - `@mantine/form` - Form handling
  - `@mantine/hooks` - Utility hooks
  - `@mantine/modals` - Modal dialogs
  - `@mantine/notifications` - Toast notifications
- @tabler/icons-react 2.20.0 - Icon library

**Build/Dev:**
- Vite 4.3.9 - React build and dev server
- @vitejs/plugin-react 3.1.0 - React Fast Refresh plugin
- PostCSS 8.4.24 - CSS processing
  - postcss-preset-mantine 1.8.0 - Mantine styling
  - postcss-simple-vars 7.0.1 - CSS variables

## Key Dependencies

**Critical:**
- puppeteer 24.9.0 - Headless browser automation for Suno profile scraping with infinite scroll
- node-fetch 3.3.2 - HTTP client for API requests (ESM compatible)
- express-session 1.18.0 - Session management for user preferences storage
- adm-zip 0.5.10 - ZIP file creation for batch downloads
- node-id3 0.2.6 - MP3 ID3 tag embedding for metadata (title, track number, cover art)

**File Handling:**
- filenamify 6.0.0 - Cross-platform filename sanitization
- multer 1.4.5-lts.1 - Multipart form data handling (optional, for potential future uploads)

**Middleware:**
- cors 2.8.5 - Cross-Origin Resource Sharing for API access
- morgan 1.10.0 - HTTP request logging
- dotenv 16.4.5 - Environment variable loading

**Client Utilities:**
- uuid 9.0.0 - Session ID generation for download tracking
- p-limit 4.0.0 - Parallel download concurrency control
- scroll-into-view-if-needed 3.0.6 - Smooth scroll to active download item

## Configuration

**Environment:**
- `.env` file (server-side) - Not tracked in git
- Example at `web-version/.env.example` with defaults:
  - `PORT` (default: 3000)
  - `NODE_ENV` (production/development)
  - `SESSION_SECRET` (session encryption)
  - `CLEANUP_INTERVAL` (temp file cleanup schedule)
  - `MAX_FILE_AGE` (temp file retention duration)
  - `LOG_LEVEL` (logging verbosity)

**Build:**
- `client/vite.config.ts` - Vite configuration with React plugin
- `client/tsconfig.json` - TypeScript compiler options (if present)
- `.replit` - Replit deployment config with Node.js 20 module

## Platform Requirements

**Development:**
- Node.js 20 or higher
- npm for dependency management
- Unix shell for build scripts (build.sh)

**Production:**
- Google Cloud Run (configured via `.replit` deploymentTarget)
- Node.js 20 runtime
- File system for temporary directory `/temp` (1-hour cleanup, 24-hour max age)
- Environment variable: `NODE_ENV=production`

---

*Stack analysis: 2026-04-11*
