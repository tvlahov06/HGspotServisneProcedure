const CACHE_NAME = 'hgspot-servisi-v1';
const urlsToCache = [
    './',
    './index.html',
    './script.js',
    './brandDatabase.json',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './favicon.ico'
];

// Instalacija - cache fileova
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ HGspot SW: Cache otvoren');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.log('❌ HGspot SW: Cache greška:', err))
    );
    self.skipWaiting();
});

// Aktivacija - briše stare cacheove
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('🗑️ HGspot SW: Brišem stari cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch - network first za JSON, cache first za ostalo
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // brandDatabase.json - uvijek network first (da se vide promjene)
    if (url.pathname.endsWith('brandDatabase.json')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Ostali fileovi - cache first
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                        return response;
                    });
            })
    );
});
