import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-utils";
import ArtistShell from "./artist-shell";

export default async function ArtistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await requireRole("ARTIST");
  } catch {
    redirect("/auth/login");
  }

  if (!user.artistProfile) {
    redirect("/dashboard");
  }

  return (
    <ArtistShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bandName: user.artistProfile.bandName,
        isVerified: user.artistProfile.isVerified,
      }}
    >
      {children}
    </ArtistShell>
  );
}
