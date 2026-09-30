(() => {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (params.has('export')) {
    root.classList.add('export');
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
    return;
  }

  const cover = document.getElementById('cover');
  const openBtn = document.getElementById('open');
  const sound = document.getElementById('sound');
  const music = document.getElementById('music');
  const TARGET = 0.7;
  let ctx, gain;

  root.classList.add('locked');

  function startMusic() {
    // Web Audio obeys the iOS silent switch unless the session is declared as playback.
    if (navigator.audioSession) { try { navigator.audioSession.type = 'playback'; } catch (e) {} }
    const AC = window.AudioContext || window.webkitAudioContext;
    try {
      if (AC && !ctx) {
        ctx = new AC();
        gain = ctx.createGain();
        gain.gain.value = 0;
        ctx.createMediaElementSource(music).connect(gain).connect(ctx.destination);
      }
    } catch (e) { ctx = null; }
    if (ctx) {
      ctx.resume();
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(TARGET, ctx.currentTime + 3);
    } else {
      music.volume = TARGET;
    }
    music.play().catch(() => setSound(false));
  }

  function setSound(on) {
    sound.setAttribute('aria-pressed', String(on));
    sound.setAttribute('aria-label', on ? 'Выключить музыку' : 'Включить музыку');
  }

  sound.addEventListener('click', () => {
    if (music.paused) { startMusic(); setSound(true); }
    else { music.pause(); setSound(false); }
  });

  openBtn.addEventListener('click', () => {
    startMusic();
    sound.hidden = false;
    root.classList.remove('locked');
    root.classList.add('is-open');
    const done = () => {
      cover.classList.add('is-gone');
      document.getElementById('s1-title').focus({ preventScroll: true });
    };
    if (reduce) { done(); return; }
    cover.classList.add('is-leaving');
    setTimeout(done, 1600);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

  const frames = document.querySelectorAll('.story__frame');
  const so = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const step = e.target.dataset.step;
      frames.forEach((f) => f.classList.toggle('is-active', f.dataset.step === step));
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  document.querySelectorAll('.panel').forEach((p) => so.observe(p));

  const reveals = document.querySelectorAll('.reveal');
  const firstScreen = document.querySelectorAll('#slide-1 .reveal');
  openBtn.addEventListener('click', () => {
    if (!reduce) firstScreen.forEach((el, i) => { el.style.transitionDelay = `${700 + i * 90}ms`; });
    reveals.forEach((el) => io.observe(el));
    setTimeout(() => firstScreen.forEach((el) => { el.style.transitionDelay = ''; }), 2600);
  }, { once: true });
})();
