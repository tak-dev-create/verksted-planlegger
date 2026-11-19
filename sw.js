// Bump this version on every release so iPhone/PC pick up the new files
const CACHE_NAME = 'verksted-pwa-v11';
const ASSETS = [
  './', './index.html', './manifest.json',
  './css/app.css',
  './vendor/xlsx-0.20.2.full.min.js',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  // cache: 'reload' bypasses the browser's HTTP cache so a new release really gets new files
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' }))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never intercept Firebase / Google sign-in traffic – Firestore handles its own offline cache
  if (/googleapis\.com|firebaseio\.com|firebaseapp\.com|identitytoolkit|securetoken|apis\.google\.com|accounts\.google\.com/.test(url.hostname)) return;
  // Local emulators (development only)
  if (url.hostname === '127.0.0.1' && (url.port === '8080' || url.port === '9099')) return;

  // The app's own files: network first (always newest), cache as offline fallback
  if (url.origin === location.origin) {
    event.respondWith(
      // no-cache = always ask the server (cheap 304 when unchanged), never a stale HTTP-cache copy
      fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' })
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            const key = req.mode === 'navigate' ? './index.html' : req;
            caches.open(CACHE_NAME).then((c) => c.put(key, copy));
          }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true })
          .then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
    );
    return;
  }

  // Versioned CDN files (Firebase SDK, fonts, ExcelJS): cache first, refresh in background
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
