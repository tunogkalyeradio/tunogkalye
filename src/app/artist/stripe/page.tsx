import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import {
  CreditCard,
  CheckCircle2,
  Circle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Banknote,
  Lock,
  AlertCircle,
  Package,
  ShoppingBag,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ArtistStripePage() {
  let user;
  let artistProfile;
  try {
    user = await requireRole("ARTIST");
    artistProfile = await db.artistProfile.findUnique({
      where: { userId: user.id },
    });
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-3 h-8 w-8 text-slate-600" />
        <p className="text-sm text-slate-500">Unable to load profile. Please try again.</p>
      </div>
    );
  }

  const storeStatus = artistProfile?.storeStatus || "PENDING";
  const isConnected = artistProfile?.stripeOnboardingComplete || false;
  const hasAccountId = !!artistProfile?.stripeAccountId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Stripe Connect Setup
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Connect your bank account to receive payouts
        </p>
      </div>

      {/* Store Status Banner */}
      {storeStatus !== "APPROVED" && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-amber-300">
                Store Application Pending Approval
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Your store application is pending admin review. You can set up Stripe now so you&apos;re ready to sell immediately once approved. No charges will be made until your store goes live.
              </p>
              {storeStatus === "REJECTED" && artistProfile?.storeRejectedReason && (
                <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                  Rejection reason: {artistProfile.storeRejectedReason}
                </div>
              )}
            </div>
            <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
              {storeStatus}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Status Card */}
      {storeStatus === "APPROVED" && (
        <Card
          className={`border ${
            isConnected
              ? "border-green-500/20 bg-green-500/5"
              : hasAccountId
              ? "border-amber-500/20 bg-amber-500/5"
              : "border-white/10 bg-[#12121a]"
          }`}
        >
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4 flex-1">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                  isConnected
                    ? "bg-green-500/10"
                    : hasAccountId
                    ? "bg-amber-500/10"
                    : "bg-white/5"
                }`}
              >
                {isConnected ? (
                  <CheckCircle2 className="h-7 w-7 text-green-400" />
                ) : (
                  <CreditCard className="h-7 w-7 text-slate-400" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {isConnected
                    ? "Stripe Account Connected"
                    : hasAccountId
                    ? "Setup In Progress"
                    : "Connect Your Bank Account to Start Selling"}
                </h2>
                <p className="mt-0.5 text-sm text-slate-400">
                  {isConnected
                    ? "Payouts are active. Earnings are deposited directly to your bank."
                    : "When fans buy your merch, 100% of the payment goes directly to your bank account. Tunog Kalye takes 0% commission."}
                </p>
              </div>
            </div>
            <Badge
              className={
                isConnected
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : hasAccountId
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  : "border-white/10 bg-white/5 text-slate-400"
              }
            >
              {isConnected ? "Active" : hasAccountId ? "Pending" : "Not Connected"}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Revenue Split Explanation — 0% Commission */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Banknote className="h-4 w-4 text-green-400" />
            How Payouts Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-6 sm:flex-row sm:justify-center sm:gap-6">
            <div className="text-center flex-1">
              <p className="text-3xl font-black text-white">$25</p>
              <p className="mt-1 text-sm font-medium text-slate-300">Fan Pays</p>
            </div>
            <ArrowRight className="h-6 w-6 text-slate-600 hidden sm:block" />
            <div className="text-center flex-1">
              <p className="text-3xl font-black text-amber-400">~$1</p>
              <p className="mt-1 text-sm font-medium text-slate-300">Stripe Processing</p>
              <p className="text-xs text-slate-500">~2.9% + $0.30</p>
            </div>
            <ArrowRight className="h-6 w-6 text-slate-600 hidden sm:block" />
            <div className="text-center flex-1">
              <p className="text-3xl font-black text-green-400">$24</p>
              <p className="mt-1 text-sm font-medium text-white">Your Bank Account</p>
              <p className="text-xs text-slate-500">Direct deposit</p>
            </div>
            <ArrowRight className="h-6 w-6 text-slate-600 hidden sm:block" />
            <div className="text-center flex-1">
              <p className="text-3xl font-black text-red-400">$0</p>
              <p className="mt-1 text-sm font-medium text-white">Tunog Kalye</p>
              <p className="text-xs text-slate-500">Zero commission</p>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-slate-400">
            <span className="font-bold text-green-400">100% of proceeds</span>{" "}
            (minus Stripe processing fees) go directly to you. Tunog Kalye Radio takes absolutely{" "}
            <span className="font-bold text-green-400">zero commission</span> on artist sales.
          </p>
        </CardContent>
      </Card>

      {/* 3-Step Guide */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Zap className="h-4 w-4 text-purple-400" />
            Getting Started — 3 Easy Steps
          </CardTitle>
          <CardDescription>
            Complete these steps to start earning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1: Connect Stripe */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    hasAccountId || isConnected
                      ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                      : "border-2 border-blue-500/30 bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {hasAccountId || isConnected ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-bold">1</span>
                  )}
                </div>
                <div className="mt-2 w-0.5 flex-1 bg-white/5" />
              </div>
              <div className="pb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Connect Your Stripe Account</h3>
                  <CreditCard className="h-4 w-4 text-blue-400" />
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  Create or link your Stripe Connect account. This handles all payment processing securely.
                </p>
              </div>
            </div>

            {/* Step 2: Add Products */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                    isConnected
                      ? "border-green-500/30 bg-green-500/10 text-green-400"
                      : "border-white/10 bg-white/5 text-slate-500"
                  }`}
                >
                  {isConnected ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-bold">2</span>
                  )}
                </div>
                <div className="mt-2 w-0.5 flex-1 bg-white/5" />
              </div>
              <div className="pb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Add Products</h3>
                  <Package className="h-4 w-4 text-purple-400" />
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  Upload your merch — physical items, digital downloads, albums, stickers, and more.
                </p>
              </div>
            </div>

            {/* Step 3: Start Selling */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                    isConnected
                      ? "border-green-500/30 bg-green-500/10 text-green-400"
                      : "border-white/10 bg-white/5 text-slate-500"
                  }`}
                >
                  {isConnected ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Start Selling</h3>
                  <ShoppingBag className="h-4 w-4 text-green-400" />
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  Share your store link and earn money from every sale. Payouts are automatic.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connect Button / Success State */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          {isConnected ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Your Stripe account is all set!
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {hasAccountId && (
                    <>Account ID: <span className="text-xs font-mono text-slate-500">{artistProfile.stripeAccountId?.slice(0, 20)}...</span></>
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Earnings are automatically deposited to your bank account.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <ShieldCheck className="h-4 w-4" />
                Payouts are active and secure
              </div>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <CreditCard className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Ready to get paid?
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Connect your Stripe account to start receiving payouts from your merch sales. 100% goes to you.
                </p>
              </div>
              <Button
                disabled
                className="bg-gradient-to-r from-blue-500 to-purple-500 px-8 text-base font-bold text-white hover:from-blue-400 hover:to-purple-400 disabled:opacity-50"
              >
                <Lock className="mr-2 h-4 w-4" />
                Connect with Stripe (Coming Soon)
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Security notice */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <div>
            <p className="text-xs font-medium text-slate-400">
              Secure & Encrypted
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
              All payment processing is handled by Stripe Connect, a PCI DSS-compliant payment platform used by millions of businesses worldwide. Your bank details are encrypted and never stored on our servers. Stripe handles all payout logistics, tax reporting, and compliance automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
