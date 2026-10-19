/* Shared browser-history scroll restoration and back-to-top behavior. */
(() => {
  const storageKey = `scroll-position:${window.location.pathname}${window.location.search}`;
  const navigationEntry = performance
    .getEntriesByType("navigation")
    .find((entry) => entry instanceof PerformanceNavigationTiming);
  const shouldRestore =
    navigationEntry?.type === "back_forward" || performance.getEntriesByType("navigation").length === 0;
  const scrollStateBackToTop = document.querySelector(".back-to-top");

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  const saveScrollPosition = () => {
    sessionStorage.setItem(storageKey, String(window.scrollY));
  };

  const updateBackToTop = () => {
    if (scrollStateBackToTop) {
      scrollStateBackToTop.classList.toggle("is-visible", window.scrollY > 240);
    }
  };

  const restoreScrollPosition = () => {
    if (!shouldRestore) {
      updateBackToTop();
      return;
    }

    const savedPosition = Number(sessionStorage.getItem(storageKey));
    if (!Number.isFinite(savedPosition) || savedPosition <= 0) {
      updateBackToTop();
      return;
    }

    let attempts = 0;
    const applySavedPosition = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll >= savedPosition || attempts >= 12) {
        window.scrollTo(0, Math.min(savedPosition, Math.max(0, maxScroll)));
        updateBackToTop();
        return;
      }

      attempts += 1;
      window.setTimeout(applySavedPosition, 150);
    };

    applySavedPosition();
  };

  window.addEventListener("pagehide", saveScrollPosition);
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  window.addEventListener("pageshow", restoreScrollPosition);
  updateBackToTop();
})();
