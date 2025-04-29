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
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```
git clone <repository-url>
cd suno-playlist-downloader/web-version
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

1. Create a new Replit project
2. Import the code from this repository
3. Install dependencies with `npm install`
4. Start the server with `npm start`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-session-secret
```

## Project Structure

```
web-version/
├── client/                  # React frontend
│   ├── public/              # Static assets
│   └── src/                 # React source code
│       ├── components/      # UI components
│       └── services/        # API and utility services
├── routes/                  # Express route handlers
├── utils/                   # Backend utility functions
├── server.js                # Express server setup
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