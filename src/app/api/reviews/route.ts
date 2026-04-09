import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// GET: Fetch user's reviews
export async function GET() {
  try {
    const user = await requireAuth();

    const reviews = await db.review.findMany({
      where: { customerId: user.id },
      include: {
        product: {
          select: {
            name: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Also fetch products the user has purchased but hasn't reviewed yet
    const orderItems = await db.orderItem.findMany({
      where: {
        order: { customerId: user.id },
      },
      select: { productId: true },
      distinct: ["productId"],
    });

    const purchasedProductIds = orderItems.map((item) => item.productId);
    const reviewedProductIds = reviews.map((r) => r.productId);
    const unreviewedProductIds = purchasedProductIds.filter(
      (id) => !reviewedProductIds.includes(id)
    );

    let unreviewedProducts: { id: number; name: string; images: string }[] = [];
    if (unreviewedProductIds.length > 0) {
      unreviewedProducts = await db.product.findMany({
        where: { id: { in: unreviewedProductIds } },
        select: { id: true, name: true, images: true },
      });
    }

    return NextResponse.json({ reviews, unreviewedProducts });
  } catch (error) {
    console.error("[REVIEWS GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 401 }
    );
  }
}

// POST: Create a review
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating) {
      return NextResponse.json(
        { error: "Product ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await db.review.findFirst({
      where: { customerId: user.id, productId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 409 }
      );
    }

    const review = await db.review.create({
      data: {
        customerId: user.id,
        productId,
        rating,
        comment: comment || null,
      },
      include: {
        product: {
          select: { name: true, images: true },
        },
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("[REVIEWS POST]", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 401 }
    );
  }
}
