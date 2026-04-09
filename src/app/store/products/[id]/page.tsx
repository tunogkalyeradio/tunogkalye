import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailClient from "./product-detail-client";
import { CATEGORY_GRADIENTS } from "../../page";

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

  const [product, relatedProducts] = await Promise.all([
    getProduct(id),
    id ? getRelatedProducts(id, "", 0).catch(() => []) : Promise.resolve([]),
  ]);

  if (!product || !product.isActive) notFound();

  // Now fetch related products with correct params
  const related = product.isActive
    ? await getRelatedProducts(product.id, product.category, product.artistId)
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

  const serializedRelated = related.map((p) => ({
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
