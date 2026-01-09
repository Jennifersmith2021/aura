export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Workers not supported");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/service-worker.js",
      {
        scope: "/",
        updateViaCache: "none",
      }
    );

    console.log("Service Worker registered:", registration);

    // Check for updates every hour
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("Notifications not supported");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

// Subscribe to push notifications
export async function subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;

    if (!registration.pushManager) {
      console.log("Push notifications not supported");
      return null;
    }

    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      return subscription;
    }

    // Create new subscription (requires VAPID key in production)
    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: undefined, // VAPID key would go here
    });
  } catch (error) {
    console.error("Push subscription failed:", error);
    return null;
  }
}

// Trigger background sync
export async function triggerBackgroundSync(tag: string = "sync-data") {
  try {
    const registration = await navigator.serviceWorker.ready;

    if (!(registration as any).sync) {
      console.log("Background Sync not supported");
      return false;
    }

    await (registration as any).sync.register(tag);
    console.log("Background sync registered:", tag);
    return true;
  } catch (error) {
    console.error("Background sync registration failed:", error);
    return false;
  }
}

// Check if app is running in standalone mode (installed)
export function isAppInstalled() {
  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

// Get cache statistics
export async function getCacheStats() {
  try {
    const cacheNames = await caches.keys();
    const sizes: Record<string, number> = {};

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      sizes[name] = keys.length;
    }

    return sizes;
  } catch (error) {
    console.error("Failed to get cache stats:", error);
    return {};
  }
}

// Clear all caches
export async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    console.log("All caches cleared");
    return true;
  } catch (error) {
    console.error("Failed to clear caches:", error);
    return false;
  }
}

// Unregister service worker
export async function unregisterServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      if (success) {
        console.log("Service Worker unregistered");
      }
      return success;
    }
    return false;
  } catch (error) {
    console.error("Failed to unregister Service Worker:", error);
    return false;
  }
}
