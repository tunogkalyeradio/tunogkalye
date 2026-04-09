import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";

// GET: Fetch user badges + optionally their digital purchases
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const includeDownloads = searchParams.get("downloads") === "true";

    // Fetch earned badges
    const userBadges = await db.userBadge.findMany({
      where: { userId: user.id },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: "desc" },
    });

    // Fetch all available badges
    const allBadges = await db.badge.findMany({
      orderBy: { id: "asc" },
    });

    const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

    let downloads: Array<Record<string, unknown>> = [];
    if (includeDownloads) {
      const digitalPurchases = await db.digitalPurchase.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: { name: true, images: true },
          },
        },
      });

      // Get artist info for each product
      const productIds = digitalPurchases.map((dp) => dp.productId);
      const products = productIds.length > 0
        ? await db.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, artistId: true },
          })
        : [];

      const artistIds = products.map((p) => p.artistId);
      const artistMap = new Map<number, string>();
      if (artistIds.length > 0) {
        const artists = await db.artistProfile.findMany({
          where: { id: { in: artistIds } },
          select: { id: true, bandName: true },
        });
        for (const a of artists) artistMap.set(a.id, a.bandName);
      }

      const productArtistMap = new Map<number, number>();
      for (const p of products) productArtistMap.set(p.id, p.artistId);

      downloads = digitalPurchases.map((dp) => ({
        id: dp.id,
        fileName: dp.fileName,
        fileFormat: dp.fileFormat,
        fileSize: dp.fileSize,
        downloadUrl: dp.downloadUrl,
        downloadCount: dp.downloadCount,
        maxDownloads: dp.maxDownloads,
        createdAt: dp.createdAt.toISOString(),
        product: {
          id: dp.productId,
          name: dp.product.name,
          images: dp.product.images,
        },
        artist: {
          bandName: artistMap.get(productArtistMap.get(dp.productId) || 0) || "Unknown",
        },
      }));
    }

    return NextResponse.json({
      earnedBadges: userBadges,
      allBadges,
      earnedBadgeIds: Array.from(earnedBadgeIds),
      downloads,
    });
  } catch (error) {
    console.error("[BADGES GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}
