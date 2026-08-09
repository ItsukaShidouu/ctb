/* ==========================================================================
   NESSID [NSD] — MAIN JAVASCRIPT ENGINE
   Handles UI Interactions, Roster Filtering, Mobile Drawer, Audio & Observers
   ========================================================================== */

// 1. AUTHENTIC LIVE TEAM MEMBERS DATA FROM OSU! TEAM PROFILE 12517
const teamMembersData = [
  {
    id: 30037974,
    username: "YusupKakuu",
    role: "Team Leader",
    isLeader: true,
    country: "Indonesia",
    countryCode: "ID",
    avatarUrl: "https://a.ppy.sh/30037974?1784816053.jpeg",
    coverUrl: "https://assets.ppy.sh/user-profile-covers/30037974/cd7fe2c3b94a76fac33227d49efbad58c8496152b0729dac0b33a64bee22a1e2.jpeg",
    isOnline: true,
    lastVisit: "2026-08-09T17:23:58+00:00"
  },
  {
    id: 34814506,
    username: "alif1625",
    role: "Team Member",
    isLeader: false,
    country: "Indonesia",
    countryCode: "ID",
    avatarUrl: "https://a.ppy.sh/34814506?1749114573.jpeg",
    coverUrl: "https://assets.ppy.sh/user-cover-presets/31/fd4e8a3e4f40a3d13f188c391840fc035beaf5e04926230ac4f3f3ac9cd465ac.jpeg",
    isOnline: false,
    lastVisit: "2026-07-13T07:13:02+00:00"
  },
  {
    id: 36644908,
    username: "Leonhart65",
    role: "Team Member",
    isLeader: false,
    country: "Indonesia",
    countryCode: "ID",
    avatarUrl: "https://a.ppy.sh/36644908?1758412631.jpeg",
    coverUrl: "https://assets.ppy.sh/user-cover-presets/32/a309de64d21720c1d100620b86045bac383ec0b7e5caee0f36a3b89d842ef926.jpeg",
    isOnline: false,
    lastVisit: "2026-08-08T15:20:07+00:00"
  },
  {
    id: 37074565,
    username: "nanometer",
    role: "Team Member",
    isLeader: false,
    country: "Indonesia",
    countryCode: "ID",
    avatarUrl: "https://osu.ppy.sh/images/layout/avatar-guest@2x.png",
    coverUrl: "https://assets.ppy.sh/user-cover-presets/20/7be0bc7d933b0b5fefb043fbd11e5018d75f7f64c2a78a8a50148d96ed6745b5.jpeg",
    isOnline: false,
    lastVisit: "2026-08-09T14:54:59+00:00"
  },
  {
    id: 16791413,
    username: "TaKa_036",
    role: "Team Member",
    isLeader: false,
    country: "Indonesia",
    countryCode: "ID",
    avatarUrl: "https://a.ppy.sh/16791413?1631595614.jpeg",
    coverUrl: "https://assets.ppy.sh/user-cover-presets/7/4a0ccb7b7fdd5c4238b11f0e7c686760fe2c99c6472b19400e82d1a8ff503e31.jpeg",
    isOnline: false,
    lastVisit: "2026-07-29T20:33:55+00:00"
  },
  {
    id: 36407692,
    username: "yosiandriansyah",
    role: "Team Member",
    isLeader: false,
    country: "Indonesia",
    countryCode: "ID",
    avatarUrl: "https://a.ppy.sh/36407692?1786193556.jpeg",
    coverUrl: "https://assets.ppy.sh/user-cover-presets/41/50d00960f011b60577253f6c530a974cf2bd65d0da83a92f2d02f1cdecc25151.jpeg",
    isOnline: false,
    lastVisit: "2026-08-09T03:44:29+00:00"
  },
  {
    id: 37978368,
    username: "young-il",
    role: "Team Member",
    isLeader: false,
    country: "Indonesia",
    countryCode: "ID",
    avatarUrl: "https://a.ppy.sh/37978368?1759752621.jpeg",
    coverUrl: "https://assets.ppy.sh/user-profile-covers/37978368/9c3da24050705254cc08a4735e9dc6bc6b6fe745b4ae3178ee36b47a2f586f24.jpeg",
    isOnline: false,
    lastVisit: "2026-08-09T04:29:50+00:00"
  }
];

