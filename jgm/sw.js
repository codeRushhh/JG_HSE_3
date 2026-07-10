// Minimal service worker for JGM Site Safety Inspection.
// Intentionally does not cache or intercept requests, since the app relies on
// live, real-time data from Supabase — this only exists so the app qualifies
// as an installable PWA.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass every request straight through to the network — no caching.
  return;
});
