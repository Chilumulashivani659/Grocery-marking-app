const CACHE = 'grocery-marking-v2';
const URLS = [
  '/',
  'index.html',
  'manifest.json',
  'icons/icon-192.svg',
  'icons/icon-512.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys.filter(k => k !== CACHE).map(k => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(r => r || fetch(e.request))
      .catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('index.html');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});
