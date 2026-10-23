(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const ACTIONS = 'a[href],button,summary,[role="button"],[role="link"],[data-cursor="pull"],input[type="button"],input[type="submit"],input[type="reset"]';
  const NATIVE = 'textarea,select,iframe,input:not([type="button"]):not([type="submit"]):not([type="reset"]),[contenteditable]:not([contenteditable="false"]),[data-native-cursor]';
  let sequence = 0;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const mix = (a, b, amount) => a + (b - a) * amount;
  const smooth = value => value * value * (3 - 2 * value);
  const number = value => Number(value.toFixed(2));
  function svg(tag, attributes = {}) {
    const node = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }
  function mount({ reducedMotion = false } = {}) {
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const id = `mk-glove-${++sequence}`;
    const root = document.createElement('div');
    root.className = 'symbiote-cursor';
    root.setAttribute('aria-hidden', 'true');
    root.dataset.state = 'native';
    const web = svg('svg', { class: 'symbiote-webs', 'aria-hidden': 'true' });
    const glove = svg('svg', { class: 'symbiote-glove', viewBox: '0 0 100 122', 'aria-hidden': 'true' });
    // Five separate fingers, rolled cuff, running seams and worn cotton folds.
    // The index silhouette is articulated in paintGlove(), rather than stretched.
    glove.innerHTML = `<defs>
      <linearGradient id="${id}-cotton" x1=".15" y1="0" x2=".9" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#fffdf4"/><stop offset=".43" stop-color="#eee9de"/><stop offset="1" stop-color="#b4ac9e"/></linearGradient>
      <radialGradient id="${id}-palm" cx=".35" cy=".25" r=".85"><stop stop-color="#fffdf5"/><stop offset=".65" stop-color="#e9e4d9"/><stop offset="1" stop-color="#b8ae9e"/></radialGradient>
      <linearGradient id="${id}-cuff" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffaf0"/><stop offset=".5" stop-color="#d0c7b7"/><stop offset="1" stop-color="#f6f0e4"/></linearGradient>
    </defs>
    <g class="glove-hand">
      <path class="glove-outline" fill="url(#${id}-cotton)" d="M48 69C45 59 45 45 48 35C50 27 56 25 62 28C69 32 67 42 65 49L65 71Z"/>
      <path class="glove-crease" d="M49 42Q55 37 64 43M51 48Q56 44 63 48"/>
      <path class="glove-stitch" d="M60 30C64 37 59 45 60 56"/>
      <path class="glove-highlight" d="M51 33Q56 29 59 32"/>
      <path class="glove-outline" fill="url(#${id}-cotton)" d="M60 76C60 67 63 47 68 40C72 34 79 36 83 42C86 48 81 59 78 67L77 79Z"/>
      <path class="glove-crease" d="M67 52Q74 48 81 52M67 58Q73 54 78 58"/>
      <path class="glove-stitch" d="M78 40Q83 48 73 68"/>
      <path class="glove-highlight" d="M71 43Q75 39 78 43"/>
      <path class="glove-outline" fill="url(#${id}-cotton)" d="M72 86C72 77 80 56 86 53C92 50 98 56 96 63C95 72 87 81 85 88Z"/>
      <path class="glove-crease" d="M82 66Q87 62 93 66"/>
      <path class="glove-stitch" d="M91 56Q95 63 85 76"/>
      <path class="glove-outline glove-index" fill="url(#${id}-cotton)"/>
      <path class="glove-crease glove-index-fold"/>
      <path class="glove-stitch glove-index-seam"/>
      <path class="glove-highlight glove-index-light"/>
      <path class="glove-outline" fill="url(#${id}-palm)" d="M31 57C40 55 48 57 53 62C63 55 74 59 80 67C88 76 87 87 78 98C72 106 48 108 36 99C26 92 20 74 26 64Z"/>
      <path class="glove-outline" fill="url(#${id}-cotton)" d="M35 83C25 83 19 78 13 73C4 65 1 55 8 51C14 47 19 54 24 59C27 62 31 63 36 65C45 69 43 79 35 83Z"/>
      <path class="glove-crease" d="M14 57Q10 61 15 67M27 69Q29 73 26 78M40 76Q36 86 43 92M51 75Q56 82 55 90M64 72Q67 78 65 86"/>
      <path class="glove-stitch" d="M9 54C5 62 21 78 34 78M36 61C26 76 36 94 52 99C64 104 77 93 80 84"/>
      <path class="glove-highlight" d="M40 64Q46 61 50 65M68 65Q75 67 78 73M10 54Q14 53 18 58"/>
      <path class="glove-outline" fill="#756a5b" d="M38 99Q58 92 80 98L79 113Q62 122 40 114Z"/>
      <path class="glove-outline" fill="url(#${id}-cuff)" d="M35 99C44 93 69 93 82 98L83 111C70 119 46 118 35 112Z"/>
      <path class="glove-crease" d="M36 102Q59 111 82 102M40 113Q61 118 79 112"/>
      <path class="glove-stitch" d="M38 100Q58 107 80 100M38 111Q59 117 80 110"/>
      <path fill="#bd714f" d="M72 103L77 102L77 110L72 112Z"/>
      <path fill="none" stroke="#f4d4b6" stroke-width=".8" d="M73 104L76 107M76 103L73 108"/>
    </g>`;
    root.append(web, glove);
    document.body.append(root);
    const index = glove.querySelector('.glove-index');
    const fold = glove.querySelector('.glove-index-fold');
    const seam = glove.querySelector('.glove-index-seam');
    const highlight = glove.querySelector('.glove-index-light');
    const disposers = [];
    const strands = [];
    const pointer = { x: 0, y: 0, inside: false, mouse: false, native: false };
    let paused = Boolean(reducedMotion), destroyed = false, keyboard = false;
    let frame = 0, lastTime = 0, rectTime = 0, dirty = true, host = document.body;
    let targets = [], desired = null, extension = 0, press = 0, pressed = false;
    let pullX = 0, pullY = 0, tilt = 0, lastX = 0, lastY = 0;
    function listen(object, event, handler, options) {
      object.addEventListener(event, handler, options);
      disposers.push(() => object.removeEventListener(event, handler, options));
    }
    function eligible() {
      return !destroyed && !paused && !reduced.matches && fine.matches && pointer.mouse && pointer.inside && !pointer.native && !keyboard && !document.hidden;
    }
    function nativeCursor() {
      document.documentElement.classList.remove('symbiote-cursor-active');
      root.classList.remove('is-visible');
      root.dataset.state = 'native';
    }
    function schedule() { if (!frame && !destroyed) frame = requestAnimationFrame(tick); }
    function clearWebs() {
      strands.forEach(connection => connection.group.remove());
      strands.length = 0; desired = null;
      root.dataset.strands = '0';
      root.dataset.target = '';
    }
    function updateHost() {
      const dialogs = Array.from(document.querySelectorAll('dialog[open]'));
      const next = dialogs[dialogs.length - 1] || document.body;
      if (host !== next || root.parentNode !== next) {
        host = next;
        host.append(root);
        clearWebs();
        dirty = true;
      }
    }
    function readTargets(time) {
      if (!dirty && time - rectTime < 140) return;
      updateHost();
      targets = Array.from(host.querySelectorAll(ACTIONS)).filter(node => {
        return !root.contains(node) && !node.disabled && node.getAttribute('aria-disabled') !== 'true' && !node.closest('[hidden],[inert]');
      }).map(node => ({node, rect: node.getBoundingClientRect()})).filter(({node, rect}) => {
        return rect.width > 0 && rect.height > 0 && rect.bottom >= -150 && rect.top <= innerHeight + 150 && rect.right >= -150 && rect.left <= innerWidth + 150 && getComputedStyle(node).visibility !== 'hidden';
      });
      dirty = false; rectTime = time;
    }
    function closestTarget() {
      let best = null, distance = 142;
      for (const item of targets) {
        const x = clamp(pointer.x, item.rect.left, item.rect.right);
        const y = clamp(pointer.y, item.rect.top, item.rect.bottom);
        const d = Math.hypot(pointer.x - x, pointer.y - y);
        if (d < distance) { best = item; distance = d; }
      }
      if (!best) return null;
      best.distance = distance;
      best.amount = smooth(1 - clamp(distance / 142, 0, 1));
      return best;
    }
    function anchor(rect, offset = 0) {
      const x = clamp(pointer.x, rect.left, rect.right);
      const y = clamp(pointer.y, rect.top, rect.bottom);
      const sides = [Math.abs(pointer.x - rect.left), Math.abs(pointer.x - rect.right), Math.abs(pointer.y - rect.top), Math.abs(pointer.y - rect.bottom)];
      const side = sides.indexOf(Math.min(...sides));
      if (side < 2) return {x: side === 0 ? rect.left : rect.right, y: clamp(y + offset, rect.top + 2, rect.bottom - 2)};
      return {x: clamp(x + offset, rect.left + 2, rect.right - 2), y: side === 2 ? rect.top : rect.bottom};
    }
    function connect(item) {
      let connection = strands.find(entry => entry.node === item.node);
      if (!connection) {
        const group = svg('g');
        const paths = Array.from({length: 5}, () => {
          const edge = svg('path', {class: 'symbiote-web-edge'});
          const core = svg('path', {class: 'symbiote-web-core'});
          group.append(edge, core); return {edge, core};
        });
        const shine = svg('path', {class: 'symbiote-web-shine'}); group.append(shine);
        web.append(group);
        connection = {node: item.node, rect: item.rect, amount: 0, phase: Math.random() * 6.28, group, paths, shine};
        strands.push(connection);
      }
      connection.rect = item.rect;
      while (strands.length > 2) { const old = strands.shift(); old.group.remove(); }
      return connection;
    }
    function paintGlove(amount, x, y, angle) {
      // Two joints unfold in sequence: base first, then the fingertip.
      const base = smooth(clamp(amount * 1.3, 0, 1));
      const distal = smooth(clamp((amount - .12) / .88, 0, 1));
      const tipX = mix(53, 35, distal), tipY = mix(26, 5, base);
      const jointX = mix(35, 36, base), jointY = mix(39, 31, base);
      index.setAttribute('d', `M30 65C27 55 27 45 ${jointX - 7} ${jointY}C${jointX - 7} ${jointY - 8} ${tipX - 9} ${tipY - 2} ${tipX} ${tipY}C${tipX + 8} ${tipY + 1} ${tipX + 10} ${tipY + 9} ${tipX + 5} ${tipY + 14}L${jointX + 10} ${jointY + 7}C${jointX + 10} 53 47 59 47 66Z`);
      fold.setAttribute('d', `M${jointX - 3} ${jointY + 7}Q${jointX + 4} ${jointY + mix(9, 5, amount)} ${jointX + 9} ${jointY + 9}M${tipX - 5} ${tipY + 14}Q${tipX + 1} ${tipY + 18} ${tipX + 6} ${tipY + 15}`);
      seam.setAttribute('d', `M${tipX + 4} ${tipY + 4}C${tipX + 12} ${tipY + 15} ${jointX + 5} ${jointY} ${jointX + 6} ${jointY + 13}L40 60`);
      highlight.setAttribute('d', `M${tipX - 5} ${tipY + 4}Q${tipX - 1} ${tipY + 1} ${tipX + 3} ${tipY + 5}`);
      const scale = .63 * (1 - press * .055);
      // Keep the drawn fingertip at the real click position even during bending.
      glove.style.transform = `translate(${number(x)}px,${number(y)}px) rotate(${number(angle)}deg) scale(${number(scale)}) translate(${-number(tipX)}px,${-number(tipY)}px)`;
      root.dataset.extension = amount.toFixed(2);
    }
    function paintConnection(connection, x, y, time) {
      const amount = connection.amount;
      const rect = connection.rect;
      const endX = mix(anchor(rect).x, x, smooth(clamp(amount * 2.2, 0, 1)));
      const endY = mix(anchor(rect).y, y, smooth(clamp(amount * 2.2, 0, 1)));
      connection.group.setAttribute('opacity', clamp(amount * 1.7, 0, 1).toFixed(3));
      connection.paths.forEach(({edge, core}, i) => {
        const start = anchor(rect, (i - 2) * (3 + 4 * amount));
        const dx = endX - start.x, dy = endY - start.y, length = Math.max(1, Math.hypot(dx, dy));
        const normalX = -dy / length, normalY = dx / length;
        const sway = Math.sin(time * .0024 + connection.phase + i * 1.8) * Math.min(8, length * .055);
        const spread = (i - 2) * (2.3 + (1 - amount) * 3) + sway;
        const c1x = start.x + dx * .25 + normalX * spread;
        const c1y = start.y + dy * .25 + normalY * spread;
        const c2x = start.x + dx * .72 - normalX * spread * .45;
        const c2y = start.y + dy * .72 - normalY * spread * .45;
        const d = `M${number(start.x)} ${number(start.y)}C${number(c1x)} ${number(c1y)} ${number(c2x)} ${number(c2y)} ${number(endX)} ${number(endY)}`;
        const width = (.28 + amount * (i === 2 ? 2.1 : 1.1)) * (i % 2 ? .72 : 1);
        edge.setAttribute('d', d); core.setAttribute('d', d);
        edge.setAttribute('stroke-width', (width + .9).toFixed(2)); core.setAttribute('stroke-width', width.toFixed(2));
        if (i === 2) { connection.shine.setAttribute('d', d); connection.shine.setAttribute('stroke-width', Math.max(.2, width * .19).toFixed(2)); }
      });
    }
    function tick(time) {
      frame = 0;
      if (!eligible()) { nativeCursor(); clearWebs(); lastTime = 0; return; }
      const dt = lastTime ? clamp((time - lastTime) / 16.667, .2, 3) : 1;
      lastTime = time;
      readTargets(time);
      desired = closestTarget();
      const active = desired ? connect(desired) : null;
      const strength = desired ? desired.amount : 0;
      extension = mix(extension, strength, 1 - Math.pow(.78, dt));
      press = mix(press, pressed ? 1 : 0, 1 - Math.pow(.56, dt));
      const attachment = desired ? anchor(desired.rect) : {x:pointer.x,y:pointer.y};
      const distance = Math.max(1, Math.hypot(attachment.x-pointer.x, attachment.y-pointer.y));
      const attraction = strength * Math.min(4.5, distance * .07);
      pullX = mix(pullX, (attachment.x-pointer.x)/distance*attraction, 1-Math.pow(.8,dt));
      pullY = mix(pullY, (attachment.y-pointer.y)/distance*attraction, 1-Math.pow(.8,dt));
      const velocity = clamp((pointer.x-lastX)*.14 - (pointer.y-lastY)*.05,-5,5);
      tilt = mix(tilt, velocity + (attachment.x-pointer.x)/distance*strength*9, 1-Math.pow(.83,dt));
      lastX = pointer.x; lastY = pointer.y;
      const x = pointer.x + pullX, y = pointer.y + pullY;
      for (let i = strands.length - 1; i >= 0; i--) {
        const connection = strands[i];
        connection.amount = mix(connection.amount, connection === active ? strength : 0, 1-Math.pow(connection === active ? .75 : .84,dt));
        if (connection !== active && connection.amount < .007) { connection.group.remove(); strands.splice(i,1); }
        else paintConnection(connection,x,y,time);
      }
      paintGlove(extension,x,y,tilt);
      root.dataset.state = pressed ? 'pressed' : desired && desired.distance < 1 ? 'holding' : desired ? 'pulling' : 'free';
      root.dataset.strands = String(strands.length * 5);
      root.dataset.target = desired ? desired.node.id || desired.node.tagName.toLowerCase() : '';
      root.dataset.distance = desired ? desired.distance.toFixed(1) : '';
      root.classList.add('is-visible');
      document.documentElement.classList.add('symbiote-cursor-active');
      schedule();
    }
    function move(event) {
      pointer.x = event.clientX; pointer.y = event.clientY;
      pointer.mouse = event.pointerType === 'mouse' || !event.pointerType;
      pointer.inside = true;
      pointer.native = Boolean(event.target instanceof Element && event.target.closest(NATIVE));
      keyboard = false;
      if (eligible()) schedule(); else { nativeCursor(); clearWebs(); }
    }
    function leave(event) {
      if (!event.relatedTarget) { pointer.inside = false; pressed = false; nativeCursor(); clearWebs(); }
      else if(event.relatedTarget instanceof Element && event.relatedTarget.closest(NATIVE)) {
        pointer.native=true; nativeCursor(); clearWebs();
      }
    }
    function invalidate() { dirty = true; if (eligible()) schedule(); }
    function availability() { if (!eligible()) { nativeCursor(); clearWebs(); } else schedule(); }
    listen(document,'pointermove',move,{passive:true});
    listen(document,'pointerout',leave,{passive:true});
    listen(document,'pointerdown',event=>{ if (event.pointerType === 'touch') { pointer.mouse=false; availability(); } else { pressed=true; schedule(); } },{passive:true});
    listen(document,'pointerup',()=>{pressed=false;schedule();},{passive:true});
    listen(document,'pointercancel',()=>{pressed=false;pointer.inside=false;availability();},{passive:true});
    listen(document,'keydown',event=>{if(event.key==='Tab'||event.key==='Escape'){keyboard=true;pressed=false;availability();}});
    listen(window,'blur',()=>{pointer.inside=false;pressed=false;availability();});
    listen(document,'visibilitychange',availability);
    listen(window,'resize',invalidate,{passive:true});
    listen(document,'scroll',invalidate,{passive:true,capture:true});
    listen(fine,'change',availability);
    listen(reduced,'change',availability);
    const observer = new MutationObserver(records => {
      if (records.some(record => !root.contains(record.target))) {
        updateHost(); dirty=true;
        if(eligible()) schedule();
      }
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open','hidden','disabled','inert']});
    paintGlove(0,0,0,0);
    return {
      setPaused(value) { paused=Boolean(value); if(paused){nativeCursor();clearWebs();}else if(eligible())schedule(); },
      destroy() {
        if(destroyed)return;
        destroyed=true;
        cancelAnimationFrame(frame); frame=0;
        observer.disconnect(); disposers.forEach(dispose=>dispose()); clearWebs(); nativeCursor(); root.remove();
      }
    };
  }
  window.SymbioteCursor = Object.freeze({mount});
})();
