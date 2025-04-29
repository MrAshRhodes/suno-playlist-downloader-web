import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Import routes
import playlistRoutes from './routes/playlist.js';
import downloadRoutes from './routes/download.js';
import settingsRoutes from './routes/settings.js';

// Configuration
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Initialize express app
const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'suno-playlist-downloader-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// API Routes
app.use('/api/playlist', playlistRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/settings', settingsRoutes);

// Serve static assets if in production
// Check multiple possible dist locations for Replit environment
const possiblePaths = [
  path.join(__dirname, 'client/dist'),                // Default path
  path.join(__dirname, '../client/dist'),             // One level up
  '/home/runner/suno-playlist-downloader-web/client/dist',  // Replit path with repo name
  '/home/runner/client/dist',                         // Replit alternative
  path.resolve(process.cwd(), 'client/dist'),         // Absolute path from current directory
  path.join(__dirname, 'dist'),                       // Directly in root
  process.cwd(),                                      // Current working directory root (for debugging)
  '/home/runner',                                     // Replit root
  '/home/runner/suno-playlist-downloader-web',        // Replit project root
  path.join(__dirname, '../dist'),                    // One level up, dist folder
  '/home/runner/app/client/dist',                     // Alternative Replit path
  path.join(process.cwd(), '../client/dist'),         // One level up from cwd
  // Additional Replit paths
  '/home/runner/suno-playlist-downloader/client/dist',
  '/home/runner/dist',
  '/home/runner/app/dist'
];

// Log environment for debugging
console.log('Current directory:', __dirname);
console.log('Current working directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);

// Log all possible paths for debugging
console.log('Checking the following paths for client files:');
possiblePaths.forEach((p, i) => {
  console.log(`[${i}] ${p} (exists: ${fs.existsSync(p)})`);
  if (fs.existsSync(p)) {
    try {
      console.log(`  - Contents: ${fs.readdirSync(p).join(', ')}`);
      
      // Check for index.html specifically
      const indexPath = path.join(p, 'index.html');
      console.log(`  - index.html exists: ${fs.existsSync(indexPath)}`);
    } catch (e) {
      console.log(`  - Error reading directory: ${e.message}`);
    }
  }
});

// Determine which path exists and use it
let distPath = null;
try {
  // Always try to serve static files, regardless of environment
  {
    // Try all possible paths
    for (const testPath of possiblePaths) {
      console.log('Checking path:', testPath);
      if (fs.existsSync(path.join(testPath, 'index.html'))) {
        distPath = testPath;
        console.log('✅ Found client dist path:', distPath);
        break;
      }
    }
    
    if (!distPath) {
      console.error('❌ Could not find client dist folder. Tried:', possiblePaths.join(', '));
      
      // Build the client if it doesn't exist
      console.log('Attempting to build client...');
      try {
        // First, check if build.sh exists and try to run it
        const buildScript = path.join(__dirname, 'build.sh');
        if (fs.existsSync(buildScript)) {
          console.log('Running build.sh script...');
          execSync(`chmod +x ${buildScript} && ${buildScript}`, { stdio: 'inherit' });
        } else {
          // Fallback to npm script
          console.log('build.sh not found, using npm client-build...');
          execSync('npm run client-build', { stdio: 'inherit' });
        }
        
        console.log('Build completed, checking for dist folder again...');
        
        // Check again after build
        for (const testPath of possiblePaths) {
          if (fs.existsSync(path.join(testPath, 'index.html'))) {
            distPath = testPath;
            console.log('✅ Found client dist path after build:', distPath);
            break;
          }
        }
      } catch (buildError) {
        console.error('Error building client:', buildError);
      }
    }
    
    if (distPath) {
      console.log('🌟 Setting up static file serving from:', distPath);
      
      // Check if we're serving a directory or directly the index.html file
      const staticPath = fs.statSync(distPath).isDirectory() ? distPath : path.dirname(distPath);
      app.use(express.static(staticPath));
      
      // For all other routes, serve the index.html
      app.get('*', (req, res) => {
        const indexFile = fs.statSync(distPath).isDirectory() 
          ? path.join(distPath, 'index.html')
          : distPath;
          
        console.log('🌐 Serving index file from:', indexFile);
        if (fs.existsSync(indexFile)) {
          res.sendFile(indexFile);
        } else {
          res.status(404).send('Index file not found at ' + indexFile);
        }
      });
    } else {
      // List all files in current directory for debugging
      console.log('📂 Files in current directory:');
      try {
        const files = fs.readdirSync(process.cwd());
        console.log(files);
        
        // Also check client directory if it exists
        const clientDir = path.join(process.cwd(), 'client');
        if (fs.existsSync(clientDir)) {
          console.log('📂 Files in client directory:');
          console.log(fs.readdirSync(clientDir));
        }
      } catch (err) {
        console.error('Error listing files:', err);
      }
      
      // Fallback to simplified client mode if built client can't be found
      console.log('⚠️ Running in simplified client mode (built client not found)');
      app.get('/', (req, res) => {
        res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Suno Playlist Downloader - Simple Mode</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                line-height: 1.5;
              }
              h1 { color: #1a73e8; }
              button, input[type="submit"] {
                background-color: #1a73e8;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
              }
              input[type="text"] {
                padding: 10px;
                font-size: 16px;
                border: 1px solid #ccc;
                border-radius: 4px;
                width: 100%;
                margin: 8px 0 20px 0;
              }
              .section {
                background-color: #f7f8fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
              }
              pre {
                background-color: #f1f1f1;
                padding: 10px;
                border-radius: 4px;
                overflow: auto;
              }
              .result {
                margin-top: 20px;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                display: none;
              }
              #status { margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>Suno Playlist Downloader</h1>
            <p>Simple web interface for downloading Suno playlists</p>
            
            <div class="section">
              <h2>Paste Playlist URL</h2>
              <form id="playlistForm">
                <label for="playlistUrl">Suno Playlist URL:</label>
                <input type="text" id="playlistUrl" name="playlistUrl" placeholder="https://suno.com/playlists/..." required>
                <button type="submit">Fetch Playlist</button>
              </form>
              <div id="status"></div>
              <div id="result" class="result"></div>
            </div>

            <div class="section">
              <h2>Server Info</h2>
              <pre>
Current directory: ${__dirname}
Working directory: ${process.cwd()}
NODE_ENV: ${process.env.NODE_ENV}
              </pre>
            </div>

            <script>
              document.getElementById('playlistForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const status = document.getElementById('status');
                const result = document.getElementById('result');
                const playlistUrl = document.getElementById('playlistUrl').value;
                
                status.textContent = "Fetching playlist...";
                
                try {
                  const response = await fetch('/api/playlist/fetch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: playlistUrl })
                  });
                  
                  const data = await response.json();
                  
                  if (response.ok) {
                    status.textContent = "Playlist fetched successfully!";
                    result.style.display = 'block';
                    
                    const tracks = data.tracks || [];
                    const html = \`
                      <h3>Playlist: \${data.title || 'Unknown'}</h3>
                      <p>Total tracks: \${tracks.length}</p>
                      <button id="downloadAll">Download All Tracks</button>
                      <ul>\${tracks.map(track => \`
                        <li>
                          <strong>\${track.title || 'Unknown'}</strong> 
                          <button class="downloadBtn" data-id="\${track.id}">Download</button>
                        </li>\`).join('')}
                      </ul>
                    \`;
                    
                    result.innerHTML = html;
                    
                    // Add event listeners for download buttons
                    document.querySelectorAll('.downloadBtn').forEach(btn => {
                      btn.addEventListener('click', () => downloadTrack(btn.dataset.id));
                    });
                    
                    document.getElementById('downloadAll').addEventListener('click', () => {
                      tracks.forEach(track => downloadTrack(track.id));
                    });
                  } else {
                    status.textContent = \`Error: \${data.message || 'Failed to fetch playlist'}\`;
                  }
                } catch (error) {
                  status.textContent = \`Error: \${error.message}\`;
                  console.error(error);
                }
              });
              
              async function downloadTrack(trackId) {
                const status = document.getElementById('status');
                status.textContent = \`Downloading track ID: \${trackId}...\`;
                
                try {
                  const response = await fetch(\`/api/download/track/\${trackId}\`);
                  
                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = \`track-\${trackId}.mp3\`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    status.textContent = \`Track \${trackId} downloaded successfully!\`;
                  } else {
                    const error = await response.json();
                    status.textContent = \`Error downloading track: \${error.message || 'Unknown error'}\`;
                  }
                } catch (error) {
                  status.textContent = \`Error: \${error.message}\`;
                  console.error(error);
                }
              }
            </script>
          </body>
        </html>
        `);
      });
    }
  }
} catch (error) {
  console.error('Error setting up static file serving:', error);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;