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
  const targets = [...document.querySelectorAll('main h1, main h2, .project-preview')];
  let visibleTarget;
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
    if (targetsDirty) {
      visibleTarget = undefined;
      for (const target of targets) {
        const rect = target.getBoundingClientRect();
        if (rect.top >= 100 && rect.bottom <= height - 62) {
          visibleTarget = rect;
          break;
        }
      }
      targetsDirty = false;
    }
    const time = now / 1000;
    const scroll = scrollY;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.lineWidth = 1.5;
    context.lineJoin = 'round';
    context.strokeStyle = '#191a17';
    const compact = width < 760;
    const count = compact ? 21 : 34;
    const distance = height + 100;
    for (let i = 0; i < count; i++) {
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
      const color = colors[i % colors.length];
      if (i % 4 === 0 && opacity > .1) {
        for (let trail = 3; trail >= 1; trail--) {
          const age = trail * .075;
          const priorX = x + (Math.sin(sway - age * (.85 + (i % 5) * .27)) - Math.sin(sway)) * amplitude;
          drawArrow(priorX, y + speed * age, size, rotation, color, opacity * (.27 - trail * .065));
        }
      }
      drawArrow(x, y, size, rotation, color, opacity);
    }
    if (visibleTarget) paintSelection(visibleTarget, time);
  }

  function paintSelection(rect, time) {
    const phase = time % 4.2;
    if (phase > 2) return;
    const opacity = Math.min(1, phase * 4, (2 - phase) * 4);
    const left = Math.max(8, rect.left - 6);
    const top = rect.top - 5;
    const right = Math.min(cursorWidth - 22, rect.right + 6);
    const bottom = rect.bottom + 5;
    const travel = Math.min(1, Math.max(0, (phase - 1.25) / .75));
    context.save();
    context.globalAlpha = opacity * .67 * (1 - travel);
    context.lineWidth = 1;
    context.strokeStyle = '#78b8f4';
    context.fillStyle = '#d0e8ff';
    context.strokeRect(left, top, right - left, bottom - top);
    for (const x of [left, right]) {
      context.fillRect(x - 2, top - 2, 4, 4);
      context.fillRect(x - 2, bottom - 2, 4, 4);
    }
    context.restore();
    drawArrow(right + travel * 36, top + travel * 45, 1, travel * .38, '#aed6ff', opacity);
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
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  sync();
})();
