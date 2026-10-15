const $ = (id) => document.getElementById(id),
  $$ = (s) => [...document.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches,
  fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const SMOOTH_SCROLL = true; // set to false for normal scrolling
const HERO_BG = "flow"; // 'flow' (gold flow lines), 'poly' (cool low-poly) or 'none'
let smooth = null;

/* Font Awesome mappings for service and feature icons. */
const IC = {
  umbrella: "fa-umbrella",
  cap: "fa-graduation-cap",
  heart: "fa-heart",
  sun: "fa-sun",
  building: "fa-building",
  trend: "fa-chart-line",
  house: "fa-house",
  shield: "fa-shield-halved",
  shieldck: "fa-shield-heart",
  coins: "fa-coins",
  chart: "fa-chart-line",
  users: "fa-users",
  bolt: "fa-bolt",
  car: "fa-car",
  headset: "fa-headset",
};
const renderIcon = (el) => {
  el.innerHTML = `<i class="fa-solid ${IC[el.dataset.ic]}" aria-hidden="true"></i>`;
};
$$("[data-ic]").forEach(renderIcon);

/* every call to action leads to the bottom form (optionally pre-selecting the subject) */
function goToForm(subject, message) {
  const form = document.getElementById("inquiryFormBottom");
  if (subject) {
    const sel = form.elements.subject;
    if ([...sel.options].some((o) => o.value === subject)) sel.value = subject;
  }
  if (message && !form.elements.message.value)
    form.elements.message.value = message;
  if (smooth) {
    const r = form.getBoundingClientRect();
    smooth.scrollTo(
      r.top + scrollY - Math.max(70, (innerHeight - r.height) / 2),
    );
  } else form.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => form.elements.name.focus({ preventScroll: true }), 900);
}
$$('a[href="#inquire"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    goToForm();
  }),
);
$$("[data-subject]").forEach((b) =>
  b.addEventListener("click", () => goToForm(b.dataset.subject)),
);

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

/* odometer stats */
function od(el) {
  const [pre, num, suf] = el.dataset.od.split("|");
  el.innerHTML =
    (pre ? `<span class="s">${pre}</span>` : "") +
    [...num]
      .map((ch) =>
        /\d/.test(ch)
          ? `<span class="d"><span class="c" style="--n:${ch}">${[..."0123456789"].map((x) => `<i>${x}</i>`).join("")}</span></span>`
          : `<span class="s">${ch}</span>`,
      )
      .join("") +
    (suf ? `<span class="s">${suf}</span>` : "");
}
$$(".od").forEach((el) => {
  od(el);
  const go = () =>
    setTimeout(
      () => el.querySelectorAll(".c").forEach((c) => c.classList.add("go")),
      reduce ? 0 : 350,
    );
  new IntersectionObserver(
    ([e], o) => {
      if (e.isIntersecting) {
        go();
        o.disconnect();
      }
    },
    { threshold: 0.4 },
  ).observe(el);
});

/* "what if" cards: tap / Enter flips a card (hover and focus also flip it) */
$$(".flip").forEach((f) => {
  f.addEventListener("click", (e) => {
    if (e.target.closest(".ask")) return;
    f.classList.toggle("on");
  });
  f.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target === f) {
      e.preventDefault();
      f.classList.toggle("on");
    }
  });
});

/* one-tap situations: tap a situation, see a tailored suggestion, go to the form with the Subject selected */
const PROD = {
  "Family Protection": [
    "umbrella",
    "Comprehensive life insurance plans that provide financial security for your loved ones in case of unexpected events.",
  ],
  "Education Planning": [
    "cap",
    "Secure your children's future with education insurance plans designed to fund their academic journey.",
  ],
  "Health Insurance": [
    "heart",
    "Protect yourself and your family from unexpected medical expenses with comprehensive health plans.",
  ],
  "Retirement Planning": [
    "sun",
    "Plan for a comfortable retirement with pension plans designed to provide financial independence.",
  ],
  "Business Insurance": [
    "building",
    "Protect your business with specialized insurance solutions designed for Filipino entrepreneurs.",
  ],
  "Investment Plans": [
    "trend",
    "Grow your wealth with investment-linked insurance plans that offer protection and potential returns.",
  ],
};
$$("#chips .chip").forEach((c) =>
  c.addEventListener("click", () => {
    $$("#chips .chip").forEach((x) => x.setAttribute("aria-pressed", x === c));
    const rec = c.dataset.rec,
      pr = PROD[rec];
    $("rb").innerHTML =
      `<div class="rc"><div class="ic" data-ic="${pr[0]}"></div><div><small>A GOOD FIRST CONVERSATION</small><h3>${rec}</h3><p>${pr[1]}</p><button class="btn" id="rgo" type="button">Tell us more <i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button></div></div>`;
    $$("#rb [data-ic]").forEach(renderIcon);
    $("rgo").onclick = () =>
      goToForm(rec, `Hi, I'd like to know more about ${rec}.`);
  }),
);

