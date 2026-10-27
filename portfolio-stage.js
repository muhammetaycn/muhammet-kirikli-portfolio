(() => {
  'use strict';
  function mount({canMove=()=>true}={}){
    const body=document.body,hero=document.querySelector('#home'),work=document.querySelector('#work'),drawing=document.querySelector('#preview-drawing');
    const media=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)'),cleanups=[];
    let paused=false,destroyed=false,inside=false,box=null;
    const pointerProps=['--stage-pointer-x','--stage-pointer-y'],originalProps=drawing?pointerProps.map(name=>drawing.style.getPropertyValue(name)):[];
    function active(){return !destroyed&&!paused&&!media.matches&&!document.hidden&&Boolean(canMove());}
    function center(){if(drawing){drawing.style.setProperty(pointerProps[0],'0px');drawing.style.setProperty(pointerProps[1],'0px');}}
    function update(){if(destroyed)return;body.classList.toggle('stage-motion-on',active());if(media.matches||!fine.matches||active()&&!inside)center();}
    function listen(node,type,fn){node.addEventListener(type,fn);cleanups.push(()=>node.removeEventListener(type,fn));}
    let observer;
    if(typeof IntersectionObserver==='function'){
      observer=new IntersectionObserver(entries=>{if(destroyed)return;for(const entry of entries)body.classList.toggle(entry.target===hero?'portfolio-hero-visible':'work-stage-visible',entry.isIntersecting);},{threshold:0,rootMargin:'-94px 0px 0px 0px'});
      [hero,work].filter(Boolean).forEach(node=>observer.observe(node));
    }else body.classList.add('portfolio-hero-visible','work-stage-visible');
    listen(document,'visibilitychange',update);
    if(media.addEventListener)listen(media,'change',update);
    else if(media.addListener){media.addListener(update);cleanups.push(()=>media.removeListener(update));}
    if(fine.addEventListener)listen(fine,'change',update);
    else if(fine.addListener){fine.addListener(update);cleanups.push(()=>fine.removeListener(update));}
    if(drawing){
      function enter(event){if(event.pointerType!=='mouse')return;inside=true;box=drawing.getBoundingClientRect();}
      function move(event){
        if(event.pointerType!=='mouse'||!fine.matches||!active()||!body.classList.contains('work-stage-visible')||document.querySelector('dialog[open]'))return;
        inside=true;if(!box)box=drawing.getBoundingClientRect();if(!box.width||!box.height)return;
        const x=Math.max(-1,Math.min(1,(event.clientX-box.left)/box.width*2-1)),y=Math.max(-1,Math.min(1,(event.clientY-box.top)/box.height*2-1));
        drawing.style.setProperty(pointerProps[0],(x*10).toFixed(2)+'px');drawing.style.setProperty(pointerProps[1],(y*7).toFixed(2)+'px');
      }
      function leave(){inside=false;box=null;if(active())center();}
      function layout(){box=null;if(active())center();}
      listen(drawing,'pointerenter',enter);listen(drawing,'pointermove',move);listen(drawing,'pointerleave',leave);listen(drawing,'pointercancel',leave);
      listen(window,'resize',layout);listen(window,'scroll',()=>{box=null;});listen(window,'blur',leave);
    }
    update();
    return {setPaused(value){if(destroyed)return;paused=Boolean(value);update();},destroy(){if(destroyed)return;destroyed=true;observer?.disconnect();cleanups.forEach(fn=>fn());if(drawing)pointerProps.forEach((name,index)=>{if(originalProps[index])drawing.style.setProperty(name,originalProps[index]);else drawing.style.removeProperty(name);});body.classList.remove('stage-motion-on','portfolio-hero-visible','work-stage-visible');}};
  }
  window.PortfolioStage=Object.freeze({mount});
})();
