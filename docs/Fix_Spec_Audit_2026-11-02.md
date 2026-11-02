# ผลตรวจเทียบ docs/Fix_Spec.md

ตรวจวันที่ 2 พฤศจิกายน 2026 — **ยังแก้ไม่ครบตามสเปก**

ตรวจโค้ดปัจจุบันและทดสอบ Chromium จริงที่ `http://127.0.0.1:8080` ผ่าน PHP router ของโครงการ ใช้ browser context ใหม่และข้อมูลจำลอง ตรวจ viewport 1440, 768 และ 375 px รวมทั้งตรวจเว็บจริง `https://preeyabizsuite.vercel.app` แบบอ่านอย่างเดียว ไม่ส่งข้อความ LINE หรือส่งใบเสนอราคาออกภายนอก ไม่แก้ product code

## ผลเทียบรายข้อ

| ข้อในสเปก | ผล | สิ่งที่ตรวจพบ |
|---|---|---|
| 1.1 ฟอนต์ไทย | ผ่าน flow ที่ทดสอบ | วาดลายเซ็น เปิด Audit Certificate และชำระ POS ทั้ง QR/Cash: ภาพและข้อความภาษาไทยอ่านได้ ไม่พบ tofu ในใบรับรอง/ใบเสร็จ |
| 1.2 Direct URL / Vercel rewrite | ผ่าน | มี rewrite; เปิดตรงและ refresh บนเว็บจริงครบ 7 เส้นทางที่เอกสารระบุ ได้ HTTP 200 และแสดงระบบถูกหน้า |
| 1.3 Header | บางส่วน | Search POS กรอง 6 การ์ดเหลือ 1 และ Enter เลื่อนไปผลงานได้; navigation/CTA มีจริง ไม่มีสวิตช์ภาษา/กระดิ่งเดิม แต่ status badge อยู่ Hero แทน Header ตามตำแหน่งที่สเปกระบุ |
| 1.4 Loading Skeleton | ไม่ผ่าน | มี helper/CSS แต่ไม่มีจุดเรียก `showLoadingSkeleton`; เปลี่ยนจากหน้าแรกเข้าเดโมและเปิดตรงไม่พบ skeleton |
| 2.1 Floating CTA | บางส่วน | มีทุกหน้าและลิงก์ LINE ถูกต้อง แต่ preselect ประเภทระบบไม่ทำงาน และแถบลอยบังปุ่มยืนยันลายเซ็นบนมือถือ |
| 2.2 Estimator | บางส่วน | มี fields/คำนวณงบและเวลา; Clipboard + เปิด LINE ผ่านทั้ง desktop/mobile แต่ปุ่มส่งใบเสนอราคาไม่มี API เก็บเฉพาะ LocalStorage แล้วแจ้งว่าส่งสำเร็จ |
| 3.1 WMS | บางส่วน | Inventory CSV ดาวน์โหลดจริงพร้อม UTF-8 BOM; มีปุ่มใน Ledger ด้วยจากการตรวจโค้ด มี Label Preview/ปุ่มพิมพ์ แต่ barcode เป็นลาย CSS จำลอง และยังไม่มี print layout เฉพาะสติกเกอร์ |
| 3.2 CRM / E-Sign | ไม่ผ่าน | เซ็นเสร็จแต่ไม่มี `preeya_esign_status`; กลับ CRM แล้ว contract/Pipeline ไม่เปลี่ยนเป็น Signed; มีปุ่มกลับ CRM แต่ Audit ใน CRM ไม่มีภาพลายเซ็นจริง |
| 3.3 POS | บางส่วน | QR/Cash ออกใบเสร็จไทยได้และมีปุ่มพิมพ์ แต่ไม่มี CSS สำหรับกระดาษ Thermal 80mm |
| 3.4 Shipping | บางส่วน | LINE Flex preview และ Invoice เปิดได้ แต่ Invoice อ่านค่าขนส่งที่เก็บไว้ ไม่คำนวณ CBM ตามสเปก; พบเพิ่มว่าลงทะเบียนพัสดุใหม่ล้มเหลว |
| 3.5 OAI Checkout | ไม่ผ่าน | Cart Drawer ของหน้าร้านจริงยัง disabled; modal ใหม่ใช้สินค้า/ยอดตายตัว ไม่เชื่อม cart และไม่ใช้ข้อมูลผู้รับ/วิธีจ่ายที่กรอก |
| 3.6 Tilt Booking | บางส่วน | จองแล้วเกิด ticket/รายการใน admin จริง เปลี่ยนสถานะ seated/cancelled บันทึกได้ แต่เลือกวันที่ไม่ได้ และ QR เป็นรูป SVG ตายตัว |
| 4.1 Studio positioning | มีแล้ว | Brand/Hero/subheadline และข้อความรับประกัน/Source Code มีแล้ว |
| 4.2 Impact badges | มีแล้ว | มีบนการ์ดผลงานและส่วนรายละเอียด; ตัวเลขผลลัพธ์เป็นข้อความตามสเปก ไม่ได้ตรวจพิสูจน์ผลลัพธ์ธุรกิจจริง |
| 4.3 Pricing | มีแล้ว | พบแพ็กเกจ 3 ใบ |
| 4.4 Trust / SLA | มีแล้ว | พบ guarantee 6 ใบ |
| 4.5 Lead Architect | บางส่วน | Profile/Tech Stack/GitHub มี แต่ไม่มี LinkedIn และดาวน์โหลด Company Profile/Resume PDF |
| 5 QA ก่อน deploy | ยังไม่ผ่านครบ | Flow CRM, Checkout, Estimator และ CTA มือถือยังมีข้อบกพร่องตามด้านล่าง |

