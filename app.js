(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const data = window.PORTFOLIO;
  if (!data || !data.projects.length) return;
  const projects = data.projects;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let moving = !media.matches;
  let userPaused = false;
  let selected = 0;
  let caseIndex = 0;
  let scene;
  let narrator;
  let cursor;
  let deck;
  let computerScene;
  let capabilityMap;
  let systemLab;
  let personalDock;
  let projectMotion;
  let motionFilm;
  let portfolioStage;
  let menuMotion;
  let projectGallery;
  let requestedCaseIndex=0;
  const projectExperiences={idolog:8,textile:10,aciktinmi:11,portfolio:24,event:9,gorgez:12,content:13,paulukizlar:3,dm:15,community:14};
  let toastTimer;
  let scrollFrame = 0;
  const cleanups = [];
  if(window.UIIcons){const uiIcons=window.UIIcons.mount();cleanups.push(()=>uiIcons.destroy());}
  function element(tag, className, text) { const e = document.createElement(tag); if (className) e.className = className; if (text !== undefined) e.textContent = text; return e; }
  function toast(text) { $('#toast').textContent = text; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2600); }

  function selectProject(index) {
    if(index!==selected)projectGallery?.prepare();
    selected = index;
    const project = projects[index];
    document.querySelectorAll('.project-row').forEach(row => row.classList.toggle('is-active', row.dataset.project === project.id));
    $('#preview-category').textContent = project.category.toLocaleUpperCase('tr-TR');
    $('#preview-index').textContent = `${project.number} / ${String(featured.length).padStart(2, '0')}`;
    $('#preview-title').textContent = project.title;
    $('#preview-short').textContent = project.short;
    $('#preview-status').textContent = project.status.toLocaleUpperCase('tr-TR');
    $('.project-preview').dataset.project = project.visual || project.id;
    $('#preview-open').setAttribute('aria-label', project.title + ' detaylarını aç');
    projectGallery?.show(index);
  }
  const featured = projects.filter(project => project.featured !== false);
  $('#archive-count').textContent = String(projects.length - featured.length).padStart(2,'0');
  projects.forEach((project, index) => {
    if (project.featured === false) {
      const item = element('button','archive-project');
      const title = element('span','',project.title);
      item.append(element('small','',project.category),title,element('b','','↗'));
      item.addEventListener('click',()=>openProject(index,item));
      $('#project-archive-list').append(item);
      return;
    }
    const row = element('article', 'project-row');
    row.dataset.project = project.id;
    row.append(element('span', 'project-number', project.number));
    const information = element('div', 'project-info');
    information.append(element('h3', '', project.title), element('p', '', project.short));
    const tags = element('div', 'project-tags');
    project.stack.slice(0, 3).forEach(name => tags.append(element('span', '', name)));
    information.append(tags);
    const arrow = element('span', 'project-arrow', '↗'); arrow.setAttribute('aria-hidden', 'true');
    const hit = element('button', 'project-hit'); hit.type = 'button'; hit.setAttribute('aria-label', project.title + ' detaylarını aç');
    hit.addEventListener('click', () => openProject(index,hit));
    hit.addEventListener('focus', () => selectProject(index));
    row.addEventListener('pointerenter', () => selectProject(index));
    row.append(information, arrow, hit); $('#project-list').append(row);
  });
  $('#preview-open').addEventListener('click', () => openProject(selected,$('.project-preview')));
  selectProject(0);
  if(window.ProjectGallery){projectGallery=window.ProjectGallery.mount({preview:$('.project-preview'),projects,onSelect:selectProject,canMove:()=>moving});projectGallery.show(selected);cleanups.push(()=>projectGallery.destroy());}

  const projectDialog = $('#project-dialog');
  if(window.ProjectMotion){projectMotion=window.ProjectMotion.mount({dialog:projectDialog,content:$('.case-content'),heading:$('.case-heading'),preview:$('.project-preview'),canMove:()=>moving});cleanups.push(()=>projectMotion.destroy());}
  function paintCase(index) {
    caseIndex = index;
    const project = projects[index];
    $('#case-index').textContent = project.number + ' / SEÇİLİ ÇALIŞMA';
    $('#case-category').textContent = project.category.toLocaleUpperCase('tr-TR');
    $('#case-title').textContent = project.title;
    $('#case-summary').textContent = project.summary;
    $('#case-external').hidden = !project.url;
    if(project.url) $('#case-external').href = project.url;
    $('#case-problem').textContent = project.problem;
    $('#case-solution').textContent = project.solution;
    $('#case-note').textContent = project.scopeNote;
    $('#case-status').textContent = project.status.toLocaleUpperCase('tr-TR');
    $('#case-next-title').textContent = projects[(index + 1) % projects.length].title;
    $('#case-stack').replaceChildren(...project.stack.map(name => element('span', '', name)));
    $('#case-features').replaceChildren(...project.features.map(feature => element('li', '', feature)));
    $('#case-flow').replaceChildren(...project.flow.map((step, i) => { const node = element('div'); node.append(element('span', '', String(i + 1).padStart(2, '0')), element('b', '', step)); return node; }));
    projectDialog.scrollTop = 0;
  }
  function openProject(index,source=document.activeElement) {
    requestedCaseIndex=index;
    projectGallery?.settle();
    if(projectMotion)projectMotion.open({project:projects[index],render:()=>paintCase(index),source});
    else {paintCase(index);projectDialog.showModal();}
    syncSurfaces();
  }
  function launchExperience(index){
    if(!computerScene)return;
    if(projectDialog.open)projectDialog.close();
    deck?.select(1,true);
    computerScene.runKey(index);
    computerScene.openExpanded();
    syncSurfaces();
  }
  $('#case-demo').addEventListener('click',()=>launchExperience(projectExperiences[projects[caseIndex].id]??3));
  document.querySelectorAll('[data-open-project]').forEach(button => button.addEventListener('click', () => openProject(Number(button.dataset.openProject),button)));
  $('#case-close').addEventListener('click', () => {if(projectMotion)projectMotion.close();else projectDialog.close();});
  projectDialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); syncSurfaces(); });
  $('#case-next').addEventListener('click', () => {
    if(!projectDialog.open)return;
    requestedCaseIndex=(requestedCaseIndex+1)%projects.length;
    const next=requestedCaseIndex;
    if(projectMotion)projectMotion.replace({project:projects[next],render:()=>paintCase(next)});
    else paintCase(next);
  });

  const menu = $('#menu-dialog');
  if(window.MenuMotion){menuMotion=window.MenuMotion.mount({dialog:menu,canMove:()=>moving});cleanups.push(()=>menuMotion.destroy());}
  $('#menu-open').addEventListener('click', () => { if(menuMotion)menuMotion.open($('#menu-open'));else menu.showModal();syncSurfaces(); });
  $('#menu-close').addEventListener('click', () => {if(menuMotion)menuMotion.close();else menu.close();});
  menu.addEventListener('close', () => { document.body.classList.remove('modal-open'); syncSurfaces(); });
  if(!menuMotion)menu.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => menu.close()));
  $('#back-top').addEventListener('click', () => window.scrollTo({top: 0, behavior: moving ? 'smooth' : 'instant'}));

  data.capabilities.forEach((capability, index) => {
    const row = element('details', 'capability-item');
    row.open = index === 0;
    const summary = element('summary');
    summary.append(element('span', '', String(index + 1).padStart(2, '0')), element('h3', '', capability.title), element('b', '', '+'));
    const copy = element('div', 'capability-copy');
    copy.append(element('p', '', capability.description));
    const tools = element('div', 'capability-tools');
    capability.tools.forEach(tool => tools.append(element('span', '', tool)));
    copy.append(tools); row.append(summary, copy);
    row.addEventListener('toggle', () => {
      if (!row.open) return;
      document.querySelectorAll('.capability-item').forEach(other => { if (other !== row) other.open = false; });
      capabilityMap?.select(index);
    });
    $('#capability-list').append(row);
  });
  if(window.CapabilityMap){capabilityMap=window.CapabilityMap.mount({host:$('#capability-map'),capabilities:data.capabilities,projects,onProject:openProject});cleanups.push(()=>capabilityMap?.destroy());}
  $('#source-link').href = 'https://github.com/muhammetaycn/muhammet-kirikli-portfolio';
  const skills = data.linkedinSkills || [];
  $('#skill-count').textContent = String(skills.length);
  skills.forEach(skill => $('#skill-index').append(element('span','',skill)));
  (data.education || []).forEach(item=>{
    const row=element('article','background-item');
    row.append(element('small','',item.period || item.dates || item.date || ''),element('h4','',item.institution || item.school || ''),element('p','',item.degree || item.program || item.description || ''));
    $('#education-list').append(row);
  });
  (data.experience || []).forEach(item=>{
    const row=element('article','background-item');
    row.append(element('small','',item.period || item.duration || ''),element('h4','',item.company || item.organization || ''),element('p','',item.description || item.role || ''));
    $('#experience-list').append(row);
  });
  $('#footer-year').textContent = new Date().getFullYear();
  function clock() { $('#local-clock').textContent = 'TÜRKİYE / ' + new Intl.DateTimeFormat('tr-TR', {timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', hour12: false}).format(new Date()); }
  clock(); const clockTimer = setInterval(clock, 60000);
  cleanups.push(() => clearInterval(clockTimer));

  try { if (window.KineticScene) scene = window.KineticScene.mount($('#kinetic-canvas'), {reducedMotion: media.matches}); }
  catch { $('.art-hint').textContent = 'BİR FİKRİN FARKLI BİÇİMLERİ.'; }
  try { if (window.SymbioteCursor) cursor = window.SymbioteCursor.mount({reducedMotion:media.matches}); }
  catch { /* Native pointer remains available if the decorative layer fails. */ }
  try {
    if(window.ComputerScene) computerScene=window.ComputerScene.mount($('#computer-host'),{
      reducedMotion:media.matches,
      onActivity:()=>deck?.activity(),
      onPresentation:value=>deck?.setPresentation(value),
      onProject:value=>{const index=typeof value==='number'?value:projects.findIndex(project=>project.id===value);if(index>=0&&index<projects.length)openProject(index);}
    });
    if(window.HeroDeck&&computerScene) deck=window.HeroDeck.mount({art:$('.hero-art'),ribbon:$('#ribbon-host'),computer:$('#computer-host'),scene,computerScene,reducedMotion:media.matches});
  } catch(error) { console.error('Computer scene:',error); }
  $('#shape-reset').addEventListener('click', () => { if (scene && scene.resetShape) scene.resetShape(); });
  document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-scene]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    if (scene) scene.setMode(button.dataset.scene);
    $('.art-caption b').textContent = ({flow:'001 — BAĞLANTILAR',structure:'002 — YAPININ İÇİ',signal:'003 — SİNYALİN İZİ'})[button.dataset.scene];
  }));
  try { if (window.SystemLab){systemLab=window.SystemLab.mount();cleanups.push(systemLab);} } catch { $('#lab-result').textContent = 'Demo şu anda yüklenemedi. Proje detaylarından akışı inceleyebilirsin.'; }
  const labExperiences={fullstack:[4,'API ekranını aç ↗'],automation:[13,'Kuyruğa gir ↗'],mobile:[11,'Haritayı aç ↗'],event:[9,'Onayı yönet ↗'],textile:[10,'Siparişi taşı ↗'],content:[13,'Kuyruğu düzenle ↗'],community:[14,'Kuralı dene ↗']};
  document.querySelectorAll('[data-lab-project]').forEach(button=>button.addEventListener('click',()=>{$('#lab-explore').textContent=(labExperiences[button.dataset.labProject]||labExperiences.fullstack)[1];}));
  $('#lab-explore').addEventListener('click',()=>{const selected=document.querySelector('[data-lab-project][aria-pressed="true"]')?.dataset.labProject||'fullstack';launchExperience((labExperiences[selected]||labExperiences.fullstack)[0]);});
  if(window.PersonalDock){personalDock=window.PersonalDock.mount({identity:data.identity,projects,skills,onSurfaceChange:syncSurfaces,canMove:()=>moving});cleanups.push(()=>personalDock.destroy());}
  if(window.MotionFilm){motionFilm=window.MotionFilm.mount({canMove:()=>moving});cleanups.push(()=>motionFilm.destroy());}
  if(window.PortfolioStage){portfolioStage=window.PortfolioStage.mount({canMove:()=>moving});cleanups.push(()=>portfolioStage.destroy());}
  function syncSurfaces() {
    const covered = Boolean(document.querySelector('dialog[open]'));
    document.body.classList.toggle('modal-open',covered);
    document.body.classList.toggle('surface-covered', covered);
    const ownComputer=Boolean(document.querySelector('dialog.cos-dialog[open]'))&&!document.querySelector('dialog[open]:not(.cos-dialog)');
    if(deck) deck.setPaused(!moving||covered,moving&&ownComputer);
    else if (scene) scene.setPaused(!moving || covered);
    if (narrator) narrator.setPaused(!moving || covered);
    if (cursor) cursor.setPaused(!moving);
    capabilityMap?.setPaused(!moving||covered);
    systemLab?.setPaused?.(!moving||covered);
    personalDock?.setPaused(!moving);
    projectMotion?.setPaused(!moving);
    motionFilm?.setPaused(!moving);
    portfolioStage?.setPaused(!moving);
    menuMotion?.setPaused(!moving);
    projectGallery?.setPaused(!moving||covered);
  }
  function applyMotion() {
    document.body.classList.toggle('motion-paused', !moving);
    if(!moving)document.body.classList.add('intro-settled');
    $('#motion-toggle').setAttribute('aria-pressed', String(moving));
    $('#motion-toggle').setAttribute('aria-label', moving ? 'Hareketi durdur' : 'Hareketi aç');
    $('#motion-toggle span').textContent = moving ? 'Ⅱ' : '▷';
    document.documentElement.style.scrollBehavior = moving ? 'smooth' : 'auto';
    syncSurfaces();
    const svg = $('#lab-stage');
    if (!moving && svg.pauseAnimations) svg.pauseAnimations();
    if (moving && svg.unpauseAnimations) svg.unpauseAnimations();
    onScroll();
  }
  $('#motion-toggle').addEventListener('click', () => { userPaused = moving; moving = !userPaused && !media.matches; applyMotion(); });
  media.addEventListener('change', e => { computerScene?.setReducedMotion(e.matches); moving = !e.matches && !userPaused; applyMotion(); });
  applyMotion();
  const dialogObserver=new MutationObserver(syncSurfaces);
  dialogObserver.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  cleanups.push(()=>dialogObserver.disconnect());

  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); reveal.unobserve(entry.target); } }); }, {threshold: .08, rootMargin: '0px 0px -25px 0px'});
    document.querySelectorAll('.reveal').forEach(node => reveal.observe(node));
    document.body.classList.add('js-ready');
    cleanups.push(() => reveal.disconnect());
  }
  function paintScroll() {
    scrollFrame = 0;
    const range = document.documentElement.scrollHeight - innerHeight;
    $('#page-progress').style.transform = `scaleX(${Math.max(0, Math.min(1, range > 0 ? scrollY / range : 0))})`;
    if (innerWidth <= 760 || media.matches) $('.hero-art').style.transform = '';
    else if (moving) $('.hero-art').style.transform = `translateY(${Math.max(0, Math.min(65, scrollY * .12))}px)`;
  }
  function onScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(paintScroll); }
  addEventListener('scroll', onScroll, {passive: true});
  addEventListener('resize', onScroll, {passive: true});
  cleanups.push(()=>removeEventListener('resize',onScroll));
  if(typeof ResizeObserver==='function'){const scrollObserver=new ResizeObserver(onScroll);scrollObserver.observe(document.documentElement);cleanups.push(()=>scrollObserver.disconnect());}
  onScroll();

  async function renderRhythm() {
    const DAY = 86400000;
    const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Istanbul', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(new Date());
    const part = name => parts.find(p => p.type === name).value;
    const end = Date.parse(`${part('year')}-${part('month')}-${part('day')}T00:00:00Z`);
    const dateLabel = new Intl.DateTimeFormat('tr-TR', {timeZone:'UTC', day:'numeric', month:'long', year:'numeric'});
    let daily = new Map(), events = new Map(), buildLog = false;
    const repository='https://github.com/muhammetaycn/muhammet-kirikli-portfolio';
    try {
      const response = await fetch('data/activity.json?v=20261028b');
      if (!response.ok) throw new Error('Activity unavailable');
      const json = await response.json();
      personalDock?.setBuildLog(json);
      buildLog=json.metric==='repository_commits'&&json.repository===repository;
      if (Array.isArray(json.days) && json.days.length <= 20000) {
        for (const row of json.days) {
          if (!row || !/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !Number.isSafeInteger(row.count) || row.count < 0) continue;
          const stamp = Date.parse(row.date + 'T00:00:00Z');
          if (!Number.isFinite(stamp) || new Date(stamp).toISOString().slice(0,10) !== row.date) continue;
          const count = (daily.get(row.date) || 0) + row.count;
          if (Number.isSafeInteger(count)) daily.set(row.date, count);
          if(buildLog&&Array.isArray(row.events))events.set(row.date,row.events.filter(event=>event&&/^[a-f0-9]{40}$/.test(event.sha)&&event.url===repository+'/commit/'+event.sha&&typeof event.title==='string').slice(0,50));
        }
      }
    } catch { /* The honest empty state remains available offline. */ }
    const dates = Array.from({length:364}, (_,i) => new Date(end - (363-i)*DAY).toISOString().slice(0,10));
    const visible = dates.filter(date => daily.has(date));
    const maximum = Math.max(1, ...visible.map(date => daily.get(date)));
    const active = visible.filter(date => daily.get(date)>0).length;
    let chosen = 363;
    const grid = $('#rhythm-grid');
    const records=element('div','rhythm-records');records.hidden=true;$('.rhythm-panel').append(records);
    function showRecords(date){
      const entries=events.get(date)||[];records.hidden=!entries.length;
      const heading=element('p','',dateLabel.format(new Date(date+'T00:00:00Z'))+' · GitHub kaydı');
      records.replaceChildren(heading,...entries.slice(0,5).map(event=>{const link=element('a','',event.title.slice(0,180));link.href=event.url;link.target='_blank';link.rel='noopener noreferrer';link.append(element('small','',event.sha.slice(0,7)+' ↗'));return link;}));
    }
    const cells = dates.map((date, index) => {
      const count = daily.get(date);
      const cell = element('button', 'rhythm-cell');
      cell.type = 'button'; cell.tabIndex = index === chosen ? 0 : -1;
      cell.dataset.level = count ? String(Math.ceil(count / maximum * 4)) : '0';
      const label = dateLabel.format(new Date(date+'T00:00:00Z')) + (count === undefined ? ' · Kayıt paylaşılmadı.' : ` · ${count} ${buildLog?'GitHub değişikliği':'kayıtlı etkinlik'}.`);
      cell.title = label; cell.setAttribute('aria-label',label);
      cell.addEventListener('click', () => { cells[chosen].tabIndex=-1; chosen=index; cell.tabIndex=0; $('#rhythm-detail').textContent=label;showRecords(date); });
      cell.addEventListener('keydown',event=>{
        const moves={ArrowRight:7,ArrowLeft:-7,ArrowDown:1,ArrowUp:-1};
        if(!(event.key in moves)) return;
        event.preventDefault(); const next=Math.max(0,Math.min(363,index+moves[event.key]));
        cells[chosen].tabIndex=-1; chosen=next; cells[next].tabIndex=0; cells[next].focus(); $('#rhythm-detail').textContent=cells[next].getAttribute('aria-label');showRecords(dates[next]);
      });
      return cell;
    });
    grid.replaceChildren(...cells);
    if (window.ActivityNarrator) {
      narrator = window.ActivityNarrator.mount({panel:$('.rhythm-panel'), grid, scroll:$('.rhythm-scroll'), reducedMotion:media.matches});
      syncSurfaces();
    }
    if(visible.length) {
      const total=visible.reduce((sum,date)=>sum+daily.get(date),0);
      $('#rhythm-summary').textContent=buildLog?`${active} geliştirme günü · ${total} GitHub kaydı`:`${active} üretim günü / son 364 gün`;
      $('#rhythm-detail').textContent=buildLog?'Bu portföyün kaynak geçmişi. Kayıtlı bir günü seç; değişikliği aç.':'Yoğunluk kayıtlı etkinlik sayısıdır; süre veya iş kalitesi ölçümü değildir.';
      grid.setAttribute('aria-label',buildLog?'Portföy geliştirme günleri':'AI ile üretim günleri');
      showRecords(visible.at(-1));
    }
  }
  renderRhythm();
  addEventListener('pagehide', function cleanupPage(event) { if(event.persisted)return;removeEventListener('pagehide',cleanupPage);cleanups.forEach(cleanup=>{ if(typeof cleanup==='function') cleanup(); }); if(deck) deck.destroy(); if(computerScene) computerScene.destroy(); if(scene) scene.destroy(); if(narrator) narrator.destroy(); if(cursor) cursor.destroy(); removeEventListener('scroll',onScroll); if(scrollFrame) cancelAnimationFrame(scrollFrame); });
})();
