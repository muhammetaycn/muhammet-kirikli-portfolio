(() => {
  'use strict';
  const mounted=new WeakMap();
  const DATA=['galleryState','galleryIndex','galleryProject','galleryCount'];
  function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function arrow(direction){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS('http://www.w3.org/2000/svg','path');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    path.setAttribute('d',direction<0?'M19 12H5m6-6-6 6 6 6':'M5 12h14m-6-6 6 6-6 6');svg.append(path);return svg;
  }
  function mount({preview,projects,onSelect=()=>{},canMove=()=>true}={}){
    const entries=Array.isArray(projects)?projects.map((project,index)=>({project,index})).filter(entry=>entry.project.featured!==false):[];
    if(!preview||!entries.length)throw new Error('ProjectGallery: preview and at least one featured project are required.');
    if(mounted.has(preview))mounted.get(preview).destroy();
    const drawing=preview.querySelector('.preview-drawing'),caption=preview.querySelector('.preview-bottom'),openButton=preview.querySelector('#preview-open');
    const buttonParent=openButton?.parentNode,buttonNext=openButton?.nextSibling;
    const hadClass=preview.classList.contains('has-project-gallery'),savedData=Object.fromEntries(DATA.map(key=>[key,preview.dataset[key]]));
    const controls=element('div','project-gallery-controls');controls.setAttribute('role','group');controls.setAttribute('aria-label','Çalışma önizlemesini değiştir');
    const previous=element('button','project-gallery-button');previous.type='button';previous.setAttribute('aria-label','Önceki çalışma');previous.append(arrow(-1));
    const next=element('button','project-gallery-button');next.type='button';next.setAttribute('aria-label','Sonraki çalışma');next.append(arrow(1));
    const information=element('div','project-gallery-information'),count=element('span','project-gallery-count'),name=element('span','project-gallery-name');
    const ticks=element('span','project-gallery-ticks');ticks.setAttribute('aria-hidden','true');
    entries.forEach(()=>ticks.append(element('i')));information.append(count,name,ticks);controls.append(previous,information,next);
    const announcement=element('span','project-gallery-announcement');announcement.setAttribute('role','status');announcement.setAttribute('aria-live','polite');announcement.setAttribute('aria-atomic','true');
    preview.append(controls,announcement);if(openButton&&caption)caption.append(openButton);preview.classList.add('has-project-gallery');
    const media=window.matchMedia('(prefers-reduced-motion: reduce)'),cleanups=[],animations=new Set();
    let position=Math.max(0,entries.findIndex(entry=>(entry.project.visual||entry.project.id)===preview.dataset.project));
    let destroyed=false,paused=false,generation=0,manual=false,requestedDirection=0;
    function listen(node,type,fn){node.addEventListener(type,fn);cleanups.push(()=>node.removeEventListener(type,fn));}
    function allowed(){return !destroyed&&!paused&&!media.matches&&!document.hidden&&Boolean(canMove());}
    function motionClass(){preview.classList.toggle('project-gallery-paused',!allowed());}
    function cancelAnimations(){for(const animation of [...animations]){animations.delete(animation);try{animation.cancel();}catch{}}}
    function state(value){preview.dataset.galleryState=value;}
    function settle(){if(destroyed)return;generation++;cancelAnimations();motionClass();state('idle');}
    function computed(node,key,fallback){try{return getComputedStyle(node)[key]||fallback;}catch{return fallback;}}
    function opacity(node){const value=Number(computed(node,'opacity','1'));return Number.isFinite(value)?Math.max(0,Math.min(1,value)):1;}
    function update(){
      const entry=entries[position],project=entry.project;
      preview.dataset.galleryIndex=String(entry.index);preview.dataset.galleryProject=project.id;preview.dataset.galleryCount=String(entries.length);
      count.textContent=String(position+1).padStart(2,'0')+' / '+String(entries.length).padStart(2,'0');
      count.setAttribute('aria-label','Seçili çalışma '+(position+1)+' / '+entries.length);
      name.textContent=project.title.split(' — ')[0];name.title=project.title;
      [...ticks.children].forEach((tick,index)=>tick.classList.toggle('is-selected',index===position));
      previous.disabled=next.disabled=entries.length<2;
    }
    function play(node,frames,duration){
      if(!node||!allowed()||typeof node.animate!=='function')return Promise.resolve(true);
      let animation;
      try{animation=node.animate(frames,{duration,easing:'cubic-bezier(.22,.75,.2,1)',fill:'both'});animations.add(animation);}catch{return Promise.resolve(true);}
      return Promise.resolve(animation.finished).then(()=>{animations.delete(animation);try{animation.cancel();}catch{}return true;},()=>{animations.delete(animation);return false;});
    }
    function show(index){
      if(destroyed)return false;
      const nextPosition=entries.findIndex(entry=>entry.index===Number(index));if(nextPosition<0)return false;
      if(nextPosition===position){update();return true;}
      const inFlight=animations.size>0,oldPosition=position,direction=requestedDirection||Math.sign(nextPosition-oldPosition)||1;
      const drawingOpacity=opacity(drawing),drawingTransform=computed(drawing,'transform','none'),captionOpacity=opacity(caption),captionTransform=computed(caption,'transform','none');
      const token=++generation;cancelAnimations();position=nextPosition;update();motionClass();
      if(manual)announcement.textContent=entries[position].project.title+' · '+(position+1)+' / '+entries.length;
      if(!allowed()){state('idle');return true;}
      state('changing');
      Promise.all([
        play(drawing,[{opacity:inFlight?drawingOpacity:.42,transform:inFlight?drawingTransform:'translateX('+(direction*14)+'px) scale(.99)'},{opacity:1,transform:'translateX(0) scale(1)'}],280),
        play(caption,[{opacity:inFlight?captionOpacity:.42,transform:inFlight?captionTransform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],220)
      ]).then(()=>{if(!destroyed&&token===generation)state('idle');});
      return true;
    }
    function request(offset,absolute){
      if(destroyed||entries.length<2)return;
      const nextPosition=absolute===undefined?(position+offset+entries.length)%entries.length:absolute;
      if(nextPosition===position)return;
      manual=true;requestedDirection=offset||Math.sign(nextPosition-position);
      try{onSelect(entries[nextPosition].index);}finally{manual=false;requestedDirection=0;}
    }
    listen(previous,'click',()=>request(-1));listen(next,'click',()=>request(1));
    listen(controls,'keydown',event=>{
      if(event.altKey||event.ctrlKey||event.metaKey)return;
      const key=event.key;if(!['ArrowLeft','ArrowRight','Home','End'].includes(key))return;
      event.preventDefault();event.stopPropagation();
      if(key==='Home')request(-1,0);else if(key==='End')request(1,entries.length-1);else request(key==='ArrowLeft'?-1:1);
    });
    listen(document,'visibilitychange',()=>{if(document.hidden)settle();else motionClass();});listen(window,'resize',settle);
    const preference=()=>{if(media.matches)settle();else motionClass();};
    if(media.addEventListener)listen(media,'change',preference);else if(media.addListener){media.addListener(preference);cleanups.push(()=>media.removeListener(preference));}
    update();motionClass();state('idle');
    const controller={
      show,
      setPaused(value){if(destroyed)return;paused=Boolean(value);if(paused)settle();else motionClass();},
      destroy(){
        if(destroyed)return;destroyed=true;generation++;cancelAnimations();cleanups.splice(0).forEach(remove=>remove());
        if(openButton&&buttonParent){const sibling=buttonNext?.parentNode===buttonParent?buttonNext:null;buttonParent.insertBefore(openButton,sibling);}
        controls.remove();announcement.remove();if(!hadClass)preview.classList.remove('has-project-gallery');preview.classList.remove('project-gallery-paused');
        DATA.forEach(key=>{if(savedData[key]===undefined)delete preview.dataset[key];else preview.dataset[key]=savedData[key];});mounted.delete(preview);
      }
    };
    mounted.set(preview,controller);return controller;
  }
  window.ProjectGallery=Object.freeze({mount});
})();
