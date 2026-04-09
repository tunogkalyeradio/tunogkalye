"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ImageOff,
  ArrowRight,
  Heart,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface CartItem {
  id: number;
  quantity: number;
  size: string | null;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    compareAtPrice?: number | null;
    images: string;
    sizes?: string | null;
    artist: {
      bandName: string;
    };
  };
}

function formatCurrency(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getFirstImage(images: string): string | null {
  try {
    const arr = JSON.parse(images);
    if (Array.isArray(arr) && arr.length > 0) return arr[0];
  } catch {}
  return null;
}

function parseSizes(sizes: string | null | undefined): string[] {
  if (!sizes) return [];
  try {
    const arr = JSON.parse(sizes);
    if (Array.isArray(arr)) return arr;
  } catch {}
  return [];
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.cartItems || []);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (cartId: number, newQuantity: number) => {
    setUpdating(cartId);
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, quantity: newQuantity }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.deleted) {
          setCartItems((prev) => prev.filter((item) => item.id !== cartId));
        } else {
          setCartItems((prev) =>
            prev.map((item) =>
              item.id === cartId ? { ...item, ...data.cartItem } : item
            )
          );
        }
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setUpdating(null);
    }
  };

  const updateSize = async (cartId: number, size: string) => {
    setUpdating(cartId);
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, size }),
      });
      if (res.ok) {
        const data = await res.json();
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === cartId ? { ...item, ...data.cartItem } : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to update size:", error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (cartId: number) => {
    setUpdating(cartId);
    try {
      const res = await fetch(`/api/cart?id=${cartId}`, { method: "DELETE" });
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== cartId));
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setUpdating(null);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingEstimate =
    cartItems.length > 0
      ? cartItems.reduce(
          (sum, item) =>
            sum + (item.product.shippingFee || 50) * item.quantity,
          0
        )
      : 0;
  const total = subtotal + shippingEstimate;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-400" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
          My Cart
        </h1>
        <p className="mb-8 text-sm text-slate-400">
          Your cart is empty. Time to find some awesome merch!
        </p>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 text-6xl">🛒</div>
            <h2 className="text-lg font-bold text-white">Your cart is empty</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Browse merch from your favorite Filipino indie artists and support
              the community.
            </p>
            <Link href="/store" className="mt-6">
              <Button className="bg-gradient-to-r from-red-600 to-orange-500 font-bold text-white hover:from-red-500 hover:to-orange-400">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Merch
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
        My Cart
      </h1>
      <p className="mb-6 text-sm text-slate-400">
        {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {cartItems.map((item) => {
            const imageUrl = getFirstImage(item.product.images);
            const sizes = parseSizes(item.product.sizes);
            const isUpdating = updating === item.id;

            return (
              <Card
                key={item.id}
                className="overflow-hidden border-white/10 bg-[#12121a]"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link
                      href={`/store`}
                      className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5 sm:h-28 sm:w-28"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageOff className="h-6 w-6 text-slate-600" />
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link href="/store">
                          <div className="text-sm font-bold text-white hover:text-red-400 transition-colors">
                            {item.product.name}
                          </div>
                        </Link>
                        <div className="mt-0.5 text-xs text-slate-400">
                          by {item.product.artist.bandName}
                        </div>
                        {item.product.compareAtPrice &&
                          item.product.compareAtPrice > item.product.price && (
                            <Badge className="mt-2 bg-green-500/20 text-[10px] text-green-400 border-green-500/30">
                              Save{" "}
                              {Math.round(
                                ((item.product.compareAtPrice - item.product.price) /
                                  item.product.compareAtPrice) *
                                  100
                              )}
                              %
                            </Badge>
                          )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {/* Price */}
                        <div className="mr-auto">
                          <div className="text-sm font-bold text-white">
                            {formatCurrency(item.product.price)}
                          </div>
                          {item.product.compareAtPrice &&
                            item.product.compareAtPrice > item.product.price && (
                              <div className="text-xs text-slate-500 line-through">
                                {formatCurrency(item.product.compareAtPrice)}
                              </div>
                            )}
                        </div>

                        {/* Size selector */}
                        {sizes.length > 0 && (
                          <Select
                            value={item.size || ""}
                            onValueChange={(val) => updateSize(item.id, val)}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="h-8 w-[70px] border-white/10 bg-white/5 text-xs">
                              <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-[#12121a]">
                              {sizes.map((s) => (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  className="text-xs text-white focus:bg-white/10 focus:text-white"
                                >
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {/* Quantity */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={isUpdating}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                          </button>
                          <span className="flex h-8 w-8 items-center justify-center text-sm font-medium text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={isUpdating}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={isUpdating}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-20 border-white/10 bg-[#12121a]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">
                  Subtotal ({cartItems.length} items)
                </span>
                <span className="font-medium text-white">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Shipping estimate</span>
                <span className="font-medium text-white">
                  {formatCurrency(shippingEstimate)}
                </span>
              </div>
              <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-3">
                <div className="flex items-start gap-2">
                  <Heart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                  <p className="text-[11px] text-slate-400">
                    10% platform fee supports Tunog Kalye Radio. 90% goes
                    directly to artists.
                  </p>
                </div>
              </div>
              <Separator className="bg-white/5" />
              <div className="flex justify-between text-base font-bold">
                <span className="text-white">Total</span>
                <span className="text-white">{formatCurrency(total)}</span>
              </div>
              <Button className="w-full bg-gradient-to-r from-red-600 to-orange-500 py-5 font-bold text-white hover:from-red-500 hover:to-orange-400">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link href="/store" className="block">
                <Button
                  variant="outline"
                  className="w-full border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
