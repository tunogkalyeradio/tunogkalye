import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// GET /api/admin/submissions?type=music|sponsor|donation
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole("ADMIN");
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "music";

    if (type === "music") {
      const submissions = await db.musicSubmission.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ submissions });
    }

    if (type === "sponsor") {
      const submissions = await db.sponsorInquiry.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ submissions });
    }

    if (type === "donation") {
      const donations = await db.donation.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ donations });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Submissions fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
