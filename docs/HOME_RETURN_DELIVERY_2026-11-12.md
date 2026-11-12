# Return from demos without reloading home — 2026-11-12

Published to https://buzlike.com/ and verified in Chromium on desktop and mobile viewports.

## Follow-up correction: expanded list lost after a replaced document

The user reported that returning still lost the position of the expanded “ตัวอย่างเพิ่มเติมอีก 4 ระบบ” list. A live reproduction of home → CRM → refresh → return showed `y=2224, open=true` becoming `y=0, open=false`. The first verification covered ordinary same-document returns but did not check returning **after** refreshing the demo.

- Home snapshots now include the expanded/collapsed state of details and scroll coordinates in tab-local sessionStorage and the existing history state. No customer form values are added to this snapshot.
- Returning from a standalone/refreshed demo restores the snapshot after the actual home document and fonts are ready. The browser's scroll restoration is suppressed only temporarily and returned to its original setting; user interaction cancels delayed restoration.
- A second reproduced case was browser Back after refreshing a same-document history entry: the address became the home URL while the standalone CRM PHP document remained visible. The standalone handler now loads the actual destination in that case and applies the saved home state. Normal hosted returns retain the existing homepage document and do not reload it.
- Previous-release snapshots and standalone visits have a contextual fallback that expands the additional-systems list. When no previous coordinates exist, an exact historical pixel position cannot be recovered; subsequent visits record the full state.
- Script cache version is `home-return-2` in all homepage/PHP/static entries.

Follow-up checks: **132 local and 132 live checks passed** (65 four-system return cases, 8 hash/anchor cases, and 59 normal navigation regressions). The four additional demos were tested at 390/1440 px with the web return button, browser Back, refresh-then-return, and refresh-then-Back, checking the expanded list and exact coordinates again after settling. Hash cases include `#systems` and `#estimator-form`. The normal live sequence still records exactly one main-frame homepage request. Local repetition of the initial reproduction retained `y=2881, open=true` before and after return.

Follow-up evidence is in the same ignored directory: `repro-reload.txt` (before correction), `fixed-reload-local.txt`, `resilience-local.txt`, `resilience-live.txt`, `hash-resilience-local.txt`, `hash-resilience-live.txt`, `core-v2-local.txt`, `core-v2-live.txt`, and `live-v2-restored-mobile.png`. The live restored-list screenshot was opened and inspected.

Follow-up deployment replaced four public files after prior-content and new-hash verification. Staging: `/home/u271733843/buzlike-releases/20261112-home-return-v2`; backup: `/home/u271733843/buzlike-backups/20261112-032253-before-home-return-v2`. Private inquiry data and other websites were untouched. The sections below record the original release.

## Behavior

- Starting from the homepage, opening a system keeps the actual homepage document, form elements, expanded details and scroll coordinates alive. The selected demo opens in a full-viewport same-origin iframe using the existing demo shell and its existing scripts/styles.
- The address bar and document title follow the selected demo. Its existing “กลับหน้าแรก” action removes the demo view and immediately restores the saved homepage URL, position and originating link focus, with no homepage navigation request.
- Browser Back/Forward opens or closes the appropriate view through the History API. Internal CRM/E-Sign and Shipping links navigate through the host while retaining their query parameters. Child document replacement avoids adding duplicate iframe navigation entries for these links.
- Request-quote links return to the existing estimator, apply the requested system/model and scroll to the form. Customer input remains present. Returning normally keeps the form's existing step and selections.
- Only messages from the owned same-origin demo window are accepted. While a demo is open, the background homepage is inert and cannot scroll. Loading/failure controls allow immediate return or opening the demo separately.
- Modified clicks, downloads and new-tab links retain native behavior. Direct/shared/refreshed demo URLs still render normal PHP demo documents; these use a cached previous home entry when an actual homepage referrer is available, otherwise normal navigation. A fresh direct visit cannot retain a homepage document that was never opened in that tab.

The change uses `public/assets/site-navigation.js` and `.css`, a navigation hook in `app.js`, and an estimator intent event. Root/static/PHP entries are synchronized and cache versions updated. Existing prices, demo logic/data keys, inquiry submission/email code, coffee flow, brand artwork and external website sources are unchanged.

## Evidence

- **59 local core checks passed**: six homepage demos at 390/1440 px, exact scroll restoration, retained original homepage/form identity, expanded details, customer input, focus, public URL, viewport fit, Back/Forward, CRM → E-Sign query handoff, estimator preselection, Ctrl-click/new tab and no runtime errors.
- **8 local edge checks passed**: aborted/loading demo return, rejection of messages outside the owned frame, WMS dialog and label-print preparation inside its demo document, Escape closing only the child dialog, Shipping subroutes and direct-route refresh.
- **59 live checks passed**, repeating the core scenarios on buzlike.com. Network recording contains exactly one main-frame homepage document request across the sequence of demo visits; original homepage object/form identity remains intact.
- Mobile CRM and restored-home screenshots from local and live runs were opened and visually inspected. JavaScript/PHP syntax and `git diff --check` passed.

Ignored evidence directory: `output/playwright/home-return/`, including `results.txt`, `edges-results.txt`, `live-results.txt`, the verification scripts, `live-crm-mobile.png` and `live-restored-mobile.png`. Tests used isolated Playwright Chrome sessions; CRM setup is browser-local sample data. No inquiry email, real contract or payment was sent. Physical-device/browser-engine acceptance and physical printing are not established by these checks.

## Deployment

- Checkout was located at `D:\Projects\1.buzlike\buzlike.com`; the previous chat's `D:\Projects\demo-system` folder no longer exists.
- Confirmed `/home/u271733843/domains/buzlike.com` before deployment. Applied eight public files only, including two new assets, after validating previous content against the checkout and checking all new SHA-256 hashes.
- Private staging: `/home/u271733843/buzlike-releases/20261112-home-return`.
- Backup: `/home/u271733843/buzlike-backups/20261112-024450-before-home-return`.
- Full release artifact: `output/playwright/home-return/buzlike-home-return.zip`, containing 149 files. No private inquiry database/key or other hosted site was changed.
