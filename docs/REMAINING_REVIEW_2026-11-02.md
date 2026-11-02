# Remaining work after affordable pricing

**Resolved:** all four items below are implemented and locally verified in [DEMO_POLISH_DELIVERY_2026-11-02.md](DEMO_POLISH_DELIVERY_2026-11-02.md). The findings below preserve the pre-fix review.

Read-only product review, 2026-11-02, checkout `3112f92`. No product changes or push in this review.

## Prioritized findings

1. **Homepage link sharing and metadata.** Anonymous production Chromium check confirms no canonical link and zero Open Graph tags on `/`. The demo bootstrap still contains older portfolio titles/metadata and a homepage canonical for all demo routes. The public sitemap has August 7 modification dates. Prepare a homepage share image/title/description, canonical and deliberate metadata/indexing for each route; regenerate sitemap from published routes and genuine modification dates. An absent canonical is not itself proof of an indexing failure, and no actual LINE preview was measured.
2. **WMS label accuracy.** `public/assets/app.js` label markup contains `.barcode-lines-sim`, a visual pattern rather than an encoded SKU. Its button invokes generic `window.print()`. Implement actual encoded labels and a dedicated sticker print surface, then decode the rendered barcode and inspect print output. No physical scanner/printer test is claimed.
3. **Local booking overlay.** `openTiltBookingModal` records `date: today()` without a selectable date and emits a fixed decorative SVG while instructing guests to present that QR. Add a booking date and an actual QR payload linked to the reservation. This concerns our local booking overlay; external website code is outside scope.
4. **Demo loading feedback.** A `showLoadingSkeleton` helper is defined in `public/assets/app.js` but has no call sites. Wire loading/ready/error feedback to the actual demo load or remove the unused helper; avoid adding a fake timed delay. Actual slow-network blank duration was not measured in this review.

## Evidence and scope

- Production Playwright CLI: title is the current PREEYA SYSTEMS title, canonical false, Open Graph count 0, three estimator panels present; contact links are the configured LINE and email. Sitemap old date verified live.
- Local scripts under ignored `output/affordable-pricing/remaining-audit.js`; other findings checked against current source rather than repeated historical findings.
- An exploratory WMS filter check found no category controls on the initially opened dashboard and establishes no filter outcome; no defect is inferred from it.
- Previously repaired CRM sync, POS receipt, Shipping calculation/save and estimator flows are not reclassified as outstanding based on the older audit. This is a focused remaining-work review, not a full regression certification.
- User's no-About decision remains governing. No external shop redesign is proposed. Estimator intentionally prepares a brief for manual LINE/email sending; lack of a backend is not treated as a broken send feature.

Recommended next slice: homepage share metadata and preview image, with production source/image verification. Then address WMS label quality before adding more demos.
