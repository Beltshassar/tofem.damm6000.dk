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

  // ── Mobile: device orientation ───────────────────────────────
  function handleOrientation(e) {
    if (e.beta === null || e.gamma === null) return;
    // beta  = front-to-back tilt (-180..180), gamma = left-to-right (-90..90)
    targetRx = clamp(e.beta  * 0.15, -MAX_TILT, MAX_TILT);
    targetRy = clamp(e.gamma * 0.20, -MAX_TILT, MAX_TILT);
  }

  // iOS 13+ requires permission for DeviceOrientationEvent
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    document.addEventListener('click', function askPermission() {
      DeviceOrientationEvent.requestPermission()
        .then(state => {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(() => {});
      document.removeEventListener('click', askPermission);
    }, { once: true });
  } else if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handleOrientation);
  }

  // ── Start loop ───────────────────────────────────────────────
  tick();
})();
