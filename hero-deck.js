(() => {
  'use strict';
  function mount({art, ribbon, computer, scene, computerScene, reducedMotion=false}) {
    const buttons=[...art.querySelectorAll('[data-deck-scene]')];
    const auto=art.querySelector('[data-deck-auto]');
    const progress=art.querySelector('.deck-progress i');
    const status=art.querySelector('.deck-status');
    let index=-1, paused=Boolean(reducedMotion), enabled=!reducedMotion, inside=false, focused=false, held=false;
    let visible=true, destroyed=false, elapsed=0, last=performance.now(), resumeAt=0, keepComputer=false;
    let keyboardMode=false, pageActive=true, clockRunning=false, timer=0;
    let presentationBusy=false, presentationPhase='idle', readRemaining=0, reading=false;
    let ribbonPaused, computerPaused;
    const durations=[4200,5800], releaseDelay=320, disposers=[];
    function pointerInside(){return Boolean(window.matchMedia?.('(hover: hover)').matches&&art.matches?.(':hover'));}
    inside=pointerInside();
    function listen(node,type,fn,options) {node.addEventListener(type,fn,options);disposers.push(()=>node.removeEventListener(type,fn,options));}
    function capture() {
      const now=performance.now();
      const delta=Math.max(0,Math.min(1000,now-last));
      if(clockRunning)elapsed+=delta;
      if(reading)readRemaining=Math.max(0,readRemaining-delta);
      last=now;return now;
    }
    function release() {resumeAt=performance.now()+releaseDelay;}
    function activity() {if(destroyed)return;capture();release();update();}
    function editing(node) {return Boolean(node?.matches?.('input,textarea,select,[contenteditable="true"]'));}
    function update() {
      if(destroyed)return false;
      const now=performance.now(),available=enabled&&!paused&&visible&&!document.hidden&&pageActive&&!inside&&!focused&&!held;
      const running=available&&now>=resumeAt;
      const protectedResult=index===1&&(presentationBusy||readRemaining>0);
      reading=index===1&&readRemaining>0&&(!paused||keepComputer)&&(visible||keepComputer)&&!document.hidden&&pageActive;
      clockRunning=running;last=now;
      art.dataset.deckScene=index===0?'ribbon':'computer';
      art.dataset.deckState=paused?'paused':running?(protectedResult?'presenting':'auto'):enabled?'exploring':'manual';
      art.dataset.deckDuration=String(durations[index]);art.dataset.deckElapsed=String(Math.round(elapsed));
      art.dataset.deckPresentation=index===1?presentationPhase:'idle';art.dataset.deckReadRemaining=String(Math.ceil(readRemaining));art.dataset.deckProtected=String(protectedResult);
      auto.setAttribute('aria-pressed',String(enabled));
      auto.setAttribute('aria-label',enabled?'Otomatik sahne geçişini durdur':'Otomatik sahne geçişini aç');
      auto.querySelector('span').textContent='';
      status.textContent=paused?'hareket duraklatıldı':!enabled?'elle keşif':running?(protectedResult?(presentationPhase==='result'?'sonucu gör':'işlemi izle'):(index===0?'sıradaki · mk.desktop':'sıradaki · çekim')):'kontrol sende';
      progress.style.transform=`scaleX(${Math.min(1,elapsed/durations[index])})`;
      const nextRibbon=paused||!visible||document.hidden||!pageActive||index!==0;
      const nextComputer=(paused&&!keepComputer)||(!visible&&!keepComputer)||document.hidden||!pageActive||index!==1;
      if(nextRibbon!==ribbonPaused){ribbonPaused=nextRibbon;scene?.setPaused(nextRibbon);}
      if(nextComputer!==computerPaused){computerPaused=nextComputer;computerScene?.setPaused(nextComputer);}
      clearTimeout(timer);timer=0;
      if(available||reading)timer=setTimeout(tick,available&&!running?Math.min(80,Math.max(1,resumeAt-now)):80);
      return running;
    }
    function select(next,manual=false) {
      if(destroyed)return;
      capture();const nextIndex=Number(next)===1?1:0,changed=nextIndex!==index;
      index=nextIndex;if(changed)elapsed=0;
      if(changed){presentationBusy=false;presentationPhase='idle';readRemaining=0;reading=false;}
      [ribbon,computer].forEach((host,i)=>{
        const active=i===index;
        host.classList.toggle('is-active',active);
        host.setAttribute('aria-hidden',String(!active));host.inert=!active;
      });
      buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
      if(changed)computerScene?.setVisible(index===1);
      if(manual)release();
      update();
    }
    function tick() {
      timer=0;if(destroyed)return;
      const wasRunning=clockRunning;capture();
      if(wasRunning&&elapsed>=durations[index]&&!(index===1&&(presentationBusy||readRemaining>0)))select(1-index);
      else update();
    }
    buttons.forEach((button,i)=>listen(button,'click',()=>select(i,true)));
    listen(auto,'click',()=>{capture();enabled=!enabled;update();});
    listen(art,'pointerenter',event=>{capture();if(event.pointerType!=='touch')inside=true;update();},{passive:true});
    listen(art,'pointerleave',()=>{capture();inside=false;release();update();},{passive:true});
    listen(art,'pointerdown',()=>{capture();held=true;keyboardMode=false;focused=editing(document.activeElement);update();},{passive:true});
    listen(window,'pointerup',()=>{if(held){capture();held=false;release();update();}},{passive:true});
    listen(window,'pointercancel',()=>{capture();held=false;release();update();},{passive:true});
    listen(window,'blur',()=>{capture();pageActive=false;held=false;inside=false;update();});
    listen(window,'focus',()=>{capture();pageActive=true;inside=pointerInside();release();update();});
    listen(window,'keydown',event=>{if(event.key==='Tab')keyboardMode=true;});
    listen(art,'keydown',()=>{capture();keyboardMode=true;focused=true;update();});
    listen(art,'focusin',event=>{capture();focused=keyboardMode||editing(event.target);update();});
    listen(art,'focusout',event=>{capture();focused=Boolean(event.relatedTarget&&art.contains(event.relatedTarget)&&(keyboardMode||editing(event.relatedTarget)));if(!focused)release();update();});
    listen(document,'visibilitychange',()=>{capture();if(!document.hidden)inside=pointerInside();update();});
    const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{capture();visible=entries[0].isIntersecting;update();},{threshold:.1}):null;
    observer?.observe(art);
    select(0);
    return {
      activity,
      select,
      setPresentation(value={}){if(destroyed||index!==1)return;capture();presentationBusy=Boolean(value.busy);presentationPhase=value.phase||'idle';const duration=Number(value.readMs);if(Number.isFinite(duration)&&duration>0)readRemaining=Math.max(readRemaining,Math.min(8000,duration));update();},
      setPaused(value,keep=false){if(destroyed||paused===Boolean(value)&&keepComputer===Boolean(keep))return;capture();paused=Boolean(value);keepComputer=Boolean(keep);update();},
      destroy(){if(destroyed)return;destroyed=true;clockRunning=false;clearTimeout(timer);timer=0;observer?.disconnect();disposers.forEach(fn=>fn());}
    };
  }
  window.HeroDeck=Object.freeze({mount});
})();
