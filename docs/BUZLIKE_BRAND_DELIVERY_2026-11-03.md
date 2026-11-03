# BUZLIKE — ผลส่งมอบ 3 พฤศจิกายน 2026

เผยแพร่แล้วที่ https://buzlike.com/ บน Hostinger เฉพาะเว็บไซต์ Buzlike

## สิ่งที่เปลี่ยน

- ชื่อ BUZLIKE และคำอธิบาย “เว็บไซต์และระบบสำหรับธุรกิจ” พร้อมโลโก้ B, favicon และฉากหลัง B ในภาพ flow ร้านกาแฟ โดยคงตำแหน่งการ์ด เส้นทาง สี และภาพสินค้าเดิม
- อีเมลแสดงผลและ mailto ทั้งแบบคงที่/สรุปแบบประเมินเป็น `support@buzlike.com`
- ใบสรุปคำขอ ใบเสร็จ POS และใบแจ้งหนี้ขนส่งใช้ BUZLIKE; เอกสารยังระบุว่าเป็นตัวอย่าง
- ภาพแชร์ใหม่ 1200 × 630 จากหน้าเว็บที่พัฒนาเสร็จแล้ว: `/assets/portfolio/share-buzlike-v1.png`
- ค่ากลาง `src/SiteConfig.json` ใช้ใน PHP, ตัวสร้าง metadata และ client config ที่สร้างด้วย `python scripts/sync_site_entrypoints.py`
- Canonical/OG/Twitter, sitemap และ robots ใช้ `https://buzlike.com`; หน้าสาธารณะเปิด index และไม่มี HTTP noindex ครอบทั้งเว็บ ส่วน signing/admin/customer ยังมี HTML noindex
- HTTPS www เปลี่ยนไป apex ด้วย 301 พร้อม path/query เดิม
- แก้ปุ่มคัดลอกข้อความพัสดุที่เคยประกอบ multiline string ใน inline JavaScript จนกดแล้วผิดพลาด ใช้ event listener และทดสอบค่าที่คัดลอกจริงแล้ว
- เก็บ localStorage identifiers เดิมทั้งหมด; ข้อมูลในเบราว์เซอร์เดิมไม่ถูกล้างหรือเขียนทับด้วยการย้ายแบรนด์ ข้อมูลตั้งต้นใหม่ใช้ชื่อเจ้าหน้าที่ตัวอย่าง

## ผลตรวจจริง

- Browser functional audit บนเว็บจริงผ่าน 31/31: เดโม 9 เส้นทาง เมนูมือถือ anchor รูป เปรียบเทียบราคา แบบประเมินหลายระบบ การเตรียมสรุป จองวันอนาคต QR และ modal focus
- Brand regression บนเว็บจริงผ่าน 14/14: อีเมลและเนื้อหาสรุปจริง โลโก้ B ใบเสร็จ/ใบแจ้งหนี้ ข้อความพัสดุ โครงร่าง flow และ draft/POS persistence
- HTTP/metadata/assets ผ่าน 20/20: ทุก route, index directives, www path/query redirect, HTTP→HTTPS และไฟล์ที่หน้าจออ้างอิง
- เปิดตรวจภาพ desktop/mobile, ใบเสร็จ, ใบแจ้งหนี้ และภาพแชร์แล้ว; ไม่มี document overflow ที่ 375/390/768/1440 px ในการตรวจหลัก
- PHP lint และ JavaScript syntax checks ผ่าน ไฟล์ส่งขึ้นโฮสต์ตรวจ SHA-256 ตรงกับ release manifest ครบ 137 ไฟล์

หลักฐานอยู่ใน `output/playwright/buzlike-brand/`: `live-audit-result.json`, `live-brand-result.json`, `http-results.json`, `live-home-desktop.png`, `live-home-mobile-390.png`, `live-receipt.png`, `live-invoice.png` และ `live-booking.pdf`

Hostinger recompresses ภาพ PNG แต่ขนาดและ pixel ของภาพแชร์ตรงกับต้นฉบับทุกจุด Favicon ใช้ version URL เพื่อไม่ดึงโลโก้เดิมจาก CDN cache

## สำรองและการเผยแพร่

- สำรองก่อนแก้: `/home/u271733843/buzlike-backups/20261103-080821-before-brand` มี `public_html` และ `src` เดิมครบ 134 ไฟล์
- Release staging: `/home/u271733843/buzlike-releases/20261103-brand`
- ปลายทาง: `/home/u271733843/domains/buzlike.com` โดย source PHP อยู่ `src` นอก public webroot
- ไม่แตะเว็บไซต์อื่นในบัญชี ไม่เปลี่ยนระบบร้านค้าภายนอก

## ขอบเขตการยืนยัน

แบบประเมินเตรียมข้อความให้ผู้ใช้ส่งผ่านโปรแกรมอีเมล/LINE เอง ไม่ได้เพิ่ม SMTP หรือส่งข้อความทดสอบ ข้อมูลเดโมยังเป็น browser-local ไม่ใช่ฐานข้อมูลกลาง การตั้งค่า index ที่ตรวจผ่านไม่ใช่การยืนยันว่า Google จัดทำดัชนีแล้ว
