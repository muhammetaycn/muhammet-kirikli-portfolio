(() => {
  'use strict';
  const FOCUSABLE='button,a[href],summary,input,select,textarea,[tabindex]';
  const clamp=(value,low,high)=>Math.max(low,Math.min(high,value));
  function mount({dialog,content,heading,preview,canMove=()=>true}) {
    if(!dialog||!content||!heading)throw new Error('ProjectMotion: dialog, content and heading are required.');
    const originalParent=heading.parentNode,originalNext=heading.nextSibling;
    const intro=document.createElement('div'),figure=document.createElement('figure');
    intro.className='case-intro';figure.className='case-visual project-preview';figure.setAttribute('aria-hidden','true');
    originalParent.insertBefore(intro,heading);intro.append(heading,figure);
    const hadClass=dialog.classList.contains('has-project-motion');dialog.classList.add('has-project-motion');
    const media=window.matchMedia('(prefers-reduced-motion: reduce)'),animations=new Set(),cleanups=[];
    let destroyed=false,paused=false,generation=0,pending=null,closing=false,closePromise=null;
    let origin=null,originRect=null,opener=null;
    function listen(node,type,fn){node.addEventListener(type,fn);cleanups.push(()=>node.removeEventListener(type,fn));}
    function allowed(){return !paused&&!media.matches&&!document.hidden&&Boolean(canMove());}
    function motionClass(){dialog.classList.toggle('project-motion-paused',!allowed());}
    function state(value){dialog.dataset.projectMotion=value;dialog.dataset.motionGeneration=String(generation);}
    function cancelAnimations(){for(const animation of [...animations]){animations.delete(animation);try{animation.cancel();}catch{}}}
    function opacity(node){try{const value=Number(getComputedStyle(node).opacity);return Number.isFinite(value)?value:1;}catch{return 1;}}
    function transform(node){try{return getComputedStyle(node).transform||'none';}catch{return 'none';}}
    function rect(node){
      if(!node||node.isConnected===false||typeof node.getBoundingClientRect!=='function')return null;
      const box=node.getBoundingClientRect(),values=[box.left,box.top,box.width,box.height];
      if(!values.every(Number.isFinite)||box.width<8||box.height<8)return null;
      if(box.right<=0||box.bottom<=0||box.left>=innerWidth||box.top>=innerHeight)return null;
      try{const style=getComputedStyle(node);if(style.visibility==='hidden'||style.display==='none'||Number(style.opacity)===0)return null;}catch{}
      return {left:box.left,top:box.top,width:box.width,height:box.height};
    }
    function focusTarget(node,children=false){
      if(!node||node.isConnected===false)return null;
      if(node.matches?.(FOCUSABLE)&&!node.disabled)return node;
      return children?node.querySelector?.(FOCUSABLE)||null:null;
    }
    function restoreFocus(){
      const other=document.querySelector('dialog[open]');
      if(other||!opener||opener.isConnected===false||opener.disabled)return;
      try{opener.focus({preventScroll:true});}catch{try{opener.focus();}catch{}}
    }
    function geometryTransform(from,to){
      if(!from||!to)return null;
      const dx=clamp(from.left-to.left,-innerWidth*.8,innerWidth*.8),dy=clamp(from.top-to.top,-innerHeight*.8,innerHeight*.8);
      const sx=clamp(from.width/to.width,.42,1.18),sy=clamp(from.height/to.height,.42,1.18);
      return `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px) scale(${sx.toFixed(4)},${sy.toFixed(4)})`;
    }
    function play(node,keyframes,options){
      if(!allowed()||typeof node.animate!=='function')return Promise.resolve(true);
      let animation,finished;
      try{animation=node.animate(keyframes,{...options,fill:'both'});animations.add(animation);finished=animation.finished;}catch{return Promise.resolve(true);}
      // Every cancellation has a rejection handler before another command can run.
      return Promise.resolve(finished).then(()=>{animations.delete(animation);try{animation.cancel();}catch{}return true;},()=>{animations.delete(animation);return false;});
    }
    function visual(project){
      const drawing=preview?.matches?.('.preview-drawing')?preview:preview?.querySelector?.('.preview-drawing')||document.getElementById('preview-drawing');
      figure.replaceChildren();figure.dataset.project=project.visual||project.id;figure.dataset.caseId=project.id;
      if(drawing){
        const clone=drawing.cloneNode(true);clone.removeAttribute('id');clone.removeAttribute('aria-labelledby');clone.removeAttribute('aria-describedby');
        clone.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
        clone.querySelectorAll('[aria-labelledby],[aria-describedby]').forEach(node=>{node.removeAttribute('aria-labelledby');node.removeAttribute('aria-describedby');});
        clone.querySelectorAll(FOCUSABLE).forEach(node=>node.setAttribute('tabindex','-1'));
        figure.append(clone);
      }
      const number=document.createElement('span');number.className='case-visual-number';number.textContent=project.number||'mk';figure.append(number);
    }
    function apply(entry){entry.render();visual(entry.project);dialog.dataset.caseProject=entry.project.id;}
    function nativeClosed(){
      // A native close event is queued: reopening before it arrives keeps the new case alive.
      if(destroyed||dialog.open)return;
      generation++;pending=null;closing=false;closePromise=null;cancelAnimations();state('closed');restoreFocus();
    }
    function nativeClose(){if(dialog.open)dialog.close();else nativeClosed();}
    function settle(){
      if(destroyed)return;
      generation++;cancelAnimations();motionClass();
      if(closing){pending=null;nativeClose();return;}
      const entry=pending;pending=null;
      if(entry&&dialog.open)apply(entry);
      if(dialog.open)state('open');
    }
    function open({project,render,source}={}){
      if(destroyed||!project||typeof render!=='function')return false;
      const wasOpen=dialog.open;
      generation++;pending=null;closing=false;closePromise=null;cancelAnimations();
      if(!wasOpen||source&&!dialog.contains(source)){
        const candidates=[source,preview];origin=candidates.find(node=>rect(node))||null;originRect=rect(origin);
        opener=focusTarget(source,true)||focusTarget(document.activeElement)||focusTarget(preview,true);
      }
      motionClass();apply({project,render});
      if(!dialog.open)dialog.showModal();
      // showModal may restore the previous scroll position after the closed case was rendered.
      dialog.scrollTop=0;
      const token=generation,target=rect(figure),from=geometryTransform(originRect,target);state('opening');
      if(!allowed()){state('open');return true;}
      const movements=[play(content,[{opacity:.65,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'cubic-bezier(.22,.75,.2,1)'})];
      if(from)movements.push(play(figure,[{opacity:.25,transform:from},{opacity:1,transform:'translate(0,0) scale(1,1)'}],{duration:460,easing:'cubic-bezier(.22,.75,.2,1)'}));
      Promise.all(movements).then(()=>{if(!destroyed&&token===generation&&dialog.open&&!closing)state('open');});
      return true;
    }
    async function replace({project,render}={}){
      if(destroyed||!dialog.open||!project||typeof render!=='function')return false;
      const startOpacity=opacity(content),token=++generation;closing=false;closePromise=null;pending={project,render};cancelAnimations();motionClass();state('replacing');
      if(!allowed()){const entry=pending;pending=null;apply(entry);state('open');return true;}
      const finished=await play(content,[{opacity:startOpacity,transform:'translateY(0)'},{opacity:.28,transform:'translateY(-8px)'}],{duration:110,easing:'ease-out'});
      if(!finished||destroyed||token!==generation||!dialog.open||closing)return false;
      const entry=pending;pending=null;
      try{apply(entry);}catch(error){if(!destroyed&&token===generation)state('open');return false;}
      const incoming=await Promise.all([
        play(content,[{opacity:.28,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.22,.75,.2,1)'}),
        play(figure,[{opacity:.45,transform:'scale(.97)'},{opacity:1,transform:'scale(1)'}],{duration:330,easing:'cubic-bezier(.22,.75,.2,1)'})
      ]);
      if(destroyed||token!==generation||!dialog.open||closing)return false;
      state('open');return incoming.every(Boolean);
    }
    function close(){
      if(destroyed||!dialog.open)return Promise.resolve(false);
      if(closing&&closePromise)return closePromise;
      const token=++generation,startOpacity=opacity(content),startFigure=transform(figure),figureOpacity=opacity(figure);
      pending=null;closing=true;cancelAnimations();state('closing');
      if(!allowed()){nativeClose();return Promise.resolve(true);}
      const destination=rect(origin)||(origin?.isConnected!==false?originRect:null),to=geometryTransform(destination,rect(figure));
      const movements=[play(content,[{opacity:startOpacity},{opacity:.3}],{duration:190,easing:'ease-out'})];
      if(to)movements.push(play(figure,[{opacity:figureOpacity,transform:startFigure},{opacity:.12,transform:to}],{duration:240,easing:'cubic-bezier(.4,0,.6,1)'}));
      closePromise=Promise.all(movements).then(()=>{
        if(destroyed||token!==generation||!closing)return false;
        nativeClose();return true;
      });
      return closePromise;
    }
    listen(dialog,'close',nativeClosed);
    listen(dialog,'cancel',event=>{event.preventDefault();close();});
    listen(document,'visibilitychange',()=>{if(document.hidden)settle();else motionClass();});
    listen(window,'resize',settle);
    const preference=()=>{if(media.matches)settle();else motionClass();};
    if(media.addEventListener)listen(media,'change',preference);else if(media.addListener){media.addListener(preference);cleanups.push(()=>media.removeListener(preference));}
    return {
      open,replace,close,
      setPaused(value){if(destroyed)return;paused=Boolean(value);motionClass();if(paused)settle();},
      destroy(){
        if(destroyed)return;destroyed=true;generation++;pending=null;closing=false;closePromise=null;cancelAnimations();cleanups.splice(0).forEach(fn=>fn());
        const anchor=originalNext?.parentNode===originalParent?originalNext:null;originalParent.insertBefore(heading,anchor);intro.remove();
        if(!hadClass)dialog.classList.remove('has-project-motion');dialog.classList.remove('project-motion-paused');
        delete dialog.dataset.projectMotion;delete dialog.dataset.motionGeneration;delete dialog.dataset.caseProject;origin=originRect=opener=null;
      }
    };
  }
  window.ProjectMotion=Object.freeze({mount});
})();
