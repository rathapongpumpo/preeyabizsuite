# Company credibility content — 2026-11-02

## Superseding user decision

The user requested no About menu or section; contact channels are sufficient. The About section and both navigation links were removed. Legacy About hashes resolve to Contact. Homepage demo navigation and detail labels now say “ตัวอย่างระบบ” / “รายละเอียดระบบ” rather than presenting prototypes as a client portfolio. Services and the existing LINE/email contact links remain. The delivery record below describes the earlier iteration, not the current About state.

Implemented on the canonical homepage, not a separate preview:

- `/#services`: three plain-language services with the audience for each.
- `/#about`: existing PREEYA SYSTEMS identity, development approach, working demo links, and the existing developer GitHub, email and LINE contacts.
- `/#how-it-works`: scope, design review, acceptance/handover and support terms. Source code, documentation, system accounts and support coverage are items to specify in the proposal; no unsupported fixed warranty or uptime promise added.
- Desktop/mobile navigation and legacy `#about-architect` / `#pricing` bookmarks updated. Existing demo logic unchanged.
- Brand-derived SVG favicon added; root/static homepage synchronized.

Content comes from the existing profile and working prototype scope. No invented personal name, years of experience, team size, client logos, testimonials, business results or company registration details. Personal identity and verified experience can be added when supplied.

Extends the existing visual system rather than redesigning it: porcelain background, cobalt links, Thai typography, open columns, numbered rows and divider lines. Existing selected-work concept used only for palette/type rhythm comparison, not as a reference for the new content layout. No new raster assets needed.

Chromium via Playwright CLI: all 18 checks passed. Widths 375/390/768/1024/1440 have no document overflow; new menu links, mobile dismissal, old bookmarks, contact CTA and all homepage hash targets work. No page runtime errors. Existing in-app browser access was policy-blocked, so verification used local Chromium. External contacts were not messaged and external profile ownership was not independently verified.

Desktop and mobile section screenshots visually inspected under `output/studio-delivery/`. Corrected an orphan word in the mobile process heading. `node --check`, `git diff --check` and entrypoint byte comparison passed. Temporary verification script removed.

Local only; no deployment. CRM, Shipping and other demo defects remain outside this change.
