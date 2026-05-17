/* Lightweight twinkling starfield with parallax shooting stars.
   frame() is called by the main loop — no internal RAF. */
(function () {
  const cv = document.getElementById('stars');
  const ctx = cv.getContext('2d');

  let W = 0, H = 0, dpr = 1;
  const stars = [];
  const shooters = [];

  // cached nebula gradients — rebuilt only on resize, not every frame
  let nebulaA = null, nebulaB = null;

  function buildGradients() {
    nebulaA = ctx.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, Math.max(W, H) * 0.6);
    nebulaA.addColorStop(0, 'rgba(40, 30, 80, 0.18)');
    nebulaA.addColorStop(1, 'rgba(0,0,0,0)');
    nebulaB = ctx.createRadialGradient(W * 0.2, H * 0.85, 0, W * 0.2, H * 0.85, Math.max(W, H) * 0.5);
    nebulaB.addColorStop(0, 'rgba(80, 50, 20, 0.12)');
    nebulaB.addColorStop(1, 'rgba(0,0,0,0)');
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width  = W * dpr;
    cv.height = H * dpr;
    cv.style.width  = W + 'px';
    cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
    buildGradients();
  }

  function buildStars() {
    stars.length = 0;
    const count = Math.floor((W * H) / 4200);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.2,
        // twinkle phase + speed
        p: Math.random() * Math.PI * 2,
        s: 0.4 + Math.random() * 1.6,
        // depth tint
        h: Math.random() < 0.08 ? 'gold'
          : Math.random() < 0.2 ? 'cyan'
          : 'white',
      });
    }
  }

  function maybeSpawnShooter() {
    if (Math.random() < 0.004 && shooters.length < 2) {
      const fromLeft = Math.random() < 0.5;
      shooters.push({
        x: fromLeft ? -50 : W + 50,
        y: Math.random() * H * 0.6,
        vx: (fromLeft ? 1 : -1) * (6 + Math.random() * 4),
        vy: 1.5 + Math.random() * 1.5,
        life: 0,
        max: 60 + Math.random() * 40,
      });
    }
  }

  let t = 0;
  function frame() {
    t += 0.016;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = nebulaA;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = nebulaB;
    ctx.fillRect(0, 0, W, H);

    // stars
    for (const s of stars) {
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.s + s.p));
      let col;
      if (s.h === 'gold')      col = `rgba(255, 216, 107, ${a})`;
      else if (s.h === 'cyan') col = `rgba(140, 220, 255, ${a})`;
      else                     col = `rgba(255, 255, 255, ${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      // small bright stars get a cross sparkle
      if (s.r > 1.0 && a > 0.85) {
        ctx.strokeStyle = col;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(s.x - s.r * 3, s.y); ctx.lineTo(s.x + s.r * 3, s.y);
        ctx.moveTo(s.x, s.y - s.r * 3); ctx.lineTo(s.x, s.y + s.r * 3);
        ctx.stroke();
      }
    }

    // shooting stars
    maybeSpawnShooter();
    for (let i = shooters.length - 1; i >= 0; i--) {
      const sh = shooters[i];
      sh.x += sh.vx;
      sh.y += sh.vy;
      sh.life++;
      const tail = 60;
      const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * tail / 6, sh.y - sh.vy * tail / 6);
      grad.addColorStop(0, 'rgba(255, 233, 168, 1)');
      grad.addColorStop(1, 'rgba(255, 233, 168, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(sh.x - sh.vx * tail / 6, sh.y - sh.vy * tail / 6);
      ctx.stroke();
      if (sh.life > sh.max || sh.x < -100 || sh.x > W + 100 || sh.y > H + 100) {
        shooters.splice(i, 1);
      }
    }
  }

  window.addEventListener('resize', resize);

  resize();
  window.__starfield = { frame };
})();
