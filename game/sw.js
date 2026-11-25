/* Electronics Repair Simulator service worker.
   Cache-first for the app shell so it works offline. Firebase and other
   cross-origin requests are never cached, and saves stay in localStorage. */
const VERSION = 'ers-academy-v1';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './firebase-config.js', './firebase-sync.js',
  './css/app.css',
  './js/engine.js',
  './js/art.js',
  './js/boot.js',
  './js/ui/academy.js',
  './js/ui/core.js',
  './js/ui/lessons.js',
  './js/ui/parts.js',
  './js/ui/widgets.js',
  './js/ui/workshop.js',
  './assets/README.txt',
  './assets/bench-desk.svg',
  './assets/dev-1.svg',
  './assets/dev-10.svg',
  './assets/dev-12.svg',
  './assets/dev-13.svg',
  './assets/dev-14.svg',
  './assets/dev-15.svg',
  './assets/dev-16.svg',
  './assets/dev-2.svg',
  './assets/dev-3.svg',
  './assets/dev-4.svg',
  './assets/prop-dmm.svg',
  './assets/prop-driver.svg',
  './assets/prop-iron.svg',
  './assets/prop-lens.svg',
  './assets/prop-psu.svg',
  './assets/prop-scope.svg',
  './assets/prop-spool.svg',
  './assets/prop-tweezers.svg',
  './assets/scene-career.svg',
  './assets/scene-courses.svg',
  './assets/scene-divider.svg',
  './assets/scene-empty.svg',
  './assets/scene-history.svg',
  './assets/scene-home.svg',
  './assets/scene-ident.svg',
  './assets/scene-inventory.svg',
  './assets/scene-lesson-1.svg',
  './assets/scene-lesson-2.svg',
  './assets/scene-lesson-3.svg',
  './assets/scene-lesson-4.svg',
  './assets/scene-lesson-5.svg',
  './assets/scene-lesson-6.svg',
  './assets/scene-levels.svg',
  './assets/scene-profile.svg',
  './assets/scene-result.svg',
  './assets/scene-safety.svg',
  './assets/scene-series.svg',
  './assets/scene-settings.svg',
  './assets/scene-shop.svg',
  './assets/scene-skills.svg',
  './assets/scene-solder.svg',
  './assets/scene-symbols.svg',
  './assets/scene-tutorial.svg',
  './assets/wood-tile.svg',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/maskable-512.png', './icons/apple-touch-icon.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(
    SHELL.map(u => c.add(u).catch(() => {}))
  )).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(
    ks.filter(k => k !== VERSION).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put('./index.html', copy));
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(r, copy)); }
    return res;
  })));
});
