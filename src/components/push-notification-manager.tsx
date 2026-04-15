"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellRing, BellOff, Check, X } from "lucide-react";

type PushStatus = "unsupported" | "default" | "granted" | "denied" | "loading";

export default function PushNotificationManager() {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [showPrompt, setShowPrompt] = useState(false);

  // Check support and current permission
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    const permission = Notification.permission;
    switch (permission) {
      case "granted":
        setStatus("granted");
        // Register service worker
        registerSW();
        break;
      case "denied":
        setStatus("denied");
        break;
      default:
        setStatus("default");
        break;
    }
  }, []);

  // Register service worker
  const registerSW = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      // Subscribe to push
      await subscribeUser(registration);
    } catch (err) {
      console.error("SW registration failed:", err);
    }
  };

  // Subscribe user to push
  const subscribeUser = async (registration: ServiceWorkerRegistration) => {
    try {
      // In production, use a real VAPID key pair
      // For now, we create a subscription without applicationServerKey
      // This means push can only be triggered from the service worker itself
      // To enable server-initiated push, generate VAPID keys and set NEXT_PUBLIC_VAPID_PUBLIC_KEY
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
      });

      // Send subscription to server
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });

      setStatus("granted");
    } catch (err) {
      console.error("Push subscription failed:", err);
      if ((err as DOMException).name === "NotAllowedError") {
        setStatus("denied");
      }
    }
  };

  // Request permission
  const requestPermission = async () => {
    if (status !== "default") return;
    setStatus("loading");

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.register("/sw.js");
        await subscribeUser(registration);
      } else {
        setStatus("denied");
      }
    } catch {
      setStatus("denied");
    }
    setShowPrompt(false);
  };

  // Unsubscribe
  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }
      setStatus("default");
    } catch {
      // ignore
    }
  };

  // Show prompt after delay
  useEffect(() => {
    if (status === "default") {
      const timer = setTimeout(() => setShowPrompt(true), 15000); // Show after 15s
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Dismiss prompt
  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    sessionStorage.setItem("push-prompt-dismissed", "1");
  }, []);

  // Don't render if already dismissed in this session
  useEffect(() => {
    if (sessionStorage.getItem("push-prompt-dismissed")) {
      setShowPrompt(false);
    }
  }, []);

  if (status === "unsupported") return null;

  // Opt-in prompt banner
  if (showPrompt && status === "default") {
    return (
      <div className="fixed top-4 right-4 z-[110] w-[calc(100vw-2rem)] sm:right-6 sm:w-[360px] animate-in slide-in-from-top-right fade-in duration-500">
        <div className="rounded-2xl border border-white/10 bg-[#12121a] p-4 shadow-2xl shadow-black/50">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500">
              <BellRing className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Never Miss a Beat</p>
              <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                Get notified when your favorite songs play, when live shows start, and about exclusive TKR events.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={requestPermission}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:from-red-500 hover:to-orange-400"
                >
                  <Bell className="h-3 w-3" />
                  Enable Notifications
                </button>
                <button
                  onClick={dismissPrompt}
                  className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-500 hover:bg-white/10 hover:text-slate-300"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={dismissPrompt}
              className="shrink-0 rounded-lg p-1 text-slate-600 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
