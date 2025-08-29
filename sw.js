self.addEventListener('install', e => {
  e.waitUntil(caches.open('eat-what-v1').then(c => c.addAll(['/','/index.html'])));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
