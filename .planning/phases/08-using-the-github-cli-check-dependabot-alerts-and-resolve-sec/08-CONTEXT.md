# Phase 8: Dependabot Security - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Resolve all open Dependabot security alerts in the repository using GitHub CLI (`gh`) for triage and `npm audit fix` + manual package bumps for resolution. Covers both direct and transitive dependencies. Build must pass after all changes.

</domain>

<decisions>
## Implementation Decisions

### Resolution Scope
- **D-01:** Fix ALL open alerts — high, medium, and low severity. No alerts left open when phase completes.
- **D-02:** Include transitive dependencies, not just direct deps.

### Breaking Change Policy
- **D-03:** Accept breaking major version bumps where needed to resolve vulnerabilities (multer 1.x→2.x, vite 4.x→5.x+).
- **D-04:** Verify build passes after each major bump. Fix any breaking API changes introduced by the upgrade.

### Approach Strategy
- **D-05:** Start with `npm audit fix --force` for automated easy wins across both root and client package.json.
- **D-06:** Manually bump packages that `npm audit fix` can't resolve (multer, vite, rollup).
- **D-07:** Use `gh api repos/{owner}/{repo}/dependabot/alerts` to list, track, and dismiss resolved alerts.

### Known Alerts (as of 2026-04-14)

| Package | Severity | Alert #s | Strategy |
|---------|----------|----------|----------|
| multer | HIGH x3 | 66,67,68 | Bump to 2.x |
| lodash | HIGH+MED | 49,50,61,73,74 | npm audit fix (transitive via puppeteer) |
| vite | HIGH+MED | 51,59,60 | Bump to 5.x+ |
| rollup | HIGH | 54 | Bumps with vite upgrade |
| path-to-regexp | HIGH | 46,72 | npm audit fix (transitive via express) |
| minimatch | HIGH | 65 | npm audit fix (transitive) |
| picomatch | MED x3 | 48,57,58,70 | npm audit fix (transitive) |
| yaml | MED | 45 | npm audit fix (transitive) |
| qs | LOW | 62 | npm audit fix (transitive via express) |

### Claude's Discretion
- Order of operations for package bumps (as long as build is verified after each)
- Whether to update package-lock.json incrementally or regenerate
- Whether multer 2.x API changes require server.js modifications

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above. Use `gh api` docs and npm audit docs for implementation guidance.

### Key files to check during implementation
- `package.json` — Root dependencies (multer, express, etc.)
- `client/package.json` — Client dependencies (vite, rollup)
- `server.js` — multer usage (may need API changes for 2.x)
- `routes/download.js` — may reference multer
- `deploy.sh` — must rebuild public/ after client dep changes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `deploy.sh` — handles build + copy to public/ + push (use after changes)
- `gh` CLI — authenticated and available for Dependabot API calls

### Established Patterns
- Root `package.json` has server deps, `client/package.json` has frontend deps
- `npm run build` from root triggers client build via `cd client && npm install && npm run build`

### Integration Points
- multer used in server.js for file upload handling
- vite used as client build tool — config in `client/vite.config.ts`
- `@vitejs/plugin-react` may need version bump alongside vite

</code_context>

<specifics>
## Specific Ideas

- Use `gh api` to pull current alert list, resolve programmatically where possible
- After all fixes, run `gh api` again to verify alert count drops to zero
- Dismiss auto_dismissed alerts if they're already resolved

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-using-the-github-cli-check-dependabot-alerts-and-resolve-sec*
*Context gathered: 2026-04-14*
