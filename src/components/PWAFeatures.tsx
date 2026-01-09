"use client";

import { useEffect, useState } from "react";
import { Download, CheckCircle, Wifi, WifiOff } from "lucide-react";
import { toast } from "@/lib/toast";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAFeatures() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if app is already installed
    const isRunningStandalone = () => {
      return (
        (window.navigator as any).standalone === true ||
        window.matchMedia("(display-mode: standalone)").matches
      );
    };

    setIsInstalled(isRunningStandalone());

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        toast.success("Aura installed! Access it from your home screen.");
        setIsInstalled(true);
        setIsInstallable(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Installation failed:", error);
      toast.error("Installation failed. Try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">App & Offline Features</h2>
        <p className="text-sm text-muted-foreground">
          Progressive Web App capabilities
        </p>
      </div>

      {/* Connection Status */}
      <div className={clsx(
        "border rounded-xl p-4 flex items-center gap-3",
        isOnline
          ? "bg-green-500/10 border-green-500/20"
          : "bg-orange-500/10 border-orange-500/20"
      )}>
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5 text-green-400" />
            <div className="flex-1">
              <p className="font-semibold text-green-200">Connected</p>
              <p className="text-xs text-green-200/70">You're online. All features available.</p>
            </div>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 text-orange-400" />
            <div className="flex-1">
              <p className="font-semibold text-orange-200">Offline Mode</p>
              <p className="text-xs text-orange-200/70">You're offline. Using cached data.</p>
            </div>
          </>
        )}
      </div>

      {/* Install App */}
      {isInstallable && !isInstalled && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Install Aura</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add Aura to your home screen for quick access and offline support.
              </p>
            </div>
          </div>
          <button
            onClick={handleInstall}
            className="w-full px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition-colors"
          >
            Install App
          </button>
        </div>
      )}

      {isInstalled && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-green-200">App Installed</p>
            <p className="text-xs text-green-200/70 mt-1">
              Aura is installed on your device. You can access it from your home screen.
            </p>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">1</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Offline Access</p>
              <p className="text-xs text-muted-foreground mt-1">
                Access your closet, measurements, and history even without internet.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">2</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Background Sync</p>
              <p className="text-xs text-muted-foreground mt-1">
                Changes sync automatically when you're back online.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">3</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Fast Loading</p>
              <p className="text-xs text-muted-foreground mt-1">
                Service worker caches assets for instant loading.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">4</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Push Notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                Get reminders for workouts, goals, and daily affirmations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold">Technical Details</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Manifest:</span>
            <span className="text-foreground">/manifest.json</span>
          </div>
          <div className="flex justify-between">
            <span>Service Worker:</span>
            <span className="text-foreground">Enabled</span>
          </div>
          <div className="flex justify-between">
            <span>Cache Strategy:</span>
            <span className="text-foreground">Stale-while-revalidate</span>
          </div>
          <div className="flex justify-between">
            <span>Database:</span>
            <span className="text-foreground">IndexedDB</span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
        <p className="text-xs text-blue-200">
          <strong>📱 Mobile Users:</strong> To install, look for "Install" or "Add to Home Screen" in your browser menu.
        </p>
        <p className="text-xs text-blue-200">
          <strong>💾 Data Savings:</strong> Everything is stored locally. No cloud sync unless you enable it.
        </p>
      </div>
    </div>
  );
}

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
