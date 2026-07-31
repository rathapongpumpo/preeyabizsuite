# Software Requirements Specification (SRS)

## ระบบ Preeya Systems Portfolio Demo สำหรับพัฒนาใหม่ด้วย PHP

**รหัสเอกสาร:** SRS-PSD-PHP-001  
**เวอร์ชัน:** 1.1  
**วันที่จัดทำ:** 31 กรกฎาคม 2026  
**สถานะ:** Revised Scope สำหรับพัฒนา  
**ระบบอ้างอิง:** `portfolio-demo` (Next.js 16.1.6 / React 19.2.3)  
**ระบบเป้าหมาย:** PHP 8.2+ และ MySQL/MariaDB  
**ภาษา UI หลัก:** ไทยและอังกฤษตามข้อความในระบบเดิม

---

## 1. วัตถุประสงค์ของเอกสาร

เอกสารนี้ระบุข้อกำหนดสำหรับสร้างระบบใหม่ด้วย PHP ให้มีหน้าตา เส้นทาง หน้าจอ ข้อมูลเริ่มต้น และพฤติกรรมการโต้ตอบเหมือนระบบอ้างอิงมากที่สุด โดยครอบคลุมหน้า Portfolio Portal และเดโมย่อยที่อยู่ในขอบเขต รวมทั้ง route แบบ archive ที่ระบุไว้ในเอกสาร

เอกสารแยกข้อกำหนดออกเป็น 2 ระดับ:

1. **Compatibility baseline:** ต้องทำงานเหมือน prototype เดิม รวมถึงสถานะเริ่มต้น สูตรคำนวณ และข้อจำกัดของเดโม
2. **PHP production foundation:** โครงสร้าง backend, database, session, validation และ security ที่ต้องเพิ่มเพื่อให้ระบบใหม่ใช้งานและดูแลต่อได้ โดยไม่เปลี่ยนประสบการณ์ของผู้ใช้

คำว่า “เหมือนระบบเดิม” ในเอกสารนี้หมายถึง:

- route และลำดับการใช้งานเหมือนเดิม
- ข้อความ ปุ่ม สี โครงหน้า และ responsive behavior ใกล้เคียงเดิม
- ข้อมูล seed และผลการคำนวณเริ่มต้นเหมือนเดิม
- ปุ่มที่ระบบเดิมทำงานต้องให้ผลเหมือนเดิม
- ปุ่มที่ระบบเดิมเป็น mock/inert ต้องไม่ถูกอ้างว่าใช้งานจริง เว้นแต่ผู้ว่าจ้างอนุมัติให้ยกระดับ
- ระบบภายนอกที่ระบบเดิมฝังผ่าน iframe ต้องได้รับการตัดสินใจว่าจะ proxy ต่อหรือ freeze เป็นระบบ PHP ในโครงการ

---

## 2. ขอบเขตระบบ

### 2.1 อยู่ในขอบเขต

- Portfolio Portal และการสลับธีม
- Demo shell ที่ครอบทุกโมดูล
- Sales Flow CRM / Business Suite
- E-Commerce Storefront
- Tilt Signal Arcade Bar landing page
- USA–Thai Shipping: selector, admin portal และ customer portal
- EduFlow course platform
- Nexus Warehouse Management
- NexusFlow project/Kanban management
- SmartPOS: POS, KDS, Dashboard และ Kiosk
- Lite E-Signature และการดาวน์โหลด PDF
- Route ที่เก็บเป็น archive ได้แก่ NexusDash และ OmniPOS Classic
- การจัดเก็บข้อมูลแทน `localStorage` ด้วย PHP session/database ตามประเภทข้อมูล
- seed data สำหรับเปิดระบบครั้งแรกและคำสั่ง reset demo

### 2.2 ไม่อยู่ในขอบเขตของ baseline

- Payment gateway จริง
- การส่ง LINE Messaging API จริง
- การยืนยันตัวตนด้วยบัญชีจริงหรือ SSO
- ระบบบัญชี ภาษี และใบกำกับภาษีที่มีผลทางกฎหมาย
- ลายเซ็นดิจิทัลตามมาตรฐาน PKI หรือ certificate authority
- การจัดส่งจริง การเชื่อม carrier หรือ webhook
- การพิมพ์เครื่อง thermal printer จริง
- การจัดการไฟล์วิดีโอและ video streaming server
- การรับประกันว่าเนื้อหาจาก upstream external demo จะไม่เปลี่ยนแปลง
- ระบบมินิเกมทั้งหมด รวมถึง Mini Game Portal, Mini 2D Pool และ Ramakien Slot
- ระบบบริหารสปาและคลินิกทั้งหมด รวมถึง Nirvana Spa Management

รายการข้างต้นสามารถพัฒนาในเฟสถัดไปได้ แต่ต้องออก change request เพราะเปลี่ยนความเสี่ยงและสถาปัตยกรรมอย่างมีนัยสำคัญ

---

## 3. ภาพรวมระบบอ้างอิง

### 3.1 เทคโนโลยีปัจจุบัน

- Next.js App Router 16.1.6
- React 19.2.3
- TypeScript/JavaScript
- Tailwind CSS 4
- Lucide React icons
- client-side state และ `localStorage`
- iframe และ server-side proxy สำหรับ 2 external demos
- ไม่มีฐานข้อมูล ไม่มี API ภายใน ไม่มีระบบ authentication จริง

### 3.2 รูปแบบข้อมูลปัจจุบัน

ระบบเป็น interactive prototype ไม่ใช่ระบบ production ข้อมูลแบ่งเป็น:

- **Static seed:** ประกาศในไฟล์หน้า เช่น inventory, products, users และ course
- **State ในหน่วยความจำ:** หายเมื่อ refresh เช่น Kanban และ OmniPOS Classic
- **LocalStorage:** คงอยู่เฉพาะ browser เช่น CRM, SmartPOS, Shipping, Course, E-Signature และ NexusDash
- **Remote upstream:** หน้า E-Commerce และ Tilt Signal ถูกดึงจาก Vercel ภายนอกผ่าน proxy

### 3.3 หลักการแปลงเป็น PHP

ระบบ PHP ต้องแยกอย่างน้อยเป็น:

- Presentation: PHP templates + HTML/CSS/JavaScript
- Application services: controller/service สำหรับ workflow แต่ละโมดูล
- Persistence: MySQL/MariaDB ผ่าน PDO และ transaction
- Session: PHP session สำหรับ cart, demo-role และ state ชั่วคราว
- API: JSON endpoints สำหรับการกระทำที่ต้องอัปเดตหน้าจอแบบไม่ reload
- Asset layer: local images/fonts/icons หรือ asset bundle ที่ได้รับอนุญาต

JavaScript ยังคงจำเป็นสำหรับ drag-and-drop, modal, responsive navigation, signature pad/canvas และ PDF generation/preview บางส่วน

---

## 4. ผู้ใช้งานและบทบาท

| รหัส | บทบาท | ขอบเขต |
|---|---|---|
| ACT-01 | ผู้เยี่ยมชม Portfolio | ดูรายการเดโม เปิดเดโม ติดต่อผ่าน LINE/email และสลับธีม |
| ACT-02 | พนักงานขาย/CRM Demo User | จัดการ pipeline, quote, contract handoff และปิดการขาย |
| ACT-03 | Course Student | ดู/ซื้อคอร์ส ติดตามสถานะคำสั่งซื้อ เรียน และทำบทเรียนสำเร็จ |
| ACT-04 | Course Admin | ดูทุกคอร์ส อนุมัติคำสั่งซื้อและปลดล็อกคอร์ส |
| ACT-05 | Shipping Admin | เพิ่มพัสดุ อัปเดตสถานะ สรุปลูกค้า และสร้างข้อความ LINE |
| ACT-06 | Shipping Customer | ค้นหาด้วย Customer ID และติดตามพัสดุ |
| ACT-07 | Warehouse Manager/Staff | ดู dashboard, inventory และหน้าจอปฏิบัติการ WMS |
| ACT-08 | Project Team Member | ดูหลาย project ค้นหา เพิ่ม และลาก task |
| ACT-09 | POS Cashier | เพิ่มสินค้า คิด VAT รับชำระ และส่ง order |
| ACT-10 | Kitchen Staff | เปลี่ยน order จาก pending ไป completed |
| ACT-11 | POS Manager | ดูยอดรวม best seller และ reset orders |
| ACT-12 | Kiosk Customer | สั่งสินค้าและจำลอง QR payment |
| ACT-13 | Document Signer | อ่านสัญญา วาดลายเซ็น ยืนยัน และดาวน์โหลด PDF |

