# Coding Conventions

**Analysis Date:** 2026-05-02

## Naming Patterns

**Files:**
- React components: PascalCase `.tsx` — `SimpleSettingsModal.tsx`, `ThemeToggle.tsx`, `StatusIcon.tsx`, `WaveformBackground.tsx`
- Service classes: PascalCase `.ts` — `Suno.ts`, `Logger.ts`, `Utils.ts`, `SettingsManager.ts`, `WebApi.ts`
- Custom hooks: camelCase `.ts` with `use` prefix — `useDarkMode.ts`, `useP5.ts`
- Sketch/canvas files: camelCase `.ts` — `waveformSketch.ts`
- Backend routes: lowercase `.js` — `playlist.js`, `download.js`, `settings.js`
- Backend utilities: camelCase `.js` — `fileManager.js`

**Functions / Methods:**
- All function names: camelCase — `getSongsFromPlayList()`, `downloadPlaylist()`, `formatSecondsToTime()`, `createTempDirectory()`
- Static class methods: camelCase — `Suno.getSongsFromPlayList()`, `Logger.log()`
- React custom hooks: `use` prefix — `useDarkMode()`, `useP5()`
- Event handlers: camelCase verb — `getPlaylist`, `downloadPlaylist`, `saveSettings`, `toggleTheme`

**Variables / State:**
- All local variables and state: camelCase — `playlistUrl`, `isGettingPlaylist`, `downloadPercentage`, `sessionDir`, `embedImages`
- React state pairs follow `[value, setValue]` — `const [opened, setOpened] = useState(false)`
- Module-level constants: UPPER_SNAKE_CASE — `TEMP_DIR`, `API_BASE`, `PORT`, `SESSION_SECRET`
- Private class properties: no underscore prefix (modern TypeScript `private` keyword) — `private settings`, `private initialized`

**Types / Interfaces / Enums:**
- Exported domain interfaces: `I` prefix — `IPlaylist`, `IPlaylistClip`
- Enums: PascalCase with `I` prefix for domain types — `IPlaylistClipStatus`
- Internal interfaces (non-exported): PascalCase, no `I` prefix — `Settings`
- Type aliases: PascalCase — `type Theme = 'light' | 'dark'`
- Props interfaces: PascalCase + `Props` suffix — `StatusIconProps`, `SimpleSettingsProps`, `WaveformBackgroundProps`

**CSS classes:**
- kebab-case — `.monolith-card`, `.support-banner`, `.btn-accent`, `.waveform-background`

## Code Style

**Formatting:**
- No ESLint, Prettier, or Biome config detected in project
- 2-space indentation throughout source files
- Semicolons used consistently in TypeScript
- Trailing commas present in multi-line arrays/objects

**TypeScript strictness:**
- No `tsconfig.json` in `client/` — relies on Vite's built-in TypeScript handling with defaults
- Generics used for typed state and returns: `useState<IPlaylist | null>(null)`, `Promise<[IPlaylist, IPlaylistClip[]]>`
- `any` used pragmatically when key lookups require it: `(this.settings as any)[key]`
- Non-null assertions used where DOM guarantee exists: `document.getElementById('root')!`
- `React.FC<Props>` typing used for some components; plain function with typed param used elsewhere

## Import Organization

**Order (from `client/src/App.tsx`):**
1. CSS imports — `import "./App.css"`
2. React core — `import { useState, useRef, useEffect } from "react"`
3. Third-party packages — `import { v4 as uuidv4 } from 'uuid'`, Tabler icons, Mantine
4. Asset imports — `import heroBannerImg from './assets/hero-banner.png'`
5. Local hooks — `import { useDarkMode } from './hooks/useDarkMode'`
6. Local components — `import ThemeToggle from './components/ThemeToggle'`
7. Local services — `import Suno, { IPlaylist, IPlaylistClip, IPlaylistClipStatus } from "./services/Suno"`

**Path style:**
- No aliases — all imports use relative paths
- Components reference services as `'../services/Suno'`
- Backend uses ES module syntax: `import express from 'express'`

## TypeScript Patterns

**Exported domain interfaces (I prefix):**
```typescript
export interface IPlaylist {
    name: string
    image: string
}

export interface IPlaylistClip {
    id: string
    no: number
    title: string
    duration: number
    tags: string
    audio_url: string
    image_url: string
    status: IPlaylistClipStatus
}
```

**Props interfaces (no I prefix):**
```typescript
interface StatusIconProps {
  status: IPlaylistClipStatus;
}
```

**Numeric enums for status:**
```typescript
export enum IPlaylistClipStatus {
    None,
    Processing,
    Skipped,
    Success,
    Error
}
```

**Static-only service classes:**
```typescript
class Suno {
    static async getSongsFromPlayList(url: string): Promise<[IPlaylist, IPlaylistClip[]]> { ... }
}
export default Suno;
```

**Private constructor + static factory:**
```typescript
class SettingsManager {
    private constructor() { this.settings = { ...defaultSettings }; }
    static async create(): Promise<SettingsManager> { ... }
}
```

