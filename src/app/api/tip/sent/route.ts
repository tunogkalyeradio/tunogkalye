import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// GET: Fetch user's sent tips
export async function GET() {
  try {
    const user = await requireAuth();

    const tips = await db.tip.findMany({
      where: { fromUserId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        amount: true,
        message: true,
        createdAt: true,
        artist: {
          select: { bandName: true },
        },
      },
    });

    return NextResponse.json({ tips });
  } catch (error) {
    console.error("[TIP SENT GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch tips" },
      { status: 500 }
    );
  }
}
