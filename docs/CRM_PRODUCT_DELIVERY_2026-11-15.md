# CRM in the product catalog — 15 November 2026

Added Sales Flow CRM to the homepage product catalog at `/#crm-system`, after the warehouse product. Existing demo-list access remains available.

- Describes the audience and workflow: sales teams, service businesses and contractors; customer/deal tracking, quotations and optional contracts/signing.
- Clearly marks the system as a prototype available for customization. Explains that its data/signatures stay in the browser, signing across devices is unavailable, and delivered screens/functionality/workflows depend on customer requirements and agreed scope.
- The primary link opens `/business-suite` in the existing demo workspace. The estimate link uses `/?interest=crm#estimator-form` and the existing `data-estimate-interest` handler, selecting CRM without reloading or discarding the customer's draft.
- Uses the established full-width product-card layout with scoped purple colors. The existing header, hero, POS, Doctor Lawyer and warehouse cards retain their geometry. CSS cache key: `crm-product-1`.
- New 1200×750 screenshot `public/assets/portfolio/crm-product.webp` (44,732 bytes) comes from the current CRM demo, including its persistent prototype notice. Images reserve space and use `object-fit: contain`.
- Root/public homepages are identical. CRM code, navigation, pricing, inquiry handling and the real product applications were not modified.

## Verification

Ignored evidence: `output/playwright/crm-product/` contains CLI scripts/results, desktop/mobile captures, source screenshot and deployment manifest.

- **59 focused checks:** product placement/copy, correct links, touch targets, no overflow or overlapping card columns at 13 widths from 320–1920px, uncropped preview, mobile/desktop exact return through the in-app button and browser Back, retained homepage document, CRM-only estimate selection with preserved name/notes, canonical estimate URL, keyboard order, Ctrl-click estimate in a fresh tab and no JavaScript errors.
- **30 homepage checks:** existing header, hero and three preceding product-card coordinates/heights match the baseline across the same 13 widths; no horizontal overflow; prototype wording and estimator configuration remain correct.
- **59 navigation checks:** all six demos on mobile/desktop, return position, expanded details, form/DOM/focus preservation, Back/Forward, CRM signing handoff and estimator intent. Existing demo-list selectors explicitly target that list now that CRM has an additional entry point.

All three suites passed **148 checks locally and 148 on the public domain**, with zero JavaScript runtime errors. Desktop/mobile screenshots were visually inspected. Tests use isolated browser data and submit no real inquiry/email. `git diff --check`, identical entrypoints and unchanged source/application/navigation files passed separately.

The initial focused live run counted two identical startup document requests. That check now records the count after the initial document is ready and verifies that card journeys add no homepage document requests; the retained DOM-identity assertions independently detect reloads. The core navigation suite also passed its normal single-homepage-request assertion.

## Release and rollback

Published only three files under `/home/u271733843/domains/buzlike.com/public_html`: `index.html`, `assets/pos-product.css`, `assets/portfolio/crm-product.webp`. Verified the configured SSH fingerprint, exact directory, existing remote content against Git, staging hashes and final published hashes. Published image/CSS before the homepage.

Backup: `/home/u271733843/buzlike-backups/20261115-094050-before-crm-product`. Restore backed-up `public/index.html` and `public/assets/pos-product.css` under `public_html/`; the new image may remain unreferenced. No database/private inquiry data changed.
