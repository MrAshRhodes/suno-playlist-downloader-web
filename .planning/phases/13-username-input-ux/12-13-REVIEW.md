---
phase: 12-13-username-input-ux
reviewed: 2026-05-12T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - client/src/App.tsx
  - client/src/services/Suno.ts
  - web-version/client/src/App.tsx
findings:
  critical: 0
  warning: 6
  info: 4
  total: 10
status: issues_found
---

# Phases 12–13: Code Review Report

**Reviewed:** 2026-05-12
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Phase 12 added per-song checkbox selection (opt-out model, header indeterminate state, download gating). Phase 13 added `@username` input routing via a `usernameUrlMatch` branch in `Suno.ts` and updated the input placeholder and helper text.

Six warnings and four info items were found. The most impactful are a progress-bar regression introduced in phase 12 (denominator uses total clip count instead of selected count), an SSE event-source leak on download failure present in both apps, and leading-whitespace input failing silently with a misleading error for `@username` handles. No critical (security/data-loss) issues were found.

---

## Warnings

### WR-01: Progress bar never reaches 100% when a partial selection is downloaded

**File:** `web-version/client/src/App.tsx:287-292`
**Issue:** The `useEffect` that drives `downloadPercentage` divides `completedItems` (incremented once per selected, downloaded clip) by `playlistClips.length` (the full unfiltered clip count). If 5 of 10 songs are selected, `completedItems` reaches 5 and the bar stalls at 50%. This is a phase-12 regression: before phase 12 all clips were always downloaded, so the denominator was always correct.

**Fix:**
```ts
// Track selectedClips.length in state alongside completedItems, or compute it:
const [totalToDownload, setTotalToDownload] = useState(0);

// In downloadIndividualSongs, before kicking off promises:
setTotalToDownload(selectedClips.length);

// In the useEffect:
useEffect(() => {
    if (totalToDownload > 0) {
        setDownloadPercentage(Math.ceil((completedItems / totalToDownload) * 100));
    }
}, [completedItems, totalToDownload]);
```

---

### WR-02: SSE progress monitor not closed when download fails (client)

**File:** `client/src/App.tsx:109-145`
**Issue:** `cleanup()` is called at line 133 inside the `try` block, after `await downloadPlaylistApi(...)` at line 119. If `downloadPlaylistApi` throws, execution jumps to the `catch` block at line 135, skipping `cleanup()`. The SSE `EventSource` is never closed, leaving a dangling connection that continues firing callbacks.

**Fix:** Move `cleanup()` to a `finally` block:
```ts
const cleanup = setupProgressMonitor(sessionId, ...);
try {
    await downloadPlaylistApi(playlistData, selectedClips, settings.embed_images === "true");
    setPlaylistClips((prevClips) => prevClips.map((clip) =>
        selectedIds.has(clip.id) ? { ...clip, status: IPlaylistClipStatus.Success } : clip
    ));
    showSuccess("Playlist ZIP file download initiated");
} catch (error) {
    console.error("Download failed:", error);
    showError("Failed to download playlist");
    setPlaylistClips((prevClips) => prevClips.map((clip) =>
        selectedIds.has(clip.id) ? { ...clip, status: IPlaylistClipStatus.Error } : clip
    ));
} finally {
    cleanup();
}
```

---

### WR-03: SSE progress monitor not closed when download fails (web-version)

**File:** `web-version/client/src/App.tsx:210-250`
**Issue:** Same pattern as WR-02. `cleanup()` is at line 236 inside the `try` block. If `downloadPlaylist(...)` at line 221 throws, `cleanup()` is skipped and the `EventSource` leaks.

**Fix:** Same `finally` restructure as WR-02 applied to `downloadPlaylistAsZip`.

---

### WR-04: `setIsDownloading(true)` placed before guard check — app can get stuck

**File:** `web-version/client/src/App.tsx:127-133` and `185-188`
**Issue:** In both `downloadIndividualSongs` and `downloadPlaylistAsZip`, `setIsDownloading(true)` is called before the `if (!playlistData || !playlistClips) return` guard. If the guard fires, the function returns without calling `setIsDownloading(false)`, locking the UI in a perpetual downloading state. The guard is currently unreachable via the UI (the download button is disabled when `!playlistData`), but the logic ordering is incorrect and becomes a live bug if the calling path ever changes.

