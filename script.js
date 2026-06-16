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
  const prefersReducedMotion = false;

  // ——————————————————————————————————————————————————————
  // 1. BACKGROUND MUSIC & AUTOPLAY LOGIC
  // ——————————————————————————————————————————————————————
  const audio = new Audio('./assets/music.mp3');
  audio.loop = false;
  audio.volume = 0.6; // Soft, romantic level

  const vinylDisc = document.getElementById('vinyl-disc');
  const musicStatusText = document.getElementById('music-status-text');

  function toggleMusic() {
    const tutorialBubble = document.getElementById('music-tutorial-bubble');
    if (tutorialBubble) {
      tutorialBubble.classList.remove('show');
      setTimeout(() => {
        tutorialBubble.innerText = "You can pause or play audio message from here 🌸";
      }, 600);
    }
    if (audio.paused) {
      if (audio.ended) {
        audio.currentTime = 0;
      }
      audio.play().then(() => {
        vinylDisc.classList.add('playing');
        if (musicStatusText) musicStatusText.innerText = "Playing Sweet Melody";
      }).catch(err => console.log("Audio play blocked by browser:", err));
    } else {
      audio.pause();
      vinylDisc.classList.remove('playing');
      if (musicStatusText) musicStatusText.innerText = "Audio Message Paused";
    }
  }

  // Interactive vinyl player widget control
  if (vinylDisc) {
    vinylDisc.addEventListener('click', toggleMusic);
  }

  // Music ended callback to show play again tooltip
  audio.addEventListener('ended', () => {
    if (vinylDisc) vinylDisc.classList.remove('playing');
    if (musicStatusText) musicStatusText.innerText = "Audio Message Ended";

    const tutorialBubble = document.getElementById('music-tutorial-bubble');
    if (tutorialBubble) {
      tutorialBubble.innerText = "You can play the audio message again 🌸";
      tutorialBubble.classList.add('show');
      setTimeout(() => {
        if (tutorialBubble.innerText.includes("again")) {
          tutorialBubble.classList.remove('show');
        }
      }, 6000);
    }
  });

  // Music tutorial bubble click to dismiss
  const tutorialBubble = document.getElementById('music-tutorial-bubble');
  if (tutorialBubble) {
    tutorialBubble.addEventListener('click', () => {
      tutorialBubble.classList.remove('show');
    });
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

    // 3. Slide the entire envelope screen overlay away after envelope fully unfolds and slides up
    setTimeout(() => {
      if (envelopeScreen) {
        envelopeScreen.classList.add('hidden');
        // Completely disable rendering and animations of the screen after it fades out
        setTimeout(() => {
          envelopeScreen.style.display = 'none';
        }, 1250);
      }
      document.body.classList.add('unlocked');

      // Start the falling petal shower
      if (!prefersReducedMotion) {
        startPetalShower();
      }

      // Trigger standard scroll reveal observer
      initScrollReveal();

      // Trigger music tutorial bubble show/hide logic
      if (tutorialBubble) {
        setTimeout(() => {
          tutorialBubble.classList.add('show');
          setTimeout(() => {
            tutorialBubble.classList.remove('show');
          }, 3500);
        }, 800);
      }
    }, 1600); // Transition to main page after envelope fully unfolds!
  }

  if (waxSeal && envelopeScreen && envelopeWrapper) {
    waxSeal.addEventListener('click', handleSealBreak);
    waxSeal.addEventListener('touchstart', handleSealBreak, { passive: false });
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
      const petal = document.createElement("div");
      petal.classList.add("svg-petal");

      // Set petal shape using border-radius (classic cherry blossom style)
      petal.style.borderRadius = "50% 0 50% 50%";

      // Choose a beautiful linear gradient representing pink, peach, or blush
      const gradients = [
        "linear-gradient(135deg, #FFE3E7 0%, #FFB7C5 100%)",
        "linear-gradient(135deg, #FFE3E7 0%, #FFD1DC 100%)",
        "linear-gradient(135deg, #FFE3E7 0%, #FCE1CE 100%)"
      ];
      petal.style.background = gradients[Math.floor(Math.random() * gradients.length)];

      // Configure random drop characteristics
      const size = Math.random() * 20 + 15; // 15px to 35px
      const leftPos = Math.random() * 100; // 0% to 100% viewport width
      const duration = Math.random() * 12 + 10; // 10s to 22s
      const delay = Math.random() * -20; // Negative delay so they start immediately distributed

      petal.style.width = `${size}px`;
      petal.style.height = `${size * 1.1}px`;
      petal.style.left = `${leftPos}vw`;
      petal.style.animation = `petalDrop ${duration}s linear ${delay}s infinite`;

      petalContainer.appendChild(petal);
    }

    for (let i = 0; i < PETAL_COUNT; i++) {
      createPetal();
    }
  }

  // ——————————————————————————————————————————————————————
  // 4. SCRAPBOOK FLIP ACTION & POLAROID MODAL LIGHTBOX WITH 3D FLIP
  // ——————————————————————————————————————————————————————
  const scrapbookCard = document.getElementById('scrapbook-card');
  const polaroidLeft = document.getElementById('polaroid-left');
  const polaroidRight = document.getElementById('polaroid-right');
  const polaroidModal = document.getElementById('polaroid-modal');
  const modalFlipCard = document.getElementById('modal-flip-card');
  const modalImgFront = document.getElementById('modal-img-front');
  const modalImgBack = document.getElementById('modal-img-back');
  const modalTagFront = document.getElementById('modal-tag-front');
  const polaroidModalClose = document.getElementById('polaroid-modal-close');
  const polaroidModalBackdrop = document.getElementById('polaroid-modal-backdrop');

  if (scrapbookCard) {
    scrapbookCard.addEventListener('click', (e) => {
      // Don't flip the parent scrapbook card if we clicked a polaroid frame
      if (e.target.closest('.polaroid-frame')) {
        return;
      }
      scrapbookCard.classList.toggle('flipped');
      if (!prefersReducedMotion) {
        const x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2);
        const y = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2);
        createSparkleSplash(x, y, 6);
      }
    });
  }

  // Physics-based dynamic 3D rotation variables for Polaroid modal card
  let currentAngle = 0;
  let isDragging = false;
  let startX = 0;
  let startAngle = 0;
  let velocity = 0;
  let rotationSpeed = 1.35; // Initial slow spin speed (degrees per frame)
  const autoSpinSpeed = 1.35;
  const friction = 0.95; // Momentum decay rate
  let animationId = null;
  let previousAngle = 0;

  function updateRotation() {
    if (!polaroidModal || !polaroidModal.classList.contains('active')) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      return;
    }

    if (!isDragging) {
      // Rotate card by rotation speed
      currentAngle += rotationSpeed;

      // Smoothly decay fast spin speed back down to default autoSpinSpeed
      if (rotationSpeed > autoSpinSpeed) {
        rotationSpeed = autoSpinSpeed + (rotationSpeed - autoSpinSpeed) * friction;
      } else if (rotationSpeed < -autoSpinSpeed) {
        rotationSpeed = -autoSpinSpeed + (rotationSpeed + autoSpinSpeed) * friction;
      }

      if (modalFlipCard) {
        const inner = modalFlipCard.querySelector('.modal-card-inner');
        if (inner) {
          inner.style.transform = `rotateY(${currentAngle}deg)`;
        }
      }
    }

    animationId = requestAnimationFrame(updateRotation);
  }

  function startDrag(clientX) {
    isDragging = true;
    startX = clientX;
    startAngle = currentAngle;
    previousAngle = currentAngle;
    velocity = 0;
  }

  function moveDrag(clientX) {
    if (!isDragging) return;

    const deltaX = clientX - startX;
    // Map mouse movement to Y-rotation: 0.5 degrees per pixel
    const nextAngle = startAngle + deltaX * 0.5;

    // Capture instantaneous drag velocity
    velocity = nextAngle - currentAngle;
    currentAngle = nextAngle;

    if (modalFlipCard) {
      const inner = modalFlipCard.querySelector('.modal-card-inner');
      if (inner) {
        inner.style.transform = `rotateY(${currentAngle}deg)`;
      }
    }
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;

    // Convert drag velocity to momentum spin (capped to avoid excessive speeds)
    rotationSpeed = Math.max(-15, Math.min(15, velocity));

    // If released with negligible velocity, resume normal spin direction
    if (Math.abs(rotationSpeed) < 0.1) {
      rotationSpeed = autoSpinSpeed;
    }
  }

  // Register drag and hold events on the modal flip card
  if (modalFlipCard) {
    // Mouse events
    modalFlipCard.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startDrag(e.clientX);
    });
    window.addEventListener('mousemove', (e) => {
      moveDrag(e.clientX);
    });
    window.addEventListener('mouseup', () => {
      endDrag();
    });

    // Touch events for mobile swiping
    modalFlipCard.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        startDrag(e.touches[0].clientX);
      }
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        moveDrag(e.touches[0].clientX);
      }
    }, { passive: true });
    window.addEventListener('touchend', () => {
      endDrag();
    });
  }

  // Helper function to open the 3D Lightbox Modal
  function open3DModal(imgFrontSrc, imgBackSrc, tagUrdu, e) {
    if (!polaroidModal || !modalFlipCard) return;

    modalImgFront.src = imgFrontSrc;
    modalImgBack.src = imgBackSrc;
    modalTagFront.innerHTML = tagUrdu;

    // Reset rotation variables
    currentAngle = 0;
    rotationSpeed = autoSpinSpeed;
    isDragging = false;

    // Reset rotation before opening modal
    const inner = modalFlipCard.querySelector('.modal-card-inner');
    if (inner) {
      inner.style.transform = 'rotateY(0deg)';
    }

    polaroidModal.classList.add('active');

    // Start rotation loop
    if (!animationId) {
      animationId = requestAnimationFrame(updateRotation);
    }

    if (!prefersReducedMotion) {
      const x = e.clientX || window.innerWidth / 2;
      const y = e.clientY || window.innerHeight / 2;
      createSparkleSplash(x, y, 10);
      triggerWaxSealHearts(x, y);
    }
  }

  if (polaroidLeft) {
    polaroidLeft.addEventListener('click', (e) => {
      e.stopPropagation(); // Stop parent scrapbook card from flipping
      open3DModal('assets/eye1.png', 'assets/flower_bouquet_vintage.png', 'آپ کی آنکھیں 👀', e);
    });
  }

  if (polaroidRight) {
    polaroidRight.addEventListener('click', (e) => {
      e.stopPropagation(); // Stop parent scrapbook card from flipping
      open3DModal('assets/eye2.png', 'assets/floral_scrapbook_blossoms.png', 'آپ کی نظریں 💖', e);
    });
  }

  // Close Modal
  const closeModal = () => {
    if (polaroidModal) {
      polaroidModal.classList.remove('active');
    }
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  if (polaroidModalClose) polaroidModalClose.addEventListener('click', closeModal);
  if (polaroidModalBackdrop) polaroidModalBackdrop.addEventListener('click', closeModal);

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

      // Play synthesized Happy Birthday melody and fade BGM
      playHappyBirthdayMelody();
      fadePauseBGM(8500);

      // Trigger petal burst & cake fireworks cascade
      if (!prefersReducedMotion) {
        triggerBigPetalBurst(cakeSurpriseCard);
        const cakeWrapper = document.querySelector('.cake-wrapper');
        if (cakeWrapper) {
          spawnBalloonsCascade(cakeWrapper);
        }
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
      if (!scratchArea || scratchArea.offsetWidth === 0 || scratchArea.offsetHeight === 0) return;
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

    // Call on load
    setTimeout(resizeCanvas, 300);

    // IntersectionObserver to guarantee layout visibility sizing
    if ('IntersectionObserver' in window) {
      const scratchObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isRevealed) {
            resizeCanvas();
            if (canvas.width > 0) {
              scratchObserver.unobserve(scratchArea);
            }
          }
        });
      }, { threshold: 0.05 });
      scratchObserver.observe(scratchArea);
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

      // Throttled pixel percentage check to eliminate jank (at most once every 350ms during drawing)
      if (now - lastPercentCheckTime > 350) {
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
    window.addEventListener('mouseup', () => {
      if (isDrawing) {
        isDrawing = false;
        checkScratchPercentage();
      }
    });

    canvas.addEventListener('touchstart', (e) => {
      isDrawing = true;
      scratch(e);
    });
    canvas.addEventListener('touchmove', scratch);
    window.addEventListener('touchend', () => {
      if (isDrawing) {
        isDrawing = false;
        checkScratchPercentage();
      }
    });

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

      // Play synthesized arpeggio success sound
      playScratchSuccessSound();

      // Massive cherry blossom victory petal explosion & fireworks cascade!
      if (!prefersReducedMotion) {
        triggerBigPetalBurst(scratchArea);
        spawnFireworksCascade(scratchArea);
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

  // ——————————————————————————————————————————————————————
  // 9. PREMIUM AUDIO SYNTHESIS (WEB AUDIO API)
  // ——————————————————————————————————————————————————————
  let synthAudioCtx = null;

  function initSynthAudio() {
    if (!synthAudioCtx) {
      synthAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (synthAudioCtx.state === 'suspended') {
      synthAudioCtx.resume();
    }
  }

  // Global user gesture listener to unlock Web Audio API AudioContext immediately
  function unlockAudioContext() {
    initSynthAudio();
    // Remove listeners once unlocked
    document.removeEventListener('click', unlockAudioContext);
    document.removeEventListener('touchstart', unlockAudioContext);
  }
  document.addEventListener('click', unlockAudioContext);
  document.addEventListener('touchstart', unlockAudioContext);

  // Premium polyphonic synthesizer helper with detuned chorus, echo decay and ADSR envelopes
  function playRichChime(notes, type = 'sine', duration = 1.6, stagger = 0.08, volume = 0.4) {
    initSynthAudio();
    const now = synthAudioCtx.currentTime;

    // Create dreamy stereo-emulated echo delay network
    const delay = synthAudioCtx.createDelay();
    delay.delayTime.value = 0.28; // 280ms echo time

    const feedback = synthAudioCtx.createGain();
    feedback.gain.value = 0.35; // 35% echo volume feedback

    const filter = synthAudioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800; // soft warmth filter for echo tail

    // Feedback loop routing
    delay.connect(feedback);
    feedback.connect(filter);
    filter.connect(delay);

    const masterGain = synthAudioCtx.createGain();
    masterGain.gain.setValueAtTime(volume, now);

    delay.connect(masterGain);
    masterGain.connect(synthAudioCtx.destination);

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * stagger;

      // Detuned dual oscillators for rich analog chorused voice
      const osc1 = synthAudioCtx.createOscillator();
      const osc2 = synthAudioCtx.createOscillator();
      // High frequency harmonic oscillator for bell-like music box shimmer
      const oscHarmonic = synthAudioCtx.createOscillator();

      const gain = synthAudioCtx.createGain();

      osc1.type = type;
      osc2.type = type;
      oscHarmonic.type = 'sine';

      osc1.frequency.setValueAtTime(freq, noteTime);
      osc2.frequency.setValueAtTime(freq + 2.5, noteTime); // slightly detuned (+2.5 Hz)
      oscHarmonic.frequency.setValueAtTime(freq * 2, noteTime); // 2nd harmonic (octave above)

      gain.gain.setValueAtTime(0.0, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.012); // fast attack (12ms)
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration); // smooth decay

      osc1.connect(gain);
      osc2.connect(gain);

      // Connect high harmonic gain
      const harmonicGain = synthAudioCtx.createGain();
      harmonicGain.gain.setValueAtTime(0.04, noteTime);
      oscHarmonic.connect(harmonicGain);
      harmonicGain.connect(gain);

      gain.connect(masterGain);
      gain.connect(delay); // route into delay echo

      osc1.start(noteTime);
      osc2.start(noteTime);
      oscHarmonic.start(noteTime);

      osc1.stop(noteTime + duration + 0.1);
      osc2.stop(noteTime + duration + 0.1);
      oscHarmonic.stop(noteTime + duration + 0.1);
    });
  }

  function playScratchSuccessSound() {
    // Upward sweeping magical bell sparkle
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
    playRichChime(notes, 'sine', 1.8, 0.05, 0.45);
  }

  function playHappyBirthdayMelody() {
    initSynthAudio();
    const now = synthAudioCtx.currentTime;

    const delay = synthAudioCtx.createDelay();
    delay.delayTime.value = 0.22; // 220ms echo delay for sweet chimes

    const feedback = synthAudioCtx.createGain();
    feedback.gain.value = 0.20; // 20% echo feedback for spatial depth without mud

    delay.connect(feedback);
    feedback.connect(delay);

    const masterGain = synthAudioCtx.createGain();
    masterGain.gain.setValueAtTime(0.4, now); // Sweet volume level

    delay.connect(masterGain);
    masterGain.connect(synthAudioCtx.destination);

    // High-pitched monophonic music box arrangement (scaled to ~7.5 seconds)
    const speedFactor = 0.55;
    const melody = [
      { f: 523.25, t: 0.0, d: 0.4 },   // C5
      { f: 523.25, t: 0.4, d: 0.2 },   // C5
      { f: 587.33, t: 0.6, d: 0.5 },   // D5
      { f: 523.25, t: 1.2, d: 0.5 },   // C5
      { f: 698.46, t: 1.8, d: 0.5 },   // F5
      { f: 659.25, t: 2.4, d: 0.9 },   // E5

      { f: 523.25, t: 3.5, d: 0.4 },   // C5
      { f: 523.25, t: 3.9, d: 0.2 },   // C5
      { f: 587.33, t: 4.1, d: 0.5 },   // D5
      { f: 523.25, t: 4.7, d: 0.5 },   // C5
      { f: 783.99, t: 5.3, d: 0.5 },   // G5
      { f: 698.46, t: 5.9, d: 0.9 },   // F5

      { f: 523.25, t: 7.0, d: 0.4 },   // C5
      { f: 523.25, t: 7.4, d: 0.2 },   // C5
      { f: 1046.50, t: 7.6, d: 0.6 },  // C6
      { f: 880.00, t: 8.2, d: 0.6 },   // A5
      { f: 698.46, t: 8.8, d: 0.6 },   // F5
      { f: 659.25, t: 9.4, d: 0.6 },   // E5
      { f: 587.33, t: 10.0, d: 0.8 },  // D5

      { f: 932.33, t: 11.0, d: 0.4 },  // Bb5
      { f: 932.33, t: 11.4, d: 0.2 },  // Bb5
      { f: 880.00, t: 11.6, d: 0.6 },  // A5
      { f: 698.46, t: 12.2, d: 0.6 },  // F5
      { f: 783.99, t: 12.8, d: 0.6 },  // G5
      { f: 698.46, t: 12.9, d: 1.0 }   // F5
    ];

    melody.forEach(({ f, t, d }) => {
      const noteTime = now + (t * speedFactor);
      const duration = d * speedFactor;

      const osc = synthAudioCtx.createOscillator();
      const oscOvertone = synthAudioCtx.createOscillator();
      const noteGain = synthAudioCtx.createGain();
      const overtoneGain = synthAudioCtx.createGain();

      osc.type = 'triangle'; // triangle is soft and bell-like at high frequencies
      osc.frequency.setValueAtTime(f, noteTime);

      oscOvertone.type = 'sine';
      oscOvertone.frequency.setValueAtTime(f * 3, noteTime); // 3rd harmonic quint shimmer

      noteGain.gain.setValueAtTime(0.0, noteTime);
      noteGain.gain.linearRampToValueAtTime(0.24, noteTime + 0.005); // sharp attack
      noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration); // exponential decay

      overtoneGain.gain.setValueAtTime(0.015, noteTime); // soft chime overtone

      osc.connect(noteGain);
      oscOvertone.connect(overtoneGain);
      overtoneGain.connect(noteGain);

      noteGain.connect(masterGain);
      noteGain.connect(delay);

      osc.start(noteTime);
      oscOvertone.start(noteTime);
      osc.stop(noteTime + duration + 0.1);
      oscOvertone.stop(noteTime + duration + 0.1);
    });
  }

  function fadePauseBGM(durationMs) {
    if (audio && !audio.paused) {
      const originalVolume = audio.volume;
      let vol = originalVolume;

      // Fade out BGM
      const fadeOutInterval = setInterval(() => {
        vol -= 0.05;
        if (vol <= 0) {
          audio.volume = 0;
          audio.pause();
          clearInterval(fadeOutInterval);
        } else {
          audio.volume = vol;
        }
      }, 50);

      // Schedule BGM resume with fade in
      setTimeout(() => {
        audio.volume = 0;
        audio.play().then(() => {
          let volIn = 0;
          const fadeInInterval = setInterval(() => {
            volIn += 0.05;
            if (volIn >= originalVolume) {
              audio.volume = originalVolume;
              clearInterval(fadeInInterval);
            } else {
              audio.volume = volIn;
            }
          }, 50);
        }).catch(err => console.log("BGM play failed on resume:", err));
      }, durationMs);
    }
  }

  // ——————————————————————————————————————————————————————
  // 10. PREMIUM FIREWORKS CELEBRATION EFFECTS
  // ——————————————————————————————————————————————————————
  function spawnFireworksCascade(element) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // 3 bursts at left-center, right-center, and middle-top
    const bursts = [
      { x: rect.left + width * 0.2, y: rect.top + height * 0.35 },
      { x: rect.left + width * 0.8, y: rect.top + height * 0.25 },
      { x: rect.left + width * 0.5, y: rect.top + height * 0.5 }
    ];

    bursts.forEach((pos, idx) => {
      setTimeout(() => {
        createFireworkBurst(pos.x, pos.y);
      }, idx * 350);
    });
  }

  function createFireworkBurst(x, y) {
    const colors = ['#FFB7C5', '#FFD1DC', '#FFE3E7', '#FCE1CE', '#BAE6FD', '#FDE047', '#C084FC'];
    const emojis = ['✨', '🌸', '💖', '⭐', '🎈', '🎉'];
    const particleCount = 28;

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'firework-particle';

      const useEmoji = Math.random() > 0.4;
      if (useEmoji) {
        p.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.fontSize = `${Math.random() * 0.8 + 0.8}rem`;
      } else {
        p.style.width = `${Math.random() * 8 + 5}px`;
        p.style.height = p.style.width;
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.borderRadius = '50%';
        p.style.boxShadow = '0 0 8px rgba(255,183,197,0.5)';
      }

      p.style.left = `${x + window.scrollX}px`;
      p.style.top = `${y + window.scrollY}px`;
      p.style.opacity = '1';
      p.style.transform = 'translate(-50%, -50%) scale(0.5)';

      document.body.appendChild(p);

      // Calculate random explosion angle and distance
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.2 - 0.1);
      const distance = Math.random() * 120 + 60;

      requestAnimationFrame(() => {
        const destX = Math.cos(angle) * distance;
        const destY = Math.sin(angle) * distance - 25; // float slightly upwards
        p.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.1) rotate(${Math.random() * 720 - 360}deg)`;
        p.style.opacity = '0';
      });

      setTimeout(() => p.remove(), 1250);
    }
  }

  function spawnBalloonsCascade(element) {
    if (!element) return;
    const rect = element.getBoundingClientRect();

    const count = 16;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const balloon = document.createElement('div');
        balloon.className = 'balloon-particle';
        balloon.innerText = '🎈';
        balloon.style.fontSize = `${Math.random() * 1.2 + 1.2}rem`;
        balloon.style.left = `${rect.left + Math.random() * rect.width + window.scrollX}px`;
        balloon.style.top = `${rect.bottom + window.scrollY}px`;
        balloon.style.opacity = '1';
        balloon.style.transform = 'translate(-50%, 0) scale(0.5)';

        document.body.appendChild(balloon);

        requestAnimationFrame(() => {
          const driftX = Math.random() * 80 - 40;
          const driftY = -(Math.random() * 150 + 150); // float upwards
          balloon.style.transform = `translate(calc(-50% + ${driftX}px), ${driftY}px) scale(1.2) rotate(${Math.random() * 40 - 20}deg)`;
          balloon.style.opacity = '0';
        });

        setTimeout(() => balloon.remove(), 2500);
      }, i * 120);
    }
  }

  // celebrate-btn click celebration logic
  const celebrateBtn = document.getElementById('celebrate-btn');
  if (celebrateBtn) {
    celebrateBtn.addEventListener('click', (e) => {
      playCelebrateChime();
      const rect = celebrateBtn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      createSparkleSplash(x, y, 16);
      triggerBigPetalBurst(celebrateBtn);
      spawnConfettiShower();
    });
  }

  function playCelebrateChime() {
    // Elegant celebratory arpeggio: C5 -> E5 -> G5 -> B5 -> D6 -> G6 using music box sound
    const notes = [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98];
    playRichChime(notes, 'triangle', 2.0, 0.07, 0.5);
  }

  function spawnConfettiShower() {
    const colors = ['#FFB7C5', '#FFD1DC', '#FFE3E7', '#FCE1CE', '#BAE6FD', '#FDE047', '#C084FC'];
    const confettiCount = 55;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      const size = Math.random() * 8 + 6;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const startLeft = Math.random() * 100;
      const delay = Math.random() * 1.2;
      const duration = Math.random() * 3.5 + 2.5;

      confetti.style.cssText = `
        position: fixed;
        top: -20px;
        left: ${startLeft}vw;
        width: ${size}px;
        height: ${size * (Math.random() * 1.2 + 0.6)}px;
        background: ${color};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        pointer-events: none;
        z-index: 99999;
        opacity: 0.95;
        transform: translateY(0) rotate(${Math.random() * 360}deg);
        transition: transform ${duration}s linear ${delay}s, opacity ${duration}s ease-out ${delay}s;
      `;

      document.body.appendChild(confetti);

      requestAnimationFrame(() => {
        const driftX = Math.random() * 150 - 75;
        confetti.style.transform = `translate(${driftX}px, 105vh) rotate(${Math.random() * 1080 - 540}deg)`;
        confetti.style.opacity = '0';
      });

      setTimeout(() => confetti.remove(), (duration + delay) * 1000);
    }
  }
});

