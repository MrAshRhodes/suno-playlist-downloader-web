# Testing Patterns

**Analysis Date:** 2026-04-11

## Test Framework

**Runner:**
- Not detected - No test framework configured in project

**Assertion Library:**
- Not detected - No testing dependencies in package.json

**Run Commands:**
- No test scripts defined in `package.json`

## Current Testing Status

**Testing Infrastructure:**
- Project contains NO automated tests
- No test files (*.test.ts, *.spec.ts, etc.) found in codebase
- No Jest, Vitest, or Mocha configuration files present
- No testing libraries (jest, vitest, mocha, chai, etc.) in dependencies

## Test Organization (When to Implement)

**Recommended Location:**
- Backend tests: `routes/__tests__/` directory for route tests
- Client component tests: `client/src/components/__tests__/` for component tests
- Service tests: `client/src/services/__tests__/` for service logic tests

**Naming Pattern to Adopt:**
- Backend routes: `routes/__tests__/playlist.test.js`, `routes/__tests__/download.test.js`
- Components: `Button.test.tsx`, `Modal.test.tsx` (co-located in same directory)
- Services: `Suno.test.ts`, `Logger.test.ts`

## Testing Needs by Module

**High Priority Areas for Testing:**

**Backend Routes (`routes/`):**
- Playlist fetching (`playlist.js`):
  - URL parsing and ID extraction
  - API proxy requests to Suno API
  - Error handling for invalid URLs
  - Pagination handling for large playlists
  - Browser automation with Puppeteer for user profiles
  
- Download handling (`download.js`):
  - ZIP file creation and streaming
  - Concurrent downloads with Promise.all()
  - Audio metadata embedding with NodeID3
  - Temp directory cleanup
  - Stream error handling and client disconnection detection
  
- Settings management (`settings.js`):
  - GET/POST/DELETE operations on session storage
  - Default settings initialization
  - Settings persistence and retrieval

**Frontend Services (`client/src/services/`):**
- Suno.ts:
  - URL validation and playlist ID extraction
  - API fetch calls with error handling
  - User profile vs playlist detection logic
  - Type safety of return values
  
- Logger.ts:
  - User ID generation and retrieval
  - localStorage persistence
  - Log array management (50-item limit)
  - Server logging fallback behavior
  
- WebApi.ts (not shown but referenced):
  - Download initiation
  - Progress monitoring setup

**Frontend Components (`client/src/components/`):**
- App.tsx:
  - Playlist URL input and submission
  - Download state management
  - Progress tracking UI updates
  - Error/success message display
  
- SimpleSettingsModal.tsx:
  - Settings form interactions
  - localStorage read/write
  - Modal open/close behavior

**Hooks (`client/src/hooks/`):**
- useDarkMode.ts:
  - Theme state initialization from localStorage
  - System preference detection
  - Class application to document
  - Theme toggle functionality

## Testing Utilities Needed

**For Backend:**
- HTTP assertions: chai-http or supertest for route testing
- Mock data: Fixtures for playlist/user responses
- Spy/Mock functions: sinon for mocking Puppeteer and fetch calls

**For Frontend:**
- Component rendering: React Testing Library
- Event simulation: user-event for interactions
- Mock localStorage: Custom jest.mock or localStorage-mock
- Mock fetch: jest.mock or msw for API calls

## Recommended Test Structure (Future Implementation)

**Backend Example Pattern:**
```javascript
// routes/__tests__/playlist.test.js
import express from 'express';
import request from 'supertest';
import playlistRouter from '../playlist';

describe('Playlist Routes', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/playlist', playlistRouter);
  });
  
  describe('POST /fetch', () => {
    it('should extract playlist ID from valid URL', async () => {
      const response = await request(app)
        .post('/api/playlist/fetch')
        .send({ url: 'https://suno.com/playlist/abc123' });
      
      expect(response.status).toBe(200);
    });
    
    it('should return 400 for missing URL', async () => {
      const response = await request(app)
        .post('/api/playlist/fetch')
        .send({});
      
      expect(response.status).toBe(400);
    });
  });
});
```

