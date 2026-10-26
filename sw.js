// AUTO CACHE-BUSTING SERVICE WORKER
const CACHE_NAME = 'pdi-pro-v' + Date.now();

self.addEventListener('install', (e) => {
  // Puthiya version vannal udane thanne active aavunnu
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Pazhaya ellaa cache-um udane clean cheyyunnu
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network First strategy: Aadhyam online network-il ninnu latest file edukkaam nokkum
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