// 2. RENDER MEMBERS ROSTER WITH RESPONSIVE CARD LAYOUT & FILTERING
function renderRoster(filter = 'all') {
  const rosterGrid = document.getElementById('rosterGrid');
  if (!rosterGrid) return;

  const filtered = teamMembersData.filter(m => {
    if (filter === 'leader') return m.isLeader;
    if (filter === 'online') return m.isOnline;
    return true;
  });

  if (filtered.length === 0) {
    rosterGrid.innerHTML = `
      <div class="col-span-full text-center py-12 glass-card rounded-3xl">
        <p class="text-zinc-400 font-mono">Tidak ada anggota yang sesuai dengan filter ini.</p>
      </div>
    `;
    return;
  }

  rosterGrid.innerHTML = filtered.map(member => {
    const badgeClass = member.isLeader 
      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
      : 'bg-zinc-800/80 text-zinc-300 border-white/10';

    const borderGlow = member.isLeader ? 'border-brand-500/60 shadow-[0_0_25px_rgba(244,63,94,0.25)]' : 'border-white/10';

    return `
      <div class="glass-card rounded-3xl overflow-hidden border ${borderGlow} glass-card-interactive group flex flex-col justify-between transition-all duration-300">
        <div>
          <!-- Cover Header Image -->
          <div class="h-28 w-full relative overflow-hidden bg-zinc-900">
            <img src="${member.coverUrl}" alt="${member.username} cover" class="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500" loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-[#0e111a] via-transparent to-transparent"></div>
            
            <!-- Status Badge -->
            <div class="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono">
              <span class="w-2 h-2 rounded-full ${member.isOnline ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}"></span>
              <span class="${member.isOnline ? 'text-emerald-400 font-bold' : 'text-zinc-400'}">${member.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
          </div>

          <!-- Avatar & Information -->
          <div class="px-5 sm:px-6 pb-6 pt-0 relative">
            <div class="flex items-end justify-between -mt-10 mb-4">
              <div class="relative">
                <img src="${member.avatarUrl}" onError="this.src='https://osu.ppy.sh/images/layout/avatar-guest@2x.png'" alt="${member.username}" class="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-4 border-[#0e111a] bg-zinc-900 object-cover shadow-xl group-hover:rotate-3 transition-transform duration-300">
              </div>
              <span class="px-3 py-1 rounded-full border ${badgeClass} text-xs font-mono font-bold">
                ${member.isLeader ? '👑 ' + member.role : member.role}
              </span>
            </div>

            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <h3 class="text-lg sm:text-xl font-extrabold text-white group-hover:text-brand-400 transition-colors flex items-center gap-2">
                  ${member.username}
                  <span class="text-base" title="Indonesia">🇮🇩</span>
                </h3>
              </div>
              <p class="text-xs text-zinc-400 font-mono">User ID: #${member.id}</p>
            </div>
          </div>
        </div>

        <!-- Card Action Footer -->
        <div class="px-5 sm:px-6 pb-5 pt-2 border-t border-white/5 flex items-center justify-between">
          <span class="text-[11px] text-zinc-500 font-mono">osu! Profile</span>
          <a href="https://osu.ppy.sh/users/${member.id}" target="_blank" rel="noopener" class="btn-interactive px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-brand-500 hover:text-white border border-white/10 text-zinc-300 text-xs font-bold transition-all flex items-center gap-1.5">
            <span>Profil User</span>
            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
          </a>
        </div>
      </div>
    `;
  }).join('');
}

// 3. SOUND SYNTHESIZER & AUDIO FEEDBACK
let soundEnabled = true;
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');

if (soundToggleBtn) {
  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      soundIcon.className = 'fa-solid fa-volume-high';
    } else {
      soundIcon.className = 'fa-solid fa-volume-xmark text-rose-500';
    }
  });
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playClickSound(freq = 600) {
  if (!soundEnabled) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (e) {}
}

