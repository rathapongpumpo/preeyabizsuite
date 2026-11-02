(() => {
  'use strict';
  let active=null;
  const describe=element=>({element,id:element?.id,keys:[...(element?.attributes||[])].filter(x=>x.name.startsWith('data-')).map(x=>[x.name,x.value])});
  const visible=element=>element instanceof HTMLElement&&!element.closest('[inert]')&&!element.matches(':disabled')&&element.getClientRects().length>0&&getComputedStyle(element).visibility!=='hidden';
  function restore(origin){
    let target=origin.element;
    if(!target?.isConnected&&origin.id)target=document.getElementById(origin.id);
    if(!target?.isConnected)for(const [name,value] of origin.keys){target=document.querySelector(`[${name}="${CSS.escape(value)}"]`);if(target)break;}
    if(!visible(target))target=document.querySelector('.shell-back');
    if(visible(target))target.focus({preventScroll:true});
  }
  window.DemoDialogs={
    capture(){const origin=active?.origin||describe(document.activeElement);active?.close(false);return origin;},
    close(){active?.close(true);},
    open(root,origin,onClose=()=>{}){
      const dialog=root.matches('[role=dialog]')?root:root.querySelector('[role=dialog]');
      dialog.tabIndex=-1;
      const siblings=[...document.body.children].filter(x=>x!==root&&x instanceof HTMLElement).map(element=>({element,inert:element.inert}));
      const overflow=document.body.style.overflow;
      for(const {element} of siblings)element.inert=true;
      document.body.style.overflow='hidden';
      const controls=()=>[...dialog.querySelectorAll('a[href],button,input,select,textarea,[tabindex],[contenteditable="true"]')].filter(x=>visible(x)&&x.tabIndex>=0);
      const focusFirst=()=>{(controls()[0]||dialog).focus({preventScroll:true});};
      const close=(returnFocus=true)=>{
        if(active?.root!==root)return;
        observer.disconnect();document.removeEventListener('keydown',onKey,true);document.removeEventListener('focusin',onFocus,true);
        active=null;for(const {element,inert} of siblings)element.inert=inert;
        document.body.style.overflow=overflow;root.remove();onClose();if(returnFocus)restore(origin);
      };
      const onKey=event=>{
        if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}
        if(event.key!=='Tab')return;
        const items=controls(),first=items[0],last=items[items.length-1],focused=document.activeElement;
        if(!items.length){event.preventDefault();dialog.focus();return;}
        if(!dialog.contains(focused)||focused===dialog){event.preventDefault();(event.shiftKey?last:first).focus();}
        else if(event.shiftKey&&focused===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&focused===last){event.preventDefault();first.focus();}
      };
      const onFocus=event=>{if(!root.contains(event.target))focusFirst();};
      const observer=new MutationObserver(()=>{if(!root.isConnected)close();});
      observer.observe(document.body,{childList:true});
      active={root,origin,close};document.addEventListener('keydown',onKey,true);document.addEventListener('focusin',onFocus,true);focusFirst();
    }
  };
})();
