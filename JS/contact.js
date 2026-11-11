const $ = (id) => document.getElementById(id),
  $$ = (s) => [...document.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches,
  fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

/* animated waves behind the hero */
(function () {
  const wave = (W, H, base, amp, wl, ph) => {
    let d = `M0 ${H}L0 ${base + amp * Math.sin(ph)}`;
    for (let x = 0; x <= W; x += 24)
      d += `L${x} ${(base + amp * Math.sin((x / wl) * 2 * Math.PI + ph)).toFixed(1)}`;
    return d + `L${W} ${H}Z`;
  };
  const L = [
    [170, 26, 1440 / 2, 0, "rgba(31,90,138,.45)"],
    [205, 20, 1440 / 3, 1.7, "rgba(20,58,99,.5)"],
    [236, 16, 1440 / 2, 3.4, "rgba(8,32,59,.7)"],
  ];
  $("waves").innerHTML = L.map(
    (l) =>
      `<svg viewBox="0 0 2880 300" preserveAspectRatio="none"><path d="${wave(2880, 300, l[0], l[1], l[2], l[3])}" fill="${l[4]}"/></svg>`,
  ).join("");
})();

/* open / closed status (Philippine time) */
(function () {
  const m = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }),
    ),
    d = m.getDay(),
    h = m.getHours() + m.getMinutes() / 60;
  const open =
    (d >= 1 && d <= 5 && h >= 8 && h < 17) ||
    (d === 6 && h >= 9 && h < 13);
  const s = $("status");
  s.textContent = open ? "Open now" : "Closed now";
  s.classList.toggle("closed", !open);
})();

/* spotlight glow on cards + magnetic buttons */
$$(".cc").forEach((c) =>
  c.addEventListener("pointermove", (e) => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", e.clientX - r.left + "px");
    c.style.setProperty("--my", e.clientY - r.top + "px");
  }),
);
if (!reduce && fine)
  $$(".mag").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const b = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * 0.22}px,${(e.clientY - b.top - b.height / 2) * 0.35}px)`;
    });
    el.addEventListener("pointerleave", () => (el.style.transform = ""));
  });

/* scroll reveal */
if (!reduce && "IntersectionObserver" in window) {
  document.documentElement.classList.add("rv-on");
  const ro = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add("revealed");
        ro.unobserve(el);
        setTimeout(
          () => el.removeAttribute("data-reveal"),
          1400 + Number(el.dataset.delay || 0),
        );
      }),
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
  );
  $$("[data-reveal]").forEach((el) => {
    el.style.setProperty(
      "--rd",
      Number(el.dataset.delay || 0) / 1000 + "s",
    );
    ro.observe(el);
  });
}

(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  let smoothScroller = null;

  const startSmoothScroll = () => {
    if (
      smoothScroller ||
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
  });
})();
