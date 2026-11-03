(() => {
  'use strict';
  const bar=document.querySelector('.mobile-contact-bar');if(!bar)return;
  const mobile=matchMedia('(max-width:900px)'),menu=document.querySelector('.menu-button');
  const regions=[document.getElementById('estimator-form'),document.getElementById('contact')];
  const actions=[...document.querySelectorAll('main a,main button,main input,main select,main textarea')];
  let scheduled=false;
  function update(){
    scheduled=false;
    const height=window.visualViewport?.height||innerHeight;
    const editing=!!document.activeElement?.closest('input,textarea,select,[contenteditable=true]');
    const inRegion=regions.some(element=>{const r=element.getBoundingClientRect();return r.top<height-20&&r.bottom>20;});
    const overAction=actions.some(element=>{const r=element.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<height-10&&r.bottom>height-88;});
    bar.hidden=!mobile.matches||editing||inRegion||menu.getAttribute('aria-expanded')==='true'||overAction;
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
  document.addEventListener('focusin',schedule);document.addEventListener('focusout',schedule);
  mobile.addEventListener('change',schedule);window.visualViewport?.addEventListener('resize',schedule);
  new MutationObserver(schedule).observe(menu,{attributes:true,attributeFilter:['aria-expanded']});
  document.fonts.ready.then(schedule);update();
})();
