// Home hero video elements used by the framed video card in home.html.
const heroVideoFile = document.querySelector(".hero-video-file");
const videoPlayPause = document.getElementById("videoPlayPause");
const videoSoundToggle = document.getElementById("videoSoundToggle");
const videoVolume = document.getElementById("videoVolume");
const videoFullscreen = document.getElementById("videoFullscreen");

// Shows the branded fallback state when the hero video cannot load.
if (heroVideoFile) {
  heroVideoFile.addEventListener("error", () => {
    heroVideoFile.closest(".hero-media").classList.add("video-unavailable");
  });
}

// Controls play and pause state for the hero video.
if (videoPlayPause && heroVideoFile) {
  videoPlayPause.addEventListener("click", () => {
    if (heroVideoFile.paused) {
      heroVideoFile.play();
      videoPlayPause.querySelector(".video-control-icon").innerHTML =
        "&#10074;&#10074;";
      videoPlayPause.setAttribute("aria-label", "Pause video");
    } else {
      heroVideoFile.pause();
      videoPlayPause.querySelector(".video-control-icon").innerHTML = "&#9654;";
      videoPlayPause.setAttribute("aria-label", "Play video");
    }
  });
}

// Toggles sound and updates the accessible label and speaker icon.
if (videoSoundToggle && heroVideoFile) {
  videoSoundToggle.addEventListener("click", () => {
    heroVideoFile.muted = !heroVideoFile.muted;
    const icon = videoSoundToggle.querySelector(".video-control-icon");
    if (icon) {
      icon.innerHTML = heroVideoFile.muted ? "&#128264;" : "&#128266;";
    }
    videoSoundToggle.setAttribute(
      "aria-label",
      heroVideoFile.muted ? "Turn sound on" : "Mute video",
    );
  });
}

// Starts the hero video muted after the page has had time to initialize.
if (heroVideoFile) {
  heroVideoFile.volume = 1;
  heroVideoFile.muted = true;
  window.setTimeout(() => {
    heroVideoFile.play().catch(() => {
      // Browsers may block playback until the user interacts with the page.
    });
  }, 1500);
}

// Connects the volume slider to the video volume and mute state.
if (videoVolume && heroVideoFile) {
  videoVolume.addEventListener("input", () => {
    const volume = Number(videoVolume.value);
    heroVideoFile.volume = volume;
    heroVideoFile.muted = volume === 0;
    if (videoSoundToggle) {
      const icon = videoSoundToggle.querySelector(".video-control-icon");
      if (icon) {
        icon.innerHTML = heroVideoFile.muted ? "&#128264;" : "&#128266;";
      }
      videoSoundToggle.setAttribute(
        "aria-label",
        heroVideoFile.muted ? "Turn sound on" : "Mute video",
      );
    }
  });
}

// Handles entering and exiting fullscreen for the framed hero video.
if (videoFullscreen && heroVideoFile) {
  const heroMedia = heroVideoFile.closest(".hero-media");

  const updateFullscreenButton = () => {
    const isFullscreen = document.fullscreenElement === heroMedia;
    videoFullscreen.setAttribute(
      "aria-label",
      isFullscreen ? "Exit fullscreen" : "Enter fullscreen",
    );
    const icon = videoFullscreen.querySelector(".video-control-icon");
    if (icon) {
      icon.innerHTML = isFullscreen ? "&#x2715;" : "&#x26F6;";
    }
  };

  // Opens fullscreen and requests landscape orientation when supported.
  videoFullscreen.addEventListener("click", async () => {
    if (document.fullscreenElement === heroMedia) {
      await screen.orientation?.unlock?.();
      await document.exitFullscreen();
    } else {
      await heroMedia.requestFullscreen();
      if (window.matchMedia("(orientation: portrait)").matches) {
        const orientationLock = screen.orientation?.lock?.("landscape");
        await orientationLock?.catch(() => {
          // Orientation locking is unavailable in some browsers and contexts.
        });
      }
    }
  });

  // Keeps the button label and icon synchronized with browser fullscreen state.
  document.addEventListener("fullscreenchange", updateFullscreenButton);
}