/* pinned horizontal scroll (desktop); a swipe row on small screens */
const hs = $("hs"),
  hst = $("hst");
let dist = 0;
const small = () => matchMedia("(max-width: 800px)").matches;
function layoutHS() {
  if (small()) {
    hs.style.height = "";
    hst.style.transform = "";
    dist = 0;
    return;
  }
  dist = Math.max(0, hst.scrollWidth - innerWidth);
  hs.style.height = innerHeight + dist + "px";
}
/* story rail + scroll-linked bits */
const rail = $("rail"),
  fill = $("railFill"),
  chapters = $$("[data-c]"),
  stickyBar = $("sticky");
const secIds = ["c1", "c2", "c3", "c4", "c5", "inquire"];
/* chapter 5 scroll story: reasons arrive one by one, then "We've got you covered" */
const cvPin = $("cvPin"),
  cvItems = $$("#cvList .rs");
let cvLast = "";
const cvStatic = () => reduce || matchMedia("(max-width: 900px)").matches;
function frameCV() {
  if (!cvPin) return;
  let p;
  if (cvStatic()) p = 1;
  else {
    const r = cvPin.getBoundingClientRect();
    p = clamp(-r.top / (cvPin.offsetHeight - innerHeight));
  }
  $("cvProg").style.width = p * 100 + "%";
  cvItems.forEach((e, i) =>
    e.classList.toggle("show", p > 0.06 + i * 0.13 || p >= 1),
  );
  const cov = p > 0.7;
  const st = (cov ? "1" : "0") + (p >= 1 ? "s" : "");
  $("cvList").classList.toggle("cov", cov);
  $("cvTag").classList.toggle("ok", cov);
  if (st !== cvLast) {
    cvLast = st;
    $("cvTag").textContent = cov ? "Covered" : "Why choose us";
    $("cvBig").innerHTML = cov
      ? "We've got you<br><em>covered.</em>"
      : "Here's what you<br>can count on.";
  }
}
function frame() {
  const max = document.documentElement.scrollHeight - innerHeight;
  fill.style.height = clamp(scrollY / max) * (rail.clientHeight - 12) + "px";
  if (!reduce && !small() && dist) {
    const r = hs.getBoundingClientRect();
    hst.style.transform = `translateX(${-clamp(-r.top / (hs.offsetHeight - innerHeight)) * dist}px)`;
  }
  let cur = null;
  secIds.forEach((id) => {
    const r = $(id).getBoundingClientRect();
    if (r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.3) cur = id;
  });
  chapters.forEach((a) => a.classList.toggle("on", a.dataset.c === cur));
  rail.classList.toggle("hide", cur === "c3" || cur === "c5");
  frameCV();
}
addEventListener("scroll", frame, { passive: true });
addEventListener("resize", () => {
  layoutHS();
  frame();
});
const sv = new Set(),
  sync = () => stickyBar.classList.toggle("show", sv.size === 0);
const so = new IntersectionObserver(
  (es) => {
    es.forEach((e) =>
      e.isIntersecting ? sv.add(e.target) : sv.delete(e.target),
    );
    sync();
  },
  { threshold: 0.15 },
);
so.observe($("top"));
so.observe($("inquire"));

/* scroll reveal */
if (!reduce && "IntersectionObserver" in window) {
  document.documentElement.classList.add("reveal-ready");
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
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
  );
  $$("[data-reveal]").forEach((el) => {
    el.style.setProperty("--rd", Number(el.dataset.delay || 0) / 1000 + "s");
    ro.observe(el);
  });
}

