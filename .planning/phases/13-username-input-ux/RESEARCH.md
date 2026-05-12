# Phase 13 Research: @Username Input UX

**Researched:** 2026-05-12
**Domain:** React input UI, TypeScript service routing
**Confidence:** HIGH (all findings verified against source files)

---

## Summary

Phase 13 requires three surgical edits: one placeholder string, one heading string plus a helper text element in `App.tsx`, and one routing branch in `Suno.ts`. The D-05 decision in CONTEXT.md contains a correctness bug — passing a full URL to `getSongsFromUser` works by accident (the method strips leading `@` but a full URL is not prefixed with `@`, so `cleanUsername` would be the entire URL string `https://suno.com/@focusedbeats`), causing the backend call to become `/api/playlist/user/https://suno.com/@focusedbeats/songs`, which will fail. The username must be extracted before passing to `getSongsFromUser`. There are no existing automated tests in this project.

---

## Finding 1: INP-03 Routing — D-05 Bug Confirmed

**Verified by:** reading `client/src/services/Suno.ts` lines 67–70 directly.

`getSongsFromUser` does this:
```typescript
const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
const response = await fetch(`${API_BASE}/playlist/user/${cleanUsername}/songs`);
```

If called with `https://suno.com/@focusedbeats`:
- `username.startsWith('@')` → `false`
- `cleanUsername` → `"https://suno.com/@focusedbeats"` (entire URL, unmodified)
- Fetch target → `/api/playlist/user/https://suno.com/@focusedbeats/songs` — **404/500, not a valid route**

**D-05 as written is incorrect.** The full URL must have the username extracted first.

**Correct implementation:**

```typescript
// Check for full suno.com/@username URL (e.g. https://suno.com/@focusedbeats)
const usernameUrlMatch = url.match(/suno\.com\/@([^/?#]+)/);
if (usernameUrlMatch) {
    return this.getSongsFromUser(usernameUrlMatch[1]);
}
```

Inserting `usernameUrlMatch[1]` (e.g. `"focusedbeats"`) means `getSongsFromUser` receives a bare username without `@`, `cleanUsername` stays `"focusedbeats"`, and the fetch becomes `/api/playlist/user/focusedbeats/songs` — correct.

**Insertion point:** After the existing bare-`@` check (line 38), before the playlist regex (line 41). Full updated routing order:

1. `url.startsWith('@') || (!url.includes('http') && ...)` → `getSongsFromUser(url)` ← existing
2. `url.match(/suno\.com\/@([^/?#]+)/)` → `getSongsFromUser(match[1])` ← **new**
3. `url.match(/suno\.com\/playlist\/(.*)/)` → playlist fetch ← existing
4. `throw new Error("Invalid URL or no playlist ID found")` ← existing

---

## Finding 2: App.tsx Helper Text Placement

**Verified by:** reading `client/src/App.tsx` lines 200–225 directly.

Exact current structure of Step 1 card:

```tsx
<div className="step-card monolith-card">
  <div className="step-heading">
    <div className="step-number">1</div>
    <h3 className="section-heading" style={{ margin: 0 }}>Paste playlist link</h3>  {/* INP-02: update text */}
  </div>
  <div style={{ display: "flex", gap: "10px" }}>
    <input
        type="text"
        value={playlistUrl}
        onChange={(e) => setPlaylistUrl(e.target.value)}
        placeholder="https://suno.com/playlist/..."  {/* INP-01: update text */}
        disabled={isGettingPlaylist || isDownloading}
        className="input-field"
    />
    <button ...>Get playlist songs</button>
  </div>
  {/* INP-02: helper text goes HERE, after the flex div, still inside step-card */}
</div>
```

Helper text element to insert after the `</div>` that closes the flex row:

```tsx
<div style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "6px" }}>
    Accepts playlist URLs and @username handles
</div>
```

Notes:
- `<small>` or `<div>` both work — `<div>` is consistent with existing muted-text patterns in the file (e.g. the `downloadPercentage` span uses `color: var(--text-secondary)` inline)
- No `margin: 0` or flex override needed; the step-card has normal block flow after the flex div

---

## Finding 3: CSS Variables

**Verified by:** reading `client/src/index.css` lines 34–35 and 63–64 directly.

