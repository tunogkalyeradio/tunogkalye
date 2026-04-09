import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("ADMIN");
    const { id } = await params;
    const artistId = parseInt(id, 10);

    if (isNaN(artistId)) {
      return NextResponse.json(
        { error: "Invalid artist ID" },
        { status: 400 }
      );
    }

    // Check if artist exists
    const artist = await db.artistProfile.findUnique({
      where: { id: artistId },
      select: { isVerified: true },
    });

    if (!artist) {
      return NextResponse.json(
        { error: "Artist not found" },
        { status: 404 }
      );
    }

    // Toggle verification
    const updated = await db.artistProfile.update({
      where: { id: artistId },
      data: { isVerified: !artist.isVerified },
      select: { id: true, bandName: true, isVerified: true },
    });

    return NextResponse.json({
      message: updated.isVerified
        ? `${updated.bandName} has been verified`
        : `${updated.bandName} has been unverified`,
      isVerified: updated.isVerified,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Verify artist error:", error);
    return NextResponse.json(
      { error: "Failed to update artist" },
      { status: 500 }
    );
  }
}