/* floating gold orbs in the final section */
(function () {
  const s = $("inquire");
  let h = "";
  for (let i = 0; i < 10; i++) {
    const z = 34 + ((i * 47) % 100);
    h += `<span class="orb" style="width:${z}px;height:${z}px;left:${(i * 37) % 100}%;animation-duration:${15 + ((i * 7) % 14)}s;animation-delay:${-i * 3}s;filter:blur(${(i % 3) * 2}px)"></span>`;
  }
  s.insertAdjacentHTML("afterbegin", h);
})();

/* ===== hero: split the headline into words (the GSAP reveal animates them) ===== */
(function () {
  const h = $("h1");
  if (!h) return;
  const sp = (t, c) =>
    t
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => `<span class="w"><span class="${c}">${w}</span></span>`)
      .join(" ") + " ";
  h.innerHTML = [...h.childNodes]
    .map((n) =>
      n.nodeType === 3
        ? sp(n.textContent, "")
        : n.nodeName === "BR"
          ? "<br>"
          : n.nodeName === "EM"
            ? sp(n.textContent, "g")
            : "",
    )
    .join("");
})();

/* ===== hero background ===== */
const line = (W, base, a1, w1, p1, a2, w2, p2) => {
  let d = "";
  for (let x = 0; x <= W; x += 30) {
    const y = base + a1 * Math.sin(x / w1 + p1) + a2 * Math.sin(x / w2 + p2);
    d += (x ? "L" : "M") + x + " " + y.toFixed(1);
  }
  return d;
};
function buildFlow() {
  let h = "";
  for (let i = 0; i < 22; i++) {
    const gold = i % 3 !== 0;
    h += `<path d="${line(1440, 30 + i * 42, 26 + i * 2, 170 + i * 8, i * 0.5, 14, 90 + i * 5, i * 0.9)}" fill="none" stroke="${gold ? "#d4a85a" : "#ffffff"}" stroke-width="${gold ? 1.2 : 1}" opacity="${(gold ? 0.14 + (i % 4) * 0.06 : 0.07).toFixed(2)}"/>`;
  }
  $("heroBg").innerHTML =
    `<svg class="flow" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${h}</svg>`;
}
function buildPoly() {
  const hero = document.querySelector(".hero"),
    box = $("heroBg");
  if (!window.trianglify) return;
  const w = hero.clientWidth,
    hh = hero.clientHeight;
  const p = trianglify({
    width: w,
    height: hh,
    cellSize: Math.max(80, w / 14),
    variance: 0.8,
    seed: "mega-paragon-products",
    xColors: ["#071b33", "#143a63", "#2a7fb0", "#1f5a8a", "#0d2c52"],
    yColors: "match",
    strokeWidth: 0,
  });
  const svg = p.toSVG();
  svg.setAttribute("viewBox", "0 0 " + w + " " + hh);
  svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
  svg.setAttribute("class", "poly");
  box.innerHTML = "";
  box.appendChild(svg);
  const v = document.createElement("div");
  v.className = "veil";
  box.appendChild(v);
}
if (HERO_BG === "flow") buildFlow();
if (HERO_BG === "poly") {
  const t = document.createElement("script");
  t.src =
    "https://cdn.jsdelivr.net/npm/trianglify@4.1.1/dist/trianglify.bundle.js";
  t.onload = buildPoly;
  document.head.appendChild(t);
}

/* ===== hero: GSAP text reveal ===== */
function heroReveal() {
  const root = document.documentElement;
  if (!window.gsap || reduce) {
    root.classList.remove("g-pre");
    return;
  }
  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => root.classList.remove("g-pre"),
  });
  tl.fromTo(
    ".hcopy .kick",
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.7 },
    0.1,
  )
    .fromTo(
      "#h1 .w>span",
      { yPercent: 110, opacity: 1 },
      { yPercent: 0, duration: 1.05, ease: "power4.out", stagger: 0.12 },
      0.2,
    )
    .fromTo(
      ".hcopy .lead",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.75,
    )
    .fromTo(
      ".hcopy .cta-w",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.9,
    )
    .fromTo(
      ".hcopy .stats",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      1.05,
    );
}

addEventListener("load", () => {
  heroReveal();
  layoutHS();
  frame();
  if (SMOOTH_SCROLL && window.Lenis && !reduce && fine) {
    smooth = new Lenis({ lerp: 0.1 });
    (function f(t) {
      if (!smooth) return;
      smooth.raf(t);
      requestAnimationFrame(f);
    })(0);
  }
});
layoutHS();
frame();
setTimeout(() => document.documentElement.classList.remove("g-pre"), 4500);
