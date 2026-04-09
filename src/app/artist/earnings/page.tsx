import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import {
  DollarSign,
  TrendingUp,
  Package,
  Clock,
  CreditCard,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

export default async function ArtistEarningsPage() {
  const user = await requireRole("ARTIST");
  const artistProfile = await db.artistProfile.findUnique({
    where: { userId: user.id },
  });

  if (!artistProfile) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">No artist profile found.</p>
      </div>
    );
  }

  // Total earnings
  const totalEarnings = await db.orderItem.aggregate({
    where: { artistId: artistProfile.id },
    _sum: { subtotal: true },
  });

  // Earnings by status
  const pendingItems = await db.orderItem.aggregate({
    where: {
      artistId: artistProfile.id,
      status: { in: ["PENDING", "SHIPPED"] },
    },
    _sum: { subtotal: true },
  });

  const deliveredItems = await db.orderItem.aggregate({
    where: {
      artistId: artistProfile.id,
      status: "DELIVERED",
    },
    _sum: { subtotal: true },
  });

  const totalEarningsAmount = totalEarnings._sum.subtotal || 0;
  const pendingAmount = pendingItems._sum.subtotal || 0;
  const availableAmount = deliveredItems._sum.subtotal || 0;

  // Monthly breakdown
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyData = await db.orderItem.groupBy({
    by: ["createdAt"],
    where: {
      artistId: artistProfile.id,
      createdAt: { gte: twelveMonthsAgo },
    },
    _sum: { subtotal: true },
    _count: { id: true },
  });

  // Aggregate by month
  const monthlyMap: Record<string, { earnings: number; orders: number }> = {};
  for (const item of monthlyData) {
    const key = `${item.createdAt.getFullYear()}-${String(item.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyMap[key]) {
      monthlyMap[key] = { earnings: 0, orders: 0 };
    }
    monthlyMap[key].earnings += item._sum.subtotal || 0;
    monthlyMap[key].orders += item._count.id;
  }

  const monthlyEntries = Object.entries(monthlyMap).sort((a, b) =>
    b[0].localeCompare(a[0])
  );

  // Per-product earnings ranking
  const productEarnings = await db.orderItem.groupBy({
    by: ["productId", "productName"],
    where: { artistId: artistProfile.id },
    _sum: { subtotal: true, quantity: true },
    _count: { id: true },
    orderBy: { _sum: { subtotal: "desc" } },
    take: 10,
  });

  const maxBarValue = Math.max(
    ...productEarnings.map((p) => p._sum.subtotal || 0),
    1
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Earnings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Track your revenue and payouts
        </p>
      </div>

      {/* Stripe notice */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
        <div>
          <p className="text-sm font-medium text-blue-300">
            Earnings are auto-deposited to your linked bank account via Stripe
            Connect
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            You receive 90% of every sale instantly. Connect your Stripe account
            in{" "}
            <a
              href="/artist/stripe"
              className="text-blue-400 underline hover:text-blue-300"
            >
              Stripe Setup
            </a>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Total Earnings
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {formatPeso(totalEarningsAmount)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  All-time artist cut (90%)
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Available Balance
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {formatPeso(availableAmount)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  From delivered orders
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                <CreditCard className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Pending Payouts
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {formatPeso(pendingAmount)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  From pending/shipped orders
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Breakdown */}
        <Card className="border-white/10 bg-[#12121a]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              Monthly Breakdown
            </CardTitle>
            <CardDescription>
              Your earnings by month (last 12 months)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="mb-3 h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-500">No earnings data yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {monthlyEntries.map(([month, data]) => {
                  const monthLabel = new Date(month + "-01").toLocaleString(
                    "en-US",
                    { month: "long", year: "numeric" }
                  );
                  return (
                    <div
                      key={month}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {monthLabel}
                        </p>
                        <p className="text-xs text-slate-500">
                          {data.orders} order(s)
                        </p>
                      </div>
                      <p className="text-sm font-bold text-green-400">
                        {formatPeso(data.earnings)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Per-Product Rankings */}
        <Card className="border-white/10 bg-[#12121a]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <Package className="h-4 w-4 text-purple-400" />
              Top Products
            </CardTitle>
            <CardDescription>
              Your best-selling merchandise
            </CardDescription>
          </CardHeader>
          <CardContent>
            {productEarnings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="mb-3 h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-500">No sales data yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {productEarnings.map((product, index) => {
                  const barWidth =
                    ((product._sum.artistCut || 0) / maxBarValue) * 100;
                  return (
                    <div key={product.productId} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-[10px] font-bold text-white">
                            {index + 1}
                          </span>
                          <span className="truncate text-sm text-white">
                            {product.productName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] text-slate-500">
                            {product._count.id} sold
                          </span>
                          <span className="text-sm font-bold text-green-400">
                            {formatPeso(product._sum.subtotal || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
