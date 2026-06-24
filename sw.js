/* Pomofocus++ service worker — offline app shell.
   Bump CACHE when you change index.html or assets to force an update. */
const CACHE = "pomofocus-plus-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable.png",
  "./apple-touch-icon.png",
  "./favicon-64.png",
    "./airplane.mp3",
    "./analog-bell.mp3",
    "./cafe.mp3",
    "./crystal-chime.mp3",
    "./digital-beep.mp3",
    "./fan.mp3",
    "./fireplace.mp3",
    "./forest.mp3",
    "./gentle-gong.mp3",
    "./heavy-rain.mp3",
    "./library.mp3",
    "./meditation-bowl.mp3",
    "./ocean.mp3",
    "./piano-chime.mp3",
    "./rain.mp3",
    "./retro-digital.mp3",
    "./river.mp3",
    "./school-bell.mp3",
    "./soft-bell.mp3",
    "./temple-bell.mp3",
    "./thunderstorm.mp3",
    "./tibetan-bowl.mp3",
    "./train.mp3",
    "./wind.mp3",
    "./wood-block.mp3"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(ASSETS.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // leave cross-origin (e.g. Google Calendar) alone

  // Navigations: network-first so a published update is picked up, fall back to cache offline.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  // Everything else (icons, manifest): cache-first, then network.
  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => hit)
    )
  );
});
