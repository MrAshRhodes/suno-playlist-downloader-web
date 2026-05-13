# Phase 15: Deploy Hardening — Discussion Log

**Date:** 2026-05-13
**Discussed areas:** deploy.sh architecture, replit-sync.sh safety gate

---

## Area 1: deploy.sh Architecture

**Options presented:**
- Compose: `deploy.sh` calls `./deploy-safe.sh` then pushes if ahead of origin
- Standalone: deploy.sh duplicates build logic, adds guard before push

**Selected:** Compose

**Notes:** Guard in deploy.sh must check for unpushed commits (not staged content) since deploy-safe.sh has already committed by then. `git diff --cached --quiet` guard belongs inside deploy-safe.sh before its commit step.

---

## Area 2: replit-sync.sh Safety Gate

**Options presented:**
- Prompt: WARNING + `[y/N]` confirmation before `git reset --hard`
- Direct: no prompt, just run

**Selected:** Prompt

**Notes:** Approved preview verbatim. `git fetch origin` runs before reset.

---

## Claude's Discretion

- Commit message stays consistent with existing deploy.sh: `"build: rebuild public/ for deployment"`
- Final line in deploy.sh updated from bare git hint to `./replit-sync.sh` reference

## Deferred Ideas

None.
