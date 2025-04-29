# Suno Playlist Downloader - Web Version

A web-based application for downloading playlists from Suno. This is a conversion of the original Tauri desktop application to a web app that can be hosted on Replit.

## Features

- Search for Suno playlists by URL
- View all songs in a playlist
- Download individual songs or entire playlists as ZIP files
- Embed album artwork into MP3 files
- Configure naming templates for downloaded files
- Track download progress

## Tech Stack

### Backend
- Express.js server
- Node.js for file processing
- node-id3 for MP3 metadata handling

### Frontend
- React with TypeScript
- Mantine UI components
- Vite for building

## Setup and Running

### Prerequisites
- Node.js 16+ (Node.js 16.x required for Replit)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/MrAshRhodes/suno-playlist-downloader-web.git
cd suno-playlist-downloader-web
```

2. Install server dependencies
```
npm install
```

3. Install client dependencies
```
cd client
npm install
cd ..
```

### Running in Development Mode

Start the backend server:
```
npm run dev
```

In a separate terminal, start the frontend:
```
npm run client
```

Or run both simultaneously:
```
npm run dev-full
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Building for Production

1. Build the client
```
npm run client-build
```

2. Start the production server
```
npm start
```

## Deployment to Replit

### Automated Deployment

1. Create a new Replit project
2. Choose "Import from GitHub" and enter: `https://github.com/MrAshRhodes/suno-playlist-downloader-web.git`
3. Click "Run" - the application will automatically:
   - Install dependencies
   - Use pre-built static files from the `/public` directory
   - Start the server on the Replit URL

### Manual Setup (if needed)

If the pre-built static files aren't working for any reason, see the [REPLIT_SETUP.md](REPLIT_SETUP.md) file for detailed instructions on setting up the public directory manually.

### Replit Environment

The application is configured to work with Replit's Node.js 16.x environment, which is specified in the `replit.nix` file. The `.replit` file contains the necessary configuration for building and running the application in the Replit environment.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-session-secret
```

## Project Structure

```
/
├── client/                  # React frontend
│   ├── public/              # Static assets for development
│   ├── src/                 # React source code
│   │   ├── components/      # UI components
│   │   └── services/        # API and utility services
│   └── dist/                # Built frontend files (not in repo)
├── public/                  # Pre-built static files for Replit
│   └── assets/              # CSS, JS, and image assets
├── routes/                  # Express route handlers
├── utils/                   # Backend utility functions
├── server.js                # Express server setup
├── build.sh                 # Build script for deployment
├── REPLIT_SETUP.md          # Instructions for Replit setup
└── package.json             # Project dependencies
```

## Converting from Tauri

This web version replaces the Tauri/Rust functionality with a Node.js backend:

1. Rust commands are replaced with Express API endpoints
2. File system operations are handled on the server
3. MP3 metadata handling uses node-id3 instead of Rust libraries
4. Files are served for download rather than written to disk directly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original Tauri app by DrummerSi
- Suno for their music generation platform