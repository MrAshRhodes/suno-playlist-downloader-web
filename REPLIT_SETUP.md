# Replit Setup Instructions

Follow these steps to set up the Suno Playlist Downloader on Replit:

## Setting Up Static Files

Since Replit has issues with building the client files using Vite, we'll use a pre-built version:

1. Create a `public` directory in the root of your Replit project:

```bash
mkdir -p public/assets
```

2. Copy the pre-built client files into the public directory:

For `public/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/png" href="/assets/icons8-playlist-96-DxPLIIk9.png" />
    <title>Suno Playlist Downloader</title>
    <meta name="description" content="Download your Suno playlists - Web Version" />
    <script type="module" crossorigin src="/assets/index-DcIVk8gE.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-C0B9bic8.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

3. Download the following files from the repository's Releases section and place them in your `public/assets` directory:
   - `icons8-playlist-96-DxPLIIk9.png`
   - `index-C0B9bic8.css`
   - `index-DcIVk8gE.js`

   These files are available as attachments in the GitHub repository's latest release.

## Running the Application

1. Make sure you have the correct Replit configuration:
   - `.replit` - Contains the run command `npm install && NODE_ENV=production npm start`
   - `replit.nix` - Specifies nodejs-16_x

2. Click the "Run" button in Replit.

3. The server should now detect the static files in the `public` directory and serve them properly.

## Troubleshooting

If you encounter issues:

1. Check that all the asset files exist in the `public/assets` directory
2. Ensure the server is running with `NODE_ENV=production`
3. Look at the server logs to see where it's trying to find the client files
4. If all else fails, the application will still run in API-only mode, which provides basic functionality

## Manual API Testing

Even in API-only mode, you can test the application's API endpoints:

1. `POST /api/playlist/fetch` - Supply a playlist URL in the request body to fetch a playlist
2. `GET /api/download/track/:id` - Download a specific track by its ID