import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const SETUP_KEY = process.env.ADMIN_SETUP_KEY || "tunog-kalye-setup-2026";

function getDb() {
  const tursoUrl = process.env.STORAGE_TURSO_DATABASE_URL;
  const tursoToken = process.env.STORAGE_TURSO_AUTH_TOKEN;
  if (tursoUrl && tursoToken) {
    const config = { url: tursoUrl, authToken: tursoToken };
    const adapter = new PrismaLibSQL(config);
    return new PrismaClient({ adapter } as any);
  }
  return new PrismaClient();
}

// POST: Create admin account only (safe — doesn't drop any tables)
export async function POST(request: globalThis.Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (key !== SETUP_KEY) {
      return NextResponse.json({ error: "Invalid setup key" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "email, password, and name are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if admin already exists
    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      // Update existing user to ADMIN role and set password
      const hashedPassword = await bcrypt.hash(password, 12);
      await db.user.update({
        where: { email: email.toLowerCase() },
        data: {
          role: "ADMIN",
          password: hashedPassword,
          name: name,
          provider: "credentials",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Existing account updated to ADMIN role.",
        admin: {
          id: existing.id,
          email: existing.email,
          role: "ADMIN",
        },
      });
    }

    // Create new admin account
    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role: "ADMIN",
        provider: "credentials",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully!",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error("[ADMIN SETUP ERROR]", error);
    return NextResponse.json(
      {
        error:
          "Admin setup failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
