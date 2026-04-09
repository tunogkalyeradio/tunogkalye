import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// POST: Create a tip for an artist
export async function POST(request: NextRequest) {
  try {
    let userId: number | null = null;
    try {
      const user = await requireAuth();
      userId = user.id;
    } catch {
      // Allow guest tips — will be handled by guestEmail/guestName
    }

    const body = await request.json();
    const { artistId, amount, message, guestEmail, guestName } = body;

    if (!artistId || !amount) {
      return NextResponse.json(
        { error: "Artist ID and amount are required" },
        { status: 400 }
      );
    }

    const tipAmount = parseFloat(amount);
    if (isNaN(tipAmount) || tipAmount < 1) {
      return NextResponse.json(
        { error: "Amount must be at least $1" },
        { status: 400 }
      );
    }

    if (tipAmount > 500) {
      return NextResponse.json(
        { error: "Maximum tip amount is $500" },
        { status: 400 }
      );
    }

    // Verify artist exists
    const artist = await db.artistProfile.findUnique({
      where: { id: artistId },
    });

    if (!artist) {
      return NextResponse.json(
        { error: "Artist not found" },
        { status: 404 }
      );
    }

    // Create tip
    const tip = await db.tip.create({
      data: {
        fromUserId: userId,
        artistId,
        amount: tipAmount,
        message: message?.trim() || null,
        guestEmail: !userId ? (guestEmail || null) : null,
        guestName: !userId ? (guestName || null) : null,
      },
    });

    return NextResponse.json(
      { tip, message: "Tip sent successfully! 100% goes directly to the artist." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[TIP POST]", error);
    return NextResponse.json(
      { error: "Failed to send tip" },
      { status: 500 }
    );
  }
}

// GET: List artists available for tipping
export async function GET() {
  try {
    const artists = await db.artistProfile.findMany({
      where: { storeStatus: "APPROVED" },
      select: {
        id: true,
        bandName: true,
        genre: true,
        city: true,
        imageUrl: true,
      },
      orderBy: { bandName: "asc" },
      take: 50,
    });

    return NextResponse.json({ artists });
  } catch (error) {
    console.error("[TIP GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch artists" },
      { status: 500 }
    );
  }
}
