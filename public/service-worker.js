const CACHE_NAME = 'fitswap-cache-v2';
const OFFLINE_URL = '/index.html';
const ASSET_URLS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSET_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function staleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then(cache =>
    cache.match(request).then(cached => {
      const network = fetch(request).then(response => {
        try { cache.put(request, response.clone()); } catch(e) {}
        return response;
      }).catch(()=>cached);
      return cached || network;
    })
  );
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // API calls: try network then fallback to cache
  if (url.pathname.startsWith('/api') || url.pathname.includes('/posts')) {
    event.respondWith(
      fetch(event.request).then(resp => {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(c => { try { c.put(event.request, respClone); } catch(e){} });
        return resp;
      }).catch(() => caches.match(event.request).then(r => r || caches.match(OFFLINE_URL)))
    );
    return;
  }
  event.respondWith(staleWhileRevalidate(event.request).catch(()=>caches.match(OFFLINE_URL)));
});