#!/bin/bash
# Build client, commit public/, and push to GitHub for Replit deployment.
# Delegates build+commit to deploy-safe.sh, then pushes only if commits are unpushed.
set -e

# Step 1: Build and commit (no push)
./deploy-safe.sh

# Step 2: Push guard — only push if there are commits ahead of origin/main
echo "Checking for unpushed commits..."
UNPUSHED=$(git log origin/main..HEAD --oneline)

if [ -z "$UNPUSHED" ]; then
  echo "Nothing to push — already up to date with origin/main."
  exit 0
fi

echo "Pushing to origin/main..."
git push

echo "Done. Pull on Replit: ./replit-sync.sh"
