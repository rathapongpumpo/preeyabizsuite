<?php
declare(strict_types=1);
function cleanupTestStorage(string $directory): void {
    $resolved = realpath($directory); $temporary = realpath(sys_get_temp_dir());
    if (!$resolved) { return; }
    if (dirname($resolved) !== $temporary || !preg_match('/\Abuzlike-(?:inquiry|admin|backup)-test-[a-f0-9]+\z/', basename($resolved)) || is_link($directory)) { throw new RuntimeException('Unsafe test cleanup path'); }
    $entries = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($resolved, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($entries as $entry) { $path = $entry->getPathname(); if ($entry->isLink() || $entry->isFile()) { unlink($path); } else { rmdir($path); } }
    rmdir($resolved);
}
