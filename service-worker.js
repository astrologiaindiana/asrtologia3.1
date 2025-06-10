// === service-worker.js ===
// Service Worker para funcionalidades offline e PWA

const CACHE_NAME = 'astrologia-indiana-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/config.js',
  '/js/auth.js',
  '/js/airtable.js',
  '/js/utils.js',
  '/js/ui.js',
  '/js/map-queue.js',
  '/js/new-sale.js',
  '/js/clients.js',
  '/js/video-calls.js',
  '/js/financial.js',
  '/js/settings.js',
  '/js/app.js',
  '/assets/logo.png',
  '/assets/user-avatar.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando arquivos');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativado');
  
  // Limpar caches antigos
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Limpando cache antigo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
  // Estratégia: Network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
