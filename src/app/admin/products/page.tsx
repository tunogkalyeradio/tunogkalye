import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import ProductsContent from "./products-content";

export default async function ProductsPage() {
  try {
    await requireRole("ADMIN");
  } catch {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-400">Not authorized. Admin access required.</p>
      </div>
    );
  }

  let products: any[] = [];
  try {
    products = await db.product.findMany({
      include: {
        artist: { select: { id: true, bandName: true } },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[ProductsPage] Error fetching products:", error);
    products = [];
  }

  const categories = [...new Set(products.map((p: any) => p.category))].sort();

  const serializedProducts = products.map((p: any) => ({
    ...p,
    createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
    artist: p.artist ? { ...p.artist } : { id: 0, bandName: "Unknown" },
  }));

  return (
    <ProductsContent products={serializedProducts} categories={categories} />
  );
}
