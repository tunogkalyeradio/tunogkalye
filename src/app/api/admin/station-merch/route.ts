import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// GET /api/admin/station-merch — list all station products
export async function GET() {
  try {
    await requireRole("ADMIN");

    const products = await db.product.findMany({
      where: { isStation: true },
      include: {
        artist: { select: { id: true, bandName: true } },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Station merch fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch station products" },
      { status: 500 }
    );
  }
}

// POST /api/admin/station-merch — create a new station product
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("ADMIN");

    // Find or create a system artist profile for station merch
    let stationArtist = await db.artistProfile.findFirst({
      where: { bandName: "Tunog Kalye Radio" },
    });

    if (!stationArtist) {
      stationArtist = await db.artistProfile.create({
        data: {
          userId: user.id,
          bandName: "Tunog Kalye Radio",
          realName: "TKR Official",
          city: "Surrey, BC",
          storeStatus: "APPROVED",
          isVerified: true,
        },
      });
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
      downloadUrl,
      fileSize,
      fileFormat,
    } = body as {
      name: string;
      description: string;
      price: number;
      compareAtPrice?: number;
      category: string;
      productType: string;
      images: string;
      sizes?: string;
      colors?: string;
      stock: number;
      shippingFee?: number;
      downloadUrl?: string;
      fileSize?: string;
      fileFormat?: string;
    };

    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: "Name, description, price, and category are required" },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        artistId: stationArtist.id,
        name,
        description,
        price: parseFloat(String(price)),
        compareAtPrice: compareAtPrice ? parseFloat(String(compareAtPrice)) : null,
        category,
        productType: (productType as "PHYSICAL" | "DIGITAL") || "PHYSICAL",
        images: images || "[]",
        sizes: sizes || null,
        colors: colors || null,
        stock: parseInt(String(stock), 10) || 0,
        shippingFee: shippingFee ? parseFloat(String(shippingFee)) : 0,
        isStation: true,
        downloadUrl: downloadUrl || null,
        fileSize: fileSize || null,
        fileFormat: fileFormat || null,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Station merch create error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
