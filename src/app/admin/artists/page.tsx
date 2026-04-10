import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import ArtistsContent from "./artists-content";

export default async function ArtistsPage() {
  try {
    await requireRole("ADMIN");
  } catch {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-400">Not authorized. Admin access required.</p>
      </div>
    );
  }

  let artists: any[] = [];
  try {
    artists = await db.artistProfile.findMany({
      include: {
        user: {
          select: { email: true, name: true },
        },
        _count: {
          select: { products: true, orderItems: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[ArtistsPage] Error fetching artists:", error);
    artists = [];
  }

  // Serialize dates for client component
  const serializedArtists = artists.map((a: any) => ({
    ...a,
    createdAt: a.createdAt
      ? new Date(a.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: a.updatedAt
      ? new Date(a.updatedAt).toISOString()
      : new Date().toISOString(),
    user: a.user
      ? { ...a.user }
      : { email: "", name: "Unknown" },
    isVerified: a.isVerified ?? false,
    stripeOnboardingComplete: a.stripeOnboardingComplete ?? false,
    storeStatus: a.storeStatus || "PENDING",
    _count: a._count || { products: 0, orderItems: 0 },
  }));

  return <ArtistsContent artists={serializedArtists} />;
}
