<?php
declare(strict_types=1);
require_once __DIR__ . '/SiteConfig.php';

final class InquiryProblem extends RuntimeException {
    public function __construct(public int $status, string $message) { parent::__construct($message); }
}

final class InquiryService {
    private PDO $db;
    private Closure $sender;
    private string $secret;
    private array $estimate;
    public function __construct(string $directory, ?Closure $sender = null) {
        if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
            throw new RuntimeException('Inquiry storage unavailable');
        }
        chmod($directory, 0700);
        $keyFile = $directory . '/inquiry.key';
        $handle = fopen($keyFile, 'c+');
        if (!$handle || !flock($handle, LOCK_EX)) { throw new RuntimeException('Inquiry storage key unavailable'); }
        chmod($keyFile, 0600); $this->secret = stream_get_contents($handle);
        if ($this->secret === '') { $this->secret = bin2hex(random_bytes(32)); fwrite($handle, $this->secret); fflush($handle); }
        flock($handle, LOCK_UN); fclose($handle);
        if (strlen($this->secret) !== 64) { throw new RuntimeException('Inquiry storage key unavailable'); }
        $this->db = new PDO('sqlite:' . $directory . '/inquiries.sqlite', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        chmod($directory . '/inquiries.sqlite', 0600);
        $this->db->exec('PRAGMA busy_timeout=5000');
        $this->db->exec('PRAGMA secure_delete=ON');
        $this->db->exec('CREATE TABLE IF NOT EXISTS inquiries (
            id TEXT PRIMARY KEY, dedupe TEXT UNIQUE NOT NULL, fingerprint TEXT NOT NULL,
            ip_hash TEXT NOT NULL, payload TEXT NOT NULL, created INTEGER NOT NULL,
            mail_state TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, mail_updated INTEGER NOT NULL
        )');
        $this->db->exec('CREATE INDEX IF NOT EXISTS inquiries_ip_created ON inquiries(ip_hash, created)');
        $this->db->exec('CREATE TABLE IF NOT EXISTS inquiry_limits (bucket TEXT PRIMARY KEY, started INTEGER NOT NULL, hits INTEGER NOT NULL)');
        // Shared hosting may not expose a writable cron. Purge expired data on every API use too.
        $q = $this->db->prepare('DELETE FROM inquiries WHERE created < ?'); $q->execute([time() - 90 * 86400]);
        $q = $this->db->prepare('DELETE FROM inquiry_limits WHERE started < ?'); $q->execute([time() - 86400]);
        $this->estimate = json_decode((string) file_get_contents(__DIR__ . '/EstimateConfig.json'), true, 512, JSON_THROW_ON_ERROR);
        $this->sender = $sender ?? self::sendMail(...);
    }

    public function limit(string $ip, string $kind, int $maximum, int $window): void {
        $bucket = $kind . ':' . hash_hmac('sha256', $ip, $this->secret);
        $now = time();
        $q = $this->db->prepare('INSERT INTO inquiry_limits(bucket,started,hits) VALUES(?,?,1)
            ON CONFLICT(bucket) DO UPDATE SET
            hits=CASE WHEN started<=? THEN 1 ELSE hits+1 END,
            started=CASE WHEN started<=? THEN excluded.started ELSE started END RETURNING hits');
        $q->execute([$bucket, $now, $now - $window, $now - $window]);
        if ((int) $q->fetchColumn() > $maximum) {
            throw new InquiryProblem(429, 'ส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่ หรือติดต่อทาง LINE');
        }
    }

    private function text(array $input, string $field, int $max, bool $required = false, bool $singleLine = false): string {
        $value = $input[$field] ?? '';
        if (!is_string($value) || !mb_check_encoding($value, 'UTF-8')) {
            throw new InquiryProblem(422, 'ข้อมูลไม่ถูกต้อง กรุณาตรวจช่องกรอกอีกครั้ง');
        }
        $value = trim($value);
        if (($required && $value === '') || mb_strlen($value, 'UTF-8') > $max || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $value)
            || ($singleLine && preg_match('/[\r\n]/', $value))) {
            throw new InquiryProblem(422, 'กรุณากรอกข้อมูลติดต่อให้ครบและไม่เกินความยาวที่กำหนด');
        }
        return str_replace(["\r\n", "\r"], "\n", $value);
    }

