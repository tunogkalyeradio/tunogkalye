"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  ShoppingCart,
  Eye,
  Star,
  MapPin,
  Music2,
  CheckCircle2,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import {
  CATEGORIES,
  CATEGORY_GRADIENTS,
  type StoreProduct,
  type FeaturedArtist,
} from "./store-utils";

interface StorePageClientProps {
  products: StoreProduct[];
  featuredArtists: FeaturedArtist[];
  isLoggedIn: boolean;
}

function formatPrice(price: number): string {
  return `₱${price.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;
}

function getDiscountPercent(price: number, compareAt: number): number {
  if (compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export default function StorePageClient({
  products,
  featuredArtists,
  isLoggedIn,
}: StorePageClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [cartCount, setCartCount] = useState(0);

  // Fetch cart count for logged-in users
  const fetchCartCount = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch("/api/store/cart/count");
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.count || 0);
      }
    } catch {
      // ignore
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.artist?.bandName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Category
    if (category !== "All") {
      filtered = filtered.filter((p) => p.category === category);
    }

    // Sort
    switch (sort) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        // already sorted by newest from server
        break;
    }

    return filtered;
  }, [products, search, category, sort]);

  const handleAddToCart = async (productId: number) => {
    try {
      const res = await fetch("/api/store/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.ok) {
        const data = await res.json();
        setCartCount(data.cartCount || cartCount + 1);
      } else {
        const data = await res.json();
        if (data.redirectToLogin) {
          window.location.href = `/auth/login?callbackUrl=/store`;
        }
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/80 via-[#0a0a0f]/90 to-orange-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-orange-500/5" />
        <div className="relative z-10 px-6 py-14 sm:px-12 sm:py-20 text-center">
          <Badge className="mb-4 border-red-500/30 bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400 backdrop-blur-sm">
            <ShoppingBag className="mr-1 h-3 w-3" /> OFFICIAL MERCH
          </Badge>
          <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            TUNOG KALYE{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              MERCH
            </span>
          </h1>
          <p className="mx-auto mb-2 max-w-xl text-lg text-slate-300">
            Support Filipino Indie Artists. Every purchase counts.
          </p>
          <p className="mx-auto max-w-md text-sm text-slate-500">
            90% goes directly to the artist. 10% supports Tunog Kalye Radio.
          </p>
        </div>
      </section>

      {/* FEATURED ARTISTS */}
      {featuredArtists.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Featured Artists
            </h2>
            <span className="text-xs text-slate-500">
              {featuredArtists.length} artists
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {featuredArtists.map((artist) => (
              <Link
                key={artist.id}
                href={`/store/artist/${artist.id}`}
                className="group"
              >
                <Card className="border-white/10 bg-[#12121a] transition-all duration-300 hover:border-purple-500/30 hover:bg-[#14141f]">
                  <CardContent className="p-4 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-lg font-bold text-white transition-transform group-hover:scale-110">
                      {artist.bandName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <span className="truncate text-xs font-bold text-white">
                        {artist.bandName}
                      </span>
                      {artist.isVerified && (
                        <CheckCircle2 className="h-3 w-3 shrink-0 fill-blue-400 text-white" />
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-slate-500">
                      <MapPin className="h-2.5 w-2.5" />
                      <span className="truncate">{artist.city}</span>
                    </div>
                    {artist.genre && (
                      <div className="mt-1.5">
                        <Badge
                          variant="outline"
                          className="border-purple-500/30 bg-purple-500/10 text-[10px] text-purple-400"
                        >
                          <Music2 className="mr-0.5 h-2.5 w-2.5" />
                          {artist.genre}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FILTERS & SORT */}
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search merch, artists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none rounded-lg border border-white/10 bg-[#12121a] px-4 py-2 pr-8 text-sm text-slate-300 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                category === cat
                  ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/20"
                  : "border border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID */}
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
                  {/* Image */}
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

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                        <Eye className="h-4 w-4 text-white" />
                        <span className="text-sm font-medium text-white">
                          Quick View
                        </span>
                      </div>
                    </div>

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <Badge className="absolute left-2 top-2 border-0 bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                        -{discount}%
                      </Badge>
                    )}

                    {/* Category Badge */}
                    <Badge
                      variant="outline"
                      className="absolute right-2 top-2 border-white/20 bg-black/50 text-[10px] text-white backdrop-blur-sm"
                    >
                      {product.category}
                    </Badge>
                  </Link>

                  {/* Content */}
                  <CardContent className="p-4">
                    <Link
                      href={`/store/products/${product.id}`}
                      className="block"
                    >
                      <h3 className="mb-1 text-sm font-bold text-white transition-colors hover:text-red-400 line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    {product.artist && (
                      <Link
                        href={`/store/artist/${product.artist.id}`}
                        className="mb-2 flex items-center gap-1"
                      >
                        <span className="truncate text-xs text-slate-500 hover:text-purple-400 transition-colors">
                          {product.artist.bandName}
                        </span>
                        {product.artist.isVerified && (
                          <CheckCircle2 className="h-3 w-3 shrink-0 fill-blue-400 text-white" />
                        )}
                      </Link>
                    )}

                    {/* Price */}
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

                    {/* Stock indicator */}
                    {product.stock <= 5 && product.stock > 0 && (
                      <p className="mb-2 text-[10px] font-medium text-amber-400">
                        Only {product.stock} left!
                      </p>
                    )}

                    {/* Add to Cart */}
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
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#12121a] px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <ShoppingBag className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">
              {search || category !== "All"
                ? "No merch found"
                : "No merch yet"}
            </h3>
            <p className="mb-4 max-w-sm text-sm text-slate-500">
              {search || category !== "All"
                ? "Try adjusting your search or filters."
                : "Check back soon! Filipino indie artists are setting up their shops."}
            </p>
            {(search || category !== "All") && (
              <Button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                variant="outline"
                className="border-white/20 text-slate-300 hover:bg-white/10"
              >
                Clear Filters
              </Button>
            )}
            {!search && category === "All" && (
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-white/20 text-slate-300 hover:bg-white/10"
                >
                  Back to Hub
                </Button>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* REVENUE TRANSPARENCY */}
      <section className="rounded-2xl border border-white/10 bg-[#12121a] p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Star className="h-6 w-6 text-amber-400" />
          <h3 className="text-lg font-bold text-white">
            Revenue Transparency
          </h3>
          <p className="max-w-md text-sm text-slate-400">
            Every purchase supports Filipino indie artists directly.{" "}
            <span className="font-bold text-white">90%</span> goes to the
            artist. <span className="font-bold text-white">10%</span> supports
            Tunog Kalye Radio to keep the music playing.
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-black text-green-400">90%</div>
              <div className="text-xs text-slate-500">Artist</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-black text-red-400">10%</div>
              <div className="text-xs text-slate-500">Platform</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