// ---------------------------------------------------------------------------
// Hero and announcements enhancements (v2)
// ---------------------------------------------------------------------------

// Visitors who ask their device for reduced motion get a still page.
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// Draws a light, interactive particle network behind the hero. Set
// HERO_PARTICLES to false to turn the effect off completely.
const HERO_PARTICLES = true;
if (HERO_PARTICLES && !prefersReducedMotion) {
  window.addEventListener("load", () => {
    // The library is loaded with the pinned <script> tag in home.html.
    if (!window.tsParticles || !window.loadSlim) return;
    const isSmallScreen = window.innerWidth < 700;
    window.loadSlim(window.tsParticles).then(() =>
      window.tsParticles.load({
        id: "heroParticles",
        options: {
          fullScreen: { enable: false },
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          detectRetina: true,
          pauseOnBlur: true,
          pauseOnOutsideViewport: true,
          interactivity: {
            detectsOn: "window",
            events: {
              onHover: { enable: !isSmallScreen, mode: "grab" },
              resize: { enable: true },
            },
            modes: { grab: { distance: 170, links: { opacity: 0.5 } } },
          },
          particles: {
            // A denser network keeps the hero background visually active
            // without competing with the video and headline.
            number: { value: isSmallScreen ? 40 : 80 },
            color: { value: ["#d4a85a", "#f0cf8e", "#ffffff"] },
            links: {
              enable: true,
              distance: 190,
              color: "#d4a85a",
              opacity: 0.22,
              width: 1,
            },
            move: { enable: true, speed: 0.45, outModes: { default: "out" } },
            opacity: { value: { min: 0.2, max: 0.55 } },
            size: { value: { min: 1, max: 2.4 } },
            shape: { type: "circle" },
          },
        },
      }),
    );
  });
}

// Pauses the hero video while it is off-screen to save data and battery. It
// resumes only if the visitor has not paused it themselves.
if (heroVideoFile && videoPlayPause && "IntersectionObserver" in window) {
  new IntersectionObserver(
    ([entry]) => {
      const pausedByVisitor =
        videoPlayPause.getAttribute("aria-label") === "Play video";
      if (!entry.isIntersecting) {
        heroVideoFile.pause();
      } else if (!pausedByVisitor) {
        heroVideoFile.play().catch(() => {});
      }
    },
    { threshold: 0.15 },
  ).observe(document.getElementById("hero"));
}

