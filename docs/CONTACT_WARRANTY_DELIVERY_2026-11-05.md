# Storefront copy, CRM/E-Sign contact actions and warranty — 2026-11-05

Published and checked on https://buzlike.com/.

## Result

- The homepage storefront card no longer says ordering is under improvement. It describes an external catalog/cart plus a separate simulated payment/order confirmation example. The external cart's Checkout button was observed disabled in the live browser; the local overlay uses fixture data and is not connected to that cart. The demo entry and project details now state this distinction. No external storefront source, payment integration or checkout implementation was changed.
- CRM and E-Sign already rendered the shared conversion component, but CSS placed it after the demo. Both now have a fixed compact quote action at the lower right, expandable to quote/LINE actions. The demo scrolls in the remaining viewport, with space reserved for the bar and device safe area, preventing the floating actions from covering signing controls. The bar hides during field editing, signature drawing and dialogs, and is excluded from print. Other demo contact bars retain their existing behavior. This supersedes the static positioning described in `CRM_SIGNATURE_DELIVERY_2026-11-02.md`.
- Following the user's explicit confirmation, the homepage states free fixes for defects within the agreed scope for **60 days after acceptance**. New features and ongoing maintenance are agreed separately in the proposal.
- A short link to the existing public GitHub profile was added before contact. No team biography, experience figures, client history or About navigation was invented.
- Homepage/root entries and static demo route entries are synchronized; changed CSS/JS URLs have a new cache version. Prices, inquiry delivery code and data, localStorage keys, and hero/coffee geometry are unchanged.

## Verification

- 32 targeted local Chromium checks passed: both contact bars at 320/390/768/1440 px, expansion, viewport separation, field focus, mouse-drawn signature and save, modal/print visibility, CRM pipeline, quote-to-estimator CRM preselection, warranty/card copy, simulated checkout confirmation, retained bars on other demos and no runtime errors.
- 40 existing local CRM/E-Sign regression checks passed, including quote approval, scoped document handoff, actual drawn signature persistence, cross-tab updates, return to the same deal, cancellation, stale-link rejection and responsive dialog checks. No real contract was submitted.
- 15 live Chromium checks passed: published card/warranty/GitHub content; both fixed contact bars and expanded actions at 390/1440 px; CRM preselection; inquiry API session initialization with no-store; checkout sample-data wording; no runtime errors. No new inquiry email or payment was sent.
- Live mobile CRM/E-Sign and desktop warranty screenshots, plus local signing and warranty captures, were opened and visually inspected. PHP/JS syntax and whitespace checks passed.

Evidence: ignored `output/playwright/nov05-polish/` contains `verify-results.txt`, `crm-regression-results.txt`, `live-results.txt`, scripts and screenshots. Browser checks establish Chromium behavior at the tested viewports; physical mobile devices and other browser engines were not tested in this change.

## Deployment

- Confirmed the current SSH target resolves to `/home/u271733843/domains/buzlike.com`.
- Applied only eight changed production files, checking their previous content against the checkout (normalizing CRLF/LF) before replacement, then verifying all eight new SHA-256 hashes. The separate full release artifact contains 147 files.
- Private staging: `/home/u271733843/buzlike-releases/20261105-contact-warranty`.
- Backup of the eight previous files: `/home/u271733843/buzlike-backups/20261105-052138-before-contact-warranty`.
- Private inquiry database/key and all other hosted sites were untouched.
