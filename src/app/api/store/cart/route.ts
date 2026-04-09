import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// POST: Add item to cart
// - If user is logged in: save to Cart table
// - If user is NOT logged in: return redirectToLogin flag
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
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

    // If not logged in, prompt to login
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Login required to add to cart",
          redirectToLogin: true,
        },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user session" },
        { status: 401 }
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

    // Upsert cart item
    const cartItem = await db.cart.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {
        quantity,
        size: size || null,
      },
      create: {
        userId,
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

    // Get updated cart count
    const cartCount = await db.cart.count({
      where: { userId },
    });

    return NextResponse.json(
      {
        cartItem,
        cartCount,
        message: "Added to cart successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[STORE CART POST]", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}
