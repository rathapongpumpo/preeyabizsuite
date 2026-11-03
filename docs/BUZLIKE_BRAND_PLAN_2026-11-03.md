# BUZLIKE brand migration — implemented

Latest user correction: the full public name is **BUZLIKE SYSTEMS**. The rounded B has been replaced by the angular two-part mark in `src/BrandMark.svg`; see `BUZLIKE_SYSTEMS_IDENTITY_2026-11-03.md` for the published revision.

Approved by the user and deployed to https://buzlike.com/ on 2026-11-03. All four implementation slices below are complete. See `BUZLIKE_BRAND_DELIVERY_2026-11-03.md` for live verification and backup details. The proposal below records the agreed scope.

Confirmed by the user: brand/domain `buzlike.com`; public contact email `support@buzlike.com`.

Before implementation, live inspection on 2026-11-03 found PREEYA SYSTEMS in the homepage title/header/footer and the old Gmail address in contact links. These surfaces and demo metadata now use BUZLIKE and the confirmed contact email.

## Public identity

| Surface | Proposed value/action |
| --- | --- |
| Main brand | BUZLIKE |
| Service descriptor | เว็บไซต์และระบบสำหรับธุรกิจ |
| Homepage title | BUZLIKE \| เว็บไซต์และระบบสำหรับธุรกิจ |
| Contact label and mailto | support@buzlike.com / mailto:support@buzlike.com |
| Prepared inquiry heading | สรุปโจทย์ขอใบเสนอราคา — BUZLIKE |
| Canonical origin | https://buzlike.com |
| Brand symbol | A coordinated B mark for the header, favicon and hero backdrop |

## Implementation slices

1. **Visible identity:** header, footer, accessible names, demo shell titles and branded document/inquiry headings. Replace the P monogram and large P in the coffee-flow backdrop with a coordinated B symbol. Preserve the approved colors, photography, panel dimensions and flow connections; inspect desktop and mobile captures before release. Re-capture the share card from the final UI.
2. **Contact:** update the visible address, every company contact mailto and the estimator's dynamically generated recipient. Test the actual composed recipient, subject and body. A mailto opens the user's email client; this does not add automatic email delivery or SMTP access.
3. **Common configuration:** put brand, contact email and public origin in one configuration consumed by PHP, frontend generation and metadata generation. Keep existing storage identifiers so the rebrand preserves drafts/demo state on the same origin. Product/demo names such as NexusWMS and SmartPOS can remain; external demo artwork and third-party websites are outside the rebrand.
4. **Domain publication:** update canonical/OG/Twitter URLs on all nine demo routes. Remove preview noindex from public showcase pages at both HTTP and HTML levels while preserving intentionally unindexed signing/admin/customer views. Redirect www to the apex host with path/query intact; recheck robots and sitemap, which already use buzlike.com.

Do not invent a legal company name, registration, team credentials, client results or an About section. The user subsequently approved implementation and hosting publication.

## Acceptance evidence

- Inspect the company identity on homepage, demo details, quote brief, sample documents, favicon and share image.
- Assert no old public company identity or old contact recipient remains on these surfaces; distinguish historical/internal keys and sample-person data from company branding.
- Verify support@buzlike.com in the generated mailto without sending a message or reading the mailbox.
- Recheck the 15,000-baht starting estimate, multi-selection, draft persistence, demo round trip, coffee-flow geometry and mobile navigation.
- Verify live metadata/indexing/redirects after deployment; source checks alone are insufficient.
