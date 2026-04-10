export const dynamic = "force-dynamic";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import {
  Package,
  ArrowRight,
  ShoppingBag,
  ImageOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  }).format(new Date(date));
}

function getFirstImage(images: string): string | null {
  try {
    const arr = JSON.parse(images);
    if (Array.isArray(arr) && arr.length > 0) return arr[0];
  } catch {}
  return null;
}

type FilterTab = "ALL" | "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const activeTab = (params.tab as FilterTab) || "ALL";

  // Fetch orders with items
  const orders = await db.order.findMany({
    where: { customerId: user.id },
    include: {
      orderItems: {
        include: {
          product: {
            select: { name: true, images: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter orders
  const filteredOrders =
    activeTab === "ALL"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  const tabs: { value: FilterTab; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "PROCESSING", label: "Processing" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          My Orders
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Track and manage your orders from Tunog Kalye artists.
        </p>
      </div>

      {/* Filter Tabs */}
      <Tabs defaultValue={activeTab}>
        <TabsList className="bg-white/5 border border-white/10">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-500 data-[state=active]:text-white text-slate-400"
              asChild
            >
              <Link href={`/dashboard/orders?tab=${tab.value}`}>{tab.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="mb-3 text-4xl">
              {activeTab === "ALL" ? "📦" : "🔍"}
            </div>
            <p className="text-sm font-medium text-slate-300">
              {activeTab === "ALL"
                ? "No orders yet"
                : `No ${activeTab.toLowerCase()} orders`}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {activeTab === "ALL"
                ? "Start shopping to see your orders here"
                : "No orders match this filter"}
            </p>
            {activeTab === "ALL" && (
              <Link href="/store" className="mt-4">
                <Button className="bg-gradient-to-r from-red-600 to-orange-500 text-sm font-bold text-white hover:from-red-500 hover:to-orange-400">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Browse Merch
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="overflow-hidden border-white/10 bg-[#12121a] transition-all hover:border-white/20"
            >
              {/* Order header */}
              <div className="flex flex-col gap-3 border-b border-white/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                    <Package className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {order.orderNumber}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold ${statusColor(order.status)}`}
                  >
                    {order.status}
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {order.orderItems.length} item
                      {order.orderItems.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order items preview */}
              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap gap-3">
                  {order.orderItems.slice(0, 4).map((item) => {
                    const imageUrl = item.productImage || getFirstImage(item.product.images);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] p-2"
                      >
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-white/5">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageOff className="h-4 w-4 text-slate-600" />
                          )}
                        </div>
                        <div className="max-w-[120px]">
                          <div className="truncate text-xs font-medium text-white">
                            {item.productName}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Qty: {item.quantity} &middot;{" "}
                            {formatCurrency(item.subtotal)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {order.orderItems.length > 4 && (
                    <div className="flex h-[56px] items-center px-3 text-xs text-slate-500">
                      +{order.orderItems.length - 4} more
                    </div>
                  )}
                </div>

                {/* Track button */}
                <div className="mt-4 flex justify-end">
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10 hover:text-white"
                    >
                      Track Order
                      <ArrowRight className="ml-1.5 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
