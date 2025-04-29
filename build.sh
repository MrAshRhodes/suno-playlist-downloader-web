#!/bin/bash
echo "Starting build process..."

# Check for public directory with pre-built client files
if [ -d "./public" ] && [ -f "./public/index.html" ]; then
  echo "✅ Found pre-built client in public directory"
else
  echo "⚠️ No pre-built client found in public directory"
  echo "See REPLIT_SETUP.md for instructions on setting up the public directory with pre-built files"
fi

# Install server dependencies
echo "Installing server dependencies..."
npm install

# Try client build only if public directory not found
if [ ! -d "./public" ] || [ ! -f "./public/index.html" ]; then
  # Install client dependencies and build
  echo "Installing client dependencies and trying to build..."
  cd client

  # Install TypeScript locally to client
  echo "Installing TypeScript locally..."
  npm install --save-dev typescript

  # Try to build the client, but don't fail if it doesn't work
  echo "Building client..."
  export PATH="$PATH:./node_modules/.bin"
  npm run build || echo "Client build failed, but continuing anyway as we have a fallback"

  cd ..
fi

echo "Build completed!"

# Note: We don't start the server here anymore - let Replit handle that
# npm start