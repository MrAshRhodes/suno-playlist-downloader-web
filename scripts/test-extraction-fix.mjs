/**
 * Prototype the new extraction logic for the user_songs feed (Suno 2025 structure).
 * Run this first to verify the fix works before updating playlist.js.
 *
 * Usage: node scripts/test-extraction-fix.mjs [username]
 */

import fetch from 'node-fetch';

const username = process.argv[2] || 'focusedbeats';

console.log(`\n=== extraction fix prototype: @${username} ===\n`);

const resp = await fetch(`https://suno.com/@${username}`, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
});
const html = await resp.text();

console.log(`Response: ${resp.status}, ${(html.length / 1024).toFixed(1)} KB`);

// ─── 1. Total count ────────────────────────────────────────────────────────────
// New structure uses clips_count, not num_total_clips
const clipsCountMatch = html.match(/\\"clips_count\\":(\d+)/);
const totalSongs = clipsCountMatch ? parseInt(clipsCountMatch[1]) : 0;
console.log(`clips_count: ${totalSongs}`);

// ─── 2. Find user_songs feed ──────────────────────────────────────────────────
const userSongsMarker = '\\"feed_id\\":\\"user_songs\\"';
const markerIdx = html.indexOf(userSongsMarker);
console.log(`user_songs marker found: ${markerIdx > -1} (idx ${markerIdx})`);

if (markerIdx === -1) {
  console.error('FAIL: user_songs feed not found in HTML');
  process.exit(1);
}

// ─── 3. Find items array ──────────────────────────────────────────────────────
const itemsKey = '\\"items\\":[';
const itemsStart = html.indexOf(itemsKey, markerIdx);
console.log(`items array found: ${itemsStart > -1} (idx ${itemsStart})`);

if (itemsStart === -1) {
  console.error('FAIL: items array not found after user_songs');
  process.exit(1);
}

// ─── 4. Extract song objects via bracket counting ─────────────────────────────
// The HTML uses \" for quotes but plain { } for brackets — bracket counting is safe.
const songs = [];
let pos = itemsStart + itemsKey.length;

while (pos < html.length) {
  if (html[pos] === '{') {
    // Count brackets to find end of this item object
    let depth = 0;
    let start = pos;
    while (pos < html.length) {
      if (html[pos] === '{') depth++;
      else if (html[pos] === '}') {
        depth--;
        if (depth === 0) {
          const itemStr = html.slice(start, pos + 1);
          try {
            // Unescape \" → " and \\ → \  then parse
            const unescaped = itemStr
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\');
            const item = JSON.parse(unescaped);
            if (item.content_type === 'clip' && item.content_item?.entity_type === 'song_schema') {
              songs.push(item.content_item);
            }
          } catch (e) {
            console.warn(`  Failed to parse item at pos ${start}: ${e.message.slice(0, 80)}`);
          }
          pos++;
          break;
        }
      }
      pos++;
    }
    // Skip comma + whitespace between items
    while (pos < html.length && (html[pos] === ',' || html[pos] === ' ')) pos++;
  } else if (html[pos] === ']') {
    break; // End of items array
  } else {
    pos++;
  }
}

// ─── 5. Results ───────────────────────────────────────────────────────────────
console.log(`\nExtracted ${songs.length} songs (total: ${totalSongs})`);

if (songs.length > 0) {
  const s = songs[0];
  console.log(`\nFirst song:`);
  console.log(`  title:      ${s.title}`);
  console.log(`  id:         ${s.id}`);
  console.log(`  duration:   ${s.metadata?.duration}s`);
  console.log(`  audio_url:  ${s.audio_url ? s.audio_url.slice(0, 60) + '...' : 'MISSING'}`);
  console.log(`  image_url:  ${s.image_url ? 'present' : 'MISSING'}`);
  console.log(`  tags:       ${s.metadata?.tags?.slice(0, 80)}...`);

  console.log(`\nAll ${songs.length} songs:`);
  songs.forEach((s, i) => console.log(`  ${i + 1}. ${s.title} (${s.metadata?.duration?.toFixed(0)}s)`));

  console.log('\n✓ Extraction fix works — ready to update playlist.js');
} else {
  console.error('\n✗ No songs extracted — fix needs more investigation');
}

console.log('\n=== done ===\n');
