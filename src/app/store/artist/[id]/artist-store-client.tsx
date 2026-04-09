"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Music2,
  MapPin,
  ShoppingBag,
  ShoppingCart,
  Eye,
  ExternalLink,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { CATEGORY_GRADIENTS } from "../../page";

interface ArtistData {
  id: number;
  bandName: string;
  realName: string;
  genre: string | null;
  city: string;
  bio: string | null;
  isVerified: boolean;
  imageUrl: string | null;
  spotifyLink: string | null;
  soundcloudLink: string | null;
  socialLinks: string | null;
}

interface ProductData {
  id: number;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  images: string[];
  sizes: string[] | null;
  colors: string[] | null;
  stock: number;
  fulfillmentMode: string;
  shippingFee: number;
  createdAt: string;
  updatedAt: string;
}

interface ArtistStoreClientProps {
  artist: ArtistData;
  products: ProductData[];
}

function formatPrice(price: number): string {
  return `₱${price.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;
}

function getDiscountPercent(price: number, compareAt: number): number {
  if (compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export default function ArtistStoreClient({
  artist,
  products,
}: ArtistStoreClientProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [products, search, sortBy]);

  const handleAddToCart = async (productId: number) => {
    try {
      const res = await fetch("/api/store/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.redirectToLogin) {
          window.location.href = `/auth/login?callbackUrl=/store/artist/${artist.id}`;
        }
      }
    } catch {
      // ignore
    }
  };

  // Parse social links
  let socialLinks: Record<string, string> = {};
  if (artist.socialLinks) {
    try {
      socialLinks = JSON.parse(artist.socialLinks);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Back Link */}
      <Link
        href="/store"
        className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to All Merch
      </Link>

      {/* Artist Header */}
      <div className="rounded-2xl border border-purple-500/20 bg-[#12121a] overflow-hidden">
        <div className="relative h-32 sm:h-40 bg-gradient-to-br from-purple-950/60 via-[#12121a] to-blue-950/40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-blue-500/5" />
        </div>
        <div className="relative px-6 pb-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5 -mt-10 sm:-mt-12">
              {/* Avatar */}
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-[#12121a] bg-gradient-to-br from-purple-600 to-blue-500 text-3xl font-black text-white shadow-xl">
                {artist.bandName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    {artist.bandName}
                  </h1>
                  {artist.isVerified && (
                    <CheckCircle2 className="h-5 w-5 fill-blue-400 text-white" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Music2 className="h-4 w-4 text-purple-400" />
                    {artist.genre || "Various Genres"}
                  </span>
                  <span className="text-slate-700">&middot;</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {artist.city}
                  </span>
                  <span className="text-slate-700">&middot;</span>
                  <span>{products.length} products</span>
                </div>
                {artist.bio && (
                  <p className="max-w-xl text-sm text-slate-500 line-clamp-2">
                    {artist.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              {artist.spotifyLink && (
                <a
                  href={artist.spotifyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-green-400 transition-colors hover:border-green-500/30 hover:bg-green-500/10"
                >
                  <ExternalLink className="h-3 w-3" />
                  Spotify
                </a>
              )}
              {artist.soundcloudLink && (
                <a
                  href={artist.soundcloudLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-orange-400 transition-colors hover:border-orange-500/30 hover:bg-orange-500/10"
                >
                  <ExternalLink className="h-3 w-3" />
                  SoundCloud
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-blue-400 transition-colors hover:border-blue-500/30 hover:bg-blue-500/10"
                >
                  <ExternalLink className="h-3 w-3" />
                  Facebook
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-pink-400 transition-colors hover:border-pink-500/30 hover:bg-pink-500/10"
                >
                  <ExternalLink className="h-3 w-3" />
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Sort */}
      {products.length > 3 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Star className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search this artist's merch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#12121a] px-3 py-2 text-sm text-slate-300 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const discount = product.compareAtPrice
              ? getDiscountPercent(product.price, product.compareAtPrice)
              : 0;
            const gradient =
              CATEGORY_GRADIENTS[product.category] ||
              "from-slate-600 to-slate-400";
            const imageUrl =
              product.images && product.images.length > 0
                ? product.images[0]
                : null;

            return (
              <Card
                key={product.id}
                className="group overflow-hidden border-white/10 bg-[#12121a] transition-all duration-300 hover:border-white/20 hover:shadow-xl"
              >
                <Link
                  href={`/store/products/${product.id}`}
                  className="relative block aspect-square overflow-hidden"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}
                    >
                      <ShoppingBag className="h-12 w-12 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                      <Eye className="h-4 w-4 text-white" />
                      <span className="text-sm font-medium text-white">
                        Quick View
                      </span>
                    </div>
                  </div>
                  {discount > 0 && (
                    <Badge className="absolute left-2 top-2 border-0 bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                      -{discount}%
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="absolute right-2 top-2 border-white/20 bg-black/50 text-[10px] text-white backdrop-blur-sm"
                  >
                    {product.category}
                  </Badge>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/store/products/${product.id}`}>
                    <h3 className="mb-1 text-sm font-bold text-white hover:text-red-400 line-clamp-1 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-lg font-bold text-white">
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-xs text-slate-500 line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  {product.stock <= 5 && product.stock > 0 && (
                    <p className="mb-2 text-[10px] font-medium text-amber-400">
                      Only {product.stock} left!
                    </p>
                  )}
                  <Button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stock <= 0}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400 disabled:opacity-40"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {product.stock <= 0 ? "Sold Out" : "Add to Cart"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#12121a] px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
            <ShoppingBag className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-white">
            {search ? "No merch found" : "No merch available yet"}
          </h3>
          <p className="mb-4 text-sm text-slate-500">
            {search
              ? "Try a different search term."
              : `${artist.bandName} hasn't added any products yet. Check back soon!`}
          </p>
          {search && (
            <Button
              onClick={() => setSearch("")}
              variant="outline"
              className="border-white/20 text-slate-300 hover:bg-white/10"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
