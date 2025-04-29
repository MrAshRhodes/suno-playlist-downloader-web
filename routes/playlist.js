import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

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

export default router;