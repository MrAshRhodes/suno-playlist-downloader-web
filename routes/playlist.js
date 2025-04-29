import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

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