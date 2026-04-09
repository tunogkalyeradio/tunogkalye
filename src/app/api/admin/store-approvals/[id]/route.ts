import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { notifyUser } from "@/lib/notify";

// PATCH /api/admin/store-approvals/[id] — approve or reject a store application
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const artistId = parseInt(id, 10);
    if (isNaN(artistId)) {
      return NextResponse.json({ error: "Invalid artist ID" }, { status: 400 });
    }

    const body = await req.json();
    const { action, reason } = body as { action?: string; reason?: string };

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const artist = await db.artistProfile.findUnique({
      where: { id: artistId },
      include: { user: { select: { id: true, name: true } } },
    });

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    if (action === "approve") {
      await db.artistProfile.update({
        where: { id: artistId },
        data: {
          storeStatus: "APPROVED",
          storeRejectedReason: null,
        },
      });

      if (artist.user) {
        await notifyUser(artist.user.id, {
          title: "Store Application Approved! 🎉",
          message: `Your store application for "${artist.bandName}" has been approved. You can now start listing products.`,
          type: "SYSTEM",
          link: "/artist/products",
        });
      }

      return NextResponse.json({ success: true, message: "Store approved" });
    }

    if (action === "reject") {
      await db.artistProfile.update({
        where: { id: artistId },
        data: {
          storeStatus: "REJECTED",
          storeRejectedReason: reason || "Application did not meet requirements",
        },
      });

      if (artist.user) {
        await notifyUser(artist.user.id, {
          title: "Store Application Update",
          message: `Your store application for "${artist.bandName}" was not approved. Reason: ${reason || "Application did not meet requirements"}`,
          type: "SYSTEM",
        });
      }

      return NextResponse.json({ success: true, message: "Store rejected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Store approval error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
