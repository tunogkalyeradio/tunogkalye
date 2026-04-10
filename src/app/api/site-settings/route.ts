import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Fetch all site settings (public endpoint)
export async function GET() {
  try {
    const settings = await db.siteSetting.findMany({
      select: { key: true, value: true, label: true, group: true },
      orderBy: { key: "asc" },
    });

    // Convert to key-value map for easy frontend use
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({
      settings: settingsMap,
    });
  } catch (error) {
    console.error("[SITE SETTINGS GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch site settings" },
      { status: 500 }
    );
  }
}
