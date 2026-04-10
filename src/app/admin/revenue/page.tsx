import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import {
  DollarSign,
  TrendingUp,
  Users,
  Package,
  Wallet,
  PiggyBank,
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

export default async function RevenuePage() {
  try {
    await requireRole("ADMIN");
  } catch {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-400">Not authorized. Admin access required.</p>
      </div>
    );
  }

  // Total revenue
  let totalRevenue: any = { _sum: {}, _count: 0 };
  try {
    totalRevenue = await db.order.aggregate({
      _sum: { platformRevenue: true, artistRevenueTotal: true, totalAmount: true },
      _count: true,
      where: { status: { not: "CANCELLED" } },
    });
  } catch (error) {
    console.error("[RevenuePage] Error fetching total revenue:", error);
    totalRevenue = { _sum: { platformRevenue: 0, artistRevenueTotal: 0, totalAmount: 0 }, _count: 0 };
  }

  // Monthly breakdown (last 12 months)
  let monthlyRevenue: {
    month: string;
    platformRevenue: number;
    artistRevenue: number;
    totalAmount: number;
    orderCount: number;
  }[] = [];
  try {
    monthlyRevenue = await db.$queryRawUnsafe(`
      SELECT 
        substr(createdAt, 1, 7) as month,
        SUM(platformRevenue) as platformRevenue,
        SUM(artistRevenueTotal) as artistRevenue,
        SUM(totalAmount) as totalAmount,
        COUNT(*) as orderCount
      FROM \`Order\`
      WHERE status != 'CANCELLED'
      GROUP BY substr(createdAt, 1, 7)
      ORDER BY month DESC
      LIMIT 12
    `) as {
      month: string;
      platformRevenue: number;
      artistRevenue: number;
      totalAmount: number;
      orderCount: number;
    }[];
  } catch (error) {
    console.error("[RevenuePage] Error fetching monthly revenue:", error);
    monthlyRevenue = [];
  }

  const monthlyData = [...monthlyRevenue].reverse();

  // Per-artist revenue breakdown
  let artistRevenue: any[] = [];
  try {
    artistRevenue = await db.artistProfile.findMany({
      select: {
        id: true,
        bandName: true,
        city: true,
        _count: { select: { orderItems: true } },
        orderItems: {
          select: { subtotal: true },
        },
      },
      where: { orderItems: { some: {} } },
      orderBy: {
        orderItems: { _sum: { subtotal: "desc" } },
      },
    });
  } catch (error) {
    console.error("[RevenuePage] Error fetching artist revenue:", error);
    artistRevenue = [];
  }

  // Platform cut is 10%, artist gets 90%
  const PLATFORM_CUT = 0.1;

  const artistBreakdown = artistRevenue
    .map((a: any) => {
      const totalSales = a.orderItems.reduce((s: number, i: any) => s + (i.subtotal || 0), 0);
      return {
        id: a.id,
        bandName: a.bandName,
        city: a.city,
        totalSales,
        artistEarnings: totalSales * (1 - PLATFORM_CUT),
        platformEarnings: totalSales * PLATFORM_CUT,
        itemsSold: a.orderItems.length,
      };
    })
    .sort((a: any, b: any) => b.totalSales - a.totalSales);

  // Top selling products
  let topProducts: any[] = [];
  try {
    topProducts = await db.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        _count: { select: { orderItems: true } },
        orderItems: {
          select: { subtotal: true, quantity: true },
        },
      },
      where: { orderItems: { some: {} } },
      orderBy: {
        orderItems: { _sum: { subtotal: "desc" } },
      },
      take: 10,
    });
  } catch (error) {
    console.error("[RevenuePage] Error fetching top products:", error);
    topProducts = [];
  }

  const topProductsData = topProducts
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      totalSold: p.orderItems.reduce((s: number, i: any) => s + (i.quantity || 0), 0),
      totalRevenue: p.orderItems.reduce((s: number, i: any) => s + (i.subtotal || 0), 0),
    }))
    .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

  const maxMonthlyRevenue = Math.max(
    ...monthlyData.map((m) => m.totalAmount || 0),
    1
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Revenue
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Platform revenue analytics and breakdowns
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {formatPeso(totalRevenue._sum.platformRevenue || 0)}
                </p>
                <p className="text-xs text-slate-500">
                  Total Platform Revenue
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-500">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {formatPeso(totalRevenue._sum.artistRevenueTotal || 0)}
                </p>
                <p className="text-xs text-slate-500">
                  Total Artist Payouts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {formatPeso(totalRevenue._sum.totalAmount || 0)}
                </p>
                <p className="text-xs text-slate-500">Total Gross Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-yellow-500">
                <PiggyBank className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {totalRevenue._count || 0}
                </p>
                <p className="text-xs text-slate-500">
                  Total Orders (excl. cancelled)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-red-400" />
            <CardTitle className="text-base">Monthly Breakdown</CardTitle>
          </div>
          <CardDescription>Last 12 months of revenue</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <>
              {/* Bar Chart */}
              <div className="mb-6 flex items-end gap-2 h-44">
                {monthlyData.map((m) => {
                  const height = Math.max(
                    ((m.totalAmount || 0) / maxMonthlyRevenue) * 100,
                    3
                  );
                  return (
                    <div
                      key={m.month}
                      className="group flex flex-1 flex-col items-center gap-1"
                    >
                      <div className="flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] text-red-400">
                          {formatPeso(m.platformRevenue || 0)}
                        </span>
                        <span className="text-[9px] text-green-400">
                          {formatPeso(m.artistRevenue || 0)}
                        </span>
                      </div>
                      <div className="relative w-full flex flex-col" style={{ height: `${height}%` }}>
                        <div
                          className="absolute bottom-0 w-full rounded-t bg-gradient-to-t from-red-600 to-orange-500"
                          style={{
                            height: `${((m.platformRevenue || 0) / (m.totalAmount || 1)) * 100}%`,
                          }}
                        />
                        <div
                          className="absolute top-0 w-full bg-green-500/40 rounded-t"
                          style={{
                            height: `${((m.artistRevenue || 0) / (m.totalAmount || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-500">
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mb-4 flex items-center gap-4 text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-r from-red-600 to-orange-500" />
                  Platform (10%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-green-500/40" />
                  Artist (90%)
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="pb-2 text-left font-medium text-slate-500">
                        Month
                      </th>
                      <th className="pb-2 text-right font-medium text-slate-500">
                        Orders
                      </th>
                      <th className="pb-2 text-right font-medium text-slate-500">
                        Gross Sales
                      </th>
                      <th className="pb-2 text-right font-medium text-slate-500">
                        Platform Cut
                      </th>
                      <th className="pb-2 text-right font-medium text-slate-500">
                        Artist Payout
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[...monthlyData].reverse().map((m) => (
                      <tr key={m.month} className="hover:bg-white/5">
                        <td className="py-2 font-medium text-white">
                          {m.month}
                        </td>
                        <td className="py-2 text-right text-slate-400">
                          {m.orderCount}
                        </td>
                        <td className="py-2 text-right text-white">
                          {formatPeso(m.totalAmount || 0)}
                        </td>
                        <td className="py-2 text-right text-red-400">
                          {formatPeso(m.platformRevenue || 0)}
                        </td>
                        <td className="py-2 text-right text-green-400">
                          {formatPeso(m.artistRevenue || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-slate-500">No revenue data yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Per-Artist Revenue */}
        <Card className="border-white/10 bg-[#12121a]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              <CardTitle className="text-base">
                Artist Revenue Breakdown
              </CardTitle>
            </div>
            <CardDescription>
              Revenue by artist (sorted by total sales)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {artistBreakdown.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {artistBreakdown.map((artist: any, index: number) => (
                  <div
                    key={artist.id}
                    className="rounded-lg border border-white/5 bg-white/5 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-slate-400">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {artist.bandName}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {artist.city} &middot; {artist.itemsSold} items sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">
                          {formatPeso(artist.totalSales)}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Platform:{" "}
                          <span className="text-red-400">
                            {formatPeso(artist.platformEarnings)}
                          </span>{" "}
                          &middot; Artist:{" "}
                          <span className="text-green-400">
                            {formatPeso(artist.artistEarnings)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-slate-500">No artist data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="border-white/10 bg-[#12121a]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-400" />
              <CardTitle className="text-base">
                Top Selling Products
              </CardTitle>
            </div>
            <CardDescription>Top 10 products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {topProductsData.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {topProductsData.map((product: any, index: number) => (
                  <div
                    key={product.id}
                    className="rounded-lg border border-white/5 bg-white/5 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-slate-400">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {product.category} &middot;{" "}
                            {formatPeso(product.price)} each
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">
                          {formatPeso(product.totalRevenue)}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {product.totalSold} sold
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-slate-500">
                  No product data yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Kanto Fund */}
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500">
              <PiggyBank className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Kanto Fund</h3>
              <p className="mt-1 text-sm text-slate-400">
                The Kanto Fund is the platform&apos;s share of all transaction revenue
                (10% per order). This fund supports station operations, artist
                development programs, and community initiatives.
              </p>
              <div className="mt-4 flex flex-wrap gap-6">
                <div>
                  <p className="text-2xl font-bold text-red-400">
                    {formatPeso(totalRevenue._sum.platformRevenue || 0)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Total Kanto Fund Contributions
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {artistBreakdown.length}
                  </p>
                  <p className="text-xs text-slate-500">
                    Artists Contributing
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {topProductsData.length}
                  </p>
                  <p className="text-xs text-slate-500">
                    Products Generating Revenue
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
