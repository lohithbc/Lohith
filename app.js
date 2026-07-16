/**
 * Cyberpunk HUD & Retro-Modern Portfolio Controller Script
 * Manages canvas visual systems, simulated loggers, metric fluctuations, and core portfolio behavior.
 */

// Global active theme RGB cache (default to Amber)
window.activeThemeRGB = '245, 158, 11';

document.addEventListener('DOMContentLoaded', () => {
  initCanvasBackground();
  initThemeSwitcher();
  initMobileMenu();
  initScrollAnimations();
  initActiveNavTracking();
  initPortfolioFilters();
  initLiveClock();
  initProcessLogger();
  initMetricBars();
  initContactForm();
});

/**
 * 1. Interactive Dual-Layer Canvas Background (3D Perspective Grid + Node Plexus)
 */
function initCanvasBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  const particleCount = 75;
  const connectionDistance = 110;
  const mouse = { x: null, y: null, radius: 160 };

  // Grid animation configuration
  let gridOffset = 0;
  const gridSpeed = 0.35; // Speed of forward grid motion

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

  // Particle Node Blueprint
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 0.8;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Wrap boundaries instead of simple bounce for seamless space
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;

      // Mouse interactive pull
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 0.35;
          this.y += Math.sin(angle) * force * 0.35;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${window.activeThemeRGB}, 0.4)`; // Dynamic node color
      ctx.fill();
    }
  }

  // Generate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Draw 3D Retro Synthwave Grid
  function drawPerspectiveGrid() {
    const horizon = canvas.height * 0.45; // Horizon height
    const gridYStart = horizon + 20;
    const gridHeight = canvas.height - gridYStart;
    
    ctx.strokeStyle = `rgba(${window.activeThemeRGB}, 0.04)`; // Dynamic grid color
    ctx.lineWidth = 1;

    // Draw vanishing perspective lines radiating from top-center horizon
    const centerX = canvas.width / 2;
    const lineCount = 36;
    for (let i = 0; i <= lineCount; i++) {
      const xPercent = (i / lineCount) * 2 - 1; // Range from -1 to 1
      const startX = centerX + xPercent * 30; // Radiate from centered point
      const endX = centerX + xPercent * (canvas.width * 1.5); // Spread outward at the bottom
      
      ctx.beginPath();
      ctx.moveTo(startX, gridYStart);
      ctx.lineTo(endX, canvas.height);
      ctx.stroke();
    }

    // Draw horizontal grid lines sliding forward towards screen
    gridOffset = (gridOffset + gridSpeed) % 40; // Loop spacing interval
    
    // Dynamic exponential spacing to simulate perspective depth
    let currentY = 0;
    let step = 1;
    while (currentY < gridHeight) {
      // Calculate depth spacing
      const normalizedPos = currentY / gridHeight;
      
      // Calculate drawing Y with perspective compression
      const drawY = gridYStart + Math.pow(normalizedPos, 1.8) * gridHeight;
      
      if (drawY > gridYStart && drawY < canvas.height) {
        // Fade lines near the horizon
        const opacity = Math.min((drawY - gridYStart) / 100, 1) * 0.05;
        ctx.strokeStyle = `rgba(${window.activeThemeRGB}, ${opacity})`; // Dynamic line color
        ctx.beginPath();
        ctx.moveTo(0, drawY);
        ctx.lineTo(canvas.width, drawY);
        ctx.stroke();
      }
      
      step *= 1.15;
      currentY += step + 8;
    }
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Layer 1: Perspective Grid
    drawPerspectiveGrid();

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
          const opacity = (1 - dist / connectionDistance) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${window.activeThemeRGB}, ${opacity})`; // Dynamic line color
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
 * 2. Mobile Menu Toggler
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
    line1.classList.toggle('rotate-45');
    line1.classList.toggle('translate-y-[6px]');
    line2.classList.toggle('opacity-0');
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
 * 3. Scroll Reveal Animations (Intersection Observer)
 */
function initScrollAnimations() {
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
 * 4. Active Navigation Indicator Highlight
 */
function initActiveNavTracking() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  if (sections.length === 0 || navLinks.length === 0) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPosition = window.scrollY + 120; // Offset for sticky navbar

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active-nav');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active-nav');
      }
    });
  });
}

