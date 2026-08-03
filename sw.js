const CACHE_NAME = "kas-ipl-shell-v1";
const SHELL_FILES = [
  "./index.html",
  "./manifest.json",
  "./config.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Shell files: cache-first (so app installs & opens offline).
// Data requests to the Apps Script API: always go to network (never cached),
// so warga always see fresh saldo/transaksi.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isDataRequest = url.hostname.includes("script.google.com");

  if (isDataRequest) {
    return; // let it hit network normally, no caching of financial data
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