## รายการที่ต้องแก้

### F01 — P0: ฟอร์มแจ้งว่าส่งสำเร็จ แต่ข้อมูลไม่ถึงผู้รับ

- ทำซ้ำ: กรอกชื่อ/ช่องทางติดต่อ แล้วกดส่งใบเสนอราคา
- ผลจริง: ไม่มี POST request; มีเพียง `localStorage.preeya_last_inquiry` แต่แสดงว่าได้รับข้อมูลและจะติดต่อกลับภายใน 24 ชม.
- โค้ด: `public/assets/app.js:1141` และ `1171`
- ต้องเชื่อม API รับ lead จริงและแสดง success หลัง endpoint ยืนยันเท่านั้น
- หลักฐาน: `../output/playwright/audit-results.json` รายการ `Estimator API delivery`

### F02 — P0: CTA ไม่เลือกประเภทระบบและเลื่อนไม่ตรงเป้า

- ทำซ้ำ: เปิด `/business-suite` กด `ขอใบเสนอราคาระบบนี้`
- ผลจริง: URL เป็น `/#estimator-form?interest=crm` แต่ฟอร์มยังเลือก WMS; `?interest` อยู่ใน hash ขณะที่ตัวอ่านใช้ `window.location.search` และ SPA ไม่ประมวลผล preselection ตอนกลับหน้าแรก
- โค้ด: `public/assets/app.js:4653`, `4718`, `4735`, `4741`
- ต้องแก้ทั้งรูปแบบ URL, ตัวแยก pathname/search/hash และการใช้ค่าตอน SPA navigation
- หลักฐาน: `../output/playwright/cta-destination.png`

### F03 — P1: ลงนามแล้ว CRM ไม่ซิงก์

- ทำซ้ำ: วาดและยืนยันลายเซ็น → กลับ CRM → เปิดแท็บสัญญา/Pipeline
- ผลจริง: ลงนามใน E-Sign ได้ แต่ `preeya_esign_status` เป็น null; contract ยังเป็นข้อความแนะนำเซ็น Pipeline ไม่มี Signed
- โค้ด: E-Sign บันทึกเฉพาะ store ของตนที่ `public/assets/app.js:4102`; CRM อ่าน shared key ที่ `1441`, `1476`; Pipeline ที่ `1404` ไม่มีการใช้ shared status
- ต้องบันทึกสถานะแบบผูก document/deal, sync ไป CRM และแสดงภาพลายเซ็นจริง ปัจจุบัน CRM audit เป็นข้อความ ไม่มี signature image
- หลักฐาน: `../output/playwright/esign-certificate.png`, `../output/playwright/crm-after-signing.png`

### F04 — P1: Checkout เดิมยังปิด และ Checkout ใหม่ไม่เชื่อมข้อมูล

