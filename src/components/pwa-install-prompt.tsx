"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types for the BeforeInstallPromptEvent ─────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone);

    if (standalone) {
      setIsStandalone(true);
      return;
    }

    // Check if previously dismissed (don't show again for 7 days)
    const dismissedAt = localStorage.getItem("tkr-pwa-dismissed");
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
        return;
      }
    }

    // Detect iOS Safari
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !("MSStream" in window);
    setIsIOS(isIOSDevice);

    // Listen for the native install prompt (Chrome/Edge on Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after a short delay so it doesn't interrupt first load
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS, show after 5 seconds (no native prompt available)
    if (isIOSDevice) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
        setDeferredPrompt(null);
        localStorage.setItem("tkr-installed", "true");
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("tkr-pwa-dismissed", Date.now().toString());
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      handleInstall();
    }
  };

  // Don't render if already installed, dismissed, or not ready
  if (isStandalone || dismissed || !showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[60] mx-auto max-w-sm animate-in slide-in-from-bottom-4 duration-500 md:left-auto md:right-6 md:bottom-24">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#12121a]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          {/* App Icon */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 shadow-lg shadow-red-500/20">
            <img
              src="/pwa-maskable-192x192.png"
              alt="TKR"
              className="h-10 w-10 rounded-xl"
            />
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-sm font-bold text-white">
              Install Tunog Kalye Radio
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              {isIOS
                ? "Tap the Share button, then 'Add to Home Screen' for the full app experience."
                : "Add to your home screen for a fast, app-like experience with background play."}
            </p>

            <div className="mt-3 flex items-center gap-2">
              {isIOS ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Use Share → Add to Home Screen</span>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="h-8 bg-gradient-to-r from-red-600 to-orange-500 px-4 text-xs font-bold text-white shadow-sm hover:from-red-500 hover:to-orange-400"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Install App
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute -bottom-1 -right-1 h-20 w-20 rounded-full bg-red-500/10 blur-2xl" />
        <div className="absolute -top-1 -left-1 h-16 w-16 rounded-full bg-orange-500/10 blur-2xl" />
      </div>
    </div>
  );
}
