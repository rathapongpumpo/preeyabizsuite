# Navigation — หน้าแรกเดียว

แก้วันที่ 2 พฤศจิกายน 2026 ตามปัญหาผู้ใช้กลับจากเดโมแล้วไปพบหน้าแรกคนละเวอร์ชัน

## เส้นทางปัจจุบัน

- `/` เป็นหน้าแรกหลักของบริษัท: แนะนำ → ตัวอย่างระบบ → วิธีเริ่มงาน → ติดต่อ
- `/#systems` ดูตัวอย่าง 6 ระบบ; คลิกเปิดในแท็บเดิม
- `/#how-it-works` วิธีเริ่มจ้างงาน
- `/#contact` ติดต่อ LINE/email
- ทุกเดโมใช้ปุ่ม “กลับหน้าแรก” ไป `/` โดยโหลด document จริง ไม่เรียก marketing renderer เก่า
- Back/Forward ของ browser ใช้ document history ตามปกติ
- ลิงก์ preview เก่าพากลับ `/` โดยคง query/hash; `#projects` แปลงเป็น `#systems`, `#estimator-form` เป็น `#contact`
- `/index.html` และการเปิด `/demo.html` ตรงพากลับ `/`

## ไฟล์หลัก

- `public/index.html`: HTML หน้าแรกหลัก
- `public/demo.html`: static bootstrap สำหรับเดโมบน Vercel เก็บ registry/sprite/legacy code เดิมไว้
- `public/index.php`: PHP local root อ่านหน้าแรกเดียวกัน; route เดโม render shell เดิม
- `index.html`, `demo.html`: static entries สำหรับ repository root ต้องตรงกับไฟล์ใต้ public
- `scripts/sync_site_entrypoints.py`: sync entrypoints หลังแก้ไฟล์หลักใต้ public
- `vercel.json`: `/` → index.html, demo fallback → demo.html
- `public/previews/living-systems/index.html`: redirect เท่านั้น ไม่ใช่หน้าแรกอีกชุด
- Hero CSS/JS/assets ยังอยู่ใต้ directory เดิม โดยโหลดด้วย absolute path

## ผลตรวจ

`output/hero-concept/canonical-navigation-tests.json`: ผ่าน 57/57 checks บน local PHP server ได้แก่เข้าจาก root, เข้าเดโม/กลับครบ 7 routes หลักและ 2 Shipping subroutes, Back/Forward, ติดต่อจาก CTA เดโม, legacy aliases, responsive/round trip 375/390/768/1440, ไม่มี browser error และ static entry sync

ตรวจ syntax PHP/JS และ git diff whitespace ผ่าน ตรวจภาพ runtime desktop/mobile และเปิดหน้าแรกหลักใน IAB แล้ว ปิดแท็บ preview ที่ agent สร้างซ้ำไว้ เหลือแท็บหน้าแรกหลักให้ผู้ใช้

ยังไม่ได้ deploy หรือยืนยัน Vercel runtime หลัง deploy; config สำหรับ static routing ตรวจจาก source เท่านั้น บั๊กธุรกรรมเดโมตาม Fix Spec audit ไม่ได้แก้ในงาน navigation นี้
