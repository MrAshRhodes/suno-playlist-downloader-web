# Testing Patterns

**Analysis Date:** 2026-05-02

## Test Framework

**Runner:** None — no test framework installed or configured

**Assertion Library:** None

**Run Commands:**
- No `test` script defined in `package.json` or `client/package.json`

## Current Testing Status

**Zero automated tests exist in this codebase:**
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.js` files found
- No `__tests__` directories
- No Jest, Vitest, Mocha, or any test runner in dependencies
- No `jest.config.*`, `vitest.config.*`, or test setup files

This is the complete testing picture — the project relies entirely on manual testing.

## Test File Organization (When Implemented)

**Recommended locations:**
- Service unit tests: `client/src/services/__tests__/Suno.test.ts`
- Component tests: `client/src/components/__tests__/StatusIcon.test.tsx`
- Hook tests: `client/src/hooks/__tests__/useDarkMode.test.ts`
- Backend route tests: `routes/__tests__/playlist.test.js`, `routes/__tests__/download.test.js`

**Naming pattern to adopt:**
- Match source filename + `.test.` extension
- Co-locate in `__tests__/` subdirectory alongside source

## Coverage Gaps by Priority

**High priority — core business logic:**

`client/src/services/Suno.ts`:
- Playlist URL parsing and ID extraction (regex `suno\.com\/playlist\/(.*)`)
- Username detection (`@` prefix, no `http`/`playlist`/`.` heuristic)
- API fetch error handling and status code branching
- `getSongsFromUser` vs `getSongsFromPlayList` routing

`routes/playlist.js`:
- Playlist ID extraction from URL
- Puppeteer browser automation flow for user profiles
- Error handling for invalid URLs, network failures
- Pagination handling for large playlists

`routes/download.js`:
- ZIP file creation and streaming
- Concurrent download management
- ID3 metadata embedding logic
- Temp directory lifecycle (creation, cleanup on stream end, cleanup on disconnect)

**Medium priority — settings and state:**

`client/src/services/SettingsManager.ts`:
- `create()` factory and initialization sequence
- localStorage read/write lifecycle
- Server sync behavior and fallback when server unavailable
- `getSetting` / `setSetting` with typed generics

`routes/settings.js`:
- GET / POST / DELETE on session storage
- Default settings fallback
- Session persistence

**Medium priority — hooks and components:**

`client/src/hooks/useDarkMode.ts`:
- Theme initialization from localStorage
- System `prefers-color-scheme` detection
- `document.documentElement.classList` toggling
- `toggleTheme` state flip

`client/src/components/SimpleSettingsModal.tsx`:
- Settings form read from localStorage on open
- Save writes to localStorage under correct keys
- Modal open/close behavior

`client/src/components/StatusIcon.tsx`:
- Each `IPlaylistClipStatus` enum value renders correct icon

**Low priority:**
- `client/src/services/Logger.ts` — localStorage cap behavior, server fallback
- `client/src/services/Utils.ts` — `formatFileSize`, `throttle`, `delay`
- Decorative components (`WaveformBackground.tsx`, `AdSlot.tsx`)

## Recommended Setup (Vitest for client, Jest for server)

**Client (Vitest — matches Vite ecosystem):**
```bash
cd client && npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

`client/vite.config.ts` addition:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  // existing config...
})
```

`client/src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

**Backend (Jest with ESM):**
```bash
npm install --save-dev jest @types/jest supertest @types/supertest
```

`jest.config.js`:
```javascript
export default {
  transform: {},
  testEnvironment: 'node',
  testMatch: ['**/routes/__tests__/**/*.test.js'],
};
```

## Service Test Patterns

