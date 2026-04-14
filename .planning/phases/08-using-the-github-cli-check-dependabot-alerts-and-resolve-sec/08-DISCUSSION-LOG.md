# Phase 8: Dependabot Security - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-14
**Phase:** 08-using-the-github-cli-check-dependabot-alerts-and-resolve-sec
**Areas discussed:** Resolution scope, Breaking change risk, Approach strategy

---

## Resolution Scope

| Option | Description | Selected |
|--------|-------------|----------|
| High + Critical only | Fix 8 high-severity alerts. Leave medium/low for later. | |
| All open alerts | Fix all 15 including medium and low. More work, cleaner bill of health. | ✓ |
| Direct deps only | Only fix packages in our package.json. Skip transitive deps. | |

**User's choice:** All open alerts
**Notes:** User wants a clean bill of health — no alerts left open.

---

## Breaking Change Risk

| Option | Description | Selected |
|--------|-------------|----------|
| Accept breaking changes | Bump multer to 2.x and vite to 5.x. May need minor code tweaks. | ✓ |
| Patched minors only | Stay on current majors, apply only patch/minor bumps. Some alerts may remain. | |
| Replace vulnerable packages | Drop multer for busboy/formidable. Drop vite 4 for vite 6. Bigger change. | |

**User's choice:** Accept breaking changes
**Notes:** Willing to accept API changes from major bumps to get fully patched.

---

## Approach Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| npm audit fix + manual bumps | Start with npm audit fix --force, then manually bump multer and vite. | ✓ |
| Manual bumps only | Skip npm audit, manually update each package. More control, slower. | |
| Fresh install approach | Delete node_modules + lock files, reinstall at latest. Nuclear option. | |

**User's choice:** npm audit fix + manual bumps
**Notes:** Automated first pass, then manual intervention for stubborn packages.

---

## Claude's Discretion

- Order of operations for package bumps
- Whether to regenerate lock files
- multer 2.x API migration details

## Deferred Ideas

None
