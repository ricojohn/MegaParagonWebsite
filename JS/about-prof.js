// Welcome carousel (reference design): slide track, prev/next buttons, dots, and 5s autoplay.
const welcomeCarousel = document.querySelector("[data-welcome-carousel]");
if (welcomeCarousel) {
  const welcomeTrack = welcomeCarousel.querySelector("[data-welcome-track]");
  const welcomeDots = document.querySelector("[data-welcome-dots]");
  const welcomeSlideCount = welcomeTrack.children.length;
  let welcomeIndex = 0;
  let welcomeTimer;

  for (let k = 0; k < welcomeSlideCount; k++) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Photo ${k + 1}`);
    dot.addEventListener("click", () => goWelcome(k));
    welcomeDots.appendChild(dot);
  }

  function goWelcome(k) {
    welcomeIndex = (k + welcomeSlideCount) % welcomeSlideCount;
    welcomeTrack.style.transform = `translateX(-${welcomeIndex * 100}%)`;
    [...welcomeDots.children].forEach((dot, j) =>
      dot.setAttribute("aria-current", j === welcomeIndex),
    );
    clearTimeout(welcomeTimer);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      welcomeTimer = setTimeout(() => goWelcome(welcomeIndex + 1), 5000);
    }
  }

  document
    .querySelector("[data-welcome-prev]")
    .addEventListener("click", () => goWelcome(welcomeIndex - 1));
  document
    .querySelector("[data-welcome-next]")
    .addEventListener("click", () => goWelcome(welcomeIndex + 1));
  goWelcome(0);
}

// Scroll reveal for elements marked data-rv, and the pointer spotlight on value cards.
const aboutRevealItems = document.querySelectorAll("[data-rv]");
if (
  aboutRevealItems.length &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  "IntersectionObserver" in window
) {
  document.documentElement.classList.add("rv-ready");
  const aboutRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("rv-in");
        aboutRevealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
  );
  aboutRevealItems.forEach((el) => aboutRevealObserver.observe(el));
}

document.querySelectorAll(".a6-val, .a6-band").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
});

// Pauses the Meet the Team video when it scrolls away and resumes it when it
// returns, but only if it was playing when it left the screen.
const teamVideoFrame = document.querySelector(".a6-vplace iframe");
if (teamVideoFrame && "IntersectionObserver" in window) {
  let teamVideoPlayer = null;
  let resumeOnReturn = false;

  const createTeamVideoPlayer = () => {
    if (teamVideoPlayer || !window.YT || !window.YT.Player) return;
    teamVideoPlayer = new window.YT.Player(teamVideoFrame);
  };

  const previousApiReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    if (previousApiReady) previousApiReady();
    createTeamVideoPlayer();
  };
  createTeamVideoPlayer();

  new IntersectionObserver(
    ([entry]) => {
      if (!teamVideoPlayer || typeof teamVideoPlayer.pauseVideo !== "function") {
        return;
      }
      if (entry.intersectionRatio < 0.25) {
        resumeOnReturn =
          teamVideoPlayer.getPlayerState() === window.YT.PlayerState.PLAYING;
        if (resumeOnReturn) teamVideoPlayer.pauseVideo();
      } else if (entry.intersectionRatio >= 0.5 && resumeOnReturn) {
        resumeOnReturn = false;
        teamVideoPlayer.playVideo();
      }
    },
    { threshold: [0, 0.25, 0.5] },
  ).observe(teamVideoFrame);
}

