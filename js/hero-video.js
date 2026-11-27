/* Hero video playback controller — keeps the muted loop playing while the hero is visible and the tab is active, and recovers from every kind of stop:
   unexpected pause, stalled/waiting, error, a frozen picture (currentTime not advancing), the native loop hanging at the end, autoplay refusal
   (low-power mode → resumes on the first touch / scroll / key), visibility / tab changes. Retries are bounded (no infinite loops).
   Exposes BK.heroVideo = { ready, start(), prime(), stats, log } — the loading screen primes it hidden under "Cheers", main.js starts it when the overlay leaves. */
(() => {
  'use strict';
  const v = document.getElementById('hero-video'); if (!v) return;
  const hero = v.closest('.hero');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  window.BK = window.BK || {};
  const stats = { recoveries: 0, byReason: {}, blocked: 0, frozen: 0, loops: 0, lastError: null };
  const log = [];
  const note = (ev, extra) => { if (log.length > 400) log.shift(); log.push([Math.round(performance.now()), ev, +v.currentTime.toFixed(2), v.readyState, v.networkState, v.paused, extra || '']); };

  v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.controls = false;
  v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', ''); v.disablePictureInPicture = true;

  let started = false, visible = true, internalPause = false, blocked = false, tries = 0, lastFrame = performance.now(), loadAttempts = 0, waitTimer = 0, pauseTimer = 0;
  const shouldPlay = () => started && visible && !document.hidden && !reduce.matches;
  const recovered = reason => { stats.recoveries++; stats.byReason[reason] = (stats.byReason[reason] || 0) + 1; note('recover', reason); };

  const tryPlay = reason => {
    if (!shouldPlay()) return;
    internalPause = false;
    const p = v.play();
    if (p && p.catch) p.catch(e => {                                  // autoplay refused (low-power mode…): keep the poster, resume on the first gesture, no console noise
      blocked = true; stats.blocked++; note('blocked', e && e.name);
    });
    if (reason) recovered(reason);
  };
  const interactions = ['pointerdown', 'touchstart', 'keydown', 'scroll', 'wheel'];
  const onGesture = () => { if (blocked) { blocked = false; tryPlay('gesture'); } };
  interactions.forEach(n => addEventListener(n, onGesture, { passive: true }));

  /* ---- events ---- */
  v.addEventListener('pause', () => {
    note('pause', internalPause ? 'internal' : 'unexpected');
    if (internalPause || v.ended || !shouldPlay()) return;
    clearTimeout(pauseTimer); pauseTimer = setTimeout(() => { if (v.paused && shouldPlay() && !blocked) tryPlay('unexpected-pause'); }, 250);   // the browser (battery saver, OS) paused it: resume
  });
  const waiting = () => {
    note('waiting'); clearTimeout(waitTimer);
    waitTimer = setTimeout(() => {                                        // still not playing after ~2.5s
      if (!shouldPlay() || (!v.paused && v.readyState >= 3 && performance.now() - lastFrame < 1500)) return;
      if (tries++ < 3) { tryPlay('stalled'); } else { hardReload('stalled'); }
    }, 2500);
  };
  v.addEventListener('waiting', waiting); v.addEventListener('stalled', waiting);
  v.addEventListener('playing', () => { note('playing'); clearTimeout(waitTimer); tries = 0; });
  v.addEventListener('canplay', () => { note('canplay'); if (shouldPlay() && v.paused && !blocked) tryPlay(); });
  v.addEventListener('suspend', () => { note('suspend'); if (shouldPlay() && v.paused && v.readyState < 3 && !blocked) setTimeout(() => tryPlay('suspend'), 400); });
  v.addEventListener('error', () => { stats.lastError = v.error && v.error.code; note('error', stats.lastError); if (loadAttempts++ < 3) setTimeout(() => hardReload('error'), 600 * loadAttempts); });
  v.addEventListener('ended', () => { stats.loops++; note('ended'); if (!v.loop) return; try { v.currentTime = 0; } catch (e) {} tryPlay('loop-end'); });   // the native loop normally handles this; this is the safety net
  v.addEventListener('emptied', () => note('emptied')); v.addEventListener('seeking', () => note('seeking')); v.addEventListener('ratechange', () => { if (v.playbackRate !== 1) v.playbackRate = 1; });

  /* reload from the same position (last resort) */
  function hardReload(reason) {
    if (!shouldPlay()) return;
    const t = v.currentTime || 0; stats.recoveries++; stats.byReason[reason + '-reload'] = (stats.byReason[reason + '-reload'] || 0) + 1; note('reload', reason);
    v.load(); const resume = () => { try { v.currentTime = Math.max(0, t - 0.05); } catch (e) {} tryPlay(); };
    v.addEventListener('loadeddata', resume, { once: true });
  }

  /* ---- frozen-picture watchdog: "playing" but no new frame for ~2s ---- */
  const stamp = () => { lastFrame = performance.now(); if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(stamp); };
  if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(stamp); else v.addEventListener('timeupdate', () => { lastFrame = performance.now(); });
  let freezeStep = 0;
  setInterval(() => {
    if (!shouldPlay() || blocked) { freezeStep = 0; return; }
    if (v.paused && !v.ended) { tryPlay('paused-watch'); return; }                       // should be playing but is paused
    if (!v.paused && performance.now() - lastFrame > 2200 && v.readyState >= 2) {       // picture frozen
      stats.frozen++; freezeStep++;
      if (freezeStep === 1) { internalPause = true; v.pause(); setTimeout(() => tryPlay('freeze-replay'), 80); }
      else if (freezeStep === 2) { try { v.currentTime = Math.min((v.duration || 1) - .1, v.currentTime + .08); } catch (e) {} tryPlay('freeze-nudge'); }
      else if (freezeStep >= 3) { freezeStep = 0; hardReload('freeze'); }
    } else freezeStep = 0;
  }, 1000);

  /* ---- visibility: pause off-screen / hidden tab (battery), resume as soon as it is visible again (stable threshold + small debounce) ---- */
  let ioTimer = 0;
  new IntersectionObserver(es => {
    const vis = es[0].intersectionRatio > 0.05;
    clearTimeout(ioTimer); ioTimer = setTimeout(() => {
      if (vis === visible) return; visible = vis; note('io', vis ? 'visible' : 'hidden');
      if (vis) tryPlay('visible'); else { internalPause = true; v.pause(); }
    }, 150);
  }, { threshold: [0, 0.05, 0.25] }).observe(hero);
  document.addEventListener('visibilitychange', () => { note('tab', document.hidden ? 'hidden' : 'visible'); if (document.hidden) { internalPause = true; v.pause(); } else { tries = 0; tryPlay('tab-back'); } });
  addEventListener('pageshow', e => { if (e.persisted) tryPlay('pageshow'); });
  reduce.addEventListener('change', () => { if (reduce.matches) { internalPause = true; v.pause(); } else tryPlay(); });

  /* ---- loading: download starts at the first idle moment; "ready" resolves on loadeddata / error ---- */
  const ready = new Promise(r => { if (v.readyState >= 2) r(); else { v.addEventListener('loadeddata', r, { once: true }); v.addEventListener('error', r, { once: true }); } });
  if (!reduce.matches) (window.requestIdleCallback || (f => setTimeout(f, 300)))(() => { v.preload = 'auto'; v.load(); note('load'); }, { timeout: 1200 });

  BK.heroVideo = {
    ready, stats, log,
    prime() { if (reduce.matches) return; const p = v.play(); if (p && p.catch) p.catch(() => {}); },       // muted warm-up while "Cheers" shows (the overlay still covers the hero)
    start() { started = true; tryPlay(); if (v.readyState < 3) v.addEventListener('canplay', () => shouldPlay() && tryPlay(), { once: true }); }   // the loading screen is leaving
  };
})();
