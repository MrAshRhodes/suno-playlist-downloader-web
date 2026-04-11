# Codebase Concerns

**Analysis Date:** 2026-04-11

## Tech Debt

**Web scraping fragility (User profile song extraction):**
- Issue: User profile song extraction uses regex patterns to parse HTML and JavaScript embedded data. Suno's frontend updates will break these patterns, requiring continuous maintenance.
- Files: `routes/playlist.js` (lines 470-645)
- Impact: Feature becomes non-functional when Suno changes their DOM structure. No graceful degradation if patterns fail.
- Fix approach: Migrate to official Suno API if available, or implement robust fallback strategies. Currently has browser automation fallback but Puppeteer adds significant overhead and server memory usage.

**Incomplete pagination in user song extraction:**
- Issue: The user profile endpoint (`/user/:username/songs`) only successfully extracts the first page of songs despite detecting total count. Browser automation and API pagination strategies frequently fail.
- Files: `routes/playlist.js` (lines 534-553)
- Impact: Users cannot reliably download all songs from a user profile. The feature returns partial results with a disclaimer, which is user-visible technical debt.
- Fix approach: Either remove the feature entirely (recommend using playlists), or implement a more robust pagination strategy with proper error recovery.

**Session secret hardcoded as fallback:**
- Issue: Both `server.js` (line 36) and `web-version/server.js` use hardcoded default session secrets when `SESSION_SECRET` env var is missing.
- Files: `server.js` line 36, `web-version/server.js` line 32
- Impact: In development/test environments without .env, session security is compromised with a public default secret.
- Fix approach: Generate random session secret at startup if not provided via environment, or fail explicitly on startup in production mode.

**No request rate limiting or validation:**
- Issue: All endpoints accept unlimited concurrent requests with minimal input validation. Playlist URLs are regex-validated but user-supplied data isn't sanitized.
- Files: `routes/playlist.js`, `routes/download.js`, `routes/settings.js`
- Impact: Potential for abuse - large playlists with 1000+ songs will spawn many concurrent download promises. No protection against malformed requests.
- Fix approach: Add express-rate-limit middleware, request body size limits, and stricter input validation on playlist IDs and usernames.

**Excessive temp file cleanup with setTimeout:**
- Issue: Cleanup of temporary directories uses `setTimeout()` with fixed delays (5000-15000ms) to allow streams to finish. No guarantee files are closed before deletion.
- Files: `routes/download.js` (lines 130-145)
- Impact: Race conditions on slow systems or high concurrent load could cause cleanup errors or files locked in use.
- Fix approach: Use proper stream event listeners (`close` event) instead of arbitrary delays, or implement a cleanup queue with lock mechanisms.

## Known Bugs

**Browser automation memory leak potential:**
- Symptoms: Server memory usage grows when user profile downloads fail and trigger Puppeteer browser instances
- Files: `routes/playlist.js` (lines 8-145)
- Trigger: Attempting to fetch user profile with `num_total_clips > 20` triggers browser automation. Long-running processes or frequent requests accumulate instances.
- Workaround: Restart the server periodically, or only use playlist URLs (not username-based downloads).

**Session storage in memory (not persistent):**
- Symptoms: Settings saved in session are lost on server restart or across multiple requests
- Files: `routes/settings.js`
- Trigger: Using the settings API to configure name templates, embed preferences, etc. Closing browser tab or refreshing loses session.
- Workaround: Web client uses localStorage fallback for settings (see `web-version/client/src/App.tsx` lines 136-140), but server-side session becomes orphaned.

**Path traversal vulnerability in temp directory:**
- Symptoms: Invalid cleanup could affect unrelated files if sessionId is manipulated
- Files: `utils/fileManager.js` (lines 45-46)
- Trigger: While `fileManager.js` checks that paths contain TEMP_DIR string, a crafted sessionId could theoretically bypass this check.
- Workaround: Keep TEMP_DIR isolated from sensitive files, use restrictive file permissions.

**CORS origin hardcoded for localhost only:**
- Symptoms: In production on a different domain, frontend receives CORS errors
- Files: `server.js` (lines 27-30)
- Trigger: Production deployment uses hardcoded `localhost:5173` and `localhost:3000` origins
- Workaround: Frontend falls back to same-origin requests in production, but cross-origin API calls fail. Needs environment-based CORS config.

## Security Considerations

**Exposed debug endpoint:**
- Risk: `/api/debug` endpoint (line 51-55 in `server.js`) logs request headers and returns server info. Exposes timing information and may leak sensitive headers.
- Files: `server.js`
- Current mitigation: None - endpoint is public and returns diagnostic info.
- Recommendations: Remove or gate behind authentication, never log headers in production, use conditional debug routes based on NODE_ENV.

