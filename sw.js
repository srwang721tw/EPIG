const CACHE_NAME = 'epig-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.js',
  '/src/game.js',
  '/src/save.js',
  '/src/entities/pig.js',
  '/src/entities/pen.js',
  '/src/systems/timeSystem.js',
  '/src/systems/healthSystem.js',
  '/src/systems/diseaseSystem.js',
  '/src/systems/breedingSystem.js',
  '/src/systems/eventSystem.js',
  '/src/data/pigTypes.js',
  '/src/data/feedTypes.js',
  '/src/data/penTiers.js',
  '/src/data/itemTypes.js',
  '/src/data/gachaPools.js',
  '/src/ui/uiManager.js',
  '/src/ui/hud.js',
  '/src/ui/penView.js',
  '/src/ui/shopView.js',
  '/src/ui/gachaView.js',
  '/src/ui/eventView.js',
  '/src/ui/modal.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
