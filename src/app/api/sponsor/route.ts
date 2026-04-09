import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, contactName, email, phone, plan } = body;

    if (!businessName || !contactName || !email) {
      return NextResponse.json(
        { error: "Business name, contact name, and email are required." },
        { status: 400 }
      );
    }

    const inquiry = await db.sponsorInquiry.create({
      data: {
        businessName,
        contactName,
        email,
        phone: phone || null,
        plan: plan || null,
      },
    });

    return NextResponse.json({
      success: true,
      id: inquiry.id,
      message: "Sponsor inquiry received! We'll be in touch within 24 hours.",
    });
  } catch (error) {
    console.error("Sponsor error:", error);
    return NextResponse.json(
      { error: "Failed to process inquiry. Please try again." },
      { status: 500 }
    );
  }
}
