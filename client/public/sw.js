// Immediate cleanup of service worker caches
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => {
      return self.registration.unregister();
    })
  );
  self.clients.claim();
});

// Always bypass cache and fetch directly from network
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
