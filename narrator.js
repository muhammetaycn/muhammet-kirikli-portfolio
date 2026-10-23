(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const mounted = new WeakMap();
  const thoughts = [
    'ben Muhammet. Bir saniye… önce ismimi yazayım.',
    'İlk harf tamam. Şimdi diğer karelere geçiyorum.',
    'QR’dan gelen bir fotoğrafı, onaydan sahneye taşıyorum.',
    'Bir olay geliyor. Bot doğru kuralı ve rolü buluyor.',
    'Tekstil sahasındaki işleri dijital sistemlere bağlıyorum.',
    'Bir fikri parçalara ayırıyorum. Sonra tekrar bağlıyorum.',
    'Turuncu izler birazdan silinecek. Alttaki günlük ayrı.',
    'Kodu yazmak kadar, parçaların birlikte çalışması da güzel.'
  ];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function element(name, className, text) {
    const node = document.createElement(name);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function vector(name, attributes) {
    const node = document.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attributes || {})) node.setAttribute(key, String(value));
    return node;
  }
  function luci() {
    const svg = vector('svg', {viewBox: '0 0 112 112', class: 'narrator-luci', 'aria-hidden': 'true'});
    const tail = vector('g', {class: 'luci-tail'});
    const curl = 'M 35 75 C 7 84, 3 57, 15 49 C 26 42, 32 53, 23 58';
    tail.append(vector('path', {d: curl, fill: 'none', stroke: '#8b8781', 'stroke-opacity': '.65', 'stroke-width': '7', 'stroke-linecap': 'round'}));
    tail.append(vector('path', {d: curl, fill: 'none', stroke: '#050506', 'stroke-width': '4.6', 'stroke-linecap': 'round'}));
    tail.append(vector('path', {d: 'M 20 50 L 30 56 L 19 64 Z', class: 'luci-outline'}));
    svg.append(tail);
    const legs = vector('g', {class: 'luci-legs'});
    legs.append(vector('path', {d: 'M 39 78 L 34 96 L 25 100 Q 21 103 29 104 L 41 103 L 48 84 M 56 82 L 57 98 L 65 102 Q 69 105 60 105 L 50 103 L 48 84', class: 'luci-outline'}));
    svg.append(legs);
    svg.append(vector('path', {d: 'M 31 49 C 25 40 25 29 30 22 L 40 32 C 44 29 49 28 53 29 L 61 17 Q 66 22 64 35 C 69 39 70 44 69 49 L 79 52 Q 85 55 78 59 L 69 61 C 74 72 69 84 59 88 C 43 94 29 85 29 72 C 27 63 29 55 31 49 Z', class: 'luci-outline'}));
    const eye = vector('g', {class: 'luci-eye'});
    eye.append(vector('ellipse', {cx: 51, cy: 47, rx: '12.5', ry: '15.5', fill: '#e7e3db'}));
    const pupil = vector('ellipse', {cx: 54, cy: 47, rx: '3', ry: '8.5', fill: '#050506', class: 'luci-pupil'});
    eye.append(pupil);
    svg.append(eye);
    svg.append(vector('path', {d: 'M 65 61 Q 71 63 77 58 M 70 62 L 71 66 L 74 61', fill: 'none', stroke: '#e7e3db', 'stroke-width': '1.3', 'stroke-linecap': 'round', class: 'luci-mouth'}));
    const arm = vector('g', {class: 'luci-arm'});
    arm.append(vector('path', {d: 'M 62 72 Q 71 76 79 73 L 84 69 M 79 73 L 85 74 M 79 73 L 82 78', fill: 'none', stroke: '#9a958b', 'stroke-width': '1.5', 'stroke-linecap': 'round'}));
    svg.append(arm);
    return {svg, pupil};
  }



  // A 5×7 font uses the same column-major indices as the real activity grid.
  // These temporary footprints never change a cell's recorded activity level.
  const FONT = Object.freeze({
    A: ['01110','10001','10001','11111','10001','10001','10001'],
    B: ['11110','10001','10001','11110','10001','10001','11110'],
    C: ['01111','10000','10000','10000','10000','10000','01111'],
    D: ['11110','10001','10001','10001','10001','10001','11110'],
    E: ['11111','10000','10000','11110','10000','10000','11111'],
    I: ['11111','00100','00100','00100','00100','00100','11111'],
    K: ['10001','10010','10100','11000','10100','10010','10001'],
    N: ['10001','11001','11001','10101','10011','10011','10001'],
    O: ['01110','10001','10001','10001','10001','10001','01110'],
    S: ['01111','10000','10000','01110','00001','00001','11110'],
    Y: ['10001','10001','01010','00100','00100','00100','00100'],
    H: ['10001','10001','10001','11111','10001','10001','10001'],
    L: ['10000','10000','10000','10000','10000','10000','11111'],
    M: ['10001','11011','10101','10101','10001','10001','10001'],
    R: ['11110','10001','10001','11110','10100','10010','10001'],
    T: ['11111','00100','00100','00100','00100','00100','00100'],
    U: ['10001','10001','10001','10001','10001','10001','01110'],
    '+': ['00000','00100','00100','11111','00100','00100','00000']
  });
  const SCENE_LENGTH = 60000;
  const DRAW_END = 34400;
  const FADE_START = 52200;
  const FADE_LENGTH = 7200;
  const FADE_SPREAD = 600;

  function compileMessage(text) {
    const width = [...text].reduce((sum, letter) => sum + (letter === ' ' ? 3 : 6), 0) - 1;
    let column = Math.floor((52 - width) / 2);
    const route = [];
    let letterNumber = 0;
    for (const letter of text) {
      if (letter === ' ') { column += 3; continue; }
      const glyph = FONT[letter];
      const glyphRoute = [];
      // Alternate top-to-bottom and bottom-to-top writing. Luci crosses the
      // depth of the panel instead of moving along a single horizontal rail.
      for (let line = 0; line < 7; line++) {
        const row = letterNumber % 2 ? 6 - line : line;
        const columns = Array.from({length: 5}, (_, index) => index);
        if ((line + letterNumber) % 2) columns.reverse();
        for (const offset of columns) {
          if (glyph[row][offset] === '1') glyphRoute.push({column: column + offset, row, letter});
        }
      }
      glyphRoute.forEach((point, index) => route.push({...point, index: point.column * 7 + point.row, beat: index === 0 && route.length ? 110 : 0}));
      column += 6;
      letterNumber++;
    }
    let previous = {column: 0, row: 6};
    route.forEach(point => {
      const distance = Math.hypot(point.column - previous.column, point.row - previous.row);
      point.duration = clamp(190 + Math.sqrt(distance) * 25, 180, 310);
      previous = point;
    });
    const beatTime = route.reduce((sum, point) => sum + point.beat, 0);
    const target = DRAW_END - 500 - beatTime;
    // Fit the drawing to its score while keeping each individual jump visible.
    for (let pass = 0; pass < 8; pass++) {
      const difference = target - route.reduce((sum, point) => sum + point.duration, 0);
      const adjustable = route.filter(point => difference > 0 ? point.duration < 310 : point.duration > 180);
      if (!adjustable.length || Math.abs(difference) < .01) break;
      adjustable.forEach(point => { point.duration = clamp(point.duration + difference / adjustable.length, 180, 310); });
    }
    let cursor = 500;
    route.forEach(point => {
      cursor += point.beat;
      point.start = cursor;
      point.end = cursor + point.duration;
      cursor = point.end;
    });
    return Object.freeze({text, width, route, end: cursor});
  }
  const scores = [compileMessage('MUHAMMET'), compileMessage('KIRIKLI')];

  function mount(options) {
    const {panel, grid, scroll} = options || {};
    if (!panel || !grid || !scroll) throw new Error('ActivityNarrator: panel, grid ve scroll gerekli.');
    if (mounted.has(panel)) mounted.get(panel).destroy();
    const hadClass = panel.classList.contains('has-activity-narrator');
    panel.classList.add('has-activity-narrator');
    const root = element('div', 'activity-narrator');
    root.dataset.ready = 'false';
    root.dataset.active = 'false';
    root.dataset.duration = String(SCENE_LENGTH * scores.length);
    const shadow = element('span', 'narrator-shadow');
    const tether = vector('svg', {class: 'narrator-tether', 'aria-hidden': 'true'});
    const tetherPath = vector('path', {fill: 'none'});
    tether.append(tetherPath);
    const character = element('div', 'narrator-character');
    character.setAttribute('aria-hidden', 'true');
    const drawing = luci();
    character.append(drawing.svg);
    const bubble = element('button', 'narrator-thought');
    bubble.type = 'button';
    const terminal = element('span', 'narrator-terminal');
    terminal.setAttribute('aria-hidden', 'true');
    const header = element('span', 'narrator-terminal-bar');
    header.append(element('i', 'narrator-led'), element('span', '', 'iç ses'), element('span', 'narrator-counter'));
    const line = element('span', 'narrator-line');
    const copy = element('span', 'narrator-copy');
    line.append(copy, element('span', 'narrator-caret', '▍'));
    terminal.append(header, line, element('span', 'narrator-tip', 'sonraki düşünce ↵'));
    bubble.append(terminal);
    const helper = element('span', 'narrator-sr', 'Luci bütün kareler arasında zıplayarak geçici turuncu izlerle MUHAMMET ve KIRIKLI yazar. Her yazı tamamlandıktan sonra okunabilmesi için bekler ve yavaşça silinir. İki dakikalık döngü etkinlik kayıtlarını değiştirmez. Balona tıklayarak veya Enter tuşuyla sonraki düşünceyi okuyabilirsin.');
    const announcement = element('span', 'narrator-sr');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    root.append(shadow, tether, character, bubble, helper, announcement);
    panel.append(root);
    const counter = header.querySelector('.narrator-counter');
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = Boolean(options.reducedMotion) || media.matches;
    let paused = false;
    let visible = false;
    let destroyed = false;
    let frame = 0;
    let layoutFrame = 0;
    let previous = 0;
    let time = 0;
    let sceneTime = 0;
    let scene = 0;
    let routeIndex = 0;
    let dirty = true;
    let points = [];
    let currentIndex = 6;
    let currentPhase = '';
    let direction = 1;
    let box = {width: 0, bubbleWidth: 250, bubbleHeight: 108, size: 44, gridTop: 180, pitch: 16};
    let thought = 0;
    let letters = 0;
    let typingPhase = 'type';
    let nextLetter = 100;
    let holdUntil = 0;
    let curiousUntil = 0;
    let lastPose = '';
    const ink = new Map();
    const cleanups = [];

    function listen(target, type, handler, settings) {
      target.addEventListener(type, handler, settings);
      cleanups.push(() => target.removeEventListener(type, handler, settings));
    }
    function data(name, value) {
      const next = String(value);
      if (root.dataset[name] !== next) root.dataset[name] = next;
    }
    function setPhase(value) {
      currentPhase = value;
      data('phase', value);
    }
    function clearInk() {
      ink.forEach((record, cell) => {
        cell.classList.remove('narrator-ink', 'narrator-step');
        cell.style.removeProperty('--narrator-ink-opacity');
      });
      ink.clear();
      data('inkCount', 0);
    }
    function light(point) {
      const cell = points[point.index] && points[point.index].cell;
      if (!cell || ink.has(cell)) return;
      cell.classList.add('narrator-ink');
      cell.style.setProperty('--narrator-ink-opacity', '1');
      ink.set(cell, {opacity: 1, delay: ((point.column * 13 + point.row * 29) % 37) / 36 * FADE_SPREAD});
      data('inkCount', ink.size);
    }
    function setThought(index, instant) {
      thought = (index + thoughts.length) % thoughts.length;
      letters = instant ? thoughts[thought].length : 0;
      copy.textContent = thoughts[thought].slice(0, letters);
      counter.textContent = String(thought + 1).padStart(2, '0') + ' / ' + String(thoughts.length).padStart(2, '0');
      bubble.setAttribute('aria-label', 'İç ses: ' + thoughts[thought] + ' Sonraki düşünce için tıkla veya Enter tuşuna bas.');
      announcement.textContent = thoughts[thought];
      typingPhase = instant ? 'hold' : 'type';
      nextLetter = time + 100;
      holdUntil = time + 4700;
      root.classList.toggle('is-typing', !instant);
    }
    function isActive() { return !destroyed && !paused && !reduced && visible && !document.hidden && points.length === 364; }
    function measure() {
      dirty = false;
      const panelRect = panel.getBoundingClientRect();
      const gridRect = grid.getBoundingClientRect();
      points = [...grid.querySelectorAll('.rhythm-cell')].map(cell => {
        const rect = cell.getBoundingClientRect();
        return {cell, x: rect.left + rect.width / 2 - panelRect.left, y: rect.top + rect.height * .65 - panelRect.top};
      });
      box = {
        width: panel.clientWidth,
        bubbleWidth: bubble.offsetWidth,
        bubbleHeight: bubble.offsetHeight,
        size: character.offsetWidth,
        gridTop: gridRect.top - panelRect.top,
        pitch: gridRect.width / 52
      };
      lastPose = '';
      data('ready', points.length === 364);
      if (points.length === 364) {
        if (reduced) showStatic();
        else renderPose();
      }
    }
    function paint(x, y, scaleX, scaleY, tilt, arc) {
      const characterTop = y - box.size * .94;
      const bubbleX = clamp(x - box.bubbleWidth * .48, 12, Math.max(12, box.width - box.bubbleWidth - 12));
      const bubbleY = box.gridTop - box.bubbleHeight - Math.max(40, box.size * 1.1);
      const pose = [x, y, scaleX, scaleY, tilt, direction, bubbleX, bubbleY, arc].map(value => Number(value).toFixed(2)).join('/');
      if (pose !== lastPose) {
        character.style.transform = 'translate3d(' + (x - box.size * .5).toFixed(2) + 'px,' + characterTop.toFixed(2) + 'px,0)';
        drawing.svg.style.transform = 'rotate(' + tilt.toFixed(2) + 'deg) scale(' + (scaleX * direction).toFixed(3) + ',' + scaleY.toFixed(3) + ')';
        shadow.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + (y + arc * Math.min(24, box.pitch * 1.7)).toFixed(2) + 'px,0) scale(' + (1 - arc * .45).toFixed(2) + ')';
        shadow.style.opacity = String(.48 - arc * .28);
        bubble.style.transform = 'translate3d(' + bubbleX.toFixed(2) + 'px,' + bubbleY.toFixed(2) + 'px,0)';
        const tailX = clamp(x - bubbleX, 18, box.bubbleWidth - 22);
        bubble.style.setProperty('--narrator-tail-x', tailX.toFixed(2) + 'px');
        const startY = bubbleY + box.bubbleHeight + 18;
        const endY = Math.max(startY + 1, characterTop + box.size * .14);
        tetherPath.setAttribute('d', 'M ' + (bubbleX + tailX).toFixed(1) + ' ' + startY.toFixed(1) + ' Q ' + (x + 8).toFixed(1) + ' ' + ((startY + endY) / 2).toFixed(1) + ' ' + x.toFixed(1) + ' ' + endY.toFixed(1));
        lastPose = pose;
      }
      root.classList.toggle('is-airborne', arc > .1);
    }
    function queueMeasure() {
      dirty = true;
      if (!frame && !layoutFrame && !destroyed) layoutFrame = requestAnimationFrame(() => {
        layoutFrame = 0;
        measure();
        sync();
      });
    }
    function updateThought() {
      if (typingPhase === 'hold') {
        if (time >= holdUntil) { typingPhase = 'erase'; nextLetter = time + 30; root.classList.add('is-typing'); }
        return;
      }
      if (time < nextLetter) return;
      if (typingPhase === 'erase') {
        letters = Math.max(0, letters - 1);
        copy.textContent = thoughts[thought].slice(0, letters);
        nextLetter = time + 25;
        if (!letters) setThought(thought + 1, false);
      } else {
        letters = Math.min(thoughts[thought].length, letters + 1);
        copy.textContent = thoughts[thought].slice(0, letters);
        nextLetter = time + (/[.,?!…]/.test(thoughts[thought][letters - 1]) ? 260 : 62 + letters % 3 * 8);
        if (letters === thoughts[thought].length) {
          typingPhase = 'hold'; holdUntil = time + 4700; root.classList.remove('is-typing');
        }
      }
    }
    function beginScene(index) {
      scene = index % scores.length;
      sceneTime = 0;
      routeIndex = 0;
      currentIndex = 6;
      direction = 1;
      clearInk();
      data('message', scores[scene].text);
      setPhase('draw');
    }
    function showStatic() {
      const score = scores[scene];
      score.route.forEach(light);
      currentIndex = score.route[score.route.length - 1].index;
      setPhase('hold');
      const current = points[currentIndex];
      if (current) paint(current.x, current.y, 1, 1, 0, 0);
    }
    function updateWriting() {
      const score = scores[scene];
      while (routeIndex < score.route.length && sceneTime >= score.route[routeIndex].end) {
        light(score.route[routeIndex]);
        currentIndex = score.route[routeIndex].index;
        routeIndex++;
      }
      if (sceneTime >= FADE_START) {
        if (currentPhase !== 'fade') setPhase('fade');
        ink.forEach((record, cell) => {
          // Quantise only the style write, not the animation clock. All letters
          // get their full reading hold before this shared fade can begin.
          const opacity = Math.round(clamp(1 - (sceneTime - FADE_START - record.delay) / FADE_LENGTH, 0, 1) * 48) / 48;
          if (opacity !== record.opacity) {
            record.opacity = opacity;
            cell.style.setProperty('--narrator-ink-opacity', opacity.toFixed(3));
          }
        });
      } else if (routeIndex === score.route.length && currentPhase !== 'hold') setPhase('hold');
      renderPose();
      if (sceneTime >= SCENE_LENGTH) beginScene(scene + 1);
    }
    function renderPose() {
      const current = points[currentIndex];
      if (!current) return;
      const next = scores[scene].route[routeIndex];
      if (!next || sceneTime < next.start || sceneTime >= next.end) {
        paint(current.x, current.y, 1, 1, 0, 0);
        return;
      }
      const destination = points[next.index];
      if (!destination) return;
      const progress = clamp((sceneTime - next.start) / next.duration, 0, 1);
      direction = destination.x === current.x ? direction : destination.x > current.x ? 1 : -1;
      if (progress < .1) {
        const crouch = progress / .1;
        paint(current.x, current.y, 1 + crouch * .1, 1 - crouch * .16, -direction * crouch * 3, 0);
      } else if (progress < .87) {
        const leap = (progress - .1) / .77;
        const arc = Math.sin(Math.PI * leap);
        const travel = leap * leap * (3 - 2 * leap);
        const distance = Math.hypot(destination.x - current.x, destination.y - current.y);
        const height = Math.min(box.size * .6, Math.max(box.pitch * .9, distance * .17));
        paint(current.x + (destination.x - current.x) * travel, current.y + (destination.y - current.y) * travel - arc * height,
          1 - arc * .05, 1 + arc * .07, direction * arc * 9 + Math.sign(destination.y - current.y) * arc * 3, arc);
      } else {
        const landing = (progress - .87) / .13;
        paint(destination.x, destination.y, 1.1 - landing * .1, .83 + landing * .17, direction * (1 - landing) * -3, 0);
      }
    }
    function tick(now) {
      frame = 0;
      if (dirty) measure();
      if (!isActive()) { sync(); return; }
      const delta = previous ? Math.min(50, now - previous) : 0;
      time += delta;
      sceneTime += delta;
      previous = now;
      updateThought();
      updateWriting();
      root.classList.toggle('is-curious', time < curiousUntil);
      drawing.pupil.setAttribute('cx', String(52 + direction * 2));
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      const active = isActive();
      data('active', active);
      data('reduced', reduced);
      if (active && !frame) { previous = 0; frame = requestAnimationFrame(tick); }
      if (!active) {
        if (frame) cancelAnimationFrame(frame);
        frame = 0; previous = 0;
      }
    }
    function inViewport() {
      const rect = panel.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    }
    function changeMotion(event) {
      reduced = event.matches;
      beginScene(scene);
      if (reduced) { setThought(thought, true); showStatic(); }
      else setThought(thought, false);
      sync();
    }
    listen(bubble, 'click', () => {
      curiousUntil = time + 1000;
      setThought(thought + 1, !isActive());
    });
    listen(scroll, 'scroll', queueMeasure, {passive: true});
    listen(window, 'resize', queueMeasure, {passive: true});
    listen(document, 'visibilitychange', sync);
    if ('IntersectionObserver' in window) {
      const intersection = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) queueMeasure();
        sync();
      }, {threshold: .02});
      intersection.observe(panel);
      cleanups.push(() => intersection.disconnect());
    } else listen(window, 'scroll', () => { visible = inViewport(); queueMeasure(); sync(); }, {passive: true});
    if ('ResizeObserver' in window) {
      const resize = new ResizeObserver(queueMeasure);
      resize.observe(panel); resize.observe(grid); resize.observe(scroll);
      cleanups.push(() => resize.disconnect());
    }
    const mutations = new MutationObserver(queueMeasure);
    mutations.observe(grid, {childList: true});
    cleanups.push(() => mutations.disconnect());
    if (media.addEventListener) { media.addEventListener('change', changeMotion); cleanups.push(() => media.removeEventListener('change', changeMotion)); }
    else if (media.addListener) { media.addListener(changeMotion); cleanups.push(() => media.removeListener(changeMotion)); }
    beginScene(0);
    setThought(0, reduced);
    visible = inViewport();
    measure();
    sync();
    const api = Object.freeze({
      setPaused(value) { paused = Boolean(value); sync(); },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        sync();
        if (layoutFrame) cancelAnimationFrame(layoutFrame);
        cleanups.forEach(cleanup => cleanup());
        clearInk();
        root.remove();
        if (!hadClass) panel.classList.remove('has-activity-narrator');
        mounted.delete(panel);
      }
    });
    mounted.set(panel, api);
    return api;
  }
  window.ActivityNarrator = Object.freeze({mount});
})();
