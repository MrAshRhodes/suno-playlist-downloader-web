#!/bin/bash
echo "Starting build process..."

# Install global dependencies
echo "Installing global dependencies..."
npm install -g typescript

# Install server dependencies
echo "Installing server dependencies..."
npm install

# Install client dependencies and build
echo "Installing client dependencies and building..."
cd client

# Install TypeScript locally to client
echo "Installing TypeScript locally..."
npm install --save-dev typescript

# Try to build the client
echo "Building client..."
export PATH="$PATH:./node_modules/.bin"
npm run build || npx vite build

cd ..

echo "Build completed!"

# Note: We don't start the server here anymore - let Replit handle that
# npm start