**No authentication on any endpoint:**
- Risk: All download and playlist endpoints are completely public. No rate limiting, no user tracking, no DDoS protection.
- Files: All routes in `routes/`
- Current mitigation: Relies entirely on Suno API availability and network rate limiting.
- Recommendations: Implement API key authentication, add rate limiting per IP/key, consider paid tier for heavy users on Replit deployment.

**Puppeteer with --no-sandbox flag:**
- Risk: Browser automation runs with `--no-sandbox` and `--disable-setuid-sandbox` (line 15 in `routes/playlist.js`). Reduces security isolation for browser process.
- Files: `routes/playlist.js`
- Current mitigation: Server runs in container (Replit) but local deployment could be vulnerable.
- Recommendations: Use proper sandboxing in production, or remove browser automation entirely. Consider running Puppeteer in separate worker process with strict resource limits.

**No input sanitization on metadata:**
- Risk: Downloaded MP3 files write user-controlled metadata (title, tags) from Suno API without validation. Malicious tags could cause issues in some MP3 players.
- Files: `routes/download.js` (lines 75-86)
- Current mitigation: node-id3 handles encoding, but no validation of content.
- Recommendations: Validate and sanitize metadata strings before writing to ID3 tags.

## Performance Bottlenecks

**Puppeteer initialization on every user profile request:**
- Problem: Browser automation creates a new Chromium instance for each user profile download attempt. Puppeteer startup takes 2-5 seconds.
- Files: `routes/playlist.js` (line 13)
- Cause: No browser pooling or reuse. `browser.close()` happens after each request.
- Improvement path: Implement browser pool (e.g., with `puppeteer-extra-plugin-stealth`), or use headless API endpoint if available. Consider removing feature entirely.

**Synchronous file operations during download:**
- Problem: ZIP file creation and writing use `writeZip()` which is blocking. Large playlists (100+ songs) freeze event loop.
- Files: `routes/download.js` (line 111)
- Cause: `AdmZip` library operations are synchronous. Node.js can't handle other requests during ZIP creation.
- Improvement path: Use streaming ZIP library (`yazl` or `archiver`) instead of loading entire ZIP in memory. Implement progress streaming.

**No connection timeouts on external API calls:**
- Problem: `fetch()` to Suno API has no explicit timeout. Slow network on Replit can cause requests to hang indefinitely.
- Files: `routes/playlist.js` (lines 326, 373, 414, 486), `routes/download.js` (lines 56, 68)
- Cause: Default Node.js fetch timeout is very long (no timeout without explicit config).
- Improvement path: Add 30-second timeout to all fetch calls, implement retry logic with exponential backoff.

**Unbounded concurrent downloads:**
- Problem: Playlist download spawns one Promise per song with no concurrency control on server side. 100-song playlist = 100 concurrent network requests + file I/O.
- Files: `routes/download.js` (lines 48-97)
- Cause: `Promise.all()` with no limit. Client-side has `pLimit(5)` but server-side has no limits.
- Improvement path: Add server-side concurrency limit, implement queue-based downloads with progress tracking per song, monitor memory/CPU during large downloads.

## Fragile Areas

**Regex-based HTML parsing for data extraction:**
- Files: `routes/playlist.js` (lines 497, 515, 522, 560, 570)
- Why fragile: Five different regex patterns attempt to extract user ID, total songs count, and clip data from HTML. Any DOM structure change breaks all of them.
- Safe modification: If modifying extraction logic, add comprehensive logging to show what patterns matched/failed, add fallback extraction methods, test against real Suno profiles.
- Test coverage: No tests for extraction logic. Should have snapshot tests of real profile HTML responses.

**Settings API uses session storage:**
- Files: `routes/settings.js`
- Why fragile: Express session middleware is volatile and untyped. No validation of settings values. Client uses localStorage as fallback but they can drift apart.
- Safe modification: Add persistent settings storage (database or file-based), validate all settings against schema, document the fallback chain (localStorage → session → defaults).
- Test coverage: No tests for settings API. Manual testing only.

**Hard-coded playlist transformation logic:**
- Files: `routes/playlist.js` (lines 337-342, 430-445, 600-612)
- Why fragile: Three separate places transform playlist/clip data into slightly different formats. No shared transformation function.
- Safe modification: Create a `transformClip()` utility function, add TypeScript types for IPlaylistClip interface, centralize transformation logic.
- Test coverage: No unit tests for data transformation.

**Client file detection with multiple fallback paths:**
- Files: `server.js` (lines 59-77)
- Why fragile: 14 different possible paths checked sequentially for client dist folder. Order matters and paths are Replit-specific. If Replit deployment structure changes, entire app fails.
- Safe modification: Use environment variables to specify dist path explicitly, validate directory structure on startup, fail fast if client files can't be found, log all paths checked during diagnosis.
- Test coverage: No tests for path detection logic.

## Scaling Limits

