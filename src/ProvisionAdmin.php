<?php
declare(strict_types=1);
// Only through SSH/CLI. Credentials arrive over stdin, never in command arguments.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/InquiryAdminStore.php';
try {
    $data = json_decode((string) stream_get_contents(STDIN), true, 8, JSON_THROW_ON_ERROR);
    if (!is_array($data) || !is_string($data['email'] ?? null) || !is_string($data['password'] ?? null)) { throw new RuntimeException('Expected email/password JSON on stdin'); }
    $store = new InquiryAdminStore(dirname(__DIR__) . '/var');
    $store->provision($data['email'], $data['password'], in_array('--reset', $argv, true));
    echo "Owner provisioned; password change required at first sign-in.\n";
} catch (Throwable $e) { fwrite(STDERR, $e->getMessage() . "\n"); exit(1); }
