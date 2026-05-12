/**
 * Probe script — tests whether the @username backend fetch logic actually works.
 *
 * Usage:
 *   node scripts/test-username-fetch.mjs [username]
 *   node scripts/test-username-fetch.mjs focusedbeats
 *
 * Two modes:
 *   1. Direct HTML probe — tests the core regex extraction logic (no server needed)
 *   2. Full endpoint test — hits /api/playlist/user/:username/songs (requires server running)
 */

import fetch from 'node-fetch';

const username = process.argv[2] || 'focusedbeats';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

console.log(`\n=== @username fetch probe: @${username} ===\n`);

// ─── Mode 1: Direct HTML probe ────────────────────────────────────────────────
console.log('── Mode 1: Direct HTML probe (no server needed) ──');
console.log(`Fetching https://suno.com/@${username} ...`);

let profileHtml = '';
try {
  const t0 = Date.now();
  const resp = await fetch(`https://suno.com/@${username}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    }
  });
  profileHtml = await resp.text();
  const elapsed = Date.now() - t0;

  console.log(`  HTTP status: ${resp.status} (${elapsed}ms)`);
  console.log(`  Response size: ${(profileHtml.length / 1024).toFixed(1)} KB`);

  // Check 1: user_id extraction
  const userIdMatch = profileHtml.match(/user_id\\":\\"([a-f0-9-]+)\\"/);
  if (userIdMatch) {
    console.log(`  ✓ user_id found: ${userIdMatch[1]}`);
  } else {
    console.log('  ✗ user_id NOT found — profile may be private or HTML structure changed');
  }

  // Check 2: total clips count (Suno 2025: clips_count, not num_total_clips)
  const clipsCountMatch = profileHtml.match(/\\"clips_count\\":(\d+)/);
  if (clipsCountMatch) {
    console.log(`  ✓ clips_count: ${clipsCountMatch[1]}`);
  } else {
    console.log('  ✗ clips_count NOT found');
  }

  // Check 3: user_songs feed + bracket-counting extraction (matches updated playlist.js logic)
  const markerIdx = profileHtml.indexOf('\\"feed_id\\":\\"user_songs\\"');
  const itemsStart = markerIdx > -1 ? profileHtml.indexOf('\\"items\\":[', markerIdx) : -1;
  if (itemsStart > -1) {
    const songs = [];
    let pos = itemsStart + '\\"items\\":['.length;
    while (pos < profileHtml.length) {
      if (profileHtml[pos] === '{') {
        let depth = 0, start = pos;
        while (pos < profileHtml.length) {
          if (profileHtml[pos] === '{') depth++;
          else if (profileHtml[pos] === '}') { depth--; if (depth === 0) { pos++; break; } }
          pos++;
        }
        try {
          const item = JSON.parse(profileHtml.slice(start, pos).replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
          if (item.content_type === 'clip' && item.content_item?.entity_type === 'song_schema') songs.push(item.content_item);
        } catch (_) {}
        while (pos < profileHtml.length && (profileHtml[pos] === ',' || profileHtml[pos] === ' ')) pos++;
      } else if (profileHtml[pos] === ']') { break; } else { pos++; }
    }
    console.log(`  ✓ user_songs feed extracted: ${songs.length} songs`);
    if (songs.length > 0) {
      console.log(`    First song: "${songs[0].title}" (id: ${songs[0].id})`);
      console.log(`    audio_url present: ${!!songs[0].audio_url}`);
    }
  } else {
    console.log('  ✗ user_songs feed NOT found in HTML');
  }

} catch (e) {
  console.log(`  ✗ HTML fetch failed: ${e.message}`);
}

// ─── Mode 2: Full endpoint test ───────────────────────────────────────────────
console.log('\n── Mode 2: Full endpoint test (requires server on ' + SERVER_URL + ') ──');

try {
  const t0 = Date.now();
  const resp = await fetch(`${SERVER_URL}/api/playlist/user/${username}/songs`, {
    signal: AbortSignal.timeout(30000)
  });
  const elapsed = Date.now() - t0;
  const data = await resp.json();

  console.log(`  HTTP status: ${resp.status} (${elapsed}ms)`);

  if (resp.ok) {
    console.log(`  ✓ Success — ${data.clips?.length ?? 0} songs returned`);
    console.log(`  Playlist name: ${data.playlist?.name}`);
    if (data.metadata?.note) console.log(`  Note: ${data.metadata.note}`);
    if (data.clips?.length > 0) {
      console.log(`  First song: "${data.clips[0].title}"`);
      console.log(`  audio_url present: ${!!data.clips[0].audio_url}`);
    }
  } else {
    console.log(`  ✗ Error: ${data.error}`);
    if (data.suggestion) console.log(`  Suggestion: ${data.suggestion}`);
  }
} catch (e) {
  if (e.name === 'TimeoutError') {
    console.log(`  ✗ Timeout after 30s — server too slow or not running`);
  } else {
    console.log(`  ✗ Could not reach server: ${e.message}`);
    console.log(`  Start server with: npm start`);
  }
}

console.log('\n=== probe complete ===\n');
