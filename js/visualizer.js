/* "The Sound of Backroom" visualizer — canvas + requestAnimationFrame.
   • Idle: slow organic wave field (layered sines), eased frame-to-frame.
   • Audio: if assets/audio/backroom-jazz.mp3 exists, a play button appears; once the visitor presses it, the bars react to the real
     signal through a Web Audio AnalyserNode and crossfade from the idle wave. Audio never starts by itself.
   Rounded thin bars, ink colour from the palette, paused when off-screen or the tab is hidden. */
(() => {
  'use strict';
  const cv = document.getElementById('viz'); if (!cv) return;
  const ctx = cv.getContext('2d'), btn = document.getElementById('viz-play');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const BARS = 44, BAR_W = 2.6, SMOOTH_MS = 120, AUDIO_MIX_MS = 700;
  const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#EBE4D7';
  let W = 0, H = 0, dpr = 1, visible = true, running = false, last = 0, t = 0, mix = 0;
  const shown = new Float32Array(BARS).fill(0.12), target = new Float32Array(BARS);

  /* ---- audio (optional) ---- */
  const src = cv.dataset.audio;
  let audio = null, actx = null, analyser = null, bins = null, playing = false;
  const ui = () => (window.BK && BK.lang && BK.lang() === 'es') ? { play: 'Reproducir jazz', pause: 'Pausar jazz' } : { play: 'Play jazz', pause: 'Pause jazz' };
  const setBtn = () => { btn.setAttribute('aria-pressed', String(playing)); btn.setAttribute('aria-label', playing ? ui().pause : ui().play); btn.querySelector('use').setAttribute('href', playing ? '#i-pause' : '#i-play'); };
  if (src && btn) {
    const probe = new Audio(); probe.preload = 'metadata';
    probe.addEventListener('loadedmetadata', () => { audio = probe; audio.loop = true; btn.hidden = false; setBtn(); }, { once: true });
    probe.addEventListener('error', () => { btn.hidden = true; });          // no file → idle animation only
    probe.src = src;
    btn.addEventListener('click', async () => {
      if (!audio) return;
      if (!actx) {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        actx = new AC(); analyser = actx.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.82;
        const node = actx.createMediaElementSource(audio); node.connect(analyser); analyser.connect(actx.destination);
        bins = new Uint8Array(analyser.frequencyBinCount);
      }
      if (actx.state === 'suspended') await actx.resume();
      if (audio.paused) { try { await audio.play(); playing = true; } catch (e) { playing = false; } } else { audio.pause(); playing = false; }
      setBtn(); start();
    });
    audio && audio.addEventListener('ended', () => { playing = false; setBtn(); });
    document.addEventListener('bk:lang', setBtn);
  }

  /* ---- sizing ---- */
  const resize = () => {
    const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
  };
  new ResizeObserver(resize).observe(cv);

  /* ---- model ---- */
  const idle = (i, time) => {
    const u = i / (BARS - 1), env = Math.pow(Math.sin(Math.PI * u), 0.8);                 // bell: calm edges, lively centre
    const a = 0.5 + 0.5 * Math.sin(time * 0.9 + i * 0.42), b = 0.6 + 0.4 * Math.sin(time * 0.37 - i * 0.21), c = 0.5 + 0.5 * Math.sin(time * 1.7 + i * 0.9);
    return 0.1 + 0.62 * env * (0.55 * a * b + 0.45 * c * 0.6);
  };
  const live = () => {
    analyser.getByteFrequencyData(bins);
    const lo = 2, hi = Math.floor(bins.length * 0.78);
    for (let i = 0; i < BARS; i++) {
      const f0 = Math.floor(lo * Math.pow(hi / lo, i / BARS)), f1 = Math.max(f0 + 1, Math.floor(lo * Math.pow(hi / lo, (i + 1) / BARS)));
      let s = 0; for (let k = f0; k < f1; k++) s += bins[k]; target[i] = Math.min(1, Math.pow(s / (f1 - f0) / 255, 1.15) * 1.25);
    }
  };
  const step = dt => {
    t += dt / 1000;
    mix += ((playing ? 1 : 0) - mix) * (1 - Math.exp(-dt / AUDIO_MIX_MS));
    if (analyser && playing) live();
    const k = 1 - Math.exp(-dt / SMOOTH_MS);                                              // interpolation between frames
    for (let i = 0; i < BARS; i++) {
      const want = (1 - mix) * idle(i, t) + mix * Math.max(0.06, target[i]);
      shown[i] += (want - shown[i]) * k;
    }
  };

  /* ---- draw ---- */
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const gap = (W - BARS * BAR_W) / (BARS - 1), mid = H / 2;
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, ink); g.addColorStop(0.5, ink); g.addColorStop(1, 'rgba(235,228,215,.35)');
    ctx.fillStyle = g;
    for (let i = 0; i < BARS; i++) {
      const h = Math.max(BAR_W, shown[i] * (H - 2)), x = i * (BAR_W + gap), y = mid - h / 2;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, BAR_W, h, BAR_W / 2); else ctx.rect(x, y, BAR_W, h); ctx.fill();
    }
  };
  const frame = now => {
    if (!running) return;
    const dt = Math.min(64, now - (last || now)); last = now;
    step(dt); draw();
    if ((visible && !document.hidden) && (!reduce.matches || playing || mix > 0.01)) requestAnimationFrame(frame); else { running = false; last = 0; }
  };
  function start() { if (running || !visible || document.hidden) return; running = true; last = 0; requestAnimationFrame(frame); }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: 0.05 }).observe(cv);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); else if (audio && playing) { /* keep audio going; just stop drawing */ } });
  reduce.addEventListener('change', start);
  // reduced motion: one calm static frame; the bars only move if the visitor presses play
  if (reduce.matches) { for (let i = 0; i < BARS; i++) shown[i] = idle(i, 1.2); draw(); }
  resize(); start();
})();
