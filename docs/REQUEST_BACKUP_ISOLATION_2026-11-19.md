# Visitor page loads and backup isolation — 19 November 2026

Visitor page loads no longer start a daily database backup. Previously, the first request without a current daily archive could wait on the backup lock before receiving any page content. Expiry cleanup in inquiry/admin service construction could also start a snapshot during a GET. Both snapshot entry points have been removed.

The 90-day expiry cleanup itself still runs. Saving an inquiry, its notification state, an owner follow-up or account change still triggers the existing encrypted backup. Manual backup/restore checks and the independent `src/BackupInquiries.php` CLI worker are preserved. The owner page now explains that daily scheduling requires a PHP Cron Job in hPanel; it no longer claims that opening the website creates a daily copy.

## Validation

- Reproduced the previous behavior against commit `fe7fd36` in an isolated PHP HTTP server: the daily archive was absent and another PHP process held the backup lock; GET `/` timed out after 1.5 seconds while waiting for it.
- The corrected build passed **11 isolation checks** with the same lock held: homepage, CRM, inquiry GET, static CSS, owner login and 404 completed in under 0.1 seconds locally. GET still removed expired fixture data, without changing backup status/key or creating a daily archive. After releasing the lock, the actual CLI worker created an encrypted daily archive and verified an isolated restore.
- Existing suites passed **27 inquiry, 35 owner-admin and 38 backup checks**. Mail transports were fake and all customer data in tests was disposable.
- PHP syntax and Git whitespace checks passed. A Windows fixture cleanup initially failed because the Python SQLite handle remained open; the test now closes the connection explicitly and passed on rerun.
- **16 production HTTP probes** passed across direct-origin and ordinary public CDN paths: homepage, CRM, inquiry initialization, CSS, image, protected-owner redirect, private-key 404 and unknown-route 404. The live probe is limited to the current client and observation window.
- A fresh ordinary-domain Chromium session reached the actual homepage without a verification screen: first byte **202 ms**, HTML complete **219 ms**, DOM ready **519 ms**, and no browser console errors. This does not establish full-page load time or worldwide availability.

## Production rollout

Only `public/index.php`, `src/InquiryService.php` and `src/InquiryAdminEndpoint.php` were published to the verified `buzlike.com` domain root. Existing deployed sources were checked against Git baseline before replacement, staged PHP passed syntax checks, and published bytes were hash-verified. The deployed rewrite rules and all public layout assets were preserved.

An encrypted backup and isolated restore verification succeeded before rollout: `change-20261119-124332-000000000005.bzbk`. Previous code is retained at `/home/u271733843/buzlike-backups/20261119-054331-before-request-backup-isolation`; staged code is at `/home/u271733843/buzlike-releases/20261119-054331-request-backup-isolation`. Live inquiry, owner, follow-up and activity rows, plus the inquiry key, matched before and after publication. No owner credentials were reset and no real inquiry or email was submitted.

Evidence is in ignored `output/playwright/backup-isolation/`: baseline/HTTP/regression/live results and the deployment manifest. A disposable failed-run fixture remains under that directory after shell cleanup was rejected; it contains fake test data only and is outside all production paths.

## Operational limits

The reported simultaneous 49–159-second delays affecting static assets and PHP routes have not been traced to a specific CDN/origin subsystem. This release removes a real request-blocking backup risk; it is not evidence that the historical CDN/origin incident has been explained or permanently eliminated. Hostinger CDN/security/DNS settings were not changed.

No recurring cron was installed by this release, and the last inspected backup status had no cron invocation. To create daily copies independently of data changes, configure the existing PHP worker `/home/u271733843/domains/buzlike.com/src/BackupInquiries.php` in hPanel at `0 20 * * *` UTC (03:00 Thailand time). Until scheduled, automatic copies are triggered by significant writes, plus owner/CLI manual runs. No daily backup is started by visitor GET requests.
