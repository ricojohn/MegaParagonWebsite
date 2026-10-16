// Local dev server with clean URLs (mirrors .htaccess). Run: node serve.js  ->  http://localhost:8080/home
const http = require("http"),
  fs = require("fs"),
  path = require("path");
const root = __dirname,
  port = process.env.PORT || 8080;
const pages = {
  "": "home",
  home: "home",
  about: "about",
  announcements: "announcements",
  contact: "contact",
  products: "prod-serv",
  careers: "join",
  ascent: "paragon-ascent",
  central: "paragon-central",
  belimitless: "paragon-blimitless",
  ironeagles: "paragon-iem",
};
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
};

// Load secrets on the server only. The root .env path is independent of cwd.
require("./backend/node_modules/dotenv").config({ path: path.join(root, ".env") });
const routes = {
  "/api/join": ["POST", "JOIN_TEAM_ENDPOINT", "JOIN_TEAM_API_KEY"],
  "/api/inquiry": ["POST", "INQUIRIES_ENDPOINT", "INQUIRIES_API_KEY"],
  "/api/announcements": ["GET", "ANNOUNCEMENTS_ENDPOINT", "ANNOUNCEMENTS_API_KEY"],
};

async function proxy(req, res, route) {
  const [method, endpointName, keyName] = route;
  if (req.method !== method) {
    res.writeHead(405, { Allow: method });
    return res.end();
  }
  const endpoint = process.env[endpointName]?.trim();
  const key = process.env[keyName]?.trim();
  if (!endpoint || !key) {
    res.writeHead(503, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Portal connection is not configured." }));
  }
  try {
    // Preserve the browser's multipart boundary and CV bytes. Never parse uploads as JSON.
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 10 * 1024 * 1024) {
        res.writeHead(413, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Submission exceeds the 10 MB limit." }));
      }
      chunks.push(chunk);
    }
    const headers = { "X-API-Key": key, Accept: "application/json" };
    if (req.headers["content-type"]) headers["Content-Type"] = req.headers["content-type"];
    const upstream = await fetch(endpoint, {
      method, headers,
      ...(method === "POST" ? { body: Buffer.concat(chunks) } : {}),
      signal: AbortSignal.timeout(30000),
      redirect: "error",
    });
    const body = await upstream.text();
    res.writeHead(upstream.status, {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch (error) {
    console.error("Portal request failed:", error.name);
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Unable to connect to the portal. Please try again later." }));
  }
}

const server = http.createServer((req, res) => {
  let p;
  try {
    p = decodeURIComponent(req.url.split("?")[0]).replace(/\/+$/, "").replace(/^\/+/, "");
  } catch {
    res.writeHead(400);
    return res.end("Invalid URL");
  }
  if (Object.hasOwn(routes, "/" + p)) return proxy(req, res, routes["/" + p]);
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405, { Allow: "GET, HEAD" });
    return res.end();
  }
  // Serve only public pages and asset folders, never .env, backend, or Git files.
  const isPage = Object.hasOwn(pages, p);
  let file = isPage ? pages[p] + ".html" : p;
  if (!isPage && Object.values(pages).includes(p)) file = p + ".html";
  const publicPage = Object.values(pages).some(name => file === name + ".html");
  const publicAsset = /^(CSS|JS|assets)\//.test(file) && !file.split(/[\\/]/).some(part => part.startsWith("."));
  const full = path.resolve(root, file);
  if ((!publicPage && !publicAsset) || !full.startsWith(root + path.sep) ||
      !fs.existsSync(full) || !fs.statSync(full).isFile()) {
    res.writeHead(404);
    return res.end("Not found");
  }
  res.writeHead(200, { "Content-Type": types[path.extname(full).toLowerCase()] || "application/octet-stream" });
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(full).on("error", () => res.destroy()).pipe(res);
});
// Export for local integration checks without starting a second listener.
module.exports = server;
if (require.main === module) {
  server.listen(process.env.PORT || 8080, () => console.log(`http://localhost:${process.env.PORT || 8080}/home`));
}
