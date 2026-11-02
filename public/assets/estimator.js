(() => {
  'use strict';
  const form=document.getElementById('project-estimator-form');if(!form)return;
  const get=id=>document.getElementById(id),key='preeya_estimator_draft_v1';
  const systems={wms:'คลังสินค้าและสต็อก',crm:'ลูกค้า งานขาย และสัญญา',pos:'หน้าร้าน POS และจอครัว',shipping:'ขนส่งและติดตามพัสดุ',storefront:'เว็บไซต์ ร้านค้า และระบบจอง',custom:'ระบบเฉพาะ / เชื่อมข้อมูล'};
  const models={template:'ปรับจากระบบต้นแบบ',scratch:'พัฒนาใหม่เฉพาะธุรกิจ',retainer:'พัฒนาต่อและดูแลรายเดือน'};
  const budgets={discuss:'ยังไม่แน่ใจ ขอคุยรายละเอียดก่อน',under15:'ต่ำกว่า 15,000 บาท','15to30':'15,000–30,000 บาท','30to60':'30,000–60,000 บาท',over60:'มากกว่า 60,000 บาท'};
  const rates={template:[{count:1,min:15000,max:25000,time:'ประมาณ 2–3 สัปดาห์'},{count:2,min:25000,max:40000,time:'ประมาณ 3–4 สัปดาห์'},{count:6,min:40000,max:65000,time:'ประมาณ 4–6 สัปดาห์'}],scratch:[{count:2,min:35000,max:65000,time:'ประมาณ 4–8 สัปดาห์'},{count:6,min:65000,max:100000,plus:true,time:'ประมาณ 6–10 สัปดาห์'}],retainer:[{count:6,min:5000,max:12000,time:'วางแผนรอบงานรายเดือน'}]};
  const number=n=>n.toLocaleString('th-TH');
  const contacts=['est-contact-name','est-contact-tel','est-contact-email','est-contact-notes'];
  let ready=false,saveAvailable=true,step=1,furthest=1;
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
  function brief(){const q=quote();return `สรุปโจทย์ขอใบเสนอราคา — PREEYA SYSTEMS\n\nผู้ติดต่อ: ${get('est-contact-name').value.trim()}\nโทร / LINE: ${get('est-contact-tel').value.trim()}\nอีเมล: ${get('est-contact-email').value.trim()||'ไม่ระบุ'}\nระบบที่สนใจ: ${selection().map(x=>systems[x]).join(', ')}\nรูปแบบบริการ: ${models[q.model]}\nงบที่ตั้งไว้: ${budgets[get('est-budget').value]}${q.model==='retainer'?' (ต่อเดือน)':''}\nกรอบประเมิน: ${q.price}\nกรอบเวลา: ${q.time}\nรายละเอียด: ${get('est-contact-notes').value.trim()||'ขอคุยรายละเอียดเพิ่มเติม'}\n\nเป็นประมาณการเบื้องต้น ราคาจริงและเงื่อนไขยืนยันในใบเสนอราคา`;}
  function updateBrief(){
    get('brief-preview').value=brief();
    get('estimate-email').href='mailto:r.pumpo@gmail.com?'+new URLSearchParams({subject:'ขอใบเสนอราคา — '+selection().map(x=>systems[x]).join(', '),body:brief()}).toString().replace(/\+/g,'%20');
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
      if(form.checkValidity()&&get('est-contact-name').value.trim()&&get('est-contact-tel').value.trim()){updateBrief();get('estimate-delivery-status').textContent='สรุปอัปเดตแล้ว ยังไม่ได้ส่งข้อมูล กรุณาส่งทาง LINE หรืออีเมลด้วยตนเอง';}
      else {ready=false;get('estimate-brief').hidden=true;}
    }
  }
  function showStep(next,scroll=false){
    step=next;furthest=Math.max(furthest,step);
    for(const panel of form.querySelectorAll('[data-step-panel]'))panel.hidden=Number(panel.dataset.stepPanel)!==step;
    for(const button of document.querySelectorAll('[data-estimate-step]')){const n=Number(button.dataset.estimateStep);button.disabled=n>furthest;if(n===step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');button.classList.toggle('is-complete',n<step);}
    get('estimate-next').textContent=['','ต่อไป: รูปแบบงาน →','ต่อไป: ข้อมูลติดต่อ →','สร้างสรุปขอใบเสนอราคา →'][step];
    get('estimate-back').hidden=step===1;get('estimate-brief').hidden=!ready||step!==3;get('estimate-step-error').textContent='';update();
    if(scroll){document.querySelector('.estimate-stepper').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});form.querySelector(`[data-step-panel="${step}"] legend`)?.focus({preventScroll:true});}
  }
  function canLeaveFirst(){if(selection().length)return true;get('estimate-step-error').textContent='เลือกอย่างน้อย 1 ระบบก่อนทำขั้นตอนถัดไป';form.querySelector('[name="est-systems"]').focus();return false;}
  form.addEventListener('input',()=>{for(const id of ['est-contact-name','est-contact-tel'])get(id).setCustomValidity('');get('estimate-step-error').textContent='';update();});
  form.addEventListener('change',update);
  document.addEventListener('click',event=>{
    const plan=event.target.closest('[data-set-model]');
    if(plan&&Object.hasOwn(models,plan.dataset.setModel)){form.querySelector(`[name="est-model"][value="${plan.dataset.setModel}"]`).checked=true;showStep(selection().length?2:1);}
    const target=event.target.closest('[data-estimate-step]');if(target&&!target.disabled){const next=Number(target.dataset.estimateStep);if(next>1&&!canLeaveFirst())return;showStep(next,true);}
  });
  get('estimate-back').addEventListener('click',()=>showStep(Math.max(1,step-1),true));
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(step===1){if(canLeaveFirst())showStep(2,true);return;}
    if(step===2){showStep(3,true);return;}
    if(!selection().length){showStep(1,true);canLeaveFirst();return;}
    for(const id of ['est-contact-name','est-contact-tel'])get(id).setCustomValidity(get(id).value.trim()?'':'กรุณากรอกข้อมูล');
    if(!form.reportValidity())return;
    ready=true;updateBrief();get('estimate-brief').hidden=false;get('estimate-delivery-status').textContent='สรุปพร้อมแล้ว ยังไม่ได้ส่งข้อมูล คัดลอกไปวางใน LINE หรือเปิดอีเมลเพื่อส่ง'+(saveAvailable?'':' · เบราว์เซอร์นี้บันทึกแบบร่างไม่ได้');
    get('brief-preview').focus({preventScroll:true});get('estimate-brief').scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  });
  get('estimate-copy').addEventListener('click',async()=>{if(!ready)return;try{await navigator.clipboard.writeText(get('brief-preview').value);get('estimate-delivery-status').textContent='คัดลอกสรุปแล้ว เปิด LINE แล้ววางข้อความเพื่อส่งได้เลย';}catch{get('brief-preview').focus();get('brief-preview').select();get('estimate-delivery-status').textContent='คัดลอกอัตโนมัติไม่ได้ เลือกข้อความให้แล้ว กรุณาคัดลอกด้วยตนเอง';}});
  get('estimate-clear').addEventListener('click',()=>{
    form.reset();for(const id of contacts){get(id).value='';get(id).setCustomValidity('');}for(const input of form.querySelectorAll('[name="est-systems"]'))input.checked=false;
    ready=false;furthest=1;get('brief-preview').value='';try{localStorage.removeItem(key);}catch{}
    const clean=new URL(location.href);clean.searchParams.delete('interest');clean.searchParams.delete('model');history.replaceState(null,'',clean);showStep(1);
  });
  for(const target of document.querySelectorAll('[data-plan-start]'))target.textContent=number(rates[target.dataset.planStart][0].min);
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
