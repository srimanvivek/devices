(() => {
  "use strict";

  /* ---------- elements ---------- */
  const bootScreen = document.getElementById("boot-screen");
  const enterBtn   = document.getElementById("enter-btn");
  const restartBtn = document.getElementById("restart-btn");
  const app        = document.getElementById("app");
  const track      = document.getElementById("track");
  const pages      = Array.from(document.querySelectorAll(".page"));
  const caps       = Array.from(document.querySelectorAll(".meter .cap"));
  const meterLabel = document.getElementById("meter-label");
  const prevBtn    = document.getElementById("prev-btn");
  const nextBtn    = document.getElementById("next-btn");
  const muteBtn    = document.getElementById("mute-btn");
  const audio      = document.getElementById("bg-audio");
  const cursorDot  = document.getElementById("cursor-dot");
  const particles  = document.getElementById("particles");
  const typewriterEl = document.getElementById("typewriter");

  const total = pages.length;
  let current = 0;
  let muted = false;
  let audioCtx = null;

  const meterLabels = ["mild", "getting personal", "spicy", "unhinged", "no chill", "certified menace", "roast complete"];
  const emojiSet = ["💀", "🔥", "🫠", "💾", "⚡", "😭"];

  /* ---------- typewriter on boot screen ---------- */
  const fullTitle = "your pc didn't just start. it survived.";
  let twIndex = 0;
  function typeTick() {
    if (twIndex <= fullTitle.length) {
      typewriterEl.textContent = fullTitle.slice(0, twIndex);
      twIndex++;
      setTimeout(typeTick, 32);
    }
  }
  typeTick();

  /* ---------- ambient floating particles ---------- */
  function spawnParticle() {
    const span = document.createElement("span");
    span.className = "particle";
    span.textContent = emojiSet[Math.floor(Math.random() * emojiSet.length)];
    const startX = Math.random() * 100;
    const driftX = (Math.random() * 120 - 60) + "px";
    const duration = 7 + Math.random() * 6;
    span.style.left = startX + "vw";
    span.style.setProperty("--drift-x", driftX);
    span.style.animationDuration = duration + "s";
    span.style.fontSize = (0.9 + Math.random() * 1) + "rem";
    particles.appendChild(span);
    span.addEventListener("animationend", () => span.remove());
  }
  setInterval(spawnParticle, 1400);

  /* ---------- custom cursor (mouse only) ---------- */
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
  });
  document.addEventListener("pointerover", (e) => {
    if (e.target.closest("button, a, .sticker")) cursorDot.classList.add("is-active");
  });
  document.addEventListener("pointerout", (e) => {
    if (e.target.closest("button, a, .sticker")) cursorDot.classList.remove("is-active");
  });

  /* ---------- tiny synth blips (no audio file needed) ---------- */
  function beep(freq = 520, dur = 0.08, type = "square") {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = 0.06;
      osc.connect(gain).connect(audioCtx.destination);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (e) { /* audio not available, ignore */ }
  }

  /* ---------- boot -> app ---------- */
  function enterApp() {
    beep(660, 0.1);
    bootScreen.style.display = "none";
    app.hidden = false;
    goTo(0, false);

    audio.volume = 0.55;
    audio.play().catch(() => {});
  }
  enterBtn.addEventListener("click", enterApp);
  if (restartBtn) restartBtn.addEventListener("click", () => { beep(440, 0.1); goTo(0, true); });

  /* ---------- page navigation ---------- */
  function goTo(index, smooth = true) {
    current = Math.max(0, Math.min(total - 1, index));
    track.style.transition = smooth ? "" : "none";
    track.style.transform = `translateX(-${current * 100}%)`;
    updateChrome();
  }

  function updateChrome() {
    caps.forEach((cap, i) => {
      cap.classList.toggle("is-active", i === current);
      cap.classList.toggle("is-past", i < current);
    });
    meterLabel.textContent = meterLabels[current];
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }

  prevBtn.addEventListener("click", () => { beep(380, 0.05); goTo(current - 1); });
  nextBtn.addEventListener("click", () => { beep(380, 0.05); goTo(current + 1); });

  window.addEventListener("keydown", (e) => {
    if (app.hidden) return;
    if (e.key === "ArrowRight") { beep(380, 0.05); goTo(current + 1); }
    if (e.key === "ArrowLeft")  { beep(380, 0.05); goTo(current - 1); }
  });

  /* ---------- swipe (mobile) ---------- */
  let touchStartX = 0, touchDeltaX = 0, swiping = false;

  track.addEventListener("touchstart", (e) => {
    if (e.target.closest(".sticker")) return; // let sticker drag win
    touchStartX = e.touches[0].clientX;
    touchDeltaX = 0;
    swiping = true;
    track.style.transition = "none";
  }, { passive: true });

  track.addEventListener("touchmove", (e) => {
    if (!swiping) return;
    touchDeltaX = e.touches[0].clientX - touchStartX;
    const base = -current * window.innerWidth;
    track.style.transform = `translateX(${base + touchDeltaX}px)`;
  }, { passive: true });

  track.addEventListener("touchend", () => {
    if (!swiping) return;
    swiping = false;
    track.style.transition = "";
    const threshold = window.innerWidth * 0.16;
    if (touchDeltaX < -threshold) goTo(current + 1);
    else if (touchDeltaX > threshold) goTo(current - 1);
    else goTo(current);
  });

  /* ---------- mute toggle ---------- */
  muteBtn.addEventListener("click", () => {
    muted = !muted;
    audio.muted = muted;
    muteBtn.textContent = muted ? "🔇" : "🔊";
    if (!muted && audio.paused) audio.play().catch(() => {});
  });

  /* ---------- polaroid tilt on mouse move (desktop only) ---------- */
  document.querySelectorAll(".polaroid").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotate(${x * 10}deg) scale(1.03)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  /* ---------- roast buttons: cycle jokes on tap ---------- */
  document.querySelectorAll(".roast-btn").forEach((btn) => {
    const jokes = btn.dataset.jokes.split("|");
    const output = btn.nextElementSibling;
    let count = 0;
    btn.addEventListener("click", () => {
      beep(300 + Math.random() * 300, 0.09, "sawtooth");
      output.textContent = jokes[count % jokes.length];
      output.style.animation = "none";
      // restart a quick pop-in
      void output.offsetWidth;
      output.style.transition = "opacity .25s ease";
      output.style.opacity = "0";
      requestAnimationFrame(() => { output.style.opacity = "1"; });
      count++;
    });
  });

  /* ---------- draggable stickers (pointer events, works touch + mouse) ---------- */
  let dragTarget = null;
  let dragOffsetX = 0, dragOffsetY = 0;

  document.addEventListener("pointerdown", (e) => {
    const sticker = e.target.closest(".sticker");
    if (!sticker) return;
    dragTarget = sticker;
    const rect = sticker.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    sticker.classList.add("is-dragging");
    sticker.setPointerCapture(e.pointerId);
  });

  document.addEventListener("pointermove", (e) => {
    if (!dragTarget) return;
    const parent = dragTarget.parentElement.getBoundingClientRect();
    let left = e.clientX - parent.left - dragOffsetX;
    let top  = e.clientY - parent.top  - dragOffsetY;
    left = Math.max(-10, Math.min(parent.width - 40, left));
    top  = Math.max(-10, Math.min(parent.height - 30, top));
    dragTarget.style.left = left + "px";
    dragTarget.style.top = top + "px";
    dragTarget.style.right = "auto";
    dragTarget.style.bottom = "auto";
  });

  document.addEventListener("pointerup", () => {
    if (dragTarget) dragTarget.classList.remove("is-dragging");
    dragTarget = null;
  });

  /* keep layout correct on resize/rotate */
  window.addEventListener("resize", () => goTo(current, false));
})();
