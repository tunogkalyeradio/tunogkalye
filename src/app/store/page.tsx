import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-utils";
import StorePageClient from "./store-page-client";
import Link from "next/link";
import { ShoppingBag, Store } from "lucide-react";
import { CATEGORIES, CATEGORY_GRADIENTS, type StoreProduct, type FeaturedArtist } from "./store-utils";

export { CATEGORIES, CATEGORY_GRADIENTS, type StoreProduct, type FeaturedArtist };

export async function getProducts() {
  return db.product.findMany({
    where: { isActive: true },
    include: {
      artist: {
        select: {
          id: true,
          bandName: true,
          genre: true,
          city: true,
          isVerified: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeaturedArtists() {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { artistId: true },
    distinct: ["artistId"],
    take: 6,
  });

  const artistIds = products.map((p) => p.artistId);

  if (artistIds.length === 0) return [];

  return db.artistProfile.findMany({
    where: { id: { in: artistIds } },
    select: {
      id: true,
      bandName: true,
      genre: true,
      city: true,
      isVerified: true,
      imageUrl: true,
    },
  });
}

function StoreComingSoon() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500">
        <Store className="h-12 w-12 text-white" />
      </div>
      <h1 className="mb-4 text-4xl font-bold text-white">
        Merch Store <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Coming Soon</span>
      </h1>
      <p className="mb-2 max-w-md text-lg text-slate-300">
        Our artist marketplace is being set up! Independent Filipino artists will soon be able to sell their merch here.
      </p>
      <p className="mb-8 text-sm text-slate-500">
        90% goes directly to the artist. 10% supports the Kanto Fund.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-6 py-3 font-semibold text-white transition-transform hover:scale-105"
        >
          <ShoppingBag className="h-5 w-5" />
          Back to Hub
        </Link>
      </div>
    </div>
  );
}

export default async function StorePage() {
  // Try to fetch from database; show "coming soon" if unavailable
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let artists: Awaited<ReturnType<typeof getFeaturedArtists>> = [];
  let session = null;
  let dbAvailable = false;

  try {
    [products, artists, session] = await Promise.all([
      getProducts(),
      getFeaturedArtists(),
      getSession().catch(() => null),
    ]);
    dbAvailable = true;
  } catch {
    dbAvailable = false;
  }

  if (!dbAvailable) {
    return <StoreComingSoon />;
  }

  const serializedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    shippingFee: Number(p.shippingFee),
    images: JSON.parse(p.images || "[]"),
    sizes: p.sizes ? JSON.parse(p.sizes) : null,
    colors: p.colors ? JSON.parse(p.colors) : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    artist: p.artist
      ? {
          ...p.artist,
          imageUrl: p.artist.imageUrl || null,
        }
      : null,
  }));

  const serializedArtists = artists.map((a) => ({
    ...a,
    imageUrl: a.imageUrl || null,
  }));

  return (
    <StorePageClient
      products={serializedProducts}
      featuredArtists={serializedArtists}
      isLoggedIn={!!session?.user?.id}
    />
  );
}


