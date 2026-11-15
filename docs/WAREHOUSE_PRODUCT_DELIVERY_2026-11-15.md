# Warehouse product discovery and estimate entry

Published to https://buzlike.com/#warehouse-system on 15 November 2026.

Added “ระบบคลังสินค้า” to the existing product catalog with an actual demo screenshot, supported workflows and explicit “ต้นแบบ · รับปรับพัฒนาต่อ” status. The card explains that the prototype stores data in the browser and has no central database connection.

The primary action opens the existing `/warehouse-management` demo in the same-tab demo workspace. Its return button and browser Back restore the product reading position and retained homepage form. The secondary action opens the existing estimator with WMS selected, without reloading the homepage or losing contact/notes drafts.

## Implementation

- Appended one article with the `#warehouse-system` anchor. Scoped green styling uses `.product-card--warehouse`; existing header, hero, POS and Doctor Lawyer layout/styles remain unchanged.
- Reused the approved 1254×850 demo screenshot as a 66,178-byte WebP. The new image is lazy-loaded into a reserved frame with `object-fit: contain`.
- Added a guarded delegated handler for `a[data-estimate-interest]` in `estimator.js`. Normal same-origin clicks push the canonical estimate URL, reuse the existing `buzlike:home-intent` selection/reset behavior, scroll to the estimator and focus its heading. Ctrl/Meta/Shift/Alt clicks, download links and other targets keep native link behavior. The canonical href also works on direct/new-tab arrival.
- The handler ignores the link while an inquiry is being sent. After a completed receipt, it starts a fresh editable estimate through the existing reset handler. Pricing, inquiry payloads and server submission code were not changed.
- Updated cache keys to `wms-product-1` for product CSS and `product-interest-1` for estimator JS. Root/public homepage copies are byte-identical.

## Validation

- **160 focused checks passed locally and live:** 13 widths from 320 to 1920px; original header/hero/POS/Doctor Lawyer geometry compared with a pre-change baseline; separated, contained card content with no horizontal overflow; image dimensions and reserved aspect frame; scoped colors; touch targets; unique IDs; prototype disclosure; WMS demo opened from the product card; return button and browser Back at mobile/desktop; retained draft and form DOM; WMS-only estimate preselection, heading focus and unchanged price configuration; Back/Forward positions; Ctrl-click new-tab preselection; keyboard activation; one homepage document request across normal product/quote actions; pending inquiry guard; new estimate after a receipt; four fresh direct anchors; deliberately delayed screenshot load without shifting the following section; no JavaScript runtime errors.
- **59 existing core navigation checks passed locally and live:** all six demo routes at mobile/desktop, expanded details and exact return positions, retained form values/DOM, Back/Forward, CRM-to-signature handoff, quote intent and standalone demo tabs. Normal journeys made one homepage document request.
- The pending/receipt inquiry exercise intercepted both session GET and submission POST in the browser and fulfilled a mock response. **No inquiry or email reached the production server.** No legal query, account, OTP, payment or real POS order was submitted.
- Opened and inspected local/live desktop and mobile screenshots. `node --check`, `git diff --check`, homepage byte synchronization and Hostinger release packaging (154 files) passed.

Evidence is in ignored `output/playwright/wms-product-release/`: `baseline.json`, `verify-local.txt`, `verify-live.txt`, `core-local.txt`, `core-live.txt`, local/live warehouse screenshots and `deployment.json`. An initial live color assertion read the intentional hover color; the harness now moves the pointer away before comparing normal colors. The complete rerun passed without a product-code change for that assertion.

## Release and rollback

Verified the SSH host fingerprint, resolved deployment target and existing files against the reviewed Git baseline; confirmed the new screenshot was absent. Staged and backed up the patch, then published assets before HTML using atomic per-file replacement and public hash verification.

- Target: `/home/u271733843/domains/buzlike.com/public_html`
- Backup: `/home/u271733843/buzlike-backups/20261115-071122-before-wms-product-release`
- Staging: `/home/u271733843/buzlike-releases/20261115-071122-wms-product-release`
- Published: `assets/portfolio/warehouse-product.webp`, `assets/pos-product.css`, `assets/estimator.js`, `index.html`.
- Rollback: atomically restore the three backed-up existing files, assets before HTML; the new image may remain unreferenced. No database or private inquiry data changed.

Recommended next catalog addition: CRM/workflow for sales and contracts, using `/business-suite` and the same estimate-entry pattern with `interest=crm`, while retaining its prototype status and existing return behavior.
