const CACHE_NAME = 'jbs-cache-v2'; // Increment version to invalidate old cache
const urlsToCache = [
  '/logo.png',
  '/favicon.png'
];

// Install - cache static assets only
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control immediately
  self.clients.claim();
});

// Fetch - Network First strategy (always try network, fallback to cache)
self.addEventListener('fetch', function(event) {
  // Skip API requests - don't cache them
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Only cache successful responses for static assets
        if (response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            // Only cache images
            if (event.request.url.match(/\.(png|jpg|jpeg|svg|gif|ico)$/)) {
              cache.put(event.request, responseClone);
            }
          });
        }
        return response;
      })
      .catch(function() {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});