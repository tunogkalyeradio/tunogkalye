import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// PATCH /api/admin/moderation/[id] — unflag or take down a product
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

    const body = await req.json();
    const { action } = body as { action: string };

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (action === "unflag") {
      const updated = await db.product.update({
        where: { id: productId },
        data: { isFlagged: false, flagReason: null },
      });
      return NextResponse.json({ product: updated, message: "Product unflagged" });
    }

    if (action === "takedown") {
      const updated = await db.product.update({
        where: { id: productId },
        data: { isActive: false },
      });
      return NextResponse.json({ product: updated, message: "Product taken down" });
    }

    if (action === "dismiss") {
      // Dismiss = unflag without taking down
      const updated = await db.product.update({
        where: { id: productId },
        data: { isFlagged: false, flagReason: null },
      });
      return NextResponse.json({ product: updated, message: "Flag dismissed" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    console.error("Moderation action error:", error);
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}
