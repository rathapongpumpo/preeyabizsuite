# Small POS-to-kitchen arrow kink

Published to https://buzlike.com/ on 15 November 2026 following the user's annotated screenshot.

The endpoint centers differed by about 8.93px in the inspected live layout. The rounded-elbow algorithm therefore produced two tiny bends and a zero-length middle vertical segment, even though the cards were almost level.

The first handoff now uses a shared horizontal lane when its anchors differ by at most 24px and the card bounds have a safe vertical overlap. Guide, base, active animation path and arrowhead use the same adjusted endpoints. Larger offsets retain the existing routed elbow, including mobile layouts. No panel, typography, section layout or navigation changes.

Changed only six lines in `public/previews/living-systems/hero.js` plus its homepage cache key (`flow-lane-1`), with root/public homepages synchronized.

## Validation

- **23 targeted checks passed locally and live**: ten widths from 390 to 1920, flat desktop handoff (including 1226px near the supplied image width), shared guide/base/active paths, arrowhead endpoint alignment, animated packet on the horizontal lane, correct complete-order values, reduced-motion completion and no JS runtime errors.
- **31 existing geometry checks passed locally and live**: eleven widths, contained/nonoverlapping cards, caption clearance, connector samples avoiding panels, minimum route lengths, desktop first-viewport station visibility, stable layout during animation and reserved lazy-image geometry.
- Opened the live completed-animation screenshot and inspected the repaired line. JS syntax, homepage byte synchronization and `git diff --check` passed.
- Evidence: ignored `output/playwright/flow-lane/verify-local.txt`, `verify-live.txt`, `geometry-local.txt`, `geometry-live.txt`, `live-desktop-moving.png`, `live-desktop-complete.png`, and `deployment.json`.

No inquiry, email, account, POS order or payment was submitted. The existing demo-return navigation code was not edited; the full navigation suites were not rerun for this path-only correction.

## Release

Verified SSH host fingerprint, resolved target and both previous-file hashes against the reviewed Git baseline. Atomically published `previews/living-systems/hero.js` before `index.html`, then verified public hashes.

- Target: `/home/u271733843/domains/buzlike.com/public_html`
- Backup: `/home/u271733843/buzlike-backups/20261115-043205-before-flow-lane`
- Staging: `/home/u271733843/buzlike-releases/20261115-043205-flow-lane`
- Rollback: atomically restore those two backed-up files, script before HTML; hashes are in the backup's `release.json`. Other domains and private inquiry data were untouched.
- Full PHP release artifact: `output/playwright/flow-lane/hostinger-release.zip` (152 files; no credentials).
