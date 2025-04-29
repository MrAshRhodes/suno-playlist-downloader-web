#!/bin/bash
echo "Starting build process..."

# Install server dependencies
echo "Installing server dependencies..."
npm install

# Install client dependencies and build
echo "Installing client dependencies and building..."
cd client && npm install && npm run build
cd ..

echo "Build completed!"

# Note: We don't start the server here anymore - let Replit handle that
# npm start