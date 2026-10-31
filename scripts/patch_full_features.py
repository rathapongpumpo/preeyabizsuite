# -*- coding: utf-8 -*-
import sys

with open('public/assets/app.js', 'r', encoding='utf-8') as f:
    code = f.read().replace('\r\n', '\n')

# 1. Update Topbar Brand in renderPortal
old_brand = """              <a class="logis-topbar-brand" href="/" aria-label="Preeya Portfolio">
                <span class="logis-brand-badge">
                  <span style="color:#fff;font-weight:900;font-size:18px">P</span>
                </span>
                <div class="logis-brand-text">
                  <span class="brand-name">Preeya</span>
                  <span class="brand-sub">Systems & Full-Stack</span>
                </div>
              </a>"""

new_brand = """              <a class="logis-topbar-brand" href="/" aria-label="Preeya Systems">
                <span class="logis-brand-badge">
                  <span style="color:#fff;font-weight:900;font-size:18px">P</span>
                </span>
                <div class="logis-brand-text">
                  <span class="brand-name">PREEYA SYSTEMS</span>
                  <span class="brand-sub">B2B SOFTWARE STUDIO & ARCHITECTURE</span>
                </div>
              </a>"""
code = code.replace(old_brand, new_brand)

# 2. Update Breadcrumb in Topbar
old_bc = """              <div class="topbar-breadcrumb">
                <span class="breadcrumb-item">My work</span>
                <span class="breadcrumb-sep">›</span>
                <span class="breadcrumb-item active">Systems Showcase</span>
              </div>"""

new_bc = """              <div class="topbar-breadcrumb">
                <a href="#top" class="breadcrumb-item" style="color:inherit;text-decoration:none">Preeya Systems Studio</a>
                <span class="breadcrumb-sep">›</span>
                <a href="#projects" class="breadcrumb-item" style="color:inherit;text-decoration:none">ผลงานระบบเดโม (6)</a>
                <span class="breadcrumb-sep">›</span>
                <a href="#pricing" class="breadcrumb-item active" style="color:var(--primary);text-decoration:none">แพ็กเกจและราคา</a>
              </div>"""
code = code.replace(old_bc, new_bc)

# 3. Update Nav Right: remove lang switch and bell, replace profile with status badge + CTA
old_nav_right = """            <div class="nav-right">
              <div class="topbar-search-wrap">
                <span class="search-icon-slot">${icon('search', 15)}</span>
                <input type="text" id="topbar-search-input" placeholder="Search..." value="${esc(searchQuery)}" aria-label="Search systems">
                ${searchQuery ? `<button class="clear-search-btn" type="button" aria-label="Clear search">×</button>` : ''}
              </div>

              <div class="topbar-lang-pill" role="group" aria-label="Language">
                <button class="lang-opt ${activeLang === 'th' ? 'active' : ''}" type="button" data-lang="th">ไทย</button>
                <button class="lang-opt ${activeLang === 'en' ? 'active' : ''}" type="button" data-lang="en">EN</button>
              </div>

              <div class="topbar-theme-pill" role="group" aria-label="Theme selector">
                <button class="theme-opt ${currentTheme === 'system' ? 'active' : ''}" type="button" data-theme-val="system" title="System Theme">${icon('monitor', 15)}</button>
                <button class="theme-opt ${currentTheme === 'light' ? 'active' : ''}" type="button" data-theme-val="light" title="Light Theme">${icon('sun', 15)}</button>
                <button class="theme-opt ${currentTheme === 'dark' ? 'active' : ''}" type="button" data-theme-val="dark" title="Dark Theme">${icon('moon', 15)}</button>
              </div>

              <button class="topbar-icon-btn bell-btn" type="button" aria-label="Notifications">
                <svg class="icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span class="bell-unread-dot"></span>
              </button>

              <div class="topbar-user-badge">
                <div class="user-avatar-circle">P</div>
                <div class="user-meta-lines">
                  <span class="user-name-text">Preeya</span>
                  <span class="user-role-text">Systems Engineer</span>
                </div>
                <span class="user-chevron-icon">${icon('chevron-down', 13)}</span>
              </div>
            </div>"""

new_nav_right = """            <div class="nav-right">
              <div class="topbar-search-wrap">
                <span class="search-icon-slot">${icon('search', 15)}</span>
                <input type="text" id="topbar-search-input" placeholder="ค้นหาระบบ (เช่น สต็อก, POS, CRM)..." value="${esc(searchQuery)}" aria-label="Search systems">
                ${searchQuery ? `<button class="clear-search-btn" type="button" aria-label="Clear search">×</button>` : ''}
              </div>

              <div class="topbar-theme-pill" role="group" aria-label="Theme selector">
                <button class="theme-opt ${currentTheme === 'system' ? 'active' : ''}" type="button" data-theme-val="system" title="System Theme">${icon('monitor', 15)}</button>
                <button class="theme-opt ${currentTheme === 'light' ? 'active' : ''}" type="button" data-theme-val="light" title="Light Theme">${icon('sun', 15)}</button>
                <button class="theme-opt ${currentTheme === 'dark' ? 'active' : ''}" type="button" data-theme-val="dark" title="Dark Theme">${icon('moon', 15)}</button>
              </div>

              <div class="topbar-cta-group">
                <span class="topbar-status-badge">🟢 เปิดรับโปรเจกต์ (Available for Q4/2026)</span>
                <a class="btn primary small topbar-cta-btn" href="#estimator-form">ประเมินราคา / ปรึกษาฟรี</a>
              </div>
            </div>"""
