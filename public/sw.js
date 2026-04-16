// Tunog Kalye Radio — Production Service Worker
// Handles offline caching, push notifications, streaming bypass

const CACHE_NAME = "tkr-v2";
const STATIC_CACHE = "tkr-static-v2";
const DYNAMIC_CACHE = "tkr-dynamic-v2";

// Static assets to pre-cache on install
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/tunog-kalye-horizontal.png",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/favicon.ico",
];

// ─── Install ────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ─── Activate: clean old caches ─────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Push: show notification ────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {
    title: "Tunog Kalye Radio",
    body: "New update from TKR!",
    icon: "/pwa-192x192.png",
    badge: "/pwa-64x64.png",
    tag: "tkr-general",
    url: "/",
    actions: [
      { action: "listen", title: "\u25B6 Listen Now" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      data: { url: data.url },
      actions: data.actions,
      vibrate: [200, 100, 200],
      image: data.image || undefined,
      requireInteraction: data.requireInteraction || false,
    })
  );
});

// ─── Notification click ─────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes("tunogkalye") && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// ─── Fetch: smart caching strategy ──────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API calls — always go to network
  if (url.pathname.startsWith("/api/")) return;

  // Skip AzuraCast streaming — always go to network (live audio)
  if (
    url.hostname.includes("azuracast") ||
    url.pathname.includes("/radio") ||
    url.pathname.endsWith(".m3u8") ||
    url.pathname.endsWith(".ts") ||
    url.pathname.endsWith(".aac") ||
    url.pathname.endsWith("/live") ||
    request.url.includes("stream") ||
    request.url.includes("radio")
  ) {
    return;
  }

  // Strategy for different asset types:
  // 1. Static assets (JS, CSS, fonts, images) → Cache First with Network Fallback
  // 2. HTML pages → Network First with Cache Fallback
  const isStaticAsset =
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".webp");

  if (isStaticAsset) {
    // Cache First for static assets
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => {
          // Return offline fallback for images if available
          return new Response("Offline", { status: 503, statusText: "Offline" });
        });
      })
    );
  } else {
    // Network First for HTML / dynamic content
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Return the cached homepage as fallback for navigation
            if (request.mode === "navigate") {
              return caches.match("/");
            }
            return new Response("Offline", { status: 503, statusText: "Offline" });
          });
        })
    );
  }
});
