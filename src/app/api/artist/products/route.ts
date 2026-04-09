import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// GET /api/artist/products — fetch current artist's products
export async function GET() {
  try {
    const user = await requireRole("ARTIST");

    const artistProfile = await db.artistProfile.findUnique({
      where: { userId: user.id },
    });

    if (!artistProfile) {
      return NextResponse.json({ error: "No artist profile" }, { status: 404 });
    }

    const products = await db.product.findMany({
      where: { artistId: artistProfile.id },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
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

// POST /api/artist/products — create new product
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("ARTIST");

    const artistProfile = await db.artistProfile.findUnique({
      where: { userId: user.id },
    });

    if (!artistProfile) {
      return NextResponse.json({ error: "No artist profile" }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, price, compareAtPrice, category, images, sizes, colors, stock, fulfillmentMode, shippingFee } = body;

    if (!name || !price || !category || stock === undefined) {
      return NextResponse.json(
        { error: "Name, price, category, and stock are required" },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        artistId: artistProfile.id,
        name,
        description: description || "",
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        category,
        images: images || "[]",
        sizes: sizes || null,
        colors: colors || null,
        stock: parseInt(stock, 10),
        fulfillmentMode: fulfillmentMode || "PLATFORM_DELIVERY",
        shippingFee: parseFloat(shippingFee) || 0,
      },
    });

    return NextResponse.json(product, { status: 201 });
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
