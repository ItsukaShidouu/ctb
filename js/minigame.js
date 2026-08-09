/* ==========================================================================
   NESSID [NSD] — OSU!CATCH MINI-GAME ENGINE
   Official Arcade Simulator — Touch, Mouse, and Keyboard Engine
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const gameOverlay = document.getElementById('gameOverlay');
    const gameStartBtn = document.getElementById('gameStartBtn');
    const gameResetBtn = document.getElementById('gameResetBtn');
    const overlayStartBtn = document.getElementById('overlayStartBtn');

    const scoreEl = document.getElementById('gameScore');
    const comboEl = document.getElementById('gameCombo');
    const accEl = document.getElementById('gameAcc');
    const highScoreEl = document.getElementById('gameHighScore');

    let gameRunning = false;
    let score = 0;
    let combo = 0;
    let caughtCount = 0;
    let totalFruits = 0;
    let highScore = localStorage.getItem('nessid_ctb_highscore') || 0;
    if (highScoreEl) highScoreEl.innerText = Number(highScore).toLocaleString();

    let catcher = {
      x: 0,
      y: 0,
      width: 90,
      height: 16,
      speed: 12,
      dashSpeed: 22,
      isDashing: false
    };

    let fruits = [];
    let gameParticles = [];
    let floatingTexts = [];
    let fruitSpawnTimer = 0;
    let keys = {};

    // Dynamic Canvas Resizing for Desktop & Mobile
    function fitCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || 800;
      canvas.height = rect.height || 450;
      catcher.y = canvas.height - 35;

      if (canvas.width < 500) {
        catcher.width = 80;
      } else {
        catcher.width = 95;
      }

      if (!gameRunning) {
        catcher.x = canvas.width / 2 - catcher.width / 2;
      }
    }
    window.addEventListener('resize', fitCanvas);
    fitCanvas();

    // Desktop Keyboard Controls
    window.addEventListener('keydown', e => {
      keys[e.key] = true;
      if (e.key === 'Shift') catcher.isDashing = true;
    });
    window.addEventListener('keyup', e => {
      keys[e.key] = false;
      if (e.key === 'Shift') catcher.isDashing = false;
    });

    // Mouse Move Controls
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      catcher.x = (e.clientX - rect.left) - catcher.width / 2;
    });

    // Touch Controls (Mobile Phones & Tablets)
    function handleTouch(e) {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        catcher.x = touchX - catcher.width / 2;
      }
    }

    canvas.addEventListener('touchstart', (e) => {
      if (gameRunning) e.preventDefault();
      handleTouch(e);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      if (gameRunning) e.preventDefault();
      handleTouch(e);
    }, { passive: false });

    // Spawn Fruits with varying points and pitch
    function spawnFruit() {
      const types = [
        { emoji: '🍓', points: 300, color: '#f43f5e', freq: 620 },
        { emoji: '🍎', points: 300, color: '#ef4444', freq: 580 },
        { emoji: '🍊', points: 100, color: '#f97316', freq: 520 },
        { emoji: '🍌', points: 500, color: '#eab308', freq: 780 },
        { emoji: '🫐', points: 200, color: '#6366f1', freq: 680 },
        { emoji: '⭐', points: 1000, color: '#fbbf24', freq: 1040, isSpecial: true }
      ];

      // Weight selection: star fruit is rare (10% chance)
      let type;
      if (Math.random() < 0.1) {
        type = types[5]; // ⭐ Star fruit
      } else {
        type = types[Math.floor(Math.random() * 5)];
      }

      fruits.push({
        x: Math.random() * (canvas.width - 50) + 25,
        y: -30,
        speed: Math.random() * 2.5 + 3.5,
        ...type
      });
      totalFruits++;
    }

    // Sparkle Explosions & Floating Text
    function createCatchExplosion(x, y, color, text) {
      for (let i = 0; i < 12; i++) {
        gameParticles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 9,
          vy: (Math.random() - 0.5) * 9 - 2,
          radius: Math.random() * 3 + 2,
          color: color,
          alpha: 1,
          life: 28
        });
      }
      floatingTexts.push({
        x: x,
        y: y - 12,
        text: text,
        color: color,
        alpha: 1,
        vy: -1.6
      });
    }

    // Main Game Physics Loop
    function updateGame() {
      if (!gameRunning) return;

      // Keyboard movement
      const currentSpeed = (keys['Shift'] || catcher.isDashing) ? catcher.dashSpeed : catcher.speed;
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) catcher.x -= currentSpeed;
      if (keys['ArrowRight'] || keys['d'] || keys['D']) catcher.x += currentSpeed;

      // Clamp inside canvas bounds
      if (catcher.x < 0) catcher.x = 0;
      if (catcher.x + catcher.width > canvas.width) catcher.x = canvas.width - catcher.width;

      // Fruit spawn timer
      fruitSpawnTimer++;
      if (fruitSpawnTimer > 32) {
        spawnFruit();
        fruitSpawnTimer = 0;
      }

      // Update falling fruits
      for (let i = fruits.length - 1; i >= 0; i--) {
        let f = fruits[i];
        f.y += f.speed;

        // Catch Collision Detection
        if (
          f.y + 16 >= catcher.y &&
          f.y - 16 <= catcher.y + catcher.height &&
          f.x >= catcher.x - 12 &&
          f.x <= catcher.x + catcher.width + 12
        ) {
          const comboBonus = Math.min(combo * 15, 500);
          const pts = f.points + comboBonus;
          score += pts;
          combo++;
          caughtCount++;

          // Audio sound feedback
          if (typeof window.playUiSound === 'function') {
            const pitch = f.freq + Math.min(combo * 10, 400);
            window.playUiSound(pitch, 0.09, f.isSpecial ? 'triangle' : 'sine');
          }

          createCatchExplosion(f.x, f.y, f.color, `+${pts}`);
          fruits.splice(i, 1);
          continue;
        }

        // Missed fruit check
        if (f.y > canvas.height + 25) {
          combo = 0;
          fruits.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = gameParticles.length - 1; i >= 0; i--) {
        let p = gameParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 1 / p.life;
        if (p.alpha <= 0) gameParticles.splice(i, 1);
      }

      // Update Floating Text Labels
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let t = floatingTexts[i];
        t.y += t.vy;
        t.alpha -= 0.035;
        if (t.alpha <= 0) floatingTexts.splice(i, 1);
      }

      // Update Scoreboard DOM Elements
      if (scoreEl) scoreEl.innerText = score.toLocaleString('en-US').padStart(7, '0');
      if (comboEl) comboEl.innerText = combo + 'x';
      const acc = totalFruits > 0 ? ((caughtCount / totalFruits) * 100).toFixed(1) : '100.0';
      if (accEl) accEl.innerText = acc + '%';

      if (score > highScore) {
        highScore = score;
        localStorage.setItem('nessid_ctb_highscore', highScore);
        if (highScoreEl) highScoreEl.innerText = Number(highScore).toLocaleString();
      }
    }

    // Canvas Render Frame
    function renderGame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid background pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      if (gameRunning) {
        // Draw Catcher Plate
        const glowColor = (keys['Shift'] || catcher.isDashing) ? '#c084fc' : '#f43f5e';
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 18;

        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.roundRect(catcher.x, catcher.y, catcher.width, catcher.height, 8);
        ctx.fill();

        // Catcher plate indicator line
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(catcher.x + catcher.width / 2 - 3, catcher.y - 4, 6, 8);
        ctx.shadowBlur = 0;

        // Draw Fruits
        ctx.font = '26px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        fruits.forEach(f => {
          ctx.fillText(f.emoji, f.x, f.y);
        });

        // Render Burst Particles
        gameParticles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        });

        // Render Floating Score Texts
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        floatingTexts.forEach(t => {
          ctx.fillStyle = t.color;
          ctx.globalAlpha = t.alpha;
          ctx.fillText(t.text, t.x, t.y);
        });
        ctx.globalAlpha = 1;
      }
    }

    function gameLoop() {
      updateGame();
      renderGame();
      requestAnimationFrame(gameLoop);
    }

    function startGame() {
      fitCanvas();
      gameRunning = true;
      score = 0;
      combo = 0;
      caughtCount = 0;
      totalFruits = 0;
      fruits = [];
      gameParticles = [];
      floatingTexts = [];
      if (gameOverlay) gameOverlay.classList.add('hidden');
      if (typeof window.playUiSound === 'function') window.playUiSound(880, 0.12, 'triangle');
    }

    function resetGame() {
      gameRunning = false;
      score = 0;
      combo = 0;
      caughtCount = 0;
      totalFruits = 0;
      fruits = [];
      gameParticles = [];
      floatingTexts = [];
      if (scoreEl) scoreEl.innerText = '000,000';
      if (comboEl) comboEl.innerText = '0x';
      if (accEl) accEl.innerText = '100.0%';
      if (gameOverlay) gameOverlay.classList.remove('hidden');
      if (typeof window.playUiSound === 'function') window.playUiSound(440, 0.1, 'sine');
    }

    if (gameStartBtn) gameStartBtn.addEventListener('click', startGame);
    if (overlayStartBtn) overlayStartBtn.addEventListener('click', startGame);
    if (gameResetBtn) gameResetBtn.addEventListener('click', resetGame);

    requestAnimationFrame(gameLoop);
  });

})();
