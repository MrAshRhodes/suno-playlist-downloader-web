import express from 'express';
import fetch from 'node-fetch';
import NodeID3 from 'node-id3';
import archiver from 'archiver';
import pLimit from 'p-limit';
import filenamify from 'filenamify';

const router = express.Router();

/**
 * @route POST /api/download/playlist
 * @description Download a complete playlist as a streaming ZIP file
 * @access Public
 */
router.post('/playlist', async (req, res) => {
  const { playlist, clips, embedImage, sessionId } = req.body;

  if (!playlist || !clips || !Array.isArray(clips) || clips.length === 0) {
    return res.status(400).json({ error: 'Invalid playlist data' });
  }

  req.setTimeout(900000);
  res.setTimeout(900000);

  const zipFilename = filenamify(`${playlist.name}.zip`);

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

  const archive = archiver('zip', { zlib: { level: 6 } });

  archive.on('error', (err) => {
    console.error('Archive error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Archive failed' });
    } else {
      res.destroy(err);
    }
  });

  const abortController = new AbortController();

  req.on('close', () => {
    if (!res.writableEnded) {
      console.log('Client disconnected, aborting archive and in-flight fetches');
      archive.abort();
      abortController.abort();
    }
  });

  // pipe BEFORE any append() calls
  archive.pipe(res);

  const limit = pLimit(8);
  let completedCount = 0;

  // archive.append is called INSIDE each limit() callback immediately after ID3 tagging.
  // No results array — each buffer is appended and GC'd as archiver writes it to the response.
  await Promise.all(
    clips.map(clip => limit(async () => {
      const fileName = filenamify(`${String(clip.no).padStart(2, '0')} - ${clip.title}.mp3`);

      try {
        const audioRes = await fetch(clip.audio_url, { signal: abortController.signal });
        if (!audioRes.ok) {
          console.error(`Failed to download clip ${clip.id}: ${audioRes.statusText}`);
          completedCount++;
          global.downloadTrackers?.[sessionId]?.sendProgress({
            progress: Math.round((completedCount / clips.length) * 100),
            completedItem: clip.id,
            error: true
          });
          return;
        }

        let audioBuffer = Buffer.from(await audioRes.arrayBuffer());

        if (embedImage === 'true') {
          const imgRes = await fetch(clip.image_url, { signal: abortController.signal });
          if (imgRes.ok) {
            const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
            const tags = {
              title: clip.title,
              trackNumber: String(clip.no),
              image: {
                mime: 'image/jpeg',
                type: { id: 3, name: 'front cover' },
                description: 'Cover Art',
                imageBuffer: imgBuffer
              }
            };
            // NodeID3.write returns Buffer | false — keep original if tagging fails
            const tagged = NodeID3.write(tags, audioBuffer);
            if (tagged) audioBuffer = tagged;
          }
        }

        // Append immediately — buffer GC'd after archiver flushes it to the response
        archive.append(audioBuffer, { name: fileName });

        completedCount++;
        global.downloadTrackers?.[sessionId]?.sendProgress({
          progress: Math.round((completedCount / clips.length) * 100),
          completedItem: clip.id
        });
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error(`Error processing clip ${clip.id}:`, err);
        completedCount++;
        global.downloadTrackers?.[sessionId]?.sendProgress({
          progress: Math.round((completedCount / clips.length) * 100),
          completedItem: clip.id,
          error: true
        });
      }
    }))
  );

  await archive.finalize();
});

/**
 * @route GET /api/download/progress/:sessionId
 * @description SSE endpoint for download progress updates
 * @access Public
 */
router.get('/progress/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendProgress = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  if (!global.downloadTrackers) {
    global.downloadTrackers = {};
  }

  global.downloadTrackers[sessionId] = {
    sendProgress,
    lastUpdate: Date.now()
  };

  sendProgress({ type: 'connected', message: 'Monitoring download progress' });

  req.on('close', () => {
    if (global.downloadTrackers && global.downloadTrackers[sessionId]) {
      delete global.downloadTrackers[sessionId];
    }
  });
});

export default router;
