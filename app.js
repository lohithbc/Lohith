/**
 * Cyberpunk HUD & Retro-Modern Portfolio Controller Script - Light Mode
 * Manages warping grid mesh canvas, theme colors switcher, process logs, and portfolio interactions.
 */

// Global active theme RGB cache (default to Cobalt Blue in light mode)
window.activeThemeRGB = '37, 99, 235';

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
 * 1. Interactive Warping Grid Mesh & Node Plexus Canvas Background
 */
function initCanvasBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  const particleCount = 60;
  const connectionDistance = 110;
  const mouse = { x: null, y: null, radius: 180 };

  // Grid mesh variables
  const gridSpacing = 65; // Distance between grid lines
  let gridPoints = []; // 2D array storing grid nodes

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializeGridPoints();
  }
  window.addEventListener('resize', resizeCanvas);

  // Initialize static grid mesh coordinates
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

  // Track mouse position
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
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.radius = Math.random() * 2 + 0.8;
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
          this.x += Math.cos(angle) * force * 0.45;
          this.y += Math.sin(angle) * force * 0.45;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${window.activeThemeRGB}, 0.25)`; // Dynamic node color
      ctx.fill();
    }
  }

  // Generate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Initialize canvas
  resizeCanvas();

  // Draw Warped grid net
  function drawWarpedGrid() {
    const cols = gridPoints.length;
    if (cols === 0) return;
    const rows = gridPoints[0].length;

    // 1. Calculate warped positions based on mouse proximity
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
            // Push grid vertices away from mouse
            p.x += Math.cos(angle) * force * 16;
            p.y += Math.sin(angle) * force * 16;
          }
        }
      }
    }

    // 2. Draw horizontal and vertical lines linking vertices
    ctx.strokeStyle = `rgba(${window.activeThemeRGB}, 0.055)`; // Hairline grid stroke
    ctx.lineWidth = 0.8;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        // Horizontal line
        if (c < cols - 1) {
          ctx.beginPath();
          ctx.moveTo(gridPoints[c][r].x, gridPoints[c][r].y);
          ctx.lineTo(gridPoints[c + 1][r].x, gridPoints[c + 1][r].y);
          ctx.stroke();
        }
        // Vertical line
        if (r < rows - 1) {
          ctx.beginPath();
          ctx.moveTo(gridPoints[c][r].x, gridPoints[c][r].y);
          ctx.lineTo(gridPoints[c][r + 1].x, gridPoints[c][r + 1].y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Layer 1: Warped Grid Net
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
          const opacity = (1 - dist / connectionDistance) * 0.09;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${window.activeThemeRGB}, ${opacity})`;
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
        btn.classList.remove('border-theme-primary', 'bg-theme-primary/10', 'text-theme-primary');
        btn.classList.add('border-retroBorder', 'bg-transparent', 'text-slate-500', 'hover:text-slate-800', 'hover:border-slate-400');
      });
      filterBtn.classList.remove('border-retroBorder', 'bg-transparent', 'text-slate-500', 'hover:text-slate-800', 'hover:border-slate-400');
      filterBtn.classList.add('border-theme-primary', 'bg-theme-primary/10', 'text-theme-primary');

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

    logLine.innerHTML = `<span class="text-slate-400">${timestamp}</span> <span class="font-bold">${typeTag}</span> ${logItem.msg}`;
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
    statusLog.classList.add('text-theme-primary');

    setTimeout(() => {
      statusLog.textContent = '[ STATUS: SHIFTING_PORTS_AND_COMPRESSING... ]';
      
      setTimeout(() => {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        if (name && email) {
          statusLog.textContent = '[ STATUS: PACKET_TRANSMITTED_SUCCESSFULLY ]';
          statusLog.classList.remove('text-theme-primary');
          statusLog.classList.add('text-retroGreen');
          form.reset();
        } else {
          statusLog.textContent = '[ STATUS: ERROR_PACKET_DROPPED_EMPTY_FIELDS ]';
          statusLog.classList.remove('text-theme-primary');
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

  // Colors mapping for canvas updates (Light Mode safe values)
  const themeColors = {
    amber: { rgb: '37, 99, 235', border: 'border-blue-600', bg: 'bg-blue-600/25', glow: 'shadow-[0_0_8px_rgba(37,99,235,0.4)]' },
    green: { rgb: '5, 150, 105', border: 'border-emerald-600', bg: 'bg-emerald-600/25', glow: 'shadow-[0_0_8px_rgba(5,150,105,0.4)]' },
    cyan: { rgb: '8, 145, 178', border: 'border-cyan-600', bg: 'bg-cyan-600/25', glow: 'shadow-[0_0_8px_rgba(8,145,178,0.4)]' },
    magenta: { rgb: '192, 38, 211', border: 'border-fuchsia-600', bg: 'bg-fuchsia-600/25', glow: 'shadow-[0_0_8px_rgba(192,38,211,0.4)]' }
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
          otherBtn.className += ` ${config.bg} ${config.glow}`;
        } else {
          otherBtn.className += ` bg-transparent opacity-60`;
        }
      });
    });
  });
}
