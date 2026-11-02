(() => {
  'use strict';
  const status=document.getElementById('demo-loading');if(!status)return;
  const message=status.querySelector('[data-load-message]'),app=document.getElementById('app');
  let complete=false,timer;
  app?.setAttribute('aria-busy','true');
  function fail(text='โหลดเดโมไม่สำเร็จ ลองโหลดใหม่อีกครั้ง',terminal=true){
    complete=terminal;clearTimeout(timer);status.hidden=false;status.classList.add('load-warning');status.querySelector('[data-load-retry]').hidden=false;message.textContent=text;app?.removeAttribute('aria-busy');
  }
  function done(){if(complete)return;complete=true;clearTimeout(timer);observer.disconnect();status.hidden=true;app?.removeAttribute('aria-busy');}
  const frames=new WeakMap();
  function watch(frame){if(frames.has(frame))return;const state={loaded:false};frames.set(frame,state);frame.addEventListener('load',()=>{state.loaded=true;if(window.DemoLoad.initialized)done();},{once:true});frame.addEventListener('error',()=>fail('โหลดหน้าเว็บตัวอย่างไม่ได้ ลองโหลดใหม่อีกครั้ง'),{once:true});}
  const observer=new MutationObserver(()=>app?.querySelectorAll('iframe').forEach(watch));if(app)observer.observe(app,{childList:true,subtree:true});
  timer=setTimeout(()=>fail('เดโมใช้เวลาโหลดนานกว่าปกติ คุณรอต่อหรือกดโหลดใหม่ได้',false),12000);
  window.DemoLoad={initialized:false,fail,ready(){this.initialized=true;app?.querySelectorAll('iframe').forEach(watch);const frame=app?.querySelector('iframe');if(!frame||frames.get(frame)?.loaded)requestAnimationFrame(done);}};
  addEventListener('error',event=>{if(!complete&&(event instanceof ErrorEvent||event.target?.tagName==='SCRIPT'))fail();},true);
})();
