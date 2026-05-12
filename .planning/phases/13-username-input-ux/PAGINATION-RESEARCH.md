# Suno Pagination Research

**Researched:** 2026-05-12
**Tested against:** `@focusedbeats` (156 songs, user_id: `d0157894-3508-4f46-9c22-a3061ce18a6c`)

## TL;DR

`POST https://studio-api-prod.suno.com/api/unified/feed` is the real pagination endpoint. It accepts a JSON body with `feed_id`, `target_user_id`, `cursor`, and `page_size`, requires no authentication, and returns 20 songs per page. Starting from cursor `"20"` (after the 20 embedded in the profile HTML), it correctly fetches all 156 songs in 7 requests. No Puppeteer required.

---

## Finding 1: Pagination signals in HTML

The profile page at `https://suno.com/@username` embeds exactly **20 songs** in the Next.js flight data (RSC payload). The `user_songs` feed object has this structure after the `items` array:

```
],\"next_cursor\":\"20\"}
```

Key signals found:

| Field | Value | Location |
|-------|-------|----------|
| `clips_count` | `156` | Top-level user profile object |
| `next_cursor` | `"20"` | After the `items` array in the `user_songs` feed object |
| `has_more` | not present | — |
| `total_item_count` | not present | — |

The `next_cursor` value is a numeric string representing the offset of the next page, not an opaque token. It increments by `page_size` (always 20 server-side).

**URL query params do NOT work.** Fetching `?page=2`, `?cursor=20`, or `?offset=20` all return the identical first-page HTML with the same 20 songs and `next_cursor: "20"`. The SSR layer always delivers page 1 regardless of params. Pagination is client-side only.

**Source:** `[VERIFIED: live probe of https://suno.com/@focusedbeats]`

---

## Finding 2: Studio API endpoint results

The old code used `studio-api.prod.suno.com` — wrong hostname. The correct hostname is `studio-api-prod.suno.com` (note: `-prod` before `.suno.com`, not inside the subdomain as `api.prod`).

All previously tried endpoints on the correct hostname:

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /api/user_songs/` | 404 | Does not exist |
| `GET /api/clips/` | 404 | Does not exist |
| `GET /api/profile/:id/` | 404 | Does not exist |
| `POST /api/feed/v3` | 401 | Exists but requires auth bearer token |
| `GET /api/feed/v3` | 405 | Method not allowed (must be POST) |
| `POST /api/unified/feed` | **200** | **WORKS — no auth required** |

`/api/unified/feed` returns the full song objects including `audio_url`, `image_url`, `image_large_url`, `title`, `metadata.duration`, `metadata.tags`, `major_model_version`, `video_url` — everything the download pipeline needs.

**Source:** `[VERIFIED: live probe scripts]`

---

## Finding 3: Public/community API knowledge

Community Suno API wrappers (`gcui-art/suno-api`, `Malith-Rukshan/Suno-API`, etc.) focus on authenticated music *generation* endpoints, not public profile scraping. None document `/api/unified/feed`. This endpoint appears to be a newer internal endpoint not covered in third-party documentation.

The endpoint works without authentication because it serves public profile data — the same data visible to unauthenticated visitors on `suno.com/@username`.

**Source:** `[VERIFIED: web search + live probe confirms no-auth 200 response]`

---

## Finding 4: Puppeteer network interception viability

**Puppeteer CAN intercept the pagination calls — but it's unnecessary now that the endpoint is known.**

Observed behavior during Puppeteer testing:
- The "View all Songs" button navigates to `?page=songs` (client-side route change)
- On `?page=songs`, the React app immediately fires `POST /api/unified/feed` with cursor `"20"`, then `"40"`, etc.
- With a tall viewport (3000px height), the browser loaded 77 songs before the tall viewport was exhausted
- Scrolling further would trigger more `POST /api/unified/feed` calls
- No DOM scraping needed — the `content_item` objects in the response are complete song schemas

**Puppeteer on Replit:** The existing `puppeteer.launch()` with `--no-sandbox` flags works. However, the Puppeteer Chrome binary (v146) is missing from the cache; the code must use `executablePath` pointing to system Chrome, which is NOT available on Replit. The existing code in `fetchAllSongsWithBrowser` will fail on Replit for this reason. The direct API approach avoids this entirely.

**Source:** `[VERIFIED: Puppeteer probe with system Chrome on macOS]`

---

## Finding 5: URL parameter approach

`?page=songs`, `?page=2`, `?cursor=20`, `?offset=20` all return identical SSR HTML with 20 songs. The `?page=songs` param is purely a client-side React Router hint (tells the React app which tab to show) — it does not affect the server-rendered content.

**Source:** `[VERIFIED: live fetch comparison]`

---

## Recommended Approach

### Replace the broken multi-strategy scraper with a two-step approach

**Step 1:** Fetch `https://suno.com/@username` HTML and extract:
- `clips_count` (total songs) from `\\"clips_count\\":(\d+)`
- `user_id` from `\\"user_id\\":\\"([a-f0-9-]+)\\"`
- First 20 songs from the `user_songs` feed section (existing bracket-counting logic)
- `next_cursor` from after the `items` array: `],\\"next_cursor\\":\\"(\d+)\\"`

