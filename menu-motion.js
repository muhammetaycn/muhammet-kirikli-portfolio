(() => {
  'use strict';
  const FOCUSABLE='button,a[href],summary,input,select,textarea,[tabindex]';
  function mount({dialog,canMove=()=>true}={}) {
    if(!dialog)throw new Error('MenuMotion: a native dialog is required.');
    const nav=dialog.querySelector('nav'),links=[...dialog.querySelectorAll('nav a[href^="#"]')],top=dialog.querySelector('.menu-top'),bottom=dialog.querySelector('.menu-bottom');
    const hadClass=dialog.classList.contains('has-menu-motion'),media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations=new Set(),cleanups=[],sources=new Map(),currentAttrs=new Map(links.map(link=>[link,link.getAttribute('aria-current')]));
    const cue=document.createElement('span'),key=document.createElement('kbd');cue.className='menu-escape';key.textContent='Esc';cue.append(key,document.createTextNode(' kapat'));bottom?.append(cue);
    dialog.classList.add('has-menu-motion');
    let destroyed=false,paused=false,generation=0,closing=false,closePromise=null,opener=null,shouldRestore=true;
    function listen(node,type,fn){if(!node)return;node.addEventListener(type,fn);cleanups.push(()=>node.removeEventListener(type,fn));}
    function allowed(){return !paused&&!media.matches&&!document.hidden&&Boolean(canMove());}
    function motionClass(){dialog.classList.toggle('menu-motion-paused',!allowed());}
    function state(value){dialog.dataset.menuMotion=value;dialog.dataset.menuGeneration=String(generation);}
    function cancel(){for(const animation of [...animations]){animations.delete(animation);try{animation.cancel();}catch{}}}
    function play(node,keyframes,options){
      if(!node||!allowed()||typeof node.animate!=='function')return Promise.resolve(true);
      let animation;
      try{animation=node.animate(keyframes,{...options,fill:'both'});animations.add(animation);}catch{return Promise.resolve(true);}
      // Attach both handlers before any later command can cancel the animation.
      return Promise.resolve(animation.finished).then(()=>{animations.delete(animation);try{animation.cancel();}catch{}return true;},()=>{animations.delete(animation);return false;});
    }
    function focusable(node){return node&&node.isConnected!==false&&!node.disabled&&node.matches?.(FOCUSABLE)?node:null;}
    function expanded(node,value){if(node)sources.has(node)&&node.setAttribute('aria-expanded',String(value));}
    function source(node){
      const candidate=focusable(node);
      if(!candidate||dialog.contains(candidate))return;
      if(opener!==candidate)expanded(opener,false);
      if(!sources.has(candidate))sources.set(candidate,{expanded:candidate.getAttribute('aria-expanded'),controls:candidate.getAttribute('aria-controls')});
      opener=candidate;expanded(opener,true);if(dialog.id)opener.setAttribute('aria-controls',dialog.id);
    }
    function restoreFocus(){
      if(!shouldRestore||document.querySelector('dialog[open]')||!focusable(opener))return;
      try{opener.focus({preventScroll:true});}catch{try{opener.focus();}catch{}}
    }
    function currentSection(){
      let best=null,distance=Infinity;
      for(const link of links){
        const id=(link.getAttribute('href')||'').slice(1),section=document.getElementById(id);
        if(!section||typeof section.getBoundingClientRect!=='function')continue;
        const box=section.getBoundingClientRect();
        if(!Number.isFinite(box.top)||!Number.isFinite(box.bottom)||box.bottom<=0||box.top>=innerHeight)continue;
        const next=Math.abs(box.top-innerHeight*.2);
        if(next<distance){distance=next;best=link;}
      }
      for(const link of links){if(link===best)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
    }
    function nativeClosed(){
      // close events are queued; an old event must not tear down a reopened menu.
      if(destroyed||dialog.open)return;
      generation++;closing=false;closePromise=null;cancel();state('closed');expanded(opener,false);restoreFocus();
    }
    function nativeClose(){if(dialog.open)dialog.close();else nativeClosed();}
    function settle(){
      if(destroyed)return;
      generation++;cancel();motionClass();
      if(closing){nativeClose();return;}
      if(dialog.open)state('open');
    }
    function open(openedBy=document.activeElement){
      if(destroyed)return false;
      const wasOpen=dialog.open;
      generation++;closing=false;closePromise=null;cancel();shouldRestore=true;
      if(!wasOpen||openedBy&&!dialog.contains(openedBy))source(openedBy);
      currentSection();motionClass();if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
      expanded(opener,true);const token=generation;state('opening');
      if(!allowed()){state('open');return true;}
      const entries=links.map((link,index)=>play(link,[{opacity:.2,transform:'translateY(24px)',clipPath:'inset(0 0 100% 0)'},{opacity:1,transform:'translateY(0)',clipPath:'inset(0 0 0% 0)'}],{duration:350,delay:index*45,easing:'cubic-bezier(.2,.8,.2,1)'}));
      entries.push(play(top,[{opacity:.35},{opacity:1}],{duration:180,easing:'ease-out'}));
      entries.push(play(bottom,[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,delay:120,easing:'ease-out'}));
      Promise.all(entries).then(()=>{if(!destroyed&&token===generation&&dialog.open&&!closing)state('open');});
      return true;
    }
    function close({restoreFocus=true,immediate=false}={}){
      if(destroyed||!dialog.open)return Promise.resolve(false);
      shouldRestore=shouldRestore&&Boolean(restoreFocus);
      if(immediate){generation++;closing=true;cancel();nativeClose();return Promise.resolve(true);}
      if(closing&&closePromise)return closePromise;
      const token=++generation;closing=true;cancel();state('closing');motionClass();
      if(!allowed()){nativeClose();return Promise.resolve(true);}
      const outgoing=[play(nav,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-12px)'}],{duration:180,easing:'cubic-bezier(.4,0,.6,1)'}),play(bottom,[{opacity:1},{opacity:0}],{duration:140,easing:'ease-in'})];
      closePromise=Promise.all(outgoing).then(()=>{if(destroyed||token!==generation||!closing)return false;nativeClose();return true;});
      return closePromise;
    }
    listen(dialog,'cancel',event=>{event.preventDefault();close();});
    listen(dialog,'close',nativeClosed);
    listen(dialog,'focusin',event=>{if(nav?.contains(event.target)&&dialog.dataset.menuMotion==='opening')settle();});
    links.forEach(link=>listen(link,'click',event=>{if(event.defaultPrevented||event.button>0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;close({restoreFocus:false,immediate:true});}));
    listen(document,'visibilitychange',()=>{if(document.hidden)settle();else motionClass();});listen(window,'resize',settle);
    const preference=()=>{if(media.matches)settle();else motionClass();};
    if(media.addEventListener)listen(media,'change',preference);else if(media.addListener){media.addListener(preference);cleanups.push(()=>media.removeListener(preference));}
    return {
      open,close,
      setPaused(value){if(destroyed)return;paused=Boolean(value);motionClass();if(paused)settle();},
      destroy(){
        if(destroyed)return;destroyed=true;generation++;closing=false;closePromise=null;cancel();cleanups.splice(0).forEach(fn=>fn());
        if(dialog.open)dialog.close();cue.remove();
        for(const [link,current] of currentAttrs){if(current===null)link.removeAttribute('aria-current');else link.setAttribute('aria-current',current);}
        for(const [node,attrs] of sources){for(const [name,value] of [['aria-expanded',attrs.expanded],['aria-controls',attrs.controls]]){if(value===null)node.removeAttribute(name);else node.setAttribute(name,value);}}
        if(!hadClass)dialog.classList.remove('has-menu-motion');dialog.classList.remove('menu-motion-paused');delete dialog.dataset.menuMotion;delete dialog.dataset.menuGeneration;opener=null;
      }
    };
  }
  window.MenuMotion=Object.freeze({mount});
})();
