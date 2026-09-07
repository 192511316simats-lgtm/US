/* =========================================================
   OUR STORY — 20.12.2021 ♡
   Scrapbook Logic, 3D Page Turn, Photo Storage & Music
   ========================================================= */

(function () {
  'use strict';

  // --- State Variables ---
  let currentPage = 1;
  const totalPages = 21;
  let isTurning = false;
  let isMusicPlaying = false;
  let audioContext = null;
  let synthInterval = null;

  // --- DOM Elements ---
  const pages = document.querySelectorAll('.book-page');
  const btnNext = document.getElementById('btnNextPage');
  const btnPrev = document.getElementById('btnPrevPage');
  const btnOpenStory = document.getElementById('btnOpenStory');
  const currentPageNumEl = document.getElementById('currentPageNum');
  const totalPageNumEl = document.getElementById('totalPageNum');
  const progressTrack = document.getElementById('progressTrack');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicStatusText = document.getElementById('musicStatusText');
  const bgAudio = document.getElementById('bgAudio');
  const floatingHeartsBg = document.getElementById('floatingHeartsBg');
  const confettiCanvas = document.getElementById('confettiCanvas');
  const btnMarryYes = document.getElementById('btnMarryYes');
  const btnMarryYesOfCourse = document.getElementById('btnMarryYesOfCourse');
  const proposalAcceptedToast = document.getElementById('proposalAcceptedToast');

  // Set total count
  if (totalPageNumEl) {
    totalPageNumEl.textContent = totalPages < 10 ? '0' + totalPages : '' + totalPages;
  }

  // --- Initialize Progress Dots ---
  function initProgressDots() {
    if (!progressTrack) return;
    progressTrack.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const dot = document.createElement('div');
      dot.className = 'progress-dot' + (i === 1 ? ' active' : '');
      dot.dataset.page = i;
      dot.title = 'Page ' + i;
      dot.addEventListener('click', () => {
        if (i !== currentPage) {
          goToPage(i);
        }
      });
      progressTrack.appendChild(dot);
    }
  }

  // --- Subtle Page Turn Sound via Web Audio API ---
  function playPageTurnSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // Sound is optional
    }
  }

  // --- Page Navigation Functions ---
  function updatePageUI() {
    // Format page number
    const formatted = currentPage < 10 ? '0' + currentPage : '' + currentPage;
    if (currentPageNumEl) currentPageNumEl.textContent = formatted;

    // Update buttons
    if (btnPrev) btnPrev.disabled = (currentPage === 1);
    if (btnNext) btnNext.disabled = (currentPage === totalPages);

    // Update progress dots
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach((dot, idx) => {
      if (idx + 1 === currentPage) {
        dot.classList.add('active');
        dot.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        dot.classList.remove('active');
      }
    });

    // Update classes on pages for 3D flip effect
    pages.forEach(p => {
      const pageNum = parseInt(p.dataset.page, 10);
      if (pageNum < currentPage) {
        p.classList.remove('active');
        p.classList.add('flipped');
      } else if (pageNum === currentPage) {
        p.classList.remove('flipped');
        p.classList.add('active');
      } else {
        p.classList.remove('active', 'flipped');
      }
    });
  }

  function goToPage(targetPage) {
    if (targetPage < 1 || targetPage > totalPages || isTurning) return;
    isTurning = true;
    playPageTurnSound();

    currentPage = targetPage;
    updatePageUI();

    setTimeout(() => {
      isTurning = false;
    }, 600);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }

  // --- Event Listeners for Navigation ---
  if (btnNext) btnNext.addEventListener('click', nextPage);
  if (btnPrev) btnPrev.addEventListener('click', prevPage);
  if (btnOpenStory) btnOpenStory.addEventListener('click', () => goToPage(2));

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      nextPage();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      prevPage();
    }
  });

  // Touch Swipe Navigation
  let touchStartX = 0;
  let touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
      const diffX = e.changedTouches[0].clientX - touchStartX;
      const diffY = e.changedTouches[0].clientY - touchStartY;
      // Horizontal swipe detected
      if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          nextPage(); // swipe left -> next page
        } else {
          prevPage(); // swipe right -> previous page
        }
      }
    }
  }, { passive: true });

  // --- Real Photo Upload & LocalStorage Persistence ---
  function initPhotoUploads() {
    const polaroidFrames = document.querySelectorAll('.polaroid-frame');
    polaroidFrames.forEach(frame => {
      const photoId = frame.dataset.photoId;
      const fileInput = frame.querySelector('.hidden-photo-input');
      const previewImg = frame.querySelector('.uploaded-img-preview');
      const placeholder = frame.querySelector('.upload-placeholder-content');

      // Check localStorage for previously uploaded photo
      if (photoId) {
        try {
          const savedData = localStorage.getItem('our_story_' + photoId);
          if (savedData && previewImg && placeholder) {
            previewImg.src = savedData;
            previewImg.style.display = 'block';
            placeholder.style.display = 'none';
          }
        } catch (err) {
          console.warn('Storage read error:', err);
        }
      }

      // Click frame to open file selector
      frame.addEventListener('click', (e) => {
        // Prevent recursive trigger
        if (e.target !== fileInput && fileInput) {
          fileInput.click();
        }
      });

      // Handle file selection
      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
              const base64Url = event.target.result;
              if (previewImg && placeholder) {
                previewImg.src = base64Url;
                previewImg.style.display = 'block';
                placeholder.style.display = 'none';
              }
              if (photoId) {
                try {
                  localStorage.setItem('our_story_' + photoId, base64Url);
                } catch (saveErr) {
                  console.warn('Photo saved to UI (storage quota warning):', saveErr);
                }
              }
            };
            reader.readAsDataURL(file);
          }
        });
      }
    });
  }

  // --- Romantic Melody Synthesizer: "Un Vizhigalil" by G.V. Prakash ---
  // Plays romantic acoustic Tamil melody notes & chords with warm, harmonious acoustics
  function startRomanticSynth() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContext) {
        audioContext = new AudioCtx();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // "Un Vizhigalil" signature romantic melody notes (Acoustic E minor / G major scale)
      // E4, G4, A4, B4, C5, B4, A4, G4, F#4, G4, A4, G4, F#4, E4, D4, E4
      const melodyNotes = [
        329.63, 392.00, 440.00, 493.88, 523.25, 493.88, 440.00, 392.00,
        369.99, 392.00, 440.00, 392.00, 369.99, 329.63, 293.66, 329.63
      ];

      // Romantic chord roots for gentle background harmony
      const chordBasses = [164.81, 130.81, 196.00, 146.83]; // E3, C3, G3, D3
      let noteIndex = 0;

      synthInterval = setInterval(() => {
        if (!isMusicPlaying || !audioContext) return;
        const now = audioContext.currentTime;

        // --- Melody Note (Warm Music-Box / Acoustic Bell tone) ---
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(melodyNotes[noteIndex], now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(now);
        osc.stop(now + 0.7);

        // --- Gentle Soft Harmony Note every 4 beats ---
        if (noteIndex % 4 === 0) {
          const bassOsc = audioContext.createOscillator();
          const bassGain = audioContext.createGain();

          bassOsc.type = 'sine';
          const chordIndex = Math.floor(noteIndex / 4) % chordBasses.length;
          bassOsc.frequency.setValueAtTime(chordBasses[chordIndex], now);

          bassGain.gain.setValueAtTime(0.001, now);
          bassGain.gain.linearRampToValueAtTime(0.035, now + 0.1);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

          bassOsc.connect(bassGain);
          bassGain.connect(audioContext.destination);

          bassOsc.start(now);
          bassOsc.stop(now + 1.9);
        }

        noteIndex = (noteIndex + 1) % melodyNotes.length;
      }, 520);
    } catch (e) {
      console.warn('Synth error:', e);
    }
  }

  function stopRomanticSynth() {
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
  }

  // --- Music Toggle Handler ---
  function toggleMusic() {
    if (isMusicPlaying) {
      // Pause music
      isMusicPlaying = false;
      if (bgAudio && !bgAudio.paused) {
        bgAudio.pause();
      }
      stopRomanticSynth();
      if (musicToggleBtn) musicToggleBtn.classList.remove('playing');
      if (musicStatusText) musicStatusText.textContent = 'MUSIC: OFF';
    } else {
      // Play music
      isMusicPlaying = true;
      if (musicToggleBtn) musicToggleBtn.classList.add('playing');
      if (musicStatusText) musicStatusText.textContent = 'MUSIC: ON';

      // Only attempt to play HTML5 audio if user has attached an audio file
      if (bgAudio && bgAudio.src && bgAudio.src.length > 0 && !bgAudio.src.endsWith('/')) {
        bgAudio.play().catch(() => {
          startRomanticSynth();
        });
      } else {
        startRomanticSynth();
      }
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', toggleMusic);
  }

  // Custom audio file input listener
  const audioFileInput = document.getElementById('audioFileInput');
  if (audioFileInput) {
    audioFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file && bgAudio) {
        const objectUrl = URL.createObjectURL(file);
        bgAudio.src = objectUrl;
        stopRomanticSynth();
        if (isMusicPlaying) {
          bgAudio.play().catch(console.warn);
        }
      }
    });
  }

  // --- Floating Hearts Generator ---
  function spawnFloatingHearts() {
    if (!floatingHeartsBg) return;
    const heartSymbols = ['♡', '♥', '🌸', '✨', '💖'];
    setInterval(() => {
      const heart = document.createElement('span');
      heart.className = 'floating-heart';
      heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
      heart.style.left = Math.random() * 96 + 'vw';
      heart.style.animationDuration = (6 + Math.random() * 5) + 's';
      heart.style.fontSize = (14 + Math.random() * 16) + 'px';
      floatingHeartsBg.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 10000);
    }, 1200);
  }

  // --- Romantic Confetti Effect on Proposal ---
  function triggerRomanticConfetti() {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ff7597', '#d9538f', '#dfb15b', '#f8a5c2', '#ffffff', '#ffd6e7'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: confettiCanvas.width / 2,
        y: confettiCanvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.4 ? 'heart' : 'circle',
        alpha: 1
      });
    }

    let animationFrame;
    function renderConfetti() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let activeCount = 0;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.vRot;
        p.alpha -= 0.008;

        if (p.alpha > 0) {
          activeCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;

          if (p.shape === 'heart') {
            ctx.font = `${p.size * 1.5}px serif`;
            ctx.fillText('♥', 0, 0);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      if (activeCount > 0) {
        animationFrame = requestAnimationFrame(renderConfetti);
      } else {
        cancelAnimationFrame(animationFrame);
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }

    renderConfetti();

    // Show proposal toast
    if (proposalAcceptedToast) {
      proposalAcceptedToast.style.display = 'block';
    }
  }

  if (btnMarryYes) {
    btnMarryYes.addEventListener('click', triggerRomanticConfetti);
  }
  if (btnMarryYesOfCourse) {
    btnMarryYesOfCourse.addEventListener('click', triggerRomanticConfetti);
  }

  // --- Initial Setup ---
  initProgressDots();
  initPhotoUploads();
  spawnFloatingHearts();
  updatePageUI();

  // Resize listener for confetti
  window.addEventListener('resize', () => {
    if (confettiCanvas) {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
  });

})();