> Baseline เดิมใช้ role switcher และ demo account โดยไม่มีการพิสูจน์ตัวตน ระบบ PHP production foundation ต้องไม่ใช้วิธีนี้เป็น authorization จริง

---

## 5. Route และหน้าจอ

| Route | ชื่อระบบ | สถานะบน Portal | แหล่งข้อมูล |
|---|---|---|---|
| `/` | Preeya Systems Portfolio Portal | แสดง | Static |
| `/business-suite` | Sales Flow CRM | Featured | Database |
| `/ecommerce-storefront` | OAI Apparel Storefront | Featured | External proxy หรือ frozen local |
| `/tilt-signal-arcade-bar` | Tilt Signal Arcade Bar | Featured | External proxy หรือ frozen local |
| `/usa-thai-shipping` | Shipping Portal Selector | แสดง | Static |
| `/usa-thai-shipping/admin` | Shipping Admin Portal | route ลูก | Database |
| `/usa-thai-shipping/customer` | Shipping Customer Portal | route ลูก | Database |
| `/course` | EduFlow | แสดง | Database/session |
| `/warehouse-management` | NexusWMS | แสดง | Seed/mock หรือ database |
| `/project-management` | NexusFlow | แสดง | Database/session |
| `/pos-system-smart` | SmartPOS | แสดง | Database |
| `/e-signature` | Lite E-Signature | แสดง | Database/file storage |
| `/dashboard-mini` | NexusDash | Archive/ไม่แสดง | Database |
| `/pos-system` | OmniPOS Classic | Archive/ไม่แสดง | Session/database |

PHP ต้องรองรับ URL ที่ไม่มี `.php` ผ่าน rewrite rules หรือ framework routing เพื่อให้ URL เหมือนเดิม

---

## 6. ข้อกำหนดร่วมทุกโมดูล

### 6.1 Demo Shell

- **FR-COM-001:** ทุก route ในกลุ่มเดโมต้องมีแถบด้านบนสูงประมาณ 56px พื้นหลังเข้ม
- **FR-COM-002:** ด้านซ้ายต้องมีลิงก์ “กลับหน้า Portal”; บนมือถือแสดงข้อความย่อ “กลับ”
- **FR-COM-003:** ต้องแสดงชื่อโปรเจกต์ปัจจุบันและจุดสถานะสีเขียวแบบ pulse
- **FR-COM-004:** ต้องมีปุ่ม “ข้อมูลระบบ” เปิด popover
- **FR-COM-005:** Popover ต้องแสดง description, audience, impact และ highlights จาก project registry
- **FR-COM-006:** ปุ่มปิด popover ต้องทำงาน และ popover ต้องไม่ล้นจอบนมือถือ
- **FR-COM-007:** พื้นที่เนื้อหาต้อง scroll ภายใน shell และรักษาความสูง `100dvh`
- **FR-COM-008:** layout ต้องรองรับ viewport มือถือ แท็บเล็ต และ desktop โดยไม่เกิด horizontal overflow ที่ไม่ตั้งใจ

### 6.2 Theme

- **FR-COM-009:** หน้า Portal และ Business Suite ต้องมี light/dark toggle
- **FR-COM-010:** ค่า theme ต้องจำข้ามการ refresh
- **FR-COM-011:** ถ้ายังไม่มีค่าที่บันทึก ให้ใช้ `prefers-color-scheme`
- **FR-COM-012:** ปุ่มต้องมี accessible label “Switch to light mode” หรือ “Switch to dark mode”
- **FR-COM-013:** ค่า CSS theme ต้องเปลี่ยน page background, card background, border และสีข้อความตาม baseline

### 6.3 Accessibility และ interaction

- **NFR-ACC-001:** ปุ่มและลิงก์หลักต้องใช้งานด้วย keyboard ได้
- **NFR-ACC-002:** input ทุกตัวต้องมี label หรือ accessible name
- **NFR-ACC-003:** color contrast ของข้อความปกติต้องไม่น้อยกว่า WCAG AA
- **NFR-ACC-004:** modal ต้อง trap focus, ปิดด้วย Escape และคืน focus ไปยัง element เดิม
- **NFR-ACC-005:** canvas ที่เป็นฟังก์ชันหลักต้องมีคำอธิบายหรือ fallback controls ตามความเหมาะสม

---

## 7. Portfolio Portal

### 7.1 เนื้อหาและลำดับ

- **FR-POR-001:** Header ต้องแสดง “Preeya Systems” และ subtitle “Demo & prototype studio”
- **FR-POR-002:** ต้องมี CTA “ส่งโจทย์ให้ประเมิน” ไป `https://lin.ee/YjK8Ji8`
- **FR-POR-003:** Hero ต้องแสดง eyebrow “Interactive business demo”, หัวข้อ “เว็บเดโมระบบธุรกิจ ที่ลูกค้ากดลองได้ทันที” และข้อความอธิบายเดิม
- **FR-POR-004:** CTA “เลือกจากโจทย์ธุรกิจ” ต้อง scroll ไป section `#guide`
- **FR-POR-005:** ต้องแสดงตัวเลข 9 เดโม, “Mockup / ไม่ใช้ backend” และช่องทาง LINE
- **FR-POR-006:** แถว preview ด้านบนต้องมี Business Suite, E-Commerce และ Tilt Signal พร้อมภาพ preview
- **FR-POR-007:** Guide section ต้องมี 4 กลุ่ม: CRM/Sales, E-Commerce, Operation และ Service/Docs โดยกลุ่ม Service/Docs ต้องชี้ไป Lite E-Signature
- **FR-POR-008:** Featured section ต้องมี 3 โปรเจกต์แรกตามลำดับ 01–03
- **FR-POR-009:** CTA section ต้องมี 3 brief prompts และลิงก์ LINE/email
- **FR-POR-010:** All demos ต้องแสดงเฉพาะ 6 โปรเจกต์ visible ที่เหลือตามลำดับ 04–09
- **FR-POR-011:** Archive routes ต้องไม่ปรากฏในหน้า Portal แต่ยังเปิดผ่าน URL ได้
- **FR-POR-012:** Contact section ต้องแสดง email `r.pumpo@gmail.com`, LINE URL และ QR image
- **FR-POR-013:** Floating LINE CTA ต้องแสดงในตำแหน่งคงที่และไม่บัง navigation สำคัญ

### 7.2 SEO

- **NFR-SEO-001:** `<html lang="th">`
- **NFR-SEO-002:** ต้องมี title, description, keywords, canonical, Open Graph และ Twitter card
- **NFR-SEO-003:** OG image ใช้อัตราส่วน 1200×630
- **NFR-SEO-004:** favicon/icon ต้องรองรับ SVG
- **NFR-SEO-005:** production URL ต้องกำหนดผ่าน environment configuration ห้าม hard-code domain ของระบบเดิม

---

## 8. Sales Flow CRM / Business Suite

### 8.1 ข้อมูล

**Deal:** id, company, contact, value, stage, probability, owner, source, next_action, updated_at  
**Quote:** id, deal_id, status, discount, created_at  
**Quote Item:** quote_id, label, qty, unit_price  
**Activity:** id, deal_id, activity_type, text, created_at

Stage ต้องมี 5 ค่าและ probability เริ่มต้น:

