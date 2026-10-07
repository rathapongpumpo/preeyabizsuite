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
$pageKey = match ($path) {
    '/' => 'portal',
    '/business-suite' => 'crm',
    '/ecommerce-storefront' => 'external-ecommerce',
    '/tilt-signal-arcade-bar' => 'external-tilt',
    '/usa-thai-shipping' => 'shipping-home',
    '/usa-thai-shipping/admin' => 'shipping-admin',
    '/usa-thai-shipping/customer' => 'shipping-customer',
    '/warehouse-management' => 'wms',
    '/pos-system-smart' => 'smartpos',
    '/e-signature' => 'esign',
    '/course' => 'course',
    '/project-management' => 'kanban',
    '/medical-flow' => 'external-medical',
    '/dashboard-mini' => 'dashboard',
    '/pos-system' => 'classicpos',
    default => 'not-found',
};

$title = $pageKey === 'portal' 
    ? 'Preeya | Creative Developer Portfolio — Web App, Back-office & Automation' 
    : (($project['short'] ?? $project['title']) . ' | Preeya Portfolio');
$description = $project['description'] ?? 'Creative Developer Portfolio พัฒนาเว็บแอป ระบบหลังบ้าน และระบบอัตโนมัติสำหรับธุรกิจ';
$projectJson = json_encode($registry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
?>
<!doctype html>
<html lang="th" data-theme="light">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= htmlspecialchars($title, ENT_QUOTES) ?></title>
    <meta name="description" content="<?= htmlspecialchars($description, ENT_QUOTES) ?>">
    <meta name="theme-color" content="#FFF9F2">
    <link rel="icon" href="/assets/icon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Prompt:wght@300;400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="/assets/app.css">
</head>
<body data-page="<?= htmlspecialchars($pageKey, ENT_QUOTES) ?>" data-route="<?= htmlspecialchars($path, ENT_QUOTES) ?>">
<?php if ($pageKey === 'portal'): ?>
    <div id="app" class="portal-root" aria-live="polite"></div>
<?php elseif ($pageKey === 'not-found'): ?>
    <main class="not-found oblo-box">
        <p class="eyebrow" style="color:var(--coral);font-weight:800">404</p>
        <h1 style="font-size:36px;margin:10px 0">ไม่พบหน้าที่ต้องการ</h1>
        <p style="margin-bottom:24px;color:var(--muted)">หน้านี้ไม่อยู่ในรายการระบบที่เปิดให้บริการ หรือถูกปรับปรุงเรียบร้อยแล้ว</p>
        <a class="btn primary" href="/">← กลับหน้าแรกพอร์ตโฟลิโอ</a>
    </main>
<?php else: ?>
    <div class="demo-frame">
        <header class="demo-shell">
            <a class="shell-back" href="/" aria-label="กลับหน้าแรก">← <span>กลับพอร์ตโฟลิโอ</span></a>
            <div class="shell-project">
                <span class="status-dot" aria-hidden="true"></span>
                <strong><?= htmlspecialchars($project['short'] ?? $project['title'], ENT_QUOTES) ?></strong>
                <span class="badge" style="font-size:11px;margin-left:6px">Prototype Demo</span>
            </div>
            <div class="shell-actions">
                <button class="btn small" id="project-info-button" type="button" aria-expanded="false">ℹ️ รายละเอียดระบบ</button>
                <a class="btn small" href="<?= htmlspecialchars($path, ENT_QUOTES) ?>" target="_blank" rel="noopener noreferrer" title="เปิดแท็บแยกใหม่">↗ เปิดแท็บใหม่</a>
            </div>
            <div class="info-popover" id="project-info" hidden>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
                    <div>
                        <span class="badge" style="margin-bottom:6px"><?= htmlspecialchars($project['category_name'] ?? 'ระบบสาธิต', ENT_QUOTES) ?></span>
                        <h2 style="font-size:20px;margin:4px 0"><?= htmlspecialchars($project['short'] ?? $project['title'], ENT_QUOTES) ?></h2>
                    </div>
                    <button class="popover-close" type="button" aria-label="ปิด">×</button>
                </div>
                
                <p style="font-size:13px;line-height:1.5;margin-bottom:14px;color:var(--text)"><?= htmlspecialchars($project['description'] ?? '', ENT_QUOTES) ?></p>

                <div class="popover-section">
                    <strong>🎯 โจทย์และประโยชน์</strong>
                    <p style="font-size:12px;color:var(--muted);margin:2px 0 8px"><?= htmlspecialchars($project['impact'] ?? '', ENT_QUOTES) ?></p>
                </div>

                <div class="popover-section">
                    <strong>🛠️ ขอบเขตที่พัฒนา</strong>
                    <p style="font-size:12px;color:var(--muted);margin:2px 0 8px"><?= htmlspecialchars($project['scope'] ?? 'พัฒนา Interactive Frontend, Client State, LocalStorage Mock', ENT_QUOTES) ?></p>
                </div>

                <div class="popover-section">
                    <strong>💡 วิธีทดลองสั้นๆ</strong>
                    <p style="font-size:12px;color:var(--muted);margin:2px 0 8px"><?= htmlspecialchars($project['quick_try'] ?? 'กดปุ่มและทดลองกรอกข้อมูลเพื่อสังเกตการทำงาน', ENT_QUOTES) ?></p>
                </div>

                <div class="popover-section" style="background:var(--cream-subtle);padding:8px 10px;border-radius:8px;border:1px dashed var(--line);margin-bottom:12px">
                    <strong style="color:var(--coral);font-size:12px">⚠️ สถานะและข้อจำกัด</strong>
                    <p style="font-size:11px;color:var(--muted);margin:2px 0 0"><?= htmlspecialchars($project['constraints'] ?? 'ระบบนี้เป็น Interactive Prototype ข้อมูลบันทึกในเบราว์เซอร์ ไม่ใช่ระบบ Production', ENT_QUOTES) ?></p>
                </div>

                <a class="btn primary small" style="width:100%;text-align:center" href="https://lin.ee/YjK8Ji8" target="_blank" rel="noreferrer">คุยเรื่องพัฒนาระบบลักษณะนี้ ↗</a>
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
