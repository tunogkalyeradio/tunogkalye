export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function maskStripeId(id: string | null): string {
  if (!id) return "Not connected";
  if (id.length <= 8) return id;
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

export default async function PayoutsPage() {
  let artists: {
    id: number;
    bandName: string;
    city: string;
    stripeAccountId: string | null;
    stripeOnboardingComplete: boolean;
    storeStatus: string;
    totalSales: number;
    user: { email: string } | null;
  }[] = [];
  let error = false;

  try {
    await requireRole("ADMIN");
    artists = await db.artistProfile.findMany({
      where: { storeStatus: "APPROVED" },
      select: {
        id: true,
        bandName: true,
        city: true,
        stripeAccountId: true,
        stripeOnboardingComplete: true,
        storeStatus: true,
        totalSales: true,
        user: { select: { email: true } },
      },
      orderBy: { bandName: "asc" },
    });
  } catch {
    error = true;
  }

  const activeStripe = artists.filter(
    (a) => a.stripeAccountId && a.stripeOnboardingComplete
  ).length;
  const pendingSetup = artists.filter(
    (a) => !a.stripeAccountId || !a.stripeOnboardingComplete
  );
  const totalArtistSales = artists.reduce((s, a) => s + a.totalSales, 0);

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Payouts</h1>
          <p className="mt-1 text-sm text-slate-400">
            Stripe Connect payout oversight
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <CreditCard className="mb-3 h-10 w-10 text-slate-600" />
          <p className="text-sm">No data available. Database may be unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Payouts
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Stripe Connect payout routing oversight
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{activeStripe}</p>
                <p className="text-xs text-slate-500">Active Stripe Accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {pendingSetup.length}
                </p>
                <p className="text-xs text-slate-500">Pending Setup</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{artists.length}</p>
                <p className="text-xs text-slate-500">Total Approved Artists</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
                <DollarSign className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {formatPeso(totalArtistSales)}
                </p>
                <p className="text-xs text-slate-500">Total Artist Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {pendingSetup.length > 0 && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
            <div>
              <p className="text-sm font-bold text-yellow-400">
                {pendingSetup.length} artist(s) need Stripe setup
              </p>
              <p className="mt-1 text-xs text-slate-400">
                These artists cannot receive payouts until they complete Stripe Connect onboarding.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {pendingSetup.map((a) => (
                  <Badge
                    key={a.id}
                    className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    variant="outline"
                  >
                    {a.bandName}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Artist Table */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">
            Artist Stripe Status
          </CardTitle>
          <CardDescription className="text-slate-500">
            Overview of all approved artists and their payout readiness
          </CardDescription>
        </CardHeader>
        <CardContent>
          {artists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <CreditCard className="mb-3 h-10 w-10 text-slate-600" />
              <p className="text-sm">No approved artists yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-slate-400">Band Name</TableHead>
                    <TableHead className="text-slate-400 hidden md:table-cell">Email</TableHead>
                    <TableHead className="text-slate-400">Stripe Account ID</TableHead>
                    <TableHead className="text-slate-400">Onboarding</TableHead>
                    <TableHead className="text-slate-400 hidden sm:table-cell">Store Status</TableHead>
                    <TableHead className="text-slate-400">Total Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {artists.map((artist) => (
                    <TableRow key={artist.id} className="border-white/5">
                      <TableCell className="font-medium text-white">
                        {artist.bandName}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-slate-400 text-xs">
                        {artist.user?.email || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">
                        {maskStripeId(artist.stripeAccountId)}
                      </TableCell>
                      <TableCell>
                        {artist.stripeOnboardingComplete ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30" variant="outline">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Complete
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30" variant="outline">
                            <XCircle className="mr-1 h-3 w-3" /> Incomplete
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30" variant="outline">
                          {artist.storeStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {formatPeso(artist.totalSales)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
