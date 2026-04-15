"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ShoppingCart,
  Star,
  MapPin,
  CheckCircle2,
  Music2,
  ArrowLeft,
  Minus,
  Plus,
  Truck,
  Package,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { CATEGORY_GRADIENTS } from "../../store-utils";

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
  artistId: number;
  artist: {
    id: number;
    bandName: string;
    genre: string | null;
    city: string;
    bio: string | null;
    isVerified: boolean;
    imageUrl: string | null;
    spotifyLink: string | null;
    soundcloudLink: string | null;
    socialLinks: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  images: string[];
  stock: number;
  artist: { id: number; bandName: string; isVerified: boolean } | null;
}

interface ProductDetailClientProps {
  product: ProductData;
  relatedProducts: RelatedProduct[];
  placeholderGradient: string;
}

function formatPrice(price: number): string {
  return `₱${price.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;
}

function getDiscountPercent(price: number, compareAt: number): number {
  if (compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  placeholderGradient,
}: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors && product.colors.length > 0 ? product.colors[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  const discount = product.compareAtPrice
    ? getDiscountPercent(product.price, product.compareAtPrice)
    : 0;

  const artistEarnings = Math.round(product.price * 0.9);
  const platformRevenue = Math.round(product.price * 0.1);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const res = await fetch("/api/store/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          size: selectedSize,
        }),
      });

      if (res.ok) {
        setAddedMessage(true);
        setTimeout(() => setAddedMessage(false), 3000);
      } else {
        const data = await res.json();
        if (data.redirectToLogin) {
          window.location.href = `/auth/login?callbackUrl=/store/products/${product.id}`;
        }
      }
    } catch {
      // ignore
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = () => {
    // Add to cart first, then redirect to checkout
    handleAddToCart();
    // For now redirect to dashboard cart
    setTimeout(() => {
      window.location.href = "/dashboard/cart";
    }, 500);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/store" className="flex items-center gap-1 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Store
        </Link>
        <span>/</span>
        <span className="truncate text-slate-400">{product.name}</span>
      </div>

      {/* PRODUCT MAIN */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Images */}
        <div className="flex flex-col gap-4">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10">
            {(product.images && product.images.length > 0) ? (
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${placeholderGradient}`}
              >
                <ShoppingBag className="h-20 w-20 text-white/20" />
              </div>
            )}

            {/* Discount Badge */}
            {discount > 0 && (
              <Badge className="absolute left-4 top-4 border-0 bg-green-500 px-3 py-1 text-sm font-bold text-white">
                -{discount}% OFF
              </Badge>
            )}

            {/* Stock Badge */}
            {product.stock <= 5 && product.stock > 0 && (
              <Badge className="absolute right-4 top-4 border-amber-500/30 bg-amber-500/20 text-xs font-bold text-amber-400">
                Only {product.stock} left
              </Badge>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === idx
                      ? "border-red-500"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col gap-6">
          {/* Category + Name */}
          <div>
            <Badge
              variant="outline"
              className="mb-2 border-white/10 bg-white/5 text-xs text-slate-400"
            >
              {product.category}
            </Badge>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              {product.name}
            </h1>
          </div>

          {/* Artist */}
          {product.artist && (
            <Link
              href={`/store/artist/${product.artist.id}`}
              className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-white/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-sm font-bold text-white">
                {product.artist.bandName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-white">
                    {product.artist.bandName}
                  </span>
                  {product.artist.isVerified && (
                    <CheckCircle2 className="h-3.5 w-3.5 fill-blue-400 text-white" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" />
                  {product.artist.city}
                  {product.artist.genre && (
                    <>
                      <span className="text-slate-700">&middot;</span>
                      {product.artist.genre}
                    </>
                  )}
                </div>
              </div>
              <ExternalLink className="ml-auto h-3.5 w-3.5 text-slate-600" />
            </Link>
          )}

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-white">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="mb-0.5 text-lg text-slate-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            {discount > 0 && (
              <Badge className="mb-1 border-0 bg-green-500/20 text-xs font-bold text-green-400">
                Save {formatPrice(product.compareAtPrice! - product.price)}
              </Badge>
            )}
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Size
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-all ${
                      selectedSize === size
                        ? "border-red-500 bg-red-500/20 text-white"
                        : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Color:{" "}
                <span className="text-white">{selectedColor || "Select"}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-all ${
                      selectedColor === color
                        ? "border-red-500 bg-red-500/20 text-white"
                        : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-white/20"
                      style={{
                        backgroundColor:
                          color.toLowerCase() === "black"
                            ? "#000"
                            : color.toLowerCase() === "white"
                              ? "#fff"
                              : color.toLowerCase(),
                      }}
                    />
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Quantity
            </label>
            <div className="flex items-center gap-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-l-lg border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex h-10 w-14 items-center justify-center border-y border-white/10 bg-white/5 text-sm font-bold text-white">
                {quantity}
              </div>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                disabled={quantity >= product.stock}
                className="flex h-10 w-10 items-center justify-center rounded-r-lg border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
              {product.stock > 0 && (
                <span className="ml-3 text-xs text-slate-500">
                  {product.stock} available
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || isAdding}
              size="lg"
              className="h-12 bg-gradient-to-r from-red-600 to-orange-500 text-base font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400 disabled:opacity-40"
            >
              {isAdding ? (
                "Adding..."
              ) : addedMessage ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock <= 0 ? "Sold Out" : "Add to Cart"}
                </>
              )}
            </Button>
            {product.stock > 0 && (
              <Button
                onClick={handleBuyNow}
                variant="outline"
                size="lg"
                className="h-12 border-white/20 bg-white/5 text-base font-bold text-white hover:bg-white/10"
              >
                Buy Now
              </Button>
            )}
          </div>

          {/* Shipping Info */}
          <div className="rounded-xl border border-white/10 bg-[#12121a] p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 shrink-0 text-slate-400" />
              <div>
                <div className="text-sm font-medium text-white">
                  Shipping Fee:{" "}
                  {product.shippingFee > 0
                    ? formatPrice(product.shippingFee)
                    : "Free Shipping"}
                </div>
                <div className="text-xs text-slate-500">
                  {product.fulfillmentMode === "ARTIST_SELF_DELIVERY"
                    ? `Fulfilled by ${product.artist?.bandName || "the artist"}`
                    : "Fulfilled by Tunog Kalye"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 shrink-0 text-slate-400" />
              <div className="text-xs text-slate-500">
                Orders are processed within 1-3 business days
              </div>
            </div>
          </div>

          {/* Revenue Transparency */}
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <div className="flex items-start gap-3">
              <Star className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
              <div>
                <div className="text-sm font-bold text-white">
                  Revenue Transparency
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  <span className="font-bold text-green-400">
                    90%
                  </span>{" "}
                  ({formatPrice(artistEarnings)}) goes directly to{" "}
                  {product.artist?.bandName || "the artist"}.{" "}
                  <span className="font-bold text-red-400">10%</span>{" "}
                  ({formatPrice(platformRevenue)}) supports Tunog Kalye Radio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ARTIST INFO CARD */}
      {product.artist && (
        <Card className="border-purple-500/20 bg-[#12121a]">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-xl font-bold text-white">
                  {product.artist.bandName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {product.artist.bandName}
                    </h3>
                    {product.artist.isVerified && (
                      <CheckCircle2 className="h-4 w-4 fill-blue-400 text-white" />
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Music2 className="h-3.5 w-3.5" />
                      {product.artist.genre || "Various"}
                    </span>
                    <span className="text-slate-700">&middot;</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {product.artist.city}
                    </span>
                  </div>
                  {product.artist.bio && (
                    <p className="mt-2 max-w-lg text-sm text-slate-400 line-clamp-2">
                      {product.artist.bio}
                    </p>
                  )}
                  {/* Social Links */}
                  <div className="mt-2 flex gap-2">
                    {product.artist.spotifyLink && (
                      <a
                        href={product.artist.spotifyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-400 hover:text-green-300"
                      >
                        Spotify ↗
                      </a>
                    )}
                    {product.artist.soundcloudLink && (
                      <a
                        href={product.artist.soundcloudLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-orange-400 hover:text-orange-300"
                      >
                        SoundCloud ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <Link href={`/store/artist/${product.artist.id}`}>
                <Button
                  variant="outline"
                  className="border-purple-500/30 bg-purple-500/10 text-sm text-purple-400 hover:bg-purple-500/20"
                >
                  View All Products
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DESCRIPTION */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardContent className="p-6">
          <h3 className="mb-3 text-lg font-bold text-white">Description</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-400">
            {product.description}
          </p>
        </CardContent>
      </Card>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="mb-6 text-xl font-bold tracking-tight">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((rp) => {
              const gradient =
                CATEGORY_GRADIENTS[rp.category] ||
                "from-slate-600 to-slate-400";
              const imageUrl =
                rp.images && rp.images.length > 0 ? rp.images[0] : null;
              const rpDiscount = rp.compareAtPrice
                ? getDiscountPercent(rp.price, rp.compareAtPrice)
                : 0;

              return (
                <Link
                  key={rp.id}
                  href={`/store/products/${rp.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden border-white/10 bg-[#12121a] transition-all duration-300 hover:border-white/20 hover:shadow-xl">
                    <div className="relative aspect-square overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={rp.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}
                        >
                          <ShoppingBag className="h-10 w-10 text-white/20" />
                        </div>
                      )}
                      {rpDiscount > 0 && (
                        <Badge className="absolute left-2 top-2 border-0 bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          -{rpDiscount}%
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h4 className="truncate text-xs font-bold text-white">
                        {rp.name}
                      </h4>
                      {rp.artist && (
                        <p className="truncate text-[10px] text-slate-500">
                          {rp.artist.bandName}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">
                          {formatPrice(rp.price)}
                        </span>
                        {rp.compareAtPrice && (
                          <span className="text-[10px] text-slate-500 line-through">
                            {formatPrice(rp.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

