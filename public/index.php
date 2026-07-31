<?php
declare(strict_types=1);

$registry = require dirname(__DIR__) . '/src/ProjectRegistry.php';
require_once dirname(__DIR__) . '/src/ExternalProxy.php';

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = rtrim($path, '/') ?: '/';

if (preg_match('#^/external/(ecommerce|tilt)(/.*)?$#', $path, $match)) {
    ExternalProxy::handle($match[1], $match[2] ?? '/');
}

$routeAliases = [
    '/usa-thai-shipping/admin' => '/usa-thai-shipping',
    '/usa-thai-shipping/customer' => '/usa-thai-shipping',
];
$projectPath = $routeAliases[$path] ?? $path;

if (!isset($registry[$projectPath])) {
    http_response_code(404);
    $projectPath = '/';
    $path = '/404';
}

$project = $registry[$projectPath];
$visibleProjects = array_filter($registry, static fn(array $item): bool => ($item['visible'] ?? false) === true);
$pageKey = match ($path) {
    '/' => 'portal',
    '/business-suite' => 'crm',
    '/ecommerce-storefront' => 'external-ecommerce',
    '/tilt-signal-arcade-bar' => 'external-tilt',
    '/usa-thai-shipping' => 'shipping-home',
    '/usa-thai-shipping/admin' => 'shipping-admin',
    '/usa-thai-shipping/customer' => 'shipping-customer',
    '/course' => 'course',
    '/warehouse-management' => 'wms',
    '/project-management' => 'kanban',
    '/pos-system-smart' => 'smartpos',
    '/e-signature' => 'esign',
    '/dashboard-mini' => 'dashboard',
    '/pos-system' => 'classicpos',
    default => 'not-found',
};

$title = $pageKey === 'portal' ? 'PreeyaBizSuite | Interactive Business Demo Suite' : (($project['short'] ?? $project['title']) . ' | PreeyaBizSuite');
$description = $project['description'] ?? 'PreeyaBizSuite Interactive business demo platform';
$projectJson = json_encode($registry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
?>
<!doctype html>
<html lang="th" data-theme="light">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= htmlspecialchars($title, ENT_QUOTES) ?></title>
    <meta name="description" content="<?= htmlspecialchars($description, ENT_QUOTES) ?>">
    <meta name="theme-color" content="#081411">
    <link rel="icon" href="/assets/icon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/assets/app.css">
</head>
<body data-page="<?= htmlspecialchars($pageKey, ENT_QUOTES) ?>" data-route="<?= htmlspecialchars($path, ENT_QUOTES) ?>">
<?php if ($pageKey === 'portal'): ?>
    <div id="app" class="portal-root" aria-live="polite"></div>
<?php elseif ($pageKey === 'not-found'): ?>
    <main class="not-found">
        <p class="eyebrow">404</p>
        <h1>ไม่พบหน้าที่ต้องการ</h1>
        <p>Route นี้ไม่อยู่ในระบบเดโม PreeyaBizSuite</p>
        <a class="btn primary" href="/">กลับหน้า PreeyaBizSuite</a>
    </main>
<?php else: ?>
    <div class="demo-frame">
        <header class="demo-shell">
            <a class="shell-back" href="/" aria-label="กลับหน้า PreeyaBizSuite">← <span>กลับหน้า PreeyaBizSuite</span></a>
            <div class="shell-project">
                <span class="status-dot" aria-hidden="true"></span>
                <strong><?= htmlspecialchars($project['title'], ENT_QUOTES) ?></strong>
            </div>
            <button class="icon-btn" id="project-info-button" type="button" aria-expanded="false">ข้อมูลระบบ</button>
            <div class="info-popover" id="project-info" hidden>
                <button class="popover-close" type="button" aria-label="ปิด">×</button>
                <p class="eyebrow"><?= htmlspecialchars($project['category'] ?? 'Demo', ENT_QUOTES) ?></p>
                <h2><?= htmlspecialchars($project['short'] ?? $project['title'], ENT_QUOTES) ?></h2>
                <p><?= htmlspecialchars($project['description'] ?? '', ENT_QUOTES) ?></p>
                <dl>
                    <dt>เหมาะกับ</dt><dd><?= htmlspecialchars($project['audience'] ?? '', ENT_QUOTES) ?></dd>
                    <dt>ช่วยให้เห็น</dt><dd><?= htmlspecialchars($project['impact'] ?? '', ENT_QUOTES) ?></dd>
                </dl>
                <div class="chip-row">
                    <?php foreach (($project['highlights'] ?? []) as $item): ?>
                        <span class="chip"><?= htmlspecialchars($item, ENT_QUOTES) ?></span>
                    <?php endforeach; ?>
                </div>
            </div>
        </header>
        <main id="app" class="demo-content" aria-live="polite"></main>
    </div>
<?php endif; ?>
<script>window.DEMO_PROJECTS = <?= $projectJson ?: '{}' ?>;</script>
<script src="/assets/app.js" defer></script>
<?php if ($pageKey === 'esign'): ?>
<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js" defer></script>
<?php endif; ?>
</body>
</html>
