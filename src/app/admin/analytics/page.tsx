export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Store,
  Download,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AnalyticsPage() {
  let error = false;

  // Default data
  let totalSalesVolume = 0;
  let totalOrders = 0;
  let topArtists: { bandName: string; totalSales: number; city: string }[] = [];
  let topProducts: { name: string; totalSold: number; totalRevenue: number; category: string }[] = [];
  let stationMerchSales = 0;
  let artistMerchSales = 0;
  let monthlyData: { month: string; total: number; count: number }[] = [];
  let newUsersThisMonth = 0;
  let activeStores = 0;
  let digitalSales = 0;
  let physicalSales = 0;

  try {
    await requireRole("ADMIN");

    // Total sales volume
    const orderAgg = await db.order.aggregate({
      _sum: { totalAmount: true },
      _count: true,
      where: { status: { not: "CANCELLED" } },
    });
    totalSalesVolume = orderAgg._sum.totalAmount || 0;
    totalOrders = orderAgg._count || 0;

    // Top selling artists (by total sales via orderItems)
    const artistSales = await db.$queryRawUnsafe<
      { artistId: number; bandName: string; city: string; totalSales: number }[]
    >(`
      SELECT ap.id as artistId, ap.bandName, ap.city, COALESCE(SUM(oi.subtotal), 0) as totalSales
      FROM ArtistProfile ap
      LEFT JOIN OrderItem oi ON oi.artistId = ap.id
      GROUP BY ap.id
      ORDER BY totalSales DESC
      LIMIT 10
    `);
    topArtists = artistSales;

    // Top selling products
    const productSales = await db.$queryRawUnsafe<
      { productId: number; name: string; category: string; totalSold: number; totalRevenue: number }[]
    >(`
      SELECT p.id as productId, p.name, p.category, COALESCE(SUM(oi.quantity), 0) as totalSold, COALESCE(SUM(oi.subtotal), 0) as totalRevenue
      FROM Product p
      LEFT JOIN OrderItem oi ON oi.productId = p.id
      GROUP BY p.id
      ORDER BY totalRevenue DESC
      LIMIT 10
    `);
    topProducts = productSales;

    // Station vs Artist merch breakdown
    const stationAgg = await db.orderItem.aggregate({
      _sum: { subtotal: true },
      where: { isStationMerch: true },
    });
    const artistAgg = await db.orderItem.aggregate({
      _sum: { subtotal: true },
      where: { isStationMerch: false },
    });
    stationMerchSales = stationAgg._sum.subtotal || 0;
    artistMerchSales = artistAgg._sum.subtotal || 0;

    // Monthly sales trend (last 12 months)
    monthlyData = (await db.$queryRawUnsafe<
      { month: string; total: number; count: number }[]
    >(`
      SELECT substr(createdAt, 1, 7) as month, SUM(totalAmount) as total, COUNT(*) as count
      FROM \`Order\`
      WHERE status != 'CANCELLED'
      GROUP BY substr(createdAt, 1, 7)
      ORDER BY month DESC
      LIMIT 12
    `)).reverse();

    // New users this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    newUsersThisMonth = await db.user.count({
      where: { createdAt: { gte: monthStart } },
    });

    // Active stores
    activeStores = await db.artistProfile.count({
      where: { storeStatus: "APPROVED" },
    });

    // Digital vs Physical
    const digitalAgg = await db.orderItem.aggregate({
      _sum: { subtotal: true },
      where: { isDigital: true },
    });
    const physicalAgg = await db.orderItem.aggregate({
      _sum: { subtotal: true },
      where: { isDigital: false },
    });
    digitalSales = digitalAgg._sum.subtotal || 0;
    physicalSales = physicalAgg._sum.subtotal || 0;
  } catch {
    error = true;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-slate-400">Platform-wide analytics dashboard</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <AlertCircle className="mb-3 h-10 w-10 text-slate-600" />
          <p className="text-sm">No data available. Database may be unavailable.</p>
        </div>
      </div>
    );
  }

  const maxMonthly = Math.max(...monthlyData.map((m) => m.total), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-slate-400">
          Platform-wide analytics and insights
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
                <p className="text-xl font-bold text-white">{formatPeso(totalSalesVolume)}</p>
                <p className="text-xs text-slate-500">Total Sales Volume</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
                <ShoppingCart className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{totalOrders}</p>
                <p className="text-xs text-slate-500">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
                <UserPlus className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{newUsersThisMonth}</p>
                <p className="text-xs text-slate-500">New Users This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                <Store className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{activeStores}</p>
                <p className="text-xs text-slate-500">Active Stores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Sales Trend */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-red-400" />
            <CardTitle className="text-base">Monthly Sales Trend</CardTitle>
          </div>
          <CardDescription className="text-slate-500">Last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <div className="flex items-end gap-2 h-48">
              {monthlyData.map((m) => {
                const height = Math.max((m.total / maxMonthly) * 100, 3);
                return (
                  <div key={m.month} className="group flex flex-1 flex-col items-center gap-1">
                    <div className="flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-red-400">
                        {formatPeso(m.total)}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {m.count} orders
                      </span>
                    </div>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-red-600 to-orange-500"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[9px] text-slate-500">{m.month}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-slate-500 text-sm">
              No monthly data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversion Breakdowns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Station vs Artist Merch */}
        <Card className="border-white/10 bg-[#12121a]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-400" />
              <CardTitle className="text-base">Station vs Artist Merch</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-gradient-to-r from-red-600 to-orange-500" />
                  <span className="text-sm text-slate-300">Station Merch</span>
                </div>
                <span className="text-sm font-bold text-white">
                  {formatPeso(stationMerchSales)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-green-500/60" />
                  <span className="text-sm text-slate-300">Artist Merch</span>
                </div>
                <span className="text-sm font-bold text-white">
                  {formatPeso(artistMerchSales)}
                </span>
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Total</span>
                <span className="text-sm font-bold text-white">
                  {formatPeso(stationMerchSales + artistMerchSales)}
                </span>
              </div>
              {/* Visual bar */}
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/5">
                {stationMerchSales + artistMerchSales > 0 ? (
                  <>
                    <div
                      className="bg-gradient-to-r from-red-600 to-orange-500"
                      style={{
                        width: `${(stationMerchSales / (stationMerchSales + artistMerchSales)) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-green-500/60"
                      style={{
                        width: `${(artistMerchSales / (stationMerchSales + artistMerchSales)) * 100}%`,
                      }}
                    />
                  </>
                ) : null}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>
                  {stationMerchSales + artistMerchSales > 0
                    ? `${((stationMerchSales / (stationMerchSales + artistMerchSales)) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
                <span>
                  {stationMerchSales + artistMerchSales > 0
                    ? `${((artistMerchSales / (stationMerchSales + artistMerchSales)) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Digital vs Physical */}
        <Card className="border-white/10 bg-[#12121a]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-purple-400" />
              <CardTitle className="text-base">Digital vs Physical</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-purple-500/60" />
                  <span className="text-sm text-slate-300">Digital</span>
                </div>
                <span className="text-sm font-bold text-white">
                  {formatPeso(digitalSales)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-cyan-500/60" />
                  <span className="text-sm text-slate-300">Physical</span>
                </div>
                <span className="text-sm font-bold text-white">
                  {formatPeso(physicalSales)}
                </span>
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Total</span>
                <span className="text-sm font-bold text-white">
                  {formatPeso(digitalSales + physicalSales)}
                </span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/5">
                {digitalSales + physicalSales > 0 ? (
                  <>
                    <div
                      className="bg-purple-500/60"
                      style={{
                        width: `${(digitalSales / (digitalSales + physicalSales)) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-cyan-500/60"
                      style={{
                        width: `${(physicalSales / (digitalSales + physicalSales)) * 100}%`,
                      }}
                    />
                  </>
                ) : null}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>
                  {digitalSales + physicalSales > 0
                    ? `${((digitalSales / (digitalSales + physicalSales)) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
                <span>
                  {digitalSales + physicalSales > 0
                    ? `${((physicalSales / (digitalSales + physicalSales)) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Artists & Products */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Artists */}
        <Card className="border-white/10 bg-[#12121a]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              <CardTitle className="text-base">Top Selling Artists</CardTitle>
            </div>
            <CardDescription className="text-slate-500">By total sales (top 10)</CardDescription>
          </CardHeader>
          <CardContent>
            {topArtists.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {topArtists.map((artist, index) => (
                  <div
                    key={artist.artistId}
                    className="rounded-lg border border-white/5 bg-white/5 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-slate-400">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{artist.bandName}</p>
                          <p className="text-[10px] text-slate-500">{artist.city}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-white">
                        {formatPeso(artist.totalSales)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-slate-500">
                No artist sales data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-white/10 bg-[#12121a]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-400" />
              <CardTitle className="text-base">Top Selling Products</CardTitle>
            </div>
            <CardDescription className="text-slate-500">By quantity sold (top 10)</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="rounded-lg border border-white/5 bg-white/5 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-slate-400">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{product.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {product.category} &middot; {product.totalSold} sold
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-white">
                        {formatPeso(product.totalRevenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-slate-500">
                No product sales data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
