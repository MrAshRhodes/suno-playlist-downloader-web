# Codebase Concerns

**Analysis Date:** 2026-05-02

## Tech Debt

**Web scraping fragility (User profile song extraction):**
- Issue: User profile song extraction uses regex patterns to parse HTML and JavaScript embedded data. Suno's frontend updates will break these patterns, requiring continuous maintenance.
- Files: `routes/playlist.js` (lines 470–645)
- Impact: Feature becomes non-functional when Suno changes their DOM structure. No graceful degradation if patterns fail.
- Fix approach: Migrate to official Suno API if available, or implement robust fallback strategies. Currently has browser automation fallback but Puppeteer adds significant overhead and server memory usage.

**Incomplete pagination in user song extraction:**
- Issue: The user profile endpoint (`/user/:username/songs`) only successfully extracts the first page of songs despite detecting total count. Browser automation and API pagination strategies frequently fail.
- Files: `routes/playlist.js` (lines 534–553)
- Impact: Users cannot reliably download all songs from a user profile. The feature returns partial results with a disclaimer, which is user-visible technical debt.
- Fix approach: Either remove the feature entirely (recommend using playlists), or implement a more robust pagination strategy with proper error recovery.

**Session secret hardcoded as fallback:**
- Issue: `server.js` (line 36) uses a hardcoded default session secret when `SESSION_SECRET` env var is missing.
- Files: `server.js` line 36
- Impact: In development/test environments without .env, session security is compromised with a public default secret.
- Fix approach: Generate random session secret at startup if not provided via environment, or fail explicitly on startup in production mode.

**No request rate limiting or validation:**
- Issue: All endpoints accept unlimited concurrent requests with minimal input validation. Playlist URLs are regex-validated but user-supplied data isn't sanitized.
- Files: `routes/playlist.js`, `routes/download.js`, `routes/settings.js`
- Impact: Potential for abuse — large playlists with 1000+ songs will spawn many concurrent download promises. No protection against malformed requests.
- Fix approach: Add express-rate-limit middleware, request body size limits, and stricter input validation on playlist IDs and usernames.

**Excessive temp file cleanup with setTimeout:**
- Issue: Cleanup of temporary directories uses `setTimeout()` with fixed delays (5000–15000ms) to allow streams to finish. No guarantee files are closed before deletion.
- Files: `routes/download.js` (lines 130–145)
- Impact: Race conditions on slow systems or high concurrent load could cause cleanup errors or files locked in use.
- Fix approach: Use proper stream event listeners (`close` event) instead of arbitrary delays, or implement a cleanup queue with lock mechanisms.

**`API_BASE` duplicated across all service files:**
- Issue: The same conditional `const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api'` is copy-pasted into four separate files.
- Files: `client/src/services/WebApi.ts:7`, `client/src/services/Suno.ts:7`, `client/src/services/SettingsManager.ts:7`, `client/src/services/Logger.ts:7`
- Impact: Changing the dev port or API prefix requires four edits. Port 3000 is hardcoded rather than driven by env/config.
- Fix approach: Extract to `client/src/config.ts` and import from there.

**`multer` installed but unused:**
- Issue: `multer 1.4.5-lts.1` is listed as a root `package.json` dependency but no route or middleware imports it.
- Files: `package.json`
- Impact: Dead dependency adds attack surface with known upload-related CVEs from older versions. Also inflates install time.
- Fix approach: Remove from `package.json` unless a file-upload feature is planned.

**`tsc` removed from client build script:**
- Issue: `client/package.json` has both `"build": "vite build"` (no type-check) and `"build:ts": "tsc && vite build"`. The default `build` skips TypeScript type-checking entirely.
- Files: `client/package.json`
- Impact: Type errors are silently ignored on every production build. This was done as a workaround — the root cause (likely the Mantine v7/v6 API mismatch in `web-version/client/`) should be addressed instead.
- Fix approach: Restore `tsc` to the default build once the Mantine API mismatch is resolved.

**`web-version/client/` has Mantine v7 installed with v6 API usage:**
- Issue: `web-version/client/package.json` declares `@mantine/core: ^7.15.3` but the source code uses Mantine v6 APIs (e.g., `<Navbar>`, `<AppShell>` v6 props). TypeScript compilation in that subtree fails.
- Files: `web-version/client/package.json`, `web-version/client/src/`
- Impact: `web-version/` cannot be built with type-checking enabled. The `tsc` step was removed from `web-version/client/package.json`'s build script (`build:check` instead of `build`) as a direct workaround.
- Fix approach: Either pin `web-version/client/` back to `@mantine/core ^6.0.x` to match the deployed `client/`, or migrate the source to Mantine v7 APIs (significant scope).

