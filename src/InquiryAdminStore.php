<?php
declare(strict_types=1);
require_once __DIR__ . '/InquiryService.php';

/** Private owner workspace. No dependency on the browser-local CRM prototype. */
final class InquiryAdminStore {
    public const STATUSES = ['new' => 'ใหม่', 'contacted' => 'ติดต่อแล้ว', 'quoting' => 'กำลังเสนอราคา', 'won' => 'ปิดงานแล้ว', 'lost' => 'ไม่ดำเนินการ'];
    private PDO $db;
    private string $secret;

    public function __construct(string $directory) {
        // Reuse the original schema, key and 90-day retention policy, without submitting mail.
        new InquiryService($directory);
        $this->secret = (string) file_get_contents($directory . '/inquiry.key');
        $this->db = new PDO('sqlite:' . $directory . '/inquiries.sqlite', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $this->db->exec('PRAGMA busy_timeout=5000');
        $this->db->exec('PRAGMA secure_delete=ON');
        $this->db->exec("CREATE TABLE IF NOT EXISTS admin_account (
            singleton INTEGER PRIMARY KEY CHECK(singleton=1), email TEXT NOT NULL,
            password_hash TEXT NOT NULL, version TEXT NOT NULL, must_change INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS admin_login_limits (bucket TEXT PRIMARY KEY, started INTEGER NOT NULL, hits INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS inquiry_followups (
            inquiry_id TEXT PRIMARY KEY, status TEXT NOT NULL, note TEXT NOT NULL,
            updated INTEGER NOT NULL, version INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS inquiry_activity (
            id INTEGER PRIMARY KEY, inquiry_id TEXT NOT NULL, status TEXT NOT NULL,
            note_changed INTEGER NOT NULL, actor TEXT NOT NULL, created INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS inquiry_activity_ref ON inquiry_activity(inquiry_id,id);
        CREATE TRIGGER IF NOT EXISTS inquiry_admin_prune AFTER DELETE ON inquiries BEGIN
            DELETE FROM inquiry_followups WHERE inquiry_id=OLD.id;
            DELETE FROM inquiry_activity WHERE inquiry_id=OLD.id;
        END;
        DELETE FROM inquiry_followups WHERE inquiry_id NOT IN (SELECT id FROM inquiries);
        DELETE FROM inquiry_activity WHERE inquiry_id NOT IN (SELECT id FROM inquiries)");
        $q = $this->db->prepare('DELETE FROM admin_login_limits WHERE started < ?');
        $q->execute([time() - 86400]);
    }

    public function account(): ?array {
        return $this->db->query('SELECT * FROM admin_account WHERE singleton=1')->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public static function validatePassword(string $password): void {
        // A byte cap avoids bcrypt's silent truncation, including for Thai passphrases.
        if (!mb_check_encoding($password, 'UTF-8') || mb_strlen($password) < 12 || strlen($password) > 72 || preg_match('/[\x00-\x1F\x7F]/', $password)) {
            throw new InquiryProblem(422, 'ใช้รหัสผ่านอย่างน้อย 12 ตัวอักษร และไม่เกิน 72 ไบต์');
        }
    }

    /** Only invoked by the SSH/CLI provisioner, never from a public setup route. */
    public function provision(string $email, string $password, bool $reset = false): void {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 200) { throw new RuntimeException('Invalid owner email'); }
        self::validatePassword($password);
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            if ($this->account() && !$reset) { throw new RuntimeException('Owner already exists; use --reset explicitly'); }
            $q = $this->db->prepare('INSERT INTO admin_account VALUES(1,?,?,?,1) ON CONFLICT(singleton) DO UPDATE SET email=excluded.email,password_hash=excluded.password_hash,version=excluded.version,must_change=1');
            $q->execute([strtolower($email), $hash, bin2hex(random_bytes(16))]);
            $this->db->exec('DELETE FROM admin_login_limits');
            $this->db->exec('COMMIT');
        } catch (Throwable $e) { $this->db->exec('ROLLBACK'); throw $e; }
    }

    public function authenticate(string $email, string $password, string $ip): ?array {
        // Count every attempt atomically before hashing; bound both per-IP and account-wide work.
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            foreach (['ip:' . hash_hmac('sha256', $ip, $this->secret) => 8, 'owner' => 40] as $bucket => $limit) {
                $q = $this->db->prepare('INSERT INTO admin_login_limits VALUES(?,?,1) ON CONFLICT(bucket) DO UPDATE SET hits=CASE WHEN started<=? THEN 1 ELSE hits+1 END,started=CASE WHEN started<=? THEN excluded.started ELSE started END RETURNING hits');
                $q->execute([$bucket, time(), time() - 900, time() - 900]);
                $hits = (int) $q->fetchColumn(); $q->closeCursor();
                if ($hits > $limit) { $this->db->exec('COMMIT'); throw new InquiryProblem(429, 'ลองเข้าสู่ระบบถี่เกินไป กรุณารอ 15 นาที'); }
            }
            $this->db->exec('COMMIT');
        } catch (Throwable $e) { if ($this->db->inTransaction()) { $this->db->exec('ROLLBACK'); } throw $e; }
        $account = $this->account();
        // A fixed valid dummy hash prevents a fast-path response for an unconfigured account.
        $valid = password_verify($password, $account['password_hash'] ?? '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.');
        if (!$account || !$valid || !hash_equals($account['email'], strtolower(trim($email)))) { return null; }
        return $account;
    }

    public function changePassword(string $current, string $next, string $version, string $ip): array {
        self::validatePassword($next);
        $account = $this->account();
        if (!$account || !hash_equals($account['version'], $version)) { throw new InquiryProblem(401, 'กรุณาเข้าสู่ระบบใหม่'); }
        if (!$this->authenticate($account['email'], $current, $ip)) { throw new InquiryProblem(422, 'รหัสผ่านปัจจุบันไม่ถูกต้อง'); }
        if (password_verify($next, $account['password_hash'])) { throw new InquiryProblem(422, 'กรุณาตั้งรหัสผ่านใหม่ที่ต่างจากรหัสเดิม'); }
        $q = $this->db->prepare('UPDATE admin_account SET password_hash=?,version=?,must_change=0 WHERE singleton=1 AND version=?');
        $q->execute([password_hash($next, PASSWORD_DEFAULT), bin2hex(random_bytes(16)), $version]);
        if ($q->rowCount() !== 1) { throw new InquiryProblem(409, 'ข้อมูลบัญชีเปลี่ยนแล้ว กรุณาเข้าสู่ระบบใหม่'); }
        return $this->account();
    }

    public function listing(string $search = '', string $status = '', string $mail = '', int $page = 1): array {
        $where = []; $args = [];
        if ($search !== '') {
            $where[] = "(i.id LIKE ? ESCAPE '\\' OR i.payload LIKE ? ESCAPE '\\')";
            $term = '%' . str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $search) . '%';
            $args[] = $term; $args[] = $term;
        }
        if ($status !== '') { $where[] = "COALESCE(f.status,'new')=?"; $args[] = $status; }
        if ($mail === 'attention') { $where[] = "(i.mail_state='failed' OR (i.mail_state='sending' AND i.mail_updated<?))"; $args[] = time() - 300; }
        elseif ($mail !== '') { $where[] = 'i.mail_state=?'; $args[] = $mail; }
        $from = ' FROM inquiries i LEFT JOIN inquiry_followups f ON f.inquiry_id=i.id' . ($where ? ' WHERE ' . implode(' AND ', $where) : '');
        $q = $this->db->prepare('SELECT COUNT(*)' . $from); $q->execute($args); $total = (int) $q->fetchColumn();
        $pages = max(1, (int) ceil($total / 20)); $page = min(max(1, $page), $pages);
        $q = $this->db->prepare("SELECT i.id,i.payload,i.created,i.mail_state,i.mail_updated,COALESCE(f.status,'new') AS status" . $from . ' ORDER BY i.created DESC,i.id DESC LIMIT 20 OFFSET ' . (($page - 1) * 20));
        $q->execute($args); $rows = $q->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$row) { $row['payload'] = json_decode($row['payload'], true, 16, JSON_THROW_ON_ERROR); }
        unset($row);
        $counts = $this->db->query("SELECT COUNT(*) AS total,COALESCE(SUM(COALESCE(f.status,'new')='new'),0) AS new,COALESCE(SUM(f.status='quoting'),0) AS quoting,COALESCE(SUM(f.status='won'),0) AS won FROM inquiries i LEFT JOIN inquiry_followups f ON f.inquiry_id=i.id")->fetch(PDO::FETCH_ASSOC);
        $q = $this->db->prepare("SELECT COUNT(*) FROM inquiries WHERE mail_state='failed' OR (mail_state='sending' AND mail_updated<?)"); $q->execute([time() - 300]);
        return compact('rows', 'total', 'page', 'pages', 'counts') + ['attention' => (int) $q->fetchColumn()];
    }

    public function detail(string $id): ?array {
        $q = $this->db->prepare("SELECT i.id,i.payload,i.created,i.mail_state,i.mail_updated,i.attempts,COALESCE(f.status,'new') AS status,COALESCE(f.note,'') AS note,COALESCE(f.version,0) AS version,f.updated FROM inquiries i LEFT JOIN inquiry_followups f ON f.inquiry_id=i.id WHERE i.id=?");
        $q->execute([$id]); $row = $q->fetch(PDO::FETCH_ASSOC);
        if (!$row) { return null; }
        $row['payload'] = json_decode($row['payload'], true, 16, JSON_THROW_ON_ERROR);
        $q = $this->db->prepare('SELECT status,note_changed,actor,created FROM inquiry_activity WHERE inquiry_id=? ORDER BY id DESC LIMIT 20');
        $q->execute([$id]); $row['activity'] = $q->fetchAll(PDO::FETCH_ASSOC);
        return $row;
    }

    public function update(string $id, string $status, string $note, int $version, string $actor): void {
        $note = trim(str_replace(["\r\n", "\r"], "\n", $note));
        if (!isset(self::STATUSES[$status]) || !mb_check_encoding($note, 'UTF-8') || mb_strlen($note) > 4000 || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $note)) {
            throw new InquiryProblem(422, 'เลือกสถานะที่ถูกต้อง และบันทึกไม่เกิน 4,000 ตัวอักษร');
        }
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $row = $this->detail($id);
            if (!$row) { throw new InquiryProblem(404, 'ไม่พบคำขอนี้ อาจพ้นระยะเก็บข้อมูลแล้ว'); }
            if ((int) $row['version'] !== $version) { throw new InquiryProblem(409, 'รายการนี้ถูกแก้ไขจากอีกหน้าแล้ว กรุณาคัดลอกบันทึกที่ยังไม่ได้บันทึก แล้วโหลดข้อมูลล่าสุดก่อนแก้ไข'); }
            if ($row['status'] !== $status || $row['note'] !== $note) {
                $q = $this->db->prepare('INSERT INTO inquiry_followups VALUES(?,?,?,?,?) ON CONFLICT(inquiry_id) DO UPDATE SET status=excluded.status,note=excluded.note,updated=excluded.updated,version=excluded.version');
                $q->execute([$id, $status, $note, time(), $version + 1]);
                $q = $this->db->prepare('INSERT INTO inquiry_activity(inquiry_id,status,note_changed,actor,created) VALUES(?,?,?,?,?)');
                $q->execute([$id, $status, (int) ($row['note'] !== $note), $actor, time()]);
            }
            $this->db->exec('COMMIT');
        } catch (Throwable $e) { $this->db->exec('ROLLBACK'); throw $e; }
    }
}
