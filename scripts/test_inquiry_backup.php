<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/src/InquiryAdminStore.php';
require_once __DIR__ . '/cleanup_test_storage.php';
if (($argv[1] ?? '') === '--worker') { echo json_encode((new InquiryBackup($argv[2]))->run('change')); exit; }
$directory = sys_get_temp_dir() . '/buzlike-backup-test-' . bin2hex(random_bytes(6));
$storage = $directory . '/var'; mkdir($directory, 0700);
$checks = []; $db = $owner = $service = $restoredStore = null;
$check = static function(string $name, bool $ok) use (&$checks): void { $checks[] = ['name' => $name, 'passed' => $ok]; if (!$ok) { throw new RuntimeException($name); } };
$reject = static function(string $name, Closure $action) use ($check): void { try { $action(); } catch (RuntimeException) { $check($name, true); return; } $check($name, false); };
$now = time(); $backup = new InquiryBackup($storage, static function() use (&$now) { return $now; });
try {
    $check('no database is skipped without creating an empty replacement', $backup->run()['state'] === 'no_database' && !file_exists($storage));
    $owner = new InquiryAdminStore($storage); $owner->provision('owner@example.com', 'Owner-backup-fixture-2026!');
    $check('owner provisioning automatically creates encrypted backup', !empty($backup->status()['latest']));
    $data = ['name' => 'ลูกค้า สำรองข้อมูล', 'contact' => 'qa-only', 'email' => 'qa@example.com', 'notes' => 'ทดสอบกู้คืนภาษาไทย', 'systems' => ['crm'], 'model' => 'template', 'budget' => '15to30', 'consent' => true];
    $service = new InquiryService($storage, static fn() => true); $first = $service->submit($data, str_repeat('a', 32), 'backup-test', 'backup-test-ip');
    $check('saved inquiry and final notification state trigger new backups', $backup->status()['sequence'] >= 3);
    $owner->update($first['id'], 'quoting', 'รอเสนอราคา ภาษาไทย', 0, 'owner@example.com');
    $state = $backup->status(); $archive = $storage . '/backups/' . $state['latest'];
    $bytes = file_get_contents($archive); $originalKey = file_get_contents($storage . '/backup-encryption.key');
    $check('archive hides customer content SQLite header and owner password hash', !str_contains($bytes, $data['name']) && !str_contains($bytes, 'SQLite format 3') && !str_contains($bytes, $owner->account()['password_hash']));
    $check('encryption key is not embedded in archive', strlen($originalKey) === 64 && !str_contains($bytes, $originalKey));
    $check('at most one daily copy is refreshed on the same day', count(glob($storage . '/backups/daily-*.bzbk')) === 1);
    $restored = $directory . '/restored'; $result = $backup->restore($archive, $restored);
    $check('restore validates database integrity and expected table counts', $result['integrity'] === 'ok' && $result['counts']['inquiries'] === 1 && $result['counts']['admin_account'] === 1 && $result['counts']['inquiry_followups'] === 1 && $result['counts']['inquiry_activity'] === 1);
    $check('restored database hash matches manifest', hash_file('sha256', $restored . '/inquiries.sqlite') === $result['database_sha256']);
    $check('inquiry HMAC key is restored exactly', file_get_contents($restored . '/inquiry.key') === file_get_contents($storage . '/inquiry.key'));
    $restoredStore = new InquiryAdminStore($restored);
    $check('restored owner can authenticate using original password', $restoredStore->authenticate('owner@example.com', 'Owner-backup-fixture-2026!', 'restore-test') !== null);
    $check('restored customer brief follow-up and activity work through application', $restoredStore->detail($first['id'])['payload']['notes'] === $data['notes'] && $restoredStore->detail($first['id'])['note'] === 'รอเสนอราคา ภาษาไทย' && count($restoredStore->detail($first['id'])['activity']) === 1);
    $reject('restore refuses existing destination and preserves its contents', fn() => $backup->restore($archive, $restored));
    $reject('restore cannot target active storage', fn() => $backup->restore($archive, $storage));
    $reject('restore rejects public destination', fn() => $backup->restore($archive, dirname(__DIR__) . '/public/.backup-test-forbidden'));
    $check('forbidden public restore did not create any file', !file_exists(dirname(__DIR__) . '/public/.backup-test-forbidden'));
    $bad = $directory . '/tampered.bzbk'; $tampered = $bytes; $tampered[strlen($tampered) - 10] = chr(ord($tampered[strlen($tampered) - 10]) ^ 1); file_put_contents($bad, $tampered);
    $reject('authenticated encryption rejects changed ciphertext', fn() => $backup->restore($bad, $directory . '/bad-restore'));
    $check('failed authentication creates no restoration directory', !file_exists($directory . '/bad-restore'));
    file_put_contents($bad, substr($bytes, 0, 30));
    $reject('truncated archive is rejected', fn() => $backup->restore($bad, $directory . '/short-restore'));
    $wrongKey = $directory . '/wrong.key'; file_put_contents($wrongKey, bin2hex(random_bytes(32)));
    $reject('wrong recovery key is rejected', fn() => $backup->restore($archive, $directory . '/wrong-restore', $wrongKey));
    $reject('missing archive rejected before destination creation', fn() => $backup->restore($directory . '/missing.bzbk', $directory . '/missing-restore'));
    $savedHash = hash_file('sha256', $archive); file_put_contents($storage . '/backup-encryption.key', '');
    $reject('lost key is never silently replaced while encrypted backups exist', fn() => $backup->run('manual'));
    $check('lost-key failure preserves last good archive and empty recovery key', hash_file('sha256', $archive) === $savedHash && file_get_contents($storage . '/backup-encryption.key') === '');
    file_put_contents($storage . '/backup-encryption.key', $originalKey);
    $drill = $backup->drill();
    $check('restore drill validates real encrypted archive', $drill['integrity'] === 'ok' && $backup->status()['last_drill'] === $now);
    $check('drill temporary database and key are removed', !glob($storage . '/backups/.restore-test-*'));
    $before = $backup->status()['sequence']; $backup->run('daily');
    $check('ordinary repeated page checks do not duplicate current daily snapshot', $backup->status()['sequence'] === $before);
    $backup->run('cron'); $check('CLI invocation is recorded without claiming scheduler installation', $backup->status()['last_cron'] === $now);
    $db = new PDO('sqlite:' . $storage . '/inquiries.sqlite');
    $hashBefore = hash_file('sha256', $storage . '/inquiries.sqlite'); $backup->run('manual');
    $check('backup does not mutate live database', hash_file('sha256', $storage . '/inquiries.sqlite') === $hashBefore);
    // Two workers wait for the same lock, then each publish a complete, uniquely sequenced backup.
    $lock = fopen($storage . '/backups/backup.lock', 'c+b'); flock($lock, LOCK_EX);
    $workers = [];
    for ($i = 0; $i < 2; $i++) { $pipes = []; $process = proc_open([PHP_BINARY, __FILE__, '--worker', $storage], [0 => ['pipe','r'], 1 => ['pipe','w'], 2 => ['pipe','w']], $pipes); fclose($pipes[0]); $workers[] = [$process, $pipes]; }
    $sequence = $backup->status()['sequence']; flock($lock, LOCK_UN); fclose($lock);
    $published = [];
    foreach ($workers as [$process, $pipes]) { $text = stream_get_contents($pipes[1]); $err = stream_get_contents($pipes[2]); fclose($pipes[1]); fclose($pipes[2]); $code = proc_close($process); $check('concurrent worker finished without corruption ' . count($published), $code === 0 && $err === ''); $published[] = json_decode($text, true)['archive']; }
    $check('concurrent backups serialize and publish different intact files', count(array_unique($published)) === 2 && $backup->status()['sequence'] === $sequence + 2 && is_file($storage . '/backups/' . $published[0]) && is_file($storage . '/backups/' . $published[1]));
    file_put_contents($storage . '/backup-encryption.key', 'invalid');
    $receipt = $service->submit(array_replace($data, ['name' => 'รับคำขอแม้สำรองผิดพลาด']), str_repeat('b', 32), 'backup-test', 'different-ip');
    $check('backup failure does not lose accepted inquiry or fake a submission failure', $receipt['ok'] && $owner->detail($receipt['id']) !== null && $backup->status()['last_error'] === 'backup_failed');
    file_put_contents($storage . '/backup-encryption.key', $originalKey); $backup->run('manual');
    $check('successful recovery clears backup error flag', $backup->status()['last_error'] === null);
    $unknown = $storage . '/backups/owner-notes.txt'; file_put_contents($unknown, 'keep unrelated files');
    $initialDay = (new DateTimeImmutable('@' . $now))->setTimezone(new DateTimeZone('Asia/Bangkok'))->format('Ymd');
    for ($i = 1; $i <= 16; $i++) { $now += 86400; $backup->run('daily'); }
    $check('daily retention keeps exactly 14 calendar days', count(glob($storage . '/backups/daily-*.bzbk')) === 14 && !file_exists($storage . '/backups/daily-' . $initialDay . '.bzbk'));
    for ($i = 0; $i < 30; $i++) { $backup->run('change'); }
    $check('rapid changes retain exactly 24 most recent change copies', count(glob($storage . '/backups/change-*.bzbk')) === 24);
    $check('latest backup always remains restorable after rotation', is_file($storage . '/backups/' . $backup->status()['latest']) && $backup->drill()['integrity'] === 'ok');
    $check('retention never removes unrelated files', is_file($unknown));
    $check('total encrypted files bounded at 38', count($backup->status()['files']) <= 38);
    $check('no plaintext snapshot or unfinished archive remains', !glob($storage . '/backups/.snapshot-*.sqlite') && !glob($storage . '/backups/*.pending-*'));
    echo json_encode(['checks' => $checks], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL;
} finally {
    $db = $owner = $service = $restoredStore = null;
    cleanupTestStorage($directory);
}
