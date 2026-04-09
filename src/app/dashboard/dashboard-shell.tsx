"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Star,
  Settings,
  Radio,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/notification-bell";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role?: string;
    avatar?: string | null;
  };
}

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Orders", href: "/dashboard/orders", icon: Package },
  { label: "My Cart", href: "/dashboard/cart", icon: ShoppingCart },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "My Reviews", href: "/dashboard/reviews", icon: Star },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "TK";

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#0d0d14] transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-500">
              <Radio className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight">TUNOG KALYE</span>
              <span className="ml-1 text-xs text-red-400">RADIO</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Separator className="bg-white/5" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-red-500/10 to-orange-500/10 text-white border border-red-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-red-400" : "text-slate-500"
                  )}
                />
                {item.label}
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4 text-red-400/60" />
                )}
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-white/5" />

        {/* Sidebar footer */}
        <div className="p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-3">
            <Avatar className="h-9 w-9 border border-white/10">
              <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-500 text-xs font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-sm font-medium text-white">{user.name}</div>
              <div className="truncate text-xs text-slate-500">
                {user.role === "ARTIST" ? "Artist" : "Fan"}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-1 w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-slate-400 hover:bg-white/5 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0a0a0f]/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7 border border-white/10 sm:hidden">
                <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-500 text-[10px] font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium text-slate-300 sm:inline">
                Welcome back, <span className="text-white">{user.name}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <Radio className="mr-1.5 h-3.5 w-3.5 text-red-400" />
                <span className="hidden sm:inline">Back to Station</span>
                <span className="sm:hidden">Station</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs text-slate-400 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
