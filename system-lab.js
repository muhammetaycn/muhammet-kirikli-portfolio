(function () {
  'use strict';

  const SVG = 'http://www.w3.org/2000/svg';
  const INK = '#E7E3DB';
  const ORANGE = '#FF6A35';
  const MUTED = '#777874';
  const BORDER = '#30322F';
  const STEP_MS = 450;
  let instance = 0;
  const projects = {
    event: {
      title: 'Etkinlik · katılımdan sahneye',
      description: 'Katılımın, fotoğraf ve onay adımlarından sahne çıktısına ilerlediği dört duraklı bir akış modeli.',
      nodes: ['Katılım', 'Fotoğraf', 'Onay', 'Sahne'],
      types: ['GİRDİ', 'HAZIRLIK', 'KONTROL', 'ÇIKTI'],
      steps: ['Örnek katılım verisi akışa girdi.', 'Fotoğraf adımının bağlantısı gösteriliyor.', 'Onay noktası canlandırılıyor; gerçek bir kayıt onaylanmıyor.', 'Sahne çıktısına giden yol gösteriliyor.'],
      done: 'Katılım, fotoğraf ve onay adımları sahneye bağlandı.'
    },
    textile: {
      title: 'Tekstil · siparişten sevkiyata',
      description: 'Sipariş, planlama, kalite ve sevkiyat arasındaki bağı görünür kılan bir operasyon modeli.',
      nodes: ['Sipariş', 'Planlama', 'Kalite', 'Sevkiyat'],
      types: ['GİRDİ', 'PLAN', 'KONTROL', 'ÇIKTI'],
      steps: ['Örnek sipariş düğümü seçildi.', 'Planlama bağlantısı canlandırılıyor.', 'Kalite kontrol noktası gösteriliyor.', 'Sevkiyat adımına giden yol tamamlandı.'],
      done: 'Sipariş, planlama ve kalite noktaları çıkışa bağlandı.'
    },
    content: {
      title: 'İçerik · fikirden yayın kuyruğuna',
      description: 'Araştırmadan taslağa, onaydan kuyruğa uzanan içerik sürecinin etkileşimli bir modeli.',
      nodes: ['Araştırma', 'Taslak', 'Onay', 'Kuyruk'],
      types: ['GİRDİ', 'ÜRETİM', 'KONTROL', 'ÇIKTI'],
      steps: ['Örnek araştırma girdisi gösteriliyor.', 'Taslak aşamasına geçiş canlandırılıyor.', 'Editoryal onay noktası gösteriliyor.', 'Kuyruk bağlantısı canlandırıldı.'],
      done: 'Araştırma, taslak ve onay adımları kuyruğa bağlandı.'
    },
    community: {
      title: 'Topluluk · olaydan kayda',
      description: 'Bir olayın kural, rol ve kayıt adımlarıyla ilişkisini anlatan topluluk otomasyonu modeli.',
      nodes: ['Olay', 'Kural', 'Rol', 'Kayıt'],
      types: ['TETİKLEYİCİ', 'KOŞUL', 'EYLEM', 'KAYIT'],
      steps: ['Örnek olay düğümü tetiklendi.', 'Kural koşulunun yeri gösteriliyor.', 'Rol adımı yalnızca canlandırılıyor; üyeler etkilenmiyor.', 'Kayıt düğümüne giden yol gösterildi.'],
      done: 'Olay, kural ve rol adımları kayıt noktasına bağlandı.'
    }
  };

  function mount() {
    const host = document.getElementById('system-lab');
    if (!host) throw new Error('SystemLab: #system-lab bulunamadı.');
    const required = id => {
      const element = document.getElementById(id);
      if (!element) throw new Error('SystemLab: #' + id + ' bulunamadı.');
      return element;
    };
    const title = required('lab-title');
    const description = required('lab-description');
    const stage = required('lab-stage');
    const runButton = required('lab-run');
    const resetButton = required('lab-reset');
    const result = required('lab-result');
    const buttons = [...host.querySelectorAll('button[data-lab-project]')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefix = 'system-lab-' + (++instance);
    const cleanups = [];
    const timers = new Set();
    const tracers = new Set();
    let selected = 'event';
    let nodes = [];
    let connections = [];
    let generation = 0;
    let running = false;
    let destroyed = false;

    function svg(name, attrs, text) {
      const element = document.createElementNS(SVG, name);
      for (const [key, value] of Object.entries(attrs || {})) element.setAttribute(key, String(value));
      if (text !== undefined) element.textContent = text;
      return element;
    }
    function listen(element, type, handler) {
      element.addEventListener(type, handler);
      cleanups.push(() => element.removeEventListener(type, handler));
    }
    function status(text) { result.textContent = 'Demo · ' + text; }
    function later(callback, delay) {
      const timer = setTimeout(() => { timers.delete(timer); callback(); }, delay);
      timers.add(timer);
    }
    function cancel() {
      generation++;
      timers.forEach(clearTimeout);
      timers.clear();
      tracers.forEach(tracer => tracer.remove());
      tracers.clear();
      running = false;
      runButton.disabled = false;
      runButton.textContent = 'Akışı çalıştır';
      stage.dataset.running = 'false';
    }
    function nodeState(index, state) {
      const node = nodes[index];
      node.group.dataset.state = state;
      node.group.classList.toggle('is-active', state === 'active');
      node.group.classList.toggle('is-complete', state === 'complete');
      node.box.setAttribute('stroke', state === 'idle' ? BORDER : ORANGE);
      node.box.setAttribute('fill', state === 'active' ? '#21150F' : '#101210');
      node.number.setAttribute('fill', state === 'idle' ? MUTED : ORANGE);
      node.dot.setAttribute('fill', state === 'idle' ? BORDER : ORANGE);
    }
    function clearStates() {
      nodes.forEach((_, index) => nodeState(index, 'idle'));
      connections.forEach(path => {
        path.setAttribute('stroke', BORDER);
        path.setAttribute('marker-end', 'url(#' + prefix + '-arrow)');
      });
    }
    function draw() {
      const project = projects[selected];
      const fragment = document.createDocumentFragment();
      title.textContent = project.title;
      description.textContent = project.description;
      stage.setAttribute('viewBox', '0 0 960 380');
      stage.setAttribute('role', 'img');
      stage.setAttribute('aria-labelledby', prefix + '-title ' + prefix + '-description');
      stage.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      stage.style.width = '100%';
      stage.style.height = 'auto';
      stage.style.display = 'block';
      stage.style.fontFamily = 'Inter, ui-sans-serif, system-ui, sans-serif';
      fragment.appendChild(svg('title', {id: prefix + '-title'}, 'Etkileşimli akış demosu: ' + project.title));
      fragment.appendChild(svg('desc', {id: prefix + '-description'},
        project.nodes.map((name, index) => (index + 1) + '. ' + name).join(' → ') +
        '. Akışı çalıştır düğmesi bu temsili adımları canlandırır. Gerçek sistem işlemi yapılmaz.'));
      const defs = svg('defs');
      for (const [suffix, color] of [['arrow', BORDER], ['arrow-active', ORANGE]]) {
        const marker = svg('marker', {id: prefix + '-' + suffix, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse'});
        marker.appendChild(svg('path', {d: 'M 1 1 L 9 5 L 1 9', fill: 'none', stroke: color, 'stroke-width': 1.5}));
        defs.appendChild(marker);
      }
      fragment.appendChild(defs);
      fragment.appendChild(svg('text', {x: 40, y: 32, fill: MUTED, 'font-size': 11, 'letter-spacing': 2.2}, '04 ADIM / TEMSİLİ MODEL'));
      const positions = [{x: 40, y: 84}, {x: 276, y: 186}, {x: 512, y: 84}, {x: 748, y: 186}];
      connections = positions.slice(0, -1).map((point, index) => {
        const next = positions[index + 1];
        const startX = point.x + 172;
        const startY = point.y + 54;
        const endX = next.x - 10;
        const endY = next.y + 54;
        const middle = (startX + endX) / 2;
        const path = svg('path', {d: 'M ' + startX + ' ' + startY + ' C ' + middle + ' ' + startY + ', ' + middle + ' ' + endY + ', ' + endX + ' ' + endY,
          class: 'lab-path', fill: 'none', stroke: BORDER, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'marker-end': 'url(#' + prefix + '-arrow)', 'aria-hidden': true});
        fragment.appendChild(path);
        return path;
      });
      nodes = project.nodes.map((name, index) => {
        const point = positions[index];
        const group = svg('g', {class: 'lab-node', transform: 'translate(' + point.x + ' ' + point.y + ')', 'data-state': 'idle'});
        const box = svg('rect', {width: 172, height: 108, rx: 17, fill: '#101210', stroke: BORDER, 'stroke-width': 1.25});
        const number = svg('text', {x: 18, y: 30, fill: MUTED, 'font-size': 12, 'font-weight': 650, 'letter-spacing': 1.2}, '0' + (index + 1));
        const dot = svg('circle', {cx: 150, cy: 25, r: 3, fill: BORDER});
        group.appendChild(box);
        group.appendChild(number);
        group.appendChild(dot);
        group.appendChild(svg('text', {x: 18, y: 65, fill: INK, 'font-size': 23, 'font-weight': 600, 'letter-spacing': -0.7}, name));
        group.appendChild(svg('text', {x: 18, y: 89, fill: MUTED, 'font-size': 9.5, 'letter-spacing': 1.7}, project.types[index]));
        fragment.appendChild(group);
        return {group, box, number, dot};
      });
      fragment.appendChild(svg('line', {x1: 40, y1: 331, x2: 920, y2: 331, stroke: '#222420', 'stroke-width': 1}));
      fragment.appendChild(svg('circle', {cx: 45, cy: 354, r: 3, fill: ORANGE}));
      fragment.appendChild(svg('text', {x: 58, y: 358, fill: MUTED, 'font-size': 11}, 'Etkileşimli akış demosu · gerçek sistem işlemi yapılmaz'));
      stage.replaceChildren(fragment);
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.labProject === selected)));
      status('Hazır. Dört adımı incelemek için akışı çalıştır.');
    }
    function tracer(path) {
      if (reducedMotion.matches) return;
      const dot = svg('circle', {r: 4, fill: ORANGE, 'aria-hidden': true, class: 'lab-tracer'});
      const motion = svg('animateMotion', {path: path.getAttribute('d'), dur: (STEP_MS / 1000) + 's', begin: 'indefinite', calcMode: 'paced', fill: 'freeze'});
      dot.appendChild(motion);
      stage.appendChild(dot);
      tracers.add(dot);
      if (typeof motion.beginElement === 'function') motion.beginElement();
      else dot.setAttribute('opacity', '0');
      later(() => { dot.remove(); tracers.delete(dot); }, STEP_MS);
    }
    function finish(project) {
      nodes.forEach((_, index) => nodeState(index, 'complete'));
      cancel();
      status('Tamamlandı. ' + project.done);
    }
    function run() {
      if (running || destroyed) return;
      cancel();
      clearStates();
      const project = projects[selected];
      const token = generation;
      running = true;
      runButton.disabled = true;
      runButton.textContent = 'Akış çalışıyor…';
      stage.dataset.running = 'true';
      if (reducedMotion.matches) {
        connections.forEach(path => { path.setAttribute('stroke', ORANGE); path.setAttribute('marker-end', 'url(#' + prefix + '-arrow-active)'); });
        finish(project);
        return;
      }
      function step(index) {
        if (destroyed || token !== generation) return;
        if (index > 0) {
          nodeState(index - 1, 'complete');
          connections[index - 1].setAttribute('stroke', ORANGE);
          connections[index - 1].setAttribute('marker-end', 'url(#' + prefix + '-arrow-active)');
        }
        nodeState(index, 'active');
        status((index + 1) + '/4 · ' + project.nodes[index] + ': ' + project.steps[index]);
        if (index < 3) {
          tracer(connections[index]);
          later(() => step(index + 1), STEP_MS);
        } else later(() => { if (token === generation) finish(project); }, STEP_MS);
      }
      step(0);
    }

    result.setAttribute('role', 'status');
    result.setAttribute('aria-live', 'polite');
    result.setAttribute('aria-atomic', 'true');
    buttons.forEach(button => listen(button, 'click', () => {
      const key = button.dataset.labProject;
      if (!Object.prototype.hasOwnProperty.call(projects, key)) return;
      cancel();
      selected = key;
      draw();
    }));
    listen(runButton, 'click', run);
    listen(resetButton, 'click', () => { cancel(); clearStates(); status('Sıfırlandı. Bu yalnızca bir akış canlandırmasıdır.'); });
    const motionChanged = () => {
      if (!running) return;
      cancel();
      clearStates();
      status('Hareket tercihi değiştiği için akış sıfırlandı. Yeniden çalıştırabilirsin.');
    };
    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', motionChanged);
      cleanups.push(() => reducedMotion.removeEventListener('change', motionChanged));
    } else if (typeof reducedMotion.addListener === 'function') {
      reducedMotion.addListener(motionChanged);
      cleanups.push(() => reducedMotion.removeListener(motionChanged));
    }
    draw();
    function destroy() {
      destroyed = true;
      cancel();
      cleanups.forEach(remove => remove());
    }
    destroy.destroy = destroy;
    return destroy;
  }

  window.SystemLab = Object.freeze({mount});
})();
