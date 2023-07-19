const cacheName = "trotamundos-v1"
const assets = [
    "/",
    "/index.html",
    "/credits.html",
    "/css/trotamundos.css",
    "/css/preview.css",
    "/libs/Sortable1-15.min.js",
    "/libs/html2canvas.min.js",
    "/libs/jspdf2-5-1.umd.min.js",
    "/js/trotamundos.js",

    "icons/bin.png",
    "icons/cancel.png",
    "icons/favicon.ico",
    "icons/font.png",
    "icons/gallery.png",
    "icons/go-back.png",
    "icons/gpx.png",
    "icons/loading.gif",
    "icons/menu.png",
    "icons/pdf-black.png",
    "icons/pdf.png",
    "icons/photo-1.png",
    "icons/photo-2.png",
    "icons/photo-3a.png",
    "icons/photo-3b.png",
    "icons/photo-4.png",
    "icons/photo-placeholder.png",
    "icons/photo.png",
    "icons/plus.png",
    "icons/preview.png",
    "icons/publish.png",
    "icons/save.png",
    "icons/title.png",
    "icons/trotamundos-black.png",
    "icons/trotamundos.png"
]


self.addEventListener("install", (e) => {
    console.log("[Service Worker] Install");
    e.waitUntil(
        (async () => {
            const cache = await caches.open(cacheName);
            console.log("[Service Worker] Caching all: app shell and content");
            await cache.addAll(assets);
            //await cache.add("/index.html")
            //await cache.add("/credits.html")
        })(),
    );
});


self.addEventListener("fetch", (e) => {
    e.respondWith(
      (async () => {
        const r = await caches.match(e.request);
        console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
        if (r) {
          return r;
        }
        const response = await fetch(e.request);
        const cache = await caches.open(cacheName);
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
      })(),
    );
  });