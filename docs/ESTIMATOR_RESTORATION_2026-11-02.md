# Restored selection, comparison and estimator — 2026-11-02

The homepage redesign had left the former portal renderer unreachable and redirected pricing/estimator bookmarks to generic sections. This restores those capabilities directly in the canonical homepage, keeping the existing hero and demo pages.

## Restored

- Header/mobile navigation and hero link to real `#pricing` and `#estimator-form` sections.
- Three service packages and an expandable comparison table using the original published price bands: Customize 35,000–75,000 baht, Custom 80,000–250,000+ baht, Retainer from 25,000 baht/month.
- Six selectable system categories; multiple selections and three development models update price/time using the original estimator ranges. Budget preference adds a scope-discussion hint without pretending to change the actual estimate.
- Required contact fields, optional email and project notes, browser-local draft and clear action. Mobile shows price feedback beneath system choices and the full summary after contact fields; desktop uses the existing two-column design language.
- Brief generation, exact-text clipboard copy with manual fallback, and a composed mailto. LINE opens for the visitor to paste/send the brief themselves. No API delivery or received-message claim is made.
- Demo quote CTAs include `interest` and target the estimator. URL preselection overrides a previous draft correctly. Old hash-query estimator links and pricing bookmarks remain usable.
- Comparison table scrolls within its own region on narrow screens, with a visible instruction and sticky row labels.

No About section or external-storefront changes were restored. Unsupported fixed warranty/SLA promises were not reintroduced; actual scope and support terms are confirmed in each proposal.

## Evidence

`output/estimator-restoration/verify.js`: 44 checks passed in local Chromium using Playwright CLI. Checks cover all original pricing branches, validation, actual prepared data, email contents, draft restoration, stale-query preselection, old bookmarks, real CRM/POS CTA round trips, menu dismissal, every local anchor, and responsive layout at 375/390/768/1024/1440 px. No JavaScript errors or form POST requests.

Two additional clipboard checks used controlled stubs to verify exact copied content and truthful manual fallback on failure. No message/email was sent, and no real system clipboard was read. Final desktop/mobile screenshots were visually reviewed, including the price cards and interactive estimate. Evidence remains local under `output/estimator-restoration/`.

Existing source layout and component styling were used for feature restoration, without generating replacement artwork or changing the approved hero. Browser verification used local Chromium because prior in-app browser access was policy-blocked. JS/PHP syntax, whitespace and static-entrypoint synchronization checked.

The local PHP server was restarted as a managed tool session after the background-launch command was policy-blocked. It listens only on 127.0.0.1:8080.
