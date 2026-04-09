"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Truck,
  Package,
  Search,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderItemDetail {
  id: number;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  artistCut: number;
  fulfillmentMode: string;
  shippingFee: number;
  status: string;
}

interface OrderGroup {
  orderId: number;
  orderNumber: string;
  customerName: string;
  status: string;
  createdAt: string;
  trackingNumber: string | null;
  items: OrderItemDetail[];
  totalArtistCut: number;
}

const itemStatusColors: Record<string, string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  SHIPPED: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  DELIVERED: "border-green-500/30 bg-green-500/10 text-green-400",
};

const orderStatusColors: Record<string, string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  PAID: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  PROCESSING: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  SHIPPED: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  DELIVERED: "border-green-500/30 bg-green-500/10 text-green-400",
  CANCELLED: "border-red-500/30 bg-red-500/10 text-red-400",
};

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

export default function ArtistOrdersPage() {
  const [orders, setOrders] = useState<OrderGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [markingShipped, setMarkingShipped] = useState<number | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<number, string>>({});

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/artist/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (orderId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const markAsShipped = async (itemId: number, orderId: number) => {
    const tracking = trackingInputs[itemId]?.trim();
    if (!tracking) {
      alert("Please enter a tracking number");
      return;
    }

    setMarkingShipped(itemId);
    try {
      const res = await fetch(`/api/artist/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, trackingNumber: tracking }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) => ({
            ...order,
            items: order.items.map((item) =>
              item.id === itemId
                ? { ...item, status: "SHIPPED" }
                : item
            ),
          }))
        );
        setTrackingInputs((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
      }
    } catch {
      // ignore
    } finally {
      setMarkingShipped(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "ALL") {
      const hasMatchingItem = order.items.some(
        (item) => item.status === statusFilter
      );
      if (!hasMatchingItem) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      if (
        !order.orderNumber.toLowerCase().includes(q) &&
        !order.customerName.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Orders
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage orders that contain your products
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search by order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-600"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full border-white/10 bg-white/5 text-white sm:w-[180px]">
            <SelectValue placeholder="Item Status" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#12121a]">
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="mb-4 h-12 w-12 text-slate-600" />
            <h3 className="text-lg font-medium text-white">No orders found</h3>
            <p className="mt-1 text-sm text-slate-400">
              {orders.length === 0
                ? "When customers buy your merch, orders will appear here"
                : "No orders match your current filters"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expanded.has(order.orderId);
            const pendingSelfDelivery = order.items.filter(
              (item) =>
                item.fulfillmentMode === "ARTIST_SELF_DELIVERY" &&
                item.status === "PENDING"
            );

            return (
              <Card
                key={order.orderId}
                className="border-white/10 bg-[#12121a] overflow-hidden"
              >
                {/* Order header */}
                <button
                  onClick={() => toggleExpand(order.orderId)}
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {order.orderNumber}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${orderStatusColors[order.status] || "border-white/10 text-slate-400"}`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                        <span>{order.customerName}</span>
                        <span>&middot;</span>
                        <span>{order.items.length} item(s)</span>
                        <span>&middot;</span>
                        <span>
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        {formatPeso(order.totalArtistCut)}
                      </p>
                      <p className="text-[10px] text-slate-500">Your cut</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Expanded items */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-4 space-y-3">
                    {order.trackingNumber && (
                      <div className="flex items-center gap-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20 px-3 py-2">
                        <Truck className="h-4 w-4 text-cyan-400" />
                        <span className="text-xs text-slate-400">
                          Tracking:{" "}
                          <span className="font-medium text-cyan-300">
                            {order.trackingNumber}
                          </span>
                        </span>
                      </div>
                    )}

                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
                      >
                        <div className="flex items-center gap-3">
                          {item.productImage && (
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0f]">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">
                              {item.productName}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                              <span>Qty: {item.quantity}</span>
                              <span>&middot;</span>
                              <span>{formatPeso(item.unitPrice)} each</span>
                              <span>&middot;</span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${item.fulfillmentMode === "ARTIST_SELF_DELIVERY" ? "border-purple-500/30 bg-purple-500/10 text-purple-400" : "border-white/10 text-slate-400"}`}
                              >
                                {item.fulfillmentMode === "ARTIST_SELF_DELIVERY"
                                  ? "Self-delivery"
                                  : "Platform delivery"}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium text-white">
                              {formatPeso(item.artistCut)}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Your cut
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${itemStatusColors[item.status] || "border-white/10 text-slate-400"}`}
                          >
                            {item.status === "PENDING" && (
                              <Package className="mr-1 h-3 w-3" />
                            )}
                            {item.status === "SHIPPED" && (
                              <Truck className="mr-1 h-3 w-3" />
                            )}
                            {item.status === "DELIVERED" && (
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                            )}
                            {item.status}
                          </Badge>
                        </div>

                        {/* Ship form for self-delivery pending items */}
                        {item.fulfillmentMode === "ARTIST_SELF_DELIVERY" &&
                          item.status === "PENDING" && (
                            <div className="mt-3 flex gap-2">
                              <Input
                                placeholder="Enter tracking number..."
                                value={trackingInputs[item.id] || ""}
                                onChange={(e) =>
                                  setTrackingInputs((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                className="flex-1 border-white/10 bg-white/5 text-white text-xs placeholder:text-slate-600"
                              />
                              <Button
                                size="sm"
                                onClick={() => markAsShipped(item.id, order.orderId)}
                                disabled={
                                  markingShipped === item.id ||
                                  !trackingInputs[item.id]?.trim()
                                }
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400 disabled:opacity-50"
                              >
                                {markingShipped === item.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Truck className="mr-1 h-3.5 w-3.5" />
                                    Mark Shipped
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