| Variable | Dark mode value | Light mode value | Character |
|---|---|---|---|
| `--text-secondary` | `#B3B3B3` | `#5A5A7A` | Readable muted grey |
| `--text-muted` | `rgba(255,255,255,0.50)` | `rgba(26,26,46,0.60)` | More transparent/faded |

Both variables are defined in both `.dark-mode` and `.light-mode`. Both are valid for helper text.

**Use `--text-secondary`** — it matches D-04 exactly and is already used for readable secondary content (e.g. the progress bar percentage). `--text-muted` is more washed-out (alpha-based) and better suited for truly de-emphasized labels. The CONTEXT.md D-04 decision (`var(--text-secondary)`) is correct.

---

## Finding 4: Regex Pattern

**Verified by:** analysis of `getSongsFromUser` argument handling.

**Detection regex:** `/suno\.com\/@([^/?#]+)/`

- `suno\.com\/@` — matches the literal domain + `/@`
- `([^/?#]+)` — capture group: everything after `@` up to `/`, `?`, or `#` (stops at query strings, hash fragments, or trailing slashes)
- Works for: `https://suno.com/@focusedbeats`, `https://suno.com/@focusedbeats/`, `https://suno.com/@focusedbeats?tab=songs`

**Why not D-05's `/suno\.com\/@/`?** That pattern only detects — it doesn't extract. You'd still have to extract the username separately, so the capture group version is strictly better and requires no follow-up code.

**Alternative (simpler) pattern** that also works given `getSongsFromUser`'s own `@`-stripping logic:

```typescript
// Could also pass "@focusedbeats" — getSongsFromUser strips the @
return this.getSongsFromUser('@' + usernameUrlMatch[1]);
```

Recommended: pass the bare username `usernameUrlMatch[1]` directly (no `@`) — cleaner, no redundant stripping.

---

## Finding 5: Test Coverage

**Verified by:** `find` across `client/src/` and project root for `*.test.*`, `*.spec.*`, `jest.config.*`, `vitest.config.*`.

**No test files exist anywhere in this project.** No jest, vitest, or any other test runner configured. No `test` script in any package.json test infrastructure.

**Implication for planner:** Do not add test tasks to the plan. UAT for INP-03 is manual: paste `https://suno.com/@focusedbeats` into the input field and verify songs load.

---

## Corrections to CONTEXT.md

| Decision | Issue | Correction |
|---|---|---|
| **D-05** | `return this.getSongsFromUser(url)` passes the full URL — `getSongsFromUser` does not parse URLs, it expects a username string | Change to: `const m = url.match(/suno\.com\/@([^/?#]+)/); if (m) return this.getSongsFromUser(m[1]);` |

All other decisions (D-01 through D-04) are correct and confirmed against the source files.

---

## Implementation Checklist

### Task A — INP-01: Update placeholder (App.tsx)
- File: `client/src/App.tsx`
- Change: `placeholder="https://suno.com/playlist/..."` → `placeholder="Playlist URL or @username"`
- Location: the `<input type="text">` inside Step 1 card (currently line ~212)

### Task B — INP-02: Update heading + add helper text (App.tsx)
- File: `client/src/App.tsx`
- Change 1: `>Paste playlist link</h3>` → `>Paste playlist link or @username</h3>`
- Change 2: Insert after the closing `</div>` of the flex row (the `display: flex, gap: 10px` div):
  ```tsx
  <div style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "6px" }}>
      Accepts playlist URLs and @username handles
  </div>
  ```

### Task C — INP-03: Add URL routing branch (Suno.ts) — uses corrected pattern
- File: `client/src/services/Suno.ts`
- Insert after line 40 (after the existing bare-`@` guard, before the playlist regex):
  ```typescript
  // Route full suno.com/@username URLs to getSongsFromUser
  const usernameUrlMatch = url.match(/suno\.com\/@([^/?#]+)/);
  if (usernameUrlMatch) {
      return this.getSongsFromUser(usernameUrlMatch[1]);
  }
  ```

### Task D — Manual UAT
- Paste `https://suno.com/@focusedbeats` into the input → click "Get playlist songs"
- Verify songs load (confirms INP-03 routing works end-to-end)
- Verify helper text appears below the input in both dark and light mode

---

## RESEARCH COMPLETE
