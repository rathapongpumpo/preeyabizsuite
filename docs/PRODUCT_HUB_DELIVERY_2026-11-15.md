# Product hub navigation

Published to https://buzlike.com/#products on 15 November 2026.

The desktop and mobile menus now use “ผลิตภัณฑ์ของเรา” in the previous POS menu slot. It opens a product catalog on the existing homepage, keeping the header compact and retaining the separate demo and development-pricing navigation.

The catalog currently contains BUZLIKE POS, with its real screenshot, supported business types, features, pilot status, product details, waitlist, packages and login links. The existing `#buzlike-pos` URL and hero shortcut still open the POS card directly. Product links continue to open the independent POS application in a new tab. Trial admission and membership conditions are unchanged.

## Adding a product

Add a semantic `article` inside `.product-catalog-list`, with a unique anchor and an `h3` product name labelled by `aria-labelledby`. Include the actual product screenshot with reserved dimensions, target business types, capabilities, accurate availability and product-specific links. Add only confirmed products; the existing simulated demos remain in `#systems`. No fixed product count, empty placeholder cards, filtering or extra navigation JavaScript is needed for the current catalog.

The catalog title is the section `h2`; POS branding is now the article `h3`, with its existing large tagline styled independently. The stylesheet cache key is `product-hub-1`. Root and public homepage copies are byte-identical.

## Validation

- **73 targeted checks passed locally and live:** 13 viewport widths from 320 to 1920px, header fit, catalog navigation, mobile-menu closing, card containment, usable link targets, heading hierarchy, unique IDs, pilot disclosure, external-link settings, keyboard focus/activation, contact navigation, browser Back, both direct anchors and reduced motion. Fresh-tab direct links were also explicitly verified on production.
- **59 existing demo-return checks passed locally and live:** all six demo routes on mobile and desktop, exact scroll restoration, expanded details, retained form DOM and input, focus, browser Back/Forward, CRM/signature transitions, quote intent and standalone Ctrl-click. The normal sequence required exactly one homepage document request.
- Inspected desktop and mobile product screenshots. The existing hero/connector code, estimator logic and inquiry endpoint were not edited. No inquiry, email, account, POS order or payment was submitted.
- Homepage synchronization, release packaging (152 files) and `git diff --check` passed.

Evidence is in ignored `output/playwright/product-hub/`: `verify-local.txt`, `verify-live.txt`, `core-local.txt`, `core-live.txt`, `deep-links.txt`, catalog screenshots and `deployment.json`.

## Release

Verified the SSH host fingerprint, resolved target directory and both previous files against the reviewed Git baseline. Published `assets/pos-product.css` before `index.html`, with per-file atomic replacement and verified public hashes.

- Target: `/home/u271733843/domains/buzlike.com/public_html`
- Backup: `/home/u271733843/buzlike-backups/20261115-044152-before-product-hub`
- Staging: `/home/u271733843/buzlike-releases/20261115-044152-product-hub`
- Rollback: restore the two backed-up files atomically, asset first and HTML second. No database or private inquiry files were changed.
