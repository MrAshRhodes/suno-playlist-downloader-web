#!/bin/bash
# Build client and push to GitHub for Replit deployment
set -e

echo "Building client..."
cd client && npm run build && cd ..

echo "Updating public/..."
rm -rf public/assets
cp -r client/dist/* public/

echo "Committing..."
git add public/
git commit -m "build: rebuild public/ for deployment" || echo "No changes to commit"

echo "Pushing..."
git push

echo "Done. Pull on Replit: git reset --hard origin/main"
