# Clear homepage entry choices

Published to https://buzlike.com/ on 14 November 2026. Implements recommendation 2 from the visitor-convenience review.

Layout was subsequently corrected after user feedback; [the layout repair](LAYOUT_REPAIR_DELIVERY_2026-11-14.md) supersedes the original hero sizing and card-style actions below while retaining the same destinations.

## Delivered behavior

The hero now asks “คุณอยากเริ่มจากอะไร?” and offers:

1. **สนใจระบบ POS** — features/package context; links to `#buzlike-pos` so visitors see product status and the existing product links.
2. **จ้างพัฒนาระบบ** — services and starting guidance; links to `#services`, keeping development separate from POS subscription interest.
3. **ยังไม่แน่ใจ? คุยกับเรา** — direct access to the contact section without an estimator/system selection requirement.

The previous hero demo/estimate actions and secondary POS link were replaced by this deliberate entry choice. Existing header navigation, all demos, development pricing and estimator remain available in their existing sections. This is not the new consultation form or sticky-menu work proposed for later phases.

Added scoped `public/assets/home-entry.css?v=home-entry-1`. Adjusted hero-copy type size/line height and desktop alignment so all three paths are visible without scrolling at the tested viewports. The scene artwork, connector geometry, animation JavaScript and demo navigation implementation were not edited. Root/public homepage copies are synchronized.

## Verification

Local and live each passed **157 checks**:

- **33 entry checks**: all three paths visible above the fold at 320×640, 375×667, 390×844, 768×1024, 901×900, 1024×768, 1440×844; headline/action bounds without horizontal overflow; action heights at least 44px; correct section hashes; keyboard sequence, visible focus and Enter activation; reduced-motion navigation; retained services/prices/product disclosures/demo access; coffee order animation completes; no runtime errors.
- **59 existing core-navigation checks**: six demos at mobile/desktop; original homepage/form identity, exact restored position and focus, Back/Forward, CRM→signature, quote preselection, no lost draft, one homepage document request.
- **65 refresh-resilience checks**: four additional demos at mobile/desktop; web return, Back, refresh-then-return and refresh-then-Back; expanded list and exact position retained.

Desktop/mobile screenshots from the live site were opened and visually inspected. Unique homepage IDs, root/public byte synchronization and `git diff --check` passed.

Ignored evidence: `output/playwright/home-entry/verify-local.txt`, `verify-live.txt`, `core-local.txt`, `core-live.txt`, `resilience-local.txt`, `resilience-live.txt`, `live-hero-1440.png`, `live-hero-390.png`, and `deployment.json`.

No inquiry was submitted, no email sent, and no production POS account/order/payment created. No backend, public product admission or subscription pricing changes.

## Deployment and rollback

- Verified the known SSH fingerprint and resolved `/home/u271733843/domains/buzlike.com/public_html`.
- Verified prior homepage against the reviewed Git baseline and confirmed the new CSS path did not conflict with an existing file.
- Published only `index.html` and `assets/home-entry.css`, staged and public SHA-256 verified, CSS before HTML using atomic replacements.
- Backup: `/home/u271733843/buzlike-backups/20261114-035036-before-home-entry`.
- Staging: `/home/u271733843/buzlike-releases/20261114-035036-home-entry`.
- Rollback: atomically restore the backed-up `index.html`; the new CSS may remain unreferenced. The backup's `release.json` records original/new hashes and the new CSS file. Private inquiry data and other domains were untouched.
- Reproducible full PHP archive: `output/playwright/home-entry/hostinger-release.zip` (152 files; no credentials).
