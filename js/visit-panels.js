/* Visit Backroom — two panels, exactly one active. Desktop/tablet: horizontal (the inactive one is a collapsed strip pinned to its side);
   mobile (<700px): vertical accordion. Activation: hover with intent (mouse), click / tap, keyboard (arrows, Home, End, Enter, Space).
   Auto-advance every --panel-autoplay (7s), paused on hover / focus / off-screen / hidden tab / reduced motion, and for ~13s after a manual action.
   Layout: the content always has its final width (measured here) so text never reflows while a panel resizes; the country name is ONE element
   that rotates and travels between its two places (CSS transform from the variables set below). */
(() => {
  'use strict';
  const root = document.querySelector('[data-panels]'); if (!root) return;
  const panels = [...root.querySelectorAll('.vp')]; if (panels.length < 2) return;
  const probe = root.querySelector('.vp__probe');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const MOBILE = 700;
  const ui = i => ({ vp: panels[i], head: panels[i].querySelector('.vp__head'), btn: panels[i].querySelector('.vp__toggle'), panel: panels[i].querySelector('.vp__panel'), slot: panels[i].querySelector('.vp__slot') });
  const parts = panels.map((_, i) => ui(i));
  let cur = Math.max(0, panels.findIndex(p => p.classList.contains('is-active')));
  const px = v => parseFloat(v) || 0;
  const delay = () => { const v = getComputedStyle(root).getPropertyValue('--panel-autoplay').trim(); return v.endsWith('ms') ? parseFloat(v) : (v.endsWith('s') ? parseFloat(v) * 1000 : 7000); };

  /* ---------- measuring (no reflow of the text while animating) ---------- */
  const layout = () => {
    const mobile = innerWidth < MOBILE, cs = getComputedStyle(root);
    const inner = mobile ? root.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight)
                         : root.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight) - px(cs.columnGap) - probe.offsetWidth;
    root.style.setProperty('--vp-inner-w', Math.max(280, Math.floor(inner)) + 'px');
    const space = px(getComputedStyle(root).getPropertyValue('--vp-img-space')) || 160;
    const heights = parts.map(p => p.panel.offsetHeight);
    if (mobile) { root.style.removeProperty('--vp-content-h'); parts.forEach((p, i) => p.vp.style.setProperty('--vp-open-h', Math.ceil(heights[i] + Math.min(space, 100)) + 'px')); }
    else { root.style.setProperty('--vp-content-h', Math.ceil(Math.max(...heights)) + 'px'); parts.forEach(p => p.vp.style.removeProperty('--vp-open-h')); }
    void root.offsetHeight;
    parts.forEach(p => {
      const pad = px(getComputedStyle(p.panel).paddingLeft), hh = p.head.offsetHeight;
      const vpH = mobile ? probe.offsetHeight : p.vp.offsetHeight;
      const nx0 = pad, ny0 = mobile ? Math.round((vpH - hh) / 2) : Math.round(vpH - pad);                  // collapsed: vertical (desktop/tablet), horizontal strip (mobile)
      const nx1 = p.panel.offsetLeft + p.slot.offsetLeft, ny1 = p.panel.offsetTop + p.slot.offsetTop;      // active: where the title sits in the content
      p.vp.style.setProperty('--nx0', nx0 + 'px'); p.vp.style.setProperty('--ny0', ny0 + 'px');
      p.vp.style.setProperty('--nx1', nx1 + 'px'); p.vp.style.setProperty('--ny1', ny1 + 'px');
    });
  };
  let raf = 0; const relayout = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); };

  /* ---------- keep the page still while a panel above the tapped one shrinks (mobile) ---------- */
  const holdAnchor = el => {                                                    // (instant scrolling: the page itself has scroll-behavior:smooth)
    if (innerWidth >= MOBILE || reduce.matches) return;
    const t0 = performance.now(); let last = el.getBoundingClientRect().top;
    const step = () => { const top = el.getBoundingClientRect().top; if (Math.abs(top - last) > 0.5) scrollBy({ top: top - last, behavior: 'instant' }); last = el.getBoundingClientRect().top; if (performance.now() - t0 < 1000) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };

  /* ---------- state ---------- */
  let manualUntil = 0, hovering = false, focusIn = false, onScreen = false, elapsed = 0, intent = 0;
  const activate = (i, how) => {
    if (i === cur) return;
    const anchorEl = how === 'auto' ? (() => { const mid = innerHeight / 2; return panels.find(p => { const r = p.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; }) || null; })() : panels[i];
    if (anchorEl) holdAnchor(anchorEl);
    cur = i;
    parts.forEach((p, k) => {
      const on = k === i; p.vp.classList.toggle('is-active', on); p.btn.setAttribute('aria-expanded', String(on)); p.panel.inert = !on;
    });
    if (how !== 'auto') { elapsed = -Math.max(0, 13000 - delay()); }          // after a manual action wait ~13s before the next automatic change
    else elapsed = 0;
  };
  const go = (i, how) => activate((i + panels.length) % panels.length, how);

  panels.forEach((p, i) => {
    p.addEventListener('click', e => { if (i !== cur) { e.preventDefault(); activate(i, 'click'); } });
    p.addEventListener('pointerenter', e => {                                  // hover with intent (mouse only)
      if (e.pointerType !== 'mouse' || !fine.matches || i === cur) return;
      clearTimeout(intent); intent = setTimeout(() => activate(i, 'hover'), 150);
    });
    p.addEventListener('pointerleave', () => clearTimeout(intent));
    parts[i].btn.addEventListener('keydown', e => {
      const k = e.key; let t = null;
      if (k === 'ArrowRight' || k === 'ArrowDown') t = i + 1; else if (k === 'ArrowLeft' || k === 'ArrowUp') t = i - 1; else if (k === 'Home') t = 0; else if (k === 'End') t = panels.length - 1;
      if (t === null) return; e.preventDefault(); const n = (t + panels.length) % panels.length; activate(n, 'key'); parts[n].btn.focus();
    });
  });
  root.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hovering = true; });
  root.addEventListener('pointerleave', () => { hovering = false; });
  root.addEventListener('focusin', () => { focusIn = true; }); root.addEventListener('focusout', () => { focusIn = false; });
  new IntersectionObserver(es => { onScreen = es[0].intersectionRatio >= 0.25; }, { threshold: [0, 0.25, 0.5] }).observe(root);

  /* ---------- automatic change: ticks every 500ms; never while paused ---------- */
  setInterval(() => {
    if (reduce.matches || document.hidden || !onScreen || hovering || focusIn) { if (elapsed > 0) elapsed = 0; return; }
    elapsed += 500; if (elapsed >= delay()) go(cur + 1, 'auto');
  }, 500);

  /* ---------- layout triggers ---------- */
  layout();
  addEventListener('resize', relayout); document.addEventListener('bk:lang', () => requestAnimationFrame(layout));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  addEventListener('load', layout);
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(root);
  window.BK = window.BK || {}; BK.visitPanels = { activate: i => activate(i, 'api'), get active() { return cur; } };
})();
