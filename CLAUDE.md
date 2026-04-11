# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands
- `yarn dev` - Start the development server
- `yarn build` - Build the application (TypeScript + Vite)
- `yarn tauri` - Run Tauri commands
- `yarn preview` - Preview the built application

## Code Style Guidelines
- **Imports**: Group imports by type (React, components, services, plugins)
- **Types**: Use explicit TypeScript interfaces and types, with strict typing when possible
- **Naming**: Use camelCase for variables/functions, PascalCase for components/classes
- **Error Handling**: Use try/catch with appropriate error messages
- **Components**: Functional components with React hooks
- **CSS**: Use Mantine components and style props, CSS modules for custom styling
- **State Management**: React useState/useEffect hooks, avoid global state when possible
- **File Structure**: Components in src/components, services in src/services
- **File Naming**: Component files use PascalCase (.tsx), service files use PascalCase (.ts)

## Version Control
- Use git to track changes and make rollback easy

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Suno Playlist Downloader — Visual Modernization**

A web-based tool that downloads music from Suno playlists and user profiles as ZIP archives with embedded ID3 metadata. It's live on Replit and fully functional. This project focuses exclusively on visual modernization — upgrading the UI to a premium dark-first design with algorithmic art, while preserving all existing functionality.

**Core Value:** The app must continue to work exactly as it does now — every download flow, every setting, every API call unchanged. Visual changes only.

### Constraints

