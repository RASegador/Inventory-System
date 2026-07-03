// Minimal service worker for Stock IT.
//
// This exists mainly so Chrome/Android treats the app as a properly
// installable PWA (a registered service worker is one of the install
// criteria) - it does NOT try to cache your Firestore data, so the app
// always loads current data when online. It only caches the static app
// shell (HTML/JS/CSS) so the app can still open (though not sync data)
// briefly offline or on a flaky connection.

const CACHE_NAME = 'stockit-shell-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle simple GET navigations/assets - never intercept Firestore/
  // Firebase Auth requests or any POST/PUT, so live data is never stale.
  if (request.method !== 'GET') return;
  if (request.url.includes('firestore.googleapis.com')) return;
  if (request.url.includes('identitytoolkit.googleapis.com')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
