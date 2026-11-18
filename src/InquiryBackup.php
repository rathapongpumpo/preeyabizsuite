<?php
declare(strict_types=1);

/** Encrypted, same-host recovery copies. Never exposes a public backup endpoint. */
final class InquiryBackup {
    private const MAGIC = "BUZLIKE-BACKUP-1\n";
    private const MAX_DB = 16777216;
    private string $directory;
    private string $keyPath;
    private Closure $clock;
    public function __construct(private string $storage, ?Closure $clock = null) {
        $this->storage = rtrim($storage, '/\\');
        $this->directory = $this->storage . '/backups';
        $this->keyPath = $this->storage . '/backup-encryption.key';
        $this->clock = $clock ?? static fn(): int => time();
    }
    private function now(): int { return ($this->clock)(); }
    private function day(?int $time = null): string { return (new DateTimeImmutable('@' . ($time ?? $this->now())))->setTimezone(new DateTimeZone('Asia/Bangkok'))->format('Ymd'); }
    private function prepare(): void {
        if (!is_dir($this->storage) || is_link($this->storage) || is_link($this->directory)) { throw new RuntimeException('storage_unavailable'); }
        if (!is_dir($this->directory) && !mkdir($this->directory, 0700) && !is_dir($this->directory)) { throw new RuntimeException('storage_unavailable'); }
        chmod($this->directory, 0700);
    }
    private static function atomic(string $path, string $bytes): void {
        $pending = $path . '.pending-' . bin2hex(random_bytes(8));
        $handle = fopen($pending, 'xb');
        if (!$handle) { throw new RuntimeException('write_failed'); }
        try {
            chmod($pending, 0600);
            $offset = 0;
            while ($offset < strlen($bytes)) {
                $count = fwrite($handle, substr($bytes, $offset));
                if (!$count) { throw new RuntimeException('write_failed'); }
                $offset += $count;
            }
            if (!fflush($handle) || (function_exists('fsync') && !fsync($handle))) { throw new RuntimeException('write_failed'); }
            fclose($handle); $handle = null;
            if (!rename($pending, $path)) { throw new RuntimeException('publish_failed'); }
        } finally { if (is_resource($handle)) { fclose($handle); } if (is_file($pending)) { unlink($pending); } }
    }
    private function key(): string {
        if (is_link($this->keyPath)) { throw new RuntimeException('key_unavailable'); }
        $h = fopen($this->keyPath, 'c+b');
        if (!$h || !flock($h, LOCK_EX)) { throw new RuntimeException('key_unavailable'); }
        try {
            chmod($this->keyPath, 0600); $hex = stream_get_contents($h);
            if ($hex === '') {
                if (glob($this->directory . '/*.bzbk')) { throw new RuntimeException('recovery_key_missing'); }
                $hex = bin2hex(random_bytes(32)); if (fwrite($h, $hex) !== 64 || !fflush($h)) { throw new RuntimeException('key_unavailable'); }
            }
            if (!preg_match('/\A[a-f0-9]{64}\z/', $hex)) { throw new RuntimeException('key_unavailable'); }
            return hex2bin($hex);
        } finally { flock($h, LOCK_UN); fclose($h); }
    }
    private function record(array $changes): void {
        $before = $this->metadata();
        self::atomic($this->directory . '/status.json', json_encode(array_replace($before, $changes), JSON_THROW_ON_ERROR));
    }
    private function metadata(): array {
        $file = $this->directory . '/status.json';
        if (!is_file($file)) { return []; }
        try { return json_decode((string) file_get_contents($file), true, 16, JSON_THROW_ON_ERROR); }
        catch (Throwable) { return []; }
    }
    private static function counts(PDO $db): array {
        $result = [];
        $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
        foreach (['inquiries', 'admin_account', 'inquiry_followups', 'inquiry_activity'] as $table) {
            if (in_array($table, $tables, true)) { $result[$table] = (int) $db->query('SELECT COUNT(*) FROM ' . $table)->fetchColumn(); }
        }
        if (!isset($result['inquiries'])) { throw new RuntimeException('schema_invalid'); }
        return $result;
    }
    private function seal(string $snapshot): string {
        $db = new PDO('sqlite:' . $snapshot, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        if ($db->query('PRAGMA integrity_check')->fetchColumn() !== 'ok') { throw new RuntimeException('snapshot_invalid'); }
        $counts = self::counts($db); $db = null;
        if (filesize($snapshot) > self::MAX_DB) { throw new RuntimeException('snapshot_too_large'); }
        $bytes = file_get_contents($snapshot); $inquiryKey = (string) file_get_contents($this->storage . '/inquiry.key');
        if (!preg_match('/\A[a-f0-9]{64}\z/', $inquiryKey)) { throw new RuntimeException('inquiry_key_invalid'); }
        $payload = ['format' => 1, 'created' => $this->now(), 'timezone' => 'Asia/Bangkok', 'counts' => $counts,
            'database_sha256' => hash('sha256', $bytes), 'inquiry_key' => $inquiryKey, 'database' => base64_encode($bytes)];
        $compressed = gzencode(json_encode($payload, JSON_THROW_ON_ERROR), 6);
        if ($compressed === false) { throw new RuntimeException('compress_failed'); }
        $iv = random_bytes(12); $tag = '';
        $cipher = openssl_encrypt($compressed, 'aes-256-gcm', $this->key(), OPENSSL_RAW_DATA, $iv, $tag, self::MAGIC, 16);
        if ($cipher === false || strlen($tag) !== 16) { throw new RuntimeException('encrypt_failed'); }
        return self::MAGIC . $iv . $tag . $cipher;
    }
    private function prune(?string $latest = null): void {
        $cutoffDay = $this->day($this->now() - 13 * 86400);
        $changes = [];
        foreach (glob($this->directory . '/*.bzbk') ?: [] as $path) {
            $name = basename($path);
            if (!preg_match('/\A(daily|change)-(\d{8})(?:-\d{6}-[a-f0-9]{12})?\.bzbk\z/', $name, $match) || is_link($path)) { continue; }
            if ($match[2] < $cutoffDay) { if (!unlink($path)) { throw new RuntimeException('retention_failed'); } continue; }
            if ($match[1] === 'change') { $changes[] = $path; }
        }
        usort($changes, static fn($a, $b) => strcmp(substr(basename($b), -17, 12), substr(basename($a), -17, 12)));
        if ($latest) { $changes = array_values(array_unique(array_merge([$this->directory . '/' . $latest], $changes))); }
        foreach (array_slice($changes, 24) as $path) { if (!unlink($path)) { throw new RuntimeException('retention_failed'); } }
        foreach (array_merge(glob($this->directory . '/.snapshot-*.sqlite') ?: [], glob($this->directory . '/*.pending-*') ?: []) as $path) {
            if (!is_link($path) && filemtime($path) < $this->now() - 3600) { unlink($path); }
        }
    }
    public function run(string $reason = 'daily'): array {
        if (!in_array($reason, ['daily', 'change', 'manual', 'cron'], true)) { throw new InvalidArgumentException('Unknown backup reason'); }
        if (!is_file($this->storage . '/inquiries.sqlite')) { return ['state' => 'no_database']; }
        // Ordinary page views only check today's file; do not open SQLite or wait on a lock.
        if ($reason === 'daily' && is_file($this->directory . '/daily-' . $this->day() . '.bzbk')) { return ['state' => 'current']; }
        $this->prepare();
        $lock = fopen($this->directory . '/backup.lock', 'c+b');
        if (!$lock || !flock($lock, LOCK_EX)) { throw new RuntimeException('lock_unavailable'); }
        chmod($this->directory . '/backup.lock', 0600); $snapshot = null;
        try {
            if ($reason === 'cron') { $this->record(['last_cron' => $this->now()]); }
            $daily = $this->directory . '/daily-' . $this->day() . '.bzbk';
            if (in_array($reason, ['daily', 'cron'], true) && is_file($daily)) { $this->prune(); return ['state' => 'current']; }
            $snapshot = $this->directory . '/.snapshot-' . bin2hex(random_bytes(12)) . '.sqlite';
            $db = new PDO('sqlite:' . $this->storage . '/inquiries.sqlite', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            $db->exec('PRAGMA busy_timeout=5000'); $db->exec('VACUUM INTO ' . $db->quote($snapshot)); $db = null;
            chmod($snapshot, 0600); $archive = $this->seal($snapshot);
            // Authenticate and validate the encrypted container before replacing a last-good copy.
            $this->decode($archive, $this->key());
            $sequence = (int) ($this->metadata()['sequence'] ?? 0);
            foreach (glob($this->directory . '/change-*.bzbk') ?: [] as $existing) {
                if (preg_match('/-([a-f0-9]{12})\.bzbk\z/', $existing, $match)) { $sequence = max($sequence, (int) hexdec($match[1])); }
            }
            $sequence++;
            $name = 'change-' . $this->day() . '-' . (new DateTimeImmutable('@' . $this->now()))->setTimezone(new DateTimeZone('Asia/Bangkok'))->format('His') . '-' . str_pad(dechex($sequence), 12, '0', STR_PAD_LEFT) . '.bzbk';
            self::atomic($this->directory . '/' . $name, $archive); self::atomic($daily, $archive);
            $this->prune($name);
            $this->record(['last_success' => $this->now(), 'latest' => $name, 'last_reason' => $reason, 'sequence' => $sequence, 'last_error' => null, 'last_error_at' => null]);
            return ['state' => 'saved', 'archive' => $name, 'bytes' => strlen($archive)];
        } catch (Throwable $e) {
            try { $this->record(['last_error' => 'backup_failed', 'last_error_at' => $this->now()]); } catch (Throwable) {}
            throw $e;
        } finally {
            if ($snapshot && is_file($snapshot)) { unlink($snapshot); }
            flock($lock, LOCK_UN); fclose($lock);
        }
    }
    private function decode(string $archive, string $key): array {
        $offset = strlen(self::MAGIC);
        if (strlen($key) !== 32 || strlen($archive) < $offset + 29 || strlen($archive) > 25165824 || substr($archive, 0, $offset) !== self::MAGIC) { throw new RuntimeException('archive_invalid'); }
        $plain = openssl_decrypt(substr($archive, $offset + 28), 'aes-256-gcm', $key, OPENSSL_RAW_DATA, substr($archive, $offset, 12), substr($archive, $offset + 12, 16), self::MAGIC);
        if ($plain === false) { throw new RuntimeException('archive_authentication_failed'); }
        $json = gzdecode($plain, 25165824);
        if ($json === false) { throw new RuntimeException('archive_invalid'); }
        $payload = json_decode($json, true, 16, JSON_THROW_ON_ERROR);
        if (($payload['format'] ?? null) !== 1 || !is_string($payload['database'] ?? null) || !is_string($payload['inquiry_key'] ?? null) || !preg_match('/\A[a-f0-9]{64}\z/', $payload['inquiry_key']) || !is_string($payload['database_sha256'] ?? null) || !is_array($payload['counts'] ?? null)) { throw new RuntimeException('archive_invalid'); }
        $bytes = base64_decode($payload['database'], true);
        if ($bytes === false || strlen($bytes) > self::MAX_DB || !hash_equals($payload['database_sha256'], hash('sha256', $bytes)) || !str_starts_with($bytes, "SQLite format 3\0")) { throw new RuntimeException('archive_database_invalid'); }
        $payload['database'] = $bytes;
        return $payload;
    }
    /** Restore only into a new private directory; never overwrite the active database. */
    public function restore(string $archivePath, string $destination, ?string $keyFile = null): array {
        $parent = realpath(dirname($destination)); $storage = realpath($this->storage);
        if (!$parent || !$storage || file_exists($destination) || is_link($destination) || in_array(basename($destination), ['', '.', '..'], true)) { throw new RuntimeException('destination_must_be_new'); }
        $resolved = $parent . DIRECTORY_SEPARATOR . basename($destination);
        foreach (['/public', '/public_html'] as $name) {
            $public = realpath(dirname(__DIR__) . $name);
            if ($public && str_starts_with(strtolower(str_replace('\\', '/', $resolved)) . '/', strtolower(str_replace('\\', '/', $public)) . '/')) { throw new RuntimeException('public_restore_forbidden'); }
        }
        $production = realpath(dirname(__DIR__) . '/var');
        foreach (array_filter([$storage, $production]) as $live) {
            if (strcasecmp(str_replace('\\', '/', $resolved), str_replace('\\', '/', $live)) === 0) { throw new RuntimeException('live_restore_forbidden'); }
        }
        if (!is_file($archivePath) || is_link($archivePath) || filesize($archivePath) > 25165824) { throw new RuntimeException('archive_invalid'); }
        $keyHex = $keyFile ? (string) file_get_contents($keyFile) : bin2hex($this->key());
        if (!preg_match('/\A[a-f0-9]{64}\z/', $keyHex)) { throw new RuntimeException('key_unavailable'); }
        $payload = $this->decode((string) file_get_contents($archivePath), hex2bin($keyHex));
        if (!mkdir($destination, 0700)) { throw new RuntimeException('restore_unavailable'); }
        try {
            self::atomic($destination . '/inquiries.sqlite', $payload['database']); self::atomic($destination . '/inquiry.key', $payload['inquiry_key']);
            $db = new PDO('sqlite:' . $destination . '/inquiries.sqlite', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            $integrity = $db->query('PRAGMA integrity_check')->fetchColumn(); $counts = self::counts($db); $db = null;
            if ($integrity !== 'ok' || $counts !== $payload['counts']) { throw new RuntimeException('restore_verification_failed'); }
            return ['integrity' => $integrity, 'counts' => $counts, 'database_sha256' => $payload['database_sha256'], 'created' => $payload['created']];
        } catch (Throwable $e) {
            foreach (['inquiries.sqlite', 'inquiry.key'] as $file) { if (is_file($destination . '/' . $file)) { unlink($destination . '/' . $file); } }
            rmdir($destination); throw $e;
        }
    }
    public function drill(): array {
        $this->prepare();
        $lock = fopen($this->directory . '/backup.lock', 'c+b');
        if (!$lock || !flock($lock, LOCK_EX)) { throw new RuntimeException('lock_unavailable'); }
        $destination = $this->directory . '/.restore-test-' . bin2hex(random_bytes(12));
        try {
            $latest = $this->metadata()['latest'] ?? '';
            if (!is_string($latest) || !preg_match('/\Achange-\d{8}-\d{6}-[a-f0-9]{12}\.bzbk\z/', $latest)) { throw new RuntimeException('no_backup'); }
            $result = $this->restore($this->directory . '/' . $latest, $destination);
            $this->record(['last_drill' => $this->now(), 'drill_counts' => $result['counts'], 'drill_archive' => $latest, 'drill_failed' => false]);
            return $result;
        } catch (Throwable $e) {
            try { $this->record(['drill_failed' => true]); } catch (Throwable) {} throw $e;
        } finally {
            // Only the two files created in this random, private staging directory are removed.
            foreach (['inquiries.sqlite', 'inquiry.key'] as $name) { if (is_file($destination . '/' . $name)) { unlink($destination . '/' . $name); } }
            if (is_dir($destination)) { rmdir($destination); }
            flock($lock, LOCK_UN); fclose($lock);
        }
    }
    public function status(): array {
        $files = [];
        foreach (glob($this->directory . '/*.bzbk') ?: [] as $path) {
            if (is_link($path) || !preg_match('/\A(?:daily-\d{8}|change-\d{8}-\d{6}-[a-f0-9]{12})\.bzbk\z/', basename($path))) { continue; }
            $files[] = ['name' => basename($path), 'bytes' => filesize($path)];
        }
        return $this->metadata() + ['files' => $files, 'days' => 14, 'change_copies' => 24];
    }
    /** A backup failure must not turn a persisted customer request into a false submission error. */
    public static function automatic(string $storage, string $reason = 'daily'): void {
        $failed = false;
        set_error_handler(static function(int $severity, string $message, string $file, int $line): never { throw new ErrorException('Backup operation failed', 0, $severity, $file, $line); });
        try { (new self($storage))->run($reason); }
        catch (Throwable) { $failed = true; }
        finally { restore_error_handler(); }
        if ($failed) { error_log('BUZLIKE inquiry backup failed; check owner backup status'); }
    }
}
