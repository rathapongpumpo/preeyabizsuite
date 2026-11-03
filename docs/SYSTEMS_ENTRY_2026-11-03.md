# Clear entry into the interactive demos

Published to https://buzlike.com/#systems on 2026-11-03 after the user identified the three-part banner below the coffee hero as unattractive and unclear.

## Delivered change

Removed the decorative `.hero-index` banner and its desktop/mobile styles. The next section now leads with **เลือกระบบที่อยากลอง**, followed by **เลือกตัวอย่างที่ใกล้กับธุรกิจคุณ แล้วกดเข้าไปทดลองใช้งาน**. Its existing screenshots, explanations and functional demo buttons follow directly. Section separation uses one subtle divider and 56 px top padding (36 px on narrow screens).

The hero's existing “ดูตัวอย่างระบบ” CTA still targets `#systems`; all demo routes, pricing and estimator controls are preserved. The hero stylesheet uses `?v=systems-entry-1` to avoid stale caches.

## Visual review ledger

This was a small fix within the established design system, using the frontend-app-builder skill's exception to new Image Gen concepting. The user's supplied screenshot served as the problem reference, not an approved replacement concept. No new visual assets or components were introduced.

| Comparison | Reference/problem | Delivered result |
| --- | --- | --- |
| Copy/purpose | Three separate statements repeat instructions and the coffee sequence | One section heading explains the next action: choose a demo |
| Layout | A full-width banner with vertical separators interrupts the transition | Hero ends directly before the demo section; no separate banner |
| Typography | Small peripheral text competes with a slogan | Existing large section-heading typography, followed by one readable instruction |
| Palette | Existing off-white/cobalt site | Preserved #f7f8fa background, #3155f5 actions and existing type colors |
| Asset treatment | Coffee animation and actual demo screenshots | Unchanged artwork and image framing; no image replacements |
| Responsive behavior | Narrow banner text has little hierarchy | Clear heading and instruction at 320/390/768/1024/1440 px |

The supplied reference and final live desktop/mobile screenshots were opened with `view_image` in the same review pass. Above-the-fold hero copy and animation are unchanged. The intentional visual change is removal of the criticized banner and consolidation of the next-section introduction; no other material mismatch was found in the reviewed surface.

## Validation and publication

Chrome via Playwright CLI was used because the earlier in-app-browser automation binding was unavailable in this ongoing session. Local and published checks both passed 25/25: the hero CTA reaches the visible introduction at five widths, no document overflow, no extra gap between sections, both WMS/POS demo buttons open and return home, and no JavaScript runtime errors.

Live homepage and versioned CSS bytes match the local source. Deployed release manifest verified all 140 files. Backup: `/home/u271733843/buzlike-backups/20261103-093045-before-systems-entry`; staging: `/home/u271733843/buzlike-releases/20261103-systems-entry`.

Final review images: `output/playwright/section-transition/live-transition-1440.png` and `live-transition-390.png`. Temporary review scripts, logs and intermediate viewport captures were removed after review. The scoped correction was visually verified against the existing site design and the user's request; this is not a full application audit.
