/* ========================================================
   🃏 Sweet Memory Match: Birthday Edition — Game Logic (4x4)
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').match  // ——————————————————————————————————————————————————————
  // 1. WEB AUDIO API SYNTHESIZER & MELODY BGM
  // ——————————————————————————————————————————————————————
  let audioCtx = null;
  let bgmInterval = null;
  let isMusicOn = false;

  // Cozy, romantic pentatonic dream melody (unique to Game 3)
  const bgmMelody = [
    329.63, 440.00, 493.88, 523.25, 493.88, 440.00, 329.63, 392.00,
    440.00, 440.00, 493.88, 523.25, 587.33, 523.25, 493.88, 440.00
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
    
    osc.type = 'sine'; // Soft cozy warm pad tones
    const freq = bgmMelody[melodyIdx];
    osc.frequency.setValueAtTime(freq, now);
    
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.06, now + 0.15); // soft slow attack
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.95); // slow release
    
    osc.start(now);
    osc.stop(now + 1.0);
    
    melodyIdx = (melodyIdx + 1) % bgmMelody.length;
  }

  function startBgm() {
    isMusicOn = true;
    if (bgmInterval) clearInterval(bgmInterval);
    bgmInterval = setInterval(playMelodyNote, 600);
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

  function playFlipSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
    
    osc.start(now);
    osc.stop(now + 0.06);
  }

  function playMatchChime(matchedIndex) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const now = audioCtx.currentTime;
    
    const baseFreq = scale[matchedIndex % scale.length];
    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]; // root, 3rd, 5th major triad
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const startTime = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.01, startTime + 0.25);

      gainNode.gain.setValueAtTime(0.08, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  function playMismatchSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.12);
    osc.frequency.linearRampToValueAtTime(160, now + 0.24);
    
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
    
    osc.start(now);
    osc.stop(now + 0.26);
  }

  function playVictoryFanfare() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];

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

  // ——————————————————————————————————————————————————————
  // 2. STATE AND CONFIGURATION (4x4 Grid)
  // ——————————————————————————————————————————————————————
  const EMOJIS = ['🧁', '🍭', '🍪', '🍩', '🍬', '🍒', '💖', '🍓'];
  const MEMORY_MESSAGES = {
    '🧁': "🧁 Meri pyari cup-cake... Saalgirah Mubarak! 🧁",
    '🍭': "🍭 Tumhari meethi meethi baatein aur shokhiyan... 🍭",
    '🍪': "🍪 Hamesha chocolate cookie ki tarah sweet raho! 🍪",
    '🍩': "🍩 Tumhare sath guzaara har lamha bahut khoobsurat hai. 🍩",
    '🍬': "🍬 Hamesha khush aur hasti-muskurati raho, meri jaan! 🍬",
    '🍒': "🍒 Cherry blossom se bhi zyada haseen aur pyari ho tum. 🍒",
    '💖': "💖 Mera dil hamesha tumhare pass aur tumhare liye dharakta hai! 💖",
    '🍓': "🍓 Sweetest strawberries ki tarah humari meethi yaadein! 🍓"
  };

  const board = document.getElementById('board-container');
  const matchesVal = document.getElementById('matches-found');
  const flipsVal = document.getElementById('flips-count');

  const startScreen = document.getElementById('start-screen');
  const victoryScreen = document.getElementById('victory-screen');

  const btnStart = document.getElementById('btn-start-game');
  const btnRestartHud = document.getElementById('btn-restart-hud');
  const btnReplay = document.getElementById('btn-replay-game');
  const btnMusicToggle = document.getElementById('btn-music-toggle');

  let cards = [];
  let flippedCards = [];
  let matchesFound = 0;
  let flipsCount = 0;
  let isPlaying = false;
  let isChecking = false;

  // ——————————————————————————————————————————————————————
  // 3. CARD LOGIC AND GENERATION
  // ——————————————————————————————————————————————————————

  function generateCards() {
    board.innerHTML = '';
    cards = [];
    flippedCards = [];
    matchesFound = 0;
    flipsCount = 0;
    matchesVal.innerText = '0/8';
    flipsVal.innerText = '0';

    // Duplicate emojis to form pairs and shuffle
    let deck = [...EMOJIS, ...EMOJIS];
    shuffleDeck(deck);

    deck.forEach((emoji, index) => {
      const card = createCardDOM(emoji, index);
      cards.push(card);
      board.appendChild(card.el);
    });
  }

  function shuffleDeck(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function createCardDOM(emoji, index) {
    const cardEl = document.createElement('div');
    cardEl.className = 'memory-card';
    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back"></div>
        <div class="card-face card-front">${emoji}</div>
      </div>
    `;

    const card = {
      el: cardEl,
      emoji: emoji,
      index: index,
      isFlipped: false,
      isMatched: false
    };

    const handleFlip = (e) => {
      if (!isPlaying || isChecking || card.isFlipped || card.isMatched) return;
      initAudio();
      flipCard(card);
      e.preventDefault();
    };

    cardEl.addEventListener('click', handleFlip);
    cardEl.addEventListener('touchstart', handleFlip, { passive: false });

    return card;
  }

  // ——————————————————————————————————————————————————————
  // 4. GAME PLAYPLAY ACTIONS
  // ——————————————————————————————————————————————————————

  function flipCard(card) {
    playFlipSound();
    card.isFlipped = true;
    card.el.classList.add('flipped');
    flippedCards.push(card);

    flipsCount++;
    flipsVal.innerText = flipsCount;

    if (flippedCards.length === 2) {
      isChecking = true;
      setTimeout(checkMatch, 700);
    }
  }

  function checkMatch() {
    const card1 = flippedCards[0];
    const card2 = flippedCards[1];

    if (card1.emoji === card2.emoji) {
      // It's a match!
      card1.isMatched = true;
      card2.isMatched = true;
      card1.el.classList.add('matched');
      card2.el.classList.add('matched');

      matchesFound++;
      matchesVal.innerText = `${matchesFound}/8`;

      playMatchChime(EMOJIS.indexOf(card1.emoji));
      triggerFloatingToast(card1.emoji);

      if (matchesFound === 8) {
        setTimeout(triggerVictory, 1000);
      }
    } else {
      // Not a match, flip back with wobble shake animation
      playMismatchSound();
      card1.el.classList.add('shake');
      card2.el.classList.add('shake');
      
      setTimeout(() => {
        card1.el.classList.remove('shake');
        card2.el.classList.remove('shake');
        card1.isFlipped = false;
        card2.isFlipped = false;
        card1.el.classList.remove('flipped');
        card2.el.classList.remove('flipped');
      }, 450);
    }

    flippedCards = [];
    isChecking = false;
  }

  function triggerFloatingToast(emoji) {
    const toast = document.createElement('div');
    toast.className = 'match-toast';
    toast.innerText = MEMORY_MESSAGES[emoji] || "Matching Surprise! 🌸";
    
    // Add toast to game arena
    document.querySelector('.game-arena').appendChild(toast);
    
    // Particle splash at toast coordinates
    if (!prefersReducedMotion) {
      createExplosionParticles(emoji);
    }

    setTimeout(() => toast.remove(), 1600);
  }

  function createExplosionParticles(emoji) {
    const parent = document.getElementById('board-container');
    const boardRect = parent.getBoundingClientRect();
    
    const startX = boardRect.width / 2;
    const startY = boardRect.height / 2;
    
    const count = 12;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'match-particle';
      p.innerText = emoji;
      p.style.position = 'absolute';
      p.style.left = `${startX}px`;
      p.style.top = `${startY}px`;
      p.style.pointerEvents = 'none';
      p.style.zIndex = 100;
      p.style.fontSize = `${Math.random() * 0.8 + 1.2}rem`;
      p.style.transition = 'all 0.8s cubic-bezier(0.1, 0.8, 0.3, 1)';
      
      parent.appendChild(p);
      
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const distance = Math.random() * 80 + 40;
      const destX = startX + Math.cos(angle) * distance;
      const destY = startY + Math.sin(angle) * distance;
      
      requestAnimationFrame(() => {
        p.style.left = `${destX}px`;
        p.style.top = `${destY}px`;
        p.style.transform = `scale(0) rotate(${Math.random() * 720 - 360}deg)`;
        p.style.opacity = '0';
      });
      
      setTimeout(() => p.remove(), 800);
    }
  }

  // ——————————————————————————————————————————————————————
  // 5. START & VICTORY CONTROLS
  // ——————————————————————————————————————————————————————

  function startGame() {
    initAudio();
    isPlaying = true;
    isChecking = false;
    
    generateCards();
    
    startScreen.classList.add('hidden');
    victoryScreen.classList.add('hidden');
    
    startBgm();
  }

  function triggerVictory() {
    isPlaying = false;
    stopBgm();
    playVictoryFanfare();

    setTimeout(() => {
      victoryScreen.classList.remove('hidden');
      if (!prefersReducedMotion) {
        triggerHeartsShower();
      }
    }, 400);
  }

  function triggerHeartsShower() {
    const count = 20;
    const EMOJIS_VICTORY = ['💖', '🌸', '✨', '💕', '🏆', '🍩', '🍬'];
    
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.innerText = EMOJIS_VICTORY[Math.floor(Math.random() * EMOJIS_VICTORY.length)];
      el.style.position = 'absolute';
      el.style.fontSize = `${Math.random() * 1.5 + 1.2}rem`;
      el.style.left = `${Math.random() * 90 + 5}%`;
      el.style.top = `${Math.random() * 80 + 10}%`;
      el.style.transform = `scale(0) rotate(${Math.random() * 360}deg)`;
      el.style.transition = 'all 1.5s cubic-bezier(0.1, 0.8, 0.3, 1)';
      el.style.pointerEvents = 'none';
      el.style.zIndex = 60;
      
      victoryScreen.querySelector('.scrapbook-card').appendChild(el);

      requestAnimationFrame(() => {
        el.style.transform = `scale(1) translateY(-100px) rotate(${Math.random() * 720 - 360}deg)`;
        el.style.opacity = '0';
      });

      setTimeout(() => el.remove(), 1500);
    }
  }

  // ——————————————————————————————————————————————————————
  // 6. BUTTON TRIGGERS
  // ——————————————————————————————————————————————————————
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
  setupButton(btnRestartHud, startGame);
  setupButton(btnReplay, startGame);

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
