---
seed: adsterra-live-key
trigger: "when Adsterra publisher account approved and unit key received"
priority: high
planted: 2026-05-02
---

# Seed: Wire Adsterra Live Publisher Key

AdSlot component is already built and wired. Just needs `VITE_ADSTERRA_UNIT_KEY` set.

**How to activate:**
1. Get unit key from Adsterra dashboard
2. Set in Replit: `VITE_ADSTERRA_UNIT_KEY=<key>`
3. Rebuild public/ and redeploy
4. Verify banner renders in prod

**Component:** `client/src/components/AdSlot.tsx`
