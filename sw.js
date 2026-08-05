const CACHE_NAME = "kas-ipl-shell-v3";
const SHELL_FILES = [
  "./index.html",
  "./manifest.json",
  "./manifest-satpam.json",
  "./config.js",
  "./icon-192.png",
  "./icon-512.png",
  "./darurat.html",
  "./jadwal-jaga.html",
  "./patroli.html"
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

// Data (Apps Script): selalu network, tidak pernah di-cache.
// Shell (html/js/css/icon): NETWORK-FIRST - selalu coba ambil versi terbaru
// dari internet dulu; kalau offline/gagal, baru fallback ke cache.
// Ini supaya update yang kita deploy selalu langsung kepakai, tidak nyangkut
// di versi lama seperti sebelumnya.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isDataRequest = url.hostname.includes("script.google.com") || url.hostname.includes("script.googleusercontent.com");

  if (isDataRequest) {
    return; // biarkan langsung ke network, tidak disentuh sama sekali
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
