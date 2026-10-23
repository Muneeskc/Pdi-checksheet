const CACHE_NAME = 'pdi-pro-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/@zxing/library@0.20.0/umd/index.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js',
  'https://cdn-icons-png.flaticon.com/512/3202/3202926.png'
];

// 1. ഇൻസ്റ്റാൾ ചെയ്യുമ്പോൾ എല്ലാ ഫയലുകളും ഫോണിലേക്ക് കാഷെ ചെയ്യുന്നു
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. പഴയ കാഷെ ഒഴിവാക്കി പുതിയത് ആക്റ്റീവ് ആക്കുന്നു
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. നെറ്റ് ഇല്ലെങ്കിലും കാഷെയിൽ നിന്ന് ആപ്പ് തുറക്കുന്നു (Offline First)
self.addEventListener('fetch', (event) => {
  // Telegram / Google Script ലേക്കുള്ള അപ്‌ലോഡ് റിക്വസ്റ്റുകളെ സാധാരണപോലെ വിടുന്നു
  if (event.request.url.includes('telegram.org') || event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // പുതിയ ഫയലുകൾ വന്നാൽ അതും കാഷെയിലേക്ക് ചേർക്കുന്നു
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    }).catch(() => {
      // നെറ്റ് ഇല്ലാത്ത അവസ്ഥയിലും കാഷെ ഫയൽ തിരികെ നൽകുന്നു
      return caches.match('./index.html');
    })
  );
});
