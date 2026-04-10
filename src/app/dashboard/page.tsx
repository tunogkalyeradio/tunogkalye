export const dynamic = "force-dynamic";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import {
  Package,
  Clock,
  CheckCircle2,
  PhilippinePeso,
  ShoppingBag,
  Mic2,
  Heart,
  ArrowRight,
  TrendingUp,
  Radio,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

export default async function DashboardPage() {
  const user = await requireAuth();

  // Fetch order stats
  const orders = await db.order.findMany({
    where: { customerId: user.id },
    include: {
      orderItems: { take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status === "PENDING" || o.status === "PAID" || o.status === "PROCESSING"
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;
  const totalSpent = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Recent orders (last 5)
  const recentOrders = orders.slice(0, 5);

  // Cart count
  const cartCount = await db.cart.count({
    where: { userId: user.id },
  });

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      icon: Package,
      color: "text-white",
      bg: "bg-white/5",
      border: "border-white/10",
    },
    {
      label: "Pending",
      value: pendingOrders.toString(),
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Delivered",
      value: deliveredOrders.toString(),
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    {
      label: "Total Spent",
      value: formatCurrency(totalSpent),
      icon: PhilippinePeso,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Here&apos;s what&apos;s happening with your orders and activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={`${stat.border} bg-[#12121a] transition-all hover:bg-[#14141f]`}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="border-white/10 bg-[#12121a] lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold text-white">
              Recent Orders
            </CardTitle>
            {recentOrders.length > 0 && (
              <Link href="/dashboard/orders">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-400 hover:text-white"
                >
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-3 text-4xl">📦</div>
                <p className="text-sm font-medium text-slate-300">
                  No orders yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Start shopping to see your orders here
                </p>
                <Link href="/store" className="mt-4">
                  <Button className="bg-gradient-to-r from-red-600 to-orange-500 text-sm font-bold text-white hover:from-red-500 hover:to-orange-400">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                        <Package className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {order.orderNumber}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatDate(order.createdAt)} &middot;{" "}
                          {order.orderItems.length} item
                          {order.orderItems.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">
                          {formatCurrency(order.totalAmount)}
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${statusColor(order.status)}`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-600" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="space-y-4">
          <Card className="border-white/10 bg-[#12121a]">
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-bold text-white">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  {
                    label: "Browse Merch",
                    icon: ShoppingBag,
                    href: "/store",
                    desc: "Discover OPM merch",
                    count: null,
                    color: "text-red-400",
                  },
                  {
                    label: "Submit Music",
                    icon: Mic2,
                    href: "/",
                    desc: "Get on the radio",
                    count: null,
                    color: "text-amber-400",
                  },
                  {
                    label: "Support Station",
                    icon: Heart,
                    href: "/",
                    desc: "Keep indie alive",
                    count: null,
                    color: "text-rose-400",
                  },
                  {
                    label: "My Cart",
                    icon: TrendingUp,
                    href: "/dashboard/cart",
                    desc: `${cartCount} item${cartCount !== 1 ? "s" : ""}`,
                    count: cartCount,
                    color: "text-cyan-400",
                  },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/5"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                      <action.icon className={`h-4 w-4 ${action.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        {action.label}
                      </div>
                      <div className="text-xs text-slate-500">
                        {action.desc}
                      </div>
                    </div>
                    {action.count !== null && action.count > 0 && (
                      <Badge className="bg-red-500/20 text-[10px] text-red-400">
                        {action.count}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tunog Kalye Radio Card */}
          <Card className="overflow-hidden border-white/10 bg-[#12121a]">
            <div className="bg-gradient-to-br from-red-950/50 to-orange-950/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-500">
                  <Radio className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-white">
                  Now Playing
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tune in to 24/7 OPM radio. Discover new Filipino indie music every
                day.
              </p>
              <Link href="/" className="mt-3 inline-block">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-red-600 to-orange-500 text-xs font-bold text-white hover:from-red-500 hover:to-orange-400"
                >
                  Listen Live
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