| Stage | ชื่อ | Probability |
|---|---|---:|
| `new` | ลูกค้าใหม่ | 25 |
| `qualified` | คุยรายละเอียด | 50 |
| `proposal` | เสนอราคา | 68 |
| `contract` | เตรียมสัญญา | 84 |
| `won` | ปิดการขาย | 100 |

### 8.2 ข้อกำหนด

- **FR-CRM-001:** หน้าแรกต้องเปิด tab “ภาพรวม”
- **FR-CRM-002:** ต้องเลือก deal เริ่มต้นเป็นรายการแรก
- **FR-CRM-003:** Header ต้องมีปุ่ม “เพิ่มลูกค้าตัวอย่าง”, “เริ่มใหม่” และ theme toggle
- **FR-CRM-004:** ปุ่มเพิ่มลูกค้าตัวอย่างต้องเพิ่ม Greenline Coffee Co. มูลค่า 235,000 บาท ที่ stage `qualified`
- **FR-CRM-005:** หลังเพิ่มตัวอย่าง ต้องเลือก deal ใหม่และเปิด tab pipeline
- **FR-CRM-006:** ปุ่ม reset ต้องคืน seed deals, quotes, activities, selected deal และ active tab
- **FR-CRM-007:** Summary ต้องคำนวณ open pipeline, weighted pipeline, won value และ quote value จากข้อมูลปัจจุบัน
- **FR-CRM-008:** Weighted value = ผลรวม `deal.value × probability / 100` ของ deal ที่ยังไม่ won
- **FR-CRM-009:** Stage summary ต้องแสดงจำนวนและมูลค่ารวมต่อ stage
- **FR-CRM-010:** Overview ต้องแสดง focus cards: deal มูลค่าสูงสุด, deal stage proposal และ deal stage contract
- **FR-CRM-011:** กด focus card ต้องเลือก deal และเปลี่ยนไป tab ที่เกี่ยวข้อง
- **FR-CRM-012:** Pipeline ต้องแสดง 5 columns และรองรับ drag-and-drop deal ข้าม stage
- **FR-CRM-013:** เมื่อย้าย stage ต้องเปลี่ยน probability ตามตารางและบันทึก activity
- **FR-CRM-014:** คลิก deal card ต้องเปิดรายละเอียดด้านข้าง
- **FR-CRM-015:** Detail panel ต้องแสดง company, contact, stage trail, value, probability, source และ next action
- **FR-CRM-016:** ปุ่มออกใบเสนอราคาต้องเปิด quote เดิมถ้ามี หรือสร้าง quote ใหม่ถ้ายังไม่มี
- **FR-CRM-017:** Quote ใหม่ต้องแบ่งราคาจากมูลค่า deal เป็น 18%, 62%, 24% และ discount 4%
- **FR-CRM-018:** Quote total = ผลรวม `qty × price` ลบ discount
- **FR-CRM-019:** Quote status ต้องมี draft, sent และ approved
- **FR-CRM-020:** เมื่อ approved ต้องย้าย deal ไป stage contract
- **FR-CRM-021:** ปุ่มเตรียมสัญญาต้องย้าย stage เป็น contract, บันทึก activity และเปิด tab contract
- **FR-CRM-022:** Contract handoff ต้องแสดง company, contact, value, owner, stage และ next action
- **FR-CRM-023:** ปุ่ม “เปิดหน้าลงนามเอกสาร” ต้องไป `/e-signature`
- **FR-CRM-024:** ปุ่มปิดการขายต้องย้าย deal เป็น won และ disabled เมื่อ won แล้ว
- **FR-CRM-025:** Activity timeline ต้องเก็บล่าสุดสูงสุด 12 รายการสำหรับ action ที่ append ผ่าน workflow
- **FR-CRM-026:** การอัปเดต deal/quote/activity ที่สัมพันธ์กันต้องอยู่ใน database transaction เดียว

### 8.3 Seed สำคัญ

ต้องมี deal เริ่มต้น 5 รายการ:

1. Siam Fresh Mart — 185,000 — proposal — 68%
2. Bangkok Clinic Group — 260,000 — qualified — 52%
3. North Star Logistics — 420,000 — contract — 82%
4. Glow Spa Studio — 145,000 — new — 28%
5. SkillBridge Academy — 310,000 — won — 100%

หมายเหตุ: ค่า probability ของ seed บางรายการไม่ตรง default ของ stage ระบบใหม่ต้องเก็บค่า seed ตามเดิม และใช้ default เฉพาะตอนผู้ใช้ย้าย stage

---

## 9. E-Commerce Storefront

### 9.1 ข้อเท็จจริงด้าน dependency

ระบบเดิมไม่ได้เก็บ storefront source ใน repository แต่ proxy จาก:

`https://ecommerce-codex-demo.vercel.app`

PHP implementation ต้องเลือกอย่างใดอย่างหนึ่งก่อนเริ่มงาน:

- **Option A - Proxy parity:** ทำ reverse proxy และ rewrite URL เหมือนเดิม; ได้เนื้อหาปัจจุบันจาก upstream แต่ควบคุมความเปลี่ยนแปลงไม่ได้
- **Option B - Frozen clone (แนะนำสำหรับคำว่า “เหมือนเดิมเป๊ะ”):** เก็บ source, product data และ assets ที่ได้รับสิทธิ์ไว้ในโครงการ PHP แล้วกำหนด snapshot version

### 9.2 หน้าจอและพฤติกรรม

- **FR-ECO-001:** หน้า `/ecommerce-storefront` ต้องแสดง storefront ภายใน iframe ใต้ Demo Shell
- **FR-ECO-002:** Navigation ต้องมี Shop All, Clothes, Shoes และ Accessories
- **FR-ECO-003:** Account button ต้อง disabled ตาม baseline
- **FR-ECO-004:** Home hero ต้องแสดง spring campaign และ CTA ไป shop
- **FR-ECO-005:** Home ต้องมี cards แยก Women และ Men
- **FR-ECO-006:** Home ต้องแสดง featured products พร้อม image, gender, type, price, description, Add to cart และ Details
- **FR-ECO-007:** Shop page ต้องมี gender filters: All edits, Women, Men
- **FR-ECO-008:** Shop page ต้องมี department filters: All departments, Clothes, Shoes, Accessories
- **FR-ECO-009:** Category routes ต้องรองรับ `/clothes`, `/shoes`, `/accessories` และ query `gender`
- **FR-ECO-010:** Product detail route `/shop/{slug}` ต้องแสดง image, gender, type, title, price, long description, palette, material, fit และ sizes
- **FR-ECO-011:** Product detail ต้องแสดง related pieces
- **FR-ECO-012:** Add to cart ต้องเปิด/อัปเดต cart drawer
- **FR-ECO-013:** เพิ่มสินค้าซ้ำต้องเพิ่ม quantity ไม่สร้าง line ซ้ำ
- **FR-ECO-014:** Drawer ต้องรองรับ Remove, ลด/เพิ่มจำนวน, subtotal และลิงก์ full cart
- **FR-ECO-015:** Full cart ต้องแสดง lines, quantity controls, pieces count และ subtotal
- **FR-ECO-016:** Checkout และ Proceed to checkout ต้อง disabled พร้อมข้อความว่าเป็น demo
- **FR-ECO-017:** Cart baseline เป็น client session; PHP ควรใช้ session เพื่อให้ยังอยู่เมื่อเปลี่ยนหน้าในโดเมนเดียวกัน
- **FR-ECO-018:** ต้องแสดง disclaimer ว่าเป็นเว็บไซต์เดโมและข้อมูลเป็นเรื่องสมมติ

### 9.3 Proxy compatibility

