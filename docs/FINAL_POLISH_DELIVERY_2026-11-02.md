# Credibility copy, booking print and modal keyboard polish

Implements the three findings confirmed after release `6c41050`.

- Replaced unverified WMS/Shipping percentages, CRM speed comparisons and other outcome/availability claims in the active project descriptions with observable demo actions. PHP registry and every generated static entry agree. External-store descriptions now describe the integration rather than claim complete checkout. Active quote bars describe scoped development rather than guaranteed delivery times or unrestricted customization. External websites themselves were not changed.
- Booking print isolates the ticket on one A5 portrait page, using black text on white and preserving the actual reference/date/QR. The explicit print button and browser print path both prepare the same surface; afterprint clears it. Existing WMS and POS print sizes remain independent.
- Shared dialog handling moves focus inside, cycles Tab/Shift+Tab, makes background content inert and restores the originating control after close. Escape, close buttons, backdrop clicks, replacement dialogs and externally removed dialogs clean up listeners, inert state and scroll locking. A recreated trigger is found after booking/POS background re-rendering. Detail overlays use the same lifecycle and clear their query parameters on close.

## Verification

Chromium via Playwright CLI (the established fallback after prior in-app browser policy denial):

- `output/final-polish/verify.js`: 21 checks passed, covering truthful visible benefits, keyboard wrapping, blocked background focus, every close path, dialog replacement, removal cleanup, no-enabled-control fallback, booking print preparation/cleanup, mobile fit, focus after re-render and no runtime errors.
- `output/final-polish/regression.js`: 11 checks passed, including POS ordering/receipt, WMS label print and focus, CRM/E-Sign/Shipping initialization and the existing 15,000–25,000 estimate/contact steps.
- PHP/static comparison verifies matching benefit copy in 66 visible-project values across eleven HTML entries. Shared dialog script precedes app initialization in all entries; cache versions changed to `polish-2`.
- Printed booking PDFs for the button path, browser print and maximum-length contact fields each contain exactly one page, no website navigation/admin shell, and an independently decodable QR. PDF text includes the selected booking details and demo limitation. Page dimensions are approximately 148×210 mm.
- WMS regression PDF remains one 100×75 mm page and independently decodes to `EL-001`. POS regression PDF remains one 80 mm-wide receipt.
- Ticket PDFs were rasterized and inspected with `view_image`, including long names and the unchanged mobile ticket screen. JS/PHP syntax, whitespace and synchronized entrypoints checked.

Evidence stays local under ignored `output/final-polish/`. No real booking, message or payment was sent. Physical printer and non-Chromium acceptance are not established by these tests. Release follows the existing Git-push workflow; production confirmation is checked separately from local results.
