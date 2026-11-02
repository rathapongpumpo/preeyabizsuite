# Featured portfolio delivery — 2026-11-02

## Delivered

- Canonical homepage: `/`, featured work: `/#systems`.
- WMS and SmartPOS are the two main case studies, with real runtime screenshots, audience, problem, features, limitations, and three-step trial instructions.
- Native expandable case studies keep the visitor on the same homepage. Four secondary examples have explicit status; Shipping is not promoted with a demo link while its save flow is broken.
- WMS trial uses the existing inbound form, stock and transaction ledger.
- POS trial uses the existing modifier form, simulated payment, receipt and kitchen order. Ten generated menu photographs replace emoji illustrations.
- Both demos have a clear return to the canonical homepage. Mobile document overflow corrected.

## Visual comparison

Reference: `output/portfolio-release/selected-work-concept.png`.
Implementation captures: `output/portfolio-release/selected-work-1440.png` and `selected-work-390.png`.
Generation prompts: `output/portfolio-release/prompts.json`.

| Aspect | Observed result |
| --- | --- |
| Palette | Porcelain background, dark type and cobalt calls to action retained. |
| Composition | Two open alternating image/text rows with divider lines match the concept. |
| Hierarchy | Section heading, numbered work category, benefit heading, trial steps and CTA remain in that order. |
| Photography | POS has ten consistent food and drink images. |
| Product evidence | Actual demo screenshots replace the concept's illustrative dashboard layouts; no invented metrics or client results. |
| Screenshot framing | Complete product panels are shown without cropping table rows or menu items. Actual POS screenshot is taller than the concept. |
| Detail interaction | Accessible native disclosures replace the concept's plain detail link. Secondary work is collapsed to keep the two main works prominent. |
| Mobile | Rows stack with full-width trial buttons. WMS tables scroll internally; the page itself does not overflow. |

## Verification

`python output/portfolio-release/verify_portfolio.py` passed all 29 checks in Chromium.
Results: `output/portfolio-release/test-results.json`.

- WMS seed stock 24 plus inbound 20 becomes 44, with the product present in the report.
- POS creates a receipt and the same order ID appears in the kitchen; guided flow also completes at 390 px.
- Homepage, WMS and POS have no document horizontal overflow at 375, 390, 768 and 1440 px.
- Screenshot assets load, details expand, both demos return home, and static/PHP entrypoints stay synchronized.
- No browser page errors; `git diff --check` passed.
- Final desktop section and mobile kitchen screenshots visually inspected against the concept.
- In-app browser binding was blocked by the browser URL policy; no bypass attempted. Runtime evidence above comes from the local Chromium verification, not an in-app browser observation.

## Scope and limits

Local implementation only; not deployed. These are interactive prototypes with browser-local data and simulated payments, not verified production installations. No real payment, scanner or printer integration is claimed. Food images are generated illustrations; interface captures are actual runtime screenshots. CRM e-sign sync, Shipping save and external Tilt/OAI limitations remain as recorded in the assessment.
