import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/artist/products/:id — fetch single product
export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const user = await requireRole("ARTIST");
    const { id } = await ctx.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const artistProfile = await db.artistProfile.findUnique({
      where: { userId: user.id },
    });

    if (!artistProfile) {
      return NextResponse.json({ error: "No artist profile" }, { status: 404 });
    }

    const product = await db.product.findFirst({
      where: { id: productId, artistId: artistProfile.id },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/artist/products/:id — update product
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const user = await requireRole("ARTIST");
    const { id } = await ctx.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const artistProfile = await db.artistProfile.findUnique({
      where: { userId: user.id },
    });

    if (!artistProfile) {
      return NextResponse.json({ error: "No artist profile" }, { status: 404 });
    }

    // Verify ownership
    const existing = await db.product.findFirst({
      where: { id: productId, artistId: artistProfile.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, price, compareAtPrice, category, images, sizes, colors, stock, fulfillmentMode, shippingFee, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (compareAtPrice !== undefined) updateData.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : null;
    if (category !== undefined) updateData.category = category;
    if (images !== undefined) updateData.images = images;
    if (sizes !== undefined) updateData.sizes = sizes;
    if (colors !== undefined) updateData.colors = colors;
    if (stock !== undefined) updateData.stock = parseInt(stock, 10);
    if (fulfillmentMode !== undefined) updateData.fulfillmentMode = fulfillmentMode;
    if (shippingFee !== undefined) updateData.shippingFee = parseFloat(shippingFee) || 0;
    if (isActive !== undefined) updateData.isActive = isActive;

    const product = await db.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/artist/products/:id — delete product
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const user = await requireRole("ARTIST");
    const { id } = await ctx.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const artistProfile = await db.artistProfile.findUnique({
      where: { userId: user.id },
    });

    if (!artistProfile) {
      return NextResponse.json({ error: "No artist profile" }, { status: 404 });
    }

    // Verify ownership
    const existing = await db.product.findFirst({
      where: { id: productId, artistId: artistProfile.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await db.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
