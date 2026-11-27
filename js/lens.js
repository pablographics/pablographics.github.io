/* Liquid Glass — LENSING (Apple: the material bends and concentrates light and defines its edges by refraction instead of just scattering it).
   CHROMIUM ONLY: backdrop-filter with an SVG filter url() is not supported elsewhere, so Safari / Firefox keep the standard frosted glass
   (blur + saturation + tint + specular edge + shadow) which looks almost identical. Gated by feature, user preferences and a runtime frame-time guard.
   A displacement map is drawn per glass element from a signed distance field (pill for the navbars, square for the carousel buttons): pixels near the edge are
   pushed along the surface normal. The strength is parametrised by SIZE — the large navbar bends more, the small buttons less. */
(() => {
  'use strict';
  const ok = window.CSS && CSS.supports && CSS.supports('backdrop-filter', 'url(#x) blur(1px)') && !/Firefox|Version\/.*Safari/.test(navigator.userAgent.replace(/Chrome\/[\d.]+/, 'Chrome'));
  if (!ok || matchMedia('(prefers-reduced-transparency: reduce)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true'); svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  document.body.appendChild(svg);
  function mapFor(w, h, round, bezel) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), img = g.createImageData(w, h), d = img.data;
    const r = round ? h / 2 : 0, hx = w / 2 - r, hy = h / 2 - r;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const px = x + .5 - w / 2, py = y + .5 - h / 2, qx = Math.max(Math.abs(px) - hx, 0), qy = Math.max(Math.abs(py) - hy, 0);
      let dist, nx, ny, depth;
      if (round) { dist = Math.hypot(qx, py); depth = r - dist; nx = dist ? (qx * Math.sign(px)) / dist : 0; ny = dist ? py / dist : 0; }
      else { const ex = w / 2 - Math.abs(px), ey = h / 2 - Math.abs(py); depth = Math.min(ex, ey); if (ex < ey) { nx = Math.sign(px); ny = 0; } else { nx = 0; ny = Math.sign(py); } }
      let dx = 0, dy = 0;
      if (depth < bezel) { const s = Math.pow(1 - Math.max(0, depth) / bezel, 2); dx = -nx * s; dy = -ny * s; }
      const i = (y * w + x) * 4; d[i] = 128 + 127 * dx; d[i + 1] = 128 + 127 * dy; d[i + 2] = 128; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0); return c.toDataURL();
  }
  function attach(el, id, o) {
    const build = () => {
      const r = el.getBoundingClientRect(); const w = Math.round(Math.min(Math.max(r.width, 40), 900)), h = Math.round(r.height); if (!h || !w) return;
      let f = svg.querySelector('#' + id); if (!f) { f = document.createElementNS(NS, 'filter'); f.id = id; f.setAttribute('color-interpolation-filters', 'sRGB'); f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', '100%'); f.setAttribute('height', '100%'); svg.appendChild(f); }
      f.textContent = ''; const im = document.createElementNS(NS, 'feImage'); im.setAttribute('href', mapFor(w, h, o.round, o.bezel)); im.setAttribute('x', '0'); im.setAttribute('y', '0'); im.setAttribute('width', '100%'); im.setAttribute('height', '100%'); im.setAttribute('preserveAspectRatio', 'none'); im.setAttribute('result', 'map');
      const dm = document.createElementNS(NS, 'feDisplacementMap'); dm.setAttribute('in', 'SourceGraphic'); dm.setAttribute('in2', 'map'); dm.setAttribute('scale', String(o.scale)); dm.setAttribute('xChannelSelector', 'R'); dm.setAttribute('yChannelSelector', 'G');
      f.append(im, dm); el.style.setProperty('--lg-filter', `url(#${id}) blur(${o.blur}px) saturate(150%)`);
    };
    return { el, build };
  }
  let items = [], off = false, timer = 0;
  const nav = document.querySelector('.nav'), bnav = document.getElementById('bnav'), arrows = [...document.querySelectorAll('.gal__arrow')];
  const clear = () => { items.forEach(i => i.el.style.removeProperty('--lg-filter')); items = []; };
  const boot = () => {
    clear(); if (off) return;
    if (nav && innerWidth > 1099) items.push(attach(nav, 'lg-nav', { round: true, bezel: 18, scale: 10, blur: 14 }));        // large glass: stronger lensing
    if (bnav && innerWidth <= 1099) items.push(attach(bnav, 'lg-bnav', { round: true, bezel: 16, scale: 9, blur: 14 }));
    if (innerWidth > 1099) arrows.forEach((a, k) => items.push(attach(a, 'lg-arrow' + k, { round: false, bezel: 10, scale: 6, blur: 10 })));   // small glass: subtler
    items.forEach(i => i.build());
  };
  /* adaptive safety: slow frames while scrolling (weak GPU / software rendering) -> drop the refraction, keep the frosted glass */
  let sampling = false, bad = 0;
  const disable = () => { off = true; clear(); document.documentElement.classList.add('lg-lite'); };
  const sample = () => { let last = performance.now(), n = 0, slow = 0; const end = last + 1400; const tick = t => { const d = t - last; last = t; if (n++ > 2 && d > 26) slow++; if (t < end) requestAnimationFrame(tick); else { bad = slow / Math.max(1, n - 3) > 0.4 ? bad + 1 : 0; if (bad >= 2) disable(); sampling = false; } }; requestAnimationFrame(tick); };
  addEventListener('scroll', () => { if (off || sampling || document.hidden) return; sampling = true; sample(); }, { passive: true });
  boot(); addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(boot, 250); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(() => items.forEach(i => i.build()), 300));
})();
