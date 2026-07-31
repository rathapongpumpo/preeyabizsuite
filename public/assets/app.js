(() => {
  'use strict';

  const app = document.getElementById('app');
  const page = document.body.dataset.page || 'portal';
  const route = document.body.dataset.route || '/';
  const projects = window.DEMO_PROJECTS || {};

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
    const key = `preeya_php_demo_v1:${name}`;
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
    localStorage.setItem('preeya_php_demo_v1:theme', theme);
  }

  setTheme(localStorage.getItem('preeya_php_demo_v1:theme') || 'dark');

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

  const shippingSeed = {
    packages: [
      {id:'PKG-1',tracking:'US-123456789',customer:'CUST-01',weight:1.5,boxes:1,status:0,image:'📦',timeline:[{status:0,at:today()}]},
      {id:'PKG-2',tracking:'US-987654321',customer:'CUST-01',weight:5.2,boxes:2,status:1,image:'📦',timeline:[{status:0,at:'28 ก.ค. 2569'},{status:1,at:today()}]},
      {id:'PKG-3',tracking:'US-555555555',customer:'CUST-02',weight:10,boxes:3,status:2,image:'📦',timeline:[{status:0,at:'27 ก.ค. 2569'},{status:1,at:'29 ก.ค. 2569'},{status:2,at:today()}]},
    ]
  };
  const shippingStatuses = ['รับของที่โกดัง US','กำลังเดินทางมาไทย','ถึงโกดังไทย','จัดส่งให้ลูกค้าแล้ว'];

  function renderShippingHome() {
    app.innerHTML = `<div class="shipping-choice"><div class="choice-wrap"><p class="eyebrow">USA–THAI SHIPPING</p><h1>เลือกพื้นที่ใช้งาน</h1><p class="muted">ข้อมูลทั้งหมดเก็บอยู่ใน browser เครื่องนี้ เหมาะสำหรับทดลองระบบ</p><div class="choice-grid" style="margin-top:26px">
      <a class="choice-card" href="/usa-thai-shipping/admin"><span class="stat-icon">⚙</span><h2>Admin Portal</h2><p class="muted">เพิ่มพัสดุ อัปเดตสถานะ และสรุปข้อมูลลูกค้า</p><strong>เปิดหลังบ้าน →</strong></a>
      <a class="choice-card" href="/usa-thai-shipping/customer"><span class="stat-icon">⌖</span><h2>Customer Portal</h2><p class="muted">ค้นหาด้วย Customer ID และดู timeline พัสดุ</p><strong>ติดตามพัสดุ →</strong></a>
    </div></div></div>`;
  }

  function renderShippingAdmin() {
    const s=store('shipping',shippingSeed);
    const render=()=>renderShippingAdmin();
    const totalWeight=s.data.packages.reduce((a,x)=>a+Number(x.weight),0);
    app.innerHTML=`<div class="app-shell">${appHeader('Shipping Admin Portal','จัดการพัสดุ USA → Thailand',[], '', `<a class="btn small" href="/usa-thai-shipping/customer">หน้าลูกค้า</a><button class="btn small" data-add-package>+ เพิ่มพัสดุ</button><button class="btn small danger" data-reset>รีเซ็ต</button>`)}
      <div class="page-pad"><div class="grid cols-3">
        <article class="card stat-card"><small>Packages</small><strong>${s.data.packages.length}</strong><small>รายการทั้งหมด</small></article>
        <article class="card stat-card"><small>Boxes</small><strong>${s.data.packages.reduce((a,x)=>a+x.boxes,0)}</strong><small>กล่อง</small></article>
        <article class="card stat-card"><small>Total weight</small><strong>${totalWeight.toFixed(1)} kg</strong><small>น้ำหนักรวม</small></article>
      </div><section class="card" style="margin-top:16px"><div class="card-head"><h2>รายการพัสดุ</h2>${badge('Client storage')}</div>
      <div class="table-wrap"><table><thead><tr><th>Tracking</th><th>Customer</th><th>พัสดุ</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>
      ${s.data.packages.map((p)=>`<tr><td><strong>${esc(p.tracking)}</strong></td><td>${esc(p.customer)}</td><td>${p.weight} kg · ${p.boxes} กล่อง</td><td><select class="select" data-package-status="${p.id}">${shippingStatuses.map((x,i)=>`<option value="${i}" ${i===p.status?'selected':''}>${esc(x)}</option>`).join('')}</select></td><td><button class="btn small" data-line="${p.customer}">สร้างข้อความ LINE</button></td></tr>`).join('')}
      </tbody></table></div></section></div></div>`;
    app.querySelector('[data-reset]')?.addEventListener('click',()=>{if(confirm('คืนข้อมูลพัสดุเริ่มต้น?')){s.reset();render();}});
    app.querySelector('[data-add-package]')?.addEventListener('click',()=>{
      const wrap=modal('เพิ่มพัสดุ',`<form id="package-form" class="form-grid">
        <div class="field"><label>Tracking no.</label><input class="input" name="tracking" placeholder="เว้นว่างเพื่อสุ่ม"></div>
        <div class="field"><label>Customer ID</label><input class="input" name="customer" value="CUST-03" required></div>
        <div class="field"><label>Weight (kg)</label><input class="input" type="number" min="0" step=".1" name="weight" value="1" required></div>
        <div class="field"><label>Boxes</label><input class="input" type="number" min="1" name="boxes" value="1" required></div>
        <div class="form-actions" style="grid-column:1/-1"><button class="btn primary">บันทึกพัสดุ</button></div></form>`);
      wrap.querySelector('form').addEventListener('submit',(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);const tracking=String(f.get('tracking')||`US-${Math.floor(100000000+Math.random()*900000000)}`).trim().toUpperCase();const customer=String(f.get('customer')||'').trim().toUpperCase();if(!customer)return;s.data.packages.unshift({id:id('PKG'),tracking,customer,weight:Number(f.get('weight'))||0,boxes:Math.max(1,Number(f.get('boxes'))||1),status:0,image:'📦',timeline:[{status:0,at:today()}]});s.save();wrap.remove();render();toast('เพิ่มพัสดุแล้ว');});
    });
    app.querySelectorAll('[data-package-status]').forEach((el)=>el.addEventListener('change',()=>{
      const p=s.data.packages.find(x=>x.id===el.dataset.packageStatus);
      const st=Number(el.value);
      if(p&&p.status!==st){
        p.status=st;
        for (let i = 0; i <= st; i++) {
          if (!p.timeline.some(x => x.status === i)) {
            p.timeline.push({ status: i, at: today() });
          }
        }
        s.save();render();
      }
    }));
    app.querySelectorAll('[data-line]').forEach((el)=>el.addEventListener('click',()=>{const list=s.data.packages.filter(x=>x.customer===el.dataset.line);const text=`Customer ${el.dataset.line}\nพัสดุ ${list.length} รายการ\n${list.map(x=>`${x.tracking}: ${shippingStatuses[x.status]}`).join('\n')}`;modal('ข้อความ LINE (ตัวอย่าง)',`<textarea class="textarea" style="min-height:180px">${esc(text)}</textarea><p class="muted">เดโมนี้ไม่ส่ง LINE จริง</p>`);}));
  }

  function renderShippingCustomer() {
    const s=store('shipping',shippingSeed); let query='CUST-01';
    const draw=()=>{
      const list=s.data.packages.filter((x)=>x.customer===query.trim().toUpperCase());
      app.innerHTML=`<div class="app-shell">${appHeader('Customer Tracking','ตรวจสอบสถานะด้วย Customer ID',[], '', `<a class="btn small" href="/usa-thai-shipping/admin">Admin</a>`)}
      <div class="page-pad"><div class="card"><form id="track-form" class="toolbar"><div class="field" style="flex:1"><label>Customer ID</label><input class="input" name="customer" value="${esc(query)}" placeholder="เช่น CUST-01"></div><button class="btn primary">ค้นหา</button></form><div class="chip-row"><button class="chip" data-mock-id="CUST-01">CUST-01</button><button class="chip" data-mock-id="CUST-02">CUST-02</button></div></div>
      <div style="margin-top:16px">${list.length?`<div class="grid cols-2">${list.map((p)=>`<article class="card"><div class="card-head"><div><p class="eyebrow">${esc(p.customer)}</p><h2>${esc(p.tracking)}</h2></div><span style="font-size:38px">📦</span></div><div class="summary-line"><span>น้ำหนัก</span><strong>${p.weight} kg</strong></div><div class="summary-line"><span>จำนวน</span><strong>${p.boxes} กล่อง</strong></div><h3 style="margin-top:18px">Timeline</h3><div class="timeline">${shippingStatuses.map((status,i)=>`<div class="timeline-item ${i<p.status?'done':i===p.status?'current':''}"><strong>${esc(status)}</strong><p class="muted">${esc(p.timeline.find(x=>x.status===i)?.at||'รอดำเนินการ')}</p></div>`).join('')}</div></article>`).join('')}</div>`:`<div class="empty"><div><h2>ไม่พบพัสดุ</h2><p>ตรวจสอบ Customer ID แล้วลองอีกครั้ง</p></div></div>`}</div></div></div>`;
      app.querySelector('#track-form')?.addEventListener('submit',(e)=>{e.preventDefault();query=String(new FormData(e.currentTarget).get('customer')||'').toUpperCase();draw();});
      app.querySelectorAll('[data-mock-id]').forEach((el)=>el.addEventListener('click',()=>{query=el.dataset.mockId;draw();}));
    }; draw();
  }

  const courseSeed = {
    role: 'student', view: 'home', cart: [], orders: [],
    owned: ['C-101', 'C-102', 'C-103', 'C-104', 'C-105', 'C-106', 'C-201'],
    progress: {}, selected: 'C-101', selectedLesson: 0, search: '', category: 'All',
    courses: [
      {
        id: 'C-101', title: 'รามเกียรติ์ | EP.1 - กำเนิดทศกัณฐ์และปฐมบทกรุงลงกา', price: 990, category: 'วรรณคดีไทย / ตำนาน', channel: 'Lore Universe',
        thumbnail: 'https://img.youtube.com/vi/g4mZ6P6E_m0/hqdefault.jpg',
        description: 'ศึกษาที่มาและกำเนิดของทศกัณฐ์ วงศ์ยักษ์แห่งกรุงลงกา อภินิหารนนทกกับนิ้วเพชร และการอวตารของพระนารายณ์',
        lessons: [
          { title: 'ปฐมบท: กำเนิดทศกัณฐ์และวงศ์ยักษ์แห่งลงกา', youtubeId: 'g4mZ6P6E_m0', duration: '15:20', summary: 'เจาะลึกพงศาวดารยักษ์ ต้นตระกูลของทศกัณฐ์ และกำเนิดกรุงลงกาตามตำนานรามเกียรติ์' },
          { title: 'นนทกกับนิ้วเพชร: จุดเริ่มต้นแห่งแรงเคียดแค้น', youtubeId: 'g4mZ6P6E_m0', duration: '12:45', summary: 'เรื่องราวของนนทกผู้ล้างเท้าเทวดาที่ได้รับพรนิ้วเพชรชี้ตายจากพระอิศวร จนเกิดความแค้นต่อนางฟ้าเทวดา' },
          { title: 'พระนารายณ์อวตารปราบนนทกและคำสัตย์แห่งชาติภพ', youtubeId: 'g4mZ6P6E_m0', duration: '14:10', summary: 'พระนารายณ์แปลงกายเป็นนางสุพรรณอัปสรมาล่อลวงนนทกร่ายรำ จนชี้ขาตนเองขาด และคำตั้งจิตเกิดเป็นทศกัณฐ์' }
        ]
      },
      {
        id: 'C-102', title: 'รามเกียรติ์ | EP.2 - เมขลา-รามสูร & พาลีสุครีพยกเขาพระสุเมรุ', price: 850, category: 'วรรณคดีไทย / ตำนาน', channel: 'Lore Universe',
        thumbnail: 'https://img.youtube.com/vi/FWNUMRAnMAz/hqdefault.jpg',
        description: 'ตำนานการต่อสู้ระหว่างนางมณีเมขลาและรามสูรผู้ถือขวานเพชร พร้อมอภินิหารพาลีสุครีพในการยกเขาพระสุเมรุ',
        lessons: [
          { title: 'เมขลาและรามสูร: ที่มาของฟ้าแลบและฟ้าผ่า', youtubeId: 'FWNUMRAnMAz', duration: '11:30', summary: 'การชิงดวงแก้วมณีของนางเมขลา และขวานเพชรขว้างกระทบเกิดเป็นฟ้าแลบฟ้าผ่า' },
          { title: 'พาลีสุครีพยกเขาพระสุเมรุและพรแห่งเขาไกรลาส', youtubeId: 'FWNUMRAnMAz', duration: '16:05', summary: 'เรื่องราวของสองวานรพี่น้อง พาลีและสุครีพ ในภารกิจช่วยยกเขาพระสุเมรุให้กลับคืนตั้งตรง' },
          { title: 'ศึกปราบตรีบูรัม: มหาอภินิหารแห่งทวยเทพ', youtubeId: 'FWNUMRAnMAz', duration: '13:50', summary: 'การปราบอสูรตรีบูรัมผู้มีเมืองสามจดฟ้าด้วยศรทรงอนันตฤทธิ์ของพระอิศวร' }
        ]
      },
      {
        id: 'C-103', title: 'รามเกียรติ์ | EP.3 - มหาศึกถล่มวังบาดาล & ทศกัณฐ์ครองเมือง', price: 920, category: 'วรรณคดีไทย / ตำนาน', channel: 'Lore Universe',
        thumbnail: 'https://img.youtube.com/vi/En0ynUfYzJb/hqdefault.jpg',
        description: 'การยกทัพถล่มเมืองบาดาลของทศกัณฐ์ ชัยชนะในการแผ่ขยายอำนาจยักษ์ และฤกษ์ขึ้นครองราชย์กรุงลงกา',
        lessons: [
          { title: 'ทศกัณฐ์ถล่มวังบาดาลและอิทธิฤทธิ์ท้าวนาคราช', youtubeId: 'En0ynUfYzJb', duration: '14:15', summary: 'มหาสงครามแย่งชิงความยิ่งใหญ่ระหว่างทศกัณฐ์กับเหล่าวายะนาคในวังบาดาล' },
          { title: 'ทศกัณฐ์ขึ้นครองกรุงลงกาและพิธีถอดดวงใจ', youtubeId: 'En0ynUfYzJb', duration: '17:40', summary: 'เบื้องหลังอภินิหารอมตะของทศกัณฐ์โดยนำดวงใจไปฝากไว้กับพระฤาษีกอบุตม์' }
        ]
      },
      {
        id: 'C-104', title: 'รามเกียรติ์ | EP.4 - ศึกชิงนางมณโฑ & กำเนิดองคต', price: 890, category: 'วรรณคดีไทย / ตำนาน', channel: 'Lore Universe',
        thumbnail: 'https://img.youtube.com/vi/fmbRr7MqC-J/hqdefault.jpg',
        description: 'เรื่องราวของนางมณโฑมเหสีคู่บุญทศกัณฐ์ การแย่งชิงของพาลี และการกำเนิดขององคตวานรยอดขุนพล',
        lessons: [
          { title: 'กำเนิดนางมณโฑและพิธีหุงกบสร้างมเหสี', youtubeId: 'fmbRr7MqC-J', duration: '13:10', summary: 'ประวัติกบตัวน้อยที่กตัญญูจนฤาษีชุบชีวิตให้กลายเป็นนางสวรรค์มณโฑ' },
          { title: 'พาลีชิงนางมณโฑและการกำเนิดองคต', youtubeId: 'fmbRr7MqC-J', duration: '15:25', summary: 'พาลีใช้อิทธิฤทธิ์ชิงนางมณโฑระหว่างทาง จนเกิดบุตรชายคือนครองคต' }
        ]
      },
      {
        id: 'C-105', title: 'รามเกียรติ์ | EP.8 - ศึกทรพา ทรพี & ไมยราพถอดดวงใจ', price: 990, category: 'วรรณคดีไทย / ตำนาน', channel: 'Lore Universe',
        thumbnail: 'https://img.youtube.com/vi/Hvi6nuyM3DF/hqdefault.jpg',
        description: 'ศึกอกตัญญูระหว่างควายทรพากับทรพี และการถอดดวงใจเป็นแมลงวันของไมยราพเจ้าแห่งเมืองบาดาล',
        lessons: [
          { title: 'กำเนิดทรพาและอภินิหารทรพีฆ่าพ่อ', youtubeId: 'Hvi6nuyM3DF', duration: '16:30', summary: 'ที่มาของคำว่า "ทรพี" จากควายลูกที่ท้าทายฆ่าพ่อตนเองเพื่อความเป็นใหญ่' },
          { title: 'ศึกทรพีปะทะพาลีในถ้ำและโลหิตสีใส', youtubeId: 'Hvi6nuyM3DF', duration: '18:10', summary: 'พาลีลงไปสู้กับทรพีในถ้ำจนเลือดไหลข้นปากถ้ำ เป็นเหตุให้สุครีพเข้าใจผิดว่าพาลีสิ้นชีพ' },
          { title: 'ไมยราพถอดดวงใจสะกดทัพพระราม', youtubeId: 'Hvi6nuyM3DF', duration: '14:45', summary: 'เล่ห์กลยักษ์บาดาลไมยราพเป่ายาสะกดกองทัพและอุ้มพระรามลงบาดาล' }
        ]
      },
      {
        id: 'C-106', title: 'รามเกียรติ์ | EP.13 - ศึกกากนาสูร & กำเนิดพระราม', price: 950, category: 'วรรณคดีไทย / ตำนาน', channel: 'Lore Universe',
        thumbnail: 'https://img.youtube.com/vi/HMy0cfaovxl/hqdefault.jpg',
        description: 'พระนารายณ์อวตารลงมาเป็นพระรามแห่งอโยธยา พร้อมปฐมศึกแรกของพระรามพระลักษมณ์ในการปราบกากนาสูร',
        lessons: [
          { title: 'พิธีหุงข้าวทิพย์และการอวตารของพระนารายณ์', youtubeId: 'HMy0cfaovxl', duration: '15:50', summary: 'ท้าวทศรถจัดพิธีหุงข้าวทิพย์เพื่อขอบุตร เกิดเป็นสี่กุมาร พระราม พระลักษมณ์ พระพรต พระสัตรุด' },
          { title: 'ศึกกากนาสูร: การทดสอบศรครั้งแรกของพระราม', youtubeId: 'HMy0cfaovxl', duration: '13:20', summary: 'นางยักษ์กากนาสูรแปลงเป็นกาใหญ่ก่อกวนพิธีฤาษี พระรามทรงแผลงศรพรหมมาสตร์ประหาร' }
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
              ${c.thumbnail ? `<div class="course-art-thumb"><img src="${esc(c.thumbnail)}" alt="${esc(c.title)}"><span class="play-badge">▶</span></div>` : `<div class="course-art">${i + 1}</div>`}
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
              <div class="summary-line" style="margin-top:14px">
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
    view: 'dashboard', search: '', inventory: [
      { sku: 'EL-001', name: 'Wireless Barcode Scanner', category: 'Electronics', stock: 24, location: 'A-01', price: 2890 },
      { sku: 'EL-002', name: 'Thermal Label Printer', category: 'Electronics', stock: 7, location: 'A-02', price: 4590 },
      { sku: 'FU-001', name: 'Industrial Shelf 5 Tier', category: 'Furniture', stock: 18, location: 'B-01', price: 7200 },
      { sku: 'ST-001', name: 'Shipping Label A6', category: 'Stationery', stock: 160, location: 'C-01', price: 320 },
      { sku: 'ST-002', name: 'Packing Tape Clear', category: 'Stationery', stock: 9, location: 'C-02', price: 85 },
      { sku: 'NW-001', name: 'Gigabit Switch 24 Port', category: 'Networking', stock: 4, location: 'D-01', price: 5900 },
      { sku: 'NW-002', name: 'CAT6 Cable 305m', category: 'Networking', stock: 0, location: 'D-02', price: 3100 },
      { sku: 'EL-003', name: 'Handheld Terminal', category: 'Electronics', stock: 12, location: 'A-03', price: 12900 },
    ]
  };

  function renderWms() {
    const s = store('wms', wmsSeed); const save = () => { s.save(); renderWms(); };
    const views = [['dashboard', 'Dashboard'], ['inventory', 'Inventory'], ['inbound', 'Inbound'], ['outbound', 'Outbound'], ['suppliers', 'Suppliers'], ['reports', 'Reports'], ['staff', 'Staff'], ['settings', 'Settings']];
    const filtered = s.data.inventory.filter(x => `${x.name} ${x.sku}`.toLowerCase().includes((s.data.search || '').toLowerCase()));
    let body = '';
    if (s.data.view === 'dashboard') {
      const value = s.data.inventory.reduce((a, x) => a + x.stock * x.price, 0); body = `<div class="page-pad"><div class="grid cols-4">${[['SKU', s.data.inventory.length], ['Inventory value', money(value)], ['Low stock', s.data.inventory.filter(x => x.stock > 0 && x.stock <= 10).length], ['Out of stock', s.data.inventory.filter(x => x.stock === 0).length]].map(([a, b]) => `<article class="card stat-card"><small>${a}</small><strong>${b}</strong></article>`).join('')}</div><div class="grid cols-2" style="margin-top:16px"><section class="card"><h2>Stock status</h2>${['Electronics', 'Furniture', 'Stationery', 'Networking'].map(c => `<div class="summary-line"><span>${c}</span><strong>${s.data.inventory.filter(x => x.category === c).reduce((a, x) => a + x.stock, 0)} units</strong></div>`).join('')}</section><section class="card"><h2>Recent activities</h2><div class="timeline"><div class="timeline-item done"><strong>รับสินค้าเข้าคลัง</strong><p class="muted">EL-003 · 12 units</p></div><div class="timeline-item current"><strong>เตรียมรายการเบิกออก</strong><p class="muted">Order OUT-2041</p></div></div></section></div></div>`;
    } else if (s.data.view === 'inventory') {
      body = `<div class="page-pad"><section class="card"><div class="toolbar"><h2>Inventory</h2><input class="input" id="wms-search" style="max-width:360px" placeholder="ค้นหาชื่อหรือ SKU" value="${esc(s.data.search)}"></div><div class="table-wrap"><table><thead><tr><th>SKU</th><th>Item</th><th>Category</th><th>Stock</th><th>Location</th><th>Price</th><th></th></tr></thead><tbody>${filtered.map(x => `<tr><td><code>${esc(x.sku)}</code></td><td><strong>${esc(x.name)}</strong></td><td>${esc(x.category)}</td><td>${badge(String(x.stock), x.stock === 0 ? 'danger' : x.stock <= 10 ? 'warning' : 'success')}</td><td>${esc(x.location)}</td><td>${money(x.price)}</td><td><button class="btn small" data-stock="${x.sku}" data-delta="-1">−</button> <button class="btn small" data-stock="${x.sku}" data-delta="1">+</button></td></tr>`).join('') || '<tr><td colspan="7">ไม่พบสินค้า</td></tr>'}</tbody></table></div></section></div>`;
    } else {
      const content = { inbound: ['Inbound receiving', 'Barcode input, supplier, quantity, location และ putaway queue'], outbound: ['Outbound picking', 'Order search, requester/date และ picking list'], suppliers: ['Suppliers', 'SUP-001 Nexus Supply · rating 4.8 · Active'], reports: ['Reports', 'Turnover 4.2x · Accuracy 99.8% · Capacity 76%'], staff: ['Warehouse staff', 'EMP-001 Preeya C. · Manager · Active'], settings: ['Settings', 'Warehouse: Bangkok Main · Notifications enabled'] }[s.data.view];
      body = `<div class="page-pad"><section class="card"><p class="eyebrow">NexusWMS</p><h2>${content[0]}</h2><p class="muted">${content[1]}</p><div class="notice">หน้าจอนี้คงสถานะ mock ตาม baseline ของระบบเดิม</div></section></div>`;
    }
    app.innerHTML = `<div class="app-shell">${appHeader('NexusWMS', 'Preeya C. / Warehouse Manager', views, s.data.view, `<button class="btn small danger" data-wms-reset>รีเซ็ต</button>`)}${body}</div>`;
    app.querySelectorAll('[data-tab]').forEach(el => el.addEventListener('click', () => { s.data.view = el.dataset.tab; save(); }));
    app.querySelector('[data-wms-reset]')?.addEventListener('click', () => { if (confirm('คืนข้อมูลคลังเริ่มต้น?')) { s.reset(); renderWms(); } });
    app.querySelector('#wms-search')?.addEventListener('input', (e) => { s.data.search = e.target.value; s.save(); renderWms(); document.querySelector('#wms-search')?.focus(); });
    app.querySelectorAll('[data-stock]').forEach(el => el.addEventListener('click', () => { const item = s.data.inventory.find(x => x.sku === el.dataset.stock); if (item) item.stock = Math.max(0, item.stock + Number(el.dataset.delta)); save(); }));
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
    const s = store('smartpos', smartPosSeed); const save = () => { s.save(); renderSmartPos(); }; const views = [['pos', 'POS'], ['kds', `KDS (${s.data.orders.filter(x => ['pending', 'cooking'].includes(x.status)).length})`], ['dashboard', 'Dashboard'], ['kiosk', 'Kiosk']];
    const cartLines = (cart) => Object.entries(cart).map(([pid, qty]) => ({ ...posProducts.find(x => x.id === pid), qty })).filter(x => x.id);
    const subtotal = (lines) => lines.reduce((a, x) => a + x.price * x.qty, 0);
    const add = (cart, pid) => { cart[pid] = (cart[pid] || 0) + 1; };
    let body = '';
    if (s.data.view === 'pos') {
      const lines = cartLines(s.data.cart); const sub = subtotal(lines); const filtered = posProducts.filter(x => (s.data.category === 'All' || x.cat === s.data.category) && x.name.toLowerCase().includes(s.data.search.toLowerCase()));
      body = `<div class="page-pad split"><section><div class="toolbar"><div class="tabs">${['All', 'Coffee', 'Tea', 'Bakery', 'Food'].map(c => `<button class="tab ${c === s.data.category ? 'active' : ''}" data-pos-category="${c}">${c}</button>`).join('')}</div><input class="input" id="pos-search" style="max-width:280px" placeholder="ค้นหาสินค้า" value="${esc(s.data.search)}"></div><div class="product-grid">${filtered.map(p => `<article class="product-card"><span class="stat-icon">${p.cat === 'Coffee' ? '☕' : p.cat === 'Tea' ? '🍵' : p.cat === 'Bakery' ? '🥐' : '🍽'}</span><h3>${esc(p.name)}</h3><p class="muted">${esc(p.cat)}</p><div class="summary-line"><strong>${money(p.price)}</strong><button class="btn small primary" data-pos-add="${p.id}">เพิ่ม</button></div></article>`).join('')}</div></section><aside class="card sidebar-card"><div class="card-head"><h2>Current order</h2><button class="btn small danger" data-pos-clear>Clear</button></div>${lines.length ? lines.map(x => `<div class="cart-line"><div><strong>${esc(x.name)}</strong><p class="muted">${money(x.price)} × ${x.qty}</p></div><div class="qty"><button class="btn small" data-pos-qty="${x.id}" data-delta="-1">−</button><strong>${x.qty}</strong><button class="btn small" data-pos-qty="${x.id}" data-delta="1">+</button></div></div>`).join('') : '<div class="empty">เลือกสินค้าเพื่อเริ่ม order</div>'}<div class="summary-line"><span>Subtotal</span><strong>${money(sub)}</strong></div><div class="summary-line"><span>VAT 7%</span><strong>${money(sub * .07)}</strong></div><div class="summary-line total"><span>Total</span><strong>${money(sub * 1.07)}</strong></div><button class="btn primary" style="width:100%;margin-top:14px" data-pos-checkout ${lines.length ? '' : 'disabled'}>ชำระเงิน Cash / QR</button></aside></div>`;
    } else if (s.data.view === 'kds') {
      const active = s.data.orders.filter(x => x.status !== 'completed'); body = `<div class="page-pad"><div class="section-head"><div><p class="eyebrow">Kitchen Display System</p><h2>Active orders</h2></div><p>เรียงจาก order เก่าไปใหม่</p></div>${active.length ? `<div class="kds-grid">${active.map(o => `<article class="order-card ${o.status === 'ready' ? 'ready' : ''}"><div class="card-head"><div><p class="eyebrow">${esc(o.type)}</p><h2>${esc(o.id)}</h2></div>${badge(o.status, o.status === 'ready' ? 'success' : 'warning')}</div>${o.items.map(x => `<div class="summary-line"><span>${x.qty} × ${esc(x.name)}</span><strong>${money(x.price * x.qty)}</strong></div>`).join('')}<button class="btn primary" style="width:100%;margin-top:14px" data-order-next="${o.id}">${o.status === 'pending' ? 'เริ่มทำอาหาร' : o.status === 'cooking' ? 'ทำเสร็จแล้ว' : 'เสิร์ฟลูกค้าแล้ว'}</button></article>`).join('')}</div>` : '<div class="empty">ไม่มี order ในครัว</div>'}</div>`;
    } else if (s.data.view === 'dashboard') {
      const total = s.data.orders.reduce((a, x) => a + x.total, 0); const sold = {}; s.data.orders.forEach(o => o.items.forEach(x => sold[x.name] = (sold[x.name] || 0) + x.qty)); const best = Object.entries(sold).sort((a, b) => b[1] - a[1]).slice(0, 5); body = `<div class="page-pad"><div class="grid cols-3"><article class="card stat-card"><small>Total sales</small><strong>${money(total)}</strong></article><article class="card stat-card"><small>Total orders</small><strong>${s.data.orders.length}</strong></article><article class="card stat-card"><small>Average bill</small><strong>${money(s.data.orders.length ? total / s.data.orders.length : 0)}</strong></article></div><div class="grid cols-2" style="margin-top:16px"><section class="card"><h2>Best sellers</h2>${best.map(([name, qty]) => `<div class="summary-line"><span>${esc(name)}</span><strong>${qty} items</strong></div>`).join('') || '<p class="muted">ยังไม่มีข้อมูล</p>'}</section><section class="card"><h2>Sales by order</h2><div class="bar-chart">${s.data.orders.slice(-8).map(o => `<div class="bar" style="height:${Math.max(12, Math.min(100, o.total / 10))}%"><span>${esc(o.id.slice(-4))}</span></div>`).join('') || '<p class="muted">สร้าง order เพื่อดูกราฟ</p>'}</div></section></div></div>`;
    } else {
      const lines = cartLines(s.data.kioskCart); const sub = subtotal(lines);
      if (s.data.kioskStage === 'welcome') body = `<div class="shipping-choice"><div class="choice-wrap" style="text-align:center"><p class="eyebrow">SELF-ORDER KIOSK</p><h1 style="font-size:54px;margin:0">ยินดีต้อนรับ</h1><p class="muted">แตะหน้าจอเพื่อเริ่มสั่งอาหาร</p><button class="btn primary" data-kiosk-start>เริ่มสั่งสินค้า</button></div></div>`;
      else if (s.data.kioskStage === 'payment') body = `<div class="shipping-choice"><section class="card" style="width:min(560px,100%);text-align:center"><p class="eyebrow">QR PAYMENT SIMULATION</p><h1>${money(sub)}</h1><div class="course-art" style="height:220px;background:white;color:#111;font-size:80px">▦</div><p class="muted">ระบบจะดำเนินการอัตโนมัติภายใน 2 วินาที</p></section></div>`;
      else if (s.data.kioskStage === 'done') body = `<div class="shipping-choice"><section class="card" style="width:min(560px,100%);text-align:center"><div style="font-size:70px">✓</div><h1>รับรายการเรียบร้อย</h1><p class="muted">Order ถูกส่งไปที่ KDS แล้ว</p><button class="btn primary" data-kiosk-new>สั่งรายการใหม่</button></section></div>`;
      else body = `<div class="page-pad split"><section><h2>Kiosk menu</h2><div class="product-grid">${posProducts.map(p => `<article class="product-card"><h3>${esc(p.name)}</h3><p class="muted">${esc(p.cat)}</p><div class="summary-line"><strong>${money(p.price)}</strong><button class="btn small primary" data-kiosk-add="${p.id}">เพิ่ม</button></div></article>`).join('')}</div></section><aside class="card sidebar-card"><h2>รายการของคุณ</h2>${lines.map(x => `<div class="summary-line"><span>${x.qty} × ${esc(x.name)}</span><strong>${money(x.qty * x.price)}</strong></div>`).join('') || '<div class="empty">ยังไม่มีสินค้า</div>'}<div class="summary-line total"><span>Total (ไม่มี VAT)</span><strong>${money(sub)}</strong></div><button class="btn primary" style="width:100%" data-kiosk-pay ${lines.length ? '' : 'disabled'}>ชำระด้วย QR</button></aside></div>`;
    }
    app.innerHTML = `<div class="app-shell">${appHeader('SmartPOS', 'POS · KDS · Dashboard · Kiosk', views, s.data.view, `<button class="btn small danger" data-pos-reset>Clear data</button>`)}${body}</div>`;
    app.querySelectorAll('[data-tab]').forEach(el => el.addEventListener('click', () => { s.data.view = el.dataset.tab; save(); }));
    app.querySelector('[data-pos-reset]')?.addEventListener('click', () => { if (confirm('ล้าง order และคืนค่าเริ่มต้น?')) { s.reset(); renderSmartPos(); } });
    app.querySelectorAll('[data-pos-category]').forEach(el => el.addEventListener('click', () => { s.data.category = el.dataset.posCategory; save(); }));
    app.querySelector('#pos-search')?.addEventListener('input', (e) => { s.data.search = e.target.value; s.save(); renderSmartPos(); document.querySelector('#pos-search')?.focus(); });
    app.querySelectorAll('[data-pos-add]').forEach(el => el.addEventListener('click', () => { add(s.data.cart, el.dataset.posAdd); save(); }));
    app.querySelectorAll('[data-pos-qty]').forEach(el => el.addEventListener('click', () => { const pid = el.dataset.posQty; s.data.cart[pid] = (s.data.cart[pid] || 0) + Number(el.dataset.delta); if (s.data.cart[pid] <= 0) delete s.data.cart[pid]; save(); }));
    app.querySelector('[data-pos-clear]')?.addEventListener('click', () => { if (confirm('ล้างตะกร้า?')) { s.data.cart = {}; save(); } });
    app.querySelector('[data-pos-checkout]')?.addEventListener('click', () => { const items = cartLines(s.data.cart); const sub = subtotal(items); s.data.orders.push({ id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`, items, status: 'pending', type: 'Dine-in', method: 'Cash/QR', total: sub * 1.07, at: Date.now() }); s.data.cart = {}; s.data.view = 'kds'; save(); toast('ส่ง order เข้าครัวแล้ว'); });
    app.querySelectorAll('[data-order-next]').forEach(el => el.addEventListener('click', () => { const o = s.data.orders.find(x => x.id === el.dataset.orderNext); if (o) o.status = { pending: 'cooking', cooking: 'ready', ready: 'completed' }[o.status] || 'completed'; save(); }));
    app.querySelector('[data-kiosk-start]')?.addEventListener('click', () => { s.data.kioskStage = 'menu'; save(); });
    app.querySelectorAll('[data-kiosk-add]').forEach(el => el.addEventListener('click', () => { add(s.data.kioskCart, el.dataset.kioskAdd); save(); }));
    app.querySelector('[data-kiosk-pay]')?.addEventListener('click', () => { s.data.kioskStage = 'payment'; s.save(); renderSmartPos(); setTimeout(() => { const current = store('smartpos', smartPosSeed); const items = cartLines(current.data.kioskCart); current.data.orders.push({ id: `Q-${Math.floor(100 + Math.random() * 900)}`, items, status: 'pending', type: 'Takeaway', method: 'Kiosk-QR', total: subtotal(items), at: Date.now() }); current.data.kioskCart = {}; current.data.kioskStage = 'done'; current.save(); renderSmartPos(); }, 2000); });
    app.querySelector('[data-kiosk-new]')?.addEventListener('click', () => { s.data.kioskStage = 'welcome'; save(); });
  }

  const esignSeed = { signed: null };
  function renderEsign() {
    const s = store('esign', esignSeed); let drawing = false, dirty = false, ctx = null, canvas = null;
    const signed = s.data.signed;
    app.innerHTML = `<div class="app-shell">${appHeader('Lite E-Signature', 'DOC-2026-0430 · สัญญาจ้างพัฒนาซอฟต์แวร์', [], '', `<button class="btn small danger" data-esign-reset>รีเซ็ต</button>`)}
      <div class="page-pad contract">${signed ? `<section class="signed-mark"><div style="font-size:60px">✓</div><h1>ลงนามสำเร็จเรียบร้อย</h1><p>ลงนามโดย คุณลูกค้า · ${esc(signed.time)} · IP 182.52.xx.xx</p><img src="${signed.image}" alt="ลายเซ็น" style="max-height:120px"><div class="hero-buttons"><button class="btn primary" data-download-pdf>ดาวน์โหลด PDF</button><button class="btn" data-view-contract>ดูสัญญา</button></div></section>` : `<article class="contract-paper"><p class="eyebrow">DOC-2026-0430</p><h1>สัญญาจ้างพัฒนาซอฟต์แวร์ (ฉบับย่อ)</h1><p><strong>ผู้ว่าจ้าง:</strong> คุณลูกค้า</p><p><strong>ผู้รับจ้าง:</strong> บริษัท เพ็ญรัศ เทคโนโลยี จำกัด</p><h3>1. ขอบเขตงาน</h3><p>ผู้รับจ้างตกลงออกแบบและพัฒนาระบบตามขอบเขตที่อนุมัติ พร้อมส่งมอบ source code และคู่มือที่เกี่ยวข้อง</p><h3>2. ค่าตอบแทน</h3><p>ชำระตามงวดงานและเงื่อนไขในใบเสนอราคาที่ได้รับอนุมัติ</p><h3>3. การส่งมอบ</h3><p>ถือว่าส่งมอบเมื่อผู้ว่าจ้างตรวจรับงานตาม acceptance criteria</p><h3>4. การรักษาความลับ</h3><p>คู่สัญญาต้องรักษาข้อมูลทางธุรกิจและข้อมูลส่วนบุคคลที่ได้รับระหว่างโครงการ</p><p><strong>วันที่มีผล:</strong> 30 เมษายน 2026</p></article><section class="card" style="margin-top:18px"><div class="card-head"><div><p class="eyebrow">Signature pad</p><h2>ลงลายเซ็น</h2></div><button class="btn small" data-clear-sign>ล้างใหม่</button></div><canvas class="signature-pad" id="signature-pad"></canvas><p class="muted">ใช้เมาส์ นิ้ว หรือปากกาเพื่อวาดลายเซ็น</p><button class="btn primary" style="width:100%" data-submit-sign disabled>ยืนยันการลงนาม</button></section>`}</div></div>`;
    app.querySelector('[data-esign-reset]')?.addEventListener('click', () => { if (confirm('ลบลายเซ็นและคืนสถานะเริ่มต้น?')) { s.reset(); renderEsign(); } });
    if (!signed) {
      canvas = app.querySelector('#signature-pad'); ctx = canvas.getContext('2d');
      const resize = () => { const ratio = Math.max(window.devicePixelRatio || 1, 1); const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * ratio; canvas.height = rect.height * ratio; ctx.scale(ratio, ratio); ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.strokeStyle = '#111827'; }; resize();
      const point = (e) => { const r = canvas.getBoundingClientRect(); const p = e.touches?.[0] || e; return [p.clientX - r.left, p.clientY - r.top]; };
      const start = (e) => { e.preventDefault(); drawing = true; const [x, y] = point(e); ctx.beginPath(); ctx.moveTo(x, y); };
      const move = (e) => { if (!drawing) return; e.preventDefault(); const [x, y] = point(e); ctx.lineTo(x, y); ctx.stroke(); dirty = true; app.querySelector('[data-submit-sign]').disabled = false; };
      const end = () => drawing = false;
      ['pointerdown', 'touchstart'].forEach(n => canvas.addEventListener(n, start, { passive: false }));
      ['pointermove', 'touchmove'].forEach(n => canvas.addEventListener(n, move, { passive: false }));
      ['pointerup', 'pointerleave', 'touchend'].forEach(n => canvas.addEventListener(n, end));
      app.querySelector('[data-clear-sign]')?.addEventListener('click', () => { ctx.clearRect(0, 0, canvas.width, canvas.height); dirty = false; app.querySelector('[data-submit-sign]').disabled = true; });
      app.querySelector('[data-submit-sign]')?.addEventListener('click', () => { if (!dirty) return; s.data.signed = { image: canvas.toDataURL('image/png'), time: new Date().toISOString(), document: 'DOC-2026-0430' }; s.save(); renderEsign(); });
    }
    app.querySelector('[data-view-contract]')?.addEventListener('click', () => modal('ข้อมูลเอกสาร', '<p><strong>DOC-2026-0430</strong></p><p>สัญญาจ้างพัฒนาซอฟต์แวร์ (ฉบับย่อ)</p><p class="muted">ลายเซ็นนี้เป็น demo image ไม่ใช่ digital signature ตามมาตรฐาน PKI</p>'));
    app.querySelector('[data-download-pdf]')?.addEventListener('click', () => {
      if (window.jspdf?.jsPDF) { const pdf = new window.jspdf.jsPDF(); pdf.setFontSize(16); pdf.text('Software Development Contract', 20, 24); pdf.setFontSize(11); pdf.text('Document: DOC-2026-0430', 20, 36); pdf.text('Signer: Demo Customer', 20, 44); pdf.text(`Signed at: ${s.data.signed.time}`, 20, 52); pdf.text('This file is generated by the PHP demo system.', 20, 64); pdf.addImage(s.data.signed.image, 'PNG', 20, 78, 90, 35); pdf.save('contract_DOC-2026-0430_signed.pdf'); } else { toast('กำลังเปิดหน้าพิมพ์ กรุณาเลือก Save as PDF'); window.print(); }
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
    const source = kind === 'ecommerce' ? '/external/ecommerce/' : '/external/tilt/tilt-signal-arcade-bar';
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
