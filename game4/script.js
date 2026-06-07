/* ========================================================
   🧁 Flappy Cupcake: Birthday Edition — Game Logic
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ——————————————————————————————————————————————————————
  // 1. WEB AUDIO API SYNTHESIZER & MELODY BGM
  // ——————————————————————————————————————————————————————
  let audioCtx = null;
  let bgmInterval = null;
  let isMusicOn = false;

  // Fast, bubbly chiptune melody in C major pentatonic scale (unique to Game 4)
  const bgmMelody = [
    261.63, 293.66, 329.63, 392.00, 523.25, 392.00, 329.63, 293.66,
    392.00, 392.00, 523.25, 523.25, 659.25, 523.25, 392.00, 329.63
  ];
  let melodyIdx = 0;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playMelodyNote() {
    if (!audioCtx || audioCtx.state === 'suspended' || !isMusicOn) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'square'; // 8-bit retro arcade vibes
    const freq = bgmMelody[melodyIdx];
    osc.frequency.setValueAtTime(freq, now);
    
    gainNode.gain.setValueAtTime(0.015, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    
    osc.start(now);
    osc.stop(now + 0.22);
    
    melodyIdx = (melodyIdx + 1) % bgmMelody.length;
  }

  function startBgm() {
    isMusicOn = true;
    if (bgmInterval) clearInterval(bgmInterval);
    bgmInterval = setInterval(playMelodyNote, 400);
    document.getElementById('btn-music-toggle').querySelector('span').innerText = '🎵 Music: On';
  }

  function stopBgm() {
    isMusicOn = false;
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
    document.getElementById('btn-music-toggle').querySelector('span').innerText = '🔇 Music: Off';
  }

  function playJumpSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.12);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
    
    osc.start(now);
    osc.stop(now + 0.13);
  }

  function playPointSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const notes = [523.25, 783.99, 1046.50]; // C5, G5, C6
    
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'triangle';
      const startTime = now + idx * 0.06;
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.2);
      
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  function playCollisionSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.4);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    
    osc.start(now);
    osc.stop(now + 0.43);
  }

  function playVictoryFanfare() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];

    notes.forEach((freq, idx) => {
      const oscNode = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      oscNode.connect(gain);
      gain.connect(audioCtx.destination);

      oscNode.type = 'sine';
      oscNode.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.14, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.002, now + idx * 0.05 + 0.45);

      oscNode.start(now + idx * 0.05);
      oscNode.stop(now + idx * 0.05 + 0.5);
    });
  }

  // ——————————————————————————————————————————————————————
  // 2. CANVAS & PHYSICS SETUP
  // ——————————————————————————————————————————————————————
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const board = document.getElementById('board-container');
  const scoreVal = document.getElementById('current-score');
  const bestVal = document.getElementById('best-score');
  const tapOverlay = document.getElementById('tap-to-flap-overlay');

  const startScreen = document.getElementById('start-screen');
  const gameoverScreen = document.getElementById('gameover-screen');
  const gameoverTitle = document.getElementById('gameover-title');
  const gameoverSubtitle = document.getElementById('gameover-subtitle');
  const gameoverIcon = document.getElementById('gameover-icon');
  const finalScoreVal = document.getElementById('final-score');
  const victoryScroll = document.getElementById('victory-message-box');

  const btnStart = document.getElementById('btn-start-game');
  const btnRestartHud = document.getElementById('btn-restart-hud');
  const btnReplay = document.getElementById('btn-replay-game');
  const btnMusicToggle = document.getElementById('btn-music-toggle');

  let score = 0;
  let bestScore = parseInt(localStorage.getItem('laiba_flappy_best') || '0');
  bestVal.innerText = bestScore;

  let isPlaying = false;
  let isGameOver = false;
  let hasWon = false;

  // Physics constraints
  let gravity = 0.35;
  let velocity = 0;
  let lift = -5.8;
  let cupcakeY = 200;
  let cupcakeX = 60;
  let cupcakeSize = 34; // Width & height bounding

  // Obstacles
  let pipes = [];
  const pipeWidth = 52;
  const pipeGap = 135;
  const pipeSpeed = 2.2;
  let pipeSpawnTimer = 0;

  // Background falling petals
  let petals = [];
  let cupcakeTrail = [];

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = board.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }

  // ——————————————————————————————————————————————————————
  // 3. GAME RUNNING LOOP
  // ——————————————————————————————————————————————————————

  function gameLoop() {
    if (!isPlaying && !isGameOver) return;

    updatePhysics();
    drawFrame();

    if (!isGameOver) {
      requestAnimationFrame(gameLoop);
    }
  }

  function updatePhysics() {
    // Gravitational pull
    velocity += gravity;
    cupcakeY += velocity;

    // Floor & Ceiling collision
    const logicalHeight = canvas.height / (window.devicePixelRatio || 1);
    if (cupcakeY > logicalHeight - cupcakeSize - 10) {
      cupcakeY = logicalHeight - cupcakeSize - 10;
      triggerGameOver();
    }
    if (cupcakeY < 10) {
      cupcakeY = 10;
      velocity = 0;
    }

    // Spawn cookie pipes
    pipeSpawnTimer++;
    if (pipeSpawnTimer > 95) {
      pipeSpawnTimer = 0;
      spawnPipe();
    }

    // Move cookie pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i];
      p.x -= pipeSpeed;

      // Collision Check
      if (
        cupcakeX + cupcakeSize - 5 > p.x &&
        cupcakeX + 5 < p.x + pipeWidth
      ) {
        if (cupcakeY + 5 < p.top || cupcakeY + cupcakeSize - 5 > p.bottom) {
          triggerGameOver();
        }
      }

      // Add points when passed
      if (!p.passed && p.x + pipeWidth < cupcakeX) {
        p.passed = true;
        score++;
        scoreVal.innerText = score;
        playPointSound();

        // Save best score
        if (score > bestScore) {
          bestScore = score;
          bestVal.innerText = bestScore;
          localStorage.setItem('laiba_flappy_best', bestScore);
        }

        // Victory Target is 8 points
        if (score === 8 && !hasWon) {
          hasWon = true;
          playVictoryFanfare();
        }
      }

      // Delete offscreen pipes
      if (p.x + pipeWidth < -10) {
        pipes.splice(i, 1);
      }
    }

    // Update background petals drift
    if (!prefersReducedMotion) {
      if (Math.random() < 0.08) {
        petals.push({
          x: Math.random() * (canvas.width / (window.devicePixelRatio || 1)),
          y: -20,
          size: Math.random() * 8 + 6,
          speedY: Math.random() * 1.2 + 0.8,
          speedX: Math.random() * 0.8 - 0.4,
          rot: Math.random() * 360,
          rotSpeed: Math.random() * 2 - 1
        });
      }

      for (let i = petals.length - 1; i >= 0; i--) {
        const pt = petals[i];
        pt.y += pt.speedY;
        pt.x += pt.speedX;
        pt.rot += pt.rotSpeed;

        if (pt.y > logicalHeight + 20) {
          petals.splice(i, 1);
        }
      }

      // Add cupcake flight trail sparks
      if (isPlaying && !isGameOver) {
        cupcakeTrail.push({
          x: cupcakeX + cupcakeSize / 4,
          y: cupcakeY + cupcakeSize / 2 + Math.random() * 8 - 4,
          size: Math.random() * 5 + 3,
          color: ['#FFB7C5', '#FFD1DC', '#FCE1CE', '#FFF'][Math.floor(Math.random() * 4)],
          alpha: 1,
          type: Math.random() < 0.45 ? 'heart' : 'sparkle'
        });
      }

      // Update trail particles
      for (let i = cupcakeTrail.length - 1; i >= 0; i--) {
        const pt = cupcakeTrail[i];
        pt.x -= 2.0; // move backward relative to flight
        pt.alpha -= 0.045;
        pt.size -= 0.06;
        if (pt.alpha <= 0 || pt.size <= 0) {
          cupcakeTrail.splice(i, 1);
        }
      }
    }
  }

  function spawnPipe() {
    const logicalHeight = canvas.height / (window.devicePixelRatio || 1);
    const minHeight = 60;
    const maxHeight = logicalHeight - pipeGap - minHeight;
    const pipeTopHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    pipes.push({
      x: canvas.width / (window.devicePixelRatio || 1),
      top: pipeTopHeight,
      bottom: pipeTopHeight + pipeGap,
      passed: false
    });
  }

  // Draw cookie barriers and cupcake on canvas
  function drawFrame() {
    const logicalWidth = canvas.width / (window.devicePixelRatio || 1);
    const logicalHeight = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    // 1. Draw drifting background petals
    if (!prefersReducedMotion) {
      ctx.fillStyle = 'rgba(255, 183, 197, 0.45)';
      petals.forEach(pt => {
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate((pt.rot * Math.PI) / 180);
        
        ctx.beginPath();
        // Draw heart/drop shape
        ctx.ellipse(0, 0, pt.size, pt.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
    }

    // 2. Draw cookie columns
    pipes.forEach(p => {
      ctx.save();

      // Setup Cookie Gradient Styling
      const cookieGrad = ctx.createLinearGradient(p.x, 0, p.x + pipeWidth, 0);
      cookieGrad.addColorStop(0, '#C68B59');
      cookieGrad.addColorStop(0.5, '#E5BA73');
      cookieGrad.addColorStop(1, '#A05C2C');

      ctx.fillStyle = cookieGrad;
      ctx.strokeStyle = '#5a2e37';
      ctx.lineWidth = 2;

      // Draw Top Pipe Column
      drawRoundedRect(p.x, 0, pipeWidth, p.top, 8);
      // Top Pipe Cap
      ctx.fillStyle = '#A05C2C';
      drawRoundedRect(p.x - 3, p.top - 20, pipeWidth + 6, 20, 4);
      // Chocolate Chips detailing
      ctx.fillStyle = '#4A2711';
      ctx.beginPath();
      ctx.arc(p.x + 15, p.top / 3, 4, 0, Math.PI * 2);
      ctx.arc(p.x + 35, (p.top * 2) / 3, 5, 0, Math.PI * 2);
      ctx.arc(p.x + 20, p.top - 40, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw Bottom Pipe Column
      ctx.fillStyle = cookieGrad;
      drawRoundedRect(p.x, p.bottom, pipeWidth, logicalHeight - p.bottom, 8);
      // Bottom Pipe Cap
      ctx.fillStyle = '#A05C2C';
      drawRoundedRect(p.x - 3, p.bottom, pipeWidth + 6, 20, 4);
      // Chocolate Chips detailing
      ctx.fillStyle = '#4A2711';
      ctx.beginPath();
      ctx.arc(p.x + 15, p.bottom + 40, 5, 0, Math.PI * 2);
      ctx.arc(p.x + 38, p.bottom + (logicalHeight - p.bottom) / 2, 4, 0, Math.PI * 2);
      ctx.arc(p.x + 22, logicalHeight - 40, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 3. Draw Floor Layer
    ctx.fillStyle = '#FFF5F6';
    ctx.strokeStyle = 'rgba(255, 183, 197, 0.4)';
    ctx.lineWidth = 3;
    ctx.fillRect(0, logicalHeight - 10, logicalWidth, 10);
    ctx.beginPath();
    ctx.moveTo(0, logicalHeight - 10);
    ctx.lineTo(logicalWidth, logicalHeight - 10);
    ctx.stroke();

    // Draw cupcake flight trail sparks
    if (!prefersReducedMotion) {
      cupcakeTrail.forEach(pt => {
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        
        ctx.beginPath();
        if (pt.type === 'heart') {
          // Draw a tiny heart shape on the canvas!
          const size = pt.size;
          ctx.translate(pt.x, pt.y);
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-size/2, -size/2, -size, size/3, 0, size);
          ctx.bezierCurveTo(size, size/3, size/2, -size/2, 0, 0);
        } else {
          // Draw a tiny star/sparkle shape on the canvas
          const size = pt.size;
          ctx.arc(pt.x, pt.y, size/2, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
      });
    }

    // 4. Draw flying Cupcake player (Emoji center)
    ctx.save();
    ctx.translate(cupcakeX + cupcakeSize / 2, cupcakeY + cupcakeSize / 2);
    // Tilt based on velocity to simulate realistic flap angle
    let angle = Math.min(Math.max(-0.4, velocity * 0.08), 0.7);
    ctx.rotate(angle);

    ctx.font = `${cupcakeSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧁', 0, 0);

    ctx.restore();
  }

  function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // ——————————————————————————————————————————————————————
  // 4. PHYSICS FLAP CONTROL & LAUNCH ACTIONS
  // ——————————————————————————————————————————————————————

  function flap() {
    if (!isPlaying && !isGameOver) {
      // First click/tap starts the game and clears indicator overlay
      isPlaying = true;
      tapOverlay.classList.add('hidden');
      gameLoop();
    }
    
    if (isPlaying && !isGameOver) {
      playJumpSound();
      velocity = lift;
    }
  }

  // Listeners coordinates
  canvas.addEventListener('mousedown', (e) => {
    initAudio();
    flap();
    e.preventDefault();
  });

  canvas.addEventListener('touchstart', (e) => {
    initAudio();
    flap();
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'ArrowUp') {
      initAudio();
      flap();
      e.preventDefault();
    }
  });

  // ——————————————————————————————————————————————————————
  // 5. GAME OVER & VICTORY REWARDS
  // ——————————————————————————————————————————————————————

  function triggerGameOver() {
    playCollisionSound();
    isPlaying = false;
    isGameOver = true;
    stopBgm();

    // Configure overlay screen based on score victory
    setTimeout(() => {
      finalScoreVal.innerText = score;

      if (score >= 8 || hasWon) {
        // Victory!
        gameoverTitle.innerText = "Surprise Unlocked! 💖";
        gameoverTitle.style.color = "var(--rose-deep)";
        gameoverSubtitle.innerText = "Laiba is a master flyer!";
        gameoverIcon.innerText = "🏆✨";
        victoryScroll.classList.remove('hidden');
        if (!prefersReducedMotion) {
          triggerHeartsShower();
        }
      } else {
        // Normal gameover
        gameoverTitle.innerText = "Game Over";
        gameoverTitle.style.color = "var(--rose-dark)";
        gameoverSubtitle.innerText = "Cupcake hit an obstacle!";
        gameoverIcon.innerText = "🧁💥";
        victoryScroll.classList.add('hidden');
      }

      gameoverScreen.classList.remove('hidden');
    }, 450);
  }

  function triggerHeartsShower() {
    const count = 18;
    const EMOJIS = ['💖', '🌸', '✨', '💕', '🧁', '🍩', '🍬'];
    
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      el.style.position = 'absolute';
      el.style.fontSize = `${Math.random() * 1.5 + 1.2}rem`;
      el.style.left = `${Math.random() * 90 + 5}%`;
      el.style.top = `${Math.random() * 80 + 10}%`;
      el.style.transform = `scale(0) rotate(${Math.random() * 360}deg)`;
      el.style.transition = 'all 1.5s cubic-bezier(0.1, 0.8, 0.3, 1)';
      el.style.pointerEvents = 'none';
      el.style.zIndex = 60;
      
      document.getElementById('gameover-card').appendChild(el);

      requestAnimationFrame(() => {
        el.style.transform = `scale(1) translateY(-100px) rotate(${Math.random() * 720 - 360}deg)`;
        el.style.opacity = '0';
      });

      setTimeout(() => el.remove(), 1500);
    }
  }

  function resetGame() {
    initAudio();
    score = 0;
    scoreVal.innerText = '0';
    isGameOver = false;
    hasWon = false;
    velocity = 0;
    
    const logicalHeight = canvas.height / (window.devicePixelRatio || 1);
    cupcakeY = logicalHeight / 2 - cupcakeSize / 2;
    pipes = [];
    petals = [];
    cupcakeTrail = [];
    pipeSpawnTimer = 0;

    startScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    tapOverlay.classList.remove('hidden');

    // Draw initial static frame
    drawFrame();
    
    startBgm();
  }

  // Window resize dynamics
  window.addEventListener('resize', () => {
    resizeCanvas();
    drawFrame();
  });

  // Helper to attach click and touchstart events to buttons
  function setupButton(btn, callback) {
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      initAudio();
      callback(e);
    });
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      initAudio();
      callback(e);
    }, { passive: false });
  }

  setupButton(btnStart, () => {
    resizeCanvas();
    resetGame();
  });
  setupButton(btnRestartHud, () => {
    resizeCanvas();
    resetGame();
  });
  setupButton(btnReplay, () => {
    resizeCanvas();
    resetGame();
  });

  setupButton(btnMusicToggle, () => {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (isMusicOn) {
      stopBgm();
    } else {
      startBgm();
    }
  });

  // Perform initial canvas sizing
  resizeCanvas();
});
