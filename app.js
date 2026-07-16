/**
 * Daiki Design Inspired Portfolio - Core Animation & Controls Engine
 * Implements interactive rotating spiral galaxy canvas, click explosion shockwaves,
 * loading bar sequences, and scroll triggers.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoaderAnimation();
  initGalaxyConstellation();
  initTestimonialsCarousel();
  initScrollReveal();
  initActiveJumpTracking();
  initLiveClock();
  initMobileMenu();
  initContactForm();
});

/**
 * 1. Fullscreen Loader Progress Bar Animation
 */
function initLoaderAnimation() {
  const bar = document.getElementById('do-loader-bar');
  const loader = document.getElementById('do-loader');
  const brand = document.getElementById('do-brand-label');
  if (!bar || !loader) return;

  // Animate loader track bar
  setTimeout(() => {
    bar.style.width = '100%';
  }, 100);

  // Fade out loader screen and reveal brand label
  setTimeout(() => {
    loader.classList.add('is-hidden');
    if (brand) brand.classList.add('is-shown');
  }, 1600);
}

/**
 * 2. Fullscreen Interactive Galaxy Constellation Simulation
 */
function initGalaxyConstellation() {
  const canvas = document.getElementById('do-starCanvas');
  const bgCanvas = document.getElementById('do-bgStarCanvas');
  const eCanvas = document.getElementById('do-explodeCanvas');
  if (!canvas || !bgCanvas || !eCanvas) return;

  const ctx = canvas.getContext('2d');
  const bgCtx = bgCanvas.getContext('2d');
  const eCtx = eCanvas.getContext('2d');

  let W, H, CX, CY;
  let particles = [];
  let bgStars = [];
  let globalAngle = 0;
  let galaxyT = 0;
  let lastGT = 0;
  let lastBgT = 0;
  let bgAlpha = 1.0;

  let exploding = false;
  let reforming = false;
  let explodeTimer = 0;

  // Configuration Constants
  const FADE_DUR = 1.4;
  const BG_COUNT = 240;
  const GALAXY_COUNT = 5500; // Optimized count for maximum performance
  const ARM_COUNT = 3;
  const EXPLODE_DUR = 2.2;
  const REFORM_DUR = 10.0;

  function resize() {
    W = canvas.width = bgCanvas.width = window.innerWidth;
    H = canvas.height = bgCanvas.height = window.innerHeight;
    CX = W * 0.5;
    CY = H * 0.5;
    eCanvas.width = window.innerWidth;
    eCanvas.height = window.innerHeight;

    buildParticles();
    buildBgStars();
  }
  window.addEventListener('resize', resize);

  // Cache Sprite Renderer for glowing stars (Prevents runtime createRadialGradient bottlenecks)
  const glowSpriteCache = {};
  const GLOW_SPRITE_R = 32;

  function getGlowSprite(color) {
    const key = `${color.r},${color.g},${color.b}`;
    let sprite = glowSpriteCache[key];
    if (sprite) return sprite;

    const s = document.createElement('canvas');
    s.width = s.height = GLOW_SPRITE_R * 2;
    const sctx = s.getContext('2d');

    const g = sctx.createRadialGradient(
      GLOW_SPRITE_R, GLOW_SPRITE_R, 0,
      GLOW_SPRITE_R, GLOW_SPRITE_R, GLOW_SPRITE_R
    );
    g.addColorStop(0, `rgba(${color.r},${color.g},${color.b},1)`);
    g.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);

    sctx.fillStyle = g;
    sctx.fillRect(0, 0, s.width, s.height);
    glowSpriteCache[key] = s;
    return s;
  }

  function getStarColor(rVal, posR) {
    const r = rVal !== undefined ? rVal : Math.random();
    if (posR !== undefined && posR < 0.08) return { r: 255, g: 220, b: 150 }; // Warm Core
    if (posR !== undefined && posR < 0.22) return { r: 245, g: 245, b: 230 };
    if (r < 0.15) return { r: 150, g: 180, b: 255 }; // Starlight blue
    if (r < 0.30) return { r: 226, g: 184, b: 101 }; // Accent Champagne Gold
    return { r: 248, g: 248, b: 242 };
  }

  // Background Twinklers
  class BgStar {
    constructor() {
      this.place();
    }

    place() {
      this.rx = Math.random();
      this.ry = Math.random();
      this.r = 0.15 + Math.pow(Math.random(), 2.2) * 1.1;
      this.color = getStarColor(Math.random());
      this.peak = 0.35 + Math.random() * 0.65;
      this.holdDur = 0.4 + Math.random() * 2.5;
      this.restDur = 0.5 + Math.random() * 4.0;
      this.timer = Math.random() * (FADE_DUR * 2 + this.holdDur + this.restDur);
      this.state = 'rest';
      this.bright = 0;
    }

    update(dt) {
      this.timer += dt;
      if (this.state === 'rest') {
        this.bright = 0;
        if (this.timer >= this.restDur) { this.timer = 0; this.state = 'in'; }
      } else if (this.state === 'in') {
        this.bright = Math.min(1, this.timer / FADE_DUR) * this.peak;
        if (this.timer >= FADE_DUR) { this.timer = 0; this.state = 'hold'; }
      } else if (this.state === 'hold') {
        this.bright = this.peak;
        if (this.timer >= this.holdDur) { this.timer = 0; this.state = 'out'; }
      } else {
        this.bright = Math.max(0, 1 - this.timer / FADE_DUR) * this.peak;
        if (this.timer >= FADE_DUR) {
          this.timer = 0;
          this.state = 'rest';
          this.restDur = 0.5 + Math.random() * 4.0;
        }
      }
    }
  }

  // Galaxy Spiral Star Particle
  class Particle {
    constructor() {
      this.init();
    }

    init() {
      const rnd = Math.random();
      const zone = rnd < 0.12 ? 'bulge' : rnd < 0.88 ? 'arm' : 'halo';
      let r, angle, scatter = 0;

      if (zone === 'bulge') {
        r = Math.pow(Math.random(), 2.5) * 0.12;
        angle = Math.random() * Math.PI * 2;
      } else if (zone === 'arm') {
        const arm = Math.floor(Math.random() * ARM_COUNT);
        const t = Math.pow(Math.random(), 0.7);
        r = 0.06 + t * 0.40;
        // Logarithmic spiral geometry equation
        angle = (arm / ARM_COUNT) * Math.PI * 2 + Math.log(r / 0.06) / Math.tan(0.26);
        scatter = (Math.random() - 0.5) * (0.65 + r * 1.8);
        angle += scatter;
      } else {
        r = 0.28 + Math.random() * 0.12;
        angle = Math.random() * Math.PI * 2;
      }

      const dist = r * Math.min(W, H) * 0.46;
      this.angle = angle;
      this.r = r;
      this.initialAngle = angle;
      this.x = CX + Math.cos(angle) * dist;
      this.y = CY + Math.sin(angle) * dist * 0.38;
      this.orbitSpeed = (0.003 + (Math.random() - 0.5) * 0.0003) * (1 - r * 0.6);

      if (zone === 'bulge') {
        this.size = 0.96 + Math.random() * 2.2;
      } else if (zone === 'arm') {
        const edgeness = Math.abs(scatter) / (0.18 + r * 0.9) * 2;
        this.size = Math.max(0.24, (1.44 - edgeness * 0.48) * (0.42 + Math.pow(1 - r, 1.5) * 1.68));
      } else {
        this.size = 0.24 + Math.random() * 0.72;
      }

      this.baseAlpha = zone === 'bulge' ? 0.36 + Math.random() * 0.25
                     : zone === 'arm'   ? 0.38 + Math.random() * 0.62
                     :                    0.18 + Math.random() * 0.33;
      this.color = getStarColor(Math.random(), r);
      this.driftAng = Math.random() * Math.PI * 2;
      this.driftSpd = zone === 'halo' ? 0.05 + Math.random() * 0.12 : 0.12 + Math.random() * 0.22;
      this.driftAmp = zone === 'halo' ? 0.1  + Math.random() * 0.3  : 0.2  + Math.random() * 0.6;
      this.twOff = Math.random() * Math.PI * 2;
      this.twSpd = zone === 'bulge' ? 0.5 + Math.random() * 1.2 : 0.2 + Math.random() * 0.7;
      this.vx = 0;
      this.vy = 0;
    }
  }

  function buildParticles() {
    particles = [];
    for (let i = 0; i < GALAXY_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function buildBgStars() {
    bgStars = [];
    for (let i = 0; i < BG_COUNT; i++) {
      bgStars.push(new BgStar());
    }
  }

  // Generate click sparklers
  function spawnSparkle(wx, wy) {
    for (let i = 0; i < 24; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 75;
      const size = 1.0 + Math.random() * 2.5;
      const life = 500 + Math.random() * 400;
      const el = document.createElement('div');
      const c = getStarColor(Math.random());
      el.className = 'do-sparkle-dot';
      el.style.cssText = `
        left: ${wx}px;
        top: ${wy}px;
        width: ${size}px;
        height: ${size}px;
        background: rgba(${c.r}, ${c.g}, ${c.b}, 1);
        opacity: 1;
      `;
      document.body.appendChild(el);

      const ddx = Math.cos(ang) * dist;
      const ddy = Math.sin(ang) * dist;
      const st = performance.now();

      (function (e, dx, dy, dur, t0) {
        function step(now) {
          const p = Math.min((now - t0) / dur, 1);
          const ep = 1 - Math.pow(1 - p, 3);
          e.style.left = `${wx + dx * ep}px`;
          e.style.top = `${wy + dy * ep}px`;
          e.style.opacity = `${1 - Math.pow(p, 1.5)}`;
          if (p < 1) requestAnimationFrame(step);
          else if (e.parentNode) e.parentNode.removeChild(e);
        }
        requestAnimationFrame(step);
      })(el, ddx, ddy, life, st);
    }
  }

  function triggerExplosion(ex, ey) {
    exploding = true;
    reforming = false;
    explodeTimer = 0;

    particles.forEach(p => {
      const dx = p.x - ex;
      const dy = p.y - ey;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const ang = Math.atan2(dy, dx);
      const force = (200 + Math.random() * 280) * (1 + 300 / (d + 50));
      p.vx = Math.cos(ang) * force * (0.6 + Math.random() * 0.8);
      p.vy = Math.sin(ang) * force * (0.6 + Math.random() * 0.8);
    });
  }

  // Animation frame loops
  function bgFrame(ts) {
    const dt = Math.min((ts - lastBgT) / 1000, 0.05);
    lastBgT = ts;

    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    bgCtx.globalAlpha = bgAlpha;

    bgStars.forEach(s => {
      s.update(dt);
      if (s.bright > 0) {
        bgCtx.fillStyle = `rgba(${s.color.r},${s.color.g},${s.color.b},${s.bright})`;
        bgCtx.beginPath();
        bgCtx.arc(s.rx * bgCanvas.width, s.ry * bgCanvas.height, s.r, 0, Math.PI * 2);
        bgCtx.fill();
      }
    });

    bgCtx.globalAlpha = 1;
    requestAnimationFrame(bgFrame);
  }

  function galaxyFrame(ts) {
    const dt = Math.min((ts - lastGT) / 1000, 0.05);
    lastGT = ts;
    galaxyT += dt;

    if (exploding) {
      explodeTimer += dt;
      if (explodeTimer >= EXPLODE_DUR) {
        exploding = false;
        reforming = true;
        explodeTimer = 0;
      }
    }
    if (reforming) {
      explodeTimer += dt;
      if (explodeTimer >= REFORM_DUR) {
        reforming = false;
        explodeTimer = 0;
        particles.forEach(p => { p.angle = p.initialAngle; });
      }
    }

    globalAngle += dt * 0.016;
    ctx.clearRect(0, 0, W, H);

    // Deep space core background gradient
    const c3 = ctx.createRadialGradient(CX, CY, 0, CX, CY, H * 0.32);
    c3.addColorStop(0, 'rgba(80,70,50,0.02)');
    c3.addColorStop(0.6, 'rgba(40,50,80,0.01)');
    c3.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = c3;
    ctx.fillRect(0, 0, W, H);

    eCtx.clearRect(0, 0, eCanvas.width, eCanvas.height);

    const minWH = Math.min(W, H);

    particles.forEach(p => {
      if (exploding) {
        p.vx *= 0.91;
        p.vy *= 0.91;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      } else if (reforming) {
        const prog = explodeTimer / REFORM_DUR;
        // Reform physics calculations
        const bx = CX + Math.cos(p.initialAngle + globalAngle) * p.r * minWH * 0.88;
        const by = CY + Math.sin(p.initialAngle + globalAngle) * p.r * minWH * 0.88 * 0.42;
        const tx = bx + Math.cos(galaxyT * p.driftSpd + p.driftAng) * p.driftAmp;
        const ty = by + Math.sin(galaxyT * p.driftSpd * 0.7 + p.driftAng) * p.driftAmp * 0.5;
        const att = (1 - Math.pow(1 - prog, 2.5)) * 8.0 * dt;
        
        p.vx += (tx - p.x) * att;
        p.vy += (ty - p.y) * att;
        const damp = 0.40 + Math.min(p.r, 0.5) * 0.30;
        p.vx *= damp;
        p.vy *= damp;
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
      } else {
        p.angle += p.orbitSpeed * dt;
        const bx = CX + Math.cos(p.angle + globalAngle) * p.r * minWH * 0.88;
        const by = CY + Math.sin(p.angle + globalAngle) * p.r * minWH * 0.88 * 0.42;
        p.vx *= 0.82;
        p.vy *= 0.82;
        p.x = bx + Math.cos(galaxyT * p.driftSpd + p.driftAng) * p.driftAmp + p.vx;
        p.y = by + Math.sin(galaxyT * p.driftSpd * 0.7 + p.driftAng) * p.driftAmp * 0.5 + p.vy;
      }

      const tw = 0.5 + 0.5 * Math.sin(galaxyT * p.twSpd + p.twOff);
      let a = p.baseAlpha * tw;

      if (reforming) {
        const bDelay = 0.1 / REFORM_DUR;
        const bProg = explodeTimer / REFORM_DUR;
        a = Math.min(1, a * (1 + Math.max(0, (bDelay - bProg) / bDelay) * 1.68));
      }

      const isExploding = exploding || reforming;
      const drawCtx = isExploding ? eCtx : ctx;
      const drawX = p.x;
      const drawY = p.y;

      if (p.size > 0.6) {
        const gr3 = p.size * (p.r < 0.04 ? 1.5 : 3.0) * (reforming ? 0.9 : 1);
        const sprite = getGlowSprite(p.color);
        drawCtx.globalAlpha = a * 0.18;
        drawCtx.drawImage(sprite, drawX - gr3, drawY - gr3, gr3 * 2, gr3 * 2);
        drawCtx.globalAlpha = 1;
      }

      // Draw light spiky crosshairs for core bright stars
      if (p.size > 1.25 && a > 0.6) {
        const spkLen = p.size * 5.0;
        drawCtx.lineWidth = 0.35;
        drawCtx.strokeStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${a * 0.16})`;
        drawCtx.beginPath(); drawCtx.moveTo(drawX - spkLen, drawY); drawCtx.lineTo(drawX + spkLen, drawY); drawCtx.stroke();
        drawCtx.beginPath(); drawCtx.moveTo(drawX, drawY - spkLen); drawCtx.lineTo(drawX, drawY + spkLen); drawCtx.stroke();
      }

      drawCtx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${a})`;
      drawCtx.beginPath();
      drawCtx.arc(drawX, drawY, p.size * 0.8, 0, Math.PI * 2);
      drawCtx.fill();
    });

    requestAnimationFrame(galaxyFrame);
  }

  // Event listener triggers explosion
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    spawnSparkle(e.clientX, e.clientY);
    triggerExplosion(e.clientX - rect.left, e.clientY - rect.top);
  });

  // Track page scroll to fade out background stars in lower sections
  const worksEl = document.getElementById('work');
  window.addEventListener('scroll', () => {
    if (!worksEl) return;
    const t = (window.innerHeight - worksEl.getBoundingClientRect().top) / (window.innerHeight * 0.45);
    bgAlpha = Math.max(0, Math.min(1, 1 - t));
  }, { passive: true });

  // Hide text widget toggle
  const textToggle = document.getElementById('do-text-toggle');
  const heroContent = document.querySelector('.do-hero-content');
  if (textToggle && heroContent) {
    textToggle.addEventListener('click', () => {
      const isHidden = heroContent.classList.toggle('is-text-hidden');
      textToggle.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
      textToggle.setAttribute('aria-label', isHidden ? 'Show hero text' : 'Hide hero text');
    });
  }

  resize();
  requestAnimationFrame(galaxyFrame);
  requestAnimationFrame(bgFrame);
}

