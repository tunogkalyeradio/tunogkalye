import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { stripe, PLATFORM_FEE_RATE, APP_URL } from "@/lib/stripe";

// POST: Create order from cart + Stripe Checkout (supports guest checkout)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    const body = await request.json();
    const { shippingAddress, guestEmail, guestName, sessionId } = body;

    const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    const isGuest = !userId;

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

    // For guests, require email and name
    if (isGuest && (!guestEmail || !guestName)) {
      return NextResponse.json(
        { error: "Guest checkout requires email and name" },
        { status: 400 }
      );
    }

    // Fetch cart items
    const cartWhere = userId && !isNaN(userId)
      ? { userId }
      : sessionId
        ? { sessionId }
        : {};

    const cartItems = await db.cart.findMany({
      where: cartWhere,
      include: {
        product: {
          include: { artist: true },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    // Validate stock (skip for digital products)
    for (const item of cartItems) {
      const isDigital = item.product.productType === "DIGITAL";
      if (!isDigital && item.product.stock < item.quantity) {
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
      const platformRevenue = item.product.isStation ? Math.round(subtotal * PLATFORM_FEE_RATE * 100) / 100 : 0;
      const shippingFee = item.product.fulfillmentMode === 'ARTIST_SELF_DELIVERY' && item.product.productType === 'PHYSICAL' ? item.product.shippingFee : 0;
      const isDigital = item.product.productType === 'DIGITAL';
      const isStationMerch = item.product.isStation;

      totalAmount += subtotal + (isDigital ? 0 : shippingFee);
      totalPlatformRevenue += platformRevenue;
      totalArtistRevenue += subtotal - platformRevenue;
      totalShipping += isDigital ? 0 : shippingFee;

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
        fulfillmentMode: isDigital ? 'PLATFORM_DELIVERY' : item.product.fulfillmentMode,
        shippingFee: isDigital ? 0 : shippingFee,
        isStationMerch,
        isDigital,
        downloadUrl: item.product.downloadUrl || null,
      };
    });

    // Create order
    const order = await db.order.create({
      data: {
        customerId: userId || null,
        guestEmail: isGuest ? guestEmail : null,
        guestName: isGuest ? guestName : null,
        orderNumber,
        status: OrderStatus.PENDING,
        totalAmount: Math.round(totalAmount * 100) / 100,
        platformRevenue: Math.round(totalPlatformRevenue * 100) / 100,
        artistRevenueTotal: Math.round(totalArtistRevenue * 100) / 100,
        shippingAddress: JSON.stringify(shippingAddress),
        orderItems: { create: orderItemsData },
      },
    });

    // Decrease stock (skip for digital)
    for (const item of cartItems) {
      const isDigital = item.product.productType === "DIGITAL";
      if (!isDigital) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    // Clear cart
    await db.cart.deleteMany({ where: cartWhere });

    // ── Stripe Checkout Integration ──
    if (stripe && process.env.STRIPE_SECRET_KEY) {
      const lineItems = await Promise.all(
        cartItems.map(async (item) => {
          const artist = item.product.artist;
          const isDigital = item.product.productType === "DIGITAL";
          const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
            price_data: {
              currency: "php",
              unit_amount: Math.round(item.product.price * 100),
              product_data: {
                name: item.product.name,
                description: `by ${artist?.bandName || "Unknown Artist"}${isDigital ? " (Digital Download)" : ""}`,
                images: item.product.images
                  ? (() => { try { return JSON.parse(item.product.images).slice(0, 1); } catch { return []; } })()
                  : [],
              },
            },
            quantity: item.quantity,
          };

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
          const artistAmount = Math.round(subtotal * 100);
          connectedArtists.set(
            artist.stripeAccountId,
            (connectedArtists.get(artist.stripeAccountId) || 0) + artistAmount
          );
        }
      }

      try {
        const stripeSession = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: lineItems,
          payment_intent_data: {
            metadata: {
              orderId: String(order.id),
              orderNumber: order.orderNumber,
            },
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
          customer_email: isGuest ? guestEmail : undefined,
        });

        return NextResponse.json({ url: stripeSession.url, orderId: order.id });
      } catch (stripeError: unknown) {
        const msg = stripeError instanceof Error ? stripeError.message : "Stripe checkout failed";
        console.error("Stripe Checkout error:", msg);
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
    return NextResponse.json(
      { error: "Failed to process order" },
      { status: 500 }
    );
  }
}

// Need Stripe types
import Stripe from "stripe";
