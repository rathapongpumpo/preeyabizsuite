(() => {
  'use strict';
  const cleanPrint=()=>{
    document.getElementById('wms-print-root')?.remove();
    document.getElementById('wms-print-page')?.remove();
    document.body.classList.remove('wms-printing');
  };
  const cleanTicket=()=>{
    document.getElementById('booking-print-root')?.remove();
    document.getElementById('booking-print-page')?.remove();
    document.body.classList.remove('booking-printing');
  };
  window.DemoTools={
    localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;},
    displayDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)?new Intl.DateTimeFormat('th-TH',{dateStyle:'medium'}).format(new Date(value+'T12:00:00')):value;},
    barcode(svg,sku){window.JsBarcode(svg,sku,{format:'CODE128',width:2,height:56,margin:20,fontSize:16,background:'#fff',lineColor:'#000'});svg.setAttribute('role','img');svg.setAttribute('aria-label','บาร์โค้ด SKU '+sku);},
    reservationQR(record){
      const qr=window.qrcode(0,'M');
      qr.addData(JSON.stringify({v:1,type:'demo-reservation',id:record.id,date:record.date,time:record.time.slice(0,5),zone:record.zone,guests:record.guests}));qr.make();
      return qr.createSvgTag({cellSize:4,margin:16,scalable:true});
    },
    prepareLabel(){
      const label=document.querySelector('.modal-backdrop .barcode-sticker-box');if(!label)return false;
      cleanPrint();const root=document.createElement('div');root.id='wms-print-root';root.setAttribute('aria-hidden','true');root.append(label.cloneNode(true));document.body.append(root);
      const style=document.createElement('style');style.id='wms-print-page';style.textContent='@page { size:100mm 75mm; margin:4mm; }';document.head.append(style);document.body.classList.add('wms-printing');return true;
    },
    clearLabel:cleanPrint,
    prepareTicket(){
      const ticket=document.querySelector('.modal-backdrop .tilt-booking-ticket');if(!ticket)return false;
      cleanTicket();const root=document.createElement('div');root.id='booking-print-root';root.setAttribute('aria-hidden','true');root.append(ticket.cloneNode(true));document.body.append(root);
      const style=document.createElement('style');style.id='booking-print-page';style.textContent='@page { size:A5 portrait; margin:10mm; }';document.head.append(style);document.body.classList.add('booking-printing');return true;
    },
    clearTicket:cleanTicket
  };
  addEventListener('afterprint',cleanPrint);
  addEventListener('afterprint',cleanTicket);
  addEventListener('beforeprint',()=>{if(!document.body.classList.contains('booking-printing'))window.DemoTools.prepareTicket();});
  document.addEventListener('click',event=>{if(event.target.closest('[data-wms-print]')&&window.DemoTools.prepareLabel())window.print();});
  document.addEventListener('click',event=>{if(event.target.closest('[data-booking-print]')&&window.DemoTools.prepareTicket())window.print();});
})();
