import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// CORS headers for cross-origin requests from AzuraCast
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Cache-Control",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET: Public endpoint — returns sponsor data for the AzuraCast widget
// No authentication required. Called from tunogkalye.net/public/tunog-kalye
export async function GET() {
  try {
    const settings = await db.siteSetting.findMany({
      where: {
        OR: [
          { key: { startsWith: "sponsor_" } },
          { key: "station_name" },
        ],
      },
      select: { key: true, value: true },
    });

    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }

    // Build sponsor list (only return sponsors that have a name)
    const sponsors: { name: string; link: string; description: string }[] = [];
    for (let i = 1; i <= 3; i++) {
      const name = map[`sponsor_name_${i}`];
      if (name && name.trim()) {
        sponsors.push({
          name: name.trim(),
          link: (map[`sponsor_link_${i}`] || "").trim(),
          description: (map[`sponsor_description_${i}`] || "").trim(),
        });
      }
    }

    return NextResponse.json(
      {
        station_name: map.station_name || "Tunog Kalye Radio",
        sponsor_enabled: map.sponsor_enabled !== "false",
        sponsors,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("[SPONSOR WIDGET GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch sponsor data" },
      { status: 500, headers: corsHeaders }
    );
  }
}
