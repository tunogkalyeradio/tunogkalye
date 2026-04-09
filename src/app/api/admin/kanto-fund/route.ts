import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// GET /api/admin/kanto-fund — list all fund entries with summary
export async function GET() {
  try {
    await requireRole("ADMIN");

    const entries = await db.kantoFundEntry.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Calculate current quarter
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    const currentQuarter = `Q${quarter}-${now.getFullYear()}`;

    const currentQuarterEntries = entries.filter(
      (e) => e.quarter === currentQuarter
    );
    const currentQuarterTotal = currentQuarterEntries.reduce(
      (s, e) => s + e.amount,
      0
    );
    const allTimeTotal = entries.reduce((s, e) => s + e.amount, 0);

    const sponsorshipTotal = entries
      .filter((e) => e.source === "Sponsorship")
      .reduce((s, e) => s + e.amount, 0);
    const donationTotal = entries
      .filter((e) => e.source === "Donation")
      .reduce((s, e) => s + e.amount, 0);
    const otherTotal = entries
      .filter((e) => e.source === "Other")
      .reduce((s, e) => s + e.amount, 0);

    // Quarterly breakdown
    const quarterMap = new Map<string, number>();
    entries.forEach((e) => {
      quarterMap.set(e.quarter, (quarterMap.get(e.quarter) || 0) + e.amount);
    });
    const quarterlyBreakdown = Array.from(quarterMap.entries())
      .map(([q, total]) => ({ quarter: q, total }))
      .sort((a, b) => b.quarter.localeCompare(a.quarter));

    return NextResponse.json({
      entries,
      summary: {
        currentQuarter,
        currentQuarterTotal,
        allTimeTotal,
        sponsorshipTotal,
        donationTotal,
        otherTotal,
        entryCount: entries.length,
      },
      quarterlyBreakdown,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Kanto fund fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fund entries" },
      { status: 500 }
    );
  }
}

// POST /api/admin/kanto-fund — create a new fund entry
export async function POST(req: NextRequest) {
  try {
    await requireRole("ADMIN");

    const body = await req.json();
    const { source, description, amount, quarter } = body as {
      source: string;
      description: string;
      amount: number;
      quarter: string;
    };

    if (!source || !description || !amount) {
      return NextResponse.json(
        { error: "Source, description, and amount are required" },
        { status: 400 }
      );
    }

    if (!["Sponsorship", "Donation", "Other"].includes(source)) {
      return NextResponse.json(
        { error: "Source must be Sponsorship, Donation, or Other" },
        { status: 400 }
      );
    }

    // Auto-fill quarter if not provided
    let q = quarter;
    if (!q) {
      const now = new Date();
      const qr = Math.ceil((now.getMonth() + 1) / 3);
      q = `Q${qr}-${now.getFullYear()}`;
    }

    const entry = await db.kantoFundEntry.create({
      data: {
        source,
        description,
        amount: parseFloat(String(amount)),
        quarter: q,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Kanto fund create error:", error);
    return NextResponse.json(
      { error: "Failed to create fund entry" },
      { status: 500 }
    );
  }
}
