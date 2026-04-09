import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// GET: Fetch cart items (authenticated user or guest via sessionId)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    const sessionId = request.headers.get("x-session-id");

    let whereClause: Record<string, unknown> = {};

    if (session?.user?.id) {
      const userId = parseInt(session.user.id, 10);
      if (!isNaN(userId)) {
        whereClause = { userId };
      }
    } else if (sessionId) {
      whereClause = { sessionId };
    } else {
      return NextResponse.json({ cartItems: [], count: 0 });
    }

    const cartItems = await db.cart.findMany({
      where: whereClause,
      include: {
        product: {
          include: {
            artist: {
              select: { bandName: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      cartItems,
      count: cartItems.length,
    });
  } catch (error) {
    console.error("[CART GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST: Add item to cart (authenticated or guest)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    const body = await request.json();
    const { productId, quantity = 1, size } = body;
    const sessionId = request.headers.get("x-session-id");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { error: "Quantity must be between 1 and 10" },
        { status: 400 }
      );
    }

    const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    const isGuest = !userId;

    // Check product exists and is active
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "Product not found or unavailable" },
        { status: 404 }
      );
    }

    // Build cart item data
    const cartData: Record<string, unknown> = {
      productId,
      quantity,
      size: size || null,
    };

    if (userId && !isNaN(userId)) {
      cartData.userId = userId;
    } else if (sessionId) {
      cartData.sessionId = sessionId;
    } else {
      // Generate a session ID for guest
      const newSessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      cartData.sessionId = newSessionId;
    }

    const cartItem = await db.cart.create({
      data: cartData,
      include: {
        product: {
          include: {
            artist: {
              select: { bandName: true },
            },
          },
        },
      },
    });

    // Get cart count
    const cartWhere = userId && !isNaN(userId) ? { userId } : { sessionId: cartData.sessionId };
    const cartCount = await db.cart.count({ where: cartWhere });

    return NextResponse.json(
      {
        cartItem,
        cartCount,
        sessionId: cartData.sessionId,
        message: "Added to cart successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CART POST]", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

// PATCH: Update cart item quantity
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    const body = await request.json();
    const { cartId, quantity, size } = body;
    const sessionId = request.headers.get("x-session-id");

    if (!cartId) {
      return NextResponse.json(
        { error: "Cart item ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    const whereClause: Record<string, unknown> = { id: cartId };
    if (userId && !isNaN(userId)) {
      whereClause.userId = userId;
    } else if (sessionId) {
      whereClause.sessionId = sessionId;
    }

    const existingItem = await db.cart.findFirst({ where: whereClause });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    const updateData: { quantity?: number; size?: string | null } = {};
    if (quantity !== undefined) {
      if (quantity < 1) {
        await db.cart.delete({ where: { id: cartId } });
        return NextResponse.json({ deleted: true });
      }
      updateData.quantity = quantity;
    }
    if (size !== undefined) {
      updateData.size = size || null;
    }

    const cartItem = await db.cart.update({
      where: { id: cartId },
      data: updateData,
      include: {
        product: {
          include: {
            artist: {
              select: { bandName: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ cartItem });
  } catch (error) {
    console.error("[CART PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE: Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get("id");
    const sessionId = request.headers.get("x-session-id");

    if (!cartId) {
      return NextResponse.json(
        { error: "Cart item ID is required" },
        { status: 400 }
      );
    }

    const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    const whereClause: Record<string, unknown> = { id: parseInt(cartId, 10) };
    if (userId && !isNaN(userId)) {
      whereClause.userId = userId;
    } else if (sessionId) {
      whereClause.sessionId = sessionId;
    }

    const existingItem = await db.cart.findFirst({ where: whereClause });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    await db.cart.delete({ where: { id: parseInt(cartId, 10) } });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("[CART DELETE]", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
