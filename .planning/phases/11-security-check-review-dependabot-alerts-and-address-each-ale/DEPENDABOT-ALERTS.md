# Phase 11 Dependabot Alert Snapshot

Source: `gh api /repos/MrAshRhodes/suno-playlist-downloader-web/dependabot/alerts?state=open`
Captured: 2026-05-01

## Open Alerts

| Alert | Manifest | Package | Severity | Patched | Advisory |
|---|---|---|---|---|---|
| #75 | `package-lock.json` | `basic-ftp` | high | `5.3.0` | GHSA-rp42-5vxx-qpwr / CVE-2026-41324 |
| #29 | `web-version/package-lock.json` | `qs` | medium | `6.14.1` | GHSA-6rw7-vpxm-498p / CVE-2025-15284 |
| #28 | `web-version/package-lock.json` | `on-headers` | low | `1.1.0` | GHSA-76c9-3jph-rj3q / CVE-2025-7339 |
| #27 | `web-version/package-lock.json` | `multer` | high | `2.0.2` | GHSA-fjgf-rc76-4x9p / CVE-2025-7338 |
| #25 | `web-version/package-lock.json` | `multer` | high | `2.0.1` | GHSA-g5hg-p3ph-g8qg / CVE-2025-48997 |
| #24 | `web-version/package-lock.json` | `multer` | high | `2.0.0` | GHSA-4pg4-qvpc-4q3h / CVE-2025-47944 |
| #23 | `web-version/package-lock.json` | `multer` | high | `2.0.0` | GHSA-44fp-w29j-9vj5 / CVE-2025-47935 |
| #22 | `web-version/client/package-lock.json` | `vite` | medium | `6.4.1` | GHSA-93m4-6634-74q7 / CVE-2025-62522 |
| #21 | `web-version/client/package-lock.json` | `vite` | low | `6.3.6` | GHSA-g4jq-h2w9-997c / CVE-2025-58751 |
| #20 | `web-version/client/package-lock.json` | `vite` | low | `6.3.6` | GHSA-jqfw-vq24-v9c3 / CVE-2025-58752 |
| #2 | `web-version/client/package-lock.json` | `vite` | medium | `6.3.4` | GHSA-859w-5945-r5v3 / CVE-2025-46565 |

## Current Lockfile Baseline

- Root `package-lock.json`: `basic-ftp 5.2.2`
- `web-version/package-lock.json`: `multer 1.4.5-lts.2`, `qs 6.13.0`, `on-headers 1.0.2`
- `web-version/client/package-lock.json`: `vite 6.3.3`

## Planned Sub-Phases

- `11-01`: Patch root `basic-ftp` alert #75 and verify root server/build behavior.
- `11-02`: Upgrade/adapt `web-version` `multer` for alerts #23, #24, #25, #27 and regression-test upload/download paths.
- `11-03`: Patch `web-version` transitive middleware alerts #29 (`qs`) and #28 (`on-headers`) with parent updates or minimal overrides.
- `11-04`: Patch `web-version/client` Vite alerts #2, #20, #21, #22 and verify TypeScript/Vite build.
- `11-05`: Run audit/build/deploy-equivalent checks, confirm GitHub alert state, and complete manual website regression.

## Functionality Guardrail

Security fixes must not remove or degrade existing user flows: search, playlist load, individual song selection, ZIP download, settings, support popup/link, ad display path, SEO/static files, and Replit/deploy build behavior.
