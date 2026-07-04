// Service worker for Stock IT.
//
// This exists so Chrome/Android treats the app as a properly installable
// PWA (a registered service worker is one of the install criteria) - it
// does NOT try to cache your Firestore data, so the app always loads
// current data when online.
//
// IMPORTANT: this is NETWORK-FIRST, not cache-first. Every request tries
// the real network first, and only falls back to a cached copy if that
// fails (genuinely offline). An earlier cache-first version of this file
// served stale JavaScript indefinitely after every deploy, regardless of
// hard refresh - this version fixes that.

const CACHE_NAME = 'stockit-shell-v2';

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
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});