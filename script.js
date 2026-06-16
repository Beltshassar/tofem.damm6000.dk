(function () {
  const scene = document.getElementById('scene');
  const layers = Array.from(document.querySelectorAll('.layer[data-depth]'));

  const MAX_TILT = 12;   // degrees
  const LERP     = 0.08; // smoothing factor (0 = instant, 1 = frozen)

  let targetRx = 0, targetRy = 0;
  let currentRx = 0, currentRy = 0;
  let rafId;

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function applyLayers() {
    layers.forEach(layer => {
      const depth = parseFloat(layer.dataset.depth) || 0;
      const tz = depth * 60;
      const rx = currentRx * depth;
      const ry = currentRy * depth;
      layer.style.transform = `translateZ(${tz}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
  }

  function tick() {
    currentRx = lerp(currentRx, targetRx, LERP);
    currentRy = lerp(currentRy, targetRy, LERP);
    applyLayers();
    rafId = requestAnimationFrame(tick);
  }

  // ── Desktop: mouse position ──────────────────────────────────
  window.addEventListener('mousemove', (e) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    targetRx = ((e.clientY / h) - 0.5) * -MAX_TILT;
    targetRy = ((e.clientX / w) - 0.5) *  MAX_TILT;
  });

  window.addEventListener('mouseleave', () => {
    targetRx = 0;
    targetRy = 0;
  });

  // ── Mobile: touch drag position ─────────────────────────────
  // touchmove fires only while the finger is moving, so a plain tap
  // on a button never triggers it — button clicks are unaffected.
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    const w = window.innerWidth;
    const h = window.innerHeight;
    targetRx = ((t.clientY / h) - 0.5) * -MAX_TILT;
    targetRy = ((t.clientX / w) - 0.5) *  MAX_TILT;
  }, { passive: true });

  window.addEventListener('touchend',    () => { targetRx = 0; targetRy = 0; });
  window.addEventListener('touchcancel', () => { targetRx = 0; targetRy = 0; });

  // ── Start loop ───────────────────────────────────────────────
  tick();
})();
