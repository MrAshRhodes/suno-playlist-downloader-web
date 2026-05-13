#!/bin/bash
# Build client and commit public/ to git — does NOT push.
# Use deploy.sh to build, commit, and push in one step.
set -e

echo "Building client..."
cd client && npm run build && cd ..

echo "Updating public/..."
rm -rf public/assets
cp -r client/dist/* public/

echo "Staging public/..."
git add public/

# Guard: skip commit if nothing staged (prevents empty commits)
if git diff --cached --quiet; then
  echo "No changes to commit — public/ is already up to date."
  exit 0
fi

echo "Committing..."
git commit -m "build: rebuild public/ for deployment"

echo "Done. Run ./deploy.sh to push, or pull on Replit with ./replit-sync.sh"
