import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// GET: Fetch user's cart items with product details
export async function GET() {
  try {
    const user = await requireAuth();

    const cartItems = await db.cart.findMany({
      where: { userId: user.id },
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

    return NextResponse.json({ cartItems });
  } catch (error) {
    console.error("[CART GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 401 }
    );
  }
}

// POST: Add item to cart
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { productId, quantity = 1, size } = body;

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

    // Upsert cart item (unique constraint on userId + productId)
    const cartItem = await db.cart.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
      update: {
        quantity,
        size: size || null,
      },
      create: {
        userId: user.id,
        productId,
        quantity,
        size: size || null,
      },
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

    return NextResponse.json({ cartItem }, { status: 201 });
  } catch (error) {
    console.error("[CART POST]", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 401 }
    );
  }
}

// PATCH: Update cart item quantity
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { cartId, quantity, size } = body;

    if (!cartId) {
      return NextResponse.json(
        { error: "Cart item ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingItem = await db.cart.findFirst({
      where: { id: cartId, userId: user.id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    const updateData: { quantity?: number; size?: string | null } = {};
    if (quantity !== undefined) {
      if (quantity < 1) {
        // Delete if quantity is 0 or less
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
      { status: 401 }
    );
  }
}

// DELETE: Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get("id");

    if (!cartId) {
      return NextResponse.json(
        { error: "Cart item ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingItem = await db.cart.findFirst({
      where: { id: parseInt(cartId, 10), userId: user.id },
    });

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
      { status: 401 }
    );
  }
}