/**
 * 3. Praise / Testimonial quote slideshow carousel
 */
function initTestimonialsCarousel() {
  const quoteEl = document.getElementById('testimonial-quote');
  const authorEl = document.getElementById('testimonial-author');
  const dots = document.querySelectorAll('.testimonial-dot');
  const slideEl = document.getElementById('testimonial-slide');

  if (!quoteEl || !authorEl || dots.length === 0) return;

  const testimonials = [
    {
      quote: '"Significant contributor in design delivery and business growth. True team player and a leader in collaborative environments."',
      author: '— Pradeep Joseph, Tech Director'
    },
    {
      quote: '"Visionary thinker in UX and Product Design. Dedicated, precise, and technically brilliant across multiple roles."',
      author: '— Sarathy PB, Design System Architect'
    },
    {
      quote: '"Expert across design, accessibility, and systems, consistently uplifting teams and innovation."',
      author: '— Tina Nixon, Project Orchestration Lead'
    }
  ];

  let currentIndex = 0;
  let autoplayTimer;

  function showSlide(index) {
    if (index === currentIndex) return;

    if (slideEl) slideEl.style.opacity = '0';

    setTimeout(() => {
      currentIndex = index;
      quoteEl.textContent = testimonials[currentIndex].quote;
      authorEl.textContent = testimonials[currentIndex].author;

      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.add('bg-accent', 'w-6');
          dot.classList.remove('bg-line', 'w-2');
        } else {
          dot.classList.remove('bg-accent', 'w-6');
          dot.classList.add('bg-line', 'w-2');
        }
      });

      if (slideEl) slideEl.style.opacity = '1';
    }, 250);
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      clearInterval(autoplayTimer);
      showSlide(idx);
      startAutoplay();
    });
  });

  function startAutoplay() {
    autoplayTimer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % testimonials.length;
      showSlide(nextIndex);
    }, 6000);
  }

  startAutoplay();
}

