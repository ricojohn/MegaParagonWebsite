/*
ADMIN SYSTEM: CREATE ANNOUNCEMENT FIELDS

- Category: dropdown containing existing categories
- Title: announcement title
- Body: announcement description/content
- Published at: publication date and time
- Location: event or announcement location
- Featured image: uploaded image file
- Actions: Cancel or Save

ADMIN SYSTEM: CATEGORY MANAGEMENT

- Name: category name
- Sort order: numeric display order; lower numbers appear first
- Actions when viewing a category: Edit category or Delete category
- Empty state: "No announcements in this category yet"

PUBLIC API AUTHENTICATION

X-API-key: (value)

PUBLIC API ENDPOINTS

Method | URL | Purpose

GET | /api/v1/announcements | Paginated List, newest first

GET | /api/v1/announcements/{id} | One published announcement

GET | /api/v1/announcements-categories | Categories that have published posts 

PUBLIC API SAMPLE CONNECTION

const res = await fetch('https://themegaparagon.net/api/v1/announcements',{
  headers: {
    'X-Api-Key':'X-Api-Key',
  },
});

const{data} = await res.json();

*/

// Shared announcement connection and rendering for home.html and announcements.html.
// Fetch through PHP so the announcement key stays on the server.
const announcementsApiUrl = "/api/announcements.php";

function getAnnouncementCategory(announcement) {
  return announcement.category?.name || announcement.category || "Announcement";
}

function getCategoryClass(category) {
  const normalizedCategory = category.toLowerCase();
  if (normalizedCategory.includes("event")) return "tag-event";
  if (normalizedCategory.includes("news")) return "tag-news";
  return "tag-announcement";
}

function formatAnnouncementDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function populateAnnouncementFilters(announcements) {
  const categoryFilter = document.getElementById("filterCategory");
  const monthFilter = document.getElementById("filterMonth");
  const yearFilter = document.getElementById("filterYear");

  if (categoryFilter) {
    const categories = [
      ...new Map(
        announcements.map((announcement) => {
          const category = getAnnouncementCategory(announcement);
          return [category.toLowerCase(), category];
        }),
      ).entries(),
    ].sort((first, second) => first[1].localeCompare(second[1]));
    categoryFilter.replaceChildren(new Option("All Categories", "all"));
    categories.forEach(([value, label]) => {
      categoryFilter.add(new Option(label, value));
    });
  }

  if (monthFilter) {
    const months = [
      ...new Set(
        announcements.map((announcement) =>
          new Date(announcement.published_at).toLocaleString(undefined, {
            month: "long",
          }),
        ),
      ),
    ].sort((first, second) => first.localeCompare(second));
    monthFilter.replaceChildren(new Option("All Months", "all"));
    months.forEach((month) => monthFilter.add(new Option(month, month)));
  }

  if (yearFilter) {
    const years = [
      ...new Set(
        announcements.map((announcement) =>
          String(new Date(announcement.published_at).getFullYear()),
        ),
      ),
    ].sort((first, second) => Number(second) - Number(first));
    yearFilter.replaceChildren(new Option("All Years", "all"));
    years.forEach((year) => yearFilter.add(new Option(year, year)));
  }
}

const FALLBACK_ANNOUNCEMENT_IMAGE = "assets/mainlogo/TMP Logo with Outline.png";

function createAnnouncementImage(announcement, className = "") {
  const image = document.createElement("img");
  if (className) image.className = className;
  image.src = announcement.featured_image_url || FALLBACK_ANNOUNCEMENT_IMAGE;
  image.alt = announcement.title || "Announcement image";
  image.loading = "lazy";
  if (!announcement.featured_image_url) image.classList.add("is-fallback");
  // If a real photo fails to load, show the fallback logo instead.
  image.addEventListener(
    "error",
    () => {
      image.src = FALLBACK_ANNOUNCEMENT_IMAGE;
      image.classList.add("is-fallback");
    },
    { once: true },
  );
  return image;
}