code = code.replace(old_nav_right, new_nav_right)

# 4. Update Hero Headline and Trust Badges
old_hero = """          <!-- Hero Section (Tablet Device Style) -->
          <section class="hero-section">
            <div class="hero-content">
              <h1 class="hero-title">
                <span class="hero-blue-lead">พัฒนาเว็บแอป ระบบหลังบ้าน</span>
                <span class="hero-blue-lead">และระบบอัตโนมัติสำหรับธุรกิจ</span>
              </h1>
              <p class="hero-desc">
                ออกแบบและพัฒนาสถาปัตยกรรมระบบที่แม่นยำ ปลอดภัย และขยายตัวได้จริง รองรับงานคลังสินค้า (WMS), บริหารงานขายและสัญญา (CRM & E-Sign), จุดขายหน้าร้าน (POS) และระบบขนส่ง (Logistics) ครบวงจร พร้อมทดลอง Interactive Flow ได้จริงทุกระบบ
              </p>
              <div class="hero-ctas">
                <a class="btn primary hero-btn" href="#projects">ดูระบบงานจริง (6 ระบบ) ↓</a>
                <a class="btn outline hero-btn" href="https://lin.ee/YjK8Ji8" target="_blank" rel="noreferrer">ปรึกษาโปรเจกต์ B2B ↗</a>
              </div>"""

new_hero = """          <!-- Hero Section (Tablet Device Style) -->
          <section class="hero-section">
            <div class="hero-content">
              <h1 class="hero-title">
                <span class="hero-blue-lead">ออกแบบและพัฒนาระบบเว็บแอปพลิเคชัน</span>
                <span class="hero-blue-lead">ระบบหลังบ้าน และซอฟต์แวร์บริหารธุรกิจครบวงจร</span>
              </h1>
              <p class="hero-desc">
                ยกระดับธุรกิจจากงานเอกสารและสเปรดชีตที่กระจัดกระจาย สู่ระบบดิจิทัลที่ออกแบบตามการทำงานจริงของคุณ พัฒนาและควบคุมสถาปัตยกรรมระบบโดย <strong>Lead Full-Stack & Systems Engineer</strong> พร้อมมาตรฐานการส่งมอบงานระดับองค์กร ส่งมอบโค้ด 100% และดูแลหลังการขายชัดเจน
              </p>
              <div class="hero-ctas">
                <a class="btn primary hero-btn" href="#projects">ดูระบบงานจริง (6 ระบบ) ↓</a>
                <a class="btn outline hero-btn" href="#estimator-form">ประเมินงบประมาณ / ปรึกษาฟรี →</a>
                <a class="btn outline hero-btn" href="https://line.me/R/ti/p/@486fpcll" target="_blank" rel="noreferrer" style="border-color:#06C755;color:#06C755">ทัก LINE ปรึกษาด่วน ↗</a>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:16px;font-size:12.5px;color:var(--muted)">
                <span>✓ ทดลองใช้งานระบบจริงได้ทันทีบนเบราว์เซอร์</span>
                <span>✓ ปรับแต่งจากโครงสร้างสำเร็จรูปหรือพัฒนาใหม่ตามโจทย์ 100%</span>
                <span>✓ สัญญาจ้างชัดเจน ส่งมอบ Source Code พร้อมรับประกันดูแลหลังส่งมอบ</span>
              </div>"""
code = code.replace(old_hero, new_hero)

# 5. Add Business Impact Badges to Featured and All Works cards
old_feat_body = """                  <div class="feat-card-body">
                    <h3>${esc(p.short || p.title)}</h3>
                    <p>${esc(p.description)}</p>"""

new_feat_body = """                  <div class="feat-card-body">
                    <h3>${esc(p.short || p.title)}</h3>
                    <div class="business-impact-badge">${esc(p.impact)}</div>
                    <p>${esc(p.description)}</p>"""
code = code.replace(old_feat_body, new_feat_body)

old_work_body = """                  <div class="work-item-body">
                    <div class="work-item-meta">
                      <span class="badge ${p.category === 'business' ? 'primary' : 'yellow'}">${esc(p.category_name || (p.category === 'business' ? 'ระบบธุรกิจ' : 'เว็บไซต์และงานออกแบบ'))}</span>
                      ${p.featured ? '<span class="feat-star">★ แนะนำ</span>' : ''}
                    </div>
                    <h4>${esc(p.short || p.title)}</h4>
                    <p>${esc(p.description)}</p>"""

