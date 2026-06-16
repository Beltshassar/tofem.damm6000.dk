(function () {
  const scene  = document.getElementById('scene');
  const layers = Array.from(document.querySelectorAll('.layer[data-depth]'));

  const MOUSE_MAX = 12;   // subtle desktop tilt
  const TOUCH_MAX = 35;   // amplified mobile tilt
  const LERP      = 0.08;

  // Detect primary pointer type once at load
  const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;

  let targetRx = 0, targetRy = 0;
  let currentRx = 0, currentRy = 0;
  let introComplete = false;
  let mouseRx = 0, mouseRy = 0; // live cursor target, used as intro endpoint on desktop

  function lerp(a, b, t) { return a + (b - a) * t; }

  function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  function applyLayers() {
    layers.forEach(layer => {
      const d = parseFloat(layer.dataset.depth) || 0;
      layer.style.transform =
        `translateZ(${d * 90}px) rotateX(${currentRx * d}deg) rotateY(${currentRy * d}deg)`;
    });
  }

  function tick() {
    currentRx = lerp(currentRx, targetRx, LERP);
    currentRy = lerp(currentRy, targetRy, LERP);
    applyLayers();
    requestAnimationFrame(tick);
  }

  // ── Intro sweep ───────────────────────────────────────────────
  // Desktop: starts top-left, ends wherever the cursor currently is
  //   → no jump at handoff because the endpoint IS the cursor target.
  //   If the mouse hasn't moved yet, mouseRx/mouseRy are 0 (center) — clean rest.
  // Mobile: predefined arc scaled to touch range, holds at mid-right.
  function runIntro() {
    const startRx = (IS_TOUCH ? TOUCH_MAX : MOUSE_MAX) *  0.5;
    const startRy = (IS_TOUCH ? TOUCH_MAX : MOUSE_MAX) * -0.6;
    const totalMs = 1600;
    const start   = performance.now();

    targetRx = startRx;
    targetRy = startRy;

    function step(now) {
      const t   = Math.min((now - start) / totalMs, 1);
      const e   = easeInOut(t);
      // Desktop endpoint: live cursor (updates as mouse moves during intro)
      // Mobile endpoint:  fixed mid-right position
      const endRx = IS_TOUCH ? 0                : mouseRx;
      const endRy = IS_TOUCH ? TOUCH_MAX * 0.18 : mouseRy;
      targetRx = lerp(startRx, endRx, e);
      targetRy = lerp(startRy, endRy, e);
      if (t < 1) requestAnimationFrame(step);
      else introComplete = true;
    }

    requestAnimationFrame(step);
  }

  // ── Desktop: mouse ──────────────────────────────────────────
  // Always update mouseRx/mouseRy so the intro endpoint tracks the cursor.
  // Only write to targetRx/targetRy once intro is done.
  window.addEventListener('mousemove', (e) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    mouseRx = ((e.clientY / h) - 0.5) * -MOUSE_MAX;
    mouseRy = ((e.clientX / w) - 0.5) *  MOUSE_MAX;
    if (introComplete) { targetRx = mouseRx; targetRy = mouseRy; }
  });

  window.addEventListener('mouseleave', () => {
    mouseRx = 0; mouseRy = 0;
    if (introComplete) { targetRx = 0; targetRy = 0; }
  });

  // ── Mobile: touch ────────────────────────────────────────────
  scene.addEventListener('touchmove', (e) => {
    e.preventDefault();
    introComplete = true; // first drag cancels intro immediately
    const t = e.touches[0];
    const w = window.innerWidth;
    const h = window.innerHeight;
    targetRx = ((t.clientY / h) - 0.5) * -TOUCH_MAX;
    targetRy = ((t.clientX / w) - 0.5) *  TOUCH_MAX;
  }, { passive: false });

  scene.addEventListener('touchend',    () => { targetRx = 0; targetRy = 0; });
  scene.addEventListener('touchcancel', () => { targetRx = 0; targetRy = 0; });

  tick();
  runIntro();
})();
