(() => {
  'use strict';
  const origin = location.origin;
  const demos = new Set(['/warehouse-management', '/business-suite', '/pos-system-smart', '/e-signature', '/usa-thai-shipping', '/usa-thai-shipping/admin', '/usa-thai-shipping/customer', '/ecommerce-storefront', '/tilt-signal-arcade-bar', '/medical-flow', '/course', '/project-management', '/dashboard-mini', '/pos-system']);
  const path = url => url.pathname.replace(/\/+$/, '') || '/';
  const eligible = event => event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
  const namespace = 'buzlikeNavigation';
  const cacheKey = 'buzlike_home_return_v2', pendingKey = 'buzlike_pending_home_return_v2';
  const read = key => { try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return null; } };
  const write = (key, value) => { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* History state still works when storage is unavailable. */ } };
  const homePoint = value => {
    if (!value || !Number.isFinite(value.x) || !Number.isFinite(value.y) || value.x < 0 || value.y < 0 || typeof value.url !== 'string') return null;
    try { const url = new URL(value.url, origin); if (url.origin !== origin || path(url) !== '/') return null; } catch { return null; }
    if (value.stamp && Date.now() - value.stamp > 86400000) return null;
    return value;
  };
  const landing = !!document.querySelector('.site-header') && !!document.getElementById('systems');

  // Demo scripts keep their own document and lifecycle. Only the owning
  // homepage may receive navigation requests from its same-origin frame.
  if (!landing) {
    const hosted = () => {
      try { return parent !== window && parent.location.origin === origin && parent.BuzlikeNavigation?.owns(window); }
      catch { return false; }
    };
    window.BuzlikeNavigation = {
      navigate(target) {
        const url = new URL(target, location.href);
        if (url.origin !== origin || !(path(url) === '/' || demos.has(path(url)))) return false;
        if (!hosted()) {
          if (path(url) === '/' && !url.search && (!url.hash || url.hash === '#top')) {
            const additional = ['/business-suite','/e-signature','/usa-thai-shipping','/usa-thai-shipping/admin','/usa-thai-shipping/customer','/ecommerce-storefront','/tilt-signal-arcade-bar'].includes(path(new URL(location.href)));
            const home = homePoint(history.state?.[namespace]?.home) || homePoint(read(cacheKey)) || {url:'/', x:0, y:0, stamp:Date.now(), focusMore:additional};
            if (!Array.isArray(home.details) && additional) home.moreOpen = true;
            write(pendingKey, home);
            if (document.referrer && history.length > 1) {
              const previous = new URL(document.referrer);
              if (previous.origin === origin && path(previous) === '/') { history.back(); return true; }
            }
            location.assign(home.url);
            return true;
          }
          return false;
        }
        parent.postMessage({type:'buzlike:navigate', url:url.href}, origin);
        return true;
      }
    };
    if (hosted()) parent.postMessage({type:'buzlike:ready', url:location.href, title:document.title}, origin);
    else {
      const initial = location.pathname + location.search;
      addEventListener('popstate', () => {
        if (location.pathname + location.search === initial) return;
        if (path(new URL(location.href)) === '/') {
          const home = homePoint(history.state?.[namespace]?.home) || homePoint(read(cacheKey));
          if (home) write(pendingKey, home);
        }
        // Refreshing a same-document demo entry can leave its PHP document
        // attached to the older home URL on Back. Fetch the actual home only
        // when its original document has already been replaced.
        location.reload();
      });
    }
    return;
  }

  let view = null, frame = null, point = null, opener = null, background = [], overflow = '', timer = null;
  const homeTitle = document.title;
  const saved = () => ({url:location.pathname + location.search + location.hash, x:scrollX, y:scrollY, stamp:Date.now(), details:[...document.querySelectorAll('main details')].map(el => el.open), moreOpen:document.querySelector('.other-works')?.open || false});
  const state = (kind, home, url) => ({...(history.state || {}), [namespace]:{kind, home, url}});
  const moveTo = position => scrollTo({left:position.x, top:position.y, behavior:'instant'});
  let restoring = false, restoreId = 0;
  const defaultScrollRestoration = history.scrollRestoration;
  const restore = position => {
    if (!homePoint(position)) return;
    const id = ++restoreId;
    restoring = true;
    history.scrollRestoration = 'manual';
    for (const [index, element] of [...document.querySelectorAll('main details')].entries()) if (typeof position.details?.[index] === 'boolean') element.open = position.details[index];
    const more = document.querySelector('.other-works');
    if (more && typeof position.moreOpen === 'boolean') more.open = position.moreOpen;
    const move = () => {
      if (position.focusMore) document.querySelector('.other-works')?.scrollIntoView({behavior:'instant', block:'start'});
      else moveTo(position);
    };
    move();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (id !== restoreId) return;
      move(); restoring = false; history.scrollRestoration = defaultScrollRestoration;
      write(cacheKey, saved());
    }));
  };
  const isOwnFrame = source => !!frame && frame.contentWindow === source;
  window.BuzlikeNavigation = {owns:isOwnFrame};

  function close(home, intent = null) {
    if (!view) return;
    clearTimeout(timer);
    frame.remove(); frame = null;
    view.remove(); view = null;
    for (const item of background) item.element.inert = item.inert;
    background = [];
    document.body.style.overflow = overflow;
    document.title = homeTitle;
    if (intent) {
      dispatchEvent(new CustomEvent('buzlike:home-intent', {detail:{url:intent.href}}));
      const target = document.getElementById(intent.hash.slice(1));
      target?.scrollIntoView({behavior:'instant'});
      const heading = target?.querySelector('h2') || target;
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({preventScroll:true});
    } else {
      if (opener?.isConnected) opener.focus({preventScroll:true});
      restore(home);
    }
    dispatchEvent(new Event('scroll'));
  }

  function returnHome(url) {
    const plain = !url.search && (!url.hash || url.hash === '#top');
    const home = point || saved();
    const destination = plain ? home.url : url.pathname + url.search + url.hash;
    history.pushState(state('home', home, destination), '', destination);
    close(home, plain ? null : url);
    if (!plain) history.replaceState(state('home', saved(), destination), '', destination);
  }

  function loaded() {
    if (!view || !frame) return;
    try {
      // A hosting challenge/error must not appear to be a ready demo.
      if (!frame.contentDocument?.getElementById('app')) return;
      clearTimeout(timer);
      view.classList.add('is-ready');
      view.setAttribute('aria-busy', 'false');
      document.title = frame.contentDocument.title;
      frame.contentWindow.focus();
    } catch { /* Keep the explicit return/open-tab controls available. */ }
  }

  function open(url, home, trigger = null) {
    point = home;
    if (trigger) opener = trigger;
    if (!view) {
      overflow = document.body.style.overflow;
      background = [...document.body.children].filter(el => el instanceof HTMLElement).map(element => ({element, inert:element.inert}));
      for (const item of background) item.element.inert = true;
      document.body.style.overflow = 'hidden';
      view = document.createElement('section');
      view.className = 'demo-view';
      view.setAttribute('role', 'dialog');
      view.setAttribute('aria-modal', 'true');
      view.setAttribute('aria-label', 'ตัวอย่างระบบ');
      view.setAttribute('aria-busy', 'true');
      view.innerHTML = '<div class="demo-view-loading"><button type="button" class="demo-view-back">← กลับหน้าแรก</button><div role="status"><p>กำลังเปิดตัวอย่างระบบ…</p><a target="_blank" rel="noopener noreferrer">เปิดเดโมในแท็บใหม่ ↗</a></div></div>';
      frame = document.createElement('iframe');
      frame.className = 'demo-view-frame';
      frame.title = 'ตัวอย่างระบบ BUZLIKE SYSTEMS';
      frame.addEventListener('load', loaded);
      frame.src = url.href;
      view.append(frame);
      document.body.append(view);
      view.querySelector('button').addEventListener('click', () => returnHome(new URL('/', origin)));
      view.querySelector('button').focus({preventScroll:true});
    } else {
      view.classList.remove('is-ready');
      view.setAttribute('aria-busy', 'true');
      frame.contentWindow.location.replace(url.href);
    }
    view.querySelector('.demo-view-loading a').href = url.href;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (view && !view.classList.contains('is-ready')) view.querySelector('[role=status] p').textContent = 'เดโมใช้เวลาโหลดนาน คุณกลับหน้าแรกหรือเปิดในแท็บใหม่ได้';
    }, 12000);
  }

  function navigate(url, trigger = null) {
    if (url.origin !== origin) return false;
    if (path(url) === '/' && view) { returnHome(url); return true; }
    if (!demos.has(path(url))) return false;
    if (!view) {
      point = saved();
      write(cacheKey, point);
      history.replaceState(state('home', point, point.url), '', location.href);
    }
    history.pushState(state('demo', point, url.href), '', url.href);
    open(url, point, trigger);
    return true;
  }

  document.addEventListener('click', event => {
    if (!eligible(event) || event.defaultPrevented) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || link.target && link.target !== '_self') return;
    const url = new URL(link.href, location.href);
    if (navigate(url, link)) event.preventDefault();
  });

  addEventListener('message', event => {
    if (event.origin !== origin || !isOwnFrame(event.source) || !event.data || typeof event.data.url !== 'string') return;
    let url;
    try { url = new URL(event.data.url); } catch { return; }
    if (url.origin !== origin) return;
    if (event.data.type === 'buzlike:navigate') navigate(url);
    else if (event.data.type === 'buzlike:ready' && demos.has(path(url))) {
      if (typeof event.data.title === 'string') document.title = event.data.title;
    }
  });

  addEventListener('popstate', event => {
    const entry = event.state?.[namespace];
    const url = new URL(location.href);
    if (demos.has(path(url)) && entry?.kind === 'demo') open(url, entry.home);
    else if (path(url) === '/' && view) close(entry?.home || point);
  });

  // Preserve the expanded list and coordinates even if the browser replaces
  // the top document (refresh, cache miss, or a standalone demo visit).
  const remember = () => { if (!view && !restoring && location.pathname === '/') write(cacheKey, saved()); };
  let rememberTimer;
  addEventListener('scroll', () => { clearTimeout(rememberTimer); rememberTimer = setTimeout(remember, 120); }, {passive:true});
  document.addEventListener('toggle', remember, true);
  addEventListener('pagehide', () => {
    if (!view && !restoring && location.pathname === '/') {
      const home = saved(); write(cacheKey, home);
      history.replaceState(state('home', home, home.url), '', location.href);
    }
  });
  addEventListener('pageshow', event => {
    if (!event.persisted || view) return;
    const home = homePoint(read(pendingKey));
    try { sessionStorage.removeItem(pendingKey); } catch { /* Storage may be unavailable. */ }
    if (home) restore(home);
  });
  const pending = homePoint(read(pendingKey));
  try { sessionStorage.removeItem(pendingKey); } catch { /* Storage may be unavailable. */ }
  const entry = homePoint(history.state?.[namespace]?.home), cached = homePoint(read(cacheKey));
  const navigationType = performance.getEntriesByType('navigation')[0]?.type;
  const returning = pending || (navigationType === 'back_forward' || navigationType === 'reload') && (cached || entry);
  if (returning) {
    const matching = cached?.url === location.pathname + location.search + location.hash ? cached : null;
    const home = pending || (navigationType === 'back_forward' ? entry || matching : matching || entry);
    if (home) {
      // Compatibility with coordinates recorded by the previous release.
      if (!Array.isArray(home.details) && home.moreOpen === undefined) home.moreOpen = true;
      let cancelled = false;
      for (const type of ['wheel','touchstart','pointerdown','keydown']) addEventListener(type, () => {
        cancelled = true;
        if (restoring) { restoreId++; restoring = false; history.scrollRestoration = defaultScrollRestoration; }
      }, {once:true, passive:true});
      const settle = () => { if (!cancelled && !view) requestAnimationFrame(() => { if (!cancelled && !view) restore(home); }); };
      restore(home);
      addEventListener('pageshow', settle, {once:true});
      document.fonts.ready.then(settle);
    }
  }

  document.addEventListener('keydown', event => {
    if (!view || event.key !== 'Tab' || view.classList.contains('is-ready')) return;
    const controls = [...view.querySelectorAll('button,a[href]')];
    const index = controls.indexOf(document.activeElement);
    event.preventDefault();
    controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
  });
})();
