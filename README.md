# Preeya Systems PHP Demo

ระบบเดโม PHP ที่สร้างจาก SRS และ source code ตัวอย่างของ `portfolio-demo`

## ขอบเขต

- Portfolio Portal
- Sales Flow CRM
- E-Commerce Storefront (external proxy)
- Tilt Signal Arcade Bar (external proxy)
- USA–Thai Shipping
- EduFlow Course Platform
- Nexus Warehouse Management
- NexusFlow Project / Kanban
- SmartPOS
- Lite E-Signature
- NexusDash และ OmniPOS Classic แบบ archive

ระบบ Mini Game และระบบบริหารสปา/คลินิกไม่รวมอยู่ในโครงการนี้

## วิธีเปิดใช้งาน

ต้องใช้ PHP 8.2+ พร้อม extensions `curl`, `json`, `mbstring` และ `openssl`

วิธีง่ายที่สุดบน Windows: ดับเบิลคลิก `start-demo.bat`

หรือเปิด PowerShell แล้วใช้คำสั่ง:

```powershell
cd C:\Projects\demo-system
php -S 127.0.0.1:8080 -t public router.php
```

จากนั้นเปิด `http://127.0.0.1:8080`

> ต้องมี `-t public` หากตัดส่วนนี้ออก CSS และ JavaScript จะตอบ 404

## การเก็บข้อมูลเดโม

ข้อมูลที่ผู้ทดลองเพิ่มหรือแก้ไขเก็บใน `localStorage` ของ browser โดยใช้ prefix:

```text
preeya_php_demo_v1:
```

ข้อมูลไม่ถูกส่งเข้า database และแยกตาม browser/profile ผู้ใช้สามารถกดปุ่มรีเซ็ตในแต่ละโมดูลเพื่อกลับไปใช้ seed data

## Apache shared hosting

ตั้ง Document Root ไปที่โฟลเดอร์ `public/` และเปิด `mod_rewrite` ไฟล์ `.htaccess` จะส่ง route ที่ไม่ใช่ไฟล์จริงไปยัง `index.php`

## หมายเหตุ

- หน้า E-Commerce และ Tilt Signal ใช้ PHP reverse proxy ไปยัง upstream allowlist จึงต้องเชื่อมต่ออินเทอร์เน็ต
- การส่ง LINE, payment, video และลายเซ็นเป็น simulation สำหรับ demo
- PDF ใช้ jsPDF จาก CDN หาก CDN ใช้งานไม่ได้ ระบบจะเปิดหน้าพิมพ์เพื่อเลือก Save as PDF
