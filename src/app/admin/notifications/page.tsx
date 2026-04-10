"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Package, DollarSign, Truck, Info, Check, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "ORDER" | "PAYMENT" | "SHIPMENT" | "SYSTEM";
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

const typeIcons: Record<string, React.ElementType> = {
  ORDER: Package,
  PAYMENT: DollarSign,
  SHIPMENT: Truck,
  SYSTEM: Info,
};

const typeColors: Record<string, string> = {
  ORDER: "bg-blue-500/20 text-blue-400",
  PAYMENT: "bg-green-500/20 text-green-400",
  SHIPMENT: "bg-amber-500/20 text-amber-400",
  SYSTEM: "bg-slate-500/20 text-slate-400",
};

const typeLabels: Record<string, string> = {
  ORDER: "Order",
  PAYMENT: "Payment",
  SHIPMENT: "Shipment",
  SYSTEM: "System",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/notifications?limit=100");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: number, read: boolean) => {
    try {
      if (!read) {
        // Mark as read
        await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      } else {
        // For unread toggle, we'd need an unread endpoint — just keep it read for now
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // silently fail
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/0/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silently fail
    }
  };

  const filtered = activeFilter === "all"
    ? notifications
    : notifications.filter((n) => n.type === activeFilter.toUpperCase());

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-slate-400">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10">
            <Check className="mr-1.5 h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList className="bg-[#12121a] border border-white/10">
          <TabsTrigger value="all" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
            All
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
            Orders
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
            Payments
          </TabsTrigger>
          <TabsTrigger value="shipments" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
            Shipments
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter}>
          <Card className="border-white/10 bg-[#12121a]">
            <CardContent className="pt-6">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-slate-500">
                  <Bell className="mb-3 h-10 w-10 text-slate-600" />
                  <p className="text-sm">No notifications to show</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((notification) => {
                    const Icon = typeIcons[notification.type] || Info;
                    const colorClass = typeColors[notification.type] || typeColors.SYSTEM;

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "flex items-start gap-4 rounded-lg border p-4 transition-colors",
                          notification.isRead
                            ? "border-white/5 bg-transparent"
                            : "border-white/10 bg-white/[0.02]"
                        )}
                      >
                        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", colorClass)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn("text-sm", !notification.isRead ? "font-semibold text-white" : "text-slate-300")}>
                              {notification.title}
                            </p>
                            <Badge variant="outline" className="text-[10px] border-white/10 text-slate-500">
                              {typeLabels[notification.type] || notification.type}
                            </Badge>
                            {!notification.isRead && (
                              <span className="h-2 w-2 rounded-full bg-red-500" />
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{notification.message}</p>
                          <p className="mt-1.5 text-[10px] text-slate-600">{timeAgo(notification.createdAt)}</p>
                        </div>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id, notification.isRead)}
                            className="shrink-0 h-7 text-[11px] text-slate-500 hover:text-white"
                          >
                            <Check className="mr-1 h-3 w-3" /> Read
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
