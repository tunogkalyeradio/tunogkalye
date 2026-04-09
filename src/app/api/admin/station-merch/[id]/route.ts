import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// GET /api/admin/station-merch/[id] — get single station product
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const product = await db.product.findFirst({
      where: { id: productId, isStation: true },
      include: {
        artist: { select: { id: true, bandName: true } },
        _count: { select: { orderItems: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    console.error("Station merch get error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PATCH /api/admin/station-merch/[id] — update station product
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existing = await db.product.findFirst({
      where: { id: productId, isStation: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      description,
      price,
      compareAtPrice,
      category,
      productType,
      images,
      sizes,
      colors,
      stock,
      shippingFee,
      isActive,
      downloadUrl,
      fileSize,
      fileFormat,
    } = body as {
      name?: string;
      description?: string;
      price?: number;
      compareAtPrice?: number | null;
      category?: string;
      productType?: string;
      images?: string;
      sizes?: string | null;
      colors?: string | null;
      stock?: number;
      shippingFee?: number;
      isActive?: boolean;
      downloadUrl?: string | null;
      fileSize?: string | null;
      fileFormat?: string | null;
    };

    const product = await db.product.update({
      where: { id: productId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(String(price)) }),
        ...(compareAtPrice !== undefined && {
          compareAtPrice: compareAtPrice ? parseFloat(String(compareAtPrice)) : null,
        }),
        ...(category !== undefined && { category }),
        ...(productType !== undefined && {
          productType: productType as "PHYSICAL" | "DIGITAL",
        }),
        ...(images !== undefined && { images }),
        ...(sizes !== undefined && { sizes }),
        ...(colors !== undefined && { colors }),
        ...(stock !== undefined && { stock: parseInt(String(stock), 10) }),
        ...(shippingFee !== undefined && {
          shippingFee: parseFloat(String(shippingFee)),
        }),
        ...(isActive !== undefined && { isActive }),
        ...(downloadUrl !== undefined && { downloadUrl }),
        ...(fileSize !== undefined && { fileSize }),
        ...(fileFormat !== undefined && { fileFormat }),
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    console.error("Station merch update error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/station-merch/[id] — delete station product
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existing = await db.product.findFirst({
      where: { id: productId, isStation: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await db.product.delete({ where: { id: productId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    console.error("Station merch delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
