/* Reference careers interactions kept separate from the shared form workflow. */
(() => {
  const hero = document.querySelector(".hero");
  const heroBackground = document.getElementById("heroBg");
  const form = document.getElementById("joinFormBottom");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smoothScrollEnabled = !reducedMotion;
  let smoothScroller = null;

  const renderHeroPattern = () => {
    if (!hero || !heroBackground || typeof window.trianglify !== "function") return;

    const width = hero.clientWidth;
    const height = hero.clientHeight;
    const pattern = window.trianglify({
      width,
      height,
      cellSize: Math.max(80, width / 14),
      variance: 0.8,
      seed: "mega-paragon",
      xColors: ["#071b33", "#143a63", "#2a669c", "#6f7c80", "#c9a45c"],
      yColors: "match",
      strokeWidth: 0,
    });
    const svg = pattern.toSVG();
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.classList.add("poly");
    const veil = document.createElement("div");
    veil.className = "veil";
    heroBackground.replaceChildren(svg, veil);
  };

  renderHeroPattern();
  window.addEventListener("resize", renderHeroPattern, { passive: true });

  const startSmoothScroll = () => {
    if (
      smoothScroller ||
      !smoothScrollEnabled ||
      !window.Lenis ||
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
  };

  const stopSmoothScroll = () => {
    if (!smoothScroller) return;
    smoothScroller.destroy();
    smoothScroller = null;
  };

  if (smoothScrollEnabled) {
    window.addEventListener("load", startSmoothScroll);
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || !smoothScroller) return;
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      const offset =
        Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
      smoothScroller.scrollTo(
        target.getBoundingClientRect().top + window.scrollY - offset,
      );
      if (target === form) {
        window.setTimeout(() => {
          form.elements.namedItem("name")?.focus({ preventScroll: true });
        }, 700);
      }
    });
  }

  window.megaParagonJoinSmoothScroll = {
    start: startSmoothScroll,
    stop: stopSmoothScroll,
    isActive: () => Boolean(smoothScroller),
  };

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("on");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 },
  );
  document.querySelectorAll(".rv").forEach((element, index) => {
    element.style.transitionDelay = `${(index % 3) * 80}ms`;
    revealObserver.observe(element);
  });

  document.querySelectorAll("[data-to]").forEach((element) => {
    const target = Number(element.dataset.to);
    const suffix = element.dataset.suf || "";
    if (reducedMotion) {
      element.textContent = `${target}${suffix}`;
      return;
    }

    const counterObserver = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const started = performance.now();
      const update = (time) => {
        const progress = Math.min((time - started) / 1400, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = `${Math.round(target * eased)}${progress === 1 ? suffix : ""}`;
        if (progress < 1) window.requestAnimationFrame(update);
      };
      window.requestAnimationFrame(update);
    });
    counterObserver.observe(element);
  });

  const track = document.getElementById("vtrack");
  const slides = track ? [...track.children] : [];
  const dots = document.getElementById("vdots");
  let currentSlide = 0;

  const setActiveSlide = (index) => {
    currentSlide = Math.max(0, Math.min(slides.length - 1, index));
    dots?.querySelectorAll("button").forEach((dot, dotIndex) => {
      dot.setAttribute("aria-current", String(dotIndex === currentSlide));
    });
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("on", slideIndex === currentSlide);
    });
  };

  const goToSlide = (index) => {
    if (!track || !slides.length) return;
    setActiveSlide(index);
    const slide = slides[currentSlide];
    track.scrollTo({
      left: slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  slides.forEach((slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to video ${index + 1}`);
    dot.onclick = () => goToSlide(index);
    dots?.append(dot);

    const videoId = slide.dataset.id;
    const playButton = slide.querySelector(".vplay");
    if (!videoId || videoId.startsWith("VIDEO_ID_")) {
      playButton?.setAttribute("disabled", "true");
      return;
    }
    playButton?.addEventListener("click", () => {
      const frame = slide.querySelector(".vframe");
      const title = slide.querySelector("h3")?.textContent || "Testimonial video";
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`;
      iframe.title = title;
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      frame?.replaceChildren(iframe);
    });
  });
  goToSlide(0);
  track?.addEventListener(
    "scroll",
    () => {
      if (!slides.length) return;
      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let distance = Number.POSITIVE_INFINITY;
      slides.forEach((slide, index) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const difference = Math.abs(slideCenter - center);
        if (difference < distance) {
          distance = difference;
          closest = index;
        }
      });
      if (closest !== currentSlide) setActiveSlide(closest);
    },
    { passive: true },
  );
  const previousButton = document.getElementById("vprev");
  const nextButton = document.getElementById("vnext");
  if (previousButton) previousButton.onclick = () => goToSlide(currentSlide - 1);
  if (nextButton) nextButton.onclick = () => goToSlide(currentSlide + 1);

  const sticky = document.getElementById("sticky");
  if (sticky && hero && form && "IntersectionObserver" in window) {
    const visible = new Set();
    const stickyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target);
        });
        sticky.classList.toggle("show", visible.size === 0);
      },
      { threshold: 0.15 },
    );
    stickyObserver.observe(hero);
    stickyObserver.observe(form);
  }

  document.addEventListener("pointermove", (event) => {
    const card = event.target.closest?.(".c,.tr");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });

  if (!reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".mag").forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        const b = el.getBoundingClientRect();
        el.style.transform = `translate(${(event.clientX - b.left - b.width / 2) * 0.25}px,${(event.clientY - b.top - b.height / 2) * 0.35}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    const updateBackToTopVisibility = () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 240);
    };
    window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
    updateBackToTopVisibility();
  }

  const confetti = (x, y) => {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99";
    document.body.appendChild(canvas);
    const g = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ["#d4a85a", "#f0cf8e", "#0a2240", "#ffffff", "#143a63"];
    const bits = Array.from({ length: 150 }, () => ({
      x, y,
      vx: (Math.random() - 0.5) * 18,
      vy: -Math.random() * 16 - 5,
      r: Math.random() * 5 + 3,
      c: colors[(Math.random() * 5) | 0],
      a: Math.random() * 6,
      va: (Math.random() - 0.5) * 0.35,
    }));
    let frame = 0;
    const tick = () => {
      g.clearRect(0, 0, canvas.width, canvas.height);
      bits.forEach((p) => {
        p.vy += 0.38;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.a += p.va;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.a);
        g.fillStyle = p.c;
        g.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        g.restore();
      });
      if (++frame < 160) window.requestAnimationFrame(tick);
      else canvas.remove();
    };
    tick();
  };

  // forms.js owns submission; celebrate when it marks a form message as successful.
  if (!reducedMotion) {
    document.querySelectorAll(".form-message").forEach((message) => {
      let celebrated = false;
      new MutationObserver(() => {
        const ok = message.classList.contains("success");
        if (ok && !celebrated) {
          const b = message.closest("form").querySelector(".submit").getBoundingClientRect();
          confetti(b.left + b.width / 2, b.top);
        }
        celebrated = ok;
      }).observe(message, { attributes: true, attributeFilter: ["class"] });
    });
  }
})();