/**
 * 4. Intersection Observer for Scroll Reveal animations
 */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (elements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/**
 * 5. Active side jump-links indicator tracking
 */
function initActiveJumpTracking() {
  const sections = document.querySelectorAll('section');
  const dots = document.querySelectorAll('.nav-dot-link');

  if (sections.length === 0 || dots.length === 0) return;

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollPos = window.scrollY + window.innerHeight / 3;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    dots.forEach(link => {
      const href = link.getAttribute('href');
      const marker = link.querySelector('.side-marker-dot');
      if (!marker) return;

      marker.classList.remove('active');
      if (href === `#${currentSectionId}` || (currentSectionId === 'do-hero' && href === '#work')) {
        // Fallback for top hero boundary
      } else if (href === `#${currentSectionId}`) {
        marker.classList.add('active');
      }
    });
  });
}

/**
 * 6. Portfolio category filter (Optional)
 */
function initPortfolioFilters() {
  // Retained structure in index.html, not strictly required as layout is clean list
}

/**
 * 7. Timezones Clock widget
 */
function initLiveClock() {
  const timeEl = document.getElementById('live-time');
  if (!timeEl) return;

  function updateClock() {
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    timeEl.textContent = formatter.format(new Date());
  }

  setInterval(updateClock, 1000);
  updateClock();
}

/**
 * 8. Mobile navigation menu
 */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const line1 = document.getElementById('line1');
  const line3 = document.getElementById('line3');
  // Fixed navigation, no separate dropdown needed as page flow is single-scroll
}

/**
 * 9. Contact Form transmission indicators
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const logEl = document.getElementById('form-status-log');

  if (!form || !logEl) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    logEl.textContent = '[ STATUS: TRANSMITTING_MESSAGE... ]';
    logEl.classList.remove('text-red-500', 'text-retroGreen');
    logEl.classList.add('text-accent');

    setTimeout(() => {
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;

      if (name && email) {
        logEl.textContent = '[ STATUS: PACKET_TRANSMITTED_SUCCESSFULLY ]';
        logEl.classList.remove('text-accent');
        logEl.classList.add('text-retroGreen');
        form.reset();
      } else {
        logEl.textContent = '[ STATUS: ERROR_PACKET_DROPPED_VERIFY_FIELDS ]';
        logEl.classList.remove('text-accent');
        logEl.classList.add('text-red-500');
      }
    }, 1500);
  });
}
