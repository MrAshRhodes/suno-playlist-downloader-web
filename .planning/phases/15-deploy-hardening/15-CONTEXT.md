# Phase 15: Deploy Hardening - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Scripts only — no client or server code changes. Delivers three shell scripts that make the deploy workflow safe and Replit divergence recoverable. All changes confined to repo root.

</domain>

<decisions>
## Implementation Decisions

### deploy.sh Architecture — Composition
- **D-01:** `deploy.sh` calls `./deploy-safe.sh` then checks if ahead of `origin/main` before pushing. No duplicated build logic.
- **D-02:** The push guard in `deploy.sh` checks for unpushed commits (`git log origin/main..HEAD`), NOT staged content — by the time deploy.sh pushes, deploy-safe.sh has already committed. The `git diff --cached --quiet` guard belongs inside `deploy-safe.sh` (before the commit step) to avoid empty commits.
- **D-03:** `deploy-safe.sh` is the standalone build+commit script. It runs: build client → copy dist to public/ → git add public/ → guard (skip if nothing staged) → commit.

### deploy-safe.sh (new)
- **D-04:** Builds client, copies dist to public/, commits. No `git push`. Exits cleanly with message if nothing changed.
- **D-05:** Commit message stays: `"build: rebuild public/ for deployment"` (matches existing deploy.sh pattern).

### replit-sync.sh (new) — Prompt before destructive reset
- **D-06:** Prints WARNING before running `git reset --hard origin/main`. Requires explicit `[y/N]` confirmation. Aborts on anything other than `y`/`yes`.
- **D-07:** Runs `git fetch origin` before reset to ensure origin/main is current.
- **D-08:** Output: `"Done. Replit is now in sync with origin/main."` on success.

### deploy.sh (modify existing)
- **D-09:** Existing `deploy.sh` is updated to: call `./deploy-safe.sh`, then check `git log origin/main..HEAD --oneline` — if output is non-empty (commits ahead), push. If nothing to push, exit cleanly with message.
- **D-10:** Final line updated: `"Done. Pull on Replit: ./replit-sync.sh"` (was bare git command hint).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing scripts (read before modifying)
- `deploy.sh` — existing deploy script (build+copy+commit+push, no guard). Will be replaced/updated by D-09/D-10.
- `build.sh` — Replit-side build script. NOT modified in this phase — different purpose (Replit CI, not local deploy).

### Requirements
- `.planning/REQUIREMENTS.md` §Deploy Automation (OPS) — OPS-01, OPS-02, OPS-03 define exact success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Existing deploy.sh pattern
Current flow: `cd client && npm run build && cd ..` → `rm -rf public/assets && cp -r client/dist/* public/` → `git add public/` → `git commit -m "build: rebuild public/ for deployment" || echo "No changes"` → `git push`. deploy-safe.sh = this flow minus the `git push`, plus a staged-content guard before the commit.

### Script conventions in this repo
- `set -e` at top (existing deploy.sh uses it)
- `echo` progress messages
- `|| echo "..."` fallback on non-fatal steps

</code_context>

<specifics>
## Specific Ideas

- `replit-sync.sh` safety prompt preview approved verbatim:
  ```bash
  echo "WARNING: This will discard all local changes on the Replit instance."
  echo "Any uncommitted edits will be lost."
  read -r -p "Continue? [y/N] " confirm
  ```
- `deploy.sh` compose preview approved — calls `./deploy-safe.sh` then guards on unpushed commits before `git push`.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 15-deploy-hardening*
*Context gathered: 2026-05-13*
