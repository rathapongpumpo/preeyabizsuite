# Inquiry backups — 18 November 2026

Published at https://buzlike.com/admin/backups. The user explicitly selected **Hostinger-only backups for now**, without an external storage connection. This release adds private recovery copies for the website's actual inquiry database, follow-ups, history and owner account, separate from all product-demo/browser storage and the POS/lawyer applications.

## Delivered behavior

- Back up automatically after saving an accepted inquiry, updating its notification state, saving follow-ups/history, provisioning/resetting an owner, changing an owner password or removing expired inquiry data. A repeated identical follow-up save does not create unnecessary copies. Login-attempt counters/session activity alone do not trigger new copies.
- Normal PHP page entry checks for today's copy. If it exists, the check returns without opening SQLite or waiting on the backup lock. The first request on a new day creates a new daily copy. This is an event/request-driven fallback, not a claim that a scheduled job is installed.
- A dedicated owner **สำรองข้อมูล** page shows backup/restore-test times, policy, file names/sizes, manual backup and isolated restore-test actions. Existing login, first-password-change gate, CSRF/origin validation and private no-cache/noindex headers protect it. No archive or recovery key is made downloadable through the website.
- Retain one refreshed daily copy per Thai calendar day in the latest 14-day window and at most 24 recent change/manual copies in that same window, bounded at 38 encrypted files. Old copies are removed when a backup/maintenance run executes. A site that is inactive without cron does not have an independently running deletion timer. This timing is stated on the owner page and in the customer form's backup disclosure.

Copies are consistent SQLite snapshots created using `VACUUM INTO`, checked for integrity, compressed and encrypted with AES-256-GCM using a random 32-byte key, random 12-byte nonce, 16-byte authentication tag and authenticated format header. The container includes the database, its SHA-256, table counts and original inquiry HMAC key; it excludes sessions and the backup encryption key. A 16 MiB snapshot cap bounds memory use on shared hosting; exceeding it fails visibly rather than replacing a good backup. The source code and site/pricing configuration remain maintained in Git/releases.

Live locations, all outside `public_html`:

- Archives/status/lock: `/home/u271733843/domains/buzlike.com/var/backups/` (0700 directory, 0600 files).
- Separate recovery key: `/home/u271733843/domains/buzlike.com/var/backup-encryption.key` (0600). Preserve this key with the archives during any server migration. A missing/empty key is never silently replaced while archives exist.

Archives publish through flushed/fsynced temporary files and atomic rename. A lock serializes parallel workers; a persistent sequence preserves recent-copy order, including multiple writes within one second. Backup failures are caught independently of customer acceptance, logged without customer contents, and reflected in owner status where storage remains writable. A failed copy does not replace the last-good encrypted copy.

## Scheduled job: one hPanel step remains

Current SSH verification found **`crontab: command not found`**. No scheduled task has been installed. The tested PHP runner is ready; add this one PHP Cron Job in the Hostinger dashboard:

1. Websites → manage **buzlike.com** → search **Cron Jobs** in the sidebar.
2. Type **PHP**, file:
   `/home/u271733843/domains/buzlike.com/src/BackupInquiries.php`
3. Minute **0**, hour **20**, day/month/weekday **\*** — `0 20 * * *` in Hostinger's UTC schedule, meaning **03:00 Asia/Bangkok every day**.

