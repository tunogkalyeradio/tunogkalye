import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-utils";
import StorePageClient from "./store-page-client";

// Category gradient colors for placeholder images
export const CATEGORY_GRADIENTS: Record<string, string> = {
  "T-Shirt": "from-red-600 to-orange-500",
  Hoodie: "from-purple-600 to-pink-500",
  Longsleeve: "from-blue-600 to-cyan-500",
  Cap: "from-amber-500 to-yellow-400",
  Sticker: "from-green-500 to-emerald-400",
  Poster: "from-rose-500 to-pink-400",
  Digital: "from-violet-600 to-purple-400",
};

export const CATEGORIES = [
  "All",
  "T-Shirt",
  "Hoodie",
  "Longsleeve",
  "Cap",
  "Sticker",
  "Poster",
  "Digital",
];

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

export default async function StorePage() {
  const [products, artists, session] = await Promise.all([
    getProducts(),
    getFeaturedArtists(),
    getSession(),
  ]);

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

export type StoreProduct = Awaited<ReturnType<typeof getProducts>>[number] & {
  price: number;
  compareAtPrice: number | null;
  shippingFee: number;
  images: string[];
  sizes: string[] | null;
  colors: string[] | null;
  createdAt: string;
  updatedAt: string;
  artist: {
    id: number;
    bandName: string;
    genre: string | null;
    city: string;
    isVerified: boolean;
    imageUrl: string | null;
  } | null;
};

export type FeaturedArtist = {
  id: number;
  bandName: string;
  genre: string | null;
  city: string;
  isVerified: boolean;
  imageUrl: string | null;
};
