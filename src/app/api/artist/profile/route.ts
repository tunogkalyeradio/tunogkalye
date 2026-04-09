import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// GET /api/artist/profile — fetch artist profile
export async function GET() {
  try {
    const user = await requireRole("ARTIST");

    const profile = await db.artistProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "No artist profile" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/artist/profile — update artist profile
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireRole("ARTIST");

    const profile = await db.artistProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "No artist profile" }, { status: 404 });
    }

    const body = await req.json();
    const {
      bandName,
      realName,
      genre,
      city,
      bio,
      spotifyLink,
      soundcloudLink,
      socialLinks,
      imageUrl,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (bandName !== undefined) updateData.bandName = bandName;
    if (realName !== undefined) updateData.realName = realName;
    if (genre !== undefined) updateData.genre = genre;
    if (city !== undefined) updateData.city = city;
    if (bio !== undefined) updateData.bio = bio;
    if (spotifyLink !== undefined) updateData.spotifyLink = spotifyLink;
    if (soundcloudLink !== undefined) updateData.soundcloudLink = soundcloudLink;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const updated = await db.artistProfile.update({
      where: { userId: user.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
