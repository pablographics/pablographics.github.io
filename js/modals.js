/* Book-a-table popup + gallery lightbox. One layer open at a time; shared focus trap, scroll lock, Esc, focus return. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const BK = window.BK, reduce = BK.reduce;
  const CLOSE_MS = () => (reduce.matches ? 10 : 210);
  let active = null;                                   // { el, opener, onKey }

  function openLayer(el, opener, onKey) {
    if (active) return false;
    active = { el, opener, onKey };
    el.hidden = false; BK.lock('layer'); BK.inert(true);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-open')));
    const f = BK.focusables(el); (el.querySelector('[data-autofocus]') || f[0]).focus({ preventScroll: true });
    return true;
  }
  function closeLayer(after) {
    if (!active) return;
    const { el, opener } = active; active = null;
    el.classList.remove('is-open'); BK.unlock('layer'); BK.inert(false);
    const back = opener && opener.isConnected && opener.getClientRects().length ? opener : $('.nav__toggle') || document.body;
    back.focus({ preventScroll: true });                // focus returns to whatever opened the layer
    setTimeout(() => { el.hidden = true; if (after) after(); }, CLOSE_MS());
  }
  addEventListener('keydown', e => {
    if (!active) return;
    if (e.key === 'Escape') { e.preventDefault(); active.close ? active.close() : closeLayer(); return; }
    BK.trap(BK.focusables(active.el), e);
    if (active.onKey) active.onKey(e);
  });

  /* ---------- BOOK A TABLE ---------- */
  const book = $('#book-modal');
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-book]'); if (!b) return;
    e.preventDefault();
    openLayer(book, b);
  });
  book.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeLayer(); });

  /* ---------- LIGHTBOX ---------- */
  const lb = $('#lb'), frame = $('.lb__frame', lb), stage = $('.lb__stage', lb), thumbsIn = $('.lb__thumbs-in', lb);
  const curEl = $('.lb__cur', lb), totEl = $('.lb__tot', lb), labelEl = $('#lb-label'), prevB = $('.lb__nav--prev', lb), nextB = $('.lb__nav--next', lb), closeB = $('.lb__x', lb);
  let items = [], idx = 0, cur = null, busy = 0;
  const pad = n => String(n).padStart(2, '0');
  const tick = el => { if (!reduce.matches && el.animate) el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(0.23,1,0.32,1)' }); };

  const preload = i => { const it = items[i]; if (it) { const im = new Image(); im.decoding = 'async'; im.src = it.lg; } };
  function buildThumbs() {
    thumbsIn.textContent = '';
    items.forEach((it, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'lb__thumb'; b.setAttribute('aria-label', BK.ui().go(i + 1)); b.setAttribute('aria-current', 'false');
      const im = new Image(); im.src = it.th; im.alt = ''; im.width = 64; im.height = 64; im.decoding = 'async'; b.appendChild(im);
      b.addEventListener('click', () => show(i)); thumbsIn.appendChild(b);
    });
  }
  function syncChrome(instant) {
    const it = items[idx];
    labelEl.textContent = it.label; curEl.textContent = pad(idx + 1); totEl.textContent = pad(items.length);
    if (!instant) { tick(curEl); tick(labelEl); }
    prevB.setAttribute('aria-disabled', String(idx === 0)); nextB.setAttribute('aria-disabled', String(idx === items.length - 1));
    $$('.lb__thumb', thumbsIn).forEach((t, i) => t.setAttribute('aria-current', i === idx ? 'true' : 'false'));
    const t = $$('.lb__thumb', thumbsIn)[idx];
    if (t) thumbsIn.scrollTo({ left: t.offsetLeft - (thumbsIn.clientWidth - t.offsetWidth) / 2, behavior: instant || reduce.matches ? 'auto' : 'smooth' });
    preload(idx + 1); preload(idx - 1);                 // next + previous are ready before they are needed
  }
  function show(i, instant) {
    i = Math.max(0, Math.min(items.length - 1, i));
    if (!instant && i === idx && cur) return;
    const dir = instant ? 0 : (i > idx ? 1 : -1); idx = i;
    const img = new Image(); img.className = 'lb__img'; img.alt = items[i].alt; img.decoding = 'async'; img.draggable = false;
    img.style.setProperty('--dx', String(dir * 28));
    const old = cur; cur = img; const token = ++busy;
    const enter = () => {
      if (token !== busy) { img.remove(); return; }
      if (old) { old.style.transform = ''; old.style.opacity = ''; old.classList.remove('is-drag'); old.style.setProperty('--dx', String(dir * 28)); old.classList.remove('is-in'); old.classList.add('is-out'); setTimeout(() => old.remove(), 260); }
      requestAnimationFrame(() => img.classList.add('is-in'));
    };
    frame.appendChild(img); img.src = items[i].lg;
    (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(enter);
    syncChrome(instant);
  }
  const imgRect = () => {
    if (!cur || !cur.naturalWidth) return null;
    const b = frame.getBoundingClientRect(), s = Math.min(b.width / cur.naturalWidth, b.height / cur.naturalHeight), w = cur.naturalWidth * s, h = cur.naturalHeight * s;
    return { l: b.left + (b.width - w) / 2, t: b.top + (b.height - h) / 2, r: b.left + (b.width + w) / 2, b: b.top + (b.height + h) / 2 };
  };
  function closeLb() {
    const index = idx;
    closeLayer(() => { frame.textContent = ''; cur = null; busy++; document.dispatchEvent(new CustomEvent('bk:lightbox-close', { detail: { index } })); });
  }
  document.addEventListener('bk:lightbox-open', e => {
    const d = e.detail; items = d.items; idx = d.index; cur = null; frame.textContent = '';
    buildThumbs();
    if (!openLayer(lb, d.trigger, ev => {
      if (ev.key === 'ArrowRight') { ev.preventDefault(); show(idx + 1); }
      else if (ev.key === 'ArrowLeft') { ev.preventDefault(); show(idx - 1); }
      else if (ev.key === 'Home') { ev.preventDefault(); show(0); }
      else if (ev.key === 'End') { ev.preventDefault(); show(items.length - 1); }
    })) return;
    active.close = closeLb;
    closeB.setAttribute('data-autofocus', '');
    show(idx, true);
  });
  closeB.addEventListener('click', closeLb);
  prevB.addEventListener('click', () => show(idx - 1));
  nextB.addEventListener('click', () => show(idx + 1));
  // click outside the photo closes
  let dragged = false;
  lb.addEventListener('click', e => {
    if (dragged) { dragged = false; return; }
    if (e.target.closest('.lb__x,.lb__nav,.lb__thumb,.lb__label,.lb__count')) return;
    const r = imgRect(); if (r && e.clientX >= r.l && e.clientX <= r.r && e.clientY >= r.t && e.clientY <= r.b) return;
    closeLb();
  });
  // swipe (touch / pen / mouse drag) on the stage
  let sx = 0, sy = 0, dx = 0, t0 = 0, drag = false, lock = null, pid = null;
  stage.addEventListener('pointerdown', e => { if (e.target.closest('.lb__nav') || !cur) return; drag = true; lock = null; sx = e.clientX; sy = e.clientY; dx = 0; t0 = performance.now(); pid = e.pointerId; });
  stage.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== pid) return;
    const mx = e.clientX - sx, my = e.clientY - sy;
    if (lock === null && Math.hypot(mx, my) > 8) { lock = Math.abs(mx) > Math.abs(my); if (lock) { stage.setPointerCapture(pid); cur.classList.add('is-drag'); } }
    if (!lock) return;
    dx = mx; cur.style.transform = `translate3d(${dx}px,0,0)`; cur.style.opacity = String(1 - Math.min(0.5, Math.abs(dx) / 600));
  });
  const endSwipe = e => {
    if (!drag || (e && e.pointerId !== pid)) return; drag = false;
    if (!lock) return;
    dragged = true; setTimeout(() => { dragged = false; }, 0);
    const v = Math.abs(dx) / Math.max(1, performance.now() - t0);
    if ((Math.abs(dx) > 60 || v > 0.35) && !((dx < 0 && idx === items.length - 1) || (dx > 0 && idx === 0))) show(idx + (dx < 0 ? 1 : -1));
    else { cur.classList.remove('is-drag'); cur.style.transform = ''; cur.style.opacity = ''; }   // snap back
  };
  stage.addEventListener('pointerup', endSwipe); stage.addEventListener('pointercancel', endSwipe);
  document.addEventListener('bk:lang', () => $$('.lb__thumb', thumbsIn).forEach((t, i) => t.setAttribute('aria-label', BK.ui().go(i + 1))));
})();
