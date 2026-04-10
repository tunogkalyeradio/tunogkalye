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
    const { email, password, name, migrate } = body;

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

    // ─── Migration: add missing columns and tables ──────────
    if (migrate) {
      const results: string[] = [];

      // Get existing table names
      const tables: any[] = await db.$queryRawUnsafe(
        `SELECT name FROM sqlite_master WHERE type='table'`
      );
      const tableNames = tables.map((t: any) => t.name);

      // Get User table columns
      const userCols: any[] = await db.$queryRawUnsafe(
        `PRAGMA table_info("User")`
      );
      const userColNames = userCols.map((c: any) => c.name);

      // Add missing columns to User table
      const missingUserCols: Record<string, string> = {
        provider: "TEXT NOT NULL DEFAULT 'credentials'",
      };

      for (const [col, def] of Object.entries(missingUserCols)) {
        if (!userColNames.includes(col)) {
          try {
            await db.$executeRawUnsafe(
              `ALTER TABLE "User" ADD COLUMN "${col}" ${def}`
            );
            results.push(`Added column User.${col}`);
          } catch (e: any) {
            results.push(`Skip User.${col}: ${e.message?.substring(0, 80)}`);
          }
        }
      }

      // Create missing tables
      if (!tableNames.includes("KantoFundEntry")) {
        await db.$executeRawUnsafe(`CREATE TABLE "KantoFundEntry" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "source" TEXT NOT NULL, "description" TEXT NOT NULL,
          "amount" REAL NOT NULL, "quarter" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);
        results.push("Created KantoFundEntry table");
      }

      if (!tableNames.includes("Tip")) {
        await db.$executeRawUnsafe(`CREATE TABLE "Tip" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "fromUserId" INTEGER, "guestEmail" TEXT, "guestName" TEXT,
          "artistId" INTEGER NOT NULL, "amount" REAL NOT NULL, "message" TEXT,
          "paymentIntentId" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("artistId") REFERENCES "ArtistProfile"("id"),
          FOREIGN KEY ("fromUserId") REFERENCES "User"("id")
        )`);
        results.push("Created Tip table");
      }

      if (!tableNames.includes("SiteSetting")) {
        await db.$executeRawUnsafe(`CREATE TABLE "SiteSetting" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "key" TEXT NOT NULL UNIQUE, "value" TEXT NOT NULL,
          "label" TEXT NOT NULL,
          "group" TEXT NOT NULL DEFAULT 'general',
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);
        results.push("Created SiteSetting table");
      }

      if (!tableNames.includes("Badge")) {
        await db.$executeRawUnsafe(`CREATE TABLE "Badge" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "type" TEXT NOT NULL UNIQUE, "name" TEXT NOT NULL,
          "icon" TEXT NOT NULL, "description" TEXT NOT NULL,
          "threshold" INTEGER NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);
        results.push("Created Badge table");
      }

      if (!tableNames.includes("UserBadge")) {
        await db.$executeRawUnsafe(`CREATE TABLE "UserBadge" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "userId" INTEGER NOT NULL, "badgeId" INTEGER NOT NULL,
          "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
          FOREIGN KEY ("badgeId") REFERENCES "Badge"("id"),
          UNIQUE("userId", "badgeId")
        )`);
        results.push("Created UserBadge table");
      }

      if (!tableNames.includes("DigitalPurchase")) {
        await db.$executeRawUnsafe(`CREATE TABLE "DigitalPurchase" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "userId" INTEGER NOT NULL, "productId" INTEGER NOT NULL, "orderId" INTEGER NOT NULL,
          "downloadUrl" TEXT NOT NULL, "fileName" TEXT, "fileFormat" TEXT,
          "accessCode" TEXT NOT NULL UNIQUE,
          "downloadCount" INTEGER NOT NULL DEFAULT 0, "maxDownloads" INTEGER NOT NULL DEFAULT 10,
          "expiresAt" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
          FOREIGN KEY ("productId") REFERENCES "Product"("id"),
          UNIQUE("userId", "productId", "orderId")
        )`);
        results.push("Created DigitalPurchase table");
      }

      // Seed site settings if table was just created
      if (!tableNames.includes("SiteSetting")) {
        const defaultSettings = [
          { key: "station_name", value: "Tunog Kalye Radio", label: "Station Name", group: "general" },
          { key: "station_tagline", value: "The Premier Grassroots Network for Filipino Independent Music", label: "Station Tagline", group: "general" },
          { key: "hero_tagline", value: "The Premier Grassroots Network for Filipino Independent Music", label: "Hero Tagline", group: "general" },
          { key: "hero_subtitle", value: "Bridging 90s Pinoy Rock with modern indie. Curated by humans, not algorithms.", label: "Hero Subtitle", group: "general" },
          { key: "hero_badge", value: "24/7 GLOBAL BROADCAST", label: "Hero Badge Text", group: "general" },
          { key: "footer_text", value: "Tunog Kalye Radio \u00A9 2026. All rights reserved.", label: "Footer Copyright Text", group: "general" },
          { key: "footer_website", value: "tunogkalye.net", label: "Footer Website URL", group: "general" },
          { key: "footer_video", value: "video.tunogkalye.net", label: "Footer Video Hub URL", group: "general" },
          { key: "footer_location", value: "Surrey, BC, Canada", label: "Footer Location", group: "general" },
          { key: "sponsor_name_1", value: "", label: "Sponsor Name 1", group: "sponsor" },
          { key: "sponsor_link_1", value: "", label: "Sponsor Link 1", group: "sponsor" },
          { key: "sponsor_description_1", value: "", label: "Sponsor Tagline 1", group: "sponsor" },
          { key: "sponsor_name_2", value: "", label: "Sponsor Name 2", group: "sponsor" },
          { key: "sponsor_link_2", value: "", label: "Sponsor Link 2", group: "sponsor" },
          { key: "sponsor_description_2", value: "", label: "Sponsor Tagline 2", group: "sponsor" },
          { key: "sponsor_name_3", value: "", label: "Sponsor Name 3", group: "sponsor" },
          { key: "sponsor_link_3", value: "", label: "Sponsor Link 3", group: "sponsor" },
          { key: "sponsor_description_3", value: "", label: "Sponsor Tagline 3", group: "sponsor" },
          { key: "sponsor_enabled", value: "true", label: "Show Sponsor Banner", group: "sponsor" },
          { key: "stats_listeners", value: "24/7", label: "Stats: Listeners", group: "content" },
          { key: "stats_reach", value: "Worldwide", label: "Stats: Reach", group: "content" },
          { key: "stats_artists", value: "Growing", label: "Stats: Artists", group: "content" },
          { key: "stats_commission", value: "0%", label: "Stats: Commission", group: "content" },
        ];

        for (const setting of defaultSettings) {
          try {
            await db.$executeRawUnsafe(
              `INSERT INTO "SiteSetting" ("key", value, label, "group", "updatedAt") VALUES (?, ?, ?, ?, ?)`,
              setting.key, setting.value, setting.label, setting.group, now
            );
          } catch {
            // Already exists
          }
        }
        results.push(`Seeded ${defaultSettings.length} site settings`);
      }

      return NextResponse.json({
        success: true,
        message: "Migration completed!",
        changes: results,
      });
    }

    // ─── Admin account creation (non-migrate mode) ───────────
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
      if (hasProvider) {
        await db.$executeRawUnsafe(
          `UPDATE "User" SET role = 'ADMIN', password = ?, name = ?, provider = 'credentials', "updatedAt" = ? WHERE email = ?`,
          hashedPassword, name, now, emailLower
        );
      } else {
        await db.$executeRawUnsafe(
          `UPDATE "User" SET role = 'ADMIN', password = ?, name = ?, "updatedAt" = ? WHERE email = ?`,
          hashedPassword, name, now, emailLower
        );
      }

      return NextResponse.json({
        success: true,
        message: "Existing account updated to ADMIN role.",
        admin: { id: existing[0].id, email: existing[0].email, role: "ADMIN" },
      });
    }

    if (hasProvider) {
      await db.$executeRawUnsafe(
        `INSERT INTO "User" (email, password, name, role, provider, "createdAt", "updatedAt") VALUES (?, ?, ?, 'ADMIN', 'credentials', ?, ?)`,
        emailLower, hashedPassword, name, now, now
      );
    } else {
      await db.$executeRawUnsafe(
        `INSERT INTO "User" (email, password, name, role, "createdAt", "updatedAt") VALUES (?, ?, ?, 'ADMIN', ?, ?)`,
        emailLower, hashedPassword, name, now, now
      );
    }

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
      { error: "Admin setup failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