**Mantine v6 frozen — cannot upgrade:**
- Issue: The deployed client (`client/`) is pinned to Mantine v6 (`@mantine/core 6.0.22`). Upgrading to v7+ breaks the component API extensively.
- Files: `client/package.json`
- Impact: Mantine v6 receives no new features and may eventually stop receiving security backports. The PostCSS upgrade path is also blocked (see below).
- Fix approach: Plan a dedicated v6→v7 migration phase when capacity allows. This is a significant effort requiring component-by-component API migration.

**`postcss <8.5.10` in `client/` (transitive, Mantine v6 freeze):**
- Issue: `client/` installs `postcss@8.5.9` (via `postcss-preset-mantine ^1.8.0`). The security-patched minimum is `8.5.10`.
- Files: `client/package.json`, `client/node_modules/postcss/`
- Impact: CVE in PostCSS CSS parsing — low-severity in practice for a build tool, but blocks clean `npm audit` output.
- Fix approach: Blocked by Mantine v6's `postcss-preset-mantine` version floor. Will resolve automatically when upgrading to Mantine v7. Short-term workaround: add `"overrides": { "postcss": ">=8.5.10" }` to `client/package.json`.

**`web-version/` npm audit vulnerabilities (non-deployed package tree):**
- Issue: `web-version/` has its own `package.json` / `node_modules` that are NOT deployed — the root `package.json` is what Replit runs. However, the audit issues remain present in this subtree and could confuse CI or contributors.
- Vulnerabilities:
  - `lodash <=4.17.23` — high (prototype pollution, code injection via `_.template`)
  - `minimatch <=3.1.3` — high (ReDoS via wildcards)
  - `picomatch <=2.3.1` — high (ReDoS)
  - `path-to-regexp <0.1.13` — high (ReDoS via multiple route parameters)
  - `express 4.0.0-rc1–4.21.2` — high (via path-to-regexp)
  - `brace-expansion <=1.1.12` — moderate (ReDoS/process hang)
- Files: `web-version/package.json`, `web-version/node_modules/`
- Impact: Not exploitable in production (this tree is not deployed). Risk is confusion and false positives in CI scans.
- Fix approach: Run `npm audit fix` in `web-version/`, or remove the `web-version/` directory entirely if it's superseded by the root deployment.

**AdSlot component wired but Adsterra key not yet live:**
- Issue: `client/src/App.tsx` renders `<AdSlot adKey={import.meta.env.VITE_ADSTERRA_UNIT_KEY ?? ''} />`. When the env var is unset (which is the current default for all contributors and CI), the component mounts silently with an empty slot that reserves layout space but serves no ad.
- Files: `client/src/App.tsx:299–301`, `client/src/components/AdSlot.tsx`
- Impact: Layout space (32px margin + border + padding) is permanently reserved above the footer even with no active ad. CLS contract comment in `AdSlot.tsx` acknowledges this is intentional, but it may look broken to users until the key is live.
- Fix approach: Either set `VITE_ADSTERRA_UNIT_KEY` in Replit Secrets to activate the ad, or conditionally suppress the slot wrapper when `adKey` is falsy (currently it always renders the reserved-space div).

**Hard-coded playlist transformation logic in multiple places:**
- Files: `routes/playlist.js` (lines 337–342, 430–445, 600–612)
- Issue: Three separate code paths transform playlist/clip data into slightly different formats. No shared `transformClip()` function.
- Impact: Inconsistent fields across endpoints; any metadata addition requires three edits.
- Fix approach: Create a shared `transformClip()` utility, centralise the logic.

## Known Bugs

**Browser automation memory leak potential:**
- Symptoms: Server memory usage grows when user profile downloads fail and trigger Puppeteer browser instances.
- Files: `routes/playlist.js` (lines 8–145)
- Trigger: Attempting to fetch user profile with `num_total_clips > 20` triggers browser automation. Long-running processes or frequent requests accumulate instances.
- Workaround: Restart the server periodically, or only use playlist URLs (not username-based downloads).

**Session storage in memory (not persistent):**
- Symptoms: Settings saved in session are lost on server restart or across multiple requests.
- Files: `routes/settings.js`
- Trigger: Using the settings API to configure name templates, embed preferences, etc. Server restart loses session.
- Workaround: Web client uses localStorage fallback for settings (`client/src/App.tsx` lines 136–140), but server-side session becomes orphaned.

**CORS origin hardcoded for localhost only:**
- Symptoms: In production on a different domain, frontend receives CORS errors.
- Files: `server.js` (lines 27–30)
- Trigger: Production deployment uses hardcoded `localhost:5173` and `localhost:3000` origins.
- Workaround: Frontend falls back to same-origin requests in production, but cross-origin API calls fail. Needs environment-based CORS config.

## Security Considerations

