const CACHE_NAME = 'eat-what-v3';
const PRECACHE_URLS = ['/', '/index.html'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Network-first for HTML, cache-first for others
self.addEventListener('fetch', event => {
  const req = event.request;
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isHTML) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put('/index.html', copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }))
  );
});

// 接收跳过等待指令：立刻激活新SW
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
