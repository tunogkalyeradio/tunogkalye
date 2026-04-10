export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ImageOff,
  Truck,
  Package,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function statusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "border-amber-500/30 bg-amber-500/20 text-amber-400";
    case "PAID":
      return "border-blue-500/30 bg-blue-500/20 text-blue-400";
    case "PROCESSING":
      return "border-blue-500/30 bg-blue-500/20 text-blue-400";
    case "SHIPPED":
      return "border-cyan-500/30 bg-cyan-500/20 text-cyan-400";
    case "DELIVERED":
      return "border-green-500/30 bg-green-500/20 text-green-400";
    case "CANCELLED":
      return "border-red-500/30 bg-red-500/20 text-red-400";
    default:
      return "border-white/10 bg-white/5 text-slate-400";
  }
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getFirstImage(images: string): string | null {
  try {
    const arr = JSON.parse(images);
    if (Array.isArray(arr) && arr.length > 0) return arr[0];
  } catch {}
  return null;
}

function parseAddress(addressJson: string) {
  try {
    return JSON.parse(addressJson);
  } catch {
    return addressJson;
  }
}

// Order status steps
const statusSteps = [
  { key: "PENDING", label: "Ordered" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
];

function getStatusIndex(status: string): number {
  const idx = statusSteps.findIndex((s) => s.key === status);
  if (status === "PAID") return 1; // PAID is between PENDING and PROCESSING
  return idx >= 0 ? idx : 0;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;
  const orderId = parseInt(id, 10);

  if (isNaN(orderId)) {
    notFound();
  }

  const order = await db.order.findFirst({
    where: { id: orderId, customerId: user.id },
    include: {
      orderItems: {
        include: {
          product: {
            select: { name: true, images: true },
          },
          artist: {
            select: { bandName: true },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const currentStepIndex = getStatusIndex(order.status);
  const shippingTotal = order.orderItems.reduce(
    (sum, item) => sum + item.shippingFee,
    0
  );
  const subtotal = order.orderItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      {/* Order header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`self-start text-xs font-semibold ${statusColor(order.status)}`}
        >
          {order.status}
        </Badge>
      </div>

      {/* Status Progress */}
      {order.status !== "CANCELLED" && (
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-5 sm:p-6">
            <h3 className="mb-5 text-sm font-bold text-white">Order Status</h3>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, i) => {
                const isCompleted = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={step.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                          isCompleted
                            ? "border-red-500 bg-red-500/20"
                            : "border-white/10 bg-[#0a0a0f]"
                        }`}
                      >
                        {isCompleted && !isCurrent ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : isCurrent ? (
                          <div className="h-3 w-3 rounded-full bg-red-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-600" />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-[11px] font-medium ${
                          isCompleted ? "text-white" : "text-slate-600"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div
                        className={`mx-2 h-0.5 w-8 sm:w-16 lg:w-24 ${
                          i < currentStepIndex
                            ? "bg-gradient-to-r from-red-500 to-orange-500"
                            : "bg-white/10"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {order.trackingNumber && (
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <Truck className="h-4 w-4 text-cyan-400" />
                <span className="text-xs text-slate-400">
                  Tracking:{" "}
                  <span className="font-medium text-cyan-400">
                    {order.trackingNumber}
                  </span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {order.status === "CANCELLED" && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-5">
            <p className="text-sm text-red-400">
              This order has been cancelled. If you believe this is an error,
              please contact support.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <Card className="border-white/10 bg-[#12121a] lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-white">
              Items ({order.orderItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {order.orderItems.map((item) => {
                const imageUrl =
                  item.productImage || getFirstImage(item.product.images);
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5 sm:h-24 sm:w-24">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageOff className="h-6 w-6 text-slate-600" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">
                          {item.productName}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400">
                          by {item.artist.bandName}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="border-white/10 bg-white/5 text-[10px] text-slate-400"
                          >
                            {item.fulfillmentMode === "ARTIST_SELF_DELIVERY"
                              ? "Artist Delivery"
                              : "Platform Delivery"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-white/10 bg-white/5 text-[10px] text-slate-400"
                          >
                            <Package className="mr-1 h-3 w-3" />
                            Qty: {item.quantity}
                          </Badge>
                          {item.status === "SHIPPED" && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${statusColor("SHIPPED")}`}
                            >
                              <Truck className="mr-1 h-3 w-3" /> Shipped
                            </Badge>
                          )}
                          {item.status === "DELIVERED" && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${statusColor("DELIVERED")}`}
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Delivered
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          {formatCurrency(item.unitPrice)} &times;{" "}
                          {item.quantity}
                          {item.shippingFee > 0 && (
                            <span className="ml-2">
                              + {formatCurrency(item.shippingFee)} shipping
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-bold text-white">
                          {formatCurrency(item.subtotal + item.shippingFee)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Order Summary */}
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Shipping</span>
                <span className="text-white">
                  {formatCurrency(shippingTotal)}
                </span>
              </div>
              <Separator className="bg-white/5" />
              <div className="flex justify-between text-sm font-bold">
                <span className="text-white">Total</span>
                <span className="text-white">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Transparency */}
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Heart className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <div>
                  <div className="text-xs font-bold text-white">
                    Revenue Transparency
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                    10% of your order supports Tunog Kalye Radio and keeps
                    independent OPM broadcasting alive. The remaining 90% goes
                    directly to the artists.
                  </p>
                  <div className="mt-2 flex justify-between text-[11px]">
                    <span className="text-slate-500">Station (10%)</span>
                    <span className="text-red-400">
                      {formatCurrency(order.platformRevenue)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex justify-between text-[11px]">
                    <span className="text-slate-500">Artists (90%)</span>
                    <span className="text-green-400">
                      {formatCurrency(order.artistRevenueTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white">
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {typeof order.shippingAddress === "string" && (
                <ShippingAddressDisplay address={order.shippingAddress} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ShippingAddressDisplay({ address }: { address: string }) {
  const parsed = parseAddress(address);

  if (typeof parsed === "object" && parsed !== null) {
    return (
      <div className="space-y-0.5 text-sm">
        <div className="font-medium text-white">
          {parsed.name || parsed.fullName}
        </div>
        {parsed.line1 && (
          <div className="text-slate-400">{parsed.line1}</div>
        )}
        {parsed.line2 && (
          <div className="text-slate-400">{parsed.line2}</div>
        )}
        <div className="text-slate-400">
          {[parsed.city, parsed.province].filter(Boolean).join(", ")}
        </div>
        {parsed.postalCode && (
          <div className="text-slate-400">{parsed.postalCode}</div>
        )}
        {parsed.phone && (
          <div className="mt-1 text-slate-500">{parsed.phone}</div>
        )}
      </div>
    );
  }

  return <p className="text-sm text-slate-400">{address}</p>;
}
