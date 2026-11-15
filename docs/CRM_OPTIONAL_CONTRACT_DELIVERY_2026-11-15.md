# CRM with optional contracts — 15 November 2026

Corrects the previous removal of the CRM contract module. The user clarified that removing an independent product must not remove a feature belonging to another system. CRM remains one system; contracts and signing are optional steps within it.

## Delivered behavior

- Restored the contract tab, approved-quotation document snapshots, deal-specific signing handoff, signature badges, signing record and return to the same CRM deal/tab.
- Each quotation offers “ไม่ใช้สัญญา” or “ต้องลงนามสัญญา”. New deals default to no contract. Existing snapshots infer required signing unless an explicit per-deal choice exists. An unsigned document can be disabled/re-enabled without deleting it; changing the choice after signing or closing is blocked.
- Without a contract, approving the quotation enables closing the sale and creates no document. With a contract, approving creates its snapshot and signing enables closing. Pipeline drag/drop enforces the same conditions; signing alone does not close a sale.
- Added a start button on the CRM overview and a responsive four-step workflow on quotation/contract views. The contract choice appears before the quotation table; status labels are Thai and sending is explicitly simulated.
- Signing cancellation affects only that document and returns its closed deal to follow-up. Storage events update other open CRM tabs without render-time writes/feedback loops.
- Reset now retains document-linked customers, quotations, activities, snapshots and signature records. Reset returns only other sample deals to their initial state; its confirmation explains this behavior.
- Updated homepage description, CRM detail registry, metadata, preview, static fallback/routes and README. E-Signature remains unlisted/noindex with no separate conversion bar; its visible name identifies it as a CRM module. Removed an unsupported PDF-generation highlight from this module's registry.
- Price configuration and inquiry/email backend are unchanged. No standalone contract product was added. No homepage header, hero, POS, lawyer or warehouse-card layout was changed.

## Verified

Both local and ordinary public-domain browser runs passed **157 checks each**:

- **68 CRM checks:** both sales paths, approval/signature prerequisites, drag/drop enforcement, choosing a contract before/after approval, preserving/reusing documents, disabled stale signing links, required signer validation and clearing the signature, actual drawn PNG recording/display, same-deal return, signing audit, closing, cancellation, synchronization across open tabs, legacy snapshot inference, data-preserving reset, invalid document links, keyboard operation, all four CRM views at seven widths from 320–1440px, unsigned signing at four widths, and no JavaScript runtime errors.
- **30 homepage checks:** existing header/hero/POS/lawyer/warehouse geometry matches the baseline at 13 widths from 320–1920px, no horizontal overflow, optional-contract copy, no standalone contract product, unchanged CRM estimator label/base price, no runtime errors.
- **59 navigation checks:** all six demos at mobile/desktop widths; exact homepage return position, expanded details, retained form/DOM/focus, browser Back/Forward, CRM-to-signature handoff, estimate intent and modified-click behavior. Normal journeys requested the homepage document exactly once.

Tests used isolated QA browser storage. No real inquiry, email, contract or external message was submitted. Reset/cancellation acceptance used a temporary `window.confirm` stub restored immediately afterwards; the native confirmation dialog itself was not automated. Desktop/mobile quotation, contract and unsigned-signing screenshots were opened for visual inspection; a capture made before signing finished loading was replaced with a settled capture.

Node syntax, PHP lint, `git diff --check`, root/public homepage byte equality, PHP/static registry parity, cache references in all ten static templates and unchanged price configuration passed. The updated 1200×750 WebP preview is 44,076 bytes. Hostinger packaging contains 156 files; only the eight changed runtime files were deployed.

Evidence is ignored under `output/playwright/crm-optional-contract/`: focused/core/geometry local/live result JSON and CLI logs, screenshots, release archive and deployment manifest. App/CSS cache key: `crm-optional-1`; navigation stays `home-return-2`.

## Release and rollback

Published only to `buzlike.com`, verifying the configured SSH host fingerprint, exact public/source directories, every existing remote file against Git HEAD, staged hashes and final published hashes.

- Public root: `/home/u271733843/domains/buzlike.com/public_html`
- Source root: `/home/u271733843/domains/buzlike.com/src`
- Backup: `/home/u271733843/buzlike-backups/20261115-090714-before-crm-optional-contract`
- Stage: `/home/u271733843/buzlike-releases/20261115-090714-crm-optional-contract`
- Files: `public/index.html`, `public/assets/app.css`, `public/assets/app.js`, `public/assets/demo-previews/business-suite-workflow.webp`, `public/demo.html`, `public/index.php`, `src/ProjectRegistry.php`, `src/PageMetadata.json`.

Backups preserve `public/` and `src/` prefixes. Restore public assets under `public_html/` and source files under the domain's `src/`, with assets/configuration before templates. The new preview may remain unreferenced. No server database or private inquiry records were changed.

## Product boundary

This is a browser-local demonstration, not a production CRM or remote signing service. It has no CRM authentication, central persistence, cross-device signing or external identity verification. Those require a separate implementation phase before offering a ready-to-use service. Existing public inquiry delivery is a separate, unchanged feature.
