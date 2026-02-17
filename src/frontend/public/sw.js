const CACHE_VERSION = 'v4';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Critical static assets to pre-cache (modern formats + fallbacks)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/generated/recomnow-logo.dim_200x200.avif',
  '/assets/generated/recomnow-logo.dim_200x200.webp',
  '/assets/generated/recomnow-logo.dim_200x200.png',
  '/assets/generated/hero-banner.dim_1200x400.avif',
  '/assets/generated/hero-banner.dim_1200x400.webp',
  '/assets/generated/hero-banner.dim_1200x400.png',
];

// Install event - pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.error('Failed to cache static assets:', error);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('static-') || cacheName.startsWith('dynamic-');
          })
          .filter((cacheName) => {
            return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache robots.txt or sitemap.xml - always fetch fresh
  if (url.pathname === '/robots.txt' || url.pathname === '/sitemap.xml') {
    event.respondWith(fetch(request));
    return;
  }

  // Cache-first strategy for static assets (JS, CSS, images)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          // Only cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network-first strategy for HTML and API calls
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
