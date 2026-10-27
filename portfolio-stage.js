(() => {
  'use strict';
  function mount({canMove=()=>true}={}){
    const body=document.body,hero=document.querySelector('#home'),work=document.querySelector('#work');
    const media=matchMedia('(prefers-reduced-motion: reduce)'),cleanups=[];
    let paused=false,destroyed=false;
    function update(){body.classList.toggle('stage-motion-on',!destroyed&&!paused&&!media.matches&&!document.hidden&&Boolean(canMove()));}
    function listen(node,type,fn){node.addEventListener(type,fn);cleanups.push(()=>node.removeEventListener(type,fn));}
    let observer;
    if(typeof IntersectionObserver==='function'){
      observer=new IntersectionObserver(entries=>{if(destroyed)return;for(const entry of entries)body.classList.toggle(entry.target===hero?'portfolio-hero-visible':'work-stage-visible',entry.isIntersecting);},{threshold:0,rootMargin:'-94px 0px 0px 0px'});
      [hero,work].filter(Boolean).forEach(node=>observer.observe(node));
    }else body.classList.add('portfolio-hero-visible','work-stage-visible');
    listen(document,'visibilitychange',update);
    if(media.addEventListener)listen(media,'change',update);
    else if(media.addListener){media.addListener(update);cleanups.push(()=>media.removeListener(update));}
    update();
    return {setPaused(value){paused=Boolean(value);update();},destroy(){if(destroyed)return;destroyed=true;observer?.disconnect();cleanups.forEach(fn=>fn());body.classList.remove('stage-motion-on','portfolio-hero-visible','work-stage-visible');}};
  }
  window.PortfolioStage=Object.freeze({mount});
})();
