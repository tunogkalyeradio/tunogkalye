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

async function runRaw(db: any, sql: string) {
  await db.$executeRawUnsafe(sql);
}

// GET: Check database state
export async function GET(request: globalThis.Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (key !== SETUP_KEY) return NextResponse.json({ error: "Invalid setup key" }, { status: 403 });
    const db = getDb();
    const tables = await db.$queryRawUnsafe(`SELECT name FROM sqlite_master WHERE type='table'`);
    return NextResponse.json({ tables });
  } catch (error: any) {
    return NextResponse.json({ error: error.message?.substring(0, 200) }, { status: 500 });
  } finally {
    await (getDb() as any).$disconnect();
  }
}

// POST: Initialize database
export async function POST(request: globalThis.Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (key !== SETUP_KEY) return NextResponse.json({ error: "Invalid setup key" }, { status: 403 });

    const body = await request.json();
    const { adminEmail, adminPassword, adminName } = body;
    if (!adminEmail || !adminPassword || !adminName) {
      return NextResponse.json({ error: "adminEmail, adminPassword, and adminName are required" }, { status: 400 });
    }

    const db = getDb();

    // Drop tables in dependency order
    const dropTables = [
      "DROP TABLE IF EXISTS UserBadge",
      "DROP TABLE IF EXISTS Badge",
      "DROP TABLE IF EXISTS OrderItem",
      "DROP TABLE IF EXISTS Order",
      "DROP TABLE IF EXISTS Cart",
      "DROP TABLE IF EXISTS DigitalPurchase",
      "DROP TABLE IF EXISTS Review",
      "DROP TABLE IF EXISTS Notification",
      "DROP TABLE IF EXISTS Tip",
      "DROP TABLE IF EXISTS SiteSetting",
      "DROP TABLE IF EXISTS Product",
      "DROP TABLE IF EXISTS ArtistProfile",
      "DROP TABLE IF EXISTS User",
      "DROP TABLE IF EXISTS MusicSubmission",
      "DROP TABLE IF EXISTS SponsorInquiry",
      "DROP TABLE IF EXISTS Donation",
      "DROP TABLE IF EXISTS KantoFundEntry",
    ];
    for (const sql of dropTables) await runRaw(db, sql);

    // Create tables
    await runRaw(db, `CREATE TABLE "User" (
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
    );`);
    await runRaw(db, `CREATE UNIQUE INDEX "User_email_key" ON "User"("email");`);

    await runRaw(db, `CREATE TABLE "MusicSubmission" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "bandName" TEXT NOT NULL, "realName" TEXT NOT NULL, "email" TEXT NOT NULL,
      "spotifyLink" TEXT, "soundcloudLink" TEXT, "city" TEXT NOT NULL,
      "genre" TEXT, "message" TEXT,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);

    await runRaw(db, `CREATE TABLE "SponsorInquiry" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "businessName" TEXT NOT NULL, "contactName" TEXT NOT NULL, "email" TEXT NOT NULL,
      "phone" TEXT, "plan" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);

    await runRaw(db, `CREATE TABLE "Donation" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT, "email" TEXT, "amount" REAL NOT NULL, "tier" TEXT NOT NULL, "message" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);

    await runRaw(db, `CREATE TABLE "KantoFundEntry" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "source" TEXT NOT NULL, "description" TEXT NOT NULL,
      "amount" REAL NOT NULL, "quarter" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);

    await runRaw(db, `CREATE TABLE "ArtistProfile" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "userId" INTEGER NOT NULL UNIQUE,
      "bandName" TEXT NOT NULL, "realName" TEXT NOT NULL, "genre" TEXT,
      "city" TEXT NOT NULL, "bio" TEXT, "spotifyLink" TEXT, "soundcloudLink" TEXT,
      "socialLinks" TEXT, "imageUrl" TEXT,
      "stripeAccountId" TEXT, "stripeOnboardingComplete" INTEGER NOT NULL DEFAULT 0,
      "isVerified" INTEGER NOT NULL DEFAULT 0,
      "storeStatus" TEXT NOT NULL DEFAULT 'PENDING', "storeRejectedReason" TEXT,
      "totalSales" REAL NOT NULL DEFAULT 0, "totalAirplays" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    );`);

    await runRaw(db, `CREATE TABLE "Product" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "artistId" INTEGER NOT NULL, "name" TEXT NOT NULL, "description" TEXT NOT NULL,
      "price" REAL NOT NULL, "compareAtPrice" REAL, "category" TEXT NOT NULL,
      "productType" TEXT NOT NULL DEFAULT 'PHYSICAL', "images" TEXT NOT NULL,
      "sizes" TEXT, "colors" TEXT,
      "stock" INTEGER NOT NULL DEFAULT 0,
      "fulfillmentMode" TEXT NOT NULL DEFAULT 'PLATFORM_DELIVERY',
      "shippingFee" REAL NOT NULL DEFAULT 0,
      "isActive" INTEGER NOT NULL DEFAULT 1, "isStation" INTEGER NOT NULL DEFAULT 0,
      "isFlagged" INTEGER NOT NULL DEFAULT 0, "flagReason" TEXT,
      "downloadUrl" TEXT, "fileSize" TEXT, "fileFormat" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("artistId") REFERENCES "ArtistProfile"("id") ON DELETE CASCADE
    );`);

    await runRaw(db, `CREATE TABLE "Order" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "orderNumber" TEXT NOT NULL UNIQUE,
      "customerId" INTEGER, "guestEmail" TEXT, "guestName" TEXT,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "totalAmount" REAL NOT NULL, "platformRevenue" REAL NOT NULL DEFAULT 0,
      "artistRevenueTotal" REAL NOT NULL DEFAULT 0,
      "shippingAddress" TEXT NOT NULL,
      "paymentIntentId" TEXT, "trackingNumber" TEXT, "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("customerId") REFERENCES "User"("id")
    );`);

    await runRaw(db, `CREATE TABLE "OrderItem" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "orderId" INTEGER NOT NULL, "productId" INTEGER NOT NULL, "artistId" INTEGER NOT NULL,
      "productName" TEXT NOT NULL, "productImage" TEXT,
      "quantity" INTEGER NOT NULL, "unitPrice" REAL NOT NULL, "subtotal" REAL NOT NULL,
      "fulfillmentMode" TEXT NOT NULL, "shippingFee" REAL NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "isStationMerch" INTEGER NOT NULL DEFAULT 0, "isDigital" INTEGER NOT NULL DEFAULT 0,
      "downloadUrl" TEXT,
      FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
      FOREIGN KEY ("productId") REFERENCES "Product"("id"),
      FOREIGN KEY ("artistId") REFERENCES "ArtistProfile"("id")
    );`);

    await runRaw(db, `CREATE TABLE "Cart" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "userId" INTEGER, "sessionId" TEXT, "productId" INTEGER NOT NULL,
      "quantity" INTEGER NOT NULL, "size" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
    );`);

    await runRaw(db, `CREATE TABLE "Review" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "productId" INTEGER NOT NULL, "customerId" INTEGER NOT NULL,
      "rating" INTEGER NOT NULL, "comment" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("productId") REFERENCES "Product("id") ON DELETE CASCADE,
      FOREIGN KEY ("customerId") REFERENCES "User"("id")
    );`);

    await runRaw(db, `CREATE TABLE "Notification" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "userId" INTEGER NOT NULL, "title" TEXT NOT NULL, "message" TEXT NOT NULL,
      "type" TEXT NOT NULL, "isRead" INTEGER NOT NULL DEFAULT 0, "link" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    );`);

    await runRaw(db, `CREATE TABLE "DigitalPurchase" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "userId" INTEGER NOT NULL, "productId" INTEGER NOT NULL, "orderId" INTEGER NOT NULL,
      "downloadUrl" TEXT NOT NULL, "fileName" TEXT, "fileFormat" TEXT,
      "accessCode" TEXT NOT NULL UNIQUE,
      "downloadCount" INTEGER NOT NULL DEFAULT 0, "maxDownloads" INTEGER NOT NULL DEFAULT 10,
      "expiresAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
      FOREIGN KEY ("productId") REFERENCES "Product"("id")
    );`);

    await runRaw(db, `CREATE TABLE "Tip" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "fromUserId" INTEGER, "guestEmail" TEXT, "guestName" TEXT,
      "artistId" INTEGER NOT NULL, "amount" REAL NOT NULL, "message" TEXT,
      "paymentIntentId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("artistId") REFERENCES "ArtistProfile"("id"),
      FOREIGN KEY ("fromUserId") REFERENCES "User"("id")
    );`);

    await runRaw(db, `CREATE TABLE "SiteSetting" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "key" TEXT NOT NULL UNIQUE, "value" TEXT NOT NULL,
      "label" TEXT NOT NULL,
      "group" TEXT NOT NULL DEFAULT 'general',
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);

    await runRaw(db, `CREATE TABLE "Badge" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "type" TEXT NOT NULL UNIQUE, "name" TEXT NOT NULL,
      "icon" TEXT NOT NULL, "description" TEXT NOT NULL,
      "threshold" INTEGER NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);

    await runRaw(db, `CREATE TABLE "UserBadge" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "userId" INTEGER NOT NULL, "badgeId" INTEGER NOT NULL,
      "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
      FOREIGN KEY ("badgeId") REFERENCES "Badge"("id"),
      UNIQUE("userId", "badgeId")
    );`);

    console.log("[SETUP] All 17 tables created successfully");

    // Create admin account
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const admin = await db.user.create({
      data: {
        email: adminEmail.toLowerCase(),
        name: adminName,
        password: hashedPassword,
        role: "ADMIN",
        provider: "credentials",
      },
    });

    // Seed site settings
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
      await db.siteSetting.upsert({
        where: { key: setting.key },
        update: { label: setting.label, group: setting.group },
        create: setting,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized! Admin + settings created on Turso.",
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      settingsSeeded: defaultSettings.length,
    });
  } catch (error) {
    console.error("[SETUP ERROR]", error);
    return NextResponse.json(
      { error: "Setup failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
