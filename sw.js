const VERSION = "grinoceros-v2";
const FICHIERS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./data.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./sounds/abeille.ogg",
  "./sounds/canard.mp3",
  "./sounds/chat.ogg",
  "./sounds/cheval.ogg",
  "./sounds/chien.ogg",
  "./sounds/cochon.ogg",
  "./sounds/coq.ogg",
  "./sounds/elephant.ogg",
  "./sounds/grenouille.ogg",
  "./sounds/hibou.ogg",
  "./sounds/lion.ogg",
  "./sounds/mouton.ogg",
  "./sounds/oiseau.mp3",
  "./sounds/ours.ogg",
  "./sounds/poule.ogg",
  "./sounds/singe.ogg",
  "./sounds/vache.ogg",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(VERSION).then(cache => cache.addAll(FICHIERS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(cles => Promise.all(cles.filter(c => c !== VERSION).map(c => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

// Cache d'abord, reseau ensuite ; les sons trouves en ligne sont mis en cache.
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(enCache => {
      if (enCache) return enCache;
      return fetch(event.request).then(reponse => {
        if (reponse.ok && new URL(event.request.url).origin === self.location.origin) {
          const copie = reponse.clone();
          caches.open(VERSION).then(cache => cache.put(event.request, copie));
        }
        return reponse;
      });
    })
  );
});
