import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("ADMIN");
    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body as { status: string };

    if (!status || !Object.values(OrderStatus).includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED" },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { id: true, orderNumber: true, status: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status
    const updated = await db.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
      select: { id: true, orderNumber: true, status: true },
    });

    return NextResponse.json({
      message: `Order ${updated.orderNumber} status updated to ${updated.status}`,
      status: updated.status,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
