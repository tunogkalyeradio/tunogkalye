import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function GET() {
  try {
    if (!stripe) {
      return NextResponse.json({ status: "not_configured" });
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

    if (!profile.stripeAccountId) {
      return NextResponse.json({ status: "not_started" });
    }

    const account = await stripe.accounts.retrieve(profile.stripeAccountId);

    if (account.details_submitted && account.charges_enabled) {
      if (!profile.stripeOnboardingComplete) {
        await prisma.artistProfile.update({
          where: { id: profile.id },
          data: { stripeOnboardingComplete: true },
        });
      }
      return NextResponse.json({ status: "complete", accountId: profile.stripeAccountId });
    }

    return NextResponse.json({
      status: "incomplete",
      accountId: profile.stripeAccountId,
      detailsSubmitted: account.details_submitted || false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to check Stripe status";
    console.error("Stripe status error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
