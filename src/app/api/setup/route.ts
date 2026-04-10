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

// POST: Initialize database with tables and admin account
// Call once: POST /api/setup?key=tunog-kalye-setup-2026
export async function POST(request: globalThis.Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key !== SETUP_KEY) {
      return NextResponse.json({ error: "Invalid setup key" }, { status: 403 });
    }

    const body = await request.json();
    const { adminEmail, adminPassword, adminName } = body;

    if (!adminEmail || !adminPassword || !adminName) {
      return NextResponse.json(
        { error: "adminEmail, adminPassword, and adminName are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Push schema (creates tables)
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "email" TEXT NOT NULL,
          "password" TEXT,
          "name" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
          "phone" TEXT,
          "avatar" TEXT,
          "provider" TEXT NOT NULL DEFAULT 'credentials',
          "address" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
      `);
      console.log("[SETUP] User table created");
    } catch (e: any) {
      console.log("[SETUP] User table:", e.message?.substring(0, 100));
    }

    // Seed site settings table
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SiteSetting" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL,
          "label" TEXT NOT NULL,
          "group" TEXT NOT NULL DEFAULT 'general',
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "SiteSetting_key_key" ON "SiteSetting"("key");
      `);
      console.log("[SETUP] SiteSetting table created");
    } catch (e: any) {
      console.log("[SETUP] SiteSetting table:", e.message?.substring(0, 100));
    }

    // Check if admin already exists
    let admin;
    try {
      admin = await db.user.findUnique({
        where: { email: adminEmail.toLowerCase() },
      });
    } catch (e: any) {
      console.log("[SETUP] Admin check failed:", e.message?.substring(0, 100));
      // Table might not have all columns yet, continue
    }

    if (admin) {
      return NextResponse.json({
        message: "Admin account already exists",
        email: admin.email,
      });
    }

    // Create admin account
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    admin = await db.user.create({
      data: {
        email: adminEmail.toLowerCase(),
        name: adminName,
        password: hashedPassword,
        role: "ADMIN",
        provider: "credentials",
      },
    });

    // Seed default site settings
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
      { key: "sponsor_name_1", value: "", label: "Sponsor Name 1 (Restaurant/Business)", group: "sponsor" },
      { key: "sponsor_link_1", value: "", label: "Sponsor Link 1 (Website URL)", group: "sponsor" },
      { key: "sponsor_description_1", value: "", label: "Sponsor Tagline 1", group: "sponsor" },
      { key: "sponsor_name_2", value: "", label: "Sponsor Name 2", group: "sponsor" },
      { key: "sponsor_link_2", value: "", label: "Sponsor Link 2", group: "sponsor" },
      { key: "sponsor_description_2", value: "", label: "Sponsor Tagline 2", group: "sponsor" },
      { key: "sponsor_name_3", value: "", label: "Sponsor Name 3", group: "sponsor" },
      { key: "sponsor_link_3", value: "", label: "Sponsor Link 3", group: "sponsor" },
      { key: "sponsor_description_3", value: "", label: "Sponsor Tagline 3", group: "sponsor" },
      { key: "sponsor_enabled", value: "true", label: "Show Sponsor Banner on Radio Page", group: "sponsor" },
      { key: "stats_listeners", value: "24/7", label: "Stats: Live Listeners", group: "content" },
      { key: "stats_reach", value: "Worldwide", label: "Stats: Global Reach", group: "content" },
      { key: "stats_artists", value: "Growing", label: "Stats: Indie Artists", group: "content" },
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
      message: "Database initialized successfully! Admin account and site settings created.",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      settingsSeeded: defaultSettings.length,
    });
  } catch (error) {
    console.error("[SETUP ERROR]", error);
    return NextResponse.json(
      { error: "Setup failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  } finally {
    // Ensure PrismaClient is disconnected
  }
}
