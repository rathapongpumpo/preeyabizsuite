# Remove contract/signing from the sales offering

> Superseded by `CRM_OPTIONAL_CONTRACT_DELIVERY_2026-11-15.md`. Removing the contract module from CRM was an overbroad interpretation of the user's request. The corrected implementation retains CRM and restores contract/signing as an optional step, without a separate product listing. The implementation and validation below describe the historical release only.

Published on 15 November 2026 following the user's decision to stop offering the contract system.

The homepage CRM description, estimator, demo details, metadata, conversion bar and preview now describe customer tracking, Pipeline, quotations and closing sales. CRM retains three tabs: overview, Pipeline and quotation. The contract tab, signing handoff and signature badges were removed from that customer journey. Approving a quotation enables closing the deal directly.

## Implementation and compatibility

- Kept the `crm` estimate identifier and all pricing unchanged. Updated its name to “ลูกค้าและงานขาย” in `src/EstimateConfig.json`, generated browser config and the form. The inquiry backend reads the same source configuration, so its label stays consistent without changing submission logic.
- Removed the CRM contract-rendering code and new contract snapshot creation. Existing `contract` stage IDs are retained for compatibility and displayed as “ติดตามผล”. Legacy saved contract views and `tab=contract` links open the quotation view.
- Existing document snapshots and the signature registry are preserved when opening old deals, changing quotation status and resetting the CRM sales demo. CRM reset now resets customers/quotes while retaining the archived document map and signature registry.
- The old `/e-signature` route remains as an unlisted, noindex archive for existing links/data, with no sales conversion bar. The archive can still display an existing signed document. This release removes it from the offering and CRM journey rather than deleting browser records.
- Updated PHP and static demo registries, page metadata, static route outputs and the homepage copy. Used `crm-sales-1` cache keys for the changed app and estimate configuration. Added a new real 1200×750 CRM preview (`business-suite-sales.webp`, 48,912 bytes) showing the three sales tabs; kept the old image for reversibility.
- No CSS or homepage product-card structure changed. General development-service terms, bug warranty and pricing were not changed.

## Validation

- **79 focused checks passed locally and through the public production domain:** existing header/hero/POS/Doctor Lawyer/warehouse geometry matched the pre-change baseline at 13 widths (320–1920px); no homepage horizontal overflow; homepage and estimator text/config/summary are sales-only; CRM metadata and detail popover match; all three CRM views have no contract/signing entry and fit five viewport widths; approve/close updates the won stage; approval creates no document; old saved stage labels and contract-view URLs are compatible; document/signature data survive quote actions and CRM reset; a seeded old signed-document link remains readable with no conversion CTA and noindex metadata; sales still close after reset; keyboard tab order works; no JS runtime errors.
- **59 core navigation checks passed locally and live:** all six demos on mobile/desktop, exact reading position, expanded details, retained form values/DOM, browser Back/Forward, sales approval/closing and CRM quote intent. Normal journeys required exactly one homepage document request. The previous signing-handoff assertions were replaced with sales-only behavior assertions.
- Reset acceptance was exercised in an isolated QA browser using a temporary confirmation-acceptance stub, then the native confirm function was restored. No real inquiry/email, account, payment or legal question was submitted.
- Opened and inspected the new preview and live desktop/mobile CRM screenshots. Root/public homepages are byte-identical. Generated estimate config equals its source; all static demo route registries match the updated CRM definition and app cache key. Node syntax, PHP lint, `git diff --check` and Hostinger packaging (155 files) passed.

Evidence: ignored `output/playwright/remove-contract-offer/` contains `baseline.json`, focused and core local/live result files, screenshots, preview capture and `deployment.json`.

Initial public verification encountered a DNS resolution failure on the test machine. Public DNS responses and direct-origin HTTPS were healthy; subsequent ordinary DNS/HTTPS and both public-domain browser suites passed. No DNS, hosts-file or network configuration was changed.

## Release and rollback

Verified SSH host fingerprint, public/source directory mappings and every existing target file against Git before staging. Backed up existing files, uploaded the new screenshot, published assets/configuration before templates and verified public hashes.

- Domain root: `/home/u271733843/domains/buzlike.com`
- Public root: `/home/u271733843/domains/buzlike.com/public_html`
- Backup: `/home/u271733843/buzlike-backups/20261115-075321-before-remove-contract-offer`
- Staging: `/home/u271733843/buzlike-releases/20261115-075321-remove-contract-offer`
- Published ten files: homepage, PHP demo template, static fallback template, app JS, browser estimate config, source estimate config, source project registry, source metadata, sitemap and the new preview.
- Backup paths preserve repository prefixes: restore `public/*` under `public_html/*`, and `src/*` under the domain's `src/*`. Restore assets/configuration before templates; the new preview may remain unreferenced. No database or private inquiry records changed.

Any next CRM catalog card should describe customer tracking and quotations only, without contract or signing claims.
