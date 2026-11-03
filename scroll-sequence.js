(() => {
  'use strict';
  const sequence = document.querySelector('.signal-sequence');
  if (!sequence) return;

  const stage = sequence.querySelector('.signal-stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 780px) and (min-height: 610px)');
  const cursorLayer = document.createElement('canvas');
  cursorLayer.className = 'scroll-cursors';
  cursorLayer.setAttribute('aria-hidden', 'true');
  const context = cursorLayer.getContext('2d');
  const cursorShape = context && typeof Path2D === 'function' && new Path2D('M 1 1 L 2 18 L 6 14 L 9.5 21 L 13 19 L 9 12 L 15 11 Z');
  const colors = ['#fff0d7', '#ffc29c', '#bce9bd', '#aed6ff', '#f5b7cb', '#f4df9d'];
  const targetSelector = [
    '#home h1', '.hero-art', '.project-conduit button', '#work h2', '#project-list', '.project-preview',
    '#signal h2', '.signal-layer', '#lab h2', '.lab-tabs', '.lab-viewport', '#about h2',
    '#capability-map', '.about-right', '.background-columns > div', '#rhythm h2',
    '.rhythm-panel', '#contact h2', '.contact-link'
  ].join(',');
  const workers = [...document.querySelectorAll(targetSelector)].map((node, index) => ({
    node, index, color: colors[index % colors.length], progress: -1, rect: null
  }));
  const signalWorkerStart = workers.findIndex(({node}) => node.classList.contains('signal-layer'));
  for (const {node} of workers) {
    node.classList.add('construction-target');
    for (const path of node.querySelectorAll(':scope.signal-layer > .signal-trace')) {
      path.setAttribute('pathLength', '1');
    }
  }
  let targetsDirty = true;
  let cursorFrame = 0;
  let lastCursorPaint = -Infinity;
  let cursorWidth = 0;
  let cursorHeight = 0;
  let pixelRatio = 0;
  if (cursorShape) document.body.append(cursorLayer);
  let frame = 0;
  let lastProgress = -1;
  let enabled = false;
  sequence.classList.add('has-signal-layout');
  const clamp = value => Math.max(0, Math.min(1, value));

  function paint() {
    frame = 0;
    const bounds = sequence.getBoundingClientRect();
    const height = window.innerHeight;
    const start = height * .88;
    const end = wide.matches ? 92 - (bounds.height - stage.offsetHeight) : height * .26;
    const progress = Math.round(Math.max(0, Math.min(1, (start - bounds.top) / (start - end))) * 1000) / 1000;
    if (progress === lastProgress) return;
    sequence.style.setProperty('--signal-progress', progress);
    lastProgress = progress;
    targetsDirty = true;
  }

  function schedule() {
    if (enabled && !document.hidden && !frame) frame = requestAnimationFrame(paint);
  }

  function drawArrow(x, y, size, rotation, color, opacity) {
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.scale(size, size);
    context.globalAlpha = opacity;
    context.fillStyle = color;
    context.fill(cursorShape);
    context.stroke(cursorShape);
    context.restore();
  }

  function paintCursors(now) {
    cursorFrame = requestAnimationFrame(paintCursors);
    if (now - lastCursorPaint < 30) return;
    lastCursorPaint = now;
    const width = document.documentElement.clientWidth;
    const height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    if (width !== cursorWidth || height !== cursorHeight || ratio !== pixelRatio) {
      cursorWidth = width;
      cursorHeight = height;
      pixelRatio = ratio;
      cursorLayer.width = Math.round(width * ratio);
      cursorLayer.height = Math.round(height * ratio);
      targetsDirty = true;
    }
    if (targetsDirty) measureWorkers(height, width);
    const time = now / 1000;
    const scroll = scrollY;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.lineWidth = 1.5;
    context.lineJoin = 'round';
    context.strokeStyle = '#191a17';
    const compact = width < 760;
    const count = workers.length;
    const distance = height + 100;
    for (let i = 0; i < count; i++) {
      const worker = workers[i];
      if (worker.rect) {
        paintConstruction(worker);
        continue;
      }
      const phase = i * 2.399963;
      const pace = .42 + (i % 7) * .12;
      const track = (i * 37 % 101) / 101;
      const amplitude = Math.min(width * .085, 84);
      const sway = scroll * .003 + phase + time * (.85 + (i % 5) * .27);
      const x = width * (.085 + track * .83) + Math.sin(sway) * amplitude;
      const speed = (20 + (i % 6) * 14) * (i % 3 === 0 ? -1 : 1);
      const offset = (i * 53 % count + .5) / count * distance - scroll * pace - time * speed;
      const y = ((offset % distance) + distance) % distance - 50;
      const edge = Math.max(0, Math.min(1, (y + 8) / 52, (height + 8 - y) / 52));
      const size = (.67 + (i % 5) * .14) * (compact ? .85 : 1);
      const rotation = Math.cos(sway) * .24;
      const opacity = edge * (.51 + (i % 4) * .12);
      const color = worker.color;
      if (i % 4 === 0 && opacity > .1) {
        for (let trail = 3; trail >= 1; trail--) {
          const age = trail * .075;
          const priorX = x + (Math.sin(sway - age * (.85 + (i % 5) * .27)) - Math.sin(sway)) * amplitude;
          drawArrow(priorX, y + speed * age, size, rotation, color, opacity * (.27 - trail * .065));
        }
      }
      drawArrow(x, y, size, rotation, color, opacity);
    }
  }

  function measureWorkers(height, width) {
    targetsDirty = false;
    const updates = [];
    const distanceToEnd = Math.max(0, document.documentElement.scrollHeight - height - scrollY);
    for (const worker of workers) {
      const {node, index} = worker;
      const rect = node.getBoundingClientRect();
      const delay = (index % 4) * .046;
      const start = height * (.91 - delay);
      const span = Math.max(height * .2, Math.min(height * .48, start - rect.top + distanceToEnd));
      const phase = node.classList.contains('signal-layer')
        ? (lastProgress - .14 - (index - signalWorkerStart) * .12) / .43
        : (start - rect.top) / span;
      const progress = Math.round(clamp((phase - .22) / .60) * 1000) / 1000;
      if (worker.progress !== progress) updates.push([worker, progress]);
      const left = Math.max(9, rect.left - 5);
      const right = Math.min(width - 23, rect.right + 5);
      const top = Math.max(width <= 760 ? 75 : 96, rect.top - 5);
      const bottom = Math.min(height - 12, rect.bottom + 5);
      worker.rect = phase > 0 && phase < 1 && right > left + 12 && bottom > top + 12
        ? {left, right, top, bottom, phase}
        : null;
    }
    for (const [worker, progress] of updates) {
      worker.progress = progress;
      worker.node.style.setProperty('--construction-progress', progress);
    }
  }

  function paintConstruction({rect, color, index}) {
    const {left, right, top, bottom, phase} = rect;
    const opacity = clamp(phase * 8) * clamp((1 - phase) * 6);
    const draw = clamp((phase - .22) / .60);
    const approach = clamp(phase / .22);
    const depart = clamp((phase - .82) / .18);
    const width = right - left;
    const height = bottom - top;
    const lengths = [width, height, width, height];
    const corners = [[left, top], [right, top], [right, bottom], [left, bottom], [left, top]];
    let remaining = draw * (width + height) * 2;
    let x = left;
    let y = top;
    context.save();
    context.globalAlpha = opacity * (1 - depart) * .78;
    context.lineWidth = 1.4;
    context.strokeStyle = '#78b8f4';
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x, y);
    for (let side = 0; side < lengths.length && remaining > 0; side++) {
      const fraction = Math.min(1, remaining / lengths[side]);
      const [fromX, fromY] = corners[side];
      const [toX, toY] = corners[side + 1];
      x = fromX + (toX - fromX) * fraction;
      y = fromY + (toY - fromY) * fraction;
      context.lineTo(x, y);
      context.fillRect(fromX - 2, fromY - 2, 4, 4);
      remaining -= lengths[side];
    }
    context.stroke();
    context.restore();
    const approachOffset = (1 - approach) ** 2;
    x += (index % 2 === 0 ? 75 : -65) * approachOffset - depart * 40;
    y -= 58 * approachOffset - depart * 44;
    drawArrow(x, y, 1.12, depart * .35, color, opacity);
  }

  function stopCursors() {
    if (cursorFrame) cancelAnimationFrame(cursorFrame);
    cursorFrame = 0;
    cursorLayer.classList.remove('is-moving');
  }

  function onScroll() {
    targetsDirty = true;
    schedule();
  }

  function sync() {
    const next = !reduced.matches && !document.body.classList.contains('motion-paused');
    if (next !== enabled) {
      enabled = next;
      if (enabled) {
        sequence.classList.add('is-scrubbing');
        if (!document.hidden) paint();
      } else {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      }
    }
    if (reduced.matches) {
      sequence.classList.remove('is-scrubbing');
      sequence.style.removeProperty('--signal-progress');
      lastProgress = -1;
    }
    if (!enabled || document.hidden || document.body.classList.contains('surface-covered')) stopCursors();
    else if (cursorShape && !cursorFrame) {
      targetsDirty = true;
      cursorLayer.classList.add('is-moving');
      cursorFrame = requestAnimationFrame(paintCursors);
    }
    if (enabled && !document.hidden) schedule();
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  if (typeof ResizeObserver === 'function') new ResizeObserver(onScroll).observe(document.querySelector('main'));
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  sync();
})();
