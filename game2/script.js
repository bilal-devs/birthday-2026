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
  const boardSize = 8; 
  const targetScore = 1500;
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

  let grid = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
  let score = 0;
  let moves = 30;
  let isPlaying = false;
  let selectedCandy = null;
  let isSwappingOrFalling = false;
  let endlessMode = false;

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

      const el = document.createElement('div');
      el.className = `candy candy-t-${value}`;
      el.style.left = `${(col * 100) / boardSize}%`;
      el.style.top = `${(row * 100) / boardSize}%`;
      
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
      this.el.style.left = `${(col * 100) / boardSize}%`;
      this.el.style.top = `${(row * 100) / boardSize}%`;
    }

    updateValue(value) {
      this.value = value;
      this.el.className = `candy candy-t-${value}`;
      this.el.querySelector('.candy-inner span').innerText = CANDIES_EMOJIS[value];
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
    moves = 30;
    selectedCandy = null;
    isSwappingOrFalling = false;
    endlessMode = false;

    scoreVal.innerText = '0';
    movesVal.innerText = '30';

    candiesContainer.innerHTML = '';
    
    document.querySelectorAll('.gift-box-item').forEach(item => {
      item.setAttribute('data-opened', 'false');
    });

    startScreen.classList.add('hidden');
    victoryScreen.classList.add('hidden');

    generateBoard();
    checkAndShuffleBoard(); // Make sure board has possible match moves initially

    startBgm();
  }

  function generateBoard() {
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
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
  for (let i = 0; i < boardSize * boardSize; i++) {
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
      
      if (targetRow >= 0 && targetRow < boardSize && targetCol >= 0 && targetCol < boardSize) {
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
      for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
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
    for (let c = 0; c < boardSize; c++) {
      if (grid[row][c]) set.add(grid[row][c]);
    }
    for (let r = 0; r < boardSize; r++) {
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
        createExplosionParticles(item.row, item.col);
        item.remove();
        grid[item.row][item.col] = null;
      }, delay);
    });

    score += list.length * 25;
    scoreVal.innerText = score;

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
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (grid[r][c] && grid[r][c].value === targetValue) {
          targets.push(grid[r][c]);
        }
      }
    }

    const bx = bombCandy.col * 12.5 + 6.25;
    const by = bombCandy.row * 12.5 + 6.25;

    playSpecialExplosion();

    targets.forEach(t => {
      const tx = t.col * 12.5 + 6.25;
      const ty = t.row * 12.5 + 6.25;
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
          createExplosionParticles(item.row, item.col);
          item.remove();
          grid[item.row][item.col] = null;
        }, idx * 40);
      });

      score += list.length * 30;
      scoreVal.innerText = score;
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
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (grid[r][c] && grid[r][c].value < 6) {
          boardValues.push(grid[r][c].value);
        }
      }
    }
    const targetValue = boardValues.length > 0 ? boardValues[Math.floor(Math.random() * boardValues.length)] : 0;

    const targets = [];
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (grid[r][c] && grid[r][c].value === targetValue) {
          targets.push(grid[r][c]);
        }
      }
    }

    const bx = bombCandy.col * 12.5 + 6.25;
    const by = bombCandy.row * 12.5 + 6.25;

    playSpecialExplosion();

    targets.forEach(t => {
      const tx = t.col * 12.5 + 6.25;
      const ty = t.row * 12.5 + 6.25;
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
      for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
          if (grid[r][c]) {
            blastList.push(grid[r][c]);
          }
        }
      }

      blastList.forEach((item, idx) => {
        setTimeout(() => {
          if (!grid[item.row][item.col]) return;
          createExplosionParticles(item.row, item.col);
          item.remove();
          grid[item.row][item.col] = null;
        }, idx * 10);
      });

      score += blastList.length * 30;
      scoreVal.innerText = score;

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
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize - 2; c++) {
        if (!grid[r][c] || !grid[r][c+1] || !grid[r][c+2]) continue;
        const val = grid[r][c].value;
        if (val < 6 && grid[r][c+1].value === val && grid[r][c+2].value === val) {
          let matchLength = 3;
          while (c + matchLength < boardSize && grid[r][c+matchLength] && grid[r][c+matchLength].value === val) {
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
    for (let c = 0; c < boardSize; c++) {
      for (let r = 0; r < boardSize - 2; r++) {
        if (!grid[r][c] || !grid[r+1][c] || !grid[r+2][c]) continue;
        const val = grid[r][c].value;
        if (val < 6 && grid[r+1][c].value === val && grid[r+2][c].value === val) {
          let matchLength = 3;
          while (r + matchLength < boardSize && grid[r+matchLength][c] && grid[r+matchLength][c].value === val) {
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
    const centerY = row * 12.5 + 6.25;
    const centerX = col * 12.5 + 6.25;
    
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
        for (let c = 0; c < boardSize; c++) {
          if (grid[cell.r][c]) {
            affected.add(grid[cell.r][c]);
          }
        }
        for (let r = 0; r < boardSize; r++) {
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
    for (let c = 0; c < boardSize; c++) {
      let emptyCount = 0;
      for (let r = boardSize - 1; r >= 0; r--) {
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
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
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
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (grid[r][c] && grid[r][c].value < 6) {
          let val = values[valIdx++];
          grid[r][c].updateValue(val);
        }
      }
    }
  }

  function hasPossibleMoves() {
    // Search grid for any swap that results in match-3
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (!grid[r][c]) continue;

        // Try right swap
        if (c < boardSize - 1 && grid[r][c+1]) {
          if (testSwapForMatch(r, c, r, c + 1)) return true;
        }

        // Try down swap
        if (r < boardSize - 1 && grid[r+1][c]) {
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
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (!grid[r][c]) continue;

        if (c < boardSize - 1 && grid[r][c+1]) {
          if (testSwapForMatch(r, c, r, c + 1)) {
            return [grid[r][c], grid[r][c+1]];
          }
        }

        if (r < boardSize - 1 && grid[r+1][c]) {
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

  function createExplosionParticles(row, col) {
    const parent = document.getElementById('board-container');
    const boardRect = parent.getBoundingClientRect();
    const cellW = boardRect.width / boardSize;
    const cellH = boardRect.height / boardSize;
    
    const startX = col * cellW + cellW / 2;
    const startY = row * cellH + cellH / 2;
    
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
      title: "Memory Card 💖",
      text: "I cherish the way you laugh at my silly jokes and how our chats always make the world feel so peaceful. Having you to share life's small moments is my favorite blessing. 💕"
    },
    {
      title: "Birthday Wish 🌸",
      text: "I wish you a lifetime of soft cherry blossom days, safe journeys, and a heart full of absolute peace. May this year grant every secret dream in your beautiful heart! 🌸✨"
    },
    {
      title: "Promise Ticket 🍬",
      text: "I promise to always hold your hand through thick and thin, listen to all your late-night thoughts, make you smile when you're down, and be your safest, happiest sanctuary. 💖"
    },
    {
      title: "Celebration 🎂",
      text: "Happy Birthday, my favorite blessing! Let's celebrate your beautiful presence today and every day. You make the world brighter just by being in it! 🎂🎈"
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
        <h3 style="font-family: 'Dancing Script', cursive; font-size: 2.2rem; color: var(--rose-deep); margin-bottom: 1rem;">${data.title}</h3>
        <p style="font-family: 'Quicksand', sans-serif; font-size: 1.15rem; font-weight: 500; color: #553b40; line-height: 1.6;">"${data.text}"</p>
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
});