**Suno.ts — mock fetch, verify parsing:**
```typescript
import Suno from '../Suno';

describe('Suno', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('extracts playlist ID from suno.com URL', async () => {
    (fetch as vi.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ playlist: { name: 'Test', image: '' }, clips: [] })
    });

    const [playlist, clips] = await Suno.getSongsFromPlayList(
      'https://suno.com/playlist/abc123'
    );

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/playlist/abc123/all'));
    expect(playlist.name).toBe('Test');
    expect(clips).toEqual([]);
  });

  it('throws on invalid URL', async () => {
    await expect(Suno.getSongsFromPlayList('not-a-url')).rejects.toThrow(
      'Invalid URL or no playlist ID found'
    );
  });

  it('routes @ prefix to getSongsFromUser', async () => {
    (fetch as vi.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ playlist: { name: 'User', image: '' }, clips: [] })
    });

    await Suno.getSongsFromPlayList('@username');

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/playlist/user/username/songs'));
  });
});
```

**SettingsManager.ts — mock localStorage:**
```typescript
import { getSettingsManager, defaultSettings } from '../SettingsManager';

describe('SettingsManager', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => defaultSettings });
  });

  it('returns default settings when localStorage empty', async () => {
    const manager = await getSettingsManager();
    const val = await manager.getSetting('embed_images', 'true');
    expect(val).toBe('true');
  });

  it('reads existing settings from localStorage', async () => {
    localStorage.setItem('suno-downloader-settings', JSON.stringify({ ...defaultSettings, embed_images: 'false' }));
    const manager = await getSettingsManager();
    const val = await manager.getSetting('embed_images', 'true');
    expect(val).toBe('false');
  });
});
```

## Component Test Patterns

**StatusIcon.tsx — enum → icon mapping:**
```typescript
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import StatusIcon from '../StatusIcon';
import { IPlaylistClipStatus } from '../../services/Suno';

const wrap = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>);

describe('StatusIcon', () => {
  it('renders loader for Processing status', () => {
    wrap(<StatusIcon status={IPlaylistClipStatus.Processing} />);
    expect(document.querySelector('.mantine-Loader-root')).toBeInTheDocument();
  });

  it('renders nothing for unknown status', () => {
    const { container } = wrap(<StatusIcon status={99 as IPlaylistClipStatus} />);
    expect(container.firstChild).toBeNull();
  });
});
```

## Hook Test Patterns

**useDarkMode.ts:**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from '../useDarkMode';

describe('useDarkMode', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('defaults to dark when no localStorage entry', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.theme).toBe('dark');
  });

  it('reads theme from localStorage', () => {
    localStorage.setItem('theme', 'light');
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.theme).toBe('light');
  });

  it('toggles theme and updates documentElement class', () => {
    const { result } = renderHook(() => useDarkMode());
    act(() => { result.current.toggleTheme(); });
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('light-mode')).toBe(true);
  });
});
```

## Backend Route Test Patterns

**Playlist routes (supertest + Jest):**
```javascript
import express from 'express';
import request from 'supertest';
import playlistRouter from '../playlist.js';

describe('Playlist Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/playlist', playlistRouter);
  });

  it('GET /:id/all returns 400 for missing id', async () => {
    const res = await request(app).get('/api/playlist/ /all');
    expect(res.status).toBe(400);
  });
});
```

## Mocking Strategy

**What to mock:**
- `global.fetch` — isolate all HTTP calls in service tests
- `localStorage` — use `beforeEach(() => localStorage.clear())` to reset state
- `document.documentElement` — reset `className` before hook tests
- Puppeteer browser instance — mock at module level for route tests

**What NOT to mock:**
- TypeScript enum values (test via real imports)
- CSS variable resolution (not testable in jsdom)
- Mantine component internals

## Async Testing

Always use `async/await` in tests — no mixing with `.then()`:
```typescript
it('handles async fetch', async () => {
  const [playlist] = await Suno.getSongsFromPlayList('https://suno.com/playlist/x');
  expect(playlist).toBeDefined();
});
```

For components with async state updates, use `waitFor`:
```typescript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument();
});
```

## Error Path Testing

```typescript
it('shows error on 500 response', async () => {
  (fetch as vi.Mock).mockResolvedValue({ status: 500, json: async () => ({ error: 'Server error' }) });

  await expect(Suno.getSongsFromPlayList('https://suno.com/playlist/abc')).rejects.toThrow();
});
```

---

*Testing analysis: 2026-05-02*