    public function normalize(array $input): array {
        if (($input['website'] ?? '') !== '') { throw new InquiryProblem(422, 'ไม่สามารถรับคำขอนี้ได้ กรุณาติดต่อทาง LINE'); }
        if (($input['consent'] ?? false) !== true) { throw new InquiryProblem(422, 'กรุณายืนยันให้ใช้ข้อมูลเพื่อติดต่อกลับเรื่องงาน'); }
        $systems = $input['systems'] ?? null;
        if (!is_array($systems) || !array_is_list($systems) || count($systems) < 1 || count($systems) > 6) {
            throw new InquiryProblem(422, 'กรุณาเลือกระบบที่สนใจอย่างน้อย 1 ข้อ');
        }
        foreach ($systems as $system) {
            if (!is_string($system) || !isset($this->estimate['systems'][$system])) { throw new InquiryProblem(422, 'ระบบที่เลือกไม่ถูกต้อง'); }
        }
        $systems = array_values(array_unique($systems)); sort($systems);
        $model = $input['model'] ?? null; $budget = $input['budget'] ?? null;
        if (!is_string($model) || !isset($this->estimate['models'][$model]) || !is_string($budget) || !isset($this->estimate['budgets'][$budget])) {
            throw new InquiryProblem(422, 'รูปแบบงานหรืองบที่เลือกไม่ถูกต้อง');
        }
        $email = $this->text($input, 'email', 200, false, true);
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) { throw new InquiryProblem(422, 'รูปแบบอีเมลไม่ถูกต้อง'); }
        return ['name' => $this->text($input, 'name', 150, true, true), 'contact' => $this->text($input, 'contact', 100, true, true),
            'email' => $email, 'notes' => $this->text($input, 'notes', 6000), 'systems' => $systems, 'model' => $model, 'budget' => $budget, 'consent' => true];
    }

    public function submit(array $input, string $requestKey, string $session, string $ip): array {
        if (!preg_match('/\A[a-f0-9-]{32,64}\z/i', $requestKey)) { throw new InquiryProblem(422, 'รหัสคำขอไม่ถูกต้อง กรุณาลองใหม่'); }
        $payload = $this->normalize($input);
        $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        $fingerprint = hash('sha256', $json);
        $dedupe = hash_hmac('sha256', $session . ':' . $requestKey, $this->secret);
        $now = time();
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $q = $this->db->prepare('SELECT * FROM inquiries WHERE dedupe=?'); $q->execute([$dedupe]); $existing = $q->fetch(PDO::FETCH_ASSOC);
            if ($existing) {
                if (!hash_equals($existing['fingerprint'], $fingerprint)) { throw new InquiryProblem(409, 'ข้อมูลคำขอเปลี่ยนแล้ว กรุณากดส่งใหม่อีกครั้ง'); }
                $retryable = ($existing['mail_state'] === 'failed' && (int) $existing['mail_updated'] <= $now - 60)
                    || ($existing['mail_state'] === 'sending' && (int) $existing['mail_updated'] <= $now - 300);
                if (!$retryable) {
                    $this->db->exec('COMMIT');
                    return $this->receipt($existing['id'], $existing['mail_state']);
                }
                $id = $existing['id'];
                $q = $this->db->prepare("UPDATE inquiries SET mail_state='sending',mail_updated=?,attempts=attempts+1 WHERE id=?"); $q->execute([$now, $id]);
            } else {
                $this->limit($ip, 'submission', 5, 1800);
                $this->limit('all', 'global_submission', 40, 3600);
                $id = 'BZ-' . gmdate('ymd') . '-' . strtoupper(bin2hex(random_bytes(6)));
                $q = $this->db->prepare("INSERT INTO inquiries VALUES(?,?,?,?,?,?,'sending',1,?)");
                $q->execute([$id, $dedupe, $fingerprint, hash_hmac('sha256', $ip, $this->secret), $json, $now, $now]);
            }
            $q = $this->db->prepare('DELETE FROM inquiries WHERE created < ?'); $q->execute([$now - 90 * 86400]);
            $q = $this->db->prepare('DELETE FROM inquiry_limits WHERE started < ?'); $q->execute([$now - 86400]);
            $this->db->exec('COMMIT');
        } catch (Throwable $error) { $this->db->exec('ROLLBACK'); throw $error; }
        try { $sent = (bool) ($this->sender)($id, $this->message($id, $payload), $payload['email']); }
        catch (Throwable) { $sent = false; }
        $state = $sent ? 'queued' : 'failed';
        $q = $this->db->prepare('UPDATE inquiries SET mail_state=?,mail_updated=? WHERE id=?'); $q->execute([$state, time(), $id]);
        if (!$sent) { error_log('BUZLIKE inquiry notification failed: ' . $id); }
        return $this->receipt($id, $state);
    }

    private function receipt(string $id, string $state): array {
        return ['ok' => true, 'id' => $id, 'mailQueued' => $state === 'queued', 'mailState' => $state,
            'message' => match ($state) {
                'queued' => 'ได้รับคำขอแล้ว เราจะติดต่อกลับตามข้อมูลที่คุณให้ไว้',
                'sending' => 'ได้รับคำขอแล้ว กำลังแจ้งเตือนทางอีเมล',
                default => 'บันทึกคำขอแล้ว แต่ส่งอีเมลแจ้งเตือนไม่สำเร็จ กรุณาทัก LINE พร้อมเลขอ้างอิงนี้',
            }];
    }

    public function message(string $id, array $p): string {
        $tier = null;
        foreach ($this->estimate['rates'][$p['model']] as $item) { if (count($p['systems']) <= $item['count']) { $tier = $item; break; } }
        $price = number_format($tier['min']) . ' – ' . number_format($tier['max']) . (!empty($tier['plus']) ? '+' : '') . ($p['model'] === 'retainer' ? ' บาท/เดือน' : ' บาท');
        return "คำขอใบเสนอราคา — " . siteConfig()['brand'] . "\nเลขอ้างอิง: $id\nเวลารับคำขอ (ไทย): " . (new DateTimeImmutable('now', new DateTimeZone('Asia/Bangkok')))->format('d/m/Y H:i:s') .
            "\n\nผู้ติดต่อ: {$p['name']}\nโทร / LINE: {$p['contact']}\nอีเมล: " . ($p['email'] ?: 'ไม่ระบุ') .
            "\nระบบที่สนใจ: " . implode(', ', array_map(fn($s) => $this->estimate['systems'][$s], $p['systems'])) .
            "\nรูปแบบบริการ: " . $this->estimate['models'][$p['model']] . "\nงบที่ตั้งไว้: " . $this->estimate['budgets'][$p['budget']] .
            "\nกรอบประเมิน: $price\nกรอบเวลา: {$tier['time']}\nรายละเอียด: " . ($p['notes'] ?: 'ขอคุยรายละเอียดเพิ่มเติม') .
            "\n\nผู้ติดต่อยืนยันให้ใช้ข้อมูลเพื่อติดต่อกลับเรื่องงาน\nประมาณการนี้ยังไม่ใช่ใบเสนอราคายืนยัน\nส่งจากแบบประเมินบน " . siteConfig()['origin'] . "\n";
    }

    private static function sendMail(string $id, string $body, string $replyTo): bool {
        $site = siteConfig(); $address = $site['email'];
        if (!filter_var($address, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $address)) { return false; }
        $headers = ['From' => mb_encode_mimeheader($site['brand'], 'UTF-8', 'B', "\r\n") . ' <' . $address . '>',
            'MIME-Version' => '1.0', 'Content-Type' => 'text/plain; charset=UTF-8', 'Content-Transfer-Encoding' => 'quoted-printable',
            'Message-ID' => '<' . strtolower($id) . '@' . parse_url($site['origin'], PHP_URL_HOST) . '>'];
        if ($replyTo !== '') { $headers['Reply-To'] = $replyTo; }
        $subject = mb_encode_mimeheader('คำขอใบเสนอราคา ' . $site['brand'] . ' [' . $id . ']', 'UTF-8', 'B', "\r\n");
        return @mail($address, $subject, quoted_printable_encode($body), $headers, '-f' . $address);
    }
}
