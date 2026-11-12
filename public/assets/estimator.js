(() => {
  'use strict';
  const site=window.SITE_CONFIG;
  const form=document.getElementById('project-estimator-form');if(!form)return;
  const get=id=>document.getElementById(id),key='preeya_estimator_draft_v1';
  const {systems,models,budgets,rates}=window.ESTIMATE_CONFIG;
  const number=n=>n.toLocaleString('th-TH');
  const contacts=['est-contact-name','est-contact-tel','est-contact-email','est-contact-notes'];
  let ready=false,saveAvailable=true,step=1,furthest=1,sending=false,receipt=null,pendingRequestId=null;
  try{
    const draft=JSON.parse(localStorage.getItem(key)||'null');
    if(draft&&typeof draft==='object'){
      for(const input of form.querySelectorAll('[name="est-systems"]'))input.checked=Array.isArray(draft.systems)&&draft.systems.includes(input.value);
      if(Object.hasOwn(models,draft.model))form.querySelector(`[name="est-model"][value="${draft.model}"]`).checked=true;
      if(Object.hasOwn(budgets,draft.budget))get('est-budget').value=draft.budget;
      for(const id of contacts)if(typeof draft[id]==='string')get(id).value=draft[id].slice(0,id==='est-contact-notes'?6000:200);
      if(Number.isInteger(draft.step)&&draft.step>=1&&draft.step<=3)step=furthest=draft.step;
    }
  }catch{saveAvailable=false;}
  const url=new URL(location.href),hashParts=url.hash.slice(1).split('?'),legacyParams=new URLSearchParams(hashParts.slice(1).join('?'));
  const requested=url.searchParams.get('interest')||legacyParams.get('interest');
  const picked=(requested||'').split(',').filter(value=>Object.hasOwn(systems,value));
  const requestedModel=url.searchParams.get('model')||legacyParams.get('model');
  if(picked.length){for(const input of form.querySelectorAll('[name="est-systems"]'))input.checked=picked.includes(input.value);step=furthest=1;}
  if(Object.hasOwn(models,requestedModel))form.querySelector(`[name="est-model"][value="${requestedModel}"]`).checked=true;
  if(picked.length||hashParts.length>1){
    if(picked.length)url.searchParams.set('interest',picked.join(','));
    url.hash=picked.length&&['','contact','estimator-form'].includes(hashParts[0])?'estimator-form':hashParts[0];
    history.replaceState(null,'',url);
  }
  function selection(){return [...form.querySelectorAll('[name="est-systems"]:checked')].map(x=>x.value);}
  function quote(){
    const count=selection().length,model=form.querySelector('[name="est-model"]:checked').value,monthly=model==='retainer';
    if(!count)return {model,monthly,min:0,range:'เลือกระบบเพื่อดูงบ',price:'ยังไม่ได้เลือกระบบ',time:'ประมาณการตามงานที่เลือก'};
    const tier=rates[model].find(x=>count<=x.count),range=`${number(tier.min)} – ${number(tier.max)}${tier.plus?'+':''}`;
    return {...tier,model,monthly,range,price:range+(monthly?' บาท/เดือน':' บาท')};
  }
  function brief(){const q=quote();return `สรุปโจทย์ขอใบเสนอราคา — ${site.brand}\n${receipt?'เลขอ้างอิง: '+receipt.id+'\n':''}\nผู้ติดต่อ: ${get('est-contact-name').value.trim()}\nโทร / LINE: ${get('est-contact-tel').value.trim()}\nอีเมล: ${get('est-contact-email').value.trim()||'ไม่ระบุ'}\nระบบที่สนใจ: ${selection().map(x=>systems[x]).join(', ')}\nรูปแบบบริการ: ${models[q.model]}\nงบที่ตั้งไว้: ${budgets[get('est-budget').value]}${q.model==='retainer'?' (ต่อเดือน)':''}\nกรอบประเมิน: ${q.price}\nกรอบเวลา: ${q.time}\nรายละเอียด: ${get('est-contact-notes').value.trim()||'ขอคุยรายละเอียดเพิ่มเติม'}\n\nเป็นประมาณการเบื้องต้น ราคาจริงและเงื่อนไขยืนยันในใบเสนอราคา`;}
  function updateBrief(){
    get('brief-preview').value=brief();
    get('estimate-email').href='mailto:'+site.email+'?'+new URLSearchParams({subject:'ขอใบเสนอราคา — '+selection().map(x=>systems[x]).join(', '),body:brief()}).toString().replace(/\+/g,'%20');
  }
  function update(){
    const chosen=selection(),q=quote();
    form.querySelector('[name="est-systems"]').setCustomValidity(chosen.length?'':'กรุณาเลือกอย่างน้อย 1 ระบบ');
    get('calc-est-price').textContent=q.range;get('calc-est-unit').textContent=q.monthly?'บาท / เดือน':'บาท / โปรเจกต์';get('calc-est-timeline').textContent=q.time;
    get('estimate-mobile-price').textContent=chosen.length?`${q.price} · ${q.time}`:'เลือกระบบเพื่อดูกรอบงบประมาณ';
    get('estimate-selection-status').textContent=chosen.length?`เลือกแล้ว ${chosen.length} ระบบ`:'ยังไม่ได้เลือกระบบ';
    get('estimate-summary-count').textContent=chosen.length?`เลือกแล้ว ${chosen.length} ระบบ`:'ยังไม่ได้เลือกระบบ';
    const list=get('estimate-selected-list');list.replaceChildren();
    for(const value of chosen){const li=document.createElement('li');li.textContent=systems[value];list.append(li);}
    if(!chosen.length){const li=document.createElement('li');li.textContent='เลือกระบบเพื่อเริ่มประเมิน';list.append(li);}
    const ceiling={under15:14999,'15to30':30000,'30to60':60000}[get('est-budget').value];
    get('estimate-budget-note').textContent=chosen.length&&ceiling&&ceiling<q.min?'งบที่ตั้งไว้ต่ำกว่ากรอบประเมิน ลองคุยเพื่อลดขอบเขตหรือแบ่งพัฒนาเป็นช่วง':'';
    const draft={systems:chosen,model:q.model,budget:get('est-budget').value,step};for(const id of contacts)draft[id]=get(id).value;
    try{localStorage.setItem(key,JSON.stringify(draft));saveAvailable=true;}catch{saveAvailable=false;}
    if(ready){
      if(form.checkValidity()&&get('est-contact-name').value.trim()&&get('est-contact-tel').value.trim()){updateBrief();if(!sending&&!receipt)get('estimate-delivery-status').textContent='สรุปอัปเดตแล้ว กดส่งคำขอเพื่อให้เราติดต่อกลับ';}
      else {ready=false;get('estimate-brief').hidden=true;}
    }
  }
  function showStep(next,scroll=false){
    step=next;furthest=Math.max(furthest,step);
    for(const panel of form.querySelectorAll('[data-step-panel]'))panel.hidden=Number(panel.dataset.stepPanel)!==step;
    for(const button of document.querySelectorAll('[data-estimate-step]')){const n=Number(button.dataset.estimateStep);button.disabled=n>furthest;if(n===step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');button.classList.toggle('is-complete',n<step);}
    get('estimate-next').textContent=receipt&&step===3?'ได้รับคำขอแล้ว ✓':['','ต่อไป: รูปแบบงาน →','ต่อไป: ข้อมูลติดต่อ →','ส่งคำขอให้เราติดต่อกลับ →'][step];
    get('estimate-next').disabled=sending||!!receipt&&step===3;
    get('estimate-back').hidden=step===1;get('estimate-brief').hidden=!ready||step!==3;get('estimate-step-error').textContent='';update();
    if(scroll){document.querySelector('.estimate-stepper').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});form.querySelector(`[data-step-panel="${step}"] legend`)?.focus({preventScroll:true});}
  }
  function canLeaveFirst(){if(selection().length)return true;get('estimate-step-error').textContent='เลือกอย่างน้อย 1 ระบบก่อนทำขั้นตอนถัดไป';form.querySelector('[name="est-systems"]').focus();return false;}
  function changed(){receipt=null;pendingRequestId=null;get('estimate-next').disabled=false;get('estimate-next').textContent=['','ต่อไป: รูปแบบงาน →','ต่อไป: ข้อมูลติดต่อ →','ส่งคำขอให้เราติดต่อกลับ →'][step];get('estimate-delivery-status').removeAttribute('data-state');}
  form.addEventListener('input',()=>{if(sending)return;changed();for(const id of ['est-contact-name','est-contact-tel'])get(id).setCustomValidity('');get('estimate-step-error').textContent='';update();});
  form.addEventListener('change',()=>{if(!sending){changed();update();}});
  document.addEventListener('click',event=>{
    if(sending&&event.target.closest('[data-estimate-step],[data-set-model]')){event.preventDefault();return;}
    const plan=event.target.closest('[data-set-model]');
    if(plan&&Object.hasOwn(models,plan.dataset.setModel)){form.querySelector(`[name="est-model"][value="${plan.dataset.setModel}"]`).checked=true;showStep(selection().length?2:1);}
    const target=event.target.closest('[data-estimate-step]');if(target&&!target.disabled){const next=Number(target.dataset.estimateStep);if(next>1&&!canLeaveFirst())return;showStep(next,true);}
  });
  get('estimate-back').addEventListener('click',()=>showStep(Math.max(1,step-1),true));
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(sending||receipt&&step===3)return;
    if(step===1){if(canLeaveFirst())showStep(2,true);return;}
    if(step===2){showStep(3,true);return;}
    if(!selection().length){showStep(1,true);canLeaveFirst();return;}
    for(const id of ['est-contact-name','est-contact-tel'])get(id).setCustomValidity(get(id).value.trim()?'':'กรุณากรอกข้อมูล');
    if(!form.reportValidity())return;
    ready=true;updateBrief();get('estimate-brief').hidden=false;
    const status=get('estimate-delivery-status');status.textContent='กำลังส่งคำขอ กรุณารอสักครู่…';status.dataset.state='sending';
    pendingRequestId??=crypto.randomUUID?crypto.randomUUID():[...crypto.getRandomValues(new Uint8Array(16))].map(x=>x.toString(16).padStart(2,'0')).join('');
    const payload={systems:selection(),model:quote().model,budget:get('est-budget').value,name:get('est-contact-name').value.trim(),contact:get('est-contact-tel').value.trim(),email:get('est-contact-email').value.trim(),notes:get('est-contact-notes').value.trim(),consent:get('est-contact-consent').checked,website:get('est-website').value};
    const controls=[...form.querySelectorAll('input,select,textarea,button')].map(element=>[element,element.disabled]);
    sending=true;form.setAttribute('aria-busy','true');for(const [element] of controls)element.disabled=true;get('estimate-next').textContent='กำลังส่งคำขอ…';
    const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),20000);
    try{
      const init=await fetch('/api/inquiries',{credentials:'same-origin',cache:'no-store',signal:abort.signal});
      if(!init.ok||!init.headers.get('content-type')?.includes('application/json'))throw Error('ระบบรับคำขอไม่พร้อมชั่วคราว');
      const session=await init.json();if(typeof session.csrf!=='string')throw Error('ระบบรับคำขอไม่พร้อมชั่วคราว');
      const response=await fetch('/api/inquiries',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':session.csrf,'Idempotency-Key':pendingRequestId},body:JSON.stringify(payload),signal:abort.signal});
      if(!response.headers.get('content-type')?.includes('application/json'))throw Error('ระบบรับคำขอไม่พร้อมชั่วคราว');
      const result=await response.json();
      if(!response.ok||!result.ok)throw Error(result.message||'ส่งคำขอไม่สำเร็จ');
      if(typeof result.id!=='string'||!/^BZ-\d{6}-[A-F0-9]{12}$/.test(result.id))throw Error('ยังไม่ได้รับเลขอ้างอิง กรุณาลองใหม่');
      receipt=result;status.textContent=`${result.message} · เลขอ้างอิง ${result.id}`;status.dataset.state=result.mailQueued?'success':'warning';updateBrief();
    }catch(error){
      status.textContent=(error.name==='AbortError'?'ยังยืนยันผลการส่งไม่ได้ กรุณากดส่งอีกครั้ง ระบบจะตรวจไม่ให้ส่งคำขอซ้ำ':error.name==='TypeError'?'เชื่อมต่อไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่':error.message)+' · คุณยังคัดลอกสรุปส่งทาง LINE หรืออีเมลได้';status.dataset.state='error';
    }finally{
      clearTimeout(timeout);sending=false;form.removeAttribute('aria-busy');for(const [element,disabled] of controls)element.disabled=disabled;
      get('estimate-next').disabled=!!receipt;get('estimate-next').textContent=receipt?'ได้รับคำขอแล้ว ✓':'ลองส่งคำขออีกครั้ง →';
      status.tabIndex=-1;status.focus({preventScroll:true});status.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
    }
  });
  get('estimate-copy').addEventListener('click',async()=>{if(!ready)return;try{await navigator.clipboard.writeText(get('brief-preview').value);get('estimate-copy-status').textContent='คัดลอกสรุปแล้ว เปิด LINE แล้ววางข้อความเพื่อส่งได้เลย';}catch{get('brief-preview').focus();get('brief-preview').select();get('estimate-copy-status').textContent='คัดลอกอัตโนมัติไม่ได้ เลือกข้อความให้แล้ว กรุณาคัดลอกด้วยตนเอง';}});
  get('estimate-clear').addEventListener('click',()=>{
    form.reset();for(const id of contacts){get(id).value='';get(id).setCustomValidity('');}for(const input of form.querySelectorAll('[name="est-systems"]'))input.checked=false;
    ready=false;receipt=null;pendingRequestId=null;furthest=1;get('brief-preview').value='';get('estimate-copy-status').textContent='';get('estimate-delivery-status').removeAttribute('data-state');try{localStorage.removeItem(key);}catch{}
    const clean=new URL(location.href);clean.searchParams.delete('interest');clean.searchParams.delete('model');history.replaceState(null,'',clean);showStep(1);
  });
  for(const target of document.querySelectorAll('[data-plan-start]'))target.textContent=number(rates[target.dataset.planStart][0].min);
  addEventListener('buzlike:home-intent',event=>{
    if(sending)return;
    const current=new URL(event.detail.url),choices=(current.searchParams.get('interest')||'').split(',').filter(x=>Object.hasOwn(systems,x));
    const model=current.searchParams.get('model');
    if(!choices.length&&!Object.hasOwn(models,model))return;
    changed();ready=false;furthest=1;
    if(choices.length)for(const input of form.querySelectorAll('[name="est-systems"]'))input.checked=choices.includes(input.value);
    if(Object.hasOwn(models,model))form.querySelector(`[name="est-model"][value="${model}"]`).checked=true;
    showStep(1);
  });
  addEventListener('hashchange',()=>{
    const current=new URL(location.href),parts=current.hash.slice(1).split('?');if(parts.length<2)return;
    const parameters=new URLSearchParams(parts.slice(1).join('?')),choices=(parameters.get('interest')||'').split(',').filter(x=>Object.hasOwn(systems,x));
    if(!choices.length)return;
    for(const input of form.querySelectorAll('[name="est-systems"]'))input.checked=choices.includes(input.value);
    current.searchParams.set('interest',choices.join(','));current.hash='estimator-form';history.replaceState(null,'',current);ready=false;furthest=1;showStep(1);
    get('estimator-form').scrollIntoView({behavior:'instant'});
  });
  for(const legend of form.querySelectorAll('legend'))legend.tabIndex=-1;
  if(!selection().length)step=furthest=1;showStep(step);
  if(location.hash==='#estimator-form')document.fonts.ready.then(()=>requestAnimationFrame(()=>get('estimator-form').scrollIntoView({behavior:'instant'})));
})();