- **No functional changes**: Every download flow, API call, and setting must continue working identically
- **Mantine v6**: Cannot upgrade — too many breaking changes, risk to functionality
- **Replit deployment**: Must remain deployable on Replit with current build process
- **Build process**: `build.sh` and Vite config must continue to work
- **Client-only changes**: All modifications confined to `client/src/`
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- JavaScript (Node.js) - Server-side backend, ES modules with `type: "module"`
- TypeScript 5.0.4 - Client-side frontend with React components
- HTML/CSS - Client UI styling with Mantine framework
- JSDoc - Documentation in service files where TypeScript not used
## Runtime
- Node.js 20 (minimum 16.0.0) - Server runtime on Replit and production
- Browser (ES2020+) - Client runtime, React 18
- npm (root level for server and client dependencies)
- Lockfile: `package-lock.json` present
## Frameworks
- Express.js 4.19.2 - HTTP server framework
- React 18.2.0 - Client-side UI framework
- Vite 4.3.9 - Client build tool and dev server
- Mantine 6.0.13 - React component library with hooks
- @tabler/icons-react 2.20.0 - Icon library
- Vite 4.3.9 - React build and dev server
- @vitejs/plugin-react 3.1.0 - React Fast Refresh plugin
- PostCSS 8.4.24 - CSS processing
## Key Dependencies
- puppeteer 24.9.0 - Headless browser automation for Suno profile scraping with infinite scroll
- node-fetch 3.3.2 - HTTP client for API requests (ESM compatible)
- express-session 1.18.0 - Session management for user preferences storage
- adm-zip 0.5.10 - ZIP file creation for batch downloads
- node-id3 0.2.6 - MP3 ID3 tag embedding for metadata (title, track number, cover art)
- filenamify 6.0.0 - Cross-platform filename sanitization
- multer 1.4.5-lts.1 - Multipart form data handling (optional, for potential future uploads)
- cors 2.8.5 - Cross-Origin Resource Sharing for API access
- morgan 1.10.0 - HTTP request logging
- dotenv 16.4.5 - Environment variable loading
- uuid 9.0.0 - Session ID generation for download tracking
- p-limit 4.0.0 - Parallel download concurrency control
- scroll-into-view-if-needed 3.0.6 - Smooth scroll to active download item
## Configuration
- `.env` file (server-side) - Not tracked in git
- Example at `web-version/.env.example` with defaults:
- `client/vite.config.ts` - Vite configuration with React plugin
- `client/tsconfig.json` - TypeScript compiler options (if present)
- `.replit` - Replit deployment config with Node.js 20 module
## Platform Requirements
- Node.js 20 or higher
- npm for dependency management
- Unix shell for build scripts (build.sh)
- Google Cloud Run (configured via `.replit` deploymentTarget)
- Node.js 20 runtime
- File system for temporary directory `/temp` (1-hour cleanup, 24-hour max age)
- Environment variable: `NODE_ENV=production`
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Backend routes: lowercase with hyphens or `.js` extension. Example: `playlist.js`, `download.js`, `settings.js`
- Frontend components: PascalCase with `.tsx` extension. Example: `SimpleSettingsModal.tsx`, `ThemeToggle.tsx`, `StatusIcon.tsx`
- Service files: PascalCase with `.ts` extension. Example: `Suno.ts`, `Logger.ts`, `Utils.ts`, `SettingsManager.ts`
- Utility files: lowercase with `.js` extension. Example: `fileManager.js`
- camelCase for all function names. Examples: `getSongsFromPlayList()`, `downloadPlaylist()`, `formatSecondsToTime()`, `createTempDirectory()`
- Static methods on classes use camelCase. Examples: `Suno.getSongsFromPlayList()`, `Logger.log()`
- React hooks follow `use` prefix pattern: `useDarkMode()`
- camelCase for all variables and state. Examples: `playlistUrl`, `isGettingPlaylist`, `downloadPercentage`, `sessionDir`, `embedImages`
- State variables from React hooks: `const [variableName, setVariableName] = useState()`
- Constants at module level: UPPERCASE_WITH_UNDERSCORES (when appropriate). Example: `TEMP_DIR`, `API_BASE`, `PORT`, `SESSION_SECRET`
- Private class properties use underscore prefix when needed: `_userId` or just `userId` in modern TypeScript
- Interfaces use `I` prefix for TypeScript interfaces. Examples: `IPlaylist`, `IPlaylistClip`, `IPlaylistClipStatus`
- Enums use PascalCase. Example: `IPlaylistClipStatus` (enum with values: None, Processing, Skipped, Success, Error)
- Generic types follow standard TypeScript conventions
## Code Style
- No explicit formatter configured in project
- Spacing: 2-space indentation (implied by existing code)
- Line length: No strict limit observed, pragmatic approach taken
- Semicolons: Used consistently throughout
- No ESLint configuration detected
- No Prettier configuration detected
- Code follows pragmatic JavaScript/TypeScript conventions without strict enforcement
## Import Organization
- No aliases configured; relative imports used throughout
- Client side imports use relative paths: `'./hooks/useDarkMode'`, `'./services/Suno'`, `'./components/ThemeToggle'`
- Backend imports use ES modules: `import express from 'express'`, `import fetch from 'node-fetch'`
## Error Handling
- Try/catch blocks used for async operations and error-prone code
- Error messages logged to console with `console.error()`
- User-facing errors passed through error callback functions like `showError(message)`
- Error responses return HTTP status codes with JSON: `res.status(error_code).json({ error: 'message' })`
- Validation errors return 400 status. Examples: `res.status(400).json({ error: 'Invalid playlist data' })`
- Server errors return 500 status with descriptive messages
- Fetch errors caught and rethrown with context
## Logging
- `console.log()` for informational messages
- `console.error()` for errors with full error context
- `console.debug()` for debug-level messages (fallback behavior)
- Structured logging with context: `console.log('Message:', details)`
- Timestamp-based logging in Logger service using `new Date().toISOString()`
- Browser localStorage used as log storage: `localStorage.getItem('suno-downloader-logs')`
## Comments
- Functions with non-obvious behavior include JSDoc-style comments
- Complex logic blocks explain intent
- Workarounds and temporary solutions marked with explanation
- Configuration parameters documented at module level
- API endpoint behaviors documented above route handlers
- Used above route handlers in backend. Pattern:
- Service classes document public static methods:
- Utility functions documented with parameter and return types
## Function Design
- Functions range from 10-100+ lines depending on complexity
- Some functions are more procedural (download.js routes handle request/response)
- Service functions tend to be more focused (Suno.ts methods)
- Destructuring used for object parameters. Example: `const { url } = req.body`
- Event handlers receive standard parameters: `(req, res)` for Express, `(e) => {}` for React events
- Async functions return Promises with typed generics in TypeScript
- HTTP routes return response via `res.json()`, `res.status().json()`, etc.
- Service methods return typed promises: `Promise<[IPlaylist, IPlaylistClip[]]>`
- UI component functions return JSX
## Module Design
- Backend routes export as default: `export default router`
- Service classes export as default: `export default Suno`, `export default Logger`
- React components export as named function: `export default SimpleSettingsModal`
- Utility functions export as named exports: `export const createTempDirectory = async ()`
- No barrel files (index.ts with re-exports) detected
- Components imported directly from their files
- Services imported with full paths
## Special Patterns
- Conditional API_BASE based on NODE_ENV:
- useState hook for local component state
- No Redux or context API observed
- Props passed down directly to child components
- Session/local storage used for persistence: `localStorage.getItem()`, `localStorage.setItem()`
- Promise-based async/await throughout
- Promise.all() for parallel operations: `await Promise.all(downloadPromises)`
- Fetch API for HTTP requests with manual error handling
- Functional components with hooks
- useEffect for side effects and initialization
- useRef for DOM references: `const songTable = useRef<HTMLTableElement>(null)`
- Theme prop drilling for styling context
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Dual-layer frontend (React client + Vite) communicates with Node.js/Express backend
- Backend acts as proxy to Suno.com APIs and handles file operations
- Streaming ZIP download for playlist aggregation
- Session-based state management with server-side cleanup
- Browser automation (Puppeteer) for profile scraping fallback
## Layers
- Purpose: User interface for playlist discovery and download management
- Location: `client/src/`
- Contains: React components, custom hooks, TypeScript services
- Depends on: Mantine UI framework, Tabler icons
- Used by: Browser users via Vite dev server (port 5173) or production static serving
- Purpose: Abstracts HTTP communication to backend endpoints
- Location: `client/src/services/` (Suno.ts, WebApi.ts, SettingsManager.ts)
- Contains: Fetch wrappers, playlist/download/settings API calls
- Depends on: Express backend API endpoints
- Used by: React components and App.tsx
- Purpose: Routes HTTP requests, orchestrates file operations, proxies external APIs
- Location: `server.js`, `routes/` directory
- Contains: Express route handlers, middleware configuration
- Depends on: Puppeteer for browser automation, node-fetch for HTTP requests, AdmZip for ZIP creation
- Used by: Client frontend via REST API calls
- Purpose: Handles temporary file creation, cleanup, and disk operations
- Location: `utils/fileManager.js`
- Contains: Directory creation, file writing, periodic cleanup scheduler
- Depends on: Node.js fs module, path module
- Used by: Download routes to create session directories and clean up after transfers
- Purpose: Communicates with Suno.com APIs and services
- Location: `routes/playlist.js` for playlist fetching, `routes/download.js` for audio
- Contains: Puppeteer browser automation, API endpoint requests
- Depends on: Puppeteer browser instance, node-fetch HTTP client
- Used by: Download flow and playlist data retrieval
## Data Flow
- **Client-side:** React hooks (useState, useEffect) in App.tsx
- **Server-side:** Express sessions
- **Persistent client-side:** localStorage
## Key Abstractions
- Purpose: Represents a single Suno playlist or user profile
- Location: `client/src/services/Suno.ts`
- Pattern: Simple data object with name and image URL
- Example: `{ name: "My Playlist", image: "https://..." }`
- Purpose: Represents a single song/audio track
- Location: `client/src/services/Suno.ts`
- Pattern: Aggregates metadata, URLs, and status tracking
- Fields: id, no (track number), title, duration, tags, audio_url, image_url, status
- Status enum: None, Processing, Skipped, Success, Error
- Purpose: Central hub for reading/writing user preferences
- Location: `client/src/services/SettingsManager.ts`
- Pattern: Private constructor, static `create()` factory method
- Manages: name_templates, overwrite_files, embed_images flags
- Fallback behavior: Returns default settings if server unavailable
- Purpose: Isolated file system operations
- Location: `utils/fileManager.js`
- Functions:
## Entry Points
- Location: `server.js`
- Triggers: `npm start` or `npm run dev`
- Responsibilities:
- Location: `client/src/main.tsx`
- Triggers: Browser loads HTML, Vite builds bundle
- Responsibilities:
- `GET /api/playlist/{id}/all` - Fetches playlist metadata + all songs
- `GET /api/playlist/@{username}/all` - Fetches user profile + all songs (browser automation)
- `POST /api/download/playlist` - Downloads entire playlist as ZIP
- `GET /api/settings` - Retrieves current settings
- `POST /api/settings` - Updates settings
- `DELETE /api/settings` - Resets to defaults
## Error Handling
- **Client-side:** Try-catch in service functions, errors passed to UI via `showError()` helper
- **Server-side:** Try-catch in route handlers, JSON error responses
- **File Operations:** Safety checks in `fileManager.js`
- **Browser Automation:** Timeout handling and fallback
## Cross-Cutting Concerns
- Client: Console.log throughout, Logger service for structured events
- Server: Morgan middleware for HTTP request logging, console.log for operations
- Verbose output during playlist fetch (browser automation progress) and file operations
- Client-side: URL validation in Suno.ts (regex match for playlist ID or @ username format)
- Server-side: Express request validation in download route
- No explicit auth layer (public service)
- Session-based state via express-session with 24-hour TTL
- CORS configured for localhost dev and production origins
- Automatic temp directory creation on session start
- Auto-cleanup after 1 hour if request hangs
- Hourly periodic cleanup sweep removes directories >24 hours old
- On successful stream: cleanup scheduled 15 seconds after transfer
- On client disconnect: cleanup scheduled 5 seconds after disconnect detection
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