**Single-threaded Node.js event loop:**
- Current capacity: ~5-10 concurrent playlist downloads on Replit's free tier
- Limit: Large ZIP creation (100+ songs) blocks all other requests during `writeZip()`. System reaches resource limits at ~50 concurrent users.
- Scaling path: Implement clustering with `pm2` or `cluster` module, separate download worker processes, use streaming ZIP instead of in-memory ZIP, optimize Puppeteer pooling.

**Temporary directory accumulation:**
- Current capacity: ~1GB of temp files on Replit before cleanup runs
- Limit: Periodic cleanup runs every hour but doesn't reclaim space immediately. Under heavy load, temp partition can fill up.
- Scaling path: Implement real-time cleanup after streaming completes, add disk space monitoring, set hard limits on temp directory size with cleanup when exceeded.

**Memory usage with Puppeteer:**
- Current capacity: ~500MB baseline, +150MB per active browser instance
- Limit: Replit free tier has limited memory. More than 2-3 concurrent user profile downloads crash server.
- Scaling path: Remove browser automation entirely (recommend using playlists), or use headless-shell on Replit with resource limits, implement browser instance timeout/pooling.

## Dependencies at Risk

**Puppeteer (browser automation):**
- Risk: Large dependency (200MB+) added only for experimental user profile feature. Installation can timeout on slow networks.
- Impact: Feature is marked experimental, frequently fails, and adds massive deployment bloat.
- Migration plan: Either commit to fixing the feature properly with a robust API, or remove Puppeteer entirely and recommend users use playlist URLs instead (which work reliably).

**node-id3 (MP3 metadata):**
- Risk: Small but unmaintained library. ID3v2.4 format support is incomplete.
- Impact: Some MP3 players don't recognize embedded metadata correctly.
- Migration plan: Switch to `jsmediatags` (more active) or implement native ID3 writing, add user option to disable metadata embedding.

**AdmZip (ZIP creation):**
- Risk: Synchronous operations block event loop. No streaming support.
- Impact: Large playlists (100+ songs) cause server freezes and timeout issues.
- Migration plan: Replace with `archiver` (streaming) or `yazl` (lightweight), implement progress callback for streaming ZIP download.

**express-session (without persistent store):**
- Risk: Sessions are stored in memory and lost on restart. Not suitable for production.
- Impact: User settings are lost when server restarts. No way to track persistent user sessions.
- Migration plan: Migrate to Redis or file-based session store (`connect-sqlite3`, `express-session-sqlite`), add explicit SESSION_STORE configuration.

## Missing Critical Features

**No progress feedback for ZIP downloads:**
- Problem: User clicks "Download ZIP" and sees nothing until file starts downloading. No visibility into which songs are being processed.
- Blocks: Users don't know if application froze or is still working on large playlists.

**No validation that Suno URLs are valid before processing:**
- Problem: Server attempts to fetch invalid playlist IDs with no pre-validation. Returns generic "failed to fetch" error without debugging info.
- Blocks: Users can't easily distinguish between bad URL vs. server/network error.

**No recovery from partial downloads:**
- Problem: If a song fails to download midway through a ZIP, the entire ZIP download fails. No way to resume or partial download option.
- Blocks: Large playlists with unreliable songs can never complete.

**No offline mode or caching:**
- Problem: Every request hits Suno API. No local caching or save state for playlists.
- Blocks: Users must re-fetch playlist metadata on each session.

## Test Coverage Gaps

**No tests for playlist data extraction:**
- What's not tested: Regex patterns for extracting clips from HTML, user ID extraction, pagination logic, fallback strategies
- Files: `routes/playlist.js` (entire file, especially lines 84-132, 496-530)
- Risk: Extraction breaks silently or returns partial data when Suno changes structure
- Priority: **High** - This is user-facing functionality that frequently fails

**No tests for download streaming:**
- What's not tested: ZIP file creation, concurrent downloads, error handling during stream, cleanup after partial failures
- Files: `routes/download.js`
- Risk: Partial downloads, corrupted ZIP files, disk space leaks from orphaned temp files
- Priority: **High** - Core feature with potential for data loss

**No tests for file system operations:**
- What's not tested: Temp directory creation/cleanup, race conditions on file deletion, path traversal edge cases
- Files: `utils/fileManager.js`
- Risk: Files not cleaned up properly, potential security vulnerability
- Priority: **Medium** - Affects server stability and cleanup

**No integration tests for API routes:**
- What's not tested: Full request/response cycle for any endpoint, error handling, CORS behavior
- Files: `routes/*.js`, `server.js`
- Risk: Breaking changes in middleware configuration, CORS issues on production, undocumented API behavior
- Priority: **Medium** - Would catch many deployment issues early

**No tests for browser automation fallback:**
- What's not tested: Puppeteer initialization, page navigation, infinite scroll detection, data extraction from page
- Files: `routes/playlist.js` (lines 8-145)
- Risk: Browser automation fails silently, memory leaks, timeout issues
- Priority: **Low** - Feature is experimental and rarely succeeds anyway

---

*Concerns audit: 2026-04-11*
