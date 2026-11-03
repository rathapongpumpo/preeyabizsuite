<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/src/InquiryService.php';
$directory = sys_get_temp_dir() . '/buzlike-inquiry-test-' . bin2hex(random_bytes(6));
$checks = []; $mail = []; $pending = null; $service = null;
$check = function(string $name, bool $ok) use (&$checks): void { $checks[] = ['name' => $name, 'passed' => $ok]; if (!$ok) { throw new RuntimeException($name); } };
$fails = function(string $name, Closure $work, int $code) use ($check): void {
    try { $work(); $check($name, false); } catch (InquiryProblem $e) { $check($name, $e->status === $code); }
};
$data = ['name' => 'ทดสอบ ลูกค้า', 'contact' => 'qa-line-id', 'email' => 'qa@example.com', 'notes' => 'ข้อมูลทดสอบภาษาไทย',
    'systems' => ['wms'], 'model' => 'template', 'budget' => '15to30', 'consent' => true, 'website' => '', 'price' => '1 บาท'];
$key = str_repeat('a', 32);
$service = new InquiryService($directory, function($id, $body, $reply) use (&$mail, &$pending, &$service, &$data, $key): bool {
    $mail[] = compact('id', 'body', 'reply');
    if (count($mail) === 1) { $pending = $service->submit($data, $key, 'session', '127.0.0.1'); }
    return true;
});
try {
    $first = $service->submit($data, $key, 'session', '127.0.0.1');
    $check('valid inquiry accepted with receipt and queued notification', $first['ok'] && $first['mailQueued'] && preg_match('/^BZ-\d{6}-[A-F0-9]{12}$/', $first['id']) === 1);
    $check('overlapping duplicate returns pending receipt without a second email', $pending['id'] === $first['id'] && $pending['mailState'] === 'sending' && count($mail) === 1);
    $duplicate = $service->submit($data, $key, 'session', '127.0.0.1');
    $check('network retry reuses receipt and does not notify again', $duplicate['id'] === $first['id'] && count($mail) === 1);
    $check('email contains Thai contacts, matching reference and server-calculated price', str_contains($mail[0]['body'], $data['name']) && str_contains($mail[0]['body'], $first['id']) && str_contains($mail[0]['body'], '15,000 – 25,000 บาท') && $mail[0]['reply'] === 'qa@example.com');
    $fails('changed payload cannot reuse an idempotency key', fn() => $service->submit(array_replace($data, ['name' => 'Changed']), $key, 'session', '127.0.0.1'), 409);
    foreach ([['name', "x\r\nBcc: victim@example.com"], ['email', "a@example.com\r\nBcc:x@example.com"], ['email', 'bad'], ['contact', ' '], ['name', ['nested']], ['notes', str_repeat('ก', 6001)], ['systems', ['unknown']], ['systems', []], ['model', 'fake'], ['budget', 'fake'], ['website', 'spam'], ['consent', false]] as [$field, $value]) {
        $fails('reject invalid ' . $field . ' ' . count($checks), fn() => $service->normalize(array_replace($data, [$field => $value])), 422);
    }
    foreach (['template', 'scratch', 'retainer'] as $model) {
        $p = array_replace($data, ['model' => $model, 'systems' => ['wms', 'pos', 'crm']]);
        $body = $service->message('BZ-TEST', $service->normalize($p));
        $expected = ['template' => '40,000 – 65,000 บาท', 'scratch' => '65,000 – 100,000+ บาท', 'retainer' => '5,000 – 12,000 บาท/เดือน'][$model];
        $check('server pricing for ' . $model, str_contains($body, $expected));
    }
    $failure = new InquiryService($directory, static fn() => false);
    $failed = $failure->submit($data, str_repeat('b', 32), 'session', '127.0.0.2');
    $db = new PDO('sqlite:' . $directory . '/inquiries.sqlite');
    $q = $db->prepare('SELECT mail_state,payload FROM inquiries WHERE id=?'); $q->execute([$failed['id']]); $stored = $q->fetch(PDO::FETCH_ASSOC);
    $check('mail failure preserves the lead and reports notification failure honestly', $failed['ok'] && !$failed['mailQueued'] && $stored['mail_state'] === 'failed' && json_decode($stored['payload'], true)['name'] === $data['name']);
    $q = $db->prepare('UPDATE inquiries SET mail_updated=? WHERE id=?'); $q->execute([time() - 61, $failed['id']]);
    $retry = $service->submit($data, str_repeat('b', 32), 'session', '127.0.0.2');
    $check('failed notification can retry without creating another lead', $retry['id'] === $failed['id'] && $retry['mailQueued']);
    $q = $db->prepare("UPDATE inquiries SET mail_state='sending',mail_updated=? WHERE id=?"); $q->execute([time() - 301, $failed['id']]);
    $recovered = $service->submit($data, str_repeat('b', 32), 'session', '127.0.0.2');
    $check('retry recovers an interrupted stale notification', $recovered['id'] === $failed['id'] && $recovered['mailQueued']);
    for ($i=0; $i<5; $i++) { $service->submit($data, str_pad(dechex(100+$i), 32, '0', STR_PAD_LEFT), 'rate-session', '127.0.0.3'); }
    $fails('per-IP limit prevents a sixth new notification', fn() => $service->submit($data, str_repeat('c', 32), 'rate-session', '127.0.0.3'), 429);
    $q = $db->query('SELECT COUNT(*) FROM inquiries'); $check('only unique accepted leads are stored', (int) $q->fetchColumn() === 7);
    $q->closeCursor();
    $check('no raw visitor IP is stored', !str_contains((string) $db->query('SELECT group_concat(ip_hash) FROM inquiries')->fetchColumn(), '127.0.0.'));
    $db->exec("INSERT INTO inquiries SELECT 'BZ-OLD','old-key',fingerprint,ip_hash,payload," . (time()-91*86400) . ",mail_state,attempts,mail_updated FROM inquiries LIMIT 1");
    $pruner = new InquiryService($directory, static fn() => true);
    $check('expired contacts are purged when the API is next used', (int) $db->query("SELECT COUNT(*) FROM inquiries WHERE id='BZ-OLD'")->fetchColumn() === 0);
    $pruner = null;
    echo json_encode(['checks' => $checks], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL;
} finally {
    $q = null; $db = null; $service = null; $failure = null;
    foreach (glob($directory . '/*') ?: [] as $file) { @unlink($file); }
    @rmdir($directory);
}
