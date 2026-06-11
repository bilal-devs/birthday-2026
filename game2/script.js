/* ========================================================
   🍬 Candy Match: Birthday Edition — Game Logic (8x8)
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ——————————————————————————————————————————————————————
  // 1. WEB AUDIO API SYNTHESIZER & MELODY BGM
  // ——————————————————————————————————————————————————————
  let audioCtx = null;
  let bgmInterval = null;
  let isMusicOn = false;

  // Bouncy, sweet melody in G major pentatonic scale (unique to Game 2)
  const bgmMelody = [
    293.66, 329.63, 392.00, 440.00, 493.88, 440.00, 392.00, 329.63,
    392.00, 392.00, 440.00, 493.88, 587.33, 493.88, 440.00, 392.00
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
    
    // Play two notes with delay to create a sweet bubble echo effect
    const freq = bgmMelody[melodyIdx];
    [0, 0.15].forEach((delay, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * (idx === 1 ? 1.5 : 1.0), now + delay);
      
      // Decaying volume
      gainNode.gain.setValueAtTime(idx === 0 ? 0.08 : 0.03, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.3);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.35);
    });
    
    melodyIdx = (melodyIdx + 1) % bgmMelody.length;
  }

  function startBgm() {
    isMusicOn = true;
    if (bgmInterval) clearInterval(bgmInterval);
    bgmInterval = setInterval(playMelodyNote, 500);
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

  function playSlideSwoosh() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    // Frequency shifts down then snaps up quickly to sound "springy/squishy"
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.06);
    osc.frequency.linearRampToValueAtTime(300, now + 0.12);
    
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
    
    osc.start(now);
    osc.stop(now + 0.13);
  }

  function playMatchChime(matchedCount) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Pentatonic scale starting at C5 for sparkling high tones
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    const count = Math.min(matchedCount, 8);
    const now = audioCtx.currentTime;

    for (let i = 0; i < count; i++) {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const freq = scale[i % scale.length];
      const startTime = now + i * 0.05; // Glockenspiel cascading roll

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.005, startTime + 0.25);

      gainNode.gain.setValueAtTime(0.06, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.3);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    }
  }

  function playSpecialExplosion() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Bubbly laser slide sweep
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.45);

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

    osc.start(now);
    osc.stop(now + 0.5);
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
  // 2. STATE AND CONFIGURATION (8x8 Grid)
  // ——————————————————————————————————————————————————————
  const boardCols = 8;
  const boardRows = 10;
  let targetScore = 4000;
  const candiesContainer = document.getElementById('candies-container');
  const scoreVal = document.getElementById('current-score');
  const movesVal = document.getElementById('moves-left');

  const startScreen = document.getElementById('start-screen');
  const victoryScreen = document.getElementById('victory-screen');

  const btnStart = document.getElementById('btn-start-game');
  const btnRestartHud = document.getElementById('btn-restart-hud');
  const btnReplay = document.getElementById('btn-replay-game');
  const btnMusicToggle = document.getElementById('btn-music-toggle');
  const btnHint = document.getElementById('btn-hint');

  let grid = Array(boardRows).fill(null).map(() => Array(boardCols).fill(null));
  let score = 0;
  let moves = 30;
  let isPlaying = false;
  let selectedCandy = null;
  let isSwappingOrFalling = false;
  let endlessMode = false;

  // Power-ups Inventory State
  let powerups = { hammer: 1, bomb: 1, color: 1, shuffle: 1, rocket: 1 };
  let activePowerup = null;
  let lastAwardedMilestone = 0;

  // 0 to 5 are basic candies. 6 is Lightning (⚡), 7 is Rainbow Color Bomb (🌈)
  const CANDIES_EMOJIS = ['🍬', '🍭', '🍪', '🍩', '🧁', '🍓', '⚡', '🌈'];

  // ——————————————————————————————————————————————————————
  // 3. CANDY CLASS
  // ——————————————————————————————————————————————————————
  class Candy {
    constructor(row, col, value) {
      this.row = row;
      this.col = col;
      this.value = value; 
      this.isMatched = false;
      this.isFrozen = false;
      this.boxDurability = 0;

      const el = document.createElement('div');
      el.className = `candy candy-t-${value}`;
      el.style.left = '0';
      el.style.top = '0';
      el.style.transform = `translate3d(${col * 100}%, ${row * 100}%, 0)`;
      
      el.innerHTML = `
        <div class="candy-inner">
          <span>${CANDIES_EMOJIS[value]}</span>
        </div>
      `;

      this.el = el;
      candiesContainer.appendChild(el);

      // Gestures support
      const handleSelectStart = (e) => {
        if (!isPlaying || isSwappingOrFalling) return;
        
        // Prevent default only for touch events to avoid double-triggering simulated mouse/click events
        if (e.type === 'touchstart' && e.cancelable) {
          e.preventDefault();
        }
        
        const clientX = e.type.startsWith('touch') ? (e.touches && e.touches[0] ? e.touches[0].clientX : 0) : e.clientX;
        const clientY = e.type.startsWith('touch') ? (e.touches && e.touches[0] ? e.touches[0].clientY : 0) : e.clientY;
        handleGestureStart(clientX, clientY, this);
      };

      el.addEventListener('mousedown', handleSelectStart);
      el.addEventListener('touchstart', handleSelectStart, { passive: false });
    }

    updatePosition(row, col) {
      this.row = row;
      this.col = col;
      this.el.style.transform = `translate3d(${col * 100}%, ${row * 100}%, 0)`;
    }

    updateValue(value) {
      this.value = value;
      let classes = [`candy`, `candy-t-${value}`];
      if (this.isFrozen) classes.push('frozen');
      if (this.boxDurability === 2) classes.push('boxed-2');
      if (this.boxDurability === 1) classes.push('boxed-1');
      this.el.className = classes.join(' ');
      this.el.querySelector('.candy-inner span').innerText = CANDIES_EMOJIS[value];
    }

    setFrozen(frozen) {
      this.isFrozen = frozen;
      if (frozen) {
        this.el.classList.add('frozen');
      } else {
        this.el.classList.remove('frozen');
      }
    }

    setBox(durability) {
      this.boxDurability = durability;
      this.el.classList.remove('boxed-2', 'boxed-1');
      if (durability === 2) {
        this.el.classList.add('boxed-2');
      } else if (durability === 1) {
        this.el.classList.add('boxed-1');
      }
    }

    remove() {
      this.el.classList.add('matched');
      const element = this.el;
      setTimeout(() => element.remove(), 250);
    }
  }

  // ——————————————————————————————————————————————————————
  // 4. GAME INITIALIZATION & BOARD SETUP
  // ——————————————————————————————————————————————————————
  
  function startGame() {
    initAudio();
    isPlaying = true;
    score = 0;
    moves = getMovesForLevel(gameLevel);
    selectedCandy = null;
    isSwappingOrFalling = false;
    endlessMode = false;

    // Reset powerups state
    powerups = { hammer: 1, bomb: 1, color: 1, shuffle: 1, rocket: 1 };
    activePowerup = null;
    lastAwardedMilestone = 0;
    updatePowerupUI();

    scoreVal.innerText = '0';
    movesVal.innerText = moves;

    candiesContainer.innerHTML = '';
    
    // Set dynamic target score based on level
    applyLevelSelection(gameLevel, false);
    
    document.querySelectorAll('.gift-box-item').forEach(item => {
      item.setAttribute('data-opened', 'false');
    });

    startScreen.classList.add('hidden');
    victoryScreen.classList.add('hidden');

    generateBoard();

    // Spawn Level-based obstacles
    if (gameLevel === 2) {
      let count = 0;
      while (count < 8) {
        let r = Math.floor(Math.random() * boardRows);
        let c = Math.floor(Math.random() * boardCols);
        if (grid[r][c] && !grid[r][c].isFrozen) {
          grid[r][c].setFrozen(true);
          count++;
        }
      }
    } else if (gameLevel === 3) {
      // Spawn 6 boxes
      let count = 0;
      while (count < 6) {
        let r = Math.floor(Math.random() * boardRows);
        let c = Math.floor(Math.random() * boardCols);
        if (grid[r][c] && grid[r][c].boxDurability === 0) {
          grid[r][c].setBox(2);
          count++;
        }
      }
      // Combined Spawn: also spawn 4 frozen blocks
      let iceCount = 0;
      while (iceCount < 4) {
        let r = Math.floor(Math.random() * boardRows);
        let c = Math.floor(Math.random() * boardCols);
        if (grid[r][c] && grid[r][c].boxDurability === 0 && !grid[r][c].isFrozen) {
          grid[r][c].setFrozen(true);
          iceCount++;
        }
      }
    }

    checkAndShuffleBoard(); // Make sure board has possible match moves initially

    startBgm();
  }

  function generateBoard() {
    for (let r = 0; r < boardRows; r++) {
      for (let c = 0; c < boardCols; c++) {
        let val;
        do {
          val = Math.floor(Math.random() * 6); // spawn basics (0 to 5)
        } while (
          (r >= 2 && grid[r-1][c].value === val && grid[r-2][c].value === val) ||
          (c >= 2 && grid[r][c-1].value === val && grid[r][c-2].value === val)
        );
        grid[r][c] = new Candy(r, c, val);
      }
    }
  }

  // Grid Cell Backgrounds
  const gridContainer = document.getElementById('grid-container');
  gridContainer.innerHTML = '';
  for (let i = 0; i < boardCols * boardRows; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    gridContainer.appendChild(cell);
  }

  // ——————————————————————————————————————————————————————
  // 5. INTERACTION LOGIC (CLICK & SWAP & SWIPE)
  // ——————————————————————————————————————————————————————

  let startX = 0;
  let startY = 0;
  let dragStartCandy = null;
  let isDragging = false;

  function handleGestureStart(clientX, clientY, candy) {
    if (candy.isFrozen || candy.boxDurability > 0) return;
    startX = clientX;
    startY = clientY;
    dragStartCandy = candy;
    isDragging = true;
  }

  function handleGestureMove(clientX, clientY) {
    if (!isDragging || !dragStartCandy || !isPlaying || isSwappingOrFalling) return;
    const diffX = clientX - startX;
    const diffY = clientY - startY;

    // Swipe threshold is 25 pixels
    if (Math.abs(diffX) > 25 || Math.abs(diffY) > 25) {
      isDragging = false; // Trigger once per drag
      
      let targetRow = dragStartCandy.row;
      let targetCol = dragStartCandy.col;
      
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) targetCol = dragStartCandy.col + 1; // Right
        else targetCol = dragStartCandy.col - 1; // Left
      } else {
        if (diffY > 0) targetRow = dragStartCandy.row + 1; // Down
        else targetRow = dragStartCandy.row - 1; // Up
      }
      
      if (targetRow >= 0 && targetRow < boardRows && targetCol >= 0 && targetCol < boardCols) {
        const targetCandy = grid[targetRow][targetCol];
        if (targetCandy) {
          if (selectedCandy) {
            selectedCandy.el.classList.remove('selected');
            selectedCandy = null;
          }
          swapCandies(dragStartCandy, targetCandy);
        }
      }
      dragStartCandy = null;
    }
  }

  function handleGestureEnd(clientX, clientY) {
    if (!isDragging) return;
    isDragging = false;

    if (dragStartCandy) {
      const diffX = clientX - startX;
      const diffY = clientY - startY;
      if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
        handleCandyClick(dragStartCandy);
      }
    }
    dragStartCandy = null;
  }

  // Global window listeners for drag coordination
  window.addEventListener('mousemove', (e) => {
    if (isDragging) handleGestureMove(e.clientX, e.clientY);
  });
  window.addEventListener('mouseup', (e) => {
    if (isDragging) handleGestureEnd(e.clientX, e.clientY);
  });
  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches && e.touches[0]) {
      handleGestureMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if (isDragging) {
      const clientX = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : startX;
      const clientY = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : startY;
      handleGestureEnd(clientX, clientY);
    }
  }, { passive: true });

  function handleCandyClick(candy) {
    if (activePowerup) {
      usePowerupOnCandy(candy);
      return;
    }
    if (candy.isFrozen || candy.boxDurability > 0) {
      playLockedSound();
      candy.el.classList.add('hint-flash');
      setTimeout(() => candy.el.classList.remove('hint-flash'), 400);
      return;
    }
    if (candy.value === 6) {
      // Direct click Lightning Candy
      isSwappingOrFalling = true;
      if (!endlessMode) {
        moves--;
        movesVal.innerText = moves;
      } else {
        movesVal.innerText = "∞";
      }
      const blastSet = new Set();
      collectLineBlast(candy.row, candy.col, blastSet);
      executeLineBlast(blastSet, candy.row, candy.col);
      return;
    }
    if (candy.value === 7) {
      // Direct click Color Bomb
      isSwappingOrFalling = true;
      if (!endlessMode) {
        moves--;
        movesVal.innerText = moves;
      } else {
        movesVal.innerText = "∞";
      }
      
      const boardValues = [];
      for (let r = 0; r < boardRows; r++) {
        for (let c = 0; c < boardCols; c++) {
          if (grid[r][c] && grid[r][c].value < 6) {
            boardValues.push(grid[r][c].value);
          }
        }
      }
      const randomValue = boardValues.length > 0 ? boardValues[Math.floor(Math.random() * boardValues.length)] : 0;
      activateColorBomb(candy, randomValue, []);
      return;
    }

    if (!selectedCandy) {
      selectedCandy = candy;
      candy.el.classList.add('selected');
    } else {
      if (selectedCandy === candy) {
        selectedCandy.el.classList.remove('selected');
        selectedCandy = null;
        return;
      }

      // Check adjacency
      const isAdjacent = 
        (Math.abs(selectedCandy.row - candy.row) === 1 && selectedCandy.col === candy.col) ||
        (Math.abs(selectedCandy.col - candy.col) === 1 && selectedCandy.row === candy.row);

      if (isAdjacent) {
        swapCandies(selectedCandy, candy);
      } else {
        selectedCandy.el.classList.remove('selected');
        selectedCandy = candy;
        candy.el.classList.add('selected');
      }
    }
  }

  function swapCandies(candy1, candy2) {
    if (candy1.isFrozen || candy1.boxDurability > 0 || candy2.isFrozen || candy2.boxDurability > 0) {
      isSwappingOrFalling = false;
      return;
    }
    isSwappingOrFalling = true;
    candy1.el.classList.remove('selected');
    selectedCandy = null;

    playSlideSwoosh();

    const r1 = candy1.row, c1 = candy1.col;
    const r2 = candy2.row, c2 = candy2.col;

    grid[r1][c1] = candy2;
    grid[r2][c2] = candy1;

    candy1.updatePosition(r2, c2);
    candy2.updatePosition(r1, c1);

    setTimeout(() => {
      const isSpecial1 = (candy1.value >= 6);
      const isSpecial2 = (candy2.value >= 6);
      const matches = findMatches();

      if (matches.length > 0 || isSpecial1 || isSpecial2) {
        if (!endlessMode) {
          moves--;
          movesVal.innerText = moves;
        } else {
          movesVal.innerText = "∞";
        }

        if (isSpecial1 || isSpecial2) {
          triggerSpecialSwap(candy1, candy2, matches);
        } else {
          processMatches(matches, r2, c2); 
        }
      } else {
        // Swap back
        playSlideSwoosh();
        grid[r1][c1] = candy1;
        grid[r2][c2] = candy2;

        candy1.updatePosition(r1, c1);
        candy2.updatePosition(r2, c2);

        setTimeout(() => {
          isSwappingOrFalling = false;
        }, 220);
      }
    }, 230);
  }

  // Draw visual electrical lightning arc from point (x1, y1) to (x2, y2)
  function drawLightningArc(x1, y1, x2, y2) {
    const container = document.getElementById('candies-container');
    if (!container) return;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    const line = document.createElement('div');
    line.className = 'lightning-arc';
    line.style.width = `${distance}%`;
    line.style.left = `${x1}%`;
    line.style.top = `${y1}%`;
    line.style.transform = `rotate(${angle}deg)`;
    
    container.appendChild(line);
    
    setTimeout(() => {
      line.remove();
    }, 450);
  }

  function triggerSpecialSwap(candy1, candy2, matches) {
    triggerBoardShake(true);
    const v1 = candy1.value;
    const v2 = candy2.value;

    // 1. Double Rainbow Color Bomb Comb
    if (v1 === 7 && v2 === 7) {
      detonateWholeBoard();
      return;
    }

    // 2. Color Bomb + Basic Candy Comb
    if (v1 === 7 && v2 < 6) {
      activateColorBomb(candy1, v2, matches);
      return;
    }
    if (v2 === 7 && v1 < 6) {
      activateColorBomb(candy2, v1, matches);
      return;
    }

    // 3. Color Bomb + Lightning Candy Comb
    if ((v1 === 7 && v2 === 6) || (v2 === 7 && v1 === 6)) {
      activateColorBombLightning(v1 === 7 ? candy1 : candy2, matches);
      return;
    }

    // 4. Double/Single Lightning row-column Blast combo
    const blastSet = new Set(matches);
    if (v1 === 6) {
      collectLineBlast(candy1.row, candy1.col, blastSet);
    }
    if (v2 === 6) {
      collectLineBlast(candy2.row, candy2.col, blastSet);
    }

    executeLineBlast(blastSet, v1 === 6 ? candy1.row : candy2.row, v1 === 6 ? candy1.col : candy2.col);
  }

  function collectLineBlast(row, col, set) {
    for (let c = 0; c < boardCols; c++) {
      if (grid[row][c]) set.add(grid[row][c]);
    }
    for (let r = 0; r < boardRows; r++) {
      if (grid[r][col]) set.add(grid[r][col]);
    }
  }

  function executeLineBlast(blastSet, centerRow = -1, centerCol = -1) {
    const list = Array.from(blastSet);
    playSpecialExplosion();

    if (centerRow !== -1 && centerCol !== -1) {
      spawnLaserBeams(centerRow, centerCol);
    } else {
      const lightningCard = list.find(c => c.value === 6);
      if (lightningCard) {
        spawnLaserBeams(lightningCard.row, lightningCard.col);
      }
    }

    let maxDelay = 0;
    list.forEach(item => {
      let dist = 0;
      if (centerRow !== -1 && centerCol !== -1) {
        dist = Math.abs(item.row - centerRow) + Math.abs(item.col - centerCol);
      } else {
        dist = item.row;
      }
      const delay = dist * 60;
      maxDelay = Math.max(maxDelay, delay);

      setTimeout(() => {
        if (!grid[item.row][item.col]) return;
        
        // Obstacle unlock/break mechanics
        if (item.isFrozen) {
          playIceCrackSound();
          item.setFrozen(false);
          createObstacleParticles(item.row, item.col, '#BAE6FD', '❄️');
          return;
        }
        if (item.boxDurability > 0) {
          let newDur = item.boxDurability - 1;
          if (newDur === 0) {
            playBoxSmashSound();
            item.setBox(0);
            createObstacleParticles(item.row, item.col, '#8B5A2B', '📦');
          } else {
            playBoxHitSound();
            item.setBox(newDur);
            createObstacleParticles(item.row, item.col, '#A06A3B', '💥');
          }
          return;
        }

        createExplosionParticles(item.row, item.col);
        item.remove();
        grid[item.row][item.col] = null;
      }, delay);
    });

    score += list.length * 25;
    scoreVal.innerText = score;
    checkScoreMilestone();

    setTimeout(() => {
      if (!endlessMode && score >= targetScore) {
        triggerVictory();
        return;
      }
      cascadeFall();
    }, maxDelay + 300);
  }

  function activateColorBomb(bombCandy, targetValue, matches) {
    const targets = [];
    for (let r = 0; r < boardRows; r++) {
      for (let c = 0; c < boardCols; c++) {
        if (grid[r][c] && grid[r][c].value === targetValue) {
          targets.push(grid[r][c]);
        }
      }
    }

    const bx = (bombCandy.col * 100) / boardCols + (50 / boardCols);
    const by = (bombCandy.row * 100) / boardRows + (50 / boardRows);

    playSpecialExplosion();

    targets.forEach(t => {
      const tx = (t.col * 100) / boardCols + (50 / boardCols);
      const ty = (t.row * 100) / boardRows + (50 / boardRows);
      drawLightningArc(bx, by, tx, ty);
    });

    setTimeout(() => {
      const blastSet = new Set(matches);
      targets.forEach(t => blastSet.add(t));
      blastSet.add(bombCandy);

      const list = Array.from(blastSet);
      list.forEach((item, idx) => {
        setTimeout(() => {
          if (!grid[item.row][item.col]) return;
          
          if (item.isFrozen) {
            playIceCrackSound();
            item.setFrozen(false);
            createObstacleParticles(item.row, item.col, '#BAE6FD', '❄️');
            return;
          }
          if (item.boxDurability > 0) {
            let newDur = item.boxDurability - 1;
            if (newDur === 0) {
              playBoxSmashSound();
              item.setBox(0);
              createObstacleParticles(item.row, item.col, '#8B5A2B', '📦');
            } else {
              playBoxHitSound();
              item.setBox(newDur);
              createObstacleParticles(item.row, item.col, '#A06A3B', '💥');
            }
            return;
          }

          createExplosionParticles(item.row, item.col);
          item.remove();
          grid[item.row][item.col] = null;
        }, idx * 40);
      });

      score += list.length * 30;
      scoreVal.innerText = score;
      checkScoreMilestone();
      playMatchChime(list.length);

      setTimeout(() => {
        if (!endlessMode && score >= targetScore) {
          triggerVictory();
          return;
        }
        cascadeFall();
      }, list.length * 40 + 300);
    }, 450);
  }

  function activateColorBombLightning(bombCandy, matches) {
    const boardValues = [];
    for (let r = 0; r < boardRows; r++) {
      for (let c = 0; c < boardCols; c++) {
        if (grid[r][c] && grid[r][c].value < 6) {
          boardValues.push(grid[r][c].value);
        }
      }
    }
    const targetValue = boardValues.length > 0 ? boardValues[Math.floor(Math.random() * boardValues.length)] : 0;

    const targets = [];
    for (let r = 0; r < boardRows; r++) {
      for (let c = 0; c < boardCols; c++) {
        if (grid[r][c] && grid[r][c].value === targetValue) {
          targets.push(grid[r][c]);
        }
      }
    }

    const bx = (bombCandy.col * 100) / boardCols + (50 / boardCols);
    const by = (bombCandy.row * 100) / boardRows + (50 / boardRows);

    playSpecialExplosion();

    targets.forEach(t => {
      const tx = (t.col * 100) / boardCols + (50 / boardCols);
      const ty = (t.row * 100) / boardRows + (50 / boardRows);
      drawLightningArc(bx, by, tx, ty);
      setTimeout(() => {
        t.updateValue(6); // transform to Lightning
      }, 200);
    });

    setTimeout(() => {
      const blastSet = new Set(matches);
      targets.forEach(t => {
        collectLineBlast(t.row, t.col, blastSet);
      });
      blastSet.add(bombCandy);

      executeLineBlast(blastSet);
    }, 550);
  }

  function detonateWholeBoard() {
    playSpecialExplosion();

    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        drawLightningArc(Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100);
      }, i * 15);
    }

    setTimeout(() => {
      const blastList = [];
      for (let r = 0; r < boardRows; r++) {
        for (let c = 0; c < boardCols; c++) {
          if (grid[r][c]) {
            blastList.push(grid[r][c]);
          }
        }
      }

      blastList.forEach((item, idx) => {
        setTimeout(() => {
          if (!grid[item.row][item.col]) return;
          
          if (item.isFrozen) {
            playIceCrackSound();
            item.setFrozen(false);
            createObstacleParticles(item.row, item.col, '#BAE6FD', '❄️');
            return;
          }
          if (item.boxDurability > 0) {
            let newDur = item.boxDurability - 1;
            if (newDur === 0) {
              playBoxSmashSound();
              item.setBox(0);
              createObstacleParticles(item.row, item.col, '#8B5A2B', '📦');
            } else {
              playBoxHitSound();
              item.setBox(newDur);
              createObstacleParticles(item.row, item.col, '#A06A3B', '💥');
            }
            return;
          }

          createExplosionParticles(item.row, item.col);
          item.remove();
          grid[item.row][item.col] = null;
        }, idx * 10);
      });

      score += blastList.length * 30;
      scoreVal.innerText = score;
      checkScoreMilestone();

      setTimeout(() => {
        if (!endlessMode && score >= targetScore) {
          triggerVictory();
          return;
        }
        cascadeFall();
      }, blastList.length * 10 + 350);
    }, 400);
  }

  // ——————————————————————————————————————————————————————
  // 6. DETECT & EXECUTE MATCHES AND SPECIAL BOMB DETONATIONS
  // ——————————————————————————————————————————————————————

  function findMatches() {
    const matchedSet = new Set();

    // Horizontal check
    for (let r = 0; r < boardRows; r++) {
      for (let c = 0; c < boardCols - 2; c++) {
        if (!grid[r][c] || !grid[r][c+1] || !grid[r][c+2]) continue;
        if (grid[r][c].boxDurability > 0 || grid[r][c+1].boxDurability > 0 || grid[r][c+2].boxDurability > 0) continue;
        const val = grid[r][c].value;
        if (val < 6 && grid[r][c+1].value === val && grid[r][c+2].value === val) {
          let matchLength = 3;
          while (c + matchLength < boardCols && grid[r][c+matchLength] && grid[r][c+matchLength].boxDurability === 0 && grid[r][c+matchLength].value === val) {
            matchLength++;
          }
          for (let i = 0; i < matchLength; i++) {
            matchedSet.add(grid[r][c+i]);
          }
          c += matchLength - 1;
        }
      }
    }

    // Vertical check
    for (let c = 0; c < boardCols; c++) {
      for (let r = 0; r < boardRows - 2; r++) {
        if (!grid[r][c] || !grid[r+1][c] || !grid[r+2][c]) continue;
        if (grid[r][c].boxDurability > 0 || grid[r+1][c].boxDurability > 0 || grid[r+2][c].boxDurability > 0) continue;
        const val = grid[r][c].value;
        if (val < 6 && grid[r+1][c].value === val && grid[r+2][c].value === val) {
          let matchLength = 3;
          while (r + matchLength < boardRows && grid[r+matchLength][c] && grid[r+matchLength][c].boxDurability === 0 && grid[r+matchLength][c].value === val) {
            matchLength++;
          }
          for (let i = 0; i < matchLength; i++) {
            matchedSet.add(grid[r+i][c]);
          }
          r += matchLength - 1;
        }
      }
    }

    return Array.from(matchedSet);
  }

  function spawnLaserBeams(row, col) {
    const parent = document.getElementById('candies-container');
    if (!parent) return;
    
    // Percentage-based coordinates for responsive alignments
    const centerY = (row * 100) / boardRows + (50 / boardRows);
    const centerX = (col * 100) / boardCols + (50 / boardCols);
    
    const hBeam = document.createElement('div');
    hBeam.className = 'laser-beam-h';
    hBeam.style.top = `${centerY}%`;
    
    const vBeam = document.createElement('div');
    vBeam.className = 'laser-beam-v';
    vBeam.style.left = `${centerX}%`;
    
    parent.appendChild(hBeam);
    parent.appendChild(vBeam);
    
    setTimeout(() => {
      hBeam.remove();
      vBeam.remove();
    }, 600);
  }



  function processMatches(matches, swapRow = -1, swapCol = -1) {
    breakObstaclesAdjacentTo(matches);
    let finalMatches = [...matches];
    let hasSpecialTrigger = false;
    let specialCells = [];

    // Check if any matched tile is a Special Candy 🔥
    matches.forEach(candy => {
      if (candy.value === 7) {
        hasSpecialTrigger = true;
        specialCells.push({ r: candy.row, c: candy.col });
      }
    });

    if (hasSpecialTrigger) {
      playSpecialExplosion();
      const affected = new Set(finalMatches);
      specialCells.forEach(cell => {
        spawnLaserBeams(cell.r, cell.c);
        for (let c = 0; c < boardCols; c++) {
          if (grid[cell.r][c]) {
            affected.add(grid[cell.r][c]);
          }
        }
        for (let r = 0; r < boardRows; r++) {
          if (grid[r][cell.c]) {
            affected.add(grid[r][cell.c]);
          }
        }
      });
      finalMatches = Array.from(affected);
    }

    triggerBoardShake(hasSpecialTrigger);

    let maxDelay = 0;
    finalMatches.forEach((candy, idx) => {
      let delay = 0;
      if (hasSpecialTrigger && specialCells.length > 0) {
        // Delay is distance from nearest special cell
        const dist = Math.min(...specialCells.map(cell => Math.abs(candy.row - cell.r) + Math.abs(candy.col - cell.c)));
        delay = dist * 60;
      } else {
        // Bouncy sequential delay for normal matches
        delay = idx * 40;
      }
      maxDelay = Math.max(maxDelay, delay);

      setTimeout(() => {
        if (!grid[candy.row][candy.col]) return; // already removed
        
        if (candy.isFrozen) {
          playIceCrackSound();
          candy.setFrozen(false);
          createObstacleParticles(candy.row, candy.col, '#BAE6FD', '❄️');
          return;
        }
        if (candy.boxDurability > 0) {
          let newDur = candy.boxDurability - 1;
          if (newDur === 0) {
            playBoxSmashSound();
            candy.setBox(0);
            createObstacleParticles(candy.row, candy.col, '#8B5A2B', '📦');
          } else {
            playBoxHitSound();
            candy.setBox(newDur);
            createObstacleParticles(candy.row, candy.col, '#A06A3B', '💥');
          }
          return;
        }

        createExplosionParticles(candy.row, candy.col);
        candy.remove();
        grid[candy.row][candy.col] = null;
      }, delay);
    });

    // Spawn Special Candy: 6 (Lightning) on Match-4, 7 (Color Bomb) on Match-5
    if (matches.length === 4) {
      const spawnR = swapRow !== -1 ? swapRow : matches[0].row;
      const spawnC = swapCol !== -1 ? swapCol : matches[0].col;
      setTimeout(() => {
        if (grid[spawnR][spawnC]) {
          grid[spawnR][spawnC].remove();
        }
        grid[spawnR][spawnC] = new Candy(spawnR, spawnC, 6);
      }, 100);
    } else if (matches.length >= 5) {
      const spawnR = swapRow !== -1 ? swapRow : matches[0].row;
      const spawnC = swapCol !== -1 ? swapCol : matches[0].col;
      setTimeout(() => {
        if (grid[spawnR][spawnC]) {
          grid[spawnR][spawnC].remove();
        }
        grid[spawnR][spawnC] = new Candy(spawnR, spawnC, 7);
      }, 100);
    }

    score += finalMatches.length * 25;
    scoreVal.innerText = score;
    checkScoreMilestone();

    playMatchChime(finalMatches.length);

    setTimeout(() => {
      if (!endlessMode && score >= targetScore) {
        triggerVictory();
        return;
      }
      cascadeFall();
    }, maxDelay + 300);
  }

  function cascadeFall() {
    for (let c = 0; c < boardCols; c++) {
      let emptyCount = 0;
      for (let r = boardRows - 1; r >= 0; r--) {
        if (grid[r][c] === null) {
          emptyCount++;
        } else if (emptyCount > 0) {
          const candy = grid[r][c];
          grid[r + emptyCount][c] = candy;
          grid[r][c] = null;
          candy.updatePosition(r + emptyCount, c);
        }
      }

      // Spawn drops from top
      for (let i = 0; i < emptyCount; i++) {
        const targetRow = emptyCount - 1 - i;
        const val = Math.floor(Math.random() * 6); // basic candies (0 to 5)
        
        const candy = new Candy(-1 - i, c, val);
        grid[targetRow][c] = candy;
        
        // Randomly spawn obstacles on newly dropped candies based on active level
        if (gameLevel === 2) {
          // 20% chance to spawn ice on new drop (increased slightly for more challenge)
          if (Math.random() < 0.20) {
            candy.setFrozen(true);
          }
        } else if (gameLevel === 3) {
          // 15% chance to spawn wooden box, 10% chance to spawn ice block
          const rand = Math.random();
          if (rand < 0.15) {
            candy.setBox(2);
          } else if (rand < 0.25) { // 0.15 to 0.25 is 10%
            candy.setFrozen(true);
          }
        }
        
        setTimeout(() => {
          candy.updatePosition(targetRow, c);
        }, 20);
      }
    }

    setTimeout(() => {
      const nextMatches = findMatches();
      if (nextMatches.length > 0) {
        processMatches(nextMatches);
      } else {
        // Scan board for available moves or trigger shuffle
        checkAndShuffleBoard();

        isSwappingOrFalling = false;
        
        if (!endlessMode && moves <= 0 && score < targetScore) {
          isPlaying = false;
          stopBgm();
          setTimeout(() => {
            alert("No moves remaining! Play Again to try again! 🧁🌸");
          }, 300);
        }
      }
    }, 230);
  }

  // ——————————————————————————————————————————————————————
  // 7. BOARD SHUFFLE & POSSIBLE MOVE DETECTION (NO LOCK STATE)
  // ——————————————————————————————————————————————————————

  function checkAndShuffleBoard() {
    if (!isPlaying) return;

    let shuffleCount = 0;
    while (!hasPossibleMoves() && shuffleCount < 10) {
      shuffleBoard();
      shuffleCount++;
    }

    if (shuffleCount > 0) {
      // Alert user with cute floating toast or message
      const toast = document.createElement('div');
      toast.style.position = 'absolute';
      toast.style.top = '50%';
      toast.style.left = '50%';
      toast.style.transform = 'translate(-50%, -50%)';
      toast.style.background = 'rgba(134, 78, 90, 0.95)';
      toast.style.color = '#fff';
      toast.style.padding = '0.8rem 1.8rem';
      toast.style.borderRadius = '20px';
      toast.style.fontSize = '1.1rem';
      toast.style.fontWeight = 'bold';
      toast.style.zIndex = '80';
      toast.innerText = 'No moves left! Shuffling board... 🌸';
      document.getElementById('board-container').appendChild(toast);
      
      setTimeout(() => toast.remove(), 1500);
    }
  }

  function shuffleBoard() {
    // Gather all basic candy values
    const values = [];
    for (let r = 0; r < boardRows; r++) {
      for (let c = 0; c < boardCols; c++) {
        if (grid[r][c] && grid[r][c].value < 6) {
          values.push(grid[r][c].value);
        }
      }
    }

    // Shuffle values array
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }

    // Re-assign values to grid tiles, avoiding automatic matches
    let valIdx = 0;
    for (let r = 0; r < boardRows; r++) {
      for (let c = 0; c < boardCols; c++) {
        if (grid[r][c] && grid[r][c].value < 6) {
          let val = values[valIdx++];
          grid[r][c].updateValue(val);
        }
      }
    }
  }

  function hasPossibleMoves() {
    // Search grid for any swap that results in match-3, ignoring frozen/boxed candies
    for (let r = 0; r < boardRows; r++) {
      for (let c = 0; c < boardCols; c++) {
        if (!grid[r][c] || grid[r][c].isFrozen || grid[r][c].boxDurability > 0) continue;

        // Try right swap
        if (c < boardCols - 1 && grid[r][c+1] && !grid[r][c+1].isFrozen && grid[r][c+1].boxDurability === 0) {
          if (testSwapForMatch(r, c, r, c + 1)) return true;
        }

        // Try down swap
        if (r < boardRows - 1 && grid[r+1][c] && !grid[r+1][c].isFrozen && grid[r+1][c].boxDurability === 0) {
          if (testSwapForMatch(r, c, r + 1, c)) return true;
        }
      }
    }
    return false;
  }

  function testSwapForMatch(r1, c1, r2, c2) {
    // Temporarily swap references in data grid
    const temp = grid[r1][c1];
    grid[r1][c1] = grid[r2][c2];
    grid[r2][c2] = temp;

    // Run match check
    const matches = findMatches();

    // Swap back
    grid[r2][c2] = grid[r1][c1];
    grid[r1][c1] = temp;

    return matches.length > 0;
  }

  // ——————————————————————————————————————————————————————
  // 8. HINT GENERATOR (Zero Frustration!)
  // ——————————————————————————————————————————————————————

  function getPossibleMove() {
    for (let r = 0; r < boardRows; r++) {
      for (let c = 0; c < boardCols; c++) {
        if (!grid[r][c] || grid[r][c].isFrozen || grid[r][c].boxDurability > 0) continue;

        if (c < boardCols - 1 && grid[r][c+1] && !grid[r][c+1].isFrozen && grid[r][c+1].boxDurability === 0) {
          if (testSwapForMatch(r, c, r, c + 1)) {
            return [grid[r][c], grid[r][c+1]];
          }
        }

        if (r < boardRows - 1 && grid[r+1][c] && !grid[r+1][c].isFrozen && grid[r+1][c].boxDurability === 0) {
          if (testSwapForMatch(r, c, r + 1, c)) {
            return [grid[r][c], grid[r+1][c]];
          }
        }
      }
    }
    return null;
  }

  function triggerHint() {
    if (!isPlaying || isSwappingOrFalling) return;
    
    // Clear selections first
    if (selectedCandy) {
      selectedCandy.el.classList.remove('selected');
      selectedCandy = null;
    }

    const move = getPossibleMove();
    if (move) {
      // Add pulsing flash class to matching pair
      move[0].el.classList.add('hint-flash');
      move[1].el.classList.add('hint-flash');
      
      setTimeout(() => {
        move[0].el.classList.remove('hint-flash');
        move[1].el.classList.remove('hint-flash');
      }, 1300);
    }
  }

  // ——————————————————————————————————————————————————————
  // 9. EXPLOSIONS AND SHOWER PARTICLES
  // ——————————————————————————————————————————————————————

  function triggerBoardShake(isSpecial = false) {
    const board = document.getElementById('board-container');
    if (!board) return;
    board.classList.remove('board-shake');
    void board.offsetWidth; // Force reflow
    board.classList.add('board-shake');
    setTimeout(() => {
      board.classList.remove('board-shake');
    }, isSpecial ? 500 : 300);
  }

  function triggerBoardFlash() {
    const board = document.getElementById('board-container');
    if (!board) return;
    board.classList.remove('board-flash');
    void board.offsetWidth; // Force reflow
    board.classList.add('board-flash');
    setTimeout(() => {
      board.classList.remove('board-flash');
    }, 300);
  }

  let cachedBoardRect = null;
  function getBoardRect() {
    if (!cachedBoardRect) {
      const board = document.getElementById('board-container');
      if (board) {
        cachedBoardRect = board.getBoundingClientRect();
      }
    }
    return cachedBoardRect;
  }
  window.addEventListener('resize', () => {
    cachedBoardRect = null;
  });

  function spawnExpandingRing(row, col) {
    const parent = document.getElementById('board-container');
    if (!parent) return;
    const boardRect = getBoardRect();
    if (!boardRect) return;
    const cellW = boardRect.width / boardCols;
    const cellH = boardRect.height / boardRows;
    const startX = col * cellW + cellW / 2;
    const startY = row * cellH + cellH / 2;
    
    const ring = document.createElement('div');
    ring.className = 'expanding-ring';
    ring.style.left = `${startX}px`;
    ring.style.top = `${startY}px`;
    parent.appendChild(ring);
    
    setTimeout(() => ring.remove(), 400);
  }

  function createExplosionParticles(row, col) {
    const parent = document.getElementById('board-container');
    const boardRect = getBoardRect();
    if (!boardRect) return;
    const cellW = boardRect.width / boardCols;
    const cellH = boardRect.height / boardRows;
    
    const startX = col * cellW + cellW / 2;
    const startY = row * cellH + cellH / 2;
    
    // Spawn expanding concentric ring
    spawnExpandingRing(row, col);

    const particles = ['🌸', '✨', '⭐', '💖', '💕', '🍓', '🍭', '🍬'];
    const pCount = 10;
    
    for (let i = 0; i < pCount; i++) {
      const p = document.createElement('div');
      p.className = 'match-particle';
      p.innerText = particles[Math.floor(Math.random() * particles.length)];
      p.style.position = 'absolute';
      p.style.left = `${startX}px`;
      p.style.top = `${startY}px`;
      p.style.pointerEvents = 'none';
      p.style.zIndex = 100;
      p.style.fontSize = `${Math.random() * 0.7 + 0.8}rem`;
      p.style.transition = 'all 0.6s cubic-bezier(0.1, 0.8, 0.3, 1)';
      
      parent.appendChild(p);
      
      const angle = (Math.PI * 2 * i) / pCount + Math.random() * 0.4;
      const distance = Math.random() * 60 + 35;
      const destX = startX + Math.cos(angle) * distance;
      const destY = startY + Math.sin(angle) * distance;
      
      requestAnimationFrame(() => {
        p.style.left = `${destX}px`;
        p.style.top = `${destY}px`;
        p.style.transform = `scale(0) rotate(${Math.random() * 720 - 360}deg)`;
        p.style.opacity = '0';
      });
      
      setTimeout(() => p.remove(), 600);
    }
  }

  // ——————————————————————————————————————————————————————
  // 10. VICTORY REWARDS & PRESENT OPENINGS
  // ——————————————————————————————————————————————————————

  function triggerVictory() {
    isPlaying = false;
    stopBgm();
    playVictoryFanfare();
    
    setTimeout(() => {
      victoryScreen.classList.remove('hidden');
    }, 500);
  }

  const SURPRISES = [
    {
      title: "صحت، حفاظت اور طویل عمر کی دعا 🌸",
      text: "اللہ پاک آپ کو ہمیشہ اپنی حفظ و امان میں رکھے۔ آپ کی زندگی کو ہر دکھ، تکلیف اور شر سے دور رکھے، اور ہمیشہ صحت، تندرستی اور دلی سکون سے مالا مال فرمائے۔ آنے والا ہر دن آپ کے لیے ڈھیروں خوشیاں لائے۔ آمین۔ 💖"
    },
    {
      title: "کامیابی، عزت اور دلی مرادوں کی دعا 💖",
      text: "اللہ رب العزت آپ کو زندگی کے ہر امتحان اور ہر موڑ پر سرخرو اور کامیاب کرے۔ آپ کو عزت، سکون اور وہ سب خوشیاں نصیب فرمائے جن کی آپ کے دل میں تمنا ہے۔ آپ کی مسکراہٹ ہمیشہ یونہی برقرار رہے۔ آمین۔ ✨"
    }
  ];

  const giftRevealModal = document.getElementById('gift-reveal-modal');
  const revealContent = document.getElementById('reveal-content');
  const btnCloseReveal = document.getElementById('btn-close-reveal');

  document.querySelectorAll('.gift-box-item').forEach((item, idx) => {
    // Handle responsive click and touch events
    const openGift = () => {
      initAudio();
      item.setAttribute('data-opened', 'true');

      if (audioCtx) {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(520 + idx * 100, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.35);
      }

      if (!prefersReducedMotion) {
        triggerHeartsShower();
      }

      const data = SURPRISES[idx];
      revealContent.innerHTML = `
        <h3 class="urdu-title" style="font-family: 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif; font-size: 2rem; color: var(--rose-deep); margin-bottom: 0.8rem; direction: rtl; text-align: center;">${data.title}</h3>
        <p class="urdu-body" style="font-family: 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif; font-size: 1.45rem; font-weight: normal; color: #5a2e37; line-height: 2.1; direction: rtl; text-align: center; margin-top: 0.5rem; padding: 0 10px;">${data.text}</p>
      `;

      giftRevealModal.classList.remove('hidden');
    };

    item.addEventListener('click', openGift);
    item.addEventListener('touchstart', (e) => {
      openGift();
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });
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

  setupButton(btnCloseReveal, () => {
    giftRevealModal.classList.add('hidden');
  });

  function triggerHeartsShower() {
    const count = 15;
    const EMOJIS = ['💖', '🌸', '✨', '💕', '🍓'];
    
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      el.style.position = 'absolute';
      el.style.fontSize = `${Math.random() * 1.5 + 1.2}rem`;
      el.style.left = `${Math.random() * 90 + 5}%`;
      el.style.top = `${Math.random() * 80 + 10}%`;
      el.style.transform = `scale(0) rotate(${Math.random() * 360}deg)`;
      el.style.transition = 'all 1.2s cubic-bezier(0.1, 0.8, 0.3, 1)';
      el.style.pointerEvents = 'none';
      el.style.zIndex = 60;
      
      victoryScreen.querySelector('.victory-card').appendChild(el);

      requestAnimationFrame(() => {
        el.style.transform = `scale(1) translateY(-90px) rotate(${Math.random() * 720 - 360}deg)`;
        el.style.opacity = '0';
      });

      setTimeout(() => el.remove(), 1200);
    }
  }

  // ——————————————————————————————————————————————————————
  // 11. CONTROLS AND BGM MUSIC SWITCH
  // ——————————————————————————————————————————————————————
  const btnContinue = document.getElementById('btn-continue-game');

  setupButton(btnStart, startGame);
  setupButton(btnRestartHud, startGame);
  setupButton(btnReplay, startGame);
  setupButton(btnHint, triggerHint);
  setupButton(btnContinue, () => {
    endlessMode = true;
    isPlaying = true;
    movesVal.innerText = "∞";
    victoryScreen.classList.add('hidden');
    startBgm();
    cascadeFall();
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

  // ——————————————————————————————————————————————————————
  // 12. POWER-UPS LOGIC & MILESTONES (NEW FEATURE)
  // ——————————————————————————————————————————————————————
  function playTinyPop() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.08);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  function animatePowerupFly(type) {
    const badge = document.getElementById(`powerup-${type}`);
    if (!badge) return;
    
    const startRect = document.getElementById('current-score').getBoundingClientRect();
    const endRect = badge.getBoundingClientRect();
    
    const flyer = document.createElement('div');
    flyer.className = 'flying-powerup';
    const icons = { hammer: '🔨', bomb: '💣', color: '🎨', shuffle: '🌀', rocket: '🚀' };
    flyer.innerText = icons[type] || '🌸';
    flyer.style.position = 'fixed';
    flyer.style.left = `${startRect.left}px`;
    flyer.style.top = `${startRect.top}px`;
    flyer.style.fontSize = '2rem';
    flyer.style.zIndex = '200';
    flyer.style.pointerEvents = 'none';
    flyer.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
    flyer.style.filter = 'drop-shadow(0 4px 10px rgba(0,0,0,0.25))';
    document.body.appendChild(flyer);
    
    // Force a layout reflow immediately so the browser registers the initial position
    void flyer.offsetWidth;
    
    // Play feedback beep
    playTinyPop();
    
    requestAnimationFrame(() => {
      flyer.style.left = `${endRect.left + endRect.width / 2 - 16}px`;
      flyer.style.top = `${endRect.top + endRect.height / 2 - 16}px`;
      flyer.style.transform = 'scale(1.5) rotate(360deg)';
    });
    
    setTimeout(() => {
      flyer.remove();
      
      // Pulse the badge when it arrives
      badge.classList.add('badge-bounce');
      setTimeout(() => badge.classList.remove('badge-bounce'), 450);
      
      // Update UI count
      updatePowerupUI();
      
      // Play tiny pop sound
      playTinyPop();
    }, 800);
  }

  function checkScoreMilestone() {
    let currentMilestone = Math.floor(score / 2000);
    if (currentMilestone > lastAwardedMilestone) {
      let diff = currentMilestone - lastAwardedMilestone;
      lastAwardedMilestone = currentMilestone;
      
      const types = ['hammer', 'bomb', 'color', 'shuffle', 'rocket'];
      let awarded = [];
      for (let i = 0; i < diff; i++) {
        let type = types[Math.floor(Math.random() * 5)];
        powerups[type]++;
        awarded.push(type);
      }
      
      // Animate fly for each awarded powerup sequentially
      const labels = {
        hammer: '🔨 Candy Hammer',
        bomb: '💣 Candy Bomb',
        color: '🎨 Color Wipe',
        shuffle: '🌀 Board Shuffle',
        rocket: '🚀 Rocket Blaster'
      };
      
      awarded.forEach((type, idx) => {
        setTimeout(() => {
          animatePowerupFly(type);
        }, idx * 250);
      });
      
      let itemsText = awarded.map(type => labels[type]).join(', ');
      showFloatingToast(`Milestone Reached! Earned: ${itemsText} 🎉`);
    }
  }

  function updatePowerupUI() {
    const types = ['hammer', 'bomb', 'color', 'shuffle', 'rocket'];
    types.forEach(type => {
      const btn = document.getElementById(`powerup-${type}`);
      if (btn) {
        let count = powerups[type];
        btn.setAttribute('data-count', count);
        btn.querySelector('.powerup-badge').innerText = count;
      }
    });
  }

  function initPowerupListeners() {
    const types = ['hammer', 'bomb', 'color', 'shuffle', 'rocket'];
    types.forEach(type => {
      const btn = document.getElementById(`powerup-${type}`);
      if (btn) {
        setupButton(btn, (e) => {
          e.stopPropagation();
          if (!isPlaying || isSwappingOrFalling) return;
          if (powerups[type] <= 0) return;
          
          if (type === 'shuffle') {
            powerups['shuffle']--;
            updatePowerupUI();
            playFeedbackBeep();
            
            isSwappingOrFalling = true;
            triggerBoardShake(true);
            triggerBoardFlash();
            shuffleBoard();
            
            showFloatingToast("Board Shuffled! 🌀");
            
            setTimeout(() => {
              checkAndShuffleBoard();
              isSwappingOrFalling = false;
            }, 600);
            return;
          }

          if (activePowerup === type) {
            activePowerup = null;
            btn.classList.remove('active');
          } else {
            types.forEach(t => {
              const b = document.getElementById(`powerup-${t}`);
              if (b) b.classList.remove('active');
            });
            
            activePowerup = type;
            btn.classList.add('active');
            playFeedbackBeep();
          }
        });
      }
    });
  }

  function playFeedbackBeep() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  function usePowerupOnCandy(candy) {
    if (powerups[activePowerup] <= 0) return;
    
    // Consume powerup
    powerups[activePowerup]--;
    updatePowerupUI();
    
    const type = activePowerup;
    const activeBtn = document.getElementById(`powerup-${type}`);
    if (activeBtn) activeBtn.classList.remove('active');
    activePowerup = null;
    
    isSwappingOrFalling = true;
    playSpecialExplosion();
    
    if (type === 'hammer') {
      createExplosionParticles(candy.row, candy.col);
      candy.remove();
      grid[candy.row][candy.col] = null;
      
      score += 50;
      scoreVal.innerText = score;
      checkScoreMilestone();
      
      setTimeout(() => {
        cascadeFall();
      }, 300);
    } 
    else if (type === 'bomb') {
      const row = candy.row;
      const col = candy.col;
      const blastSet = new Set();
      
      for (let r = Math.max(0, row - 1); r <= Math.min(boardRows - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(boardCols - 1, col + 1); c++) {
          if (grid[r][c]) {
            blastSet.add(grid[r][c]);
          }
        }
      }
      
      triggerBoardShake(true);
      
      const list = Array.from(blastSet);
      list.forEach((item, idx) => {
        setTimeout(() => {
          if (!grid[item.row][item.col]) return;
          createExplosionParticles(item.row, item.col);
          item.remove();
          grid[item.row][item.col] = null;
        }, idx * 30);
      });
      
      score += list.length * 30;
      scoreVal.innerText = score;
      checkScoreMilestone();
      
      setTimeout(() => {
        cascadeFall();
      }, list.length * 30 + 350);
    } 
    else if (type === 'color') {
      const targetValue = candy.value;
      if (targetValue >= 6) {
        powerups['color']++;
        updatePowerupUI();
        isSwappingOrFalling = false;
        return;
      }
      
      const targets = [];
      for (let r = 0; r < boardRows; r++) {
        for (let c = 0; c < boardCols; c++) {
          if (grid[r][c] && grid[r][c].value === targetValue) {
            targets.push(grid[r][c]);
          }
        }
      }
      
      const bx = (candy.col * 100) / boardCols + (50 / boardCols);
      const by = (candy.row * 100) / boardRows + (50 / boardRows);
      
      targets.forEach(t => {
        const tx = (t.col * 100) / boardCols + (50 / boardCols);
        const ty = (t.row * 100) / boardRows + (50 / boardRows);
        drawLightningArc(bx, by, tx, ty);
      });
      
      setTimeout(() => {
        targets.forEach((item, idx) => {
          setTimeout(() => {
             if (!grid[item.row][item.col]) return;
             createExplosionParticles(item.row, item.col);
             item.remove();
             grid[item.row][item.col] = null;
          }, idx * 30);
        });
        
        score += targets.length * 35;
        scoreVal.innerText = score;
        checkScoreMilestone();
        
        setTimeout(() => {
          cascadeFall();
        }, targets.length * 30 + 350);
      }, 450);
    }
    else if (type === 'rocket') {
      const row = candy.row;
      const col = candy.col;
      const blastSet = new Set();
      
      triggerBoardShake(true);
      triggerBoardFlash();
      
      for (let c = 0; c < boardCols; c++) {
        if (grid[row][c]) blastSet.add(grid[row][c]);
      }
      for (let r = 0; r < boardRows; r++) {
        if (grid[r][col]) blastSet.add(grid[r][col]);
      }
      
      executeLineBlast(blastSet, row, col);
    }
  }

  // Initialize listeners
  initPowerupListeners();
  updatePowerupUI();

  // ——————————————————————————————————————————————————————
  // 13. LEVELS AND OBSTACLES SUPPORT (MID-GAME SELECTOR)
  // ——————————————————————————————————————————————————————
  let gameLevel = 1;
  
  function getMovesForLevel(level) {
    if (level === 1) return 12;
    if (level === 2) return 20;
    return 30; // Level 3
  }
  
  // Floating toast notification helper
  function showFloatingToast(text) {
    let toast = document.getElementById('floating-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'floating-toast';
      toast.className = 'floating-toast';
      document.body.appendChild(toast);
    }
    toast.innerText = text;
    toast.classList.remove('show');
    void toast.offsetWidth; // force reflow
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  function applyLevelSelection(level, isMidGame = false) {
    gameLevel = level;
    const maxMoves = getMovesForLevel(level);
    
    if (isMidGame || !isPlaying) {
      moves = maxMoves;
      movesVal.innerText = endlessMode ? "∞" : moves;
    }
    
    // 1. Update target score based on level
    if (level === 1) targetScore = 5000;
    else if (level === 2) targetScore = 10000;
    else if (level === 3) targetScore = 12000;
    
    // 2. Update HUD Goal Helper text
    const goalHelper = document.getElementById('goal-helper');
    if (goalHelper) {
      goalHelper.innerText = `Goal: Reach ${targetScore} points 🌸`;
    }
    
    // 3. Update Start Screen text
    const startCardText = document.querySelector('#start-screen .card-text');
    if (startCardText) {
      startCardText.innerHTML = `
        Swap adjacent sweet candies to match 3 or more of the same type in a row or column!
        <br>
        Reach **${targetScore} points** in under **${maxMoves} moves** to unlock Laiba's magical birthday gift boxes!
      `;
    }

    // Update active class on start screen buttons
    const startLevelButtons = document.querySelectorAll('.btn-level-opt');
    startLevelButtons.forEach(btn => {
      const btnLv = parseInt(btn.getAttribute('data-level') || '1');
      if (btnLv === level) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update active class on drawer buttons
    const drawerLevelButtons = document.querySelectorAll('.btn-drawer-opt');
    drawerLevelButtons.forEach(btn => {
      const btnLv = parseInt(btn.getAttribute('data-level') || '1');
      if (btnLv === level) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 4. If mid-game, apply obstacles immediately to current board state
    if (isMidGame && isPlaying) {
      let obstaclesChanged = false;
      
      // Clean or transition obstacles
      if (level === 1) {
        // Clear all obstacles
        for (let r = 0; r < boardRows; r++) {
          for (let c = 0; c < boardCols; c++) {
            if (grid[r][c]) {
              if (grid[r][c].isFrozen) grid[r][c].setFrozen(false);
              if (grid[r][c].boxDurability > 0) grid[r][c].setBox(0);
            }
          }
        }
        obstaclesChanged = true;
      }
      else if (level === 2) {
        // Clear boxes, ensure frozen ice blocks
        for (let r = 0; r < boardRows; r++) {
          for (let c = 0; c < boardCols; c++) {
            if (grid[r][c] && grid[r][c].boxDurability > 0) {
              grid[r][c].setBox(0);
            }
          }
        }
        
        // Count existing frozen
        let frozenCount = 0;
        for (let r = 0; r < boardRows; r++) {
          for (let c = 0; c < boardCols; c++) {
            if (grid[r][c] && grid[r][c].isFrozen) frozenCount++;
          }
        }
        
        // Freeze additional random candies up to 8
        let attempts = 0;
        while (frozenCount < 8 && attempts < 100) {
          attempts++;
          let r = Math.floor(Math.random() * boardRows);
          let c = Math.floor(Math.random() * boardCols);
          if (grid[r][c] && !grid[r][c].isFrozen && grid[r][c].value < 6) {
            grid[r][c].setFrozen(true);
            frozenCount++;
          }
        }
        obstaclesChanged = true;
      }
      else if (level === 3) {
        // Keep frozen, ensure wooden boxes
        
        // Count existing boxes
        let boxCount = 0;
        for (let r = 0; r < boardRows; r++) {
          for (let c = 0; c < boardCols; c++) {
            if (grid[r][c] && grid[r][c].boxDurability > 0) boxCount++;
          }
        }
        
        // Spawn additional boxes up to 6
        let attempts = 0;
        while (boxCount < 6 && attempts < 100) {
          attempts++;
          let r = Math.floor(Math.random() * boardRows);
          let c = Math.floor(Math.random() * boardCols);
          if (grid[r][c] && grid[r][c].boxDurability === 0 && grid[r][c].value < 6) {
            grid[r][c].setBox(2);
            boxCount++;
          }
        }

        // Count existing frozen
        let frozenCount = 0;
        for (let r = 0; r < boardRows; r++) {
          for (let c = 0; c < boardCols; c++) {
            if (grid[r][c] && grid[r][c].isFrozen) frozenCount++;
          }
        }

        // Spawn additional frozen up to 4
        let iceAttempts = 0;
        while (frozenCount < 4 && iceAttempts < 100) {
          iceAttempts++;
          let r = Math.floor(Math.random() * boardRows);
          let c = Math.floor(Math.random() * boardCols);
          if (grid[r][c] && grid[r][c].boxDurability === 0 && !grid[r][c].isFrozen && grid[r][c].value < 6) {
            grid[r][c].setFrozen(true);
            frozenCount++;
          }
        }
        obstaclesChanged = true;
      }
      
      if (obstaclesChanged) {
        playFeedbackBeep();
        checkAndShuffleBoard();
      }
      
      const levelNames = ['Classic 🍬', 'Frozen Ice ❄️', 'Wooden Boxes 📦'];
      showFloatingToast(`Difficulty changed to ${levelNames[level - 1]}! Goal: ${targetScore} pts.`);
    }
  }

  // Start screen level options selection
  const levelOpts = document.querySelectorAll('.btn-level-opt');
  levelOpts.forEach(btn => {
    setupButton(btn, () => {
      const selected = parseInt(btn.getAttribute('data-level') || '1');
      applyLevelSelection(selected, false);
      playFeedbackBeep();
    });
  });

  // Drawer interaction handlers
  const levelDrawer = document.getElementById('level-drawer');
  const btnLevelDrawer = document.getElementById('btn-level-drawer');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const btnConfirmDrawer = document.getElementById('btn-confirm-drawer');
  const drawerOpts = document.querySelectorAll('.btn-drawer-opt');
  
  let drawerSelectedLevel = 1;

  setupButton(btnLevelDrawer, () => {
    if (!isPlaying) return;
    drawerSelectedLevel = gameLevel;
    // Highlight correct button
    drawerOpts.forEach(btn => {
      const btnLv = parseInt(btn.getAttribute('data-level') || '1');
      if (btnLv === drawerSelectedLevel) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    levelDrawer.classList.add('open');
  });

  setupButton(btnCloseDrawer, () => {
    levelDrawer.classList.remove('open');
  });

  setupButton(btnConfirmDrawer, () => {
    levelDrawer.classList.remove('open');
    if (drawerSelectedLevel !== gameLevel) {
      applyLevelSelection(drawerSelectedLevel, true);
    }
  });

  drawerOpts.forEach(btn => {
    setupButton(btn, () => {
      drawerOpts.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      drawerSelectedLevel = parseInt(btn.getAttribute('data-level') || '1');
      playFeedbackBeep();
    });
  });

  function breakObstaclesAdjacentTo(matches) {
    let hitObstacles = new Set();
    matches.forEach(candy => {
      const directions = [
        { r: -1, c: 0 },
        { r: 1, c: 0 },
        { r: 0, c: -1 },
        { r: 0, c: 1 }
      ];
      directions.forEach(d => {
        let nr = candy.row + d.r;
        let nc = candy.col + d.c;
        if (nr >= 0 && nr < boardRows && nc >= 0 && nc < boardCols) {
          let neighbor = grid[nr][nc];
          if (neighbor && (neighbor.isFrozen || neighbor.boxDurability > 0)) {
            hitObstacles.add(neighbor);
          }
        }
      });
      if (candy.isFrozen || candy.boxDurability > 0) {
        hitObstacles.add(candy);
      }
    });
    
    hitObstacles.forEach(obs => {
      if (obs.isFrozen) {
        playIceCrackSound();
        obs.setFrozen(false);
        createObstacleParticles(obs.row, obs.col, '#BAE6FD', '❄️');
      }
      else if (obs.boxDurability > 0) {
        let newDur = obs.boxDurability - 1;
        if (newDur === 0) {
          playBoxSmashSound();
          obs.setBox(0);
          createObstacleParticles(obs.row, obs.col, '#8B5A2B', '📦');
        } else {
          playBoxHitSound();
          obs.setBox(newDur);
          createObstacleParticles(obs.row, obs.col, '#A06A3B', '💥');
        }
      }
    });
  }

  function playIceCrackSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1500, now + 0.1);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  function playBoxHitSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  function playBoxSmashSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  function playLockedSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.setValueAtTime(100, now + 0.05);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  function createObstacleParticles(row, col, color, emoji) {
    const parent = document.getElementById('board-container');
    const boardRect = getBoardRect();
    if (!boardRect) return;
    const cellW = boardRect.width / boardCols;
    const cellH = boardRect.height / boardRows;
    const startX = col * cellW + cellW / 2;
    const startY = row * cellH + cellH / 2;
    
    for (let i = 0; i < 6; i++) {
      const p = document.createElement('div');
      p.className = 'match-particle';
      p.innerText = emoji;
      p.style.position = 'absolute';
      p.style.left = `${startX}px`;
      p.style.top = `${startY}px`;
      p.style.pointerEvents = 'none';
      p.style.zIndex = 100;
      p.style.fontSize = '0.9rem';
      p.style.transition = 'all 0.5s cubic-bezier(0.1, 0.8, 0.3, 1)';
      
      parent.appendChild(p);
      
      const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
      const distance = Math.random() * 40 + 20;
      const destX = startX + Math.cos(angle) * distance;
      const destY = startY + Math.sin(angle) * distance;
      
      requestAnimationFrame(() => {
        p.style.left = `${destX}px`;
        p.style.top = `${destY}px`;
        p.style.transform = `scale(0) rotate(${Math.random() * 360}deg)`;
        p.style.opacity = '0';
      });
      
      setTimeout(() => p.remove(), 500);
    }
  }

  // Initialize start screen target score text
  applyLevelSelection(gameLevel, false);
});