// 4. INITIALIZATION & EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  renderRoster('all');

  // Roster Filter Tab Buttons
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.className = 'filter-tab px-4 sm:px-5 py-2 rounded-xl glass-card text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-300';
      });
      tab.className = 'filter-tab px-4 sm:px-5 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md';
      const filterVal = tab.getAttribute('data-filter');
      renderRoster(filterVal);
      playClickSound(800);
    });
  });

  // Mobile Menu Drawer Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuIcon = document.getElementById('menuIcon');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
        setTimeout(() => {
          mobileMenu.classList.remove('opacity-0', '-translate-y-4');
          mobileMenu.classList.add('opacity-100', 'translate-y-0');
        }, 10);
        menuIcon.className = 'fa-solid fa-xmark text-lg rotate-90';
      } else {
        mobileMenu.classList.remove('opacity-100', 'translate-y-0');
        mobileMenu.classList.add('opacity-0', '-translate-y-4');
        setTimeout(() => {
          mobileMenu.classList.add('hidden');
        }, 300);
        menuIcon.className = 'fa-solid fa-bars text-lg rotate-0';
      }
      playClickSound(600);
    });

    // Close Mobile Menu when link clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('opacity-100', 'translate-y-0');
        mobileMenu.classList.add('opacity-0', '-translate-y-4');
        setTimeout(() => mobileMenu.classList.add('hidden'), 300);
        menuIcon.className = 'fa-solid fa-bars text-lg rotate-0';
      });
    });
  }

  // FAQ Accordion Expand/Collapse
  const faqTriggers = document.querySelectorAll('.faq-trigger');
  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const content = trigger.nextElementSibling;
      const icon = trigger.querySelector('i');
      const isOpen = content.classList.contains('is-open');

      document.querySelectorAll('.faq-content').forEach(c => c.classList.remove('is-open'));
      document.querySelectorAll('.faq-trigger i').forEach(i => i.style.transform = 'rotate(0deg)');

      if (!isOpen) {
        content.classList.add('is-open');
        icon.style.transform = 'rotate(180deg)';
      }
      playClickSound(700);
    });
  });

  // Attach sound on click to interactive buttons
  document.querySelectorAll('.btn-interactive, .nav-link').forEach(btn => {
    btn.addEventListener('click', () => playClickSound(750));
  });

  // Scroll Reveal Animations (Intersection Observer)
  const observerOptions = {
    root: null,
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    revealObserver.observe(el);
  });

  // Navbar Padding Shrink on Scroll
  window.addEventListener('scroll', () => {
    const navContainer = document.getElementById('navContainer');
    if (!navContainer) return;
    if (window.scrollY > 40) {
      navContainer.classList.remove('py-3');
      navContainer.classList.add('py-1');
    } else {
      navContainer.classList.remove('py-1');
      navContainer.classList.add('py-3');
    }
  });

  // Ambient Background Particles Canvas
  const bgCanvas = document.getElementById('bgParticles');
  if (bgCanvas) {
    const bgCtx = bgCanvas.getContext('2d');
    let bgWidth, bgHeight;
    let particles = [];

    function resizeBg() {
      bgWidth = bgCanvas.width = window.innerWidth;
      bgHeight = bgCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeBg);
    resizeBg();

    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * bgWidth,
        y: Math.random() * bgHeight,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '#f43f5e' : '#a855f7',
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function animateBg() {
      bgCtx.clearRect(0, 0, bgWidth, bgHeight);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = bgWidth;
        if (p.x > bgWidth) p.x = 0;
        if (p.y < 0) p.y = bgHeight;
        if (p.y > bgHeight) p.y = 0;
        bgCtx.beginPath();
        bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        bgCtx.fillStyle = p.color;
        bgCtx.globalAlpha = p.alpha;
        bgCtx.fill();
      });
      requestAnimationFrame(animateBg);
    }
    animateBg();
  }
});