**Exposed debug endpoint:**
- Risk: `/api/debug` endpoint in `server.js` (lines 51–55) logs request headers and returns server info. Exposes timing information and may leak sensitive headers.
- Files: `server.js`
- Current mitigation: None — endpoint is public and returns diagnostic info.
- Recommendations: Remove or gate behind authentication, never log headers in production, use conditional debug routes based on NODE_ENV.

**No authentication on any endpoint:**
- Risk: All download and playlist endpoints are completely public. No rate limiting, no user tracking, no DDoS protection.
- Files: All routes in `routes/`
- Current mitigation: Relies entirely on Suno API availability and network rate limiting.
- Recommendations: Implement API key authentication, add rate limiting per IP/key.

**Puppeteer with `--no-sandbox` flag:**
- Risk: Browser automation runs with `--no-sandbox` and `--disable-setuid-sandbox` (`routes/playlist.js` line 15). Reduces security isolation for the browser process.
- Files: `routes/playlist.js`
- Current mitigation: Server runs in container (Replit) but local deployment could be vulnerable.
- Recommendations: Use proper sandboxing in production, or remove browser automation entirely.

**No input sanitization on metadata:**
- Risk: Downloaded MP3 files write user-controlled metadata (title, tags) from Suno API without validation. Malicious tags could cause issues in some MP3 players.
- Files: `routes/download.js` (lines 75–86)
- Current mitigation: `node-id3` handles encoding but no content validation.
- Recommendations: Validate and sanitize metadata strings before writing to ID3 tags.

## Performance Bottlenecks

**Puppeteer initialization on every user profile request:**
- Problem: Browser automation creates a new Chromium instance for each user profile download attempt. Puppeteer startup takes 2–5 seconds.
- Files: `routes/playlist.js` (line 13)
- Cause: No browser pooling or reuse. `browser.close()` happens after each request.
- Improvement path: Implement browser pool, or remove the feature entirely.

**Synchronous ZIP creation blocks event loop:**
- Problem: `AdmZip.writeZip()` is synchronous. Large playlists (100+ songs) freeze the event loop during ZIP creation.
- Files: `routes/download.js` (line 111)
- Cause: `AdmZip` library has no streaming/async support.
- Improvement path: Replace with `archiver` (streaming) or `yazl`, implement progress streaming.

**No connection timeouts on external API calls:**
- Problem: `fetch()` to Suno API has no explicit timeout. Slow network on Replit can cause requests to hang indefinitely.
- Files: `routes/playlist.js` (lines 326, 373, 414, 486), `routes/download.js` (lines 56, 68)
- Improvement path: Add 30-second timeout to all fetch calls, implement retry logic with exponential backoff.

**Unbounded concurrent downloads:**
- Problem: Playlist download spawns one Promise per song with no server-side concurrency control. 100-song playlist = 100 concurrent network requests + file I/O.
- Files: `routes/download.js` (lines 48–97)
- Cause: `Promise.all()` with no limit. Client-side has `pLimit(5)` but server has none.
- Improvement path: Add server-side concurrency limit, implement queue-based downloads.

## Fragile Areas

**Regex-based HTML parsing for data extraction:**
- Files: `routes/playlist.js` (lines 497, 515, 522, 560, 570)
- Why fragile: Five different regex patterns attempt to extract user ID, total song count, and clip data from HTML. Any DOM structure change breaks all of them.
- Safe modification: Add comprehensive logging to show what patterns matched/failed, add fallback extraction methods, test against real Suno profiles.
- Test coverage: None. Should have snapshot tests of real profile HTML responses.

**Settings API uses volatile session storage:**
- Files: `routes/settings.js`
- Why fragile: Express session middleware is volatile and untyped. No validation of settings values. Client uses localStorage as fallback but they can drift apart.
- Safe modification: Add persistent storage, validate settings against schema, document the fallback chain (localStorage → session → defaults).
- Test coverage: None.

**Client file detection with 14 sequential fallback paths:**
- Files: `server.js` (lines 59–77)
- Why fragile: 14 different possible paths checked sequentially for the client dist folder. Order matters and paths are Replit-specific. If Replit deployment structure changes, the entire app fails to serve the frontend.
- Safe modification: Use environment variable to specify dist path explicitly, validate on startup, fail fast if client files can't be found.
- Test coverage: None.

**`build.sh` silently continues on client build failure:**
- Files: `build.sh` (line 24: `npm run build || echo "Client build failed, but continuing anyway"`)
- Why fragile: A broken client build goes undetected at deploy time — Replit will serve stale `public/` files without warning.
- Safe modification: Fail the build script on client build error unless a pre-built `public/` directory is explicitly confirmed valid.
- Test coverage: None.

## Scaling Limits

**Single-threaded Node.js event loop:**
- Current capacity: ~5–10 concurrent playlist downloads on Replit's free tier.
- Limit: Large ZIP creation (100+ songs) blocks all other requests. System reaches resource limits at ~50 concurrent users.
- Scaling path: Implement clustering with `pm2` or `cluster` module, separate download worker processes, use streaming ZIP.

