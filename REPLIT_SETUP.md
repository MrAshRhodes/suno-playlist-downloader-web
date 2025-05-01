# Replit Setup Instructions

Follow these steps to set up the Suno Playlist Downloader on Replit:

## Setting Up Static Files

Since Replit has issues with building the client files using Vite, we use a pre-built version that's ready to deploy:

1. The repository already includes all necessary pre-built files in the `public` directory. This includes:
   - `public/index.html` - The main HTML file that loads the application
   - `public/assets/` - Directory containing all JavaScript, CSS, and image assets

2. The latest files are all included in the repository:
   - `icons8-playlist-96-DxPLIIk9.png` - Application icon
   - `index-a54f72f2.css` - Compiled CSS including dark mode support
   - `index-09e74b25.js` - Compiled JavaScript with all application features

The HTML structure follows the standard Vite-built React application format:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/png" href="/assets/icons8-playlist-96-DxPLIIk9.png" />
    <title>Suno Playlist Downloader</title>
    <meta name="description" content="Download your Suno playlists - Web Version" />
    <script type="module" crossorigin src="/assets/index-09e74b25.js"></script>
    <link rel="stylesheet" href="/assets/index-a54f72f2.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

## Running the Application

1. Make sure you have the correct Replit configuration:
   - `.replit` - Contains:
     - The run command `chmod +x build.sh && ./build.sh && NODE_ENV=production npm start`
     - `modules = ["nodejs-20"]` to specify Node.js version 20
     - Port mapping configuration for proper external access

2. Click the "Run" button in Replit.

3. The server will automatically:
   - Find and serve the pre-built client files from the `public` directory 
   - Start the Express server with proper production settings
   - Enable dark mode support based on user preferences

## Troubleshooting

If you encounter issues:

1. Check that all the asset files exist in the `public/assets` directory
2. Ensure the server is running with `NODE_ENV=production`
3. Look at the server logs to see where it's trying to find the client files
4. Make sure your Replit is using Node.js 20 as specified in the `.replit` file's modules section
5. Verify port mappings are correctly set up in the `.replit` file

### Dark Mode Support

The application now has comprehensive dark mode support:
1. The app automatically detects your system theme preference
2. You can manually toggle between light/dark mode with the moon/sun button in the header
3. All UI elements have been optimized for both light and dark modes
4. Text contrast has been improved for better readability in both themes
5. Proper CSS variables and conditional styling ensure consistent appearance

### API-Only Mode (Fallback)

If the client files fail to load for any reason, the application will fall back to API-only mode, which provides basic functionality through API endpoints.

## Manual API Testing

Even if the UI isn't working properly, you can test the application's API endpoints:

1. `POST /api/playlist/fetch` - Supply a playlist URL in the request body to fetch a playlist info
2. `GET /api/download/playlist` - Download a full playlist as a ZIP file

Note: Individual song downloads have been removed in favor of the more reliable ZIP download functionality.