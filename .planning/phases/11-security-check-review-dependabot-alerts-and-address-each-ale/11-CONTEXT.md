# Phase 11: Dependabot Security Check + Full Website Regression - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Resolve all 11 open GitHub Dependabot alerts across three lockfiles (root, `web-version`, `web-version/client`) while preserving complete website behavior. No new features, no UI changes, no functional changes — security patches only.

**11 alerts across 3 lockfiles:**
| Lockfile | Package | Current | Target |
|---|---|---|---|
| `package-lock.json` | `basic-ftp` | 5.2.2 | ≥5.3.0 |
| `web-version/package-lock.json` | `multer` | 1.4.5-lts.2 | ≥2.0.2 |
| `web-version/package-lock.json` | `qs` | 6.13.0 | ≥6.14.1 |
| `web-version/package-lock.json` | `on-headers` | 1.0.2 | ≥1.1.0 |
| `web-version/client/package-lock.json` | `vite` | 6.3.3 | ≥6.4.1 |

</domain>

<decisions>
## Implementation Decisions

### Transitive Dependency Patching (basic-ftp, qs, on-headers)
- **D-01:** Use npm `overrides` field in the relevant `package.json` to pin safe versions for transitive deps. Do NOT attempt to bump parent packages — too invasive.
  - Root `package.json`: add `overrides.basic-ftp` to `>=5.3.0`
  - `web-version/package.json`: add `overrides.qs` to `>=6.14.1` and `overrides.on-headers` to `>=1.1.0`
- **D-02:** Run `npm install` after adding overrides to regenerate the lockfile with pinned versions. Verify `npm audit` shows 0 findings for each patched package.

### multer 1.x → 2.x Migration
- **D-03:** Audit `server.js` and all files in `routes/` for multer usage before upgrading. Document every call site.
- **D-04:** Upgrade to `multer@^2.0.2`, then fix any breaking API changes found in the audit. multer v2 changed: file filter callback signature, error class names, storage engine interface.
- **D-05:** Accept this breaking major version bump (carries forward from Phase 8 D-03). Verify build and dev server start after the migration.

### Vite 6.3.3 → 6.4.1 (minor patch within v6)
- **D-06:** Run `npm install vite@^6.4.1` in `web-version/client`. This is a minor patch — no config changes expected.
- **D-07:** After upgrade, run `npm run build` in `web-version/client` and verify bundle output in `public/` is generated correctly.
- **D-08:** Do NOT regenerate the lockfile from scratch — targeted install only.

### Regression Verification (Phase 11-05)
- **D-09:** Local build + smoke test is sufficient to close the phase. No Replit deploy required.
  - `npm run build` passes in `web-version/client`
  - Dev server starts (`npm start` or equivalent)
  - Key API routes respond (playlist fetch, download endpoint, settings)
  - `npm audit` returns 0 HIGH/MEDIUM findings (LOW acceptable if unfixable transitive)
- **D-10:** Confirm GitHub Dependabot alert closure via `gh api repos/{owner}/{repo}/dependabot/alerts?state=open` before declaring done.

### Carrying Forward from Phase 8
- **D-11:** Start with `npm audit fix` for automated easy wins. Manually handle what it can't resolve.
- **D-12:** Verify build passes after each major bump — do not batch all bumps before testing.
- **D-13:** Use `gh api` to track alert state before and after changes (SEC-01 baseline + recheck).

### Claude's Discretion
- Order in which to apply patches across the 3 lockfiles (suggested: root → web-version → web-version/client)
- Whether to run `npm audit fix --force` first or go straight to manual overrides
- Specific parent package to bump for `qs` if overrides don't satisfy npm audit (express-session or qs direct dep)
- Whether `@vitejs/plugin-react` needs a version bump alongside vite 6.4.1

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Alert Reference
- `.planning/phases/11-security-check-review-dependabot-alerts-and-address-each-ale/DEPENDABOT-ALERTS.md` — Exact alert IDs, severity, advisory IDs, and sub-phase mapping. Source of truth for which alerts belong to which plan.

### Implementation Files
- `package.json` — Root-level direct deps and where `overrides` for basic-ftp goes
- `package-lock.json` — Root lockfile (basic-ftp lives here)
- `web-version/package.json` — web-version direct deps and where `overrides` for qs/on-headers go
- `web-version/package-lock.json` — web-version lockfile (multer, qs, on-headers)
- `web-version/client/package.json` — Client devDeps (vite lives here)
- `web-version/client/package-lock.json` — Client lockfile (vite)
- `web-version/server.js` — multer usage (check for API call sites before upgrading)
- `web-version/routes/download.js` — may reference multer (audit required)
- `web-version/client/vite.config.ts` — Vite config (check for v6 compatibility after upgrade)
- `deploy.sh` — must rebuild `public/` if client deps change; verify this still works

### Prior Phase Context
- `.planning/phases/08-using-the-github-cli-check-dependabot-alerts-and-resolve-sec/08-CONTEXT.md` — Phase 8 decisions that carry forward (breaking change policy, audit approach, gh api tracking)

### Requirements
- `.planning/REQUIREMENTS.md` — SEC-01 through SEC-09 requirements for this phase

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `deploy.sh` — existing build+copy pipeline; must be verified still works after client dep changes
- `npm audit` — already configured; use for pre/post patch verification

### Established Patterns
- Phase 8 established: `npm audit fix` → manual bumps → `gh api` verification. Follow same sequence.
- `overrides` field pattern: already used in npm ecosystem for transitive dep pinning without parent bumps

### Integration Points
- multer is used in `web-version/server.js` and potentially `web-version/routes/download.js` — these need audit before upgrade
- vite is the build tool for `web-version/client` — its output lands in `public/` which Replit serves
- `@vitejs/plugin-react` is coupled to vite version — check compatibility with 6.4.x

</code_context>

<specifics>
## Specific Ideas

- basic-ftp is likely a transitive dep of something in root (not a direct dep of the server). Use `npm ls basic-ftp` to confirm the dep tree before adding overrides.
- For qs: run `npm ls qs` in `web-version/` to confirm the dep tree. qs is commonly pulled in by express or express-session.
- For on-headers: run `npm ls on-headers` in `web-version/` to confirm parent (likely express-session).

</specifics>

<deferred>
## Deferred Ideas

- "Download music by username as well as playlist" — API feature, separate phase (noted in project backlog)
- Codebase/Replit divergence investigation — not in scope for Phase 11

</deferred>

---

*Phase: 11-security-check-review-dependabot-alerts-and-address-each-ale*
*Context gathered: 2026-05-02*
