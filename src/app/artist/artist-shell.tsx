"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  User,
  CreditCard,
  Radio,
  LogOut,
  Menu,
  X,
  BadgeCheck,
  ChevronRight,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/artist", label: "Overview", icon: LayoutDashboard },
  { href: "/artist/products", label: "My Merch", icon: Package },
  { href: "/artist/orders", label: "Orders", icon: ShoppingCart },
  { href: "/artist/earnings", label: "Earnings", icon: DollarSign },
  { href: "/artist/profile", label: "Profile", icon: User },
  { href: "/artist/stripe", label: "Stripe Setup", icon: CreditCard },
];

function SidebarContent({
  pathname,
  onNavigate,
  bandName,
  isVerified,
  onClose,
}: {
  pathname: string;
  onNavigate?: () => void;
  bandName: string;
  isVerified: boolean;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
          <Music className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-white">
            TUNOG KALYE
            <span className="text-purple-400"> RADIO</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
            Artist Hub
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Separator className="bg-white/5" />

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {sidebarItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/artist" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-blue-400" : "text-slate-500"
                )}
              />
              {item.label}
              {isActive && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-white/5" />

      {/* User section */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-white/10">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
              {bandName?.charAt(0)?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-medium text-white">
                {bandName || "Artist"}
              </p>
              {isVerified && (
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Music className="h-3 w-3 text-purple-400" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Artist
              </span>
              {isVerified && (
                <Badge className="ml-1 border-blue-500/30 bg-blue-500/10 px-1.5 py-0 text-[9px] font-medium text-blue-400">
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="mt-3 w-full justify-start gap-2 text-slate-500 hover:bg-white/5 hover:text-purple-400"
          size="sm"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function ArtistShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    bandName: string;
    isVerified: boolean;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-white">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/10 bg-[#0d0d14] lg:block">
        <SidebarContent
          pathname={pathname}
          bandName={user.bandName}
          isVerified={user.isVerified}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-white/10 bg-[#0d0d14]">
            <SidebarContent
              pathname={pathname}
              bandName={user.bandName}
              isVerified={user.isVerified}
              onNavigate={() => setSidebarOpen(false)}
              onClose={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/10 bg-[#0a0a0f]/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Music className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-sm font-medium text-white">
                {user.bandName}
              </span>
            </div>
            {user.isVerified && (
              <Badge className="border-blue-500/30 bg-blue-500/10 px-1.5 py-0 text-[10px] font-medium text-blue-400">
                <BadgeCheck className="mr-0.5 h-3 w-3" /> Verified
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-white"
              >
                <Radio className="mr-1.5 h-4 w-4 text-purple-400" />
                <span className="hidden sm:inline">View Site</span>
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6 bg-white/10" />
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="rounded-lg p-2 text-slate-500 hover:bg-white/10 hover:text-purple-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
