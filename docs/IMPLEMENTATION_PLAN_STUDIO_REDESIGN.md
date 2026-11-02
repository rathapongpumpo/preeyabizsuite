# Implementation Plan — PREEYA SYSTEMS

วันที่: 2 พฤศจิกายน 2026
สถานะ: แผนเสนอสำหรับ redesign และพัฒนาต่อ ยังไม่ได้เปลี่ยนหน้าเว็บหรือสร้างภาพ concept
อ้างอิง: `Fix_Spec.md`, `Fix_Spec_Audit_2026-11-02.md` และโครงสร้างโครงการปัจจุบัน

## 1. เป้าหมาย

ทำเว็บบริษัทและ portfolio ที่ลูกค้าจำได้ เข้าใจบริการ เห็นความสามารถผ่านระบบจริง และส่งโจทย์ถึงผู้รับผิดชอบได้สำเร็จ

ผลลัพธ์ที่ต้องได้:
- หน้าแรกมีภาพจำเฉพาะของ PREEYA SYSTEMS และทำให้เข้าใจว่าเป็นสตูดิโอพัฒนาระบบธุรกิจ
- เดโมช่วยอธิบายวิธีแก้ปัญหา ไม่เป็นเพียงลิงก์รวมหน้าจอ
- แยกผลงานใช้งานจริง งานต้นแบบ และการจำลองให้ชัดเจน
- มีหลักฐานความสามารถและข้อมูลผู้ให้บริการตามข้อเท็จจริง
- ทุก CTA นำไปสู่การติดต่อหรือส่ง brief ที่ทำงานจริง
- รองรับมือถือและโหลดเร็ว แม้มี motion

## 2. Creative direction: Living Systems Studio

แนวคิด: “เปลี่ยนงานธุรกิจที่กระจัดกระจาย ให้กลายเป็นระบบที่เชื่อมถึงกัน”

ภาพหลักเป็นระบบงานที่เคลื่อนไหวและทดลองได้ เช่น สร้างออเดอร์ → ส่งเข้าครัว → ตัดสต็อก → อัปเดตยอดขาย ลูกค้าเห็นทั้งความสวยและวิธีคิดด้านระบบตั้งแต่หน้าแรก

### ภาษาภาพ

- พื้นหลังขาวนวล/เทาหมึก สลับช่วงสีเข้มเพื่อแบ่งจังหวะเรื่องราว
- สีหลัก cobalt ของแบรนด์เดิม ใช้ lime เป็นสีเน้นเฉพาะเหตุการณ์หรือ action สำคัญ จำกัดการใช้สีให้เป็นระบบ
- ตัวอักษรไทยขนาดใหญ่จัดวางแบบ editorial จับคู่รายละเอียดภาษาอังกฤษที่เล็กกว่าอย่างมีลำดับ
- Composition ไม่สมมาตร มีพื้นที่ว่าง และใช้ขนาดผลงานต่างกันตามความสำคัญ
- สร้างลายเซ็นกราฟิกจากเส้นทางข้อมูลและ geometry ของตัว P ใช้ซ้ำอย่างพอดีใน hero, transition และ diagram
- ปุ่ม/หัวข้อ/ฟอร์ม/ตัวอย่างข้อมูลทั้งหมดเป็น HTML จริง เลือกข้อความและใช้ keyboard ได้
- ภาพ concept และ asset ตกแต่งสร้างแยกจาก UI ไม่ใช้ screenshot แทนหน้าจอที่ต้องกดได้

### Signature interactions

1. **Hero: One Order, Connected Business**
   - ฉากระบบ POS ขนาดใหญ่พร้อมปุ่ม “ลองส่งออเดอร์”
   - กดแล้วเห็น event เดินทางผ่านหน้าร้าน → ครัว → สต็อก → รายงาน ภายในประมาณ 4–6 วินาที
   - ใช้ข้อมูลตัวอย่างใน state แยกจากข้อมูลเดโมเดิม ไม่แสดงตัวเลขว่าเป็นผลลัพธ์ลูกค้าจริง
   - มีปุ่มเปิดเดโมเต็ม และ “เล่าโจทย์ธุรกิจของคุณ” โดยเข้าถึงได้ตั้งแต่ viewport แรก
   - มือถือเรียงเป็นเส้นทางแนวตั้ง 3–4 ขั้น ไม่ย่อฉาก desktop จนอ่านไม่ออก
   - หากไม่กด ระบบยังสื่อสารเรื่องราวครบ ไม่บังคับเล่น animation เพื่อเข้าถึงเนื้อหา

