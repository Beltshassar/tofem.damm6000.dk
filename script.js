(function () {
  const scene = document.getElementById('scene');
  const layers = Array.from(document.querySelectorAll('.layer[data-depth]'));

  const MAX_TILT       = 22;   // degrees — shared by mouse and touch
  const TOUCH_MULTIPLY = 1.6;  // extra amplification for touch (smaller range of motion)
  const LERP           = 0.08; // smoothing factor

  let targetRx = 0, targetRy = 0;
  let currentRx = 0, currentRy = 0;
  let introComplete = false;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function applyLayers() {
    layers.forEach(layer => {
      const depth = parseFloat(layer.dataset.depth) || 0;
      const tz = depth * 90;
      const rx = currentRx * depth;
      const ry = currentRy * depth;
      layer.style.transform = `translateZ(${tz}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
  }

  function tick() {
    currentRx = lerp(currentRx, targetRx, LERP);
    currentRy = lerp(currentRy, targetRy, LERP);
    applyLayers();
    requestAnimationFrame(tick);
  }

  // ── Intro sweep: top-left → mid-right → rest ─────────────────
  function runIntro() {
    const startRx =  MAX_TILT * 0.55;
    const startRy = -MAX_TILT * 0.65;
    const peakRx  =  0;
    const peakRy  =  MAX_TILT * 0.25;
    const totalMs = 1600;
    const restMs  =  400; // hold at peak before handing off
    const start   = performance.now();

    targetRx = startRx;
    targetRy = startRy;

    function step(now) {
      const elapsed = now - start;
      const t = Math.min(elapsed / (totalMs - restMs), 1);
      const e = easeInOut(t);
      targetRx = startRx + (peakRx - startRx) * e;
      targetRy = startRy + (peakRy - startRy) * e;

      if (elapsed < totalMs) {
        requestAnimationFrame(step);
      } else {
        introComplete = true;
      }
    }

    requestAnimationFrame(step);
  }

  // ── Desktop: mouse ──────────────────────────────────────────
  window.addEventListener('mousemove', (e) => {
    if (!introComplete) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    targetRx = ((e.clientY / h) - 0.5) * -MAX_TILT;
    targetRy = ((e.clientX / w) - 0.5) *  MAX_TILT;
  });

  window.addEventListener('mouseleave', () => {
    if (!introComplete) return;
    targetRx = 0;
    targetRy = 0;
  });

  // ── Mobile: touch ────────────────────────────────────────────
  scene.addEventListener('touchmove', (e) => {
    e.preventDefault();
    introComplete = true; // any touch overrides intro immediately
    const t = e.touches[0];
    const w = window.innerWidth;
    const h = window.innerHeight;
    targetRx = ((t.clientY / h) - 0.5) * -(MAX_TILT * TOUCH_MULTIPLY);
    targetRy = ((t.clientX / w) - 0.5) *  (MAX_TILT * TOUCH_MULTIPLY);
  }, { passive: false });

  scene.addEventListener('touchend',    () => { targetRx = 0; targetRy = 0; });
  scene.addEventListener('touchcancel', () => { targetRx = 0; targetRy = 0; });

  // ── Start ────────────────────────────────────────────────────
  tick();
  runIntro();
})();
