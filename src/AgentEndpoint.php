<?php
declare(strict_types=1);
require_once __DIR__ . '/SiteConfig.php';
require_once __DIR__ . '/AgentCatalog.php';

function prefersMarkdown(string $accept): bool {
    $ranges = [];
    foreach (explode(',', strtolower($accept)) as $part) {
        $parts = array_map('trim', explode(';', $part)); $type = array_shift($parts); $q = 1.0;
        foreach ($parts as $parameter) {
            if (str_starts_with($parameter, 'q=')) {
                $raw = substr($parameter, 2); $q = preg_match('/\A(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)\z/', $raw) ? (float) $raw : 0;
            }
        }
        $ranges[$type] = max($ranges[$type] ?? 0, $q);
    }
    if (($ranges['text/markdown'] ?? 0) <= 0) { return false; }
    $html = $ranges['text/html'] ?? $ranges['text/*'] ?? $ranges['*/*'] ?? 0;
    return $ranges['text/markdown'] >= $html;
}

function publicDiscoveryHeaders(string $markdown): void {
    $base = siteConfig()['origin'];
    header('Vary: Accept', false);
    header('X-Content-Type-Options: nosniff');
    header('Link: <' . $base . '/llms.txt>; rel="describedby"; type="text/plain", <' . $base . $markdown . '>; rel="alternate"; type="text/markdown", <' . $base . '/.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"');
}

function handleAgentRequest(string $path): void {
    if ($path === '/mcp') { require_once __DIR__ . '/McpEndpoint.php'; handleMcpEndpoint(); }
    if ($path === '/mcp/server-card') {
        if (!in_array($_SERVER['REQUEST_METHOD'] ?? '', ['GET', 'HEAD'], true)) { header('Allow: GET, HEAD'); http_response_code(405); exit; }
        header('Content-Type: application/mcp-server-card+json; charset=utf-8'); header('X-Content-Type-Options: nosniff');
        if ($_SERVER['REQUEST_METHOD'] !== 'HEAD') { readfile(AgentCatalog::publicDirectory() . '/.well-known/mcp/server-card.json'); } exit;
    }
    $documents = ['/' => 'index', '/about' => 'about', '/contact' => 'contact', '/pricing' => 'pricing', '/privacy' => 'privacy', '/terms' => 'terms'];
    if (!isset($documents[$path])) { return; }
    if (!in_array($_SERVER['REQUEST_METHOD'] ?? '', ['GET', 'HEAD'], true)) { header('Allow: GET, HEAD'); http_response_code(405); exit; }
    $slug = $documents[$path]; $markdown = '/' . $slug . '.md';
    publicDiscoveryHeaders($markdown);
    if (prefersMarkdown($_SERVER['HTTP_ACCEPT'] ?? '')) {
        header('Content-Type: text/markdown; charset=utf-8'); $file = AgentCatalog::publicDirectory() . $markdown;
    } else {
        header('Content-Type: text/html; charset=utf-8'); $file = AgentCatalog::publicDirectory() . '/' . ($path === '/' ? 'index.html' : 'info-pages/' . $slug . '.html');
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'HEAD') { readfile($file); } exit;
}
