import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Star,
  Plus,
  User,
  ExternalLink,
  AlertTriangle,
  TrendingUp,
  Music,
  Radio,
  Eye,
  Store,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  PAID: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  PROCESSING: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  SHIPPED: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  DELIVERED: "border-green-500/30 bg-green-500/10 text-green-400",
  CANCELLED: "border-red-500/30 bg-red-500/10 text-red-400",
};

const storeStatusColors: Record<string, string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  APPROVED: "border-green-500/30 bg-green-500/10 text-green-400",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-400",
  SUSPENDED: "border-red-500/30 bg-red-500/10 text-red-400",
};

const storeStatusLabel: Record<string, string> = {
  PENDING: "Store Pending Approval",
  APPROVED: "Store Active",
  REJECTED: "Store Rejected",
  SUSPENDED: "Store Suspended",
};

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

export default async function ArtistDashboard() {
  let user, artistProfile;
  try {
    user = await requireRole("ARTIST");
    artistProfile = await db.artistProfile.findUnique({
      where: { userId: user.id },
    });
  } catch {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Music className="h-12 w-12 text-slate-600" />
        <h2 className="text-xl font-bold text-white">Unable to load dashboard</h2>
        <p className="text-sm text-slate-400">Please try again later.</p>
      </div>
    );
  }

  if (!artistProfile) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Music className="h-12 w-12 text-slate-600" />
        <h2 className="text-xl font-bold text-white">No Artist Profile</h2>
        <p className="text-sm text-slate-400">
          Please create your artist profile to continue.
        </p>
        <Link href="/artist/profile">
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400">
            Create Profile
          </Button>
        </Link>
      </div>
    );
  }

  // Fetch stats
  let activeProducts = 0;
  let totalOrders = 0;
  let earnings = 0;
  let reviewCount = 0;
  let recentOrderItems: Array<Record<string, unknown>> = [];

  try {
    [activeProducts, totalOrders, earnings, reviewCount, recentOrderItems] =
      await Promise.all([
        db.product.count({
          where: { artistId: artistProfile.id, isActive: true },
        }),
        db.orderItem.count({
          where: { artistId: artistProfile.id },
        }),
        db.orderItem.aggregate({
          where: { artistId: artistProfile.id },
          _sum: { subtotal: true },
        }),
        db.review.count({
          where: { product: { artistId: artistProfile.id } },
        }),
        db.orderItem.findMany({
          where: { artistId: artistProfile.id },
          orderBy: { id: "desc" },
          take: 5,
          include: {
            order: {
              select: {
                orderNumber: true,
                status: true,
                createdAt: true,
                customer: { select: { name: true } },
              },
            },
          },
        }),
      ]);

    earnings = earnings._sum.subtotal || 0;
  } catch {
    // Fallback to zeros
  }

  // Monthly earnings data (last 6 months)
  let monthlyMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = 0;
  }

  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEarnings = await db.orderItem.groupBy({
      by: ["createdAt"],
      where: {
        artistId: artistProfile.id,
        createdAt: { gte: sixMonthsAgo },
      },
      _sum: { subtotal: true },
    });

    for (const item of monthlyEarnings) {
      const key = `${item.createdAt.getFullYear()}-${String(item.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyMap[key] !== undefined) {
        monthlyMap[key] += item._sum.subtotal || 0;
      }
    }
  } catch {
    // Ignore chart errors
  }

  const monthlyEntries = Object.entries(monthlyMap);
  const maxEarning = Math.max(...monthlyEntries.map(([, v]) => v), 1);

  const storeStatus = artistProfile.storeStatus || "PENDING";

  const stats = [
    {
      label: "Active Products",
      value: activeProducts,
      icon: Package,
      gradient: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-400",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingCart,
      gradient: "from-purple-500/20 to-purple-500/5",
      iconColor: "text-purple-400",
    },
    {
      label: "Total Revenue",
      value: formatPeso(earnings),
      icon: DollarSign,
      gradient: "from-green-500/20 to-green-500/5",
      iconColor: "text-green-400",
    },
    {
      label: "Reviews",
      value: reviewCount,
      icon: Star,
      gradient: "from-amber-500/20 to-amber-500/5",
      iconColor: "text-amber-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {artistProfile.bandName}
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        {/* Store Status Badge */}
        <Badge className={storeStatusColors[storeStatus] || "border-white/10 bg-white/5 text-slate-400"}>
          <Store className="mr-1 h-3 w-3" />
          {storeStatusLabel[storeStatus] || storeStatus}
        </Badge>
      </div>

      {/* Verification banner */}
      {!artistProfile.isVerified && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              Your account is pending verification.
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              You can still manage your profile and products. Once verified, your
              products will be visible to all customers.
            </p>
          </div>
        </div>
      )}

      {/* Radio-to-Revenue Widget */}
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-[#12121a] to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Radio className="h-4 w-4 text-purple-400" />
            This Week on Tunog Kalye Radio
          </CardTitle>
          <CardDescription>Your radio-to-revenue performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
              <Radio className="mx-auto mb-2 h-5 w-5 text-purple-400" />
              <p className="text-2xl font-black text-white">
                {artistProfile.totalAirplays || "—"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Airplays</p>
              {artistProfile.totalAirplays === 0 && (
                <p className="mt-1 text-[10px] text-slate-600">Coming Soon</p>
              )}
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
              <Eye className="mx-auto mb-2 h-5 w-5 text-blue-400" />
              <p className="text-2xl font-black text-white">—</p>
              <p className="mt-0.5 text-xs text-slate-500">Profile Views</p>
              <p className="mt-1 text-[10px] text-slate-600">Coming Soon</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
              <ShoppingCart className="mx-auto mb-2 h-5 w-5 text-green-400" />
              <p className="text-2xl font-black text-white">{totalOrders}</p>
              <p className="mt-0.5 text-xs text-slate-500">Merch Sales</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
              <DollarSign className="mx-auto mb-2 h-5 w-5 text-amber-400" />
              <p className="text-2xl font-black text-white">{formatPeso(artistProfile.totalSales || earnings)}</p>
              <p className="mt-0.5 text-xs text-slate-500">Revenue</p>
            </div>
          </div>
          <p className="mt-4 rounded-lg border border-blue-500/10 bg-blue-500/5 px-3 py-2 text-center text-xs text-blue-400">
            Connect with AzuraCast API for real-time airplay data
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-white/10 bg-[#12121a]"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="border-white/10 bg-[#12121a] lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              Revenue (Last 6 Months)
            </CardTitle>
            <CardDescription>Your earnings over time</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyEntries.every(([, v]) => v === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DollarSign className="mb-3 h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-500">
                  No earnings data yet
                </p>
                <p className="text-xs text-slate-600">
                  Start selling merch to see your revenue chart
                </p>
              </div>
            ) : (
              <div className="flex items-end gap-2 sm:gap-3" style={{ height: "160px" }}>
                {monthlyEntries.map(([month, value]) => {
                  const height =
                    value > 0
                      ? Math.max((value / maxEarning) * 140, 8)
                      : 4;
                  const monthLabel = new Date(month + "-01").toLocaleString(
                    "en-US",
                    { month: "short" }
                  );
                  return (
                    <div
                      key={month}
                      className="flex flex-1 flex-col items-center gap-1.5"
                    >
                      <span className="text-[10px] font-medium text-slate-400">
                        {value > 0 ? `₱${Math.round(value).toLocaleString()}` : ""}
                      </span>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-purple-400 transition-all"
                        style={{ height: `${height}px` }}
                      />
                      <span className="text-[10px] text-slate-500">
                        {monthLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-white/10 bg-[#12121a]">
          <CardHeader>
            <CardTitle className="text-base text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/artist/products/new" className="block">
              <Button className="w-full justify-start gap-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400">
                <Plus className="h-4 w-4" />
                Add New Product
              </Button>
            </Link>
            <Link href="/artist/profile" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <User className="h-4 w-4 text-purple-400" />
                Edit Profile
              </Button>
            </Link>
            <Link href="/artist/marketing" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <ExternalLink className="h-4 w-4 text-green-400" />
                Marketing Tools
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <ExternalLink className="h-4 w-4 text-blue-400" />
                View Store
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <ShoppingCart className="h-4 w-4 text-purple-400" />
              Recent Orders
            </CardTitle>
            <CardDescription>Latest orders from your fans</CardDescription>
          </div>
          <Link href="/artist/orders">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrderItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="mb-3 h-8 w-8 text-slate-600" />
              <p className="text-sm text-slate-500">No orders yet</p>
              <p className="mb-3 text-xs text-slate-600">
                When customers buy your merch, orders will appear here
              </p>
              <Link href="/artist/products/new">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400"
                >
                  Add Your First Product
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrderItems.map((item: Record<string, unknown>) => {
                const order = item.order as Record<string, unknown>;
                const customer = order?.customer as Record<string, unknown> | null;
                return (
                  <div
                    key={item.id as number}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 sm:p-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.productImage ? (
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0f]">
                          <img
                            src={item.productImage as string}
                            alt={item.productName as string}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {item.productName as string}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order?.orderNumber as string} &middot; {customer?.name as string || "Guest"} &middot;{" "}
                          {item.quantity as number}x
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {formatPeso(item.subtotal as number)}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {(order?.createdAt as Date)?.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${statusColors[order?.status as string] || "border-white/10 text-slate-400"}`}
                      >
                        {order?.status as string}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
