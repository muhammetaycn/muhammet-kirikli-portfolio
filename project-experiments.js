(() => {
  'use strict';
  const mounted=new WeakMap(),namespace='http://www.w3.org/2000/svg';
  let serial=0;
  const SUPPORTED=new Set(['idolog','textile','aciktinmi','portfolio']);
  const PROFILES=[
    {id:'soft',label:'Yumuşak',duration:1100,easing:'cubic-bezier(.16,1,.3,1)'},
    {id:'sharp',label:'Keskin',duration:280,easing:'cubic-bezier(.2,.8,.2,1)'},
    {id:'heavy',label:'Ağır',duration:1500,easing:'cubic-bezier(.55,0,.2,1)'}
  ];
  const PLACES=[
    {id:'a',name:'Örnek Kafe A',kind:'kahve',detail:'Kahve · kısa mola',x:23,y:37},
    {id:'b',name:'Örnek Mutfak B',kind:'yemek',detail:'Yemek · öğle arası',x:59,y:28},
    {id:'c',name:'Örnek Kafe C',kind:'kahve',detail:'Kahve · açık alan',x:74,y:66}
  ];
  function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function button(text,className='experiment-button'){const node=element('button',className,text);node.type='button';return node;}
  function vector(tag,attributes){const node=document.createElementNS(namespace,tag);Object.entries(attributes).forEach(([key,value])=>node.setAttribute(key,value));return node;}
  function mount({preview,projects=[],canMove=()=>true,onActivate=()=>{}}={}){
    if(!preview)return {select(){},close(){},setPaused(){},destroy(){}};
    if(mounted.has(preview))return mounted.get(preview);
    const drawing=preview.querySelector('.preview-drawing'),caption=preview.querySelector('.preview-bottom'),open=preview.querySelector('#preview-open');
    if(!drawing||!caption)return {select(){},close(){},setPaused(){},destroy(){}};
    const prefix='project-experiment-'+(++serial),originalHidden=drawing.getAttribute('aria-hidden'),hadClass=preview.classList.contains('has-project-experiment');
    const toggle=button('Sahneyi dene','project-experiment-toggle');toggle.setAttribute('aria-expanded','false');
    if(open?.parentNode===caption)caption.insertBefore(toggle,open);else caption.append(toggle);
    const media=window.matchMedia('(prefers-reduced-motion: reduce)'),cleanups=[],viewCleanups=[],states=new Map();
    let index=-1,destroyed=false,paused=false,visible=true,playing=false,saved=null,surface=null,motion=null,animation=null,animationToken=0;
    function listen(node,type,callback,options,view=false){node.addEventListener(type,callback,options);(view?viewCleanups:cleanups).push(()=>node.removeEventListener(type,callback,options));}
    function current(){return projects[index];}
    function state(id){if(!states.has(id))states.set(id,id==='idolog'?{draft:'',pending:null,published:null}:id==='textile'?{stage:0,history:['Sipariş alındı.']}:id==='aciktinmi'?{filter:'all',selected:null}:{profile:0,atEnd:false});return states.get(id);}
    function permitted(){return !destroyed&&playing&&!paused&&!media.matches&&!document.hidden&&visible&&Boolean(canMove())&&!document.querySelector('dialog[open]');}
    function cancelAnimation(keepPose=false){
      animationToken++;
      if(!animation)return;
      if(keepPose&&motion){try{const pose=window.getComputedStyle?.(motion.actor)?.transform;if(pose&&pose!=='none')motion.actor.style.transform=pose;}catch{}}
      const old=animation;animation=null;try{old.cancel();}catch{}
    }
    function updateMotion(){
      if(destroyed)return;
      preview.classList.toggle('project-experiment-still',playing&&!permitted());
      if(!animation)return;
      if(media.matches){if(motion)motion.actor.style.transform=motion.target;cancelAnimation();return;}
      try{if(permitted())animation.play();else animation.pause();}catch{}
    }
    function animateResult(node){
      if(!permitted()||typeof node?.animate!=='function')return;
      cancelAnimation();const token=animationToken;
      try{animation=node.animate([{opacity:.55,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});}catch{return;}
      const running=animation;Promise.resolve(running.finished).then(()=>{if(!destroyed&&token===animationToken&&animation===running){animation=null;running.cancel();}},()=>{});
    }
    function status(text){if(surface)surface.status.textContent=text;}
    function scaffold(project){
      const shell=element('div','experiment-shell');shell.id=prefix+'-surface';shell.setAttribute('role','group');shell.setAttribute('aria-label',project.title+' · yerel prova');shell.dataset.experiment=project.id;
      const head=element('div','experiment-head'),title=element('b','experiment-title',project.title.split(' — ')[0]),scope=element('span','experiment-scope','Yerel prova · bu oturum');head.append(title,scope);
      const content=element('div','experiment-content'),message=element('p','experiment-status');message.setAttribute('role','status');message.setAttribute('aria-live','polite');message.setAttribute('aria-atomic','true');shell.append(head,content,message);
      listen(shell,'keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))event.stopPropagation();if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close({restoreFocus:true});}},undefined,true);
      return {shell,content,status:message};
    }
    function social(){
      const model=state('idolog'),form=element('form','experiment-form'),label=element('label','experiment-label','Bir fikir yaz'),input=element('textarea','experiment-input');input.id=prefix+'-idea';input.rows=3;input.maxLength=140;input.required=true;input.value=model.draft;input.placeholder='Hangi fikri tartışmaya açardın?';label.htmlFor=input.id;
      const foot=element('div','experiment-form-foot'),counter=element('span','experiment-counter'),send=button('Kontrole gönder');send.type='submit';foot.append(counter,send);form.append(label,input,foot);
      const pending=element('div','experiment-pending'),pendingLabel=element('span','experiment-label','Karar bekliyor'),pendingCopy=element('p','experiment-idea'),actions=element('div','experiment-actions'),approve=button('Onayla'),reject=button('Geri gönder','experiment-button experiment-button-secondary');actions.append(approve,reject);pending.append(pendingLabel,pendingCopy,actions);
      const result=element('div','experiment-result'),resultLabel=element('span','experiment-label','Akışta'),resultCopy=element('p','experiment-idea');result.append(resultLabel,resultCopy);surface.content.append(form,pending,result);
      function paint(){counter.textContent=model.draft.length+' / 140';input.value=model.draft;form.hidden=Boolean(model.pending);pending.hidden=!model.pending;pendingCopy.textContent=model.pending||'';result.hidden=!model.published;resultCopy.textContent=model.published||'';send.disabled=Boolean(model.pending);}
      listen(input,'input',()=>{model.draft=input.value.slice(0,140);counter.textContent=model.draft.length+' / 140';input.setCustomValidity?.('');},undefined,true);
      listen(form,'submit',event=>{event.preventDefault();if(destroyed||!playing||model.pending)return;const value=input.value.trim().slice(0,140);if(!value){input.setCustomValidity?.('Bir fikir yaz.');input.reportValidity?.();return;}model.draft=value;model.pending=value;paint();status('Fikir kontrol sırasında. Yayına almak için karar ver.');approve.focus();},undefined,true);
      listen(approve,'click',()=>{if(destroyed||!playing||!model.pending)return;model.published=model.pending;model.pending=null;model.draft='';paint();status('Onaylandı. Fikir bu oturumdaki akışta.');animateResult(result);input.focus();},undefined,true);
      listen(reject,'click',()=>{if(destroyed||!playing||!model.pending)return;model.draft=model.pending;model.pending=null;paint();status('Taslağa geri döndü. Düzenleyip yeniden gönderebilirsin.');input.focus();},undefined,true);
      paint();status(model.pending?'Fikir kararını bekliyor.':model.published?'Son onaylanan fikir bu oturumdaki akışta.':'Bir fikir gönder; ardından kontrol kararını sen ver.');
    }
    function order(){
      const model=state('textile'),names=['Sipariş','Üretim','Kontrol'];
      const order=element('div','experiment-order');order.append(element('b','','Örnek sipariş'),element('span','','PROVA-01'));
      const steps=element('ol','experiment-steps'),items=names.map(name=>{const item=element('li','experiment-step');item.append(element('i','experiment-step-dot'),element('span','',name));steps.append(item);return item;});
      const track=element('div','experiment-track'),fill=element('span','experiment-track-fill');track.setAttribute('role','progressbar');track.setAttribute('aria-label','Örnek siparişin aşaması');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','2');track.append(fill);
      const history=element('p','experiment-history'),actions=element('div','experiment-actions'),next=button('Üretime al'),undo=button('Geri al','experiment-button experiment-button-secondary');actions.append(next,undo);surface.content.append(order,steps,track,history,actions);
      function paint(){items.forEach((item,i)=>{item.classList.toggle('is-current',i===model.stage);item.classList.toggle('is-done',i<model.stage);if(i===model.stage)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});track.setAttribute('aria-valuenow',String(model.stage));track.setAttribute('aria-valuetext',names[model.stage]);fill.style.transform='scaleX('+(model.stage/2)+')';history.textContent=model.history.at(-1);next.textContent=['Üretime al','Kontrole gönder','Kontrol tamam'][model.stage];next.disabled=model.stage===2;undo.disabled=model.stage===0;}
      listen(next,'click',()=>{if(destroyed||!playing||model.stage===2)return;model.stage++;model.history.push(names[model.stage]+' aşamasına taşındı.');paint();status('Aynı örnek kayıt şimdi '+names[model.stage].toLocaleLowerCase('tr-TR')+' aşamasında.');animateResult(order);if(next.disabled)undo.focus();},undefined,true);
      listen(undo,'click',()=>{if(destroyed||!playing||model.stage===0)return;model.stage--;model.history.push(names[model.stage]+' aşamasına geri alındı.');paint();status('Son aşama geri alındı; kayıt silinmedi.');},undefined,true);
      paint();status('Tek örnek kaydı ilerlet; istersen son aşamayı geri al.');
    }
    function map(){
      const model=state('aciktinmi'),filters=element('div','experiment-filters');filters.setAttribute('role','group');filters.setAttribute('aria-label','Mekân türü');
      const filterButtons=[['all','Hepsi'],['kahve','Kahve'],['yemek','Yemek']].map(([kind,label])=>{const node=button(label,'experiment-filter');node.dataset.filter=kind;filters.append(node);return node;});
      const map=element('div','experiment-map'),roads=vector('svg',{viewBox:'0 0 300 180','aria-hidden':'true',class:'experiment-map-roads'});roads.append(vector('path',{d:'M-10 45L310 145M30 -10L240 190M180 -10L55 190M-10 125H310M110 -10V190',fill:'none'}));map.append(roads);
      const pins=PLACES.map((place,i)=>{const node=button('','experiment-map-pin');node.style.left=place.x+'%';node.style.top=place.y+'%';node.setAttribute('aria-label',place.name);const number=element('span','',String(i+1));number.setAttribute('aria-hidden','true');node.append(number);map.append(node);return node;});
      const result=element('div','experiment-result experiment-map-result'),title=element('b'),detail=element('span');result.append(title,detail);surface.content.append(filters,map,result);
      function paint(){filterButtons.forEach((node,i)=>node.setAttribute('aria-pressed',String(['all','kahve','yemek'][i]===model.filter)));pins.forEach((node,i)=>{node.hidden=model.filter!=='all'&&PLACES[i].kind!==model.filter;node.classList.toggle('is-selected',PLACES[i].id===model.selected);node.setAttribute('aria-pressed',String(PLACES[i].id===model.selected));});const place=PLACES.find(item=>item.id===model.selected);title.textContent=place?.name||'Bir örnek nokta seç';detail.textContent=place?.detail||'Bu harita gerçek konum bilgisi kullanmaz.';}
      filterButtons.forEach((node,i)=>listen(node,'click',()=>{if(destroyed||!playing)return;model.filter=['all','kahve','yemek'][i];const selected=PLACES.find(place=>place.id===model.selected);if(selected&&model.filter!=='all'&&selected.kind!==model.filter)model.selected=null;paint();status(PLACES.filter(place=>model.filter==='all'||place.kind===model.filter).length+' örnek nokta görünüyor.');},undefined,true));
      pins.forEach((node,i)=>listen(node,'click',()=>{if(destroyed||!playing||node.hidden)return;model.selected=PLACES[i].id;paint();status(PLACES[i].name+' seçildi.');animateResult(result);},undefined,true));
      paint();status('Üç örnek nokta. Türü filtrele, haritadan birini seç.');
    }
    function motionDemo(){
      const model=state('portfolio'),profiles=element('div','experiment-filters');profiles.setAttribute('role','group');profiles.setAttribute('aria-label','Hareket karakteri');
      const choices=PROFILES.map(profile=>{const node=button(profile.label,'experiment-filter');profiles.append(node);return node;});
      const lane=element('div','experiment-motion-lane'),actor=element('span','experiment-motion-actor');actor.setAttribute('aria-hidden','true');lane.append(element('i','experiment-motion-start'),element('i','experiment-motion-end'),actor);lane.setAttribute('role','img');lane.setAttribute('aria-label','İki uç arasında hareket eden nesne');
      const readout=element('p','experiment-motion-readout'),pulse=button('Darbe ver'),actions=element('div','experiment-actions');actions.append(pulse);surface.content.append(profiles,lane,readout,actions);motion={actor,target:'translateX(0px)'};
      function restingPose(){
        if(!model.atEnd)return 'translateX(0px)';
        if(window.CSS?.supports('width','1cqw'))return 'translateX(calc(100cqw - 100%))';
        return 'translateX('+Math.max(0,lane.clientWidth-actor.offsetWidth)+'px)';
      }
      function paint(){choices.forEach((node,i)=>node.setAttribute('aria-pressed',String(i===model.profile)));const profile=PROFILES[model.profile];readout.textContent=profile.label+' · '+profile.duration+' ms';}
      choices.forEach((node,i)=>listen(node,'click',()=>{if(destroyed||!playing)return;cancelAnimation(true);model.profile=i;paint();status(PROFILES[i].label+' seçildi. Hareketi görmek için darbe ver.');},undefined,true));
      listen(pulse,'click',()=>{
        if(destroyed||!playing)return;
        let from=actor.style.transform||'translateX(0px)';if(animation){try{from=window.getComputedStyle?.(actor)?.transform||from;}catch{}}
        cancelAnimation();const token=animationToken,profile=PROFILES[model.profile];model.atEnd=!model.atEnd;const target=restingPose();motion.target=target;actor.style.transform=target;
        if(!permitted()||typeof actor.animate!=='function'){status(profile.label+' · sabit sonuç; hareket duraklatılmış.');return;}
        try{animation=actor.animate([{transform:from},{transform:target}],{duration:profile.duration,easing:profile.easing,fill:'both'});}catch{status(profile.label+' · sonuç hazır.');return;}
        const running=animation;status(profile.label+' hareketi · '+profile.duration+' ms');Promise.resolve(running.finished).then(()=>{if(!destroyed&&playing&&token===animationToken&&animation===running){animation=null;running.cancel();status(profile.label+' hareketi tamamlandı.');}},()=>{});
      },undefined,true);
      motion.target=restingPose();actor.style.transform=motion.target;paint();status('Bir karakter seç; aynı mesafenin zamanlamasını değiştir.');
    }
    function close({restoreFocus=false}={}){
      if(!playing)return;
      cancelAnimation();motion=null;playing=false;viewCleanups.splice(0).forEach(remove=>remove());
      if(saved){saved.shell.replaceChildren(...saved.nodes);saved.scene.classList.remove('is-experiment-active');saved=null;}
      surface=null;preview.classList.toggle('has-project-experiment',hadClass);preview.classList.remove('project-experiment-still');
      if(originalHidden===null)drawing.removeAttribute('aria-hidden');else drawing.setAttribute('aria-hidden',originalHidden);
      toggle.textContent='Sahneyi dene';toggle.setAttribute('aria-expanded','false');toggle.removeAttribute('aria-controls');delete preview.dataset.experimentProject;
      toggle.setAttribute('aria-label',current().title.split(' — ')[0]+' sahnesini dene');
      if(restoreFocus&&!destroyed)toggle.focus();
    }
    function activate(){
      const project=current();if(destroyed||playing||!project||!SUPPORTED.has(project.id))return;
      const scene=drawing.querySelector('.mini-'+(project.visual||project.id)),shell=scene?.querySelector('.product-window,.product-device');if(!scene||!shell)return;
      onActivate();if(destroyed)return;
      saved={scene,shell,nodes:[...shell.childNodes]};playing=true;surface=scaffold(project);shell.replaceChildren(surface.shell);scene.classList.add('is-experiment-active');preview.classList.add('has-project-experiment');preview.dataset.experimentProject=project.id;drawing.setAttribute('aria-hidden','false');toggle.textContent='Görsele dön';toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-controls',surface.shell.id);
      if(project.id==='idolog')social();else if(project.id==='textile')order();else if(project.id==='aciktinmi')map();else motionDemo();updateMotion();
      toggle.setAttribute('aria-label',project.title.split(' — ')[0]+' görseline dön');
      surface.shell.tabIndex=-1;surface.shell.focus();
    }
    function select(next){
      if(destroyed)return;next=Number(next);if(next===index)return;
      close();index=Number.isInteger(next)&&projects[next]?next:-1;const supported=SUPPORTED.has(current()?.id);toggle.hidden=!supported;toggle.disabled=!supported;
      if(current())toggle.setAttribute('aria-label',current().title.split(' — ')[0]+' sahnesini dene');else toggle.removeAttribute('aria-label');
    }
    listen(toggle,'click',()=>{if(destroyed)return;if(playing)close({restoreFocus:true});else activate();});
    listen(document,'visibilitychange',updateMotion);
    const preference=()=>updateMotion();if(media.addEventListener)listen(media,'change',preference);else if(media.addListener){media.addListener(preference);cleanups.push(()=>media.removeListener(preference));}
    const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{if(destroyed)return;visible=entries.some(entry=>entry.isIntersecting);updateMotion();},{threshold:0}):null;observer?.observe(preview);
    const api={select,close,setPaused(value){if(destroyed)return;paused=Boolean(value);updateMotion();},destroy(){if(destroyed)return;close();destroyed=true;cancelAnimation();observer?.disconnect();cleanups.splice(0).forEach(remove=>remove());toggle.remove();mounted.delete(preview);}};
    mounted.set(preview,api);toggle.hidden=true;toggle.disabled=true;return api;
  }
  window.ProjectExperiments=Object.freeze({mount});
})();
