---
id: SEED-001
status: dormant
planted: 2026-05-12
planted_during: v2.1 UX & Discovery
trigger_when: any milestone that touches client/src/, public/, or requires a Replit deploy
scope: Small
---

# SEED-001: A better way to deploy to Replit

## Why This Matters

Current deploy flow is fragile and manual: run `npm run build`, copy `client/dist/` to `public/`, commit, push to GitHub, then manually `git pull` on Replit — which breaks if Replit has diverged. Today's session hit the divergent-branches problem (`fatal: Need to specify how to reconcile divergent branches`) — a regular friction point.

`deploy.sh` exists but ends with `git push`, making it unsafe to run from Claude (would push without review). The pre-push hook adds another gate that requires `public/` to be rebuilt and committed before push.

A better flow would: build → copy → commit → push → trigger Replit pull automatically, with divergence handled gracefully (Replit always resets to remote).

## When to Surface

**Trigger:** Any milestone that includes a client/src/ change or requires deploying to Replit.

Surface this seed when `/gsd-new-milestone` is run and the milestone scope touches:
- `client/src/` (requires rebuild + copy + push)
- `server.js` or backend routes (requires Replit restart)
- Any phase that ends with "push to Replit"

## Scope Estimate

**Small** — A few hours. Options to explore:
1. Replit deployment webhook or CLI (`replit deploy` if available)
2. GitHub Actions: on push to main, trigger a Replit re-pull via their API
3. Improve `deploy.sh` to handle divergent Replit branches safely (`git fetch && git reset --hard origin/main`) and make it safe for Claude to call (separate build-and-push from the deploy trigger)
4. Add a `Makefile` or `deploy-safe.sh` that Claude CAN run (no bare `git push`)

## Breadcrumbs

- `deploy.sh` — current deploy script (ends with `git push`, unsafe for Claude)
- `.replit` — `[deployment]` section uses `build.sh` + `node server.js`
- `.git/hooks/pre-push` — blocks push if `public/` not rebuilt; was the blocker today
- `build.sh` — Replit's build entry point (separate from `deploy.sh`)
- `public/` — Replit serves from here (not `client/dist/`)

## Notes

Today's session: pushed 34 commits, hit pre-push hook (public/ stale), rebuilt, then hit `git fetch` needed because remote tracking was stale. Then Replit had divergent local commits requiring manual reconciliation. All fixable friction — a 2-3 hour investment would eliminate this for every future milestone.
