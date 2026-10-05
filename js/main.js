/* Backroom — motion & interaction. No dependencies.
   Animates transform/opacity only; CSS does the easing, JS only flips states. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  /* ---------- i18n (EN / ES) ---------- */
  const ES = {
    'Backroom — Write your next story':'Backroom — Escribí tu próxima historia',
    'Backroom bar in Buenos Aires and Santiago. Cocktails, food and live jazz.':'Backroom bar en Buenos Aires y Santiago. Cócteles, comida y jazz en vivo.',
    'Skip to content':'Saltar al contenido',
    'the place':'el lugar','The place':'El lugar','Experience':'Experiencia','menu':'menú','Menu':'Menú','Contact':'Contacto',
    'book a table':'reservar mesa','Book a table':'Reservar mesa',
    'Write your next story.':'Escribí tu próxima historia.',
    'Jazz · Cocktails · Tapas':'Jazz · Cócteles · Tapas',
    'Scroll to explore':'Deslizá para explorar',
    'Good stories begin with a meeting.':'Las buenas historias empiezan con un encuentro.',
    'A place where cocktails, food and live jazz come together for an experience that lingers long after the last drink.':'Un lugar donde los cócteles, la comida y el jazz en vivo se juntan en una experiencia que perdura mucho después del último trago.',
    'A place to stay awhile':'Un lugar para quedarse un rato',
    'The place.':'El lugar.',
    'Some places aren’t meant to be explained. They’re discovered, one conversation at a time.':'Hay lugares que no se explican. Se descubren, una conversación a la vez.',
    'The experience':'La experiencia',
    'Come for the first round.':'Vení por la primera ronda.',
    'Four ways into the night. Begin with a drink, linger for the music, gather around the table, leave with a story.':'Cuatro formas de entrar a la noche. Empezá con un trago, quedate por la música, juntate alrededor de la mesa y andate con una historia.',
    'Cocktails':'Cócteles','The Night':'La noche',
    'The art of a drink.':'El arte de un trago.',
    'Every cocktail is the beginning of a story you don’t know how to tell yet.':'Cada cóctel es el comienzo de una historia que todavía no sabés cómo contar.',
    'explore the menu':'explorá el menú',
    'Mediterranean tapas':'Tapas mediterráneas',
    'To share. To remember.':'Para compartir. Para recordar.',
    'Mediterranean flavors that make you want to stay a little longer.':'Sabores mediterráneos que te hacen querer quedarte un rato más.',
    'The sound of Backroom':'El sonido de Backroom',
    'When the night finds its rhythm.':'Cuando la noche encuentra su ritmo.',
    'Live jazz sets the unexpected to music.':'El jazz en vivo le pone música a lo inesperado.',
    'In the media':'En los medios',
    'The night has a voice.':'La noche tiene voz.',
    'A new meeting point for Buenos Aires nightlife.':'Un nuevo punto de encuentro para la noche porteña.',
    'An experience where cocktails and jazz share the spotlight.':'Una experiencia donde los cócteles y el jazz comparten el protagonismo.',
    'The bar that turns an ordinary night into a story.':'El bar que convierte una noche cualquiera en una historia.',
    'After dark':'Después de hora',
    'When the city sleeps.':'Cuando la ciudad duerme.',
    'all photos':'todas las fotos',
    'The next scene':'La próxima escena',
    'Your next story starts here.':'Tu próxima historia empieza acá.',
    'Visit Backroom':'Visitá Backroom',
    'Two cities. One night.':'Dos ciudades. Una noche.',
    'address':'dirección','hours':'horarios',
    'Monday to Friday':'Lunes a viernes','Saturday and Sunday':'Sábados y domingos',
    'Get directions':'Cómo llegar',
    'Work with us':'Trabajá con nosotros',
    'Be part of the story.':'Sé parte de la historia.',
    'If hospitality, cocktails, food or music are your thing, we’d love to meet you. Send us your resume and tell us which city you’d like to work in.':'Si lo tuyo es la hospitalidad, los cócteles, la comida o la música, nos encantaría conocerte. Mandanos tu CV y contanos en qué ciudad te gustaría trabajar.',
    'send the resume':'enviar el CV',
    '© 2026 BACKROOM. All rights reserved.':'© 2026 BACKROOM. Todos los derechos reservados.',
    /* attributes */
    'Backroom — home':'Backroom — inicio','Main':'Principal','Language':'Idioma','Mobile':'Móvil',
    'Cocktails and tapas':'Cócteles y tapas','Filter photos by city':'Filtrar fotos por ciudad',
    'After dark photo gallery':'Galería de fotos Después de hora','Choose photo':'Elegir foto','Social media':'Redes sociales',
    'The Backroom sign glowing above a wall of bottles':'El cartel de Backroom iluminado sobre una pared de botellas',
    'Warmly lit shelves of spirits behind the bar':'Estantes de destilados con luz cálida detrás de la barra',
    'A red cocktail in a stemmed glass':'Un cóctel rojo en copa de pie',
    'Musicians playing live jazz':'Músicos tocando jazz en vivo',
    'Crispy tapas topped with herbs and a creamy sauce':'Tapas crocantes con hierbas y salsa cremosa',
    'Guests gathered under warm hanging lights':'Gente reunida bajo luces cálidas colgantes',
    'A copper Backroom mug with mint and lime':'Un vaso de cobre de Backroom con menta y lima',
    'Crispy fried bites with herbs and a creamy sauce':'Bocados fritos crocantes con hierbas y salsa cremosa',
    'A guest with cocktails glowing on the bar':'Una persona con tragos que brillan sobre la barra',
    'A bartender smiling behind the counter':'Un bartender sonriendo detrás de la barra',
    'Friends at a table under hanging lamps':'Amigos en una mesa bajo lámparas colgantes',
    'Shelves of bottles behind the bar':'Estantes de botellas detrás de la barra',
    'A lively crowd at the bar':'Mucha gente animada en la barra',
    'A candle-lit brick alley full of people':'Un pasillo de ladrillo iluminado con velas, lleno de gente',
    'Crispy tapas with herbs and a creamy sauce':'Tapas crocantes con hierbas y salsa cremosa',
    'Guests dining in a lantern-lit patio':'Gente cenando en un patio iluminado con faroles',
    'A drummer playing under blue light':'Un baterista tocando bajo luz azul'
  };
  const UI = {
    en: { menu: 'Menu', close: 'Close', photo: (i, n) => `Photo ${i} of ${n}`, go: i => `Go to photo ${i}`, subject: 'Resume' },
    es: { menu: 'Menú', close: 'Cerrar', photo: (i, n) => `Foto ${i} de ${n}`, go: i => `Ir a la foto ${i}`, subject: 'CV' }
  };
  let lang = 'en';
  try { const sv = localStorage.getItem('bk-lang'); if (sv === 'es' || sv === 'en') lang = sv; } catch (e) {}
  const ui = () => UI[lang];
  const tr = en => (lang === 'es' && ES[en]) || en;

  const textRefs = [], attrRefs = [];
  {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode(n) {
      const p = n.parentElement;
      if (!p || p.closest('script,style,[data-split-words],[data-split-chars],[data-no-i18n]')) return NodeFilter.FILTER_REJECT;
      return ES[n.nodeValue.trim()] ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    } });
    for (let n; (n = w.nextNode());) textRefs.push({ n, en: n.nodeValue });
    $$('[alt],[aria-label]').forEach(el => {
      if (el.closest('[data-no-i18n]')) return;
      ['alt', 'aria-label'].forEach(a => { const v = el.getAttribute(a); if (v && ES[v]) attrRefs.push({ el, a, en: v }); });
    });
  }
  const docTitleEN = document.title, metaEl = $('meta[name="description"]'), metaEN = metaEl.content;

  /* ---------- text splitting (words for titles, chars for countries) ---------- */
  const buildWords = (el, text) => {
    const words = text.trim().split(/\s+/); el.textContent = '';
    words.forEach((w, i) => {
      const o = document.createElement('span'); o.className = 'w'; o.setAttribute('aria-hidden', 'true');
      const n = document.createElement('span'); n.className = 'wi'; n.style.setProperty('--wi', i); n.textContent = w;
      o.appendChild(n); el.appendChild(o);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.setAttribute('aria-label', text.trim()); el.classList.add('is-split');
  };
  const splitEls = $$('[data-split-words]');
  splitEls.forEach(el => { el.dataset.en = el.textContent.trim(); buildWords(el, tr(el.dataset.en)); });
  $$('[data-split-chars]').forEach(el => {
    const t = el.textContent.trim(); el.textContent = '';
    [...t].forEach((c, i) => {
      const s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--ci', i); s.textContent = c; el.appendChild(s);
    });
  });
  const applyLang = () => {
    document.documentElement.lang = lang;
    textRefs.forEach(r => { const lead = r.en.match(/^\s*/)[0], trail = r.en.match(/\s*$/)[0]; r.n.nodeValue = lead + tr(r.en.trim()) + trail; });
    attrRefs.forEach(r => r.el.setAttribute(r.a, tr(r.en)));
    splitEls.forEach(el => buildWords(el, tr(el.dataset.en)));
    document.title = lang === 'es' ? ES['Backroom — Write your next story'] : docTitleEN;
    metaEl.content = lang === 'es' ? ES[metaEN] : metaEN;
    $$('.lang__b').forEach(b => b.setAttribute('aria-pressed', String(b.textContent.trim().toLowerCase() === lang)));
    $$('a[href^="mailto:"]').forEach(a => { a.href = a.href.replace(/subject=[^&]*/, 'subject=' + ui().subject); });
    const tl = $('.nav__toggle-l'); if (tl) tl.textContent = toggle.getAttribute('aria-expanded') === 'true' ? ui().close : ui().menu;
    $$('.gal__dot').forEach((d, i) => d.setAttribute('aria-label', ui().go(i + 1)));
    if (typeof paint === 'function' && live) paint();
  };

  /* stagger indexes for reveal groups (80ms steps, capped so long groups never feel slow) */
  $$('[data-reveal-group]').forEach(g => {
    $$('[data-reveal]', g).forEach((el, i) => el.style.setProperty('--i', Math.min(i, 6)));
  });
  $$('.vp').forEach(v => $$('.vp__line', v).forEach((el, i) => el.style.setProperty('--li', i)));

  /* ---------- scroll-driven reveals: play going DOWN and going UP, every time ----------
     enter observer  → adds .is-in when the element reaches the viewport
     leave observer  → once it is well outside the viewport, resets it, remembering which side it left from
                       (--dir = 1 enters from below, -1 enters from above) so the motion follows the scroll direction */
  const revealEls = [...$$('[data-reveal-group], .vp'), ...$$('[data-reveal]').filter(el => !el.closest('[data-reveal-group]'))];
  const lead = Math.round(Math.min(56, innerHeight * 0.08));
  const enterIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-in'); }),
    { threshold: 0, rootMargin: `0px 0px -${lead}px 0px` });
  const leaveIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) return;
    const up = e.boundingClientRect.top < 0;
    e.target.style.setProperty('--dir', up ? '-1' : '1'); e.target.dataset.dir = up ? 'up' : 'down';
    e.target.classList.remove('is-in');
  }), { threshold: 0, rootMargin: '30% 0px 30% 0px' });
  revealEls.forEach(el => { enterIO.observe(el); leaveIO.observe(el); });
  // at the very bottom of the page nothing can scroll further: reveal whatever is on screen (footer / copyright)
  const bottomCheck = () => {
    if (innerHeight + scrollY < document.documentElement.scrollHeight - 4) return;
    revealEls.forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
  };
  addEventListener('scroll', bottomCheck, { passive: true });

  /* ---------- hero intro: starts once the image is decoded (or after a short timeout) ---------- */
  const hero = $('.hero');
  const img = $('.hero__img');
  let started = false;
  const go = () => { if (started) return; started = true; requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-ready'))); };
  // leaving the hero resets it; coming back replays a quicker version of the intro
  new IntersectionObserver(es => es.forEach(e => {
    if (!started) return;
    if (e.isIntersecting) { hero.classList.add('is-replay'); requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-ready'))); }
    else hero.classList.remove('is-ready');
  }), { rootMargin: '30% 0px 30% 0px' }).observe(hero);
  Promise.race([
    Promise.all([img.decode ? img.decode().catch(() => {}) : Promise.resolve(), document.fonts ? document.fonts.ready : Promise.resolve()]),
    new Promise(r => setTimeout(r, 1400))
  ]).then(go);
  setTimeout(go, 1800);

  /* ---------- subtle scroll parallax (transform only, rAF-throttled, desktop & no reduced motion) ---------- */
  const par = $$('[data-parallax]').map(el => ({ el, k: parseFloat(el.dataset.parallax) || 0.1, box: el.closest('section') }));
  let ticking = false;
  const runParallax = () => {
    ticking = false;
    if (reduce.matches) return;
    const vh = innerHeight;
    par.forEach(p => {
      const r = p.box.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const prog = (r.top + r.height / 2 - vh / 2) / vh;       // -1…1 around the viewport centre
      p.el.style.transform = `translate3d(0,${(-prog * p.k * 100).toFixed(2)}px,0)`;
    });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(runParallax); } }, { passive: true });
  addEventListener('resize', runParallax);
  runParallax();

  /* ---------- mobile menu sheet ---------- */
  const toggle = $('.nav__toggle'), sheet = $('#sheet');
  const setSheet = open => {
    if (open) {
      sheet.hidden = false; document.body.classList.add('is-locked');
      requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('is-open')));
      toggle.setAttribute('aria-expanded', 'true'); toggle.querySelector('span').textContent = ui().close;
      $('a', sheet).focus({ preventScroll: true });
    } else {
      sheet.classList.remove('is-open'); document.body.classList.remove('is-locked');
      toggle.setAttribute('aria-expanded', 'false'); toggle.querySelector('span').textContent = ui().menu;
      setTimeout(() => { if (!sheet.classList.contains('is-open')) sheet.hidden = true; }, 240);
    }
  };
  toggle.addEventListener('click', () => setSheet(toggle.getAttribute('aria-expanded') !== 'true'));
  sheet.addEventListener('click', e => { if (e.target.closest('a')) setSheet(false); });
  // the toggle sits above the sheet so it remains the close control
  toggle.style.position = 'relative'; toggle.style.zIndex = '101';
  addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) { setSheet(false); toggle.focus(); } });
  matchMedia('(min-width:1100px)').addEventListener('change', e => { if (e.matches && !sheet.hidden) setSheet(false); });

  /* ---------- language switch: EN / ES change the whole site ---------- */
  $$('.lang').forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('.lang__b'); if (!b) return;
    const next = b.textContent.trim().toLowerCase(); if (next === lang) return;
    lang = next; try { localStorage.setItem('bk-lang', lang); } catch (err) {}
    applyLang();
  }));

  /* ---------- THE EXPERIENCE: hover → arrow + colour + crossfade to that experience's photo ---------- */
  const expItems = $$('.exp__item'), expImgs = $$('.exp__stack img');
  const setExp = i => {
    expItems.forEach((it, k) => it.classList.toggle('is-hot', k === i));
    expImgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
  };
  const clearExp = () => { expItems.forEach(it => it.classList.remove('is-hot')); expImgs.forEach((im, k) => im.classList.toggle('is-active', k === 0)); };
  expItems.forEach((it, i) => {
    it.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') setExp(i); });
    it.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') clearExp(); });
    it.addEventListener('focus', () => { if (it.matches(':focus-visible')) setExp(i); });
    it.addEventListener('blur', clearExp);
    // touch has no hover: first tap previews (arrow + photo), second tap follows the link
    it.addEventListener('click', e => {
      if (fine.matches) return;
      if (!it.classList.contains('is-hot')) { e.preventDefault(); setExp(i); }
    });
  });
  document.addEventListener('pointerdown', e => { if (!fine.matches && !e.target.closest('.exp__list')) clearExp(); });

  /* ---------- IN THE MEDIA: popup photo follows the cursor (spring-like lerp), arrow + colour on hover ---------- */
  const news = $('.news'), pop = $('.news__pop'), rows = $$('.news__row');
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, shown = false;
  const loop = () => {
    cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
    pop.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
    raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3 && shown) ? requestAnimationFrame(loop) : 0;
  };
  const place = (e, snap) => {
    const r = news.getBoundingClientRect(), w = pop.offsetWidth, h = w * 355 / 277;
    // anchored beside the cursor, kept inside the section
    let x = e.clientX - r.left + 36, y = e.clientY - r.top - h * 0.55;
    x = Math.min(x, r.width - w - 8); y = Math.max(-h * 0.35, Math.min(y, r.height - h * 0.65));
    tx = x; ty = y; if (snap) { cx = x; cy = y; pop.style.transform = `translate3d(${x}px,${y}px,0)`; }
    if (!raf) raf = requestAnimationFrame(loop);
  };
  rows.forEach((row, i) => {
    row.addEventListener('pointerenter', e => {
      if (e.pointerType === 'touch') return;
      row.classList.add('is-hot'); pop.dataset.i = i;
      place(e, !shown); shown = true; pop.classList.add('is-on');
    });
    row.addEventListener('pointermove', e => { if (e.pointerType !== 'touch') place(e, false); });
    row.addEventListener('pointerleave', e => {
      if (e.pointerType === 'touch') return;
      row.classList.remove('is-hot');
      if (!rows.some(r => r.classList.contains('is-hot'))) { pop.classList.remove('is-on'); shown = false; }
    });
    const link = $('.news__link', row);
    link.addEventListener('focus', () => {
      if (!link.matches(':focus-visible')) return;
      row.classList.add('is-hot'); pop.dataset.i = i; pop.classList.add('is-on'); shown = true;
      const r = news.getBoundingClientRect(), b = row.getBoundingClientRect();
      place({ clientX: r.left + r.width * 0.6, clientY: b.top + b.height / 2 }, true);
    });
    link.addEventListener('blur', () => { row.classList.remove('is-hot'); pop.classList.remove('is-on'); shown = false; });
    // touch: tap opens the photo inline (accordion), second tap follows the link
    link.addEventListener('click', e => {
      if (fine.matches) return;
      if (!row.classList.contains('is-hot')) { e.preventDefault(); rows.forEach(r => r.classList.remove('is-hot')); row.classList.add('is-hot'); }
    });
  });

  /* ---------- AFTER DARK: filter tabs + carousel (dots, drag/swipe, keyboard) ---------- */
  const viewport = $('.gal__viewport'), track = $('.gal__track'), cards = $$('.gal__card'), dotsBox = $('.gal__dots'), dotsIn = $('.gal__dotsin');
  const tabs = $$('.gal__tab'), live = $('#gal-live');
  const ctry = { argentina: 'Argentina', chile: 'Chile' };
  const counters = { argentina: 0, chile: 0 };
  cards.forEach(c => { const k = c.dataset.cat; counters[k]++; c.dataset.n = String(counters[k]).padStart(2, '0'); });
  let filter = 'all', vis = cards, idx = 0, max = 0, busy = false;

  const metrics = () => {
    const c = vis[0]; if (!c) return { step: 1, per: 1 };
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0, w = c.getBoundingClientRect().width;
    const padL = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const per = Math.max(1, Math.floor((viewport.clientWidth - padL + gap) / (w + gap) + 0.02));
    return { step: w + gap, per };
  };
  const paint = () => {
    const { step, per } = metrics();
    track.style.transform = `translate3d(${(-idx * step).toFixed(2)}px,0,0)`;
    vis.forEach((c, i) => c.classList.toggle('is-vis', i >= idx && i < idx + per));
    $$('.gal__dot', dotsIn).forEach((d, i) => { d.setAttribute('aria-current', i === idx ? 'true' : 'false'); });
    const th = $('.gal__thumb', dotsIn); if (th) th.style.transform = `translate3d(${idx * dotStep()}px,0,0)`;
    live.textContent = ui().photo(idx + 1, max + 1);
  };
  const dotStep = () => parseFloat(getComputedStyle($('.gal__stage')).getPropertyValue('--dot-step')) || 16;
  const go2 = i => { idx = Math.max(0, Math.min(max, i)); paint(); };

  const buildDots = () => {
    const { per } = metrics();
    max = Math.max(0, vis.length - per);
    dotsIn.textContent = '';
    dotsIn.style.setProperty('--n', max + 1);
    dotsBox.toggleAttribute('data-off', max === 0);
    for (let i = 0; i <= max; i++) {
      const d = document.createElement('button'); d.type = 'button'; d.className = 'gal__dot';
      d.style.transform = `translate3d(${i * dotStep()}px,0,0)`; d.setAttribute('aria-label', ui().go(i + 1));
      d.addEventListener('click', () => go2(i)); dotsIn.appendChild(d);
    }
    const th = document.createElement('span'); th.className = 'gal__thumb'; dotsIn.appendChild(th);
  };
  const caption = c => `<span>${ctry[c.dataset.cat]}</span><span>/</span><span>${c.dataset.n}</span>`;
  const apply = () => {
    vis = filter === 'all' ? cards : cards.filter(c => c.dataset.cat === filter);
    cards.forEach(c => { const on = vis.includes(c); c.hidden = !on; $('.gal__cap', c).innerHTML = caption(c); });
    vis.forEach((c, i) => c.style.setProperty('--k', Math.min(i, 5)));
    idx = 0; buildDots(); track.classList.add('no-anim'); paint(); void track.offsetWidth; track.classList.remove('no-anim');
  };
  const setFilter = f => {
    if (f === filter || busy) return;
    filter = f; busy = true;
    tabs.forEach(t => { const on = t.dataset.filter === f; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    viewport.setAttribute('aria-labelledby', 'tab-' + f);
    if (reduce.matches) { apply(); busy = false; return; }
    track.classList.add('is-leaving');                       // photos fall away (fast exit)…
    setTimeout(() => {
      track.classList.remove('is-leaving'); track.classList.add('is-pre'); apply(); void track.offsetWidth;
      track.classList.remove('is-pre');                     // …new set rises in with stagger (slower enter)
      setTimeout(() => { busy = false; }, 450);
    }, 280);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => setFilter(t.dataset.filter));
    t.addEventListener('keydown', e => {
      const k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!k) return;
      e.preventDefault(); const n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); setFilter(n.dataset.filter);
    });
  });
  // keyboard on the carousel (instant response, no extra animation beyond the slide itself)
  viewport.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go2(idx + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go2(idx - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go2(0); }
    else if (e.key === 'End') { e.preventDefault(); go2(max); }
  });
  // drag / swipe with velocity + edge friction
  let dragging = false, sx = 0, sy = 0, dx = 0, t0 = 0, locked = null, pid = null, moved = false;
  viewport.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return; if (dragging) return;
    dragging = true; moved = false; locked = null; pid = e.pointerId; sx = e.clientX; sy = e.clientY; dx = 0; t0 = performance.now();
  });
  viewport.addEventListener('pointermove', e => {
    if (!dragging || e.pointerId !== pid) return;
    const mx = e.clientX - sx, my = e.clientY - sy;
    if (locked === null && Math.hypot(mx, my) > 6) { locked = Math.abs(mx) > Math.abs(my); if (locked) { viewport.setPointerCapture(pid); viewport.classList.add('is-drag'); track.classList.add('no-anim'); } }
    if (!locked) return;
    moved = true; dx = mx;
    const { step } = metrics(); let off = -idx * step + dx;
    const lo = -max * step; if (off > 0) off *= 0.35; else if (off < lo) off = lo + (off - lo) * 0.35;   // friction past the edges
    track.style.transform = `translate3d(${off.toFixed(1)}px,0,0)`;
  });
  const endDrag = e => {
    if (!dragging || (e && e.pointerId !== pid)) return;
    dragging = false; viewport.classList.remove('is-drag'); track.classList.remove('no-anim');
    if (locked) {
      const { step } = metrics(), v = Math.abs(dx) / Math.max(1, performance.now() - t0);
      let n = idx - Math.round(dx / step);
      if (v > 0.4 || Math.abs(dx) > step * 0.18) n = idx + (dx < 0 ? 1 : -1) * Math.max(1, Math.round(Math.abs(dx) / step));
      go2(n);
    } else paint();
  };
  viewport.addEventListener('pointerup', endDrag); viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { const keep = idx; buildDots(); idx = Math.min(keep, max); track.classList.add('no-anim'); paint(); void track.offsetWidth; track.classList.remove('no-anim'); }, 120); });
  apply();

  /* ---------- VISIT: hover on fine pointers; on touch the card in view gets the "hot" state ---------- */
  const vps = $$('.vp');
  if (fine.matches) {
    vps.forEach(v => { v.addEventListener('pointerenter', () => v.classList.add('is-hot')); v.addEventListener('pointerleave', () => v.classList.remove('is-hot')); });
  } else {
    const vio = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-hot', e.isIntersecting && e.intersectionRatio > 0.6)), { threshold: [0, 0.6, 1] });
    vps.forEach(v => vio.observe(v));
  }

  if (lang !== 'en') applyLang(); else $$('.lang__b').forEach(b => b.setAttribute('aria-pressed', String(b.textContent.trim().toLowerCase() === 'en')));
})();
