# Preeya | Creative Developer Portfolio

Creative Developer Portfolio พัฒนาเว็บแอปพลิเคชัน ระบบหลังบ้าน และระบบอัตโนมัติสำหรับธุรกิจ ออกแบบสไตล์ **OBLO Neo-brutalist Design** (พื้นครีม `#FFF9F2`, ตัวอักษรเข้ม `#202020`, สีเน้นน้ำเงินสด `#3454F5`, ส้มคอรัล `#FF6B55`, และเหลือง `#FFD65A`) พร้อมระบบ Interactive Prototype ให้ทดลองใช้งานจริงได้ทันที

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
- PHP 8.2+ พร้อมส่วนขยาย `curl`, `json`, `mbstring`, `openssl` (หรือ Node.js สำหรับ Static Server)

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
