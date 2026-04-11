# Coding Conventions

**Analysis Date:** 2026-04-11

## Naming Patterns

**Files:**
- Backend routes: lowercase with hyphens or `.js` extension. Example: `playlist.js`, `download.js`, `settings.js`
- Frontend components: PascalCase with `.tsx` extension. Example: `SimpleSettingsModal.tsx`, `ThemeToggle.tsx`, `StatusIcon.tsx`
- Service files: PascalCase with `.ts` extension. Example: `Suno.ts`, `Logger.ts`, `Utils.ts`, `SettingsManager.ts`
- Utility files: lowercase with `.js` extension. Example: `fileManager.js`

**Functions:**
- camelCase for all function names. Examples: `getSongsFromPlayList()`, `downloadPlaylist()`, `formatSecondsToTime()`, `createTempDirectory()`
- Static methods on classes use camelCase. Examples: `Suno.getSongsFromPlayList()`, `Logger.log()`
- React hooks follow `use` prefix pattern: `useDarkMode()`

**Variables:**
- camelCase for all variables and state. Examples: `playlistUrl`, `isGettingPlaylist`, `downloadPercentage`, `sessionDir`, `embedImages`
- State variables from React hooks: `const [variableName, setVariableName] = useState()`
- Constants at module level: UPPERCASE_WITH_UNDERSCORES (when appropriate). Example: `TEMP_DIR`, `API_BASE`, `PORT`, `SESSION_SECRET`
- Private class properties use underscore prefix when needed: `_userId` or just `userId` in modern TypeScript

**Types:**
- Interfaces use `I` prefix for TypeScript interfaces. Examples: `IPlaylist`, `IPlaylistClip`, `IPlaylistClipStatus`
- Enums use PascalCase. Example: `IPlaylistClipStatus` (enum with values: None, Processing, Skipped, Success, Error)
- Generic types follow standard TypeScript conventions

## Code Style

**Formatting:**
- No explicit formatter configured in project
- Spacing: 2-space indentation (implied by existing code)
- Line length: No strict limit observed, pragmatic approach taken
- Semicolons: Used consistently throughout

**Linting:**
- No ESLint configuration detected
- No Prettier configuration detected
- Code follows pragmatic JavaScript/TypeScript conventions without strict enforcement

## Import Organization

**Order:**
1. React imports and core dependencies
2. UI component libraries (Mantine components, Tabler icons)
3. Local services and utilities
4. Hooks and custom components
5. CSS/style imports

**Examples from codebase:**
```typescript
// App.tsx pattern
import "./App.css";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { ActionIcon, AppShell, Badge, ... } from "@mantine/core";
import { IconBrandGithub, IconCoffee, ... } from "@tabler/icons-react";
import { useDarkMode } from './hooks/useDarkMode';
import ThemeToggle from './components/ThemeToggle';
import Suno, { IPlaylist, IPlaylistClip, ... } from "./services/Suno";
```

**Path Aliases:**
- No aliases configured; relative imports used throughout
- Client side imports use relative paths: `'./hooks/useDarkMode'`, `'./services/Suno'`, `'./components/ThemeToggle'`
- Backend imports use ES modules: `import express from 'express'`, `import fetch from 'node-fetch'`

## Error Handling

**Patterns:**
- Try/catch blocks used for async operations and error-prone code
- Error messages logged to console with `console.error()`
- User-facing errors passed through error callback functions like `showError(message)`
- Error responses return HTTP status codes with JSON: `res.status(error_code).json({ error: 'message' })`
- Validation errors return 400 status. Examples: `res.status(400).json({ error: 'Invalid playlist data' })`
- Server errors return 500 status with descriptive messages
- Fetch errors caught and rethrown with context

**Examples from routes:**
```javascript
// routes/playlist.js pattern
try {
  // operation
  if (!url) {
    return res.status(400).json({ message: 'Playlist URL is required' });
  }
  // more code
} catch (error) {
  console.error('Playlist fetch error:', error);
  res.status(500).json({ message: 'Failed to fetch playlist data' });
}
```

## Logging

**Framework:** Console and browser console methods (no dedicated logging library)

**Patterns:**
- `console.log()` for informational messages
- `console.error()` for errors with full error context
- `console.debug()` for debug-level messages (fallback behavior)
- Structured logging with context: `console.log('Message:', details)`
- Timestamp-based logging in Logger service using `new Date().toISOString()`
- Browser localStorage used as log storage: `localStorage.getItem('suno-downloader-logs')`

**Examples:**
```javascript
// server.js
console.log('Current directory:', __dirname);
console.log(`Server running on port ${PORT}`);

// routes/playlist.js
console.log(`Starting browser automation to fetch all ${totalSongs} songs...`);
console.log(`✅ Found client dist path:`, distPath);

// Client services
const log = {
  timestamp: new Date().toISOString(),
  userId: this.userId,
  data
};
```

## Comments

**When to Comment:**
- Functions with non-obvious behavior include JSDoc-style comments
- Complex logic blocks explain intent
- Workarounds and temporary solutions marked with explanation
- Configuration parameters documented at module level
- API endpoint behaviors documented above route handlers

**JSDoc/TSDoc:**
- Used above route handlers in backend. Pattern:
```javascript
/**
 * @route POST /api/playlist/fetch
 * @description Fetch playlist by URL
 * @access Public
 */
router.post('/fetch', async (req, res) => { ... });
```
- Service classes document public static methods:
```typescript
/**
 * Fetch songs from a playlist
 * @returns Promise with playlist data and clips array
 */
static async getSongsFromPlayList(url: string): Promise<[IPlaylist, IPlaylistClip[]]>
```
- Utility functions documented with parameter and return types

## Function Design

**Size:**
- Functions range from 10-100+ lines depending on complexity
- Some functions are more procedural (download.js routes handle request/response)
- Service functions tend to be more focused (Suno.ts methods)

**Parameters:**
- Destructuring used for object parameters. Example: `const { url } = req.body`
- Event handlers receive standard parameters: `(req, res)` for Express, `(e) => {}` for React events
- Async functions return Promises with typed generics in TypeScript

**Return Values:**
- HTTP routes return response via `res.json()`, `res.status().json()`, etc.
- Service methods return typed promises: `Promise<[IPlaylist, IPlaylistClip[]]>`
- UI component functions return JSX

## Module Design

**Exports:**
- Backend routes export as default: `export default router`
- Service classes export as default: `export default Suno`, `export default Logger`
- React components export as named function: `export default SimpleSettingsModal`
- Utility functions export as named exports: `export const createTempDirectory = async ()`

**Barrel Files:**
- No barrel files (index.ts with re-exports) detected
- Components imported directly from their files
- Services imported with full paths

## Special Patterns

**API Base Configuration:**
- Conditional API_BASE based on NODE_ENV:
```typescript
const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api';
```

**State Management (React):**
- useState hook for local component state
- No Redux or context API observed
- Props passed down directly to child components
- Session/local storage used for persistence: `localStorage.getItem()`, `localStorage.setItem()`

**Async Operations:**
- Promise-based async/await throughout
- Promise.all() for parallel operations: `await Promise.all(downloadPromises)`
- Fetch API for HTTP requests with manual error handling

**React Component Pattern:**
- Functional components with hooks
- useEffect for side effects and initialization
- useRef for DOM references: `const songTable = useRef<HTMLTableElement>(null)`
- Theme prop drilling for styling context

---

*Convention analysis: 2026-04-11*
