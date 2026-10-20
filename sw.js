// DA42 QRH offline cache.
// Page (HTML): network first, so a new version shows up as soon as you are online; cached copy when offline.
// Icons and other files: cache first.
const VERSION = "da42-qrh-v6";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const isPage = req.mode === "navigate" || req.destination === "document" || req.url.endsWith(".html") || req.url.endsWith("/");
  if (isPage) {
    e.respondWith(fetch(req, {cache: "no-store"}).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put("./index.html", cp)); return res; })
      .catch(() => caches.match("./index.html").then(r => r || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => { if (res && res.ok) { const cp = res.clone(); caches.open(VERSION).then(c => c.put(req, cp)); } return res; })));
});
