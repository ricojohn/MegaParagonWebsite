## 2026-10-02 — Adapt deployment to Hostinger public_html

- Add PHP join, inquiry and announcement proxies with server-side .env loading.
- Replace Node route URLs in browser scripts with actual .php endpoints.
- Preserve optional CV support without restoring the removed CV form field.
- Block private configuration/backend paths in .htaccess.
- Version browser script URLs to refresh cached Node-only code.
- Return clear JSON errors instead of leaking upstream HTML error pages.
- Document Hostinger deployment, nested website folders and verification.

## 2026-10-02 — Fix portal form submissions

- Replace browser process.env access with same-origin Node API routes.
- Load root .env on the server and keep API keys private.
- Forward inquiry JSON and join multipart/CV uploads with portal authentication.
- Add the missing backend/server.js entry point and setup documentation.
- Remove missing config.js script references and proxy announcement reads.
- Restrict static serving to public pages and assets; add upload limits and portal timeouts.
- Clear stale success/error classes before form retries.

# The Mega Paragon — Changelog

---

## V0.1 — September 8, 2026

> Initial website design and homepage foundation

**Shared Styles**

- Light, fixed full-width navigation with a gold accent line
- Hero video layout with dark background and responsive positioning
- Logo-color gradient treatments for headings, labels, buttons, and borders
- Shared typography, spacing, navigation, footer, and responsive styles

**Home**

- Created the Home page structure and supporting styles
- Added hero video controls and fallback branding
- Added the initial announcements section and footer layout

---

## V0.2 — September 12, 2026

> Core frontend pages and shared page structure

**Pages**

- Created the Home, About, Announcements, Contact, Join, and Products and Services pages
- Added supporting page-specific CSS files and reusable frontend structure

**Shared**

- Added shared navigation, page links, content sections, and responsive layouts
- Added shared frontend interaction behavior in the JavaScript files

---

## V0.3 — September 14, 2026

> About, team, and supporting content updates

**About and Team**

- Added the Company Profile and Meet the Team page structures
- Added leadership sections, area links, and supporting team styles
- Added supporting content and styling for the About, Contact, Join, Announcements, Products and Services, and Meet the Team pages

---

## V0.4 — September 16, 2026

> Announcement interaction, branding, and Company Profile updates

**Announcements**

- Added Home announcement Read More modal behavior matching the Announcements page
- Matched Home announcement card tags and modal close-button styling with the Announcements page

**Shared Branding**

- Updated the browser tab logo across the pages using the Mega Paragon logo

**Company Profile — `frontend/HTML/about-prof.html`**

- Added and refined the Company Profile image and text presentation
- Updated the Our Company and Our Journey sections with revised content, centered layouts, backgrounds, and image placeholders
- Added the Company History and Our Journey presentation based on the provided reference design

---

## V0.5 — September 17, 2026

> Company Profile visual sections and Meet the Team foundation

**Company Profile — `frontend/HTML/about-prof.html`**

- Refined the Our Journey image collage, card spacing, visibility, and section background
- Added the Vision and Mission section design with icons, geometric background lines, responsive sizing, and consistent typography
- Added the QC Skyline image as the Core Values section background with blended monochrome treatment
- Applied the About page navigation logo to the non-Home pages

**Meet the Team — `frontend/HTML/about-team.html`, `frontend/CSS/about-team.css`**

- Applied the provided Meet the Team design and imagery
- Added the District Manager section foundation with a placeholder photo carousel/gallery

---

## V0.6 — September 18, 2026

> Frontend preparation for organization hierarchy pages

**Frontend Structure**

- Prepared shared frontend layouts, reusable styles, assets, and scripts
- Organized the frontend HTML, CSS, and JavaScript folders before the organization pages were added

---

## V0.7 — September 19, 2026

> Organization pages and area updates

**Organization Pages**

- Added the Paragon Central organization chart and responsive team layout (`paragon-central.html`, `paragon-central.css`)
- Added the Paragon Ascent organization page and responsive team layout (`paragon-ascent.html`, `paragon-ascent.css`)
- Added the Paragon Be Limitless organization page and AM profile (`paragon-blimitless.html`, `paragon-blimitless.css`)
- Added the Paragon Iron Eagles Maximizer page, AM profile, background, and organization chart (`paragon-iem.html`, `paragon-iem.css`)
- Added real branch, unit manager, agent, image, and leadership information to the organization pages
- Added the former Philippine Air Force credential to the IEM AM profile
- Set Invictus Dei Branch to three Unit Managers and Quantum Maximizer Branch to four Unit Managers
- Updated the Iron Eagles navigation card link and Paragon Central background image

