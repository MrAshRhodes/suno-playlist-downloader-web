import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Fetch remaining pages of a user's songs via POST /api/unified/feed.
// Suno returns exactly 20 songs per page; cursor is a numeric string offset.
// No authentication required — endpoint serves public profile data.
async function fetchAllUserSongs(username, userId, firstPageSongs, initialCursor, totalSongs) {
  const allSongs = [...firstPageSongs];
  let cursor = initialCursor;

  while (cursor) {
    try {
      const resp = await fetch('https://studio-api-prod.suno.com/api/unified/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': `https://suno.com/@${username}?page=songs`,
          'Origin': 'https://suno.com',
        },
        body: JSON.stringify({
          feed_id: 'user_songs',
          target_user_id: userId,
          request_metadata: { sort_by: 'created_at' },
          cursor: cursor,
          page_size: 20
        }),
        signal: AbortSignal.timeout(15000)
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

      console.log(`  unified/feed: got ${clips.length}, total ${allSongs.length}/${totalSongs}, next cursor: ${cursor ?? 'none'}`);
    } catch (error) {
      console.warn(`unified/feed error at cursor=${cursor}:`, error.message);
      break;
    }
  }

  return allSongs;
}

/**
 * @route POST /api/playlist/fetch
 * @description Fetch playlist by URL
 * @access Public
 */
router.post('/fetch', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'Playlist URL is required' });
    }
    
    // Extract playlist ID from URL - supports various URL formats
    let playlistId;
    
    // Try multiple regex patterns to extract playlist ID
    const patterns = [
      /\/playlists\/([a-zA-Z0-9-]+)/,    // /playlists/id
      /playlists\/([a-zA-Z0-9-]+)/,      // playlists/id
      /playlist\/([a-zA-Z0-9-]+)/,       // playlist/id (singular)
      /\/playlist\/([a-zA-Z0-9-]+)/,     // /playlist/id (singular)
      /[?&]id=([a-zA-Z0-9-]+)/,          // ?id=id or &id=id
      /([a-zA-Z0-9-]{22,36})/            // Just the ID itself (if it's in UUID format)
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        playlistId = match[1];
        break;
      }
    }
    
    // If no patterns matched
    if (!playlistId) {
      // Last resort: try to use the URL as an ID directly
      if (url.length >= 10 && /^[a-zA-Z0-9-]+$/.test(url)) {
        playlistId = url;
        console.log("Using URL as direct ID:", playlistId);
      } else {
        return res.status(400).json({ message: 'Invalid playlist URL or ID. Please provide a valid Suno playlist URL or ID.' });
      }
    }
    
    console.log("Fetching playlist with ID:", playlistId);
    
    // Fetch from Suno API
    const response = await fetch(`https://studio-api.prod.suno.com/api/playlist/${playlistId}/`);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        message: `Failed to fetch playlist: ${response.statusText}`
      });
    }
    
    const data = await response.json();
    
    // Transform data into a simpler format
    const tracks = data.playlist_clips.map(({ clip }) => ({
      id: clip.id,
      title: clip.title,
      duration: clip.metadata.duration,
      audio_url: clip.audio_url
    }));
    
    res.json({
      title: data.name,
      image: data.image_url,
      tracks: tracks
    });
  } catch (error) {
    console.error('Playlist fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch playlist data' });
  }
});

/**
 * @route GET /api/playlist/:id
 * @description Proxy endpoint to get playlist data from Suno API
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1 } = req.query;
    
    // Validate playlist ID format
    if (!id || id === 'liked') {
      return res.status(400).json({ 
        error: 'Invalid playlist ID. Only specific playlist IDs are supported.'
      });
    }
    
    // Fetch from Suno API
    const response = await fetch(`https://studio-api.prod.suno.com/api/playlist/${id}/?page=${page}`);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to fetch playlist data: ${response.statusText}`
      });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Playlist fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch playlist data' });
  }
});

/**
 * @route GET /api/playlist/:id/all
 * @description Get all clips from a playlist, handling pagination
 * @access Public
 */
router.get('/:id/all', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate playlist ID format
    if (!id || id === 'liked') {
      return res.status(400).json({ 
        error: 'Invalid playlist ID. Only specific playlist IDs are supported.'
      });
    }
    
    let currentPage = 1;
    let songNo = 1;
    let endOfPlaylist = false;
    let playlistName = "";
    let playListImage = "";
    const clips = [];
    
    // Fetch all pages of the playlist
    while (!endOfPlaylist) {
      const response = await fetch(`https://studio-api.prod.suno.com/api/playlist/${id}/?page=${currentPage}`);
      
      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `Failed to fetch playlist data: ${response.statusText}`
        });
      }
      
      const data = await response.json();
      
      if (data.playlist_clips.length === 0) {
        endOfPlaylist = true;
      } else {
        playlistName = data.name;
        playListImage = data.image_url;
        
        data.playlist_clips.forEach(({ clip }) => {
          const itemData = {
            id: clip.id,
            no: songNo,
            title: clip.title,
            duration: clip.metadata.duration,
            tags: clip.metadata.tags,
            model_version: clip.major_model_version,
            audio_url: clip.audio_url,
            video_url: clip.video_url,
            image_url: clip.image_url,
            image_large_url: clip.image_large_url,
            status: 0 // Status enum - None
          };
          clips.push(itemData);
          songNo++;
        });
      }
      currentPage++;
    }
    
    // Return combined playlist data
    res.json({
      playlist: {
        name: playlistName,
        image: playListImage
      },
      clips
    });
  } catch (error) {
    console.error('Complete playlist fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch complete playlist data' });
  }
});

