import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

// POST: Create order from cart
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { shippingAddress } = body;

    // Validate shipping address
    if (
      !shippingAddress?.name ||
      !shippingAddress?.phone ||
      !shippingAddress?.line1 ||
      !shippingAddress?.city ||
      !shippingAddress?.province ||
      !shippingAddress?.postalCode
    ) {
      return NextResponse.json(
        { error: "All shipping address fields are required" },
        { status: 400 }
      );
    }

    // Fetch user's cart items with full product details
    const cartItems = await db.cart.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            artist: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty" },
        { status: 400 }
      );
    }

    // Validate stock availability
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${item.product.name}". Only ${item.product.stock} left.`,
          },
          { status: 400 }
        );
      }
      if (!item.product.isActive) {
        return NextResponse.json(
          { error: `"${item.product.name}" is no longer available.` },
          { status: 400 }
        );
      }
    }

    // Generate order number: TK-YYYY-XXXXXX
    const now = new Date();
    const year = now.getFullYear();
    const orderCount = await db.order.count();
    const sequence = String(orderCount + 1).padStart(6, "0");
    const orderNumber = `TK-${year}-${sequence}`;

    // Calculate totals
    let totalAmount = 0;
    let totalPlatformRevenue = 0;
    let totalArtistRevenue = 0;

    const orderItemsData = cartItems.map((item) => {
      const subtotal = item.quantity * item.product.price;
      const platformCut = subtotal * 0.1;
      const artistCut = subtotal * 0.9;

      totalAmount += subtotal + item.product.shippingFee;
      totalPlatformRevenue += platformCut;
      totalArtistRevenue += artistCut;

      return {
        productId: item.product.id,
        artistId: item.product.artistId,
        productName: item.product.name,
        productImage: item.product.images
          ? (() => {
              try {
                const imgs = JSON.parse(item.product.images);
                return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : null;
              } catch {
                return null;
              }
            })()
          : null,
        quantity: item.quantity,
        unitPrice: item.product.price,
        subtotal,
        platformCut,
        artistCut,
        fulfillmentMode: item.product.fulfillmentMode,
        shippingFee: item.product.shippingFee,
      };
    });

    // Create order with items in a transaction
    const order = await db.order.create({
      data: {
        customerId: user.id,
        orderNumber,
        status: OrderStatus.PENDING,
        totalAmount,
        platformRevenue: totalPlatformRevenue,
        artistRevenueTotal: totalArtistRevenue,
        shippingAddress: JSON.stringify(shippingAddress),
        orderItems: {
          create: orderItemsData,
        },
      },
    });

    // Decrease stock on products
    for (const item of cartItems) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Clear user's cart
    await db.cart.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        message: "Order placed successfully!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CHECKOUT POST]", error);
    const message =
      error instanceof Error && error.message === "Authentication required"
        ? "Authentication required"
        : "Failed to process order";
    const status =
      error instanceof Error && error.message === "Authentication required"
        ? 401
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
