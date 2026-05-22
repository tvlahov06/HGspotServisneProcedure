// Promijeni verziju svaki put kad uploadaš promjene!
const CACHE_NAME = 'hgspot-servisi-v2';

// Samo statični fileovi koji se rijetko mijenjaju
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './favicon.ico'
];

// Fileovi koji se NIKAD ne keširaju - uvijek svježi s mreže
const noCacheFiles = ['admin.html', 'script.js', 'brandDatabase.json'];

// Instalacija
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .catch(err => console.log('❌ SW Cache greška:', err))
    );
    self.skipWaiting();
});

// Aktivacija - briše stare cacheove
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const filename = url.pathname.split('/').pop();

    // Nikad ne kešira ove fileove
    if (noCacheFiles.includes(filename)) {
        event.respondWith(
            fetch(event.request, { cache: 'no-store' })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Ostalo - cache first
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request).then(response => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                });
            })
    );
});
