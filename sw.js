// Offline support: serve the app from the cache and refresh it in the background,
// so updates show up the next time the app is opened.
var CACHE = 'poang-v3';
var ASSETS = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'splash.js',
  'sound/pannekage.mp3',
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
  // Cache each file on its own, so one missing file doesn't stop the rest from working offline.
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return Promise.all(ASSETS.map(function (url) {
      return cache.add(new Request(url, { cache: 'reload' })).catch(function () {});
    }));
  }));
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        // Other apps on the same github.io origin share this cache storage; only remove our own.
        var old = keys.filter(function (k) { return k !== CACHE && k.indexOf('poang-') === 0; });
        return Promise.all(old.map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  // Safari streams media with range requests, which a plain cached response can't answer.
  if (request.headers.has('range')) return;

  // Check with the server instead of trusting the browser's HTTP cache, so updates arrive promptly.
  var network = fetch(request, { cache: 'no-cache' }).then(function (response) {
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
