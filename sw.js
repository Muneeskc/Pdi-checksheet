// AUTO-UPDATING NETWORK-FIRST SERVICE WORKER
const CACHE_NAME = 'pdi-pro-cache-v19';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
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

// Safe Network-First Logic
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // External APIs (Telegram, Google Script) bypass
  const url = new URL(e.request.url);
  if (url.origin.includes('telegram.org') || url.origin.includes('google.com') || url.origin.includes('script.google')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
