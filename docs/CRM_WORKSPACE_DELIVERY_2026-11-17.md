# CRM workspace redesign — 17 November 2026

Reworked the existing CRM demo into a sales workspace with clear navigation, hierarchy and customer/deal cards. The product remains a browser-local prototype, with the persistent explanation of its limits and the final-work scope intact.

## Delivered

- Dark sidebar with four actual views, a restrained purple accent and the existing Thai fonts/SVG sprite. Mobile uses a compact horizontal menu. Styling is scoped in `public/assets/crm.css` to the CRM workspace and its signing module.
- Overview shows current open deals, weighted value, closed sales, customer count, stage-value bars and prioritized open deals. All numbers come from the existing store; no fabricated growth trends or targets were added.
- Pipeline has clearer customer initials, stage counts/values, next actions and closing probabilities. Mobile stages stack vertically. Deal cards can be opened with Enter/Space as well as pointer input; drag/drop closing requirements are preserved.
- Quotation has document hierarchy, customer context, restrained contract-choice controls and a clear total. On phones, line items display as labeled cards instead of requiring horizontal table scrolling. Native table headers remain available to assistive technology.
- A customer selector switches the current deal while retaining the quotation/contract view. The customer sidebar remains available on larger screens. Added support for `tab=overview` in existing deal deep links.
- Contract and signing screens use coordinated document styles. Existing snapshots, signatures, approval requirements, cancellation, reset safeguards and storage keys remain compatible.
- Updated the product catalog image and CRM detail preview to a screenshot of the actual redesigned Pipeline, including the prototype notice. New asset: `public/assets/portfolio/crm-workspace.webp`, 1440×1000, 54,708 bytes. Old images remain for reversibility.

Cache key for the shared app and new stylesheet: `crm-workspace-1`. PHP/static templates include the new stylesheet; all ten static fallback templates have the matching app version and CRM registry entry. Root/public homepages remain byte-identical. Homepage/CRM sitemap dates advance to 17 November; unrelated dates remain unchanged. No price configuration, inquiry/email backend, private database or other product application was changed.

## Verification

Evidence lives under ignored `output/playwright/crm-redesign/`:

All five main suites passed **330 checks locally and 330 through the ordinary public domain**, with zero JavaScript runtime errors. Final production desktop/mobile captures were inspected after those runs.

- **114 visual/interaction checks:** all four CRM views at 12 widths from 320–1920px, sidebar/main containment, reachable navigation, no document overflow, vertical mobile boards, responsive quote line items, keyboard deal opening, customer switching in quotation/contract views, customer addition, recalculated metrics, overview deep link, intended primary-button colors, reduced motion and prototype context.
- **68 CRM workflow checks:** quote-only and contract-required sales, drag/drop prerequisites, approved snapshot amounts, actual drawn signature and signer validation, correct-deal return, signed-record locking, cancellation and tab synchronization, legacy records, data-preserving reset, stale/mismatched links, responsive views and keyboard choice controls.
- **59 navigation checks:** all six demos on mobile/desktop, exact homepage return, expanded details, retained draft/DOM/focus, Back/Forward, CRM/signing handoff, estimate intent and modified-click behavior.
- **59 catalog checks:** prototype wording, image containment and non-overlapping layout at 13 widths, new CRM entry/return via button and browser Back, preselected CRM estimate with retained draft, keyboard order, fresh-tab estimate selection and no additional homepage requests during card journeys.
- **30 homepage checks:** existing header, hero and preceding product-card geometry at 13 widths, no overflow and unchanged estimator configuration.

Additional local prototype-context suite passed 101 checks across nine demo routes, including the static fallback. Browser tests use isolated sample storage; no real inquiry/email or external message is submitted. Confirmation acceptance in cancellation/reset checks uses a temporary test-only stub and does not claim native-dialog automation.

Desktop/mobile overview, Pipeline, quote, contract and mobile line-item screenshots are opened for visual inspection. Node syntax, PHP lint, `git diff --check`, identical home entrypoints, generated registry/cache references and a 160-file PHP release package are checked separately.

## Release and rollback

Published only to the `buzlike.com` domain, verifying the configured SSH host fingerprint, exact public/source paths, existing remote files against Git HEAD, staging hashes and final published hashes.

- Public root: `/home/u271733843/domains/buzlike.com/public_html`
- Source root: `/home/u271733843/domains/buzlike.com/src`
- Backup: `/home/u271733843/buzlike-backups/20261117-095420-before-crm-redesign`
- Stage: `/home/u271733843/buzlike-releases/20261117-095420-crm-redesign`
- Eight published files: homepage, CRM stylesheet, shared app JS, new screenshot, source project registry, sitemap, static fallback template and PHP template.

Backup paths preserve repository prefixes. Restore `public/*` under `public_html/` and `src/*` under the domain source directory, with assets/configuration before templates. New CSS/image may remain unreferenced. This release does not alter server-side customer/inquiry data or make CRM a production service.
