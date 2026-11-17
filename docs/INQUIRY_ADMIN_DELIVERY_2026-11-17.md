# Owner inquiry workspace — 17 November 2026

Published at https://buzlike.com/admin/inquiries. This completes the first proposed next task: a small, private workspace for handling actual website inquiries. Product analytics and scheduled offsite backup/restore operations remain separate work; this release does not claim to implement them.

## Owner workflow

- Sign in with the provisioned support@buzlike.com owner account. The initial password is generated independently of SSH/email credentials. First sign-in requires setting a new password before any customer records are visible. The final temporary password is supplied in a local, ignored handoff file restricted to the current Windows user; it is not in Git, the release archive, or this document.
- Review actual inquiry totals, new inquiries, quoting and closed-work counts. Search customer names, contact details, email, brief contents or reference; combine with follow-up and notification filters. Lists paginate at 20 records and keep filters when opening a detail page and returning.
- Open the original contact/brief, systems, service model, budget, current estimated price/time and mail-notification state. Estimates are explicitly calculated from current rates, not represented as a historical or confirmed quotation.
- Track **new / contacted / quoting / won / not proceeding**, add an internal note and view timestamped follow-up history. Notes and changes are private and do not send a customer message or retry notification mail. An outdated browser tab receives a conflict warning and retains its attempted note rather than overwriting a newer saved version.
- Find failed notification attempts and pending attempts older than five minutes. “Host accepted for sending” does not claim inbox delivery. Incoming inquiry storage, notification transport, original pricing and customer form logic are unchanged.

## Data and access

The workspace reads the existing private `var/inquiries.sqlite`. Additive `admin_account`, `admin_login_limits`, `inquiry_followups` and `inquiry_activity` tables leave the original inquiry schema and submission insert compatible. A delete trigger removes follow-ups/history with an expired inquiry; orphan cleanup also runs on workspace initialization. The existing 90-day retention remains based on original request age, including followed-up requests.

There is one owner account, no public registration/setup route and no connection to the browser-local CRM demo, POS database or lawyer application. SSH recovery uses `php src/ProvisionAdmin.php --reset` with email/password JSON on stdin, never a password argument. Without `--reset`, an existing account cannot be overwritten. Routine account password changes are available inside the workspace.

Passwords use PHP's built-in hash/verify functions. Admin sessions use separate private storage and a `/admin`-scoped Secure/HttpOnly/SameSite=Strict cookie in production. Session IDs rotate after sign-in/password change, other sessions are invalidated by password changes/reset, and server-enforced deadlines are 30 minutes idle / eight hours absolute. Login work is limited per HMAC-hashed IP and account-wide. Forms validate origin and session CSRF tokens; SQL is parameterized and all customer/note output is escaped. Private responses use no-store, noindex, same-origin referrers and frame protection; the admin UI loads no third-party resources or JavaScript. `/admin` is excluded in robots.txt and absent from the sitemap.

Implementation reference: [PHP session security](https://www.php.net/manual/en/features.session.security.management.php), [password_hash](https://www.php.net/manual/en/function.password-hash.php), [password_verify](https://www.php.net/manual/en/function.password-verify.php). These references inform implementation, not a claim of an independent security audit.

## Verification

Evidence is in ignored `output/playwright/inquiry-admin/`:

- **35 backend checks** (`php scripts/test_inquiry_admin.php`): hashed account provision/recovery, first-change requirement, password/current-version validation, rate limiting, original inquiry compatibility, follow-ups/history, optimistic concurrency, duplicate-save behavior, Thai and literal-wildcard search, SQL-injection query rejection, notification attention, pagination and retention cleanup. Isolated temporary SQLite and fake mail transport.
- **39 HTTP checks**: anonymous access, cookie scope/flags, no-store/noindex/frame headers, same-origin/CSRF enforcement, password confirmation/change and revocation of another device, real pagination/filters, safe output, persisted updates, stale-edit conflict, invalid routes/methods, logout-cookie replay, server-side idle/absolute expiry and unchanged original inquiry initialization/validation. A separate QA copy stubs mail transport.
- **79 browser checks**, zero JavaScript runtime errors: actual login and saved follow-ups, reload, retained search context, notification filters, two-tab conflict, inbox/detail/password pages at ten widths from 320 to 1920px, contained and usable form controls, keyboard skip link, reduced motion, logout/Back privacy and responsive sign-in. Desktop/mobile screenshots inspected.
- Original **27 inquiry backend checks** still pass with fake transport and temporary storage.
- **44 production browser checks**, zero JavaScript runtime errors: verified-HTTPS sign-in, forced first password change, Secure/HttpOnly/Strict cookie, persisted QA-only follow-up edits, two-tab conflict, responsive inbox/detail at five widths from 320 to 1440px, private source/storage paths returning 404, unchanged homepage/CRM preview and public form initialization, logout/Back behavior. Production screenshots contain only the filtered temporary QA record and aggregate counts.
- **Five final handoff checks**: final temporary owner credential works, first-change gate still protects actual inquiries, setup form is reachable and the verification session is logged out. TLS certificate verification remains enabled.
- PHP syntax, `git diff --check` and 164-file PHP release packaging passed. Packaging excludes private database/key/account/session files.

**Connection limitation:** the existing local network DNS failure for buzlike.com was still reproducible. Production browser tests use a resolver override only inside an isolated QA browser, mapping buzlike.com to the verified Hostinger origin; the final handoff probe also connects directly with the original TLS hostname and certificate verification. Neither changes Windows/router DNS. These tests establish origin functionality, not ordinary DNS reachability or CDN correctness from every customer network.

No real inquiry email, customer reply, external message, payment or product-account action was submitted. A temporary QA row was inserted without notification, used for live edits and removed by its exact reference plus QA dedupe value. Existing inquiry count was one before testing and one after cleanup; the original row was not edited. QA credentials are revoked and all test owner sessions invalidated before handoff.

## Release / recovery

- Exact target: `/home/u271733843/domains/buzlike.com/public_html`, with private source in the adjacent `src/` directory.
- Verified existing public files against Git baseline and checked SSH host key and resolved domain directory before changes.
- Consistent private SQLite/key backup **before migration/provision**: `/home/u271733843/buzlike-backups/20261117-105923-before-inquiry-admin`, directory 0700, data/key 0600. Database backup uses SQLite `VACUUM INTO`; source quick-check returned `ok`. This is a release backup, not scheduled offsite retention or a completed disaster-recovery drill.
- Stage: `/home/u271733843/buzlike-releases/20261117-105923-inquiry-admin`.
- Six published files: `src/InquiryAdminStore.php`, `src/InquiryAdminEndpoint.php`, `src/ProvisionAdmin.php`, `public/assets/inquiry-admin.css`, `public/robots.txt`, `public/index.php`. Source/CSS before router; each final replacement is atomic and its hash verified. Admin migrations are additive and run through the private source.
- Rollback the public routing/robots files from the release backup to hide the workspace; restore code assets if needed. Leave the additive private tables in place. Do not overwrite the live inquiry database with the backup without reconciling inquiries received after deployment.

The main homepage, CRM UI/data keys, product links, price configuration, external apps and inquiry mail transport are unchanged by this release.
