<?php
declare(strict_types=1);

function siteConfig(): array {
    static $config;
    return $config ??= json_decode((string) file_get_contents(__DIR__ . '/SiteConfig.json'), true, 512, JSON_THROW_ON_ERROR);
}
