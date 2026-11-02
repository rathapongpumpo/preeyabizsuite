# Demo polish delivery — 2026-11-02

Implements the four items from `REMAINING_REVIEW_2026-11-02.md`.

## Delivered

- **Share metadata:** brand share card captured from the existing homepage at 1200×630; homepage Open Graph/Twitter/canonical tags. `src/PageMetadata.json` defines truthful titles/descriptions and indexing for ten routes. `PageMetadata.php` serves PHP metadata, and `scripts/generate_page_metadata.py` generates crawler-readable static demo entries for Vercel. Exact rewrites precede the generic demo fallback. Public showcase routes appear in the sitemap; signing/admin/customer views use noindex. Removed the legacy unverified Person entity from the static bootstrap. `sync_site_entrypoints.py` regenerates metadata before copying entrypoints.
- **WMS labels:** real CODE128 SVGs encode the selected SKU. Dedicated 100×75 mm print surface contains only the product label, with bounded name space and fixed barcode/metadata areas. Print state is cleared afterward. Preview respects the existing design.
- **Booking overlay:** a selectable date rejects past/invalid dates, required contact fields reject whitespace, and selected-zone styling follows the radio value. Unique reservation IDs and the chosen date/time/zone/guest count persist in browser storage and appear in the admin list after refresh. QR encodes that reference and schedule, without name/phone. Storage/generation failures do not issue a success ticket. Existing Thai date strings remain readable alongside new ISO dates. The ticket explicitly identifies this as browser-local demonstration data, not a venue booking.
- **Loading feedback:** present in the initial HTML before the app script; clears after actual initialization or iframe load. Script failures expose retry; a slow iframe offers retry after 12 seconds and clears when loading eventually completes. Back navigation stays available. No artificial startup delay; reduced-motion styling supported. Replaces the unused timed skeleton helper.

External shop and venue website sources were not changed. Booking edits concern this repository's local overlay. Existing homepage design, 15,000-baht entry pricing, estimator, CRM, POS and Shipping logic remain.

## Verification and evidence

Playwright CLI Chromium was used because in-app browser access had previously been policy-blocked. Evidence is local under ignored `output/affordable-pricing/`.

- `finish-verify.js`: WMS preview/print/cleanup, mobile fit, booking validation, persistence, actual ticket data/admin/refreshed state; no JavaScript errors.
- `finish-edge.js`: selected radio styling, denied storage, unique booking references, missing boot script recovery, seven local demo initializations and correct local 404 without a stale loading card.
- `loading-verify.js`: real app request held/released, app script aborted, iframe held/released, clock-controlled slow warning and late completion. Iframe test uses a controlled HTML fixture; it does not establish the health of the external site's business functions.
- `finish-responsive.js`: label, booking form and ticket fit 375/768/1440 px; 390 px captures additionally inspected. Homepage estimator still computes 15,000–25,000 and advances through three steps.
- `decode-proof.json`: independent ZXing decode from rendered screenshots returns `EL-001`, `EL-002` and the QR's matching reservation/date/time/zone. The rendered print PDF also decodes to `EL-001`.
- PDF is one page; CSS requests 100×75 mm, Chromium measures approximately 99.82×75.10 mm. The PDF and Thai/Latin label text were rendered and inspected with `view_image`.
- PHP response and generated static HTML checked for title, canonical uniqueness, share image and indexing agreement on all ten configured routes. Share image dimensions and root/public entrypoint identity checked.
- JS/PHP syntax and `git diff --check` passed.

Screenshots of the share card, label, booking form/ticket, admin table and loading/error states were visually inspected. Corrected clipped share-card framing and the old always-highlighted first seating zone before delivery. No physical scanner/thermal printer or real LINE/social-cache preview was tested. The estimator still prepares a brief for manual LINE/email delivery; no external message was sent.

Dependencies are pinned and served locally: [JsBarcode](https://github.com/lindell/JsBarcode) 3.12.3 CODE128 build and [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator/blob/master/js/README.md) 2.0.4, with MIT notices retained in `public/assets/vendor/`.