**Frontend Component Example Pattern:**
```typescript
// client/src/components/__tests__/SimpleSettingsModal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import SimpleSettingsModal from '../SimpleSettingsModal';

describe('SimpleSettingsModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  it('should render settings button', () => {
    render(<SimpleSettingsModal theme="light" />);
    expect(screen.getByTitle('Settings')).toBeInTheDocument();
  });
  
  it('should save settings to localStorage', async () => {
    render(<SimpleSettingsModal theme="light" />);
    
    const button = screen.getByTitle('Settings');
    fireEvent.click(button);
    
    // Interact with form...
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    expect(localStorage.getItem('suno-name-template')).toBeDefined();
  });
});
```

**Service Test Example Pattern:**
```typescript
// client/src/services/__tests__/Suno.test.ts
import Suno from '../Suno';

describe('Suno Service', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  
  describe('getSongsFromPlayList', () => {
    it('should extract playlist ID and fetch data', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        json: async () => ({
          playlist: { name: 'Test', image: 'url' },
          clips: []
        })
      });
      
      const [playlist, clips] = await Suno.getSongsFromPlayList(
        'https://suno.com/playlist/abc123'
      );
      
      expect(playlist.name).toBe('Test');
      expect(clips).toEqual([]);
    });
  });
});
```

**Hook Test Example Pattern:**
```typescript
// client/src/hooks/__tests__/useDarkMode.test.ts
import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from '../useDarkMode';

describe('useDarkMode', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  it('should initialize theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current.theme).toBe('dark');
  });
  
  it('should toggle theme', () => {
    const { result } = renderHook(() => useDarkMode());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('dark');
  });
});
```

## Async Testing Pattern

**For async operations (Promises, async/await):**
```javascript
// Backend route test
it('should handle async playlist fetch', async () => {
  const response = await request(app)
    .get('/api/playlist/abc123/all');
  
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('clips');
});

// Frontend service test
it('should return playlist and clips', async () => {
  const [playlist, clips] = await Suno.getSongsFromPlayList(url);
  
  expect(playlist).toBeDefined();
  expect(Array.isArray(clips)).toBe(true);
});
```

## Error Testing Pattern

**Error handling validation:**
```javascript
// Testing error paths
it('should return 400 for invalid playlist ID', async () => {
  const response = await request(app)
    .post('/api/playlist/fetch')
    .send({ url: 'invalid-url' });
  
  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty('message');
});

// Testing error boundaries in components
it('should display error message on failed fetch', async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
  
  render(<App />);
  
  fireEvent.change(screen.getByPlaceholderText('Playlist URL'), {
    target: { value: 'https://suno.com/playlist/abc' }
  });
  fireEvent.click(screen.getByText('Load Playlist'));
  
  await waitFor(() => {
    expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument();
  });
});
```

## Coverage Recommendations

**Critical paths (70%+ coverage target):**
- Playlist ID extraction logic
- Download ZIP creation and streaming
- Error handling in all routes
- Service fetch calls
- State management in main App component

**Important but lower priority:**
- UI component rendering (60%+)
- Settings modal interactions
- Theme toggle functionality

**Not required:**
- Console logging
- Decorative components
- CSS-only styling

## Configuration for Future Test Setup

**Backend (Node.js):**
```bash
npm install --save-dev jest @types/jest supertest @types/supertest
```

**Frontend (React + TypeScript):**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest @types/jest jest-environment-jsdom
```

**Configuration files to create:**
- `jest.config.js` - Main test runner config
- `jest.setup.js` - Global test setup
- `.babelrc` or `babel.config.js` - For TypeScript/JSX transpilation

---

*Testing analysis: 2026-04-11*
