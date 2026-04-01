// ═══════════════════════════════════════════
// BemVô — Service Worker (PWA)
// ═══════════════════════════════════════════

const CACHE_NAME = 'bemvo-v1';
const ASSETS = [
  './bemvo_final.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=Nunito+Sans:wght@400;600;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Instala e faz cache dos assets principais
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS).catch(function(err) {
        console.warn('Alguns assets não puderam ser cacheados:', err);
      });
    })
  );
  self.skipWaiting();
});

// Ativa e remove caches antigos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Estratégia: Cache primeiro, rede como fallback
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        // Cacheia novas respostas válidas
        if (response && response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Offline fallback para navegação
        if (event.request.mode === 'navigate') {
          return caches.match('./bemvo_final.html');
        }
      });
    })
  );
});