**Generic methods:**
```typescript
async getSetting<T>(key: string, defaultValue: T): Promise<T>
async setSetting<T>(key: string, value: T, save = true)
```

## CSS Approach

**Three-layer system:**

**1. CSS custom properties** — `client/src/index.css`:
```css
:root.dark-mode {
  --bg-primary: #0B0D1A;
  --bg-card: #141828;
  --accent: #7B5EA7;
  --text-primary: #FFFFFF;
  --border-color: rgba(123, 94, 167, 0.15);
}
:root.light-mode {
  --bg-primary: #F0F2F8;
  --bg-card: #E4E7F0;
  --accent: #7B5EA7;
}
```
Theme switching via `document.documentElement.classList` — NOT Mantine's built-in colorScheme toggle.

**2. Global CSS classes** — `client/src/App.css`:
```css
.monolith-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  box-shadow: var(--shadow-card);
}
```
All values reference CSS variables; no hardcoded colors in global classes.

**3. Mantine v6 props + inline styles** — components:
```tsx
// Inline style for conditional one-off values
<ActionIcon style={{
  backgroundColor: theme === 'light' ? 'rgba(0,113,227,0.1)' : 'rgba(0,113,227,0.2)',
  borderRadius: '8px'
}}>

// Mantine styles prop for pseudo-selectors
styles={{ root: { '&:hover': { backgroundColor: '...' } } }}
```

**Theme propagation:**
- `theme: 'light' | 'dark'` prop drilled to components that need conditional inline styles
- `MantineProvider` receives `colorScheme` for Mantine component theming
- `useDarkMode` hook is the single source of truth — syncs to localStorage and `document.documentElement.classList`

**No CSS Modules** — no `.module.css` files; global classes only.

## Error Handling

**Component pattern — catch and call `showError`:**
```typescript
const getPlaylist = async () => {
    setIsGettingPLaylist(true);
    try {
        const data = await Suno.getSongsFromPlayList(playlistUrl);
        setPlaylistData(data[0]);
        setPlaylistClips(data[1]);
    } catch (err) {
        console.log(err);
        showError("Failed to fetch playlist data. Make sure you entered a valid link");
    }
    setIsGettingPLaylist(false);
};
```

**`showError` / `showSuccess`** (`client/src/services/Utils.ts`):
- Currently calls `alert()` — documented in source as placeholder for Mantine notifications
- Always called with a user-facing string, not a raw Error object

**Service layer — log and rethrow:**
```typescript
} catch (error) {
    console.error("Error fetching playlist:", error);
    throw error;  // Component handles user-facing display
}
```

**Server-side:**
- `res.status(400).json({ error: 'message' })` for validation failures
- `res.status(500).json({ error: 'message' })` for server errors
- All route handlers wrapped in try/catch

## Logging

**Client console methods:**
- `console.log()` — informational
- `console.error()` — errors with full context
- `console.debug()` — debug messages (e.g., silent server logging failure)

**Logger service** (`client/src/services/Logger.ts`):
- Static class; `log(data: any): Promise<boolean>`
- Stores in `localStorage` under `'suno-downloader-logs'` (capped at 50 entries)
- Entry format: `{ timestamp: ISO string, userId: string, data: any }`
- Attempts server POST to `/api/log`, fails silently if unavailable
- `getLogs()` and `clearLogs()` for retrieval/reset

**Server:** Morgan middleware for HTTP; `console.log` / `console.error` for operational messages

## Comments

**JSDoc on service functions:**
```typescript
/**
 * Gets a random number between min and max values
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random number in range
 */
export function getRandomBetween(min: number, max: number): number { ... }
```

**Brief JSDoc on components:**
```typescript
/**
 * Status icon component that displays different icons based on the status
 */
function StatusIcon({ status }: StatusIconProps) { ... }
```

**Inline comments:** Used for proxy explanation, workaround documentation, and non-obvious conditionals.

## Function Design

**Components:** Functional only — no class components in `client/src/`

**Props destructuring in signature:**
```typescript
function StatusIcon({ status }: StatusIconProps) { ... }
const WaveformBackground: React.FC<WaveformBackgroundProps> = ({ seed = 42 }) => { ... }
```

**Default parameters:** `seed = 42`, `save = true`, `embedImage: boolean = true`

**Async/await throughout** — no `.then()` chains in component code

**Functional state updater for derived updates:**
```typescript
setPlaylistClips((prevClips) =>
    prevClips.map((clip) => ({ ...clip, status: IPlaylistClipStatus.Processing }))
);
```

## Module Design

**Exports:**
- React components: `export default ComponentName`
- Service classes: `export default Suno`, `export default Logger`
- Hooks: named — `export function useDarkMode()`
- Utilities: named — `export function showError()`, `export function delay()`
- Interfaces/enums: named alongside default — `export enum IPlaylistClipStatus`, `export interface IPlaylist`
- Constants: named — `export const defaultSettings`

**No barrel files** — all imports reference the specific file path directly.

## API_BASE Pattern

Repeated in every HTTP-calling service file:
```typescript
// client/src/services/Suno.ts, WebApi.ts, SettingsManager.ts, Logger.ts
const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api';
```

---

*Convention analysis: 2026-05-02*