/**
 * 5. Portfolio Grid Category Filtering
 */
function initPortfolioFilters() {
  const filters = document.querySelectorAll('#portfolio-filters button');
  const items = document.querySelectorAll('#portfolio-grid > div');

  if (filters.length === 0 || items.length === 0) return;

  filters.forEach(filterBtn => {
    filterBtn.addEventListener('click', () => {
      // Toggle active states on filter buttons
      filters.forEach(btn => {
        btn.classList.remove('border-retroAmber', 'bg-retroAmber/10', 'text-retroAmber');
        btn.classList.add('border-retroBorder', 'bg-transparent', 'text-gray-400', 'hover:text-white', 'hover:border-gray-500');
      });
      filterBtn.classList.remove('border-retroBorder', 'bg-transparent', 'text-gray-400', 'hover:text-white', 'hover:border-gray-500');
      filterBtn.classList.add('border-retroAmber', 'bg-retroAmber/10', 'text-retroAmber');

      const filterValue = filterBtn.getAttribute('data-filter');

      items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'flex';
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
 * 6. Clock and Uptime Trackers
 */
let uptimeSeconds = 0;
function initLiveClock() {
  const liveClockEl = document.getElementById('live-time');
  const uptimeEl = document.getElementById('uptime-counter');

  function updateTimes() {
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    if (liveClockEl) {
      liveClockEl.textContent = formatter.format(new Date());
    }

    uptimeSeconds++;
    const hrs = String(Math.floor(uptimeSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((uptimeSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(uptimeSeconds % 60).padStart(2, '0');
    if (uptimeEl) {
      uptimeEl.textContent = `${hrs}:${mins}:${secs}`;
    }
  }

  setInterval(updateTimes, 1000);
  updateTimes();
}

/**
 * 7. Simulated Diagnostics Logger Window
 */
function initProcessLogger() {
  const logContainer = document.getElementById('console-logs');
  if (!logContainer) return;

  const mockLogs = [
    { type: 'info', msg: 'Syncing portal states with WordPress cores...' },
    { type: 'success', msg: 'CRM connection established on port 443' },
    { type: 'info', msg: 'Optimizing payload bundle modules: style.css' },
    { type: 'success', msg: 'MySQL database response in 4.82ms' },
    { type: 'warning', msg: 'HubSpot API buffer load: 74% - stabilizing' },
    { type: 'info', msg: 'Validating DNS routes for dubai-fintech-summit' },
    { type: 'success', msg: 'Handshake completed: secure WordPress SSL' },
    { type: 'info', msg: 'Flushing server cache tables (0 obsolete entries)' },
    { type: 'success', msg: 'Loaded 3D perspective background canvas grid' },
    { type: 'info', msg: 'Mapping CRM tracking scripts to client input headers' },
    { type: 'warning', msg: 'Concurrent checkout ping spikes: 842 sessions' },
    { type: 'success', msg: 'System logs buffer flushed to console log' }
  ];

  let logIndex = 0;

  function appendLog() {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const logItem = mockLogs[logIndex];
    const logLine = document.createElement('div');
    logLine.className = `console-log-line ${logItem.type}`;
    
    let typeTag = '[INFO]';
    if (logItem.type === 'success') typeTag = '[ OK ]';
    if (logItem.type === 'warning') typeTag = '[WARN]';

    logLine.innerHTML = `<span class="text-gray-500">${timestamp}</span> <span class="font-bold">${typeTag}</span> ${logItem.msg}`;
    logContainer.appendChild(logLine);

    logContainer.scrollTop = logContainer.scrollHeight;
    logIndex = (logIndex + 1) % mockLogs.length;

    if (logContainer.children.length > 50) {
      logContainer.removeChild(logContainer.firstChild);
    }

    const nextInterval = Math.random() * 2000 + 1200;
    setTimeout(appendLog, nextInterval);
  }

  appendLog();
}

/**
 * 8. Simulated Sidebar Load Metric Indicators
 */
function initMetricBars() {
  const wpPct = document.getElementById('wp-load-pct');
  const wpBar = document.getElementById('wp-load-bar');
  const dbPct = document.getElementById('db-load-pct');
  const dbBar = document.getElementById('db-load-bar');
  const apiPct = document.getElementById('api-load-pct');
  const apiBar = document.getElementById('api-load-bar');

  function fluctuateMetrics() {
    const newWp = Math.max(10, Math.min(30, Math.floor(18 + (Math.random() - 0.5) * 8)));
    const newDb = Math.max(30, Math.min(60, Math.floor(42 + (Math.random() - 0.5) * 12)));
    const newApi = Math.max(15, Math.min(45, Math.floor(29 + (Math.random() - 0.5) * 10)));

    if (wpPct && wpBar) {
      wpPct.textContent = `${newWp}%`;
      wpBar.style.width = `${newWp}%`;
    }
    if (dbPct && dbBar) {
      dbPct.textContent = `${newDb}%`;
      dbBar.style.width = `${newDb}%`;
    }
    if (apiPct && apiBar) {
      apiPct.textContent = `${newApi}%`;
      apiBar.style.width = `${newApi}%`;
    }
  }

  setInterval(fluctuateMetrics, 2800);
}

/**
 * 9. Contact Form Transmission Logic
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusLog = document.getElementById('form-status-log');

  if (!form || !statusLog) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    statusLog.textContent = '[ STATUS: PREPARING_TRANSMISSION_PACKET... ]';
    statusLog.classList.remove('text-red-500', 'text-retroGreen');
    statusLog.classList.add('text-retroAmber');

    setTimeout(() => {
      statusLog.textContent = '[ STATUS: SHIFTING_PORTS_AND_COMPRESSING... ]';
      
      setTimeout(() => {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        if (name && email) {
          statusLog.textContent = '[ STATUS: PACKET_TRANSMITTED_SUCCESSFULLY ]';
          statusLog.classList.remove('text-retroAmber');
          statusLog.classList.add('text-retroGreen');
          form.reset();
        } else {
          statusLog.textContent = '[ STATUS: ERROR_PACKET_DROPPED_EMPTY_FIELDS ]';
          statusLog.classList.remove('text-retroAmber');
          statusLog.classList.add('text-red-500');
        }
      }, 1500);

    }, 1200);
  });
}

/**
 * 10. Interactive HUD Color Theme Switcher Logic
 */
function initThemeSwitcher() {
  const btns = document.querySelectorAll('.theme-selector-btn');
  const body = document.body;

  if (btns.length === 0) return;

  // Colors mapping for canvas updates
  const themeColors = {
    amber: { rgb: '245, 158, 11', border: 'border-retroAmber', bg: 'bg-retroAmber/25', glow: 'shadow-[0_0_8px_rgba(245,158,11,0.4)]' },
    green: { rgb: '16, 185, 129', border: 'border-emerald-500', bg: 'bg-emerald-500/25', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.4)]' },
    cyan: { rgb: '6, 182, 212', border: 'border-cyan-500', bg: 'bg-cyan-500/25', glow: 'shadow-[0_0_8px_rgba(6,182,212,0.4)]' },
    magenta: { rgb: '217, 70, 239', border: 'border-fuchsia-500', bg: 'bg-fuchsia-500/25', glow: 'shadow-[0_0_8px_rgba(217,70,239,0.4)]' }
  };

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const themeId = btn.id.replace('theme-btn-', '');

      // Remove current body classes
      body.classList.remove('theme-green', 'theme-cyan', 'theme-magenta');
      
      // Add class if not default (amber)
      if (themeId !== 'amber') {
        body.classList.add(`theme-${themeId}`);
      }

      // Update global active theme color for Canvas
      window.activeThemeRGB = themeColors[themeId].rgb;

      // Update button styling states
      btns.forEach(otherBtn => {
        const otherId = otherBtn.id.replace('theme-btn-', '');
        const config = themeColors[otherId];
        
        otherBtn.className = `w-8 h-8 rounded-full border-2 focus:outline-none transition-all hover:scale-110 active:scale-95 theme-selector-btn ${config.border}`;
        
        if (otherId === themeId) {
          // Add active states
          otherBtn.className += ` ${config.bg} ${config.glow}`;
        } else {
          // Add inactive states
          otherBtn.className += ` bg-transparent opacity-60`;
        }
      });
    });
  });
}
