(() => {
  'use strict';
  let serial=0;
  const ICONS={home:'<path d="m3 10 9-7 9 7v10H4V10m5 10v-7h6v7"/>',work:'<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M8 6V4h8v2m-13 7h18m-11 0v3h4v-3"/>',lab:'<path d="m8 5-6 7 6 7m8-14 6 7-6 7m-3-16-2 20"/>',rhythm:'<path d="M4 5h3v3H4zm6 0h3v3h-3zm6 0h3v3h-3zM4 11h3v3H4zm6 0h3v3h-3zm6 0h3v3h-3zM4 17h3v3H4zm6 0h3v3h-3zm6 0h3v3h-3z"/>',github:'<path d="M8 21v-4c-4 1-4-2-5-3m14 7v-4c0-1-.3-1.7-1-2 3-.4 5-2 5-6 0-1.4-.4-2.5-1.2-3.4.2-1 .1-2-.3-3-1.4-.1-2.6.4-3.7 1.2a13 13 0 0 0-7.6 0A6 6 0 0 0 4.5 2.6c-.4 1-.5 2-.3 3C3.4 6.5 3 7.6 3 9c0 4 2 5.6 5 6-.7.3-1 1-1 2v4"/>',linkedin:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7m0-10v.1M11 17v-7m0 3c0-4 6-4 6 0v4"/>'};
  const LABELS={home:'Başlangıç',work:'Çalışmalar',lab:'Sistemler',rhythm:'Kod günlüğü',about:'Ben',contact:'İletişim'};
  const repository='https://github.com/muhammetaycn/muhammet-kirikli-portfolio';
  function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  function icon(name){const n=document.createElementNS('http://www.w3.org/2000/svg','svg');n.setAttribute('viewBox','0 0 24 24');n.setAttribute('aria-hidden','true');n.innerHTML=ICONS[name];return n;}
  function mount({identity,projects,skills,onSurfaceChange=()=>{},canMove=()=>true}){
    const root=el('nav','personal-dock');root.setAttribute('aria-label','Kişisel gezinme');
    const items=[],cleanups=[];let destroyed=false,paused=false,clockTimer=0,closeAnimation=null,closeToken=0,current='home',returnFocus=true;
    const dialog=el('dialog','personal-profile'),profileId='personal-profile-'+(++serial);dialog.id=profileId;dialog.setAttribute('aria-labelledby',profileId+'-title');
    function listen(n,type,fn){n.addEventListener(type,fn);cleanups.push(()=>n.removeEventListener(type,fn));}
    function item(tag,label,name){const n=el(tag,'personal-dock-item');n.setAttribute('aria-label',label);if(name)n.append(icon(name));n.append(el('span','personal-dock-tip',label));root.append(n);return n;}
    ['home','work','lab','rhythm'].forEach(section=>{const a=item('a',LABELS[section],section);a.href='#'+section;a.dataset.section=section;items.push(a);});
    root.append(el('i','personal-dock-divider'));
    const profile=item('button','Muhammet Kırıklı · kişisel panel');profile.type='button';profile.prepend(el('b','personal-dock-monogram',identity.initials||'mk'));profile.setAttribute('aria-haspopup','dialog');profile.setAttribute('aria-controls',profileId);profile.setAttribute('aria-expanded','false');
    [['github','GitHub',identity.github],['linkedin','LinkedIn',identity.linkedin]].forEach(([name,label,url])=>{const a=item('a',label,name);a.classList.add('personal-dock-external');a.href=url;a.target='_blank';a.rel='noopener noreferrer';});
    const banner=el('div','personal-profile-banner');
    banner.innerHTML='<svg viewBox="0 0 360 96" aria-hidden="true"><path d="M-10 72h96l30-30h83l29 29h145M-10 57h64l24-24h136l40 40h116M56-10v30l32 32v54m226-116v41l-38 38v40"/><circle cx="199" cy="42" r="3"/><circle cx="88" cy="72" r="3"/></svg>';
    const closeButton=el('button','personal-profile-close','×');closeButton.type='button';closeButton.setAttribute('aria-label','Kişisel paneli kapat');banner.append(closeButton);
    const body=el('div','personal-profile-body'),avatar=el('span','personal-profile-avatar',identity.initials||'mk');avatar.setAttribute('aria-hidden','true');
    const heading=el('h2','',identity.displayName);heading.id=profileId+'-title';
    const chips=el('div','personal-profile-meta'),time=el('time');chips.append(el('span','','Türkiye'),time);
    const description=el('p','personal-profile-description','Yazılım, sistemler ve tasarım. Web, mobil ve otomasyon çalışmalarım aynı yerde.');
    const metrics=el('div','personal-profile-metrics');[[projects.length,'çalışma'],[skills.length,'yetenek']].forEach(([value,label])=>{const cell=el('div');cell.append(el('strong','',String(value)),el('span','',label));metrics.append(cell);});
    const build=el('a','personal-profile-build');build.href=repository;build.target='_blank';build.rel='noopener noreferrer';const buildTitle=el('b','','Bu portföy'),buildMeta=el('span','','Kaynak ve geliştirme geçmişi ↗');build.append(el('small','','GELİŞTİRME MASASI'),buildTitle,buildMeta);
    const actions=el('div','personal-profile-actions');[['#about','Yeteneklerim'],['#work','Projelerim ↗']].forEach(([href,label])=>{const a=el('a','',label);a.href=href;listen(a,'click',()=>{returnFocus=false;dialog.close();});actions.append(a);});
    const socials=el('div','personal-profile-socials');[['GitHub',identity.github],['LinkedIn',identity.linkedin]].forEach(([label,url])=>{const a=el('a','',label+' ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';socials.append(a);});
    body.append(avatar,heading,chips,description,metrics,build,actions,socials);dialog.append(banner,body);document.body.append(root,dialog);document.body.classList.add('has-personal-dock');
    function clock(){const now=new Date();time.dateTime=now.toISOString();time.textContent=new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit'}).format(now);}
    function activate(id){current=id;root.dataset.section=id;items.forEach(a=>{const active=a.dataset.section===id;a.classList.toggle('is-current',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});profile.classList.toggle('is-current',id==='about'||id==='contact');}
    function stopClose(){closeToken++;if(closeAnimation)closeAnimation.cancel();closeAnimation=null;}
    function close(){
      if(!dialog.open)return;stopClose();const token=closeToken;
      if(paused||!canMove()||typeof dialog.animate!=='function'){dialog.close();return;}
      const animation=dialog.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(10px)'}],{duration:150,easing:'ease-in',fill:'forwards'});closeAnimation=animation;
      animation.finished.then(()=>{if(destroyed||token!==closeToken)return;dialog.close();animation.cancel();closeAnimation=null;}).catch(()=>{});
    }
    function open(){if(destroyed)return;returnFocus=true;stopClose();if(!dialog.open)dialog.showModal();profile.setAttribute('aria-expanded','true');clock();clearInterval(clockTimer);clockTimer=setInterval(()=>{if(!document.hidden)clock();},60000);onSurfaceChange();}
    listen(profile,'click',open);listen(closeButton,'click',close);listen(dialog,'cancel',event=>{event.preventDefault();close();});
    listen(dialog,'close',()=>{if(dialog.open)return;const restore=returnFocus;returnFocus=true;stopClose();clearInterval(clockTimer);clockTimer=0;profile.setAttribute('aria-expanded','false');if(!destroyed){onSurfaceChange();if(restore&&!document.querySelector('dialog[open]'))profile.focus({preventScroll:true});}});
    listen(dialog,'click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
    activate('home');
    if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting&&LABELS[entry.target.id])activate(entry.target.id);},{rootMargin:'-16% 0px -60% 0px',threshold:0});Object.keys(LABELS).forEach(id=>{const section=document.getElementById(id);if(section)observer.observe(section);});cleanups.push(()=>observer.disconnect());}
    function setBuildLog(data){
      if(destroyed||data?.metric!=='repository_commits'||data.repository!==repository||!Array.isArray(data.days))return;
      const days=data.days.filter(day=>day&&Number.isSafeInteger(day.count)&&day.count>=0&&Array.isArray(day.events)),total=days.reduce((sum,day)=>sum+day.count,0),latest=days.flatMap(day=>day.events).find(event=>/^[a-f0-9]{40}$/.test(event?.sha)&&event.url===repository+'/commit/'+event.sha);
      if(!Number.isSafeInteger(total))return;
      const newest=days.at(-1),entry=newest?.events.find(event=>/^[a-f0-9]{40}$/.test(event?.sha)&&event.url===repository+'/commit/'+event.sha)||latest;
      buildTitle.textContent=typeof entry?.title==='string'?entry.title.slice(0,100):'Bu portföy';build.href=entry?.url||repository;buildMeta.textContent=total+' kaynak güncellemesi · GitHub ↗';
    }
    return{open,close,setBuildLog,setPaused(value){paused=Boolean(value);root.classList.toggle('is-paused',paused);dialog.classList.toggle('is-paused',paused);if(paused&&closeAnimation){stopClose();if(dialog.open)dialog.close();}},destroy(){if(destroyed)return;destroyed=true;stopClose();clearInterval(clockTimer);cleanups.splice(0).forEach(fn=>fn());if(dialog.open)dialog.close();root.remove();dialog.remove();document.body.classList.remove('has-personal-dock');}};
  }
  window.PersonalDock=Object.freeze({mount});
})();
