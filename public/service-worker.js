/// <reference lib="webworker" />

const CACHE_NAME = "aura-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/offline.html",
  "/manifest.json",
];

// Install event - cache static assets
self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(ASSETS_TO_CACHE);
      await (self as any).skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
      await (self as any).clients.claim();
    })()
  );
});

// Fetch event - Stale-while-revalidate strategy
self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API calls - let them go through
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response for caching
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(async () => {
          // Return cached version if fetch fails
          const cached = await caches.match(request);
          return cached || new Response("Offline - Data unavailable");
        })
    );
    return;
  }

  // For assets and pages - use stale-while-revalidate
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);

      const fetchPromise = fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if fetch fails
          return cached || new Response("Offline - Resource unavailable");
        });

      // Return cached version immediately, fetch in background
      return cached || fetchPromise;
    })()
  );
});

// Background sync (for future implementation)
self.addEventListener("sync", (event: any) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Sync logic will be implemented here
    console.log("Syncing data...");
  } catch (error) {
    console.error("Sync failed:", error);
  }
}

// Push notifications (for future implementation)
self.addEventListener("push", (event: PushEvent) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "Aura";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icon-192x192.png",
    badge: "/icon-96x96.png",
    tag: "aura-notification",
    requireInteraction: data.requireInteraction ?? false,
  };

  event.waitUntil(
    (self as any).registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const clients = await (self as any).clients.matchAll({
        type: "window",
      });

      // Check if app is already open
      for (const client of clients) {
        if (client.url === "/" && "focus" in client) {
          return await (client as any).focus();
        }
      }

      // Open app if not already open
      if ("openWindow" in self.clients) {
        return await (self as any).clients.openWindow("/");
      }
    })()
  );
});

export {};
