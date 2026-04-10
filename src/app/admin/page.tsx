export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  UserCheck,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default async function AdminDashboardPage() {
  let user: any = null;
  try {
    user = await requireRole("ADMIN");
  } catch {
    // If requireRole fails (e.g. session issue), try getServerSession directly
    try {
      const { getServerSession } = await import("next-auth");
      const { authOptions } = await import("@/lib/auth");
      const session = await getServerSession(authOptions);
      if (!session?.user) throw new Error("Not authenticated");
      user = { name: (session.user as any).name || "Admin", role: "ADMIN" };
    } catch {
      throw new Error("Authentication required. Please sign in.");
    }
  }

  // Fetch all stats in parallel with error fallbacks
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [totalRevenue, totalOrders, totalArtists, totalProducts, totalCustomers, recentOrders, ordersThisMonth, newArtistsThisMonth, revenueByMonth] =
    await Promise.all([
      db.order.aggregate({ _sum: { platformRevenue: true, totalAmount: true, artistRevenueTotal: true } }).catch(() => ({ _sum: { platformRevenue: 0, totalAmount: 0, artistRevenueTotal: 0 } })),
      db.order.count().catch(() => 0),
      db.artistProfile.count({ where: { isVerified: true } }).catch(() => 0),
      db.product.count({ where: { isActive: true } }).catch(() => 0),
      db.user.count({ where: { role: "CUSTOMER" } }).catch(() => 0),
      db.order.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { customer: { select: { name: true, email: true } } } }).catch(() => []),
      db.order.count({ where: { createdAt: { gte: monthStart } } }).catch(() => 0),
      db.artistProfile.count({ where: { createdAt: { gte: monthStart } } }).catch(() => 0),
      db.$queryRawUnsafe(`
        SELECT substr(createdAt, 1, 7) as month, SUM(platformRevenue) as revenue
        FROM \`Order\` WHERE status != 'CANCELLED'
        GROUP BY substr(createdAt, 1, 7) ORDER BY month DESC LIMIT 6
      `).catch(() => []) as Promise<{ month: string; revenue: number }[]>,
    ]);

  const stats = [
    {
      label: "Total Revenue",
      value: formatPeso(totalRevenue._sum.platformRevenue || 0),
      sublabel: `Gross: ${formatPeso(totalRevenue._sum.totalAmount || 0)}`,
      icon: DollarSign,
      gradient: "from-red-600 to-orange-500",
      shadow: "shadow-red-500/20",
      bg: "bg-red-500/10",
    },
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      sublabel: `${ordersThisMonth} this month`,
      icon: ShoppingCart,
      gradient: "from-blue-600 to-cyan-500",
      shadow: "shadow-blue-500/20",
      bg: "bg-blue-500/10",
    },
    {
      label: "Verified Artists",
      value: totalArtists.toLocaleString(),
      sublabel: `${newArtistsThisMonth} new this month`,
      icon: UserCheck,
      gradient: "from-purple-600 to-pink-500",
      shadow: "shadow-purple-500/20",
      bg: "bg-purple-500/10",
    },
    {
      label: "Active Products",
      value: totalProducts.toLocaleString(),
      sublabel: "In store",
      icon: Package,
      gradient: "from-emerald-600 to-green-500",
      shadow: "shadow-emerald-500/20",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Customers",
      value: totalCustomers.toLocaleString(),
      sublabel: "Registered",
      icon: Users,
      gradient: "from-amber-600 to-yellow-500",
      shadow: "shadow-amber-500/20",
      bg: "bg-amber-500/10",
    },
  ];

  // Reverse to show oldest first
  const chartData = [...revenueByMonth].reverse();
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Welcome back, {user.name || "Admin"}. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-white/10 bg-[#12121a]"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient}">
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs font-medium text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-600">
                  {stat.sublabel}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart + Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="border-white/10 bg-[#12121a] lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-400" />
              <CardTitle className="text-base">Platform Revenue</CardTitle>
            </div>
            <CardDescription>Monthly platform revenue (10% cut)</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="flex items-end gap-3 h-48">
                {chartData.map((d) => {
                  const height = Math.max((d.revenue / maxRevenue) * 100, 4);
                  return (
                    <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
                      <span className="text-[10px] font-medium text-slate-400">
                        {formatPeso(d.revenue)}
                      </span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-red-600 to-orange-500 transition-all min-h-[4px]"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[10px] text-slate-500">
                        {d.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-slate-500">No revenue data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-white/10 bg-[#12121a]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-400" />
              <CardTitle className="text-base">This Month</CardTitle>
            </div>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
              <div>
                <p className="text-sm font-medium text-white">Orders</p>
                <p className="text-xs text-slate-500">New this month</p>
              </div>
              <span className="text-lg font-bold text-blue-400">
                {ordersThisMonth}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
              <div>
                <p className="text-sm font-medium text-white">New Artists</p>
                <p className="text-xs text-slate-500">Registered this month</p>
              </div>
              <span className="text-lg font-bold text-purple-400">
                {newArtistsThisMonth}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
              <div>
                <p className="text-sm font-medium text-white">Artist Payouts</p>
                <p className="text-xs text-slate-500">Total sent to artists</p>
              </div>
              <span className="text-sm font-bold text-green-400">
                {formatPeso(totalRevenue._sum.artistRevenueTotal || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
              <div>
                <p className="text-sm font-medium text-white">Kanto Fund</p>
                <p className="text-xs text-slate-500">Platform earnings</p>
              </div>
              <span className="text-sm font-bold text-red-400">
                {formatPeso(totalRevenue._sum.platformRevenue || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <CardDescription>Last 10 orders</CardDescription>
            </div>
            <a
              href="/admin/orders"
              className="text-xs font-medium text-red-400 hover:text-red-300"
            >
              View all →
            </a>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="pb-2 font-medium text-slate-500">Order #</th>
                    <th className="pb-2 font-medium text-slate-500">Customer</th>
                    <th className="pb-2 font-medium text-slate-500 text-right">Total</th>
                    <th className="pb-2 font-medium text-slate-500 text-right">Platform Cut</th>
                    <th className="pb-2 font-medium text-slate-500">Status</th>
                    <th className="pb-2 font-medium text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5">
                      <td className="py-2.5">
                        <a
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-white hover:text-red-400"
                        >
                          {order.orderNumber}
                        </a>
                      </td>
                      <td className="py-2.5 text-slate-400">
                        {order.customer?.name || order.guestName || "Guest"}
                      </td>
                      <td className="py-2.5 text-right font-medium text-white">
                        {formatPeso(order.totalAmount)}
                      </td>
                      <td className="py-2.5 text-right text-red-400">
                        {formatPeso(order.platformRevenue)}
                      </td>
                      <td className="py-2.5">
                        <Badge
                          variant="outline"
                          className={
                            statusColors[order.status] ||
                            "bg-slate-500/20 text-slate-400"
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-slate-500">
                        {order.createdAt.toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-slate-500">No orders yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
