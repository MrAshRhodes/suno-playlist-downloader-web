---
created: 2026-04-14T09:45:19.733Z
title: Select individual songs from playlist before download
area: ui
files:
  - client/src/App.tsx
  - client/src/services/Suno.ts
---

## Problem

Currently the app downloads all songs from a playlist as a ZIP. Users may want to pick specific songs rather than downloading everything — especially for large playlists where they only want a few tracks.

## Solution

Add checkboxes or selection UI to the song table (Step 2: Review songs). Only selected songs get included in the ZIP download. Default to all selected. Requires changes to the download API call to pass selected song IDs.
