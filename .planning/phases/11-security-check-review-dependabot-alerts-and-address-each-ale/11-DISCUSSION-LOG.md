# Phase 11: Dependabot Security Check + Full Website Regression - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-02
**Phase:** 11-security-check-review-dependabot-alerts-and-address-each-ale
**Areas discussed:** Transitive dep patching, multer 2.x API migration, Vite upgrade, Regression depth

---

## Transitive Dependency Patching

| Option | Description | Selected |
|--------|-------------|----------|
| npm overrides | Add `overrides` field to package.json to pin safe versions. Clean, no parent bumps. | ✓ |
| Bump parent packages | Find and upgrade direct dep that pulls each transitive in. More invasive. | |
| Let Claude decide per-package | Judgment call during execution. | |

**User's choice:** npm overrides
**Notes:** Applies to basic-ftp (root), qs and on-headers (web-version)

---

## multer 1.x → 2.x API Migration

| Option | Description | Selected |
|--------|-------------|----------|
| Audit then fix | Check server.js and routes/ for multer usage first. Fix breaking call sites. | ✓ |
| Upgrade only, assume compatible | Bump, run build, fix only if tests fail. | |
| Remove multer if unused | Remove entirely if not called in code. | |

**User's choice:** Audit then fix
**Notes:** multer v2 changed callback signatures and error class names

---

## Vite 6.3.3 → 6.4.1 Upgrade

| Option | Description | Selected |
|--------|-------------|----------|
| npm install + rebuild | `npm install vite@^6.4.1`, rebuild public/, verify bundle. | ✓ |
| Regenerate lockfile | Delete lock, fresh npm install. Slower, more changes. | |
| Let Claude decide | Claude picks least-invasive path. | |

**User's choice:** npm install + rebuild
**Notes:** Minor patch within v6 — no breaking changes expected

---

## Regression Verification Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Local build + smoke test | npm run build passes, dev server starts, key routes respond. | ✓ |
| Full Replit deploy UAT | Push to Replit, open live site, manual download flow test. | |
| Build + GitHub alert confirmation only | Build passes + gh api confirms 0 alerts. No browser test. | |

**User's choice:** Local build + smoke test
**Notes:** No Replit deploy required to close the phase

---

## Claude's Discretion

- Order of patches across lockfiles
- Whether to run npm audit fix --force first or go straight to manual overrides
- Specific parent package for qs if overrides insufficient
- Whether @vitejs/plugin-react needs version bump alongside vite

## Deferred Ideas

- "Download music by username as well as playlist" — API feature for future phase
- Codebase/Replit divergence investigation — not in scope
