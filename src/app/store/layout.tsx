import { Radio, ShoppingCart, ArrowLeft, LogIn, User } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth-utils";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = session?.user;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Left: Back to Hub */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Hub</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <Link
              href="/store"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-500">
                <Radio className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">
                MERCH <span className="text-red-400">STORE</span>
              </span>
            </Link>
          </div>

          {/* Right: Cart + Auth */}
          <div className="flex items-center gap-2">
            <Link
              href="/store"
              className="relative flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-white/20 hover:text-white"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              <StoreCartBadge userId={user?.id ? parseInt(user.id, 10) : null} />
            </Link>

            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-white/20 hover:text-white"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name || "Account"}</span>
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-white/20 hover:text-white"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-black/20 mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-red-400" />
              <span className="text-sm text-slate-500">
                Tunog Kalye Radio &copy; 2026. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/store"
                className="text-xs text-slate-600 transition-colors hover:text-slate-400"
              >
                Merch Store
              </Link>
              <span className="text-slate-700">|</span>
              <Link
                href="/"
                className="text-xs text-slate-600 transition-colors hover:text-slate-400"
              >
                Back to Hub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

async function StoreCartBadge({ userId }: { userId: number | null }) {
  let count = 0;

  if (userId) {
    try {
      const { db } = await import("@/lib/db");
      count = await db.cart.count({
        where: { userId },
      });
    } catch {
      // silently fail
    }
  }

  if (count === 0) return null;

  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