2. **Selected Systems: ผลงานแบบเปิดเรื่อง**
   - ยก 3 ระบบหลักขึ้นเป็น composition ขนาดใหญ่สลับซ้าย/ขวา แสดงภาพหน้าจอจริงและคำอธิบายปัญหาธุรกิจสั้นๆ
   - อีก 3 ระบบเป็นรายการรองที่เปิด preview/รายละเอียดได้ ไม่ใช้การ์ดหน้าตาเหมือนกันทั้ง 6 ใบ
   - Desktop hover/focus เปลี่ยน preview อย่างนุ่มนวล; touch ใช้ tap และมีปุ่มชัดเจน
   - แสดงประเภทงาน บทบาท และขอบเขต demo ทุกชิ้น

3. **How We Build: Blueprint → Working Product**
   - แสดง wireframe → หน้าจอจริง → workflow ที่ทำงานได้ผ่านขั้นตอนเลื่อนหรือปุ่มกด
   - เนื้อหาต้องเล่าต่อได้ใน reduced-motion mode
   - ไม่ล็อก scroll ไม่ยึด cursor และไม่เปิดเสียงเอง

ใช้ motion เด่นเฉพาะ 3 จุดนี้ ส่วนอื่นให้ typography, imagery และ spacing ทำหน้าที่หลัก

## 3. Information architecture

| หน้า | บทบาท | เนื้อหาหลัก |
|---|---|---|
| `/` | สร้างภาพจำและพาไปสู่การติดต่อ | Hero interactive, Selected Systems, บริการ, วิธีทำงาน, หลักฐาน, งบประมาณเริ่มต้น, brief CTA |
| `/services` | ตอบว่ารับทำอะไรและเหมาะกับใคร | Customize, Custom System, Retainer; deliverables, ช่วงราคา, เงื่อนไข |
| `/work` | คัดเลือกผลงาน | ตัวกรองตามปัญหาธุรกิจ/ประเภทธุรกิจ/ประเภทผลงาน |
| `/work/:slug` | อธิบายความสามารถอย่างตรวจสอบได้ | ปัญหา, บทบาท, workflow, สิ่งที่ส่งมอบ, ภาพระบบ, ข้อจำกัด, demo CTA |
| `/about` | ทำให้รู้ว่าใครรับผิดชอบงาน | ตัวตนจริง, ประสบการณ์ที่ยืนยันได้, วิธีทำงาน, GitHub/LinkedIn/PDF เมื่อมีข้อมูลจริง |
| `/contact` | ส่งโจทย์อย่างสะดวก | Brief/Estimator, LINE, email, ช่องทางตอบกลับและข้อความแจ้งใช้ข้อมูล |
| `/privacy` | อธิบายการใช้ข้อมูล | ข้อมูลที่เก็บ, วัตถุประสงค์, ผู้รับข้อมูล, ระยะเวลาเก็บและช่องทางติดต่อ ตามการใช้งานจริง |
| เส้นทางเดโมเดิมทั้งหมด | ให้ทดลองระบบ | รักษา URL เดิม ปรับ flow และ demo shell ให้สอดคล้องแบรนด์ |

หน้าแรกให้เห็นราคาโดยสรุป ส่วนรายละเอียดแพ็กเกจอยู่หน้าบริการ รายละเอียดผู้พัฒนาอยู่หน้า About ลดการซ้ำเนื้อหาและความยาวหน้าแรก

## 4. Content และหลักฐานความน่าเชื่อถือ

