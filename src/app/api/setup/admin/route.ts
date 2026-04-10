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

/** Get column names for a table */
async function getColumns(db: any, table: string): Promise<string[]> {
  try {
    const cols: any[] = await db.$queryRawUnsafe(`PRAGMA table_info("${table}")`);
    return cols.map((c: any) => c.name);
  } catch {
    return [];
  }
}

/** Check if a table exists */
async function tableExists(db: any, table: string): Promise<boolean> {
  const tables: any[] = await db.$queryRawUnsafe(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
    table
  );
  return tables.length > 0;
}

/** Safe ALTER TABLE ADD COLUMN — ignores errors if column/table already exists */
async function safeAddColumn(db: any, table: string, col: string, def: string): Promise<string | null> {
  try {
    await db.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN "${col}" ${def}`);
    return `Added ${table}.${col}`;
  } catch (e: any) {
    return null;
  }
}

/** Safe CREATE TABLE — ignores if already exists */
async function safeCreateTable(db: any, sql: string, tableName: string): Promise<string | null> {
  try {
    await db.$executeRawUnsafe(sql);
    return `Created ${tableName} table`;
  } catch (e: any) {
    return null;
  }
}

/** Safe CREATE INDEX */
async function safeCreateIndex(db: any, sql: string): Promise<void> {
  try {
    await db.$executeRawUnsafe(sql);
  } catch {
    // Ignore if exists
  }
}

// POST: Migrate database schema + optionally create admin account
export async function POST(request: globalThis.Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (key !== SETUP_KEY) {
      return NextResponse.json({ error: "Invalid setup key" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name, migrate } = body;

    const db = getDb();
    const results: string[] = [];
    const now = new Date().toISOString().replace("T", " ").split(".")[0];

    // ─── Full Migration ─────────────────────────────────────
    if (migrate) {

      // === USER TABLE — add missing columns ===
      const userCols = await getColumns(db, "User");
      if (userCols.length > 0) {
        const userAdditions: Record<string, string> = {
          provider: "TEXT NOT NULL DEFAULT 'credentials'",
          address: "TEXT",
        };
        for (const [col, def] of Object.entries(userAdditions)) {
          if (!userCols.includes(col)) {
            const r = await safeAddColumn(db, "User", col, def);
            if (r) results.push(r);
          }
        }
      } else if (!(await tableExists(db, "User"))) {
        await db.$executeRawUnsafe(`CREATE TABLE "User" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "email" TEXT NOT NULL,
          "password" TEXT,
          "name" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
          "phone" TEXT, "avatar" TEXT,
          "provider" TEXT NOT NULL DEFAULT 'credentials',
          "address" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);
        safeCreateIndex(db, `CREATE UNIQUE INDEX "User_email_key" ON "User"("email")`);
        results.push("Created User table");
      }

      // === ARTIST PROFILE TABLE — add missing columns ===
      const artistCols = await getColumns(db, "ArtistProfile");
      if (artistCols.length > 0) {
        const artistAdditions: Record<string, string> = {
          totalSales: "REAL NOT NULL DEFAULT 0",
          totalAirplays: "INTEGER NOT NULL DEFAULT 0",
          storeStatus: "TEXT NOT NULL DEFAULT 'PENDING'",
          storeRejectedReason: "TEXT",
          stripeOnboardingComplete: "INTEGER NOT NULL DEFAULT 0",
        };
        for (const [col, def] of Object.entries(artistAdditions)) {
          if (!artistCols.includes(col)) {
            const r = await safeAddColumn(db, "ArtistProfile", col, def);
            if (r) results.push(r);
          }
        }
      }

      // === ORDER TABLE — add missing columns ===
      const orderCols = await getColumns(db, "Order");
      if (orderCols.length > 0) {
        const orderAdditions: Record<string, string> = {
          platformRevenue: "REAL NOT NULL DEFAULT 0",
          artistRevenueTotal: "REAL NOT NULL DEFAULT 0",
          guestEmail: "TEXT",
          guestName: "TEXT",
          trackingNumber: "TEXT",
          notes: "TEXT",
          paymentIntentId: "TEXT",
        };
        for (const [col, def] of Object.entries(orderAdditions)) {
          if (!orderCols.includes(col)) {
            const r = await safeAddColumn(db, "Order", col, def);
            if (r) results.push(r);
          }
        }
      }

      // === PRODUCT TABLE — add missing columns ===
      const productCols = await getColumns(db, "Product");
      if (productCols.length > 0) {
        const productAdditions: Record<string, string> = {
          compareAtPrice: "REAL",
          productType: "TEXT NOT NULL DEFAULT 'PHYSICAL'",
          fulfillmentMode: "TEXT NOT NULL DEFAULT 'PLATFORM_DELIVERY'",
          shippingFee: "REAL NOT NULL DEFAULT 0",
          isStation: "INTEGER NOT NULL DEFAULT 0",
          isFlagged: "INTEGER NOT NULL DEFAULT 0",
          flagReason: "TEXT",
          downloadUrl: "TEXT",
          fileSize: "TEXT",
          fileFormat: "TEXT",
          isActive: "INTEGER NOT NULL DEFAULT 1",
        };
        for (const [col, def] of Object.entries(productAdditions)) {
          if (!productCols.includes(col)) {
            const r = await safeAddColumn(db, "Product", col, def);
            if (r) results.push(r);
          }
        }
      }

      // === ORDER ITEM TABLE — add missing columns ===
      const orderItemCols = await getColumns(db, "OrderItem");
      if (orderItemCols.length > 0) {
        const oiAdditions: Record<string, string> = {
          fulfillmentMode: "TEXT NOT NULL DEFAULT 'PLATFORM_DELIVERY'",
          shippingFee: "REAL NOT NULL DEFAULT 0",
          isStationMerch: "INTEGER NOT NULL DEFAULT 0",
          isDigital: "INTEGER NOT NULL DEFAULT 0",
          downloadUrl: "TEXT",
        };
        for (const [col, def] of Object.entries(oiAdditions)) {
          if (!orderItemCols.includes(col)) {
            const r = await safeAddColumn(db, "OrderItem", col, def);
            if (r) results.push(r);
          }
        }
      }

      // === CART TABLE — add missing columns ===
      const cartCols = await getColumns(db, "Cart");
      if (cartCols.length > 0) {
        const cartAdditions: Record<string, string> = {
          size: "TEXT",
          sessionId: "TEXT",
        };
        for (const [col, def] of Object.entries(cartAdditions)) {
          if (!cartCols.includes(col)) {
            const r = await safeAddColumn(db, "Cart", col, def);
            if (r) results.push(r);
          }
        }
      }

      // === Create missing tables ===
      const r1 = await safeCreateTable(db, `CREATE TABLE "KantoFundEntry" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "source" TEXT NOT NULL, "description" TEXT NOT NULL,
        "amount" REAL NOT NULL, "quarter" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`, "KantoFundEntry");
      if (r1) results.push(r1);

      const r2 = await safeCreateTable(db, `CREATE TABLE "Tip" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "fromUserId" INTEGER, "guestEmail" TEXT, "guestName" TEXT,
        "artistId" INTEGER NOT NULL, "amount" REAL NOT NULL, "message" TEXT,
        "paymentIntentId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`, "Tip");
      if (r2) results.push(r2);

      const r3 = await safeCreateTable(db, `CREATE TABLE "SiteSetting" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "key" TEXT NOT NULL UNIQUE, "value" TEXT NOT NULL,
        "label" TEXT NOT NULL,
        "group" TEXT NOT NULL DEFAULT 'general',
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`, "SiteSetting");
      if (r3) results.push(r3);

      const r4 = await safeCreateTable(db, `CREATE TABLE "Badge" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "type" TEXT NOT NULL UNIQUE, "name" TEXT NOT NULL,
        "icon" TEXT NOT NULL, "description" TEXT NOT NULL,
        "threshold" INTEGER NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`, "Badge");
      if (r4) results.push(r4);

      const r5 = await safeCreateTable(db, `CREATE TABLE "UserBadge" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "userId" INTEGER NOT NULL, "badgeId" INTEGER NOT NULL,
        "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("userId", "badgeId")
      )`, "UserBadge");
      if (r5) results.push(r5);

      const r6 = await safeCreateTable(db, `CREATE TABLE "DigitalPurchase" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "userId" INTEGER NOT NULL, "productId" INTEGER NOT NULL, "orderId" INTEGER NOT NULL,
        "downloadUrl" TEXT NOT NULL, "fileName" TEXT, "fileFormat" TEXT,
        "accessCode" TEXT NOT NULL UNIQUE,
        "downloadCount" INTEGER NOT NULL DEFAULT 0, "maxDownloads" INTEGER NOT NULL DEFAULT 10,
        "expiresAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("userId", "productId", "orderId")
      )`, "DigitalPurchase");
      if (r6) results.push(r6);

      // Seed site settings if table was just created or is empty
      if (r3 || !(await tableExists(db, "SiteSetting")) || true) {
        const countResult: any[] = await db.$queryRawUnsafe(`SELECT COUNT(*) as c FROM "SiteSetting"`);
        if (countResult[0]?.c === 0) {
          const defaultSettings = [
            { key: "station_name", value: "Tunog Kalye Radio", label: "Station Name", group: "general" },
            { key: "station_tagline", value: "The Premier Broadcasting Network for Filipino Independent Music", label: "Station Tagline", group: "general" },
            { key: "hero_tagline", value: "The Premier Broadcasting Network for Filipino Independent Music", label: "Hero Tagline", group: "general" },
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
          for (const s of defaultSettings) {
            try {
              await db.$executeRawUnsafe(
                `INSERT INTO "SiteSetting" ("key", value, label, "group", "updatedAt") VALUES (?, ?, ?, ?, ?)`,
                s.key, s.value, s.label, s.group, now
              );
            } catch { /* skip duplicates */ }
          }
          results.push(`Seeded ${defaultSettings.length} site settings`);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Schema migration completed!",
        changes: results,
      });
    }

    // ─── Admin Account Creation (non-migrate mode) ───────────
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "email, password, and name are required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 12);

    const hasProvider = (await getColumns(db, "User")).includes("provider");

    const existing: any[] = await db.$queryRawUnsafe(
      `SELECT id, email, role FROM "User" WHERE email = ?`, emailLower
    );

    if (existing.length > 0) {
      const sql = hasProvider
        ? `UPDATE "User" SET role = 'ADMIN', password = ?, name = ?, provider = 'credentials', "updatedAt" = ? WHERE email = ?`
        : `UPDATE "User" SET role = 'ADMIN', password = ?, name = ?, "updatedAt" = ? WHERE email = ?`;
      await db.$executeRawUnsafe(sql, hashedPassword, name, now, emailLower);

      return NextResponse.json({
        success: true,
        message: "Existing account updated to ADMIN role.",
        admin: { id: existing[0].id, email: existing[0].email, role: "ADMIN" },
      });
    }

    const insertSql = hasProvider
      ? `INSERT INTO "User" (email, password, name, role, provider, "createdAt", "updatedAt") VALUES (?, ?, ?, 'ADMIN', 'credentials', ?, ?)`
      : `INSERT INTO "User" (email, password, name, role, "createdAt", "updatedAt") VALUES (?, ?, ?, 'ADMIN', ?, ?)`;
    await db.$executeRawUnsafe(insertSql, emailLower, hashedPassword, name, now, now);

    const created: any[] = await db.$queryRawUnsafe(
      `SELECT id, email, name, role FROM "User" WHERE email = ?`, emailLower
    );

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully!",
      admin: { id: created[0]?.id, email: created[0]?.email, name: created[0]?.name, role: created[0]?.role },
    });
  } catch (error: any) {
    console.error("[ADMIN SETUP ERROR]", error);
    return NextResponse.json(
      { error: "Setup failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
