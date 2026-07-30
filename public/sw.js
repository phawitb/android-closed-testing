// Minimal service worker — its only job is to exist and control fetches so
// the browser considers this an installable PWA. It deliberately does no
// caching: every route here is server-rendered per request (auth, live
// testing-cycle data), so caching pages would show stale state.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
