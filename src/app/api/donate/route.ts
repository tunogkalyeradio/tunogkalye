import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, amount, tier, message } = body;

    if (!amount || !tier) {
      return NextResponse.json(
        { error: "Amount and tier are required." },
        { status: 400 }
      );
    }

    const donation = await db.donation.create({
      data: {
        name: name || null,
        email: email || null,
        amount: parseFloat(amount),
        tier,
        message: message || null,
      },
    });

    return NextResponse.json({
      success: true,
      id: donation.id,
      message: "Thank you for your support! Maraming salamat!",
    });
  } catch (error) {
    console.error("Donation error:", error);
    return NextResponse.json(
      { error: "Failed to process donation. Please try again." },
      { status: 500 }
    );
  }
}
