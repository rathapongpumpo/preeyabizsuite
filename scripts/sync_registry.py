# -*- coding: utf-8 -*-
import os

# Update src/ProjectRegistry.php
with open('src/ProjectRegistry.php', 'r', encoding='utf-8') as f:
    php_content = f.read()

old_tilt = """    '/tilt-signal-arcade-bar' => [
        'title' => 'Tilt Signal Arcade Bar | เว็บไซต์โปรโมตร้านสไตล์ Cinematic',
        'short' => 'Tilt Signal Arcade Bar',
        'category' => 'website',
        'category_name' => 'เว็บไซต์และงานออกแบบ',
        'description' => 'Landing Page สำหรับร้านบาร์และสถานบันเทิง ดีไซน์แบบ Cinematic จัดวาง Typography โดดเด่น สื่อบรรยากาศและเรื่องราวของแบรนด์ได้อย่างทรงพลัง',
        'problem' => 'สถานที่และร้านอาหารต้องการเว็บไซต์ที่มีเอกลักษณ์เฉพาะตัว สื่ออารมณ์และบรรยากาศร้านได้ดีกว่าเทมเพลตทั่วไป',
        'audience' => 'ร้านอาหาร, บาร์, สถานบันเทิง, สถานที่จัดอีเวนต์ และแบรนด์ไลฟ์สไตล์',
        'impact' => 'ดึงดูดความสนใจของผู้เข้าชม สร้างการจดจำแบรนด์ และกระตุ้นให้เกิดการจองโต๊ะหรือมาเยือนสถานที่จริง',
        'scope' => 'บูรณาการหน้าเว็บ Cinematic Landing Page ผ่าน Secure Proxy, ปรับการแสดงผล Responsive สำหรับผู้ใช้บนมือถือ',
        'tech' => ['Editorial Web Design', 'CSS Typography & Grid', 'Reverse Proxy', 'Mobile Optimization'],
        'highlights' => ['Cinematic Layout', 'Brand Storytelling', 'Atmosphere & Menu', 'Table Booking CTA'],
        'quick_try' => '1. เลื่อนชมการจัดวางเนื้อหาและลำดับภาพ 2. สำรวจบรรยากาศและเมนูไฮไลต์ 3. กดปุ่ม Call to Action',
        'constraints' => 'เป็นระบบเดโมภายนอกที่ฝังผ่าน Secure Proxy การจองโต๊ะเป็น UI จำลอง',"""

new_tilt = """    '/tilt-signal-arcade-bar' => [
        'title' => 'Tilt Signal — Venue & Table Reservation Suite',
        'short' => 'Tilt Signal Reservation Suite',
        'category' => 'website',
        'category_name' => 'เว็บไซต์และงานออกแบบ',
        'description' => 'เว็บไซต์หน้าร้านสไตล์โมเดิร์นพร้อมระบบจองโต๊ะ เลือกโซนที่นั่ง ออกคิวอาร์โค้ดรับคิว และแดชบอร์ดหลังบ้านสำหรับร้านอาหาร บาร์ คลินิก และธุรกิจบริการ',
        'problem' => 'สถานที่และร้านอาหารต้องการเว็บไซต์ที่มีเอกลักษณ์เฉพาะตัว สื่ออารมณ์และบรรยากาศร้านได้ดีกว่าเทมเพลตทั่วไป พร้อมระบบรับจองและจัดการคิวหลังบ้าน',
        'audience' => 'ร้านอาหาร, บาร์, สถานบันเทิง, สถานที่จัดอีเวนต์ และแบรนด์ไลฟ์สไตล์',
        'impact' => '📅 รับจองคิวและโต๊ะออนไลน์อัตโนมัติ 24 ชม. พร้อมตารางจัดการคิวหลังบ้านแบบเรียลไทม์',
        'scope' => 'บูรณาการหน้าเว็บหน้าร้าน พร้อมระบบ Interactive Table Booking, ระบบออก QR Ticket Pass และแดชบอร์ด Admin Reservation Desk',
        'tech' => ['Editorial Web Design', 'Interactive Booking Engine', 'QR Code Pass', 'Admin Reservation Desk'],
        'highlights' => ['Table & Queue Booking', 'Seat Zone Selector', 'QR Ticket Pass', 'Admin Reservation Desk'],
        'quick_try' => '1. ทดลองเลือกโซนและรอบเวลาจองโต๊ะ 2. กดปุ่มยืนยันเพื่อรับ QR Ticket Pass 3. สลับไปมุมมอง Admin Reservation Desk เพื่อจัดการคิว',
        'constraints' => 'ระบบจองทำงานผ่าน Client-side Store และ LocalStorage ข้อมูลคงอยู่ตลอดการทดสอบ',"""

