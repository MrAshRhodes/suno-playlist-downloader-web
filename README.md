# Suno Playlist Downloader - Web Version

A web-based application for downloading playlists from Suno. This is a conversion of the original Tauri desktop application to a web app that can be hosted on Replit.

## Live Demo

Try the live hosted version: [https://suno-playlist-downloader.replit.app/](https://suno-playlist-downloader.replit.app/)

## Support the Project

If you find this tool useful, please consider supporting:

### Original Developer - [DrummerSi](https://github.com/DrummerSi/suno-downloader)

DrummerSi

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/drummer_si)

### Web Version Server Costs

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/focused)

## Features

- Search for Suno playlists by URL
- View all songs in a playlist
- Download entire playlists as ZIP files
- Embed album artwork into MP3 files
- Configure naming templates for downloaded files
- Track download progress
- Enhanced dark mode support with intuitive theme switching
- Responsive design for all device sizes
- Replit deployment ready

## Tech Stack

### Backend
- Express.js server
- Node.js for file processing
- node-id3 for MP3 metadata handling
- Server-Sent Events (SSE) for real-time progress tracking

### Frontend
- React with TypeScript
- Mantine UI components
- Vite for building
- CSS variables for theme management

## Setup and Running

### Prerequisites
- Node.js 20+ (recommended for local development)
- Node.js 20 supported on Replit deployment
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

The application is configured to work with Replit's Node.js 20.x environment, which is specified in the `.replit` file's modules section. The application leverages Replit's built-in support for serving static files from the `/public` directory and proper port mapping from 3000 to 80 for external access. The dark mode support has been fully tested and optimized for the Replit environment.

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
│   │   ├── components/      # UI components with comprehensive dark mode support
│   │   ├── hooks/           # Custom React hooks including useDarkMode
│   │   ├── icons/           # Application icons and images
│   │   └── services/        # API and utility services
│   └── dist/                # Built frontend files (generated during build)
├── public/                  # Pre-built static files for Replit deployment
│   └── assets/              # CSS, JS, and image assets (ready to deploy)
├── routes/                  # Express route handlers
│   ├── playlist.js          # Playlist API endpoints
│   ├── download.js          # Download API endpoints (ZIP downloads only)
│   └── settings.js          # Settings API endpoints
├── utils/                   # Backend utility functions
├── server.js                # Express server with multi-environment support
├── build.sh                 # Build script for development and deployment
├── REPLIT_SETUP.md          # Instructions for Replit setup
├── .replit                  # Replit configuration for Node.js 20
├── replit.nix               # Nix environment configuration for Replit
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

- Original Tauri app by [DrummerSi](https://github.com/DrummerSi/suno-downloader) - Please consider [supporting him on Ko-fi](https://ko-fi.com/drummer_si)
- This web version is a conversion of the original desktop application to a web-based version
- Suno for their music generation platform