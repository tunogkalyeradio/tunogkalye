import { NextRequest, NextResponse } from "next/server";

// Push subscription management
// In production, store subscriptions in a database for server-initiated push
// For now, this provides the client-side subscription workflow

const subscriptions: Array<{
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: number;
}> = [];

// POST: Register/Update push subscription
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription } = body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    // Update or add subscription
    const existingIdx = subscriptions.findIndex((s) => s.endpoint === subscription.endpoint);
    if (existingIdx >= 0) {
      subscriptions[existingIdx] = {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        createdAt: Date.now(),
      };
    } else {
      subscriptions.push({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        createdAt: Date.now(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Push subscription registered",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to register subscription" }, { status: 500 });
  }
}

// DELETE: Remove push subscription
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (endpoint) {
      const idx = subscriptions.findIndex((s) => s.endpoint === endpoint);
      if (idx >= 0) subscriptions.splice(idx, 1);
    }

    return NextResponse.json({ success: true, message: "Subscription removed" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove subscription" }, { status: 500 });
  }
}

// GET: Check push support status
export async function GET() {
  return NextResponse.json({
    supported: true,
    vapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null,
    subscriptionCount: subscriptions.length,
  });
}
