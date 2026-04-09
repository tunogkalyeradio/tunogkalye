import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// GET: Fetch user profile
export async function GET() {
  try {
    const user = await requireAuth();

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      role: user.role,
    });
  } catch (error) {
    console.error("[PROFILE GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 401 }
    );
  }
}

// PATCH: Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name, phone, address, avatar } = body;

    // Build update data
    const updateData: { name?: string; phone?: string | null; address?: string | null; avatar?: string | null } = {};

    if (name !== undefined && typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      updateData.phone = typeof phone === "string" && phone.trim() ? phone.trim() : null;
    }

    if (address !== undefined) {
      updateData.address =
        typeof address === "string" && address.trim() ? address.trim() : null;
    }

    if (avatar !== undefined) {
      updateData.avatar =
        typeof avatar === "string" && avatar.trim() ? avatar.trim() : null;
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        address: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("[PROFILE PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 401 }
    );
  }
}
