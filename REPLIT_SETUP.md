# Replit Setup Instructions

Follow these steps to set up the Suno Playlist Downloader on Replit:

## Setting Up Static Files

Since Replit has issues with building the client files using Vite, we'll use a pre-built version:

1. Create a `public` directory in the root of your Replit project:

```bash
mkdir -p public/assets
```

2. Copy the pre-built client files into the public directory:

The `public/index.html` file is already provided in the repository and will be automatically pulled when you clone it. It references the correct asset files.

The HTML structure is a standard Vite-built React application:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/png" href="/assets/icons8-playlist-96-DxPLIIk9.png" />
    <title>Suno Playlist Downloader</title>
    <meta name="description" content="Download your Suno playlists - Web Version" />
    <script type="module" crossorigin src="/assets/index-[hash].js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-[hash].css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

Note that the actual filenames will contain unique hashes that are updated with each build.

3. The latest files are already included in the repository's `public` directory:
   - `icons8-playlist-96-DxPLIIk9.png`
   - `index-C0B9bic8.css`
   - Latest JS file (currently `index-Bb-rIR6f.js`)

   These files should be automatically pulled when you clone the repository. The index.html file references the correct asset files.

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
4. Make sure your Replit is using Node.js 16.x as specified in the replit.nix file
5. If you're experiencing dark mode issues, ensure the latest client build is being used

### Dark Mode Issues

If you encounter any dark mode text readability issues:
1. Check that you're using the latest version from the repository
2. Verify that the `public/index.html` file references the most recent JS file
3. The application should automatically detect your system's theme preference

### API-Only Mode

If all else fails, the application will still run in API-only mode, which provides basic functionality.

## Manual API Testing

Even in API-only mode, you can test the application's API endpoints:

1. `POST /api/playlist/fetch` - Supply a playlist URL in the request body to fetch a playlist
2. `GET /api/download/track/:id` - Download a specific track by its ID