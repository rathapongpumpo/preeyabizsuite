(() => {
  'use strict';

  const app = document.getElementById('app');
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const staticPages = {
    '/': 'portal',
    '/business-suite': 'crm',
    '/ecommerce-storefront': 'external-ecommerce',
    '/tilt-signal-arcade-bar': 'external-tilt',
    '/medical-flow': 'external-medical',
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
    back.setAttribute('aria-label', 'กลับพอร์ตโฟลิโอ');
    back.textContent = '← กลับพอร์ตโฟลิโอ';
    const projectName = document.createElement('div');
    projectName.className = 'shell-project';
    const status = document.createElement('span');
    status.className = 'status-dot';
    status.setAttribute('aria-hidden', 'true');
    const title = document.createElement('strong');
    title.textContent = projects[pathname]?.short || projects[pathname]?.title || 'Demo';
    const demoBadge = document.createElement('span');
    demoBadge.className = 'badge';
    demoBadge.style.fontSize = '11px';
    demoBadge.textContent = 'Interactive Showcase';
    projectName.append(status, title, demoBadge);

    const shellActions = document.createElement('div');
    shellActions.className = 'shell-actions';
    const infoBtn = document.createElement('button');
    infoBtn.className = 'btn small';
    infoBtn.type = 'button';
    infoBtn.textContent = 'ℹ️ รายละเอียดระบบ';
    infoBtn.onclick = () => window.openProjectDetail?.(pathname);
    const newTabBtn = document.createElement('a');
    newTabBtn.className = 'btn small';
    newTabBtn.href = pathname;
    newTabBtn.target = '_blank';
    newTabBtn.rel = 'noopener noreferrer';
    newTabBtn.textContent = '↗ เปิดแท็บใหม่';
    shellActions.append(infoBtn, newTabBtn);

    shell.append(back, projectName, shellActions);
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
    const key = `preeya_php_demo_v5:${name}`;
    let data;
    try {
      data = JSON.parse(localStorage.getItem(key) || 'null');
    } catch {
      data = null;
    }
    if (!data || typeof data !== 'object') {
      data = clone(seed);
    } else {
      for (const k in seed) {
        if (data[k] === undefined || (Array.isArray(seed[k]) && !Array.isArray(data[k]))) {
          data[k] = clone(seed[k]);
        }
      }
    }
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
      <div class="card-head"><h2>${esc(title)}</h2><button class="icon-btn" data-close-modal>✕ ปิด</button></div>
      ${body}${footer}
    </section>`;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        wrap.remove();
        window.removeEventListener('keydown', onKey);
      }
    };
    window.addEventListener('keydown', onKey);
    wrap.addEventListener('click', (event) => {
      if (event.target === wrap || event.target.closest('[data-close-modal]')) {
        wrap.remove();
        window.removeEventListener('keydown', onKey);
      }
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
      <div class="app-topbar-main">
        <div class="app-title">
          <div class="app-title-row">
            <span class="app-system-tag">Interactive Demo</span>
            <h1>${esc(title)}</h1>
          </div>
          ${subtitle ? `<p>${esc(subtitle)}</p>` : ''}
        </div>
        ${actions ? `<div class="app-actions">${actions}</div>` : ''}
      </div>
      ${tabItems && tabItems.length ? `<nav class="app-topbar-nav" aria-label="Demo Navigation">${tabs(tabItems, active)}</nav>` : ''}
    </header>`;
  }

  function badge(text, kind = '') {
    return `<span class="badge ${kind}">${esc(text)}</span>`;
  }

  function setTheme(theme) {
    let effective = theme;
    if (theme === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      effective = prefersDark ? 'dark' : 'light';
    }
    document.documentElement.dataset.theme = effective;
    localStorage.setItem('preeya_php_demo_v2:theme', theme);
    document.querySelectorAll('.theme-opt').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeVal === theme);
    });
  }

  const savedTheme = localStorage.getItem('preeya_php_demo_v2:theme') || 'light';
  setTheme(savedTheme);

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
    const featuredKeys = ['/warehouse-management', '/business-suite', '/pos-system-smart'];
    const featured = featuredKeys.map(k => [k, projects[k]]).filter(([, p]) => !!p);
    let activeFilter = 'all';
    let searchQuery = '';
    let activeLang = 'th';

    const icon = (name, size = 18, cls = '') =>
      `<svg class="icon ${cls}" width="${size}" height="${size}" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;

    const getPreview = (path) => {
      const custom = {
        '/warehouse-management': '/assets/demo-previews/warehouse-management.png',
        '/business-suite': '/assets/demo-previews/business-suite.png',
        '/pos-system-smart': '/assets/demo-previews/pos-system-smart.png',
        '/usa-thai-shipping': '/assets/demo-previews/usa-thai-shipping.png',
        '/ecommerce-storefront': '/assets/demo-previews/ecommerce-storefront.png',
        '/tilt-signal-arcade-bar': '/assets/demo-previews/tilt-signal-arcade-bar.png',
      };
      return custom[path] || '/assets/demo-previews/warehouse-management.png';
    };

    function renderPortalContent() {
      const q = searchQuery.trim().toLowerCase();
      const filteredWorks = visible.filter(([path, p]) => {
        if (activeFilter === 'business' && p.category !== 'business') return false;
        if (activeFilter === 'website' && p.category !== 'website') return false;
        if (q) {
          const matchTitle = (p.title || '').toLowerCase().includes(q);
          const matchShort = (p.short || '').toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchTech = (p.tech || []).some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchShort && !matchDesc && !matchTech) return false;
        }
        return true;
      });

      const countAll = visible.length;
      const countBusiness = visible.filter(([, p]) => p.category === 'business').length;
      const countWebsite = visible.filter(([, p]) => p.category === 'website').length;
      const currentTheme = localStorage.getItem('preeya_php_demo_v2:theme') || 'light';

      app.innerHTML = `
        <div class="portal-wrap">
          <!-- Topbar Header (Enterprise Style) -->
          <nav class="portal-nav" id="top">
            <div class="portal-nav-container">
              <div class="portal-nav-left">
                <a class="portal-brand" href="/" aria-label="Preeya Systems">
                  <span class="portal-brand-badge">P</span>
                  <div class="portal-brand-info">
                    <span class="portal-brand-name">PREEYA SYSTEMS</span>
                    <span class="portal-brand-tag">B2B Software Studio</span>
                  </div>
                </a>

                <!-- Desktop Navigation Menu -->
                <div class="portal-nav-menu" role="navigation" aria-label="Main Navigation">
                  <a href="#projects" class="portal-nav-item">ระบบงานเดโม (6)</a>
                  <a href="#pricing" class="portal-nav-item">แพ็กเกจ & ราคา</a>
                  <a href="#guarantees" class="portal-nav-item">การรับประกัน SLA</a>
                  <a href="#about-architect" class="portal-nav-item">สถาปนิกผู้พัฒนา</a>
                </div>
              </div>

              <div class="portal-nav-right">
                <div class="portal-search-box">
                  <span class="search-icon-slot">${icon('search', 14)}</span>
                  <input type="text" id="topbar-search-input" placeholder="ค้นหาระบบ..." value="${esc(searchQuery)}" aria-label="Search systems">
                  ${searchQuery ? `<button class="clear-search-btn" type="button" aria-label="Clear search">×</button>` : ''}
                </div>

                <div class="topbar-theme-pill" role="group" aria-label="Theme selector">
                  <button class="theme-opt ${currentTheme === 'system' ? 'active' : ''}" type="button" data-theme-val="system" title="System Theme">${icon('monitor', 14)}</button>
                  <button class="theme-opt ${currentTheme === 'light' ? 'active' : ''}" type="button" data-theme-val="light" title="Light Theme">${icon('sun', 14)}</button>
                  <button class="theme-opt ${currentTheme === 'dark' ? 'active' : ''}" type="button" data-theme-val="dark" title="Dark Theme">${icon('moon', 14)}</button>
                </div>

                <a class="btn primary small portal-nav-cta" href="#estimator-form">ประเมินราคาฟรี</a>

                <button class="portal-mobile-toggle" id="portal-mobile-toggle" type="button" aria-label="เปิดเมนู" aria-expanded="false">
                  <span class="hamburger-bar"></span>
                  <span class="hamburger-bar"></span>
                  <span class="hamburger-bar"></span>
                </button>
              </div>
            </div>

            <!-- Mobile Dropdown / Drawer -->
            <div class="portal-mobile-menu" id="portal-mobile-menu" hidden>
              <div class="mobile-menu-inner">
                <div class="mobile-menu-search">
                  <span class="search-icon-slot">${icon('search', 14)}</span>
                  <input type="text" id="mobile-search-input" placeholder="ค้นหาระบบเดโม..." value="${esc(searchQuery)}">
                </div>
                <nav class="mobile-menu-nav">
                  <a href="#projects" class="mobile-nav-link"><span>🚀 ระบบงานเดโม (6 ระบบ)</span><span class="badge primary">Interactive</span></a>
                  <a href="#pricing" class="mobile-nav-link"><span>💰 แพ็กเกจและราคาเริ่มต้น</span></a>
                  <a href="#guarantees" class="mobile-nav-link"><span>🛡️ มาตรฐานรับประกัน SLA 1 ปี</span></a>
                  <a href="#about-architect" class="mobile-nav-link"><span>👨‍💻 ข้อมูล Lead Architect & Tech Stack</span></a>
                  <a href="#estimator-form" class="mobile-nav-link highlight"><span>⚡ เครื่องคำนวณงบประมาณ (Estimator) →</span></a>
                </nav>
                <div class="mobile-menu-actions">
                  <a class="btn primary small" href="#estimator-form" style="width:100%;justify-content:center">ประเมินราคา / ขอใบเสนอราคา</a>
                  <a class="btn outline small" href="https://line.me/R/ti/p/@486fpcll" target="_blank" rel="noreferrer" style="border-color:#06C755;color:#06C755;width:100%;justify-content:center">ทัก LINE ปรึกษาด่วน ↗</a>
                </div>
              </div>
            </div>
          </nav>

          <!-- Hero Section (Tablet Device Style) -->
          <section class="hero-section">
            <div class="hero-content">
              <div class="hero-status-pill">
                <span class="status-pulse-dot"></span>
                <span>🟢 เปิดรับโปรเจกต์ใหม่ (Available for Q4/2026) • รับประกัน SLA 1 ปี</span>
              </div>
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
              </div>
              <div class="hero-stats-banner">
                <div class="hero-stat-item">
                  <strong>6</strong>
                  <span>ระบบ Enterprise</span>
                </div>
                <div class="hero-stat-item">
                  <strong>100%</strong>
                  <span>Interactive Demos</span>
                </div>
                <div class="hero-stat-item">
                  <strong>Scalable</strong>
                  <span>สถาปัตยกรรมพร้อมต่อยอด</span>
                </div>
              </div>
            </div>

            <div class="hero-visual">
              <div class="tablet-device-frame">
                <div class="tablet-lens"></div>
                <div class="tablet-screen">
                  <div class="tablet-screen-bar">
                    <div class="tablet-brand-pill">
                      <span class="screen-blue-dot"></span>
                      <span>NexusWMS · Live Flow</span>
                    </div>
                    <span class="tablet-live-tag"><span class="pulse-dot"></span>Live Interactive</span>
                  </div>
                  <div class="tablet-screen-img">
                    <img src="${getPreview('/warehouse-management')}" alt="NexusWMS Live Flow" width="700" height="437" fetchpriority="high">
                  </div>
                </div>
              </div>
              <div class="tablet-card-badge">
                <div class="tablet-badge-icon">
                  ${icon('warehousewarehouse', 20)}
                </div>
                <div class="tablet-badge-info">
                  <strong>NexusWMS · Inventory Engine</strong>
                  <span>ระบบบริหารสต็อก Inbound, Outbound & แผนผังคลัง 4 โซน</span>
                </div>
                <a class="btn small primary" href="/warehouse-management">ทดลองระบบ ↗</a>
              </div>
            </div>
          </section>

          <!-- Overview Dashboard Section (Architecture Overview) -->
          <section class="portal-section overview-section" id="overview">
            <div class="overview-header-row">
              <div>
                <h2 class="overview-heading">สถาปัตยกรรมและภาพรวมระบบ (Architecture Overview)</h2>
                <p class="overview-subtext">ภาพรวมระบบ Enterprise และสถานะโมดูลที่เปิดให้ทดลองใช้งานจริง</p>
              </div>
              <a class="btn primary customize-btn" href="#projects">
                ${icon('layout-dashboard', 16)} ดูระบบทั้งหมด
              </a>
            </div>

            <div class="overview-group-title">
              <h3>ระบบและโมดูลการทำงาน (Enterprise System Modules)</h3>
            </div>

            <div class="logis-metric-cards-grid">
              <a class="logis-metric-card" href="/warehouse-management">
                <div class="metric-card-icon-box">${icon('warehousewarehouse', 18)}</div>
                <div class="metric-card-title">NexusWMS · สต็อก & คลังสินค้า</div>
                <div class="metric-card-val">1,420</div>
                <div class="metric-card-desc">Active SKUs, Barcode Scanner & แผนผังคลัง 4 โซน</div>
              </a>
              <a class="logis-metric-card" href="/business-suite">
                <div class="metric-card-icon-box">${icon('handshake', 18)}</div>
                <div class="metric-card-title">Sales Flow CRM & สัญญา</div>
                <div class="metric-card-val">18</div>
                <div class="metric-card-desc">Deals Pipeline, ใบเสนอราคา & E-Signature</div>
              </a>
              <a class="logis-metric-card" href="/pos-system-smart">
                <div class="metric-card-icon-box">${icon('zap', 18)}</div>
                <div class="metric-card-title">SmartPOS ร้านอาหาร & ครัว</div>
                <div class="metric-card-val">฿48,920</div>
                <div class="metric-card-desc">Cashier POS, หน้าจอครัว KDS & Kiosk</div>
              </a>
              <a class="logis-metric-card" href="/usa-thai-shipping">
                <div class="metric-card-icon-box">${icon('truck', 18)}</div>
                <div class="metric-card-title">Thai Shipping · จัดการขนส่ง</div>
                <div class="metric-card-val">156</div>
                <div class="metric-card-desc">Air & Sea freight tracked with 4-stage timeline</div>
              </a>
              <div class="logis-metric-card">
                <div class="metric-card-icon-box">${icon('circle-check', 18)}</div>
                <div class="metric-card-title">Security & State Architecture</div>
                <div class="metric-card-val">100%</div>
                <div class="metric-card-desc">Zero external leaks, Client-side state verified</div>
              </div>
            </div>
          </section>

          <!-- Featured Works (3 Core Systems) -->
          <section class="portal-section" id="featured">
            <div class="section-header">
              <span class="eyebrow">Core Enterprise Systems</span>
              <h2>3 ระบบหลักสำหรับกระบวนการทางธุรกิจ</h2>
              <p>ออกแบบโครงสร้างข้อมูล ตรรกะคำนวณ และ Workflow สำหรับการดำเนินงานจริง</p>
            </div>

            <div class="logis-featured-grid">
              ${featured.map(([path, p]) => `
                <article class="logis-feat-card">
                  <div class="feat-card-header">
                    <div class="feat-card-icon-box">
                      ${icon(path === '/warehouse-management' ? 'warehousewarehouse' : path === '/business-suite' ? 'handshake' : 'zap', 22)}
                    </div>
                    <div class="feat-card-meta">
                      <span class="badge primary">${esc(p.category_name || 'ระบบธุรกิจ')}</span>
                      <small class="feat-code">${path.replace('/', '')}</small>
                    </div>
                  </div>
                  <div class="feat-img-container">
                    <img src="${getPreview(path)}" alt="${esc(p.short || p.title)}" loading="lazy">
                  </div>
                  <div class="feat-card-body">
                    <h3>${esc(p.short || p.title)}</h3>
                    <div class="business-impact-badge">${esc(p.impact)}</div>
                    <p>${esc(p.description)}</p>
                    <div class="feat-card-tags">
                      ${(p.highlights || []).slice(0, 3).map(h => `<span class="feat-tag">${esc(h)}</span>`).join('')}
                    </div>
                    <div class="feat-card-actions">
                      <button class="btn small outline" type="button" data-detail="${path}">📋 รายละเอียด</button>
                      <a class="btn small primary" href="${path}">ทดลองเดโม ↗</a>
                    </div>
                  </div>
                </article>
              `).join('')}
            </div>
          </section>

          <!-- All Works & Filter (6 Systems) -->
          <section class="portal-section" id="projects">
            <div class="section-header">
              <span class="eyebrow">Interactive Systems Directory</span>
              <h2>ระบบทั้งหมดที่เปิดให้ทดลอง (${visible.length} ระบบ)</h2>
              <p>เลือกกรองตามหมวดหมู่เพื่อดูระบบธุรกิจหรือเว็บไซต์และงานออกแบบ</p>
            </div>

            <!-- Filter Controls -->
            <div class="logis-filter-bar">
              <div class="logis-segmented-filter" role="tablist">
                <button class="filter-btn ${activeFilter === 'all' ? 'active' : ''}" type="button" data-filter="all">ทั้งหมด (${countAll})</button>
                <button class="filter-btn ${activeFilter === 'business' ? 'active' : ''}" type="button" data-filter="business">ระบบธุรกิจ (${countBusiness})</button>
                <button class="filter-btn ${activeFilter === 'website' ? 'active' : ''}" type="button" data-filter="website">เว็บไซต์และงานออกแบบ (${countWebsite})</button>
              </div>
            </div>

            <!-- Works Grid -->
            <div class="all-works-grid">
              ${filteredWorks.map(([path, p]) => `
                <article class="work-item-card">
                  <div class="work-item-thumb">
                    <img src="${getPreview(path)}" alt="${esc(p.short || p.title)}" loading="lazy">
                  </div>
                  <div class="work-item-body">
                    <div class="work-item-meta">
                      <span class="badge ${p.category === 'business' ? 'primary' : 'yellow'}">${esc(p.category_name || (p.category === 'business' ? 'ระบบธุรกิจ' : 'เว็บไซต์และงานออกแบบ'))}</span>
                      ${p.featured ? '<span class="feat-star">★ แนะนำ</span>' : ''}
                    </div>
                    <h4>${esc(p.short || p.title)}</h4>
                    <div class="business-impact-badge">${esc(p.impact)}</div>
                    <p>${esc(p.description)}</p>
                    <div class="work-item-foot">
                      <button class="btn small outline" type="button" data-detail="${path}">📋 รายละเอียด</button>
                      <a class="btn small ${p.featured ? 'primary' : 'outline'}" href="${path}">เปิดเดโม ↗</a>
                    </div>
                  </div>
                </article>
              `).join('')}
            </div>
          </section>

          <!-- Services Section -->
          <section class="portal-section" id="services">
            <div class="section-header">
              <span class="eyebrow">Expertise & Services</span>
              <h2>บริการที่รับพัฒนา</h2>
              <p>เน้นงานที่ต้องการความถูกต้องของตรรกะ ประสบการณ์การใช้งานที่ลื่นไหล และระบบที่นำไปต่อยอดได้จริง</p>
            </div>

            <div class="services-grid">
              <div class="service-card">
                <div class="service-icon-box">${icon('warehousewarehouse', 24)}</div>
                <h3>1. Web Applications & Back-office Systems</h3>
                <p>พัฒนาระบบหลังบ้านสำหรับธุรกิจ เช่น จัดการคลังสินค้า (WMS), บริหารงานขายและลูกค้า (CRM), ระบบจุดขายหน้าร้าน (POS) ออกแบบให้ใช้งานสะดวกและตอบสนองไว</p>
                <ul class="service-list">
                  <li>UX/UI สะอาด ชัดเจน ใช้งานง่ายบนทุกอุปกรณ์</li>
                  <li>Client & Server State Management ที่เสถียร</li>
                  <li>คำนวณภาษี บิล สต็อก และรายงานอย่างถูกต้อง</li>
                </ul>
              </div>

              <div class="service-card">
                <div class="service-icon-box">${icon('zap', 24)}</div>
                <h3>2. Workflow & Process Automation</h3>
                <p>สร้างระบบส่งต่องานอัตโนมัติ ลดขั้นตอนการทำงานที่ซ้ำซ้อน เช่น ระบบส่งต่อเอกสารลงนามออนไลน์ (E-Signature), ระบบติดตามสถานะพัสดุ และการแจ้งเตือนงาน</p>
                <ul class="service-list">
                  <li>เปลี่ยนเอกสารกระดาษเป็น Interactive Digital Workflow</li>
                  <li>ระบบลงนามออนไลน์พร้อม Audit Trail & บันทึกเวลา</li>
                  <li>เชื่อมต่อสถานะงานระหว่างฝ่ายอย่างราบรื่น</li>
                </ul>
              </div>

              <div class="service-card">
                <div class="service-icon-box">${icon('package', 24)}</div>
                <h3>3. Modern Web Storefront & Landing Pages</h3>
                <p>พัฒนาเว็บไซต์หน้าร้าน E-Commerce และหน้า Landing Page โปรโมตแบรนด์ ที่มีเอกลักษณ์เฉพาะตัว โหลดไว และจัดวาง Typography สวยงามมีพลัง</p>
                <ul class="service-list">
                  <li>ดีไซน์มีบุคลิกโดดเด่น ไม่ซ้ำเทมเพลตสำเร็จรูปทั่วไป</li>
                  <li>รองรับ Cart Drawer, แกลเลอรี และประสบการณ์ช้อปปิ้ง</li>
                  <li>โครงสร้าง SEO และ Performance ที่ได้คะแนนสูง</li>
                </ul>
              </div>

              <div class="service-card">
                <div class="service-icon-box">${icon('network', 24)}</div>
                <h3>4. API Integration & System Architecture</h3>
                <p>วางสถาปัตยกรรมระบบและเชื่อมต่อบริการภายนอก เช่น Proxy, Third-party APIs, ระบบขนส่ง และเตรียมความพร้อมสำหรับฐานข้อมูล Production</p>
                <ul class="service-list">
                  <li>Clean Code โครงสร้างอ่านง่าย ดูแลต่อง่าย</li>
                  <li>Reverse Proxy & Security Headers สำหรับบริการภายนอก</li>
                  <li>การจัดเก็บข้อมูลแคชและโครงสร้างฐานข้อมูลที่มีประสิทธิภาพ</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Work Process Section -->
          <section class="portal-section" id="process">
            <div class="section-header">
              <span class="eyebrow">How I Work</span>
              <h2>ขั้นตอนการทำงาน</h2>
              <p>ทำงานอย่างโปร่งใส มีขั้นตอนชัดเจน เพื่อให้คุณได้ระบบที่ตรงตามโจทย์และอยู่ในงบประมาณ</p>
            </div>

            <div class="process-grid">
              <div class="process-step">
                <div class="step-num">1</div>
                <h4>คุยโจทย์</h4>
                <p>พูดคุยทำความเข้าใจปัญหา เป้าหมายทางธุรกิจ และฟังก์ชันที่จำเป็นต้องมี</p>
              </div>
              <div class="process-step">
                <div class="step-num">2</div>
                <h4>สรุปขอบเขต</h4>
                <p>จัดทำ Requirement, แผนผัง Workflow และโครงสร้างหน้าจอที่ตกลงร่วมกัน</p>
              </div>
              <div class="process-step">
                <div class="step-num">3</div>
                <h4>เสนอราคา</h4>
                <p>ประเมินกรอบเวลาและราคาอย่างชัดเจน ไม่มีค่าใช้จ่ายแอบแฝง</p>
              </div>
              <div class="process-step">
                <div class="step-num">4</div>
                <h4>พัฒนา</h4>
                <p>เขียนโค้ดตามมาตรฐาน อัปเดตความคืบหน้าให้ทดลองหน้าจอจริงเป็นระยะ</p>
              </div>
              <div class="process-step">
                <div class="step-num">5</div>
                <h4>ตรวจรับและส่งมอบ</h4>
                <p>ทดสอบร่วมกัน ส่งมอบซอร์สโค้ด เอกสารระบบ และให้คำแนะนำการใช้งาน</p>
              </div>
            </div>
          </section>


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

          <!-- About & Contact Section -->
          <section class="contact-section" id="contact">
            <div class="contact-info">
              <span class="eyebrow">Get in touch</span>
              <h2>มีโจทย์ระบบที่อยากปรึกษา?</h2>
              <p>
                ไม่ว่าจะเป็นการสร้างระบบหลังบ้านใหม่ ปรับปรุงเว็บเดิม หรือต้องการทำ Interactive Prototype เพื่อทดสอบแนวคิดก่อนลงทุน ยินดีพูดคุยและให้คำแนะนำอย่างตรงไปตรงมาครับ
              </p>
              <div class="chip-row">
                <span class="chip">🔒 รักษาความลับข้อมูลลูกค้า</span>
                <span class="chip">⏱️ ให้คำตอบรวดเร็ว</span>
                <span class="chip">🎯 ประเมินตามขอบเขตจริง</span>
              </div>
            </div>

            <div class="contact-cards">
              <a class="contact-btn-card line" href="https://lin.ee/YjK8Ji8" target="_blank" rel="noreferrer">
                <div>
                  <small style="opacity:0.9">คุยผ่านแชท LINE</small>
                  <div>LINE Official Account</div>
                </div>
                <span>เปิดแชท ↗</span>
              </a>

              <a class="contact-btn-card" href="mailto:r.pumpo@gmail.com">
                <div>
                  <small class="muted">ติดต่อทางอีเมล</small>
                  <div>r.pumpo@gmail.com</div>
                </div>
                <span>ส่งอีเมล ↗</span>
              </a>
            </div>
          </section>

          <!-- Footer -->
          <footer class="portal-footer">
            <div>© ${new Date().getFullYear()} Preeya · Systems & Full-Stack Engineer</div>
            <div>Modern Engineering Standards · Enterprise Ready Architecture</div>
          </footer>
        </div>
      `;

      // Event Bindings
      app.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
          activeFilter = btn.dataset.filter;
          renderPortalContent();
        });
      });

      app.querySelectorAll('[data-detail]').forEach(btn => {
        btn.addEventListener('click', () => {
          openProjectDetail(btn.dataset.detail);
        });
      });

      // Topbar Theme Toggle Buttons
      app.querySelectorAll('.theme-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          setTheme(btn.dataset.themeVal);
        });
      });

      // Language Switcher Buttons
      app.querySelectorAll('.lang-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          activeLang = btn.dataset.lang;
          renderPortalContent();
        });
      });

      // Search Inputs (Desktop & Mobile)
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

      // Mobile Drawer Search & Toggle
      const mobileSearchInput = document.getElementById('mobile-search-input');
      if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value;
          renderPortalContent();
          const renewedMobileMenu = document.getElementById('portal-mobile-menu');
          const renewedMobileToggle = document.getElementById('portal-mobile-toggle');
          if (renewedMobileMenu) renewedMobileMenu.hidden = false;
          if (renewedMobileToggle) {
            renewedMobileToggle.classList.add('active');
            renewedMobileToggle.setAttribute('aria-expanded', 'true');
          }
          const renewedMobileInput = document.getElementById('mobile-search-input');
          if (renewedMobileInput) {
            renewedMobileInput.focus();
            renewedMobileInput.setSelectionRange(searchQuery.length, searchQuery.length);
          }
        });
      }

      const mobileToggle = document.getElementById('portal-mobile-toggle');
      const mobileMenu = document.getElementById('portal-mobile-menu');
      if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = !mobileMenu.hidden;
          mobileMenu.hidden = isOpen;
          mobileToggle.classList.toggle('active', !isOpen);
          mobileToggle.setAttribute('aria-expanded', String(!isOpen));
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => {
            mobileMenu.hidden = true;
            mobileToggle.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
          });
        });

        document.addEventListener('click', (e) => {
          if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target) && !mobileMenu.hidden) {
            mobileMenu.hidden = true;
            mobileToggle.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
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
      }

      app.querySelector('.clear-search-btn')?.addEventListener('click', () => {
        searchQuery = '';
        renderPortalContent();
      });
    }

    renderPortalContent();

    // Check if URL has ?view=detail or ?project=
    const params = new URLSearchParams(window.location.search);
    const detailTarget = params.get('project') || (params.get('view') === 'detail' ? params.get('p') : null);
    if (detailTarget && projects[detailTarget]) {
      openProjectDetail(detailTarget);
    }
  }

  // Project Detail Modal System
  function openProjectDetail(path) {
    const p = projects[path];
    if (!p) return;

    // Update URL query state without full reload
    const url = new URL(window.location);
    url.searchParams.set('view', 'detail');
    url.searchParams.set('project', path);
    window.history.replaceState({}, '', url);

    const overlay = document.createElement('div');
    overlay.className = 'detail-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-proj-title');

    const previewImg = p.preview_image || (
      path === '/warehouse-management' ? '/assets/demo-previews/warehouse-management.png' :
      path === '/business-suite' ? '/assets/demo-previews/business-suite.png' :
      path === '/pos-system-smart' ? '/assets/demo-previews/pos-system-smart.png' :
      path === '/usa-thai-shipping' ? '/assets/demo-previews/usa-thai-shipping.png' :
      path === '/ecommerce-storefront' ? '/assets/demo-previews/ecommerce-storefront.png' :
      '/assets/demo-previews/tilt-signal-arcade-bar.png'
    );

    overlay.innerHTML = `
      <div class="detail-modal-card">
        <header class="detail-modal-header">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span class="badge ${p.category === 'business' ? 'primary' : 'yellow'}">${esc(p.category_name || (p.category === 'business' ? 'ระบบธุรกิจ' : 'เว็บไซต์และงานออกแบบ'))}</span>
              <span class="badge">Interactive Prototype</span>
            </div>
            <h2 id="modal-proj-title" style="font-size:24px;font-weight:900">${esc(p.short || p.title)}</h2>
          </div>
          <button class="detail-modal-close" type="button" aria-label="ปิดหน้ารายละเอียด">×</button>
        </header>

        <div class="detail-modal-content">
          <div class="detail-image-box">
            <img src="${previewImg}" alt="${esc(p.short || p.title)}" style="width:100%;display:block">
          </div>

          <div class="detail-grid-info">
            <div class="detail-info-block">
              <strong>🎯 โจทย์และประโยชน์ของระบบ</strong>
              <p>${esc(p.problem || p.description)}</p>
              <p style="margin-top:6px;color:var(--text);font-weight:600">${esc(p.impact || '')}</p>
            </div>

            <div class="detail-info-block">
              <strong>👥 กลุ่มผู้ใช้งาน</strong>
              <p>${esc(p.audience || 'เจ้าของธุรกิจและทีมงาน')}</p>
            </div>
          </div>

          <div class="detail-info-block">
            <strong>🛠️ ขอบเขตที่พัฒนา (Scope of Work)</strong>
            <p>${esc(p.scope || 'ออกแบบและพัฒนา Interactive UI, State Management, ตรรกะคำนวณ และจำลองกระบวนการทำงานจริง')}</p>
          </div>

          <div class="detail-info-block">
            <strong>⚙️ เทคโนโลยีและฟีเจอร์ที่ตรวจยืนยันได้</strong>
            <p style="margin-bottom:8px">${esc(p.description)}</p>
            <div class="detail-tech-chips">
              ${(p.tech || p.highlights || []).map(t => `<span class="chip">✔ ${esc(t)}</span>`).join('')}
            </div>
          </div>

          <div class="detail-info-block">
            <strong>💡 วิธีทดลองสั้นๆ (Quick Try-out)</strong>
            <p>${esc(p.quick_try || '1. กดเข้าหน้าเดโม 2. ทดลองเลือกรายการหรือกรอกข้อมูล 3. ตรวจสอบผลลัพธ์ที่คำนวณอัตโนมัติ')}</p>
          </div>

          <div class="detail-info-block" style="background:var(--coral-light);border-color:var(--coral)">
            <strong style="color:var(--coral)">⚠️ สถานะและข้อจำกัดตามจริง (Transparency)</strong>
            <p style="color:var(--charcoal)">${esc(p.constraints || 'ระบบนี้เป็น Interactive Prototype สำหรับแสดงตัวอย่างการทำงาน ข้อมูลจะถูกจัดเก็บใน LocalStorage ของเบราว์เซอร์เครื่องนี้ และไม่มีการเชื่อมต่อ Payment Gateway หรือ Database จริง')}</p>
          </div>
        </div>

        <footer class="detail-modal-actions">
          <button class="btn" type="button" id="close-modal-btn">ปิด</button>
          <a class="btn primary" href="${path}">เข้าสู่หน้าจอเพื่อทดลองเดโม ▶</a>
          <a class="btn coral" href="https://lin.ee/YjK8Ji8" target="_blank" rel="noreferrer">คุยเรื่องระบบลักษณะนี้ ↗</a>
        </footer>
      </div>
    `;

    const closeModal = () => {
      overlay.remove();
      const cleanUrl = new URL(window.location);
      cleanUrl.searchParams.delete('view');
      cleanUrl.searchParams.delete('project');
      window.history.replaceState({}, '', cleanUrl);
    };

    overlay.querySelector('.detail-modal-close').addEventListener('click', closeModal);
    overlay.querySelector('#close-modal-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    });

    document.body.appendChild(overlay);
  }
  window.openProjectDetail = openProjectDetail;

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
        
        ${(() => {
          let esign = null;
          try { esign = JSON.parse(localStorage.getItem('preeya_esign_status') || 'null'); } catch(e){}
          if (esign && esign.signed) {
            return `
              <div class="notice" style="margin-top:20px;border-left:4px solid var(--green);background:var(--green-light);color:#065F46">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
                  <strong>✅ ลงนามสำเร็จ (Signed) · ${esc(esign.signedAt)}</strong>
                  <span class="badge success" style="font-size:11px">SHA-256 Cryptographically Sealed</span>
                </div>
                <p style="margin:6px 0 8px;font-size:13px">ผู้ลงนาม: <strong>${esc(esign.signerName)}</strong> (${esc(esign.signerRole || 'Managing Director')}) — ${esc(esign.companyName || d.company)}</p>
                <div style="display:flex;gap:8px">
                  <button class="btn small" data-view-crm-audit type="button">📜 ดูบันทึกลายเซ็นและ Audit Trail</button>
                  <a class="btn small primary" href="/e-signature?from=crm">เปิดดูหน้า E-Signature ↗</a>
                </div>
              </div>
            `;
          }
          return `
            <div class="notice" style="margin-top:20px;border-left:4px solid var(--blue);background:var(--cream-subtle)">
              <strong>✍️ ฟีเจอร์ประกอบ: การส่งต่อลงนามสัญญา (Lite E-Signature)</strong>
              <p style="margin:4px 0 6px;font-size:13px">เมื่อใบเสนอราคาได้รับอนุมัติ สามารถส่งต่อไปยังระบบลงนามเอกสาร Lite E-Signature เพื่อให้ลูกค้าลงนามสัญญาออนไลน์ พร้อมประทับตราและออก Audit Trail Certificate</p>
              <small class="muted">ℹ️ เมื่อลงนามในระบบ E-Sign เรียบร้อย สถานะสัญญาจะซิงก์กลับมาเป็น "ลงนามสำเร็จ" อัตโนมัติ</small>
            </div>
          `;
        })()}

        <div class="form-actions" style="margin-top:16px">
          <a class="btn primary" href="/e-signature?from=crm">✍️ ส่งไปลงนามที่ Lite E-Signature ↗</a>
          <button class="btn" data-close-deal ${d.stage==='won'?'disabled':''}>${d.stage==='won'?'ปิดการขายแล้ว':'ปิดการขาย'}</button>
        </div>
      </section><aside class="card sidebar-card"><h3>Activity ล่าสุด</h3>${s.data.activities.filter(x=>x.deal===d.id).slice(-12).reverse().map(a=>`<div class="timeline-item"><strong>${esc(a.text)}</strong><p class="muted">${esc(a.at)}</p></div>`).join('') || '<p class="muted">ยังไม่มีกิจกรรม</p>'}</aside></div>`;
    }

    app.innerHTML = `<div class="app-shell">${top()}${({overview,pipeline,quote,contract}[s.data.view] || overview)()}</div>`;
    app.querySelector('[data-view-crm-audit]')?.addEventListener('click', () => {
      let esign = null;
      try { esign = JSON.parse(localStorage.getItem('preeya_esign_status') || 'null'); } catch(e){}
      modal('Audit Certificate — Sales Flow CRM & E-Sign', `
        <div class="audit-certificate-box" style="padding:16px;background:var(--subtle);border-radius:10px;font-family:'JetBrains Mono', 'IBM Plex Sans Thai', 'Sarabun', monospace;font-size:13px;line-height:1.8">
          <h3 style="margin:0 0 10px;color:var(--brand)">📜 E-SIGNATURE AUDIT TRAIL LOG</h3>
          <div><strong>Contract Status:</strong> <span class="badge success">ลงนามสำเร็จ (Signed)</span></div>
          <div><strong>Signer Name:</strong> ${esc(esign?.signerName || 'ปรียา สุทธิสาร')} (${esc(esign?.signerRole || 'Managing Director')})</div>
          <div><strong>Organization:</strong> ${esc(esign?.companyName || 'บริษัท เอสเอ็มอี เทค โซลูชั่นส์ จำกัด')}</div>
          <div><strong>Signed Timestamp:</strong> ${esc(esign?.signedAt || today())}</div>
          <div><strong>Document ID:</strong> ${esc(esign?.docId || 'AGR-2026-0881')}</div>
          <div><strong>SHA-256 Checksum:</strong><br><span style="color:var(--success)">sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</span></div>
        </div>
      `);
    });
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
    app.innerHTML = `<div class="app-shell">
      ${appHeader('Thai Shipping Suite', 'ระบบจัดการโลจิสติกส์และพัสดุนำเข้า USA → Thailand', [], '', `<a class="btn small" href="/usa-thai-shipping/admin">Admin Portal</a><a class="btn small" href="/usa-thai-shipping/customer">Customer Portal</a>`)}
      <div class="page-pad">
        <div class="shipping-choice">
          <div class="choice-wrap">
            <span class="app-system-tag" style="margin-bottom:12px;font-size:12px;padding:4px 12px">USA–THAI EXPRESS LOGISTICS</span>
            <h1>เลือกพอร์ตัลเข้าใช้งานระบบ</h1>
            <p class="muted">ระบบบริหารจัดการพัสดุนำเข้า USA → Thailand แบบครบวงจร คำนวณ CBM ค่าภาษีศุลกากร และ Commercial Invoice</p>
            <div class="choice-grid">
              <a class="choice-card" href="/usa-thai-shipping/admin">
                <div class="stat-icon">⚙️</div>
                <div>
                  <h2>Admin Shipping Portal</h2>
                  <p>คำนวณ CBM / Volumetric, ออก Commercial Invoice, และอัปเดตสถานะพัสดุเป็นชุด</p>
                </div>
                <strong>เข้าสู่ระบบหลังบ้าน (Admin) →</strong>
              </a>
              <a class="choice-card" href="/usa-thai-shipping/customer">
                <div class="stat-icon">📍</div>
                <div>
                  <h2>Customer Tracking Portal</h2>
                  <p>ค้นหาพัสดุด้วย Customer ID, ติดตาม Flight/Vessel, ยอดชำระ และสถานะเรียลไทม์</p>
                </div>
                <strong>ติดตามพัสดุลูกค้า (Tracking) →</strong>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>`;
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
        <div class="onboard-banner" style="margin-bottom:20px">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
            <div>
              <span class="eyebrow">🚢 THAI SHIPPING SUITE SYSTEM GUIDE</span>
              <h2 style="margin:4px 0 2px;font-size:18px">วิธีทดลองใช้งานระบบชิปปิ้งนำเข้า USA → Thailand</h2>
              <p class="muted" style="margin:0;font-size:13px">1. คำนวณ CBM ค่าส่ง ➔ 2. ลงทะเบียนพัสดุ ➔ 3. ออก Commercial Invoice และส่งข้อความแจ้งเตือนลูกค้าทาง LINE</p>
            </div>
          </div>
        </div>

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

    // Priority 3.4: Simulated LINE Flex Message Mobile Preview Modal
    app.querySelectorAll('[data-line]').forEach((el) => el.addEventListener('click', () => {
      const list = s.data.packages.filter(x => x.customer === el.dataset.line);
      const primaryPkg = list[0] || {};
      const totalDue = list.reduce((a, x) => a + Number(x.shippingFee || 0) + Number(x.duty || 0), 0);
      const textRaw = `[Preeya Shipping Notify]\nเรียนคุณ ${el.dataset.line}\nพัสดุนำเข้าจาก USA รวม ${list.length} รายการ:\n` +
        list.map(x => `📦 ${x.tracking} (${x.method})\nสถานะ: ${shippingStatuses[x.status]}\nยอดชำระ: ${money((x.shippingFee || 0) + (x.duty || 0))}`).join('\n---\n') +
        `\n\nตรวจสอบได้ที่: https://preeyabizsuite.vercel.app/usa-thai-shipping/customer`;

      modal('จำลองการแจ้งเตือนลูกค้าทาง LINE (LINE Flex Message Preview)', `
        <div class="line-phone-frame">
          <div class="line-chat-screen">
            <div style="font-size:11px;color:#fff;text-align:center;margin-bottom:8px;opacity:0.85">วันนี้ 14:32 น.</div>
            <div class="line-flex-card">
              <div class="line-flex-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 5.92 2 10.75c0 2.97 1.7 5.59 4.34 7.15-.19.68-.69 2.47-.79 2.85-.13.48.18.47.37.35.16-.1 2.2-1.46 3.09-2.06.64.1 1.3.15 1.99.15 5.52 0 10-3.92 10-8.75S17.52 2 12 2z"/></svg>
                <span>Thai Shipping Logistics · Official</span>
              </div>
              <div class="line-flex-body">
                <div style="font-size:14px;font-weight:bold;margin-bottom:4px;color:#111">แจ้งเตือนสถานะพัสดุนำเข้า USA → TH</div>
                <div style="font-size:12px;color:#555;margin-bottom:10px">เรียนคุณ <strong>${esc(el.dataset.line)}</strong></div>
                <div style="background:#F0FDF4;border:1px solid #BBF7D0;padding:8px 10px;border-radius:6px;margin-bottom:10px">
                  <span style="font-size:11px;color:#166534;font-weight:bold">สถานะล่าสุด:</span>
                  <div style="font-size:13px;font-weight:bold;color:#15803D">${shippingStatuses[primaryPkg.status || 0]}</div>
                </div>
                <div style="font-size:12px;line-height:1.6;border-bottom:1px dashed #ddd;padding-bottom:8px;margin-bottom:8px">
                  <div><strong>เลข Tracking:</strong> ${esc(primaryPkg.tracking || 'TH-USA-9921')}</div>
                  <div><strong>รูปแบบขนส่ง:</strong> ${esc(primaryPkg.method || 'Air Freight')}</div>
                  <div><strong>น้ำหนัก / CBM:</strong> ${primaryPkg.weight || 0} kg (${primaryPkg.cbm || 0} CBM)</div>
                  <div><strong>จำนวนพัสดุ:</strong> ${list.length} รายการ</div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="font-size:12px;font-weight:bold">ยอดชำระสุทธิ:</span>
                  <span style="font-size:16px;font-weight:bold;color:#06C755">${money(totalDue)}</span>
                </div>
              </div>
              <div class="line-flex-actions">
                <a class="line-flex-btn" href="/usa-thai-shipping/customer?query=${esc(el.dataset.line)}" target="_blank">📦 ตรวจสอบ Timeline พัสดุ</a>
                <button class="line-flex-btn secondary" type="button" onclick="alert('จำลองการส่งข้อมูล PromptPay ให้ลูกค้าชำระเงินเรียบร้อย')">💳 ดู QR Code ชำระค่านำเข้า</button>
              </div>
            </div>
          </div>
        </div>
        <div style="margin-top:14px;text-align:center">
          <button class="btn small" onclick="navigator.clipboard.writeText('${esc(textRaw).replace(/'/g, "\\'")}');toast('คัดลอกข้อความ LINE Notify สำเร็จ!')">📋 คัดลอกข้อความดิบ (Raw Message)</button>
        </div>
      `);
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
    const totalItemsCount = s.data.inventory.reduce((a, x) => a + x.stock, 0);

    // 4 Core Warehouse Zones Definition
    const zones = [
      { id: 'Zone A', code: 'Zone A-01 / A-03', name: 'Electronics & Handheld Devices', cat: 'Electronics', color: 'blue', maxCap: 50, tag: '⚡ หนาแน่น (Busy)' },
      { id: 'Zone B', code: 'Zone B-01 / B-02', name: 'Heavy Furniture & Steel Racks', cat: 'Furniture', color: 'green', maxCap: 30, tag: '✓ ปกติ (Normal)' },
      { id: 'Zone C', code: 'Zone C-01 / C-03', name: 'Packaging, Tapes & Label Bins', cat: 'Stationery', color: 'yellow', maxCap: 220, tag: '✓ คล่องตัว (Optimal)' },
      { id: 'Zone D', code: 'Zone D-01 / D-02', name: 'Network Switches & Cabling Cages', cat: 'Networking', color: 'coral', maxCap: 20, tag: '🔵 มีพื้นที่ว่าง (Available)' }
    ];

    let body = '';

    if (s.data.view === 'dashboard') {
      body = `<div class="page-pad">
        <!-- 1. Modern Enterprise Stat Cards -->
        <div class="grid cols-4">
          <article class="card stat-card">
            <div class="stat-card-head">
              <small>Total Inventory SKUs</small>
              <div class="stat-icon-box blue">📦</div>
            </div>
            <strong>${s.data.inventory.length} SKUs</strong>
            <small>รวม ${totalItemsCount} ชิ้นในคลังสินค้า</small>
          </article>

          <article class="card stat-card">
            <div class="stat-card-head">
              <small>Total Asset Value</small>
              <div class="stat-icon-box green">💰</div>
            </div>
            <strong>${money(totalValue)}</strong>
            <small>มูลค่าสต็อกสินค้าคงคลังรวม</small>
          </article>

          <article class="card stat-card">
            <div class="stat-card-head">
              <small>Low Stock Alert</small>
              <div class="stat-icon-box coral">⚠️</div>
            </div>
            <strong style="color:var(--coral)">${lowStockItems.length} SKUs</strong>
            <small>ต่ำกว่าเกณฑ์ Reorder Point</small>
          </article>

          <article class="card stat-card">
            <div class="stat-card-head">
              <small>Pending Inbound POs</small>
              <div class="stat-icon-box yellow">📥</div>
            </div>
            <strong>${s.data.inboundOrders.filter(x => x.status === 'Pending').length} Orders</strong>
            <small>รอตรวจรับและจัดเก็บเข้าโซน</small>
          </article>
        </div>

        <!-- 2. WMS Quick Operations Command Bar -->
        <div class="quick-ops-bar">
          <span class="quick-ops-title">⚡ คำสั่งปฏิบัติการคลังด่วน:</span>
          <button class="quick-op-btn blue" data-wms-quick-inbound>📥 รับเข้าด่วน (Quick Inbound)</button>
          <button class="quick-op-btn coral" data-wms-quick-outbound>📤 ตัดจ่ายด่วน (Quick Pick)</button>
          <button class="quick-op-btn yellow" data-wms-scanner>📷 สแกนเนอร์จำลอง (Scan Simulator)</button>
          <button class="quick-op-btn green" data-wms-transfer>🔄 โอนย้ายโซน (Transfer Zone)</button>
          <button class="quick-op-btn" data-wms-action="create-bulk-po">🛒 สร้าง PO สั่งซื้อด่วน (${lowStockItems.length})</button>
        </div>

        <!-- 3. Low Stock Alert Notice -->
        ${lowStockItems.length ? `
          <div class="notice danger" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:24px">
            <div>
              <strong style="color:var(--coral)">⚠️ แจ้งเตือนสินค้าต่ำกว่า Reorder Point (${lowStockItems.length} รายการ):</strong>
              <span class="muted">${lowStockItems.map(x => `${x.sku} (${x.stock}/${x.minStock})`).join(', ')}</span>
            </div>
            <button class="btn small primary" data-wms-action="create-bulk-po">สร้าง PO สั่งซื้อด่วน 🛒</button>
          </div>
        ` : ''}

        <!-- 4. Warehouse Zone Capacity & Heatmap -->
        <section class="card" style="margin-bottom:24px">
          <div class="card-head">
            <div>
              <p class="eyebrow" style="color:var(--blue)">Storage Heatmap & Layout</p>
              <h2>🏢 แผนผังความจุคลังสินค้าแยกตามโซน (Warehouse Zone Utilization & Capacity)</h2>
            </div>
            <span class="badge primary">4 โซนจัดเก็บพร้อมใช้งาน</span>
          </div>
          <div class="zone-grid">
            ${zones.map(z => {
              const items = s.data.inventory.filter(x => x.location.startsWith(z.id));
              const qty = items.reduce((a, x) => a + x.stock, 0);
              const pct = Math.min(100, Math.round((qty / z.maxCap) * 100));
              return `<article class="zone-card">
                <div>
                  <div class="zone-head">
                    <span class="zone-tag ${z.color}">${esc(z.id)}</span>
                    <small class="muted">${esc(z.tag)}</small>
                  </div>
                  <h4 class="zone-title">${esc(z.name)}</h4>
                  <p class="zone-desc">${esc(z.code)} · ${items.length} SKUs</p>
                </div>
                <div>
                  <div class="zone-bar-wrap">
                    <div class="zone-bar-fill ${z.color}" style="width:${pct}%"></div>
                  </div>
                  <div class="zone-meta">
                    <span>ความจุ: ${qty} / ${z.maxCap} ชิ้น</span>
                    <strong>${pct}%</strong>
                  </div>
                  <button class="btn small" style="width:100%;margin-top:12px" data-wms-view-zone="${esc(z.id)}">ตรวจสต็อกโซนนี้ →</button>
                </div>
              </article>`;
            }).join('')}
          </div>
        </section>

        <!-- 5. Category Breakdown & Stock Movement Feeds -->
        <div class="grid cols-2">
          <section class="card">
            <div class="card-head">
              <div>
                <p class="eyebrow" style="color:var(--blue)">Stock Distribution</p>
                <h2>สต็อกแยกตามหมวดหมู่สินค้า</h2>
              </div>
              ${badge('Realtime')}
            </div>
            ${[
              ['Electronics', '💻 Electronics', 'blue'],
              ['Furniture', '🪑 Furniture', 'green'],
              ['Stationery', '📦 Stationery', 'yellow'],
              ['Networking', '🌐 Networking', 'coral']
            ].map(([catKey, catLabel, catColor]) => {
              const items = s.data.inventory.filter(x => x.category === catKey);
              const qty = items.reduce((a, x) => a + x.stock, 0);
              const val = items.reduce((a, x) => a + x.stock * x.price, 0);
              const valPct = totalValue > 0 ? Math.round((val / totalValue) * 100) : 0;
              return `<div style="margin-bottom:14px">
                <div class="summary-line" style="border:none;padding:2px 0">
                  <div><strong>${catLabel}</strong> <small class="muted">(${items.length} SKUs)</small></div>
                  <div style="text-align:right"><strong>${qty} ชิ้น</strong> · <span class="muted">${money(val)}</span></div>
                </div>
                <div class="cat-progress-wrap">
                  <div class="cat-progress-fill" style="width:${valPct}%;background:var(--${catColor})"></div>
                </div>
              </div>`;
            }).join('')}
          </section>

          <section class="card">
            <div class="card-head">
              <div>
                <p class="eyebrow" style="color:var(--blue)">Audit Trail Feed</p>
                <h2>กิจกรรมคลังล่าสุด (Stock Movement)</h2>
              </div>
              <button class="btn small" data-wms-view="reports">ดูประวัติทั้งหมด →</button>
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
            <div class="tabs sub-tabs" style="margin:0">
              ${categories.map(cat => `<button class="tab ${s.data.category === cat ? 'active' : ''}" data-wms-cat="${esc(cat)}">${esc(cat)}</button>`).join('')}
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <input class="input" id="wms-search" style="max-width:260px" placeholder="ค้นหา SKU, ชื่อ หรือ Zone..." value="${esc(s.data.search)}">
              <button class="btn small outline" data-wms-export-csv title="ส่งออกรายงานสต็อกเป็นไฟล์ CSV">📥 ส่งออกรายงานสต็อก (Export CSV)</button>
              <button class="btn small yellow" data-wms-scanner>📷 สแกนเนอร์</button>
              <button class="btn primary small" data-wms-add-sku>+ เพิ่ม SKU ใหม่</button>
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>ชื่อสินค้า & ซัพพลายเออร์</th>
                  <th>หมวดหมู่</th>
                  <th>Location Zone</th>
                  <th>คงเหลือ / จุดเตือน (Min)</th>
                  <th>ราคา/หน่วย</th>
                  <th>มูลค่ารวม</th>
                  <th>การจัดการสต็อก</th>
                </tr>
              </thead>
              <tbody>
                ${filteredInventory.map(x => `
                  <tr>
                    <td><code>${esc(x.sku)}</code></td>
                    <td>
                      <strong>${esc(x.name)}</strong><br>
                      <small class="muted">${esc(x.supplier || '-')}</small>
                    </td>
                    <td>${badge(x.category)}</td>
                    <td><span class="chip" style="font-weight:700">${esc(x.location)}</span></td>
                    <td>
                      <strong style="font-size:16px;color:${x.stock === 0 ? 'var(--coral)' : x.stock <= x.minStock ? '#D97706' : 'inherit'}">
                        ${x.stock}
                      </strong>
                      <small class="muted"> / ${x.minStock} ชิ้น</small>
                      ${x.stock <= x.minStock ? badge('ใกล้หมด', 'warning') : ''}
                    </td>
                    <td>${money(x.price)}</td>
                    <td><strong>${money(x.stock * x.price)}</strong></td>
                    <td>
                      <div style="display:flex;gap:6px;align-items:center">
                        <button class="btn small" data-wms-adjust="${x.sku}" data-delta="-1" title="เบิกจ่าย 1 ชิ้น">−</button>
                        <button class="btn small" data-wms-adjust="${x.sku}" data-delta="1" title="รับเข้า 1 ชิ้น">+</button>
                        <button class="btn small outline" data-wms-label="${x.sku}" title="พิมพ์สติกเกอร์บาร์โค้ด">🏷️ สติกเกอร์</button>
                        <button class="btn small primary" data-wms-po="${x.sku}" title="สั่งซื้อด่วน">PO</button>
                        <button class="btn small" data-wms-transfer-item="${x.sku}" title="ย้ายโซน">ย้าย</button>
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
            <div>
              <p class="eyebrow" style="color:var(--blue)">Inbound Receiving</p>
              <h2>รายการรับสินค้าเข้าคลัง (Inbound PO Receipts)</h2>
            </div>
            <button class="btn primary small" data-wms-quick-inbound>+ สร้างใบรับสินค้าเข้าคลัง</button>
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
                        ${o.status === 'Received' ? 'รับสินค้าแล้ว ✓' : 'ยืนยันรับเข้าคลัง'}
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
            <div>
              <p class="eyebrow" style="color:var(--coral)">Outbound Picking & Dispatch</p>
              <h2>รายการเบิกจ่ายและจัดส่งสินค้า (Outbound Pick List)</h2>
            </div>
            <button class="btn primary small" data-wms-quick-outbound>+ สร้างใบเบิกจ่ายสินค้า</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>ลูกค้า / ปลายทาง</th>
                  <th>SKU สินค้า</th>
                  <th>จำนวนเบิก</th>
                  <th>ผู้หยิบ (Picker)</th>
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
                      <button class="btn small coral" data-wms-confirm-outbound="${o.id}" ${o.status === 'Dispatched' ? 'disabled' : ''}>
                        ${o.status === 'Dispatched' ? 'จัดส่งแล้ว ✓' : 'ยืนยันจัดส่ง / ตัดสต็อก'}
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
          <div class="card-head">
            <div>
              <p class="eyebrow" style="color:var(--blue)">Vendor Network</p>
              <h2>รายชื่อซัพพลายเออร์และคู่ค้าคลังสินค้า (Supplier Partners)</h2>
            </div>
          </div>
          <div class="grid cols-3">
            ${s.data.suppliers.map(sup => `
              <article class="card" style="box-shadow:var(--shadow-chunky)">
                <div class="card-head">
                  <h3>${esc(sup.name)}</h3>
                  <span class="badge primary">${esc(sup.rating)}</span>
                </div>
                <div class="field"><small class="muted">ผู้ติดต่อ:</small><strong>${esc(sup.contact)}</strong></div>
                <div class="field"><small class="muted">โทร:</small><span>${esc(sup.phone)}</span></div>
                <div class="field"><small class="muted">อีเมล:</small><span>${esc(sup.email)}</span></div>
                <div class="field"><small class="muted">ระยะเวลาจัดส่ง (Lead Time):</small><span class="chip">${esc(sup.leadTime)}</span></div>
                <button class="btn small primary" style="width:100%;margin-top:14px" data-wms-quick-inbound="${esc(sup.name)}">🛒 สั่งซื้อเข้าคลังด่วน</button>
              </article>
            `).join('')}
          </div>
        </section>
      </div>`;
    } else {
      // reports view
      body = `<div class="page-pad">
        <section class="card">
          <div class="card-head">
            <div>
              <p class="eyebrow" style="color:var(--blue)">Inventory Audit Trail</p>
              <h2>ประวัติการรับเข้า-เบิกจ่ายสินค้า (Stock Movement Ledger)</h2>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn small outline" data-wms-export-csv>📥 ส่งออกรายงานสต็อก (Export CSV)</button>
              <button class="btn small" data-wms-clear-logs>ล้างประวัติ Log</button>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>วันที่ / เวลา</th>
                  <th>ประเภท</th>
                  <th>SKU สินค้า</th>
                  <th>จำนวน</th>
                  <th>Location Zone</th>
                  <th>ผู้บันทึก</th>
                  <th>หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                ${s.data.logs.map(l => `
                  <tr>
                    <td>${esc(l.date)}</td>
                    <td>${badge(l.type, l.type === 'INBOUND' ? 'success' : 'coral')}</td>
                    <td><code>${esc(l.sku)}</code></td>
                    <td><strong>${l.type === 'INBOUND' ? '+' : '-'}${l.qty} ชิ้น</strong></td>
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

    // Tab Navigation
    app.querySelectorAll('[data-tab]').forEach(el => el.addEventListener('click', () => { s.data.view = el.dataset.tab; save(); }));
    app.querySelectorAll('[data-wms-view]').forEach(el => el.addEventListener('click', () => { s.data.view = el.dataset.wmsView; save(); }));
    app.querySelectorAll('[data-wms-view-zone]').forEach(el => el.addEventListener('click', () => {
      s.data.view = 'inventory';
      s.data.search = el.dataset.wmsViewZone;
      save();
    }));

    // Reset
    app.querySelector('[data-wms-reset]')?.addEventListener('click', () => {
      if (confirm('ล้างข้อมูลสต็อกและคืนค่าเริ่มต้นทั้งหมด?')) { s.reset(); renderWms(); }
    });

    // Clear logs
    app.querySelector('[data-wms-clear-logs]')?.addEventListener('click', () => {
      if (confirm('ต้องการล้างประวัติ Stock Movement ทั้งหมด?')) { s.data.logs = []; save(); toast('ล้างประวัติเรียบร้อย'); }
    });

    // Priority 3.1: Export Stock Report CSV (with UTF-8 BOM)
    app.querySelectorAll('[data-wms-export-csv]').forEach(btn => {
      btn.addEventListener('click', () => {
        const bom = '\uFEFF';
        const headers = ['รหัส SKU', 'ชื่อสินค้า', 'หมวดหมู่', 'ซัพพลายเออร์', 'จำนวนคงเหลือ (ชิ้น)', 'จุดสั่งซื้อซ้ำ (Min Stock)', 'ราคาต่อหน่วย (บาท)', 'มูลค่ารวม (บาท)', 'ตำแหน่งจัดเก็บ'];
        const rows = s.data.inventory.map(item => [
          `"${item.sku}"`,
          `"${item.name.replace(/"/g, '""')}"`,
          `"${item.category}"`,
          `"${(item.supplier || '-').replace(/"/g, '""')}"`,
          item.stock,
          item.minStock,
          item.price,
          item.stock * item.price,
          `"${item.location}"`
        ].join(','));
        const csvContent = bom + [headers.join(','), ...rows].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `nexuswms-inventory-report-${Date.now()}.csv`;
        link.click();
        toast('ดาวน์โหลดรายงานสต็อก CSV เรียบร้อยแล้ว (เปิดใน Excel ได้ทันที)');
      });
    });

    // Priority 3.1: Barcode & QR Label Preview Modal
    app.querySelectorAll('[data-wms-label]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = s.data.inventory.find(x => x.sku === btn.dataset.wmsLabel);
        if (!item) return;
        modal('ตัวอย่างป้ายสติกเกอร์บาร์โค้ดติดกล่อง (Label Sticker Preview)', `
          <div class="barcode-sticker-box">
            <div style="font-size:12px;font-weight:bold;letter-spacing:1px;color:#555;border-bottom:1px solid #ddd;padding-bottom:6px;margin-bottom:8px">
              NEXUS WMS · WAREHOUSE LOGISTICS
            </div>
            <h3 style="margin:4px 0 2px;font-size:18px;color:#111">${esc(item.name)}</h3>
            <div style="font-size:12px;color:#666">SKU: <strong>${esc(item.sku)}</strong> · Category: ${esc(item.category)}</div>
            
            <div class="barcode-lines-sim"></div>
            <div style="font-family:monospace;font-size:13px;font-weight:bold;letter-spacing:4px;margin-bottom:10px">*${esc(item.sku)}*</div>

            <div style="display:flex;justify-content:space-around;background:#f5f5f5;padding:8px;border-radius:6px;font-size:12px;margin-top:10px">
              <div><strong>ตำแหน่ง (Zone):</strong><br><span style="font-size:14px;color:var(--primary)">${esc(item.location)}</span></div>
              <div><strong>หน่วยบรรจุ:</strong><br><span style="font-size:14px">กล่อง / ชิ้น</span></div>
              <div><strong>จุดตรวจนับ:</strong><br><span style="font-size:14px">IN-OK</span></div>
            </div>
            <p style="margin:12px 0 0;font-size:11px;color:#888">สำหรับเครื่องพิมพ์สติกเกอร์ความร้อน (Thermal Label 100×75mm)</p>
          </div>
        `, `<div class="form-actions"><button class="btn primary" onclick="window.print()">🖨️ สั่งพิมพ์สติกเกอร์ (Print Label)</button></div>`);
      });
    });

    // Search and Category
    app.querySelectorAll('[data-wms-cat]').forEach(el => el.addEventListener('click', () => { s.data.category = el.dataset.wmsCat; save(); }));
    app.querySelector('#wms-search')?.addEventListener('input', (e) => {
      s.data.search = e.target.value;
      s.save();
      renderWms();
      document.querySelector('#wms-search')?.focus();
    });

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
        toast(`อัปเดตสต็อก ${item.sku} คงเหลือ ${item.stock} ชิ้น`);
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
    app.querySelectorAll('[data-wms-action="create-bulk-po"]').forEach(btn => btn.addEventListener('click', () => {
      if (!lowStockItems.length) { toast('ไม่มีสินค้าที่ต่ำกว่าเกณฑ์ Reorder Point'); return; }
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
      toast(`สร้างใบ PO สั่งซื้อด่วน ${lowStockItems.length} รายการแล้ว`);
    }));

    // Confirm Inbound
    app.querySelectorAll('[data-wms-confirm-inbound]').forEach(btn => btn.addEventListener('click', () => {
      const orderId = btn.dataset.wmsConfirmInbound;
      const order = s.data.inboundOrders.find(x => x.id === orderId);
      if (order && order.status !== 'Received') {
        order.status = 'Received';
        const item = s.data.inventory.find(x => x.sku === order.sku);
        if (item) item.stock += order.qty;
        s.data.logs.unshift({
          id: id('LOG'),
          type: 'INBOUND',
          sku: order.sku,
          qty: order.qty,
          location: order.location,
          note: `รับเข้าตาม ${order.poNumber} จาก ${order.supplier}`,
          date: today() + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          user: 'Preeya C.'
        });
        save();
        toast(`ตรวจรับสินค้า ${order.sku} เข้า ${order.location} สำเร็จ (+ ${order.qty} ชิ้น)`);
      }
    }));

    // Confirm Outbound
    app.querySelectorAll('[data-wms-confirm-outbound]').forEach(btn => btn.addEventListener('click', () => {
      const orderId = btn.dataset.wmsConfirmOutbound;
      const order = s.data.outboundOrders.find(x => x.id === orderId);
      if (order && order.status !== 'Dispatched') {
        const item = s.data.inventory.find(x => x.sku === order.sku);
        if (item && item.stock < order.qty) {
          toast(`สต็อกไม่เพียงพอ (มี ${item.stock} ชิ้น, ต้องการ ${order.qty} ชิ้น)`);
          return;
        }
        order.status = 'Dispatched';
        if (item) item.stock -= order.qty;
        s.data.logs.unshift({
          id: id('LOG'),
          type: 'OUTBOUND',
          sku: order.sku,
          qty: order.qty,
          location: item ? item.location : 'Zone A-01',
          note: `เบิกจ่ายส่งมอบตาม ${order.orderNo} ให้ ${order.customer}`,
          date: today() + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          user: order.picker || 'Somchai N.'
        });
        save();
        toast(`ตัดสต็อกและจัดส่ง ${order.sku} สำเร็จ (- ${order.qty} ชิ้น)`);
      }
    }));

    // Interactive Barcode Scanner Modal Simulator
    app.querySelectorAll('[data-wms-scanner]').forEach(btn => btn.addEventListener('click', () => {
      let activeItem = s.data.inventory[0];
      const m = modal('📷 เครื่องสแกนบาร์โค้ดคลังสินค้าจำลอง (Barcode / QR PDA Simulator)', `
        <div class="scanner-screen">
          <div class="scanner-laser"></div>
          <div style="font-size:42px;margin-bottom:8px">||| | |||| | |||</div>
          <strong style="letter-spacing:0.1em;font-size:16px" id="scan-target-sku">${activeItem.sku}</strong>
          <p style="font-size:12px;color:#9CA3AF;margin:4px 0 0">จุดเลเซอร์พร้อมตรวจจับรหัสบาร์โค้ดแบบเรียลไทม์</p>
        </div>

        <div style="margin-bottom:16px">
          <label style="font-size:12.5px;font-weight:800;display:block;margin-bottom:6px">เลือกยิงบาร์โค้ดสินค้าตัวอย่างในคลัง:</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${s.data.inventory.map(item => `
              <button class="btn small" data-scan-preset="${item.sku}">${item.sku}</button>
            `).join('')}
          </div>
        </div>

        <div class="scanner-result-card" id="scanner-result-box">
          <div class="card-head" style="margin-bottom:8px;padding-bottom:8px">
            <div>
              <span class="badge primary" id="scan-res-cat">${activeItem.category}</span>
              <h3 id="scan-res-name" style="margin:4px 0 0">${esc(activeItem.name)}</h3>
            </div>
            <strong style="font-size:22px;color:var(--blue)" id="scan-res-stock">${activeItem.stock} ชิ้น</strong>
          </div>
          <div class="summary-line" style="border:none;padding:4px 0;font-size:13px">
            <span>Location Zone: <strong id="scan-res-loc">${activeItem.location}</strong></span>
            <span>ราคา: <strong id="scan-res-price">${money(activeItem.price)}</strong></span>
          </div>
        </div>

        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button class="btn primary small" id="scan-add-btn">📥 สแกนรับเข้า (+1)</button>
          <button class="btn coral small" id="scan-sub-btn">📤 สแกนจ่ายออก (-1)</button>
          <button class="btn small" data-close-modal>ปิดหน้าจอ</button>
        </div>
      `);

      const updateScannerView = (sku) => {
        const found = s.data.inventory.find(x => x.sku === sku);
        if (!found) return;
        activeItem = found;
        m.querySelector('#scan-target-sku').textContent = found.sku;
        m.querySelector('#scan-res-cat').textContent = found.category;
        m.querySelector('#scan-res-name').textContent = found.name;
        m.querySelector('#scan-res-stock').textContent = `${found.stock} ชิ้น`;
        m.querySelector('#scan-res-loc').textContent = found.location;
        m.querySelector('#scan-res-price').textContent = money(found.price);
      };

      m.querySelectorAll('[data-scan-preset]').forEach(b => b.addEventListener('click', () => {
        updateScannerView(b.dataset.scanPreset);
      }));

      m.querySelector('#scan-add-btn').addEventListener('click', () => {
        activeItem.stock += 1;
        s.data.logs.unshift({
          id: id('LOG'),
          type: 'INBOUND',
          sku: activeItem.sku,
          qty: 1,
          location: activeItem.location,
          note: 'สแกนรับเข้าด้วย PDA Scanner',
          date: today() + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          user: 'Barcode Scanner'
        });
        save();
        updateScannerView(activeItem.sku);
        toast(`สแกนรับเข้า ${activeItem.sku} สำเร็จ (+1 ชิ้น)`);
      });

      m.querySelector('#scan-sub-btn').addEventListener('click', () => {
        if (activeItem.stock <= 0) { toast('สินค้าหมดสต็อก'); return; }
        activeItem.stock -= 1;
        s.data.logs.unshift({
          id: id('LOG'),
          type: 'OUTBOUND',
          sku: activeItem.sku,
          qty: 1,
          location: activeItem.location,
          note: 'สแกนตัดจ่ายด้วย PDA Scanner',
          date: today() + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          user: 'Barcode Scanner'
        });
        save();
        updateScannerView(activeItem.sku);
        toast(`สแกนตัดจ่าย ${activeItem.sku} สำเร็จ (-1 ชิ้น)`);
      });
    }));

    // Quick Inbound Modal
    app.querySelectorAll('[data-wms-quick-inbound]').forEach(btn => btn.addEventListener('click', () => {
      const defaultSupplier = btn.dataset.wmsQuickInbound || s.data.suppliers[0].name;
      const m = modal('📥 บันทึกรับสินค้าเข้าคลัง (Quick Inbound PO)', `
        <form id="quick-inbound-form">
          <div class="field">
            <label>เลือกสินค้าที่รับเข้า (SKU)</label>
            <select class="select" name="sku">
              ${s.data.inventory.map(item => `<option value="${item.sku}">${item.sku} - ${item.name} (คงเหลือ ${item.stock})`).join('')}
            </select>
          </div>
          <div class="grid cols-2">
            <div class="field">
              <label>จำนวนที่รับเข้า (ชิ้น)</label>
              <input class="input" type="number" name="qty" value="20" min="1" required>
            </div>
            <div class="field">
              <label>จัดเก็บเข้า Zone</label>
              <select class="select" name="location">
                <option value="Zone A-01">Zone A-01 (Electronics)</option>
                <option value="Zone B-01">Zone B-01 (Furniture)</option>
                <option value="Zone C-01">Zone C-01 (Stationery)</option>
                <option value="Zone D-01">Zone D-01 (Networking)</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label>ซัพพลายเออร์ผู้ส่งมอบ</label>
            <input class="input" name="supplier" value="${esc(defaultSupplier)}" required>
          </div>
          <div class="modal-actions">
            <button class="btn" type="button" data-close-modal>ยกเลิก</button>
            <button class="btn primary" type="submit">ยืนยันรับเข้าคลัง ✓</button>
          </div>
        </form>
      `);

      m.querySelector('#quick-inbound-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const sku = fd.get('sku');
        const qty = Number(fd.get('qty'));
        const loc = fd.get('location');
        const sup = fd.get('supplier');

        const item = s.data.inventory.find(x => x.sku === sku);
        if (item) {
          item.stock += qty;
          item.location = loc;
        }

        s.data.inboundOrders.unshift({
          id: id('IN'),
          poNumber: `PO-${Date.now().toString().slice(-4)}`,
          supplier: sup,
          sku: sku,
          qty: qty,
          location: loc,
          status: 'Received',
          date: today()
        });

        s.data.logs.unshift({
          id: id('LOG'),
          type: 'INBOUND',
          sku: sku,
          qty: qty,
          location: loc,
          note: `รับสินค้าเข้าจาก ${sup}`,
          date: today() + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          user: 'Preeya C.'
        });

        m.remove();
        save();
        toast(`รับเข้า ${sku} จำนวน ${qty} ชิ้น เรียบร้อยแล้ว`);
      });
    }));

    // Quick Outbound Modal
    app.querySelectorAll('[data-wms-quick-outbound]').forEach(btn => btn.addEventListener('click', () => {
      const m = modal('📤 บันทึกเบิกจ่ายสินค้า (Quick Outbound / Pick List)', `
        <form id="quick-outbound-form">
          <div class="field">
            <label>เลือกสินค้าที่ต้องการเบิก (SKU)</label>
            <select class="select" name="sku">
              ${s.data.inventory.map(item => `<option value="${item.sku}">${item.sku} - ${item.name} (มีในคลัง ${item.stock})`).join('')}
            </select>
          </div>
          <div class="grid cols-2">
            <div class="field">
              <label>จำนวนที่เบิกจ่าย (ชิ้น)</label>
              <input class="input" type="number" name="qty" value="5" min="1" required>
            </div>
            <div class="field">
              <label>ผู้เบิก / ลูกค้าปลายทาง</label>
              <input class="input" name="customer" value="ลูกค้าทั่วไป / เบิกหน้าร้าน" required>
            </div>
          </div>
          <div class="field">
            <label>หมายเหตุการเบิกจ่าย</label>
            <input class="input" name="note" value="เบิกจ่ายตามคำสั่งซื้อด่วน">
          </div>
          <div class="modal-actions">
            <button class="btn" type="button" data-close-modal>ยกเลิก</button>
            <button class="btn coral" type="submit">ยืนยันตัดจ่ายสต็อก ✓</button>
          </div>
        </form>
      `);

      m.querySelector('#quick-outbound-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const sku = fd.get('sku');
        const qty = Number(fd.get('qty'));
        const customer = fd.get('customer');
        const note = fd.get('note');

        const item = s.data.inventory.find(x => x.sku === sku);
        if (!item || item.stock < qty) {
          toast(`สต็อกไม่เพียงพอ (มี ${item ? item.stock : 0} ชิ้น)`);
          return;
        }

        item.stock -= qty;

        s.data.outboundOrders.unshift({
          id: id('OUT'),
          orderNo: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          customer: customer,
          sku: sku,
          qty: qty,
          status: 'Dispatched',
          picker: 'Preeya C.',
          date: today()
        });

        s.data.logs.unshift({
          id: id('LOG'),
          type: 'OUTBOUND',
          sku: sku,
          qty: qty,
          location: item.location,
          note: `เบิกจ่ายให้ ${customer} (${note})`,
          date: today() + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          user: 'Preeya C.'
        });

        m.remove();
        save();
        toast(`ตัดจ่าย ${sku} จำนวน ${qty} ชิ้น เรียบร้อยแล้ว`);
      });
    }));

    // Transfer Zone Modal
    const openTransferModal = (defaultSku = '') => {
      const activeSku = defaultSku || s.data.inventory[0].sku;
      const m = modal('🔄 โอนย้ายตำแหน่งจัดเก็บสินค้า (Zone Transfer)', `
        <form id="transfer-zone-form">
          <div class="field">
            <label>เลือกสินค้าที่ต้องการย้าย (SKU)</label>
            <select class="select" name="sku" id="trans-sku-select">
              ${s.data.inventory.map(item => `<option value="${item.sku}" ${item.sku === activeSku ? 'selected' : ''}>${item.sku} - ${item.name} (ปัจจุบัน: ${item.location})`).join('')}
            </select>
          </div>
          <div class="field">
            <label>เลือกโซนจัดเก็บปลายทาง</label>
            <select class="select" name="newLocation">
              <option value="Zone A-01">Zone A-01 (Electronics / Front)</option>
              <option value="Zone A-02">Zone A-02 (Electronics / Middle)</option>
              <option value="Zone B-01">Zone B-01 (Heavy Furniture)</option>
              <option value="Zone C-01">Zone C-01 (Stationery / Fast Bin)</option>
              <option value="Zone D-01">Zone D-01 (Networking Secure)</option>
            </select>
          </div>
          <div class="field">
            <label>เหตุผลในการโอนย้าย</label>
            <input class="input" name="reason" value="ปรับพื้นที่จัดระเบียบคลังใหม่">
          </div>
          <div class="modal-actions">
            <button class="btn" type="button" data-close-modal>ยกเลิก</button>
            <button class="btn green" type="submit">บันทึกการโอนย้าย ✓</button>
          </div>
        </form>
      `);

      m.querySelector('#transfer-zone-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const sku = fd.get('sku');
        const newLoc = fd.get('newLocation');
        const reason = fd.get('reason');

        const item = s.data.inventory.find(x => x.sku === sku);
        if (item) {
          const oldLoc = item.location;
          item.location = newLoc;
          s.data.logs.unshift({
            id: id('LOG'),
            type: 'INBOUND',
            sku: sku,
            qty: item.stock,
            location: newLoc,
            note: `ย้ายโซนจาก ${oldLoc} ➔ ${newLoc} (${reason})`,
            date: today() + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            user: 'Preeya C.'
          });
          m.remove();
          save();
          toast(`ย้ายสินค้า ${sku} ไปยัง ${newLoc} เรียบร้อยแล้ว`);
        }
      });
    };

    app.querySelectorAll('[data-wms-transfer]').forEach(btn => btn.addEventListener('click', () => openTransferModal()));
    app.querySelectorAll('[data-wms-transfer-item]').forEach(btn => btn.addEventListener('click', () => openTransferModal(btn.dataset.wmsTransferItem)));

    // Add New SKU Modal
    app.querySelector('[data-wms-add-sku]')?.addEventListener('click', () => {
      const m = modal('➕ เพิ่มรายการสินค้าใหม่ (Register New SKU)', `
        <form id="add-sku-form">
          <div class="grid cols-2">
            <div class="field">
              <label>รหัส SKU สินค้า</label>
              <input class="input" name="sku" placeholder="เช่น EL-004" required>
            </div>
            <div class="field">
              <label>หมวดหมู่</label>
              <select class="select" name="category">
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Stationery">Stationery</option>
                <option value="Networking">Networking</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label>ชื่อสินค้า</label>
            <input class="input" name="name" placeholder="เช่น Smart Barcode Scale" required>
          </div>
          <div class="grid cols-3">
            <div class="field">
              <label>จำนวนเริ่มต้น (ชิ้น)</label>
              <input class="input" type="number" name="stock" value="10" min="0" required>
            </div>
            <div class="field">
              <label>จุดสั่งซื้อซ้ำ (Min Stock)</label>
              <input class="input" type="number" name="minStock" value="5" min="1" required>
            </div>
            <div class="field">
              <label>ราคาต่อหน่วย (บาท)</label>
              <input class="input" type="number" name="price" value="1200" min="1" required>
            </div>
          </div>
          <div class="grid cols-2">
            <div class="field">
              <label>ตำแหน่งจัดเก็บ (Location)</label>
              <input class="input" name="location" value="Zone A-04" required>
            </div>
            <div class="field">
              <label>ซัพพลายเออร์</label>
              <input class="input" name="supplier" value="SUP-001 Nexus Tech Supply" required>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn" type="button" data-close-modal>ยกเลิก</button>
            <button class="btn primary" type="submit">บันทึกสินค้าใหม่ ✓</button>
          </div>
        </form>
      `);

      m.querySelector('#add-sku-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const newSku = {
          sku: fd.get('sku').toUpperCase().trim(),
          name: fd.get('name').trim(),
          category: fd.get('category'),
          stock: Number(fd.get('stock')),
          minStock: Number(fd.get('minStock')),
          price: Number(fd.get('price')),
          location: fd.get('location'),
          supplier: fd.get('supplier')
        };

        if (s.data.inventory.some(x => x.sku === newSku.sku)) {
          toast(`รหัส SKU ${newSku.sku} มีอยู่ในระบบแล้ว`);
          return;
        }

        s.data.inventory.unshift(newSku);
        s.data.logs.unshift({
          id: id('LOG'),
          type: 'INBOUND',
          sku: newSku.sku,
          qty: newSku.stock,
          location: newSku.location,
          note: 'ลงทะเบียน SKU ใหม่เข้าสู่คลังสินค้า',
          date: today() + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          user: 'Preeya C.'
        });

        m.remove();
        save();
        toast(`ลงทะเบียน SKU ${newSku.sku} สำเร็จ`);
      });
    });

    const wmsParams = new URLSearchParams(window.location.search);
    const modalParam = wmsParams.get('modal') || window.location.hash.replace('#', '');
    if (modalParam === 'inbound') {
      setTimeout(() => app.querySelector('[data-wms-quick-inbound]')?.click(), 120);
    } else if (modalParam === 'outbound') {
      setTimeout(() => app.querySelector('[data-wms-quick-outbound]')?.click(), 120);
    } else if (modalParam === 'scanner') {
      setTimeout(() => app.querySelector('[data-wms-scanner]')?.click(), 120);
    } else if (modalParam === 'transfer') {
      setTimeout(() => app.querySelector('[data-wms-transfer]')?.click(), 120);
    } else if (modalParam === 'add-sku') {
      setTimeout(() => app.querySelector('[data-wms-add-sku]')?.click(), 120);
    }
  }

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
    { id: 'P1', name: 'Espresso Single Shot', cat: 'Coffee', price: 65, hasModifiers: true },
    { id: 'P2', name: 'Iced Americano', cat: 'Coffee', price: 75, hasModifiers: true },
    { id: 'P3', name: 'Cappuccino Premium', cat: 'Coffee', price: 90, hasModifiers: true },
    { id: 'P4', name: 'Thai Milk Tea (ชาไทย)', cat: 'Tea', price: 70, hasModifiers: true },
    { id: 'P5', name: 'Uji Matcha Latte', cat: 'Tea', price: 110, hasModifiers: true },
    { id: 'P6', name: 'Butter Croissant', cat: 'Bakery', price: 85, hasModifiers: false },
    { id: 'P7', name: 'Dark Chocolate Cake', cat: 'Bakery', price: 125, hasModifiers: false },
    { id: 'P8', name: 'Club Sandwich Supreme', cat: 'Food', price: 145, hasModifiers: false },
    { id: 'P9', name: 'Caesar Chicken Salad', cat: 'Food', price: 155, hasModifiers: false },
    { id: 'P10', name: 'Spaghetti Carbonara', cat: 'Food', price: 195, hasModifiers: false }
  ];

  const smartPosSeed = {
    view: 'pos', orderType: 'Dine-in', selectedTable: 'T-01', search: '', category: 'All',
    cart: [],
    tables: [
      { id: 'T-01', name: 'โต๊ะ T-01 (โซน A)', status: 'Occupied', currentOrder: 'ORD-5501' },
      { id: 'T-02', name: 'โต๊ะ T-02 (โซน A)', status: 'Free', currentOrder: null },
      { id: 'T-03', name: 'โต๊ะ T-03 (โซน B)', status: 'Billing', currentOrder: 'ORD-5498' },
      { id: 'T-04', name: 'โต๊ะ T-04 (โซน B)', status: 'Free', currentOrder: null },
      { id: 'T-05', name: 'โต๊ะ T-05 (Outdoor)', status: 'Free', currentOrder: null },
      { id: 'T-06', name: 'โต๊ะ T-06 (Outdoor)', status: 'Occupied', currentOrder: 'ORD-5503' }
    ],
    orders: [
      { id: 'ORD-5498', table: 'T-03', type: 'Dine-in', items: [{ name: 'Iced Americano', qty: 2, price: 75, details: 'หวาน 50%' }, { name: 'Butter Croissant', qty: 1, price: 85, details: '' }], status: 'ready', method: 'PromptPay QR', total: 251.45, at: '11:20' },
      { id: 'ORD-5501', table: 'T-01', type: 'Dine-in', items: [{ name: 'Uji Matcha Latte', qty: 1, price: 110, details: 'หวาน 25%, Oat Milk (+20฿)' }], status: 'cooking', method: 'Cash', total: 139.10, at: '11:35' },
    ],
    shift: { float: 2000, cashCollected: 4500, qrCollected: 6800, cardCollected: 3200 }
  };

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
        <div class="receipt-slip" style="background:#fff;color:#111;padding:20px;border-radius:12px;font-family:'JetBrains Mono', 'IBM Plex Sans Thai', 'Sarabun', monospace;max-width:360px;margin:auto">
          <div style="text-align:center;border-bottom:1px dashed #333;padding-bottom:12px;margin-bottom:12px">
            <h2 style="margin:0;font-size:20px">Preeya Cafe & Bistro</h2>
            <p style="margin:4px 0;font-size:12px">TAX ID: 0-1055-69001-99-1</p>
            <p style="margin:0;font-size:12px">เลขออเดอร์: ${orderId} · โต๊ะ: ${s.data.selectedTable}</p>
            <p style="margin:0;font-size:11px">วันที่: ${today()} ${newOrder.at}</p>
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
            <div style="display:flex;justify-content:space-between"><span>ยอดรวม (Subtotal):</span><span>${money(cartSubtotal)}</span></div>
            <div style="display:flex;justify-content:space-between"><span>ภาษีมูลค่าเพิ่ม 7% (VAT):</span><span>${money(cartVat)}</span></div>
            <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;margin-top:6px"><span>ยอดสุทธิ (TOTAL):</span><span>${money(cartTotal)}</span></div>
            <div style="display:flex;justify-content:space-between;margin-top:4px"><span>ชำระโดย:</span><span>${method}</span></div>
          </div>

          <div style="text-align:center;margin-top:16px;font-size:11px;color:#666">
            ขอบคุณที่ใช้บริการค่ะ / Thank you!
          </div>
        </div>
      `, `<div class="form-actions"><button class="btn primary" onclick="window.print()">🖨️ พิมพ์ใบเสร็จ (Thermal 80mm Preview)</button></div>`);

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

          <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">
            <a class="btn coral" href="/business-suite">← กลับไป Sales Flow CRM</a>
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

    app.innerHTML = `<div class="app-shell">${appHeader('Lite E-Signature', `${esc(s.data.selectedDoc)} · ฟีเจอร์ประกอบ Sales Flow CRM สำหรับลงนามสัญญาพร้อม Audit Trail`, [], '', `<a class="btn small primary" href="/business-suite" style="margin-right:8px">← กลับไป Sales Flow CRM</a><button class="btn small danger" data-esign-reset>รีเซ็ตข้อมูล</button>`)}${body}</div>`;

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
        <div class="audit-certificate-box" style="padding:16px;background:var(--subtle);border-radius:10px;font-family:'JetBrains Mono', 'IBM Plex Sans Thai', 'Sarabun', monospace;font-size:13px;line-height:1.8">
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

  // Priority 3.5: Storefront Simulated Checkout Flow Modal
  function openStorefrontCheckoutModal() {
    modal('จำลองขั้นตอนสั่งซื้อสินค้า (Simulated Checkout Flow)', `
      <div id="checkout-flow-container">
        <!-- Step 1: Shipping Address -->
        <div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px dashed var(--line)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <h4 style="margin:0;font-size:14px;font-weight:700">1. ข้อมูลจัดส่ง (Shipping Address)</h4>
            <button class="btn small outline" type="button" id="btn-checkout-autofill">⚡ กรอกข้อมูลตัวอย่างอัตโนมัติ</button>
          </div>
          <div class="grid cols-2" style="gap:10px">
            <input class="input" type="text" id="chk-name" placeholder="ชื่อ-นามสกุล ผู้รับ" value="คุณปรียา สุทธิสาร">
            <input class="input" type="text" id="chk-phone" placeholder="เบอร์โทรศัพท์ติดต่อ" value="081-234-5678">
            <input class="input" type="text" id="chk-addr" style="grid-column:1/-1" placeholder="ที่อยู่จัดส่ง" value="123/45 ซ.สุขุมวิท 55 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110">
          </div>
        </div>

        <!-- Step 2: Payment Method -->
        <div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px dashed var(--line)">
          <h4 style="margin:0 0 10px;font-size:14px;font-weight:700">2. เลือกวิธีชำระเงิน (Payment Method)</h4>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
            <label style="border:1px solid var(--primary);background:var(--primary-light);padding:10px;border-radius:8px;cursor:pointer;text-align:center">
              <input type="radio" name="chk-pay" value="qr" checked>
              <div style="font-size:12px;font-weight:bold;margin-top:4px">PromptPay QR</div>
            </label>
            <label style="border:1px solid var(--line);background:var(--panel);padding:10px;border-radius:8px;cursor:pointer;text-align:center">
              <input type="radio" name="chk-pay" value="card">
              <div style="font-size:12px;font-weight:bold;margin-top:4px">บัตรเครดิต</div>
            </label>
            <label style="border:1px solid var(--line);background:var(--panel);padding:10px;border-radius:8px;cursor:pointer;text-align:center">
              <input type="radio" name="chk-pay" value="cod">
              <div style="font-size:12px;font-weight:bold;margin-top:4px">เก็บเงินปลายทาง</div>
            </label>
          </div>
        </div>

        <!-- Step 3: Order Summary & Confirm -->
        <div style="background:var(--subtle);padding:14px;border-radius:10px;margin-bottom:16px">
          <div style="font-size:13px;font-weight:bold;margin-bottom:8px">สรุปรายการคำสั่งซื้อ</div>
          <div style="font-size:12.5px;line-height:1.6">
            <div style="display:flex;justify-content:space-between"><span>1 × OAI Classic Heavyweight Hoodie (L)</span><strong>1,290 ฿</strong></div>
            <div style="display:flex;justify-content:space-between"><span>2 × OAI Signature Cotton T-Shirt (M)</span><strong>1,180 ฿</strong></div>
            <div style="display:flex;justify-content:space-between;color:var(--green)"><span>ค่าจัดส่ง Standard Delivery</span><strong>ฟรี</strong></div>
            <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:bold;border-top:1px dashed var(--line);padding-top:6px;margin-top:6px">
              <span>ยอดชำระสุทธิ:</span><span style="color:var(--primary)">2,470 ฿</span>
            </div>
          </div>
        </div>

        <button class="btn primary" type="button" id="btn-confirm-checkout" style="width:100%;padding:12px;font-size:14px;font-weight:700">
          🛍️ ยืนยันคำสั่งซื้อ (จำลองการชำระเงิน)
        </button>
      </div>
    `);

    document.getElementById('btn-checkout-autofill')?.addEventListener('click', () => {
      document.getElementById('chk-name').value = 'คุณปรียา สุทธิสาร';
      document.getElementById('chk-phone').value = '081-234-5678';
      document.getElementById('chk-addr').value = '123/45 ซ.สุขุมวิท 55 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110';
      toast('กรอกข้อมูลที่อยู่ตัวอย่างเรียบร้อย');
    });

    document.getElementById('btn-confirm-checkout')?.addEventListener('click', () => {
      const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const container = document.getElementById('checkout-flow-container');
      if (container) {
        container.innerHTML = `
          <div style="text-align:center;padding:16px 8px">
            <div style="font-size:48px;margin-bottom:8px">🎉</div>
            <h3 style="font-size:20px;font-weight:800;color:var(--green);margin:0 0 6px">การสั่งซื้อจำลองสำเร็จ!</h3>
            <p style="color:var(--muted);font-size:13px;margin:0 0 16px">ระบบบันทึกออเดอร์และตัดสต็อกจำลองเรียบร้อยแล้ว</p>
            
            <div style="background:var(--subtle);border-radius:10px;padding:16px;text-align:left;font-size:13px;line-height:1.7;margin-bottom:16px">
              <div><strong>หมายเลขคำสั่งซื้อ:</strong> <span style="color:var(--primary);font-weight:bold">${orderId}</span></div>
              <div><strong>ผู้รับสินค้า:</strong> คุณปรียา สุทธิสาร (081-234-5678)</div>
              <div><strong>ยอดชำระ:</strong> 2,470 บาท (PromptPay QR ชำระแล้ว)</div>
              <div><strong>สถานะจัดส่ง:</strong> <span class="badge success">กำลังเตรียมพัสดุ</span></div>
              <div><strong>กำหนดส่ง:</strong> ภายใน 2–3 วันทำการ (Flash Express)</div>
            </div>

            <button class="btn primary" type="button" onclick="document.querySelector('.modal-backdrop')?.remove()">
              กลับสู่หน้าร้านค้า
            </button>
          </div>
        `;
      }
    });
  }

  // Priority 3.6: Tilt Signal Table Booking Modal
  function openTiltBookingModal(onSuccess) {
    modal('จองโต๊ะและรับคิวออนไลน์ (Interactive Table Booking)', `
      <form id="tilt-booking-form">
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:12.5px;font-weight:bold;margin-bottom:6px">1. เลือกโซนที่นั่ง (Seat Zone)</label>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
            <label style="border:1px solid #00F0FF;background:rgba(0,240,255,0.08);padding:10px;border-radius:8px;cursor:pointer;text-align:center">
              <input type="radio" name="tilt-zone" value="Arcade Zone" checked>
              <div style="font-size:12px;font-weight:bold;margin-top:4px">Arcade Zone</div>
              <small class="muted">โซนเกมตู้ & แสงสี</small>
            </label>
            <label style="border:1px solid var(--line);padding:10px;border-radius:8px;cursor:pointer;text-align:center">
              <input type="radio" name="tilt-zone" value="Neon Booth">
              <div style="font-size:12px;font-weight:bold;margin-top:4px">Neon Booth</div>
              <small class="muted">โซนบูธนีออนส่วนตัว</small>
            </label>
            <label style="border:1px solid var(--line);padding:10px;border-radius:8px;cursor:pointer;text-align:center">
              <input type="radio" name="tilt-zone" value="VIP Lounge">
              <div style="font-size:12px;font-weight:bold;margin-top:4px">VIP Lounge</div>
              <small class="muted">ห้องวีไอพีกลุ่มใหญ่</small>
            </label>
          </div>
        </div>

        <div class="grid cols-2" style="gap:12px;margin-bottom:14px">
          <div class="field">
            <label>2. รอบเวลาจอง</label>
            <select class="select" id="tilt-time">
              <option value="18:30 น.">18:30 น. (หัวค่ำ)</option>
              <option value="19:30 น." selected>19:30 น. (ช่วงพีค)</option>
              <option value="21:00 น.">21:00 น. (ดนตรีสด)</option>
              <option value="22:30 น.">22:30 น. (Late Night)</option>
            </select>
          </div>
          <div class="field">
            <label>จำนวนลูกค้า</label>
            <select class="select" id="tilt-guests">
              <option value="2">2 ท่าน</option>
              <option value="4" selected>4 ท่าน</option>
              <option value="6">6 ท่าน</option>
              <option value="8">8+ ท่าน (กลุ่มใหญ่)</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom:16px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <label style="font-size:12.5px;font-weight:bold">3. ข้อมูลผู้จอง</label>
            <button class="btn small outline" type="button" id="btn-tilt-autofill">⚡ ตัวอย่าง</button>
          </div>
          <div class="grid cols-2" style="gap:10px">
            <input class="input" type="text" id="tilt-cust-name" placeholder="ชื่อ-นามสกุล" value="คุณปรียา สุทธิสาร" required>
            <input class="input" type="text" id="tilt-cust-phone" placeholder="เบอร์โทรศัพท์" value="081-234-5678" required>
          </div>
        </div>

        <button class="btn primary" type="button" id="btn-tilt-submit-book" style="width:100%;padding:12px;font-weight:700;background:#00F0FF;color:#000;border:none">
          🍸 ยืนยันการจองโต๊ะ (รับ QR Ticket Pass)
        </button>
      </form>
    `);

    document.getElementById('btn-tilt-autofill')?.addEventListener('click', () => {
      document.getElementById('tilt-cust-name').value = 'คุณปรียา สุทธิสาร';
      document.getElementById('tilt-cust-phone').value = '081-234-5678';
      toast('กรอกข้อมูลตัวอย่างเรียบร้อย');
    });

    document.getElementById('btn-tilt-submit-book')?.addEventListener('click', () => {
      const name = document.getElementById('tilt-cust-name')?.value.trim() || 'ลูกค้า';
      const phone = document.getElementById('tilt-cust-phone')?.value.trim() || '081-000-0000';
      const zone = document.querySelector('input[name="tilt-zone"]:checked')?.value || 'Arcade Zone';
      const time = document.getElementById('tilt-time')?.value || '19:30 น.';
      const guests = Number(document.getElementById('tilt-guests')?.value || 4);
      const resId = `TILT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newRes = {
        id: resId,
        name,
        phone,
        zone,
        date: today(),
        time,
        guests,
        status: 'confirmed'
      };

      let list = [];
      try { list = JSON.parse(localStorage.getItem('tilt_signal_reservations') || '[]'); } catch(e){}
      list.unshift(newRes);
      try { localStorage.setItem('tilt_signal_reservations', JSON.stringify(list)); } catch(e){}

      // Show Neon Ticket Pass
      modal('บัตรจองโต๊ะดิจิทัล (Tilt Signal Digital Ticket)', `
        <div class="tilt-booking-ticket">
          <div style="font-size:11px;letter-spacing:2px;color:#00F0FF;text-transform:uppercase;margin-bottom:6px">
            TILT SIGNAL · VENUE & ARCADE BAR
          </div>
          <h2 style="margin:0 0 4px;font-size:24px;color:#fff">${esc(zone)}</h2>
          <div style="font-size:13px;color:#A0AEC0;margin-bottom:14px">รอบเวลา ${esc(time)} · ${guests} ท่าน</div>

          <div style="background:#fff;padding:12px;border-radius:8px;display:inline-block;margin-bottom:12px">
            <svg width="120" height="120" viewBox="0 0 100 100" fill="#000">
              <rect x="0" y="0" width="30" height="30"/>
              <rect x="70" y="0" width="30" height="30"/>
              <rect x="0" y="70" width="30" height="30"/>
              <rect x="35" y="10" width="10" height="10"/>
              <rect x="15" y="35" width="20" height="20"/>
              <rect x="45" y="45" width="20" height="20"/>
              <rect x="70" y="35" width="15" height="15"/>
              <rect x="35" y="75" width="15" height="15"/>
              <rect x="75" y="75" width="15" height="15"/>
            </svg>
          </div>

          <div style="font-family:monospace;font-size:16px;font-weight:bold;color:#00F0FF;letter-spacing:2px;margin-bottom:10px">
            ${resId}
          </div>

          <div style="font-size:12.5px;color:#E2E8F0;border-top:1px dashed #2D3748;padding-top:10px;text-align:left;line-height:1.6">
            <div><strong>ผู้จอง:</strong> ${esc(name)} (${esc(phone)})</div>
            <div><strong>สถานะ:</strong> <span style="color:#00F0FF">✅ ยืนยันการจองแล้ว</span></div>
            <div><strong>โต๊ะ:</strong> Reserved at Host Station</div>
          </div>
          <p style="margin:12px 0 0;font-size:11px;color:#718096">กรุณาแสดง QR Code นี้ให้พนักงานหน้าร้านเมื่อมาถึง</p>
        </div>
      `, `<div class="form-actions"><button class="btn primary" onclick="window.print()">🖨️ พิมพ์บัตรจอง Pass</button></div>`);

      if (typeof onSuccess === 'function') onSuccess();
    });
  }

  function renderExternal(kind) {
    if (kind === 'ecommerce') {
      const source = 'https://ecommerce-codex-demo.vercel.app/';
      app.innerHTML = `
        <div class="storefront-native-bar">
          <div style="display:flex;align-items:center;gap:10px">
            <span class="badge primary" style="font-size:11px">LIVE STOREFRONT DEMO</span>
            <span style="font-size:13.5px;font-weight:700">OAI Apparel · Next.js Modern Storefront</span>
          </div>
          <button class="btn small primary" id="btn-trigger-checkout" type="button">🛒 ตะกร้าสินค้า & สั่งซื้อ (Simulated Checkout) →</button>
        </div>
        <iframe class="external-frame" src="${source}" title="OAI Apparel Storefront" style="height:calc(100vh - 105px)"></iframe>
      `;

      app.querySelector('#btn-trigger-checkout')?.addEventListener('click', () => {
        openStorefrontCheckoutModal();
      });
      return;
    }

    if (kind === 'tilt') {
      const source = 'https://openai-landing-page-examples.vercel.app/tilt-signal-arcade-bar';
      let tiltActiveTab = 'storefront';

      function renderTiltSuite() {
        const defaultReservations = [
          { id: 'TILT-2026-8812', name: 'คุณปรียา สุทธิสาร', phone: '081-234-5678', zone: 'Neon Booth', date: today(), time: '19:30 น.', guests: 4, status: 'confirmed' },
          { id: 'TILT-2026-8813', name: 'คุณธนภัทร วงศ์สว่าง', phone: '089-876-5432', zone: 'VIP Lounge', date: today(), time: '21:00 น.', guests: 8, status: 'seated' },
          { id: 'TILT-2026-8814', name: 'คุณณัฐพงศ์ สุขใจ', phone: '082-345-6789', zone: 'Arcade Zone', date: today(), time: '20:00 น.', guests: 2, status: 'confirmed' }
        ];

        let reservations = [];
        try {
          reservations = JSON.parse(localStorage.getItem('tilt_signal_reservations') || 'null');
        } catch(e) {}
        if (!Array.isArray(reservations) || !reservations.length) {
          reservations = defaultReservations;
          try { localStorage.setItem('tilt_signal_reservations', JSON.stringify(reservations)); } catch(e){}
        }

        if (tiltActiveTab === 'storefront') {
          app.innerHTML = `
            <div class="tilt-switch-bar">
              <div class="tilt-switch-tabs">
                <button class="tilt-tab-btn active" type="button" data-tilt-tab="storefront">🌐 มุมมองหน้าเว็บลูกค้า (Customer Storefront)</button>
                <button class="tilt-tab-btn" type="button" data-tilt-tab="admin">📋 มุมมองหลังบ้านจัดการคิวจอง (Admin Reservation Desk) [${reservations.length}]</button>
              </div>
              <button class="btn small primary" id="btn-tilt-open-book" type="button" style="background:#00F0FF;color:#000;font-weight:800;border:none">📅 จองโต๊ะ / จองคิวออนไลน์ (Reserve Table)</button>
            </div>
            <iframe class="external-frame" src="${source}" title="Tilt Signal Arcade Bar" style="height:calc(100vh - 105px)"></iframe>
          `;
        } else {
          app.innerHTML = `
            <div class="tilt-switch-bar">
              <div class="tilt-switch-tabs">
                <button class="tilt-tab-btn" type="button" data-tilt-tab="storefront">🌐 มุมมองหน้าเว็บลูกค้า (Customer Storefront)</button>
                <button class="tilt-tab-btn active" type="button" data-tilt-tab="admin">📋 มุมมองหลังบ้านจัดการคิวจอง (Admin Reservation Desk) [${reservations.length}]</button>
              </div>
              <div style="display:flex;gap:8px">
                <button class="btn small" id="btn-tilt-add-sample" type="button">+ เพิ่มการจองตัวอย่าง</button>
                <button class="btn small danger" id="btn-tilt-reset" type="button">รีเซ็ตข้อมูลคิว</button>
              </div>
            </div>
            <div class="page-pad">
              <div class="grid cols-4" style="margin-bottom:16px">
                <article class="card stat-card"><small>รายการจองทั้งหมด</small><strong>${reservations.length} รายการ</strong><small>วันนี้และล่วงหน้า</small></article>
                <article class="card stat-card"><small>ยืนยันแล้ว (Confirmed)</small><strong style="color:var(--green)">${reservations.filter(x => x.status === 'confirmed').length} โต๊ะ</strong><small>รอเข้าใช้บริการ</small></article>
                <article class="card stat-card"><small>ลูกค้าเข้าโต๊ะแล้ว (Seated)</small><strong style="color:var(--primary)">${reservations.filter(x => x.status === 'seated').length} โต๊ะ</strong><small>กำลังให้บริการ</small></article>
                <article class="card stat-card"><small>ยกเลิก (Cancelled)</small><strong style="color:var(--coral)">${reservations.filter(x => x.status === 'cancelled').length} โต๊ะ</strong><small>สละสิทธิ์</small></article>
              </div>

              <section class="card">
                <div class="card-head">
                  <div>
                    <p class="eyebrow" style="color:#00F0FF">Tilt Signal Back-Office</p>
                    <h2>ตารางจัดการคิวและโต๊ะจอง (Venue Reservation Queue)</h2>
                  </div>
                </div>

                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>รหัสการจอง</th>
                        <th>ลูกค้า & เบอร์ติดต่อ</th>
                        <th>โซนที่นั่ง</th>
                        <th>รอบเวลา</th>
                        <th>จำนวน</th>
                        <th>สถานะ</th>
                        <th>จัดการสถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${reservations.map(r => `
                        <tr>
                          <td><code>${esc(r.id)}</code></td>
                          <td><strong>${esc(r.name)}</strong><br><small class="muted">${esc(r.phone)}</small></td>
                          <td><span class="chip" style="font-weight:700">${esc(r.zone)}</span></td>
                          <td><strong>${esc(r.time)}</strong><br><small class="muted">${esc(r.date)}</small></td>
                          <td><strong>${r.guests} ท่าน</strong></td>
                          <td>
                            ${r.status === 'confirmed' ? '<span class="badge success">✅ ยืนยันแล้ว</span>' : r.status === 'seated' ? '<span class="badge primary">🍸 เข้าโต๊ะแล้ว</span>' : '<span class="badge danger">✕ ยกเลิก</span>'}
                          </td>
                          <td>
                            <div style="display:flex;gap:4px">
                              <button class="btn small" data-tilt-status="${r.id}" data-val="confirmed" title="ยืนยัน">ยืนยัน</button>
                              <button class="btn small primary" data-tilt-status="${r.id}" data-val="seated" title="เข้าโต๊ะ">เข้าโต๊ะ</button>
                              <button class="btn small danger" data-tilt-status="${r.id}" data-val="cancelled" title="ยกเลิก">✕</button>
                            </div>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          `;
        }

        app.querySelectorAll('[data-tilt-tab]').forEach(btn => {
          btn.addEventListener('click', () => {
            tiltActiveTab = btn.dataset.tiltTab;
            renderTiltSuite();
          });
        });

        app.querySelector('#btn-tilt-open-book')?.addEventListener('click', () => {
          openTiltBookingModal(() => {
            renderTiltSuite();
          });
        });

        app.querySelectorAll('[data-tilt-status]').forEach(btn => {
          btn.addEventListener('click', () => {
            const targetId = btn.dataset.tiltStatus;
            const newVal = btn.dataset.val;
            const r = reservations.find(x => x.id === targetId);
            if (r) {
              r.status = newVal;
              try { localStorage.setItem('tilt_signal_reservations', JSON.stringify(reservations)); } catch(e){}
              renderTiltSuite();
              toast('อัปเดตสถานะการจองเรียบร้อย');
            }
          });
        });

        app.querySelector('#btn-tilt-add-sample')?.addEventListener('click', () => {
          const sample = {
            id: `TILT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            name: 'คุณสมชาย สายปาร์ตี้',
            phone: '085-111-2233',
            zone: 'Neon Booth',
            date: today(),
            time: '20:30 น.',
            guests: 4,
            status: 'confirmed'
          };
          reservations.unshift(sample);
          try { localStorage.setItem('tilt_signal_reservations', JSON.stringify(reservations)); } catch(e){}
          renderTiltSuite();
          toast('เพิ่มตัวอย่างการจองเรียบร้อย');
        });

        app.querySelector('#btn-tilt-reset')?.addEventListener('click', () => {
          if (confirm('คืนค่ารายการจองเริ่มต้นทั้งหมด?')) {
            try { localStorage.setItem('tilt_signal_reservations', JSON.stringify(defaultReservations)); } catch(e){}
            renderTiltSuite();
            toast('คืนค่าข้อมูลเริ่มต้นเรียบร้อย');
          }
        });
      }

      renderTiltSuite();
      return;
    }

    const source = kind === 'medical'
      ? 'https://medical-flow-lovat.vercel.app/'
      : 'https://openai-landing-page-examples.vercel.app/tilt-signal-arcade-bar';
    const frameTitle = kind === 'medical' ? 'Medical Flow Clinic' : 'External Showcase';
    app.innerHTML = `<iframe class="external-frame" src="${source}" title="${frameTitle}"></iframe>`;
  }

  // Priority 2.1: Floating Conversion Bar (<DemoConversionBar />)
  function renderConversionBar(currentPath) {
    const existing = document.querySelector('.demo-conversion-bar');
    if (existing) existing.remove();

    const configs = {
      '/warehouse-management': {
        interest: 'wms',
        title: 'สนใจระบบคลังสินค้าแบบ NexusWMS?',
        sub: 'ปรับแต่งให้เข้ากับคลังและบาร์โค้ดธุรกิจคุณ พร้อมใช้งานใน 3–4 สัปดาห์'
      },
      '/business-suite': {
        interest: 'crm',
        title: 'ต้องการระบบ CRM & เซ็นสัญญาออนไลน์?',
        sub: 'เชื่อมต่อทีมขาย ใบเสนอราคา และลายเซ็นดิจิทัลครบวงจรในที่เดียว'
      },
      '/e-signature': {
        interest: 'crm',
        title: 'ต้องการระบบ CRM & เซ็นสัญญาออนไลน์?',
        sub: 'เชื่อมต่อทีมขาย ใบเสนอราคา และลายเซ็นดิจิทัลครบวงจรในที่เดียว'
      },
      '/pos-system-smart': {
        interest: 'pos',
        title: 'สนใจระบบหน้าร้าน POS & จอครัว KDS?',
        sub: 'รองรับทั้งร้านอาหาร คาเฟ่ และหลายสาขา ปรับแก้ตามเมนูร้านได้ 100%'
      },
      '/usa-thai-shipping': {
        interest: 'shipping',
        title: 'ทำธุรกิจขนส่งหรือนำเข้าสินค้าใช่ไหม?',
        sub: 'สร้างระบบเช็กสถานะพัสดุและคำนวณค่านำเข้า ลดงานแอดมินตอบแชต'
      },
      '/usa-thai-shipping/admin': {
        interest: 'shipping',
        title: 'ทำธุรกิจขนส่งหรือนำเข้าสินค้าใช่ไหม?',
        sub: 'สร้างระบบเช็กสถานะพัสดุและคำนวณค่านำเข้า ลดงานแอดมินตอบแชต'
      },
      '/usa-thai-shipping/customer': {
        interest: 'shipping',
        title: 'ทำธุรกิจขนส่งหรือนำเข้าสินค้าใช่ไหม?',
        sub: 'สร้างระบบเช็กสถานะพัสดุและคำนวณค่านำเข้า ลดงานแอดมินตอบแชต'
      },
      '/ecommerce-storefront': {
        interest: 'storefront',
        title: 'อยากมีเว็บขายของออนไลน์แบรนด์ตัวเอง?',
        sub: 'เว็บโหลดไว รองรับตะกร้าสินค้า ชำระเงินอัตโนมัติ และจัดการสต็อกหลังบ้าน'
      },
      '/tilt-signal-arcade-bar': {
        interest: 'storefront',
        title: 'ต้องการเว็บหน้าร้านพร้อมระบบจองคิว/จองโต๊ะ?',
        sub: 'ดีไซน์โดดเด่นตามเอกลักษณ์แบรนด์ พร้อมระบบรับจองและจัดการคิวหลังบ้าน'
      }
    };

    const c = configs[currentPath] || configs['/warehouse-management'];
    const bar = document.createElement('aside');
    bar.className = 'demo-conversion-bar';
    bar.setAttribute('aria-label', 'แถบติดต่อและขอใบเสนอราคา');
    bar.innerHTML = `
      <div class="conversion-bar-header">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:16px">💼</span>
          <h4 class="conversion-bar-title">${c.title}</h4>
        </div>
        <button class="conversion-bar-toggle" type="button" title="ย่อ/ขยายแถบ" aria-label="ย่อแถบ">_</button>
      </div>
      <div class="conversion-bar-body">
        <p class="conversion-bar-subtext">${c.sub}</p>
      </div>
      <div class="conversion-bar-actions">
        <a class="btn primary small" href="/#estimator-form?interest=${c.interest}">ขอใบเสนอราคาระบบนี้</a>
        <a class="btn outline small" href="https://line.me/R/ti/p/@486fpcll" target="_blank" rel="noreferrer" style="border-color:#06C755;color:#06C755">ทัก LINE ปรึกษาด่วน ↗</a>
      </div>
    `;

    document.body.appendChild(bar);

    const toggleBtn = bar.querySelector('.conversion-bar-toggle');
    toggleBtn.addEventListener('click', () => {
      bar.classList.toggle('minimized');
      toggleBtn.textContent = bar.classList.contains('minimized') ? '◻' : '_';
      toggleBtn.setAttribute('aria-label', bar.classList.contains('minimized') ? 'ขยายแถบ' : 'ย่อแถบ');
    });
  }

  // Priority 1.4: Loading Skeleton helper
  function showLoadingSkeleton(callback) {
    let skeleton = document.getElementById('demo-loading-skeleton');
    if (!skeleton) {
      skeleton = document.createElement('div');
      skeleton.id = 'demo-loading-skeleton';
      skeleton.className = 'demo-loading-skeleton';
      skeleton.innerHTML = `
        <div class="demo-skeleton-spinner"></div>
        <div class="demo-skeleton-text">กำลังโหลดสภาพแวดล้อมระบบจำลอง...</div>
        <div class="demo-skeleton-shimmer">
          <div class="demo-skeleton-bar" style="width:100%"></div>
          <div class="demo-skeleton-bar" style="width:75%"></div>
          <div class="demo-skeleton-bar" style="width:90%"></div>
        </div>
      `;
      document.body.appendChild(skeleton);
    }
    skeleton.classList.remove('hidden');
    setTimeout(() => {
      callback();
      setTimeout(() => {
        skeleton.classList.add('hidden');
      }, 100);
    }, 150);
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
    'external-medical': () => renderExternal('medical'),
  };

  if (app && handlers[page]) {
    handlers[page]();
    if (page !== 'portal') {
      renderConversionBar(pathname);
    } else {
      // Check for ?interest= query param on home
      const qParams = new URLSearchParams(window.location.search);
      const interestParam = qParams.get('interest');
      if (interestParam) {
        setTimeout(() => {
          const formEl = document.getElementById('estimator-form');
          if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
          const chk = document.querySelector(`input[name="est-systems"][value="${interestParam}"]`);
          if (chk) {
            chk.checked = true;
            chk.dispatchEvent(new Event('change'));
          }
        }, 300);
      }
    }
  }
})();