- เขียน value proposition ให้ตอบว่าแก้ปัญหาอะไร ส่งมอบอะไร และเริ่มคุยอย่างไร
- เตรียม Case Study 2–3 ชิ้น หากยังไม่มีงานลูกค้าที่เปิดเผยได้ ให้ใช้ engineering case study จากเดโมและติดป้ายชัดเจน
- ไม่สร้างชื่อลูกค้า โลโก้ รีวิว ทีมงาน ยอดผู้ใช้ หรือผลลัพธ์เชิงเปอร์เซ็นต์ขึ้นเอง
- ตัวเลขผลลัพธ์ที่ยังไม่มีหลักฐาน เปลี่ยนเป็นคำอธิบายประโยชน์หรือเป้าหมายของระบบ
- ข้อมูลนิติบุคคลแสดงเมื่อยืนยันแล้ว ถ้ายังให้บริการในนามบุคคลให้สื่อสารตามจริง
- ปรับ warranty/SLA/ระยะเวลาตอบกลับให้ตรงกันทุกหน้า และแยกความหมายให้ชัด
- จัดทำ Company Profile PDF จากเนื้อหาที่ตรวจแล้ว พร้อมลิงก์ดาวน์โหลดที่ใช้งานได้
- แสดงขอบเขตจำลองของ E-Sign/Payment อย่างเห็นได้ชัด และเอาคำรับรอง cryptographic ที่ไม่ตรงกับ implementation ออก

## 5. Technical approach

### ใช้ฐานเดิมและแยก marketing ออกจาก demo

- ปัจจุบันเป็น PHP สำหรับ local routing + static HTML บน Vercel + Vanilla JS/CSS ก้อนใหญ่
- ไม่เปลี่ยน framework ของเดโมทั้งชุดเพียงเพื่อ redesign หน้า marketing
- แยก marketing styles/components/routes ออกจาก `app.js` และ `app.css` เดิม ใช้ scoped selectors ป้องกัน global CSS กระทบเดโม
- แยก registry/content ให้มีแหล่งข้อมูลหลักเดียว ก่อนสร้างหน้า HTML และข้อมูลสำหรับ client
- ทำหน้า marketing เป็น HTML ที่มีเนื้อหาตั้งแต่โหลดแรก พร้อม progressive enhancement สำหรับ interaction
- เลือก static generation ที่เข้ากับ deployment pipeline หลังยืนยัน build entry จริงของ Vercel; ไม่ปล่อย SEO ขึ้นกับ client render อย่างเดียว
- ใช้ URL parsing ผ่าน URL API รองรับ pathname/query/hash และ Back/Forward; direct link ได้ครบ
- ปรับ rewrite ให้หน้า marketing ที่สร้างจริง เดโม assets และ API ไม่ชน catch-all
- สร้าง SVG/DOM scene สำหรับ hero เป็นหลัก เพิ่ม Canvas/WebGL เฉพาะเมื่อ concept ที่เลือกมีความจำเป็นและผ่าน mobile performance
- รักษา URL เดโมเดิม ข้อมูลทดลองและ reset behavior ให้ทดสอบแยกกันได้
- แก้ README ให้ตรงกับ runtime และ art direction ใหม่

### ระบบรับ Lead

- `POST /api/inquiries`: ตรวจ payload ฝั่ง server, จำกัดขนาด/ความถี่, ป้องกัน spam และการ submit ซ้ำ
- จัดเก็บข้อมูลใน managed database ที่เหมาะกับ hosting จริง แล้วส่งแจ้งเตือน email ผ่าน provider ฝั่ง server
- ส่ง response สำเร็จหลังบันทึกข้อมูลได้ พร้อม reference ID; หาก email แจ้งเตือนล้มเหลวต้องไม่ทำ lead หายและต้องมีวิธี retry
- บันทึกระบบที่สนใจ, รูปแบบงาน, ช่วงงบ, brief, ช่องทางติดต่อ, source demo และ UTM เท่าที่จำเป็น
- Secret อยู่ environment ฝั่ง server ไม่ฝังลง JavaScript
- ขั้นแรกให้ inbox + reference ID ใช้งานได้ก่อน; เพิ่ม lead admin เมื่อจำนวนงานหรือวิธีติดตามจำเป็นจริง
- การเลือก provider/โดเมนอีเมลต้องตรวจบัญชีและ hosting ที่มีอยู่ก่อน ค่าใช้จ่ายและเงื่อนไขต้องตรวจเมื่อเลือกใช้งาน
- มี validation, loading, success, retry และข้อผิดพลาดจริง; ห้ามใช้ success modal แทนการส่งข้อมูล

