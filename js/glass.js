/* Liquid Glass — behaviour layer (see the material in css/styles.css, "LIQUID GLASS v2").
   From Apple's Liquid Glass documentation: the glass is a FUNCTIONAL layer that floats above content; it adapts to what is behind it,
   it is interactive (flexes and fills with light under the finger / pointer) and its surfaces morph. Implemented here:
   - adaptivity: the navbars read the tone of the section behind them (data-tone="photo" | dark) and switch to a denser tint / deeper shadow over photos;
   - interaction: a specular light follows the pointer across the glass; on press the control compresses and springs back (gel-like), light fills from the touch point;
   - everything is cheap: one rAF-throttled scroll read, no per-frame layout work, and it is reduced to a plain brightness change with prefers-reduced-motion. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.querySelector('.nav'), bnav = document.getElementById('bnav');
  const tones = [...document.querySelectorAll('section[id]')];
  /* ---- adaptivity: tone of the content under each navbar ---- */
  let tick = false;
  const toneAt = y => { for (const s of tones) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) return s.dataset.tone || 'dark'; } return 'dark'; };
  const readTone = () => {
    tick = false;
    if (nav) { const t = toneAt(46); if (nav.dataset.tone !== t) nav.dataset.tone = t; }
    if (bnav) { const t = toneAt(innerHeight - 52); if (bnav.dataset.tone !== t) bnav.dataset.tone = t; }
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(readTone); } }, { passive: true });
  addEventListener('resize', readTone); readTone();
  /* ---- interaction: specular light follows the pointer on the glass bars ---- */
  const light = (el, e) => { const r = el.getBoundingClientRect(); el.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); el.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); el.classList.add('is-lit'); };
  [nav, bnav].forEach(el => { if (!el) return; el.addEventListener('pointermove', e => light(el, e), { passive: true }); el.addEventListener('pointerleave', () => el.classList.remove('is-lit')); });
  /* ---- gel press: compress under the finger, spring back with a little overshoot ---- */
  const pressables = '.nav__link,.bnav__item,.gal__arrow,.nav__right .btn';
  document.addEventListener('pointerdown', e => {
    const el = e.target.closest(pressables); if (!el || el.disabled || reduce.matches) return;
    const r = el.getBoundingClientRect(); el.style.setProperty('--px', (e.clientX - r.left) + 'px'); el.style.setProperty('--py', (e.clientY - r.top) + 'px');
    el.classList.add('is-press'); el.animate([{ transform: 'scale(1)' }, { transform: 'scale(.94)' }], { duration: 120, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' });
  }, { passive: true });
  const release = e => document.querySelectorAll('.is-press').forEach(el => {
    el.classList.remove('is-press');
    const a = el.getAnimations().filter(x => x.effect && x.effect.getKeyframes && x.fill === 'forwards'); const from = a.length ? getComputedStyle(el).transform : 'none';
    a.forEach(x => x.cancel());
    if (!reduce.matches) el.animate([{ transform: from === 'none' ? 'scale(.94)' : from }, { transform: 'scale(1.035)', offset: .55 }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.34,1.3,.64,1)' });   // overshoot = the gel settles
  });
  addEventListener('pointerup', release); addEventListener('pointercancel', release);
})();
