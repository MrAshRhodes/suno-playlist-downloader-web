# Phase 11 — Deferred Items

These items were discovered during Phase 11 execution but are out of scope for this phase.

---

## postcss < 8.5.10 (GHSA-qx2v-qp2m-jg93)

**Affected locations:**
- `client/` (via postcss-preset-mantine → postcss@8.5.9)
- `web-version/client/` (via postcss-preset-mantine → postcss@8.5.9)

**Root cause:** postcss-preset-mantine requires postcss@8.5.9 (or lower). Upgrading postcss to >=8.5.10 requires upgrading postcss-preset-mantine, which pulls Mantine v7. `client/` is pinned to Mantine v6 (CLAUDE.md constraint). `web-version/client/` uses Mantine v7 but postcss-preset-mantine version constraint caps it.

**Severity:** moderate

**Fix path:** Upgrade postcss-preset-mantine in `web-version/client/` to a version that allows postcss >=8.5.10. For `client/`, requires Mantine v6 → v7 upgrade (large breaking change, out of scope).

---

## web-version/ server transitive vulns

**Affected packages:** brace-expansion, lodash, minimatch, path-to-regexp, picomatch

**Context:** These are transitive deps of devDependencies (nodemon) and express@4. They were present before Phase 11.

**Severity:** 1 moderate, 5 high

**Fix path:** Upgrade express to v5+ (path-to-regexp fixed there), upgrade nodemon.

---

## picomatch / rollup in web-version/client/

**Affected packages:** picomatch (via vite), rollup (via vite)

**Context:** Transitive deps introduced with vite@6.4.2 upgrade in 11-04. Not directly fixable without vite upgrade.

**Severity:** 1 moderate, 2 high

**Fix path:** Watch for vite patch releases that update picomatch and rollup.