function createAnnouncementCard(announcement, compact = false) {
  const category = getAnnouncementCategory(announcement);
  const card = document.createElement("article");
  card.className = compact ? "news-card" : "announcement-card";
  card.dataset.category = category.toLowerCase();
  card.dataset.month = new Date(announcement.published_at).toLocaleString(
    undefined,
    { month: "long" },
  );
  card.dataset.year = new Date(announcement.published_at).getFullYear();

  const tag = document.createElement("span");
  tag.className = `news-tag ${getCategoryClass(category)}`;
  tag.textContent = category;

  const date = document.createElement("span");
  date.className = "event-date";
  date.textContent = formatAnnouncementDate(announcement.published_at);

  const image = createAnnouncementImage(announcement, "announcement-featured-image");
  card.append(image);

  const title = document.createElement("h3");
  title.textContent = announcement.title || "Untitled announcement";

  const body = document.createElement("p");
  body.textContent = announcement.body || "";

  const action = document.createElement(compact ? "a" : "button");
  action.className = "read-more";
  action.append(document.createTextNode("Read More"));
  const actionIcon = document.createElement("i");
  actionIcon.className = "fa-solid fa-arrow-right";
  actionIcon.setAttribute("aria-hidden", "true");
  action.append(actionIcon);
  if (!compact) {
    action.type = "button";
  } else {
    action.href = "#";
  }

  card.append(tag, date, title, body, action);
  return card;
}

function renderAnnouncements(announcements) {
  const fullGrid = document.querySelector("#announcementsGrid");
  const homeGrid = document.querySelector("#announcements .news-grid");

  if (fullGrid) {
    fullGrid.replaceChildren(
      ...announcements.map((announcement) =>
        createAnnouncementCard(announcement),
      ),
    );
    document.dispatchEvent(new CustomEvent("announcements:rendered"));
  }

  if (homeGrid) {
    homeGrid.replaceChildren(
      ...announcements
        .slice(0, 3)
        .map((announcement) => createAnnouncementCard(announcement, true)),
    );
  }

  renderHomeBanner(announcements);
}

let activeAnnouncementTrigger = null;

const homeBannerDelay = 6000;
let homeBannerTimer = null;
let homeBannerIndex = 0;

function scheduleHomeBanner() {
  clearTimeout(homeBannerTimer);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  homeBannerTimer = setTimeout(
    () => showHomeBannerSlide(homeBannerIndex + 1),
    homeBannerDelay,
  );
}

function showHomeBannerSlide(index) {
  const banner = document.getElementById("newsBanner");
  if (!banner) return;
  const slides = banner.querySelectorAll(".sl");
  if (!slides.length) return;
  homeBannerIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, i) =>
    slide.classList.toggle("on", i === homeBannerIndex),
  );
  document
    .querySelectorAll("#newsBannerDots button")
    .forEach((dot, i) =>
      dot.setAttribute("aria-current", String(i === homeBannerIndex)),
    );
  scheduleHomeBanner();
}

function initHomeBannerControls(banner) {
  if (banner.dataset.ready) return;
  banner.dataset.ready = "true";
  document
    .getElementById("newsBannerPrev")
    ?.addEventListener("click", () => showHomeBannerSlide(homeBannerIndex - 1));
  document
    .getElementById("newsBannerNext")
    ?.addEventListener("click", () => showHomeBannerSlide(homeBannerIndex + 1));
  banner.addEventListener("pointerenter", () => clearTimeout(homeBannerTimer));
  banner.addEventListener("pointerleave", scheduleHomeBanner);
}

function createBannerSlide(announcement, index) {
  const category = getAnnouncementCategory(announcement);
  const slide = document.createElement("div");
  slide.className = `sl s${(index % 3) + 1}`;

  const media = document.createElement("div");
  media.className = "im";
  media.append(createAnnouncementImage(announcement));

  const text = document.createElement("div");
  text.className = "tx";

  const chip = document.createElement("span");
  chip.className = "chip";
  chip.textContent = category;

  const title = document.createElement("h3");
  title.textContent = announcement.title || "Untitled announcement";

  const body = document.createElement("p");
  body.textContent = announcement.body || "";

  const link = document.createElement("a");
  link.className = "banner-link";
  link.href = "announcements";
  link.append(document.createTextNode("Read more"));
  const linkIcon = document.createElement("i");
  linkIcon.className = "fa-solid fa-arrow-right";
  linkIcon.setAttribute("aria-hidden", "true");
  link.append(linkIcon);

  text.append(chip, title, body, link);
  slide.append(text, media);
  return slide;
}