// Gentle magnetic pull on the hero buttons for mouse users.
if (
  !prefersReducedMotion &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches
) {
  document.querySelectorAll(".hero .btn, .hero .news-cta").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const box = el.getBoundingClientRect();
      const x = (event.clientX - box.left - box.width / 2) * 0.25;
      const y = (event.clientY - box.top - box.height / 2) * 0.35;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

// Announcements: loading placeholders, card entrance, and pointer spotlight.
// The cards are inserted by announcements.js, so a MutationObserver reacts to
// them whenever they arrive.
const newsGrid = document.querySelector(".news-grid");
if (newsGrid) {
  newsGrid.classList.add("js-reveal");
  const revealed = new WeakSet();

  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  const syncNewsCards = () => {
    const cards = [...newsGrid.querySelectorAll(".news-card")];
    if (cards.length) {
      // Real cards have arrived, so the placeholders are no longer needed.
      newsGrid.querySelectorAll(".news-skeleton").forEach((el) => el.remove());
      newsGrid.setAttribute("aria-busy", "false");
    }
    cards.forEach((card, index) => {
      if (revealed.has(card)) return;
      revealed.add(card);
      card.style.setProperty("--i", index % 3);
      if (prefersReducedMotion) card.classList.add("in-view");
      else cardObserver.observe(card);
    });
  };
  new MutationObserver(syncNewsCards).observe(newsGrid, {
    childList: true,
    subtree: true,
  });
  syncNewsCards();

  // If nothing loads, replace the placeholders with a friendly message.
  window.setTimeout(() => {
    if (!newsGrid.querySelector(".news-card")) {
      newsGrid.innerHTML =
        '<p class="news-empty">No updates to show right now. Please check back soon.</p>';
      newsGrid.setAttribute("aria-busy", "false");
    }
  }, 10000);

  // Soft gold glow that follows the pointer across each card.
  newsGrid.addEventListener("pointermove", (event) => {
    const card = event.target.closest(".news-card");
    if (!card) return;
    const box = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - box.left}px`);
    card.style.setProperty("--my", `${event.clientY - box.top}px`);
  });
}

// ---------------------------------------------------------------------------
// Smooth scrolling and scroll reveal
// ---------------------------------------------------------------------------

// Smooth, gliding mouse-wheel scrolling (Lenis). Set to false for normal
// scrolling. It is skipped for touch devices and for visitors who ask for
// reduced motion.
const SMOOTH_SCROLL = true;
let smoothScroller = null;

function startSmoothScroll() {
  if (
    smoothScroller ||
    !window.Lenis ||
    prefersReducedMotion ||
    !window.matchMedia("(hover: hover) and (pointer: fine)").matches
  ) {
    return;
  }
  smoothScroller = new window.Lenis({ lerp: 0.1 });
  const frame = (time) => {
    if (!smoothScroller) return;
    smoothScroller.raf(time);
    window.requestAnimationFrame(frame);
  };
  window.requestAnimationFrame(frame);
}

function stopSmoothScroll() {
  if (smoothScroller) {
    smoothScroller.destroy();
    smoothScroller = null;
  }
}

if (SMOOTH_SCROLL) {
  window.addEventListener("load", startSmoothScroll);

  // In-page links (such as "See what's happening") glide to their target.
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || !smoothScroller) return;
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    // Uses the live scroll position so the target stays accurate even if the
    // page was just moved by another scroll method.
    // The target's scroll-margin-top leaves room for the fixed header.
    const offset =
      Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
    smoothScroller.scrollTo(
      target.getBoundingClientRect().top + window.scrollY - offset,
    );
  });

  // Pauses page scrolling while the announcement dialog is open.
  const announcementModal = document.getElementById("homeAnnouncementModal");
  if (announcementModal) {
    new MutationObserver(() => {
      if (!smoothScroller) return;
      if (announcementModal.classList.contains("is-open")) {
        smoothScroller.stop();
      } else {
        smoothScroller.start();
      }
    }).observe(announcementModal, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }
}

// Optional hook so the smooth scroll can be switched on or off from the page
// (used by the preview toggle). Safe to delete.
window.megaParagonSmoothScroll = {
  start: startSmoothScroll,
  stop: stopSmoothScroll,
  isActive: () => Boolean(smoothScroller),
};

// Scroll reveal: elements with data-reveal fade and rise in as they scroll
// into view. Once shown, the attribute is removed so the element's own hover
// and transition styles take over again.
if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealItems = document.querySelectorAll("[data-reveal]");
  document.documentElement.classList.add("reveal-ready");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("revealed");
        revealObserver.unobserve(el);
        const delay = Number(el.dataset.delay || 0);
        window.setTimeout(
          () => el.removeAttribute("data-reveal"),
          1400 + delay,
        );
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
  );
  revealItems.forEach((el) => {
    el.style.setProperty("--rd", `${Number(el.dataset.delay || 0) / 1000}s`);
    revealObserver.observe(el);
  });
}

// Reveals the shared Font Awesome back-to-top control after the visitor
// scrolls beyond the opening hero area.
const backToTop = document.querySelector(".back-to-top");
if (backToTop) {
  const updateBackToTopVisibility = () => {
    backToTop.classList.toggle("is-visible", window.scrollY > 240);
  };

  window.addEventListener("scroll", updateBackToTopVisibility, {
    passive: true,
  });
  updateBackToTopVisibility();
}
