self.addEventListener('install', (e) => {
  console.log('[Service Worker] Installato');
});

self.addEventListener('fetch', (e) => {
  // Lascia passare le richieste di rete normalmente
  e.respondWith(fetch(e.request));
});