const CACHE_NAME = "joclean-admin-pwa-v1";
const APP_SHELL = [
  "./admin.html",
  "./manifest-admin.json",
  "./assets/logo.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
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

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Ne jamais mettre en cache l'API GitHub ni les fichiers de données dynamiques
  if (
    url.hostname === "api.github.com" ||
    url.hostname === "raw.githubusercontent.com" ||
    url.pathname.endsWith("/chantiers.js") ||
    url.pathname.endsWith("/avis.js")
  ) {
    return;
  }

  // Réseau en priorité avec repli sur le cache local si hors-ligne
  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200 && url.origin === self.location.origin) {
          const copy = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return networkRes;
      })
      .catch(() => caches.match(req))
  );
});
