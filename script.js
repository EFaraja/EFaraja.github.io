/* ═══════════════════════════════════════════
   PORTFOLIO — SCRIPT.JS
   Navbar · Canvas · Counters · Scroll Reveal
   Skill Bars · Contribution Graph · Form
═══════════════════════════════════════════ */

'use strict';

/* ─── NAVBAR ────────────────────────────── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const hamburger= document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const links    = navLinks.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close menu on link click
  links.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');

  function updateActive() {
    const y = window.scrollY + 120;
    sections.forEach(sec => {
      const top    = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      const link   = navLinks.querySelector(`[href="#${sec.id}"]`);
      if (link) link.classList.toggle('active', y >= top && y < bottom);
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();


/* ─── HERO CANVAS ───────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, rafId;
  const PARTICLE_COUNT = 80;
  const MAX_DIST = 140;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = canvas.parentElement.offsetHeight;
    if (!particles) initParticles();
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.4,
      a: Math.random() * 0.6 + 0.2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });

    // Lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${p.a})`;
      ctx.fill();
    });

    rafId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  draw();
})();


/* ─── SCROLL REVEAL ─────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach(el => observer.observe(el));
})();


/* ─── SKILL BARS ────────────────────────── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const w   = bar.getAttribute('data-width') || '0';
          // Small delay for stagger
          setTimeout(() => {
            bar.style.width = w + '%';
          }, 200);
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach(bar => observer.observe(bar));
})();


/* ─── COUNTERS ──────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  function animateCounter(el, target, duration = 1600) {
    const start = performance.now();
    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(c => observer.observe(c));
})();


/* ─── CONTRIBUTION GRAPH ────────────────── */
(function initContribGraph() {
  const grid = document.getElementById('contribGrid');
  if (!grid) return;

  const COLS  = 52;
  const ROWS  = 7;
  const total = COLS * ROWS;

  // Generate pseudo-random "activity" data
  function seeded(n) {
    let x = Math.sin(n + 1) * 10000;
    return x - Math.floor(x);
  }

  for (let i = 0; i < total; i++) {
    const cell = document.createElement('div');
    cell.className = 'contrib-cell';
    const val = seeded(i * 7 + 13);
    if (val > 0.85)       cell.classList.add('l4');
    else if (val > 0.68)  cell.classList.add('l3');
    else if (val > 0.5)   cell.classList.add('l2');
    else if (val > 0.35)  cell.classList.add('l1');
    grid.appendChild(cell);
  }
})();


/* ─── CONTACT FORM ──────────────────────── */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const notice  = document.getElementById('formNotice');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    // Basic validation
    if (!name || !email || !message) {
      showNotice('Please fill in the required fields.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showNotice('Please enter a valid email address.', 'error');
      return;
    }

    // Simulate sending
    submitBtn.disabled = true;
    btnText.textContent = 'Sending…';

    await delay(1800);

    // Reset
    submitBtn.disabled = false;
    btnText.textContent = 'Send Message';
    form.reset();
    showNotice('✓ Message sent! I\'ll be in touch soon.', 'success');

    // Clear notice after 6s
    setTimeout(() => { notice.textContent = ''; notice.className = 'form-notice'; }, 6000);
  });

  function showNotice(msg, type) {
    notice.textContent = msg;
    notice.className   = `form-notice ${type}`;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }
})();


/* ─── FOOTER YEAR ───────────────────────── */
(function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ─── TECH CARD TILT ────────────────────── */
(function initTilt() {
  const cards = document.querySelectorAll('.tech-card, .ai-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(600px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ─── SMOOTH ANCHOR SCROLL ──────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id  = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ─── PROGRESS BADGE HOVER ──────────────── */
(function initBadgeHover() {
  const badges = document.querySelectorAll('.badge-cloud .badge');
  badges.forEach((badge, i) => {
    badge.style.transitionDelay = `${i * 0.02}s`;
  });
})();


/* ─── ARCH NODES ANIMATION ──────────────── */
(function initArchAnimation() {
  const nodes = document.querySelectorAll('.arch-node');

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        nodes.forEach((node, i) => {
          setTimeout(() => {
            node.style.opacity = '1';
            node.style.transform = 'translateY(0)';
          }, i * 100);
        });
        observer.disconnect();
      }
    },
    { threshold: 0.2 }
  );

  nodes.forEach(node => {
    node.style.opacity    = '0';
    node.style.transform  = 'translateY(20px)';
    node.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const archSection = document.getElementById('automation');
  if (archSection) observer.observe(archSection);
})();


/* ─── CURSOR GLOW (desktop only) ────────── */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(0,212,255,0.055) 0%, transparent 70%);
    transition: opacity 0.4s ease;
    opacity: 0;
  `;
  document.body.appendChild(glow);

  let mx = 0, my = 0, glowX = 0, glowY = 0;
  let visible = false;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!visible) {
      visible = true;
      glow.style.opacity = '1';
    }
  });

  document.addEventListener('mouseleave', () => {
    visible = false;
    glow.style.opacity = '0';
  });

  function loop() {
    glowX += (mx - glowX) * 0.1;
    glowY += (my - glowY) * 0.1;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    requestAnimationFrame(loop);
  }

  loop();
})();


/* ─── TYPEWRITER (hero title) ───────────── */
(function initTypewriter() {
  const titles = [
    'Software Developer',
    'Automation Engineer',
    'Industrial Systems Engineer',
    'Python Developer',
  ];

  const el = document.querySelector('.hero-title');
  if (!el) return;

  let ti = 0, ci = 0, deleting = false;
  const SEP = '<span class="title-sep"> · </span>';
  const fixed = ' Industrial Systems Engineer';

  // Only type the first part
  function getPhrase() { return titles[ti % titles.length]; }

  function tick() {
    const phrase = getPhrase();
    if (!deleting) {
      ci++;
      el.innerHTML = phrase.slice(0, ci) + SEP + fixed.trim();
      if (ci >= phrase.length) {
        deleting = true;
        setTimeout(tick, 2400);
        return;
      }
    } else {
      ci--;
      el.innerHTML = phrase.slice(0, ci) + SEP + fixed.trim();
      if (ci === 0) {
        deleting = false;
        ti++;
      }
    }
    setTimeout(tick, deleting ? 50 : 80);
  }

  // Start after a delay
  setTimeout(tick, 1200);
})();
