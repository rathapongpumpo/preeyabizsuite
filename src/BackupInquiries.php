<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/InquiryBackup.php';
try {
    $backup = new InquiryBackup(dirname(__DIR__) . '/var');
    $result = $backup->run(in_array('--force', $argv, true) ? 'manual' : 'cron');
    if (in_array('--verify', $argv, true)) { $result['restore_test'] = $backup->drill(); }
    echo json_encode($result, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . "\n";
} catch (Throwable) { fwrite(STDERR, "BUZLIKE inquiry backup failed; check owner backup status\n"); exit(1); }
