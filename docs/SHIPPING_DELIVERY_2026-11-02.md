# Shipping delivery — 2026-11-02

## Completed

- New package registration and status changes now persist using the shipping store's actual `s.save()` instead of an undefined helper.
- One shared demo tariff is used by the calculator, package preview and saved shipment: Air uses `max(actual kg, width*length*height/5000)*350`; Sea uses `max(actual kg*180, CBM*8500)`. Final shipping fee is rounded to whole baht, with full CBM precision retained until calculation.
- Invoice uses the saved shipment price and displays its calculation basis. Legacy shipments keep their saved fees and are labelled as historical stored-price entries rather than silently repriced.
- Numeric validation rejects zero/negative dimensions or weight, invalid duties and out-of-range prices. Dimension separators `x`, `X` and `×` are supported. Duplicate tracking is rejected; customer IDs are normalized.
- Status and timeline persist across reload; moving a shipment backwards removes future timeline markers. Customer portal shows the saved price and current status.
- Fixed mobile Invoice overflow caused by global table minimum width and intrinsic receipt sizing. Homepage now links to the tested Shipping demo.
- Rates, duties and Invoice are labelled as prototype data. No external notification or financial transaction was performed.

## Verification

`output/shipping-delivery/verify.js` passed **51 checks** in isolated local Chromium through Playwright CLI:

- Calculator → preview → registration → persisted fee → Invoice parity for Air and Sea, using both weight-dominant and volume-dominant cases, plus fractional dimensions.
- Sea 1 CBM / 1 kg: shipping 8,500 + duty 250 = 8,750 baht. Air 1 CBM / 1 kg: shipping 70,000 baht.
- Initial calculator defaults computed immediately, invalid and duplicate inputs, full CBM precision, persistence, unchanged legacy fees.
- Status advance and reversal, customer lookup, matching total and timeline.
- Admin, package form, Invoice and customer portal at 375/390/768 px without document/modal horizontal overflow.
- No browser JavaScript errors. Desktop/mobile Invoice and mobile package-form captures visually inspected. JS/PHP syntax and whitespace checks passed.

This fixes previous audit F06/F07 within the prototype. No real freight tariff, customs assessment, production backend, real payment, physical printer or LINE delivery was verified. Invoice print layout remains separate from the earlier POS 80 mm receipt work.

## Release sequence

The preceding homepage/POS/CRM batch was pushed to `origin/main` as `d14f36d`. A direct CLI Vercel deployment was blocked with `TEAM_ACCESS_REQUIRED` because the existing commit author lacked project deployment permission. The user then explicitly instructed to use Git push only; no permission bypass or author spoofing was performed. Push success is not evidence that the production alias has updated.

Shipping changes follow in a separate commit after these checks. Test artifacts remain excluded from Git; the reproducible test file is retained locally under `output/`.
