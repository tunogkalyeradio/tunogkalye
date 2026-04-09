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
  const user = await requireRole("ARTIST");
  const artistProfile = await db.artistProfile.findUnique({
    where: { userId: user.id },
  });

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

      {/* Status Card */}
      <Card
        className={`border ${
          isConnected
            ? "border-green-500/20 bg-green-500/5"
            : hasAccountId
            ? "border-amber-500/20 bg-amber-500/5"
            : "border-white/10 bg-[#12121a]"
        }`}
      >
        <CardContent className="flex items-center gap-4 p-6">
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
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">
              {isConnected
                ? "Stripe Account Connected"
                : hasAccountId
                ? "Setup In Progress"
                : "Not Connected"}
            </h2>
            <p className="mt-0.5 text-sm text-slate-400">
              {isConnected
                ? "Your payouts are active. Earnings are automatically deposited to your bank account."
                : hasAccountId
                ? "Complete your Stripe onboarding to start receiving payouts."
                : "Connect your Stripe account to start receiving 90% of every sale."}
            </p>
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
            {isConnected ? "Active" : hasAccountId ? "Pending" : "Inactive"}
          </Badge>
        </CardContent>
      </Card>

      {/* Revenue Split */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Banknote className="h-4 w-4 text-green-400" />
            How Payouts Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex-1 text-center">
              <p className="text-3xl font-black text-green-400">90%</p>
              <p className="mt-1 text-sm font-medium text-white">
                You Receive
              </p>
              <p className="text-xs text-slate-500">Every sale, instantly</p>
            </div>
            <ArrowRight className="h-6 w-6 text-slate-600" />
            <div className="flex-1 text-center">
              <p className="text-3xl font-black text-slate-400">10%</p>
              <p className="mt-1 text-sm font-medium text-white">
                Platform Fee
              </p>
              <p className="text-xs text-slate-500">Keeps the station running</p>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-slate-400">
            You&apos;ll receive <span className="font-bold text-green-400">90% of every sale</span>{" "}
            instantly to your bank account via Stripe Connect.
          </p>
        </CardContent>
      </Card>

      {/* Steps */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Zap className="h-4 w-4 text-purple-400" />
            Getting Started
          </CardTitle>
          <CardDescription>
            Complete these steps to start receiving payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1 */}
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
                <h3 className="text-sm font-bold text-white">
                  Connect Your Stripe Account
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Click the button below to create or link your Stripe Connect
                  account. This is how we&apos;ll send you money.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isConnected
                      ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                      : "border-2 border-white/10 bg-white/5 text-slate-500"
                  }`}
                >
                  {isConnected ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <div className="mt-2 w-0.5 flex-1 bg-white/5" />
              </div>
              <div className="pb-6">
                <h3 className="text-sm font-bold text-white">
                  Verify Your Identity
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Stripe will ask you to verify your identity (government ID,
                  bank details). This is required by law and protects everyone.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isConnected
                      ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                      : "border-2 border-white/10 bg-white/5 text-slate-500"
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
                <h3 className="text-sm font-bold text-white">
                  Start Receiving Payouts
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Once verified, 90% of every sale goes directly to your bank
                  account. Payouts happen automatically — no manual requests
                  needed.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connect Button */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <CreditCard className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isConnected
                ? "Your Stripe account is all set!"
                : "Ready to get paid?"}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {isConnected
                ? "Earnings are automatically deposited to your bank account."
                : "Connect your Stripe account to start receiving payouts from your merch sales."}
            </p>
          </div>
          {!isConnected && (
            <Button
              disabled
              className="bg-gradient-to-r from-blue-500 to-purple-500 px-8 text-base font-bold text-white hover:from-blue-400 hover:to-purple-400 disabled:opacity-50"
            >
              <Lock className="mr-2 h-4 w-4" />
              Connect with Stripe (Coming Soon)
            </Button>
          )}
          {isConnected && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <ShieldCheck className="h-4 w-4" />
              Payouts are active and secure
            </div>
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
              All payment processing is handled by Stripe Connect, a PCI
              DSS-compliant payment platform used by millions of businesses
              worldwide. Your bank details are encrypted and never stored on our
              servers. Stripe handles all payout logistics, tax reporting, and
              compliance automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