- **INT-ECO-001:** Proxy ต้อง forward query string และ status code
- **INT-ECO-002:** ต้อง rewrite absolute upstream origin และ root-relative `href`, `src`, `action`, `srcset`, CSS `url()`
- **INT-ECO-003:** ต้อง rewrite path groups `_next`, catalog, images, assets, fonts, api, shop, clothes, shoes, accessories, cart, account
- **INT-ECO-004:** ต้องไม่ forward `content-encoding`, `content-length`, CSP และ X-Frame-Options ที่ขัดกับ iframe
- **SEC-ECO-001:** หากใช้ proxy ต้องจำกัด allowlist host ห้ามรับ URL จาก request โดยตรง เพื่อป้องกัน SSRF

---

## 10. Tilt Signal Arcade Bar

ระบบเดิม proxy จาก:

`https://openai-landing-page-examples.vercel.app/tilt-signal-arcade-bar`

- **FR-TIL-001:** ต้องแสดง landing page ภายใน iframe ใต้ Demo Shell
- **FR-TIL-002:** Header navigation ต้องมี Play, Specials, Drinks, Events และ Book
- **FR-TIL-003:** Hero ต้องแสดง brand “TILT SIGNAL”, tagline และเวลาทำการ
- **FR-TIL-004:** ต้องมี promotion cards: Unlimited Play Night, Pinball League และ High Score Hour
- **FR-TIL-005:** Things to do ต้องมี 6 รายการตาม baseline
- **FR-TIL-006:** ต้องมี sections Pinball Room, Drinks, This Week และ Visit
- **FR-TIL-007:** Visit section ต้องแสดง Austin, TX, address, hours และ booking information
- **FR-TIL-008:** “Book the room” ต้องเปิด `mailto:hello@tiltsignal.example`
- **FR-TIL-009:** เป็น static promotional page ไม่มีระบบ booking form หรือ backend ใน baseline
- **INT-TIL-001:** หากใช้ proxy ให้ใช้ข้อกำหนด security และ rewrite แบบเดียวกับ E-Commerce

---

## 11. USA–Thai Shipping

### 11.1 ข้อมูล

**Shipping Package:** id, tracking_no, customer_id, weight_kg, boxes, status, image_url  
**Package Timeline:** package_id, status, occurred_at

สถานะเรียงลำดับ:

1. รับของที่โกดัง US
2. กำลังเดินทางมาไทย
3. ถึงโกดังไทย
4. จัดส่งให้ลูกค้าแล้ว

### 11.2 Selector

- **FR-SHP-001:** `/usa-thai-shipping` ต้องให้เลือก Admin Portal หรือ Customer Portal
- **FR-SHP-002:** ต้องมีลิงก์กลับ Portfolio

### 11.3 Admin Portal

- **FR-SHP-003:** ต้องโหลดรายการ package เริ่มต้นและข้อมูลที่บันทึกไว้
- **FR-SHP-004:** แบบฟอร์มรับเข้าต้องมี tracking no, customer ID, weight และ boxes
- **FR-SHP-005:** ปุ่ม mock scan ต้องสุ่ม tracking รูปแบบ `US-` ตามด้วยเลข 9 หลัก
- **FR-SHP-006:** ต้อง normalize customer ID ด้วย trim และ uppercase
- **FR-SHP-007:** ต้องบังคับ tracking no และ customer ID
- **FR-SHP-008:** weight ที่ไม่ถูกต้องใช้ 0; boxes ที่ไม่ถูกต้องใช้ 1 ตาม baseline แต่ production validation ควรปฏิเสธค่าผิด
- **FR-SHP-009:** package ใหม่ต้องเริ่มที่สถานะแรกและสร้าง timeline entry
- **FR-SHP-010:** สรุปลูกค้าต้องคำนวณ package count, total boxes และ total weight
- **FR-SHP-011:** ปุ่ม “ส่ง LINE” ใน baseline ต้องสร้าง preview text เท่านั้น ไม่ส่งออกจริง
- **FR-SHP-012:** Preview ต้องมี Customer ID, package count, boxes, weight และ tracking URL
- **FR-SHP-013:** Admin ต้องเลือกสถานะของแต่ละ package ได้
- **FR-SHP-014:** เมื่อเปลี่ยนสถานะ ต้องเพิ่ม timeline entry เฉพาะเมื่อสถานะนั้นยังไม่มี
- **FR-SHP-015:** การเลือกย้อนกลับไปสถานะก่อนหน้าไม่ลบ timeline เดิม เพื่อให้ parity กับ prototype
- **FR-SHP-016:** ปุ่ม reset ต้องคืน 3 seed packages

### 11.4 Customer Portal

- **FR-SHP-017:** ต้องค้นหาด้วย Customer ID
- **FR-SHP-018:** ต้องแสดง mock IDs ที่มีอยู่เป็นปุ่มช่วยกรอก
- **FR-SHP-019:** เมื่อค้นหา ให้ normalize เป็น uppercase
- **FR-SHP-020:** ถ้าไม่พบ ต้องแสดง empty state และ ID ที่ค้นหา
- **FR-SHP-021:** ถ้าพบ ต้องแสดง package count, total boxes และ total weight
- **FR-SHP-022:** แต่ละ package ต้องแสดง tracking no, status, image, weight, boxes และ timeline
- **FR-SHP-023:** Timeline ต้องแสดงครบ 4 stage และทำเครื่องหมาย completed/current/future
- **FR-SHP-024:** ต้องมีปุ่มกลับไปค้นหา ID อื่น
- **FR-SHP-025:** Customer Portal ต้องอ่านข้อมูลเดียวกับ Admin โดยไม่เปิดข้อมูลลูกค้ารายอื่น

### 11.5 Seed

- `US-123456789`, CUST-01, 1.5 kg, 1 box, สถานะ 1
- `US-987654321`, CUST-01, 5.2 kg, 2 boxes, สถานะ 2
- `US-555555555`, CUST-02, 10 kg, 3 boxes, สถานะ 3

---

## 12. EduFlow Course Platform

### 12.1 บทบาทและบัญชีเดโม

- Student: `student@test.com`, password seed `123`
- Admin: `admin@test.com`, password seed `123`

ระบบเดิมไม่ได้ตรวจ password และสลับ role ด้วยปุ่มลัด ระบบ PHP ต้อง hash password ด้วย `password_hash()` และใช้ session authentication แม้ UI จะยังมี demo role shortcut ใน environment demo

### 12.2 ข้อมูล

Course, Lesson, User, User Owned Course, Order, Order Item และ Lesson Progress

Order status มี `pending` และ `approved`

### 12.3 ข้อกำหนด

- **FR-CRS-001:** View states ต้องมี home, login, detail, learning, admin, profile และ cart
- **FR-CRS-002:** Home ต้องแสดง 3 seed courses และ search ตามชื่อแบบ case-insensitive
- **FR-CRS-003:** Course card ต้องแสดง category, image, title และ price
- **FR-CRS-004:** ถ้า user เป็น admin หรือเป็นเจ้าของคอร์ส ปุ่มต้องเป็น Start; มิฉะนั้นเป็น Details
- **FR-CRS-005:** กดซื้อโดยยังไม่ login ต้องไปหน้า login
- **FR-CRS-006:** Login demo ต้องเลือก Standard Student หรือ System Administrator
- **FR-CRS-007:** Cart ต้องไม่เพิ่ม course ซ้ำ
- **FR-CRS-008:** Cart ต้องลบ course ได้และแสดง empty state
- **FR-CRS-009:** Process Transaction ต้องสร้าง order ID `ORD-{timestamp}`, snapshot items, total, pending status และวันที่ไทย
- **FR-CRS-010:** Baseline ใช้ slip image ตัวอย่าง; production ต้องรองรับ upload ที่ตรวจ MIME/size
- **FR-CRS-011:** หลังสร้าง order ต้องล้าง cart เปิด profile และแจ้งว่ารอ admin
- **FR-CRS-012:** Profile ต้องแสดง pending count และ course ที่ user เป็นเจ้าของ
- **FR-CRS-013:** Admin Hub ต้องแสดงเฉพาะ pending orders
- **FR-CRS-014:** Admin ต้องเปิดดู proof และกด Approve Access
- **FR-CRS-015:** การ approve ต้องเปลี่ยน order เป็น approved และเพิ่ม course IDs ทั้งหมดให้ user โดยไม่ซ้ำ
- **FR-CRS-016:** การ approve ต้องเป็น transaction และ idempotent
- **FR-CRS-017:** Learning Portal ต้องเปิด lesson แรกอัตโนมัติ
- **FR-CRS-018:** ต้องแปลง YouTube URL เป็น `youtube-nocookie.com/embed/{id}?rel=0`
- **FR-CRS-019:** Vimeo URL หรือ URL ที่ไม่ match ให้ใช้ URL เดิม
- **FR-CRS-020:** ต้องสลับ lesson และ mark/unmark completed ได้
- **FR-CRS-021:** Progress bar = completed lesson count / lesson count × 100
- **FR-CRS-022:** Progress ต้องแยกตาม user และ course
- **FR-CRS-023:** Student เข้าหน้า learning ได้เฉพาะ course ที่เป็นเจ้าของ; admin เข้าได้ทุกคอร์ส
- **FR-CRS-024:** Mobile navigation ต้องเปิด/ปิด overlay menu ได้
- **FR-CRS-025:** Role switcher คงไว้เฉพาะ demo mode และต้องไม่เปิดใน production mode

