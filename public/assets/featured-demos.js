(() => {
  'use strict';
  const wms=location.pathname==='/warehouse-management',pos=location.pathname==='/pos-system-smart';
  if(!wms&&!pos)return;
  const conversion=document.querySelector('.demo-conversion-bar');
  if(conversion&&!conversion.classList.contains('minimized'))conversion.querySelector('.conversion-bar-toggle')?.click();
  // A separate, measured print surface keeps the modal and app out of the receipt.
  function clearPrintSurface(){
    document.getElementById('pos-print-root')?.remove();
    document.getElementById('pos-print-page')?.remove();
    document.body.classList.remove('pos-printing');
  }
  function prepareReceipt(){
    const receipt=document.querySelector('.modal-backdrop .pos-receipt');
    if(!receipt)return false;
    clearPrintSurface();
    const root=document.createElement('div');root.id='pos-print-root';root.setAttribute('aria-hidden','true');
    root.append(receipt.cloneNode(true));document.body.append(root);
    const height=Math.ceil(root.getBoundingClientRect().height*25.4/96)+9;
    const style=document.createElement('style');style.id='pos-print-page';
    style.textContent=`@page { size:80mm ${height}mm; margin:4mm; }`;
    document.head.append(style);document.body.classList.add('pos-printing');
    return true;
  }
  if(pos){
    addEventListener('beforeprint',prepareReceipt);
    addEventListener('afterprint',clearPrintSurface);
    document.addEventListener('click',async e=>{
      if(!e.target.closest('[data-pos-print]'))return;
      await document.fonts.ready;
      if(prepareReceipt())window.print();
    });
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-guided-step]');if(!button)return;
    const step=Number(button.dataset.guidedStep);
    const tab=name=>document.querySelector(`#app [data-tab="${name}"]`)?.click();
    if(wms){
      if(step===1){tab('dashboard');document.querySelector('#app [data-wms-quick-inbound]')?.click();const qty=document.querySelector('#quick-inbound-form [name="qty"]');if(qty)qty.value='20';}
      if(step===2){tab('inventory');const row=document.querySelector('#app table tbody tr');row?.classList.add('trial-highlight');row?.scrollIntoView({block:'center',behavior:'smooth'});}
      if(step===3)tab('reports');
    }else{
      if(step===1){tab('pos');document.querySelector('#app [data-pos-add-item]')?.click();}
      if(step===2){tab('pos');const pay=document.querySelector('#app [data-pos-pay="Cash"]');if(pay&&!pay.disabled)pay.click();else{const notice=document.querySelector('.demo-guide-copy p');if(notice)notice.textContent='เลือกเมนูในขั้นตอนที่ 1 ก่อน แล้วจึงลองชำระเงิน';}}
      if(step===3){document.querySelector('.modal-backdrop [data-close-modal]')?.click();tab('kds');}
    }
  });
})();
