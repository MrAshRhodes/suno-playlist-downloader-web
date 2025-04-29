# Suno Playlist Downloader

A modern web application to download and manage music from your Suno playlists.

## Overview

Suno Playlist Downloader is an elegant, Apple-inspired web application that allows you to easily download songs from your Suno playlists. It can be hosted on platforms like Replit or run locally.

### Features

- Modern, responsive UI with both light and dark mode support
- Fetch playlist data from Suno using the playlist URL
- View all songs in a playlist with details (title, duration, model version)
- Download songs individually or as a complete ZIP archive
- Embed album artwork into MP3 files using ID3 tags
- Customize file naming formats
- Track download progress in real-time

## Running Locally

```bash
# Install server dependencies
cd web-version
npm install

# Install client dependencies
cd client
npm install
cd ..

# Run both server and client
npm run dev-full
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Running Server and Client Separately

If you prefer to run them separately:
- `npm run dev` - Start only the backend server
- `npm run client` - Start only the frontend

## Deployment to Replit

1. Create a new Node.js Replit
2. Import the code
3. Run `npm install` in the project root
4. Add the following to `.replit` file:
   ```
   run = "npm start"
   ```
5. Click "Run"

## How It Works

1. **Playlist Fetching**: The app fetches playlist data from Suno's API using the playlist URL
2. **Server Processing**: The server downloads and processes files on the backend
3. **Download Delivery**: Processed files are served to the browser for download
4. **Settings Management**: User preferences are stored in browser localStorage and synced with server session

## Development

### Tech Stack

- **Frontend**: React, TypeScript, Mantine UI components
- **Backend**: Node.js, Express, node-id3 for metadata
- **Build Tools**: Vite, PostCSS
- **Design**: Apple-inspired UI with CSS variables for theming
- **Features**: Dark/light mode toggle, responsive layout

### Project Structure

```
/web-version      # Web app (Express + React)
  /client         # React frontend
    /src          # Source code
      /components # UI components
      /services   # API and utility services
  /routes         # Express API routes
  /utils          # Backend utilities
  server.js       # Main Express server
```

## Environment Configuration

Create a `.env` file in the web-version directory using the `.env.example` as a template:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Security
SESSION_SECRET=your-session-secret-change-this-in-production

# Temp File Settings
CLEANUP_INTERVAL=3600000  # 1 hour in milliseconds
MAX_FILE_AGE=86400000     # 24 hours in milliseconds

# Logging
LOG_LEVEL=info
```

## License

This project is licensed under the MIT License.

## Key Features

### Modern Design System
- Clean, minimalist Apple-inspired interface
- Consistent color palette and typography
- Smooth animations and transitions
- Responsive layout adapting to different screen sizes

### Theme Support
- Light and dark mode with seamless transitions
- System preference detection
- User preference saving
- Theme-aware UI elements

### Downloading Options
- Individual file downloads for selected tracks
- Complete playlist ZIP archive download
- Album artwork embedding in ID3 tags
- Custom file naming templates

## Screenshots

(Screenshots will be added after initial deployment)

## Acknowledgments

- Suno for their music generation platform
- Support the developer: [Buy Me A Coffee](https://buymeacoffee.com/focusedlofibeats)