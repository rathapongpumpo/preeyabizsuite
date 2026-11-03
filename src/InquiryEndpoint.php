<?php
declare(strict_types=1);
require_once __DIR__ . '/InquiryService.php';

function handleInquiryEndpoint(): never {
    header('Content-Type: application/json; charset=UTF-8');
    header('Cache-Control: no-store, private');
    header('X-Content-Type-Options: nosniff');
    $respond = static function (int $status, array $body): never {
        http_response_code($status); echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR); exit;
    };
    try {
        $method = $_SERVER['REQUEST_METHOD'] ?? '';
        if (!in_array($method, ['GET', 'POST'], true)) { header('Allow: GET, POST'); throw new InquiryProblem(405, 'วิธีเรียกใช้งานไม่ถูกต้อง'); }
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowed = [siteConfig()['origin']];
        if (PHP_SAPI === 'cli-server' && preg_match('/\A(?:127\.0\.0\.1|localhost)(?::\d+)?\z/', $_SERVER['HTTP_HOST'] ?? '')) {
            $allowed[] = 'http://' . $_SERVER['HTTP_HOST'];
        }
        if (($method === 'POST' || $origin !== '') && !in_array($origin, $allowed, true)) { throw new InquiryProblem(403, 'กรุณาส่งคำขอจากเว็บไซต์ BUZLIKE SYSTEMS'); }
        if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') { throw new InquiryProblem(403, 'ไม่สามารถส่งคำขอข้ามเว็บไซต์ได้'); }
        $store = new InquiryService(dirname(__DIR__) . '/var');
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        if ($method === 'GET') { $store->limit($ip, 'init', 120, 3600); }
        session_name('buzlike_inquiry');
        session_set_cookie_params(['lifetime' => 0, 'path' => '/api', 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'httponly' => true, 'samesite' => 'Lax']);
        ini_set('session.use_strict_mode', '1'); session_start();
        if (!isset($_SESSION['inquiry_csrf']) || time() - ($_SESSION['inquiry_csrf_time'] ?? 0) > 3600) {
            $_SESSION['inquiry_csrf'] = bin2hex(random_bytes(32)); $_SESSION['inquiry_csrf_time'] = time();
        }
        $token = $_SESSION['inquiry_csrf']; $session = session_id(); session_write_close();
        if ($method === 'GET') { $respond(200, ['csrf' => $token]); }
        if (!hash_equals($token, $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) { throw new InquiryProblem(419, 'แบบฟอร์มหมดอายุ กรุณากดส่งใหม่อีกครั้ง'); }
        if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') { throw new InquiryProblem(415, 'รูปแบบข้อมูลไม่ถูกต้อง'); }
        if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 32768) { throw new InquiryProblem(413, 'ข้อมูลยาวเกินไป กรุณาย่อรายละเอียด'); }
        $raw = file_get_contents('php://input', false, null, 0, 32769);
        if ($raw === false || strlen($raw) > 32768) { throw new InquiryProblem(413, 'ข้อมูลยาวเกินไป กรุณาย่อรายละเอียด'); }
        try { $data = json_decode($raw, true, 16, JSON_THROW_ON_ERROR); }
        catch (JsonException) { throw new InquiryProblem(400, 'ข้อมูลคำขอไม่สมบูรณ์ กรุณาลองใหม่'); }
        if (!is_array($data) || array_is_list($data)) { throw new InquiryProblem(400, 'ข้อมูลคำขอไม่ถูกต้อง'); }
        $store->limit($ip, 'post', 30, 1800);
        $result = $store->submit($data, $_SERVER['HTTP_IDEMPOTENCY_KEY'] ?? '', $session, $ip);
        $respond($result['mailState'] === 'sending' ? 202 : 200, $result);
    } catch (InquiryProblem $error) {
        if ($error->status === 429) { header('Retry-After: 1800'); }
        $respond($error->status, ['ok' => false, 'message' => $error->getMessage()]);
    } catch (Throwable) {
        error_log('BUZLIKE inquiry service unavailable');
        $respond(503, ['ok' => false, 'message' => 'ระบบรับคำขอไม่พร้อมชั่วคราว กรุณาลองใหม่หรือติดต่อทาง LINE']);
    }
}