### 12.4 Seed Courses

1. รามเกียรติ์ ตอน ศึกทรพี — 990 บาท — 3 lessons
2. รามเกียรติ์ ตอน ศึกรามสูร — 850 บาท — 2 lessons
3. Full-stack Web Development with React 18 — 4,500 บาท — 2 lessons

---

## 13. Nexus Warehouse Management

### 13.1 สถานะ baseline

WMS เป็น UI mock ที่มี navigation และ search inventory จริง แต่ฟอร์ม/ปุ่มด้าน inbound, outbound, suppliers, reports, staff และ settings ส่วนใหญ่ไม่มี event handler

### 13.2 ข้อกำหนด

- **FR-WMS-001:** Sidebar ต้องมี Dashboard, Inventory, Inbound, Outbound, Suppliers, Reports, Staff และ Settings
- **FR-WMS-002:** ต้องแสดงผู้ใช้ Preeya C. / Warehouse Manager
- **FR-WMS-003:** Top search ต้องค้นหาสินค้าจาก name หรือ SKU แบบ case-insensitive
- **FR-WMS-004:** Dashboard KPI ต้องคำนวณจำนวน SKU, inventory value, low stock และ out of stock จากรายการสินค้า
- **FR-WMS-005:** Inventory value = ผลรวม `price × stock`
- **FR-WMS-006:** Dashboard ต้องแสดง category status และ recent activities
- **FR-WMS-007:** Inventory table ต้องแสดง SKU, item, category, stock, location, price และ status
- **FR-WMS-008:** Inventory empty search ต้องแสดง no-result state
- **FR-WMS-009:** Inbound ต้องแสดง barcode input, supplier, qty, location และ putaway queue
- **FR-WMS-010:** Outbound ต้องแสดง order search, requester/date และ picking list
- **FR-WMS-011:** Suppliers ต้องแสดง supplier ID, name, contact, phone, email, rating และ status
- **FR-WMS-012:** Reports ต้องแสดง turnover 4.2x, accuracy 99.8% และ capacity 76% ตาม baseline
- **FR-WMS-013:** Staff ต้องแสดง employee ID, name, role, shift และ status
- **FR-WMS-014:** Settings ต้องแสดง warehouse name, email, notification toggles, danger zone และ save/cancel
- **FR-WMS-015:** Compatibility mode ให้ปุ่ม mock ไม่มีผลเหมือนเดิม
- **FR-WMS-016:** Enhanced PHP mode สามารถทำ CRUD จริงได้ แต่ต้องเปิดด้วย feature flag และไม่เปลี่ยน demo baseline

### 13.3 Seed Inventory

ต้องมี 8 SKU ตามระบบเดิม ครอบคลุม Electronics, Furniture, Stationery และ Networking โดยมี 3 Low Stock และ 1 Out of Stock

---

## 14. NexusFlow Project / Kanban

### 14.1 ข้อมูล

Project, Column, Task, Task Tag และ Team Member

Task fields: id, project_id, column_id, title, priority, assignee, due_date และ order_index

### 14.2 ข้อกำหนด

- **FR-KAN-001:** ต้องมี project “Website Redesign” และ “Mobile App MVP”
- **FR-KAN-002:** ต้องมี views: Kanban Board, List View, Team Members และ Settings
- **FR-KAN-003:** Board ต้องมี To Do, In Progress, In Review และ Done
- **FR-KAN-004:** Search ต้องกรอง task จาก title
- **FR-KAN-005:** Task card ต้องแสดง title, tag, priority, assignee และ due date
- **FR-KAN-006:** ต้องลาก task ข้าม column ได้
- **FR-KAN-007:** ต้องวาง task ก่อน target task หรือท้าย column ได้
- **FR-KAN-008:** Order ใหม่ต้องคงหลัง reload ใน PHP version
- **FR-KAN-009:** New Task modal ต้องมี title, priority, assignee และ tag
- **FR-KAN-010:** Title ต้อง required
- **FR-KAN-011:** ค่า default: priority Medium, assignee PC, tag General, due date Today
- **FR-KAN-012:** ปุ่ม `+` ใน column ต้องเปิด modal และกำหนด target column
- **FR-KAN-013:** List View ต้องแสดง task ทั้งหมดของ project ปัจจุบัน
- **FR-KAN-014:** Team View ต้องแสดง 4 seed members
- **FR-KAN-015:** Settings baseline แสดง project name และ members แต่ Save/Cancel ยังเป็น mock
- **FR-KAN-016:** ปุ่ม Add Section เป็น mock ใน baseline
- **FR-KAN-017:** การ reorder ต้องส่ง current version หรือ updated_at เพื่อป้องกัน lost update

---

## 15. SmartPOS

### 15.1 ข้อมูล

Product, Order และ Order Item  
Order status: pending, cooking, ready, completed  
Order type: Dine-in, Takeaway

### 15.2 Navigation

- **FR-SPOS-001:** มี views POS, KDS, Dashboard และ Kiosk
- **FR-SPOS-002:** Sidebar บน desktop และ bottom navigation บน mobile
- **FR-SPOS-003:** KDS badge = จำนวน order ที่ pending หรือ cooking

### 15.3 POS

- **FR-SPOS-004:** ต้องมี 10 seed products และ categories All, Coffee, Tea, Bakery, Food
- **FR-SPOS-005:** Search ตามชื่อและ filter category ต้องใช้ร่วมกัน
- **FR-SPOS-006:** คลิก product เพิ่มลง cart; รายการซ้ำเพิ่ม qty
- **FR-SPOS-007:** ปุ่มลด qty ห้ามต่ำกว่า 1 ตาม baseline
- **FR-SPOS-008:** Clear cart ต้องถาม confirm
- **FR-SPOS-009:** Subtotal = ผลรวม price × qty
- **FR-SPOS-010:** VAT = subtotal × 7%
- **FR-SPOS-011:** Total = subtotal + VAT
- **FR-SPOS-012:** ชำระได้ Cash หรือ QR/Card
- **FR-SPOS-013:** Checkout ต้องสร้าง order ID `ORD-` + เลขสุ่ม 4 หลัก, type Dine-in, status pending
- **FR-SPOS-014:** หลัง checkout ต้องล้าง cart, ปิด mobile cart และแจ้งผล
- **FR-SPOS-015:** การสร้าง order ต้องบันทึกราคา ณ เวลาขาย ไม่อ่านราคาปัจจุบันย้อนหลัง

### 15.4 KDS

