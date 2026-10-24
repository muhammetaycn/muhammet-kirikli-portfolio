(() => {
  'use strict';
  function mount({art, ribbon, computer, scene, computerScene, reducedMotion=false}) {
    const buttons=[...art.querySelectorAll('[data-deck-scene]')];
    const auto=art.querySelector('[data-deck-auto]');
    const progress=art.querySelector('.deck-progress i');
    const status=art.querySelector('.deck-status');
    let index=0, paused=Boolean(reducedMotion), enabled=!reducedMotion, inside=false, focused=false, held=false;
    let visible=true, destroyed=false, elapsed=0, last=performance.now(), idleUntil=0, keepComputer=false;
    let ribbonPaused, computerPaused;
    const durations=[12000,18000], disposers=[];
    function listen(node,type,fn,options) {node.addEventListener(type,fn,options);disposers.push(()=>node.removeEventListener(type,fn,options));}
    function activity() {idleUntil=performance.now()+14000; update();}
    function update() {
      const running=enabled&&!paused&&visible&&!document.hidden&&!inside&&!focused&&!held&&performance.now()>=idleUntil;
      art.dataset.deckScene=index===0?'ribbon':'computer';
      art.dataset.deckState=paused?'paused':running?'auto':enabled?'exploring':'manual';
      auto.setAttribute('aria-pressed',String(enabled));
      auto.setAttribute('aria-label',enabled?'Otomatik sahne geçişini durdur':'Otomatik sahne geçişini aç');
      auto.querySelector('span').textContent=enabled?'Ⅱ':'▷';
      status.textContent=paused?'hareket duraklatıldı':!enabled?'elle keşif':running?'sırayla keşfet':'keşif sende';
      progress.style.transform=`scaleX(${Math.min(1,elapsed/durations[index])})`;
      const nextRibbon=paused||!visible||index!==0;
      const nextComputer=(paused&&!keepComputer)||(!visible&&!keepComputer)||index!==1;
      if(nextRibbon!==ribbonPaused){ribbonPaused=nextRibbon;scene?.setPaused(nextRibbon);}
      if(nextComputer!==computerPaused){computerPaused=nextComputer;computerScene?.setPaused(nextComputer);}
      return running;
    }
    function select(next,manual=false) {
      index=Number(next)===1?1:0;elapsed=0;
      [ribbon,computer].forEach((host,i)=>{
        const active=i===index;
        host.classList.toggle('is-active',active);
        host.setAttribute('aria-hidden',String(!active));host.inert=!active;
      });
      buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
      computerScene?.setVisible(index===1);
      if(manual) activity();
      update();
    }
    buttons.forEach((button,i)=>listen(button,'click',()=>select(i,true)));
    listen(auto,'click',()=>{enabled=!enabled;elapsed=0;idleUntil=0;update();});
    listen(art,'pointerenter',event=>{if(event.pointerType!=='touch')inside=true;activity();},{passive:true});
    listen(art,'pointerleave',()=>{inside=false;activity();},{passive:true});
    listen(art,'pointerdown',()=>{held=true;activity();},{passive:true});
    listen(window,'pointerup',()=>{if(held){held=false;activity();}},{passive:true});
    listen(window,'pointercancel',()=>{held=false;activity();},{passive:true});
    listen(window,'blur',()=>{held=false;inside=false;update();});
    listen(art,'keydown',activity);
    listen(art,'focusin',()=>{focused=true;activity();});
    listen(art,'focusout',event=>{focused=Boolean(event.relatedTarget&&art.contains(event.relatedTarget));activity();});
    listen(document,'visibilitychange',()=>{last=performance.now();update();});
    const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=performance.now();update();},{threshold:.1}):null;
    observer?.observe(art);
    select(0);
    const timer=setInterval(()=>{
      if(destroyed)return;
      const now=performance.now(),delta=Math.min(500,now-last);last=now;
      if(update()){elapsed+=delta;if(elapsed>=durations[index])select(1-index);}
    },200);
    return {
      activity,
      select,
      setPaused(value,keep=false){paused=Boolean(value);keepComputer=Boolean(keep);last=performance.now();update();},
      destroy(){destroyed=true;clearInterval(timer);observer?.disconnect();disposers.forEach(fn=>fn());}
    };
  }
  window.HeroDeck=Object.freeze({mount});
})();
