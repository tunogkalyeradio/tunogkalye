import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { StoreStatus } from "@prisma/client";

// GET /api/admin/store-approvals — list all artist store applications
export async function GET() {
  try {
    await requireRole("ADMIN");

    const artists = await db.artistProfile.findMany({
      select: {
        id: true,
        bandName: true,
        userId: true,
        city: true,
        genre: true,
        storeStatus: true,
        storeRejectedReason: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const pendingCount = artists.filter((a) => a.storeStatus === "PENDING").length;
    const approvedCount = artists.filter((a) => a.storeStatus === "APPROVED").length;
    const rejectedCount = artists.filter((a) => a.storeStatus === "REJECTED").length;

    return NextResponse.json({
      artists,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Store approvals fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch store applications" },
      { status: 500 }
    );
  }
}