**Temporary directory accumulation:**
- Current capacity: ~1 GB of temp files on Replit before cleanup runs.
- Limit: Periodic cleanup runs hourly but doesn't reclaim space immediately. Under heavy load, the temp partition can fill up.
- Scaling path: Implement real-time cleanup after streaming completes, add disk space monitoring, set hard limits on temp directory size.

**Memory usage with Puppeteer:**
- Current capacity: ~500 MB baseline, +150 MB per active browser instance.
- Limit: Replit free tier has limited memory. More than 2–3 concurrent user profile downloads crash the server.
- Scaling path: Remove browser automation entirely (recommend using playlists), or use `puppeteer-cluster` with strict resource limits.

## Dependencies at Risk

**Puppeteer (browser automation):**
- Risk: Large dependency (200 MB+ Chromium binary) added only for experimental `@username` scraping. Installation can timeout on slow networks.
- Impact: Feature is experimental, frequently fails, and adds massive deployment bloat. The binary dominates `node_modules` size.
- Migration plan: Remove Puppeteer entirely and recommend users use playlist URLs instead, or replace with a leaner headless browser (e.g., Playwright with `--no-download-browsers`).

**`node-id3` (MP3 metadata):**
- Risk: Small but minimally maintained library. ID3v2.4 format support is incomplete.
- Impact: Some MP3 players don't recognise embedded metadata correctly.
- Migration plan: Switch to `jsmediatags` (more active) or implement native ID3 writing.

**`AdmZip` (ZIP creation):**
- Risk: Synchronous operations block event loop. No streaming support.
- Impact: Large playlists (100+ songs) cause server freezes and timeout issues.
- Migration plan: Replace with `archiver` (streaming) or `yazl` (lightweight).

**`express-session` without persistent store:**
- Risk: Sessions are stored in memory and lost on restart. Not suitable for production persistence.
- Impact: User settings are lost when server restarts.
- Migration plan: Migrate to file-based session store (`connect-sqlite3`) or Redis, add explicit `SESSION_STORE` configuration.

## Missing Critical Features

**No test suite exists anywhere:**
- Problem: Zero unit, integration, or e2e tests exist across the entire codebase — neither in root, `client/`, nor `routes/`.
- Blocks: Refactoring is high-risk. Regressions in download flow, extraction logic, and file cleanup are only caught in production.
- Note: This is the single highest-leverage improvement available. Even a minimal integration test for the playlist and download routes would prevent the majority of regressions.

**No progress feedback for ZIP downloads:**
- Problem: User clicks "Download ZIP" and sees nothing until file starts downloading. No visibility into which songs are being processed.
- Blocks: Users can't distinguish a frozen app from a large in-progress download.

**No validation that Suno URLs are valid before processing:**
- Problem: Server attempts to fetch invalid playlist IDs with no pre-validation. Returns generic "failed to fetch" error without debugging info.
- Blocks: Users can't distinguish between bad URL vs. server/network error.

**No recovery from partial downloads:**
- Problem: If a song fails to download midway through a ZIP, the entire ZIP fails. No partial download option.
- Blocks: Large playlists with intermittently failing songs can never complete.

## Test Coverage Gaps

**No tests for playlist data extraction:**
- What's not tested: Regex patterns for extracting clips from HTML, user ID extraction, pagination logic, fallback strategies.
- Files: `routes/playlist.js` (entire file, especially lines 84–132, 496–530)
- Risk: Extraction breaks silently or returns partial data when Suno changes structure.
- Priority: **High**

**No tests for download streaming:**
- What's not tested: ZIP file creation, concurrent downloads, error handling during stream, cleanup after partial failures.
- Files: `routes/download.js`
- Risk: Partial downloads, corrupted ZIP files, disk space leaks from orphaned temp files.
- Priority: **High**

**No tests for file system operations:**
- What's not tested: Temp directory creation/cleanup, race conditions on file deletion, path traversal edge cases.
- Files: `utils/fileManager.js`
- Risk: Files not cleaned up properly, potential security vulnerability.
- Priority: **Medium**

**No integration tests for API routes:**
- What's not tested: Full request/response cycle for any endpoint, error handling, CORS behaviour.
- Files: `routes/*.js`, `server.js`
- Risk: Breaking changes in middleware configuration, CORS issues on production, undocumented API behaviour.
- Priority: **Medium**

**No tests for browser automation fallback:**
- What's not tested: Puppeteer initialisation, page navigation, infinite scroll detection, data extraction from page.
- Files: `routes/playlist.js` (lines 8–145)
- Risk: Browser automation fails silently, memory leaks, timeout issues.
- Priority: **Low** — Feature is experimental and rarely succeeds anyway.

---

*Concerns audit: 2026-05-02*