- **FR-SPOS-016:** แสดงเฉพาะ order ที่ status ไม่ใช่ completed
- **FR-SPOS-017:** เรียง timestamp จากเก่าไปใหม่
- **FR-SPOS-018:** Workflow ต้องเป็น pending → cooking → ready → completed
- **FR-SPOS-019:** ปุ่มต้องเปลี่ยนข้อความตามสถานะ: เริ่มทำอาหาร, ทำเสร็จแล้ว, เสิร์ฟลูกค้าแล้ว
- **FR-SPOS-020:** เมื่อไม่มี active order ต้องแสดง “เคลียร์ออเดอร์หมดแล้ว!”

### 15.5 Dashboard

- **FR-SPOS-021:** Total sales = ผลรวม total ของ orders ทั้งหมด
- **FR-SPOS-022:** Average bill = total sales / total orders
- **FR-SPOS-023:** Best sellers ต้อง aggregate qty และ revenue ต่อ product และแสดงสูงสุด 5 รายการ
- **FR-SPOS-024:** Branch selector เป็น display filter เท่านั้นใน baseline และยังไม่กรองข้อมูล
- **FR-SPOS-025:** Clear data ต้องถาม confirm และลบ orders ทั้งหมด

### 15.6 Kiosk

- **FR-SPOS-026:** Steps ต้องมี welcome, menu, payment และ done
- **FR-SPOS-027:** Welcome screen ต้องเริ่มเมื่อแตะหน้าจอ
- **FR-SPOS-028:** Menu ต้องเพิ่มสินค้าและแก้ qty
- **FR-SPOS-029:** Kiosk total ไม่มี VAT ตาม baseline
- **FR-SPOS-030:** Process payment ต้องแสดง QR simulation 2 วินาที
- **FR-SPOS-031:** Order ID รูปแบบ `Q-` + เลขสุ่ม 3 หลัก
- **FR-SPOS-032:** Order type Takeaway, method Kiosk-QR, status pending
- **FR-SPOS-033:** Done screen ต้องแสดงหมายเลขคิวและเริ่มรายการใหม่ได้
- **FR-SPOS-034:** ปุ่มออก Kiosk ต้องกลับ POS

---

## 16. Lite E-Signature

### 16.1 เอกสาร baseline

- Document ID: `DOC-2026-0430`
- Title: สัญญาจ้างพัฒนาซอฟต์แวร์ (ฉบับย่อ)
- Sender: บริษัท เน็กซัส เทคโนโลยี จำกัด
- Signer name: ผู้รับจ้าง
- Effective date: 30 เมษายน 2026
- มี 4 ข้อหลัก: ขอบเขตงาน, ค่าตอบแทน, การส่งมอบ, การรักษาความลับ

### 16.2 ข้อกำหนด

- **FR-ESG-001:** ต้องแสดง metadata และเนื้อหาสัญญาก่อน sign
- **FR-ESG-002:** Signature pad สูงประมาณ 200px รองรับ pointer/mouse/touch
- **FR-ESG-003:** Canvas ต้อง scale ตาม device pixel ratio
- **FR-ESG-004:** ปุ่มยืนยัน disabled จนกว่าจะมีการวาด
- **FR-ESG-005:** ปุ่ม “เริ่มใหม่” ต้องล้าง canvas
- **FR-ESG-006:** เมื่อยืนยัน ต้องสร้าง signature image PNG, timestamp ISO และ document ID
- **FR-ESG-007:** Baseline แสดง masked IP `182.52.xx.xx`; production ต้องเก็บ IP จริงตาม privacy policy และแสดงแบบ mask
- **FR-ESG-008:** ต้องแสดงสถานะ “ลงนามสำเร็จเรียบร้อย”
- **FR-ESG-009:** Signed view ต้องแสดง signature, timestamp, IP และ audit summary
- **FR-ESG-010:** ปุ่ม reset ต้องลบ signature record เฉพาะ demo mode
- **FR-ESG-011:** ดาวน์โหลด PDF ต้องสร้าง A4 single-page PDF ที่ฝัง contract text, signature, timestamp และ IP
- **FR-ESG-012:** Filename ต้องเป็น `contract_DOC-2026-0430_signed.pdf`
- **FR-ESG-013:** PDF download error ต้องแสดงข้อความภาษาไทย
- **FR-ESG-014:** Server ต้องคำนวณ hash ของ document content และ signed artifact
- **FR-ESG-015:** Audit log production ต้องเป็น append-only และเก็บ signer user ID, timestamp, IP, user agent และ hashes
- **FR-ESG-016:** ห้ามรับรองว่าเป็น digital signature ตามกฎหมาย/PKI หากยังไม่มี identity proof, consent evidence และ certificate
- **FR-ESG-017:** Signature image และ PDF ต้องเก็บนอก public web root หรือ object storage แบบ private
- **FR-ESG-018:** Download ต้องตรวจ authorization และใช้ short-lived access

---

## 17. NexusDash (Archive)

- **FR-DAS-001:** ค่าเริ่มต้นเปิด Overview
- **FR-DAS-002:** Sidebar มี Overview, Transactions, Analytics disabled, Customers disabled และ Settings
- **FR-DAS-003:** Search ต้องค้นหา name, email หรือ transaction ID
- **FR-DAS-004:** ต้องเพิ่ม แก้ไข และลบ transaction ได้
- **FR-DAS-005:** Delete ต้องถาม confirm
- **FR-DAS-006:** Transaction fields: id, name, email, amount, status, date
- **FR-DAS-007:** Status มี สำเร็จ, รอดำเนินการ และยกเลิก
- **FR-DAS-008:** Revenue = ผลรวม amount เฉพาะ status สำเร็จ
- **FR-DAS-009:** Success rate = จำนวนสำเร็จ / จำนวนทั้งหมด × 100
- **FR-DAS-010:** Chart period มี week, month และ year พร้อม mock data เดิม
- **FR-DAS-011:** Theme ต้องจำค่าข้าม refresh
- **FR-DAS-012:** Notification dropdown ต้องเปิด/ปิดได้
- **FR-DAS-013:** Reset ต้องคืน 5 seed transactions
- **FR-DAS-014:** Add ID รูปแบบ `TRX-` + เลขสุ่ม 4 หลัก
- **FR-DAS-015:** Toast สำเร็จ/ผิดพลาดแสดง 3 วินาที

---

## 18. OmniPOS Classic (Archive)

- **FR-OPOS-001:** Route มี cashier และ admin
- **FR-OPOS-002:** Cashier มี 9 seed products และ categories all, mains, drinks, desserts
- **FR-OPOS-003:** Search ต้องค้นหา name, Thai name หรือ code
- **FR-OPOS-004:** ลด qty ถึง 0 ต้องลบ line ออกจาก cart
- **FR-OPOS-005:** VAT 7% และ total เหมือน SmartPOS
- **FR-OPOS-006:** Payment methods: cash, credit, QR
- **FR-OPOS-007:** Cash ต้องรับ received amount และคำนวณ change
- **FR-OPOS-008:** Confirm disabled เมื่อเงินสดไม่พอ
- **FR-OPOS-009:** Order ID รูปแบบ `TRX-` + เลขสุ่ม 6 หลัก
- **FR-OPOS-010:** Success screen ต้องแสดง total, received/change และ payment method
- **FR-OPOS-011:** Print receipt baseline แสดง alert เท่านั้น
- **FR-OPOS-012:** Start new order ต้องล้าง cart
- **FR-OPOS-013:** Admin overview คำนวณ total sales, total transactions และ average order
- **FR-OPOS-014:** Admin tabs Transactions, Catalog, Staff และ Settings เป็นหน้าจอแสดงข้อมูล/mock ตามเดิม
- **FR-OPOS-015:** Orders เดิมเป็น memory-only; PHP version ต้องใช้ session หรือ database ตาม demo mode

---

## 19. แบบจำลองฐานข้อมูล PHP/MySQL

ตารางขั้นต่ำที่แนะนำ:

### 19.1 Core

- `demo_projects`
- `users`
- `roles`
- `user_roles`
- `demo_sessions`
- `audit_logs`

### 19.2 CRM

- `crm_deals`
- `crm_quotes`
- `crm_quote_items`
- `crm_activities`

### 19.3 Course

