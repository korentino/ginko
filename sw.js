
const cacheName = 'coginko';
const appShellFiles = [
  'index.html',
  'app.js',
  'style.css',
  'icons/icon-32.png',
  'icons/icon-64.png',
  'icons/icon-96.png',
  'icons/icon-128.png',
  'icons/icon-168.png',
  'icons/icon-192.png',
  'icons/icon-256.png',
  'icons/icon-512.png',
  'icons/maskable_icon.png'
];

  self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil((async () => {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(appShellFiles);
    })());
  });

  self.addEventListener('fetch', (e) => {
    var extension = e.request.url.split('.').pop();
    if(extension == "html" || extension == "png" || extension == "css" ||  extension == "ico" ){
        event.respondWith(caches.match(event.request));
    }else{
        event.respondWith(
            caches.open(cacheName).then(function (cache) {
              return cache.match(event.request).then(function (response) {
                return (
                  response ||
                  fetch(event.request).then(function (response) {
                    cache.put(event.request, response.clone());
                    return response;
                  })
                );
              });
            }),
          );
    }
    e.respondWith((async () => {
      const r = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (r) { return r; }
      const response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })());
  });

  self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key === cacheName) { return; }
        return caches.delete(key);
      }))
    }));
  });