- ทำซ้ำ: หยิบ `Saffron Satin Camp Shirt` ราคา $148 ใน iframe → Cart Drawer
- ผลจริง: ปุ่ม Checkout ยัง disabled พร้อมข้อความ `Checkout is disabled`
- ปุ่ม checkout เพิ่มใหม่ด้านบนเปิดรายการ Hoodie/T-Shirt ยอด 2,470 บาทเสมอ แม้ตะกร้าว่างหรือเลือกสินค้าอีกชุด
- กรอกชื่อ `QA CUSTOM RECEIVER` และเลือก COD → confirmation ยังแสดงชื่อปรียาและ PromptPay QR ชำระแล้ว
- ไม่มี PromptPay QR ให้สแกนจริงใน flow และ confirmation ไม่สรุปรายการจากตะกร้า
- โค้ด: `public/assets/app.js:4179`, `4215`, `4240`, `4254`, `4402`
- หลักฐาน: `../output/playwright/original-cart-disabled.png`, `../output/playwright/checkout-confirmation.png`

### F05 — P1: CTA มือถือบังการทำงานหลัก

- viewport 375×812, เปิด E-Sign แล้วเลื่อนลง Signature Pad
- Canvas อยู่ y=527–677; CTA อยู่ y=653–800; ปุ่มยืนยันอยู่ y=721–761 จึงถูกแถบ CTA คลุมทั้งปุ่ม
- การตรวจแค่ `scrollWidth <= innerWidth` จับปัญหานี้ไม่ได้
- ต้องจัดพื้นที่ท้ายเนื้อหาหรือยุบแถบในบริบทฟอร์ม โดยให้ปุ่มหลักกดได้
- โค้ด: `public/assets/app.css:3793`, `3865`; `public/assets/app.js:4585`
- หลักฐาน: `../output/playwright/mobile-signature-cta-overlap.png`

### F06 — P1: Shipping บันทึกพัสดุใหม่ไม่ได้

- ทำซ้ำ: Admin → ลงทะเบียนพัสดุ กรอก Tracking/น้ำหนัก/ขนาด แล้วกดบันทึก
- ผลจริง: browser error `save is not defined`, modal ไม่ปิด ไม่มีแถวพัสดุใหม่
- โค้ด: `public/assets/app.js:1738`; ใน `renderShippingAdmin` ไม่มี helper `save` ขณะที่มี `s.save()` ใน store
- การอัปเดตสถานะที่ `1756` เรียก helper ชื่อเดียวกันด้วย เป็นจุดเสี่ยงที่ต้องแก้ร่วมกัน (flow เปลี่ยนสถานะ Shipping ยังไม่ได้ทดสอบซ้ำ)
- หลักฐาน: `../output/playwright/edge-results.json` รายการ `Shipping registration result`

### F07 — P1: Commercial Invoice ยังไม่คิดราคาตาม CBM

- Invoice แสดง `p.shippingFee` ที่เก็บไว้ (`public/assets/app.js:1790`)
- การสร้างพัสดุคิด `weight * rate` อย่างเดียว (`1721`) ขณะที่เครื่องคิดราคาแยกต่างหากใช้ Sea `max(weight*180, cbm*8500)` (`1680`)
- ดังนั้น flow บันทึกพัสดุ/Invoice ยังไม่ได้ใช้สูตร CBM เดียวกับเครื่องคิดราคา แม้จะแสดงค่า CBM บนใบแจ้งหนี้
- ส่วนนี้ยืนยันจากโค้ด; การลองสร้างพัสดุเพื่อทดสอบยอดปลายทางถูกบล็อกด้วย F06

### F08 — P1: Booking ขาดวันที่และ QR ที่ผูกกับรายการจอง

- ไม่มี date field; new reservation ใช้ `date: today()` เสมอ (`public/assets/app.js:4349`)
- Ticket QR เป็น SVG rect ตายตัว ไม่ encode reservation ID (`4368`) จึงยังใช้แยกผู้จองด้วยการสแกนไม่ได้
- ส่วนที่ผ่าน: กรอกชื่อทดสอบแล้ว ticket แสดงชื่อถูก รายการไป Admin และบันทึกสถานะ seated/cancelled ได้
- หลักฐาน: `../output/playwright/tilt-ticket.png`, `../output/playwright/supplement-results.json`

### F09 — P0 ตามสเปก: Skeleton ยังไม่ได้ใช้งาน

