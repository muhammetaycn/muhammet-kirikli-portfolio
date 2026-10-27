(() => {
  'use strict';
  const mounted=new WeakMap();
  const DATA=['galleryState','galleryIndex','galleryProject','galleryCount'];
  const EASE='cubic-bezier(.22,.75,.2,1)';
  const PAINT=['display','position','inset','top','right','bottom','left','box-sizing','width','height','min-width','min-height','max-width','max-height','padding','margin','gap','column-gap','row-gap','align-items','align-self','justify-content','justify-self','flex-direction','flex-wrap','flex-grow','flex-shrink','flex-basis','grid-template-columns','grid-template-rows','grid-column','grid-row','border','border-radius','background','color','font-family','font-size','font-style','font-weight','line-height','letter-spacing','text-align','white-space','transform','translate','rotate','scale','transform-origin','transform-style','perspective','perspective-origin','backface-visibility','opacity','clip-path','overflow','z-index','box-shadow','filter','fill','stroke','stroke-width','stroke-dasharray','stroke-dashoffset'];
  let cloneSerial=0;
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
    let destroyed=false,paused=false,generation=0,manual=false,requestedDirection=0,outgoing=null,snapshot=null,observer=null;
    function listen(node,type,fn,options){node.addEventListener(type,fn,options);cleanups.push(()=>node.removeEventListener(type,fn,options));}
    function box(node){try{if(typeof node?.getBoundingClientRect!=='function')return null;const value=node.getBoundingClientRect();return [value.left,value.top,value.width,value.height].every(Number.isFinite)?value:null;}catch{return null;}}
    function inViewport(){const rect=box(preview);if(!rect)return true;const height=Number(window.innerHeight)||Infinity,width=Number(window.innerWidth)||Infinity;return rect.width>0&&rect.height>0&&rect.bottom>0&&rect.right>0&&rect.top<height&&rect.left<width;}
    let visible=inViewport();
    function allowed(){return !destroyed&&!paused&&!media.matches&&!document.hidden&&visible&&Boolean(canMove());}
    function motionClass(){preview.classList.toggle('project-gallery-paused',!allowed());}
    function cancelAnimations(){for(const animation of [...animations]){animations.delete(animation);try{animation.cancel();}catch{}}}
    function clearOutgoing(){outgoing?.remove();outgoing=null;}
    function state(value){preview.dataset.galleryState=value;}
    function computed(node,key,fallback){try{return getComputedStyle(node)[key]||fallback;}catch{return fallback;}}
    function opacity(node){const value=Number(computed(node,'opacity','1'));return Number.isFinite(value)?Math.max(0,Math.min(1,value)):1;}
    function paint(source,target){
      let style;try{style=getComputedStyle(source);}catch{return;}
      for(const name of PAINT){const camel=name.replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase()),value=style.getPropertyValue?.(name)||style[camel];if(!value)continue;if(target.style.setProperty)target.style.setProperty(name,value);else target.style[camel]=value;}
      target.style.animation='none';target.style.transition='none';target.style.pointerEvents='none';
      return style.display==='none';
    }
    function snapshotDrawing(){
      if(!drawing||typeof drawing.cloneNode!=='function')return null;
      const clone=drawing.cloneNode(true),sources=[drawing,...drawing.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')],ids=new Map(),hidden=new Set(),prefix='gallery-visual-'+(++cloneSerial)+'-';
      copies.forEach((node,index)=>{const source=sources[index];if(hidden.has(source.parentNode)||paint(source,node))hidden.add(source);const id=node.getAttribute('id');if(id){ids.set(id,prefix+ids.size);node.setAttribute('id',ids.get(id));}node.removeAttribute('aria-labelledby');node.removeAttribute('aria-describedby');node.removeAttribute('autofocus');node.removeAttribute('contenteditable');node.setAttribute('tabindex','-1');if('disabled'in node&&/^(BUTTON|INPUT|SELECT|TEXTAREA|FIELDSET)$/.test(node.tagName))node.disabled=true;if(node.tagName==='A')node.removeAttribute('href');});
      // Local SVG paint references must follow their renamed definitions.
      const rewrite=(value,attribute)=>{
        let next=String(value).replace(/url\(\s*(['"]?)[^)'"\s]*#([^)'"\s]+)\1\s*\)/g,(token,quote,id)=>ids.has(id)?'url("#'+ids.get(id)+'")':token);
        if((attribute==='href'||attribute==='xlink:href')&&next[0]==='#'&&ids.has(next.slice(1)))next='#'+ids.get(next.slice(1));
        return next;
      };
      copies.forEach(node=>{if(node.attributes)for(const attribute of [...node.attributes]){if(attribute.name==='id'||attribute.name==='tabindex')continue;const value=rewrite(attribute.value,attribute.name);if(value!==attribute.value)node.setAttribute(attribute.name,value);}if(node.style?.cssText)node.style.cssText=rewrite(node.style.cssText,'style');});
      clone.setAttribute('aria-hidden','true');clone.inert=true;clone.style.transform='none';clone.style.opacity='1';clone.style.clipPath='none';
      const rootBox=box(preview),drawingBox=box(drawing),frame=rootBox&&drawingBox?{left:drawingBox.left-rootBox.left,top:drawingBox.top-rootBox.top,width:drawingBox.width,height:drawingBox.height}:null;
      return {clone,frame,project:entries[position].project.id};
    }
    function makeOutgoing(saved){
      if(!saved?.clone)return null;
      const host=element('div','project-gallery-outgoing');host.setAttribute('aria-hidden','true');host.inert=true;host.dataset.project=saved.project;
      const clone=saved.clone.cloneNode(true);clone.classList.add('project-gallery-frozen');host.append(clone);
      if(saved.frame){const f=saved.frame;host.style.left=f.left+'px';host.style.top=f.top+'px';host.style.width=f.width+'px';host.style.height=f.height+'px';}
      preview.append(host);return host;
    }
    function settle(){if(destroyed)return;generation++;cancelAnimations();clearOutgoing();motionClass();state('idle');snapshot=snapshotDrawing();}
    // The application paints the new project before show(). Capture the old
    // settled pose first so pointer depth and CSS animation do not rewind.
    function prepare(){if(destroyed||animations.size)return false;snapshot=snapshotDrawing();return Boolean(snapshot);}
    function update(){
      const entry=entries[position],project=entry.project;
      preview.dataset.galleryIndex=String(entry.index);preview.dataset.galleryProject=project.id;preview.dataset.galleryCount=String(entries.length);
      count.textContent=String(position+1).padStart(2,'0')+' / '+String(entries.length).padStart(2,'0');
      count.setAttribute('aria-label','Seçili çalışma '+(position+1)+' / '+entries.length);
      name.textContent=project.title.split(' — ')[0];name.title=project.title;
      [...ticks.children].forEach((tick,index)=>tick.classList.toggle('is-selected',index===position));
      previous.disabled=next.disabled=entries.length<2;
    }
    function play(node,frames,duration,delay=0){
      if(!node||!allowed()||typeof node.animate!=='function')return Promise.resolve(true);
      let animation;
      try{animation=node.animate(frames,{duration,delay,easing:EASE,fill:'both'});animations.add(animation);}catch{return Promise.resolve(true);}
      return Promise.resolve(animation.finished).then(()=>{animations.delete(animation);try{animation.cancel();}catch{}return true;},()=>{animations.delete(animation);return false;});
    }
    function show(index){
      if(destroyed)return false;
      const nextPosition=entries.findIndex(entry=>entry.index===Number(index));if(nextPosition<0)return false;
      if(nextPosition===position){update();return true;}
      const inFlight=animations.size>0,oldPosition=position,direction=requestedDirection||Math.sign(nextPosition-oldPosition)||1,oldSnapshot=snapshot;
      const drawingOpacity=opacity(drawing),drawingTransform=computed(drawing,'transform','none'),drawingClip=computed(drawing,'clipPath','none'),captionOpacity=opacity(caption),captionTransform=computed(caption,'transform','none'),captionClip=computed(caption,'clipPath','none');
      const token=++generation;cancelAnimations();clearOutgoing();position=nextPosition;update();motionClass();snapshot=snapshotDrawing();
      if(manual)announcement.textContent=entries[position].project.title+' · '+(position+1)+' / '+entries.length;
      if(!allowed()||typeof drawing?.animate!=='function'){state('idle');return true;}
      state('changing');outgoing=makeOutgoing(oldSnapshot);const layer=outgoing;
      const incomingClip=direction>0?'inset(100% 0 0 0)':'inset(0 0 100% 0)',outgoingClip=direction>0?'inset(0 0 100% 0)':'inset(100% 0 0 0)';
      Promise.all([
        play(layer,[{opacity:inFlight?drawingOpacity:1,transform:inFlight?drawingTransform:'translateY(0) scale(1)',clipPath:inFlight?drawingClip:'inset(0 0 0 0)'},{opacity:.65,transform:'translateY('+(-direction*12)+'%) scale(1.025)',clipPath:outgoingClip}],620),
        play(drawing,[{opacity:inFlight?Math.max(.78,drawingOpacity):.78,transform:inFlight?drawingTransform:'translateY('+(direction*12)+'%) scale(1.035)',clipPath:inFlight?'inset(0 0 0 0)':incomingClip},{opacity:1,transform:'translateY(0) scale(1)',clipPath:'inset(0 0 0 0)'}],620),
        play(caption,[{opacity:inFlight?captionOpacity:0,transform:inFlight?captionTransform:'translateY('+(direction*22)+'px)',clipPath:inFlight?captionClip:incomingClip},{opacity:1,transform:'translateY(0)',clipPath:'inset(0 0 0 0)'}],450,inFlight?0:90)
      ]).then(()=>{if(!destroyed&&token===generation){if(outgoing===layer)clearOutgoing();state('idle');}});
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
    listen(document,'visibilitychange',()=>{if(document.hidden)settle();else motionClass();});listen(window,'resize',()=>{visible=inViewport();settle();});
    if(typeof IntersectionObserver==='function'){observer=new IntersectionObserver(entries=>{if(destroyed)return;visible=entries.some(entry=>entry.isIntersecting);if(!visible)settle();else motionClass();},{threshold:0});observer.observe(preview);}else listen(window,'scroll',()=>{const nextVisible=inViewport();if(nextVisible===visible)return;visible=nextVisible;if(!visible)settle();else motionClass();},{passive:true});
    const preference=()=>{if(media.matches)settle();else motionClass();};
    if(media.addEventListener)listen(media,'change',preference);else if(media.addListener){media.addListener(preference);cleanups.push(()=>media.removeListener(preference));}
    update();motionClass();state('idle');snapshot=snapshotDrawing();
    const controller={
      show,settle,prepare,
      setPaused(value){if(destroyed)return;paused=Boolean(value);if(paused)settle();else motionClass();},
      destroy(){
        if(destroyed)return;destroyed=true;generation++;cancelAnimations();clearOutgoing();observer?.disconnect();cleanups.splice(0).forEach(remove=>remove());snapshot=null;
        if(openButton&&buttonParent){const sibling=buttonNext?.parentNode===buttonParent?buttonNext:null;buttonParent.insertBefore(openButton,sibling);}
        controls.remove();announcement.remove();if(!hadClass)preview.classList.remove('has-project-gallery');preview.classList.remove('project-gallery-paused');
        DATA.forEach(key=>{if(savedData[key]===undefined)delete preview.dataset[key];else preview.dataset[key]=savedData[key];});mounted.delete(preview);
      }
    };
    mounted.set(preview,controller);return controller;
  }
  window.ProjectGallery=Object.freeze({mount});
})();
