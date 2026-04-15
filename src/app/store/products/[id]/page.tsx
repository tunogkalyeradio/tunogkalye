import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailClient from "./product-detail-client";
import { CATEGORY_GRADIENTS } from "../../store-utils";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: number) {
  return db.product.findUnique({
    where: { id },
    include: {
      artist: {
        select: {
          id: true,
          bandName: true,
          genre: true,
          city: true,
          bio: true,
          isVerified: true,
          imageUrl: true,
          spotifyLink: true,
          soundcloudLink: true,
          socialLinks: true,
        },
      },
    },
  });
}

async function getRelatedProducts(productId: number, category: string, artistId: number) {
  return db.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      OR: [
        { category },
        { artistId },
      ],
    },
    include: {
      artist: {
        select: {
          id: true,
          bandName: true,
          isVerified: true,
        },
      },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);

  if (isNaN(id)) notFound();

  // Try database; show fallback if unavailable
  let product, related;
  try {
    [product, related] = await Promise.all([
      getProduct(id),
      getRelatedProducts(id, "", 0).catch(() => []),
    ]);
  } catch {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500">
          <Store className="h-10 w-10 text-white" />
        </div>
        <h1 className="mb-4 text-3xl font-bold text-white">Store Coming Soon</h1>
        <p className="mb-6 text-slate-400">This product page will be available once the marketplace is set up.</p>
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

  if (!product || !product.isActive) notFound();

  // Now fetch related products with correct params
  const relatedProducts = product.isActive
    ? await getRelatedProducts(product.id, product.category, product.artistId).catch(() => [])
    : [];

  const serializedProduct = {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    shippingFee: Number(product.shippingFee),
    images: JSON.parse(product.images || "[]"),
    sizes: product.sizes ? JSON.parse(product.sizes) : null,
    colors: product.colors ? JSON.parse(product.colors) : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    artist: product.artist
      ? {
          ...product.artist,
          imageUrl: product.artist.imageUrl || null,
          socialLinks: product.artist.socialLinks || null,
        }
      : null,
  };

  const serializedRelated = (relatedProducts || related || []).map((p) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    shippingFee: Number(p.shippingFee),
    images: JSON.parse(p.images || "[]"),
    sizes: p.sizes ? JSON.parse(p.sizes) : null,
    colors: p.colors ? JSON.parse(p.colors) : null,
    createdAt: p.createdAt.toISOString(),
    artist: p.artist
      ? { ...p.artist, imageUrl: null }
      : null,
  }));

  const gradient = CATEGORY_GRADIENTS[product.category] || "from-slate-600 to-slate-400";

  return (
    <ProductDetailClient
      product={serializedProduct}
      relatedProducts={serializedRelated}
      placeholderGradient={gradient}
    />
  );
}