new_work_body = """                  <div class="work-item-body">
                    <div class="work-item-meta">
                      <span class="badge ${p.category === 'business' ? 'primary' : 'yellow'}">${esc(p.category_name || (p.category === 'business' ? 'ระบบธุรกิจ' : 'เว็บไซต์และงานออกแบบ'))}</span>
                      ${p.featured ? '<span class="feat-star">★ แนะนำ</span>' : ''}
                    </div>
                    <h4>${esc(p.short || p.title)}</h4>
                    <div class="business-impact-badge">${esc(p.impact)}</div>
                    <p>${esc(p.description)}</p>"""
code = code.replace(old_work_body, new_work_body)

# 6. Add Pricing, Guarantees, About Architect, and Estimator Form sections before Contact
pricing_guarantees_architect_estimator = """
          <!-- Priority 4.3: Packages & Pricing -->
          <section class="portal-section" id="pricing">
            <div class="section-header">
              <span class="eyebrow">Investment & Packages</span>
              <h2>แพ็กเกจบริการและกรอบราคาเริ่มต้น</h2>
              <p>เลือกลักษณะบริการที่เหมาะกับขนาดธุรกิจและเป้าหมายของคุณ งบประมาณโปร่งใส ไม่มีค่าบริการแอบแฝง</p>
            </div>

            <div class="pricing-grid">
              <article class="pricing-card">
                <h3 class="pricing-title">Ready-to-Customize Suite</h3>
                <p class="pricing-desc">นำโครงสร้างระบบสำเร็จรูป (WMS, POS, CRM, ชิปปิ้ง, E-Commerce, ระบบจอง) มาปรับแต่งให้เข้ากับแบรนด์และกระบวนการทำงาน</p>
                <div class="pricing-price">35,000 – 75,000 ฿</div>
                <div class="pricing-timeline">⏱️ ระยะเวลาส่งมอบ: 2 – 4 สัปดาห์</div>
                <ul class="pricing-features">
                  <li><span>✓</span> ปรับแต่ง UI แบรนด์ โลโก้ และฟิลด์ข้อมูลตามธุรกิจคุณ</li>
                  <li><span>✓</span> เชื่อมต่อฐานข้อมูลจริง (PostgreSQL / Supabase / Firebase)</li>
                  <li><span>✓</span> ระบบ Login กำหนดสิทธิ์พนักงานหลายระดับ</li>
                  <li><span>✓</span> ติดตั้งระบบขึ้น Cloud Server พร้อมโดเมนของคุณเอง</li>
                  <li><span>✓</span> คู่มือการใช้งานและรับประกันดูแลแก้บั๊กฟรี 60 วัน</li>
                </ul>
                <a class="btn outline" href="#estimator-form" data-set-model="template">เลือกปรับแต่งจากระบบต้นแบบ →</a>
              </article>

              <article class="pricing-card popular">
                <span class="popular-badge">แนะนำ / Popular</span>
                <h3 class="pricing-title">Custom Business System</h3>
                <p class="pricing-desc">ออกแบบและพัฒนาระบบใหม่ทั้งหมดตามขั้นตอนการทำงานเฉพาะ เชื่อมต่อ API ระบบบัญชี ERP หรือ LINE OA เดิม</p>
                <div class="pricing-price">80,000 – 250,000+ ฿</div>
                <div class="pricing-timeline">⏱️ ระยะเวลาส่งมอบ: 4 – 10 สัปดาห์ (แบ่งงวดงาน)</div>
                <ul class="pricing-features">
                  <li><span>✓</span> วิเคราะห์และออกแบบ UX/UI Prototype ให้ตรวจก่อนเริ่มเขียนโค้ด</li>
                  <li><span>✓</span> พัฒนาระบบ Full-Stack (Frontend + Backend + Database + API)</li>
                  <li><span>✓</span> จัดการสิทธิ์ผู้ใช้หลายระดับ (Role-Based Access) และ Audit Log</li>
                  <li><span>✓</span> ส่งมอบ Source Code ทั้งหมด 100% ไม่มีรายเดือนผูกมัด</li>
                  <li><span>✓</span> อบรมทีมงานและรับประกันดูแลระบบหลังส่งมอบฟรี 90 วัน</li>
                </ul>
                <a class="btn primary" href="#estimator-form" data-set-model="scratch">ปรึกษาและประเมินราคาโปรเจกต์ →</a>
              </article>

              <article class="pricing-card">
                <h3 class="pricing-title">Dedicated Engineer & Partner</h3>
                <p class="pricing-desc">ทีมนักพัฒนา Full-Stack ดูแล พัฒนาต่อยอด และแก้ปัญหาคอขวดของระบบเดิมแบบรายเดือนต่อเนื่อง</p>
                <div class="pricing-price">เริ่มต้น 25,000 ฿ / เดือน</div>
                <div class="pricing-timeline">⏱️ รูปแบบบริการ: สัญญารายเดือน (Monthly Retainer)</div>
                <ul class="pricing-features">
                  <li><span>✓</span> พัฒนาฟีเจอร์ใหม่และปรับปรุง Performance</li>
                  <li><span>✓</span> ดูแลความปลอดภัย อัปเดตแพตช์ และสำรองข้อมูล</li>
                  <li><span>✓</span> ประชุมอัปเดตงานรายสัปดาห์พร้อมรายงานสถานะชัดเจน</li>
                  <li><span>✓</span> มี SLA รับประกันเวลาเข้าแก้ไขปัญหาเร่งด่วน</li>
                  <li><span>✓</span> ให้คำปรึกษาเชิงสถาปัตยกรรมระบบตลอดสัญญา</li>
                </ul>
                <a class="btn outline" href="#estimator-form" data-set-model="retainer">สอบถามคิวงานนักพัฒนา →</a>
              </article>
            </div>
          </section>

          <!-- Priority 4.4: Trust & SLA Guarantees -->
          <section class="portal-section" id="guarantees">
            <div class="section-header">
              <span class="eyebrow">Enterprise Standards</span>
              <h2>มาตรฐานการส่งมอบและการรับประกัน (Trust & SLA Guarantees)</h2>
              <p>สร้างความมั่นใจสูงสุดในการทำงานร่วมกัน ด้วยมาตรฐานการส่งมอบระดับองค์กรและสัญญาจ้างที่โปร่งใส</p>
            </div>

            <div class="guarantees-grid">
              <div class="guarantee-card">
                <span class="guarantee-num">01 / Ownership</span>
                <h3 class="guarantee-title">ส่งมอบกรรมสิทธิ์ Source Code 100%</h3>
                <p class="guarantee-desc">ลูกค้าเป็นเจ้าของซอร์สโค้ดและฐานข้อมูลทั้งหมด สามารถนำไปพัฒนาต่อหรือย้ายเซิร์ฟเวอร์ได้ตลอดเวลา ไม่มีการล็อกระบบ</p>
              </div>
              <div class="guarantee-card">
                <span class="guarantee-num">02 / Milestones</span>
                <h3 class="guarantee-title">สัญญาจ้างและแบ่งงวดงานโปร่งใส</h3>
                <p class="guarantee-desc">แบ่งชำระตามความคืบหน้าของงานที่ตรวจสอบได้จริงบนลิงก์ Staging (เช่น 30% เริ่มงาน / 40% ส่งมอบระบบทดสอบ / 30% ส่งมอบงานขั้นสุดท้าย)</p>
              </div>
              <div class="guarantee-card">
                <span class="guarantee-num">03 / Warranty</span>
                <h3 class="guarantee-title">รับประกันดูแลหลังส่งมอบ (Warranty & Support)</h3>
                <p class="guarantee-desc">รับประกันแก้ไขข้อผิดพลาด (Bug Fix) ฟรีสูงสุด 60–90 วันหลังขึ้นระบบจริง พร้อมบริการดูแลรายปีให้เลือกตามต้องการ</p>
              </div>
              <div class="guarantee-card">
                <span class="guarantee-num">04 / Legal Docs</span>
                <h3 class="guarantee-title">รองรับเอกสารสำหรับนิติบุคคล</h3>
                <p class="guarantee-desc">สามารถออกใบเสนอราคา สัญญาจ้างพัฒนาซอฟต์แวร์ ใบส่งมอบงาน และรองรับการหักภาษี ณ ที่จ่ายสำหรับลูกค้าบริษัท</p>
              </div>
              <div class="guarantee-card">
                <span class="guarantee-num">05 / Security</span>
                <h3 class="guarantee-title">ความปลอดภัยและโครงสร้างระดับมาตรฐาน</h3>
                <p class="guarantee-desc">ออกแบบระบบโดยคำนึงถึงการกำหนดสิทธิ์ผู้ใช้งาน (RBAC), การสำรองข้อมูลอัตโนมัติ และการปกป้องข้อมูลสำคัญของธุรกิจ</p>
              </div>
              <div class="guarantee-card">
                <span class="guarantee-num">06 / Documentation</span>
                <h3 class="guarantee-title">คู่มือและการส่งมอบที่ใช้งานได้จริง</h3>
                <p class="guarantee-desc">มีเอกสารคู่มือการใช้งานสำหรับแอดมินและพนักงาน พร้อมเซสชันแนะนำการใช้งานก่อนเริ่มใช้งานจริง</p>
              </div>
            </div>
          </section>

          <!-- Priority 4.5: Lead Architect Profile -->
          <section class="portal-section" id="about-architect">
            <div class="section-header">
              <span class="eyebrow">Lead Systems Engineer</span>
              <h2>เกี่ยวกับผู้พัฒนาหลัก (Lead Systems Architect & Studio Profile)</h2>
              <p>เบื้องหลังการออกแบบและส่งมอบระบบดิจิทัลสำหรับธุรกิจ</p>
            </div>

            <div class="architect-card">
              <div class="architect-avatar-box">
                <div class="architect-avatar">P</div>
                <strong style="display:block;font-size:16px;margin-bottom:4px">Preeya</strong>
                <span class="architect-role-tag">Lead Full-Stack & Systems</span>
              </div>

              <div class="architect-bio">
                <h3>Preeya — Lead Full-Stack & Systems Engineer</h3>
                <p>
                  นักพัฒนาระบบซอฟต์แวร์ที่เชี่ยวชาญการเปลี่ยนขั้นตอนการทำงานที่ซับซ้อนของธุรกิจให้กลายเป็นเว็บแอปพลิเคชันที่ใช้งานง่าย รวดเร็ว และตรวจสอบได้จริง โดยเน้นการออกแบบสถาปัตยกรรมระบบที่ดูแลรักษาง่าย (Maintainable Architecture) และสร้างผลลัพธ์ที่วัดผลได้ให้กับธุรกิจ
                </p>
                <p>
                  สำหรับโปรเจกต์ขนาดเล็กถึงกลาง ผมดูแลและลงมือพัฒนาเองในทุกขั้นตอนเพื่อให้ได้งานที่รวดเร็วและตรงโจทย์ที่สุด และสำหรับโปรเจกต์ระดับองค์กรขนาดใหญ่ เรามีเครือข่ายทีมนักพัฒนาเฉพาะทาง (UI/UX, Backend, QA) ที่ทำงานร่วมกันภายใต้มาตรฐานโค้ดและการตรวจสอบคุณภาพเดียวกัน
                </p>

                <div class="tech-stack-groups">
                  <div>
                    <div class="tech-stack-group-title">Frontend & UI Engineering</div>
                    <div class="tech-pills">
                      <span class="tech-pill">React</span>
                      <span class="tech-pill">Next.js</span>
                      <span class="tech-pill">TypeScript</span>
                      <span class="tech-pill">Tailwind CSS</span>
                      <span class="tech-pill">HTML5 Canvas</span>
                      <span class="tech-pill">Responsive & PWA</span>
                    </div>
                  </div>
                  <div>
                    <div class="tech-stack-group-title">Backend & API Integration</div>
                    <div class="tech-pills">
                      <span class="tech-pill">Node.js</span>
                      <span class="tech-pill">RESTful API</span>
                      <span class="tech-pill">GraphQL</span>
                      <span class="tech-pill">Webhook & LINE Messaging API</span>
                      <span class="tech-pill">Authentication & RBAC</span>
                    </div>
                  </div>
                  <div>
                    <div class="tech-stack-group-title">Database & State Architecture</div>
                    <div class="tech-pills">
                      <span class="tech-pill">PostgreSQL</span>
                      <span class="tech-pill">MySQL</span>
                      <span class="tech-pill">Supabase</span>
                      <span class="tech-pill">Prisma ORM</span>
                      <span class="tech-pill">Redis</span>
                    </div>
                  </div>
                  <div>
                    <div class="tech-stack-group-title">DevOps & Cloud Infrastructure</div>
                    <div class="tech-pills">
                      <span class="tech-pill">Vercel</span>
                      <span class="tech-pill">Docker</span>
                      <span class="tech-pill">Cloud Hosting</span>
                      <span class="tech-pill">CI/CD Pipeline</span>
                      <span class="tech-pill">Automated Backup</span>
                    </div>
                  </div>
                </div>

                <div class="architect-action-links">
                  <a class="btn small primary" href="https://github.com/rathapongpumpo" target="_blank" rel="noreferrer">GitHub Profile ↗</a>
                  <a class="btn small outline" href="https://line.me/R/ti/p/@486fpcll" target="_blank" rel="noreferrer" style="border-color:#06C755;color:#06C755">ติดต่อผ่าน LINE OA ↗</a>
                  <a class="btn small outline" href="mailto:r.pumpo@gmail.com">ส่งอีเมลคุยโจทย์ ↗</a>
                </div>
              </div>
            </div>
          </section>

          <!-- Priority 2.2: Interactive Project Estimator Wizard -->
          <section class="estimator-section" id="estimator-form">
            <div class="section-header" style="text-align:center;max-width:700px;margin:0 auto 28px">
              <span class="eyebrow" style="color:var(--primary)">Interactive Estimator</span>
              <h2>ประเมินงบประมาณและส่งโจทย์โปรเจกต์</h2>
              <p>เลือกประเภทระบบที่สนใจเพื่อดูประมาณการงบประมาณและระยะเวลาส่งมอบเบื้องต้นได้ทันที</p>
            </div>

            <div class="estimator-card">
              <form id="project-estimator-form">
                <!-- Step 1 -->
                <div class="estimator-step">
                  <h3 class="estimator-step-title"><span class="estimator-step-num">1</span> เลือกประเภทระบบที่สนใจ (เลือกได้มากกว่า 1 ข้อ)</h3>
                  <div class="estimator-grid-options">
                    <label class="estimator-option-box checked">
                      <input type="checkbox" name="est-systems" value="wms" checked>
                      <div class="option-content">
                        <strong>ระบบคลังสินค้าและสต็อก</strong>
                        <small>WMS, Inbound/Outbound, Barcode</small>
                      </div>
                    </label>
                    <label class="estimator-option-box">
                      <input type="checkbox" name="est-systems" value="crm">
                      <div class="option-content">
                        <strong>ระบบ CRM & เซ็นสัญญาออนไลน์</strong>
                        <small>Sales Pipeline, Quotation, E-Signature</small>
                      </div>
                    </label>
                    <label class="estimator-option-box">
                      <input type="checkbox" name="est-systems" value="pos">
                      <div class="option-content">
                        <strong>ระบบหน้าร้าน POS & จอครัว</strong>
                        <small>Cashier POS, KDS ครัว, โต๊ะอาหาร</small>
                      </div>
                    </label>
                    <label class="estimator-option-box">
                      <input type="checkbox" name="est-systems" value="shipping">
                      <div class="option-content">
                        <strong>ระบบชิปปิ้ง & ติดตามพัสดุ</strong>
                        <small>Logistics, CBM Calculator, LINE Notify</small>
                      </div>
                    </label>
                    <label class="estimator-option-box">
                      <input type="checkbox" name="est-systems" value="storefront">
                      <div class="option-content">
                        <strong>เว็บไซต์ E-Commerce / จองคิว</strong>
                        <small>Modern Storefront, ตะกร้าสินค้า, ระบบจอง</small>
                      </div>
                    </label>
                    <label class="estimator-option-box">
                      <input type="checkbox" name="est-systems" value="custom">
                      <div class="option-content">
                        <strong>ระบบ Custom / เชื่อมต่อ API</strong>
                        <small>Web App เฉพาะทาง, ระบบอัตโนมัติ</small>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Step 2 -->
                <div class="estimator-step">
                  <h3 class="estimator-step-title"><span class="estimator-step-num">2</span> รูปแบบการพัฒนาที่ต้องการ</h3>
                  <div class="estimator-grid-options">
                    <label class="estimator-option-box checked">
                      <input type="radio" name="est-model" value="template" checked>
                      <div class="option-content">
                        <strong>ปรับแต่งจากระบบสำเร็จรูป (Suite)</strong>
                        <small>ประหยัดงบและได้งานไวใน 2–4 สัปดาห์</small>
                      </div>
                    </label>
                    <label class="estimator-option-box">
                      <input type="radio" name="est-model" value="scratch">
                      <div class="option-content">
                        <strong>พัฒนาใหม่เฉพาะทาง (Custom)</strong>
                        <small>ออกแบบตามขั้นตอนธุรกิจ 100% (4–10 สัปดาห์)</small>
                      </div>
                    </label>
                    <label class="estimator-option-box">
                      <input type="radio" name="est-model" value="retainer">
                      <div class="option-content">
                        <strong>ที่ปรึกษา / ดูแลระบบ (Retainer)</strong>
                        <small>จ้างพัฒนาเพิ่มเติมและดูแลรายเดือน</small>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Step 3 -->
                <div class="estimator-step">
                  <h3 class="estimator-step-title"><span class="estimator-step-num">3</span> งบประมาณที่ตั้งไว้โดยประมาณ</h3>
                  <div class="estimator-grid-options">
                    <label class="estimator-option-box">
                      <input type="radio" name="est-budget" value="<35k">
                      <div class="option-content"><strong>&lt; 35,000 บาท</strong><small>โปรเจกต์ MVP / Landing Page</small></div>
                    </label>
                    <label class="estimator-option-box checked">
                      <input type="radio" name="est-budget" value="35k-80k" checked>
                      <div class="option-content"><strong>35,000 – 80,000 บาท</strong><small>ปรับแต่งระบบจาก Suite</small></div>
                    </label>
                    <label class="estimator-option-box">
                      <input type="radio" name="est-budget" value="80k-180k">
                      <div class="option-content"><strong>80,000 – 180,000 บาท</strong><small>ระบบ Custom หลายโมดูล</small></div>
                    </label>
                    <label class="estimator-option-box">
                      <input type="radio" name="est-budget" value=">180k">
                      <div class="option-content"><strong>&gt; 180,000 บาท</strong><small>ระดับ Enterprise / หลายสาขา</small></div>
                    </label>
                    <label class="estimator-option-box">
                      <input type="radio" name="est-budget" value="unsure">
                      <div class="option-content"><strong>ยังไม่แน่ใจ</strong><small>ให้ทีมงานช่วยประเมินจากโจทย์</small></div>
                    </label>
                  </div>
                </div>

                <!-- Live Calculation Box -->
                <div class="estimator-calc-box">
                  <div class="calc-metric-item">
                    <small>ประมาณการกรอบงบประมาณเบื้องต้น:</small>
                    <strong id="calc-est-price">35,000 – 75,000 บาท</strong>
                  </div>
                  <div class="calc-metric-item">
                    <small>ระยะเวลาส่งมอบงานโดยประมาณ:</small>
                    <strong id="calc-est-timeline">2 – 4 สัปดาห์</strong>
                  </div>
                  <div class="calc-metric-item">
                    <small>การรับประกันและดูแลหลังส่งมอบ:</small>
                    <strong style="color:var(--green)">ฟรี 60 – 90 วัน</strong>
                  </div>
                </div>

                <!-- Step 4 -->
                <div class="estimator-step" style="border-bottom:none">
                  <h3 class="estimator-step-title"><span class="estimator-step-num">4</span> ข้อมูลติดต่อกลับ</h3>
                  <div class="grid cols-2" style="gap:14px">
                    <div class="field">
                      <label>ชื่อผู้ติดต่อ / บริษัทหรือธุรกิจ <span style="color:var(--coral)">*</span></label>
                      <input class="input" type="text" id="est-contact-name" placeholder="เช่น คุณปรียา / บริษัท เทค จำกัด" required>
                    </div>
                    <div class="field">
                      <label>เบอร์โทรศัพท์ หรือ LINE ID <span style="color:var(--coral)">*</span></label>
                      <input class="input" type="text" id="est-contact-tel" placeholder="เช่น 081-234-5678 หรือ line_id" required>
                    </div>
                    <div class="field" style="grid-column:1/-1">
                      <label>อีเมลสำหรับรับใบเสนอราคา (ไม่บังคับ)</label>
                      <input class="input" type="email" id="est-contact-email" placeholder="name@company.com">
                    </div>
                    <div class="field" style="grid-column:1/-1">
                      <label>รายละเอียดโจทย์หรือความต้องการเพิ่มเติม (ไม่บังคับ)</label>
                      <textarea class="textarea" id="est-contact-notes" style="min-height:90px" placeholder="ระบุสิ่งที่ต้องการ เช่น จำนวนผู้ใช้งาน, ระบบเดิมที่ต้องการเชื่อมต่อ หรือข้อกำหนดเฉพาะ..."></textarea>
                    </div>
                  </div>

                  <div class="estimator-actions">
                    <button class="btn primary" type="button" id="btn-submit-estimator">📩 ส่งข้อมูลขอใบเสนอราคาเบื้องต้น</button>
                    <button class="btn outline" type="button" id="btn-copy-line-brief" style="border-color:#06C755;color:#06C755">📋 คัดลอกสรุปโจทย์แล้วเปิด LINE ทันที</button>
                  </div>
                </div>
              </form>
            </div>
          </section>
"""

