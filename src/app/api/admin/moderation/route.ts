import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// GET /api/admin/moderation — list flagged products + all products for search
export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const flaggedProducts = await db.product.findMany({
      where: { isFlagged: true },
      include: {
        artist: { select: { id: true, bandName: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // If search is provided, return matching non-flagged products
    let searchResults: { id: number; name: string; artist: { bandName: string } }[] = [];
    if (search) {
      searchResults = await db.product.findMany({
        where: {
          isFlagged: false,
          name: { contains: search },
        },
        select: {
          id: true,
          name: true,
          artist: { select: { bandName: true } },
        },
        take: 20,
      });
    }

    return NextResponse.json({
      flaggedProducts,
      searchResults,
      flaggedCount: flaggedProducts.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Moderation fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch moderation data" },
      { status: 500 }
    );
  }
}

// POST /api/admin/moderation — flag a product
export async function POST(req: NextRequest) {
  try {
    await requireRole("ADMIN");

    const body = await req.json();
    const { productId, reason } = body as { productId: number; reason: string };

    if (!productId || !reason) {
      return NextResponse.json(
        { error: "Product ID and reason are required" },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updated = await db.product.update({
      where: { id: productId },
      data: {
        isFlagged: true,
        flagReason: reason,
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    console.error("Flag product error:", error);
    return NextResponse.json(
      { error: "Failed to flag product" },
      { status: 500 }
    );
  }
}
