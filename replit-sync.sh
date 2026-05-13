#!/bin/bash
# Recover a Replit instance that has diverged from origin/main.
# Run this ON the Replit instance — not on your local machine.
set -e

echo "WARNING: This will discard all local changes on the Replit instance."
echo "Any uncommitted edits will be lost."
read -r -p "Continue? [y/N] " confirm

case "$confirm" in
  y|yes)
    echo "Fetching latest from origin..."
    git fetch origin

    echo "Resetting to origin/main..."
    git reset --hard origin/main

    echo "Done. Replit is now in sync with origin/main."
    ;;
  *)
    echo "Aborted. No changes made."
    exit 0
    ;;
esac
