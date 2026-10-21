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
    ? { titleIn: 400, titleHold: 600, titleOut: 300, bgGap: 0,   bg: 500, drawOverlap: 0,   draw: 300, fill: 0,   approach: 0,   hitstop: 0,  rebound: 0,   cheersDelay: 200, cheersIn: 450, cheersHold: 700, out: 300, push: 0,    spark: 0 }     // gentler: crossfades only (~3.3s)
    : { titleIn: 400, titleHold: 500, titleOut: 400, bgGap: 100, bg: 600, drawOverlap: 100, draw: 350, fill: 600, approach: 300, hitstop: 70, rebound: 520, cheersDelay: 150, cheersIn: 450, cheersHold: 550, out: 400, push: 1300, spark: 420 };   // ≈ 4.3s total
  const FONT_WAIT_MAX = 2500;

  const s = {};
  s.titleOut = T.titleIn + T.titleHold;                       // "It's shot time" starts leaving
  s.bg       = s.titleOut + T.bgGap;                          // background #4A5254 → #060302 (overlaps the title's exit)
  s.draw     = s.bg + T.bg - T.drawOverlap;                   // shots are drawn as the background settles
  s.fill     = s.draw + T.draw;
  s.approach = s.fill + T.fill;
  s.impact   = s.approach + T.approach;                       // contact
  s.rebound  = s.impact + T.hitstop;                          // micro hit-stop, then the damped rebound
  s.cheers   = s.impact + T.cheersDelay;                      // "Cheers" appears once the toast has settled
  s.out      = s.cheers + T.cheersIn + T.cheersHold;          // overlay starts to fade
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
    setTimeout(() => {                                       // overlay starts to leave → hero entrance may begin
      html.classList.add('intro-reveal'); el.classList.add('is-out');
      document.dispatchEvent(new Event('bk:intro-reveal'));
    }, s.out);
    setTimeout(finish, total);
  };

  // wait for Canela so neither "It's shot time" nor "Cheers" swaps font mid-animation
  const fontReady = (document.fonts && document.fonts.load) ? document.fonts.load('300 64px Canela').catch(() => {}) : Promise.resolve();
  Promise.race([fontReady, new Promise(r => setTimeout(r, FONT_WAIT_MAX))]).then(run);
  setTimeout(finish, total + FONT_WAIT_MAX + 1500);          // hard failsafe
  window.BK = window.BK || {}; window.BK.intro = { timing: T, starts: s, total };
})();
