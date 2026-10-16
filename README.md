# Mega Paragon Website

## Hostinger regular public_html hosting

Production uses PHP proxies, not a running Node server. PHP 8.0+ with cURL and fileinfo is required.

1. Deploy the HTML, CSS, JS, assets, api folder and root .htaccess together.
2. Copy .env.example to .env and fill in the portal credentials. Prefer placing it in the parent folder of the deployed website. A root .env fallback is supported and blocked from HTTP access by .htaccess.
3. Confirm /api/inquiry.php and /api/join.php exist under the public website root. Opening either in a browser should return JSON with Method not allowed (405), not a Hostinger 404 page.
4. Submit the website forms and verify receipt in the portal. Announcement reads use /api/announcements.php.

Do not commit real keys. Rotate previously shared keys. If a deployment is nested under public_html/website, configure the document root or existing parent rewrite so /api/*.php resolves into website/api/*.php.

Join submits multipart fields with an optional CV; inquiry submits JSON. PHP adds X-API-Key from server configuration and preserves portal JSON status responses. A 10 MB total submission limit and 30 second portal timeout apply. For uploads, PHP upload_max_filesize and post_max_size must also permit the intended size.

The Join Us and Products & Services forms use invisible Google reCAPTCHA v2. The public site key is configured on each form in its `data-sitekey` attribute; keep the matching secret key server-side as `RECAPTCHA_SECRET_KEY` in `.env`. The PHP proxy verifies each token with Google before forwarding a submission and does not send the token to the portal.

The Node serve.js entry point is retained for the earlier Node setup; use the PHP-enabled host to test these production PHP routes. npm install and a Node process are not required for Hostinger PHP deployment.
