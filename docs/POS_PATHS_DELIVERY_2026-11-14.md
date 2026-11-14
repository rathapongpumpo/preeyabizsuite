# POS product versus development paths

Published to https://buzlike.com/ on 14 November 2026. Implements priority 1 of the visitor-convenience review; other recommendations remain separate work.

## Result

- Selecting POS in the existing estimator reveals two explicit paths: **ดู BUZLIKE POS** and **ประเมินค่าพัฒนา POS**. The product opens a new tab; the development button advances the existing estimator and keeps selected systems and contact drafts.
- POS options follow checkbox selection, persisted drafts and shared `?interest=pos` links. They disappear on deselection/reset and are not shown for unrelated systems.
- The calculator labels its range as development cost, with an explicit note that it is not a BUZLIKE POS subscription. On mobile the choice appears before the development estimate; prices and quote calculations remain unchanged.
- The restaurant POS demo now has a compact fixed product link immediately available. Expanding it offers the real product, custom POS development and the existing LINE contact. The reserved bottom space follows the bar's size so the demo remains scrollable above it.
- Product links use new tabs and `noopener`, preserving the homepage/estimator or demo. The copy states the current invitation-based pilot and waitlist, rather than promising immediate public admission.
- The custom-development link continues to the same POS-preselected estimator. No new authentication, account, billing, API payload or database behavior.
- PHP, static demo and homepage entry points are synchronized and asset cache versions are `pos-paths-1`. Existing navigation implementation and restore keys were not changed.

Try: https://buzlike.com/?interest=pos#estimator-form and https://buzlike.com/pos-system-smart.

## Verification

Both local and live runs passed **159 checks** each:

| Checks | Count per environment | Coverage |
|---|---:|---|
| POS paths | 35 | Context appears only for POS; development versus membership wording; pilot disclosure; estimator layout at 320/390/768/1024/1440px; action sizes; development step advance; multi-selection and contact-draft retention; new-tab product links with null opener; reset/reload/shared URL; hosted and standalone demo entry paths; fixed-bar fit/reserved space; no JS runtime errors |
| Existing navigation | 59 | Six demos on mobile/desktop; original homepage/form document identity; exact return scroll and focus; Back/Forward; CRM/signature and estimator handoff; one homepage document request |
| Refresh resilience | 65 | Four additional demos on mobile/desktop; return button, Back, refresh-then-return and refresh-then-Back; exact saved position and expanded list |

Live mobile estimator and POS-demo screenshots were opened and inspected. JS/PHP syntax checks, unique homepage IDs, root/public homepage and demo byte synchronization, and `git diff --check` passed.

Ignored evidence directory: `output/playwright/pos-paths/`. Key files: `verify-local.txt`, `verify-live.txt`, `core-local.txt`, `core-live.txt`, `resilience-local.txt`, `resilience-live.txt`, `live-estimator-390.png`, `live-demo-390.png`, and `deployment.json`.

No inquiry was submitted, no email was sent and no production account/store/order/payment was created. The inquiry backend and its outbound payload are unchanged; this is navigation/estimator verification, not a repeat of mailbox delivery or POS transaction tests.

## Deployment

- Verified SSH host fingerprint and resolved target `/home/u271733843/domains/buzlike.com/public_html`.
- Compared **all seven** existing target files with the prior reviewed Git baseline before publishing.
- Backup: `/home/u271733843/buzlike-backups/20261114-034113-before-pos-paths`.
- Staging: `/home/u271733843/buzlike-releases/20261114-034113-pos-paths`.
- Published only `index.html`, `index.php`, `demo.html`, `assets/app.css`, `assets/app.js`, `assets/estimator.js`, `assets/pos-product.css`. Verified staged/public SHA-256 values and atomically replaced assets before the entry pages.
- Private inquiry storage and other domains, including the POS deployment, were untouched.
- Rollback: restore these seven backed-up files by atomic replacement, assets before entry pages. `release.json` in the backup records their old/new hashes. Do not replace private data or other domains.
- Full PHP release archive: `output/playwright/pos-paths/hostinger-release.zip` (151 files; excludes credentials).
