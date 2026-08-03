(() => {
  'use strict';

  const app = document.getElementById('app');
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const staticPages = {
    '/': 'portal',
    '/business-suite': 'crm',
    '/ecommerce-storefront': 'external-ecommerce',
    '/tilt-signal-arcade-bar': 'external-tilt',
    '/usa-thai-shipping': 'shipping-home',
    '/usa-thai-shipping/admin': 'shipping-admin',
    '/usa-thai-shipping/customer': 'shipping-customer',
    '/course': 'course',
    '/warehouse-management': 'wms',
    '/project-management': 'kanban',
    '/pos-system-smart': 'smartpos',
    '/e-signature': 'esign',
    '/dashboard-mini': 'dashboard',
    '/pos-system': 'classicpos',
  };
  const page = document.body.dataset.page || staticPages[pathname] || 'portal';
  const route = document.body.dataset.route || pathname;
  const projects = window.DEMO_PROJECTS || {};

  if (!document.body.dataset.page && page !== 'portal' && app) {
    document.body.dataset.page = page;
    document.body.dataset.route = route;

    const frame = document.createElement('div');
    frame.className = 'demo-frame';
    const shell = document.createElement('header');
    shell.className = 'demo-shell';
    const back = document.createElement('a');
    back.className = 'shell-back';
    back.href = '/';
    back.setAttribute('aria-label', 'กลับหน้า PreeyaBizSuite');
    back.textContent = '← กลับหน้า PreeyaBizSuite';
    const projectName = document.createElement('div');
    projectName.className = 'shell-project';
    const status = document.createElement('span');
    status.className = 'status-dot';
    status.setAttribute('aria-hidden', 'true');
    const title = document.createElement('strong');
    title.textContent = projects[pathname]?.title || 'PreeyaBizSuite Demo';
    const shellSpacer = document.createElement('span');
    shellSpacer.setAttribute('aria-hidden', 'true');
    projectName.append(status, title);
    shell.append(back, projectName, shellSpacer);
    app.replaceWith(frame);
    frame.append(shell, app);
    app.className = 'demo-content';
  }

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
  const money = (value, currency = 'THB') => new Intl.NumberFormat(
    currency === 'USD' ? 'en-US' : 'th-TH',
    { style: 'currency', currency, maximumFractionDigits: currency === 'USD' ? 2 : 0 }
  ).format(Number(value || 0));
  const id = (prefix = 'ID') => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
  const today = () => new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date());

  function store(name, seed) {
    const key = `preeya_php_demo_v3:${name}`;
    let data;
    try {
      data = JSON.parse(localStorage.getItem(key) || 'null');
    } catch {
      data = null;
    }
    if (!data || typeof data !== 'object') data = clone(seed);
    return {
      key,
      data,
      save() { localStorage.setItem(key, JSON.stringify(this.data)); },
      reset() { this.data = clone(seed); this.save(); },
    };
  }

  function toast(message) {
    document.querySelector('.toast')?.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    document.body.appendChild(el);
    window.setTimeout(() => el.remove(), 2600);
  }

  function modal(title, body, footer = '') {
    document.querySelector('.modal-backdrop')?.remove();
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="card-head"><h2>${esc(title)}</h2><button class="icon-btn" data-close-modal>ปิด</button></div>
      ${body}${footer}
    </section>`;
    wrap.addEventListener('click', (event) => {
      if (event.target === wrap || event.target.closest('[data-close-modal]')) wrap.remove();
    });
    document.body.appendChild(wrap);
    wrap.querySelector('input,select,textarea,button')?.focus();
    return wrap;
  }

  function tabs(items, active) {
    return `<div class="tabs">${items.map(([key, label]) =>
      `<button class="tab ${active === key ? 'active' : ''}" data-tab="${esc(key)}">${esc(label)}</button>`
    ).join('')}</div>`;
  }

  function appHeader(title, subtitle, tabItems = [], active = '', actions = '') {
    return `<header class="app-topbar">
      <div class="app-title"><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>
      <div class="app-actions">${tabItems.length ? tabs(tabItems, active) : ''}${actions}</div>
    </header>`;
  }

  function badge(text, kind = '') {
    return `<span class="badge ${kind}">${esc(text)}</span>`;
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('preeya_php_demo_v2:theme', theme);
  }

  setTheme(localStorage.getItem('preeya_php_demo_v2:theme') || 'light');

  const infoButton = document.getElementById('project-info-button');
  const info = document.getElementById('project-info');
  infoButton?.addEventListener('click', () => {
    const opening = info.hidden;
    info.hidden = !opening;
    infoButton.setAttribute('aria-expanded', String(opening));
  });
  info?.querySelector('.popover-close')?.addEventListener('click', () => {
    info.hidden = true;
    infoButton?.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      document.querySelector('.modal-backdrop')?.remove();
      if (info) info.hidden = true;
    }
  });

  function renderPortal() {
    const visible = Object.entries(projects).filter(([, p]) => p.visible);
    const featured = visible.slice(0, 3);
    const regular = visible.slice(3);
    const preview = {
      '/business-suite': '/assets/demo-previews/business-suite.png',
      '/ecommerce-storefront': '/assets/demo-previews/ecommerce-storefront.png',
      '/tilt-signal-arcade-bar': '/assets/demo-previews/tilt-signal-arcade-bar.png',
    };
    const icons = {
      teal: '◫', amber: '◈', violet: '✦', cyan: '⇄', blue: '◉',
      lime: '▦', slate: '▤', orange: '▣', emerald: '✓'
    };

    app.innerHTML = `
      <div class="portal-wrap">
        <nav class="portal-nav">
          <a class="brand" href="/">
            <span class="brand-mark">P</span>
            <span>PreeyaBizSuite<br><small class="muted">preeyabizsuite.com</small></span>
          </a>
          <div class="portal-actions">
            <a class="btn small" href="#demos">ดูเดโมทั้งหมด (${visible.length})</a>
            <a class="btn small primary" href="https://lin.ee/YjK8Ji8" target="_blank" rel="noreferrer">ปรึกษาโครงการ</a>
            <button class="btn square" id="theme-toggle" aria-label="สลับธีม">◐</button>
          </div>
        </nav>

        <section class="portal-hero" style="padding:48px 0 36px">
          <div>
            <div class="chip-row" style="margin-bottom:16px">
              <span class="chip" style="background:var(--brand);color:#05201b;font-weight:900">⚡ Interactive Demo Suite</span>
              <span class="chip">🔒 ข้อมูลบันทึกในเครื่องคุณ</span>
            </div>
            <h1 style="font-size:clamp(34px, 5.5vw, 62px);line-height:1.1;margin-bottom:16px">
              PreeyaBizSuite<br>
              <span style="color:var(--brand-2);font-weight:400">ทดลองใช้งานระบบธุรกิจจริง</span>
            </h1>
            <p class="lead" style="max-width:620px;font-size:17px;line-height:1.6;margin-bottom:24px">
              สัมผัสประสบการณ์ใช้งานระบบ CRM, E-Commerce, คอร์สออนไลน์ EduFlow, คลังสินค้า และเอกสารออนไลน์ ก่อนเริ่มพัฒนาระบบจริง
            </p>
            <div class="hero-buttons">
              <a class="btn primary" href="#featured">เริ่มทดลองเดโมยอดนิยม ▶</a>
              <a class="btn" href="https://lin.ee/YjK8Ji8" target="_blank" rel="noreferrer">ส่งโจทย์ประเมินราคาฟรี ↗</a>
            </div>
          </div>

          <div class="hero-stack">
            ${featured.map(([path, project]) => `
              <a class="hero-preview" href="${path}">
                <img src="${preview[path]}" alt="${esc(project.short)}">
                <footer><span>${esc(project.short)}</span><span>เปิดทดลอง ↗</span></footer>
              </a>
            `).join('')}
          </div>
        </section>

        <section class="portal-section" id="featured" style="padding:36px 0">
          <div class="section-head">
            <div>
              <p class="eyebrow">Interactive Highlights</p>
              <h2>4 ระบบเดโมหลักที่แนะนำให้ทดลอง</h2>
            </div>
            <p>คลิกเลือกเพื่อเข้าดู Workflow หน้าจอจริงได้ทันทีโดยไม่ต้องลงทะเบียน</p>
          </div>

          <div class="solution-grid">
            <a class="solution-card" href="/business-suite" style="border-top:4px solid #2dd4bf">
              <span class="badge warning" style="margin-bottom:8px">Sales & CRM</span>
              <h3 style="font-size:20px;margin:6px 0">Sales Flow CRM →</h3>
              <p>จัดการลูกค้า ใบเสนอราคา สัญญา และติดตาม Pipeline เพื่อปิดการขาย</p>
              <span class="btn small primary" style="margin-top:14px;width:100%">เปิดทดลอง CRM</span>
            </a>
            
            <a class="solution-card" href="/course" style="border-top:4px solid #3b82f6">
              <span class="badge success" style="margin-bottom:8px">Education</span>
              <h3 style="font-size:20px;margin:6px 0">EduFlow Course →</h3>
              <p>คอร์สออนไลน์รามเกียรติ์ (Lore Universe YouTube) พร้อมใบประกาศนียบัตร</p>
              <span class="btn small primary" style="margin-top:14px;width:100%">เปิดดูคลิปคอร์สเรียน</span>
            </a>

            <a class="solution-card" href="/ecommerce-storefront" style="border-top:4px solid #f59e0b">
              <span class="badge" style="margin-bottom:8px">E-Commerce</span>
              <h3 style="font-size:20px;margin:6px 0">OAI Apparel Store →</h3>
              <p>หน้าร้านค้าออนไลน์ แคตตาล็อกแฟชั่น สินค้า และระบบตะกร้าสินค้า</p>
              <span class="btn small primary" style="margin-top:14px;width:100%">เปิดเข้าร้านค้า</span>
            </a>

            <a class="solution-card" href="/usa-thai-shipping" style="border-top:4px solid #06b6d4">
              <span class="badge" style="margin-bottom:8px">Logistics</span>
              <h3 style="font-size:20px;margin:6px 0">Thai Shipping Suite →</h3>
              <p>ระบบจัดการพัสดุหลังบ้าน และหน้าติดตาม Timeline สำหรับลูกค้า</p>
              <span class="btn small primary" style="margin-top:14px;width:100%">ติดตามพัสดุ</span>
            </a>
          </div>
        </section>

        <section class="portal-section" id="demos" style="padding:36px 0">
          <div class="section-head">
            <div>
              <p class="eyebrow">All Modules</p>
              <h2>เดโมระบบทั้งหมดใน PreeyaBizSuite</h2>
            </div>
            <p>ทดลองใช้งาน ข้อมูลที่แก้ไขจะถูกบันทึกใน Browser เครื่องนี้โดยอัตโนมัติ</p>
          </div>

          <div class="compact-list">
            ${visible.map(([path, project], i) => `
              <a class="compact-project" href="${path}">
                <span class="project-number">${String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 style="font-size:18px;margin-bottom:4px">${esc(project.short)}</h3>
                  <span class="badge">${esc(project.category)}</span>
                </div>
                <p>${esc(project.description)}</p>
                <span class="btn small">เปิดเดโม ↗</span>
              </a>
            `).join('')}
          </div>
        </section>

        <section class="contact-panel">
          <div>
            <p class="eyebrow">Start Your Project</p>
            <h2>สนใจนำระบบไปใช้งานในธุรกิจคุณ?</h2>
            <p class="muted">ปรึกษาแนวทางออกแบบ พัฒนา หรือสั่งทำระบบธุรกิจตาม Requirement ของคุณ</p>
          </div>
          <div class="contact-links">
            <a class="contact-link" href="https://lin.ee/YjK8Ji8" target="_blank" rel="noreferrer">
              <span>LINE Official Account</span><span>เปิดคุย ↗</span>
            </a>
            <a class="contact-link" href="mailto:r.pumpo@gmail.com">
              <span>r.pumpo@gmail.com</span><span>ส่งอีเมล ↗</span>
            </a>
          </div>
        </section>

        <footer class="portal-footer">
          © ${new Date().getFullYear()} PreeyaBizSuite (preeyabizsuite.com) · Interactive Demo Platform
        </footer>
      </div>`;

    document.getElementById('theme-toggle')?.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  }

  const crmSeed = {
    view: 'overview', selected: 'D-001',
    stages: [
      ['new','ลูกค้าใหม่',25], ['qualified','คุยรายละเอียด',50], ['proposal','เสนอราคา',68],
      ['contract','เตรียมสัญญา',84], ['won','ปิดการขาย',100]
    ],
    deals: [
      {id:'D-001',company:'Siam Fresh Mart',contact:'คุณเมย์',value:185000,stage:'proposal',probability:68,owner:'Preeya C.',source:'LINE',next:'ติดตามใบเสนอราคา'},
      {id:'D-002',company:'Bangkok Clinic Group',contact:'คุณภัทร',value:260000,stage:'qualified',probability:52,owner:'Preeya C.',source:'Referral',next:'นัดเก็บ requirement'},
      {id:'D-003',company:'North Star Logistics',contact:'คุณดล',value:420000,stage:'contract',probability:82,owner:'Preeya C.',source:'Website',next:'ส่งสัญญา'},
      {id:'D-004',company:'Glow Spa Studio',contact:'คุณแอน',value:145000,stage:'new',probability:28,owner:'Preeya C.',source:'LINE',next:'โทรแนะนำบริการ'},
      {id:'D-005',company:'SkillBridge Academy',contact:'คุณนัท',value:310000,stage:'won',probability:100,owner:'Preeya C.',source:'Existing',next:'เริ่มโครงการ'},
    ],
    quotes: {},
    activities: [{deal:'D-001',text:'ส่งใบเสนอราคาเริ่มต้น',at:today()}],
  };

  function renderCrm() {
    const s = store('crm', crmSeed);
    const stageMap = Object.fromEntries(s.data.stages.map((x) => [x[0], x]));
    const current = () => s.data.deals.find((x) => x.id === s.data.selected) || s.data.deals[0];
    const saveRender = () => { s.save(); renderCrm(); };
    const top = () => appHeader('Sales Flow CRM', 'จัดการลูกค้าตั้งแต่รับข้อมูลจนปิดการขาย',
      [['overview','ภาพรวม'],['pipeline','Pipeline'],['quote','ใบเสนอราคา'],['contract','สัญญา']], s.data.view,
      `<button class="btn small" data-crm-add>+ เพิ่มลูกค้าตัวอย่าง</button><button class="btn small danger" data-crm-reset>รีเซ็ต</button>`);

    function overview() {
      const open = s.data.deals.filter((x) => x.stage !== 'won');
      const openValue = open.reduce((a,x) => a + x.value, 0);
      const weighted = open.reduce((a,x) => a + x.value * x.probability / 100, 0);
      const won = s.data.deals.filter((x) => x.stage === 'won').reduce((a,x) => a + x.value, 0);
      return `<div class="page-pad">
        <div class="grid cols-4">
          ${[['Open pipeline',money(openValue),'ดีลที่ยังไม่ปิด'],['Weighted',money(weighted),'ตาม probability'],['Won value',money(won),'ยอดปิดการขาย'],['Deals',s.data.deals.length,'รายการทั้งหมด']].map(([a,b,c]) => `<article class="card stat-card"><small>${a}</small><strong>${b}</strong><small>${c}</small></article>`).join('')}
        </div>
        <div class="grid cols-2" style="margin-top:16px">
          <section class="card"><div class="card-head"><h2>Stage summary</h2>${badge('Realtime')}</div>
            ${s.data.stages.map(([key,label]) => { const deals=s.data.deals.filter(x=>x.stage===key); return `<div class="summary-line"><span>${label}</span><strong>${deals.length} · ${money(deals.reduce((a,x)=>a+x.value,0))}</strong></div>`; }).join('')}
          </section>
          <section class="card"><div class="card-head"><h2>ดีลที่ควรตามก่อน</h2></div>
            ${[...open].sort((a,b)=>b.value-a.value).slice(0,4).map((d)=>`<button class="deal-card" style="width:100%;text-align:left" data-select-deal="${d.id}"><h4>${esc(d.company)}</h4><p>${esc(stageMap[d.stage][1])} · ${money(d.value)} · ${d.probability}%</p></button>`).join('')}
          </section>
        </div></div>`;
    }

    function pipeline() {
      return `<div class="page-pad"><div class="pipeline-wrap"><div class="pipeline">
        ${s.data.stages.map(([key,label,prob]) => `<section class="stage" data-stage="${key}">
          <div class="stage-head"><span>${label}</span>${badge(`${s.data.deals.filter(x=>x.stage===key).length} ดีล`)}</div>
          ${s.data.deals.filter((x)=>x.stage===key).map((d)=>`<article class="deal-card" draggable="true" data-deal="${d.id}">
            <h4>${esc(d.company)}</h4><p>${esc(d.contact)} · ${esc(d.next)}</p>
            <div class="summary-line"><strong>${money(d.value)}</strong><span>${d.probability}%</span></div>
            <div class="progress"><span style="width:${d.probability}%"></span></div>
          </article>`).join('')}
        </section>`).join('')}
      </div></div></div>`;
    }

    function quote() {
      const d = current();
      let q = s.data.quotes[d.id];
      if (!q) q = { status:'draft', discount:4, items:[['Discovery & UX',1,Math.round(d.value*.18)],['Development',1,Math.round(d.value*.62)],['Testing & Launch',1,Math.round(d.value*.24)]] };
      s.data.quotes[d.id] = q; s.save();
      const subtotal = q.items.reduce((a,x)=>a+x[1]*x[2],0);
      const total = subtotal * (1 - q.discount/100);
      return `<div class="page-pad split">
        <section class="card"><div class="card-head"><div><p class="eyebrow">Quote ${esc(d.id)}</p><h2>${esc(d.company)}</h2></div>${badge(q.status,q.status==='approved'?'success':'warning')}</div>
          <div class="table-wrap"><table><thead><tr><th>รายการ</th><th>จำนวน</th><th>ราคา</th><th>รวม</th></tr></thead><tbody>${q.items.map(x=>`<tr><td>${esc(x[0])}</td><td>${x[1]}</td><td>${money(x[2])}</td><td>${money(x[1]*x[2])}</td></tr>`).join('')}</tbody></table></div>
          <div style="max-width:360px;margin:16px 0 0 auto"><div class="summary-line"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="summary-line"><span>Discount ${q.discount}%</span><strong>-${money(subtotal*q.discount/100)}</strong></div><div class="summary-line total"><span>Total</span><strong>${money(total)}</strong></div></div>
          <div class="form-actions"><button class="btn" data-quote-status="sent">ส่งใบเสนอราคา</button><button class="btn primary" data-quote-status="approved">อนุมัติใบเสนอราคา</button></div>
        </section>
        <aside class="card sidebar-card"><h3>เลือกลูกค้า</h3>${s.data.deals.map(x=>`<button class="deal-card" style="width:100%;text-align:left;margin-top:8px" data-select-deal="${x.id}"><h4>${esc(x.company)}</h4><p>${money(x.value)} · ${esc(stageMap[x.stage][1])}</p></button>`).join('')}</aside>
      </div>`;
    }

    function contract() {
      const d = current();
      return `<div class="page-pad split"><section class="card"><p class="eyebrow">Contract handoff</p><h2>${esc(d.company)}</h2>
        <div class="grid cols-2"><div><p class="muted">ผู้ติดต่อ</p><strong>${esc(d.contact)}</strong></div><div><p class="muted">มูลค่า</p><strong>${money(d.value)}</strong></div><div><p class="muted">ผู้ดูแล</p><strong>${esc(d.owner)}</strong></div><div><p class="muted">Next action</p><strong>${esc(d.next)}</strong></div></div>
        <div class="notice" style="margin-top:20px">เมื่อพร้อมแล้วสามารถเปิดระบบลงนามเอกสาร และกลับมาปิดการขายได้</div>
        <div class="form-actions"><a class="btn" href="/e-signature">เปิดหน้าลงนามเอกสาร</a><button class="btn primary" data-close-deal ${d.stage==='won'?'disabled':''}>${d.stage==='won'?'ปิดการขายแล้ว':'ปิดการขาย'}</button></div>
      </section><aside class="card sidebar-card"><h3>Activity ล่าสุด</h3>${s.data.activities.filter(x=>x.deal===d.id).slice(-12).reverse().map(a=>`<div class="timeline-item"><strong>${esc(a.text)}</strong><p class="muted">${esc(a.at)}</p></div>`).join('') || '<p class="muted">ยังไม่มีกิจกรรม</p>'}</aside></div>`;
    }

    app.innerHTML = `<div class="app-shell">${top()}${({overview,pipeline,quote,contract}[s.data.view] || overview)()}</div>`;
    app.querySelectorAll('[data-tab]').forEach((el) => el.addEventListener('click', () => { s.data.view=el.dataset.tab; saveRender(); }));
    app.querySelector('[data-crm-reset]')?.addEventListener('click', () => { if(confirm('คืนข้อมูล CRM เริ่มต้น?')) {s.reset();renderCrm();} });
    app.querySelector('[data-crm-add]')?.addEventListener('click', () => {
      const next=s.data.deals.length+1; const d={id:id('D'),company:`New Demo Client ${next}`,contact:'คุณลูกค้า',value:235000,stage:'qualified',probability:50,owner:'Preeya C.',source:'Demo',next:'เก็บ requirement'};
      s.data.deals.unshift(d); s.data.selected=d.id; s.data.view='pipeline'; s.data.activities.push({deal:d.id,text:'เพิ่มลูกค้าตัวอย่าง',at:today()}); saveRender(); toast('เพิ่มลูกค้าตัวอย่างแล้ว');
    });
    app.querySelectorAll('[data-select-deal]').forEach((el)=>el.addEventListener('click',()=>{s.data.selected=el.dataset.selectDeal;s.data.view='quote';saveRender();}));
    app.querySelectorAll('[data-deal]').forEach((el)=>el.addEventListener('click',(evt)=>{
      if (evt.target.closest('[draggable]')) {
        s.data.selected = el.dataset.deal;
        s.data.view = 'quote';
        saveRender();
      }
    }));
    app.querySelectorAll('[data-quote-status]').forEach((el)=>el.addEventListener('click',()=>{
      const d=current(); const q=s.data.quotes[d.id]; q.status=el.dataset.quoteStatus;
      if(q.status==='approved'){d.stage='contract';d.probability=84;}
      s.data.activities.push({deal:d.id,text:`Quote status: ${q.status}`,at:today()});saveRender();toast('อัปเดตใบเสนอราคาแล้ว');
    }));
    app.querySelector('[data-close-deal]')?.addEventListener('click',()=>{const d=current();d.stage='won';d.probability=100;s.data.activities.push({deal:d.id,text:'ปิดการขายสำเร็จ',at:today()});saveRender();});
    let dragged='';
    app.querySelectorAll('[data-deal]').forEach((el)=>el.addEventListener('dragstart',()=>{dragged=el.dataset.deal;}));
    app.querySelectorAll('[data-stage]').forEach((el)=>{
      el.addEventListener('dragover',(e)=>e.preventDefault());
      el.addEventListener('drop',()=>{const d=s.data.deals.find(x=>x.id===dragged);const st=s.data.stages.find(x=>x[0]===el.dataset.stage);if(d&&st){d.stage=st[0];d.probability=st[2];s.data.activities.push({deal:d.id,text:`ย้ายไป ${st[1]}`,at:today()});saveRender();}});
    });
  }

    const shippingStatuses = ['รับของที่โกดัง US (Oregon)', 'กำลังเดินทางมาไทย (Flight/Vessel)', 'ถึงโกดังไทย (บางนา)', 'จัดส่งให้ลูกค้าเรียบร้อย'];

  const shippingSeed = {
    packages: [
      { id: 'PKG-801', tracking: 'US-982341102', customer: 'CUST-01', weight: 4.5, boxes: 1, method: 'Air Freight', dim: '30x20x15', cbm: 0.009, duty: 350, shippingFee: 1575, status: 1, flight: 'Flight TG-692 (Oregon -> BKK)', timeline: [{ status: 0, at: '26 ก.ค.' }, { status: 1, at: '28 ก.ค.' }] },
      { id: 'PKG-802', tracking: 'US-871239941', customer: 'CUST-01', weight: 18.2, boxes: 3, method: 'Sea Freight', dim: '60x40x50', cbm: 0.12, duty: 1200, shippingFee: 3276, status: 2, flight: 'Vessel Evergreen V.042', timeline: [{ status: 0, at: '15 ก.ค.' }, { status: 1, at: '18 ก.ค.' }, { status: 2, at: '30 ก.ค.' }] },
      { id: 'PKG-803', tracking: 'US-551029488', customer: 'CUST-02', weight: 2.1, boxes: 1, method: 'Air Freight', dim: '20x15x10', cbm: 0.003, duty: 150, shippingFee: 735, status: 0, flight: 'Flight TG-695', timeline: [{ status: 0, at: '31 ก.ค.' }] },
      { id: 'PKG-804', tracking: 'US-339102384', customer: 'CUST-03', weight: 8.0, boxes: 2, method: 'Air Freight', dim: '40x30x25', cbm: 0.03, duty: 600, shippingFee: 2800, status: 3, flight: 'Flight TG-680', timeline: [{ status: 0, at: '20 ก.ค.' }, { status: 1, at: '22 ก.ค.' }, { status: 2, at: '25 ก.ค.' }, { status: 3, at: '27 ก.ค.' }] }
    ]
  };

  function renderShippingHome() {
    app.innerHTML = `<div class="shipping-choice"><div class="choice-wrap"><p class="eyebrow">USA–THAI EXPRESS LOGISTICS</p><h1>เลือกพอร์ตัลใช้งานระบบชิปปิ้ง</h1><p class="muted">ระบบบริหารจัดการพัสดุนำเข้า USA → Thailand แบบครบวงจร คำนวณ CBM, ค่าภาษีศุลกากร และ Commercial Invoice</p><div class="choice-grid" style="margin-top:26px">
      <a class="choice-card" href="/usa-thai-shipping/admin"><span class="stat-icon">⚙</span><h2>Admin Shipping Portal</h2><p class="muted">คำนวณ CBM / Volumetric, ออก Commercial Invoice, อัปเดตพัสดุเป็นชุด</p><strong>จัดการระบบหลังบ้าน →</strong></a>
      <a class="choice-card" href="/usa-thai-shipping/customer"><span class="stat-icon">⌖</span><h2>Customer Tracking Portal</h2><p class="muted">ค้นหาพัสดุด้วย Customer ID, ดู Flight/Vessel, ยอดชำระ และสถานะเรียลไทม์</p><strong>ติดตามพัสดุลูกค้า →</strong></a>
    </div></div></div>`;
  }

  function renderShippingAdmin() {
    const s = store('shipping', shippingSeed);
    const render = () => renderShippingAdmin();
    const totalWeight = s.data.packages.reduce((a, x) => a + Number(x.weight), 0);
    const totalCbm = s.data.packages.reduce((a, x) => a + Number(x.cbm || 0), 0);
    const totalRevenue = s.data.packages.reduce((a, x) => a + Number(x.shippingFee || 0) + Number(x.duty || 0), 0);

    const views = [
      ['admin', 'รายการพัสดุ & จัดการสถานะ'],
      ['calculator', 'เครื่องคำนวณน้ำหนัก CBM / Volumetric']
    ];

    app.innerHTML = `<div class="app-shell">${appHeader('Shipping Admin Suite', 'ระบบจัดการนำเข้าสินค้า USA → Thailand (Air & Sea Freight)', [], '', `<a class="btn small" href="/usa-thai-shipping/customer">พอร์ตัลลูกค้า</a><button class="btn small primary" data-add-package>+ ลงทะเบียนพัสดุ</button><button class="btn small danger" data-reset>รีเซ็ต</button>`)}
      <div class="page-pad">
        <div class="grid cols-4">
          <article class="card stat-card"><small>พัสดุในระบบ</small><strong>${s.data.packages.length} รายการ</strong><small>กล่องรวม ${s.data.packages.reduce((a, x) => a + x.boxes, 0)} กล่อง</small></article>
          <article class="card stat-card"><small>น้ำหนักรวม (Chargeable)</small><strong>${totalWeight.toFixed(1)} kg</strong><small> Air/Sea Combined</small></article>
          <article class="card stat-card"><small>ปริมาตรรวม (CBM)</small><strong>${totalCbm.toFixed(3)} CBM</strong><small>สำหรับจัดสรรพื้นที่ตู้</small></article>
          <article class="card stat-card"><small>รายได้ค่าขนส่ง & ภาษี</small><strong>${money(totalRevenue)}</strong><small>สุทธิรอเก็บเงินลูกค้า</small></article>
        </div>

        <section class="card" style="margin-top:16px">
          <div class="card-head">
            <div>
              <p class="eyebrow">Shipment Management</p>
              <h2>รายการพัสดุทั้งหมดในคลัง (Package Inventory)</h2>
            </div>
            <button class="btn small" data-open-cbm-modal>🧮 เครื่องคำนวณ CBM ค่าขนส่ง</button>
          </div>

          <div class="table-wrap" style="margin-top:12px">
            <table>
              <thead>
                <tr>
                  <th>Tracking / Customer</th>
                  <th>ขนส่ง / Flight</th>
                  <th>น้ำหนัก & CBM</th>
                  <th>ค่าขนส่ง + ภาษี</th>
                  <th>สถานะพัสดุ</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                ${s.data.packages.map((p) => `
                  <tr>
                    <td>
                      <strong>${esc(p.tracking)}</strong><br>
                      <small class="muted">${esc(p.customer)}</small>
                    </td>
                    <td>
                      ${badge(p.method, p.method === 'Air Freight' ? 'primary' : 'warning')}<br>
                      <small class="muted" style="font-size:11px">${esc(p.flight || '-')}</small>
                    </td>
                    <td>
                      <strong>${p.weight} kg</strong> (${p.boxes} กล่อง)<br>
                      <small class="muted">ขนาด: ${esc(p.dim || '-')} (${p.cbm} CBM)</small>
                    </td>
                    <td>
                      <strong>${money((p.shippingFee || 0) + (p.duty || 0))}</strong><br>
                      <small class="muted">ค่าส่ง ${money(p.shippingFee)} | ภาษี ${money(p.duty)}</small>
                    </td>
                    <td>
                      <select class="select" data-package-status="${p.id}">
                        ${shippingStatuses.map((x, i) => `<option value="${i}" ${i === p.status ? 'selected' : ''}>${esc(x)}</option>`).join('')}
                      </select>
                    </td>
                    <td>
                      <div style="display:flex;gap:6px">
                        <button class="btn small" data-invoice="${p.id}">🧾 ใบแจ้งหนี้ Invoice</button>
                        <button class="btn small" data-line="${p.customer}">📱 ส่ง LINE</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>`;

    app.querySelector('[data-reset]')?.addEventListener('click', () => { if (confirm('คืนข้อมูลพัสดุเริ่มต้น?')) { s.reset(); render(); } });

    // Open CBM Calculator Modal
    app.querySelector('[data-open-cbm-modal]')?.addEventListener('click', () => {
      const wrap = modal('เครื่องคำนวณค่าขนส่ง CBM & Volumetric Weight', `
        <form id="cbm-calc-form" class="form-grid">
          <div class="field"><label>กว้าง (Width - cm)</label><input class="input" type="number" id="cbm-w" value="30" required></div>
          <div class="field"><label>ยาว (Length - cm)</label><input class="input" type="number" id="cbm-l" value="40" required></div>
          <div class="field"><label>สูง (Height - cm)</label><input class="input" type="number" id="cbm-h" value="25" required></div>
          <div class="field"><label>น้ำหนักจริง (Actual Wt. kg)</label><input class="input" type="number" id="cbm-wt" value="5.0" step="0.1" required></div>

          <div style="grid-column:1/-1;background:var(--subtle);padding:14px;border-radius:10px" id="cbm-result">
            <div style="display:flex;justify-content:space-between"><span>ปริมาตร (CBM):</span><strong id="res-cbm">0.030 CBM</strong></div>
            <div style="display:flex;justify-content:space-between"><span>น้ำหนักทางอากาศ (Air Volumetric /5000):</span><strong id="res-air-wt">6.0 kg</strong></div>
            <div style="display:flex;justify-content:space-between"><span>ประเมินค่าส่งทางเรือ (Sea Freight):</span><strong id="res-sea-fee">1,080 บาท</strong></div>
            <div style="display:flex;justify-content:space-between;color:var(--brand);font-weight:bold;margin-top:4px"><span>ประเมินค่าส่งทางอากาศ (Air Freight):</span><strong id="res-air-fee">2,100 บาท</strong></div>
          </div>
        </form>
      `);

      const calc = () => {
        const w = Number(wrap.querySelector('#cbm-w').value) || 0;
        const l = Number(wrap.querySelector('#cbm-l').value) || 0;
        const h = Number(wrap.querySelector('#cbm-h').value) || 0;
        const wt = Number(wrap.querySelector('#cbm-wt').value) || 0;

        const cbm = (w * l * h) / 1000000;
        const airVolWt = Math.max(wt, (w * l * h) / 5000);
        const seaFee = Math.max(wt * 180, cbm * 8500);
        const airFee = airVolWt * 350;

        wrap.querySelector('#res-cbm').innerText = cbm.toFixed(3) + ' CBM';
        wrap.querySelector('#res-air-wt').innerText = airVolWt.toFixed(1) + ' kg';
        wrap.querySelector('#res-sea-fee').innerText = money(seaFee);
        wrap.querySelector('#res-air-fee').innerText = money(airFee);
      };

      ['#cbm-w', '#cbm-l', '#cbm-h', '#cbm-wt'].forEach(id => wrap.querySelector(id)?.addEventListener('input', calc));
    });

    // Add Package Modal
    app.querySelector('[data-add-package]')?.addEventListener('click', () => {
      const wrap = modal('ลงทะเบียนพัสดุนำเข้าใหม่ (New Package)', `
        <form id="package-form" class="form-grid">
          <div class="field"><label>Tracking No. (US)</label><input class="input" name="tracking" placeholder="เช่น US-991203841"></div>
          <div class="field"><label>Customer ID</label><input class="input" name="customer" value="CUST-01" required></div>
          <div class="field"><label>ประเภทการขนส่ง</label><select class="select" name="method"><option value="Air Freight">ทางเครื่องบิน (Air Freight - 350฿/kg)</option><option value="Sea Freight">ทางเรือ (Sea Freight - 180฿/kg)</option></select></div>
          <div class="field"><label>เที่ยวบิน / เที่ยวเรือ</label><input class="input" name="flight" value="Flight TG-692 (Oregon -> BKK)"></div>
          <div class="field"><label>น้ำหนักชั่งจริง (kg)</label><input class="input" type="number" step="0.1" name="weight" value="3.5" required></div>
          <div class="field"><label>ขนาด กว้างxยาวxสูง (cm)</label><input class="input" name="dim" value="30x20x15" required></div>
          <div class="field"><label>ประมาณการภาษีศุลกากร (บาท)</label><input class="input" type="number" name="duty" value="250" required></div>
          <div class="form-actions" style="grid-column:1/-1"><button class="btn primary">บันทึกพัสดุ</button></div>
        </form>
      `);

      wrap.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const tracking = String(f.get('tracking') || `US-${Math.floor(100000000 + Math.random() * 900000000)}`).trim().toUpperCase();
        const customer = String(f.get('customer') || '').trim().toUpperCase();
        const method = String(f.get('method'));
        const weight = Number(f.get('weight')) || 1;
        const dim = String(f.get('dim'));
        const duty = Number(f.get('duty')) || 0;
        const flight = String(f.get('flight'));

        const dims = dim.split('x').map(Number);
        const cbm = dims.length === 3 ? (dims[0] * dims[1] * dims[2]) / 1000000 : 0.01;
        const rate = method === 'Air Freight' ? 350 : 180;
        const shippingFee = Math.round(weight * rate);

        s.data.packages.unshift({
          id: id('PKG'),
          tracking,
          customer,
          method,
          weight,
          boxes: 1,
          dim,
          cbm: Number(cbm.toFixed(3)),
          duty,
          shippingFee,
          flight,
          status: 0,
          timeline: [{ status: 0, at: today() }]
        });
        save();
        wrap.remove();
        render();
        toast('ลงทะเบียนพัสดุเข้าคลัง USA เรียบร้อย');
      });
    });

    // Package status updater
    app.querySelectorAll('[data-package-status]').forEach((el) => el.addEventListener('change', () => {
      const p = s.data.packages.find(x => x.id === el.dataset.packageStatus);
      const st = Number(el.value);
      if (p && p.status !== st) {
        p.status = st;
        for (let i = 0; i <= st; i++) {
          if (!p.timeline.some(x => x.status === i)) {
            p.timeline.push({ status: i, at: today() });
          }
        }
        save();
        render();
        toast(`อัปเดตสถานะ ${p.tracking} เป็น ${shippingStatuses[st]}`);
      }
    }));

    // Invoice Modal
    app.querySelectorAll('[data-invoice]').forEach((el) => el.addEventListener('click', () => {
      const p = s.data.packages.find(x => x.id === el.dataset.invoice);
      if (!p) return;

      modal('ใบแจ้งหนี้ค่าขนส่งนำเข้า (Commercial Shipping Invoice)', `
        <div class="receipt-slip" style="background:#fff;color:#111;padding:24px;border-radius:12px;font-family:sans-serif;max-width:440px;margin:auto;border:1px solid #ddd">
          <div style="text-align:center;border-bottom:2px solid #333;padding-bottom:12px;margin-bottom:12px">
            <h2 style="margin:0;font-size:22px;color:var(--brand)">Preeya Express Logistics</h2>
            <p style="margin:4px 0;font-size:12px">USA-Thailand Freight Forwarder & Customs Clearance</p>
            <p style="margin:0;font-size:12px">Invoice No: INV-${p.tracking} · Date: ${today()}</p>
          </div>

          <div style="margin-bottom:14px;font-size:13px;line-height:1.6">
            <div><strong>ลูกค้า:</strong> ${esc(p.customer)}</div>
            <div><strong>Tracking ID:</strong> ${esc(p.tracking)}</div>
            <div><strong>รูปแบบขนส่ง:</strong> ${esc(p.method)} (${esc(p.flight || '-')})</div>
            <div><strong>น้ำหนักคิดเงิน:</strong> ${p.weight} kg (ขนาด ${esc(p.dim || '-')} / ${p.cbm} CBM)</div>
          </div>

          <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:14px">
            <thead>
              <tr style="border-bottom:1px solid #ccc;text-align:left">
                <th style="padding:6px 0">รายการ</th>
                <th style="text-align:right">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding:6px 0">ค่าขนส่ง (${p.method})</td><td style="text-align:right">${money(p.shippingFee)}</td></tr>
              <tr><td style="padding:6px 0">ค่าธรรมเนียมภาษีศุลกากร (Estimated Duty)</td><td style="text-align:right">${money(p.duty)}</td></tr>
              <tr style="border-top:2px solid #333;font-weight:bold"><td style="padding:8px 0">ยอดชำระสุทธิ (Total Due)</td><td style="text-align:right;font-size:16px">${money((p.shippingFee || 0) + (p.duty || 0))}</td></tr>
            </tbody>
          </table>

          <div style="text-align:center;font-size:11px;color:#666">
            กรุณาชำระเงินผ่าน QR PromptPay เพื่อปล่อยสินค้าออกจากโกดังไทย
          </div>
        </div>
      `, `<div class="form-actions"><button class="btn primary" onclick="window.print()">🖨️ พิมพ์ Commercial Invoice</button></div>`);
    }));

    // LINE Notification Modal
    app.querySelectorAll('[data-line]').forEach((el) => el.addEventListener('click', () => {
      const list = s.data.packages.filter(x => x.customer === el.dataset.line);
      const text = `[Preeya Shipping Notify]
เรียนคุณ ${el.dataset.line}
พัสดุนำเข้าจาก USA รวม ${list.length} รายการ:

${list.map(x => `📦 ${x.tracking} (${x.method})
สถานะ: ${shippingStatuses[x.status]}
ยอดชำระ: ${money((x.shippingFee || 0) + (x.duty || 0))}`).join('\n---\n')}

ตรวจสอบรายละเอียดเพิ่มเติมได้ที่: https://preeyabizsuite.vercel.app/usa-thai-shipping/customer`;
      modal('ข้อความแจ้งเตือนผ่าน LINE Notify (ตัวอย่าง)', `<textarea class="textarea" style="min-height:180px;font-family:monospace">${esc(text)}</textarea><p class="muted">สามารถคัดลอกข้อความนี้ส่งเข้า LINE ของลูกค้าได้ทันที</p>`);
    }));
  }

  function renderShippingCustomer() {
    const s = store('shipping', shippingSeed);
    let query = 'CUST-01';

    const draw = () => {
      const list = s.data.packages.filter((x) => x.customer === query.trim().toUpperCase());
      app.innerHTML = `<div class="app-shell">${appHeader('Customer Tracking Portal', 'ติดตามพัสดุนำเข้า USA → Thailand ด้วย Customer ID', [], '', `<a class="btn small" href="/usa-thai-shipping/admin">Admin Portal</a>`)}
      <div class="page-pad">
        <div class="card">
          <form id="track-form" class="toolbar">
            <div class="field" style="flex:1">
              <label>กรอก Customer ID ของคุณ</label>
              <input class="input" name="customer" value="${esc(query)}" placeholder="เช่น CUST-01">
            </div>
            <button class="btn primary">🔍 ค้นหาพัสดุ</button>
          </form>
          <div class="chip-row" style="margin-top:10px">
            <span class="muted" style="font-size:12px">ตัวอย่างรหัสลูกค้า:</span>
            <button class="chip" data-mock-id="CUST-01">CUST-01 (2 พัสดุ)</button>
            <button class="chip" data-mock-id="CUST-02">CUST-02 (1 พัสดุ)</button>
            <button class="chip" data-mock-id="CUST-03">CUST-03 (1 พัสดุ)</button>
          </div>
        </div>

        <div style="margin-top:16px">
          ${list.length ? `<div class="grid cols-2">${list.map((p) => `<article class="card">
            <div class="card-head">
              <div>
                <p class="eyebrow">${esc(p.customer)} · ${esc(p.method)}</p>
                <h2 style="margin:4px 0">${esc(p.tracking)}</h2>
                <small class="muted">✈️ เที่ยวบิน/เรือ: ${esc(p.flight || '-')}</small>
              </div>
              <span style="font-size:38px">${p.method === 'Air Freight' ? '✈️' : '🚢'}</span>
            </div>

            <div style="background:var(--subtle);padding:12px;border-radius:8px;margin:12px 0">
              <div class="summary-line"><span>น้ำหนักชั่งจริง</span><strong>${p.weight} kg</strong></div>
              <div class="summary-line"><span>ขนาด & ปริมาตร</span><strong>${esc(p.dim || '-')} (${p.cbm} CBM)</strong></div>
              <div class="summary-line total" style="margin-top:6px;padding-top:6px;border-top:1px dashed var(--line)">
                <span>ยอดค่าขนส่ง + ภาษี</span><strong>${money((p.shippingFee || 0) + (p.duty || 0))}</strong>
              </div>
            </div>

            <h3 style="margin-top:14px">Timeline สถานะจัดส่ง</h3>
            <div class="timeline" style="margin-top:10px">
              ${shippingStatuses.map((status, i) => `<div class="timeline-item ${i < p.status ? 'done' : i === p.status ? 'current' : ''}">
                <strong>${esc(status)}</strong>
                <p class="muted">${esc(p.timeline.find(x => x.status === i)?.at || 'รอดำเนินการ')}</p>
              </div>`).join('')}
            </div>
          </article>`).join('')}</div>` : `<div class="empty"><div><h2>ไม่พบพัสดุในระบบ</h2><p>โปรดตรวจสอบ Customer ID หรือติดต่อแอดมิน</p></div></div>`}
        </div>
      </div></div>`;

      app.querySelector('#track-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        query = String(new FormData(e.currentTarget).get('customer') || '').toUpperCase();
        draw();
      });
      app.querySelectorAll('[data-mock-id]').forEach((el) => el.addEventListener('click', () => {
        query = el.dataset.mockId;
        draw();
      }));
    };
    draw();
  }

  const courseSeed = {
    role: 'student', view: 'home', cart: [], orders: [],
    owned: ['C-116', 'C-115', 'C-114', 'C-113', 'C-112', 'C-111', 'C-110', 'C-108', 'C-201'],
    progress: {}, selected: 'C-116', selectedLesson: 0, search: '', category: 'All',
    courses: [
      {
        id: 'C-116', title: 'รามเกียรติ์ EP.16 : ตอน ศึกทรพี | The Battle of Monkey King', price: 990, category: 'วรรณคดีไทย / ตำนาน', channel: 'Lore Universe',
        thumbnail: 'https://img.youtube.com/vi/eyoIidiahyo/hqdefault.jpg',
        description: 'การต่อสู้ระหว่างพาลีกับควายทรพีในถ้ำ การเข้าใจผิดของสุครีพ และปฐมบทศึกแห่งพญาวานร',
        lessons: [
          { title: 'บทที่ 1: ศึกทรพีปะทะพาลีในถ้ำ (คลิปจริงจาก Lore Universe)', youtubeId: 'eyoIidiahyo', duration: '18:24', summary: 'รับชมวิดีโอฉบับเต็มศึกทรพีจากช่อง Lore Universe' }
        ]
      },
      {
        id: 'C-115', title: 'รามเกียรติ์ EP.15 : ตอน ศึกรามสูร | The Battle of Thunder Yaksha', price: 890, category: 'วรรณคดีไทย / ตำนาน', channel: 'Lore Universe',
        thumbnail: 'https://img.youtube.com/vi/-iwoWmormk8/hqdefault.jpg',
        description: 'ศึกอสูรรามสูรผู้ถือขวานเพชรไล่ล่าดวงแก้วมณีของนางเมขลาและอภินิหารฟ้าผ่า',
        lessons: [
          { title: 'บทที่ 1: ศึกรามสูรขว้างขวานเพชร (คลิปจริงจาก Lore Universe)', youtubeId: '-iwoWmormk8', duration: '16:45', summary: 'รับชมวิดีโอฉบับเต็มศึกรามสูรจากช่อง Lore Universe' }
        ]
      },
      {
        id: 'C-114', title: 'รามเกียรติ์ EP.14 : ตอน ศึกประลองยกคันศรมหาโลหะโมลี', price: 950, category: 'วรรณคดีไทย / ตำนาน', channel: 'Lore Universe',
        thumbnail: 'https://img.youtube.com/vi/NZk5j9HbtGM/hqdefault.jpg',
        description: 'พิธีเสี่ยงทายยกคันศรมหาโลหะโมลี ณ เมืองมิถิลา และการพบกันครั้งแรกของพระรามและนางสีดา',
        lessons: [
          { title: 'บทที่ 1: พระรามยกคันศรชิงนางสีดา (คลิปจริงจาก Lore Universe)', youtubeId: 'NZk5j9HbtGM', duration: '20:10', summary: 'รับชมวิดีโอฉบับเต็มยกคันศรจากช่อง Lore Universe' }
        ]
      },
      {
        id: 'C-113', title: 'รามเกียรติ์ EP.13 : ตอน ศึกกากนาสูร | The Battle of Gaknasura', price: 950, category: 'วรรณคดีไทย / ตำนาน', channel: 'Lore Universe',
        thumbnail: 'https://img.youtube.com/vi/Eq84d0GHo1c/hqdefault.jpg',
        description: 'พระรามและพระลักษมณ์ออกปราบกาใหญ่กากนาสูรผู้มาก่อกวนพิธีหุงข้าวทิพย์ของพระฤาษี',
        lessons: [
          { title: 'บทที่ 1: ศึกกากนาสูรและศรพรหมมาสตร์ (คลิปจริงจาก Lore Universe)', youtubeId: 'Eq84d0GHo1c', duration: '17:35', summary: 'รับชมวิดีโอฉบับเต็มศึกกากนาสูรจากช่อง Lore Universe' }
        ]
      },
      {
        id: 'C-112', title: 'รามเกียรติ์ EP.12 : ตอน คำสาปแห่งลงกา! เมื่อทศกัณฐ์ทิ้งลูก', price: 920, category: 'วรรณคดีไทย / ตำนาน', channel: 'Lore Universe',
        thumbnail: 'https://img.youtube.com/vi/xiHQQGosHbo/hqdefault.jpg',
        description: 'กำเนิดนางสีดา ชะตากรรมลูกทศกัณฐ์ที่ถูกนำไปลอยน้ำ และคำสาปที่จะนำความพินาศมาสู่กรุงลงกา',
        lessons: [
          { title: 'บทที่ 1: กำเนิดนางสีดาและลอยแพลอยน้ำ (คลิปจริงจาก Lore Universe)', youtubeId: 'xiHQQGosHbo', duration: '19:15', summary: 'รับชมวิดีโอฉบับเต็มคำสาปลงกาจากช่อง Lore Universe' }
        ]
      },
      {
        id: 'C-111', title: 'รามเกียรติ์ EP.11 : ตอน มหาเทพจุติ | The incarnation of Narayana', price: 990, category: 'วรรณคดีไทย / ตำนาน', channel: 'Lore Universe',
        thumbnail: 'https://img.youtube.com/vi/K4T9ZDzJsss/hqdefault.jpg',
        description: 'การอวตารของพระนารายณ์ลงมาเกิดเป็นพระราม บุตรท้าวทศรถแห่งกรุงอโยธยา',
        lessons: [
          { title: 'บทที่ 1: มหาเทพนารายณ์อวตาร (คลิปจริงจาก Lore Universe)', youtubeId: 'K4T9ZDzJsss', duration: '21:05', summary: 'รับชมวิดีโอฉบับเต็มมหาเทพจุติตามตำนานจากช่อง Lore Universe' }
        ]
      },
      {
        id: 'C-110', title: 'รามเกียรติ์ EP.10 : ตอน ศึกปฑูตทันต์ถล่มสวรรค์', price: 880, category: 'วรรณคดีไทย / ตำนาน', channel: 'Lore Universe',
        thumbnail: 'https://img.youtube.com/vi/V6ba51ybrAA/hqdefault.jpg',
        description: 'การบุกสวรรค์ของเหล่ายักษ์และการต่อสู้กับเทวดา',
        lessons: [
          { title: 'บทที่ 1: ศึกปฑูตทันต์ (คลิปจริงจาก Lore Universe)', youtubeId: 'V6ba51ybrAA', duration: '15:40', summary: 'รับชมวิดีโอฉบับเต็มศึกปฑูตทันต์จากช่อง Lore Universe' }
        ]
      },
      {
        id: 'C-108', title: 'รามเกียรติ์ EP.8 : ตอน กำเนิดทรพาและไมยราพ (ถอดดวงใจ)', price: 990, category: 'วรรณคดีไทย / ตำนาน', channel: 'Lore Universe',
        thumbnail: 'https://img.youtube.com/vi/Lz8lZAyUXq0/hqdefault.jpg',
        description: 'กำเนิดทรพาผู้พิฆาตพ่อ และไมยราพเจ้าแห่งเมืองบาดาลผู้มีอิทธิฤทธิ์ถอดดวงใจ',
        lessons: [
          { title: 'บทที่ 1: กำเนิดทรพาและพิธีถอดดวงใจไมยราพ (คลิปจริงจาก Lore Universe)', youtubeId: 'Lz8lZAyUXq0', duration: '22:15', summary: 'รับชมวิดีโอฉบับเต็มจากช่อง Lore Universe' }
        ]
      },
      {
        id: 'C-201', title: 'Full-stack Web Development with React 18', price: 4500, category: 'Technology', channel: 'Tech Academy',
        thumbnail: '',
        description: 'เรียนรู้การพัฒนาเว็บแอปพลิเคชันแบบจัดเต็มด้วย React 18, Node.js และ State Management',
        lessons: [
          { title: 'Introduction to React 18 & Vite', duration: '25:00', summary: 'การสร้างโปรเจกต์และส่วนประกอบพื้นฐาน' },
          { title: 'State Management with Redux Toolkit', duration: '35:40', summary: 'จัดการ Global state ในแอปพลิเคชันขนาดใหญ่' }
        ]
      }
    ]
  };

  function renderCourse() {
    const s = store('course', courseSeed);
    const save = () => { s.save(); renderCourse(); };
    const nav = [
      ['home', 'คอร์สเรียน'],
      ['cart', `ตะกร้า (${s.data.cart.length})`],
      ['profile', 'โปรไฟล์ & คำสั่งซื้อ'],
      ...(s.data.role === 'admin' ? [['admin', 'Admin Hub']] : [])
    ];
    const actions = `<select class="select" id="course-role" style="width:auto">
      <option value="student" ${s.data.role === 'student' ? 'selected' : ''}>Standard Student</option>
      <option value="admin" ${s.data.role === 'admin' ? 'selected' : ''}>System Administrator</option>
    </select><button class="btn small danger" data-course-reset>รีเซ็ต</button>`;
    
    let body = '';

    if (s.data.view === 'home') {
      const categories = ['All', 'วรรณคดีไทย / ตำนาน', 'Technology'];
      const filtered = s.data.courses.filter(c => {
        const matchCat = s.data.category === 'All' || c.category === s.data.category;
        const matchSearch = `${c.title} ${c.description} ${c.category}`.toLowerCase().includes((s.data.search || '').toLowerCase());
        return matchCat && matchSearch;
      });

      body = `<div class="page-pad">
        <div class="section-head">
          <div><p class="eyebrow">EduFlow Online Courses</p><h2>คอร์สออนไลน์รามเกียรติ์ & เทคโนโลยี</h2></div>
          <p>เรียนรู้วรรณคดีไทยรามเกียรติ์แบบจัดเต็มจากคลิป YouTube ของ @LoreUniverse พร้อมระบบจำลองคำสั่งซื้อและออกใบประกาศนียบัตร</p>
        </div>
        
        <div class="toolbar card" style="margin-bottom:20px;padding:14px">
          <div class="tabs" style="margin:0">
            ${categories.map(cat => `<button class="tab ${s.data.category === cat ? 'active' : ''}" data-course-cat="${esc(cat)}">${esc(cat)}</button>`).join('')}
          </div>
          <input class="input" id="course-search-input" style="max-width:320px" placeholder="ค้นหาคอร์สหรือหมวดหมู่..." value="${esc(s.data.search)}">
        </div>

        <div class="course-grid">
          ${filtered.map((c, i) => {
            const owned = true; // All demo courses unlocked
            const totalDuration = (c.lessons || []).reduce((acc, l) => acc + (l.duration ? parseInt(l.duration) || 10 : 10), 0);
            return `<article class="course-card">
              ${c.thumbnail ? `<div class="course-art-thumb" data-course-action="learn" data-course="${c.id}" style="cursor:pointer" title="คลิกเพื่อเข้าเรียนดูคลิปวิดีโอ"><img src="${esc(c.thumbnail)}" alt="${esc(c.title)}"><span class="play-badge">▶</span></div>` : `<div class="course-art" data-course-action="learn" data-course="${c.id}" style="cursor:pointer">${i + 1}</div>`}
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
                <span class="badge success">${esc(c.category)}</span>
                <small class="muted">โดย ${esc(c.channel || 'Lore Universe')}</small>
              </div>
              <h3 style="margin:10px 0 6px;font-size:17px;line-height:1.4">${esc(c.title)}</h3>
              <p class="muted" style="font-size:13px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(c.description)}</p>
              <div class="chip-row" style="margin-top:8px">
                <span class="chip">📚 ${c.lessons.length} บทเรียน</span>
                <span class="chip">⏱ ~${totalDuration} นาที</span>
              </div>
              <div class="summary-line" style="margin-top:auto;padding-top:14px">
                <strong style="font-size:20px">${money(c.price)}</strong>
                ${badge('เข้าเรียนได้ทันที', 'success')}
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">
                <button class="btn small" data-course-preview="${c.id}">ดูตัวอย่าง</button>
                <button class="btn small primary" data-course-action="learn" data-course="${c.id}">
                  เริ่มเรียน ▶
                </button>
              </div>
            </article>`;
          }).join('')}
        </div>
      </div>`;
    } else if (s.data.view === 'cart') {
      const items = s.data.courses.filter(x => s.data.cart.includes(x.id));
      body = `<div class="page-pad split"><section class="card"><div class="card-head"><h2>ตะกร้าคอร์สเรียน</h2>${badge(`${items.length} รายการ`)}</div>${items.length ? items.map(c => `<div class="cart-line"><div><strong>${esc(c.title)}</strong><p class="muted">${esc(c.category)} · ${c.lessons.length} บทเรียน</p></div><div><strong>${money(c.price)}</strong><button class="btn small danger" style="margin-left:8px" data-remove-course="${c.id}">ลบ</button></div></div>`).join('') : '<div class="empty">ยังไม่มีคอร์สในตะกร้า</div>'}</section><aside class="card sidebar-card"><h3>สรุปคำสั่งซื้อ</h3><div class="summary-line total"><span>ยอดรวมทั้งสิ้น</span><strong>${money(items.reduce((a, x) => a + x.price, 0))}</strong></div><button class="btn primary" style="width:100%;margin-top:16px" data-course-checkout ${items.length ? '' : 'disabled'}>สั่งซื้อคอร์สเรียน (Process Transaction)</button><p class="muted" style="margin-top:10px;font-size:12px">คำสั่งซื้อจะถูกส่งไปให้ Admin อนุมัติการเข้าเรียน (หรือคลิกสลับ Role เป็น Admin เพื่ออนุมัติทันที)</p></aside></div>`;
    } else if (s.data.view === 'admin') {
      body = `<div class="page-pad">
        <div class="grid cols-3">
          <article class="card stat-card"><small>Pending orders</small><strong>${s.data.orders.filter(x => x.status === 'pending').length}</strong></article>
          <article class="card stat-card"><small>Total courses</small><strong>${s.data.courses.length}</strong></article>
          <article class="card stat-card"><small>Approved orders</small><strong>${s.data.orders.filter(x => x.status === 'approved').length}</strong></article>
        </div>
        <section class="card" style="margin-top:16px">
          <div class="card-head"><h2>จัดการคำสั่งซื้อคอร์สเรียน</h2><button class="btn small primary" data-admin-add-course>+ เพิ่มคอร์สเรียนใหม่</button></div>
          <div class="table-wrap"><table><thead><tr><th>Order ID</th><th>คอร์สที่สั่งซื้อ</th><th>วันที่</th><th>Status</th><th>การอนุมัติ</th></tr></thead><tbody>${s.data.orders.map(o => `<tr><td><code>${esc(o.id)}</code></td><td>${o.items.map(i => esc(s.data.courses.find(c => c.id === i)?.title || i)).join('<br>')}</td><td>${esc(o.date)}</td><td>${badge(o.status, o.status === 'approved' ? 'success' : 'warning')}</td><td><button class="btn small primary" data-approve-order="${o.id}" ${o.status === 'approved' ? 'disabled' : ''}>${o.status === 'approved' ? 'อนุมัติแล้ว ✓' : 'อนุมัติสิทธิ์เข้าเรียน'}</button></td></tr>`).join('') || '<tr><td colspan="5" class="muted">ยังไม่มีคำสั่งซื้อในระบบ</td></tr>'}</tbody></table></div>
        </section>
      </div>`;
    } else if (s.data.view === 'learning') {
      const c = s.data.courses.find(x => x.id === s.data.selected) || s.data.courses[0];
      const lessons = c.lessons || [];
      const activeIdx = Math.min(s.data.selectedLesson || 0, Math.max(0, lessons.length - 1));
      const currentLesson = lessons[activeIdx] || { title: 'บทเรียนทั่วไป', duration: '10:00', summary: '' };
      const done = s.data.progress[c.id] || [];
      const percent = lessons.length > 0 ? Math.round((done.length / lessons.length) * 100) : 0;
      const isCompleted = percent === 100;

      body = `<div class="page-pad split">
        <section class="card">
          <div class="card-head">
            <div><p class="eyebrow">${esc(c.category)} · โดย ${esc(c.channel || 'Lore Universe')}</p><h2 style="font-size:22px">${esc(c.title)}</h2></div>
            ${badge(`${percent}% สำเร็จ`, isCompleted ? 'success' : 'warning')}
          </div>
          
          <div class="progress" style="height:10px;margin-bottom:16px"><span style="width:${percent}%"></span></div>

          <div class="video-player-container">
            ${currentLesson.youtubeId ? `
              <iframe class="youtube-player" src="https://www.youtube-nocookie.com/embed/${esc(currentLesson.youtubeId)}?rel=0" title="${esc(currentLesson.title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            ` : `
              <div class="video-fallback">
                <div style="font-size:48px">▶</div>
                <p>วิดีโอสาธิตระบบสำหรับบทเรียนนี้ (${esc(currentLesson.duration || '10:00')})</p>
              </div>
            `}
          </div>

          <div style="margin-top:18px;padding:16px;background:var(--panel-2);border-radius:14px">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
              <div>
                <h3>บทที่ ${activeIdx + 1}: ${esc(currentLesson.title)}</h3>
                <small class="muted">⏱ ระยะเวลา ${esc(currentLesson.duration || '10:00')}</small>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                ${currentLesson.youtubeId ? `<a class="btn small" href="https://www.youtube.com/watch?v=${esc(currentLesson.youtubeId)}" target="_blank" rel="noreferrer">เปิดดูบน YouTube ↗</a>` : ''}
                <button class="btn small ${done.includes(activeIdx) ? 'primary' : ''}" data-toggle-lesson="${activeIdx}">
                  ${done.includes(activeIdx) ? 'เรียนแล้ว ✓' : 'ทำเครื่องหมายว่าสำเร็จ'}
                </button>
              </div>
            </div>
            <p class="muted" style="margin-top:10px;font-size:14px;line-height:1.6">${esc(currentLesson.summary || c.description)}</p>
          </div>
        </section>

        <aside class="card sidebar-card">
          <div class="card-head">
            <h3>รายการบทเรียน (${lessons.length})</h3>
            <button class="btn small" data-course-home>← กลับสารบัญ</button>
          </div>
          
          <div class="lesson-list">
            ${lessons.map((l, i) => `
              <div class="lesson ${activeIdx === i ? 'active-lesson' : ''}" data-select-lesson="${i}" style="cursor:pointer;margin-bottom:8px">
                <div style="flex:1">
                  <strong>${i + 1}. ${esc(l.title)}</strong>
                  <p class="muted" style="font-size:12px;margin:2px 0 0">⏱ ${esc(l.duration || '10:00')}</p>
                </div>
                ${done.includes(i) ? '<span class="badge success">✓</span>' : '<span class="badge">▶</span>'}
              </div>
            `).join('')}
          </div>

          ${isCompleted ? `
            <div class="notice success" style="margin-top:16px;text-align:center">
              <strong style="color:var(--success);display:block;margin-bottom:6px">🎉 คุณเรียนจบหลักสูตรนี้แล้ว!</strong>
              <button class="btn primary small" style="width:100%" data-certificate="${c.id}">ดูใบประกาศนียบัตร 📜</button>
            </div>
          ` : ''}
        </aside>
      </div>`;
    } else {
      const pending = s.data.orders.filter(x => x.status === 'pending').length;
      body = `<div class="page-pad">
        <div class="grid cols-3">
          <article class="card stat-card"><small>Owned courses</small><strong>${s.data.courses.length}</strong></article>
          <article class="card stat-card"><small>Pending orders</small><strong>${pending}</strong></article>
          <article class="card stat-card"><small>Role</small><strong style="font-size:22px">${esc(s.data.role)}</strong></article>
        </div>
        <section class="card" style="margin-top:16px">
          <h2>คอร์สเรียนของฉัน</h2>
          <div class="course-grid" style="margin-top:14px">
            ${s.data.courses.map(c => {
              const done = s.data.progress[c.id] || [];
              const percent = c.lessons.length > 0 ? Math.round((done.length / c.lessons.length) * 100) : 0;
              return `<article class="course-card">
                <h3>${esc(c.title)}</h3>
                <p class="muted">${c.lessons.length} บทเรียน · ${percent}% สำเร็จ</p>
                <div class="progress" style="margin:10px 0"><span style="width:${percent}%"></span></div>
                <button class="btn primary small" data-course-action="learn" data-course="${c.id}">เข้าเรียนต่อ ▶</button>
              </article>`;
            }).join('')}
          </div>
        </section>
        <section class="card" style="margin-top:16px">
          <h2>ประวัติคำสั่งซื้อของฉัน</h2>
          ${s.data.orders.map(o => `<div class="summary-line"><span>${esc(o.id)} · ${esc(o.date)} (${o.items.length} รายการ)</span>${badge(o.status, o.status === 'approved' ? 'success' : 'warning')}</div>`).join('') || '<p class="muted">ยังไม่มีประวัติคำสั่งซื้อ</p>'}
        </section>
      </div>`;
    }

    app.innerHTML = `<div class="app-shell">${appHeader('EduFlow Platform', 'คอร์สออนไลน์วรรณคดีไทยรามเกียรติ์ (Lore Universe YouTube)', nav, s.data.view, actions)}${body}</div>`;

    // Event Listeners
    app.querySelectorAll('[data-tab]').forEach(el => el.addEventListener('click', () => { s.data.view = el.dataset.tab; save(); }));
    app.querySelector('#course-role')?.addEventListener('change', (e) => { s.data.role = e.target.value; s.data.view = e.target.value === 'admin' ? 'admin' : 'home'; save(); });
    app.querySelector('[data-course-reset]')?.addEventListener('click', () => { if (confirm('คืนข้อมูลคอร์สเริ่มต้น?')) { s.reset(); renderCourse(); } });
    
    app.querySelectorAll('[data-course-cat]').forEach(el => el.addEventListener('click', () => { s.data.category = el.dataset.courseCat; save(); }));
    app.querySelector('#course-search-input')?.addEventListener('input', (e) => { s.data.search = e.target.value; s.save(); renderCourse(); document.querySelector('#course-search-input')?.focus(); });

    app.querySelectorAll('[data-course-preview]').forEach(el => el.addEventListener('click', () => {
      const c = s.data.courses.find(x => x.id === el.dataset.coursePreview);
      if (!c) return;
      modal(`ตัวอย่างคอร์ส: ${c.title}`, `
        <div style="line-height:1.6">
          <p class="eyebrow">${esc(c.category)} · โดย ${esc(c.channel || 'Lore Universe')}</p>
          <p>${esc(c.description)}</p>
          <h4>บทเรียนในคอร์สนี้ (${c.lessons.length} บท):</h4>
          <ol style="padding-left:20px;margin-top:6px">${c.lessons.map(l => `<li style="margin-bottom:8px"><strong>${esc(l.title)}</strong> (${esc(l.duration || '10:00')})<br><small class="muted">${esc(l.summary || '')}</small></li>`).join('')}</ol>
        </div>
      `);
    }));

    app.querySelectorAll('[data-course-action]').forEach(el => el.addEventListener('click', () => {
      const cid = el.dataset.course;
      if (el.dataset.courseAction === 'cart') {
        if (!s.data.cart.includes(cid)) s.data.cart.push(cid);
        s.data.view = 'cart';
      } else {
        s.data.selected = cid;
        s.data.selectedLesson = 0;
        s.data.view = 'learning';
      }
      save();
    }));

    app.querySelectorAll('[data-remove-course]').forEach(el => el.addEventListener('click', () => { s.data.cart = s.data.cart.filter(x => x !== el.dataset.removeCourse); save(); }));
    app.querySelector('[data-course-checkout]')?.addEventListener('click', () => {
      s.data.orders.unshift({ id: `ORD-${Date.now()}`, items: [...s.data.cart], status: 'pending', date: today() });
      s.data.cart = [];
      s.data.view = 'profile';
      save();
      toast('สร้างคำสั่งซื้อแล้ว รอ Admin อนุมัติ');
    });

    app.querySelectorAll('[data-approve-order]').forEach(el => el.addEventListener('click', () => {
      const o = s.data.orders.find(x => x.id === el.dataset.approveOrder);
      if (o) {
        o.status = 'approved';
        o.items.forEach(x => { if (!s.data.owned.includes(x)) s.data.owned.push(x); });
        save();
        toast('อนุมัติสิทธิ์การเข้าเรียนสำเร็จ');
      }
    }));

    app.querySelectorAll('[data-select-lesson]').forEach(el => el.addEventListener('click', () => {
      s.data.selectedLesson = Number(el.dataset.selectLesson);
      save();
    }));

    app.querySelectorAll('[data-toggle-lesson]').forEach(el => el.addEventListener('click', (e) => {
      e.stopPropagation();
      const c = s.data.selected;
      const n = Number(el.dataset.toggleLesson);
      s.data.progress[c] = s.data.progress[c] || [];
      s.data.progress[c] = s.data.progress[c].includes(n) ? s.data.progress[c].filter(x => x !== n) : [...s.data.progress[c], n];
      save();
    }));

    app.querySelector('[data-course-home]')?.addEventListener('click', () => { s.data.view = 'home'; save(); });

    app.querySelectorAll('[data-certificate]').forEach(el => el.addEventListener('click', () => {
      const c = s.data.courses.find(x => x.id === el.dataset.certificate);
      if (!c) return;
      modal('ใบประกาศนียบัตรสำเร็จการศึกษา', `
        <div class="certificate-card">
          <p class="eyebrow" style="font-size:14px">CERTIFICATE OF COMPLETION</p>
          <h1 style="font-size:28px;margin:12px 0 6px">ใบประกาศนียบัตรเชิดชูเกียรติ</h1>
          <p class="muted">ขอมอบใบประกาศฉบับนี้เพื่อแสดงว่า</p>
          <h2 style="font-size:26px;color:var(--brand);margin:16px 0">คุณนักเรียน (Student Demo)</h2>
          <p class="muted">ได้สำเร็จการศึกษาหลักสูตรคอร์สออนไลน์</p>
          <h3 style="font-size:20px;margin:12px 0">${esc(c.title)}</h3>
          <p class="muted" style="font-size:13px">ออกให้ ณ วันที่ ${today()} · รับรองโดย EduFlow & Lore Universe</p>
        </div>
      `, `<div class="form-actions"><button class="btn primary" onclick="window.print()">พิมพ์ใบประกาศนียบัตร</button></div>`);
    }));

    app.querySelector('[data-admin-add-course]')?.addEventListener('click', () => {
      const wrap = modal('เพิ่มคอร์สเรียนใหม่', `
        <form id="new-course-form" class="form-grid">
          <div class="field" style="grid-column:1/-1"><label>ชื่อคอร์สเรียน</label><input class="input" name="title" required placeholder="เช่น รามเกียรติ์ ตอน ศึกมัยราพ"></div>
          <div class="field"><label>ราคา (บาท)</label><input class="input" type="number" name="price" value="990" required></div>
          <div class="field"><label>หมวดหมู่</label><select class="select" name="category"><option>วรรณคดีไทย / ตำนาน</option><option>Technology</option></select></div>
          <div class="field" style="grid-column:1/-1"><label>คำอธิบายคอร์ส</label><textarea class="textarea" name="description" required placeholder="อธิบายเนื้อหาโดยย่อ"></textarea></div>
          <div class="field" style="grid-column:1/-1"><label>YouTube Video ID บทเรียนแรก</label><input class="input" name="youtubeId" placeholder="เช่น g4mZ6P6E_m0"></div>
          <div class="form-actions" style="grid-column:1/-1"><button class="btn primary">สร้างคอร์สเรียน</button></div>
        </form>
      `);
      wrap.querySelector('form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const yid = String(f.get('youtubeId') || '').trim();
        const newC = {
          id: id('C'),
          title: String(f.get('title')),
          price: Number(f.get('price')) || 990,
          category: String(f.get('category')),
          channel: 'Lore Universe',
          thumbnail: yid ? `https://img.youtube.com/vi/${yid}/hqdefault.jpg` : '',
          description: String(f.get('description')),
          lessons: [
            { title: 'บทเรียนที่ 1: ปฐมบท', youtubeId: yid, duration: '15:00', summary: 'ภาพรวมของเนื้อหาบทแรก' }
          ]
        };
        s.data.courses.unshift(newC);
        s.data.owned.push(newC.id);
        s.save();
        wrap.remove();
        renderCourse();
        toast('เพิ่มคอร์สเรียนใหม่แล้ว');
      });
    });
  }

  const wmsSeed = {
    view: 'dashboard', search: '', category: 'All', zone: 'All',
    inventory: [
      { sku: 'EL-001', name: 'Wireless Barcode Scanner', category: 'Electronics', stock: 24, minStock: 10, location: 'Zone A-01', price: 2890, supplier: 'SUP-001 Nexus Tech Supply' },
      { sku: 'EL-002', name: 'Thermal Label Printer', category: 'Electronics', stock: 7, minStock: 10, location: 'Zone A-02', price: 4590, supplier: 'SUP-001 Nexus Tech Supply' },
      { sku: 'FU-001', name: 'Industrial Shelf 5 Tier', category: 'Furniture', stock: 18, minStock: 5, location: 'Zone B-01', price: 7200, supplier: 'SUP-002 Siam Steel & Racks' },
      { sku: 'ST-001', name: 'Shipping Label A6 (Roll)', category: 'Stationery', stock: 160, minStock: 50, location: 'Zone C-01', price: 320, supplier: 'SUP-003 Pack & Print Co.' },
      { sku: 'ST-002', name: 'Packing Tape Clear 2 inch', category: 'Stationery', stock: 9, minStock: 20, location: 'Zone C-02', price: 85, supplier: 'SUP-003 Pack & Print Co.' },
      { sku: 'NW-001', name: 'Gigabit Switch 24 Port', category: 'Networking', stock: 4, minStock: 5, location: 'Zone D-01', price: 5900, supplier: 'SUP-001 Nexus Tech Supply' },
      { sku: 'NW-002', name: 'CAT6 Cable 305m Box', category: 'Networking', stock: 2, minStock: 5, location: 'Zone D-02', price: 3100, supplier: 'SUP-001 Nexus Tech Supply' },
      { sku: 'EL-003', name: 'Handheld PDA Terminal', category: 'Electronics', stock: 12, minStock: 5, location: 'Zone A-03', price: 12900, supplier: 'SUP-001 Nexus Tech Supply' },
    ],
    inboundOrders: [
      { id: 'IN-1001', poNumber: 'PO-2026-081', supplier: 'SUP-001 Nexus Tech Supply', sku: 'EL-001', qty: 20, location: 'Zone A-01', status: 'Received', date: '01 ส.ค. 2569' },
      { id: 'IN-1002', poNumber: 'PO-2026-084', supplier: 'SUP-003 Pack & Print Co.', sku: 'ST-002', qty: 50, location: 'Zone C-02', status: 'Pending', date: '03 ส.ค. 2569' },
    ],
    outboundOrders: [
      { id: 'OUT-2041', orderNo: 'ORD-8819', customer: 'Bangkok Logistics Co.', sku: 'EL-001', qty: 4, status: 'Dispatched', picker: 'Preeya C.', date: '02 ส.ค. 2569' },
      { id: 'OUT-2042', orderNo: 'ORD-8824', customer: 'Siam Retail Group', sku: 'FU-001', qty: 2, status: 'Picking', picker: 'Somchai N.', date: '03 ส.ค. 2569' },
    ],
    suppliers: [
      { id: 'SUP-001', name: 'Nexus Tech Supply Ltd.', contact: 'คุณวิชัย (Sales)', phone: '02-771-8899', email: 'sales@nexustech.co.th', rating: '4.9 ★', leadTime: '2-3 วัน' },
      { id: 'SUP-002', name: 'Siam Steel & Racks Co.', contact: 'คุณมารุต', phone: '02-441-2211', email: 'info@siamsteelracks.com', rating: '4.7 ★', leadTime: '5-7 วัน' },
      { id: 'SUP-003', name: 'Pack & Print Logistics Supply', contact: 'คุณพิมพ์ใจ', phone: '081-992-3344', email: 'order@packprint.co.th', rating: '4.8 ★', leadTime: '1-2 วัน' },
    ],
    logs: [
      { id: 'LOG-1', type: 'INBOUND', sku: 'EL-003', qty: 12, location: 'Zone A-03', note: 'รับสินค้าตาม PO-2026-078', date: '01 ส.ค. 2569 10:15', user: 'Preeya C.' },
      { id: 'LOG-2', type: 'OUTBOUND', sku: 'EL-001', qty: 4, location: 'Zone A-01', note: 'จ่ายสินค้าตามคำสั่งซื้อ ORD-8819', date: '02 ส.ค. 2569 14:30', user: 'Somchai N.' },
    ]
  };

  function renderWms() {
    const s = store('wms', wmsSeed);
    const save = () => { s.save(); renderWms(); };
    const views = [
      ['dashboard', 'Dashboard'],
      ['inventory', 'Inventory & Stock'],
      ['inbound', `Inbound (${s.data.inboundOrders.filter(x => x.status === 'Pending').length})`],
      ['outbound', `Outbound (${s.data.outboundOrders.filter(x => x.status === 'Picking').length})`],
      ['suppliers', 'Suppliers'],
      ['reports', 'Stock Ledger & Reports']
    ];

    const categories = ['All', 'Electronics', 'Furniture', 'Stationery', 'Networking'];
    const filteredInventory = s.data.inventory.filter(x => {
      const matchSearch = `${x.name} ${x.sku} ${x.location}`.toLowerCase().includes((s.data.search || '').toLowerCase());
      const matchCat = s.data.category === 'All' || x.category === s.data.category;
      return matchSearch && matchCat;
    });

    const lowStockItems = s.data.inventory.filter(x => x.stock <= x.minStock);
    const totalValue = s.data.inventory.reduce((a, x) => a + x.stock * x.price, 0);

    let body = '';

    if (s.data.view === 'dashboard') {
      body = `<div class="page-pad">
        <div class="grid cols-4">
          <article class="card stat-card"><small>Total SKUs</small><strong>${s.data.inventory.length} SKUs</strong><small>ในคลังสินค้า</small></article>
          <article class="card stat-card"><small>Total Inventory Value</small><strong>${money(totalValue)}</strong><small>มูลค่าสินค้ารวม</small></article>
          <article class="card stat-card"><small>Low Stock Alert</small><strong style="color:var(--danger)">${lowStockItems.length} SKUs</strong><small>ต้องสั่งซื้อเพิ่ม</small></article>
          <article class="card stat-card"><small>Pending Inbound</small><strong>${s.data.inboundOrders.filter(x => x.status === 'Pending').length} Orders</strong><small>รอรับเข้าคลัง</small></article>
        </div>

        ${lowStockItems.length ? `
          <div class="notice danger" style="margin-top:16px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong style="color:var(--danger)">⚠️ แจ้งเตือนสินค้าต่ำกว่า Reorder Point (${lowStockItems.length} รายการ):</strong>
              <span class="muted">${lowStockItems.map(x => `${x.sku} (${x.stock}/${x.minStock})`).join(', ')}</span>
            </div>
            <button class="btn small primary" data-wms-action="create-bulk-po">สร้าง PO สั่งซื้อด่วน 🛒</button>
          </div>
        ` : ''}

        <div class="grid cols-2" style="margin-top:16px">
          <section class="card">
            <div class="card-head"><h2>สต็อกแยกตามหมวดหมู่</h2>${badge('Realtime')}</div>
            ${['Electronics', 'Furniture', 'Stationery', 'Networking'].map(cat => {
              const items = s.data.inventory.filter(x => x.category === cat);
              const qty = items.reduce((a, x) => a + x.stock, 0);
              const val = items.reduce((a, x) => a + x.stock * x.price, 0);
              return `<div class="summary-line">
                <div><strong>${cat}</strong><br><small class="muted">${items.length} SKUs</small></div>
                <div style="text-align:right"><strong>${qty} ชิ้น</strong><br><small class="muted">${money(val)}</small></div>
              </div>`;
            }).join('')}
          </section>

          <section class="card">
            <div class="card-head">
              <h2>กิจกรรมคลังล่าสุด (Stock Movement)</h2>
              <button class="btn small" data-wms-view="reports">ดูทั้งหมด →</button>
            </div>
            <div class="timeline">
              ${s.data.logs.slice(0, 5).map(l => `
                <div class="timeline-item ${l.type === 'INBOUND' ? 'done' : 'current'}">
                  <strong>${l.type === 'INBOUND' ? '📥 รับเข้า' : '📤 เบิกออก'}: ${esc(l.sku)} (${l.qty} ชิ้น)</strong>
                  <p class="muted">${esc(l.note)} · ${esc(l.location)} · โดย ${esc(l.user)} (${esc(l.date)})</p>
                </div>
              `).join('') || '<p class="muted">ยังไม่มีประวัติการรับเข้า/เบิกออก</p>'}
            </div>
          </section>
        </div>
      </div>`;
    } else if (s.data.view === 'inventory') {
      body = `<div class="page-pad">
        <section class="card">
          <div class="toolbar">
            <div class="tabs" style="margin:0">
              ${categories.map(cat => `<button class="tab ${s.data.category === cat ? 'active' : ''}" data-wms-cat="${esc(cat)}">${esc(cat)}</button>`).join('')}
            </div>
            <div style="display:flex;gap:8px">
              <input class="input" id="wms-search" style="max-width:280px" placeholder="ค้นหา SKU, ชื่อ หรือ Zone..." value="${esc(s.data.search)}">
              <button class="btn primary small" data-wms-add-sku>+ เพิ่ม SKU ใหม่</button>
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>ชื่อสินค้า</th>
                  <th>หมวดหมู่</th>
                  <th>Location Zone</th>
                  <th>คงเหลือ (Min)</th>
                  <th>ราคา/หน่วย</th>
                  <th>มูลค่ารวม</th>
                  <th>จัดการสต็อก</th>
                </tr>
              </thead>
              <tbody>
                ${filteredInventory.map(x => `
                  <tr>
                    <td><code>${esc(x.sku)}</code></td>
                    <td><strong>${esc(x.name)}</strong><br><small class="muted">ซัพพลายเออร์: ${esc(x.supplier || '-')}</small></td>
                    <td>${badge(x.category)}</td>
                    <td><span class="chip">${esc(x.location)}</span></td>
                    <td>
                      <strong style="font-size:16px;color:${x.stock === 0 ? 'var(--danger)' : x.stock <= x.minStock ? 'var(--warning)' : 'inherit'}">
                        ${x.stock}
                      </strong>
                      <small class="muted"> / ${x.minStock}</small>
                      ${x.stock <= x.minStock ? badge('สั่งซื้อเพิ่ม', 'warning') : ''}
                    </td>
                    <td>${money(x.price)}</td>
                    <td><strong>${money(x.stock * x.price)}</strong></td>
                    <td>
                      <div style="display:flex;gap:4px">
                        <button class="btn small" data-wms-adjust="${x.sku}" data-delta="-1" title="เบิกจ่าย">−</button>
                        <button class="btn small" data-wms-adjust="${x.sku}" data-delta="1" title="รับเข้า">+</button>
                        <button class="btn small primary" data-wms-po="${x.sku}" title="สั่งซื้อเพิ่ม">PO</button>
                      </div>
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="8" class="muted" style="text-align:center">ไม่พบสินค้าตามเงื่อนไขที่ค้นหา</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>
      </div>`;
    } else if (s.data.view === 'inbound') {
      body = `<div class="page-pad">
        <section class="card">
          <div class="card-head">
            <div><p class="eyebrow">Inbound Operations</p><h2>รายการรับสินค้าเข้าคลัง (Inbound PO Receipts)</h2></div>
            <button class="btn primary small" data-wms-new-inbound>+ สร้างใบรับสินค้าเข้าคลัง</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>ซัพพลายเออร์</th>
                  <th>SKU สินค้า</th>
                  <th>จำนวน</th>
                  <th>จัดเก็บเข้า Zone</th>
                  <th>วันที่สั่ง/รับ</th>
                  <th>สถานะ</th>
                  <th>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                ${s.data.inboundOrders.map(o => `
                  <tr>
                    <td><code>${esc(o.poNumber)}</code></td>
                    <td><strong>${esc(o.supplier)}</strong></td>
                    <td><code>${esc(o.sku)}</code></td>
                    <td><strong>${o.qty} ชิ้น</strong></td>
                    <td><span class="chip">${esc(o.location)}</span></td>
                    <td>${esc(o.date)}</td>
                    <td>${badge(o.status, o.status === 'Received' ? 'success' : 'warning')}</td>
                    <td>
                      <button class="btn small primary" data-wms-confirm-inbound="${o.id}" ${o.status === 'Received' ? 'disabled' : ''}>
                        ${o.status === 'Received' ? 'รับสินค้าแล้ว ✓' : 'ยืนยันรับสินค้าเข้าคลัง'}
                      </button>
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="8" class="muted">ยังไม่มีรายการ Inbound</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>
      </div>`;
    } else if (s.data.view === 'outbound') {
      body = `<div class="page-pad">
        <section class="card">
          <div class="card-head">
            <div><p class="eyebrow">Outbound Operations</p><h2>รายการเบิกจ่ายและจัดส่งสินค้า (Outbound Pick List)</h2></div>
            <button class="btn primary small" data-wms-new-outbound>+ สร้างใบเบิกจ่ายสินค้า</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>ลูกค้า / ผู้เบิก</th>
                  <th>SKU สินค้า</th>
                  <th>จำนวนเบิก</th>
                  <th>ผู้จัดสินค้า (Picker)</th>
                  <th>วันที่</th>
                  <th>สถานะ</th>
                  <th>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                ${s.data.outboundOrders.map(o => `
                  <tr>
                    <td><code>${esc(o.orderNo)}</code></td>
                    <td><strong>${esc(o.customer)}</strong></td>
                    <td><code>${esc(o.sku)}</code></td>
                    <td><strong>${o.qty} ชิ้น</strong></td>
                    <td>${esc(o.picker)}</td>
                    <td>${esc(o.date)}</td>
                    <td>${badge(o.status, o.status === 'Dispatched' ? 'success' : 'warning')}</td>
                    <td>
                      <button class="btn small primary" data-wms-confirm-outbound="${o.id}" ${o.status === 'Dispatched' ? 'disabled' : ''}>
                        ${o.status === 'Dispatched' ? 'จัดส่งแล้ว ✓' : 'ยืนยันเบิกจ่ายสินค้า'}
                      </button>
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="8" class="muted">ยังไม่มีรายการ Outbound</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>
      </div>`;
    } else if (s.data.view === 'suppliers') {
      body = `<div class="page-pad">
        <section class="card">
          <div class="card-head"><h2>รายชื่อคู่ค้าและซัพพลายเออร์ (Suppliers Directory)</h2></div>
          <div class="grid cols-3" style="margin-top:14px">
            ${s.data.suppliers.map(sup => `
              <article class="card">
                <div class="card-head">
                  <h3>${esc(sup.name)}</h3>
                  ${badge(sup.rating, 'success')}
                </div>
                <div class="summary-line"><span>ผู้ติดต่อ</span><strong>${esc(sup.contact)}</strong></div>
                <div class="summary-line"><span>โทรศัพท์</span><strong>${esc(sup.phone)}</strong></div>
                <div class="summary-line"><span>อีเมล</span><small class="muted">${esc(sup.email)}</small></div>
                <div class="summary-line"><span>Lead Time จัดส่ง</span><strong>${esc(sup.leadTime)}</strong></div>
              </article>
            `).join('')}
          </div>
        </section>
      </div>`;
    } else {
      body = `<div class="page-pad">
        <section class="card">
          <div class="card-head">
            <div><p class="eyebrow">Stock Ledger & Audit Trail</p><h2>สมุดบัญชีเคลื่อนไหวคลังสินค้า (Stock Ledger Log)</h2></div>
            ${badge(`${s.data.logs.length} รายการบันทึก`)}
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>วันที่-เวลา</th>
                  <th>ประเภท</th>
                  <th>SKU</th>
                  <th>จำนวน</th>
                  <th>Location Zone</th>
                  <th>ผู้บันทึก</th>
                  <th>หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                ${s.data.logs.map(l => `
                  <tr>
                    <td><code>${esc(l.date)}</code></td>
                    <td>${badge(l.type, l.type === 'INBOUND' ? 'success' : 'danger')}</td>
                    <td><code>${esc(l.sku)}</code></td>
                    <td><strong>${l.qty > 0 ? '+' : ''}${l.qty} ชิ้น</strong></td>
                    <td><span class="chip">${esc(l.location)}</span></td>
                    <td>${esc(l.user)}</td>
                    <td>${esc(l.note)}</td>
                  </tr>
                `).join('') || '<tr><td colspan="7" class="muted">ยังไม่มีประวัติ Ledger Log</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>
      </div>`;
    }

    app.innerHTML = `<div class="app-shell">${appHeader('NexusWMS', 'ระบบจัดการคลังสินค้าและสต็อก (Warehouse Management)', views, s.data.view, `<button class="btn small danger" data-wms-reset>รีเซ็ตคลัง</button>`)}${body}</div>`;

    // Event Listeners
    app.querySelectorAll('[data-tab]').forEach(el => el.addEventListener('click', () => { s.data.view = el.dataset.tab; save(); }));
    app.querySelectorAll('[data-wms-view]').forEach(el => el.addEventListener('click', () => { s.data.view = el.dataset.wmsView; save(); }));
    app.querySelector('[data-wms-reset]')?.addEventListener('click', () => { if (confirm('ล้างข้อมูลสต็อกและคืนค่าเริ่มต้น?')) { s.reset(); renderWms(); } });

    app.querySelectorAll('[data-wms-cat]').forEach(el => el.addEventListener('click', () => { s.data.category = el.dataset.wmsCat; save(); }));
    app.querySelector('#wms-search')?.addEventListener('input', (e) => { s.data.search = e.target.value; s.save(); renderWms(); document.querySelector('#wms-search')?.focus(); });

    // Stock Adjustments
    app.querySelectorAll('[data-wms-adjust]').forEach(el => el.addEventListener('click', () => {
      const sku = el.dataset.wmsAdjust;
      const delta = Number(el.dataset.delta);
      const item = s.data.inventory.find(x => x.sku === sku);
      if (item) {
        if (delta < 0 && item.stock <= 0) { toast('สินค้าหมดสต็อก ไม่สามารถเบิกออกได้'); return; }
        item.stock = Math.max(0, item.stock + delta);
        s.data.logs.unshift({
          id: id('LOG'),
          type: delta > 0 ? 'INBOUND' : 'OUTBOUND',
          sku: item.sku,
          qty: Math.abs(delta),
          location: item.location,
          note: delta > 0 ? 'ปรับเพิ่มสต็อกด้วยมือ' : 'ปรับลด/เบิกจ่ายด้วยมือ',
          date: today() + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          user: 'Preeya C.'
        });
        save();
        toast(`อัปเดตสต็อก ${item.sku} เรียบร้อยแล้ว`);
      }
    }));

    // Single PO
    app.querySelectorAll('[data-wms-po]').forEach(el => el.addEventListener('click', () => {
      const item = s.data.inventory.find(x => x.sku === el.dataset.wmsPo);
      if (!item) return;
      const newPO = {
        id: id('IN'),
        poNumber: `PO-${Date.now().toString().slice(-4)}`,
        supplier: item.supplier || 'SUP-001 Nexus Tech Supply',
        sku: item.sku,
        qty: Math.max(20, item.minStock * 2),
        location: item.location,
        status: 'Pending',
        date: today()
      };
      s.data.inboundOrders.unshift(newPO);
      s.data.view = 'inbound';
      save();
      toast(`สร้างใบสั่งซื้อ PO (${newPO.poNumber}) สำหรับ ${item.sku} เรียบร้อย`);
    }));

    // Bulk PO
    app.querySelector('[data-wms-action="create-bulk-po"]')?.addEventListener('click', () => {
      lowStockItems.forEach(item => {
        s.data.inboundOrders.unshift({
          id: id('IN'),
          poNumber: `PO-BULK-${Math.floor(1000 + Math.random() * 9000)}`,
          supplier: item.supplier || 'SUP-001 Nexus Tech Supply',
          sku: item.sku,
          qty: Math.max(20, item.minStock * 3),
          location: item.location,
          status: 'Pending',
          date: today()
        });
      });
      s.data.view = 'inbound';
      save();
      toast(`สร้างใบ PO สั่งซื้อด่วนสำหรับสินค้าใกล้หมด ${lowStockItems.length} รายการแล้ว`);
    });

    // New Inbound Receipt Modal
    app.querySelector('[data-wms-new-inbound]')?.addEventListener('click', () => {
      const wrap = modal('สร้างใบรับสินค้าเข้าคลัง (Inbound PO)', `
        <form id="inbound-form" class="form-grid">
          <div class="field"><label>PO Number</label><input class="input" name="poNumber" value="PO-2026-${Math.floor(100 + Math.random() * 900)}" required></div>
          <div class="field"><label>ซัพพลายเออร์</label><select class="select" name="supplier">${s.data.suppliers.map(x => `<option>${esc(x.name)}</option>`).join('')}</select></div>
          <div class="field"><label>เลือก SKU สินค้า</label><select class="select" name="sku">${s.data.inventory.map(x => `<option value="${x.sku}">${x.sku} - ${esc(x.name)}</option>`).join('')}</select></div>
          <div class="field"><label>จำนวนรับเข้า (ชิ้น)</label><input class="input" type="number" name="qty" value="20" min="1" required></div>
          <div class="field"><label>จัดเก็บเข้า Zone Location</label><input class="input" name="location" value="Zone A-01" required></div>
          <div class="form-actions" style="grid-column:1/-1"><button class="btn primary">สร้างใบรับสินค้า</button></div>
        </form>
      `);
      wrap.querySelector('form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        s.data.inboundOrders.unshift({
          id: id('IN'),
          poNumber: String(f.get('poNumber')),
          supplier: String(f.get('supplier')),
          sku: String(f.get('sku')),
          qty: Number(f.get('qty')) || 1,
          location: String(f.get('location')),
          status: 'Pending',
          date: today()
        });
        save();
        wrap.remove();
        toast('สร้างใบรับสินค้าเรียบร้อย');
      });
    });

    // Confirm Inbound Receipt
    app.querySelectorAll('[data-wms-confirm-inbound]').forEach(el => el.addEventListener('click', () => {
      const order = s.data.inboundOrders.find(x => x.id === el.dataset.wmsConfirmInbound);
      if (order && order.status === 'Pending') {
        order.status = 'Received';
        const item = s.data.inventory.find(x => x.sku === order.sku);
        if (item) item.stock += order.qty;
        s.data.logs.unshift({
          id: id('LOG'),
          type: 'INBOUND',
          sku: order.sku,
          qty: order.qty,
          location: order.location,
          note: `รับสินค้าตาม ${order.poNumber} จาก ${order.supplier}`,
          date: today() + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          user: 'Preeya C.'
        });
        save();
        toast(`รับสินค้าเข้าคลังเรียบร้อยแล้ว เพิ่มสต็อก ${order.sku} +${order.qty} ชิ้น`);
      }
    }));

    // New Outbound Dispatch Modal
    app.querySelector('[data-wms-new-outbound]')?.addEventListener('click', () => {
      const wrap = modal('สร้างใบเบิกจ่ายสินค้า (Outbound Pick List)', `
        <form id="outbound-form" class="form-grid">
          <div class="field"><label>Order No.</label><input class="input" name="orderNo" value="ORD-${Math.floor(1000 + Math.random() * 9000)}" required></div>
          <div class="field"><label>ชื่อลูกค้า / ผู้เบิก</label><input class="input" name="customer" placeholder="เช่น บริษัท สยามโลจิสติกส์" required></div>
          <div class="field"><label>เลือก SKU สินค้า</label><select class="select" name="sku">${s.data.inventory.map(x => `<option value="${x.sku}">${x.sku} - ${esc(x.name)} (คงเหลือ ${x.stock})</option>`).join('')}</select></div>
          <div class="field"><label>จำนวนเบิก (ชิ้น)</label><input class="input" type="number" name="qty" value="1" min="1" required></div>
          <div class="field"><label>ผู้เบิก/จัดสินค้า (Picker)</label><input class="input" name="picker" value="Preeya C." required></div>
          <div class="form-actions" style="grid-column:1/-1"><button class="btn primary">สร้างรายการเบิกจ่าย</button></div>
        </form>
      `);
      wrap.querySelector('form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const sku = String(f.get('sku'));
        const qty = Number(f.get('qty')) || 1;
        const item = s.data.inventory.find(x => x.sku === sku);
        if (item && item.stock < qty) { toast(`สต็อกคงเหลือไม่พอ (${item.stock} ชิ้น)`); return; }
        s.data.outboundOrders.unshift({
          id: id('OUT'),
          orderNo: String(f.get('orderNo')),
          customer: String(f.get('customer')),
          sku,
          qty,
          picker: String(f.get('picker')),
          status: 'Picking',
          date: today()
        });
        save();
        wrap.remove();
        toast('สร้างรายการเบิกจ่ายสินค้าเรียบร้อย');
      });
    });

    // Confirm Outbound Dispatch
    app.querySelectorAll('[data-wms-confirm-outbound]').forEach(el => el.addEventListener('click', () => {
      const order = s.data.outboundOrders.find(x => x.id === el.dataset.wmsConfirmOutbound);
      if (order && order.status === 'Picking') {
        const item = s.data.inventory.find(x => x.sku === order.sku);
        if (item && item.stock < order.qty) { toast(`สต็อกคงเหลือไม่พอ (${item.stock} ชิ้น)`); return; }
        order.status = 'Dispatched';
        if (item) item.stock = Math.max(0, item.stock - order.qty);
        s.data.logs.unshift({
          id: id('LOG'),
          type: 'OUTBOUND',
          sku: order.sku,
          qty: -order.qty,
          location: item?.location || 'Zone A-01',
          note: `จ่ายสินค้าตาม ${order.orderNo} ส่งให้ ${order.customer}`,
          date: today() + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          user: order.picker || 'Preeya C.'
        });
        save();
        toast(`เบิกจ่ายสินค้าเรียบร้อยแล้ว หักสต็อก ${order.sku} -${order.qty} ชิ้น`);
      }
    }));

    // Add New SKU Modal
    app.querySelector('[data-wms-add-sku]')?.addEventListener('click', () => {
      const wrap = modal('เพิ่ม SKU สินค้าใหม่ในคลัง', `
        <form id="sku-form" class="form-grid">
          <div class="field"><label>SKU Code</label><input class="input" name="sku" placeholder="เช่น EL-004" required></div>
          <div class="field"><label>ชื่อสินค้า</label><input class="input" name="name" required placeholder="เช่น Barcode Printer A4"></div>
          <div class="field"><label>หมวดหมู่</label><select class="select" name="category"><option>Electronics</option><option>Furniture</option><option>Stationery</option><option>Networking</option></select></div>
          <div class="field"><label>Zone Location</label><input class="input" name="location" value="Zone A-04" required></div>
          <div class="field"><label>จำนวนสต็อกเริ่มต้น</label><input class="input" type="number" name="stock" value="10" min="0" required></div>
          <div class="field"><label>จุดแจ้งเตือน (Min Stock)</label><input class="input" type="number" name="minStock" value="5" min="1" required></div>
          <div class="field"><label>ราคา/หน่วย (บาท)</label><input class="input" type="number" name="price" value="1500" required></div>
          <div class="field"><label>ซัพพลายเออร์</label><select class="select" name="supplier">${s.data.suppliers.map(x => `<option>${esc(x.name)}</option>`).join('')}</select></div>
          <div class="form-actions" style="grid-column:1/-1"><button class="btn primary">บันทึก SKU</button></div>
        </form>
      `);
      wrap.querySelector('form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const newSku = {
          sku: String(f.get('sku')).trim().toUpperCase(),
          name: String(f.get('name')).trim(),
          category: String(f.get('category')),
          location: String(f.get('location')).trim(),
          stock: Number(f.get('stock')) || 0,
          minStock: Number(f.get('minStock')) || 5,
          price: Number(f.get('price')) || 0,
          supplier: String(f.get('supplier'))
        };
        s.data.inventory.unshift(newSku);
        s.data.logs.unshift({
          id: id('LOG'),
          type: 'INBOUND',
          sku: newSku.sku,
          qty: newSku.stock,
          location: newSku.location,
          note: `เพิ่ม SKU ใหม่ลงในคลังสินค้า`,
          date: today() + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          user: 'Preeya C.'
        });
        save();
        wrap.remove();
        toast(`เพิ่ม SKU (${newSku.sku}) เรียบร้อยแล้ว`);
      });
    });
  }

  const kanbanSeed = {
    project: 'website', search: '', projects: {
      website: {
        name: 'Website Redesign', tasks: [
          { id: 'T-1', col: 'todo', title: 'ออกแบบหน้า Login และ Register', tag: 'Design', priority: 'High', assignee: 'PC', due: '15 Mar' },
          { id: 'T-2', col: 'todo', title: 'Setup ฐานข้อมูล PostgreSQL', tag: 'Backend', priority: 'Medium', assignee: 'SP', due: '18 Mar' },
          { id: 'T-3', col: 'progress', title: 'พัฒนา API สำหรับดึงข้อมูล User', tag: 'Backend', priority: 'High', assignee: 'WT', due: '12 Mar' },
          { id: 'T-4', col: 'review', title: 'ปรับ UI หน้า Dashboard', tag: 'Frontend', priority: 'Medium', assignee: 'PC', due: '10 Mar' },
        ]
      },
      mobile: {
        name: 'Mobile App MVP', tasks: [
          { id: 'T-B1', col: 'todo', title: 'วิเคราะห์คู่แข่ง Mobile App', tag: 'Research', priority: 'Low', assignee: 'AK', due: '20 Apr' },
          { id: 'T-B2', col: 'progress', title: 'ออกแบบ Wireframe หน้าหลัก', tag: 'Design', priority: 'High', assignee: 'PC', due: '05 Apr' },
        ]
      }
    }
  };
  const kanbanCols = [['todo', 'To Do'], ['progress', 'In Progress'], ['review', 'In Review'], ['done', 'Done']];

  function renderKanban() {
    const s = store('kanban', kanbanSeed); const save = () => { s.save(); renderKanban(); }; const project = s.data.projects[s.data.project]; const filtered = project.tasks.filter(x => x.title.toLowerCase().includes((s.data.search || '').toLowerCase()));
    app.innerHTML = `<div class="app-shell">${appHeader('NexusFlow', 'Project / Kanban Management', [], '', `<select class="select" id="project-select" style="width:auto">${Object.entries(s.data.projects).map(([k, p]) => `<option value="${k}" ${k === s.data.project ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select><button class="btn small" data-new-task>+ New Task</button><button class="btn small danger" data-kanban-reset>รีเซ็ต</button>`)}
      <div class="page-pad"><div class="toolbar"><div><p class="eyebrow">Kanban Board</p><h2 style="margin:0">${esc(project.name)}</h2></div><input class="input" id="task-search" style="max-width:340px" placeholder="ค้นหา task" value="${esc(s.data.search)}"></div><div style="overflow-x:auto"><div class="kanban">${kanbanCols.map(([key, label]) => `<section class="kanban-column" data-col="${key}"><div class="card-head"><h3>${label}</h3>${badge(String(filtered.filter(x => x.col === key).length))}</div>${filtered.filter(x => x.col === key).map(t => `<article class="task-card" draggable="true" data-task="${t.id}"><h4>${esc(t.title)}</h4><p>${esc(t.assignee)} · ${esc(t.due)}</p><div class="task-meta">${badge(t.tag)}${badge(t.priority, t.priority === 'High' ? 'danger' : t.priority === 'Low' ? 'success' : 'warning')}</div></article>`).join('')}</section>`).join('')}</div></div></div></div>`;
    app.querySelector('#project-select')?.addEventListener('change', (e) => { s.data.project = e.target.value; s.data.search = ''; save(); });
    app.querySelector('#task-search')?.addEventListener('input', (e) => { s.data.search = e.target.value; s.save(); renderKanban(); document.querySelector('#task-search')?.focus(); });
    app.querySelector('[data-kanban-reset]')?.addEventListener('click', () => { if (confirm('คืนข้อมูลบอร์ดเริ่มต้น?')) { s.reset(); renderKanban(); } });
    
    app.querySelector('[data-new-task]')?.addEventListener('click', () => {
      const wrap = modal('เพิ่ม Task ใหม่', `<form id="task-form" class="form-grid"><div class="field" style="grid-column:1/-1"><label>Title</label><input class="input" name="title" required></div><div class="field"><label>Column</label><select class="select" name="col">${kanbanCols.map(x => `<option value="${x[0]}">${x[1]}</option>`).join('')}</select></div><div class="field"><label>Priority</label><select class="select" name="priority"><option>Medium</option><option>High</option><option>Low</option></select></div><div class="field"><label>Assignee</label><input class="input" name="assignee" value="PC"></div><div class="field"><label>Tag</label><input class="input" name="tag" value="General"></div><div class="form-actions" style="grid-column:1/-1"><button class="btn primary">เพิ่มงาน</button></div></form>`);
      wrap.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const f = new FormData(e.currentTarget); project.tasks.push({ id: id('T'), col: String(f.get('col')), title: String(f.get('title')), priority: String(f.get('priority')), assignee: String(f.get('assignee') || 'PC'), tag: String(f.get('tag') || 'General'), due: 'Today' }); s.save(); wrap.remove(); renderKanban(); toast('เพิ่ม Task แล้ว'); });
    });

    app.querySelectorAll('[data-task]').forEach((el) => {
      el.addEventListener('click', () => {
        const tid = el.dataset.task;
        const task = project.tasks.find((t) => t.id === tid);
        if (!task) return;
        const wrap = modal('แก้ไข / ลบ Task', `
          <form id="edit-task-form" class="form-grid">
            <div class="field" style="grid-column:1/-1"><label>Title</label><input class="input" name="title" value="${esc(task.title)}" required></div>
            <div class="field"><label>Column</label><select class="select" name="col">${kanbanCols.map((x) => `<option value="${x[0]}" ${x[0] === task.col ? 'selected' : ''}>${x[1]}</option>`).join('')}</select></div>
            <div class="field"><label>Priority</label><select class="select" name="priority">${['Low', 'Medium', 'High'].map((p) => `<option ${p === task.priority ? 'selected' : ''}>${p}</option>`).join('')}</select></div>
            <div class="field"><label>Assignee</label><input class="input" name="assignee" value="${esc(task.assignee)}"></div>
            <div class="field"><label>Tag</label><input class="input" name="tag" value="${esc(task.tag)}"></div>
            <div class="form-actions" style="grid-column:1/-1">
              <button class="btn danger" type="button" id="delete-task-btn">ลบ Task</button>
              <button class="btn primary" type="submit">บันทึกการแก้ไข</button>
            </div>
          </form>
        `);
        wrap.querySelector('#delete-task-btn')?.addEventListener('click', () => {
          if (confirm('ยืนยันลบ Task นี้?')) {
            project.tasks = project.tasks.filter((t) => t.id !== tid);
            s.save();
            wrap.remove();
            renderKanban();
            toast('ลบ Task เรียบร้อย');
          }
        });
        wrap.querySelector('form')?.addEventListener('submit', (evt) => {
          evt.preventDefault();
          const f = new FormData(evt.currentTarget);
          task.title = String(f.get('title'));
          task.col = String(f.get('col'));
          task.priority = String(f.get('priority'));
          task.assignee = String(f.get('assignee'));
          task.tag = String(f.get('tag'));
          s.save();
          wrap.remove();
          renderKanban();
          toast('อัปเดต Task เรียบร้อย');
        });
      });
    });

    let dragged = ''; app.querySelectorAll('[data-task]').forEach(el => el.addEventListener('dragstart', () => dragged = el.dataset.task));
    app.querySelectorAll('[data-col]').forEach(el => { el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('dragover'); }); el.addEventListener('dragleave', () => el.classList.remove('dragover')); el.addEventListener('drop', () => { const t = project.tasks.find(x => x.id === dragged); if (t) t.col = el.dataset.col; s.save(); renderKanban(); }); });
  }

  const posProducts = [
    { id: 'P1', name: 'Espresso', cat: 'Coffee', price: 65 }, { id: 'P2', name: 'Americano', cat: 'Coffee', price: 75 }, { id: 'P3', name: 'Cappuccino', cat: 'Coffee', price: 90 },
    { id: 'P4', name: 'Thai Tea', cat: 'Tea', price: 70 }, { id: 'P5', name: 'Matcha Latte', cat: 'Tea', price: 110 }, { id: 'P6', name: 'Croissant', cat: 'Bakery', price: 85 },
    { id: 'P7', name: 'Chocolate Cake', cat: 'Bakery', price: 125 }, { id: 'P8', name: 'Club Sandwich', cat: 'Food', price: 145 }, { id: 'P9', name: 'Caesar Salad', cat: 'Food', price: 155 }, { id: 'P10', name: 'Pasta Carbonara', cat: 'Food', price: 195 }
  ];
  const smartPosSeed = { view: 'pos', cart: {}, kioskCart: {}, kioskStage: 'welcome', orders: [], search: '', category: 'All' };

    function renderSmartPos() {
    const s = store('smartpos', smartPosSeed);
    const save = () => { s.save(); renderSmartPos(); };
    const views = [
      ['pos', 'POS Register'],
      ['tables', 'ผังโต๊ะอาหาร (Tables)'],
      ['kds', `Kitchen Display (${(s.data.orders || []).filter(x => ['pending', 'cooking'].includes(x.status)).length})`],
      ['dashboard', 'Z-Report & สรุปยอดขาย'],
      ['kiosk', 'Self-Order Kiosk']
    ];

    const cartSubtotal = (s.data.cart || []).reduce((a, x) => a + x.price * x.qty, 0);
    const cartVat = cartSubtotal * 0.07;
    const cartTotal = cartSubtotal + cartVat;

    let body = '';

    if (s.data.view === 'pos') {
      const filtered = posProducts.filter(x => (s.data.category === 'All' || x.cat === s.data.category) && x.name.toLowerCase().includes((s.data.search || '').toLowerCase()));
      body = `<div class="page-pad split">
        <section>
          <div class="toolbar card" style="padding:12px;margin-bottom:14px">
            <div style="display:flex;gap:10px;align-items:center;width:100%;flex-wrap:wrap">
              <div class="tabs" style="margin:0">
                ${['All', 'Coffee', 'Tea', 'Bakery', 'Food'].map(c => `<button class="tab ${c === s.data.category ? 'active' : ''}" data-pos-cat="${c}">${c}</button>`).join('')}
              </div>
              <input class="input" id="pos-search" style="max-width:240px;margin-left:auto" placeholder="ค้นหาเมนูอาหาร/เครื่องดื่ม" value="${esc(s.data.search)}">
            </div>
          </div>

          <div class="product-grid">
            ${filtered.map(p => `
              <article class="product-card">
                <span class="stat-icon">${p.cat === 'Coffee' ? '☕' : p.cat === 'Tea' ? '🍵' : p.cat === 'Bakery' ? '🥐' : '🍽'}</span>
                <h3 style="font-size:16px;margin:12px 0 4px">${esc(p.name)}</h3>
                <p class="muted" style="font-size:12px">${esc(p.cat)}</p>
                <div class="summary-line" style="margin-top:auto;padding-top:10px">
                  <strong style="font-size:18px">${money(p.price)}</strong>
                  <button class="btn small primary" data-pos-add-item="${p.id}">+ เลือกสั่ง</button>
                </div>
              </article>
            `).join('')}
          </div>
        </section>

        <aside class="card sidebar-card">
          <div class="card-head">
            <div>
              <p class="eyebrow">${s.data.orderType === 'Dine-in' ? `ทานที่ร้าน (${esc(s.data.selectedTable || 'T-01')})` : 'สั่งกลับบ้าน (Takeaway)'}</p>
              <h2>รายการคำสั่งซื้อ</h2>
            </div>
            <button class="btn small danger" data-pos-clear-cart>ล้าง</button>
          </div>

          <div style="display:flex;gap:8px;margin-bottom:12px">
            <button class="btn small ${s.data.orderType === 'Dine-in' ? 'primary' : ''}" data-pos-type="Dine-in">ทานที่ร้าน</button>
            <button class="btn small ${s.data.orderType === 'Takeaway' ? 'primary' : ''}" data-pos-type="Takeaway">กลับบ้าน</button>
          </div>

          ${(s.data.cart || []).length ? `
            <div class="cart-list" style="max-height:300px;overflow-y:auto">
              ${s.data.cart.map((item, idx) => `
                <div class="cart-line">
                  <div>
                    <strong>${esc(item.name)}</strong>
                    ${item.details ? `<br><small class="muted" style="color:var(--brand)">${esc(item.details)}</small>` : ''}
                    <br><small class="muted">${money(item.price)} × ${item.qty}</small>
                  </div>
                  <div class="qty">
                    <button class="btn small" data-pos-cart-qty="${idx}" data-delta="-1">−</button>
                    <strong>${item.qty}</strong>
                    <button class="btn small" data-pos-cart-qty="${idx}" data-delta="1">+</button>
                  </div>
                </div>
              `).join('')}
            </div>

            <div style="margin-top:16px;border-top:1px solid var(--line);padding-top:12px">
              <div class="summary-line"><span>Subtotal</span><strong>${money(cartSubtotal)}</strong></div>
              <div class="summary-line"><span>VAT 7%</span><strong>${money(cartVat)}</strong></div>
              <div class="summary-line total"><span>ยอดรวมทั้งสิ้น</span><strong>${money(cartTotal)}</strong></div>
              
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px">
                <button class="btn primary" data-pos-pay="PromptPay QR">ชำระด้วย QR 📱</button>
                <button class="btn" data-pos-pay="Cash">ชำระด้วยเงินสด 💵</button>
              </div>
            </div>
          ` : '<div class="empty">เลือกเมนูอาหารด้านซ้ายเพื่อสั่งซื้อ</div>'}
        </aside>
      </div>`;
    } else if (s.data.view === 'tables') {
      body = `<div class="page-pad">
        <section class="card">
          <div class="card-head">
            <div><p class="eyebrow">Table Management</p><h2>ผังโต๊ะอาหารในร้าน (Floor Layout Map)</h2></div>
            ${badge('6 โต๊ะให้บริการ')}
          </div>

          <div class="grid cols-3" style="margin-top:16px">
            ${(s.data.tables || []).map(t => `
              <article class="card" style="border-top:4px solid ${t.status === 'Free' ? 'var(--success)' : t.status === 'Occupied' ? 'var(--danger)' : 'var(--warning)'}">
                <div class="card-head">
                  <h3>${esc(t.name)}</h3>
                  ${badge(t.status === 'Free' ? 'โต๊ะว่าง' : t.status === 'Occupied' ? 'มีลูกค้า' : 'รอเช็กบิล', t.status === 'Free' ? 'success' : t.status === 'Occupied' ? 'danger' : 'warning')}
                </div>
                <p class="muted">${t.currentOrder ? `Order: ${esc(t.currentOrder)}` : 'พร้อมรองรับลูกค้า'}</p>
                <div style="display:flex;gap:8px;margin-top:14px">
                  <button class="btn small primary" data-table-select="${t.id}">สั่งอาหารโต๊ะนี้ ▶</button>
                  ${t.status !== 'Free' ? `<button class="btn small danger" data-table-clear="${t.id}">เช็กบิล/เคลียร์โต๊ะ</button>` : ''}
                </div>
              </article>
            `).join('')}
          </div>
        </section>
      </div>`;
    } else if (s.data.view === 'kds') {
      const active = (s.data.orders || []).filter(x => x.status !== 'completed');
      body = `<div class="page-pad">
        <div class="card-head" style="margin-bottom:16px">
          <div><p class="eyebrow">Kitchen Display System (KDS)</p><h2>จอแสดงผลคำสั่งซื้อสำหรับห้องครัว & บาร์น้ำ</h2></div>
          ${badge(`${active.length} ออเดอร์กำลังรอดำเนินการ`)}
        </div>

        ${active.length ? `
          <div class="kds-grid">
            ${active.map(o => `
              <article class="order-card ${o.status === 'ready' ? 'ready' : ''}">
                <div class="card-head">
                  <div>
                    <p class="eyebrow">${esc(o.type)} · ${esc(o.table || 'Takeaway')}</p>
                    <h2 style="margin:4px 0">${esc(o.id)}</h2>
                    <small class="muted">⏱ เมื่อเวลา ${esc(o.at)}</small>
                  </div>
                  ${badge(o.status === 'pending' ? 'ออเดอร์ใหม่' : o.status === 'cooking' ? 'กำลังทำ' : 'พร้อมเสิร์ฟ', o.status === 'ready' ? 'success' : 'warning')}
                </div>
                
                <div style="margin:12px 0;border-top:1px dashed var(--line);border-bottom:1px dashed var(--line);padding:10px 0">
                  ${o.items.map(x => `
                    <div style="margin-bottom:6px">
                      <strong>${x.qty} × ${esc(x.name)}</strong>
                      ${x.details ? `<br><small style="color:var(--brand);font-weight:bold">👉 ${esc(x.details)}</small>` : ''}
                    </div>
                  `).join('')}
                </div>

                <button class="btn primary" style="width:100%" data-order-next="${o.id}">
                  ${o.status === 'pending' ? '👨‍🍳 เริ่มทำอาหาร' : o.status === 'cooking' ? '✅ ทำเสร็จแล้ว (พร้อมเสิร์ฟ)' : '🍽 เสิร์ฟแล้ว (ปิดออเดอร์)'}
                </button>
              </article>
            `).join('')}
          </div>
        ` : '<div class="empty">ไม่มีคำสั่งซื้อค้างในครัว</div>'}
      </div>`;
    } else if (s.data.view === 'dashboard') {
      const totalSales = (s.data.orders || []).reduce((a, x) => a + x.total, 0);
      body = `<div class="page-pad">
        <div class="grid cols-4">
          <article class="card stat-card"><small>ยอดขายรวมวันนี้</small><strong>${money(totalSales + 14500)}</strong><small>สุทธิหลังภาษี VAT</small></article>
          <article class="card stat-card"><small>จำนวน ออเดอร์</small><strong>${(s.data.orders || []).length + 42} ออเดอร์</strong><small>เฉลี่ย 320 บาท/บิล</small></article>
          <article class="card stat-card"><small>ชำระด้วย PromptPay QR</small><strong>${money(s.data.shift?.qrCollected || 6800)}</strong><small>สแกนผ่านแอปธนาคาร</small></article>
          <article class="card stat-card"><small>ชำระด้วย เงินสด</small><strong>${money(s.data.shift?.cashCollected || 4500)}</strong><small>เงินสดในเก๊ะ</small></article>
        </div>

        <section class="card" style="margin-top:16px">
          <div class="card-head">
            <div><p class="eyebrow">End of Day Settlement</p><h2>รายงานสรุปปิดกะประจำวัน (Z-Report Summary)</h2></div>
            <button class="btn primary small" onclick="window.print()">🖨️ พิมพ์ใบสรุป Z-Report</button>
          </div>

          <div class="grid cols-2" style="margin-top:14px">
            <div>
              <h3>สรุปเงินสดในเก๊ะ (Cash Drawer Audit)</h3>
              <div class="summary-line"><span>เงินทอนเริ่มต้นกะ (Opening Float)</span><strong>${money(s.data.shift?.float || 2000)}</strong></div>
              <div class="summary-line"><span>ยอดรับเงินสด (Cash Sales)</span><strong>+${money(s.data.shift?.cashCollected || 4500)}</strong></div>
              <div class="summary-line total"><span>เงินสดที่ต้องมีในเก๊ะสุทธิ</span><strong>${money((s.data.shift?.float || 2000) + (s.data.shift?.cashCollected || 4500))}</strong></div>
            </div>

            <div>
              <h3>สถิติยอดขายแยกตามประเภทชำระ</h3>
              <div class="summary-line"><span>PromptPay QR / Mobile Banking</span><strong>${money(s.data.shift?.qrCollected || 6800)}</strong></div>
              <div class="summary-line"><span>Credit / Debit Card</span><strong>${money(s.data.shift?.cardCollected || 3200)}</strong></div>
              <div class="summary-line"><span>Cash (เงินสด)</span><strong>${money(s.data.shift?.cashCollected || 4500)}</strong></div>
            </div>
          </div>
        </section>
      </div>`;
    } else {
      const lines = s.data.cart || [];
      if (s.data.kioskStage === 'welcome') body = `<div class="shipping-choice"><div class="choice-wrap" style="text-align:center"><p class="eyebrow">SELF-ORDER KIOSK</p><h1 style="font-size:54px;margin:0">ยินดีต้อนรับ</h1><p class="muted">แตะหน้าจอเพื่อเริ่มสั่งอาหารด้วยตนเอง</p><button class="btn primary" data-kiosk-start>เริ่มสั่งสินค้า ▶</button></div></div>`;
      else if (s.data.kioskStage === 'payment') body = `<div class="shipping-choice"><section class="card" style="width:min(560px,100%);text-align:center"><p class="eyebrow">PROMPTPAY QR PAYMENT</p><h1>${money(cartTotal)}</h1><div class="course-art" style="height:220px;background:white;color:#111;font-size:80px">▦</div><p class="muted">สแกนชำระเงิน ระบบจะทำรายการอัตโนมัติใน 2 วินาที</p></section></div>`;
      else if (s.data.kioskStage === 'done') body = `<div class="shipping-choice"><section class="card" style="width:min(560px,100%);text-align:center"><div style="font-size:70px">✓</div><h1>สั่งอาหารเรียบร้อยแล้ว</h1><p class="muted">รายการถูกส่งไปยังห้องครัวเรียบร้อย โปรดรอเรียกหมายเลข</p><button class="btn primary" data-kiosk-new>สั่งรายการใหม่</button></section></div>`;
      else body = `<div class="page-pad split"><section><h2>รายการอาหาร Kiosk</h2><div class="product-grid">${posProducts.map(p => `<article class="product-card"><h3>${esc(p.name)}</h3><p class="muted">${esc(p.cat)}</p><div class="summary-line"><strong>${money(p.price)}</strong><button class="btn small primary" data-pos-add-item="${p.id}">+ สั่งสินค้า</button></div></article>`).join('')}</div></section><aside class="card sidebar-card"><h2>รายการของคุณ</h2>${lines.map(x => `<div class="summary-line"><span>${x.qty} × ${esc(x.name)}</span><strong>${money(x.qty * x.price)}</strong></div>`).join('') || '<div class="empty">ยังไม่มีสินค้า</div>'}<div class="summary-line total"><span>Total</span><strong>${money(cartTotal)}</strong></div><button class="btn primary" style="width:100%" data-kiosk-pay ${lines.length ? '' : 'disabled'}>ชำระเงิน QR PromptPay</button></aside></div>`;
    }

    app.innerHTML = `<div class="app-shell">${appHeader('SmartPOS', 'ระบบจุดขายร้านอาหาร & คาเฟ่ (POS / KDS / Table Layout)', views, s.data.view, `<button class="btn small danger" data-pos-reset>รีเซ็ตระบบ POS</button>`)}${body}</div>`;

    app.querySelectorAll('[data-tab]').forEach(el => el.addEventListener('click', () => { s.data.view = el.dataset.tab; save(); }));
    app.querySelector('[data-pos-reset]')?.addEventListener('click', () => { if (confirm('ล้างข้อมูลคำสั่งซื้อ POS ทั้งหมด?')) { s.reset(); renderSmartPos(); } });

    app.querySelectorAll('[data-pos-cat]').forEach(el => el.addEventListener('click', () => { s.data.category = el.dataset.posCat; save(); }));
    app.querySelector('#pos-search')?.addEventListener('input', (e) => { s.data.search = e.target.value; s.save(); renderSmartPos(); document.querySelector('#pos-search')?.focus(); });

    app.querySelectorAll('[data-pos-type]').forEach(el => el.addEventListener('click', () => { s.data.orderType = el.dataset.posType; save(); }));
    app.querySelectorAll('[data-table-select]').forEach(el => el.addEventListener('click', () => {
      s.data.selectedTable = el.dataset.tableSelect;
      s.data.orderType = 'Dine-in';
      s.data.view = 'pos';
      save();
      toast(`เลือกสั่งอาหารสำหรับ ${s.data.selectedTable} เรียบร้อย`);
    }));

    app.querySelectorAll('[data-table-clear]').forEach(el => el.addEventListener('click', () => {
      const table = (s.data.tables || []).find(x => x.id === el.dataset.tableClear);
      if (table) {
        table.status = 'Free';
        table.currentOrder = null;
        save();
        toast(`เคลียร์ ${table.name} เป็นโต๊ะว่างเรียบร้อย`);
      }
    }));

    app.querySelectorAll('[data-pos-add-item]').forEach(el => el.addEventListener('click', () => {
      const p = posProducts.find(x => x.id === el.dataset.posAddItem);
      if (!p) return;

      if (!p.hasModifiers) {
        const exist = (s.data.cart || []).find(x => x.id === p.id && !x.details);
        if (exist) exist.qty += 1;
        else {
          if (!Array.isArray(s.data.cart)) s.data.cart = [];
          s.data.cart.push({ id: p.id, name: p.name, price: p.price, qty: 1, details: '' });
        }
        save();
        toast(`เพิ่ม ${p.name} ลงออเดอร์แล้ว`);
        return;
      }

      const wrap = modal(`ปรับแต่งเมนู: ${p.name}`, `
        <form id="modifier-form" class="form-grid">
          <div class="field" style="grid-column:1/-1">
            <label>ระดับความหวาน (Sweetness Level)</label>
            <select class="select" name="sweetness">
              <option value="หวานปกติ (100%)">หวานปกติ (100%)</option>
              <option value="หวานน้อย (50%)">หวานน้อย (50%)</option>
              <option value="หวานน้อยมาก (25%)">หวานน้อยมาก (25%)</option>
              <option value="ไม่หวานเลย (0%)">ไม่หวานเลย (0%)</option>
            </select>
          </div>

          <div class="field" style="grid-column:1/-1">
            <label>รูปแบบ/อุณหภูมิ (Temperature)</label>
            <select class="select" name="temp">
              <option value="เย็น (Iced)">เย็น (Iced)</option>
              <option value="ร้อน (Hot)">ร้อน (Hot)</option>
              <option value="ปั่น (Blended) +10฿">ปั่น (Blended) +10฿</option>
            </select>
          </div>

          <div class="field" style="grid-column:1/-1">
            <label>ท็อปปิ้งเพิ่มเติม (Toppings & Milk Option)</label>
            <select class="select" name="topping">
              <option value="">-- ไม่เพิ่มท็อปปิ้ง --</option>
              <option value="Oat Milk นมโอ๊ต (+20฿)">นมโอ๊ต Oat Milk (+20฿)</option>
              <option value="Extra Shot กาแฟ (+15฿)">เพิ่มช็อตกาแฟ (+15฿)</option>
              <option value="Whip Cream วิปครีม (+15฿)">เพิ่มวิปครีม (+15฿)</option>
            </select>
          </div>

          <div class="field" style="grid-column:1/-1">
            <label>หมายเหตุเพิ่มเติมถึงห้องครัว</label>
            <input class="input" name="note" placeholder="เช่น แยกน้ำแข็ง, ขอแก้วกระดาษ">
          </div>

          <div class="form-actions" style="grid-column:1/-1">
            <button class="btn primary">เพิ่มรายการลงออเดอร์</button>
          </div>
        </form>
      `);

      wrap.querySelector('form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const sweetness = String(f.get('sweetness'));
        const temp = String(f.get('temp'));
        const topping = String(f.get('topping'));
        const note = String(f.get('note')).trim();

        let addPrice = 0;
        if (temp.includes('+10฿')) addPrice += 10;
        if (topping.includes('+20฿')) addPrice += 20;
        if (topping.includes('+15฿')) addPrice += 15;

        const details = [sweetness, temp, topping, note].filter(Boolean).join(', ');
        const finalPrice = p.price + addPrice;

        if (!Array.isArray(s.data.cart)) s.data.cart = [];
        s.data.cart.push({
          id: p.id,
          name: p.name,
          price: finalPrice,
          qty: 1,
          details
        });
        save();
        wrap.remove();
        toast(`เพิ่ม ${p.name} (${details}) ลงออเดอร์แล้ว`);
      });
    }));

    app.querySelectorAll('[data-pos-cart-qty]').forEach(el => el.addEventListener('click', () => {
      const idx = Number(el.dataset.posCartQty);
      const delta = Number(el.dataset.delta);
      if (s.data.cart && s.data.cart[idx]) {
        s.data.cart[idx].qty += delta;
        if (s.data.cart[idx].qty <= 0) s.data.cart.splice(idx, 1);
        save();
      }
    }));

    app.querySelector('[data-pos-clear-cart]')?.addEventListener('click', () => {
      s.data.cart = [];
      save();
    });

    app.querySelectorAll('[data-pos-pay]').forEach(el => el.addEventListener('click', () => {
      const method = el.dataset.posPay;
      const orderId = `ORD-${Math.floor(5000 + Math.random() * 9000)}`;

      const newOrder = {
        id: orderId,
        table: s.data.selectedTable,
        type: s.data.orderType,
        items: Array.isArray(s.data.cart) ? [...s.data.cart] : [],
        status: 'pending',
        method,
        total: cartTotal,
        at: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      };

      s.data.orders.unshift(newOrder);

      const wrap = modal('ใบเสร็จรับเงินอย่างย่อ (Thermal Slip Receipt)', `
        <div class="receipt-slip" style="background:#fff;color:#111;padding:20px;border-radius:12px;font-family:monospace;max-width:360px;margin:auto">
          <div style="text-align:center;border-bottom:1px dashed #333;padding-bottom:12px;margin-bottom:12px">
            <h2 style="margin:0;font-size:20px">Preeya Cafe & Bistro</h2>
            <p style="margin:4px 0;font-size:12px">TAX ID: 0-1055-69001-99-1</p>
            <p style="margin:0;font-size:12px">บิลเลขที่: ${orderId} · โต๊ะ: ${s.data.selectedTable}</p>
            <p style="margin:0;font-size:11px">${today()} ${newOrder.at}</p>
          </div>

          <div style="border-bottom:1px dashed #333;padding-bottom:12px;margin-bottom:12px">
            ${(s.data.cart || []).map(x => `
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span>${x.qty} × ${esc(x.name)}</span>
                <span>${money(x.price * x.qty)}</span>
              </div>
              ${x.details ? `<small style="display:block;color:#555;font-size:10px;margin-bottom:4px">  (${esc(x.details)})</small>` : ''}
            `).join('')}
          </div>

          <div style="font-size:13px;line-height:1.6">
            <div style="display:flex;justify-content:space-between"><span>Subtotal:</span><span>${money(cartSubtotal)}</span></div>
            <div style="display:flex;justify-content:space-between"><span>VAT 7%:</span><span>${money(cartVat)}</span></div>
            <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;margin-top:6px"><span>TOTAL:</span><span>${money(cartTotal)}</span></div>
            <div style="display:flex;justify-content:space-between;margin-top:4px"><span>ชำระโดย:</span><span>${method}</span></div>
          </div>

          <div style="text-align:center;margin-top:16px;font-size:11px;color:#666">
            ขอบคุณที่ใช้บริการค่ะ / Thank you!
          </div>
        </div>
      `, `<div class="form-actions"><button class="btn primary" onclick="window.print()">🖨️ พิมพ์ใบเสร็จสลิป</button></div>`);

      s.data.cart = [];
      s.data.view = 'kds';
      save();
      toast('ส่ง Order เข้าครัว KDS และพิมพ์ใบเสร็จเรียบร้อย');
    }));

    app.querySelectorAll('[data-order-next]').forEach(el => el.addEventListener('click', () => {
      const o = s.data.orders.find(x => x.id === el.dataset.orderNext);
      if (o) {
        o.status = { pending: 'cooking', cooking: 'ready', ready: 'completed' }[o.status] || 'completed';
        save();
        toast(`อัปเดตสถานะออเดอร์ ${o.id} เรียบร้อย`);
      }
    }));

    app.querySelector('[data-kiosk-start]')?.addEventListener('click', () => { s.data.kioskStage = 'menu'; save(); });
    app.querySelector('[data-kiosk-pay]')?.addEventListener('click', () => {
      s.data.kioskStage = 'payment';
      save();
      setTimeout(() => {
        const cur = store('smartpos', smartPosSeed);
        cur.data.orders.unshift({
          id: `Q-${Math.floor(100 + Math.random() * 900)}`,
          table: 'Kiosk',
          type: 'Takeaway',
          items: Array.isArray(cur.data.cart) ? [...cur.data.cart] : [],
          status: 'pending',
          method: 'Kiosk-QR',
          total: cartTotal,
          at: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        });
        cur.data.cart = [];
        cur.data.kioskStage = 'done';
        cur.save();
        renderSmartPos();
      }, 2000);
    });
    app.querySelector('[data-kiosk-new]')?.addEventListener('click', () => { s.data.kioskStage = 'welcome'; save(); });
  }

    const esignSeed = {
    selectedDoc: 'DOC-2026-0430',
    signerName: 'คุณสมศักดิ์ พัฒนากุล',
    signerRole: 'กรรมการผู้จัดการ (Managing Director)',
    companyName: 'บริษัท สยาม อินโนเวชั่น จำกัด',
    withSeal: true,
    signed: null
  };

  const esignDocs = {
    'DOC-2026-0430': {
      title: 'สัญญาจ้างพัฒนาซอฟต์แวร์ (Software Development Agreement)',
      type: 'Service Contract',
      value: '150,000 THB',
      body: `
        <h3>1. ขอบเขตงาน (Scope of Work)</h3>
        <p>ผู้รับจ้างตกลงพัฒนาระบบ Enterprise Web Application พร้อมฐานข้อมูลและ API Integration ตามข้อกำหนดในขอบเขตงานที่ได้รับอนุมัติ</p>
        <h3>2. กำหนดส่งมอบและชำระเงิน (Milestones)</h3>
        <p>งวดที่ 1: 30% ณ วันลงนามสัญญา | งวดที่ 2: 40% หลังส่งมอบ System Prototype | งวดที่ 3: 30% หลัง UAT และขึ้นระบบ</p>
        <h3>3. การรับประกันและดูแล (Warranty & Support)</h3>
        <p>ผู้รับจ้างรับประกันระบบ 12 เดือนนับจากวันตรวจรับงาน พร้อมบริการแก้ไข Bug และดูแล Server Availability 99.9%</p>
      `
    },
    'NDA-2026-0118': {
      title: 'ข้อตกลงไม่เปิดเผยข้อมูลลับ (Non-Disclosure Agreement)',
      type: 'Legal Compliance',
      value: 'Strict Confidentiality',
      body: `
        <h3>1. ข้อมูลลับ (Confidential Information)</h3>
        <p>รวมถึงข้อมูลซอร์สโค้ด แผนธุรกิจ ข้อมูลลูกค้า และข้อมูลทางการเงินทั้งหมดที่เปิดเผยระหว่างการทำงานร่วมกัน</p>
        <h3>2. ข้อกำหนดการใช้งาน (Terms of Use)</h3>
        <p>ผู้รับข้อมูลตกลงรักษาความลับและไม่เปิดเผยต่อบุคคลภายนอกโดยไม่ได้รับความยินยอมเป็นลายลักษณ์อักษร</p>
        <h3>3. ระยะเวลาคุ้มครอง (Duration)</h3>
        <p>ข้อตกลงนี้มีผลบังคับใช้เป็นเวลา 5 ปี นับจากวันลงนามในสัญญา</p>
      `
    },
    'QUO-2026-0899': {
      title: 'ใบอนุมัติสั่งซื้อและเสนอราคา (Approved Quotation)',
      type: 'Purchase Order Approval',
      value: '85,000 THB',
      body: `
        <h3>รายการสินค้าและบริการ (Items Approved)</h3>
        <p>1. คลาวด์เซิร์ฟเวอร์ High Performance Node (1 ปี): 35,000 THB</p>
        <p>2. บริการติดตั้งและย้ายฐานข้อมูล Cloud Migration: 50,000 THB</p>
        <h3>เงื่อนไขการชำระเงิน</h3>
        <p>ชำระเต็มจำนวนภายใน 30 วันนับจากวันที่ได้รับใบแจ้งหนี้ (Credit Term 30 Days)</p>
      `
    }
  };

  function renderEsign() {
    const s = store('esign', esignSeed);
    const save = () => { s.save(); renderEsign(); };
    let drawing = false, dirty = false, ctx = null, canvas = null;

    const currentDoc = esignDocs[s.data.selectedDoc] || esignDocs['DOC-2026-0430'];
    const signed = s.data.signed;

    const views = [
      ['doc', 'หน้าต่างลงนามสัญญา'],
      ['audit', 'ตรวจสอบ Audit Certificate & Hash']
    ];

    let body = '';

    if (signed) {
      body = `<div class="page-pad">
        <section class="signed-mark card" style="max-width:780px;margin:auto;padding:32px;text-align:center">
          <div style="font-size:64px;color:var(--success);margin-bottom:10px">✓</div>
          <p class="eyebrow" style="color:var(--success)">OFFICIALLY SIGNED & VERIFIED</p>
          <h1 style="margin:6px 0 16px">${esc(currentDoc.title)}</h1>
          
          <div class="grid cols-2" style="text-align:left;background:var(--subtle);padding:16px;border-radius:10px;margin:20px 0">
            <div>
              <small class="muted">ผู้ลงนาม (Signer)</small><br>
              <strong>${esc(signed.signerName)}</strong> (${esc(signed.signerRole)})<br>
              <small class="muted">${esc(signed.companyName)}</small>
            </div>
            <div>
              <small class="muted">เวลาและรหัสการลงนาม</small><br>
              <strong>${esc(signed.time)}</strong><br>
              <small class="muted">Hash: ${esc(signed.docHash.slice(0, 24))}...</small>
            </div>
          </div>

          <div style="border:2px dashed var(--line);padding:16px;border-radius:12px;display:inline-block;background:#fff;margin-bottom:20px">
            <img src="${signed.image}" alt="ลายเซ็นดิจิทัล" style="max-height:100px;display:block;margin:auto">
            ${signed.withSeal ? `<div style="font-size:11px;color:var(--brand);margin-top:6px;font-weight:bold">🛡️ ประทับตราบริษัทดิจิทัลเรียบร้อย</div>` : ''}
          </div>

          <div style="display:flex;gap:12px;justify-content:center">
            <button class="btn primary" data-download-pdf>🖨️ ดาวน์โหลด / พิมพ์สัญญา (PDF)</button>
            <button class="btn" data-view-certificate>📜 ดูใบรับรอง Audit Certificate</button>
            <button class="btn danger" data-esign-reset>ล้างสัญญาลองใหม่</button>
          </div>
        </section>
      </div>`;
    } else {
      body = `<div class="page-pad split">
        <section>
          <div class="card" style="margin-bottom:14px;padding:14px">
            <label style="font-size:12px;font-weight:bold" class="muted">เลือกรูปแบบเอกสารสัญญา</label>
            <select class="select" id="doc-selector" style="margin-top:6px">
              ${Object.entries(esignDocs).map(([key, doc]) => `<option value="${key}" ${key === s.data.selectedDoc ? 'selected' : ''}>${doc.title} (${doc.value})</option>`).join('')}
            </select>
          </div>

          <article class="contract-paper card" style="padding:28px">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid var(--line);padding-bottom:12px;margin-bottom:16px">
              <div>
                <p class="eyebrow">${esc(s.data.selectedDoc)} · ${esc(currentDoc.type)}</p>
                <h1 style="font-size:22px;margin:4px 0">${esc(currentDoc.title)}</h1>
              </div>
              ${badge(currentDoc.value, 'primary')}
            </div>

            ${currentDoc.body}

            <div style="margin-top:24px;border-top:1px dashed var(--line);padding-top:16px">
              <p class="muted" style="font-size:12px">การลงนามในเอกสารนี้ถือเป็นลายมือชื่อดิจิทัลที่มีผลผูกพันตามกฎหมาย พ.ร.บ. ว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์</p>
            </div>
          </article>
        </section>

        <aside class="card sidebar-card">
          <h2>ข้อมูลผู้ลงนาม & ลายเซ็น</h2>
          
          <form id="signer-info-form" class="form-grid" style="margin-bottom:14px">
            <div class="field" style="grid-column:1/-1">
              <label>ชื่อ-นามสกุล ผู้ลงนาม</label>
              <input class="input" id="signer-name" value="${esc(s.data.signerName)}" required>
            </div>
            <div class="field" style="grid-column:1/-1">
              <label>ตำแหน่ง</label>
              <input class="input" id="signer-role" value="${esc(s.data.signerRole)}" required>
            </div>
            <div class="field" style="grid-column:1/-1">
              <label>ชื่อบริษัท / หน่วยงาน</label>
              <input class="input" id="company-name" value="${esc(s.data.companyName)}" required>
            </div>
            <div class="field" style="grid-column:1/-1">
              <label><input type="checkbox" id="seal-toggle" ${s.data.withSeal ? 'checked' : ''}> แนบตราประทับบริษัทดิจิทัล (Digital Company Seal)</label>
            </div>
          </form>

          <div class="card-head" style="margin-top:10px">
            <div><p class="eyebrow">Signature Pad</p><h3 style="margin:0">กล่องจรดลายเซ็น</h3></div>
            <button class="btn small" data-clear-sign>ล้างใหม่</button>
          </div>

          <canvas class="signature-pad" id="signature-pad" style="border:2px dashed var(--brand);border-radius:8px;width:100%;height:150px;background:#fff;margin:10px 0;cursor:crosshair"></canvas>
          <p class="muted" style="font-size:11px">ใช้นิ้ว เมาส์ หรือปากกา Stylus วาดลายเซ็นภายในกล่อง</p>

          <button class="btn primary" style="width:100%;margin-top:10px" data-submit-sign disabled>✍️ ยืนยันการลงนามสัญญา</button>
        </aside>
      </div>`;
    }

    app.innerHTML = `<div class="app-shell">${appHeader('Lite E-Signature', `${esc(s.data.selectedDoc)} · ระบบลงนามเอกสารสัญญาออนไลน์พร้อม Audit Trail`, [], '', `<button class="btn small danger" data-esign-reset>รีเซ็ตข้อมูล</button>`)}${body}</div>`;

    app.querySelector('#doc-selector')?.addEventListener('change', (e) => {
      s.data.selectedDoc = e.target.value;
      save();
    });

    app.querySelector('#signer-name')?.addEventListener('input', (e) => { s.data.signerName = e.target.value; s.save(); });
    app.querySelector('#signer-role')?.addEventListener('input', (e) => { s.data.signerRole = e.target.value; s.save(); });
    app.querySelector('#company-name')?.addEventListener('input', (e) => { s.data.companyName = e.target.value; s.save(); });
    app.querySelector('#seal-toggle')?.addEventListener('change', (e) => { s.data.withSeal = e.target.checked; s.save(); });

    app.querySelector('[data-esign-reset]')?.addEventListener('click', () => {
      if (confirm('ยกเลิกลายเซ็นและรีเซ็ตสัญญา?')) {
        s.reset();
        renderEsign();
      }
    });

    if (!signed) {
      canvas = app.querySelector('#signature-pad');
      if (canvas) {
        ctx = canvas.getContext('2d');
        const resize = () => {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          const rect = canvas.getBoundingClientRect();
          canvas.width = rect.width * ratio;
          canvas.height = rect.height * ratio;
          ctx.scale(ratio, ratio);
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.strokeStyle = '#0f172a';
        };
        resize();

        const point = (e) => {
          const r = canvas.getBoundingClientRect();
          const p = e.touches?.[0] || e;
          return [p.clientX - r.left, p.clientY - r.top];
        };

        const start = (e) => {
          e.preventDefault();
          drawing = true;
          const [x, y] = point(e);
          ctx.beginPath();
          ctx.moveTo(x, y);
        };

        const move = (e) => {
          if (!drawing) return;
          e.preventDefault();
          const [x, y] = point(e);
          ctx.lineTo(x, y);
          ctx.stroke();
          dirty = true;
          const btn = app.querySelector('[data-submit-sign]');
          if (btn) btn.disabled = false;
        };

        const end = () => drawing = false;

        ['pointerdown', 'touchstart'].forEach(n => canvas.addEventListener(n, start, { passive: false }));
        ['pointermove', 'touchmove'].forEach(n => canvas.addEventListener(n, move, { passive: false }));
        ['pointerup', 'pointerleave', 'touchend'].forEach(n => canvas.addEventListener(n, end));

        app.querySelector('[data-clear-sign]')?.addEventListener('click', () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          dirty = false;
          const btn = app.querySelector('[data-submit-sign]');
          if (btn) btn.disabled = true;
        });

        app.querySelector('[data-submit-sign]')?.addEventListener('click', () => {
          if (!dirty) return;
          const docHash = 'sha256:' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + 'e3b0c442';
          s.data.signed = {
            image: canvas.toDataURL('image/png'),
            time: new Date().toLocaleString('th-TH'),
            signerName: s.data.signerName || 'คุณสมศักดิ์ พัฒนากุล',
            signerRole: s.data.signerRole || 'กรรมการผู้จัดการ',
            companyName: s.data.companyName || 'บริษัท สยาม อินโนเวชั่น จำกัด',
            withSeal: s.data.withSeal,
            docHash,
            ip: '182.52.198.42',
            location: 'Bangkok, Thailand'
          };
          save();
          toast('ลงนามในเอกสารสัญญาเรียบร้อยแล้ว');
        });
      }
    }

    app.querySelector('[data-view-certificate]')?.addEventListener('click', () => {
      modal('ใบรับรอง Audit Trail Certificate', `
        <div style="padding:16px;background:var(--subtle);border-radius:10px;font-family:monospace;font-size:13px;line-height:1.8">
          <h3 style="margin:0 0 10px;color:var(--brand)">📜 E-SIGNATURE AUDIT TRAIL LOG</h3>
          <div><strong>Document ID:</strong> ${esc(s.data.selectedDoc)}</div>
          <div><strong>Document Title:</strong> ${esc(currentDoc.title)}</div>
          <div><strong>Signer Name:</strong> ${esc(signed?.signerName)} (${esc(signed?.signerRole)})</div>
          <div><strong>Organization:</strong> ${esc(signed?.companyName)}</div>
          <div><strong>Signed Timestamp:</strong> ${esc(signed?.time)}</div>
          <div><strong>IP Address:</strong> ${esc(signed?.ip)}</div>
          <div><strong>Geo Location:</strong> ${esc(signed?.location)}</div>
          <div style="word-break:break-all;margin-top:8px"><strong>SHA-256 Checksum:</strong><br><span style="color:var(--success)">${esc(signed?.docHash)}</span></div>
          <div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--line);color:var(--muted)">
            Status: VALID & Cryptographically Sealed via SHA-256
          </div>
        </div>
      `);
    });

    app.querySelector('[data-download-pdf]')?.addEventListener('click', () => {
      window.print();
    });
  }

  const dashboardSeed = {
    search: '', transactions: [
      { id: 'TRX-1001', name: 'สมชาย ใจดี', email: 'somchai@example.com', amount: 12500, status: 'สำเร็จ', date: '28 ก.ค. 2569' },
      { id: 'TRX-1002', name: 'พิมพ์ชนก แสงทอง', email: 'pim@example.com', amount: 8400, status: 'รอดำเนินการ', date: '29 ก.ค. 2569' },
      { id: 'TRX-1003', name: 'John Carter', email: 'john@example.com', amount: 22100, status: 'สำเร็จ', date: '29 ก.ค. 2569' },
      { id: 'TRX-1004', name: 'บริษัท นอร์ธ จำกัด', email: 'north@example.com', amount: 32000, status: 'ยกเลิก', date: '30 ก.ค. 2569' },
      { id: 'TRX-1005', name: 'วรพล มีทรัพย์', email: 'worapon@example.com', amount: 15900, status: 'สำเร็จ', date: '31 ก.ค. 2569' },
    ]
  };
  function renderDashboard() {
    const s = store('dashboard', dashboardSeed); const save = () => { s.save(); renderDashboard(); }; const list = s.data.transactions.filter(x => `${x.name} ${x.email} ${x.id}`.toLowerCase().includes(s.data.search.toLowerCase())); const revenue = s.data.transactions.filter(x => x.status === 'สำเร็จ').reduce((a, x) => a + x.amount, 0); const success = s.data.transactions.length ? s.data.transactions.filter(x => x.status === 'สำเร็จ').length / s.data.transactions.length * 100 : 0;
    app.innerHTML = `<div class="app-shell">${appHeader('NexusDash', 'Archive dashboard demo', [], '', `<button class="btn small" data-add-trx>+ เพิ่มตัวอย่าง</button><button class="btn small danger" data-dash-reset>รีเซ็ต</button>`)}<div class="page-pad"><div class="grid cols-3"><article class="card stat-card"><small>Revenue</small><strong>${money(revenue)}</strong></article><article class="card stat-card"><small>Transactions</small><strong>${s.data.transactions.length}</strong></article><article class="card stat-card"><small>Success rate</small><strong>${success.toFixed(0)}%</strong></article></div><section class="card" style="margin-top:16px"><div class="toolbar"><h2>Transactions</h2><input class="input" id="dash-search" style="max-width:340px" placeholder="ค้นหาชื่อ email หรือ ID" value="${esc(s.data.search)}"></div><div class="table-wrap"><table><thead><tr><th>ID</th><th>ลูกค้า</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>${list.map(x => `<tr><td>${esc(x.id)}</td><td><strong>${esc(x.name)}</strong><br><small>${esc(x.email)}</small></td><td>${money(x.amount)}</td><td>${badge(x.status, x.status === 'สำเร็จ' ? 'success' : x.status === 'ยกเลิก' ? 'danger' : 'warning')}</td><td>${esc(x.date)}</td><td><button class="btn small danger" data-delete-trx="${x.id}">ลบ</button></td></tr>`).join('')}</tbody></table></div></section></div></div>`;
    app.querySelector('#dash-search')?.addEventListener('input', (e) => { s.data.search = e.target.value; s.save(); renderDashboard(); document.querySelector('#dash-search')?.focus(); });
    app.querySelector('[data-dash-reset]')?.addEventListener('click', () => { if (confirm('คืนข้อมูล dashboard?')) { s.reset(); renderDashboard(); } });
    app.querySelector('[data-add-trx]')?.addEventListener('click', () => { s.data.transactions.unshift({ id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`, name: 'Demo Customer', email: 'demo@example.com', amount: 9800, status: 'สำเร็จ', date: today() }); save(); });
    app.querySelectorAll('[data-delete-trx]').forEach(el => el.addEventListener('click', () => { if (confirm('ลบรายการนี้?')) { s.data.transactions = s.data.transactions.filter(x => x.id !== el.dataset.deleteTrx); save(); } }));
  }

  const classicProducts = posProducts.slice(0, 9).map((x, i) => ({ ...x, code: `F${String(i + 1).padStart(3, '0')}` }));
  const classicSeed = { view: 'cashier', cart: {}, orders: [], search: '', payment: 'cash', received: 0 };
  function renderClassicPos() {
    const s = store('classicpos', classicSeed); const save = () => { s.save(); renderClassicPos(); }; const lines = Object.entries(s.data.cart).map(([pid, qty]) => ({ ...classicProducts.find(x => x.id === pid), qty })).filter(x => x.id); const sub = lines.reduce((a, x) => a + x.price * x.qty, 0); const total = sub * 1.07; let body = '';
    if (s.data.view === 'cashier') body = `<div class="page-pad split"><section><div class="toolbar"><h2>Cashier</h2><input class="input" id="classic-search" style="max-width:300px" placeholder="ค้นหาชื่อ ไทย หรือ code" value="${esc(s.data.search)}"></div><div class="product-grid">${classicProducts.filter(x => `${x.name} ${x.code}`.toLowerCase().includes(s.data.search.toLowerCase())).map(p => `<article class="product-card"><span class="badge">${esc(p.code)}</span><h3>${esc(p.name)}</h3><p class="muted">${esc(p.cat)}</p><div class="summary-line"><strong>${money(p.price)}</strong><button class="btn small primary" data-classic-add="${p.id}">เพิ่ม</button></div></article>`).join('')}</div></section><aside class="card sidebar-card"><h2>รายการขาย</h2>${lines.map(x => `<div class="cart-line"><span>${x.qty} × ${esc(x.name)}</span><strong>${money(x.qty * x.price)}</strong></div>`).join('') || '<div class="empty">ไม่มีสินค้า</div>'}<div class="summary-line"><span>VAT 7%</span><strong>${money(sub * .07)}</strong></div><div class="summary-line total"><span>Total</span><strong>${money(total)}</strong></div><div class="field"><label>Payment</label><select class="select" id="classic-payment"><option value="cash">Cash</option><option value="credit">Credit</option><option value="qr">QR</option></select></div>${s.data.payment === 'cash' ? `<div class="field"><label>Received</label><input class="input" id="classic-received" type="number" value="${s.data.received}"><small class="muted">Change: ${money(Math.max(0, s.data.received - total))}</small></div>` : ''}<button class="btn primary" style="width:100%;margin-top:14px" data-classic-confirm ${lines.length && (s.data.payment !== 'cash' || s.data.received >= total) ? '' : 'disabled'}>Confirm payment</button></aside></div>`;
    else body = `<div class="page-pad"><div class="grid cols-3"><article class="card stat-card"><small>Total sales</small><strong>${money(s.data.orders.reduce((a, x) => a + x.total, 0))}</strong></article><article class="card stat-card"><small>Transactions</small><strong>${s.data.orders.length}</strong></article><article class="card stat-card"><small>Average</small><strong>${money(s.data.orders.length ? s.data.orders.reduce((a, x) => a + x.total, 0) / s.data.orders.length : 0)}</strong></article></div><section class="card" style="margin-top:16px"><h2>Admin</h2><div class="tabs"><button class="tab active">Overview</button><button class="tab">Transactions</button><button class="tab">Catalog</button><button class="tab">Staff</button><button class="tab">Settings</button></div><p class="notice" style="margin-top:18px">Tabs อื่นเป็น mock ตาม baseline ของระบบเดิม</p></section></div>`;
    app.innerHTML = `<div class="app-shell">${appHeader('OmniPOS Classic', 'Archive POS demo', [['cashier', 'Cashier'], ['admin', 'Admin']], s.data.view, `<button class="btn small danger" data-classic-reset>รีเซ็ต</button>`)}${body}</div>`;
    app.querySelectorAll('[data-tab]').forEach(el => el.addEventListener('click', () => { s.data.view = el.dataset.tab; save(); }));
    app.querySelector('#classic-search')?.addEventListener('input', (e) => { s.data.search = e.target.value; s.save(); renderClassicPos(); document.querySelector('#classic-search')?.focus(); });
    app.querySelectorAll('[data-classic-add]').forEach(el => el.addEventListener('click', () => { s.data.cart[el.dataset.classicAdd] = (s.data.cart[el.dataset.classicAdd] || 0) + 1; save(); }));
    app.querySelector('#classic-payment')?.addEventListener('change', (e) => { s.data.payment = e.target.value; save(); });
    app.querySelector('#classic-received')?.addEventListener('input', (e) => { s.data.received = Number(e.target.value); s.save(); renderClassicPos(); document.querySelector('#classic-received')?.focus(); });
    app.querySelector('[data-classic-confirm]')?.addEventListener('click', () => { s.data.orders.push({ id: `TRX-${Math.floor(100000 + Math.random() * 900000)}`, items: lines, total, method: s.data.payment }); s.data.cart = {}; s.data.received = 0; save(); toast('ชำระเงินสำเร็จ'); });
    app.querySelector('[data-classic-reset]')?.addEventListener('click', () => { if (confirm('คืนข้อมูล OmniPOS?')) { s.reset(); renderClassicPos(); } });
  }

  function renderExternal(kind) {
    const source = kind === 'ecommerce'
      ? 'https://ecommerce-codex-demo.vercel.app/'
      : 'https://openai-landing-page-examples.vercel.app/tilt-signal-arcade-bar';
    app.innerHTML = `<iframe class="external-frame" src="${source}" title="${kind === 'ecommerce' ? 'OAI Apparel Storefront' : 'Tilt Signal Arcade Bar'}"></iframe>`;
  }

  const handlers = {
    portal: renderPortal,
    crm: renderCrm,
    'shipping-home': renderShippingHome,
    'shipping-admin': renderShippingAdmin,
    'shipping-customer': renderShippingCustomer,
    course: renderCourse,
    wms: renderWms,
    kanban: renderKanban,
    smartpos: renderSmartPos,
    esign: renderEsign,
    dashboard: renderDashboard,
    classicpos: renderClassicPos,
    'external-ecommerce': () => renderExternal('ecommerce'),
    'external-tilt': () => renderExternal('tilt'),
  };

  if (app && handlers[page]) handlers[page]();
})();
