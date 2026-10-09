/* Backroom — motion & interaction. No dependencies.
   CSS does the easing; JS flips states. Animates transform/opacity only. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  /* ===== easy-to-adjust constants ===== */
  const VISIT_STAGGER_MS = 80;       // Visit: delay between Argentina and Chile (keep ~60–100)
  const VISIT_REPLAY = true;         // Visit: true = re-animates on scroll up/down like the rest of the site; false = once
  const VISIT_LEAD = '15%';          // Visit: starts this much BEFORE the section enters the viewport
  const MEDIA_IMG_MIN = 1100;        // In the media: photos exist only from this width up (px) — also edit the 1099px block in styles.css
  const HEADER_ON_PX = 32, HEADER_OFF_PX = 12;   // header turns frosted + compact after 32px of scroll, back to transparent under 12px

  /* ===== shared helpers (used by modals.js, cursor.js…) ===== */
  const BK = (window.BK = window.BK || {});
  BK.reduce = reduce; BK.fine = fine;
  const locks = new Set();
  BK.lock = k => { locks.add(k); html.classList.add('is-locked'); };
  BK.unlock = k => { locks.delete(k); if (!locks.size) html.classList.remove('is-locked'); };
  BK.inert = (on, withHeader = true) => $$('[data-app]').forEach(el => { if (el.tagName === 'HEADER' && !withHeader) return; el.inert = on; });
  BK.focusables = root => $$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])', root).filter(el => !el.hidden && el.getClientRects().length);
  BK.trap = (list, e) => {
    if (e.key !== 'Tab' || !list.length) return;
    const first = list[0], last = list[list.length - 1], a = document.activeElement;
    if (e.shiftKey && (a === first || !list.includes(a))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (a === last || !list.includes(a))) { e.preventDefault(); first.focus(); }
  };

  /* ===== i18n (EN / ES) ===== */
  const ES = {
    'Backroom — Write your next story':'Backroom — Escribí tu próxima historia',
    'Backroom bar in Buenos Aires and Santiago. Cocktails, food and live jazz.':'Backroom bar en Buenos Aires y Santiago. Cócteles, comida y jazz en vivo.',
    'Skip to content':'Saltar al contenido',
    'the place':'el lugar','The place':'El lugar','menu':'menú','Menu':'Menú','visit':'visitá','Visit':'Visitá','Contact':'Contacto',
    'book a table':'reservar mesa','Book a table':'Reservar mesa',
    'Write your next story.':'Escribí tu próxima historia.',
    'Escribí tu próxima historia.':'Write your next story.',      // footer: gold line is the opposite language of the label above it
    'Jazz · Cocktails · Tapas':'Jazz · Cócteles · Tapas',
    'Scroll to explore':'Deslizá para explorar',
    'Good stories begin with a meeting.':'Las buenas historias empiezan con un encuentro.',
    'A place where cocktails, food and live jazz come together for an experience that lingers long after the last drink.':'Un lugar donde los cócteles, la comida y el jazz en vivo se juntan en una experiencia que perdura mucho después del último trago.',
    'A place to stay awhile':'Un lugar para quedarse un rato',
    'The place.':'El lugar.',
    'Some places aren’t meant to be explained. They’re discovered, one conversation at a time.':'Hay lugares que no se explican. Se descubren, una conversación a la vez.',
    'Cocktails':'Cócteles',
    'The art of a drink.':'El arte de un trago.',
    'Every cocktail is the beginning of a story you don’t know how to tell yet.':'Cada cóctel es el comienzo de una historia que todavía no sabés cómo contar.',
    'explore the menu':'explorá el menú',
    'Mediterranean tapas':'Tapas mediterráneas',
    'To share.':'Para compartir.','To remember.':'Para recordar.',
    'Mediterranean flavors that make you want to stay a little longer.':'Sabores mediterráneos que te hacen querer quedarte un rato más.',
    'The sound of Backroom':'El sonido de Backroom',
    'When the night finds its rhythm.':'Cuando la noche encuentra su ritmo.',
    'Live jazz sets the unexpected to music.':'El jazz en vivo le pone música a lo inesperado.',
    'In the media':'En los medios',
    'The night has a voice.':'La noche tiene voz.',
    'Twenty ways of expression, a new menu':'Veinte formas de expresión, una nueva carta',
    'From Palermo Soho to Santiago, non-stop':'De Palermo Soho a Santiago sin escalas',
    'A meeting of books, jazz and gastronomy':'Un encuentro entre libros, jazz y gastronomía',
    '(opens in a new tab)':'(se abre en una pestaña nueva)',
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
    'Reservations':'Reservas','Book a table.':'Reservar mesa.','Choose your city.':'Elegí tu ciudad.',
    'view':'ver',
    /* attributes */
    'Backroom — home':'Backroom — inicio','Main':'Principal','Language':'Idioma','Quick navigation':'Navegación rápida',
    'Cocktails and tapas':'Cócteles y tapas','Filter photos by city':'Filtrar fotos por ciudad',
    'After dark photo gallery':'Galería de fotos Después de hora','Social media':'Redes sociales',
    'Close':'Cerrar','Photo gallery':'Galería de fotos','Previous photo':'Foto anterior','Next photo':'Foto siguiente','Choose photo':'Elegir foto',
    'The Backroom sign glowing above a wall of bottles':'El cartel de Backroom iluminado sobre una pared de botellas',
    'Warmly lit shelves of spirits behind the bar':'Estantes de destilados con luz cálida detrás de la barra',
    'A copper Backroom mug with mint and lime':'Un vaso de cobre de Backroom con menta y lima',
    'Crispy fried bites with herbs and a creamy sauce':'Bocados fritos crocantes con hierbas y salsa cremosa',
    'A plated dish with fresh herbs on a ceramic plate':'Un plato con hierbas frescas sobre una fuente de cerámica',
    'A bartender finishing a cocktail in a coupe glass':'Un bartender terminando un cóctel en copa coupé',
    'Guests at a candle-lit table beside a warm wall lamp':'Gente en una mesa a la luz de las velas junto a una lámpara cálida',
    'The Backroom sign above the bar with stained glass':'El cartel de Backroom sobre la barra, con vitrales',
    'Guests chatting at candle-lit tables':'Gente charlando en mesas a la luz de las velas',
    'The glowing Backroom sign above a wall of bottles':'El cartel luminoso de Backroom sobre una pared de botellas',
    'A bartender smiling behind the counter':'Un bartender sonriendo detrás de la barra',
    'Two friends laughing at a candle-lit table':'Dos amigos riendo en una mesa a la luz de las velas',
    'Toasted bread topped with a seasoned bite and garnish':'Pan tostado con un bocado condimentado y guarnición',
    'A long table full of guests under hanging lamps':'Una mesa larga llena de gente bajo lámparas colgantes',
    'Small plates and a martini on a black slate':'Platitos y un martini sobre una pizarra negra',
    'A guest at a candle-lit table with a glass of red wine':'Una persona en una mesa a la luz de las velas con una copa de vino tinto'
  };
  const UI = {
    en: { langBtn: 'Switch to Spanish', photo: (i, n) => `Photo ${i} of ${n}`, go: i => `Go to photo ${i}`, open: l => `Open photo — ${l}` },
    es: { langBtn: 'Cambiar a inglés', photo: (i, n) => `Foto ${i} de ${n}`, go: i => `Ir a la foto ${i}`, open: l => `Abrir foto — ${l}` }
  };
  let lang = 'en';
  try { const sv = localStorage.getItem('bk-lang'); if (sv === 'es' || sv === 'en') lang = sv; } catch (e) {}
  const ui = () => UI[lang];
  const tr = en => (lang === 'es' && ES[en]) || en;
  BK.lang = () => lang; BK.ui = ui;

  const textRefs = [], attrRefs = [];
  {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode(n) {
      const p = n.parentElement;
      if (!p || p.closest('script,style,[data-split-words],[data-no-i18n],.intro')) return NodeFilter.FILTER_REJECT;
      return ES[n.nodeValue.trim()] ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    } });
    for (let n; (n = w.nextNode());) textRefs.push({ n, en: n.nodeValue });
    $$('[alt],[aria-label]').forEach(el => {
      if (el.closest('[data-no-i18n],.intro')) return;
      ['alt', 'aria-label'].forEach(a => { const v = el.getAttribute(a); if (v && ES[v]) attrRefs.push({ el, a, en: v }); });
    });
  }
  const docTitleEN = document.title, metaEl = $('meta[name="description"]'), metaEN = metaEl.content;

  /* ===== title splitting (words rise out of a mask) ===== */
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

  const applyLang = () => {
    html.lang = lang;
    textRefs.forEach(r => { const lead = r.en.match(/^\s*/)[0], trail = r.en.match(/\s*$/)[0]; r.n.nodeValue = lead + tr(r.en.trim()) + trail; });
    attrRefs.forEach(r => r.el.setAttribute(r.a, tr(r.en)));
    splitEls.forEach(el => buildWords(el, tr(el.dataset.en)));
    document.title = lang === 'es' ? ES['Backroom — Write your next story'] : docTitleEN;
    metaEl.content = lang === 'es' ? ES[metaEN] : metaEN;
    $$('.lang__b').forEach(b => b.setAttribute('aria-pressed', String(b.textContent.trim().toLowerCase() === lang)));
    $$('[data-lang-toggle]').forEach(b => b.setAttribute('aria-label', ui().langBtn));
    refreshGalleryLabels();
    document.dispatchEvent(new CustomEvent('bk:lang', { detail: lang }));
  };
  const setLang = next => {
    if (next === lang) return;
    lang = next; try { localStorage.setItem('bk-lang', lang); } catch (err) {}
    applyLang();
  };
  $$('.lang').forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('.lang__b'); if (!b) return;
    setLang(b.textContent.trim().toLowerCase());
  }));
  $$('[data-lang-toggle]').forEach(b => b.addEventListener('click', () => setLang(lang === 'en' ? 'es' : 'en')));

  /* ===== stagger indexes (80ms steps, capped) ===== */
  $$('[data-reveal-group]').forEach(g => $$('[data-reveal]', g).forEach((el, i) => el.style.setProperty('--i', Math.min(i, 6))));

  /* ===== scroll-driven reveals: play going DOWN and going UP ===== */
  const earlyEls = $$('[data-early]');                                    // banner: starts ~14% before it enters the viewport, plays once
  const revealEls = [...$$('[data-reveal-group]:not([data-early])'), ...$$('[data-reveal]').filter(el => !el.closest('[data-reveal-group]'))];
  const lead = Math.round(Math.min(56, innerHeight * 0.08));
  const enterIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-in'); }),
    { threshold: 0, rootMargin: `0px 0px -${lead}px 0px` });
  const markLeft = e => {
    const up = e.boundingClientRect.top < 0;
    e.target.style.setProperty('--dir', up ? '-1' : '1'); e.target.dataset.dir = up ? 'up' : 'down';
    e.target.classList.remove('is-in');
  };
  const leaveIO = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) markLeft(e); }), { threshold: 0, rootMargin: '30% 0px 30% 0px' });
  revealEls.forEach(el => { enterIO.observe(el); leaveIO.observe(el); });
  const earlyIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); earlyIO.unobserve(e.target); } }), { threshold: 0, rootMargin: '0px 0px 14% 0px' });
  earlyEls.forEach(el => earlyIO.observe(el));

  /* ===== VISIT: starts early (+15% below the viewport), Argentina first, Chile just after ===== */
  const vps = $$('[data-vp]');
  vps.forEach((v, i) => v.style.setProperty('--vd', i * VISIT_STAGGER_MS + 'ms'));
  const visitIn = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-in'); }),
    { threshold: 0, rootMargin: `0px 0px ${VISIT_LEAD} 0px` });
  vps.forEach(v => visitIn.observe(v));
  if (VISIT_REPLAY) {
    const visitOut = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) markLeft(e); }), { threshold: 0, rootMargin: '30% 0px 30% 0px' });
    vps.forEach(v => visitOut.observe(v));
  }
  // guarantee the final state is always reached (fast scroll, load already scrolled, bottom of page)
  const ensureVisible = () => {
    const bottom = innerHeight + scrollY >= html.scrollHeight - 4;
    if (bottom) revealEls.forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
    vps.forEach(v => { const r = v.getBoundingClientRect(); if (r.top < innerHeight * 1.15 && r.bottom > 0) v.classList.add('is-in'); });
    earlyEls.forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight * 1.14 && r.bottom > 0) el.classList.add('is-in'); });
  };

  /* ===== HERO + header entrance: wait until the loading screen starts to leave ===== */
  const hero = $('.hero'), heroImg = $('.hero__img');
  let started = false;
  const startHero = () => {
    if (started) return; started = true;
    html.classList.add('nav-ready');
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-ready')));
  };
  const imgReady = Promise.race([
    Promise.all([heroImg.decode ? heroImg.decode().catch(() => {}) : 0, document.fonts ? document.fonts.ready : 0]),
    new Promise(r => setTimeout(r, 1400))
  ]);
  const introGate = html.classList.contains('has-intro') ? new Promise(r => document.addEventListener('bk:intro-reveal', r, { once: true })) : Promise.resolve();
  Promise.all([imgReady, introGate]).then(startHero);
  setTimeout(startHero, 16000);          // failsafe (longer than the loading screen + font wait)
  // leaving the hero resets it; coming back replays a quicker version
  new IntersectionObserver(es => es.forEach(e => {
    if (!started) return;
    if (e.isIntersecting) { hero.classList.add('is-replay'); requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-ready'))); }
    else hero.classList.remove('is-ready');
  }), { rootMargin: '30% 0px 30% 0px' }).observe(hero);

  /* ===== one rAF-throttled scroll handler: header blur, parallax, safety nets ===== */
  const header = $('#site-header');
  const par = $$('[data-parallax]').map(el => ({ el, k: parseFloat(el.dataset.parallax) || 0.1, box: el.closest('section') }));
  let ticking = false, scrolled = false;
  const onScroll = () => {
    ticking = false;
    const on = scrolled ? scrollY > HEADER_OFF_PX : scrollY > HEADER_ON_PX;   // small hysteresis so it never flickers around the threshold
    if (on !== scrolled) { scrolled = on; header.classList.toggle('is-scrolled', on); }
    spy();
    if (!reduce.matches) {
      const vh = innerHeight;
      par.forEach(q => {
        const r = q.box.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const prog = (r.top + r.height / 2 - vh / 2) / vh;
        q.el.style.transform = `translate3d(0,${(-prog * q.k * 100).toFixed(2)}px,0)`;
      });
    }
    ensureVisible();
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);

  /* ===== bottom navbar (tablet + mobile): scroll-spy highlights the section on screen ===== */
  const bItems = $$('.bnav__item[data-spy]'), bInd = $('.bnav__ind'), bMQ = matchMedia('(max-width:1099px)');
  const spyEls = bItems.map(a => $(a.dataset.spy));
  let bActive = -2;
  function spy() {
    if (!bMQ.matches) return;
    const line = innerHeight * 0.45; let act = -1;
    spyEls.forEach((el, i) => { const r = el.getBoundingClientRect(); if (r.top <= line && r.bottom > line) act = i; });
    if (innerHeight + scrollY >= html.scrollHeight - 4) act = spyEls.length - 1;     // very bottom of the page = footer / contact
    if (act === bActive) return; bActive = act;
    bItems.forEach((a, i) => { const on = i === act; a.classList.toggle('is-active', on); if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    if (act >= 0) {
      const fromNone = !bInd.classList.contains('is-on');                         // first time (or after a gap): appear in place, do not slide from slot 0
      if (fromNone) { bInd.classList.add('snap'); bInd.style.setProperty('--i', act); void bInd.offsetWidth; bInd.classList.add('is-on'); requestAnimationFrame(() => requestAnimationFrame(() => bInd.classList.remove('snap'))); }
      else bInd.style.setProperty('--i', act);
    } else bInd.classList.remove('is-on');
  }
  bMQ.addEventListener('change', () => { bActive = -2; spy(); });

  /* ===== IN THE MEDIA: cursor-following photo (desktop only). Below the breakpoint no photo is ever requested ===== */
  const news = $('.news'), pop = $('.news__pop'), rows = $$('.news__row');
  const mediaMQ = matchMedia(`(min-width:${MEDIA_IMG_MIN}px)`);
  const loadPop = () => { if (!mediaMQ.matches) return; $$('.news__frame img[data-src]').forEach(i => { i.src = i.dataset.src; i.removeAttribute('data-src'); }); };
  loadPop(); mediaMQ.addEventListener('change', loadPop);
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, shown = false;
  const loop = () => {
    cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
    pop.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
    raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3 && shown) ? requestAnimationFrame(loop) : 0;
  };
  const place = (e, snap) => {
    const r = news.getBoundingClientRect(), w = pop.offsetWidth, h = w * 543 / 488;
    let x = e.clientX - r.left + 8, y = e.clientY - r.top - h * 0.5;
    x = Math.min(x, r.width - w * 0.9); y = Math.max(-h * 0.35, Math.min(y, r.height - h * 0.65));
    tx = x; ty = y; if (snap) { cx = x; cy = y; pop.style.transform = `translate3d(${x}px,${y}px,0)`; }
    if (!raf) raf = requestAnimationFrame(loop);
  };
  const hide = () => { if (!rows.some(r => r.classList.contains('is-hot'))) { pop.classList.remove('is-on'); shown = false; } };
  rows.forEach((row, i) => {
    row.addEventListener('pointerenter', e => {
      if (e.pointerType === 'touch' || !mediaMQ.matches) return;
      row.classList.add('is-hot'); pop.dataset.i = i; place(e, !shown); shown = true; pop.classList.add('is-on');
    });
    row.addEventListener('pointermove', e => { if (e.pointerType !== 'touch' && mediaMQ.matches) place(e, false); });
    row.addEventListener('pointerleave', e => { if (e.pointerType === 'touch') return; row.classList.remove('is-hot'); hide(); });
    const link = $('.news__link', row);
    link.addEventListener('focus', () => {
      if (!link.matches(':focus-visible')) return;
      row.classList.add('is-hot');
      if (!mediaMQ.matches) return;
      pop.dataset.i = i; pop.classList.add('is-on'); shown = true;
      const r = news.getBoundingClientRect(), b = row.getBoundingClientRect();
      place({ clientX: r.left + r.width * 0.6, clientY: b.top + b.height / 2 }, true);
    });
    link.addEventListener('blur', () => { row.classList.remove('is-hot'); hide(); });
  });

  /* ===== AFTER DARK: filter tabs + carousel (one dot per photo, exactly one expanded) ===== */
  const viewport = $('.gal__viewport'), track = $('.gal__track'), cards = $$('.gal__card'), dotsIn = $('.gal__dotsin');
  const tabs = $$('.gal__tab'), live = $('#gal-live');
  const ctry = { argentina: 'Argentina', chile: 'Chile' };
  const counters = { argentina: 0, chile: 0 };
  cards.forEach(c => { const k = c.dataset.cat; counters[k]++; c.dataset.n = String(counters[k]).padStart(2, '0'); });
  const labelOf = c => `${ctry[c.dataset.cat]} / ${c.dataset.n}`;     // same label the photo shows in the section
  let filter = 'all', vis = cards, cur = 0, busy = false;

  const metrics = () => {
    const c = vis[0]; if (!c) return { step: 1, per: 1 };
    const cs = getComputedStyle(track), gap = parseFloat(cs.columnGap) || 0, w = c.getBoundingClientRect().width, padL = parseFloat(cs.paddingLeft) || 0;
    return { step: w + gap, per: Math.max(1, Math.floor((viewport.clientWidth - padL + gap) / (w + gap) + 0.02)) };
  };
  const posOf = () => Math.min(cur, Math.max(0, vis.length - metrics().per));
  const paint = () => {
    const { step, per } = metrics(), p = posOf();
    track.style.transform = `translate3d(${(-p * step).toFixed(2)}px,0,0)`;
    vis.forEach((c, i) => c.classList.toggle('is-vis', i >= p && i < p + per));
    $$('.gal__dot', dotsIn).forEach((d, i) => { const on = i === cur; d.classList.toggle('is-active', on); d.setAttribute('aria-current', on ? 'true' : 'false'); });
    live.textContent = ui().photo(cur + 1, vis.length);
  };
  const goTo = i => { cur = Math.max(0, Math.min(vis.length - 1, i)); paint(); };
  const buildDots = () => {
    dotsIn.textContent = ''; dotsIn.style.setProperty('--n', vis.length);
    vis.forEach((c, i) => {
      const d = document.createElement('button'); d.type = 'button'; d.className = 'gal__dot'; d.setAttribute('aria-label', ui().go(i + 1));
      d.addEventListener('click', () => goTo(i)); dotsIn.appendChild(d);
    });
  };
  function refreshGalleryLabels() {
    cards.forEach(c => { const b = $('.gal__open', c); if (b) b.setAttribute('aria-label', ui().open(labelOf(c))); });
    $$('.gal__dot', dotsIn).forEach((d, i) => d.setAttribute('aria-label', ui().go(i + 1)));
    if (live) live.textContent = ui().photo(cur + 1, vis.length);
  }
  const caption = c => `<span>${ctry[c.dataset.cat]}</span><span>/</span><span>${c.dataset.n}</span>`;
  const apply = () => {
    vis = filter === 'all' ? cards : cards.filter(c => c.dataset.cat === filter);
    cards.forEach(c => { const on = vis.includes(c); c.hidden = !on; $('.gal__cap', c).innerHTML = caption(c); });
    vis.forEach((c, i) => c.style.setProperty('--k', Math.min(i, 5)));
    cur = 0; buildDots(); refreshGalleryLabels();
    track.classList.add('no-anim'); paint(); void track.offsetWidth; track.classList.remove('no-anim');
  };
  const setFilter = f => {
    if (f === filter || busy) return;
    filter = f; busy = true;
    tabs.forEach(t => { const on = t.dataset.filter === f; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    viewport.setAttribute('aria-labelledby', 'tab-' + f);
    if (reduce.matches) { apply(); busy = false; return; }
    track.classList.add('is-leaving');
    setTimeout(() => {
      track.classList.remove('is-leaving'); track.classList.add('is-pre'); apply(); void track.offsetWidth;
      track.classList.remove('is-pre');
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
  viewport.addEventListener('keydown', e => {
    if (e.target !== viewport) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(cur + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(cur - 1); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(vis.length - 1); }
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
    const { step, per } = metrics(), maxP = Math.max(0, vis.length - per); let off = -posOf() * step + dx;
    const lo = -maxP * step; if (off > 0) off *= 0.35; else if (off < lo) off = lo + (off - lo) * 0.35;
    track.style.transform = `translate3d(${off.toFixed(1)}px,0,0)`;
  });
  const endDrag = e => {
    if (!dragging || (e && e.pointerId !== pid)) return;
    dragging = false; viewport.classList.remove('is-drag'); track.classList.remove('no-anim');
    if (locked) {
      const { step, per } = metrics(), maxP = Math.max(0, vis.length - per), p = posOf(), v = Math.abs(dx) / Math.max(1, performance.now() - t0);
      let n = p - Math.round(dx / step);
      if (v > 0.4 || Math.abs(dx) > step * 0.18) n = p + (dx < 0 ? 1 : -1) * Math.max(1, Math.round(Math.abs(dx) / step));
      n = Math.max(0, Math.min(maxP, n));
      if (n !== p) cur = n;
      paint();
    } else paint();
  };
  viewport.addEventListener('pointerup', endDrag); viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  // click a photo → lightbox with the photos of the ACTIVE filter, in the same order, opened on that photo
  track.addEventListener('click', e => {
    const btn = e.target.closest('.gal__open'); if (!btn) return;
    const card = btn.closest('.gal__card'), index = vis.indexOf(card); if (index < 0) return;
    const items = vis.map(c => ({ lg: c.dataset.lg, th: c.dataset.th, label: labelOf(c), alt: $('img', c).alt }));
    document.dispatchEvent(new CustomEvent('bk:lightbox-open', { detail: { items, index, trigger: btn } }));
  });
  document.addEventListener('bk:lightbox-close', e => { if (e.detail && Number.isInteger(e.detail.index)) goTo(e.detail.index); });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { track.classList.add('no-anim'); paint(); void track.offsetWidth; track.classList.remove('no-anim'); }, 120); });
  apply();
  BK.gallery = { refresh: apply, get count() { return vis.length; } };

  /* ===== VISIT: hover (fine pointers) or "in focus" (touch) ===== */
  if (fine.matches) {
    vps.forEach(v => { v.addEventListener('pointerenter', () => v.classList.add('is-hot')); v.addEventListener('pointerleave', () => v.classList.remove('is-hot')); });
  } else {
    const vio = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-hot', e.isIntersecting && e.intersectionRatio > 0.6)), { threshold: [0, 0.6, 1] });
    vps.forEach(v => vio.observe(v));
  }

  /* ===== boot ===== */
  onScroll();                                   // initial header / scroll-spy state (page may load already scrolled)
  $$('[data-lang-toggle]').forEach(b => b.setAttribute('aria-label', ui().langBtn));
  if (lang !== 'en') applyLang();
  else { $$('.lang__b').forEach(b => b.setAttribute('aria-pressed', String(b.textContent.trim().toLowerCase() === 'en'))); refreshGalleryLabels(); }
})();
