"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ImageOff,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Truck,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";

// ─── Types ───────────────────────────────────────────────
interface CartItem {
  id: number;
  quantity: number;
  size: string | null;
  product: {
    id: number;
    name: string;
    price: number;
    compareAtPrice?: number | null;
    images: string;
    shippingFee: number;
    category: string;
    artist: {
      bandName: string;
    };
  };
}

interface ShippingForm {
  name: string;
  phone: string;
  line1: string;
  city: string;
  province: string;
  postalCode: string;
}

// ─── Helpers ─────────────────────────────────────────────
function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getFirstImage(images: string): string | null {
  try {
    const arr = JSON.parse(images);
    if (Array.isArray(arr) && arr.length > 0) return arr[0];
  } catch {}
  return null;
}

// ─── Checkout Page ───────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ShippingForm>({
    name: "",
    phone: "",
    line1: "",
    city: "",
    province: "",
    postalCode: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(
        "/auth/login?callbackUrl=/store/checkout"
      );
    }
  }, [status, router]);

  // Fetch cart items
  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.cartItems || []);
      } else if (res.status === 401) {
        // Will be handled by the session redirect above
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchCart();
    }
  }, [session, fetchCart]);

  const updateField = (field: keyof ShippingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  // ─── Calculations ──────────────────────────────────────
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = cartItems.reduce(
    (sum, item) => sum + item.product.shippingFee * item.quantity,
    0
  );
  const total = subtotal + shipping;

  // ─── Validation ────────────────────────────────────────
  const validate = (): boolean => {
    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return false;
    }
    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      return false;
    }
    if (!form.line1.trim()) {
      setError("Please enter your address.");
      return false;
    }
    if (!form.city.trim()) {
      setError("Please enter your city.");
      return false;
    }
    if (!form.province.trim()) {
      setError("Please enter your province.");
      return false;
    }
    if (!form.postalCode.trim()) {
      setError("Please enter your postal code.");
      return false;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return false;
    }
    return true;
  };

  // ─── Submit Order ──────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            line1: form.line1.trim(),
            city: form.city.trim(),
            province: form.province.trim(),
            postalCode: form.postalCode.trim(),
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/store/checkout/success?orderId=${data.orderId}`);
      } else {
        setError(data.error || "Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading State ─────────────────────────────────────
  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-400" />
      </div>
    );
  }

  // ─── Empty Cart ────────────────────────────────────────
  if (cartItems.length === 0 && !loading) {
    return (
      <div className="mx-auto max-w-5xl text-center py-20">
        <div className="mb-4 text-5xl">🛒</div>
        <h1 className="mb-2 text-2xl font-bold text-white">
          Your cart is empty
        </h1>
        <p className="mb-6 text-sm text-slate-400">
          Browse merch from your favorite Filipino indie artists.
        </p>
        <Link href="/store">
          <Button className="bg-gradient-to-r from-red-600 to-orange-500 font-bold text-white hover:from-red-500 hover:to-orange-400">
            Browse Merch Store
          </Button>
        </Link>
      </div>
    );
  }

  // ─── Main Checkout ─────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/cart"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </Link>

      <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
        Checkout
      </h1>
      <p className="mb-8 text-sm text-slate-400">
        Review your order and complete your purchase.
      </p>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* LEFT: Order Summary (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
                <Truck className="h-4 w-4 text-red-400" />
                Order Summary
                <span className="ml-auto text-xs font-normal text-slate-500">
                  {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const imageUrl = getFirstImage(item.product.images);
                  const itemTotal =
                    item.product.price * item.quantity +
                    item.product.shippingFee * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                    >
                      {/* Image */}
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5 sm:h-20 sm:w-20">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageOff className="h-5 w-5 text-slate-600" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">
                            {item.product.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            by {item.product.artist.bandName}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          {item.size && (
                            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                              Size: {item.size}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500">
                            Qty: {item.quantity}
                          </span>
                          <span className="ml-auto text-sm font-bold text-white">
                            {formatCurrency(itemTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Checkout Form (2 cols) */}
        <div className="lg:col-span-2">
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Full Name *</Label>
                <Input
                  placeholder="Juan dela Cruz"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-600 focus:border-red-500/50"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Phone Number *</Label>
                <Input
                  placeholder="+63 917 123 4567"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-600 focus:border-red-500/50"
                />
              </div>

              {/* Address Line 1 */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">
                  Address Line 1 *
                </Label>
                <Input
                  placeholder="123 Rizal Street, Barangay Poblacion"
                  value={form.line1}
                  onChange={(e) => updateField("line1", e.target.value)}
                  className="border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-600 focus:border-red-500/50"
                />
              </div>

              {/* City + Province */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">City *</Label>
                  <Input
                    placeholder="Quezon City"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-600 focus:border-red-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">Province *</Label>
                  <Input
                    placeholder="Metro Manila"
                    value={form.province}
                    onChange={(e) => updateField("province", e.target.value)}
                    className="border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-600 focus:border-red-500/50"
                  />
                </div>
              </div>

              {/* Postal Code */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">
                  Postal Code *
                </Label>
                <Input
                  placeholder="1100"
                  value={form.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  className="border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-600 focus:border-red-500/50"
                />
              </div>

              {/* Payment Method (Placeholder) */}
              <div className="space-y-1.5 pt-1">
                <Label className="text-xs text-slate-400">Payment Method</Label>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      Stripe Secure Payment
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Powered by Stripe &middot; Coming Soon
                    </div>
                  </div>
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
              </div>

              {/* Order Totals */}
              <Separator className="bg-white/5" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shipping</span>
                  <span className="text-white">
                    {formatCurrency(shipping)}
                  </span>
                </div>
                <Separator className="bg-white/5" />
                <div className="flex justify-between text-base font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-white">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-red-600 to-orange-500 py-5 text-base font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Place Order &middot; {formatCurrency(total)}
                  </>
                )}
              </Button>

              {/* Terms */}
              <p className="text-center text-[11px] leading-relaxed text-slate-600">
                By placing this order, you agree to our terms. 90% goes to the
                artist, 10% supports Tunog Kalye Radio.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