php_content_clean = php_content.replace('\r\n', '\n')
old_tilt_clean = old_tilt.replace('\r\n', '\n')
new_tilt_clean = new_tilt.replace('\r\n', '\n')

if old_tilt_clean in php_content_clean:
    php_content_clean = php_content_clean.replace(old_tilt_clean, new_tilt_clean)
    with open('src/ProjectRegistry.php', 'w', encoding='utf-8', newline='\n') as f:
        f.write(php_content_clean)
    print("Updated src/ProjectRegistry.php successfully")
else:
    print("Could not find old_tilt in src/ProjectRegistry.php")

# Update public/index.html
with open('public/index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

html_content = html_content.replace(
    '"impact": "เห็นยอดสต็อกเรียลไทม์ ลดเวลาตรวจนับ คุมยอดรับ-จ่ายได้อย่างแม่นยำ และวางแผนสั่งซื้อได้ทันท่วงที"',
    '"impact": "📉 ลดความคลาดเคลื่อนของสต็อกและเวลาเช็กสินค้าคงคลังได้กว่า 60%"'
)
html_content = html_content.replace(
    '"impact": "รวมศูนย์ข้อมูลลูกค้า มองเห็น Stage ชัดเจน คาดการณ์ยอดขายได้แม่นยำ และปิดการขายได้เร็วขึ้น"',
    '"impact": "⚡ ย่นเวลาตั้งแต่การออกใบเสนอราคาจนถึงการเซ็นสัญญาจากหลายวันเหลือไม่กี่นาที"'
)
html_content = html_content.replace(
    '"impact": "สั่งอาหารได้ไว ส่งออเดอร์เข้าครัวแบบเรียลไทม์ ลดข้อผิดพลาดในการทำอาหาร และสรุปยอดขายได้ทันที"',
    '"impact": "🍽️ เชื่อมต่อออเดอร์หน้าร้านสู่จอครัวแบบเรียลไทม์ ลดปัญหาออเดอร์ตกหล่นและคิวซ้ำซ้อน"'
)
html_content = html_content.replace(
    '"impact": "ลูกค้าตรวจสอบสถานะเองได้ตลอด 24 ชั่วโมง ลดภาระตอบแชทของแอดมิน และเห็นความคืบหน้าของพัสดุอย่างโปร่งใส"',
    '"impact": "📦 ลูกค้าเช็กสถานะพัสดุและค่านำเข้าได้เอง 24 ชม. ลดภาระแอดมินตอบแชตซ้ำๆ กว่า 70%"'
)
html_content = html_content.replace(
    '"impact": "นำเสนอภาพลักษณ์แบรนด์ที่โดดเด่น เพิ่มอัตราการหยิบสินค้าลงตะกร้าด้วย UI ที่ตอบสนองทันใจ"',
    '"impact": "🛒 หน้าเว็บโหลดไว รองรับการสั่งซื้อและชำระเงินครบวงจรโดยไม่ต้องพึ่งแพลตฟอร์มตัวกลาง"'
)

old_html_tilt = """"title": "Tilt Signal Arcade Bar | เว็บไซต์โปรโมตร้านสไตล์ Cinematic",
          "short": "Tilt Signal Arcade Bar",
          "category": "website",
          "category_name": "เว็บไซต์และงานออกแบบ",
          "description": "Landing Page สำหรับร้านบาร์และสถานบันเทิง ดีไซน์แบบ Cinematic จัดวาง Typography โดดเด่น สื่อบรรยากาศและเรื่องราวของแบรนด์ได้อย่างทรงพลัง",
          "problem": "สถานที่และร้านอาหารต้องการเว็บไซต์ที่มีเอกลักษณ์เฉพาะตัว สื่ออารมณ์และบรรยากาศร้านได้ดีกว่าเทมเพลตทั่วไป",
          "audience": "ร้านอาหาร, บาร์, สถานบันเทิง, สถานที่จัดอีเวนต์ และแบรนด์ไลฟ์สไตล์",
          "impact": "ดึงดูดความสนใจของผู้เข้าชม สร้างการจดจำแบรนด์ และกระตุ้นให้เกิดการจองโต๊ะหรือมาเยือนสถานที่จริง",
          "scope": "บูรณาการหน้าเว็บ Cinematic Landing Page ผ่าน Secure Proxy, ปรับการแสดงผล Responsive สำหรับผู้ใช้บนมือถือ",
          "tech": ["Editorial Web Design", "CSS Typography & Grid", "Reverse Proxy", "Mobile Optimization"],
          "highlights": ["Cinematic Layout", "Brand Storytelling", "Atmosphere & Menu", "Table Booking CTA"],
          "quick_try": "1. เลื่อนชมการจัดวางเนื้อหาและลำดับภาพ 2. สำรวจบรรยากาศและเมนูไฮไลต์ 3. กดปุ่ม Call to Action",
          "constraints": "เป็นระบบเดโมภายนอกที่ฝังผ่าน Secure Proxy การจองโต๊ะเป็น UI จำลอง","""

new_html_tilt = """"title": "Tilt Signal — Venue & Table Reservation Suite",
          "short": "Tilt Signal Reservation Suite",
          "category": "website",
          "category_name": "เว็บไซต์และงานออกแบบ",
          "description": "เว็บไซต์หน้าร้านสไตล์โมเดิร์นพร้อมระบบจองโต๊ะ เลือกโซนที่นั่ง ออกคิวอาร์โค้ดรับคิว และแดชบอร์ดหลังบ้านสำหรับร้านอาหาร บาร์ คลินิก และธุรกิจบริการ",
          "problem": "สถานที่และร้านอาหารต้องการเว็บไซต์ที่มีเอกลักษณ์เฉพาะตัว สื่ออารมณ์และบรรยากาศร้านได้ดีกว่าเทมเพลตทั่วไป พร้อมระบบรับจองและจัดการคิวหลังบ้าน",
          "audience": "ร้านอาหาร, บาร์, สถานบันเทิง, สถานที่จัดอีเวนต์ และแบรนด์ไลฟ์สไตล์",
          "impact": "📅 รับจองคิวและโต๊ะออนไลน์อัตโนมัติ 24 ชม. พร้อมตารางจัดการคิวหลังบ้านแบบเรียลไทม์",
          "scope": "บูรณาการหน้าเว็บหน้าร้าน พร้อมระบบ Interactive Table Booking, ระบบออก QR Ticket Pass และแดชบอร์ด Admin Reservation Desk",
          "tech": ["Editorial Web Design", "Interactive Booking Engine", "QR Code Pass", "Admin Reservation Desk"],
          "highlights": ["Table & Queue Booking", "Seat Zone Selector", "QR Ticket Pass", "Admin Reservation Desk"],
          "quick_try": "1. ทดลองเลือกโซนและรอบเวลาจองโต๊ะ 2. กดปุ่มยืนยันเพื่อรับ QR Ticket Pass 3. สลับไปมุมมอง Admin Reservation Desk เพื่อจัดการคิว",
          "constraints": "ระบบจองทำงานผ่าน Client-side Store และ LocalStorage ข้อมูลคงอยู่ตลอดการทดสอบ","""

html_content_clean = html_content.replace('\r\n', '\n')
old_html_tilt_clean = old_html_tilt.replace('\r\n', '\n')
new_html_tilt_clean = new_html_tilt.replace('\r\n', '\n')

if old_html_tilt_clean in html_content_clean:
    html_content_clean = html_content_clean.replace(old_html_tilt_clean, new_html_tilt_clean)
    with open('public/index.html', 'w', encoding='utf-8', newline='\n') as f:
        f.write(html_content_clean)
    print("Updated public/index.html successfully")
else:
    print("Could not find old_html_tilt in public/index.html")
