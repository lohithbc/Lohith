/**
 * Core Behavior & Interactions Script
 * Portfolio website for Lohith BC
 */

document.addEventListener('DOMContentLoaded', () => {
  initCanvasBackground();
  initMobileMenu();
  initScrollAnimations();
  initActiveNavTracking();
  initPortfolioFilters();
  initLiveClock();
  initContactForm();
});

/**
 * 1. Mobile Menu Toggler
 */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const line1 = document.getElementById('line1');
  const line2 = document.getElementById('line2');
  const line3 = document.getElementById('line3');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!btn || !menu) return;

  function toggleMenu() {
    menu.classList.toggle('hidden');
    // Animate burger menu lines into an 'X'
    line1.classList.toggle('rotate-45');
    line1.classList.toggle('translate-y-[6px]');
    line2.classList.toggle('opacity-0');
    line3.classList.toggle('-rotate-45');
    line3.classList.toggle('-translate-y-[6px]');
  }

  btn.addEventListener('click', toggleMenu);

  // Close menu when links are clicked
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (!menu.classList.contains('hidden')) {
        toggleMenu();
      }
    });
  });
}

/**
 * 2. Scroll Reveal Animations (using Intersection Observer)
 */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Once it has animated in, we can stop observing it
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    elements.forEach(el => el.classList.add('revealed'));
  }
}

/**
 * 3. Active Nav Link Tracking on Scroll
 */
function initActiveNavTracking() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  function trackingActiveSection() {
    let scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120; // offset header height
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active-nav');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active-nav');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', trackingActiveSection);
  // Run once initially
  trackingActiveSection();
}

/**
 * 4. Portfolio Grid Filters
 */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
  const items = document.querySelectorAll('.portfolio-item');

  if (!filterBtns.length || !items.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active design classes from all buttons
      filterBtns.forEach(b => {
        b.classList.remove('border-retroAmber', 'text-retroAmber', 'bg-retroAmber/10');
        b.classList.add('border-retroBorder', 'text-gray-400');
      });

      // Add active design classes to clicked button
      btn.classList.remove('border-retroBorder', 'text-gray-400');
      btn.classList.add('border-retroAmber', 'text-retroAmber', 'bg-retroAmber/10');

      const filterValue = btn.getAttribute('data-filter');

      items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');

        if (filterValue === 'all' || itemCategory === filterValue) {
          // Show with layout animation
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          // Hide with smooth fade out
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/**
 * 5. Live Retro Terminal Clock
 */
function initLiveClock() {
  const clockEl = document.getElementById('live-clock');
  const yearEl = document.getElementById('current-year');

  // Set current year
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    clockEl.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
  }

  // Update clock every second
  setInterval(updateClock, 1000);
  updateClock(); // run initially
}

/**
 * 6. Contact Form Submission Sim
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');

  if (!form || !statusEl) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Show transmitting status
    statusEl.textContent = '[ STATUS: TRANSMITTING_MESSAGE... ]';
    statusEl.classList.remove('text-red-500', 'text-retroGreen');
    statusEl.classList.add('text-retroAmber');
    statusEl.style.opacity = '1';

    // Simulate server transmission delay
    setTimeout(() => {
      // Validate inputs loosely
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;

      if (name && email) {
        statusEl.textContent = '[ STATUS: MESSAGE_DELIVERED_SUCCESSFULLY ]';
        statusEl.classList.remove('text-retroAmber');
        statusEl.classList.add('text-retroGreen');
        
        // Reset form inputs
        form.reset();
      } else {
        statusEl.textContent = '[ STATUS: TRANSMISSION_FAILED. RE-VERIFY EMAIL. ]';
        statusEl.classList.remove('text-retroAmber');
        statusEl.classList.add('text-red-500');
      }

      // Fade out status after 5 seconds
      setTimeout(() => {
        statusEl.style.opacity = '0';
      }, 5000);

    }, 1500);
  });
}

/**
 * 7. Interactive Canvas Plexus Background
 */
function initCanvasBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  const particleCount = 85;
  const connectionDistance = 110;
  const mouse = { x: null, y: null, radius: 150 };

  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Track mouse
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle constructor
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off boundaries
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

      // Mouse attraction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          // Pull gently towards mouse
          this.x += Math.cos(angle) * force * 0.4;
          this.y += Math.sin(angle) * force * 0.4;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.45)'; // Amber particles
      ctx.fill();
    }
  }

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < connectionDistance) {
          // Calculate opacity based on distance
          const opacity = (1 - dist / connectionDistance) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(245, 158, 11, ${opacity})`; // Amber connection lines
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}
