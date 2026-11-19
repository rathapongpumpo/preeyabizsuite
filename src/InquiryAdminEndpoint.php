<?php
declare(strict_types=1);
require_once __DIR__ . '/InquiryAdminStore.php';

function adminEscape(mixed $value): string { return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function adminTime(int|string|null $value): string {
    return $value ? (new DateTimeImmutable('@' . $value))->setTimezone(new DateTimeZone('Asia/Bangkok'))->format('d/m/Y · H:i') : '—';
}
function adminRedirect(string $url): never { header('Location: ' . $url, true, 303); exit; }
function adminFormToken(): string { return '<input type="hidden" name="csrf" value="' . adminEscape($_SESSION['csrf']) . '">'; }
function adminMailLabel(string $value): string {
    return ['queued' => 'โฮสต์รับส่งแล้ว', 'failed' => 'ส่งแจ้งเตือนไม่สำเร็จ', 'sending' => 'รอผลการส่ง'][$value] ?? 'ไม่ทราบสถานะ';
}
function adminBadge(string $status): string { return '<span class="status status--' . adminEscape($status) . '">' . adminEscape(InquiryAdminStore::STATUSES[$status] ?? $status) . '</span>'; }
function adminShell(string $title, string $content, ?array $owner = null, string $error = '', string $flash = ''): never {
    ?><!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex,nofollow,noarchive"><title><?= adminEscape($title) ?> | BUZLIKE SYSTEMS</title>
    <link rel="icon" type="image/svg+xml" href="/assets/portfolio/favicon.svg?v=buzlike-3"><link rel="stylesheet" href="/assets/inquiry-admin.css?v=inquiry-backup-1"></head>
    <body><a class="skip" href="#main">ข้ามไปเนื้อหา</a><header class="admin-header"><a class="wordmark" href="/admin/inquiries">BUZLIKE<span>SYSTEMS / OWNER WORKSPACE</span></a>
    <?php if ($owner): ?><nav aria-label="เมนูหลังบ้าน"><a href="/admin/inquiries">คำขอลูกค้า</a><a href="/admin/backups">สำรองข้อมูล</a><a href="/admin/password">เปลี่ยนรหัสผ่าน</a><form method="post" action="/admin/logout"><?= adminFormToken() ?><button class="text-button" type="submit">ออกจากระบบ</button></form></nav><?php else: ?><a class="website-link" href="/">กลับเว็บไซต์ ↗</a><?php endif; ?></header>
    <main id="main" class="<?= $owner ? 'workspace' : 'auth-layout' ?>"><?php if ($error): ?><div class="notice notice--error" role="alert"><?= adminEscape($error) ?></div><?php endif; ?><?php if ($flash): ?><div class="notice notice--success" role="status"><?= adminEscape($flash) ?></div><?php endif; ?><?= $content ?></main>
    <footer class="admin-footer">พื้นที่สำหรับเจ้าของเว็บไซต์ · เวลาประเทศไทย<?php if ($owner): ?> · <?= adminEscape($owner['email']) ?><?php endif; ?></footer></body></html><?php exit;
}

function handleInquiryAdmin(string $path): never {
    header('Cache-Control: private, no-store, max-age=0'); header('Pragma: no-cache'); header('Vary: Cookie');
    header('X-Content-Type-Options: nosniff'); header('X-Robots-Tag: noindex, nofollow, noarchive');
    header('Referrer-Policy: same-origin'); header('X-Frame-Options: DENY');
    header("Content-Security-Policy: default-src 'none'; style-src 'self'; img-src 'self'; font-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
    header('Content-Type: text/html; charset=UTF-8');
    $owner = null; $error = ''; $flash = ''; $store = null;
    try {
        $local = PHP_SAPI === 'cli-server' && preg_match('/\A(?:127\.0\.0\.1|localhost)(?::\d+)?\z/', $_SERVER['HTTP_HOST'] ?? '');
        $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
        if (!$https && !$local) { adminRedirect(siteConfig()['origin'] . '/admin/login'); }
        $method = $_SERVER['REQUEST_METHOD'] ?? '';
        if (!in_array($method, ['GET', 'POST'], true)) { header('Allow: GET, POST'); throw new InquiryProblem(405, 'วิธีเรียกใช้งานไม่ถูกต้อง'); }
        $known = in_array($path, ['/admin', '/admin/login', '/admin/logout', '/admin/password', '/admin/inquiries', '/admin/backups'], true) || preg_match('#\A/admin/inquiries/BZ-\d{6}-[A-F0-9]{12}\z#', $path);
        if (!$known) { throw new InquiryProblem(404, 'ไม่พบหน้าที่ต้องการ'); }
        $directory = dirname(__DIR__) . '/var';
        $store = new InquiryAdminStore($directory);
        $sessions = $directory . '/admin-sessions';
        if (!is_dir($sessions) && !mkdir($sessions, 0700) && !is_dir($sessions)) { throw new RuntimeException('Session storage unavailable'); }
        chmod($sessions, 0700); session_save_path($sessions);
        ini_set('session.use_strict_mode', '1'); ini_set('session.use_only_cookies', '1'); ini_set('session.gc_maxlifetime', '28800');
        session_name('buzlike_admin');
        session_set_cookie_params(['lifetime' => 0, 'path' => '/admin', 'secure' => !$local, 'httponly' => true, 'samesite' => 'Strict']);
        session_start();
        $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
        $account = $store->account();
        if (isset($_SESSION['owner'])) {
            if (!$account || !hash_equals($account['version'], (string) $_SESSION['owner']) || time() - ($_SESSION['last'] ?? 0) > 1800 || time() - ($_SESSION['started'] ?? 0) > 28800) {
                $_SESSION = ['csrf' => bin2hex(random_bytes(32)), 'flash' => 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่']; session_regenerate_id(true);
            } else { $owner = $account; $_SESSION['last'] = time(); }
        }
        $flash = $_SESSION['flash'] ?? ''; unset($_SESSION['flash']);
        if ($method === 'POST') {
            $allowed = $local ? 'http://' . $_SERVER['HTTP_HOST'] : siteConfig()['origin'];
            if (($_SERVER['HTTP_ORIGIN'] ?? '') !== $allowed || ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') { throw new InquiryProblem(403, 'กรุณาดำเนินการจากหน้าหลังบ้านนี้'); }
            if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 32768) { throw new InquiryProblem(413, 'ข้อมูลยาวเกินไป'); }
            if (!is_string($_POST['csrf'] ?? null) || !hash_equals($_SESSION['csrf'], $_POST['csrf'])) { throw new InquiryProblem(419, 'แบบฟอร์มหมดอายุ กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง'); }
        }
        if ($path === '/admin') { adminRedirect($owner ? '/admin/inquiries' : '/admin/login'); }
        if ($path === '/admin/logout') {
            if ($method !== 'POST') { header('Allow: POST'); throw new InquiryProblem(405, 'กรุณาใช้ปุ่มออกจากระบบ'); }
            $_SESSION = []; session_destroy();
            setcookie('buzlike_admin', '', ['expires' => 1, 'path' => '/admin', 'secure' => !$local, 'httponly' => true, 'samesite' => 'Strict']);
            adminRedirect('/admin/login');
        }
        if ($path === '/admin/login') {
            if ($owner) { adminRedirect($owner['must_change'] ? '/admin/password' : '/admin/inquiries'); }
            if (!$account) { throw new InquiryProblem(503, 'ยังไม่ได้เปิดบัญชีผู้ดูแล กรุณาตั้งค่าผ่านผู้ดูแลโฮสต์'); }
            if ($method === 'POST') {
                $email = $_POST['email'] ?? ''; $password = $_POST['password'] ?? '';
                if (!is_string($email) || !is_string($password) || strlen($email) > 200 || strlen($password) > 256) { throw new InquiryProblem(422, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'); }
                try {
                    $authenticated = $store->authenticate($email, $password, $_SERVER['REMOTE_ADDR'] ?? 'unknown');
                    if ($authenticated) {
                        session_regenerate_id(true); $_SESSION = ['owner' => $authenticated['version'], 'started' => time(), 'last' => time(), 'csrf' => bin2hex(random_bytes(32))];
                        adminRedirect($authenticated['must_change'] ? '/admin/password' : '/admin/inquiries');
                    }
                    $error = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'; http_response_code(422);
                } catch (InquiryProblem $e) { $error = $e->getMessage(); http_response_code($e->status); if ($e->status === 429) { header('Retry-After: 900'); } }
            }
            ob_start(); ?><section class="auth-intro"><p class="eyebrow">PRIVATE WORKSPACE</p><h1>ทุกคำขอ<br>ดูแลต่อได้ที่นี่<span class="accent">.</span></h1><p>พื้นที่จัดการลูกค้าที่ติดต่อผ่านเว็บไซต์<br>ติดตามงานตั้งแต่คำขอแรก จนถึงปิดงาน</p><div class="intro-line"><span></span>สำหรับเจ้าของ BUZLIKE SYSTEMS</div></section>
            <section class="auth-card"><p class="eyebrow">เข้าสู่ระบบ</p><h2>ยินดีต้อนรับกลับ</h2><p class="muted">ใช้บัญชีผู้ดูแลเว็บไซต์ของคุณ</p><form method="post" action="/admin/login" class="stack"><?= adminFormToken() ?><label>อีเมล<input name="email" type="email" autocomplete="username" required maxlength="200" value="<?= adminEscape(is_string($_POST['email'] ?? null) ? $_POST['email'] : '') ?>"></label><label>รหัสผ่าน<input name="password" type="password" autocomplete="current-password" required maxlength="256"></label><button class="button primary" type="submit">เข้าสู่หลังบ้าน <span aria-hidden="true">↗</span></button></form><p class="auth-help">หากลืมรหัสผ่าน ให้รีเซ็ตผ่าน SSH ของโฮสต์<br>หน้านี้ไม่ใช่บัญชีทดลอง CRM</p></section><?php
            adminShell('เข้าสู่หลังบ้าน', ob_get_clean(), null, $error, $flash);
        }
        if (!$owner) { adminRedirect('/admin/login'); }
        if ($owner['must_change'] && $path !== '/admin/password') { adminRedirect('/admin/password'); }
        if ($path === '/admin/backups') {
            $backup = new InquiryBackup($directory);
            if ($method === 'POST') {
                if (!is_string($_POST['action'] ?? null) || !in_array($_POST['action'], ['backup', 'drill'], true)) { throw new InquiryProblem(422, 'กรุณาเลือกคำสั่งที่ถูกต้อง'); }
                try {
                    if ($_POST['action'] === 'backup') { $backup->run('manual'); $_SESSION['flash'] = 'สำรองข้อมูลเรียบร้อยแล้ว'; }
                    else { $backup->drill(); $_SESSION['flash'] = 'ทดสอบกู้คืนสำเร็จในพื้นที่แยก ข้อมูลจริงไม่ได้ถูกเปลี่ยน'; }
                    adminRedirect('/admin/backups');
                } catch (Throwable) { http_response_code(503); $error = 'ดำเนินการไม่สำเร็จ สำเนาเดิมยังคงอยู่ กรุณาตรวจพื้นที่และไฟล์กุญแจบนโฮสต์'; }
            }
            $status = $backup->status();
            $backupAttention = !empty($status['last_error']) || !empty($status['drill_failed']);
            ob_start(); ?><section class="page-heading"><div><p class="eyebrow">DATA RECOVERY</p><h1>สำรองข้อมูล<span class="accent">.</span></h1><p class="muted">คำขอลูกค้า บันทึกติดตาม ประวัติ และบัญชีผู้ดูแล</p></div><span class="status <?= $backupAttention ? 'status--lost' : 'status--won' ?>"><?= $backupAttention ? 'ควรตรวจสอบ' : (empty($status['last_success']) ? 'ยังไม่มีสำเนา' : 'มีสำเนาสำรอง') ?></span></section>
            <?php if (!empty($status['last_error'])): ?><div class="notice notice--error" role="alert">การสำรองครั้งล่าสุดมีข้อผิดพลาดเมื่อ <?= adminTime($status['last_error_at']) ?> น. กรุณาตรวจสอบและกดสำรองอีกครั้ง</div><?php endif; ?>
            <div class="backup-summary"><section class="panel detail-panel"><p class="eyebrow">LATEST BACKUP</p><h2>สำรองสำเร็จล่าสุด</h2><p class="backup-time"><?= adminTime($status['last_success'] ?? null) ?></p><p class="muted">เก็บบน Hostinger ของเว็บนี้ · เข้ารหัส AES-256-GCM</p><form method="post" action="/admin/backups"><?= adminFormToken() ?><input type="hidden" name="action" value="backup"><button type="submit" class="button primary">สำรองตอนนี้ ↗</button></form></section><section class="panel detail-panel"><p class="eyebrow">RESTORE CHECK</p><h2>ทดสอบกู้คืนล่าสุด</h2><p class="backup-time"><?= adminTime($status['last_drill'] ?? null) ?></p><p class="muted"><?= !empty($status['drill_failed']) ? 'การทดสอบล่าสุดไม่ผ่าน กรุณาตรวจสอบสำเนาและกุญแจ' : 'กู้ลงพื้นที่ชั่วคราว ตรวจฐานข้อมูล แล้วลบพื้นที่ทดสอบ' ?></p><form method="post" action="/admin/backups"><?= adminFormToken() ?><input type="hidden" name="action" value="drill"><button type="submit" class="button secondary">ทดสอบกู้คืนสำเนา</button></form></section></div>
            <section class="panel detail-panel backup-policy"><h2>ระบบสำรองทำงานอย่างไร</h2><ul><li>สำรองอัตโนมัติหลังรับคำขอ บันทึกการติดตาม หรือเปลี่ยนบัญชีผู้ดูแล</li><li>เก็บสำเนาประจำวันย้อนหลัง 14 วัน และสำเนาการเปลี่ยนแปลงล่าสุดไม่เกิน 24 ชุดภายในช่วงเดียวกัน</li><li>การเปิดหน้าเว็บไม่เรียกงานสำรองข้อมูล สำรองรายวันแยกทำผ่าน Cron Job</li><li>สำเนาและกุญแจอยู่ในพื้นที่ส่วนตัวนอก public_html ของ Hostinger ยังไม่มีสำเนานอกโฮสต์</li><li>ข้อมูลคำขอเก็บในระบบหลัก 90 วัน ข้อมูลที่ถูกลบอาจยังอยู่ในสำเนาอีก 14 วัน โดยล้างสำเนาเก่าเมื่อรอบสำรองทำงาน</li></ul></section>
            <section class="panel detail-panel backup-policy"><h2>ตั้งเวลาสำรองรายวันผ่าน Hostinger</h2><p class="muted">สำรองรายวันต้องตั้ง Cron Job แบบ PHP ใน hPanel ด้วยไฟล์นี้ ระหว่างที่ยังไม่ได้ตั้งเวลา ระบบยังสำรองหลังบันทึกข้อมูลและกดสำรองเองได้</p><code class="cron-path"><?= adminEscape(__DIR__ . '/BackupInquiries.php') ?></code><p class="muted">ตั้งเวลา UTC 20:00 ทุกวัน = 03:00 น. ประเทศไทย · นาที 0 / ชั่วโมง 20 / วัน เดือน วันในสัปดาห์ เป็น *</p><p class="muted">เรียกผ่านงานตั้งเวลาล่าสุด: <?= adminTime($status['last_cron'] ?? null) ?><?= empty($status['last_cron']) ? ' · ยังไม่พบการเรียก' : ' · เวลานี้บอกการเรียกไฟล์ ไม่ยืนยันว่าได้ติดตั้งรอบเวลาแล้ว' ?></p></section>
            <section class="panel detail-panel backup-policy"><h2>สำเนาที่เก็บอยู่ · <?= count($status['files']) ?> ไฟล์</h2><p class="muted">แสดงเฉพาะชื่อและขนาดไฟล์ กุญแจถอดรหัสไม่แสดงผ่านเว็บ</p><?php if (!$status['files']): ?><p class="muted">ยังไม่มีไฟล์สำรอง</p><?php else: ?><ul class="backup-files"><?php foreach (array_reverse($status['files']) as $file): ?><li><code><?= adminEscape($file['name']) ?></code><span><?= number_format($file['bytes'] / 1024, 1) ?> KB</span></li><?php endforeach; ?></ul><?php endif; ?></section><?php
            adminShell('สำรองข้อมูล', ob_get_clean(), $owner, $error, $flash);
        }
        if ($path === '/admin/password') {
            if ($method === 'POST') {
                try {
                    foreach (['current', 'password', 'confirm'] as $field) { if (!is_string($_POST[$field] ?? null)) { throw new InquiryProblem(422, 'กรุณากรอกรหัสผ่านให้ครบ'); } }
                    if ($_POST['password'] !== $_POST['confirm']) { throw new InquiryProblem(422, 'รหัสผ่านใหม่และช่องยืนยันไม่ตรงกัน'); }
                    $owner = $store->changePassword($_POST['current'], $_POST['password'], $owner['version'], $_SERVER['REMOTE_ADDR'] ?? 'unknown');
                    session_regenerate_id(true); $_SESSION = ['owner' => $owner['version'], 'started' => time(), 'last' => time(), 'csrf' => bin2hex(random_bytes(32)), 'flash' => 'เปลี่ยนรหัสผ่านแล้ว เซสชันเดิมในเครื่องอื่นถูกยกเลิก'];
                    adminRedirect('/admin/inquiries');
                } catch (InquiryProblem $e) { $error = $e->getMessage(); http_response_code($e->status); }
            }
            ob_start(); ?><section class="password-card panel"><p class="eyebrow">ACCOUNT SECURITY</p><h1><?= $owner['must_change'] ? 'ตั้งรหัสผ่านของคุณก่อนเริ่มใช้งาน' : 'เปลี่ยนรหัสผ่าน' ?></h1><p class="muted">อย่างน้อย 12 ตัวอักษร ไม่เกิน 72 ไบต์ · รองรับการวางจากตัวจัดการรหัสผ่าน</p><form method="post" action="/admin/password" class="stack"><?= adminFormToken() ?><label>รหัสผ่านปัจจุบัน<input name="current" type="password" autocomplete="current-password" required maxlength="256"></label><label>รหัสผ่านใหม่<input name="password" type="password" autocomplete="new-password" required minlength="12" maxlength="72"></label><label>ยืนยันรหัสผ่านใหม่<input name="confirm" type="password" autocomplete="new-password" required minlength="12" maxlength="72"></label><button class="button primary" type="submit">บันทึกรหัสผ่านใหม่</button></form></section><?php
            adminShell('เปลี่ยนรหัสผ่าน', ob_get_clean(), $owner, $error, $flash);
        }
        $filters = [];
        foreach (['q', 'status', 'mail', 'page'] as $field) {
            if (isset($_GET[$field]) && !is_string($_GET[$field])) { throw new InquiryProblem(422, 'ตัวกรองไม่ถูกต้อง'); }
            $filters[$field] = trim($_GET[$field] ?? '');
        }
        if (mb_strlen($filters['q']) > 150 || !mb_check_encoding($filters['q'], 'UTF-8') || ($filters['status'] !== '' && !isset(InquiryAdminStore::STATUSES[$filters['status']])) || !in_array($filters['mail'], ['', 'queued', 'failed', 'sending', 'attention'], true) || ($filters['page'] !== '' && !preg_match('/\A[0-9]{1,6}\z/', $filters['page']))) { throw new InquiryProblem(422, 'ตัวกรองไม่ถูกต้อง'); }
        $query = http_build_query(array_filter($filters, static fn($v) => $v !== ''));
        $suffix = $query ? '?' . $query : '';
        $estimate = json_decode((string) file_get_contents(__DIR__ . '/EstimateConfig.json'), true, 512, JSON_THROW_ON_ERROR);
        if ($path === '/admin/inquiries') {
            if ($method !== 'GET') { header('Allow: GET'); throw new InquiryProblem(405, 'กรุณาเลือกรายการก่อนบันทึก'); }
            $list = $store->listing($filters['q'], $filters['status'], $filters['mail'], (int) ($filters['page'] ?: 1));
            ob_start(); ?><section class="page-heading"><div><p class="eyebrow">CUSTOMER INBOX</p><h1>คำขอลูกค้า<span class="accent">.</span></h1><p class="muted">คำขอจากแบบประเมินบนเว็บไซต์ แยกจากข้อมูลในเดโม</p></div><a class="button secondary" href="/admin/inquiries<?= adminEscape($suffix) ?>">รีเฟรชรายการ ↻</a></section>
            <section class="metrics" aria-label="สรุปคำขอทั้งหมด"><?php foreach (['total' => ['ทั้งหมด', ''], 'new' => ['รอติดต่อ', 'new'], 'quoting' => ['กำลังเสนอราคา', 'quoting'], 'won' => ['ปิดงานแล้ว', 'won']] as $key => [$label, $value]): ?><a class="metric <?= $key === 'new' ? 'metric--accent' : '' ?>" href="/admin/inquiries<?= $value ? '?status=' . $value : '' ?>"><span><?= $label ?></span><strong><?= number_format((int) $list['counts'][$key]) ?></strong><small>ดูรายการ <span aria-hidden="true">↗</span></small></a><?php endforeach; ?></section>
            <?php if ($list['attention']): ?><aside class="mail-alert"><div><strong><?= $list['attention'] ?> คำขอที่ควรตรวจการแจ้งเตือน</strong><p>ข้อมูลคำขอยังถูกบันทึกไว้ แม้ส่งเมลไม่สำเร็จหรือรอผลเกิน 5 นาที</p></div><a class="button secondary" href="/admin/inquiries?mail=attention">ดูคำขอเหล่านี้</a></aside><?php endif; ?>
            <section class="panel inbox-panel"><form method="get" action="/admin/inquiries" class="filters"><label class="search-field">ค้นหาคำขอ<input name="q" type="search" maxlength="150" value="<?= adminEscape($filters['q']) ?>" placeholder="ชื่อ เบอร์ อีเมล หรือเลขอ้างอิง"></label><label>สถานะติดตาม<select name="status" aria-label="สถานะติดตาม"><option value="">ทุกสถานะ</option><?php foreach (InquiryAdminStore::STATUSES as $key => $label): ?><option value="<?= $key ?>" <?= $filters['status'] === $key ? 'selected' : '' ?>><?= $label ?></option><?php endforeach; ?></select></label><label>การแจ้งเตือนเมล<select name="mail" aria-label="การแจ้งเตือนเมล"><option value="">ทั้งหมด</option><?php foreach (['attention' => 'ควรตรวจสอบ', 'queued' => 'โฮสต์รับส่งแล้ว', 'failed' => 'ส่งไม่สำเร็จ', 'sending' => 'รอผลการส่ง'] as $key => $label): ?><option value="<?= $key ?>" <?= $filters['mail'] === $key ? 'selected' : '' ?>><?= $label ?></option><?php endforeach; ?></select></label><button class="button primary" type="submit">ค้นหา</button><a class="reset-link" href="/admin/inquiries">ล้างตัวกรอง</a></form>
            <div class="list-heading"><h2>รายการคำขอ</h2><span><?= number_format($list['total']) ?> รายการ<?= $query ? 'ตามตัวกรอง' : '' ?></span></div>
            <?php if (!$list['rows']): ?><div class="empty-state"><span class="empty-mark" aria-hidden="true">↗</span><h3><?= $query ? 'ไม่พบคำขอที่ตรงกับตัวกรอง' : 'พร้อมรับคำขอแรกของคุณ' ?></h3><p><?= $query ? 'ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง' : 'เมื่อลูกค้าส่งแบบประเมิน คำขอจะแสดงที่นี่โดยอัตโนมัติ' ?></p><?php if ($query): ?><a class="button secondary" href="/admin/inquiries">ดูคำขอทั้งหมด</a><?php endif; ?></div><?php else: ?><div class="inquiry-list"><?php foreach ($list['rows'] as $row): $p = $row['payload']; ?><article class="inquiry-row"><div class="customer-cell"><span class="avatar" aria-hidden="true"><?= adminEscape(mb_substr($p['name'], 0, 1)) ?></span><div><a class="customer-name" href="/admin/inquiries/<?= adminEscape($row['id'] . $suffix) ?>"><?= adminEscape($p['name']) ?></a><span class="muted contact-text"><?= adminEscape($p['contact']) ?></span></div></div><div class="system-cell"><strong><?= adminEscape(implode(' · ', array_map(static fn($s) => $estimate['systems'][$s] ?? $s, $p['systems']))) ?></strong><span class="muted"><?= adminEscape($estimate['models'][$p['model']] ?? $p['model']) ?></span></div><div class="state-cell"><?= adminBadge($row['status']) ?><span class="mail-state mail-state--<?= adminEscape($row['mail_state']) ?>"><?= adminEscape(adminMailLabel($row['mail_state'])) ?></span></div><div class="date-cell"><time><?= adminTime($row['created']) ?></time><span class="reference"><?= adminEscape($row['id']) ?></span></div><a class="row-action" aria-label="ดูคำขอของ <?= adminEscape($p['name']) ?>" href="/admin/inquiries/<?= adminEscape($row['id'] . $suffix) ?>">ดูรายละเอียด <span aria-hidden="true">↗</span></a></article><?php endforeach; ?></div><?php endif; ?>
            <nav class="pagination" aria-label="หน้ารายการ"><span>หน้า <?= $list['page'] ?> / <?= $list['pages'] ?></span><div><?php foreach ([-1 => '← ก่อนหน้า', 1 => 'ถัดไป →'] as $offset => $label): if ($list['page'] + $offset < 1 || $list['page'] + $offset > $list['pages']) { continue; } ?><a class="button secondary" href="/admin/inquiries?<?= adminEscape(http_build_query(array_replace($filters, ['page' => $list['page'] + $offset]))) ?>"><?= $label ?></a><?php endforeach; ?></div></nav></section><p class="retention-note">แสดงคำขอภายในระยะเก็บข้อมูล 90 วัน · “โฮสต์รับส่งแล้ว” หมายถึงโฮสต์รับเมลเพื่อส่งต่อ ไม่ยืนยันว่าเข้ากล่องผู้รับ</p><?php
            adminShell('คำขอลูกค้า', ob_get_clean(), $owner, '', $flash);
        }
        $id = basename($path); $row = $store->detail($id);
        if (!$row) { throw new InquiryProblem(404, 'ไม่พบคำขอนี้ อาจพ้นระยะเก็บข้อมูลแล้ว'); }
        if ($method === 'POST') {
            try {
                foreach (['status', 'note', 'version'] as $field) { if (!is_string($_POST[$field] ?? null)) { throw new InquiryProblem(422, 'ข้อมูลไม่ถูกต้อง'); } }
                if (!preg_match('/\A[0-9]{1,9}\z/', $_POST['version'])) { throw new InquiryProblem(422, 'ข้อมูลเวอร์ชันไม่ถูกต้อง'); }
                $store->update($id, $_POST['status'], $_POST['note'], (int) $_POST['version'], $owner['email']);
                $_SESSION['flash'] = 'บันทึกสถานะและบันทึกภายในแล้ว'; adminRedirect($path . $suffix);
            } catch (InquiryProblem $e) { $error = $e->getMessage(); http_response_code($e->status); }
        }
        $p = $row['payload']; $tier = null;
        foreach ($estimate['rates'][$p['model']] as $rate) { if (count($p['systems']) <= $rate['count']) { $tier = $rate; break; } }
        ob_start(); ?><a class="back-link" href="/admin/inquiries<?= adminEscape($suffix) ?>">← กลับรายการคำขอ</a><section class="page-heading"><div><p class="eyebrow"><?= adminEscape($row['id']) ?></p><h1><?= adminEscape($p['name']) ?></h1><p class="muted">รับคำขอ <?= adminTime($row['created']) ?> น.</p></div><?= adminBadge($row['status']) ?></section>
        <div class="detail-layout"><div class="detail-main"><section class="panel detail-panel"><h2>ข้อมูลติดต่อ</h2><dl class="detail-grid"><div><dt>โทร / LINE</dt><dd><?= adminEscape($p['contact']) ?></dd></div><div><dt>อีเมล</dt><dd><?php if ($p['email']): ?><a href="mailto:<?= adminEscape($p['email']) ?>"><?= adminEscape($p['email']) ?></a><?php else: ?>ไม่ระบุ<?php endif; ?></dd></div></dl></section>
        <section class="panel detail-panel"><h2>โจทย์ที่ลูกค้าส่งมา</h2><dl class="detail-grid"><div><dt>ระบบที่สนใจ</dt><dd><?= adminEscape(implode(' · ', array_map(static fn($s) => $estimate['systems'][$s] ?? $s, $p['systems']))) ?></dd></div><div><dt>รูปแบบบริการ</dt><dd><?= adminEscape($estimate['models'][$p['model']]) ?></dd></div><div><dt>งบที่ตั้งไว้</dt><dd><?= adminEscape($estimate['budgets'][$p['budget']]) ?></dd></div><div><dt>กรอบเวลาประเมิน</dt><dd><?= adminEscape($tier['time']) ?></dd></div></dl><div class="estimate-band"><span>กรอบประเมินปัจจุบัน</span><strong><?= number_format($tier['min']) ?> – <?= number_format($tier['max']) ?><?= !empty($tier['plus']) ? '+' : '' ?> <?= $p['model'] === 'retainer' ? 'บาท/เดือน' : 'บาท' ?></strong><small>คำนวณจากราคาปัจจุบัน ไม่ใช่ใบเสนอราคายืนยัน</small></div><h3>รายละเอียดเพิ่มเติม</h3><p class="customer-notes"><?= adminEscape($p['notes'] ?: 'ไม่ได้ระบุรายละเอียดเพิ่มเติม') ?></p><p class="consent-note">ลูกค้ายืนยันให้ใช้ข้อมูลเพื่อติดต่อกลับเรื่องงาน</p></section>
        <section class="panel detail-panel"><h2>การแจ้งเตือนอีเมล</h2><p class="mail-state mail-state--<?= adminEscape($row['mail_state']) ?>"><?= adminEscape(adminMailLabel($row['mail_state'])) ?></p><p class="muted">ส่งไป <?= adminEscape(siteConfig()['email']) ?> · พยายามส่ง <?= (int) $row['attempts'] ?> ครั้ง<br>อัปเดต <?= adminTime($row['mail_updated']) ?> น.</p><p class="muted">ข้อมูลลูกค้าถูกเก็บไว้แล้ว สถานะนี้ไม่ยืนยันการเข้ากล่องอีเมลของผู้รับ</p></section></div>
        <aside class="detail-side"><section class="panel followup-panel"><p class="eyebrow">FOLLOW UP</p><h2>ติดตามคำขอนี้</h2><form method="post" action="<?= adminEscape($path . $suffix) ?>" class="stack"><?= adminFormToken() ?><input type="hidden" name="version" value="<?= adminEscape(is_string($_POST['version'] ?? null) ? $_POST['version'] : $row['version']) ?>"><label>สถานะติดตาม<select name="status" aria-label="สถานะติดตาม"><?php foreach (InquiryAdminStore::STATUSES as $key => $label): ?><option value="<?= $key ?>" <?= (is_string($_POST['status'] ?? null) ? $_POST['status'] : $row['status']) === $key ? 'selected' : '' ?>><?= $label ?></option><?php endforeach; ?></select></label><label>บันทึกภายใน<textarea name="note" aria-label="บันทึกภายใน" rows="7" maxlength="4000" placeholder="เช่น โทรคุยแล้ว รอสรุปขอบเขตงาน"><?= adminEscape(is_string($_POST['note'] ?? null) ? $_POST['note'] : $row['note']) ?></textarea></label><p class="field-help">เฉพาะเจ้าของเว็บเห็น ลูกค้าจะไม่ได้รับข้อความนี้</p><button class="button primary" type="submit">บันทึกการติดตาม ↗</button></form><a class="reload-link" href="<?= adminEscape($path . $suffix) ?>">โหลดข้อมูลล่าสุด</a><?php if ($row['updated']): ?><p class="field-help">บันทึกล่าสุด <?= adminTime($row['updated']) ?> น.</p><?php endif; ?></section><section class="panel detail-panel"><h2>ประวัติการติดตาม</h2><?php if (!$row['activity']): ?><p class="muted">ยังไม่มีการติดตาม</p><?php else: ?><ol class="activity-list"><?php foreach ($row['activity'] as $activity): ?><li><strong><?= adminEscape(InquiryAdminStore::STATUSES[$activity['status']]) ?></strong><?php if ($activity['note_changed']): ?><span>ปรับบันทึกภายใน</span><?php endif; ?><time><?= adminTime($activity['created']) ?></time></li><?php endforeach; ?></ol><?php endif; ?></section></aside></div><?php
        adminShell('รายละเอียดคำขอ', ob_get_clean(), $owner, $error, $flash);
    } catch (InquiryProblem $e) {
        http_response_code($e->status); if ($e->status === 429) { header('Retry-After: 900'); }
        adminShell('ไม่สามารถดำเนินการได้', '<section class="panel error-panel"><h1>ไม่สามารถดำเนินการได้</h1><p>กลับไปเปิดรายการใหม่ แล้วลองอีกครั้ง</p><a class="button primary" href="/admin/inquiries">กลับรายการคำขอ</a></section>', $owner, $e->getMessage());
    } catch (Throwable) {
        error_log('BUZLIKE owner workspace unavailable'); http_response_code(503);
        adminShell('ระบบไม่พร้อมชั่วคราว', '<section class="panel error-panel"><h1>หลังบ้านไม่พร้อมชั่วคราว</h1><p>กรุณาลองใหม่ หรือตรวจการตั้งค่าบนโฮสต์</p><a class="button primary" href="/admin/login">ลองอีกครั้ง</a></section>');
    }
}
