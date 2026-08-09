/* ==========================================================================
   NESSID [NSD] — MAIN JAVASCRIPT ENGINE
   Official osu!catch Team & Community Web Application
   Handles Roster Filtering, Real-time Search, Navigation Drawer, Audio & Observers
   ========================================================================== */

(function () {
  'use strict';

  // ─── 1. TEAM MEMBERS DATA (OFFICIAL OSU! TEAM ID 12517) ─────────────────
  const teamMembers = [
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
      joinedDate: "Feb 2025"
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
      joinedDate: "2025"
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
      joinedDate: "2025"
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
      joinedDate: "2025"
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
      joinedDate: "2025"
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
      joinedDate: "2025"
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
      joinedDate: "2025"
    }
  ];

  let currentCategoryFilter = 'all';
  let currentSearchQuery = '';

  // ─── 2. SOUND SYNTHESIZER & AUDIO FEEDBACK ───────────────────────────────
  let soundMuted = false;
  let audioContext = null;

  function initAudio() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioContext = new AudioCtx();
    }
  }

  window.playUiSound = function (frequency = 600, duration = 0.08, type = 'sine') {
    if (soundMuted) return;
    initAudio();
    if (!audioContext) return;

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioContext.currentTime);

      gain.gain.setValueAtTime(0.06, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + duration);
    } catch (e) {
      // Ignore audio synthesis errors on unsupported browsers
    }
  };

  function setupSoundToggle() {
    const soundBtn = document.getElementById('soundToggleBtn');
    const soundIcon = document.getElementById('soundIcon');
    if (!soundBtn || !soundIcon) return;

    soundBtn.addEventListener('click', () => {
      soundMuted = !soundMuted;
      if (soundMuted) {
        soundIcon.className = 'fa-solid fa-volume-xmark text-rose-400';
        soundBtn.setAttribute('title', 'Sound Muted');
      } else {
        soundIcon.className = 'fa-solid fa-volume-high text-zinc-300';
        soundBtn.setAttribute('title', 'Sound Enabled');
        playUiSound(720, 0.1);
      }
    });
  }

  // ─── 3. ROSTER RENDERING & FILTERING ─────────────────────────────────────
  function renderRoster() {
    const rosterGrid = document.getElementById('rosterGrid');
    if (!rosterGrid) return;

    const filtered = teamMembers.filter(member => {
      // Category filter
      let passCategory = true;
      if (currentCategoryFilter === 'leader') passCategory = member.isLeader;
      if (currentCategoryFilter === 'online') passCategory = member.isOnline;

      // Search query filter
      let passSearch = true;
      if (currentSearchQuery.trim() !== '') {
        const q = currentSearchQuery.toLowerCase().trim();
        passSearch = member.username.toLowerCase().includes(q) || String(member.id).includes(q);
      }

      return passCategory && passSearch;
    });

    if (filtered.length === 0) {
      rosterGrid.innerHTML = `
        <div class="col-span-full py-12 text-center glass-card rounded-2xl border border-white/10">
          <i class="fa-solid fa-user-slash text-3xl text-zinc-500 mb-3"></i>
          <p class="text-zinc-300 font-bold text-sm">Tidak ada anggota yang ditemukan</p>
          <p class="text-zinc-500 text-xs mt-1">Coba gunakan kata kunci pencarian lain atau ubah filter tab.</p>
        </div>
      `;
      return;
    }

    rosterGrid.innerHTML = filtered.map(member => {
      const badgeClass = member.isLeader
        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
        : 'bg-zinc-800/80 text-zinc-300 border-white/10';

      const cardGlow = member.isLeader
        ? 'border-rose-500/40 shadow-[0_0_24px_rgba(244,63,94,0.15)]'
        : 'border-white/8';

      return `
        <div class="glass-card overflow-hidden border ${cardGlow} glass-card-hover group flex flex-col justify-between h-full">
          <div>
            <!-- Banner Cover -->
            <div class="h-24 w-full relative overflow-hidden bg-zinc-900">
              <img src="${member.coverUrl}" alt="${member.username} cover"
                   class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" loading="lazy">
              <div class="absolute inset-0 bg-gradient-to-t from-[#0d101a] via-transparent to-transparent"></div>
              
              <!-- Online Status Indicator -->
              <div class="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono">
                <span class="w-2 h-2 rounded-full ${member.isOnline ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}"></span>
                <span class="${member.isOnline ? 'text-emerald-400 font-bold' : 'text-zinc-400'}">${member.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
            </div>

            <!-- Profile Info Body -->
            <div class="px-5 pb-5 pt-0 relative">
              <div class="flex items-end justify-between -mt-8 mb-3">
                <div class="relative">
                  <img src="${member.avatarUrl}" onError="this.src='https://osu.ppy.sh/images/layout/avatar-guest@2x.png'" alt="${member.username}"
                       class="w-16 h-16 rounded-xl border-2 border-[#0d101a] bg-zinc-900 object-cover shadow-xl group-hover:rotate-2 transition-transform duration-300">
                </div>
                <span class="px-2.5 py-1 rounded-lg border ${badgeClass} text-[11px] font-mono font-bold flex items-center gap-1">
                  ${member.isLeader ? '👑 ' + member.role : member.role}
                </span>
              </div>

              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <h3 class="text-base sm:text-lg font-bold text-white group-hover:text-brand-pink transition-colors flex items-center gap-2">
                    ${member.username}
                    <span class="text-xs" title="Indonesia">🇮🇩</span>
                  </h3>
                </div>
                <p class="text-[11px] text-zinc-400 font-mono">ID: #${member.id}</p>
              </div>
            </div>
          </div>

          <!-- Card Action Footer -->
          <div class="px-5 py-3 border-t border-white/5 flex items-center justify-between bg-zinc-950/40">
            <span class="text-[10px] text-zinc-500 font-mono"><i class="fa-solid fa-gamepad mr-1"></i>osu! Catcher</span>
            <a href="https://osu.ppy.sh/users/${member.id}" target="_blank" rel="noopener"
               class="btn-interactive px-3 py-1.5 rounded-lg bg-white/5 hover:bg-brand-rose hover:text-white border border-white/10 text-zinc-300 text-xs font-semibold transition-all flex items-center gap-1.5">
              <span>Profil User</span>
              <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  function setupRosterControls() {
    // Filter Tabs
    const filterTabs = document.querySelectorAll('#rosterFilterTabs .filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategoryFilter = tab.getAttribute('data-filter') || 'all';
        renderRoster();
        playUiSound(800, 0.08);
      });
    });

    // Search Input
    const searchInput = document.getElementById('rosterSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value;
        renderRoster();
      });
    }
  }

  // ─── 4. MOBILE NAVIGATION DRAWER & NAVBAR SCROLL ────────────────────────
  function setupNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const menuIcon = document.getElementById('menuIcon');

    // Scroll Navbar effect
    window.addEventListener('scroll', () => {
      if (!navbar) return;
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Mobile Drawer Toggle
    if (mobileMenuBtn && mobileDrawer && menuIcon) {
      mobileMenuBtn.addEventListener('click', () => {
        const isHidden = mobileDrawer.classList.contains('hidden-drawer');
        if (isHidden) {
          mobileDrawer.classList.remove('hidden-drawer');
          menuIcon.className = 'fa-solid fa-xmark text-lg';
          playUiSound(700, 0.08);
        } else {
          mobileDrawer.classList.add('hidden-drawer');
          menuIcon.className = 'fa-solid fa-bars text-lg';
          playUiSound(500, 0.08);
        }
      });

      // Close drawer on link click
      mobileDrawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.add('hidden-drawer');
          menuIcon.className = 'fa-solid fa-bars text-lg';
        });
      });
    }
  }

  // ─── 5. FAQ ACCORDION ───────────────────────────────────────────────────
  function setupFaqAccordion() {
    const faqTriggers = document.querySelectorAll('.faq-trigger');
    faqTriggers.forEach(btn => {
      btn.addEventListener('click', () => {
        const answer = btn.nextElementSibling;
        const icon = btn.querySelector('.faq-icon');
        const isOpen = answer.classList.contains('open');

        // Close all other open FAQ items
        document.querySelectorAll('.faq-ans.open').forEach(ans => {
          ans.classList.remove('open');
          const siblingIcon = ans.previousElementSibling.querySelector('.faq-icon');
          if (siblingIcon) siblingIcon.style.transform = 'rotate(0deg)';
        });

        if (!isOpen) {
          answer.classList.add('open');
          if (icon) icon.style.transform = 'rotate(180deg)';
          playUiSound(750, 0.06);
        } else {
          playUiSound(550, 0.06);
        }
      });
    });
  }

  // ─── 6. AMBIENT PARTICLES CANVAS ─────────────────────────────────────────
  function initAmbientParticles() {
    const canvas = document.getElementById('bgParticles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Create background floating glowing particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '#f43f5e' : '#c084fc',
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ─── 7. SCROLL REVEAL OBSERVER ─────────────────────────────────────────
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // ─── 8. DOM READY INITIALIZATION ─────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    setupSoundToggle();
    renderRoster();
    setupRosterControls();
    setupNavigation();
    setupFaqAccordion();
    initAmbientParticles();
    initScrollReveal();

    // Attach UI audio feedback to all interactive buttons
    document.querySelectorAll('.btn, .nav-link, .filter-tab').forEach(el => {
      el.addEventListener('click', () => playUiSound(720, 0.05));
    });
  });

})();
