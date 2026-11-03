# BUZLIKE SYSTEMS — identity revision

Latest visual correction: the hero monogram is now a faint watermark with clear arrow lanes; see `FLOW_CLARITY_2026-11-03.md`. The header mark and full brand name below remain unchanged.

Published to https://buzlike.com/ on 2026-11-03 following the user's correction.

- Full public name: **BUZLIKE SYSTEMS**, generated from `src/SiteConfig.json` across homepage, demo metadata, prepared inquiries, and sample receipts/invoices. Domain and email stay `buzlike.com` and `support@buzlike.com`.
- Replaced the rounded B with an angular mark composed of two cutout shapes. The header, favicon and coffee-scene monogram share `src/BrandMark.svg`; `scripts/sync_site_entrypoints.py` generates the public variants.
- Strengthened wordmark typography. The hero uses the same vector with a blue gradient and thin offset outline; panels, photographs, flow routing and timing were preserved.
- New share image: `/assets/portfolio/share-buzlike-v2.png`. Page asset references and favicon links use `buzlike-2` to avoid stale CDN/browser assets.

## Verified

- Real desktop/mobile captures inspected at 1440 and 390 px; additional 320 and 1024 px captures have no document overflow.
- Brand regression passed 14/14 on the published site: full name, prepared email, sample documents, draft/POS persistence and coffee-flow totals/geometry.
- Normal-motion coffee flow passed 4/4: completes correctly, panels stay fixed across 84 samples, and connector paths remain unchanged.
- Live HTTP checks passed 20/20: metadata for homepage and all 9 demo routes, index directives, redirects and versioned assets. Share-image pixel comparison accounts for Hostinger's lossless PNG recompression.
- The final static demo bootstrap matches the local source after normalizing line endings; primary, shortcut and touch-icon references all use the new versioned favicon.
- PHP and JS syntax checks and `git diff --check` passed. Published files were verified against the staged manifest (139 files).

Evidence: `output/playwright/buzlike-systems/` contains `local-result.json`, `live-result.json`, `live-flow-result.json`, `http-results.json`, `html-result.json`, `live-home-desktop.png` and mobile/document captures.

Backup before this revision: `/home/u271733843/buzlike-backups/20261103-082114-before-systems-mark`. Release staging: `/home/u271733843/buzlike-releases/20261103-systems-mark`.