### เดโมที่ต้องซ่อมก่อนเผยแพร่

- F01–F02: inquiry delivery และ CTA context/preselection
- F03: E-Sign → CRM ผูก document/deal พร้อม signedAt และภาพลายเซ็น
- F04: เชื่อม Checkout กับ cart จริง ใช้ข้อมูลผู้รับ/วิธีจ่ายจริงใน confirmation
- Storefront ภายนอก: ตรวจว่ามีสิทธิ์แก้ source หรือ integration API หรือไม่ หากไม่มี ให้ทำ native storefront เฉพาะเส้นทางนี้โดยคงภาพ/asset ที่มีสิทธิ์ใช้และย้าย flow ให้ครบ ต้องไม่วาง checkout คนละชุดทับ iframe แล้วอ้างว่าเชื่อมแล้ว
- F05: demo CTA ใช้ safe area/พื้นที่ท้ายเนื้อหาและพฤติกรรมยุบที่ไม่บังฟอร์ม
- F06–F07: Shipping persistence และสูตร CBM เดียวกันตั้งแต่ calculator ถึง invoice
- F08: Booking เลือกวันที่, ตรวจ input, encode reservation ID ลง QR จริง
- F09: Skeleton ผูกกับ loading event ของเนื้อหาจริง พร้อม timeout/error state
- F10: print layout แยก receipt/label/invoice และขนาดกระดาษที่เหมาะสม
- F11: ลิงก์โปรไฟล์และ PDF ใช้ข้อมูลยืนยันแล้ว

## 6. แผนส่งมอบตามลำดับ

| ช่วง | งาน | ผลลัพธ์ตรวจได้ |
|---|---|---|
| A — Design concept | สร้างภาพ concept แยกแต่ละ section หลักและมือถือ พร้อม interaction storyboard; เลือก direction ให้แน่นอนก่อนลง UI | ภาพแต่ละ section อ่านรายละเอียดได้, page flow, mobile concept, content outline |
| B — Foundation | วาง design tokens, typography ไทย, component states, marketing/demo boundary และ content registry | component showcase และ route foundation ที่เปิดตรงได้ |
| C — Homepage | สร้าง Hero scene, selected work, services preview, process, trust และ contact teaser | หน้าแรก desktop/mobile ที่ใช้งานจริงและเทียบภาพ concept ได้ |
| D — Sales pages | Services, Work, case studies, About, Contact, privacy และ PDF | หน้าเนื้อหาครบพร้อม metadata และลิงก์ที่ใช้งานจริง |
| E — Conversion & demo repairs | ทำ lead API/notification และแก้ F01–F11 ตาม dependencies | flow ส่งโจทย์/เดโมผ่านการทดสอบจริง พร้อมหลักฐาน |
| F — Polish & release | Visual QA, responsive, reduced motion, performance, accessibility, SEO และตรวจ staging | รายการตรวจผ่าน, ภาพ runtime, release checklist และผลตรวจหลังขึ้นจริง |

ทำ concept และการวิเคราะห์สิทธิ์แก้ storefront/provider ได้ในช่วงแรก ส่วน dependency ที่ยังไม่พร้อมไม่ควรถูกแทนด้วย flow ปลอม

กรอบเวลาวางแผนเบื้องต้น: 12–18 วันทำงาน สำหรับผู้พัฒนาหนึ่งคน หลังได้ direction และเนื้อหาหลัก เป็นประมาณการที่ต้องปรับหลังตรวจ source ของ storefront และระบบรับ lead; งานทำ backend จริงครบทุก demo ไม่อยู่ในประมาณการนี้

## 7. Acceptance criteria

### Visual

