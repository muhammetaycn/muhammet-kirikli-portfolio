(function () {
  'use strict';

  const mounted = new WeakMap();
  const idleThoughts = [
    'Bu bir resim değil. Tuşların her biri başka bir kapı.',
    'Bir fikir önce terminalde görünür. Sonra çalışan bir sisteme dönüşür.',
    'Veri nereden geliyor, nereye gidiyor? İçeride izini sürebilirsin.',
    'Bir tuş veriyi işler. Biri sahneyi açar. Biri de oyunun kuralını değiştirir.',
    'Küçük ekranın içinde Muhammet’in kurduğu sistemlerden parçalar var.',
    'Merak ettiğin tuşu seç. Ekranı büyütüp biraz daha yakından bakabilirsin.'
  ];

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function luci() {
    const drawing = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    drawing.setAttribute('viewBox', '0 0 112 112');
    drawing.setAttribute('aria-hidden', 'true');
    drawing.setAttribute('class', 'computer-luci-drawing');
    // A code-drawn fan interpretation shared with the activity-grid narrator.
    drawing.innerHTML = '<g class="computer-luci-tail"><path d="M35 75C7 84 3 57 15 49C26 42 32 53 23 58" fill="none" stroke="#a9a299" stroke-width="6.5" stroke-linecap="round"/><path d="M35 75C7 84 3 57 15 49C26 42 32 53 23 58" fill="none" stroke="#09090b" stroke-width="4.5" stroke-linecap="round"/><path d="M20 50L30 56L19 64Z"/></g><g class="computer-luci-legs"><path d="M39 78L34 96L25 100Q21 103 29 104L41 103L48 84M56 82L57 98L65 102Q69 105 60 105L50 103L48 84"/></g><path d="M31 49C25 40 25 29 30 22L40 32C44 29 49 28 53 29L61 17Q66 22 64 35C69 39 70 44 69 49L79 52Q85 55 78 59L69 61C74 72 69 84 59 88C43 94 29 85 29 72C27 63 29 55 31 49Z"/><g class="computer-luci-eye"><ellipse cx="51" cy="47" rx="12.5" ry="15.5" fill="#f1ede4" stroke="none"/><ellipse class="computer-luci-pupil" cx="54" cy="47" rx="3" ry="8.5" fill="#09090b" stroke="none"/></g><path d="M65 61Q71 63 77 58M70 62L71 66L74 61" fill="none" stroke="#eee8dc" stroke-width="1.3"/><path class="computer-luci-arm" d="M62 72Q71 76 79 73L84 69M79 73L85 74M79 73L82 78" fill="none" stroke="#a9a299" stroke-width="1.5"/>';
    return drawing;
  }

  function mount(host, options) {
    if (!host) return null;
    if (mounted.has(host)) return mounted.get(host);
    options = options || {};
    let visible = false;
    let paused = false;
    let reduced = Boolean(options.reducedMotion);
    let destroyed = false;
    let touched = false;
    let demoStarted = false;
    let focusedKey = 0;
    let thoughtIndex = 0;
    let thoughtText = idleThoughts[0];
    let typedCount = thoughtText.length;
    let nextThought = 0;
    let lastType = 0;
    let frame = 0;
    let clock = 0;
    let previousFrame = 0;
    let demoAt = 0;
    let wakeAt = null;
    let wakeReady = false;
    let waveUntil = 0;
    let signalUntil = 0;
    const pressUntil = Array(32).fill(0);
    const removeListeners = [];
    const keys = [];
    const definitions = window.ComputerOS?.keys || Array.from({length: 32}, (_, index) => ({name: `Deneyim ${index + 1}`, hint: 'Bir tuş seç ve içerideki akışı izle.'}));

    const scene = node('section', 'computer-scene');
    scene.setAttribute('aria-label', '32 tuşlu etkileşimli bilgisayar');
    scene.dataset.visible = 'false';
    const world = node('div', 'computer-world');
    const shadow = node('div', 'computer-ground-shadow');
    shadow.setAttribute('aria-hidden', 'true');
    const float = node('div', 'computer-float');
    const object = node('div', 'computer-object');
    const label = node('span', 'computer-object-label', '002 / mk.desktop');
    const expand = node('button', 'computer-expand', 'Ekranı büyüt');
    expand.type = 'button';
    expand.append(node('span', '', '↗'));
    expand.setAttribute('aria-label', 'Bilgisayar ekranını büyüt');
    const monitor = node('div', 'computer-monitor');
    const caseSide = node('div', 'computer-case-side');
    caseSide.setAttribute('aria-hidden', 'true');
    const vents = node('div', 'computer-side-vents');
    for (let index = 0; index < 5; index++) vents.append(node('i'));
    caseSide.append(vents);
    const shell = node('div', 'computer-case');
    const glassRim = node('div', 'computer-glass-rim');
    const display = node('div', 'computer-display');
    const glass = node('div', 'computer-glass-sheen');
    glass.setAttribute('aria-hidden', 'true');
    const wake = node('div', 'computer-wake');
    wake.setAttribute('aria-hidden', 'true');
    wake.dataset.step = 'dormant';
    const wakeMark = node('span', 'computer-wake-mark', 'mk');
    const wakeTitle = node('b', 'computer-wake-title', 'mk.local');
    const wakeMessage = node('span', 'computer-wake-message', 'Ekran uyanıyor.');
    const wakeTrack = node('span', 'computer-wake-track');
    wakeTrack.append(node('i'));
    wake.append(wakeMark, wakeTitle, wakeMessage, wakeTrack);
    glassRim.append(display, glass, wake);
    const brand = node('div', 'computer-case-brand');
    brand.setAttribute('aria-hidden', 'true');
    brand.append(node('b', '', 'mk'), node('span', '', '✳'));
    const speaker = node('div', 'computer-speaker');
    speaker.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 8; index++) speaker.append(node('i'));
    const power = node('span', 'computer-power-light');
    power.setAttribute('aria-hidden', 'true');
    const stand = node('div', 'computer-stand');
    stand.setAttribute('aria-hidden', 'true');
    stand.append(node('i'));
    shell.append(glassRim, brand, speaker, power);
    monitor.append(caseSide, stand, shell);

    const keyboard = node('div', 'computer-keyboard');
    const tray = node('div', 'computer-keyboard-tray');
    tray.setAttribute('aria-hidden', 'true');
    const keyboardGrid = node('div', 'computer-keys');
    keyboardGrid.setAttribute('role', 'group');
    keyboardGrid.setAttribute('aria-label', '32 tuş, 32 deneyim. Ok tuşlarıyla gezin, Enter ile açın.');
    const hint = node('div', 'computer-key-hint');
    const hintNumber = node('span', 'computer-key-number', '32');
    const hintText = node('span', 'computer-key-description', 'Tuşlardan birini seç. İçeride bir şeyler başlasın.');
    hint.append(hintNumber, hintText);
    const status = node('span', 'computer-sr-only');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const signal = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    signal.setAttribute('class', 'computer-signal');
    signal.setAttribute('viewBox', '0 0 430 620');
    signal.setAttribute('aria-hidden', 'true');
    const signalPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    signalPath.setAttribute('class', 'computer-signal-path');
    signalPath.setAttribute('pathLength', '100');
    signal.append(signalPath);

    const companion = node('div', 'computer-companion');
    companion.setAttribute('aria-hidden', 'true');
    companion.append(luci());
    const bubble = node('div', 'computer-thought');
    const bubbleTop = node('span', 'computer-thought-header', 'luci@mk ~');
    bubbleTop.append(node('i'));
    const bubbleLine = node('p', 'computer-thought-line');
    const thought = node('span', '', thoughtText);
    const caret = node('i', 'computer-thought-caret');
    bubbleLine.append(node('span', 'computer-thought-prompt', '› '), thought, caret);
    bubble.append(bubbleTop, bubbleLine);
    bubble.setAttribute('aria-hidden', 'true');

    keyboard.append(tray, keyboardGrid);
    object.append(label, expand, monitor, keyboard, signal, bubble, companion, hint, status);
    float.append(object);
    world.append(shadow, float);
    scene.append(world);
    host.append(scene);

    function listen(target, type, callback, settings) {
      target.addEventListener(type, callback, settings);
      removeListeners.push(() => target.removeEventListener(type, callback, settings));
    }

    function finishWake() {
      wakeReady = true;
      wake.dataset.step = 'ready';
      scene.dataset.wake = 'ready';
      wakeMessage.textContent = 'Sıra sende.';
    }

    function activity(kind) {
      touched = true;
      demoAt = 0;
      finishWake();
      options.onActivity?.(kind || 'computer');
    }

    function setThought(text) {
      if (destroyed || !text) return;
      if (String(text) === thoughtText) {
        if (typedCount === thoughtText.length) nextThought = clock + readingTime();
        return;
      }
      thoughtText = String(text);
      typedCount = reduced || paused ? thoughtText.length : 0;
      thought.textContent = thoughtText.slice(0, typedCount);
      bubble.classList.add('is-speaking');
      scene.dataset.thought = thoughtText;
      nextThought = typedCount === thoughtText.length ? clock + readingTime() : 0;
      lastType = clock;
      schedule();
    }

    function readingTime() {return Math.max(6500, thoughtText.split(/\s+/).length * 250 + 1800);}

    function showHint(index) {
      const definition = definitions[index] || {};
      hintNumber.textContent = String(index + 1).padStart(2, '0');
      hintText.textContent = definition.hint ? `${definition.name} · ${definition.hint}` : definition.name;
      hint.classList.add('is-key-selected');
      companion.classList.add('is-looking');
      const column = index % 8;
      companion.style.setProperty('--luci-look', `${(column - 3.5) * .7}px`);
    }

    function wave(index) {
      if (reduced || paused) return;
      keys.forEach((key, number) => {
        key.classList.remove('is-rippling');
        const distance = Math.abs(index % 8 - number % 8) + Math.abs(Math.floor(index / 8) - Math.floor(number / 8));
        key.style.setProperty('--wave-delay', `${distance * 29}ms`);
      });
      // Force only the key grid's animation state to restart for rapid repeated taps.
      void keyboardGrid.offsetWidth;
      keys.forEach(key => key.classList.add('is-rippling'));
      waveUntil = clock + 700;
    }

    function traceKey(index) {
      if (!active()) return;
      const row = Math.floor(index / 8), column = index % 8;
      const x = column * 48 + 20.5, y = row * 41 + 17.5;
      const angle = (window.matchMedia('(max-width: 760px)').matches ? -2 : -3) * Math.PI / 180;
      const localX = x - 188.5, localY = y - 79;
      const startX = 23 + 188.5 + localX * Math.cos(angle) - localY * Math.sin(angle);
      const startY = 390 + 79 + localX * Math.sin(angle) + localY * Math.cos(angle);
      signalPath.setAttribute('d', `M${startX.toFixed(2)} ${startY.toFixed(2)}C${startX.toFixed(2)} ${(startY - 38).toFixed(2)} 185 365 202 303`);
      scene.classList.remove('is-signalling');
      void signal.offsetWidth;
      scene.classList.add('is-signalling');
      signalUntil = clock + 950;
      companion.dataset.attention = 'keys';
      scene.dataset.signal = definitions[index]?.name || String(index + 1);
    }

    function clearImpulses() {
      waveUntil = signalUntil = 0;
      pressUntil.fill(0);
      keys.forEach(key => {key.classList.remove('is-pressed');key.classList.remove('is-rippling');});
      scene.classList.remove('is-signalling');
      companion.classList.remove('is-excited');
      companion.dataset.attention = 'idle';
    }

    function selectKey(index, announce) {
      if (destroyed || !Number.isInteger(index) || index < 0 || index > 31) return;
      activity('key');
      showHint(index);
      scene.dataset.lastKey = String(index);
      scene.dataset.keyCount = String(Number(scene.dataset.keyCount || 0) + 1);
      keys.forEach((key, number) => key.classList.toggle('is-last-key', number === index));
      if (active()) {keys[index].classList.add('is-pressed');pressUntil[index] = clock + 190;}
      companion.classList.remove('is-excited');
      if (!reduced && !paused) {
        void companion.offsetWidth;
        companion.classList.add('is-excited');
      }
      wave(index);
      traceKey(index);
      if (announce) status.textContent = `${definitions[index]?.name || 'Deneyim'} açılıyor.`;
      os?.runKey(index);
    }

    for (let index = 0; index < 32; index++) {
      const definition = definitions[index] || {};
      const key = node('button', 'computer-key');
      key.type = 'button';
      key.tabIndex = index === 0 ? 0 : -1;
      key.dataset.computerKey = String(index);
      key.setAttribute('aria-label', `${index + 1}. ${definition.name || 'Deneyim'}${definition.hint ? `. ${definition.hint}` : ''}`);
      const cap = node('span', 'computer-key-cap');
      cap.setAttribute('aria-hidden', 'true');
      cap.append(node('i', 'computer-key-soft-top'), node('span', 'computer-key-light'));
      key.append(cap);
      listen(key, 'pointerenter', () => showHint(index));
      listen(key, 'focus', () => {keys.forEach((item, number) => {item.tabIndex = number === index ? 0 : -1;}); focusedKey = index; showHint(index); activity('focus');});
      listen(key, 'pointerdown', () => key.classList.add('is-pressed'));
      listen(key, 'pointerup', () => key.classList.remove('is-pressed'));
      listen(key, 'pointercancel', () => key.classList.remove('is-pressed'));
      listen(key, 'pointerleave', () => key.classList.remove('is-pressed'));
      listen(key, 'click', () => selectKey(index, true));
      listen(key, 'keydown', event => {
        const row = Math.floor(index / 8);
        const column = index % 8;
        let next = index;
        if (event.key === 'ArrowRight') next = row * 8 + (column + 1) % 8;
        else if (event.key === 'ArrowLeft') next = row * 8 + (column + 7) % 8;
        else if (event.key === 'ArrowDown') next = ((row + 1) % 4) * 8 + column;
        else if (event.key === 'ArrowUp') next = ((row + 3) % 4) * 8 + column;
        else if (event.key === 'Home') next = event.ctrlKey ? 0 : row * 8;
        else if (event.key === 'End') next = event.ctrlKey ? 31 : row * 8 + 7;
        else return;
        event.preventDefault();
        keys[focusedKey].tabIndex = -1;
        focusedKey = next;
        keys[next].tabIndex = 0;
        keys[next].focus({preventScroll: true});
      });
      keys.push(key);
      keyboardGrid.append(key);
    }

    const os = window.ComputerOS?.mount(display, {
      reducedMotion: reduced,
      onThought: setThought,
      onActivity: () => activity('screen'),
      onProject: id => {activity('project'); options.onProject?.(id);},
      onExpanded: expanded => {activity('expand'); scene.classList.toggle('is-expanded', Boolean(expanded)); options.onExpanded?.(expanded);}
    });
    if (!os) display.append(node('div', 'computer-os-loading', 'mk.desktop yükleniyor…'));

    listen(expand, 'click', () => {activity('expand'); os?.openExpanded();});
    listen(scene, 'pointerenter', () => scene.classList.add('is-pointer-inside'));
    listen(scene, 'pointermove', event => {
      if (!visible || paused || reduced || event.pointerType === 'touch') return;
      const rect = scene.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width * .62) / (rect.width * .5)));
      const y = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height * .48) / (rect.height * .5)));
      // Light follows the pointer while physical controls keep fixed hit geometry.
      object.style.setProperty('--computer-light-x', `${(50 + x * 28).toFixed(2)}%`);
      object.style.setProperty('--computer-light-y', `${(40 + y * 20).toFixed(2)}%`);
    }, {passive: true});
    listen(scene, 'pointerleave', () => {
      scene.classList.remove('is-pointer-inside');
      object.style.setProperty('--computer-light-x', '50%');
      object.style.setProperty('--computer-light-y', '40%');
      companion.classList.remove('is-looking');
    });
    listen(scene, 'pointerdown', () => activity('pointer'), {passive: true});
    listen(document, 'visibilitychange', sync);

    function resize() {
      if (destroyed) return;
      const rect = host.getBoundingClientRect();
      const mobile = window.matchMedia('(max-width: 760px)').matches;
      const width = rect.width * (mobile ? .96 : .78);
      const height = Math.max(360, rect.height - 72);
      const scale = Math.max(.8, Math.min(1.06, width / 430, height / 620));
      world.style.setProperty('--computer-scale', scale.toFixed(3));
      world.style.setProperty('--computer-text-scale', (1 / scale).toFixed(3));
      scene.dataset.scale = scale.toFixed(3);
    }
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(host);
    if (!resizeObserver) listen(window, 'resize', resize, {passive: true});

    function active() {return visible && !paused && !reduced && !destroyed && !document.hidden;}
    function schedule() {if (active() && !frame) frame = requestAnimationFrame(tick);}
    function tick(now) {
      frame = 0;
      if (!active()) return;
      clock += Math.min(50, Math.max(0, now - previousFrame));
      previousFrame = now;
      scene.dataset.elapsed = String(Math.round(clock));
      if (!wakeReady && wakeAt !== null) {
        const elapsed = clock - wakeAt;
        wake.dataset.step = elapsed < 360 ? 'signal' : 'opening';
        scene.dataset.wake = wake.dataset.step;
        wakeMessage.textContent = elapsed < 760 ? '32 tuş, bir sürü olasılık.' : 'Sıra sende.';
        if (elapsed >= 1200) finishWake();
      }
      keys.forEach((key,index) => {if (pressUntil[index] && clock >= pressUntil[index]) {key.classList.remove('is-pressed');pressUntil[index] = 0;}});
      if (waveUntil && clock >= waveUntil) {keys.forEach(key => key.classList.remove('is-rippling'));waveUntil = 0;}
      if (signalUntil) {
        if (clock >= signalUntil) {scene.classList.remove('is-signalling');signalUntil = 0;companion.dataset.attention = 'idle';}
        else if (signalUntil - clock < 650) {companion.dataset.attention = 'screen';companion.style.setProperty('--luci-look', '-4px');}
      }
      if (demoAt && clock >= demoAt && !touched) {demoAt = 0;os?.autoDemo?.();}
      if (typedCount < thoughtText.length && clock - lastType > 37) {
        typedCount = Math.min(thoughtText.length, typedCount + Math.max(1, Math.floor((clock - lastType) / 37)));
        lastType = clock;
        thought.textContent = thoughtText.slice(0, typedCount);
        if (typedCount === thoughtText.length) {bubble.classList.remove('is-speaking');nextThought = clock + readingTime();}
      }
      if (nextThought && clock >= nextThought && !touched) {
        thoughtIndex = (thoughtIndex + 1) % idleThoughts.length;
        setThought(idleThoughts[thoughtIndex]);
      }
      schedule();
    }
    function sync() {
      scene.classList.toggle('is-still', paused || reduced || !visible || document.hidden);
      scene.dataset.paused = String(paused || reduced);
      os?.setPaused(paused || reduced || !visible || document.hidden);
      if (!active()) {if (frame) cancelAnimationFrame(frame);frame = 0;clearImpulses();}
      if (visible && (reduced || paused)) finishWake();
      if (active()) {
        previousFrame = performance.now();
        if (!wakeReady && wakeAt === null) {wakeAt = clock;wake.dataset.step = 'signal';scene.dataset.wake = 'signal';}
        schedule();
        if (!demoStarted && !touched) {
          demoStarted = true;
          demoAt = clock + 1800;
        }
      }
    }

    const api = {
      setVisible(value) {
        visible = Boolean(value);
        scene.dataset.visible = String(visible);
        sync();
        if (visible) {
          resize();
        }
      },
      setPaused(value) {paused = Boolean(value); sync();},
      setReducedMotion(value) {reduced = Boolean(value); if (reduced) {typedCount = thoughtText.length; thought.textContent = thoughtText;} sync();},
      runKey(index) {selectKey(index, false);},
      openExpanded() {activity('expand'); os?.openExpanded();},
      destroy() {
        if (destroyed) return;
        destroyed = true;
        if (frame) cancelAnimationFrame(frame);
        clearImpulses();
        removeListeners.forEach(remove => remove());
        resizeObserver?.disconnect();
        os?.destroy();
        scene.remove();
        mounted.delete(host);
      }
    };
    mounted.set(host, api);
    resize();
    sync();
    return api;
  }

  window.ComputerScene = Object.freeze({mount});
}());
