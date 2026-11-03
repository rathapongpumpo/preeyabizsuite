# Mobile contact and real inquiry delivery — 2026-11-03

Published to https://buzlike.com/. Brand, layout, coffee-flow geometry, demo data keys and entry pricing are preserved.

## Customer behavior

- Mobile shortcuts offer LINE and budget estimation. They hide around the estimator/contact section, while the menu is open, during input, or when they would cover an existing action. Desktop does not show the mobile bar.
- The three-step estimator now submits to the server after explicit consent. It shows progress, a reference number on acceptance, and an error/fallback when confirmation fails. The copy/LINE/mailto alternatives remain available inside a disclosure.
- Editing a submitted form enables a new request. Repeated clicks are disabled while sending and after acknowledgement; network retries reuse the idempotency key. Copy feedback does not overwrite the receipt.
- Entry-package details explain one initial system/workflow and the scope/cost items to confirm in the proposal, without inventing free hosting or new fee amounts.

## Server and email

`/api/inquiries` accepts validated same-origin JSON with a session CSRF token. It checks lengths/types, consent, a honeypot and rate limits. Notification recipient/from address are fixed by site configuration; visitor data never chooses recipients or mail headers. Optional visitor email is validated for Reply-To. Server pricing comes from the same `EstimateConfig.json` as the frontend, ignoring any client-provided price.

The request is saved in private SQLite before notification. Notifications use Hostinger's configured mail transport, UTF-8 MIME subject and quoted-printable plain-text body. A queue acceptance is recorded as `queued`, a failure as `failed`; customer copy confirms receipt of the request, not guaranteed inbox delivery. Pending/failed notification retries are bounded and reuse the same reference/Message-ID.

Storage is outside public_html: directory `var/` mode 0700, database/key mode 0600. IPs are HMAC-hashed for limiting; request contents are not written to public logs. Entries older than 90 days are purged on the next API call. A CLI prune command is provided. Hostinger exposes a read-only `crontab` wrapper through SSH, so a daily cron was **not** installed, and the website does not promise deletion at an exact deadline. Existing cron jobs were not modified.

## Delivery evidence

1. Diagnostic `BUZ-TEST-908633F7`: sent to support@buzlike.com; the user confirmed receipt in the inbox.
2. Real browser form request `BZ-261103-359F13C5F228`: customer fields and Thai notes submitted through the published form; a receipt was displayed and host mail transport accepted the notification. Reposting the same request generated no second lead/notification: database shows `queued`, `attempts=1`, `matching_leads=1`.
3. Recipient confirmation for the actual form email was requested asynchronously; **still pending when this record was written**. Do not equate the queue state with verified inbox arrival for that second message.
4. UTF-8 subject/body round trips on the actual Hostinger PHP runtime passed. No mailbox password was requested/stored, and no unrelated mailbox contents were accessed.

## Checks

- Backend unit tests: 27/27 with temporary databases and fake mail transport. Includes overlapping duplicate submission, retry, price tampering, validation/header injection, rate limiting, failed-notification persistence/recovery and expiry cleanup.
- HTTP negative tests: 13/13 locally, including method/origin/CSRF/content type/size/JSON/field/honeypot rejection. These do not send real email.
- Browser UI checks: 20/20 locally and against the published UI. Success/failure POST responses are intercepted for these UI-state tests; they are **not** email delivery evidence. Real form delivery is the separately identified request above.
- Live checks confirm a Secure/HttpOnly/SameSite=Lax session cookie, missing-CSRF rejection, no-cache/non-shared session tokens, and 404 for private source/database/key paths.
- Mobile layouts inspected at 320/390/768 px, desktop at 1440 px. Actual shortcut and receipt screenshots opened with view_image. Palette, typography, primary CTA style, existing screenshots and hero content were retained; only the requested mobile actions/form states/package disclosure were added.
- Live homepage/changed asset bytes match source; PHP/JS syntax and git diff checks passed. Final release manifest verified 147 files.

Evidence in `output/playwright/inquiry-delivery/`: `unit-results.json`, `http-negative.json`, `browser-local.json`, `browser-live-ui.json`, `live-followup.json`, `live-assets.json`, `live-mobile-shortcuts.png`, `live-receipt-mobile.png`. Ignore the simulated reference `BZ-261103-AABBCCDDEEFF` in UI-state screenshots; it never produced an email.

## Publication and maintenance

Final staging: `/home/u271733843/buzlike-releases/20261103-inquiries-final`.

Pre-final backup: `/home/u271733843/buzlike-backups/20261103-122727-before-inquiries-final`; includes a consistent copy of the new private SQLite/key in addition to source/public files. The private directory was preserved during deployment. Other websites and external shop code were untouched.

The automatic API is implemented for the PHP/Hostinger deployment. Static-only hosting cannot execute it; the frontend reports failure honestly and retains manual contact alternatives. No automatic reply, payment, CRM integration or full application audit is claimed.
