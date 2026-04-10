"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Package, DollarSign, Truck, Info, Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const typeIcons: Record<string, React.ElementType> = { ORDER: Package, PAYMENT: DollarSign, SHIPMENT: Truck, SYSTEM: Info };
const typeColors: Record<string, string> = { ORDER: "bg-red-500/20 text-red-400", PAYMENT: "bg-green-500/20 text-green-400", SHIPMENT: "bg-amber-500/20 text-amber-400", SYSTEM: "bg-cyan-500/20 text-cyan-400" };

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (m < 1) return "Just now"; if (m < 60) return `${m}m ago`; if (h < 24) return `${h}h ago`; if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function CustomerNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=100");
      if (res.ok) { const data = await res.json(); setNotifications(data.notifications || []); }
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch { /* silently fail */ }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/0/read", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* silently fail */ }
  };

  const filtered = activeFilter === "all" ? notifications : notifications.filter((n) => n.type === activeFilter.toUpperCase());
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-red-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-slate-400">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10">
            <Check className="mr-1.5 h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </div>

      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList className="bg-[#12121a] border border-white/10">
          <TabsTrigger value="all" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">All</TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Orders</TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Payments</TabsTrigger>
          <TabsTrigger value="shipments" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Shipments</TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">System</TabsTrigger>
        </TabsList>
        <TabsContent value={activeFilter}>
          <Card className="border-white/10 bg-[#12121a]">
            <CardContent className="pt-6">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-slate-500"><Bell className="mb-3 h-10 w-10 text-slate-600" /><p className="text-sm">No notifications</p></div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((n) => {
                    const Icon = typeIcons[n.type] || Info;
                    return (
                      <div key={n.id} className={cn("flex items-start gap-4 rounded-lg border p-4", n.isRead ? "border-white/5" : "border-white/10 bg-white/[0.02]")}>
                        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", typeColors[n.type] || typeColors.SYSTEM)}><Icon className="h-4 w-4" /></div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm", !n.isRead ? "font-semibold text-white" : "text-slate-300")}>{n.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{n.message}</p>
                          <p className="mt-1.5 text-[10px] text-slate-600">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.isRead && <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)} className="shrink-0 h-7 text-[11px] text-slate-500 hover:text-white"><Check className="mr-1 h-3 w-3" /> Read</Button>}
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
