/* Loading screen — runs once per session (sessionStorage). Pure CSS animation; JS only sequences it.
   Tweak the timings below (ms). Everything else (CSS delays, hero hand-off, cleanup) is derived from them.

   Timeline:  draw → fill → clink → bg change → title → hold → fade-out
   Events:    'bk:intro-reveal' (overlay starts leaving → hero may start)   'bk:intro-done' (overlay removed)  */
(() => {
  'use strict';
  const html = document.documentElement;
  const el = document.getElementById('intro');
  if (!el) return;
  if (!html.classList.contains('has-intro')) { el.remove(); return; }   // already seen this session → no overlay at all, site shows directly

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = reduce
    ? { draw: 250, fill: 0,    clink: 0,   pre: 600, bg: 400, title: 500, hold: 600, out: 300 }   // gentler: crossfades only
    : { draw: 300, fill: 1150, clink: 350, pre: 0,   bg: 450, title: 600, hold: 300, out: 400 };  // ≈ 3.4s total
  const FONT_WAIT_MAX = 2500;

  const s = {};
  s.draw  = 0;
  s.fill  = s.draw + T.draw;
  s.clink = s.fill + T.fill;
  s.bg    = s.clink + Math.round(T.clink * 0.8) + T.pre;     // starts right after the impact
  s.title = s.bg + Math.round(T.bg * 0.9);                   // once the background has (almost) changed
  s.out   = s.title + T.title + T.hold;
  const total = s.out + T.out;

  const set = (k, v) => el.style.setProperty(k, v + 'ms');
  ['draw', 'fill', 'clink', 'bg', 'title'].forEach(k => { set('--s-' + k, s[k]); set('--t-' + k, T[k]); });
  set('--t-out', T.out);

  // background site is not reachable (focus / screen readers) while the overlay is up
  const apps = [...document.querySelectorAll('[data-app]')];
  apps.forEach(a => { a.inert = true; });
  try { sessionStorage.setItem('bk-intro', '1'); } catch (e) {}

  let done = false;
  const finish = () => {
    if (done) return; done = true;
    el.remove(); html.classList.remove('has-intro');
    apps.forEach(a => { a.inert = false; });
    document.dispatchEvent(new Event('bk:intro-done'));
  };

  const run = () => {
    el.classList.add('is-play');
    setTimeout(() => {                                       // overlay starts to leave → hero entrance may begin
      html.classList.add('intro-reveal'); el.classList.add('is-out');
      document.dispatchEvent(new Event('bk:intro-reveal'));
    }, s.out);
    setTimeout(finish, total);
  };

  // wait for Canela (title) so there is no font swap on the title card
  const fontReady = (document.fonts && document.fonts.load) ? document.fonts.load('300 64px Canela').catch(() => {}) : Promise.resolve();
  Promise.race([fontReady, new Promise(r => setTimeout(r, FONT_WAIT_MAX))]).then(run);
  setTimeout(finish, total + FONT_WAIT_MAX + 1500);          // hard failsafe
  window.BK = window.BK || {}; window.BK.intro = { timing: T, starts: s, total };
})();
