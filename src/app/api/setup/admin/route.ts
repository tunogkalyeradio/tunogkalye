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

// POST: Create admin account using raw SQL (schema-safe — works even if Prisma schema is out of sync)
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
    const emailLower = email.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date().toISOString().replace("T", " ").split(".")[0];

    // Check what columns the User table has
    let hasProvider = false;
    try {
      const cols: any[] = await db.$queryRawUnsafe(
        `PRAGMA table_info("User")`
      );
      hasProvider = cols.some((c: any) => c.name === "provider");
    } catch {
      // Table might not exist
    }

    // Check if admin already exists
    const existing: any[] = await db.$queryRawUnsafe(
      `SELECT id, email, role FROM "User" WHERE email = ?`,
      emailLower
    );

    if (existing.length > 0) {
      // Update existing user to ADMIN role and set password
      if (hasProvider) {
        await db.$executeRawUnsafe(
          `UPDATE "User" SET role = 'ADMIN', password = ?, name = ?, provider = 'credentials', "updatedAt" = ? WHERE email = ?`,
          hashedPassword,
          name,
          now,
          emailLower
        );
      } else {
        await db.$executeRawUnsafe(
          `UPDATE "User" SET role = 'ADMIN', password = ?, name = ?, "updatedAt" = ? WHERE email = ?`,
          hashedPassword,
          name,
          now,
          emailLower
        );
      }

      return NextResponse.json({
        success: true,
        message: "Existing account updated to ADMIN role.",
        admin: {
          id: existing[0].id,
          email: existing[0].email,
          role: "ADMIN",
        },
      });
    }

    // Create new admin account using raw SQL
    if (hasProvider) {
      await db.$executeRawUnsafe(
        `INSERT INTO "User" (email, password, name, role, provider, "createdAt", "updatedAt") VALUES (?, ?, ?, 'ADMIN', 'credentials', ?, ?)`,
        emailLower,
        hashedPassword,
        name,
        now,
        now
      );
    } else {
      await db.$executeRawUnsafe(
        `INSERT INTO "User" (email, password, name, role, "createdAt", "updatedAt") VALUES (?, ?, ?, 'ADMIN', ?, ?)`,
        emailLower,
        hashedPassword,
        name,
        now,
        now
      );
    }

    // Fetch the created user to confirm
    const created: any[] = await db.$queryRawUnsafe(
      `SELECT id, email, name, role FROM "User" WHERE email = ?`,
      emailLower
    );

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully!",
      admin: {
        id: created[0]?.id,
        email: created[0]?.email,
        name: created[0]?.name,
        role: created[0]?.role,
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
