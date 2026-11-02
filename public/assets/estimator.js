(() => {
  'use strict';
  const form=document.getElementById('project-estimator-form');if(!form)return;
  const get=id=>document.getElementById(id),key='preeya_estimator_draft_v1';
  const systems={wms:'คลังสินค้าและสต็อก',crm:'ลูกค้า งานขาย และสัญญา',pos:'หน้าร้าน POS และจอครัว',shipping:'ขนส่งและติดตามพัสดุ',storefront:'เว็บไซต์ ร้านค้า และระบบจอง',custom:'ระบบเฉพาะ / เชื่อมข้อมูล'};
  const models={template:'ปรับจากระบบต้นแบบ',scratch:'พัฒนาใหม่เฉพาะธุรกิจ',retainer:'พัฒนาต่อและดูแลรายเดือน'};
  const budgets={discuss:'ยังไม่แน่ใจ ขอคุยรายละเอียดก่อน',under35:'ต่ำกว่า 35,000 บาท','35to80':'35,000–80,000 บาท','80to150':'80,000–150,000 บาท',over150:'มากกว่า 150,000 บาท'};
  const contacts=['est-contact-name','est-contact-tel','est-contact-email','est-contact-notes'];
  let ready=false,saveAvailable=true;
  try{
    const draft=JSON.parse(localStorage.getItem(key)||'null');
    if(draft&&typeof draft==='object'){
      for(const input of form.querySelectorAll('[name="est-systems"]'))input.checked=Array.isArray(draft.systems)&&draft.systems.includes(input.value);
      if(Object.hasOwn(models,draft.model))form.querySelector(`[name="est-model"][value="${draft.model}"]`).checked=true;
      if(Object.hasOwn(budgets,draft.budget))get('est-budget').value=draft.budget;
      for(const id of contacts)if(typeof draft[id]==='string')get(id).value=draft[id].slice(0,id==='est-contact-notes'?6000:200);
    }
  }catch{saveAvailable=false;}
  const url=new URL(location.href),hashParts=url.hash.slice(1).split('?'),legacyParams=new URLSearchParams(hashParts.slice(1).join('?'));
  const requested=url.searchParams.get('interest')||legacyParams.get('interest');
  const picked=(requested||'').split(',').filter(value=>Object.hasOwn(systems,value));
  const requestedModel=url.searchParams.get('model')||legacyParams.get('model');
  if(picked.length)for(const input of form.querySelectorAll('[name="est-systems"]'))input.checked=picked.includes(input.value);
  if(Object.hasOwn(models,requestedModel))form.querySelector(`[name="est-model"][value="${requestedModel}"]`).checked=true;
  if(picked.length||hashParts.length>1){
    if(picked.length)url.searchParams.set('interest',picked.join(','));
    url.hash=picked.length&&['','contact','estimator-form'].includes(hashParts[0])?'estimator-form':hashParts[0];
    history.replaceState(null,'',url);
  }
  function selection(){return [...form.querySelectorAll('[name="est-systems"]:checked')].map(x=>x.value);}
  function quote(){
    const count=selection().length,model=form.querySelector('[name="est-model"]:checked').value;
    if(!count)return {price:'เลือกระบบเพื่อดูงบ',time:'ประมาณการตามรูปแบบและจำนวนระบบ',min:0,model};
    if(model==='retainer')return {price:'25,000 – 45,000 บาท/เดือน',time:'วางแผนรอบงานรายเดือน',min:25000,model};
    if(model==='scratch')return count>2?{price:'150,000 – 250,000+ บาท',time:'ประมาณ 6–10 สัปดาห์',min:150000,model}:{price:'80,000 – 160,000 บาท',time:'ประมาณ 4–8 สัปดาห์',min:80000,model};
    return count===1?{price:'35,000 – 55,000 บาท',time:'ประมาณ 2–3 สัปดาห์',min:35000,model}:count===2?{price:'55,000 – 80,000 บาท',time:'ประมาณ 3–4 สัปดาห์',min:55000,model}:{price:'80,000 – 140,000 บาท',time:'ประมาณ 4–6 สัปดาห์',min:80000,model};
  }
  function brief(){const q=quote();return `สรุปโจทย์ขอใบเสนอราคา — PREEYA SYSTEMS\n\nผู้ติดต่อ: ${get('est-contact-name').value.trim()}\nโทร / LINE: ${get('est-contact-tel').value.trim()}\nอีเมล: ${get('est-contact-email').value.trim()||'ไม่ระบุ'}\nระบบที่สนใจ: ${selection().map(x=>systems[x]).join(', ')}\nรูปแบบบริการ: ${models[q.model]}\nงบที่ตั้งไว้: ${budgets[get('est-budget').value]}${q.model==='retainer'?' (ต่อเดือน)':''}\nกรอบประเมิน: ${q.price}\nกรอบเวลา: ${q.time}\nรายละเอียด: ${get('est-contact-notes').value.trim()||'ขอคุยรายละเอียดเพิ่มเติม'}\n\nเป็นประมาณการเบื้องต้น ราคาจริงและเงื่อนไขยืนยันในใบเสนอราคา`;}
  function updateBrief(){
    get('brief-preview').value=brief();
    get('estimate-email').href='mailto:r.pumpo@gmail.com?'+new URLSearchParams({subject:'ขอใบเสนอราคา — '+selection().map(x=>systems[x]).join(', '),body:brief()}).toString().replace(/\+/g,'%20');
  }
  function update(){
    const chosen=selection(),q=quote();
    form.querySelector('[name="est-systems"]').setCustomValidity(chosen.length?'':'กรุณาเลือกอย่างน้อย 1 ระบบ');
    get('calc-est-price').textContent=q.price;get('calc-est-timeline').textContent=q.time;
    get('estimate-mobile-price').textContent=chosen.length?`${q.price} · ${q.time}`:'เลือกระบบเพื่อดูกรอบงบประมาณ';
    get('estimate-selection-status').textContent=chosen.length?`เลือกแล้ว ${chosen.length} ระบบ`:'ยังไม่ได้เลือกระบบ';
    get('estimate-selected-list').textContent=chosen.length?chosen.map(x=>systems[x]).join(' · '):'เลือกจากรายการระบบเพื่อเริ่มประเมิน';
    const ceiling={under35:34999,'35to80':80000,'80to150':150000}[get('est-budget').value];
    get('estimate-budget-note').textContent=chosen.length&&ceiling&&ceiling<q.min?'งบที่ตั้งไว้ต่ำกว่ากรอบประเมิน ลองคุยเพื่อลดขอบเขตหรือแบ่งพัฒนาเป็นช่วง':'';
    const draft={systems:chosen,model:q.model,budget:get('est-budget').value};for(const id of contacts)draft[id]=get(id).value;
    try{localStorage.setItem(key,JSON.stringify(draft));saveAvailable=true;}catch{saveAvailable=false;}
    if(ready){
      if(form.checkValidity()&&get('est-contact-name').value.trim()&&get('est-contact-tel').value.trim()){updateBrief();get('estimate-delivery-status').textContent='สรุปอัปเดตแล้ว ยังไม่ได้ส่งข้อมูล กรุณาส่งทาง LINE หรืออีเมลด้วยตนเอง';}
      else {ready=false;get('estimate-brief').hidden=true;}
    }
  }
  form.addEventListener('input',()=>{
    for(const id of ['est-contact-name','est-contact-tel'])get(id).setCustomValidity('');
    update();
  });
  form.addEventListener('change',update);
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-set-model]');if(!button||!Object.hasOwn(models,button.dataset.setModel))return;
    form.querySelector(`[name="est-model"][value="${button.dataset.setModel}"]`).checked=true;update();
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();
    for(const id of ['est-contact-name','est-contact-tel'])get(id).setCustomValidity(get(id).value.trim()?'':'กรุณากรอกข้อมูล');
    if(!form.reportValidity())return;
    ready=true;updateBrief();get('estimate-brief').hidden=false;
    get('estimate-delivery-status').textContent='สรุปพร้อมแล้ว ยังไม่ได้ส่งข้อมูล คัดลอกไปวางใน LINE หรือเปิดอีเมลเพื่อส่ง'+(saveAvailable?'':' · เบราว์เซอร์นี้บันทึกแบบร่างไม่ได้');
    get('brief-preview').focus({preventScroll:true});get('estimate-brief').scrollIntoView({block:'nearest',behavior:'smooth'});
  });
  get('estimate-copy').addEventListener('click',async()=>{
    if(!ready)return;
    try{await navigator.clipboard.writeText(get('brief-preview').value);get('estimate-delivery-status').textContent='คัดลอกสรุปแล้ว เปิด LINE แล้ววางข้อความเพื่อส่งได้เลย';}
    catch{get('brief-preview').focus();get('brief-preview').select();get('estimate-delivery-status').textContent='คัดลอกอัตโนมัติไม่ได้ เลือกข้อความให้แล้ว กรุณาคัดลอกด้วยตนเอง';}
  });
  get('estimate-clear').addEventListener('click',()=>{
    form.reset();for(const id of contacts){get(id).value='';get(id).setCustomValidity('');}for(const input of form.querySelectorAll('[name="est-systems"]'))input.checked=false;
    ready=false;get('estimate-brief').hidden=true;get('brief-preview').value='';
    try{localStorage.removeItem(key);}catch{}
    const clean=new URL(location.href);clean.searchParams.delete('interest');clean.searchParams.delete('model');history.replaceState(null,'',clean);update();
  });
  // Keep the live estimate close to the choices on narrow screens.
  const summary=form.querySelector('.estimate-summary'),fields=form.querySelector('.estimate-fields'),narrow=matchMedia('(max-width:900px)');
  function placeSummary(){if(narrow.matches)fields.append(summary);else form.append(summary);}
  narrow.addEventListener('change',placeSummary);placeSummary();update();
  if(location.hash==='#estimator-form')document.fonts.ready.then(()=>requestAnimationFrame(()=>get('estimator-form').scrollIntoView({behavior:'instant'})));
})();
