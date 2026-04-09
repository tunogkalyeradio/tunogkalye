"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Music,
  Mail,
  MapPin,
  Globe,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldX,
  ShoppingCart,
  Package,
  DollarSign,
  CreditCard,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ArtistDetail {
  id: number;
  bandName: string;
  realName: string;
  genre: string | null;
  city: string;
  bio: string | null;
  spotifyLink: string | null;
  soundcloudLink: string | null;
  socialLinks: string | null;
  imageUrl: string | null;
  stripeAccountId: string | null;
  stripeOnboardingComplete: boolean;
  isVerified: boolean;
  createdAt: Date;
  user: { email: string; name: string };
  products: {
    id: number;
    name: string;
    price: number;
    category: string;
    stock: number;
    isActive: boolean;
    _count: { orderItems: number };
  }[];
  _count: { orderItems: number };
  orderItems: {
    id: number;
    quantity: number;
    subtotal: number;
    artistCut: number;
    createdAt: Date;
    order: {
      id: number;
      orderNumber: string;
      status: string;
    };
  }[];
}

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ArtistDetailContent({ artist }: { artist: ArtistDetail }) {
  const [isPending, startTransition] = useTransition();
  const [verified, setVerified] = useState(artist.isVerified);

  const totalRevenue = artist.orderItems.reduce(
    (sum, item) => sum + item.artistCut,
    0
  );
  const totalSales = artist.orderItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  const toggleVerify = () => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/artists/${artist.id}/verify`, {
          method: "PATCH",
        });
        if (res.ok) {
          setVerified(!verified);
        }
      } catch {
        // silently fail
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/admin/artists"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Artists
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/20">
            <Music className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {artist.bandName}
              </h1>
              {verified ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="border-white/20 text-slate-400">
                  <XCircle className="mr-1 h-3 w-3" />
                  Unverified
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-400">{artist.realName}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {artist.user.email}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {artist.city}
              </span>
              {artist.genre && <span>Genre: {artist.genre}</span>}
            </div>
          </div>
        </div>
        <Button
          onClick={toggleVerify}
          disabled={isPending}
          variant={verified ? "outline" : "default"}
          className={
            verified
              ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
              : "bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-400"
          }
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : verified ? (
            <ShieldX className="mr-2 h-4 w-4" />
          ) : (
            <ShieldCheck className="mr-2 h-4 w-4" />
          )}
          {verified ? "Unverify Artist" : "Verify Artist"}
        </Button>
      </div>

      {/* Bio */}
      {artist.bio && (
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <p className="text-sm text-slate-300 leading-relaxed">{artist.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Links */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Links & Social</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {artist.spotifyLink && (
              <a
                href={artist.spotifyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20"
              >
                <Globe className="h-3 w-3" />
                Spotify
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
            {artist.soundcloudLink && (
              <a
                href={artist.soundcloudLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-400 hover:bg-orange-500/20"
              >
                <Globe className="h-3 w-3" />
                SoundCloud
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
          {artist.stripeAccountId && (
            <div className="mt-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-slate-400">Stripe Account:</span>
              <span className="text-xs font-mono text-slate-300">
                {artist.stripeAccountId}
              </span>
              {artist.stripeOnboardingComplete && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                  Onboarded
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                <ShoppingCart className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {artist._count.orderItems}
                </p>
                <p className="text-xs text-slate-500">Items Sold</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {formatPeso(totalRevenue)}
                </p>
                <p className="text-xs text-slate-500">Artist Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <Package className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {artist.products.length}
                </p>
                <p className="text-xs text-slate-500">Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <DollarSign className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {formatPeso(totalSales * 0.1)}
                </p>
                <p className="text-xs text-slate-500">Platform Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Products</CardTitle>
              <CardDescription>
                {artist.products.length} product(s)
              </CardDescription>
            </div>
            <Link href="/admin/products">
              <span className="text-xs font-medium text-red-400 hover:text-red-300">
                View all →
              </span>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {artist.products.length > 0 ? (
            <div className="space-y-2">
              {artist.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                      <Package className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {product.category} &middot; Stock: {product.stock} &middot;
                        {product._count.orderItems} sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      {formatPeso(product.price)}
                    </p>
                    <Badge
                      className={
                        product.isActive
                          ? "bg-green-500/20 text-green-400 border-green-500/30 text-[10px]"
                          : "bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"
                      }
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              No products yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Order Items */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Sales</CardTitle>
          <CardDescription>Last orders for this artist&apos;s products</CardDescription>
        </CardHeader>
        <CardContent>
          {artist.orderItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-2 text-left font-medium text-slate-500">
                      Order
                    </th>
                    <th className="pb-2 text-right font-medium text-slate-500">
                      Qty
                    </th>
                    <th className="pb-2 text-right font-medium text-slate-500">
                      Subtotal
                    </th>
                    <th className="pb-2 text-right font-medium text-slate-500">
                      Artist Cut
                    </th>
                    <th className="pb-2 text-left font-medium text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {artist.orderItems.slice(0, 20).map((item) => (
                    <tr key={item.id} className="hover:bg-white/5">
                      <td className="py-2">
                        <Link
                          href={`/admin/orders/${item.order.id}`}
                          className="font-medium text-white hover:text-red-400"
                        >
                          {item.order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2 text-right text-slate-400">
                        {item.quantity}
                      </td>
                      <td className="py-2 text-right text-white">
                        {formatPeso(item.subtotal)}
                      </td>
                      <td className="py-2 text-right text-green-400">
                        {formatPeso(item.artistCut)}
                      </td>
                      <td className="py-2 text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString("en-PH", {
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
            <p className="py-8 text-center text-sm text-slate-500">
              No sales yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;

  const artist = await db.artistProfile.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      user: { select: { email: true, name: true } },
      products: {
        select: {
          id: true,
          name: true,
          price: true,
          category: true,
          stock: true,
          isActive: true,
          _count: { select: { orderItems: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { orderItems: true } },
      orderItems: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          order: { select: { id: true, orderNumber: true, status: true } },
        },
      },
    },
  });

  if (!artist) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/artists"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Artists
        </Link>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="py-16 text-center">
            <p className="text-slate-400">Artist not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const serializedArtist = {
    ...artist,
    createdAt: new Date(artist.createdAt),
    products: artist.products.map((p) => ({ ...p })),
    orderItems: artist.orderItems.map((oi) => ({
      ...oi,
      createdAt: new Date(oi.createdAt),
      order: { ...oi.order },
    })),
  };

  return <ArtistDetailContent artist={serializedArtist} />;
}
