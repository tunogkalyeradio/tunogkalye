import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// GET: Return number of items in user's cart (for badge in nav)
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 });
    }

    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ count: 0 });
    }

    const count = await db.cart.count({
      where: { userId },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("[STORE CART COUNT GET]", error);
    return NextResponse.json({ count: 0 });
  }
}
