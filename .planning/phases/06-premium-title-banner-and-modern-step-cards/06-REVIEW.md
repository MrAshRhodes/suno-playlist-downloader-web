---
phase: 06-premium-title-banner-and-modern-step-cards
reviewed: 2026-04-14T12:00:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - client/src/App.tsx
  - client/src/App.css
findings:
  critical: 0
  warning: 1
  info: 2
  total: 3
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-04-14T12:00:00Z
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Phase 6 replaces the old `app-header` and `info-banner` with a hero banner image overlay, and wraps each step section in numbered `step-card monolith-card` containers. The changes are purely visual/structural as intended -- no functional logic was modified.

The hero banner implementation is clean: accessible (`aria-hidden` on decorative image, `alt="""`), properly layered with z-index for the overlay and actions, and all CSS custom properties are defined in both dark and light mode themes in `index.css`. The step card pattern is consistent across all three steps.

One warning relates to the hero banner image asset size (2.7 MB PNG), which will impact initial page load. Two info-level items note pre-existing debug artifacts that remain in the file.

## Warnings

### WR-01: Hero banner image is 2.7 MB unoptimized PNG

**File:** `client/src/App.tsx:9`
**Issue:** The `hero-banner.png` asset imported at line 9 is 2.7 MB. Since this is above the fold and loaded on every page view, it will noticeably delay first contentful paint, especially on mobile or slower connections. While Vite will bundle it, it will not compress a PNG of this size meaningfully.
**Fix:** Convert to WebP or AVIF format (typically 70-85% smaller), or provide a compressed JPEG fallback. Example using a build-time approach:
```bash
# Convert to WebP at high quality
npx sharp-cli -i client/src/assets/hero-banner.png -o client/src/assets/hero-banner.webp --format webp --quality 85
```
Then import the smaller format. Alternatively, add `loading="eager"` and `fetchpriority="high"` to the img tag for LCP optimization, and serve a compressed version.

## Info

### IN-01: Debug fetch on every component mount

**File:** `client/src/App.tsx:140-143`
**Issue:** The `useEffect` at line 139 calls `fetch('/api/debug')` on every mount. This is debug scaffolding that was noted in the phase 03 review and remains. The response is silently discarded (`.catch(() => {})`), so it causes no runtime errors, but it adds a network request on every page load for no user-facing purpose.
**Fix:** Remove the debug fetch effect entirely:
```tsx
// Remove this useEffect block
useEffect(() => {
    fetch('/api/debug')
        .then(response => response.json())
        .catch(() => {});
}, []);
```

### IN-02: console.log in error handler

**File:** `client/src/App.tsx:48`
**Issue:** The catch block in `getPlaylist` uses `console.log(err)` instead of `console.error(err)`. This is a minor inconsistency -- the `downloadPlaylist` catch block at line 122 correctly uses `console.error`.
**Fix:**
```tsx
} catch (err) {
    console.error(err);
    showError("Failed to fetch playlist data. Make sure you entered a valid link");
}
```

---

_Reviewed: 2026-04-14T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