- `courses`
- `lessons`
- `course_orders`
- `course_order_items`
- `user_courses`
- `lesson_progress`

### 19.4 Shipping

- `shipping_packages`
- `shipping_timeline`

### 19.5 WMS / Project

- `inventory_items`
- `warehouse_activities`
- `suppliers`
- `warehouse_staff`
- `projects`
- `project_columns`
- `tasks`
- `task_tags`
- `team_members`

### 19.6 POS

- `pos_products`
- `pos_orders`
- `pos_order_items`

### 19.7 Documents / Dashboard

- `documents`
- `document_signatures`
- `document_audit_events`
- `dashboard_transactions`

### 19.8 Database rules

- **DB-001:** ใช้ `utf8mb4` และ collation ที่รองรับไทย
- **DB-002:** Monetary fields ใช้ `DECIMAL(12,2)` ไม่ใช้ float
- **DB-003:** Weight ใช้ `DECIMAL(10,3)`
- **DB-004:** Timestamp เก็บ UTC และแปลงเป็น Asia/Bangkok ตอนแสดง
- **DB-005:** ใช้ foreign keys และ indexes ที่ fields สำหรับค้นหา/status/created_at
- **DB-006:** ID ที่แสดงกับผู้ใช้ต้องมี unique constraint
- **DB-007:** การ reset demo ต้องแยก tenant/demo_session ไม่ลบข้อมูลผู้ใช้อื่น
- **DB-008:** Seed script ต้อง idempotent

---

## 20. PHP API และ Controller Contract

ตัวอย่าง endpoint ขั้นต่ำ:

| Method | Endpoint | หน้าที่ |
|---|---|---|
| GET | `/api/projects` | project registry |
| POST | `/api/crm/deals/sample` | เพิ่มลูกค้าตัวอย่าง |
| PATCH | `/api/crm/deals/{id}/stage` | ย้าย stage |
| POST | `/api/crm/quotes` | สร้าง quote |
| PATCH | `/api/crm/quotes/{id}/status` | เปลี่ยน quote status |
| POST | `/api/demo/reset/{module}` | reset module แบบ scoped |
| POST | `/api/shipping/packages` | เพิ่มพัสดุ |
| PATCH | `/api/shipping/packages/{id}/status` | อัปเดต status/timeline |
| GET | `/api/shipping/customers/{customerId}` | รายการพัสดุลูกค้า |
| POST | `/api/course/orders` | สร้าง order |
| POST | `/api/course/orders/{id}/approve` | อนุมัติ course |
| PATCH | `/api/course/progress` | toggle lesson progress |
| POST | `/api/tasks` | สร้าง task |
| PATCH | `/api/tasks/{id}/move` | move/reorder task |
| POST | `/api/pos/orders` | สร้าง POS/Kiosk order |
| PATCH | `/api/pos/orders/{id}/status` | KDS workflow |
| POST | `/api/documents/{id}/sign` | บันทึก signature/audit |
| GET | `/api/documents/{id}/signed.pdf` | ดาวน์โหลด PDF |

ข้อกำหนด:

- **API-001:** Response เป็น JSON รูปแบบเดียวกัน: `success`, `data`, `error`, `request_id`
- **API-002:** Validation error ใช้ HTTP 422
- **API-003:** Unauthorized 401, forbidden 403, not found 404, conflict 409
- **API-004:** ทุก mutation ต้องตรวจ CSRF
- **API-005:** Mutation ที่สร้างรายการต้องรองรับ idempotency key เมื่อเสี่ยง double submit
- **API-006:** ห้ามส่ง stack trace หรือ SQL error ไป client

---

## 21. ข้อกำหนดไม่ใช่ฟังก์ชัน

### 21.1 Performance

- **NFR-PERF-001:** หน้า Portal และหน้าหลักแต่ละโมดูลควรแสดง content แรกภายใน 2 วินาทีที่ p75 บน production hosting
- **NFR-PERF-002:** API read p95 ไม่เกิน 500ms และ mutation p95 ไม่เกิน 800ms เมื่อไม่รวม external service
- **NFR-PERF-003:** รูปภาพต้อง lazy-load ยกเว้น hero/critical asset
- **NFR-PERF-004:** Database query ต่อ request ต้องไม่มี N+1 ที่เห็นได้ชัด

### 21.2 Security

- **NFR-SEC-001:** PHP 8.2+ และ dependency versions ที่ยังได้รับ security updates
- **NFR-SEC-002:** ใช้ PDO prepared statements
- **NFR-SEC-003:** Escape output ตาม context เพื่อป้องกัน XSS
- **NFR-SEC-004:** ใช้ CSRF token ทุก state-changing request
- **NFR-SEC-005:** Session cookie: Secure, HttpOnly, SameSite=Lax/Strict และ regenerate หลัง login
- **NFR-SEC-006:** Password ใช้ Argon2id หรือ bcrypt
- **NFR-SEC-007:** Rate limit login, search customer ID, signature submit และ reset
- **NFR-SEC-008:** Upload ต้องตรวจ MIME, extension, size, malware policy และ random filename
- **NFR-SEC-009:** Authorization ตรวจบน server ทุก request ไม่อิงเมนูที่ซ่อน
- **NFR-SEC-010:** Content Security Policy ต้อง allow เฉพาะ iframe/video/image origins ที่จำเป็น
- **NFR-SEC-011:** External proxy ต้องมี fixed allowlist, timeout, response size limit และ private-IP denial
- **NFR-SEC-012:** Audit log ต้องหลีกเลี่ยง password, full card data และ raw signature image

### 21.3 Reliability

- **NFR-REL-001:** Transactional workflows ต้อง rollback ทั้งชุดเมื่อบางขั้นตอนผิดพลาด
- **NFR-REL-002:** มี daily database backup และทดสอบ restore
- **NFR-REL-003:** External demo ล่มต้องแสดง fallback message ภายใน iframe container
- **NFR-REL-004:** JavaScript error ในเกมหรือ canvas ต้องไม่ทำให้ Demo Shell ใช้งานไม่ได้

### 21.4 Compatibility

- **NFR-CMP-001:** Chrome, Edge, Safari และ Firefox 2 รุ่นล่าสุด
- **NFR-CMP-002:** Responsive ที่ 360px, 768px, 1024px และ 1440px
- **NFR-CMP-003:** Shared hosting ต้องรองรับ Apache rewrite หรือ Nginx equivalent
- **NFR-CMP-004:** PHP extensions ขั้นต่ำ: PDO MySQL, mbstring, openssl, json, fileinfo, gd หรือ imagick
- **NFR-CMP-005:** PDF ภาษาไทยต้องใช้ font ที่ฝังในไฟล์และมี license เหมาะสม

### 21.5 Observability

- **NFR-OBS-001:** Structured logs ต้องมี request_id, route, user/demo_session, status และ duration
- **NFR-OBS-002:** มี health endpoint ที่ไม่เปิดข้อมูลลับ
- **NFR-OBS-003:** เก็บ error logs แยกจาก access logs
- **NFR-OBS-004:** Alert เมื่อ external proxy error rate หรือ database error สูงผิดปกติ

---

## 22. UI และ Visual Parity

- **UI-001:** ใช้ icon set ที่เทียบเท่า Lucide และขนาดตาม baseline
- **UI-002:** รักษา palette เฉพาะแต่ละโมดูล เช่น CRM teal, WMS indigo/slate และ SmartPOS blue
- **UI-003:** รักษา rounded cards, border, shadow และ spacing hierarchy เดิม
- **UI-004:** Desktop sidebar ต้องยุบ/ซ่อนตาม breakpoint เดิม
- **UI-005:** Mobile bottom nav และ drawer ต้องไม่ทับ Demo Shell
- **UI-006:** Loading state ต้องไม่กระพริบข้อมูล seed ผิดก่อน hydrate/load
- **UI-007:** จำนวนเงินไทยแสดง THB; ระบบ external storefront ใช้ USD ตาม baseline
- **UI-008:** วันที่/เวลาไทยใช้ locale `th-TH`; timestamp ในฐานข้อมูลเป็น UTC
- **UI-009:** ข้อความไทย/อังกฤษต้องคงตามระบบเดิม รวมถึงข้อความ demo disclaimer
- **UI-010:** Visual regression screenshots ต้องครอบคลุมทุก route ที่ 360×800 และ 1440×900