- `showLoadingSkeleton` มีแต่ definition (`public/assets/app.js:4669`) ไม่มี caller
- initial handlers และ SPA handlers render ตรง (`4713`, `4808`) และไม่รอ iframe/ภาพหลัก
- หลังเปิดตรง/refresh ทุก demo พบ skeleton count = 0; ทดสอบคลิกจากหน้าแรกเข้า storefront ก็ไม่พบ
- หลักฐาน: `../output/playwright/supplement-results.json`

### F10 — P1: ยังไม่ได้จัดหน้าพิมพ์ Thermal 80mm

- มีปุ่ม `window.print()` แต่ CSS ไม่มี `@media print` / `@page` สำหรับ 80mm หรือแยก receipt
- Chromium print เป็น Letter 2 หน้า; ภาพหน้าพิมพ์ยังรวมกรอบ modal/ปุ่มปิด/ปุ่มพิมพ์
- การพิมพ์จาก PDF นี้ยืนยัน layout ของ Chromium เท่านั้น ยังไม่ได้ทดสอบเครื่องพิมพ์ thermal จริง
- โค้ด: `public/assets/app.js:3826`, `public/assets/app.css`
- หลักฐาน: `../output/playwright/pos-print.pdf`, `../output/playwright/pos-print-page1.png`

### F11 — P1: โปรไฟล์ยังขาดลิงก์ตามข้อ 4.5

- `public/assets/app.js:777` มี GitHub, LINE และ email
- ไม่มี LinkedIn และ Company Profile/Resume PDF ตามสเปก

## ข้อจำกัดของสคริปต์ QA เดิม

`scripts/verify_fix_spec.py` ยังใช้เป็นหลักฐาน “ผ่านครบ 100%” ไม่ได้:

- Estimator เช็กแค่ว่าราคาไม่ว่างและ modal มีคำว่าสำเร็จ ไม่ได้เช็กว่าราคาเปลี่ยนถูกหรือมี API รับข้อมูล
- Search เช็กว่ามีการ์ดอย่างน้อย 1 ใบ แต่ไม่ยืนยันว่าการ์ดที่ไม่ตรงคำค้นถูกซ่อน
- CRM เช็กคำว่า `ลงนามสำเร็จ` ในข้อความทั้งหน้า ซึ่งมีอยู่แล้วในคำอธิบายแม้ยังไม่เซ็น
- CSV เช็กว่ามีปุ่ม ไม่ได้ดาวน์โหลดและตรวจ BOM
- หลาย flow ครอบ `if count() > 0` แล้วข้ามเงียบหากปุ่ม/receipt หาย
- ไม่เช็กสินค้า/ชื่อผู้รับ/วิธีจ่ายที่ confirmation ไม่เช็กวันที่จองหรือ payload QR
- เช็กมือถือแค่หน้าแรกและ horizontal overflow ไม่เช็ก CTA บังปุ่ม
- เก็บ screenshot ไป path ของสภาพแวดล้อมเดิมนอกโครงการ

## หลักฐานและขอบเขต

- `../output/playwright/audit-results.json` — flow หลัก, direct+refresh local, viewport 375/768
- `../output/playwright/supplement-results.json` — live routing/sections และการเปลี่ยนสถานะ Booking
- `../output/playwright/edge-results.json` — Cart เดิม, Shipping error, Cash, mobile clipboard/CTA
- Script สำหรับทำซ้ำ: `audit_fix_spec.py`, `audit_supplement.py`, `audit_edge_flows.py` ใน directory เดียวกับผลตรวจ
- JS/CSS ของเว็บจริงเนื้อหาตรงกับในเครื่องหลัง normalize CRLF/LF; การเทียบ hash ไบต์ดิบใน supplement ระบุ false เพราะ newline ต่างกัน ไม่ใช่โค้ดคนละเวอร์ชัน
- ผ่านการตรวจไม่มี horizontal document overflow ที่ 375/768 px บน 8 หน้า (หน้าแรก + 7 routes) แต่ไม่เท่ากับ responsive ผ่านทั้งหมด: F05 ยืนยันปุ่มถูกบังจริง
- ฟอนต์ไทยตรวจภาพ desktop ใน certificate/receipt แล้ว; ไม่ได้ทดสอบทุก OS/browser หรือเครื่องพิมพ์จริง
- การส่งอีเมลและ LINE จริงไม่ได้ทดสอบ เพราะฟอร์มยังไม่มี API และไม่ได้ส่งข้อความภายนอก
- ไม่มีการแก้โค้ดระบบหรือ deploy ในรอบตรวจนี้
