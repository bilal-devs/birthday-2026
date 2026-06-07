/* ========================================================
    npx -y http-server -p 3000
🌸 Cherry Blossom & Proposal — Vanilla JavaScript
   ========================================================
   Designed for: d:\projects\birthday\script.js
   Supports: Programmatic vector SVG petals, interactive
             wax seal opening, responsive polaroid flipping,
             autoplay-safe background music playing.
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ——————————————————————————————————————————————————————
  // 1. BACKGROUND MUSIC & AUTOPLAY LOGIC
  // ——————————————————————————————————————————————————————
  const audio = new Audio('./assets/music.mp3');
  audio.loop = true;
  audio.volume = 0.6; // Soft, romantic level

  const vinylDisc = document.getElementById('vinyl-disc');
  const musicStatusText = document.getElementById('music-status-text');

  function toggleMusic() {
    if (audio.paused) {
      audio.play().then(() => {
        vinylDisc.classList.add('playing');
        if (musicStatusText) musicStatusText.innerText = "Playing Sweet Melody";
      }).catch(err => console.log("Audio play blocked by browser:", err));
    } else {
      audio.pause();
      vinylDisc.classList.remove('playing');
      if (musicStatusText) musicStatusText.innerText = "Music Paused";
    }
  }

  // Interactive vinyl player widget control
  if (vinylDisc) {
    vinylDisc.addEventListener('click', toggleMusic);
  }
  // ——————————————————————————————————————————————————————
  // 2. MAGICAL WAX SEAL ENVELOPE OPENING ACTION
  // ——————————————————————————————————————————————————————
  const envelopeScreen = document.getElementById('envelope-screen');
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const waxSeal = document.getElementById('wax-seal');

  function handleSealBreak(e) {
    e.stopPropagation();
    e.preventDefault();

    // 1. Add opening class to initiate skeuomorphic flap unfolding & letter emerging
    envelopeWrapper.classList.add('open');

    // Sparkle & heart particles shooting out from the seal center!
    if (!prefersReducedMotion) {
      const x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2);
      const y = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2);
      createSparkleSplash(x, y, 12);
      triggerWaxSealHearts(x, y);
    }

    // 2. Play the romantic background melody immediately (browser input recognized!)
    audio.play().then(() => {
      if (vinylDisc) vinylDisc.classList.add('playing');
      if (musicStatusText) musicStatusText.innerText = "Playing Sweet Melody";
    }).catch(err => console.log("Audio autoplay exception:", err));

    // 3. Stagger the transition to show the beautiful handwritten greeting card modal
    setTimeout(() => {
      const letterModal = document.getElementById('letter-modal');
      if (letterModal) {
        letterModal.classList.add('active');
      }
    }, 1400); // Show modal after envelope fully unfolds and slides up the letter card!
  }

  if (waxSeal && envelopeScreen && envelopeWrapper) {
    waxSeal.addEventListener('click', handleSealBreak);
    waxSeal.addEventListener('touchstart', handleSealBreak, { passive: false });
  }

  // ——————————————————————————————————————————————————————
  // 2.5 PREMIUM CARD MODAL ENTER ACTION
  // ——————————————————————————————————————————————————————
  const btnModalEnter = document.getElementById('btn-modal-enter');
  const letterModal = document.getElementById('letter-modal');

  function handleModalEnter(e) {
    e.preventDefault();
    // 1. Epic cherry blossom burst from clicked enter button!
    if (!prefersReducedMotion) {
      triggerBigPetalBurst(btnModalEnter);
    }

    // 2. Hide modal card smoothly
    letterModal.classList.remove('active');

    // 3. Slide the entire envelope screen overlay away after a small delay
    setTimeout(() => {
      if (envelopeScreen) {
        envelopeScreen.classList.add('hidden');
      }
      document.body.classList.add('unlocked');

      // 4. Start the falling petal shower
      if (!prefersReducedMotion) {
        startPetalShower();
      }

      // Trigger standard scroll reveal observer
      initScrollReveal();
    }, 400);
  }

  if (btnModalEnter && letterModal) {
    btnModalEnter.addEventListener('click', handleModalEnter);
    btnModalEnter.addEventListener('touchstart', handleModalEnter, { passive: false });
  }

  // ——————————————————————————————————————————————————————
  // 3. CRISP PROGRAMMATIC VECTOR PETAL SHOWER
  // ——————————————————————————————————————————————————————
  // Programmatic generation of vector cherry blossoms to ensure 100% smooth,
  // ultra-crisp, alpha-transparent shapes (eliminates ugly, thick image files).
  function startPetalShower() {
    const petalContainer = document.getElementById('petal-container');
    if (!petalContainer) return;

    const PETAL_COUNT = 24;

    // Beautiful SVG Petal shapes (curved, realistic)
    const SVG_PETAL_PATHS = [
      "M20,0 C30,10 40,25 25,40 C15,45 5,35 0,25 C0,15 10,0 20,0 Z", // Basic curved petal
      "M15,0 C25,5 35,20 25,35 C15,40 5,30 2,20 C-1,10 5,0 15,0 Z",   // Asymmetric drop
      "M20,5 C30,15 35,30 20,40 C10,40 5,30 5,20 C5,10 10,5 20,5 Z"     // Rounded blossom petal
    ];

    function createPetal() {
      const svgNamespace = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNamespace, "svg");
      svg.setAttribute("viewBox", "0 0 40 45");
      svg.classList.add("svg-petal");

      // Randomize custom soft-gradient pink petals
      const pathElement = document.createElementNS(svgNamespace, "path");
      const randomPath = SVG_PETAL_PATHS[Math.floor(Math.random() * SVG_PETAL_PATHS.length)];
      pathElement.setAttribute("d", randomPath);

      // Create rich, premium inner blossom gradient for high fidelity
      const defs = document.createElementNS(svgNamespace, "defs");
      const linearGradient = document.createElementNS(svgNamespace, "linearGradient");
      const gradId = `petal-grad-${Math.random().toString(36).substr(2, 9)}`;
      linearGradient.setAttribute("id", gradId);
      linearGradient.setAttribute("x1", "0%");
      linearGradient.setAttribute("y1", "0%");
      linearGradient.setAttribute("x2", "100%");
      linearGradient.setAttribute("y2", "100%");

      const stop1 = document.createElementNS(svgNamespace, "stop");
      stop1.setAttribute("offset", "0%");
      stop1.setAttribute("stop-color", "#FFE3E7");

      const stop2 = document.createElementNS(svgNamespace, "stop");
      stop2.setAttribute("offset", "100%");
      // Randomly shade pink, peach, or blush
      stop2.setAttribute("stop-color", ["#FFB7C5", "#FFD1DC", "#FCE1CE"][Math.floor(Math.random() * 3)]);

      linearGradient.appendChild(stop1);
      linearGradient.appendChild(stop2);
      defs.appendChild(linearGradient);
      svg.appendChild(defs);

      pathElement.setAttribute("fill", `url(#${gradId})`);
      svg.appendChild(pathElement);

      // Configure random drop characteristics
      const size = Math.random() * 20 + 15; // 15px to 35px
      const leftPos = Math.random() * 100; // 0% to 100% viewport width
      const duration = Math.random() * 12 + 10; // 10s to 22s
      const delay = Math.random() * -20; // Negative delay so they start immediately distributed

      svg.style.width = `${size}px`;
      svg.style.height = `${size * 1.1}px`;
      svg.style.left = `${leftPos}vw`;
      svg.style.animation = `petalDrop ${duration}s linear ${delay}s infinite`;

      // Apply initial dynamic wind drift sway
      const windDrift = (Math.sin(Math.random() * Math.PI) * 15).toFixed(1);
      svg.style.transform = `translateX(${windDrift}px)`;

      petalContainer.appendChild(svg);
    }

    for (let i = 0; i < PETAL_COUNT; i++) {
      createPetal();
    }
  }

  // ——————————————————————————————————————————————————————
  // 4. POLAROID CARD FLIP ACTIONS (CLICK & TOUCH FRIENDLY)
  // ——————————————————————————————————————————————————————
  const polaroids = document.querySelectorAll('.polaroid-card');
  polaroids.forEach(card => {
    card.addEventListener('click', (e) => {
      // Toggle card flip
      card.classList.toggle('flipped');

      // Cute tiny sparkle splash on flip!
      if (!prefersReducedMotion) {
        createSparkleSplash(e.clientX, e.clientY);
      }
    });
  });

  // ——————————————————————————————————————————————————————
  // 5. CUTE SPARKLER SPLASH (MICRO-INTERACTIONS)
  // ——————————————————————————————————————————————————————
  function createSparkleSplash(x, y, count = 8) {
    if (!x || !y) return;

    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      sparkle.style.cssText = `
        position: fixed;
        width: ${Math.random() * 5 + 3}px;
        height: ${Math.random() * 5 + 3}px;
        background: ${['#FFB7C5', '#FFD1DC', '#FCE1CE', '#FFF'][Math.floor(Math.random() * 4)]};
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        z-index: 10000;
        opacity: 1;
        transform: translate(0, 0) scale(1);
        transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      `;
      document.body.appendChild(sparkle);

      requestAnimationFrame(() => {
        const angle = (Math.PI * 2 * i) / count;
        const distance = Math.random() * 40 + 20;
        sparkle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`;
        sparkle.style.opacity = '0';
      });

      setTimeout(() => sparkle.remove(), 750);
    }
  }

  // ——————————————————————————————————————————————————————
  // 6. PORTABLE SCROLL REVEAL OBSERVER
  // ——————————————————————————————————————————————————————
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (revealElements.length === 0) return;

    if (!prefersReducedMotion) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

      revealElements.forEach(el => observer.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('revealed'));
    }
  }

  // ——————————————————————————————————————————————————————
  // ——————————————————————————————————————————————————————
  // 7. INTERACTIVE BIRTHDAY CAKE & BLOWABLE CANDLES (MICROPHONE DETECTOR)
  // ——————————————————————————————————————————————————————
  const candles = document.querySelectorAll('.candle');
  const cakeSurpriseCard = document.getElementById('cake-surprise-card');
  let blownCount = 0;

  const blowBtn = document.getElementById('blow-btn');
  const micStatus = document.getElementById('mic-status');
  const micMeterContainer = document.getElementById('mic-meter-container');
  const micMeterFill = document.getElementById('mic-meter-fill');

  let audioContext = null;
  let analyser = null;
  let micStream = null;
  let lastBlowTime = 0;

  if (candles.length > 0 && cakeSurpriseCard) {
    // 1. Click candles to blow out manually (tap fallback)
    candles.forEach(candle => {
      candle.addEventListener('click', (e) => {
        if (candle.classList.contains('blown')) return;

        candle.classList.add('blown');
        blownCount++;

        if (!prefersReducedMotion) {
          createSparkleSplash(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
        }

        if (blownCount === candles.length) {
          setTimeout(() => {
            revealCakeSurprise();
            stopMic();
          }, 800);
        }
      });
    });

    function revealCakeSurprise() {
      cakeSurpriseCard.style.display = 'block';
      if (!prefersReducedMotion) {
        triggerBigPetalBurst(cakeSurpriseCard);
      }
    }

    // 2. Microphone Blowout Activation on Tap to Blow click
    if (blowBtn) {
      blowBtn.addEventListener('click', () => {
        activateMicrophoneBlowout();
      });
    }

    function activateMicrophoneBlowout() {
      if (audioContext) return; // Already active

      // Request Permission and Activate
      if (blowBtn) {
        blowBtn.innerHTML = "<span>🎙️ Requesting Mic...</span>";
      }

      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
          micStream = stream;
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          analyser.smoothingTimeConstant = 0.25;
          analyser.fftSize = 512;

          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);

          // Update UI state
          if (blowBtn) {
            blowBtn.style.pointerEvents = 'none';
            blowBtn.style.opacity = '0.7';
            blowBtn.innerHTML = "<span>🎙️ Listening... Blow Now! 🌬️</span>";
          }
          if (micMeterContainer) {
            micMeterContainer.style.display = 'block';
          }
          if (micStatus) {
            micStatus.innerHTML = "Blow directly into your microphone! 🌬️";
            micStatus.classList.add('pulse');
          }

          // Start volume checking
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          function checkVolume() {
            if (blownCount >= candles.length) {
              stopMic();
              return;
            }

            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            let average = sum / dataArray.length;

            // Live progress updates (average is 0 to ~100)
            let fillPercent = Math.min(100, (average / 65) * 100);
            if (micMeterFill) {
              micMeterFill.style.width = `${fillPercent}%`;
            }

            // Detect blow (average amplitude threshold)
            if (average > 38) {
              triggerBlowCandle();
            }

            requestAnimationFrame(checkVolume);
          }

          checkVolume();
        })
        .catch(err => {
          console.warn("Microphone access blocked/failed:", err);
          if (micStatus) {
            micStatus.innerHTML = "⚠️ Mic blocked! Tapping candles or waiting for auto-blowout...";
            micStatus.style.color = "var(--rose-deep)";
          }
          if (blowBtn) {
            blowBtn.innerHTML = "<span>🌬️ Blowing...</span>";
          }
          // Start auto blowout fallback
          setTimeout(() => {
            startAutoBlowSequence();
          }, 1200);
        });
    }

    function startAutoBlowSequence() {
      if (blownCount >= candles.length) return;

      if (blowBtn) {
        blowBtn.style.pointerEvents = 'none';
        blowBtn.style.opacity = '0.5';
      }
      if (micStatus) {
        micStatus.innerHTML = "🌬️ Blowing out the candles...";
        micStatus.classList.add('pulse');
      }

      function blowNext() {
        if (blownCount >= candles.length) {
          setTimeout(() => {
            revealCakeSurprise();
            stopMic();
          }, 800);
          return;
        }

        const unblownCandle = Array.from(candles).find(c => !c.classList.contains('blown'));
        if (unblownCandle) {
          unblownCandle.classList.add('blown');
          blownCount++;

          // Puff particles
          const rect = unblownCandle.getBoundingClientRect();
          createSparkleSplash(rect.left + rect.width / 2, rect.top + rect.height / 2);

          // Delay for next blow
          setTimeout(blowNext, 600);
        }
      }

      blowNext();
    }

    function triggerBlowCandle() {
      const now = Date.now();
      if (now - lastBlowTime < 750) return; // 750ms throttle between blows
      lastBlowTime = now;

      const unblownCandle = Array.from(candles).find(c => !c.classList.contains('blown'));
      if (unblownCandle) {
        unblownCandle.classList.add('blown');
        blownCount++;

        // Visual spark puff at coordinates of blown candle
        const rect = unblownCandle.getBoundingClientRect();
        createSparkleSplash(rect.left + rect.width / 2, rect.top + rect.height / 2);

        if (blownCount === candles.length) {
          setTimeout(() => {
            revealCakeSurprise();
            stopMic();
          }, 800);
        }
      }
    }

    function stopMic() {
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        micStream = null;
      }
      if (audioContext) {
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
        audioContext = null;
      }
      // Clean up UI controls gracefully
      if (blowBtn) blowBtn.style.display = 'none';
      if (micMeterContainer) micMeterContainer.style.display = 'none';
      if (micStatus) micStatus.style.display = 'none';
    }
  }



  // Epic colorful petal burst
  function triggerBigPetalBurst(btn) {
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: ${Math.random() * 14 + 10}px;
        height: ${Math.random() * 10 + 8}px;
        background: ${['#FFB7C5', '#FFD1DC', '#FFE3E7', '#FCE1CE'][Math.floor(Math.random() * 4)]};
        border-radius: 50% 0 50% 50%;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        z-index: 10000;
        opacity: 1;
        transition: all 1.5s cubic-bezier(0.1, 0.8, 0.3, 1);
      `;
      document.body.appendChild(particle);

      requestAnimationFrame(() => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 180 + 80;
        particle.style.transform = `translate(${Math.cos(angle) * speed}px, ${Math.sin(angle) * speed - 60}px) rotate(${Math.random() * 360}deg)`;
        particle.style.opacity = '0';
      });

      setTimeout(() => particle.remove(), 1600);
    }
  }

  // ——————————————————————————————————————————————————————
  // 8. INTERACTIVE SURPRISE SCRATCH-OFF PROMISE TICKET
  // ——————————————————————————————————————————————————————
  const canvas = document.getElementById('scratch-canvas');
  const scratchArea = document.getElementById('scratch-area');
  const scratchPrompt = document.getElementById('scratch-prompt');

  if (canvas && scratchArea) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let isDrawing = false;
    let isRevealed = false;

    // Set canvas dimensions dynamically
    function resizeCanvas() {
      canvas.width = scratchArea.offsetWidth;
      canvas.height = scratchArea.offsetHeight;
      drawCoating();
    }

    // Draw the sparkling rose-gold textured scratch coating
    function drawCoating() {
      // 1. Shimmering pink radial gradient coating
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        20,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 1.5
      );
      grad.addColorStop(0, '#FFE3E7');
      grad.addColorStop(0.4, '#FFB7C5');
      grad.addColorStop(1, '#D86B82');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Add organic noise/texture sparkles to simulate a real physical ticket
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 200; i++) {
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 3 + 1,
          Math.random() * 3 + 1
        );
      }

      // 3. Gold dust divider border
      ctx.strokeStyle = 'rgba(252, 225, 206, 0.4)';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

      // 4. Romantic typography instruction overlaid on the coating
      ctx.fillStyle = '#864e5a';
      ctx.font = 'bold 18px Quicksand, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌸 Rub to Scratch Off 🌸', canvas.width / 2, canvas.height / 2 - 10);

      ctx.fillStyle = '#6b3743';
      ctx.font = 'italic 14px Quicksand, sans-serif';
      ctx.fillText('Reveal a special promise...', canvas.width / 2, canvas.height / 2 + 15);
    }

    // Initialize/resize canvas sizing on open
    const waxSeal = document.getElementById('wax-seal');
    if (waxSeal) {
      waxSeal.addEventListener('click', () => {
        setTimeout(() => {
          resizeCanvas();
        }, 1800);
      });
    }

    // Listeners for window scaling
    window.addEventListener('resize', () => {
      if (document.body.classList.contains('unlocked') && !isRevealed) {
        resizeCanvas();
      }
    });

    let lastSparkleTime = 0;
    let lastPercentCheckTime = 0;

    // Scratch Action: Eraser Composite brush drawing
    function scratch(e) {
      if (!isDrawing || isRevealed) return;

      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;

      // Unify mobile touch coordinates & standard cursor coordinates
      if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Draw the transparent circle to erase the coating
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      const now = Date.now();

      // Lightweight throttled sparkles during dragging (at most once every 75ms, spawning just 2 sparks)
      if (!prefersReducedMotion && (now - lastSparkleTime > 75)) {
        lastSparkleTime = now;
        createSparkleSplash(clientX, clientY, 2);
      }

      // Throttled pixel percentage check to eliminate jank (at most once every 180ms)
      if (now - lastPercentCheckTime > 180) {
        lastPercentCheckTime = now;
        checkScratchPercentage();
      }
    }

    // Touch and mouse events handling
    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      scratch(e);
    });
    canvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', () => isDrawing = false);

    canvas.addEventListener('touchstart', (e) => {
      isDrawing = true;
      scratch(e);
    });
    canvas.addEventListener('touchmove', scratch);
    window.addEventListener('touchend', () => isDrawing = false);

    // High speed pixel analysis to determine scratched percentage
    function checkScratchPercentage() {
      if (isRevealed) return;

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;
      let transparentCount = 0;

      // Sample every 4th pixel alpha byte for extremely high performance
      for (let i = 3; i < pixels.length; i += 16) {
        if (pixels[i] === 0) {
          transparentCount++;
        }
      }

      const totalSamples = pixels.length / 16;
      const percentScratched = (transparentCount / totalSamples) * 100;

      // Once scratched 45%, auto-reveal & burst
      if (percentScratched >= 42) {
        revealTicket();
      }
    }

    function revealTicket() {
      isRevealed = true;
      canvas.classList.add('fade-out');

      // Helper prompt update
      if (scratchPrompt) {
        scratchPrompt.innerHTML = "A special birthday blessing for you! 💖✨";
        scratchPrompt.style.color = '#864e5a';
      }

      // Massive cherry blossom victory petal explosion!
      if (!prefersReducedMotion) {
        triggerBigPetalBurst(scratchArea);
      }
    }
  }

  // ——————————————————————————————————————————————————————
  // GLOBAL CUTE TOUCH/TAP SPARKLER EFFECT
  // ——————————————————————————————————————————————————————
  document.addEventListener('click', (e) => {
    // Avoid triggering on inputs or buttons to keep typing clean
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('.wax-seal') || e.target.closest('#vinyl-disc')) {
      return;
    }

    // Create a mini cherry blossom petal that pops up and drifts down!
    if (!prefersReducedMotion) {
      createMobileTapPetal(e.clientX, e.clientY);
    }
  });

  function createMobileTapPetal(x, y) {
    if (!x || !y) return;

    const petal = document.createElement('div');
    petal.className = 'tap-petal';

    // Style the tap-petal
    petal.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${Math.random() * 12 + 10}px;
      height: ${Math.random() * 10 + 8}px;
      background: ${['#FFB7C5', '#FFD1DC', '#FFE3E7'][Math.floor(Math.random() * 3)]};
      border-radius: 50% 0 50% 50%;
      pointer-events: none;
      z-index: 99999;
      opacity: 1;
      transform: translate(-50%, -50%) scale(0.5) rotate(${Math.random() * 360}deg);
      transition: all 1.2s cubic-bezier(0.1, 0.8, 0.3, 1);
    `;

    document.body.appendChild(petal);

    // Animate drift
    requestAnimationFrame(() => {
      const driftX = (Math.random() * 60 - 30);
      const driftY = (Math.random() * 40 + 30);
      const rotate = Math.random() * 180 - 90;
      petal.style.transform = `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(1) rotate(${rotate}deg)`;
      petal.style.opacity = '0';
    });

    setTimeout(() => petal.remove(), 1300);
  }

  // Spawn custom interactive heart/flower particle spray on Wax Seal breaking
  function triggerWaxSealHearts(x, y) {
    const emojis = ['💖', '🌸', '✨', '💕', '🌹'];
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        font-size: ${Math.random() * 1.5 + 1}rem;
        pointer-events: none;
        z-index: 10005;
        opacity: 1;
        transform: translate(-50%, -50%) scale(0.5);
        transition: all 1.2s cubic-bezier(0.1, 0.8, 0.3, 1);
      `;
      document.body.appendChild(p);

      requestAnimationFrame(() => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 140 + 40;
        p.style.transform = `translate(calc(-50% + ${Math.cos(angle) * speed}px), calc(-50% + ${Math.sin(angle) * speed - 40}px)) scale(1.2) rotate(${Math.random() * 180 - 90}deg)`;
        p.style.opacity = '0';
      });

      setTimeout(() => p.remove(), 1200);
    }
  }
});

