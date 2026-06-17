/* ═══════════════════════════════════════════
   PROJECT PAGE — script.js
   Navbar · Canvas · Counters · Reveal
═══════════════════════════════════════════ */
'use strict';

/* ── NAVBAR ─────────────────────────────── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
})();

/* ── HERO CANVAS — particle network ─────── */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts;
  const N = 60, MAX = 130;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    if (!pts) init();
  }

  function init() {
    pts = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.4,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
    });
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < MAX) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${(1 - d/MAX) * 0.14})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,212,255,0.45)';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  draw();
})();

/* ── SCROLL REVEAL ──────────────────────── */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ── COUNTERS ───────────────────────────── */
(function () {
  const els = document.querySelectorAll('[data-target]');
  if (!els.length) return;

  function run(el, target) {
    const start = performance.now();
    const dur = 1400;
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ease * target);
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        run(e.target, +e.target.dataset.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
})();

/* ── SMOOTH SCROLL ──────────────────────── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const t = document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
    });
  });
})();

/* ── FOOTER YEAR ────────────────────────── */
(function () {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ── LIVE KPI TICKER ────────────────────── */
(function () {
  const kpi = document.getElementById('kpiBott');
  if (!kpi) return;
  let val = 147;
  setInterval(() => {
    if (Math.random() > 0.6) {
      val += Math.floor(Math.random() * 3) + 1;
      kpi.textContent = val;
      // Also update pipeline counter
      const pstatNums = document.querySelectorAll('.pstat-n[data-target]');
      pstatNums.forEach(el => {
        if (el.dataset.target === '147') {
          el.dataset.target = val;
          el.textContent = val;
        }
      });
    }
  }, 3200);
})();

/* ── EQUIPMENT HEALTH ANIMATION ─────────── */
(function () {
  const fills = document.querySelectorAll('.eh-fill');
  if (!fills.length) return;
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      fills.forEach(f => {
        const w = f.style.getPropertyValue('--w');
        f.style.setProperty('--w', '0%');
        setTimeout(() => f.style.setProperty('--w', w), 200);
      });
      io.disconnect();
    }
  }, { threshold: 0.2 });
  if (fills[0].closest('section')) io.observe(fills[0].closest('section'));
})();

/* ── CURSOR GLOW (desktop) ──────────────── */
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const g = document.createElement('div');
  Object.assign(g.style, {
    position: 'fixed', width: '260px', height: '260px',
    borderRadius: '50%', pointerEvents: 'none', zIndex: '9998',
    transform: 'translate(-50%,-50%)',
    background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)',
    opacity: '0', transition: 'opacity 0.4s',
  });
  document.body.appendChild(g);
  let mx = 0, my = 0, gx = 0, gy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; g.style.opacity = '1'; });
  document.addEventListener('mouseleave', () => { g.style.opacity = '0'; });
  (function loop() { gx += (mx - gx) * 0.1; gy += (my - gy) * 0.1; g.style.left = gx + 'px'; g.style.top = gy + 'px'; requestAnimationFrame(loop); })();
})();