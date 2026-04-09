"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  Package,
  DollarSign,
  Truck,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface OrderDetailData {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  platformRevenue: number;
  artistRevenueTotal: number;
  shippingAddress: string;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  orderItems: {
    id: number;
    productName: string;
    productImage: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    platformCut: number;
    artistCut: number;
    fulfillmentMode: string;
    shippingFee: number;
    status: string;
    artist: {
      bandName: string;
    };
  }[];
}

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PAID: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PROCESSING: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  SHIPPED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  DELIVERED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusOptions = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function OrderDetailContent({ order }: { order: OrderDetailData }) {
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);

  const updateStatus = (newStatus: string) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/orders/${order.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          setCurrentStatus(newStatus);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        }
      } catch {
        // silently fail
      }
    });
  };

  // Parse shipping address from JSON
  let shippingInfo: { name: string; line1: string; city: string; province: string; postalCode: string; phone: string } | null = null;
  try {
    shippingInfo = JSON.parse(order.shippingAddress);
  } catch {
    shippingInfo = null;
  }

  const totalShipping = order.orderItems.reduce(
    (sum, item) => sum + item.shippingFee,
    0
  );

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {order.orderNumber}
            </h1>
            <Badge
              variant="outline"
              className={statusColors[currentStatus] || ""}
            >
              {currentStatus}
            </Badge>
            {showSuccess && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-in fade-in">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Updated
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-PH", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Status Update */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Update Status:</span>
          <Select value={currentStatus} onValueChange={updateStatus}>
            <SelectTrigger className="w-44 border-white/10 bg-white/5 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#1a1a2e]">
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer & Shipping */}
        <div className="space-y-6">
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-purple-400" />
                <CardTitle className="text-base">Customer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-sm text-slate-300">
                  {order.customer.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-sm text-slate-400">
                  {order.customer.email}
                </span>
              </div>
              {order.customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-sm text-slate-400">
                    {order.customer.phone}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-400" />
                <CardTitle className="text-base">
                  Shipping Address
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {shippingInfo ? (
                <div className="space-y-1 text-sm text-slate-300">
                  <p className="font-medium">{shippingInfo.name}</p>
                  <p>{shippingInfo.line1}</p>
                  <p>
                    {shippingInfo.city}, {shippingInfo.province}{" "}
                    {shippingInfo.postalCode}
                  </p>
                  {shippingInfo.phone && <p>{shippingInfo.phone}</p>}
                </div>
              ) : (
                <p className="text-sm text-slate-500">{order.shippingAddress}</p>
              )}
            </CardContent>
          </Card>

          {order.trackingNumber && (
            <Card className="border-white/10 bg-[#12121a]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-cyan-400" />
                  <CardTitle className="text-base">Tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm text-cyan-400">
                  {order.trackingNumber}
                </p>
              </CardContent>
            </Card>
          )}

          {order.notes && (
            <Card className="border-white/10 bg-[#12121a]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Items & Revenue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-400" />
                  <CardTitle className="text-base">
                    Order Items ({order.orderItems.length})
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-white/5 bg-white/5 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                          <Package className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {item.productName}
                          </p>
                          <p className="text-xs text-slate-500">
                            by {item.artist.bandName} &middot;{" "}
                            {formatPeso(item.unitPrice)} each &middot; Qty:{" "}
                            {item.quantity}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                item.fulfillmentMode === "PLATFORM_DELIVERY"
                                  ? "border-blue-500/30 text-blue-400 text-[10px]"
                                  : "border-amber-500/30 text-amber-400 text-[10px]"
                              }
                            >
                              {item.fulfillmentMode === "PLATFORM_DELIVERY"
                                ? "Platform Delivery"
                                : "Artist Self-Delivery"}
                            </Badge>
                            {item.shippingFee > 0 && (
                              <span className="text-[10px] text-slate-500">
                                Shipping: {formatPeso(item.shippingFee)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-white">
                          {formatPeso(item.subtotal)}
                        </p>
                        <div className="mt-0.5 space-y-0.5 text-[10px]">
                          <p className="text-red-400">
                            Platform: {formatPeso(item.platformCut)} (10%)
                          </p>
                          <p className="text-green-400">
                            Artist: {formatPeso(item.artistCut)} (90%)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-red-400" />
                <CardTitle className="text-base">Revenue Breakdown</CardTitle>
              </div>
              <CardDescription>Platform 10% / Artist 90% per item</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
                  <span className="text-sm text-slate-300">
                    Items Subtotal
                  </span>
                  <span className="text-sm font-medium text-white">
                    {formatPeso(
                      order.orderItems.reduce(
                        (sum, item) => sum + item.subtotal,
                        0
                      )
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
                  <span className="text-sm text-slate-300">Shipping</span>
                  <span className="text-sm font-medium text-white">
                    {formatPeso(totalShipping)}
                  </span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                  <span className="text-sm font-medium text-green-400">
                    Artist Revenue (90%)
                  </span>
                  <span className="text-sm font-bold text-green-400">
                    {formatPeso(order.artistRevenueTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                  <span className="text-sm font-medium text-red-400">
                    Platform Revenue (10%)
                  </span>
                  <span className="text-sm font-bold text-red-400">
                    {formatPeso(order.platformRevenue)}
                  </span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between p-3">
                  <span className="text-base font-bold text-white">
                    Order Total
                  </span>
                  <span className="text-base font-bold text-white">
                    {formatPeso(order.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      orderItems: {
        include: {
          artist: { select: { bandName: true } },
        },
      },
    },
  });

  if (!order) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="py-16 text-center">
            <p className="text-slate-400">Order not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const serializedOrder = {
    ...order,
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt),
    customer: { ...order.customer },
    orderItems: order.orderItems.map((item) => ({
      ...item,
      artist: { ...item.artist },
    })),
  };

  return <OrderDetailContent order={serializedOrder} />;
}
