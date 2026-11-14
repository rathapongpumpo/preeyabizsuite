# BUZLIKE POS discovery — round 1 delivery

Published and verified on https://buzlike.com/#buzlike-pos on 14 November 2026.

## Delivered

- Added “ระบบ POS” to desktop/mobile navigation and a small discovery link below the original hero actions.
- Added a product section immediately after the animated hero, before the existing demos. It uses a WebP version of the POS repository's existing test-store screenshot (1536 × 1024, 118,814 bytes), intrinsic dimensions and a stable aspect ratio.
- Added four explicit links: product details, pilot waitlist, current pricing and existing-customer login. Each opens a new tab with `noopener`, an accessible new-tab label and a visible indication, keeping the actual homepage document, scroll position and inquiry draft alive.
- Disclosed invitation-based pilot status, pending registration and no current subscription payment admission, matching the public POS pages inspected on this date. No generic immediate-use/free-trial promise or duplicated numeric subscription prices.
- Renamed homepage navigation/pricing context to “ค่าพัฒนาระบบ”; the original development starting price remains 15,000 baht and the estimator remains functional.
- Root/public homepage copies are byte-identical. Product styling is scoped in the new `public/assets/pos-product.css`; no dependency or shared-auth work.

This round changes the main website only. Demo-specific conversion changes and the POS backlink/menu label remain round 2. The existing animated coffee demonstration, demo navigation implementation, estimate logic, inquiry delivery backend, POS release policy, accounts, billing and databases were not edited.

## Verification

Local and live results each passed **176 checks**:

| Suite | Local | Live | Coverage |
|---|---:|---:|---|
| Product discovery | 52 | 52 | Layout at 320/375/390/520/768/900/901/1024/1100/1200/1440px, no horizontal overflow/header collision, action sizes, menus, image load, accessible new-tab links, correct popup URLs, null opener, exact parent scroll and form/draft retention, keyboard focus and reduced motion |
| Existing core navigation | 59 | 59 | Six demos at mobile/desktop, original homepage/form identity, return position/focus, Back/Forward, CRM→signature and estimator handoff, one homepage main-frame request and no JS runtime errors |
| Refresh/return resilience | 65 | 65 | Four additional demos at mobile/desktop; return button, Back, refresh→return and refresh→Back, expanded list and exact restored position |

Also opened the real POS product, waitlist and login destinations and checked their rendered headings. Inspected captured live desktop and mobile screenshots after image decoding. HTML IDs, four safe outbound anchors, homepage synchronization, CSS structure and `git diff --check` passed.

The initial live core run timed out at Playwright's default load wait during an SPA estimator transition. The final run waits for the URL commit rather than full document load and passed all 59 checks. This adjustment is in the ignored verification harness only; production navigation code was not changed.

Evidence is in ignored `output/playwright/pos-link-plan/`: `verification-local.txt`, `verification-live.txt`, `core-local.txt`, `core-live.txt`, `resilience-local.txt`, `resilience-live.txt`, `destinations-live.txt`, `product-live-desktop.png`, `product-live-mobile.png`, `product-live-mobile-actions.png`, and `deployment.json`.

No inquiry was submitted, no mail was sent, and no account, waitlist entry, store, order or payment was created. These checks establish the marketing navigation and existing demo behavior, not POS transaction or hardware readiness.

## Deployment and rollback

Verified the SSH host fingerprint and resolved target path, and compared the live homepage against the prior reviewed Git baseline before publishing.

- Target: `/home/u271733843/domains/buzlike.com/public_html`
- Backup: `/home/u271733843/buzlike-backups/20261114-031317-before-pos-product`
- Staging: `/home/u271733843/buzlike-releases/20261114-031317-pos-product`
- Published only `index.html`, `assets/pos-product.css`, `assets/portfolio/buzlike-pos-product.webp`; verified staged and public SHA-256 values. Assets were published before HTML using atomic file replacements.
- Inquiry data outside the public directory and all other domains were untouched.
- Rollback: restore the backed-up `index.html` to this target's `public_html/index.html` by atomic replacement. The newly added CSS/image may remain unreferenced. The backup's `release.json` records original/new hashes and newly introduced files. Do not restore another domain or replace private inquiry data.

Full reproducible PHP release archive: `output/playwright/pos-link-plan/buzlike-pos-product-release.zip` (151 files). No credentials are included in that artifact or this delivery note.
