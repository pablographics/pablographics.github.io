/* Visit Backroom — two panels.
   DESKTOP (>=1100): exactly one active (Argentina at load), the other a collapsed strip pinned to its side. Changes by click / keyboard / the automatic timer only (no hover activation).
   TABLET + MOBILE (<1100): vertical stack, BOTH collapsed at load; a tap opens one (60% of the visible height, the other 40%), tapping the open one closes it again.
   One scroll only (the page's): no inner scrolling, no scroll compensation loops. On open the page glides once so the block sits 24px under the header (cancelable by the person scrolling).
   Layout: content always has its final width (measured here) so text never reflows while a panel resizes; the country name is ONE element that rotates / travels via transform variables. */
(() => {
  'use strict';
  const root = document.querySelector('[data-panels]'); if (!root) return;
  const panels = [...root.querySelectorAll('.vp')]; if (panels.length < 2) return;
  const probe = root.querySelector('.vp__probe');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const vertMQ = matchMedia('(max-width:1099px)');
  const parts = panels.map(vp => ({ vp, head: vp.querySelector('.vp__head'), btn: vp.querySelector('.vp__toggle'), panel: vp.querySelector('.vp__panel'), slot: vp.querySelector('.vp__slot') }));
  const px = v => parseFloat(v) || 0;
  const delay = () => { const v = getComputedStyle(root).getPropertyValue('--panel-autoplay').trim(); return v.endsWith('ms') ? parseFloat(v) : (v.endsWith('s') ? parseFloat(v) * 1000 : 7000); };
  const css = n => getComputedStyle(root).getPropertyValue(n).trim();
  let cur = vertMQ.matches ? -1 : Math.max(0, panels.findIndex(p => p.classList.contains('is-active')));
  let measureBN = 0;                                                  // bottom-navbar height that was covering content when the layout was last measured (kept stable during an animation)

  const headerBottom = () => { const n = document.querySelector('.site-header .nav'); const r = n ? n.getBoundingClientRect() : null; return r ? Math.max(0, r.bottom) : 0; };

  /* ---------- measuring ---------- */
  const layout = () => {
    const vert = vertMQ.matches, cs = getComputedStyle(root);
    const inner = vert ? root.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight) : root.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight) - px(cs.columnGap) - probe.offsetWidth;
    root.style.setProperty('--vp-inner-w', Math.max(280, Math.floor(inner)) + 'px');
    const heights = parts.map(p => p.panel.offsetHeight);
    let idleH = probe.offsetHeight || 132, openH = [idleH, idleH], otherH = idleH, avail = 0;
    if (vert) {
      root.style.removeProperty('--vp-content-h');
      const gap = px(cs.rowGap) || 12, share = parseFloat(css('--panel-active-share')) || .6;
      avail = Math.max(320, innerHeight - headerBottom() - 24 - measureBN);
      otherH = Math.max(idleH, Math.round(avail * (1 - share) - gap));
      openH = heights.map(h => Math.max(Math.round(avail * share), Math.ceil(h)));               // grows only if the content does not fit in 60%
      root.style.setProperty('--visit-avail', Math.round(avail) + 'px');
      parts.forEach((p, i) => { const h = cur < 0 ? idleH : (i === cur ? openH[i] : otherH); p.vp.style.setProperty('--vp-h', h + 'px'); p.vp.dataset.h = h; });
    } else {
      root.style.setProperty('--vp-content-h', Math.ceil(Math.max(...heights)) + 'px'); parts.forEach(p => { p.vp.style.removeProperty('--vp-h'); });
    }
    void root.offsetHeight;
    parts.forEach((p, i) => {
      const pad = px(getComputedStyle(p.panel).paddingLeft), hh = p.head.offsetHeight;
      const collapsedH = vert ? (cur < 0 ? idleH : (i === cur ? otherH : otherH)) : p.vp.offsetHeight;
      const nx0 = pad, ny0 = vert ? Math.round((collapsedH - hh) / 2) : Math.round(p.vp.offsetHeight - pad);
      const nx1 = p.panel.offsetLeft + p.slot.offsetLeft, ny1 = p.panel.offsetTop + p.slot.offsetTop;
      p.vp.style.setProperty('--nx0', nx0 + 'px'); p.vp.style.setProperty('--ny0', ny0 + 'px'); p.vp.style.setProperty('--nx1', nx1 + 'px'); p.vp.style.setProperty('--ny1', ny1 + 'px');
    });
    layout.last = { avail, openH, otherH, idleH };
  };
  let raf = 0; const relayout = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); };

  const paintState = () => parts.forEach((p, k) => { const on = k === cur; p.vp.classList.toggle('is-active', on); p.btn.setAttribute('aria-expanded', String(on)); p.panel.inert = !on; });
  const glideToBlock = () => {                                          // ONE smooth scroll (cancelable by the person); the block ends 24px under the header
    const top = root.getBoundingClientRect().top + scrollY - (headerBottom() + 24);
    if (Math.abs(top - scrollY) < 2) return;
    scrollTo({ top: Math.max(0, top), behavior: reduce.matches ? 'auto' : 'smooth' });
  };

  /* ---------- state changes ---------- */
  let manualUntil = 0, hovering = false, focusIn = false, onScreen = false, elapsed = 0;
  const activate = (i, how) => {
    const vert = vertMQ.matches;
    if (vert && i === cur) i = -1;                                      // tapping the open card closes it (both collapsed again)
    if (!vert && i === cur) return;
    if (vert) { const bn = document.getElementById('bnav'); measureBN = bn && !bn.classList.contains('is-hidden') && getComputedStyle(bn).display !== 'none' ? bn.offsetHeight + px(getComputedStyle(bn).bottom) : 0; }
    cur = i; layout(); paintState();
    if (vert && cur >= 0) glideToBlock();
    if (how !== 'auto') elapsed = -Math.max(0, 13000 - delay()); else elapsed = 0;
  };
  const go = (i, how) => activate((i + panels.length) % panels.length, how);

  panels.forEach((p, i) => {
    p.addEventListener('click', e => {
      if (e.target.closest('a')) return;                                // links (CTAs, Instagram) never toggle the card
      if (vertMQ.matches) { const t = e.target; if (i === cur && !(t === p || t.closest('.vp__toggle') || t.classList.contains('vp__bg') || t.classList.contains('vp__img') || t === parts[i].panel)) return; }
      else if (i === cur) return;
      e.preventDefault(); activate(i, 'click');
    });
    parts[i].btn.addEventListener('keydown', e => {
      const k = e.key; let t = null;
      if (k === 'ArrowRight' || k === 'ArrowDown') t = i + 1; else if (k === 'ArrowLeft' || k === 'ArrowUp') t = i - 1; else if (k === 'Home') t = 0; else if (k === 'End') t = panels.length - 1;
      if (t === null) return; e.preventDefault(); const n = (t + panels.length) % panels.length;
      if (vertMQ.matches) { cur = n; layout(); paintState(); glideToBlock(); } else activate(n, 'key');
      parts[n].btn.focus();
    });
  });
  root.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hovering = true; });
  root.addEventListener('pointerleave', () => { hovering = false; });
  root.addEventListener('focusin', () => { focusIn = true; }); root.addEventListener('focusout', () => { focusIn = false; });
  new IntersectionObserver(es => { onScreen = es[0].intersectionRatio >= 0.25; }, { threshold: [0, 0.25, 0.5] }).observe(root);

  /* ---------- automatic change: DESKTOP only, never while paused ---------- */
  setInterval(() => {
    if (vertMQ.matches || reduce.matches || document.hidden || !onScreen || hovering || focusIn) { if (elapsed > 0) elapsed = 0; return; }
    elapsed += 500; if (elapsed >= delay()) go(cur + 1, 'auto');
  }, 500);

  /* ---------- triggers ---------- */
  const init = () => { cur = vertMQ.matches ? -1 : 0; layout(); paintState(); };
  vertMQ.addEventListener('change', init);
  init();
  addEventListener('resize', relayout); document.addEventListener('bk:lang', () => requestAnimationFrame(layout));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  addEventListener('load', layout);
  if ('ResizeObserver' in window) { new ResizeObserver(relayout).observe(root); const n = document.querySelector('.site-header .nav'); if (n) new ResizeObserver(relayout).observe(n); }
  window.BK = window.BK || {}; BK.visitPanels = { activate: i => activate(i, 'api'), get active() { return cur; }, get metrics() { return layout.last; } };
})();
