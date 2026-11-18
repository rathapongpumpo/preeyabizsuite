<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/src/InquiryAdminStore.php';
$directory = sys_get_temp_dir() . '/buzlike-admin-test-' . bin2hex(random_bytes(6));
$checks = [];
$check = static function (string $name, bool $ok) use (&$checks): void { $checks[] = ['name' => $name, 'passed' => $ok]; if (!$ok) { throw new RuntimeException($name); } };
$fails = static function (string $name, Closure $run, int $code) use ($check): void { try { $run(); $check($name, false); } catch (InquiryProblem $e) { $check($name, $e->status === $code); } };
$store = $service = $db = null;
try {
    $store = new InquiryAdminStore($directory);
    $check('no default owner or public credentials', $store->account() === null);
    $store->provision('support@buzlike.com', 'Temporary-admin-test-2026!');
    $account = $store->account();
    $check('owner password hashed and first change required', $account['password_hash'] !== 'Temporary-admin-test-2026!' && password_verify('Temporary-admin-test-2026!', $account['password_hash']) && (int) $account['must_change'] === 1);
    try { $store->provision('another@example.com', 'Another-test-password-26'); $check('existing owner cannot be silently overwritten', false); }
    catch (RuntimeException $e) { $check('existing owner cannot be silently overwritten', str_contains($e->getMessage(), 'already exists')); }
    $check('wrong email and password rejected', $store->authenticate('wrong@example.com', 'Temporary-admin-test-2026!', 'auth') === null && $store->authenticate('support@buzlike.com', 'wrong', 'auth') === null);
    $check('valid case-insensitive email login', $store->authenticate('SUPPORT@BUZLIKE.COM', 'Temporary-admin-test-2026!', 'auth')['version'] === $account['version']);
    $fails('short password rejected', static fn() => InquiryAdminStore::validatePassword('short'), 422);
    $fails('bcrypt truncation cannot allow overlong password', static fn() => InquiryAdminStore::validatePassword(str_repeat('ก', 25)), 422);
    $fails('new password cannot reuse old password', fn() => $store->changePassword('Temporary-admin-test-2026!', 'Temporary-admin-test-2026!', $account['version'], 'change'), 422);
    $fails('current password required', fn() => $store->changePassword('wrong', 'My-owner-password-2026!', $account['version'], 'change'), 422);
    $changed = $store->changePassword('Temporary-admin-test-2026!', 'My-owner-password-2026!', $account['version'], 'change');
    $check('password change invalidates other sessions and clears initial requirement', $changed['version'] !== $account['version'] && (int) $changed['must_change'] === 0);
    $fails('old session version cannot change password', fn() => $store->changePassword('My-owner-password-2026!', 'Yet-another-password-26', $account['version'], 'change'), 401);
    for ($i = 0; $i < 8; $i++) { $store->authenticate('support@buzlike.com', 'bad', 'rate-test'); }
    $fails('rate limited even with valid credentials after threshold', fn() => $store->authenticate('support@buzlike.com', 'My-owner-password-2026!', 'rate-test'), 429);
    $data = ['name' => 'ลูกค้า ทดสอบ %_ SQL', 'contact' => 'qa-line-id', 'email' => 'qa@example.com', 'notes' => '<script>alert(1)</script> ภาษาไทย', 'systems' => ['crm'], 'model' => 'template', 'budget' => '15to30', 'consent' => true];
    $service = new InquiryService($directory, static fn() => true);
    $first = $service->submit($data, str_repeat('a', 32), 'test', 'first');
    $id = $first['id'];
    $check('existing public submission works after admin schema migration', $first['mailQueued'] && $store->detail($id)['status'] === 'new');
    $check('legacy inquiry has empty note and zero version', $store->detail($id)['note'] === '' && (int) $store->detail($id)['version'] === 0);
    $store->update($id, 'contacted', 'ติดต่อแล้ว นัดคุยพรุ่งนี้', 0, 'support@buzlike.com');
    $detail = $store->detail($id);
    $check('follow-up persists separately from original customer payload', $detail['status'] === 'contacted' && $detail['payload']['notes'] === $data['notes'] && $detail['note'] === 'ติดต่อแล้ว นัดคุยพรุ่งนี้');
    $check('audit contains status actor and timestamp', count($detail['activity']) === 1 && $detail['activity'][0]['actor'] === 'support@buzlike.com');
    $fails('stale tab cannot overwrite a newer change', fn() => $store->update($id, 'lost', 'stale', 0, 'support@buzlike.com'), 409);
    $check('conflict preserves current state and history', $store->detail($id)['status'] === 'contacted' && count($store->detail($id)['activity']) === 1);
    $store->update($id, 'contacted', 'ติดต่อแล้ว นัดคุยพรุ่งนี้', 1, 'support@buzlike.com');
    $check('repeated identical update creates no duplicate history', (int) $store->detail($id)['version'] === 1 && count($store->detail($id)['activity']) === 1);
    $fails('unknown follow-up status rejected', fn() => $store->update($id, 'fake', '', 1, 'owner'), 422);
    $fails('overlong note rejected', fn() => $store->update($id, 'won', str_repeat('ก', 4001), 1, 'owner'), 422);
    $fails('nonexistent inquiry cannot receive an orphan follow-up', fn() => $store->update('BZ-000000-000000000000', 'new', '', 0, 'owner'), 404);
    $check('Thai customer search finds actual payload', $store->listing('ลูกค้า ทดสอบ')['total'] === 1);
    $check('wildcard symbols are searched literally', $store->listing('%_')['total'] === 1 && $store->listing('nonexistent%')['total'] === 0);
    $check('SQL injection query cannot expand results', $store->listing("' OR 1=1 --")['total'] === 0);
    $check('follow-up status filter uses stored status', $store->listing('', 'contacted')['total'] === 1 && $store->listing('', 'new')['total'] === 0);
    $second = (new InquiryService($directory, static fn() => false))->submit(array_replace($data, ['name' => 'เมลไม่สำเร็จ']), str_repeat('b', 32), 'test', 'second');
    $check('failed notification remains accessible to owner', $store->listing('', '', 'attention')['total'] === 1 && $store->detail($second['id'])['mail_state'] === 'failed');
    $db = new PDO('sqlite:' . $directory . '/inquiries.sqlite');
    $q = $db->prepare("UPDATE inquiries SET mail_state='sending',mail_updated=? WHERE id=?"); $q->execute([time() - 301, $id]);
    $check('stale sending notification appears in attention filter', $store->listing('', '', 'attention')['total'] === 2);
    $q = $db->prepare('UPDATE inquiries SET mail_updated=? WHERE id=?'); $q->execute([time(), $id]);
    $check('fresh pending notification is not falsely marked stale', $store->listing('', '', 'attention')['total'] === 1);
    for ($i = 0; $i < 24; $i++) { $service->submit(array_replace($data, ['name' => 'ลูกค้า ' . $i]), str_pad(dechex($i + 100), 32, '0', STR_PAD_LEFT), 'test', 'ip-' . $i); }
    $listing = $store->listing('', '', '', 1); $page2 = $store->listing('', '', '', 2);
    $check('pagination returns 20 then remaining 6 without duplicate rows', count($listing['rows']) === 20 && count($page2['rows']) === 6 && !array_intersect(array_column($listing['rows'], 'id'), array_column($page2['rows'], 'id')));
    $check('metrics use real totals and status values', (int) $listing['counts']['total'] === 26 && (int) $listing['counts']['new'] === 25);
    $check('out-of-range pagination is clamped', $store->listing('', '', '', 999)['page'] === 2);
    $check('admin responses omit raw IP hashes secrets and dedupe keys', !str_contains(json_encode($listing), 'ip_hash') && !isset($detail['dedupe'], $detail['fingerprint']));
    $q = $db->prepare('UPDATE inquiries SET created=? WHERE id=?'); $q->execute([time() - 91 * 86400, $id]);
    $newStore = new InquiryAdminStore($directory);
    $check('retention removes original inquiry and follow-up history together', $newStore->detail($id) === null && (int) $db->query("SELECT COUNT(*) FROM inquiry_followups")->fetchColumn() === 0 && (int) $db->query('SELECT COUNT(*) FROM inquiry_activity')->fetchColumn() === 0);
    $before = $changed['version']; $store->provision('support@buzlike.com', 'Reset-owner-password-2026!', true);
    $check('CLI recovery invalidates sessions and requires a new password', $store->account()['version'] !== $before && (int) $store->account()['must_change'] === 1);
    echo json_encode(['checks' => $checks], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL;
} finally {
    $q = $newStore = $store = $service = $db = null;
    require_once __DIR__ . '/cleanup_test_storage.php'; cleanupTestStorage($directory);
}
