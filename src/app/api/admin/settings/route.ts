import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// GET: Return admin settings + site settings
export async function GET() {
  try {
    const user = await requireRole("ADMIN");

    // Fetch all site settings
    const siteSettings = await db.siteSetting.findMany({
      select: { key: true, value: true, label: true, group: true },
      orderBy: { key: "asc" },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      siteSettings,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[ADMIN SETTINGS GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 401 }
    );
  }
}

// PATCH: Update admin name, password, or site settings
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole("ADMIN");
    const body = await request.json();
    const { name, changePassword, siteSettings } = body;

    // Handle name update
    if (name !== undefined && typeof name === "string" && name.trim()) {
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
        select: { id: true, name: true, email: true, role: true },
      });

      return NextResponse.json({ user: updatedUser });
    }

    // Handle password change
    if (changePassword) {
      const { currentPassword, newPassword } = changePassword;

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: "Current and new password are required" },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters" },
          { status: 400 }
        );
      }

      // Get current user with password
      const currentUser = await db.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      });

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      // Hash new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return NextResponse.json({ message: "Password changed successfully" });
    }

    // Handle site settings update
    if (siteSettings && typeof siteSettings === "object") {
      const updates: { key: string; value: string }[] = [];

      for (const [key, value] of Object.entries(siteSettings)) {
        if (typeof key === "string" && typeof value === "string") {
          updates.push({ key, value });
        }
      }

      // Use transaction for atomic updates
      await db.$transaction(
        updates.map(({ key, value }) =>
          db.siteSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value, label: key, group: "general" },
          })
        )
      );

      return NextResponse.json({
        message: `Updated ${updates.length} site settings`,
      });
    }

    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[ADMIN SETTINGS PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
