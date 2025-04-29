#!/bin/bash
# Install server dependencies
npm install

# Install client dependencies and build
cd client && npm install && npm run build
cd ..

# Start the server
npm start