// Home banner: one slide per published announcement, newest first.
function renderHomeBanner(announcements) {
  const banner = document.getElementById("newsBanner");
  if (!banner) return;
  const dots = document.getElementById("newsBannerDots");
  banner.querySelectorAll(".sl").forEach((slide) => slide.remove());
  dots.replaceChildren();
  if (!announcements.length) {
    banner.hidden = true;
    return;
  }

  dots.before(
    ...announcements.map((announcement, index) =>
      createBannerSlide(announcement, index),
    ),
  );
  announcements.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show update ${index + 1}`);
    dot.addEventListener("click", () => showHomeBannerSlide(index));
    dots.append(dot);
  });

  banner.hidden = false;
  initHomeBannerControls(banner);
  showHomeBannerSlide(0);
}

function showAnnouncementModal(card, prefix) {
  const modalId = prefix ? `${prefix}AnnouncementModal` : "announcementModal";
  const modal = document.getElementById(modalId);
  if (!modal) return;
  const existingImage = modal.querySelector(".announcement-modal-image");
  existingImage?.remove();
  const cardImage = card.querySelector(".announcement-featured-image");
  if (cardImage) {
    const image = document.createElement("img");
    image.className = "announcement-modal-image";
    image.src = cardImage.src;
    image.alt = cardImage.alt;
    modal.querySelector("h2").before(image);
  }
  modal.querySelector(".news-tag").className =
    card.querySelector(".news-tag").className;
  modal.querySelector(".news-tag").textContent =
    card.querySelector(".news-tag").textContent;
  modal.querySelector(".event-date").textContent =
    card.querySelector(".event-date").textContent;
  modal.querySelector("h2").textContent = card.querySelector("h3").textContent;
  modal.querySelector("p").textContent = card.querySelector("p").textContent;
  modal.setAttribute("aria-hidden", "false");
  modal.classList.add("is-open");
  document.body.classList.add("announcement-modal-open");
}

function setupAnnouncementInteractions() {
  const fullGrid = document.querySelector("#announcementsGrid");
  const homeGrid = document.querySelector("#announcements .news-grid");
  const searchInput = document.getElementById("announcementSearch");
  const filters = [
    document.getElementById("filterCategory"),
    document.getElementById("filterMonth"),
    document.getElementById("filterYear"),
  ].filter(Boolean);
  const emptyState = document.getElementById("announcementsEmpty");

  function applyFilters() {
    if (!fullGrid) return;
    const query = searchInput?.value.trim().toLowerCase() || "";
    const category = document.getElementById("filterCategory")?.value || "all";
    const month = document.getElementById("filterMonth")?.value || "all";
    const year = document.getElementById("filterYear")?.value || "all";
    let visibleCount = 0;

    fullGrid.querySelectorAll(".announcement-card").forEach((card) => {
      const visible =
        (!query || card.textContent.toLowerCase().includes(query)) &&
        (category === "all" || card.dataset.category === category) &&
        (month === "all" || card.dataset.month === month) &&
        (year === "all" || card.dataset.year === year);
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    if (emptyState) emptyState.hidden = visibleCount !== 0;
  }

  [...filters, searchInput].filter(Boolean).forEach((control) => {
    control.addEventListener("input", applyFilters);
  });

  [fullGrid, homeGrid].filter(Boolean).forEach((grid) => {
    grid.addEventListener("click", (event) => {
      const action = event.target.closest(".read-more");
      if (!action) return;
      event.preventDefault();
      activeAnnouncementTrigger = action;
      showAnnouncementModal(
        action.closest("article"),
        grid === homeGrid ? "home" : "",
      );
    });
  });

  document.querySelectorAll(".announcement-modal").forEach((modal) => {
    modal
      .querySelector(".announcement-modal-close")
      ?.addEventListener("click", () => {
        activeAnnouncementTrigger?.focus();
        modal.setAttribute("aria-hidden", "true");
        modal.classList.remove("is-open");
        document.body.classList.remove("announcement-modal-open");
        activeAnnouncementTrigger = null;
      });
  });
}

async function loadAnnouncements() {
  try {
    const response = await fetch(announcementsApiUrl, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok)
      throw new Error(`Announcements API returned HTTP ${response.status}`);
    const result = await response.json();
    const announcements = Array.isArray(result.data) ? result.data : [];
    populateAnnouncementFilters(announcements);
    renderAnnouncements(announcements);
  } catch (error) {
    console.error("Announcements API connection failed:", error);
  }
}

setupAnnouncementInteractions();
loadAnnouncements();