/**
 * @route GET /api/playlist/user/:username/songs
 * @description Get all songs from a user profile (EXPERIMENTAL)
 * @access Public
 */
router.get('/user/:username/songs', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ 
        error: 'Username is required'
      });
    }
    
    // Remove @ prefix if present
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
    
    console.log("Fetching songs for user:", cleanUsername);
    
    // First, get user profile to extract user ID
    const profileResponse = await fetch(`https://suno.com/@${cleanUsername}`);
    
    if (!profileResponse.ok) {
      return res.status(404).json({ 
        error: `User profile not found: @${cleanUsername}. Check if the username is correct.`
      });
    }
    
    const profileHtml = await profileResponse.text();
    
    // Extract user ID from profile page  
    const userIdMatch = profileHtml.match(/user_id\\":\\"([a-f0-9-]+)\\"/);
    if (!userIdMatch) {
      return res.status(404).json({ 
        error: `Could not extract user ID from @${cleanUsername} profile. The user may have a private profile.`
      });
    }
    
    const userId = userIdMatch[1];
    console.log("Found user ID:", userId);
    
    // Extract clips from the user_songs feed (Suno 2025 structure)
    // Songs live under: feed.items[0].content_item.items[*].content_item (content_type: "clip")
    // The HTML embeds JSON with \" escaping inside a self.__next_f.push() script tag.
    console.log("Extracting clips from profile feed...");

    let clips = [];
    let totalSongs = 0;

    try {
      // Total count is now under clips_count, not num_total_clips
      const clipsCountMatch = profileHtml.match(/\\"clips_count\\":(\d+)/);
      if (clipsCountMatch) {
        totalSongs = parseInt(clipsCountMatch[1]);
        console.log(`User has ${totalSongs} total songs`);
      }

      // Locate the user_songs feed section and its items array
      const userSongsMarker = '\\"feed_id\\":\\"user_songs\\"';
      const markerIdx = profileHtml.indexOf(userSongsMarker);

      if (markerIdx !== -1) {
        const itemsKey = '\\"items\\":[';
        const itemsStart = profileHtml.indexOf(itemsKey, markerIdx);

        if (itemsStart !== -1) {
          // Walk the items array using bracket counting — safe because { } are not escaped
          let pos = itemsStart + itemsKey.length;

          while (pos < profileHtml.length) {
            if (profileHtml[pos] === '{') {
              let depth = 0;
              const start = pos;
              while (pos < profileHtml.length) {
                if (profileHtml[pos] === '{') depth++;
                else if (profileHtml[pos] === '}') {
                  depth--;
                  if (depth === 0) {
                    const itemStr = profileHtml.slice(start, pos + 1);
                    try {
                      const unescaped = itemStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                      const item = JSON.parse(unescaped);
                      if (item.content_type === 'clip' && item.content_item?.entity_type === 'song_schema') {
                        clips.push(item.content_item);
                      }
                    } catch (_) {
                      // Skip malformed items
                    }
                    pos++;
                    break;
                  }
                }
                pos++;
              }
              while (pos < profileHtml.length && (profileHtml[pos] === ',' || profileHtml[pos] === ' ')) pos++;
            } else if (profileHtml[pos] === ']') {
              break;
            } else {
              pos++;
            }
          }

          console.log(`Feed extraction: found ${clips.length} clips on first page`);
        }
      }

      if (clips.length === 0) {
        return res.status(404).json({
          error: `No songs found for @${cleanUsername}. The user may have a private profile or no public songs.`
        });
      }

      // Fetch remaining pages if the user has more songs than the first page
      const nextCursorMatch = profileHtml.match(/\\"next_cursor\\":\\"(\d+)\\"/);
      const nextCursor = nextCursorMatch ? nextCursorMatch[1] : null;

      if (nextCursor && clips.length < totalSongs) {
        console.log(`Fetching remaining songs (cursor=${nextCursor}, total=${totalSongs})...`);
        clips = await fetchAllUserSongs(cleanUsername, userId, clips, nextCursor, totalSongs);
        console.log(`All pages complete: ${clips.length}/${totalSongs} songs`);
      }

    } catch (error) {
      console.error("Error extracting clips:", error);
      return res.status(500).json({
        error: `Failed to extract songs from @${cleanUsername} profile. Try using a playlist URL instead.`,
        suggestion: `Visit https://suno.com/@${cleanUsername} and copy a playlist URL`
      });
    }
    
    if (clips.length === 0) {
      return res.status(404).json({ 
        error: `No songs found for @${cleanUsername}. User might have private profile or no public songs.`,
        suggestion: `Try using one of @${cleanUsername}'s public playlists instead`
      });
    }
    
    // Transform data to match playlist format
    let songNo = 1;
    const transformedClips = clips.map(clip => ({
      id: clip.id,
      no: songNo++,
      title: clip.title,
      duration: clip.metadata?.duration || clip.duration || 0,
      tags: clip.metadata?.tags || clip.tags || '',
      model_version: clip.major_model_version || clip.model_version || 'unknown',
      audio_url: clip.audio_url,
      video_url: clip.video_url,
      image_url: clip.image_url,
      image_large_url: clip.image_large_url,
      status: 0 // Status enum - None
    }));
    
    console.log(`Successfully extracted ${transformedClips.length} songs for @${cleanUsername}`);
    
    const playlistName = `@${cleanUsername}'s Songs (${transformedClips.length} songs)`;

    res.json({
      playlist: {
        name: playlistName,
        image: ''
      },
      clips: transformedClips
    });
    
  } catch (error) {
    console.error('User songs fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user songs. Username downloads are experimental - try using a playlist URL instead.',
      suggestion: 'Copy a playlist URL from the user\'s Suno profile for reliable downloads'
    });
  }
});

export default router;