---

## 23. Acceptance Criteria ระดับระบบ

### 23.1 Route

- ทุก route ใน section 5 ตอบ HTTP 200
- Back/Portal links ทำงานถูก route
- URL ไม่มี `.php`
- Archive route ไม่แสดงใน Portal

### 23.2 Data and reset

- Seed data หลังติดตั้งใหม่ตรงกับ baseline
- Refresh แล้วข้อมูลที่ระบุว่าคงอยู่ยังอยู่
- Reset กระทบเฉพาะ module/demo session ของผู้ใช้
- Formula tests ให้ค่าตรงกับ baseline

### 23.3 Workflow

- CRM: add sample → quote → approve → contract → e-signature → won
- Shipping: add package → update status → customer search เห็น timeline
- Course: student order → admin approve → student course access → complete lesson
- SmartPOS: POS order → KDS workflow → dashboard aggregation
- E-Signature: draw → submit → signed view → PDF download

### 23.4 Security

- User ข้าม role เปิด endpoint ไม่ได้
- Forged IDs และ cross-user access ถูกปฏิเสธ
- CSRF/XSS/SQL injection basic test ผ่าน
- Upload test ปฏิเสธ executable และ oversized file
- Proxy ปฏิเสธ unknown host/private IP

---

## 24. Test Scenarios สำคัญ

| รหัส | Scenario | ผลที่คาดหวัง |
|---|---|---|
| T-CRM-01 | ย้าย deal จาก new ไป proposal | probability = 68 และมี activity |
| T-CRM-02 | approve quote | quote approved และ deal contract |
| T-SHP-01 | เพิ่ม package customer id ตัวเล็ก | บันทึกเป็น uppercase |
| T-SHP-02 | เลือกสถานะเดิมซ้ำ | ไม่สร้าง timeline ซ้ำ |
| T-CRS-01 | student ซื้อ course ซ้ำใน cart | มี line เดียว |
| T-CRS-02 | approve order ซ้ำ | user_courses ไม่ซ้ำ |
| T-KAN-01 | ลาก task ข้าม column | column/order ถูกและคงหลัง refresh |
| T-SPOS-01 | order subtotal 100 | VAT 7, total 107 |
| T-SPOS-02 | KDS complete | order ไม่แสดงใน active queue |
| T-ESG-01 | submit โดยไม่วาด | ปุ่ม disabled/server ปฏิเสธ |
| T-ESG-02 | ดาวน์โหลด signed PDF | PDF เปิดได้ มีข้อความไทยและลายเซ็น |

---

## 25. Known Gaps และประเด็นต้องตัดสินใจก่อนพัฒนา

1. **External source ownership:** E-Commerce และ Tilt ไม่มี source ใน repository นี้ ต้องได้ source/license หรือคง reverse proxy
2. **Exact visual definition:** ควร freeze screenshot baseline ทุก route และ breakpoint ก่อนเริ่ม PHP
3. **Mock buttons:** ต้องยืนยันว่าจะคง inert หรือต้องทำ CRUD จริง โดยเฉพาะ WMS และ admin tabs ของ OmniPOS
4. **Authentication:** Course demo มี password plain text และไม่ตรวจ password; ระบบ PHP ห้ามเลียนแบบช่องโหว่นี้
5. **E-Signature legal level:** ระบบเดิมเป็นภาพลายเซ็น + mock IP ไม่ใช่ digital signature ที่พิสูจน์ตัวตน
6. **Shared vs separate data:** ควรใช้ `demo_session_id`/tenant scope เพื่อไม่ให้ผู้ชมหลายคนแก้ข้อมูลชนกัน
7. **SmartPOS branch:** selector เปลี่ยน label แต่ยังไม่กรองข้อมูล
8. **Kiosk tax:** Kiosk ไม่คิด VAT แต่ POS คิด VAT 7% ต้องคงพฤติกรรมนี้หากต้องการ parity
9. **Shipping timeline:** ย้อนสถานะไม่ลบเหตุการณ์อนาคตเดิม
10. **Course proof:** baseline ใช้รูปคงที่ ไม่ได้ upload จริง
11. **Contact/metadata:** production domain, email, LINE URL และ QR ต้องยืนยันก่อน deploy

---

## 26. แผนพัฒนาแนะนำ

### Phase 0 - Freeze baseline

- เก็บ screenshots ทุก route/viewport
- export seed data
- freeze external demo version หรืออนุมัติ proxy
- ระบุปุ่ม mock ทุกจุด

### Phase 1 - PHP foundation

- Router, template layout, asset pipeline
- PDO/database migrations/seeds
- session/auth/roles/CSRF
- Demo Shell และ Portfolio Portal

### Phase 2 - Core business workflows

- CRM
- Shipping
- Course
- SmartPOS
- E-Signature

### Phase 3 - Supporting/Archive

- WMS
- Kanban
- NexusDash
- OmniPOS Classic

### Phase 4 - Parity and hardening

- responsive visual regression
- security test
- performance test
- shared-hosting deployment verification
- backup/restore and runbook

---

## 27. Definition of Done

งานถือว่าเสร็จเมื่อ:

- route, UI และ interaction ผ่าน acceptance criteria
- seed/reset ทำซ้ำได้
- database migration และ rollback ผ่าน
- unit/integration/end-to-end tests ผ่าน
- visual regression ที่ viewport กำหนดผ่าน
- security checklist ผ่าน
- external dependencies และ license ถูกบันทึก
- deploy บน PHP target environment จริงผ่าน
- มีคู่มือติดตั้ง, `.env.example`, backup/restore และ admin/demo guide
- ผู้ว่าจ้าง sign-off รายการ known differences ทุกข้อ

---

## ภาคผนวก A: Source of Truth

ลำดับความน่าเชื่อถือเมื่อข้อกำหนดขัดกัน:

1. Acceptance ที่ผู้ว่าจ้างอนุมัติเป็นลายลักษณ์อักษร
2. SRS เวอร์ชันล่าสุด
3. Screenshot baseline ที่ freeze แล้ว
4. พฤติกรรมของ checkout ปัจจุบัน
5. Source code Next.js
6. ข้อความอธิบายใน README

README ปัจจุบันเป็นค่าเริ่มต้นจาก create-next-app และไม่ใช่เอกสารข้อกำหนดระบบ

## ภาคผนวก B: PHP Deployment Assumptions

- PHP 8.2 หรือใหม่กว่า
- MySQL 8.0 หรือ MariaDB 10.6+
- Composer พร้อมใช้งาน; หาก shared hosting ไม่มี Composer ให้ build vendor ก่อน upload
- Document root ชี้ไป `public/`
- Secrets อยู่ใน environment หรือไฟล์ config นอก public root
- Cron ใช้สำหรับ cleanup demo sessions, audit retention และ backup
- HTTPS บังคับทั้งระบบ

## ภาคผนวก C: Environment Modes

| Mode | ความหมาย |
|---|---|
| `APP_MODE=demo` | เปิด role shortcuts, reset, mock notifications และ isolated demo sessions |
| `APP_MODE=production` | ปิด shortcuts/reset สาธารณะ ใช้ auth/authorization จริง |
| `EXTERNAL_DEMO_MODE=proxy` | โหลด storefront/landing จาก allowlisted upstream |
| `EXTERNAL_DEMO_MODE=frozen` | ใช้ source/assets local ที่ freeze version |
| `WMS_ENHANCED=false` | คงปุ่ม mock ตาม baseline |
| `WMS_ENHANCED=true` | เปิด CRUD WMS ที่พัฒนาเพิ่ม |
