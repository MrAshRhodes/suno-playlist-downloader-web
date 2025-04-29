import express from 'express';
import fetch from 'node-fetch';
import NodeID3 from 'node-id3';
import AdmZip from 'adm-zip';
import filenamify from 'filenamify';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createTempDirectory, cleanupTempDirectory } from '../utils/fileManager.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, '../temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * @route GET /api/download/song
 * @description Download a single song with optional image embedding
 * @access Public
 */
router.get('/song', async (req, res) => {
  try {
    const { audioUrl, imageUrl, title, trackNumber, embedImage } = req.query;
    
    if (!audioUrl || !title) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Create a temporary session directory
    const sessionDir = await createTempDirectory();
    const fileName = filenamify(`${trackNumber ? `${String(trackNumber).padStart(2, '0')} - ` : ''}${title}.mp3`);
    const filePath = path.join(sessionDir, fileName);
    
    // Download the audio file
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.statusText}`);
    }
    
    const audioBuffer = await audioResponse.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(audioBuffer));
    
    // If image embedding is requested
    if (embedImage === 'true' && imageUrl) {
      const imagePath = path.join(sessionDir, `cover.jpg`);
      const imageResponse = await fetch(imageUrl);
      
      if (imageResponse.ok) {
        const imageBuffer = await imageResponse.arrayBuffer();
        fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
        
        // Embed the image into the MP3
        const tags = {
          title: title,
          trackNumber: trackNumber ? String(trackNumber) : undefined,
          image: {
            mime: 'image/jpeg',
            type: { id: 3, name: 'front cover' },
            description: 'Cover Art',
            imageBuffer: fs.readFileSync(imagePath)
          }
        };
        
        NodeID3.write(tags, filePath);
      }
    }
    
    // Send the file for download
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      
      // Clean up temp files after download
      setTimeout(() => {
        cleanupTempDirectory(sessionDir);
      }, 5000);
    });
  } catch (error) {
    console.error('Song download error:', error);
    res.status(500).json({ error: 'Failed to download song' });
  }
});

/**
 * @route POST /api/download/playlist
 * @description Download a complete playlist as a ZIP file
 * @access Public
 */
router.post('/playlist', async (req, res) => {
  const { playlist, clips, embedImage } = req.body;
  
  if (!playlist || !clips || !Array.isArray(clips) || clips.length === 0) {
    return res.status(400).json({ error: 'Invalid playlist data' });
  }
  
  try {
    // Create session directory
    const sessionDir = await createTempDirectory();
    const zipFile = new AdmZip();
    const downloadPromises = [];
    
    // Process each song
    for (const clip of clips) {
      downloadPromises.push(
        (async () => {
          try {
            // Download MP3
            const fileName = filenamify(`${String(clip.no).padStart(2, '0')} - ${clip.title}.mp3`);
            const filePath = path.join(sessionDir, fileName);
            
            const audioResponse = await fetch(clip.audio_url);
            if (!audioResponse.ok) {
              console.error(`Failed to download clip ${clip.id}: ${audioResponse.statusText}`);
              return null;
            }
            
            const audioBuffer = await audioResponse.arrayBuffer();
            fs.writeFileSync(filePath, Buffer.from(audioBuffer));
            
            // If image embedding is requested
            if (embedImage === 'true') {
              const imagePath = path.join(sessionDir, `${clip.id}-cover.jpg`);
              const imageResponse = await fetch(clip.image_url);
              
              if (imageResponse.ok) {
                const imageBuffer = await imageResponse.arrayBuffer();
                fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
                
                // Embed the image into the MP3
                const tags = {
                  title: clip.title,
                  trackNumber: String(clip.no),
                  image: {
                    mime: 'image/jpeg',
                    type: { id: 3, name: 'front cover' },
                    description: 'Cover Art',
                    imageBuffer: fs.readFileSync(imagePath)
                  }
                };
                
                NodeID3.write(tags, filePath);
              }
            }
            
            return { filePath, fileName };
          } catch (error) {
            console.error(`Error processing clip ${clip.id}:`, error);
            return null;
          }
        })()
      );
    }
    
    // Wait for all downloads to complete
    const results = await Promise.all(downloadPromises);
    
    // Add successfully downloaded files to the ZIP
    for (const result of results) {
      if (result) {
        zipFile.addLocalFile(result.filePath, '', result.fileName);
      }
    }
    
    // Write the ZIP file
    const zipPath = path.join(sessionDir, filenamify(`${playlist.name}.zip`));
    zipFile.writeZip(zipPath);
    
    // Send the ZIP file for download
    res.download(zipPath, `${filenamify(playlist.name)}.zip`, (err) => {
      if (err) {
        console.error('ZIP download error:', err);
      }
      
      // Clean up temp files after download
      setTimeout(() => {
        cleanupTempDirectory(sessionDir);
      }, 10000);
    });
  } catch (error) {
    console.error('Playlist download error:', error);
    res.status(500).json({ error: 'Failed to download playlist' });
  }
});

/**
 * @route GET /api/download/progress/:sessionId
 * @description SSE endpoint for download progress updates
 * @access Public
 */
router.get('/progress/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Function to send progress updates
  const sendProgress = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  // Add this client to global progress trackers
  if (!global.downloadTrackers) {
    global.downloadTrackers = {};
  }
  
  global.downloadTrackers[sessionId] = {
    sendProgress,
    lastUpdate: Date.now()
  };
  
  // Send initial confirmation
  sendProgress({ type: 'connected', message: 'Monitoring download progress' });
  
  // Handle client disconnect
  req.on('close', () => {
    if (global.downloadTrackers && global.downloadTrackers[sessionId]) {
      delete global.downloadTrackers[sessionId];
    }
  });
});

export default router;