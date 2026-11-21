<?php
declare(strict_types=1);

$public = __DIR__ . '/public';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$file = realpath($public . $path);

if ($file !== false && str_starts_with($file, realpath($public)) && is_file($file)) {
    if (str_ends_with($file, '.md')) {
        header('Content-Type: text/markdown; charset=utf-8');
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'HEAD') { readfile($file); }
        exit;
    }
    return false;
}

require $public . '/index.php';
