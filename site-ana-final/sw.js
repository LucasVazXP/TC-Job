const staticCacheName = "site-static-v1";
const dynamicCacheName = "site-dynamic-v1";
const assets = ["https://fonts.googleapis.com/css2?family=Bungee&display=swap"];

// Install Event => Adding Static Cache
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      cache.addAll(assets);
    }),
  );
});

// Activate Event => Deleting Old Cache Versions
self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => ![staticCacheName, dynamicCacheName].includes(key))
          .map((key) => caches.delete(key)),
      );
    }),
  );
});

// Fetch Events => Caching Fetch Events' Responses
self.addEventListener("fetch", (evt) => {
  let doSave = false;
  const includeCache = [".svg", ".png", ".jpg", ".webp", ".gif", ".mp4", ".mov", ".mp3"];
  includeCache.find((thisWord) => {
    doSave = evt?.request?.url?.includes?.(thisWord);
    return doSave;
  });

  if (!doSave) {
    return evt;
  }

  evt.respondWith(
    caches.match(evt.request).then((cacheRes) => {
      function fetchBrandNew() {
        return fetch(evt.request).then((fetchRes) => {
          return caches.open(dynamicCacheName).then((cache) => {
            cache.put(evt.request.url, fetchRes.clone());
            // check cached items size
            return fetchRes;
          });
        });
      }

      return cacheRes || fetchBrandNew();
    }),
  );
});