The worker records an invocation time when called without `--force`; the UI explicitly says that an invocation timestamp is not proof of an installed recurring schedule. Deployment verification used `--force --verify`, which does not create a misleading cron heartbeat. Event-driven backups already operate without this hPanel step; a fixed-time copy on an otherwise idle day needs the scheduled job. [Hostinger cron setup](https://www.hostinger.com/support/1583465-how-to-set-up-a-cron-job-at-hostinger/)

## Restore and verification

The owner action decrypts the latest encrypted archive into a random private staging directory, checks database integrity, expected table counts and database hash, then removes only its temporary database/key. It does not activate a restored database or overwrite live inquiries.

CLI recovery to a **new private directory only**:

```text
php /home/u271733843/domains/buzlike.com/src/RestoreInquiries.php ARCHIVE_PATH KEY_FILE NEW_PRIVATE_DIRECTORY
```

Existing destinations, active storage and locations under the website's public root are rejected. Any future activation of a restored copy is a separate maintenance operation requiring reconciliation with inquiries received since that snapshot and the matching application release. This release performs no live restore and does not reset the owner's password.

Evidence under ignored `output/playwright/inquiry-backup/`:

- **38 backend checks:** encrypted round trip, restored real application authentication and Thai brief/follow-up/history, exact inquiry key, duplicate daily avoidance, password-hash confidentiality, no recovery key embedded, wrong/lost key, changed/truncated ciphertext, new/private-only destinations, isolated drill cleanup, unchanged source DB, concurrent workers, non-blocking failure semantics, 14-day/24-change rotation and preservation of unrelated files. Temporary fixture databases and fake mail transport only.
- **22 HTTP checks:** protected owner backup route, manual backup/drill PRG and confirmation, origin/CSRF controls, refusal of a live-restore action, honest failure/recovery, previous-copy preservation, no customer data or recovery key in owner status, private paths inaccessible and honest scheduler wording.
- **68 browser checks**, zero JS runtime errors: owner navigation, real manual backup/isolated drill, backup/inbox/password layout and reachable controls at ten widths (320–1920px), keyboard skip link, reduced motion and logout access protection. Desktop/mobile screenshots inspected. A repeated QA login hit the intended rate limit; the final rerun cleared counters **only in the isolated fixture DB**, leaving production account/security state unchanged.
- Existing **27 inquiry + 35 admin backend checks** pass with the new mutation hooks. Existing **39 HTTP admin/inquiry checks** pass against the isolated QA copy.
- **13 Hostinger checks**: production encrypted archive and isolated restore, exact matching customer/follow-up/history/account data, exact original inquiry HMAC key, unchanged live records/account/key, strict private file permissions and staging cleanup. Comparisons occur on the host; only boolean results and aggregate counts are returned. The original database contained one inquiry and one owner; neither was edited.
- The **actual Hostinger CLI runner** `php .../src/BackupInquiries.php --force --verify` passed, including successful restore integrity.
- **Nine live HTTP checks:** homepage/CRM preview and disclosure preserved; anonymous backup route redirects to login; private backup/key/source paths return 404; published CSS bytes match. These probes connect to the verified origin with the original TLS hostname and certificate checks enabled, not a claim about all CDN/client networks. The production owner UI was not authenticated or screenshot-tested on behalf of the owner; its rendering/interactions were verified locally, and published source/assets are hash-verified.
- PHP syntax, equal root/public homepage copies, Git whitespace and a 167-file PHP release archive pass. The package excludes private storage and encryption keys. No real mail, external message, analytics integration or external backup upload occurs.

Technical references: [SQLite snapshot backup](https://www.sqlite.org/backup.html), [VACUUM INTO](https://www.sqlite.org/lang_vacuum.html), [PHP authenticated encryption](https://www.php.net/manual/en/function.openssl-encrypt.php). Verification above is the project evidence, not an independent audit.

## Release / rollback

Verified host key, exact domain root and existing files against Git baseline before publishing. Stage `/home/u271733843/buzlike-releases/20261118-031114-inquiry-backup`; pre-release code plus private consistent database/key copy `/home/u271733843/buzlike-backups/20261118-031114-before-inquiry-backup`. This pre-release private copy is distinct from the new encrypted rotating archive store. Published ten files, new class/CLI sources before their callers and public assets/templates; final hashes verified. A subsequent wording patch clarified on-run retention cleanup, with previous versions retained in the stage and final hashes updated in the local release manifest.

Rollback modified callers/templates/CSS from the pre-release backup before disabling/removing any new class reference. Preserve the encrypted archive directory and recovery key. Never overwrite the live inquiry DB or owner credentials with a pre-release copy as part of a code rollback. Git retains the mirrored static homepage and regression scripts; Hostinger uses `public/index.php` routing.
