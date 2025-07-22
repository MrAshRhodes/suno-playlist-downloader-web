import express from 'express';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer';

const router = express.Router();

// Helper function to fetch ALL songs using browser automation with infinite scroll
async function fetchAllSongsWithBrowser(username, totalSongs) {
  let browser;
  try {
    console.log(`Starting browser automation to fetch all ${totalSongs} songs for @${username}...`);
    
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set user agent and viewport
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to user profile
    const profileUrl = `https://suno.com/@${username}`;
    console.log(`Loading profile: ${profileUrl}`);
    await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    let previousCount = 0;
    let currentCount = 0;
    let consecutiveNoChange = 0;
    const maxNoChange = 3;
    
    console.log('Starting infinite scroll to load all songs...');
    
    // Keep scrolling until we have all songs or no more are loading
    while (currentCount < totalSongs && consecutiveNoChange < maxNoChange) {
      // Scroll to bottom
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // Wait for potential new content to load
      await page.waitForTimeout(2000);
      
      // Count current songs on page
      currentCount = await page.evaluate(() => {
        // Look for song containers - try multiple selectors
        const songSelectors = [
          '[data-testid*="song"]',
          '[class*="song"]',
          '[class*="track"]',
          '[class*="clip"]',
          'div[id]' // Many songs have div with id
        ];
        
        let maxCount = 0;
        for (const selector of songSelectors) {
          const elements = document.querySelectorAll(selector);
          maxCount = Math.max(maxCount, elements.length);
        }
        
        return maxCount;
      });
      
      console.log(`Scrolled: Found ${currentCount} songs (target: ${totalSongs})`);
      
      // Check if count increased
      if (currentCount <= previousCount) {
        consecutiveNoChange++;
        console.log(`No new songs loaded (${consecutiveNoChange}/${maxNoChange})`);
      } else {
        consecutiveNoChange = 0;
      }
      
      previousCount = currentCount;
    }
    
    console.log(`Infinite scroll complete. Extracting ${currentCount} songs...`);
    
    // Extract all song data from the fully loaded page
    const allSongs = await page.evaluate(() => {
      // Try to extract songs from the page's JavaScript state
      const scripts = document.querySelectorAll('script');
      let clips = [];
      
      for (const script of scripts) {
        const content = script.textContent || script.innerHTML;
        if (content.includes('clips') && content.includes('entity_type')) {
          try {
            // Look for clips array in various formats
            const clipsPatterns = [
              /"clips":\s*\[(.*?)\]/s,
              /'clips':\s*\[(.*?)\]/s,
              /clips:\s*\[(.*?)\]/s
            ];
            
            for (const pattern of clipsPatterns) {
              const match = content.match(pattern);
              if (match) {
                const clipsString = match[1];
                // Clean up escaped quotes
                const cleanedString = clipsString.replace(/\\"/g, '"').replace(/\\'/g, "'");
                
                try {
                  const parsedClips = JSON.parse(`[${cleanedString}]`);
                  if (Array.isArray(parsedClips) && parsedClips.length > 0) {
                    // Filter for songs only
                    const songClips = parsedClips.filter(clip => 
                      clip.entity_type === 'song_schema' || 
                      clip.type === 'song' ||
                      !clip.entity_type
                    );
                    if (songClips.length > clips.length) {
                      clips = songClips;
                    }
                  }
                } catch (parseError) {
                  // Continue trying other patterns
                }
              }
            }
          } catch (error) {
            // Continue to next script
          }
        }
      }
      
      return clips;
    });
    
    console.log(`Browser automation extracted ${allSongs.length} songs`);
    return allSongs;
    
  } catch (error) {
    console.error('Browser automation failed:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Helper function to fetch additional songs using multiple strategies
async function fetchAdditionalSongs(username, userId, currentCount, totalSongs) {
  const additionalClips = [];
  console.log(`Attempting to fetch remaining ${totalSongs - currentCount} songs using multiple strategies...`);
  
  // Strategy 1: Try different API endpoint patterns (most likely to work)
  const apiPatterns = [
    // Try user handle-based endpoints
    { 
      url: `https://studio-api.prod.suno.com/api/clips`,
      method: 'GET',
      params: `?user_handle=${username}&limit=100`
    },
    {
      url: `https://studio-api.prod.suno.com/api/clips`,
      method: 'GET', 
      params: `?user_id=${userId}&limit=100`
    },
    // Try profile-based endpoints
    {
      url: `https://studio-api.prod.suno.com/api/profile/${userId}`,
      method: 'GET',
      params: `?include_clips=true&limit=100`
    },
    // Try search endpoints
    {
      url: `https://studio-api.prod.suno.com/api/search`,
      method: 'GET',
      params: `?query=user:${username}&type=clip&limit=100`
    },
    // Try feed endpoints
    {
      url: `https://studio-api.prod.suno.com/api/feed/${userId}`,
      method: 'GET',
      params: `?limit=100`
    }
  ];
  
  for (const pattern of apiPatterns) {
    try {
      const fullUrl = `${pattern.url}${pattern.params}`;
      console.log(`Trying: ${pattern.method} ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        method: pattern.method,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; SunoPlaylistDownloader/1.0)',
          'Referer': `https://suno.com/@${username}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        let clips = [];
        
        // Handle different response formats
        if (data.clips && Array.isArray(data.clips)) {
          clips = data.clips;
        } else if (Array.isArray(data)) {
          clips = data;
        } else if (data.results && Array.isArray(data.results)) {
          clips = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          clips = data.data;
        }
        
        if (clips.length > 0) {
          // Filter for songs only and remove duplicates
          const songClips = clips.filter(clip => 
            clip.entity_type === 'song_schema' || 
            clip.type === 'song' || 
            !clip.entity_type // Assume songs if no type specified
          );
          
          const existingIds = new Set(additionalClips.map(c => c.id));
          const newClips = songClips.filter(clip => !existingIds.has(clip.id));
          
          additionalClips.push(...newClips);
          console.log(`✅ Found ${newClips.length} new clips with ${pattern.method} ${pattern.url} (total: ${additionalClips.length})`);
          
          // If we got a good amount, this endpoint works
          if (newClips.length >= 20) {
            break;
          }
        }
      } else {
        console.log(`❌ ${pattern.method} ${pattern.url}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${pattern.method} ${pattern.url}: ${error.message}`);
    }
  }
  
  // Strategy 2: If API failed, try fetching multiple profile pages with different techniques
  if (additionalClips.length === 0) {
    console.log('API strategies failed, trying profile page scraping with different cursors...');
    
    // Try to extract pagination cursors from the original profile page
    // and use them in subsequent requests
    try {
      for (let offset = 20; offset < Math.min(totalSongs, 200); offset += 20) {
        const profileUrl = `https://suno.com/@${username}`;
        const response = await fetch(profileUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SunoPlaylistDownloader/1.0)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          }
        });
        
        if (response.ok) {
          const html = await response.text();
          
          // Try to find more clips in the HTML by looking for different patterns
          const allClipMatches = html.match(/\\"id\\":\\"[a-f0-9-]+\\",\\"entity_type\\":\\"song_schema\\"/g);
          if (allClipMatches && allClipMatches.length > currentCount) {
            console.log(`Found ${allClipMatches.length} total clip references in profile page`);
            // This indicates there might be more clips, but we can't extract them easily
            break;
          }
        }
      }
    } catch (error) {
      console.log(`Profile scraping failed: ${error.message}`);
    }
  }
  
  console.log(`Strategies complete: Found ${additionalClips.length} additional clips`);
  return additionalClips.slice(0, totalSongs - currentCount);
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
    
    // Extract clips with pagination support
    console.log("Extracting clips from profile with pagination...");
    
    let clips = [];
    let totalSongs = 0;
    
    try {
      // First, extract total number of songs and initial clips from HTML
      const totalMatch = profileHtml.match(/num_total_clips\\"?:(\d+)/);
      if (totalMatch) {
        totalSongs = parseInt(totalMatch[1]);
        console.log(`User has ${totalSongs} total songs`);
      }
      
      // Extract initial clips from HTML
      const clipsPattern = /\\"clips\\":\[({.*?\\"entity_type\\":\\"song_schema\\".*?}(?:,{.*?\\"entity_type\\":\\"song_schema\\".*?})*)\]/s;
      const clipsMatch = profileHtml.match(clipsPattern);
      
      if (clipsMatch) {
        let clipsString = clipsMatch[1];
        clipsString = clipsString.replace(/\\"/g, '"');
        
        try {
          clips = JSON.parse(`[${clipsString}]`);
          console.log(`HTML parsing: Found ${clips.length} clips on first page`);
          
          // If we have fewer clips than total, try to get more via pagination
          if (totalSongs > clips.length && totalSongs > 20) {
            console.log(`Attempting to fetch remaining ${totalSongs - clips.length} songs via pagination...`);
            
            // First try API pagination approaches
            const additionalClips = await fetchAdditionalSongs(cleanUsername, userId, clips.length, totalSongs);
            if (additionalClips.length > 0) {
              clips = clips.concat(additionalClips);
              console.log(`Total clips after API pagination: ${clips.length}`);
            } else {
              console.log(`API pagination failed - trying browser automation...`);
              
              // If API methods failed, try browser automation with infinite scroll
              const browserClips = await fetchAllSongsWithBrowser(cleanUsername, totalSongs);
              if (browserClips.length > clips.length) {
                clips = browserClips;
                console.log(`Browser automation succeeded: ${clips.length}/${totalSongs} songs`);
              } else {
                console.log(`Browser automation also failed - only got ${clips.length}/${totalSongs} songs`);
              }
            }
          }
          
        } catch (parseError) {
          console.log("JSON parsing failed, trying alternative extraction...");
          
          // Count songs found but couldn't parse
          const songMatches = profileHtml.match(/\\"entity_type\\":\\"song_schema\\"/g);
          if (songMatches) {
            return res.status(501).json({
              error: `Username feature is experimental. Found ${songMatches.length} songs for @${cleanUsername} but couldn't extract them. Recommendation: Use one of @${cleanUsername}'s public playlists instead - playlist downloads work perfectly!`,
              suggestion: `Visit https://suno.com/@${cleanUsername} and copy a playlist URL instead`
            });
          }
        }
      } else {
        // No clips pattern found
        const songMatches = profileHtml.match(/\\"entity_type\\":\\"song_schema\\"/g);
        if (songMatches) {
          return res.status(501).json({
            error: `Username feature is experimental. Detected ${songMatches.length} songs for @${cleanUsername} but couldn't extract them due to complex profile structure. Recommendation: Use one of @${cleanUsername}'s public playlists instead!`,
            suggestion: `Visit https://suno.com/@${cleanUsername} and copy a playlist URL - playlist downloads work perfectly!`
          });
        } else {
          return res.status(404).json({
            error: `No songs found for @${cleanUsername}. The user may have private songs or no public songs.`
          });
        }
      }
      
    } catch (error) {
      console.error("Error extracting clips:", error);
      return res.status(500).json({ 
        error: `Failed to extract songs from @${cleanUsername} profile. Try using one of their public playlists instead.`,
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
    
    // Create playlist name with pagination info
    let playlistName = `@${cleanUsername}'s Songs (${transformedClips.length} songs)`;
    if (totalSongs > transformedClips.length) {
      playlistName = `@${cleanUsername}'s Songs (${transformedClips.length}/${totalSongs} songs - first page only)`;
    }
    
    // Return in the same format as playlist API
    res.json({
      playlist: {
        name: playlistName,
        image: '' // User profiles don't have playlist images
      },
      clips: transformedClips,
      metadata: {
        totalSongs: totalSongs,
        extractedSongs: transformedClips.length,
        note: totalSongs > transformedClips.length ? 
          "This is an experimental feature that only extracts the first page of songs. For complete access, use the user's playlists instead." : 
          undefined
      }
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