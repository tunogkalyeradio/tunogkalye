import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductForm from "../../product-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const user = await requireRole("ARTIST");
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) notFound();

  const artistProfile = await db.artistProfile.findUnique({
    where: { userId: user.id },
  });

  if (!artistProfile) notFound();

  const product = await db.product.findFirst({
    where: { id: productId, artistId: artistProfile.id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      compareAtPrice: true,
      category: true,
      images: true,
      sizes: true,
      colors: true,
      stock: true,
      fulfillmentMode: true,
      shippingFee: true,
    },
  });

  if (!product) notFound();

  return <ProductForm product={product} />;
}
