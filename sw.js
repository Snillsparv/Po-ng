// Offline support: serve the app from the cache and refresh it in the background,
// so updates show up the next time the app is opened.
var CACHE = 'poang-v1';
var ASSETS = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.webmanifest',
  'img/jag.jpg',
  'img/hannes.jpg',
  'icons/favicon.png',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  var network = fetch(request).then(function (response) {
    if (response.ok) {
      var copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.put(request, copy); }));
    }
    return response;
  });
  event.waitUntil(network.catch(function () {}));
  event.respondWith(caches.match(request, { ignoreSearch: true }).then(function (cached) {
    return cached || network;
  }));
});
