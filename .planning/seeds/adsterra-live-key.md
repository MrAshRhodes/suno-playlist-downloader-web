---
seed: adsterra-live-key
trigger: "if ad revenue drops or Adsterra unit needs rotation"
priority: low
planted: 2026-05-02
updated: 2026-05-02
---

# Seed: Adsterra Key Status

`VITE_ADSTERRA_UNIT_KEY` is set in Replit environment — ads are LIVE on production.
Not set locally (by design — local dev runs with empty key, AdSlot no-ops gracefully).

**If key needs updating:** Change in Replit dashboard → redeploy.
**Component:** `client/src/components/AdSlot.tsx`
