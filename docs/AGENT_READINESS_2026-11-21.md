# BUZLIKE SYSTEMS: ข้อมูลสำหรับ agent — 21 พฤศจิกายน 2026

ใช้ LINE `@486fpcll` เป็นโปรไฟล์ทางการตามที่เจ้าของยืนยัน ส่วน GitHub เป็นโปรไฟล์ผู้พัฒนา ไม่ใช่ `Organization.sameAs` ไม่เพิ่มประวัติทีม ที่อยู่จดทะเบียน รีวิว หรือผลงานลูกค้าที่ไม่มีหลักฐาน

## ผลลัพธ์ตามรายการตรวจ

| ข้อ | สิ่งที่เพิ่ม |
| --- | --- |
| 1 | `/robots.txt` มี `Content-Signal: search=yes, ai-train=no` และคง `Disallow: /admin` |
| 2–5 | JSON-LD บนหน้าแรกและหน้าข้อมูล: Organization, WebSite, WebPage/AboutPage/ContactPage, Service, OfferCatalog และ Offer พร้อม LINE ใน sameAs |
| 6 | ลิงก์ท้ายหน้าไป `/about` (ข้อมูลบริการ), `/contact`, `/pricing`, `/privacy`, `/terms` โดยคงเมนูหลักเดิม |
| 7 | `/pricing` แสดงราคาทุกช่วงใน HTML โดยตรง รวมสกุล THB และหน่วยต่อโปรเจกต์/เดือนใน Offer ไม่ต้องล็อกอินหรือใช้ JavaScript |
| 8 | `/llms.txt` สรุปบริการ ผลิตภัณฑ์ สถานะทดลอง ราคา และลิงก์หน้าหลัก |
| 9 | หน้าแรกและหน้าข้อมูลตอบ Markdown เมื่อขอ `Accept: text/markdown` มีไฟล์ `.md` โดยตรงด้วย |
| 10 | HTTP Link headers ชี้ llms.txt, Markdown alternate และ MCP Server Card พร้อม `Vary: Accept` |
| 11 | WebMCP ลงทะเบียน `list_systems`, `estimate_project`, `get_contact` เมื่อเบราว์เซอร์รองรับ API |
| 12 | Server Card ที่ `/.well-known/mcp/server-card.json` และ `/mcp/server-card` ชี้ไป MCP endpoint `/mcp` ที่ใช้งานได้จริง |

ข้อมูลราคาใน HTML, JSON-LD, Markdown, WebMCP และ MCP สร้างจาก `src/EstimateConfig.json` แหล่งเดียวกับเครื่องประเมินเดิม ราคาเริ่มต้น 15,000 บาทเป็นค่าพัฒนา ไม่ใช่ค่าสมาชิก POS สคริปต์สำหรับ agent และ CSS ใช้ URL เวอร์ชันตามเนื้อหาเพื่อลดปัญหาแคชเมื่อปรับข้อมูล

## ขอบเขตเครื่องมือ

MCP ใช้ Streamable HTTP แบบ stateless และตอบ JSON มี 3 tools กับ 7 public resources รองรับ initialize, ping, tools/list, tools/call, resources/list/read ไม่ประกาศ SSE หรือ subscription ที่ยังไม่มี ทั้ง MCP และ WebMCP อ่านข้อมูลสาธารณะกับคำนวณราคาเท่านั้น ไม่บันทึกคำขอ ส่งอีเมล รับชำระเงิน หรือเข้าถึงบัญชี/ข้อมูลลูกค้า

มีการจำกัดขนาด request, ตรวจ Origin/Content-Type/Accept, ตรวจ input ตามชนิดและค่าที่อนุญาต และจำกัด resources เป็นรายการไฟล์สาธารณะตายตัว ไม่อ่าน URL หรือ path ที่ผู้เรียกกำหนดอิสระ

## การตรวจสอบ

