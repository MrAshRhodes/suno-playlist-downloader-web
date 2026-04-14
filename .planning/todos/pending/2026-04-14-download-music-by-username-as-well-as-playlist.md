---
created: 2026-04-14T09:04:28.516Z
title: Download music by username as well as playlist
area: api
files:
  - routes/playlist.js
  - client/src/services/Suno.ts
---

## Problem

Currently the app supports downloading from Suno playlist URLs. Users should also be able to download music by entering a Suno username/profile URL (e.g., `@username`), fetching all their public tracks. The backend already has Puppeteer-based profile scraping (`/api/playlist/@{username}/all`) but the UX and discovery of this feature may need improvement to increase traffic and donations.

## Solution

TBD — investigate current username support in `Suno.ts` URL validation and the Puppeteer scraping route. May need better UI guidance showing both input formats are accepted, or a separate input mode for username vs playlist.
