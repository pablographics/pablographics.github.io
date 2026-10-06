/* Custom cursor — fine pointers only. One delegated listener, rAF lerp, transform-only.
   Hidden until the first mousemove and while the loading screen is up. Label comes from the page's i18n ("view" / "ver"). */
(() => {
  'use strict';
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  if (!fine.matches) return;
  const html = document.documentElement, el = document.getElementById('cursor');
  if (!el) return;
  const INTERACTIVE = 'a[href],button:not([disabled]),[role="button"],[data-cursor],summary,label[for],select,input[type="range"]';
  const TEXT = 'input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]),textarea,[contenteditable="true"]';
  const LERP = 0.2, HALF = 38;
  let x = -200, y = -200, cx = -200, cy = -200, raf = 0, last = 0, seen = false, over = false, textMode = false;

  const loop = t => {
    const dt = Math.min(64, t - (last || t)); last = t;
    const k = 1 - Math.pow(1 - LERP, dt / 16.667);              // frame-rate independent smoothing
    cx += (x - cx) * k; cy += (y - cy) * k;
    el.style.transform = `translate3d(${(cx - HALF).toFixed(2)}px,${(cy - HALF).toFixed(2)}px,0)`;
    if (Math.abs(x - cx) + Math.abs(y - cy) > 0.05) raf = requestAnimationFrame(loop); else { raf = 0; last = 0; }
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const setOver = t => {
    const tgt = t && t.closest ? t : null;
    textMode = !!(tgt && tgt.closest(TEXT));
    el.classList.toggle('is-on', seen && !textMode);
    const on = !!(tgt && tgt.closest(INTERACTIVE)) && !(tgt.closest('[data-cursor="off"]'));
    if (on !== over) { over = on; el.classList.toggle('is-hover', on); }
  };
  const init = () => {
    html.classList.add('has-cursor');
    addEventListener('mousemove', e => {
      x = e.clientX; y = e.clientY;
      if (!seen) { seen = true; cx = x; cy = y; el.style.transform = `translate3d(${x - HALF}px,${y - HALF}px,0)`; }
      setOver(e.target); kick();
    }, { passive: true });
    document.addEventListener('pointerover', e => { if (e.pointerType === 'mouse') setOver(e.target); }, { passive: true });
    document.addEventListener('mouseleave', () => { el.classList.remove('is-on'); });          // soft-hide when the mouse leaves the window
    document.addEventListener('mouseenter', e => { if (seen) { x = e.clientX; y = e.clientY; setOver(e.target); } });
    // while scrolling the pointer is still but the element under it changes
    let st = 0; addEventListener('scroll', () => { if (st || !seen) return; st = requestAnimationFrame(() => { st = 0; setOver(document.elementFromPoint(x, y)); }); }, { passive: true });
    addEventListener('blur', () => el.classList.remove('is-on'));
    addEventListener('mousedown', () => el.classList.add('is-down'));
    addEventListener('mouseup', () => el.classList.remove('is-down'));
  };
  if (html.classList.contains('has-intro')) document.addEventListener('bk:intro-done', init, { once: true }); else init();
})();
