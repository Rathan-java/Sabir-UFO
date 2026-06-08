// Animated starfield + slow parallax drift. Runs on a single canvas behind everything.

export function startStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const layers = [
    { count: 90, speed: 0.04, sizeMin: 0.3, sizeMax: 0.9, alpha: 0.55 },
    { count: 60, speed: 0.10, sizeMin: 0.6, sizeMax: 1.4, alpha: 0.75 },
    { count: 25, speed: 0.20, sizeMin: 1.0, sizeMax: 2.0, alpha: 1.0 },
  ];

  let stars = [];
  let w = 0, h = 0, dpr = window.devicePixelRatio || 1;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    stars = [];
    for (const layer of layers) {
      for (let i = 0; i < layer.count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin),
          a: layer.alpha,
          s: layer.speed,
          tw: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.y += s.s;
      if (s.y > h + 4) { s.y = -4; s.x = Math.random() * w; }
      const twinkle = 0.6 + Math.sin(t * 0.001 + s.tw) * 0.4;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 230, 255, ${s.a * twinkle * 0.85})`;
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(frame);
}
