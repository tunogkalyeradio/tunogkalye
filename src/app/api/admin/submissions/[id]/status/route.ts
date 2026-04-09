import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";

const VALID_STATUSES = ["pending", "reviewed", "approved", "rejected"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("ADMIN");
    const { id } = await params;

    const body = await request.json();
    const { status } = body as { status: string };

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: pending, reviewed, approved, rejected" },
        { status: 400 }
      );
    }

    // Check if submission exists
    const submission = await db.musicSubmission.findUnique({
      where: { id },
      select: { id: true, bandName: true, status: true },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Update status
    const updated = await db.musicSubmission.update({
      where: { id },
      data: { status },
      select: { id: true, bandName: true, status: true },
    });

    return NextResponse.json({
      message: `Submission "${updated.bandName}" status updated to ${updated.status}`,
      status: updated.status,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update submission status error:", error);
    return NextResponse.json(
      { error: "Failed to update submission status" },
      { status: 500 }
    );
  }
}
