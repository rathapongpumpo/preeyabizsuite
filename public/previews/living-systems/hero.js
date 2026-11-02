(() => {
  'use strict';
  if (location.pathname === '/index.html') {
    location.replace('/' + location.search + location.hash);
    return;
  }
  // Old bookmarks keep working without introducing another homepage.
  const sectionAliases = { projects:'systems', featured:'systems', process:'how-it-works', 'about-architect':'contact', about:'contact', guarantees:'how-it-works' };
  function resolveOldSection() {
    const previous = location.hash.slice(1).split('?')[0];
    if (!sectionAliases[previous]) return;
    const id = sectionAliases[previous];
    history.replaceState(null, '', location.pathname + location.search + '#' + id);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }
  resolveOldSection();
  addEventListener('hashchange', resolveOldSection);
  const get = id => document.getElementById(id);
  const canvas = document.querySelector('.system-canvas');
  const send = get('send-order'), plus = get('plus'), minus = get('minus');
  let quantity = 1, running = false, completed = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const format = n => n.toLocaleString('en-US');
  const svg = document.querySelector('.flow-routes');
  const panelNames = ['pos', 'kitchen', 'inventory', 'report'];
  const panels = panelNames.map(name => document.querySelector(`.${name}-panel`));
  const lines = get('route-lines');
  const packet = get('flow-packet'), halo = get('flow-halo');
  const autoButton = get('toggle-flow');
  const routes = panels.slice(0,3).map((_,i) => {
    const base = document.createElementNS('http://www.w3.org/2000/svg','path');
    const guide = base.cloneNode();
    const active = base.cloneNode();
    const tip = base.cloneNode();
    guide.setAttribute('class','route-guide');
    base.setAttribute('class','route-base'); active.setAttribute('class','route-active');
    tip.setAttribute('class','route-tip');
    base.dataset.route = active.dataset.route = i;
    lines.append(guide,base,active,tip);
    return {guide,base,active,tip};
  });
  let autoEnabled = !reduced.matches, inView = false, autoTimer, cancelFrame = null;
  function drawRoutes() {
    const c = canvas.getBoundingClientRect();
    svg.setAttribute('viewBox',`0 0 ${c.width} ${c.height}`);
    const boxes = panels.map(p => { const r=p.getBoundingClientRect();return {x:r.left-c.left,y:r.top-c.top,w:r.width,h:r.height}; });
    const [pos,kitchen,stock,report] = boxes;
    // Dedicated lanes: rounded rightward handoff, vertical handoff,
    // then a straight leftward handoff. No tiny zigzags or scaled markers.
    function elbow(a,b) {
      const mid=(a.x+b.x)/2, sx=Math.sign(b.x-a.x), sy=Math.sign(b.y-a.y);
      const r=Math.min(12,Math.abs(b.x-a.x)/4,Math.abs(b.y-a.y)/2);
      if(Math.abs(b.y-a.y)<2)return `M ${a.x} ${a.y} H ${b.x}`;
      return `M ${a.x} ${a.y} H ${mid-sx*r} Q ${mid} ${a.y} ${mid} ${a.y+sy*r} V ${b.y-sy*r} Q ${mid} ${b.y} ${mid+sx*r} ${b.y} H ${b.x}`;
    }
    const a={x:pos.x+pos.w+2,y:pos.y+pos.h*.52};
    const b={x:kitchen.x-5,y:kitchen.y+kitchen.h*.54};
    const top={x:kitchen.x+kitchen.w*.5,y:kitchen.y+kitchen.h+2};
    const bottom={x:stock.x+stock.w*.5,y:stock.y-5};
    const sharedY=Math.max(stock.y,report.y)+Math.min(stock.h,report.h)*.55;
    const left={x:report.x+report.w+5,y:sharedY};
    const paths=[elbow(a,b),`M ${top.x} ${top.y} V ${bottom.y}`,`M ${stock.x-2} ${sharedY} H ${left.x}`];
    const tips=[`M ${b.x-7} ${b.y-5} L ${b.x} ${b.y} L ${b.x-7} ${b.y+5}`,
      `M ${bottom.x-5} ${bottom.y-7} L ${bottom.x} ${bottom.y} L ${bottom.x+5} ${bottom.y-7}`,
      `M ${left.x+7} ${left.y-5} L ${left.x} ${left.y} L ${left.x+7} ${left.y+5}`];
    paths.forEach((d,i)=>{for(const path of [routes[i].guide,routes[i].base,routes[i].active])path.setAttribute('d',d);routes[i].tip.setAttribute('d',tips[i]);});
  }
  new ResizeObserver(drawRoutes).observe(canvas);
  panels.forEach(panel => new ResizeObserver(drawRoutes).observe(panel));
  document.fonts.ready.then(drawRoutes);
  function controls() {
    send.disabled = running; plus.disabled=running||quantity===9;minus.disabled=running||quantity===1;
    send.textContent = running ? 'กำลังแสดงขั้นตอน…' : completed ? 'ทดลองอีกครั้ง' : 'ลองสั่งกาแฟ';
    autoButton.textContent = autoEnabled ? 'หยุดภาพเคลื่อนไหว' : 'เล่นภาพเคลื่อนไหว';
    autoButton.setAttribute('aria-pressed', String(autoEnabled));
  }
  function reset() {
    completed=false; canvas.dataset.stage='ready';
    get('stock').textContent='2,400 g'; get('sales').textContent='฿0';
    get('kitchen-status').textContent='รอรับออเดอร์';
    panels.forEach(p=>p.classList.remove('is-sending','is-receiving','is-complete'));
    routes.forEach(r=>{r.base.classList.remove('is-complete');r.active.classList.remove('is-active');});
    packet.style.opacity=halo.style.opacity='0';
  }
  function setQuantity(n) {
    if(running)return;
    quantity=Math.max(1,Math.min(9,n));get('quantity').value=quantity;get('kitchen-qty').textContent=`x${quantity}`;
    if(completed)reset(); controls();
  }
  plus.addEventListener('click',()=>setQuantity(quantity+1));
  minus.addEventListener('click',()=>setQuantity(quantity-1));
  function animate(duration,update) {
    return new Promise(resolve=>{
      let frame,started,finished=false;
      const finish=ok=>{if(finished)return;finished=true;cancelAnimationFrame(frame);cancelFrame=null;resolve(ok);};
      cancelFrame=()=>finish(false);
      const tick=now=>{if(started===undefined)started=now;const t=Math.min((now-started)/duration,1);update(t);if(t===1)finish(true);else frame=requestAnimationFrame(tick);};
      frame=requestAnimationFrame(tick);
    });
  }
  const messages=['หน้าร้าน → ครัว: ส่งรายการลาเต้เย็น','ครัว → สต็อก: ตัดเมล็ดกาแฟที่ใช้','สต็อก → ยอดขาย: บันทึกยอดขายอัตโนมัติ'];
  // Stack invisible status variants in one grid cell. The tallest variant
  // reserves space at each viewport without truncation or runtime resizing.
  const status = get('flow-status');
  const statusSlot = document.createElement('div');
  statusSlot.className = 'flow-status-slot';
  status.before(statusSlot);
  statusSlot.append(status);
  const statusSizer = document.createElement('div');
  statusSizer.className = 'flow-status-sizer';
  statusSizer.setAttribute('aria-hidden','true');
  [status.textContent, ...messages,
    'หน้าร้าน → ครัว → สต็อก → ยอดขาย · ครบทุกขั้นตอนแล้ว',
    'หยุดภาพเคลื่อนไหวแล้ว · กดเล่นเพื่อเริ่มใหม่'
  ].forEach(text => { const span=document.createElement('span');span.textContent=text;statusSizer.append(span); });
  statusSlot.append(statusSizer);
  function scheduleAuto(delay=2800) {
    clearTimeout(autoTimer);
    if(autoEnabled&&inView&&!document.hidden&&!running&&!reduced.matches)autoTimer=setTimeout(()=>runFlow(),delay);
  }
  function stop() {
    clearTimeout(autoTimer);
    if(cancelFrame)cancelFrame();
    packet.style.opacity=halo.style.opacity='0';
  }
  async function runFlow() {
    if(running)return;
    clearTimeout(autoTimer);reset();drawRoutes();running=true;controls();
    let finished=true;
    for(let i=0;i<3;i++) {
      canvas.dataset.stage=panelNames[i+1];
      panels.forEach(p=>p.classList.remove('is-sending','is-receiving'));
      panels[i].classList.add('is-sending');
      get('flow-status').textContent=messages[i];
      const route=routes[i];route.active.classList.add('is-active');
      const arrived=await animate(reduced.matches?60:1350,t=>{
        const len=route.active.getTotalLength();
        route.active.style.strokeDasharray=`${len} ${len}`;
        route.active.style.strokeDashoffset=String(len*(1-t));
        const point=route.active.getPointAtLength(len*t);
        for(const dot of [packet,halo]){dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y);dot.style.opacity=reduced.matches?'0':'1';}
      });
      if(!arrived){finished=false;break;}
      packet.style.opacity=halo.style.opacity='0';
      route.base.classList.add('is-complete');route.active.classList.remove('is-active');
      panels[i].classList.remove('is-sending');panels[i].classList.add('is-complete');
      panels[i+1].classList.add('is-receiving');
      if(i===0)get('kitchen-status').textContent='รับออเดอร์แล้ว';
      if(i===1)get('stock').textContent=`${format(2400-18*quantity)} g`;
      if(i===2)get('sales').textContent=`฿${85*quantity}`;
      if(!await animate(reduced.matches?30:350,()=>{})){finished=false;break;}
    }
    running=false;
    panels.forEach(p=>p.classList.remove('is-sending','is-receiving'));
    if(finished){
      completed=true;canvas.dataset.stage='done';panels[3].classList.add('is-complete');
      get('kitchen-status').textContent='พร้อมเสิร์ฟ';
      get('flow-status').textContent='หน้าร้าน → ครัว → สต็อก → ยอดขาย · ครบทุกขั้นตอนแล้ว';
    }else{canvas.dataset.stage='paused';routes.forEach(r=>r.active.classList.remove('is-active'));}
    controls();scheduleAuto();
  }
  send.addEventListener('click',()=>{autoEnabled=false;controls();runFlow();});
  autoButton.addEventListener('click',()=>{
    autoEnabled=!autoEnabled;
    if(autoEnabled){controls();runFlow();}else{stop();controls();get('flow-status').textContent='หยุดภาพเคลื่อนไหวแล้ว · กดเล่นเพื่อเริ่มใหม่';}
  });
  new IntersectionObserver(entries=>{
    inView=entries[0].isIntersecting;
    if(inView)scheduleAuto(650);else stop();
  },{threshold:.4}).observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else scheduleAuto(650);});
  reduced.addEventListener('change',()=>{if(reduced.matches){autoEnabled=false;stop();controls();}});
  controls();
  const toggle = document.querySelector('.menu-button');
  const menu = get('mobile-nav');
  function closeMenu() { menu.hidden = true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','เปิดเมนู'); }
  toggle.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    toggle.setAttribute('aria-expanded',String(!menu.hidden));
    toggle.setAttribute('aria-label',menu.hidden ? 'เปิดเมนู' : 'ปิดเมนู');
  });
  document.addEventListener('keydown',event => { if (event.key==='Escape'&&!menu.hidden) {closeMenu();toggle.focus();} });
  document.addEventListener('click',event => { if (!event.target.closest('.site-header') || event.target.closest('#mobile-nav a')) closeMenu(); });
  setQuantity(1);
})();
