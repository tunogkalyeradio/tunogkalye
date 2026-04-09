import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ArtistStoreClient from "./artist-store-client";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArtistStorePage({ params }: PageProps) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);

  if (isNaN(id)) notFound();

  // Try database; show fallback if unavailable
  let artist, products;
  try {
    artist = await db.artistProfile.findUnique({
      where: { id },
      select: {
        id: true,
        bandName: true,
        realName: true,
        genre: true,
        city: true,
        bio: true,
        isVerified: true,
        imageUrl: true,
        spotifyLink: true,
        soundcloudLink: true,
        socialLinks: true,
      },
    });

    if (!artist) notFound();

    products = await db.product.findMany({
      where: { artistId: id, isActive: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500">
          <Store className="h-10 w-10 text-white" />
        </div>
        <h1 className="mb-4 text-3xl font-bold text-white">Store Coming Soon</h1>
        <p className="mb-6 text-slate-400">This artist&apos;s store will be available once the marketplace is set up.</p>
        <Link
          href="/store"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-6 py-3 font-semibold text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Store
        </Link>
      </div>
    );
  }

  const serializedArtist = {
    ...artist,
    imageUrl: artist.imageUrl || null,
    socialLinks: artist.socialLinks || null,
  };

  const serializedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    shippingFee: Number(p.shippingFee),
    images: JSON.parse(p.images || "[]"),
    sizes: p.sizes ? JSON.parse(p.sizes) : null,
    colors: p.colors ? JSON.parse(p.colors) : null,
    stock: p.stock,
    productType: p.productType,
    isStation: p.isStation,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <ArtistStoreClient
      artist={serializedArtist}
      products={serializedProducts}
    />
  );
}
