"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  Truck,
  Bell,
  Star,
  ArrowRight,
  Radio,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";

// ─── Success Content ─────────────────────────────────────
function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="mx-auto max-w-2xl">
      {/* Confirmation Header */}
      <div className="rounded-2xl border border-green-500/20 bg-[#12121a] p-8 sm:p-12 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="mb-2 text-3xl font-black text-white sm:text-4xl">
          Order Confirmed!
        </h1>
        <p className="text-slate-400">
          Thank you for supporting Filipino indie artists.
        </p>
        {orderId && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-xs text-slate-500">Order ID:</span>
            <span className="text-sm font-mono font-bold text-white">
              #{orderId}
            </span>
          </div>
        )}
      </div>

      {/* What Happens Next */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#12121a] p-6 sm:p-8">
        <h3 className="mb-6 text-lg font-bold text-white">
          What Happens Next
        </h3>
        <div className="space-y-0">
          {[
            {
              icon: Package,
              step: "01",
              title: "Artist receives your order",
              desc: "The artist will be notified and begin preparing your merch.",
              color: "bg-blue-500",
            },
            {
              icon: Truck,
              step: "02",
              title: "Artist prepares and ships your item",
              desc: "Each item is carefully prepared by the artist and shipped to your address.",
              color: "bg-amber-500",
            },
            {
              icon: Bell,
              step: "03",
              title: "You receive a tracking notification",
              desc: "We'll notify you with tracking details once your order ships.",
              color: "bg-purple-500",
            },
            {
              icon: Star,
              step: "04",
              title: "Leave a review for the artist!",
              desc: "Share your experience and help other fans discover great merch.",
              color: "bg-green-500",
            },
          ].map((item, i) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.color}`}
                >
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                {i < 3 && (
                  <div className="w-0.5 flex-1 bg-white/10 mt-1" />
                )}
              </div>
              <div className="pb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Step {item.step}
                </div>
                <div className="mt-0.5 text-sm font-bold text-white">
                  {item.title}
                </div>
                <div className="mt-0.5 text-sm text-slate-400">
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Transparency */}
      <div className="mt-6 rounded-xl border border-green-500/10 bg-green-500/5 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
          <div>
            <div className="mb-1 text-sm font-bold text-white">
              You&apos;re Making a Difference
            </div>
            <p className="text-sm text-slate-400">
              90% of your purchase goes directly to the artist. The remaining 10%
              supports Tunog Kalye Radio so we can keep promoting Filipino
              independent music worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {orderId && (
          <Link href={`/dashboard/orders/${orderId}`}>
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400 sm:w-auto"
            >
              View My Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
        <Link href="/store">
          <Button
            size="lg"
            variant="outline"
            className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
        <Link href="/">
          <Button
            size="lg"
            variant="outline"
            className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
          >
            <Radio className="mr-2 h-4 w-4 text-red-400" />
            Back to Hub
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Success Page with Suspense boundary ─────────────────
export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
          </div>
        }
      >
        <CheckoutSuccessContent />
      </Suspense>
    </div>
  );
}
