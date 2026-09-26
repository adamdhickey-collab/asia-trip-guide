// Cache the whole app on install so it works in a hotel lobby, on the bay,
// or on a plane with no signal. Cache-first for everything listed here; the
// network is only consulted for things that are not in the list.
//
// The cache is named after the ?v= query on the registration URL, which
// app.js sets from js/version.js. Bump APP_VERSION and the browser treats
// this as a new worker; activate() below throws away every older cache.

const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE = `asia-trip-${VERSION}`;

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/app.js',
  './js/itinerary.js',
  './js/clock.js',
  './js/places.js',
  './js/version.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './img/cover/angkor.jpg',
  './img/cover/chiang-mai-pagoda.jpg',
  './img/cover/halong-junk.jpg',
  './img/cover/hanoi-raft.jpg',
  './img/days/d01.jpg',
  './img/days/d02.jpg',
  './img/days/d03.jpg',
  './img/days/d04.jpg',
  './img/days/d05.jpg',
  './img/days/d06.jpg',
  './img/days/d07.jpg',
  './img/days/d08.jpg',
  './img/days/d09.jpg',
  './img/days/d09b.jpg',
  './img/days/d10.jpg',
  './img/days/d10b.jpg',
  './img/days/d11.jpg',
  './img/days/d12.jpg',
  './img/days/d13.jpg',
  './img/days/d14.jpg',
  './img/days/d15.jpg',
  './img/hotels/amanor-1.jpg',
  './img/hotels/amanor-2.jpg',
  './img/hotels/amanor-3.jpg',
  './img/hotels/amanor-4.jpg',
  './img/hotels/amanor-5.jpg',
  './img/hotels/avani-1.jpg',
  './img/hotels/avani-2.jpg',
  './img/hotels/avani-3.jpg',
  './img/hotels/avani-4.jpg',
  './img/hotels/avani-5.jpg',
  './img/hotels/caravelle-1.jpg',
  './img/hotels/caravelle-2.jpg',
  './img/hotels/caravelle-3.jpg',
  './img/hotels/caravelle-4.jpg',
  './img/hotels/caravelle-5.jpg',
  './img/hotels/jaya-1.jpg',
  './img/hotels/jaya-2.jpg',
  './img/hotels/jaya-3.jpg',
  './img/hotels/jaya-4.jpg',
  './img/hotels/lyra-1.jpg',
  './img/hotels/lyra-2.jpg',
  './img/hotels/lyra-3.jpg',
  './img/hotels/lyra-4.jpg',
  './img/hotels/oriental-jade-1.jpg',
  './img/hotels/oriental-jade-2.jpg',
  './img/hotels/oriental-jade-3.jpg',
];

// Tell any open page how the precache is going, so a first install on hotel
// Wi-Fi shows "Saving… 23 of 60" instead of nothing.
async function report(done, total) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  clients.forEach((c) => c.postMessage({ type: 'precache', done, total }));
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // cache: 'reload' skips the browser's HTTP cache so a new version never
    // installs from stale copies of the old one. Six at a time keeps it quick.
    let done = 0;
    for (let i = 0; i < SHELL.length; i += 6) {
      await Promise.all(SHELL.slice(i, i + 6).map((u) => cache.add(new Request(u, { cache: 'reload' }))));
      done = Math.min(SHELL.length, i + 6);
      await report(done, SHELL.length);
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations always get the app shell, whatever the path or query.
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((hit) => hit || fetch(request)),
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return res;
      });
    }),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
