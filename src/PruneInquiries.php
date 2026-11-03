<?php
declare(strict_types=1);
// Optional maintenance command; normal API requests also purge expired data.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$path = dirname(__DIR__) . '/var/inquiries.sqlite';
if (!is_file($path)) { exit; }
$db = new PDO('sqlite:' . $path, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$db->exec('PRAGMA busy_timeout=5000'); $db->exec('PRAGMA secure_delete=ON');
$q = $db->prepare('DELETE FROM inquiries WHERE created < ?'); $q->execute([time() - 90 * 86400]);
$q = $db->prepare('DELETE FROM inquiry_limits WHERE started < ?'); $q->execute([time() - 86400]);