**Step 2:** Loop `POST /api/unified/feed` until `next_cursor` is absent:

```javascript
async function fetchAllUserSongs(username, userId, firstPageSongs, initialCursor, totalSongs) {
  const allSongs = [...firstPageSongs];
  let cursor = initialCursor; // e.g. "20"

  while (cursor) {
    const resp = await fetch('https://studio-api-prod.suno.com/api/unified/feed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': `https://suno.com/@${username}?page=songs`,
        'Origin': 'https://suno.com',
      },
      body: JSON.stringify({
        feed_id: 'user_songs',
        target_user_id: userId,
        request_metadata: { sort_by: 'created_at' },
        cursor: cursor,
        page_size: 20  // Server enforces 20; page_size > 20 returns 422
      })
    });

    if (!resp.ok) {
      console.warn(`unified/feed cursor=${cursor}: HTTP ${resp.status}`);
      break;
    }

    const data = await resp.json();
    const items = data.feed?.items || [];
    const clips = items
      .filter(i => i.content_type === 'clip' && i.content_item?.entity_type === 'song_schema')
      .map(i => i.content_item);

    allSongs.push(...clips);
    cursor = data.feed?.next_cursor ?? null;

    console.log(`  cursor ${cursor ? cursor : 'done'}: fetched ${clips.length}, total ${allSongs.length}/${totalSongs}`);
  }

  return allSongs;
}
```

### Integration point

In `routes/playlist.js`, the `GET /api/playlist/user/:username/songs` handler currently exits after extracting the first 20 songs. The fix is:

1. After extracting `clips` from HTML, also extract `next_cursor` and `userId`
2. If `clips.length < totalSongs && next_cursor`, call `fetchAllUserSongs`
3. Remove `fetchAdditionalSongs` and `fetchAllSongsWithBrowser` entirely

### Extraction of next_cursor from HTML

```javascript
// After the bracket-counting loop, look for next_cursor in the feed object
// The HTML contains: ],\"next_cursor\":\"20\"}}
const nextCursorMatch = profileHtml.match(/\\"next_cursor\\":\\"(\d+)\\"/);
const nextCursor = nextCursorMatch ? nextCursorMatch[1] : null;
```

### Key constraints

- `page_size` is fixed at 20 server-side — any other value returns 422
- Cursor is a numeric string offset, not an opaque token
- No authentication required
- The endpoint works without cookies or session tokens
- Rate limiting: not tested extensively; add small delay (200ms) between pages if needed for large libraries

---

## RESEARCH COMPLETE
