"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwa";
import { registerServiceWorker as registerNotificationSW, setupNotificationScheduler } from "@/lib/notificationScheduler";

export function AppInitializer() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker();
    
    // Register notification service worker
    registerNotificationSW();
    
    // Setup notification scheduler
    setupNotificationScheduler();
  }, []);

  return null;
}
