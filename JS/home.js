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

// Pauses the YouTube hero video while it is mostly off-screen to save data and
// battery. It resumes when the hero returns unless the visitor paused it.
const heroYoutubeFrame = document.getElementById("heroYoutubePlayer");
let heroYoutubePlayer = null;
let youtubePausedByVisibility = false;
let youtubePausedByVisitor = false;
let heroInView = true;
let heroVideoSlideActive = true;

// Plays the video only when the hero is on screen and the video slide is the
// active carousel slide. Pausing is recorded so the visitor's own pause is kept.
function syncHeroVideoPlayback() {
  if (!heroYoutubePlayer || typeof heroYoutubePlayer.pauseVideo !== "function") return;
  if (heroInView && heroVideoSlideActive) {
    if (youtubePausedByVisitor) return;
    youtubePausedByVisibility = false;
    heroYoutubePlayer.playVideo();
  } else {
    youtubePausedByVisibility = true;
    heroYoutubePlayer.pauseVideo();
  }
}

function observeYouTubeHero() {
  if (!heroYoutubePlayer || !("IntersectionObserver" in window)) return;

  const hero = document.getElementById("hero");
  if (!hero) return;

  let firstCheck = true;
  new IntersectionObserver(
    ([entry]) => {
      const mostlyVisible = entry.intersectionRatio >= 0.5;
      const mostlyHidden = entry.intersectionRatio < 0.25;

      if (mostlyHidden && (heroInView || firstCheck)) {
        heroInView = false;
        firstCheck = false;
        syncHeroVideoPlayback();
      } else if (mostlyVisible && !heroInView) {
        heroInView = true;
        syncHeroVideoPlayback();
      } else if (mostlyVisible && firstCheck) {
        firstCheck = false;
        syncHeroVideoPlayback();
      }
    },
    { threshold: [0, 0.25, 0.5, 1] },
  ).observe(hero);
}

// Hero carousel: slides sit side by side in a track that slides horizontally,
// so the transition is smooth and the controls stay in one fixed place.
const heroCarousel = document.getElementById("heroCarousel");
if (heroCarousel) {
  const track = heroCarousel.querySelector("#heroSlides");
  const slides = [...heroCarousel.querySelectorAll(".hero-slide")];
  const dots = [...heroCarousel.querySelectorAll(".hero-dot")];
  let currentSlide = 0;

  // Slide content replays its entrance every time the slide is shown, so it
  // uses its own marker and is kept out of the page-wide scroll reveal below.
  heroCarousel.querySelectorAll("[data-reveal]").forEach((el) => {
    el.removeAttribute("data-reveal");
    el.dataset.heroReveal = "";
    el.style.setProperty("--rd", `${Number(el.dataset.delay || 0) / 1000}s`);
  });

  const showSlide = (index) => {
    currentSlide = (index + slides.length) % slides.length;
    if (track) {
      track.style.transform = `translate3d(${-currentSlide * 100}%, 0, 0)`;
    }
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === currentSlide);
      slide.setAttribute("aria-hidden", String(i !== currentSlide));
    });
    dots.forEach((dot, i) => {
      const active = i === currentSlide;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", String(active));
    });
    heroVideoSlideActive = currentSlide === 0;
    syncHeroVideoPlayback();
  };

  const previous = heroCarousel.querySelector(".hero-prev");
  const next = heroCarousel.querySelector(".hero-next");
  if (previous) {
    previous.addEventListener("click", () => showSlide(currentSlide - 1));
  }
  if (next) {
    next.addEventListener("click", () => showSlide(currentSlide + 1));
  }
  dots.forEach((dot) =>
    dot.addEventListener("click", () => showSlide(Number(dot.dataset.go))),
  );
}


function initializeYouTubeHero() {
  if (!heroYoutubeFrame || !window.YT || !window.YT.Player) return;

  heroYoutubePlayer = new window.YT.Player(heroYoutubeFrame, {
    events: {
      onReady: observeYouTubeHero,
      onStateChange: (event) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
          youtubePausedByVisitor = false;
        } else if (
          event.data === window.YT.PlayerState.PAUSED &&
          !youtubePausedByVisibility
        ) {
          youtubePausedByVisitor = true;
        }
      },
    },
  });
}

window.onYouTubeIframeAPIReady = initializeYouTubeHero;
if (window.YT && window.YT.Player) initializeYouTubeHero();

