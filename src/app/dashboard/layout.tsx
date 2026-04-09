import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import DashboardShell from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      }}
    >
      {children}
    </DashboardShell>
  );
}