**Fix:** Move the guard checks before the state mutations:
```ts
const downloadIndividualSongs = async () => {
    if (!playlistData || !playlistClips) return;   // guard first
    setDownloadPercentage(0);
    setCompletedItems(0);
    setIsDownloading(true);
    // ...
};
```

---

### WR-05: Playlist URL regex captures query strings and hash fragments into the playlist ID

**File:** `client/src/services/Suno.ts:52-53`
**Issue:** The regex `/suno\.com\/playlist\/(.*)/` uses `(.*)` which captures everything after `/playlist/`, including `?token=xyz` or `#section`. A URL like `https://suno.com/playlist/abc-123?ref=share` sends `abc-123?ref=share` as the playlist ID to the backend, causing a failed API call with a misleading error ("Failed to fetch playlist data"). This is a pre-existing bug, but phase 13 added adjacent URL-parsing logic without fixing it.

**Fix:**
```ts
const regex = /suno\.com\/playlist\/([^/?#]+)/;
```

---

### WR-06: Leading whitespace on `@username` input silently fails with "Invalid URL" error

**File:** `client/src/services/Suno.ts:41-49`
**Issue:** Phase 13 added `@username` support, but the routing logic uses `url.startsWith('@')`. A user typing `  @artist` (with a leading space — common from paste operations) fails all three route checks and throws "Invalid URL or no playlist ID found". The error message is misleading since the input was structurally valid.

**Fix:** Trim input before routing:
```ts
static async getSongsFromPlayList(url: string): Promise<[IPlaylist, IPlaylistClip[]]> {
    const trimmed = url.trim();
    if (trimmed.startsWith('@') || ...) {
        return this.getSongsFromUser(trimmed);
    }
    // ...
}
```
Alternatively, trim in the `getPlaylist` handler in `App.tsx` before passing to `Suno.getSongsFromPlayList`.

---

## Info

### IN-01: Unanchored `usernameUrlMatch` regex matches malformed hostnames

**File:** `client/src/services/Suno.ts:46`
**Issue:** The regex `/suno\.com\/@([^/?#]+)/` has no start-of-string or protocol anchor. A URL like `https://evil.com/suno.com/@user` matches and routes to `getSongsFromUser('user')`. Not a security vulnerability (the server controls what it fetches from Suno's API), but the routing is surprising. This is phase-13-introduced logic.

**Fix:**
```ts
const usernameUrlMatch = url.match(/^https?:\/\/suno\.com\/@([^/?#]+)/);
```

---

### IN-02: Bare-username heuristic produces false positives

**File:** `client/src/services/Suno.ts:41`
**Issue:** The condition `!url.includes('http') && !url.includes('playlist') && !url.includes('.')` routes arbitrary strings like `foo`, `12345`, or `my artist` to `getSongsFromUser` instead of showing a clear "invalid input" error. Pre-existing, but adjacent to phase 13 changes.

**Suggestion:** Require the bare-username path to match `@` prefix only; anything else that fails the URL patterns should throw "Invalid URL":
```ts
if (url.startsWith('@')) {
    return this.getSongsFromUser(url);
}
// then usernameUrlMatch, then playlist regex, then throw
```

---

### IN-03: `process.env.NODE_ENV` used in a Vite-bundled browser file

**File:** `client/src/services/Suno.ts:7`
**Issue:** Vite does auto-inject `process.env.NODE_ENV` so this works in practice, but it's non-idiomatic for a Vite project. The canonical form is `import.meta.env.MODE === 'production'` or `import.meta.env.PROD`. Pre-existing; not phase 12/13 work.

**Suggestion:**
```ts
const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';
```

---

### IN-04: Unused imports in `web-version/client/src/App.tsx`

**File:** `web-version/client/src/App.tsx:11,22,27,34-35,40,48,50`
**Issue:** The following are imported but never used in JSX or logic: `Divider`, `Alert`, `IconBrandGithub`, `IconSun`, `IconMoon`, `initializeSettingsManager`, `getSettingsManager`, `TestModal`. A comment at line 271 even acknowledges the settings manager is no longer used. Dead imports add bundle weight and confuse future maintainers.

**Fix:** Remove the unused import lines. If the TypeScript build has `noUnusedLocals: true`, these will fail compilation.

---

_Reviewed: 2026-05-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