// Product finder: tabs switch the product details shown in the panel.
const hpProducts = [
  ["Family", "Family Protection", "Comprehensive life insurance plans that provide financial security for your loved ones in case of unexpected events.", ["Life insurance built around your family", "Guided by a licensed advisor", "A safety net for daily expenses and long-term needs"]],
  ["Health", "Health Insurance", "Protect yourself and your family from unexpected medical expenses with comprehensive health plans.", ["Cover for unexpected medical expenses", "Plans for you and your family", "Clear guidance on your options"]],
  ["Education", "Education Planning", "Secure your children's future with education insurance plans designed to fund their academic journey.", ["Plan ahead for school costs", "Protect your child's education goals", "Start early, at your own pace"]],
  ["Retirement", "Retirement Planning", "Plan for a comfortable retirement with pension plans designed to provide financial independence.", ["Pension plans for later life", "Build toward financial independence", "Review your plan as life changes"]],
  ["Business", "Business Insurance", "Protect your business with specialized insurance solutions designed for Filipino entrepreneurs.", ["Solutions for entrepreneurs", "Protect what you have built", "Talk through your needs with an advisor"]],
  ["Savings", "Investment Plans", "Grow your wealth with investment-linked insurance plans that offer protection and potential returns.", ["Protection with potential returns", "Grow your wealth step by step", "Guidance on risk and goals"]],
];
const hpIcons = [
  "fa-people-roof",
  "fa-notes-medical",
  "fa-graduation-cap",
  "fa-clipboard-check",
  "fa-briefcase",
  "fa-coins",
];
const hpImages = [
  "assets/home/solutions-section/family.png",
  "assets/home/solutions-section/health.png",
  "assets/home/solutions-section/education.png",
  "assets/home/solutions-section/retirement.png",
  "assets/home/solutions-section/business.png",
  "assets/home/solutions-section/savings.png",
];
const hpTabs = document.getElementById("hpTabs");
const hpInd = document.getElementById("hpInd");
const hpPanel = document.getElementById("hpPanel");
if (hpTabs && hpInd && hpPanel) {
  let activeProduct = 0;

  const moveIndicator = () => {
    const buttons = hpTabs.querySelectorAll("button");
    const button = buttons[activeProduct];
    if (!button) return;
    hpInd.style.left = `${button.offsetLeft}px`;
    hpInd.style.width = `${button.offsetWidth}px`;
  };

  const renderProduct = (index) => {
    activeProduct = index;
    const [, title, text, points] = hpProducts[index];
    hpTabs.querySelectorAll("button").forEach((button, i) => {
      button.setAttribute("aria-selected", String(i === index));
    });
    moveIndicator();

    const panel = document.createElement("div");
    panel.className = "hp-panel";

    const copy = document.createElement("div");
    const icon = document.createElement("div");
    icon.className = "hp-ic";
    icon.innerHTML = `<i class="fa-solid ${hpIcons[index]}" aria-hidden="true"></i>`;
    const heading = document.createElement("h3");
    heading.textContent = title;
    const body = document.createElement("p");
    body.textContent = text;
    const list = document.createElement("ul");
    points.forEach((point) => {
      const item = document.createElement("li");
      item.textContent = point;
      list.appendChild(item);
    });
    const actions = document.createElement("div");
    actions.className = "hp-btns";
    const quote = document.createElement("a");
    quote.className = "hp-btn";
    quote.href = "prod-serv.html";
    quote.innerHTML =
      'Get a free quote <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
    const learn = document.createElement("a");
    learn.className = "hp-btn hp-line";
    learn.href = "prod-serv.html";
    learn.innerHTML =
      'Learn more <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
    actions.append(quote, learn);
    copy.append(icon, heading, body, list, actions);

    const art = document.createElement("div");
    art.className = "hp-art";
    const photo = document.createElement("img");
    photo.src = hpImages[index];
    photo.alt = title;
    art.append(photo);

    panel.append(copy, art);
    hpPanel.replaceChildren(panel);
  };

  hpProducts.forEach(([name], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "tab");
    button.textContent = name;
    button.setAttribute("aria-selected", String(index === 0));
    button.addEventListener("click", () => renderProduct(index));
    hpTabs.appendChild(button);
  });
  renderProduct(0);
  window.addEventListener("resize", moveIndicator);
}

// How it works: tapping a step shows its details in the panel below.
const hpJr = document.getElementById("hpJr");
if (hpJr) {
  const hpTabs = [...hpJr.querySelectorAll(".hp-js")];
  const hpPanels = [...document.querySelectorAll(".hp-jp")];
  const showHpStep = (index) => {
    hpTabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle("on", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    hpPanels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });
    const panel = hpPanels[index];
    if (panel && !prefersReducedMotion) {
      panel.classList.remove("hp-jp-in");
      void panel.offsetWidth;
      panel.classList.add("hp-jp-in");
    }
  };
  hpTabs.forEach((tab, i) => {
    tab.addEventListener("click", () => showHpStep(i));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const step = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (i + step + hpTabs.length) % hpTabs.length;
      hpTabs[nextIndex].focus();
      showHpStep(nextIndex);
    });
  });
}

// Announcement filter chips, built from the categories of the live cards.
const newsFilters = document.getElementById("newsFilters");
const filterGrid = document.querySelector(".news-grid");
if (filterGrid && newsFilters) {
  let activeNewsFilter = "all";

  const applyNewsFilter = () => {
    filterGrid.querySelectorAll(".news-card").forEach((card) => {
      card.hidden =
        activeNewsFilter !== "all" && card.dataset.category !== activeNewsFilter;
    });
    newsFilters.querySelectorAll(".news-filter").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.filter === activeNewsFilter),
      );
    });
  };

  const buildNewsFilters = () => {
    const labels = new Map();
    filterGrid.querySelectorAll(".news-card").forEach((card) => {
      if (card.dataset.category && !labels.has(card.dataset.category)) {
        labels.set(
          card.dataset.category,
          card.querySelector(".news-tag")?.textContent.trim() || card.dataset.category,
        );
      }
    });
    const categories = [...labels.keys()];
    if (!categories.includes(activeNewsFilter)) activeNewsFilter = "all";
    newsFilters.hidden = categories.length < 2;
    if (newsFilters.hidden) {
      filterGrid.querySelectorAll(".news-card").forEach((card) => {
        card.hidden = false;
      });
      return;
    }
    if (newsFilters.dataset.built === categories.join("|")) {
      applyNewsFilter();
      return;
    }
    newsFilters.dataset.built = categories.join("|");
    newsFilters.replaceChildren();
    ["all", ...categories].forEach((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "news-filter";
      button.dataset.filter = value;
      button.textContent = value === "all" ? "All" : labels.get(value);
      button.addEventListener("click", () => {
        activeNewsFilter = value;
        applyNewsFilter();
      });
      newsFilters.appendChild(button);
    });
    applyNewsFilter();
  };

  new MutationObserver(buildNewsFilters).observe(filterGrid, { childList: true });
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
