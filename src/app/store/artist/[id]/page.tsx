import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ArtistStoreClient from "./artist-store-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArtistStorePage({ params }: PageProps) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);

  if (isNaN(id)) notFound();

  const artist = await db.artistProfile.findUnique({
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

  const products = await db.product.findMany({
    where: { artistId: id, isActive: true },
    orderBy: { createdAt: "desc" },
  });

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