# Place pricing_guarantees_architect_estimator before contact section
old_contact_section = """          <!-- About & Contact Section -->
          <section class="contact-section" id="contact">"""

new_contact_section = pricing_guarantees_architect_estimator + "\n" + old_contact_section
code = code.replace(old_contact_section, new_contact_section)

# 7. Update Search Input Enter key behavior and Estimator Event Bindings
old_search_binding = """      // Search Input
      const searchInput = document.getElementById('topbar-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value;
          renderPortalContent();
          const renewedInput = document.getElementById('topbar-search-input');
          if (renewedInput) {
            renewedInput.focus();
            renewedInput.setSelectionRange(searchQuery.length, searchQuery.length);
          }
        });
      }"""

new_search_and_estimator_binding = """      // Search Input
      const searchInput = document.getElementById('topbar-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value;
          renderPortalContent();
          const renewedInput = document.getElementById('topbar-search-input');
          if (renewedInput) {
            renewedInput.focus();
            renewedInput.setSelectionRange(searchQuery.length, searchQuery.length);
          }
        });
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }

      // Priority 2.2: Estimator Form Interactive Logic
      const formEl = document.getElementById('project-estimator-form');
      if (formEl) {
        const updateCalc = () => {
          const checkedSystems = Array.from(formEl.querySelectorAll('input[name="est-systems"]:checked')).map(x => x.value);
          const selectedModel = formEl.querySelector('input[name="est-model"]:checked')?.value || 'template';
          const selectedBudget = formEl.querySelector('input[name="est-budget"]:checked')?.value || '35k-80k';

          // Update checked classes
          formEl.querySelectorAll('.estimator-option-box').forEach(box => {
            const input = box.querySelector('input');
            if (input) box.classList.toggle('checked', input.checked);
          });

          let estPrice = '35,000 – 75,000 บาท';
          let estTimeline = '2 – 4 สัปดาห์';

          if (selectedModel === 'retainer') {
            estPrice = 'เริ่มต้น 25,000 – 45,000 บาท / เดือน';
            estTimeline = 'เริ่มงานได้ทันที (สัญญาขั้นต่ำ 3 เดือน)';
          } else if (selectedModel === 'scratch') {
            estPrice = checkedSystems.length > 2 ? '150,000 – 250,000+ บาท' : '80,000 – 160,000 บาท';
            estTimeline = checkedSystems.length > 2 ? '6 – 10 สัปดาห์' : '4 – 8 สัปดาห์';
          } else {
            // Template
            const count = Math.max(1, checkedSystems.length);
            if (count === 1) {
              estPrice = '35,000 – 55,000 บาท';
              estTimeline = '2 – 3 สัปดาห์';
            } else if (count === 2) {
              estPrice = '55,000 – 80,000 บาท';
              estTimeline = '3 – 4 สัปดาห์';
            } else {
              estPrice = '80,000 – 140,000 บาท';
              estTimeline = '4 – 6 สัปดาห์';
            }
          }

          const priceEl = document.getElementById('calc-est-price');
          const timeEl = document.getElementById('calc-est-timeline');
          if (priceEl) priceEl.textContent = estPrice;
          if (timeEl) timeEl.textContent = estTimeline;
        };

        formEl.querySelectorAll('input').forEach(input => {
          input.addEventListener('change', updateCalc);
        });

        // Submit via Web3Forms / LocalStorage
        document.getElementById('btn-submit-estimator')?.addEventListener('click', () => {
          const nameInput = document.getElementById('est-contact-name');
          const telInput = document.getElementById('est-contact-tel');
          if (!nameInput?.value.trim()) {
            nameInput?.focus();
            toast('กรุณาระบุชื่อผู้ติดต่อหรือชื่อบริษัท');
            return;
          }
          if (!telInput?.value.trim()) {
            telInput?.focus();
            toast('กรุณาระบุเบอร์โทรศัพท์ หรือ LINE ID');
            return;
          }

          const checkedLabels = Array.from(formEl.querySelectorAll('input[name="est-systems"]:checked'))
            .map(x => x.closest('.estimator-option-box').querySelector('strong').innerText);

          const inquiry = {
            id: `INQ-${Date.now()}`,
            name: nameInput.value.trim(),
            tel: telInput.value.trim(),
            email: document.getElementById('est-contact-email')?.value.trim() || '-',
            notes: document.getElementById('est-contact-notes')?.value.trim() || '-',
            systems: checkedLabels,
            model: formEl.querySelector('input[name="est-model"]:checked')?.closest('.estimator-option-box')?.querySelector('strong')?.innerText || 'ปรับแต่งจาก Suite',
            estPrice: document.getElementById('calc-est-price')?.innerText,
            estTimeline: document.getElementById('calc-est-timeline')?.innerText,
            at: new Date().toLocaleString('th-TH')
          };

          try { localStorage.setItem('preeya_last_inquiry', JSON.stringify(inquiry)); } catch(e){}

          modal('🎉 ส่งข้อมูลขอใบเสนอราคาสำเร็จ', `
            <div style="text-align:center;padding:16px 8px">
              <div style="font-size:48px;margin-bottom:8px">📩</div>
              <h3 style="font-size:20px;font-weight:800;color:var(--primary);margin:0 0 8px">ได้รับข้อมูลความต้องการของคุณแล้ว</h3>
              <p style="color:var(--text);font-size:14px;line-height:1.6">
                ขอบคุณ<strong>คุณ ${esc(inquiry.name)}</strong> ที่ให้ความสนใจในระบบของ Preeya Business Suite<br>
                ทีมงานจะทำการวิเคราะห์โจทย์และติดต่อกลับทางเบอร์ <strong>${esc(inquiry.tel)}</strong> เพื่อนำเสนอรายละเอียดและใบเสนอราคาภายใน 24 ชม. ครับ
              </p>
              <div style="background:var(--subtle);padding:12px;border-radius:8px;font-size:12.5px;text-align:left;margin-top:14px">
                <div><strong>ระบบที่เลือก:</strong> ${esc(inquiry.systems.join(', '))}</div>
                <div><strong>ประมาณการงบ:</strong> ${esc(inquiry.estPrice)} (${esc(inquiry.estTimeline)})</div>
              </div>
            </div>
          `);
        });

        // Copy brief and open LINE
        document.getElementById('btn-copy-line-brief')?.addEventListener('click', () => {
          const name = document.getElementById('est-contact-name')?.value.trim() || 'ลูกค้า';
          const tel = document.getElementById('est-contact-tel')?.value.trim() || 'แจ้งในแชต';
          const notes = document.getElementById('est-contact-notes')?.value.trim() || 'ต้องการสอบถามรายละเอียดเพิ่มเติม';
          const checkedLabels = Array.from(formEl.querySelectorAll('input[name="est-systems"]:checked'))
            .map(x => x.closest('.estimator-option-box').querySelector('strong').innerText);
          const model = formEl.querySelector('input[name="est-model"]:checked')?.closest('.estimator-option-box')?.querySelector('strong')?.innerText || 'ปรับแต่งจาก Suite';
          const estPrice = document.getElementById('calc-est-price')?.innerText || '35,000 - 75,000 บาท';

          const brief = `📋 ข้อมูลขอใบเสนอราคา (Preeya Business Suite)
• ผู้ติดต่อ: ${name} (โทร/LINE: ${tel})
• ระบบที่สนใจ: ${checkedLabels.join(', ') || 'ระบบธุรกิจ'}
• รูปแบบที่ต้องการ: ${model}
• ประมาณการเบื้องต้น: ${estPrice}
• รายละเอียดโจทย์: ${notes}`;

          if (navigator.clipboard) {
            navigator.clipboard.writeText(brief).then(() => {
              toast('คัดลอกสรุปโจทย์เรียบร้อยแล้ว! กำลังเปิด LINE...');
              window.open('https://line.me/R/ti/p/@486fpcll', '_blank');
            });
          } else {
            window.open('https://line.me/R/ti/p/@486fpcll', '_blank');
          }
        });

        // Quick select from pricing cards
        document.querySelectorAll('[data-set-model]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const targetModel = btn.dataset.setModel;
            const radio = formEl.querySelector(`input[name="est-model"][value="${targetModel}"]`);
            if (radio) {
              radio.checked = true;
              updateCalc();
            }
          });
        });
      }"""
code = code.replace(old_search_binding, new_search_and_estimator_binding)

with open('public/assets/app.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(code)

print("Homepage sections, Estimator form, and search enter key patched successfully")
