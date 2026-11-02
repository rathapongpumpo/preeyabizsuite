# Affordable pricing and three-step estimator — 2026-11-02

Supersedes the pricing and single-page estimator described in `ESTIMATOR_RESTORATION_2026-11-02.md`. The user set the entry price at approximately 15,000 baht. This is scoped starting work, not a promise to deliver every selected business system for that amount.

## Active rates

One `rates` object in `public/assets/estimator.js` drives card/table starting prices, the estimate, mobile feedback and prepared brief.

| Model | Selected categories | Estimate | Time |
| --- | --- | --- | --- |
| Adapt a template | 1 | 15,000–25,000 baht | 2–3 weeks |
| Adapt a template | 2 | 25,000–40,000 baht | 3–4 weeks |
| Adapt a template | 3–6 | 40,000–65,000 baht | 4–6 weeks |
| Custom development | 1–2 | 35,000–65,000 baht | 4–8 weeks |
| Custom development | 3–6 | 65,000–100,000+ baht | 6–10 weeks |
| Ongoing development/support | 1–6 | 5,000–12,000 baht/month | Monthly scope |

Public reference offers reviewed: [Web24hr](https://www.web24hr.com/pricing/) advertises a 9,900-baht landing page; [Vectorkub](https://vectorkub.com/services/web-development) advertises web development from 14,900 baht. These are examples of advertised entry offers, not a market average or equivalent scope to a complete business backend. The actual pricing decision follows the user's 15,000-baht instruction and bounded scope.

## UX and retained behavior

1. Select one or more of the existing six system categories.
2. Select development model, optional budget and project notes.
3. Add contact details, generate a brief, review/copy it or open email/LINE.

Only the active panel appears. Back/visited-step controls retain data; future steps are gated. Name and phone/LINE are required; email is optional and validated when entered. Whitespace-only required values are rejected. Local draft restoration retains the step, model, selections and contact fields. Older drafts retain valid values; obsolete budget IDs fall back to discussing scope. URL interest preselection overrides previous selections and starts at step 1. Proper query and legacy hash-query links work, including same-document hash navigation.

Package CTAs select the intended model and continue to step 2 when systems are already selected. A low budget adds a discussion hint rather than falsifying the estimate. Price units distinguish project work from monthly service. Comparison remains expandable and internally scrollable on mobile. No About section, external shop changes, unsupported testimonials or automatic message sending were introduced. Existing hero and business demos remain in place.

## Functional verification

Local Chromium via Playwright CLI, `output/affordable-pricing/verify.js`: all checks passed. Covers every rate branch, card/table agreement, empty selection, step gating/back, required contact and email validation, actual brief text, exact mail body, controlled clipboard write, safe user-text handling, draft reload, query override, plan CTAs, clearing, legacy links and the real CRM quote CTA.

Each step and the comparison were checked at 375, 390, 768, 1024 and 1440 px: no document overflow. Mobile navigation reaches and dismisses correctly. No JavaScript errors or automatic form POSTs. Clipboard verification used a stub; no customer message or email was sent. JS syntax, whitespace and byte-identical root/public entrypoints passed. Browser testing used the established local Chromium fallback because in-app browser access had previously been policy-blocked.

## Visual fidelity ledger

Concepts and prompts are retained locally under `output/affordable-pricing/`: `concept-pricing.png`, `concept-wizard.png`, `concept-prompts.json`. They were generated before implementation using the frontend-app-builder/imagegen workflow. The latest browser captures were inspected with `view_image` alongside both concepts, including native-size viewports 1778×885 and 1774×887, plus desktop 1440 and mobile 390 captures. Steps 2 and 3 were also captured and inspected.

| Comparison | Concept evidence | Render evidence and disposition |
| --- | --- | --- |
| Pricing hierarchy | Three equal white cards, large 15k/35k/5k amounts | `pricing-1440.png` and `native-pricing.png`: aligned cards, feature rows, prices and bottom CTAs |
| Palette and surfaces | Cool #f7f8fa background, #131820 ink, #3155f5 accent, fine borders | Existing site tokens preserved; white cards and blue selected states match the concept without extra gradients/images |
| Wizard composition | Three numbered steps, two-column selection tiles, right summary with top blue rule | `wizard-preview-1440.png`: same component hierarchy, live numbered selections and prominent range |
| Typography | Thai sans, bold headings and prices, muted helper text | Existing IBM Plex Sans Thai retained; computed choice label 16px/600. Type scale and max-width intentionally follow the surrounding homepage rather than stretching to the concept image edges |
| Copy | Pricing titles/prices/CTAs and three-step heading | Section intro and pricing copy match; original short system labels/descriptions intentionally retained rather than generated claims. Above-section hero/nav copy unchanged |
| Icon and state treatment | Blue check circles, checked square controls, numbered step/summary circles | Native accessible checkboxes and CSS circle checks preserve the visual meaning; text arrow glyphs retained from the existing site/concept |
| Spacing and mobile | Repeated rounded cards and generous gaps | `pricing-390.png`, `wizard-390.png`, `step-2-390.png`, `step-3-390.png`: single-column adaptation, no clipped controls; mobile summary follows choices/fields |
| Functional additions | Concept depicts step 1 | Steps 2/3 reuse the same shell. Existing mobile price feedback, draft status, validation and clear/back controls are retained necessities |

The implementation was visually verified against the generated design direction. Intentional differences are the existing homepage container/type scale, retained truthful system descriptions and functional validation/draft controls. No unresolved material clipping, misalignment or overflow was found. Native viewport captures show the existing narrower site container, as intended.

Evidence is local and ignored by Git; product code and this handoff are committed. These checks establish browser behavior for the static estimator, not backend quote delivery or guaranteed project scope.