- ทุก section หลักมี concept ที่ชัดเจน ก่อนเริ่ม implement ส่วนดังกล่าว
- ตรวจภาพ concept เทียบ screenshot runtime ที่ขนาด viewport เดียวกัน: layout, typography, color, asset, spacing, hierarchy และ mobile adaptation
- รายการแตกต่างต้องถูกแก้หรือระบุเหตุผลและขอบเขตให้ตรวจได้ ไม่จบเพียง build ผ่าน
- ภาษาไทยไม่ถูกตัด วรรณยุกต์ไม่ชน ไม่ล้นปุ่ม และไม่ทำให้บรรทัดสำคัญแตกผิดจังหวะ
- ไม่เกิดหน้า/section ที่ยังเป็น placeholder หรือดูเหมือนอีกเว็บหนึ่งโดยไม่ตั้งใจ

### Interaction / Conversion

- Hero กดแล้วเปลี่ยนสถานะจริงและ replay ได้โดยไม่เปลี่ยนข้อมูลเดโม
- Demo → ขอราคา → ระบบที่สนใจถูกเลือก → ส่ง brief → ได้ reference ID → มีรายการในฐานข้อมูล → ผู้ดูแลได้รับ notification
- ทดสอบ success/failure/retry และ double-submit โดยไม่ส่ง lead ซ้ำ
- Checkout และ Booking เก็บข้อมูลที่กรอกและแสดง confirmation ตรงกับรายการ
- QR Booking decode กลับเป็น reservation ID ที่ถูกต้องได้
- ใช้ keyboard ได้ มี focus ชัดเจน Modal ไม่ปล่อย focus หลุด และ motion มีทางเลือก reduced motion

### Responsive / Performance / SEO

- ทดสอบอย่างน้อย 375, 390, 768 และ 1440 px รวม touch และ keyboard
- ไม่มี CTA บังปุ่มหลัก โดยตรวจผ่านตำแหน่ง/การกดจริง ไม่ใช้ overflow check อย่างเดียว
- animation หยุดเมื่ออยู่นอก viewport และไม่ทำให้การกรอกฟอร์มหรือ scroll กระตุก
- ใช้ภาพขนาดเหมาะสม โหลดภาพใต้ fold เมื่อจำเป็น และจำกัดขนาด JavaScript หน้า marketing
- เป้าหมายทดสอบ: LCP ≤ 2.5s, CLS ≤ 0.1 และ interaction ตอบสนองดีบน mobile; แยก lab result ออกจาก field data ที่ต้องเก็บหลังเปิดใช้งาน
- หน้า marketing มี title/description/canonical/OG เฉพาะหน้า มี sitemap และ structured data เฉพาะข้อเท็จจริง
- เปิดลิงก์ตรง refresh และ Back/Forward แล้วได้หน้าและ state ที่เหมาะสม
- ตรวจเว็บจริงแบบ anonymous หลัง deploy ทั้งเนื้อหา asset route form และ social preview ไม่ใช้ HTTP 200 เป็นหลักฐานเดียว

## 8. สิ่งที่ต้องยืนยันระหว่างเริ่มงาน

- ชื่อธุรกิจ/ข้อมูลผู้รับผิดชอบที่ต้องการเปิดเผย และสถานะบริษัทตามจริง
- งานลูกค้าและภาพที่มีสิทธิ์เผยแพร่ รวมถึงคำรับรองที่มีที่มา
- LinkedIn/ประวัติ/PDF และข้อมูลประสบการณ์ที่ยืนยันได้
- สิทธิ์เข้าถึง storefront ภายนอกและภาพสินค้า
- บัญชี hosting/database/email ที่มีอยู่ โดเมนและช่องทางรับ lead

รายการเหล่านี้ไม่ขวางการสร้าง concept แต่ห้ามเติมข้อมูลสมมติลงเวอร์ชันเผยแพร่

## 9. จุดเริ่มงานที่แนะนำ

เริ่ม A ด้วย concept 3 ส่วนที่กำหนดบุคลิกทั้งเว็บ: Hero interactive, Selected Systems และ Contact/Estimator พร้อม mobile hero จากนั้นขยาย concept ให้ครบส่วนที่เหลือก่อนลง implementation ของแต่ละส่วน

ผลลัพธ์ขั้นแรกต้องเป็นภาพที่เห็นหน้าตาเว็บและเรื่องราวได้จริง พร้อมขอบเขต interaction ที่ทำได้ ไม่ใช่เพียงเปลี่ยนสีหรือเติม animation ลงหน้าเดิม