---

## V0.8 — September 23, 2026

> Meet the Team and organization visual updates

**Meet the Team**

- Added a continuously moving District Manager photo gallery with placeholders, hover pause, and seamless looping (`about-team.html`, `about-team.css`, `about-team-carousel.js`)
- Added TMP background images to the District Manager card and area cards
- Added the TMP gradient outline to the District Manager card and restored gold section dividers
- Changed area card labels from Area manager to Area branch
- Adjusted the District Manager quote container width while preserving its original height
- Updated the frontend with responsive layouts, real organization data, leadership images, TMP backgrounds, area cards, gold connectors, and the continuous gallery

---

## V0.9 — September 24, 2026

> Shared navigation hover styling updates

**Navigation — `styles.css`**

- Updated the Home navigation hover gradient by replacing the gold accent with navy blue
- Applied the shared navigation hover design to the remaining pages

---

## V1.0 — September 24, 2026

> Products, services, Join Us, and shared interaction updates, shared navigation hover styling updates

**Products and Services — `frontend/HTML/prod-serv.html`, `frontend/CSS/prod-serv.css`**

- Added bottom-aligned Learn More links with chevron icons to the service cards
- Added a gold Want to know more? button below the insurance solutions
- Linked quote and service actions to the contact section and form
- Updated the contact section to fill the device viewport responsively
- Refined contact-information grouping, alignment, and vertical spacing

**Join Us — `frontend/HTML/join.html`, `frontend/CSS/join.css`**

- Added Start your journey buttons below the Why Choose Us and Opportunities sections
- Linked the buttons to the Join Us application form
- Updated the application section for device-height presentation while preserving the existing form design

**Shared Page Interaction — `frontend/CSS/styles.css` and non-home HTML pages**

- Added a scroll-revealed floating back-to-top control to non-home pages
- Added the stacked upward-angle icon, hover label, and fade transition

**Navigation — `styles.css`**

- Updated the Home navigation hover gradient by replacing the gold accent with navy blue
- Applied the shared navigation hover design to the remaining pages

---

## V1.1 — September 25, 2026

> Live announcements, modal behavior, and announcement page cleanup

**Home — `frontend/HTML/home.html`**

- Removed hardcoded announcement placeholders from the Home announcements section
- Removed the obsolete inline announcement modal handler
- Kept the announcement grid empty until live API data is rendered

**Announcements — `frontend/HTML/announcements.html`**

- Removed hardcoded announcement placeholders from the Announcements page
- Kept the announcement grid empty until live API data is rendered

**Announcement Logic — `frontend/JS/announcements.js`**

- Connected the Home and Announcements pages to the live announcements API
- Rendered announcement cards dynamically from API data
- Added featured images to cards and modals
- Fixed full-page modal lookup for `announcementModal` while preserving Home modal support
- Centralized dynamic filtering and delegated Read More interactions

**Announcement Styling — `frontend/CSS/home.css`**

- Increased Home featured image sizing
- Centered featured images and preserved natural image proportions in modals
- Adjusted Home announcement section spacing

**Announcement Styling — `frontend/CSS/announcements.css`**

- Restyled the search field to match the filter controls
- Restored the browser-native search clear button
- Styled centered, natural-proportion announcement modal images

---

## V1.2 — September 26, 2026

> Navigation cleanup, menu behavior, and frontend error fixes. Products & Services hero and contact-layout refinements

**Navigation**

- Replaced the legacy navigation dropdown trigger with the current three-line menu control
- Added working open and close behavior for the shared navigation menu
- Restored dropdown link visibility when the menu is opened
- Removed obsolete navigation trigger and dropdown arrow styles and scripts

**Frontend Cleanup**

- Corrected Home page logo, video, and fallback asset paths
- Replaced the deprecated vertical slider styling with standardized vertical writing mode
- Removed temporary announcement API response debug logging
- Verified frontend JavaScript syntax and modified page diagnostics

**Products and Services — `frontend/HTML/prod-serv.html`, `frontend/CSS/prod-serv.css`**

- Moved the hero image from the CSS background into the HTML and restored its gradient overlay layering
- Restored the hero gradient overlay and corrected image, overlay, and content stacking
- Preserved the previous hero presentation while keeping the optimized image in HTML

---
