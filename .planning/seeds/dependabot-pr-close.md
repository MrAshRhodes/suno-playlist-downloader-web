---
seed: dependabot-pr-close
trigger: "next session start — verify Dependabot PR #2 auto-closed after v2.0 push"
priority: medium
planted: 2026-05-02
---

# Seed: Verify Dependabot PR #2 Auto-Closed

After pushing v2.0 fixes, Dependabot should auto-close PR #2 (basic-ftp, multer, qs, on-headers, vite, uuid).

**Check:** https://github.com/MrAshRhodes/suno-playlist-downloader-web/pull/2

If still open: gh auth login then `gh pr view 2 --repo MrAshRhodes/suno-playlist-downloader-web`
