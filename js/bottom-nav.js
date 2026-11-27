/* Bottom navbar (tablet + mobile): hides itself a few seconds after it appears and comes back ONLY when the person scrolls up.
   - visible while the page is at the very top (first ~56px) and while there is focus / a press inside it;
   - hidden after --bottom-nav-autohide (3.5s) counted from the last upward scroll or interaction; scrolling down never shows it;
   - ignores iOS rubber-banding (scroll outside 0..max) and browser-bar resizes; frozen while a popup is open;
   - hidden = translateY + fade (CSS), `visibility:hidden` after the exit and `inert` (nothing focusable / read by screen readers).
   One passive listener + requestAnimationFrame, no work per event beyond reading scrollY. The header (logo + CTA) is never touched. */
(() => {
  'use strict';
  const nav = document.getElementById('bnav'); if (!nav) return;
  const mq = matchMedia('(max-width:1099px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const html = document.documentElement;
  const TOP = 56, UP = 12;
  const delay = () => { const v = getComputedStyle(nav).getPropertyValue('--bottom-nav-autohide').trim(); return v.endsWith('ms') ? parseFloat(v) : (v.endsWith('s') ? parseFloat(v) * 1000 : 3500); };
  let hidden = false, last = scrollY, up = 0, timer = 0, ticking = false, pressing = false, lastH = innerHeight, hMark = 0, inertTimer = 0;

  const apply = () => {                                              // reflect the state in the DOM (also re-applied when a popup closes: BK.inert(false) would clear it)
    nav.classList.toggle('is-hidden', hidden);
    clearTimeout(inertTimer);
    if (hidden) inertTimer = setTimeout(() => { if (hidden) nav.inert = true; }, reduce.matches ? 220 : 420);
    else nav.inert = false;
  };
  const show = () => { if (!hidden) { arm(); return; } hidden = false; apply(); if (BK.relayoutNav) BK.relayoutNav(); arm(); };   // indicator already on the right item (no accumulated animation)
  const hide = () => { if (hidden || !mq.matches || pressing || html.classList.contains('is-locked') || nav.contains(document.activeElement) || scrollY <= TOP) return; hidden = true; apply(); };
  const arm = () => { clearTimeout(timer); if (!mq.matches || scrollY <= TOP || pressing) return; timer = setTimeout(hide, delay()); };

  const frame = () => {
    ticking = false;
    if (!mq.matches || html.classList.contains('is-locked')) { last = scrollY; return; }
    const max = Math.max(0, html.scrollHeight - innerHeight), y = scrollY;
    if (y < 0 || y > max) return;                                      // rubber band (iOS): not a real scroll
    if (performance.now() - hMark < 160) { last = y; return; }         // the browser bar showed / hid (height change): not the person scrolling
    const dy = y - last; last = y;
    if (y <= TOP) { up = 0; show(); return; }                          // at the top you cannot scroll up to get it back: it stays
    if (dy < 0) { up += -dy; if (up >= UP) { show(); arm(); } }        // scrolling up: back (and the countdown restarts)
    else if (dy > 0) up = 0;                                           // scrolling down never shows it
    if (!hidden && !timer) arm();
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', () => { if (Math.abs(innerHeight - lastH) > 0) hMark = performance.now(); lastH = innerHeight; });

  /* interaction: press / focus keeps it (and pauses the countdown); letting go restarts it */
  nav.addEventListener('pointerdown', () => { pressing = true; clearTimeout(timer); });
  const release = () => { if (!pressing) return; pressing = false; arm(); };
  addEventListener('pointerup', release); addEventListener('pointercancel', release);
  nav.addEventListener('focusin', () => { show(); clearTimeout(timer); });
  nav.addEventListener('focusout', () => { setTimeout(() => { if (!nav.contains(document.activeElement)) arm(); }, 0); });

  /* keyboard: it is inert while hidden, so Tab brings it back first (before the focus moves on) and it then stays while focus is inside */
  document.addEventListener('keydown', e => { if (e.key === 'Tab' && hidden && mq.matches && !html.classList.contains('is-locked')) show(); });
  /* popups: frozen while open; when they close the state comes back as it was */
  new MutationObserver(() => { if (!html.classList.contains('is-locked')) { last = scrollY; apply(); if (!hidden) arm(); } }).observe(html, { attributes: true, attributeFilter: ['class'] });
  mq.addEventListener('change', () => { if (!mq.matches) { clearTimeout(timer); hidden = false; apply(); nav.inert = false; } else { last = scrollY; show(); } });
  setTimeout(() => nav.classList.add('is-live'), 1900);              // after the entrance animation of the bar has finished
  if (mq.matches) arm();
  BK.bottomNav = { get hidden() { return hidden; }, show, hide };
})();
