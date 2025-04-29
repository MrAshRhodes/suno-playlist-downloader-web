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
  path.join(__dirname, 'client/dist'),                 // Default path
  path.join(__dirname, '../client/dist'),              // One level up
  '/home/runner/suno-playlist-downloader-web/client/dist',  // Replit path
  '/home/runner/client/dist',                         // Replit alternative
  path.join(__dirname, '../client/dist'),             // Another alternative
  path.join(__dirname, 'dist'),                       // Directly in root
  path.join(process.cwd(), 'client/dist')             // Using current working directory
];

// Log environment for debugging
console.log('Current directory:', __dirname);
console.log('Current working directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);

// Determine which path exists and use it
let distPath = null;
try {
  if (process.env.NODE_ENV === 'production') {
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
        // We already imported execSync at the top
        execSync('npm run client-build', { stdio: 'inherit' });
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
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      // Fallback to API-only mode if client can't be found
      console.log('Running in API-only mode (client not found)');
      app.get('/', (req, res) => {
        res.status(200).send('API running. Client not found - please build the client with npm run client-build');
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