/* Loading screen — plays on EVERY load/reload (no sessionStorage / localStorage / cookies). CSS does the animating; JS only sequences it.
   Sequence:  "It's shot time" on #4A5254 → cut to #060302 → shots are drawn → whisky fills → shots approach → CLINK (hit-stop, rebound,
              hand-drawn strokes, shock ring, droplets, amber glow, camera push-in) → "Cheers" above the shots → overlay fades out → site.
   Tweak the timings in T (ms). Every CSS delay/duration, the hero hand-off and the cleanup derive from it.
   Events: 'bk:intro-reveal' (overlay starts leaving → hero may start)   'bk:intro-done' (overlay removed) */
(() => {
  'use strict';
  const html = document.documentElement;
  const el = document.getElementById('intro');
  if (!el) return;
  if (!html.classList.contains('has-intro')) { el.remove(); return; }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = reduce
    ? { titleIn: 360, titleHold: 520, titleOut: 300, bgGap: 0,  bg: 480, drawOverlap: 0,   draw: 280, fillOverlap: 0,   fill: 0,   approachOverlap: 0,   approach: 0,   hitstop: 0, rebound: 0,   cheersDelay: 160, cheersIn: 420, cheersHold: 520, out: 320, push: 0,    spark: 0 }    // gentler: crossfades only (~2.8s)
    : { titleIn: 380, titleHold: 300, titleOut: 420, bgGap: 40, bg: 640, drawOverlap: 300, draw: 420, fillOverlap: 240, fill: 620, approachOverlap: 180, approach: 620, hitstop: 0, rebound: 760, cheersDelay: 60,  cheersIn: 520, cheersHold: 120, out: 700, push: 1800, spark: 560 };   // ≈ 3.7s total; phases overlap, no dead time, no hit-stop
  const FONT_WAIT_MAX = 2500;

  const s = {};
  s.titleOut = T.titleIn + T.titleHold;                       // "It's shot time" starts leaving
  s.bg       = s.titleOut + T.bgGap;                          // background #4A5254 → #060302 (a cross-fade of two layers, overlapping the title's exit)
  s.draw     = s.bg + T.bg - T.drawOverlap;                   // the shots start to be drawn while the background is still settling
  s.fill     = s.draw + T.draw - T.fillOverlap;               // the whisky starts rising before the last strokes finish
  s.approach = s.fill + T.fill - T.approachOverlap;           // the glasses start moving before the glass is full
  s.impact   = s.approach + T.approach;                       // contact (the motion keeps flowing: no hit-stop)
  s.rebound  = s.impact + T.hitstop;
  s.cheers   = s.impact + T.cheersDelay;                      // "Cheers" appears as the toast settles
  s.out      = s.cheers + T.cheersIn + T.cheersHold;          // the overlay starts a long fade that overlaps the hero entrance
  const total = s.out + T.out;

  const set = (k, v) => el.style.setProperty(k, v + 'ms');
  set('--s-title-out', s.titleOut); set('--t-title-in', T.titleIn); set('--t-title-out', T.titleOut);
  set('--s-bg', s.bg); set('--t-bg', T.bg);
  set('--s-draw', s.draw); set('--t-draw', T.draw); set('--s-fill', s.fill); set('--t-fill', T.fill);
  set('--s-approach', s.approach); set('--t-approach', T.approach); set('--s-impact', s.impact);
  set('--s-rebound', s.rebound); set('--t-rebound', T.rebound); set('--t-spark', T.spark);
  set('--s-cheers', s.cheers); set('--t-cheers', T.cheersIn); set('--t-push', T.push); set('--t-out', T.out);

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
    setTimeout(() => document.dispatchEvent(new Event('bk:intro-prime')), s.cheers);          // the hero video warms up (hidden) while "Cheers" shows
    setTimeout(() => {                                       // overlay starts to leave → hero entrance may begin
      html.classList.add('intro-reveal'); el.classList.add('is-out');
      document.dispatchEvent(new Event('bk:intro-reveal'));
    }, s.out);
    setTimeout(finish, total);
  };

  // wait for Canela so neither "It's shot time" nor "Cheers" swaps font mid-animation
  const fontReady = (document.fonts && document.fonts.load) ? document.fonts.load('300 64px Canela').catch(() => {}) : Promise.resolve();
  const siteReady = () => (window.BK && window.BK.ready) ? Promise.resolve() : new Promise(r => { document.addEventListener('bk:ready', r, { once: true }); setTimeout(r, 1200); });
  Promise.race([fontReady, new Promise(r => setTimeout(r, FONT_WAIT_MAX))]).then(siteReady).then(run);
  setTimeout(finish, total + FONT_WAIT_MAX + 1500);          // hard failsafe
  window.BK = window.BK || {}; window.BK.intro = { timing: T, starts: s, total };
})();
