import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// GET /api/artist/orders — fetch orders containing this artist's products
export async function GET() {
  try {
    const user = await requireRole("ARTIST");

    const artistProfile = await db.artistProfile.findUnique({
      where: { userId: user.id },
    });

    if (!artistProfile) {
      return NextResponse.json({ error: "No artist profile" }, { status: 404 });
    }

    // Get all order items for this artist
    const orderItems = await db.orderItem.findMany({
      where: { artistId: artistProfile.id },
      orderBy: { id: "desc" },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            createdAt: true,
            trackingNumber: true,
            customer: { select: { name: true } },
          },
        },
      },
    });

    // Group by order
    const orderMap = new Map<
      number,
      {
        orderId: number;
        orderNumber: string;
        customerName: string;
        status: string;
        createdAt: Date;
        trackingNumber: string | null;
        items: {
          id: number;
          productName: string;
          productImage: string | null;
          quantity: number;
          unitPrice: number;
          artistCut: number;
          fulfillmentMode: string;
          shippingFee: number;
          status: string;
        }[];
        totalArtistCut: number;
      }
    >();

    for (const item of orderItems) {
      const orderId = item.orderId;
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          orderId,
          orderNumber: item.order.orderNumber,
          customerName: item.order.customer.name,
          status: item.order.status,
          createdAt: item.order.createdAt,
          trackingNumber: item.order.trackingNumber,
          items: [],
          totalArtistCut: 0,
        });
      }

      const group = orderMap.get(orderId)!;
      group.items.push({
        id: item.id,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        artistCut: item.artistCut,
        fulfillmentMode: item.fulfillmentMode,
        shippingFee: item.shippingFee,
        status: item.status,
      });
      group.totalArtistCut += item.artistCut;
    }

    // Convert dates to strings for serialization
    const result = Array.from(orderMap.values()).map((group) => ({
      ...group,
      createdAt: group.createdAt.toISOString(),
    }));

    return NextResponse.json(result);
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

// PATCH /api/artist/orders — mark item as shipped
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireRole("ARTIST");

    const artistProfile = await db.artistProfile.findUnique({
      where: { userId: user.id },
    });

    if (!artistProfile) {
      return NextResponse.json({ error: "No artist profile" }, { status: 404 });
    }

    const body = await req.json();
    const { itemId, trackingNumber } = body;

    if (!itemId || !trackingNumber) {
      return NextResponse.json(
        { error: "Item ID and tracking number are required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const orderItem = await db.orderItem.findFirst({
      where: { id: itemId, artistId: artistProfile.id },
    });

    if (!orderItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (orderItem.status !== "PENDING") {
      return NextResponse.json(
        { error: "Item is not in pending status" },
        { status: 400 }
      );
    }

    await db.orderItem.update({
      where: { id: itemId },
      data: {
        status: "SHIPPED",
      },
    });

    // Also update order tracking number if not set
    if (!orderItem.order?.id) {
      // get the order
      const order = await db.order.findUnique({
        where: { id: orderItem.orderId },
      });
      if (order && !order.trackingNumber) {
        await db.order.update({
          where: { id: orderItem.orderId },
          data: { trackingNumber },
        });
      }
    }

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
