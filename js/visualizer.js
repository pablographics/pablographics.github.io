/* "The Sound of Backroom" — a row of notes, ONE lit at a time.
   • The lit note is tall, fully opaque and takes the next colour of the palette (#E5C99E → #EBE4D7 → #CF7F1D …).
     Every other note rests low (scaleY) and at ~20% opacity. The note going out fades slowly while the next one lights quickly,
     so the two overlap and the line reads as one melody. Only transform / opacity / background-color are animated (see .note in the CSS).
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
  const BEAT_MS = 620;                                       // calm tempo (~97 bpm)
  const SWING = 0.14, REST_CHANCE = 0.14;                    // natural feel: uneven timing + occasional rests
  const HOLD_MIN_MS = 150, SWITCH_RATIO = 1.18, GATE = 0.1;  // audio mode: hysteresis so the note does not flicker

  let notes = [], n = 0, active = -1, colorIdx = 0, pos = 0, visible = false, running = false, raf = 0, nextAt = 0, phraseLeft = 0, lastSwitch = 0;
  let playing = false, audio = null, actx = null, analyser = null, bins = null, bands = null;

  /* ---- build the bars (count follows the available width) ---- */
  const build = () => {
    const w = box.clientWidth || 200, count = Math.max(MIN_NOTES, Math.min(MAX_NOTES, Math.round(w / NOTE_PITCH_PX)));
    if (count === n) return;
    n = count; box.textContent = ''; notes = []; active = -1; pos = Math.floor(n / 2); bands = new Float32Array(n);
    for (let i = 0; i < n; i++) { const el = document.createElement('i'); el.className = 'note'; box.appendChild(el); notes.push(el); }
    if (reduce.matches && !playing) light(pos);          // reduced motion: one calm static note
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
    if (visible && !document.hidden && (!reduce.matches || playing)) raf = requestAnimationFrame(frame); else running = false;
  };
  const start = () => { if (running || !visible || document.hidden) return; running = true; nextAt = performance.now() + 200; raf = requestAnimationFrame(frame); };

  /* ---- optional audio file ---- */
  const src = box.dataset.audio;
  const label = () => (window.BK && BK.lang && BK.lang() === 'es') ? { play: 'Reproducir jazz', pause: 'Pausar jazz' } : { play: 'Play jazz', pause: 'Pause jazz' };
  const setBtn = () => { if (!btn) return; btn.setAttribute('aria-pressed', String(playing)); btn.setAttribute('aria-label', playing ? label().pause : label().play); btn.querySelector('use').setAttribute('href', playing ? '#i-pause' : '#i-play'); };
  if (src && btn) {
    const probe = new Audio(); probe.preload = 'metadata';
    probe.addEventListener('loadedmetadata', () => { audio = probe; audio.loop = true; btn.hidden = false; setBtn(); }, { once: true });
    probe.addEventListener('error', () => { btn.hidden = true; }, { once: true });
    probe.addEventListener('ended', () => { playing = false; setBtn(); });
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
      setBtn(); start();
    });
    document.addEventListener('bk:lang', setBtn);
  }

  /* ---- lifecycle ---- */
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: 0.05 }); io.observe(box);
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
