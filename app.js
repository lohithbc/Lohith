/**
 * Surendar Selvaraj Inspired Portfolio - Core Behaviors
 * Manages warping grid canvas backgrounds, active jump-links observers, testimonials carousel, and form validations.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCanvasBackground();
  initTestimonialsCarousel();
  initScrollReveal();
  initActiveJumpTracking();
  initPortfolioFilters();
  initLiveClock();
  initMobileMenu();
  initContactForm();
});

/**
 * 1. Interactive Warping Grid Mesh & Connecting Nodes Background
 */
function initCanvasBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  const particleCount = 45;
  const connectionDistance = 110;
  const mouse = { x: null, y: null, radius: 180 };

  // Grid mesh variables
  const gridSpacing = 65; 
  let gridPoints = []; 

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializeGridPoints();
  }
  window.addEventListener('resize', resizeCanvas);

  function initializeGridPoints() {
    gridPoints = [];
    const cols = Math.ceil(canvas.width / gridSpacing) + 2;
    const rows = Math.ceil(canvas.height / gridSpacing) + 2;

    for (let c = 0; c < cols; c++) {
      gridPoints[c] = [];
      for (let r = 0; r < rows; r++) {
        gridPoints[c][r] = {
          baseX: (c - 1) * gridSpacing,
          baseY: (r - 1) * gridSpacing,
          x: (c - 1) * gridSpacing,
          y: (r - 1) * gridSpacing
        };
      }
    }
  }

  // Mouse tracker
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Floating Particle Node Blueprint
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.radius = Math.random() * 1.5 + 0.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;

      // Mouse interactive push
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 0.4;
          this.y += Math.sin(angle) * force * 0.4;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(37, 99, 235, 0.22)'; // Subtle blue nodes
      ctx.fill();
    }
  }

  // Generate nodes
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  resizeCanvas();

  // Draw Warped grid net lines
  function drawWarpedGrid() {
    const cols = gridPoints.length;
    if (cols === 0) return;
    const rows = gridPoints[0].length;

    // 1. Calculate displacement
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const p = gridPoints[c][r];
        p.x = p.baseX;
        p.y = p.baseY;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.baseX - mouse.x;
          const dy = p.baseY - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            // Bends grid vertices away from mouse
            p.x += Math.cos(angle) * force * 15;
            p.y += Math.sin(angle) * force * 15;
          }
        }
      }
    }

    // 2. Draw lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)'; // Extremely faint grid lines
    ctx.lineWidth = 0.8;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (c < cols - 1) {
          ctx.beginPath();
          ctx.moveTo(gridPoints[c][r].x, gridPoints[c][r].y);
          ctx.lineTo(gridPoints[c + 1][r].x, gridPoints[c + 1][r].y);
          ctx.stroke();
        }
        if (r < rows - 1) {
          ctx.beginPath();
          ctx.moveTo(gridPoints[c][r].x, gridPoints[c][r].y);
          ctx.lineTo(gridPoints[c][r + 1].x, gridPoints[c][r + 1].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawWarpedGrid();

    // Layer 2: Connecting Particle Plexus
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < connectionDistance) {
          const opacity = (1 - dist / connectionDistance) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(37, 99, 235, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/**
 * 2. Praise / Testimonial Carousel
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

    // Trigger subtle fade-out transition
    if (slideEl) slideEl.style.opacity = '0';

    setTimeout(() => {
      currentIndex = index;
      quoteEl.textContent = testimonials[currentIndex].quote;
      authorEl.textContent = testimonials[currentIndex].author;

      // Update dots active/inactive classes
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.add('bg-accent', 'w-6');
          dot.classList.remove('bg-line', 'w-2');
        } else {
          dot.classList.remove('bg-accent', 'w-6');
          dot.classList.add('bg-line', 'w-2');
        }
      });

      // Fade back in
      if (slideEl) slideEl.style.opacity = '1';
    }, 250);
  }

  // Add click events to indicators
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
    }, 6000); // 6 seconds slide interval
  }

  startAutoplay();
}

/**
 * 3. Scroll Reveal intersection observer
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
 * 4. Active Right Navigation Dot Tracking
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
      if (href === `#${currentSectionId}`) {
        marker.classList.add('active');
      }
    });
  });
}

/**
 * 5. Portfolio Grid Category Filtering (Optional support)
 */
function initPortfolioFilters() {
  const filters = document.querySelectorAll('#portfolio-filters button');
  const items = document.querySelectorAll('#portfolio-grid > div');

  if (filters.length === 0 || items.length === 0) return;

  filters.forEach(filterBtn => {
    filterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      filters.forEach(btn => {
        btn.className = "px-3 py-1.5 border border-retroBorder bg-transparent text-slate-500 rounded transition-all hover:text-slate-800 hover:border-slate-400";
      });
      filterBtn.className = "px-3 py-1.5 border border-theme-primary bg-theme-primary/10 text-theme-primary rounded transition-all hover:bg-theme-primary/25";

      const filterValue = filterBtn.getAttribute('data-filter');

      items.forEach(item => {
        const itemCategory = item.querySelector('a').getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'block';
          item.style.opacity = '0';
          setTimeout(() => {
            item.style.opacity = '1';
          }, 50);
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/**
 * 6. Real-time Clock Tracker
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
 * 7. Mobile Menu Toggle
 */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const line1 = document.getElementById('line1');
  const line3 = document.getElementById('line3');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!btn || !menu) return;

  function toggleMenu() {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !expanded);
    menu.classList.toggle('hidden');
    
    // Animate lines into 'X'
    line1.classList.toggle('rotate-45');
    line1.classList.toggle('translate-y-[6px]');
    line3.classList.toggle('-rotate-45');
    line3.classList.toggle('-translate-y-[6px]');
  }

  btn.addEventListener('click', toggleMenu);

  links.forEach(link => {
    link.addEventListener('click', () => {
      if (!menu.classList.contains('hidden')) {
        toggleMenu();
      }
    });
  });
}

/**
 * 8. Contact Form Validations
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
