import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ARTIST") {
      return NextResponse.json({ error: "Only artists can connect Stripe" }, { status: 403 });
    }

    const profile = await prisma.artistProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Artist profile not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    let accountId = profile.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "CA",
        email: user?.email,
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        business_type: "individual",
        metadata: { artistProfileId: String(profile.id) },
      });
      accountId = account.id;
      await prisma.artistProfile.update({
        where: { id: profile.id },
        data: { stripeAccountId: accountId },
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/artist/stripe`,
      return_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/artist/stripe?success=true`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create Connect link";
    console.error("Stripe Connect error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
