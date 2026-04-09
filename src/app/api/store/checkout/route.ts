import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { stripe, PLATFORM_FEE_RATE, APP_URL } from "@/lib/stripe";

// POST: Create order from cart + Stripe Checkout
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
          include: { artist: true },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    // Validate stock
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${item.product.name}". Only ${item.product.stock} left.` },
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

    // Generate order number
    const year = new Date().getFullYear();
    const orderCount = await db.order.count();
    const sequence = String(orderCount + 1).padStart(6, "0");
    const orderNumber = `TK-${year}-${sequence}`;

    // Calculate totals
    let totalAmount = 0;
    let totalPlatformRevenue = 0;
    let totalArtistRevenue = 0;
    let totalShipping = 0;

    const orderItemsData = cartItems.map((item) => {
      const subtotal = item.quantity * item.product.price;
      const platformCut = Math.round(subtotal * PLATFORM_FEE_RATE * 100) / 100;
      const artistCut = Math.round(subtotal * (1 - PLATFORM_FEE_RATE) * 100) / 100;
      const shippingFee = item.product.shippingFee;

      totalAmount += subtotal + shippingFee;
      totalPlatformRevenue += platformCut;
      totalArtistRevenue += artistCut;
      totalShipping += shippingFee;

      const images = item.product.images
        ? (() => { try { const imgs = JSON.parse(item.product.images); return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : null; } catch { return null; } })()
        : null;

      return {
        productId: item.product.id,
        artistId: item.product.artistId,
        productName: item.product.name,
        productImage: images,
        quantity: item.quantity,
        unitPrice: item.product.price,
        subtotal,
        platformCut,
        artistCut,
        fulfillmentMode: item.product.fulfillmentMode,
        shippingFee,
      };
    });

    // Create order
    const order = await db.order.create({
      data: {
        customerId: user.id,
        orderNumber,
        status: OrderStatus.PENDING,
        totalAmount: Math.round(totalAmount * 100) / 100,
        platformRevenue: Math.round(totalPlatformRevenue * 100) / 100,
        artistRevenueTotal: Math.round(totalArtistRevenue * 100) / 100,
        shippingAddress: JSON.stringify(shippingAddress),
        orderItems: { create: orderItemsData },
      },
    });

    // Decrease stock
    for (const item of cartItems) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear cart
    await db.cart.deleteMany({ where: { userId: user.id } });

    // ── Stripe Checkout Integration ──
    if (stripe && process.env.STRIPE_SECRET_KEY) {
      const lineItems = await Promise.all(
        cartItems.map(async (item) => {
          const artist = item.product.artist;
          const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
            price_data: {
              currency: "php",
              unit_amount: Math.round(item.product.price * 100), // Stripe uses cents
              product_data: {
                name: item.product.name,
                description: `by ${artist?.bandName || "Unknown Artist"}`,
                images: item.product.images
                  ? (() => { try { return JSON.parse(item.product.images).slice(0, 1); } catch { return []; } })()
                  : [],
              },
            },
            quantity: item.quantity,
          };

          // If artist has Stripe Connect, set up transfer
          if (artist?.stripeAccountId && artist.stripeOnboardingComplete) {
            lineItem.price_data!.unit_amount = Math.round(item.product.price * 100);
            // We'll use transfer_data on the payment_intent level
          }

          return lineItem;
        })
      );

      // Add shipping as a line item
      if (totalShipping > 0) {
        lineItems.push({
          price_data: {
            currency: "php",
            unit_amount: Math.round(totalShipping * 100),
            product_data: {
              name: "Shipping",
              description: "Order shipping fee",
            },
          },
          quantity: 1,
        });
      }

      // Collect unique connected artists for transfers
      const connectedArtists = new Map<string, number>();
      for (const item of cartItems) {
        const artist = item.product.artist;
        if (artist?.stripeAccountId && artist.stripeOnboardingComplete) {
          const subtotal = item.quantity * item.product.price;
          const artistCut = Math.round(subtotal * 0.9 * 100);
          connectedArtists.set(
            artist.stripeAccountId,
            (connectedArtists.get(artist.stripeAccountId) || 0) + artistCut
          );
        }
      }

      try {
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: lineItems,
          payment_intent_data: {
            metadata: {
              orderId: String(order.id),
              orderNumber: order.orderNumber,
            },
            // Use the first connected artist for automatic transfer
            ...(connectedArtists.size > 0
              ? {
                  transfer_data: {
                    destination: Array.from(connectedArtists.keys())[0],
                    amount: Array.from(connectedArtists.values())[0],
                  },
                }
              : {}),
          },
          success_url: `${APP_URL}/store/checkout/success?orderId=${order.id}`,
          cancel_url: `${APP_URL}/store/checkout?cancelled=true`,
          shipping_address_collection: {
            allowed_countries: ["CA", "PH", "US"],
          },
          metadata: {
            orderId: String(order.id),
            orderNumber: order.orderNumber,
          },
        });

        return NextResponse.json({ url: session.url, orderId: order.id });
      } catch (stripeError: unknown) {
        const msg = stripeError instanceof Error ? stripeError.message : "Stripe checkout failed";
        console.error("Stripe Checkout error:", msg);
        // Fallback: return order without Stripe URL
        return NextResponse.json({
          orderId: order.id,
          orderNumber: order.orderNumber,
          message: "Order created. Payment will be processed separately.",
          fallback: true,
        });
      }
    }

    // No Stripe configured — return order directly
    return NextResponse.json(
      { orderId: order.id, orderNumber: order.orderNumber, message: "Order placed successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CHECKOUT POST]", error);
    const message =
      error instanceof Error && error.message === "Authentication required"
        ? "Authentication required"
        : "Failed to process order";
    const status =
      error instanceof Error && error.message === "Authentication required" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Need Stripe types
import Stripe from "stripe";
