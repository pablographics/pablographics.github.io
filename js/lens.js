/* Liquid-glass edge refraction for the two navbars (skill: lensing at the bezel). CHROMIUM ONLY: backdrop-filter with an SVG filter url() is not supported elsewhere,
   so Safari / Firefox keep the standard frosted glass (blur + saturation + tint + edge light), which looks almost identical. Gated by feature + user preferences.
   A displacement map is drawn per navbar (a rounded-rect / pill signed-distance field: pixels near the edge are pushed along the surface normal), cached as an <feImage>. */
(() => {
  'use strict';
  const ok = window.CSS && CSS.supports && CSS.supports('backdrop-filter', 'url(#x) blur(1px)') && !/Firefox|Version\/.*Safari/.test(navigator.userAgent.replace(/Chrome\/[\d.]+/, 'Chrome'));
  if (!ok || matchMedia('(prefers-reduced-transparency: reduce)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true'); svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  document.body.appendChild(svg);
  const BEZEL = 16, SCALE = 9;
  function mapFor(w, h) {                                                     // pill-shaped signed distance field -> displacement (R = x, G = y, 128 = no shift)
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), img = g.createImageData(w, h), d = img.data;
    const r = h / 2, hx = w / 2 - r;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const px = x + .5 - w / 2, py = y + .5 - h / 2, qx = Math.max(Math.abs(px) - hx, 0);
      const dist = Math.hypot(qx, py), depth = r - dist;                        // inside the pill: distance from the edge
      let dx = 0, dy = 0;
      if (depth < BEZEL && dist > 0) { const s = Math.pow(1 - Math.max(0, depth) / BEZEL, 2), nx = (qx * Math.sign(px)) / dist, ny = py / dist; dx = -nx * s; dy = -ny * s; }   // samples from slightly inside -> the edge magnifies
      const i = (y * w + x) * 4; d[i] = 128 + 127 * dx; d[i + 1] = 128 + 127 * dy; d[i + 2] = 128; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0); return c.toDataURL();
  }
  function attach(el, id) {
    let timer = 0;
    const build = () => {
      const r = el.getBoundingClientRect(); const w = Math.round(Math.max(r.width, 120)), h = Math.round(r.height);
      if (!h || !w) return;
      let f = svg.querySelector('#' + id); if (!f) { f = document.createElementNS(NS, 'filter'); f.id = id; f.setAttribute('color-interpolation-filters', 'sRGB'); f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', '100%'); f.setAttribute('height', '100%'); svg.appendChild(f); }
      f.textContent = ''; const im = document.createElementNS(NS, 'feImage'); im.setAttribute('href', mapFor(Math.min(w, 900), h)); im.setAttribute('x', '0'); im.setAttribute('y', '0'); im.setAttribute('width', '100%'); im.setAttribute('height', '100%'); im.setAttribute('preserveAspectRatio', 'none'); im.setAttribute('result', 'map');
      const dm = document.createElementNS(NS, 'feDisplacementMap'); dm.setAttribute('in', 'SourceGraphic'); dm.setAttribute('in2', 'map'); dm.setAttribute('scale', String(SCALE)); dm.setAttribute('xChannelSelector', 'R'); dm.setAttribute('yChannelSelector', 'G');
      f.append(im, dm);
      el.style.setProperty('--lg-filter', `url(#${id}) blur(14px) saturate(140%)`);
    };
    const later = () => { clearTimeout(timer); timer = setTimeout(build, 200); };
    return { build, later };
  }
  const nav = document.querySelector('.nav'), bnav = document.getElementById('bnav');
  const items = [];
  const boot = () => {
    // the header's glass layer is the .nav::before pseudo-element: it is as tall as .nav; the variable lives on .nav
    if (nav && innerWidth > 1099) { const a = attach(nav, 'lg-nav'); a.build(); items.push(a); }
    if (bnav && innerWidth <= 1099) { const a = attach(bnav, 'lg-bnav'); a.build(); items.push(a); }
  };
  /* adaptive safety: if the frames get slow while scrolling (weak GPU / software rendering), drop the refraction and keep the standard frosted glass */
  let sampling = false, bad = 0, off = false;
  const disable = () => { off = true; items.length = 0; nav && nav.style.removeProperty('--lg-filter'); bnav && bnav.style.removeProperty('--lg-filter'); document.documentElement.classList.add('lg-lite'); };
  const sample = () => { let last = performance.now(), n = 0, slow = 0; const end = last + 1400; const tick = t => { const d = t - last; last = t; if (n++ > 2 && d > 26) slow++; if (t < end) requestAnimationFrame(tick); else { bad = slow / Math.max(1, n - 3) > 0.4 ? bad + 1 : 0; if (bad >= 2) disable(); sampling = false; } }; requestAnimationFrame(tick); };
  addEventListener('scroll', () => { if (off || sampling || document.hidden) return; sampling = true; sample(); }, { passive: true });
  boot(); addEventListener('resize', () => { items.length = 0; nav && nav.style.removeProperty('--lg-filter'); bnav && bnav.style.removeProperty('--lg-filter'); clearTimeout(boot._t); boot._t = setTimeout(() => { if (!off) boot(); }, 250); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(() => items.forEach(i => i.build()), 300));
})();
