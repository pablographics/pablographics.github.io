/* "The Sound of Backroom" — a row of notes, ONE lit at a time.
   • The lit note is tall, fully opaque and takes the next colour of the palette (#E5C99E → #EBE4D7 → #CF7F1D …).
     Every other note rests low (scaleY) and at ~20% opacity. The note going out fades slowly while the next one lights quickly,
     so the two overlap and the line reads as one melody. Only transform / opacity / background-color are animated (see .note in the CSS).
   • Every bar has its OWN height (an organic 25–100% profile with sharp neighbour-to-neighbour differences, like a real waveform) and breathes
     around it with its own period / phase / amplitude (CSS, scale property) — so the row never looks uniform.
   • WAVE: heights are interpolated every frame (smooth), the lit note peaks and its neighbours rise with it (bell fall-off) + a slow travelling sine.
   • No audio: a calm, slightly irregular idle melody (random walk with phrases, rests, swing).
   • Audio: if data-audio points to a file, a play button appears; once the visitor presses it, the lit note follows the dominant frequency
     band from a Web Audio AnalyserNode (smoothed + hysteresis so it never flickers). Audio never starts by itself.
   • Runs on requestAnimationFrame only while visible and the tab is active; everything is released on pagehide. */
(() => {
  'use strict';
  const box = document.getElementById('viz'); if (!box) return;
  const btn = document.getElementById('viz-play');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- easy to tweak ---- */
  const COLORS = ['#E5C99E', '#EBE4D7', '#CF7F1D'];          // palette only; the lit note rotates through these
  const MIN_NOTES = 12, MAX_NOTES = 24, NOTE_PITCH_PX = 9.5; // count = viewport-aware: width / pitch, clamped
  const BEAT_MS = 470;                                       // calm tempo (~32% faster than before: it was 620)
  const SWING = 0.14, REST_CHANCE = 0.14;                    // natural feel: uneven timing + occasional rests
  const HOLD_MIN_MS = 150, SWITCH_RATIO = 1.18, GATE = 0.1;  // audio mode: hysteresis so the note does not flicker

  let notes = [], base = [], lift = new Float32Array(0), lastT = 0, n = 0, active = -1, colorIdx = 0, pos = 0, visible = false, running = false, raf = 0, nextAt = 0, phraseLeft = 0, lastSwitch = 0;
  let playing = false, audio = null, actx = null, analyser = null, bins = null, bands = null;

  /* ---- height profile: layered sines + a per-bar term → peaks and valleys, normalised to 25–100%, neighbours always >= 7 points apart ---- */
  const frac = x => x - Math.floor(x);
  const profile = count => {
    const raw = Array.from({ length: count }, (_, i) => { const u = i / Math.max(1, count - 1);
      return 0.5 + 0.26 * Math.sin(u * 9.2 + 0.8) + 0.18 * Math.sin(u * 21 + 1.9) + 0.12 * Math.sin(u * 37 + 0.3) + 0.24 * (frac(Math.sin(i * 12.9898) * 43758.5453) - 0.5); });
    const lo = Math.min(...raw), hi = Math.max(...raw);
    const b = raw.map(r => 0.25 + 0.75 * (r - lo) / (hi - lo));
    for (let i = 1; i < count; i++) {
      if (Math.abs(b[i] - b[i - 1]) < 0.07) { const up = b[i - 1] < 0.6; b[i] = Math.max(0.25, Math.min(1, b[i - 1] + (up ? 0.1 : -0.1))); }
    }
    return b;
  };
  const setHeight = (el, b) => { el.style.setProperty('--b', b.toFixed(3)); el.style.setProperty('--a', Math.min(1, b * 1.22 + 0.12).toFixed(3)); };

  /* ---- build the bars (count follows the available width) ---- */
  const build = () => {
    const w = box.clientWidth || 200, count = Math.max(MIN_NOTES, Math.min(MAX_NOTES, Math.round(w / NOTE_PITCH_PX)));
    if (count === n) return;
    n = count; box.textContent = ''; notes = []; active = -1; pos = Math.floor(n / 2); bands = new Float32Array(n); lift = new Float32Array(n); base = profile(n);
    for (let i = 0; i < n; i++) {
      const el = document.createElement('i'); el.className = 'note';
      setHeight(el, base[i]);
      el.style.setProperty('--amp', (0.08 + 0.14 * frac(Math.sin(i * 12.9898) * 43758.5453)).toFixed(3));        // each bar: own amplitude …
      el.style.setProperty('--dur', (2.2 + 2.6 * frac(Math.sin(i * 78.233) * 12345.6789)).toFixed(2) + 's');     // … own period …
      el.style.setProperty('--dly', '-' + (3 * frac(Math.sin(i * 39.346) * 9876.54321)).toFixed(2) + 's');        // … and own phase
      box.appendChild(el); notes.push(el);
    }
    if (reduce.matches && !playing) { light(pos); notes.forEach((el, i) => el.style.setProperty('--l', i === pos ? '.85' : '0')); }   // reduced motion: one calm static note
  };
  function light(i) {
    if (active === i) return;
    if (active >= 0 && notes[active]) notes[active].classList.remove('is-on');        // slow fade-out …
    active = i;
    if (i >= 0 && notes[i]) {
      const el = notes[i];
      el.style.setProperty('--c', COLORS[colorIdx++ % COLORS.length]);
      el.style.setProperty('--h', (0.66 + Math.random() * 0.34).toFixed(2));          // each note has its own height
      el.classList.add('is-on');                                                      // … while the next lights up quickly
    }
  }

  /* ---- idle melody ---- */
  const nextIdle = now => {
    if (phraseLeft <= 0) { phraseLeft = 4 + Math.floor(Math.random() * 5); light(-1); nextAt = now + BEAT_MS * (1 + Math.random() * 0.8); return; }   // a rest between phrases
    phraseLeft--;
    if (Math.random() < REST_CHANCE) { light(-1); nextAt = now + BEAT_MS * 0.5; return; }
    const steps = [-3, -2, -1, -1, 1, 1, 2, 3], pull = (n / 2 - pos) / n;               // random walk, gently pulled to the centre
    let step = steps[Math.floor(Math.random() * steps.length)]; if (Math.random() < 0.5 + pull) step = Math.abs(step); else step = -Math.abs(step);
    pos = Math.max(0, Math.min(n - 1, pos + step)); light(pos);
    const dur = [0.5, 1, 1, 1, 1.5, 2][Math.floor(Math.random() * 6)] * BEAT_MS;
    nextAt = now + dur * (1 + (Math.random() - 0.5) * SWING * 2);
  };

  /* ---- audio mode: dominant band ---- */
  const nextAudio = now => {
    analyser.getByteFrequencyData(bins);
    const lo = 2, hi = Math.floor(bins.length * 0.8); let best = 0, bi = -1, total = 0;
    for (let i = 0; i < n; i++) {
      const f0 = Math.floor(lo * Math.pow(hi / lo, i / n)), f1 = Math.max(f0 + 1, Math.floor(lo * Math.pow(hi / lo, (i + 1) / n)));
      let s = 0; for (let k = f0; k < f1; k++) s += bins[k];
      const e = s / (f1 - f0) / 255; bands[i] += (e - bands[i]) * 0.35; total += bands[i];   // smoothing
      if (bands[i] > best) { best = bands[i]; bi = i; }
    }
    if (best < GATE) { if (active >= 0 && now - lastSwitch > 400) { light(-1); lastSwitch = now; } return; }   // silence = rest
    if (bi !== active && now - lastSwitch > HOLD_MIN_MS && (active < 0 || best > bands[active] * SWITCH_RATIO)) { light(bi); lastSwitch = now; }
  };

  /* ---- loop ---- */
  const frame = now => {
    raf = 0; if (!running) return;
    if (playing && analyser) nextAudio(now); else if (!reduce.matches && now >= nextAt) nextIdle(now);
    /* the wave: every bar glides (time-based smoothing, ~110ms) towards its target height; the lit note peaks and its neighbours follow with a bell-shaped
       fall-off, plus a slow travelling sine so the whole row undulates like a wave. Audio: the targets are the (smoothed) band energies. */
    const dt = Math.min(64, now - (lastT || now)); lastT = now; const k = 1 - Math.exp(-dt / 110);
    for (let i = 0; i < n; i++) {
      let tg;
      if (playing && analyser) tg = Math.min(1, bands[i] * 1.5);
      else { const d = active < 0 ? 99 : Math.abs(i - active); tg = (active < 0 ? 0 : 0.82 * Math.exp(-(d * d) / (2 * 1.7 * 1.7))) + 0.12 * (0.5 + 0.5 * Math.sin(now * 0.0024 - i * 0.55)); }
      lift[i] += (Math.min(1, tg) - lift[i]) * k; notes[i].style.setProperty('--l', lift[i].toFixed(3));
    }
    if (visible && !document.hidden && (!reduce.matches || playing)) raf = requestAnimationFrame(frame); else { running = false; box.classList.add('is-paused'); }
  };
  const start = () => { if (running || !visible || document.hidden) return; box.classList.remove('is-paused'); running = true; nextAt = performance.now() + 200; raf = requestAnimationFrame(frame); };

  /* ---- optional audio file ---- */
  const src = box.dataset.audio;
  const label = () => (window.BK && BK.lang && BK.lang() === 'es') ? { play: 'Reproducir jazz', pause: 'Pausar jazz' } : { play: 'Play jazz', pause: 'Pause jazz' };
  const setBtn = () => { if (!btn) return; btn.setAttribute('aria-pressed', String(playing)); btn.setAttribute('aria-label', playing ? label().pause : label().play); btn.querySelector('use').setAttribute('href', playing ? '#i-pause' : '#i-play'); };
  if (src && btn) {
    const probe = new Audio(); probe.preload = 'metadata';
    probe.addEventListener('loadedmetadata', () => { audio = probe; audio.loop = true; btn.hidden = false; setBtn(); }, { once: true });
    probe.addEventListener('error', () => { btn.hidden = true; }, { once: true });
    probe.addEventListener('ended', () => { playing = false; box.classList.remove('is-audio'); notes.forEach((el, i) => setHeight(el, base[i])); setBtn(); });
    probe.src = src;
    btn.addEventListener('click', async () => {
      if (!audio) return;
      if (!actx) {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        actx = new AC(); analyser = actx.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.8;
        const node = actx.createMediaElementSource(audio); node.connect(analyser); analyser.connect(actx.destination); bins = new Uint8Array(analyser.frequencyBinCount);
      }
      if (actx.state === 'suspended') await actx.resume();
      if (audio.paused) { try { await audio.play(); playing = true; } catch (e) { playing = false; } } else { audio.pause(); playing = false; }
      box.classList.toggle('is-audio', playing); if (!playing) notes.forEach((el, i) => setHeight(el, base[i]));
      setBtn(); start();
    });
    document.addEventListener('bk:lang', setBtn);
  }

  /* ---- lifecycle ---- */
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start(); else box.classList.add('is-paused'); }, { threshold: 0.05 }); io.observe(box);
  const ro = new ResizeObserver(() => build()); ro.observe(box);
  const onVis = () => { if (!document.hidden) start(); };
  document.addEventListener('visibilitychange', onVis);
  reduce.addEventListener('change', () => { if (reduce.matches && !playing) light(pos); else start(); });
  addEventListener('pagehide', () => {                      // release everything
    cancelAnimationFrame(raf); running = false; io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', onVis);
    if (audio) audio.pause(); if (actx && actx.state !== 'closed') actx.close();
  });
  build(); start();
})();
