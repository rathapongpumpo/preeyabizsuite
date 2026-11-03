# BUZLIKE SYSTEMS

เว็บไซต์รับพัฒนาเว็บไซต์และระบบสำหรับธุรกิจ พร้อมตัวอย่างระบบให้ทดลอง ราคาเริ่มต้น 15,000 บาท เว็บไซต์หลัก: https://buzlike.com/ ติดต่อ support@buzlike.com

แบบประเมินบนเว็บไซต์หลักส่งคำขอจริงผ่าน PHP ไปยังอีเมลผู้ดูแล พร้อมบันทึกสำรองและเลขอ้างอิง ส่วนข้อมูลในเดโม WMS/CRM/POS/ขนส่ง/จองยังเป็นข้อมูลจำลองในเบราว์เซอร์

---

## 🎯 ขอบเขตผลงานหลัก (6 ระบบ)

### ผลงานเด่น (Featured Systems)
1. **NexusWMS** — `/warehouse-management`  
   ระบบบริหารจัดการคลังสินค้าและสต็อก บันทึกรับเข้า (Inbound) เบิกจ่าย (Outbound) ตรวจสอบยอดคงเหลือ และแจ้งเตือนสต็อกใกล้หมด
2. **Sales Flow CRM พร้อม E-Signature** — `/business-suite`  
   ระบบบริหารงานขาย จัดการ Pipeline และ Lead แบบ Drag & Drop ออกใบเสนอราคา และส่งต่อไปยังโมดูลลงนามสัญญาออนไลน์ (Lite E-Signature)
3. **SmartPOS** — `/pos-system-smart`  
   ระบบจุดขายร้านอาหารและคาเฟ่ พร้อมหน้าจอจัดคิวในครัว (Kitchen Display System - KDS) โหมด Kiosk สั่งอาหาร และรายงานสรุปปิดกะ

### ผลงานเพิ่มเติม (Additional Works)
4. **Thai Shipping Suite** — `/usa-thai-shipping`  
   ระบบจัดการขนส่งพัสดุนำเข้า ครอบคลุม Admin Portal และหน้าค้นหา Tracking Timeline 4 ขั้นตอนสำหรับลูกค้า
5. **OAI Apparel Storefront** — `/ecommerce-storefront`  
   (หมวดเว็บไซต์และงานออกแบบ) หน้าร้านค้าแฟชั่นออนไลน์ แคตตาล็อกสินค้า และระบบตะกร้าสินค้า (Slide-over Cart Drawer) ผ่าน Reverse Proxy
6. **Tilt Signal Arcade Bar** — `/tilt-signal-arcade-bar`  
   (หมวดเว็บไซต์และงานออกแบบ) Landing Page ประชาสัมพันธ์ร้านและอีเวนต์สไตล์ Cinematic จัดวาง Editorial Typography โดดเด่น ผ่าน Reverse Proxy

---

## 📌 หมายเหตุการปรับลดและปรับปรุงระบบ
- **ถอด 3 ระบบออกจากหน้าแรกและตัวกรอง:** EduFlow (`/course`), NexusFlow (`/project-management`), และ Medical Flow (`/medical-flow`) โดยเก็บ Source Code เดิมไว้ในโครงการสำหรับต่อยอดในอนาคต แต่ไม่แสดงในรายการผลงาน
- **E-Signature:** ปรับเป็นฟีเจอร์ประกอบ Sales Flow CRM โดยยังคงรักษาเส้นทาง `/e-signature` ให้เข้าถึงได้ และมีปุ่มนำทางไป-กลับระหว่าง CRM และ E-Signature ชัดเจน (ระบุสถานะเป็น Prototype Simulation อย่างโปร่งใส)

---

## 🚀 วิธีเปิดใช้งานและทดสอบในเครื่อง

### ความต้องการของระบบ
- PHP 8.2+ พร้อมส่วนขยาย `curl`, `json`, `mbstring`, `openssl`, `pdo_sqlite` (SQLite 3.35+)
- การส่งคำขอจริงต้องมี PHP และระบบส่งเมลของโฮสต์ที่ตั้งค่าแล้ว; Static Server ใช้ดูหน้าเว็บและเดโมได้ แต่ไม่มี API รับคำขอ

### วิธีเริ่มระบบบน Windows
1. ดับเบิลคลิก `start-demo.bat`  
หรือ
2. เปิด PowerShell ในโฟลเดอร์โครงการแล้วรันคำสั่ง:
```powershell
php -S 127.0.0.1:8080 -t public router.php
```
3. เปิดเบราว์เซอร์ไปที่: `http://127.0.0.1:8080`

---

## 💾 การจัดเก็บข้อมูลและการทดลอง (Local Persistence)
- ข้อมูลการสั่งซื้อ สต็อก และลูกค้า จัดเก็บใน `localStorage` ของเบราว์เซอร์เครื่องผู้ทดลอง
- สามารถกดปุ่ม **"รีเซ็ตข้อมูล"** ในแต่ละโมดูลเพื่อคืนค่าข้อมูลตัวอย่างเริ่มต้น (Seed Data) ได้ตลอดเวลา
- ไม่มีฐานข้อมูล Production ภายนอก และไม่มีการตัดเงินจริง

## แบบประเมินและการส่งเมลจริง

- `GET /api/inquiries` สร้าง CSRF session; `POST /api/inquiries` ตรวจข้อมูล บันทึกคำขอและส่งแจ้งเตือนไปยังอีเมลคงที่ใน `src/SiteConfig.json` ไม่ส่งเมลอัตโนมัติให้ผู้กรอก
- Hostinger ใช้ mail transport ของโฮสต์ผ่าน `mail()` ซึ่งทดสอบปลายทางกับเจ้าของแล้ว ไม่ต้องบันทึกรหัสผ่านกล่องเมลในโปรเจกต์
- สถานะ `mailQueued` หมายถึงโฮสต์รับเมลเข้าคิว ไม่ได้เป็นหลักฐานว่าเข้ากล่องผู้รับแล้ว; การยืนยันปลายทางต้องตรวจเมลจริง
- คำขออยู่ใน `var/inquiries.sqlite` นอก public webroot พร้อม key ใน `var/inquiry.key` (ห้ามนำเข้า Git หรือย้ายเข้า `public/`)
- การ deploy ต้องรักษา `var/` เดิมไว้ และควรสำรอง SQLite แบบสอดคล้องกัน ไม่คัดลอกระหว่างมี writer ทำงาน
- ข้อมูลอายุเกิน 90 วันถูกล้างเมื่อ API ทำงานครั้งถัดไป; มีคำสั่ง CLI `php src/PruneInquiries.php` สำหรับดูแลเพิ่มเติม ไม่มีคำรับประกันเวลาลบที่แน่นอนบนหน้าเว็บ
- ราคา/ประเภทงานส่วนกลาง: `src/EstimateConfig.json` แล้วรัน `python scripts/sync_site_entrypoints.py` เพื่อสร้าง client config และ sync entrypoints
- ทดสอบ backend โดยไม่ส่งเมลจริงหรือแตะฐานข้อมูลลูกค้า: `php scripts/test_inquiries.php` (สร้างฐานข้อมูลทดสอบใน temporary directory)

ผลส่งมอบและขอบเขตการทดสอบ: `docs/INQUIRY_DELIVERY_2026-11-03.md`
