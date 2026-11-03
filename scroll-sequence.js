(() => {
  'use strict';
  const sequence = document.querySelector('.signal-sequence');
  if (!sequence) return;

  const stage = sequence.querySelector('.signal-stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 780px) and (min-height: 610px)');
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
    if (enabled && !document.hidden) schedule();
  }

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  sync();
})();
