# Clear prototype context — 15 November 2026

Customers should understand that the interactive examples demonstrate possible workflows, rather than define the appearance, functionality or scope of a finished customer system.

## Change

- Added a visible explanation before the example systems on the homepage. Changed the WMS/SmartPOS image captions from “ภาพจากระบบจริง” to “ภาพจากเดโม” and clarified the WMS image description.
- Added a persistent, non-dismissible context panel beneath the demo header: **“เดโม / ต้นแบบสำหรับทดลอง · ไม่ใช่ระบบพร้อมใช้งาน”**. Its explanation says the final screens, functionality and workflows will be adapted to the customer's needs and agreed scope.
- Grouped the existing header and panel in a sticky context container; it reserves layout space and introduces no modal or acceptance step. The PHP template renders the notice before JavaScript. Static fallback pages construct the same notice through the shared app script, without duplicating it.
- Kept the notice limited to demo pages and the homepage's examples section. Real POS/Doctor Lawyer product cards are not marked as prototypes by this change. CRM features, estimator prices and real inquiry/email handling are unchanged.
- Shared styles are in `public/assets/demo-notice.css`; stylesheet cache key `demo-context-2`, app script key `demo-context-1`. The root and public homepages remain identical. All ten static fallback templates include the stylesheet and current script.

## Verification

Evidence and scripts are ignored under `output/playwright/demo-context/`. Checks cover the nine demo routes: CRM, warehouse, SmartPOS, shipping home/admin/customer, storefront, booking and signing.

Final runs passed **258 local checks** (101 notice + 68 CRM + 59 navigation + 30 homepage) and **256 public-domain checks** (99 notice + 68 CRM + 59 navigation + 30 homepage), with zero JavaScript runtime errors. The two extra local checks exercise the generated static fallback, which is not served by the Hostinger PHP deployment.

- Focused notice checks: server-rendered copy, a single notice per document, final-work scope wording, visibility and no document overflow at 320/390/768/1440px, persistent visibility after actual scrolling, homepage positioning, separation from real products, reachable quotation controls, and JavaScript errors. Local checks also exercise the static fallback shell at a clean CRM URL.
- CRM regression: both optional-contract paths, document/signature preservation, cancellation, synchronization, mobile layouts and keyboard interaction.
- Navigation regression: all six demos, exact homepage return, expanded details, retained form values/DOM, Back/Forward, signing handoff and estimator intent.
- Homepage regression: existing header, hero and product-card geometry at 13 widths from 320–1920px; no horizontal overflow; unchanged estimator label and starting price.
- Node syntax, PHP lint, `git diff --check`, identical homepage entrypoints and shared references in generated templates checked. The PHP release archive contains 157 files; only five changed runtime files are published.

Initial live scrolling exposed a sticky-container issue on the warehouse page: an ancestor's horizontal overflow created a separate scroll container. A demo-only `overflow-x: clip` rule fixes this without changing docked CRM scrolling or homepage overflow. The test now uses instant scrolling and waits for animation frames before measuring, avoiding the original smooth-scroll timing false positive.

Desktop/mobile CRM and homepage screenshots were opened for visual inspection. Homepage screenshots await image decoding. Test data stays in isolated browser storage; no real inquiry/email or external message is submitted. Reset/cancellation tests use temporary confirmation acceptance stubs, not an automated native confirmation dialog.

The targeted UI guidance search returned unrelated entries; layout decisions use the skill's general accessibility and non-obstruction defaults, not those search results.

## Release

Published only under `/home/u271733843/domains/buzlike.com/public_html`, verifying the configured SSH host fingerprint, target path, reviewed remote content, staging hashes and published hashes. Five files: `index.html`, `assets/demo-notice.css`, `assets/app.js`, `demo.html`, `index.php`.

The initial release was backed up at `/home/u271733843/buzlike-backups/20261115-092238-before-demo-context`. The scrolling correction compares against the recorded initial deployment hashes before replacing anything. Deployment manifests retain the backup/staging paths. For a complete rollback, restore the original public files from the initial backup; the new stylesheet may remain unreferenced. No database or private inquiry records are modified.

Correction backup: `/home/u271733843/buzlike-backups/20261115-092726-before-demo-context`; final stage: `/home/u271733843/buzlike-releases/20261115-092726-demo-context`. Final production mobile/desktop CRM captures were inspected after the public-domain tests.
