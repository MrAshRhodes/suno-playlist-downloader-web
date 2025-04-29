import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

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
// Check both possible dist locations
const clientDistPath = path.join(__dirname, 'client/dist');
const altClientDistPath = path.join(__dirname, '../client/dist');

// Determine which path exists and use it
let distPath = clientDistPath;
try {
  if (process.env.NODE_ENV === 'production') {
    // Try the default path first
    const defaultPathExists = fs.existsSync(path.join(clientDistPath, 'index.html'));
    
    // If default path doesn't exist, try the alternative path
    if (!defaultPathExists) {
      const altPathExists = fs.existsSync(path.join(altClientDistPath, 'index.html'));
      if (altPathExists) {
        distPath = altClientDistPath;
        console.log('Using alternative client dist path:', distPath);
      } else {
        console.error('Could not find client dist folder. Tried:', clientDistPath, altClientDistPath);
      }
    } else {
      console.log('Using default client dist path:', distPath);
    }
    
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
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