/* Loading screen — plays on EVERY load/reload (no sessionStorage / localStorage / cookies). Pure CSS animation; JS only sequences it.
   Tweak the timings below (ms). CSS delays, the hero hand-off and the cleanup are all derived from them.

   Timeline:  draw → fill → approach → CLINK → short pause → background change (glasses fade out, overlapped) → title → hold → fade-out
   Events:    'bk:intro-reveal' (overlay starts leaving → hero may start)   'bk:intro-done' (overlay removed)  */
(() => {
  'use strict';
  const html = document.documentElement;
  const el = document.getElementById('intro');
  if (!el) return;
  if (!html.classList.contains('has-intro')) { el.remove(); return; }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = reduce
    ? { draw: 200, fill: 0,   approach: 0,   settle: 0,   pause: 350, bg: 350, sceneDelay: 0,  title: 400, hold: 600, out: 300, overlap: 0,   spark: 0 }     // gentler: crossfades only (~2.2s)
    : { draw: 200, fill: 750, approach: 350, settle: 200, pause: 150, bg: 400, sceneDelay: 60, title: 350, hold: 450, out: 350, overlap: 100, spark: 450 };   // ≈ 2.8s total
  const FONT_WAIT_MAX = 2500;

  const s = {};
  s.draw   = 0;
  s.fill   = Math.round(T.draw * 0.8);                       // strokes are almost done when the whisky starts rising
  s.clink  = s.fill + T.fill - T.overlap;                    // glasses start to approach just before the fill ends
  s.impact = s.clink + T.approach;
  s.bg     = s.impact + T.pause;                             // short held beat after the clink, then the background changes
  s.scene  = s.bg + T.sceneDelay;                            // glasses fade only after the background has begun to change
  s.title  = s.bg + Math.round(T.bg * 0.9);                  // title enters when the background is (almost) done
  s.out    = s.title + T.title + T.hold;                     // title stays readable for T.hold (+ its own entrance)
  const total = s.out + T.out;

  const set = (k, v) => el.style.setProperty(k, v + 'ms');
  set('--s-draw', s.draw); set('--s-fill', s.fill); set('--s-clink', s.clink); set('--s-bg', s.bg); set('--s-scene', s.scene); set('--s-title', s.title);
  set('--t-draw', T.draw); set('--t-fill', T.fill); set('--t-approach', T.approach); set('--t-settle', T.settle);
  set('--t-bg', T.bg); set('--t-scene', T.bg); set('--t-title', T.title); set('--t-out', T.out); set('--t-spark', T.spark);

  // background site is not reachable (focus / screen readers) while the overlay is up
  const apps = [...document.querySelectorAll('[data-app]')];
  apps.forEach(a => { a.inert = true; });

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