- HTTP integration **255 checks ผ่าน** รวมราคา 189 ชุดจาก 63 การเลือกหมวดระบบ × 3 รูปแบบบริการ, content negotiation, discovery, JSON-LD, invalid input และการปฏิเสธ private resources
- ทดสอบทั้งโครงสร้าง `public/` และแพ็กเกจ Hostinger `public_html/` ก่อนเผยแพร่ รวมการอ่าน resources ด้วย SDK
- Official MCP TypeScript SDK เชื่อมต่อ local และ `https://buzlike.com/mcp` สำเร็จ: initialize, list/call tools และ list/read resources ทั้ง 7 รายการ ตรวจ Server Card กับ schema ของโครงการทดลองด้วย Ajv
- Chromium 157 ที่เปิดฟีเจอร์ทดลอง WebMCP พบและเรียกทั้ง 3 tools ผ่าน native `document.modelContext` ได้ รวม input ผิดรูปแบบและทั้ง 3 รูปแบบราคา ไม่มี outbound write
- Browser checks **28 checks ผ่าน**: หน้าแรกและหน้าข้อมูล 6 หน้าที่ความกว้าง 320, 390, 768, 1440px ไม่ล้นจอ ราคาและลิงก์ติดต่อทำงานเมื่อปิด JavaScript
- Fresh browser ผ่านโดเมนจริง: หน้าแรก 200, คลิกลิงก์ท้ายหน้าไปหน้า pricing/contact ได้, ราคาแสดงจริง, ไม่มี page error หรือ mobile overflow
- Regression เดิม **27 inquiry + 35 admin + 38 backup checks ผ่าน** ใช้ข้อมูลทิ้งได้และ mail sender จำลอง ไม่ส่งคำขอทดสอบเข้ากล่องจริง
- Backup isolation **11 checks ผ่าน**: อ่านหน้าแรก/CRM/API/ไฟล์/หน้าเข้าสู่ระบบได้ขณะถือ backup lock และ CLI backup/restore ยังทำงาน
- PHP lint, JavaScript syntax, Git whitespace และการ generate ซ้ำผ่าน

หลักฐานระหว่างทำงานอยู่ใน `output/agent-readiness/` ซึ่งไม่รวมใน Git เช่น `http-results.json`, `sdk-live.json`, `live-http.json`, `live-browser.txt` และภาพหน้าจอ

## การเผยแพร่

เผยแพร่เฉพาะเว็บหลักบน Hostinger ตรวจไฟล์เดิมเทียบ Git baseline `9d617f8` ก่อนแทนที่ มีสำเนาโค้ดย้อนกลับนอก public directory พร้อม encrypted inquiry backup และทดสอบกู้คืนแบบแยกก่อนเผยแพร่ ตรวจ hash ของไฟล์หลังอัปโหลด และ hash/จำนวนแถวข้อมูลลูกค้ากับบัญชีผู้ดูแลก่อน–หลังตรงกัน ไม่เปลี่ยน POS, LAW, DNS หรือการตั้งค่า CDN

โค้ดรองรับชื่อโฟลเดอร์ทั้ง `public` ในเครื่องและ `public_html` ในแพ็กเกจ Hostinger การอ่านหน้าเว็บและ MCP ไม่เรียกงานสำรองข้อมูล การเผยแพร่นี้ไม่ติดตั้ง cron เพิ่ม

## ข้อจำกัดของเครื่องสแกน

WebMCP ยังเป็นฟีเจอร์ทดลอง ข้อกำหนดล่าสุดใช้ `document.modelContext`; โค้ดรองรับ `navigator.modelContext` ด้วยหาก implementation มี API เดิม ไม่สร้าง API จำลองให้สแกนผ่าน เครื่องมือ CLI บางรุ่นรายงานไม่พบ tools แม้ native API พบและเรียกได้

MCP Server Card ยังเป็นส่วนขยายทดลอง ไม่ใช่มาตรฐานที่ทุก client รองรับ โค้ดใช้ schema ปัจจุบันและเผยแพร่ทั้ง path ที่เครื่องสแกนขอและ path ที่ร่างปัจจุบันแนะนำ ยังไม่ได้รันเครื่องสแกนต้นทางของผู้ใช้ซ้ำ จึงไม่รับรองคะแนนหรือผลของเครื่องสแกนนั้น และผลทดสอบโดเมนจริงจำกัดเครือข่ายกับช่วงเวลาที่ตรวจ

เอกสารอ้างอิง: [WebMCP draft](https://webmachinelearning.github.io/webmcp/), [MCP transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports), [experimental server cards](https://github.com/modelcontextprotocol/ext-server-card), [Content Signals](https://contentsignals.org/)

## การปรับข้อมูลครั้งถัดไป

แก้ตัวตนใน `src/SiteConfig.json`, สถานะผลิตภัณฑ์ใน `src/AgentConfig.json`, ราคาใน `src/EstimateConfig.json` แล้วรัน `python scripts/generate_page_metadata.py` และ sync `public/index.html` ไป `index.html` ก่อนทดสอบ/สร้าง release การทดสอบ HTTP ใช้ `python scripts/test_agent_readiness.py --base http://127.0.0.1:8108` กับ PHP server สำเนาแยก ไม่ควรยิงชุด invalid-input ทั้งหมดเข้าระบบ production
