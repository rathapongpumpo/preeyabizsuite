# Doctor Lawyer product card

Published to https://buzlike.com/#doctor-lawyer on 15 November 2026, following the user's instruction to add Doctor Lawyer first.

Added a product article to the existing homepage catalog. It uses the live product name “ดอกเตอร์ลอว์เยอร์”, a real screenshot, a short description, trial status, and an “เปิดผู้ช่วยกฎหมาย” link to https://lawyer.buzlike.com/ in a new tab. The secondary link reaches the existing contact section. No pricing, quota promise, new menu item or application login route was invented.

The article reuses the existing responsive card structure. Its blue treatment is scoped to `.product-card--lawyer`; original POS styles and the hero are unchanged. The 1280×720 screenshot is a 41,034-byte WebP, loaded lazily in a reserved frame with `object-fit: contain` to avoid stretching. The stylesheet cache key is `lawyer-product-1`.

This is an incremental catalog addition, not a statement about the total number of BUZLIKE products. The wider catalog plan remains in `LAWYER_PRODUCT_INTEGRATION_PLAN_2026-11-15.md`.

## Validation

- **118 focused browser checks passed locally and live:** 13 viewport widths from 320 to 1920px; header and hero geometry compared with a pre-change baseline; original POS coordinates/dimensions unchanged; separate cards with no horizontal overflow; text/image/actions contained and nonoverlapping; isolated colors; touch targets; real screenshot dimensions and aspect handling; unique IDs and heading structure; trial status; a real external-tab click with `noopener`; retained homepage identity/scroll; keyboard contact navigation; fresh direct links to `#products`, `#buzlike-pos` and `#doctor-lawyer`; deliberately delayed screenshot loading without shifting the card or following section; no JavaScript runtime errors.
- **59 existing demo-return checks passed locally and live:** all six demo routes on mobile and desktop, exact scroll restoration, expanded details, retained input/form DOM, focus, Back/Forward, CRM/signature handoff and quote selection. The normal sequence made exactly one homepage document request.
- Opened and inspected local and live screenshots on desktop and mobile.
- Root/public homepages are byte-identical; `git diff --check` passed. Hostinger packaging passed with 153 files.

Evidence: ignored `output/playwright/lawyer-product-release/baseline.json`, `verify-local.txt`, `verify-live.txt`, `core-local.txt`, `core-live.txt`, `local-doctor-*.png`, `live-doctor-*.png`, `lawyer-source.png`, and `deployment.json`.

The first live regression run timed out when clicking the CRM quote CTA after returning from signature. A direct retry of that CTA worked. The verification harness was then strengthened to wait for the iframe's actual URL, complete document state and navigation helper before interacting after transitions; the full rerun passed. The original attempt is retained as `core-live-first-attempt.txt`. No product navigation source code was changed for this verification adjustment.

No legal question, registration, OTP, inquiry, email, POS order or payment was submitted. This change does not assess AI-answer accuracy or modify the independent lawyer/POS applications. The separate proposed backlink inside the lawyer application was not part of this homepage-only release.

## Release

Verified SSH host fingerprint, resolved deployment path and both existing files against the Git baseline; confirmed the new image did not already exist. Staged the complete patch and backed up the previous files before publishing assets first and HTML last with atomic per-file replacement and public hash verification.

- Target: `/home/u271733843/domains/buzlike.com/public_html`
- Backup: `/home/u271733843/buzlike-backups/20261115-063925-before-lawyer-product-release`
- Staging: `/home/u271733843/buzlike-releases/20261115-063925-lawyer-product-release`
- Published: `assets/portfolio/doctor-lawyer-product.webp`, `assets/pos-product.css`, `index.html`.
- Rollback: restore the backed-up stylesheet and homepage atomically, asset first. The new screenshot may remain unreferenced. No database or private inquiry files changed.
