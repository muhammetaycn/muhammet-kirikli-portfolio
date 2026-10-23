(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const data = window.PORTFOLIO;
  if (!data || !data.projects.length) return;
  const projects = data.projects;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let moving = !media.matches;
  let selected = 0;
  let caseIndex = 0;
  let scene;
  let narrator;
  let toastTimer;
  const cleanups = [];
  function element(tag, className, text) { const e = document.createElement(tag); if (className) e.className = className; if (text !== undefined) e.textContent = text; return e; }
  function toast(text) { $('#toast').textContent = text; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2600); }

  function selectProject(index) {
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
  }
  const featured = projects.filter(project => project.featured !== false);
  $('#archive-count').textContent = String(projects.length - featured.length).padStart(2,'0');
  projects.forEach((project, index) => {
    if (project.featured === false) {
      const item = element('button','archive-project');
      const title = element('span','',project.title);
      item.append(element('small','',project.category),title,element('b','','↗'));
      item.addEventListener('click',()=>openProject(index));
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
    hit.addEventListener('click', () => openProject(index));
    hit.addEventListener('focus', () => selectProject(index));
    row.addEventListener('pointerenter', () => selectProject(index));
    row.append(information, arrow, hit); $('#project-list').append(row);
  });
  $('#preview-open').addEventListener('click', () => openProject(selected));
  selectProject(0);

  const projectDialog = $('#project-dialog');
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
  function openProject(index) { paintCase(index); projectDialog.showModal(); document.body.classList.add('modal-open'); }
  document.querySelectorAll('[data-open-project]').forEach(button => button.addEventListener('click', () => openProject(Number(button.dataset.openProject))));
  $('#case-close').addEventListener('click', () => projectDialog.close());
  projectDialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  $('#case-next').addEventListener('click', () => {
    const next = (caseIndex + 1) % projects.length;
    if (moving && $('.case-content').animate) {
      const content = $('.case-content');
      content.animate([{opacity: 1, transform: 'translateY(0)'}, {opacity: 0, transform: 'translateY(-12px)'}], {duration: 130, fill: 'forwards'}).finished.then(() => {
        paintCase(next); content.getAnimations().forEach(a => a.cancel());
        content.animate([{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 320, easing: 'cubic-bezier(.22,.75,.2,1)'});
      });
    } else paintCase(next);
  });

  const menu = $('#menu-dialog');
  $('#menu-open').addEventListener('click', () => { menu.showModal(); document.body.classList.add('modal-open'); });
  $('#menu-close').addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => document.body.classList.remove('modal-open'));
  menu.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => menu.close()));
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
      ['#tool-a','#tool-b','#tool-c'].forEach((id,i) => $(id).textContent = capability.tools[i] || capability.tools[0]);
      $('.stack-instrument').dataset.selection = String(index);
    });
    $('#capability-list').append(row);
  });
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
  $('#shape-reset').addEventListener('click', () => { if (scene && scene.resetShape) scene.resetShape(); });
  document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-scene]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    if (scene) scene.setMode(button.dataset.scene);
    $('.art-caption b').textContent = ({flow:'001 — BAĞLANTILAR',structure:'002 — YAPININ İÇİ',signal:'003 — SİNYALİN İZİ'})[button.dataset.scene];
  }));
  try { if (window.SystemLab) cleanups.push(window.SystemLab.mount()); } catch { $('#lab-result').textContent = 'Demo şu anda yüklenemedi. Proje detaylarından akışı inceleyebilirsin.'; }
  function applyMotion() {
    document.body.classList.toggle('motion-paused', !moving);
    $('#motion-toggle').setAttribute('aria-pressed', String(moving));
    $('#motion-toggle').setAttribute('aria-label', moving ? 'Hareketi durdur' : 'Hareketi aç');
    $('#motion-toggle span').textContent = moving ? 'Ⅱ' : '▷';
    document.documentElement.style.scrollBehavior = moving ? 'smooth' : 'auto';
    if (scene) scene.setPaused(!moving);
    if (narrator) narrator.setPaused(!moving);
    const svg = $('#lab-stage');
    if (!moving && svg.pauseAnimations) svg.pauseAnimations();
    if (moving && svg.unpauseAnimations) svg.unpauseAnimations();
  }
  $('#motion-toggle').addEventListener('click', () => { moving = !moving; applyMotion(); });
  media.addEventListener('change', e => { moving = !e.matches; applyMotion(); });
  applyMotion();

  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); reveal.unobserve(entry.target); } }); }, {threshold: .08, rootMargin: '0px 0px -25px 0px'});
    document.querySelectorAll('.reveal').forEach(node => reveal.observe(node));
    document.body.classList.add('js-ready');
    cleanups.push(() => reveal.disconnect());
  }
  let scrollFrame = 0;
  function paintScroll() {
    scrollFrame = 0;
    const range = document.documentElement.scrollHeight - innerHeight;
    $('#page-progress').style.transform = `scaleX(${range > 0 ? scrollY / range : 0})`;
    if (moving && innerWidth > 760) $('.hero-art').style.transform = `translateY(${Math.min(65, scrollY * .12)}px)`;
    else $('.hero-art').style.transform = '';
  }
  function onScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(paintScroll); }
  addEventListener('scroll', onScroll, {passive: true});
  paintScroll();

  async function renderRhythm() {
    const DAY = 86400000;
    const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Istanbul', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(new Date());
    const part = name => parts.find(p => p.type === name).value;
    const end = Date.parse(`${part('year')}-${part('month')}-${part('day')}T00:00:00Z`);
    const dateLabel = new Intl.DateTimeFormat('tr-TR', {timeZone:'UTC', day:'numeric', month:'long', year:'numeric'});
    let daily = new Map();
    try {
      const response = await fetch('data/activity.json');
      if (!response.ok) throw new Error('Activity unavailable');
      const json = await response.json();
      if (Array.isArray(json.days) && json.days.length <= 20000) {
        for (const row of json.days) {
          if (!row || !/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !Number.isSafeInteger(row.count) || row.count < 0) continue;
          const stamp = Date.parse(row.date + 'T00:00:00Z');
          if (!Number.isFinite(stamp) || new Date(stamp).toISOString().slice(0,10) !== row.date) continue;
          const count = (daily.get(row.date) || 0) + row.count;
          if (Number.isSafeInteger(count)) daily.set(row.date, count);
        }
      }
    } catch { /* The honest empty state remains available offline. */ }
    const dates = Array.from({length:364}, (_,i) => new Date(end - (363-i)*DAY).toISOString().slice(0,10));
    const visible = dates.filter(date => daily.has(date));
    const maximum = Math.max(1, ...visible.map(date => daily.get(date)));
    const active = visible.filter(date => daily.get(date)>0).length;
    let chosen = 363;
    const grid = $('#rhythm-grid');
    const cells = dates.map((date, index) => {
      const count = daily.get(date);
      const cell = element('button', 'rhythm-cell');
      cell.type = 'button'; cell.tabIndex = index === chosen ? 0 : -1;
      cell.dataset.level = count ? String(Math.ceil(count / maximum * 4)) : '0';
      const label = dateLabel.format(new Date(date+'T00:00:00Z')) + (count === undefined ? ' · Kayıt paylaşılmadı.' : ` · ${count} kayıtlı etkinlik.`);
      cell.title = label; cell.setAttribute('aria-label',label);
      cell.addEventListener('click', () => { cells[chosen].tabIndex=-1; chosen=index; cell.tabIndex=0; $('#rhythm-detail').textContent=label; });
      cell.addEventListener('keydown',event=>{
        const moves={ArrowRight:7,ArrowLeft:-7,ArrowDown:1,ArrowUp:-1};
        if(!(event.key in moves)) return;
        event.preventDefault(); const next=Math.max(0,Math.min(363,index+moves[event.key]));
        cells[chosen].tabIndex=-1; chosen=next; cells[next].tabIndex=0; cells[next].focus(); $('#rhythm-detail').textContent=cells[next].getAttribute('aria-label');
      });
      return cell;
    });
    grid.replaceChildren(...cells);
    if (window.ActivityNarrator) {
      narrator = window.ActivityNarrator.mount({panel:$('.rhythm-panel'), grid, scroll:$('.rhythm-scroll'), reducedMotion:media.matches});
      narrator.setPaused(!moving);
    }
    if(visible.length) { $('#rhythm-summary').textContent = `${active} üretim günü / son 364 gün`; $('#rhythm-detail').textContent='Yoğunluk kayıtlı etkinlik sayısıdır; süre veya iş kalitesi ölçümü değildir.'; }
  }
  renderRhythm();
  addEventListener('pagehide', () => { cleanups.forEach(cleanup=>{ if(typeof cleanup==='function') cleanup(); }); if(scene) scene.destroy(); if(narrator) narrator.destroy(); removeEventListener('scroll',onScroll); if(scrollFrame) cancelAnimationFrame(scrollFrame); }, {once:true});
})();
