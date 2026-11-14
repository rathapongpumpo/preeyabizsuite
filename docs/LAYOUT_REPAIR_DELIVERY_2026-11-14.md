# Homepage layout correction

Published and verified on https://buzlike.com/ on 14 November 2026 following the user's report that the layout was distorted.

## Correction

The previous iteration moved the copy to the top and used large two-line action cards while the scene retained a fixed 660px canvas plus a tall heading/caption. At 1280×720 the hero was about 943px high and the lower stations were below the first viewport. Earlier checks established that entry buttons fit but did not sufficiently assess the composition or the entire scene.

- Rebalanced the hero columns, spacing, typography and vertical alignment. Replaced the large cards with compact buttons while retaining the POS, development and consultation destinations.
- Reworked the scene heading into a compact responsive row, removed the redundant line break and shortened the canvas appropriately for desktop, short desktop viewports and mobile.
- Anchored stock/report cards above the canvas bottom and adjusted desktop kitchen position to leave a usable vertical handoff. The cards no longer spill into the caption. Existing connector JavaScript recalculates routes from actual panel bounds; no new animation/navigation implementation.
- Added accurate reserved aspect ratios and corrected intrinsic image dimensions for WMS (1254×850) and POS (1360×1161), preserving original image content. Delayed lazy-image responses were tested to confirm stable preview geometry after decoding.
- Root/public homepages synchronized; stylesheet cache version is `layout-repair-1`.

## Verification

**188 checks passed locally and 188 on the live site**:

| Suite | Per environment | Coverage |
|---|---:|---|
| Entry choices | 33 | Three entry paths visible at seven viewport combinations; headline/action bounds, action size, correct destinations, keyboard/focus, reduced motion, retained service/product/demo access and completed coffee animation |
| Scene geometry and image loading | 31 | Eleven widths from 320 to 1920; all panels inside canvas, no pairwise panel overlap, caption clearance; sampled connector centerlines avoid panels, every handoff at least 20px; full stations/caption visible on tested desktop viewports including 1280×720; stable section position during animation at 390/1280; lazy-image hold/release does not change reserved preview height/position |
| Core navigation | 59 | Six demos mobile/desktop, original homepage/form identity, exact return position/focus, Back/Forward, CRM/signature and estimator handoff, one homepage document request |
| Refresh resilience | 65 | Four additional demos mobile/desktop; web return, Back, refresh→return, refresh→Back; exact saved position and expanded list |

Viewed live screenshots of the desktop hero, mobile hero and systems section after image decoding. Verification uses Chrome at desktop/mobile viewport sizes, not a claim of physical-device or all-browser coverage.

Evidence is in ignored `output/playwright/layout-repair/`: `entry-local.txt`, `geometry-local.txt`, `core-local.txt`, `resilience-local.txt`, their `-live` equivalents, `live-hero-1280.png`, `live-hero-390.png`, `live-systems-1440.png` and `deployment.json`.

No inquiry/email was submitted, no POS transaction/account/payment created, and no pricing, account, backend or database changes.

## Deployment and rollback

- Verified known SSH fingerprint, resolved target and prior reviewed hashes for both changed public files.
- Target: `/home/u271733843/domains/buzlike.com/public_html`.
- Backup: `/home/u271733843/buzlike-backups/20261114-040454-before-layout-repair`.
- Staging: `/home/u271733843/buzlike-releases/20261114-040454-layout-repair`.
- Published only `assets/home-entry.css` and `index.html`, asset before entry page, via atomic replacements; verified staged/public SHA-256 values.
- Rollback: atomically restore those two backed-up files, CSS before HTML. The backup's `release.json` records old/new hashes. Other sites and private inquiry data were untouched.
- Full reproducible PHP archive: `output/playwright/layout-repair/hostinger-release.zip` (152 files; no credentials).
