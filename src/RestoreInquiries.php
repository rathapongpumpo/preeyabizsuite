<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/InquiryBackup.php';
try {
    if ($argc !== 4) { throw new RuntimeException('Usage: php RestoreInquiries.php ARCHIVE KEY_FILE NEW_PRIVATE_DIRECTORY'); }
    $result = (new InquiryBackup(dirname(__DIR__) . '/var'))->restore($argv[1], $argv[3], $argv[2]);
    echo json_encode($result, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . "\n";
} catch (Throwable $e) { fwrite(STDERR, 'Restore stopped: ' . $e->getMessage() . "\n"); exit(1); }
