/* ========================================================
   🍭 Sweet 2048: Birthday Cupcake Edition — Game Logic
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ——————————————————————————————————————————————————————
  // 1. CHIME SYNTHESIZER (WEB AUDIO API)
  // ——————————————————————————————————————————————————————
  // Synthesizes sweet retro chimes and swooshes on-the-fly for lag-free chiptunes!
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Pentatonic & Major scale frequencies for satisfying merge arpeggios
  const CHIME_PITCHES = {
    4: 261.63,    // C4
    8: 293.66,    // D4
    16: 329.63,   // E4
    32: 392.00,   // G4
    64: 440.00,   // A4
    128: 523.25,  // C5
    256: 587.33,  // D5
    512: 659.25,  // E5
    1024: 783.99, // G5
    2048: 880.00  // A5
  };

  function playSlideSwoosh() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.03);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
    
    osc.start(now);
    osc.stop(now + 0.11);
  }

  function playMergeChime(val) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const freq1 = CHIME_PITCHES[val] || 523.25;
    const freq2 = freq1 * 1.25; // Happy 3rd interval

    // Overlapping double pop chimes
    [freq1, freq2].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.type = 'sine';
      const startTime = now + idx * 0.05;

      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.03, startTime + 0.08);

      gainNode.gain.setValueAtTime(idx === 0 ? 0.12 : 0.08, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  function playVictoryFanfare() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6

    notes.forEach((freq, idx) => {
      const oscNode = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      oscNode.connect(gain);
      gain.connect(audioCtx.destination);

      oscNode.type = 'sine';
      oscNode.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.14, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.002, now + idx * 0.06 + 0.5);

      oscNode.start(now + idx * 0.06);
      oscNode.stop(now + idx * 0.06 + 0.55);
    });
  }

  // Spawns flower/heart blossom particles around merged tile
  function spawnMergeParticles(tileEl) {
    if (prefersReducedMotion) return;
    const emojis = ['🌸', '✨', '💖', '🍬', '🍭'];
    const rect = tileEl.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    
    const x = rect.left - boardRect.left + rect.width / 2;
    const y = rect.top - boardRect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'merge-particle';
      p.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.3;
      const distance = Math.random() * 40 + 20;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const rot = Math.random() * 360 - 180;
      
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.setProperty('--dx', `${dx}px`);
      p.style.setProperty('--dy', `${dy}px`);
      p.style.setProperty('--rot', `${rot}deg`);
      
      board.appendChild(p);
      setTimeout(() => p.remove(), 800);
    }
  }

  // ——————————————————————————————————————————————————————
  // 2. 2048 DATA ENGINE & TILE SETUP
  // ——————————————————————————————————————————————————————
  const tileContainer = document.getElementById('tile-container');
  const scoreVal = document.getElementById('current-score');
  const bestVal = document.getElementById('best-score');
  const board = document.getElementById('board-container');

  const startScreen = document.getElementById('start-screen');
  const victoryScreen = document.getElementById('victory-screen');

  const btnStart = document.getElementById('btn-start-game');
  const btnReplay = document.getElementById('btn-replay-game');
  const btnContinue = document.getElementById('btn-continue-game');
  const btnBake = document.getElementById('btn-magic-bake');
  const btnRestartHud = document.getElementById('btn-restart-hud');
  const btnMusicToggle = document.getElementById('btn-music-toggle');

  let bgmInterval = null;
  let isMusicOn = false;

  // Unique C major sweet lullaby chiptune theme
  const bgmMelody = [
    261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 440.00, 349.23,
    329.63, 392.00, 523.25, 392.00, 349.23, 293.66, 261.63, 392.00
  ];
  let melodyIdx = 0;

  function playMelodyNote() {
    if (!audioCtx || audioCtx.state === 'suspended' || !isMusicOn) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const vibrato = audioCtx.createOscillator();
    const vibratoGain = audioCtx.createGain();
    const gainNode = audioCtx.createGain();
    
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'triangle'; // Sweet warm flute-like chiptune
    const freq = bgmMelody[melodyIdx];
    osc.frequency.setValueAtTime(freq, now);
    
    vibrato.type = 'sine';
    vibrato.frequency.setValueAtTime(4, now); // 4Hz slow sweet vibrato
    vibratoGain.gain.setValueAtTime(freq * 0.015, now);
    
    gainNode.gain.setValueAtTime(0.05, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
    
    vibrato.start(now);
    osc.start(now);
    
    vibrato.stop(now + 0.7);
    osc.stop(now + 0.7);
    
    melodyIdx = (melodyIdx + 1) % bgmMelody.length;
  }

  function startBgm() {
    isMusicOn = true;
    if (bgmInterval) clearInterval(bgmInterval);
    bgmInterval = setInterval(playMelodyNote, 500);
    btnMusicToggle.querySelector('span').innerText = '🎵 Music: On';
  }

  function stopBgm() {
    isMusicOn = false;
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
    btnMusicToggle.querySelector('span').innerText = '🔇 Music: Off';
  }

  let grid = Array(4).fill(null).map(() => Array(4).fill(null));
  let score = 0;
  let bestScore = parseInt(localStorage.getItem('laiba_2048_best') || '0');
  let isPlaying = false;
  let nextTileId = 0;
  let hasWon = false;
  let endlessMode = false;

  bestVal.innerText = bestScore;

  const TILE_CONFIGS = {
    2: { char: '🍬', name: 'Candy' },
    4: { char: '🍭', name: 'Lollipop' },
    8: { char: '🍪', name: 'Cookie' },
    16: { char: '🍩', name: 'Donut' },
    32: { char: '🧁', name: 'Cupcake' },
    64: { char: '🍰', name: 'Shortcake' },
    128: { char: '🍮', name: 'Custard' },
    256: { char: '🍨', name: 'Ice Cream' },
    512: { char: '🍫', name: 'Choco Bar' },
    1024: { char: '🎂', name: 'Cake' },
    2048: { char: '👑🍰', name: 'Golden Cake' }
  };

  class Tile {
    constructor(row, col, value) {
      this.row = row;
      this.col = col;
      this.value = value;
      this.id = nextTileId++;
      this.mergedInto = null;

      // Create structural DOM element representing the tile
      const el = document.createElement('div');
      el.className = `tile tile-${value} tile-pos-${row}-${col}`;
      
      const config = TILE_CONFIGS[value] || { char: '🍬', name: 'Candy' };
      el.innerHTML = `
        <div class="tile-inner">
          <span class="tile-emoji">${config.char}</span>
          <span class="tile-number">${value}</span>
        </div>
      `;

      this.el = el;
      tileContainer.appendChild(el);
    }

    updatePosition(row, col) {
      // Remove old coordinates and apply new index coordinates
      this.el.className = this.el.className.replace(/tile-pos-\d-\d/, `tile-pos-${row}-${col}`);
      this.row = row;
      this.col = col;
    }

    updateValue(value) {
      this.value = value;
      this.el.className = this.el.className.replace(/tile-\d+/, `tile-${value}`);
      
      const config = TILE_CONFIGS[value] || { char: '🍬', name: 'Candy' };
      this.el.innerHTML = `
        <div class="tile-inner">
          <span class="tile-emoji">${config.char}</span>
          <span class="tile-number">${value}</span>
        </div>
      `;
    }

    remove() {
      // Small timeout to allow slide translation to complete before removing element
      const element = this.el;
      setTimeout(() => element.remove(), 120);
    }
  }

  // ——————————————————————————————————————————————————————
  // 3. KEYBOARD & SWIPE DIRECTORS
  // ——————————————————————————————————————————————————————

  // Handle Desktop Keyboard slides (Arrow keys + WASD keys)
  window.addEventListener('keydown', (e) => {
    if (!isPlaying) return;

    let moved = false;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        moved = slide('up');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        moved = slide('down');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        moved = slide('left');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        moved = slide('right');
        break;
      default:
        return;
    }

    if (moved) {
      playSlideSwoosh();
      e.preventDefault();
      setTimeout(spawnRandomTile, 130);
    }
  });

  // Handle Mobile Touch Swiping gestures (Zero-lag swipes)
  let touchStartX = 0;
  let touchStartY = 0;

  board.addEventListener('touchstart', (e) => {
    if (!isPlaying) return;
    if (e.touches && e.touches[0]) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      e.preventDefault(); // Lock page scrolling while swiping
    }
  }, { passive: false });

  board.addEventListener('touchend', (e) => {
    if (!isPlaying) return;
    if (!e.changedTouches || !e.changedTouches[0]) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;

    const minSwipeDistance = 35; // Pixels
    let moved = false;

    // Detect direction based on absolute pixel travel axis
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        moved = deltaX > 0 ? slide('right') : slide('left');
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        moved = deltaY > 0 ? slide('down') : slide('up');
      }
    }

    if (moved) {
      playSlideSwoosh();
      e.preventDefault();
      setTimeout(spawnRandomTile, 130);
    }
  }, { passive: false });

  // ——————————————————————————————————————————————————————
  // 4. CORE 2048 SLIDING & MERGING ALGORITHM
  // ——————————————————————————————————————————————————————

  function getVector(dir) {
    const vectors = {
      up: { r: -1, c: 0 },
      down: { r: 1, c: 0 },
      left: { r: 0, c: -1 },
      right: { r: 0, c: 1 }
    };
    return vectors[dir];
  }

  function buildTraversalOrder(vector) {
    const rows = [0, 1, 2, 3];
    const cols = [0, 1, 2, 3];

    // Traverse board opposite of motion direction to avoid double shifts
    if (vector.r === 1) rows.reverse();
    if (vector.c === 1) cols.reverse();

    return { rows, cols };
  }

  function slide(dir) {
    const vector = getVector(dir);
    const order = buildTraversalOrder(vector);
    let moved = false;

    // Clear merge flags and visual merged classes
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c]) {
          grid[r][c].mergedInto = null;
          grid[r][c].el.classList.remove('merged');
        }
      }
    }

    // Traverse grid and translate tiles
    order.rows.forEach(r => {
      order.cols.forEach(c => {
        const tile = grid[r][c];
        if (!tile) return;

        // Trace position in vector direction until obstacle hit
        let nextRow = r;
        let nextCol = c;
        let merged = false;
        
        while (true) {
          const checkRow = nextRow + vector.r;
          const checkCol = nextCol + vector.c;

          // Hit border wall
          if (checkRow < 0 || checkRow > 3 || checkCol < 0 || checkCol > 3) break;

          const obstacle = grid[checkRow][checkCol];
          if (obstacle) {
            // Found a tile! Check if values match and can merge
            if (obstacle.value === tile.value && !obstacle.mergedInto) {
              // Merge!
              tile.updatePosition(checkRow, checkCol);
              
              const newValue = tile.value * 2;
              obstacle.updateValue(newValue);
              obstacle.mergedInto = true;
              obstacle.el.classList.add('merged');
              
              // Chime note synthesized based on merged value
              playMergeChime(newValue);
              spawnMergeParticles(obstacle.el);

              // Update Score
              score += newValue;
              scoreVal.innerText = score;
              if (score > bestScore) {
                bestScore = score;
                bestVal.innerText = bestScore;
                localStorage.setItem('laiba_2048_best', bestScore);
              }

              // Remove sliding source tile
              tile.remove();
              grid[r][c] = null;
              moved = true;
              merged = true;

              // Check victory target (Goal is 256 tile!)
              if (newValue === 256 && !hasWon && !endlessMode) {
                hasWon = true;
                setTimeout(triggerVictory, 300);
              }
            }
            break;
          }

          // Position is empty, keep moving
          nextRow = checkRow;
          nextCol = checkCol;
        }

        // Standard slide shift to empty coordinate
        if (!merged && (nextRow !== r || nextCol !== c)) {
          grid[nextRow][nextCol] = tile;
          grid[r][c] = null;
          tile.updatePosition(nextRow, nextCol);
          moved = true;
        }
      });
    });

    return moved;
  }

  // ——————————————————————————————————————————————————————
  // 5. TILE SPAWNERS & GENERATORS
  // ——————————————————————————————————————————————————————

  function getEmptySlots() {
    const slots = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!grid[r][c]) {
          slots.push({ r, c });
        }
      }
    }
    return slots;
  }

  function spawnRandomTile() {
    if (!isPlaying) return;

    const slots = getEmptySlots();
    if (slots.length === 0) return;

    const pick = slots[Math.floor(Math.random() * slots.length)];
    // 90% chance Sweet Candy (2), 10% chance Lollipop (4)
    const value = Math.random() < 0.9 ? 2 : 4;

    grid[pick.r][pick.c] = new Tile(pick.r, pick.c, value);

    // After spawning, check if game is locked (no moves left)
    if (slots.length === 1) {
      checkGameOver();
    }
  }

  function checkGameOver() {
    const slots = getEmptySlots();
    if (slots.length > 0) return;

    // Check if any matching adjacent merges are still possible
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = grid[r][c].value;
        // Check down
        if (r < 3 && grid[r+1][c].value === val) return;
        // Check right
        if (c < 3 && grid[r][c+1].value === val) return;
      }
    }

    // Locked! Game over.
    isPlaying = false;
    setTimeout(() => {
      alert("No more matches available! Click Replay to try again! 🧁🌸");
    }, 450);
  }

  // Spawns cherry petals drifting down victory screen
  function triggerConfettiShower() {
    const confettiCount = 18;
    const SVG_PETAL_PATHS = [
      "M20,0 C30,10 40,25 25,40 C15,45 5,35 0,25 C0,15 10,0 20,0 Z",
      "M15,0 C25,5 35,20 25,35 C15,40 5,30 2,20 C-1,10 5,0 15,0 Z"
    ];

    for (let i = 0; i < confettiCount; i++) {
      const svgNamespace = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNamespace, "svg");
      svg.setAttribute("viewBox", "0 0 40 45");
      svg.classList.add("heart-sparkle");

      const pathElement = document.createElementNS(svgNamespace, "path");
      pathElement.setAttribute("d", SVG_PETAL_PATHS[Math.floor(Math.random() * SVG_PETAL_PATHS.length)]);

      const defs = document.createElementNS(svgNamespace, "defs");
      const linearGradient = document.createElementNS(svgNamespace, "linearGradient");
      const gradId = `victory-grad-${Math.random().toString(36).substr(2, 9)}`;
      linearGradient.setAttribute("id", gradId);

      const stop1 = document.createElementNS(svgNamespace, "stop");
      stop1.setAttribute("offset", "0%");
      stop1.setAttribute("stop-color", "#FFE3E7");

      const stop2 = document.createElementNS(svgNamespace, "stop");
      stop2.setAttribute("offset", "100%");
      stop2.setAttribute("stop-color", ["#FFB7C5", "#FFD1DC", "#FCE1CE"][Math.floor(Math.random() * 3)]);

      linearGradient.appendChild(stop1);
      linearGradient.appendChild(stop2);
      defs.appendChild(linearGradient);
      svg.appendChild(defs);

      pathElement.setAttribute("fill", `url(#${gradId})`);
      svg.appendChild(pathElement);

      const size = Math.random() * 16 + 12;
      svg.style.width = `${size}px`;
      svg.style.height = `${size * 1.1}px`;
      svg.style.left = `${Math.random() * 100}vw`;
      svg.style.top = `-40px`;
      
      victoryScreen.appendChild(svg);

      requestAnimationFrame(() => {
        svg.style.transition = `all ${Math.random() * 3.5 + 3.5}s linear`;
        svg.style.transform = `translate(${Math.random() * 100 - 50}px, ${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg)`;
        svg.style.opacity = '0.35';
      });

      setTimeout(() => svg.remove(), 7000);
    }
  }

  // ——————————————————————————————————————————————————————
  // 6. START & VICTORY CONTROLS
  // ——————————————————————————————————————————————————————

  function startGame() {
    initAudio();
    isPlaying = true;
    hasWon = false;
    endlessMode = false;
    startBgm();

    // Reset scores
    score = 0;
    scoreVal.innerText = '0';

    // Reset coupons sealed states
    document.querySelectorAll('.coupon-ticket').forEach(ticket => {
      ticket.setAttribute('data-opened', 'false');
    });

    // Clear board DOM & grid array
    tileContainer.innerHTML = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        grid[r][c] = null;
      }
    }

    // Hide overlays
    startScreen.classList.add('hidden');
    victoryScreen.classList.add('hidden');

    // Spawn 2 initial tiles to start!
    spawnRandomTile();
    spawnRandomTile();
  }

  function triggerVictory() {
    isPlaying = false;
    stopBgm();

    // Play synthesized fanfare arpeggio
    playVictoryFanfare();

    // Reveal Victory overlay scroll smoothly
    setTimeout(() => {
      victoryScreen.classList.remove('hidden');
      showSlide(0);

      // Trigger continuous victory blossom confettis
      if (!prefersReducedMotion) {
        triggerConfettiShower();
        const confettiInterval = setInterval(() => {
          if (victoryScreen.classList.contains('hidden')) {
            clearInterval(confettiInterval);
          } else {
            triggerConfettiShower();
          }
        }, 1800);
      }
    }, 600);
  }

  // ——————————————————————————————————————————————————————
  // 7. MAGIC BAKE AUTO-SOLVER HELPER (ZERO FRUSTRATION!)
  // ——————————————————————————————————————————————————————
  // Smoothly slides tiles, plays C major arpeggio chords, and merges tiles 
  // automatically up to the 512 Choco Bar tile to unlock wishes instantly!

  function triggerMagicBake() {
    if (!isPlaying) return;
    isPlaying = false; // Halt manual swipes during bake

    // Show visual baking effect!
    const btnSpan = btnBake.querySelector('span');
    btnSpan.innerHTML = "🧁 Baking... Arpeggiating notes... Chimes!";
    btnBake.style.pointerEvents = 'none';
    btnBake.style.opacity = '0.7';

    // Clear board and play ascending C major scale slides
    tileContainer.innerHTML = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        grid[r][c] = null;
      }
    }

    const bakeSteps = [2, 4, 8, 16, 32, 64, 128, 256];
    let stepIdx = 0;

    function runBakeStep() {
      if (stepIdx >= bakeSteps.length) {
        // Bake complete! Victory cascade trigger.
        setTimeout(() => {
          hasWon = true;
          triggerVictory();
          btnSpan.innerHTML = "🌸 Magic Bake (Auto-Solve)";
          btnBake.style.pointerEvents = 'auto';
          btnBake.style.opacity = '1';
        }, 300);
        return;
      }

      const val = bakeSteps[stepIdx];
      
      // Clear board visually on intermediate scales to show nice growing singular tile
      tileContainer.innerHTML = '';
      
      // Spawn central merging tile smoothly
      grid[1][1] = new Tile(1, 1, val);
      grid[1][1].el.classList.add('merged');
      
      // Play merge chime note at this step scale
      playMergeChime(val);
      spawnMergeParticles(grid[1][1].el);

      // Increment values
      score += val;
      scoreVal.innerText = score;
      stepIdx++;
      
      setTimeout(runBakeStep, 250);
    }

    setTimeout(runBakeStep, 150);
  }

  // Buttons triggers
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

  setupButton(btnStart, startGame);
  setupButton(btnReplay, startGame);
  setupButton(btnBake, triggerMagicBake);
  setupButton(btnRestartHud, startGame);

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

  setupButton(btnContinue, () => {
    isPlaying = true;
    endlessMode = true;
    victoryScreen.classList.add('hidden');
    spawnRandomTile();
    startBgm();
  });

  // Victory screen coupons carousel logic
  let activeSlide = 0;
  const slides = document.querySelectorAll('.coupon-slide');
  const dots = document.querySelectorAll('.dot');
  const btnPrev = document.getElementById('btn-prev-coupon');
  const btnNext = document.getElementById('btn-next-coupon');

  function showSlide(index) {
    if (slides.length === 0) return;
    slides[activeSlide].classList.remove('active');
    dots[activeSlide].classList.remove('active');
    
    activeSlide = (index + slides.length) % slides.length;
    
    slides[activeSlide].classList.add('active');
    dots[activeSlide].classList.add('active');
  }

  if (btnPrev && btnNext) {
    setupButton(btnPrev, () => showSlide(activeSlide - 1));
    setupButton(btnNext, () => showSlide(activeSlide + 1));
    
    dots.forEach((dot, idx) => {
      setupButton(dot, () => showSlide(idx));
    });
  }

  // Interactive coupon reveal logic
  document.querySelectorAll('.coupon-ticket').forEach((ticket, idx) => {
    const revealSurprise = (e) => {
      if (ticket.getAttribute('data-opened') === 'true') return;
      initAudio();
      ticket.setAttribute('data-opened', 'true');

      // Synthesize cute opening chime
      playMergeChime(256);

      // Trigger blossom confettis
      triggerConfettiShower();
      
      e.stopPropagation();
    };

    ticket.addEventListener('click', revealSurprise);
    ticket.addEventListener('touchstart', revealSurprise, { passive: true });
  });
});
