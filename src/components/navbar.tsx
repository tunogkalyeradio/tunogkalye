"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Mic2, DollarSign, Heart, ShoppingBag, LogIn, UserPlus,
  ShieldCheck, Palette, LayoutDashboard, LogOut, ChevronDown,
  Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Role-based dashboard paths ──────────────────────────────────
function getDashboardPath(role?: string) {
  switch (role) {
    case "ADMIN": return "/admin";
    case "ARTIST": return "/artist";
    default: return "/dashboard";
  }
}

function getRoleLabel(role?: string) {
  switch (role) {
    case "ADMIN": return "Admin";
    case "ARTIST": return "Artist";
    default: return "Fan";
  }
}

function getRoleBadgeClass(role?: string) {
  switch (role) {
    case "ADMIN": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "ARTIST": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    default: return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
  }
}


// ─── User Menu (Authenticated) ───────────────────────────────────
function UserMenu() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = (user as { role?: string })?.role;
  const dashboardPath = getDashboardPath(role);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all hover:bg-white/5">
          <Avatar className="h-7 w-7 border border-white/10">
            <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
            <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-500 text-[10px] font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-slate-300 sm:inline">
            {user?.name || "User"}
          </span>
          <Badge className={`hidden border px-1.5 py-0 text-[9px] font-medium sm:inline-flex ${getRoleBadgeClass(role)}`}>
            {getRoleLabel(role)}
          </Badge>
          <ChevronDown className="hidden h-3.5 w-3.5 text-slate-500 sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#12121a]">
        {/* Dashboard link */}
        <DropdownMenuItem asChild>
          <Link href={dashboardPath} className="flex cursor-pointer items-center gap-2 text-slate-300 focus:bg-white/5 focus:text-white">
            {role === "ADMIN" && <ShieldCheck className="h-4 w-4" />}
            {role === "ARTIST" && <Palette className="h-4 w-4" />}
            {role !== "ADMIN" && role !== "ARTIST" && <LayoutDashboard className="h-4 w-4" />}
            <span>My Dashboard</span>
            <Badge className={`ml-auto border px-1 py-0 text-[8px] ${getRoleBadgeClass(role)}`}>
              {getRoleLabel(role)}
            </Badge>
          </Link>
        </DropdownMenuItem>

        {/* Store */}
        <DropdownMenuItem asChild>
          <Link href="/store" className="flex cursor-pointer items-center gap-2 text-slate-300 focus:bg-white/5 focus:text-white">
            <ShoppingBag className="h-4 w-4" />
            <span>Merch Store</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex cursor-pointer items-center gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Auth Buttons (Unauthenticated) ─────────────────────────────
function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:bg-white/5 hover:text-white">
        <Link href="/auth/login" className="flex items-center gap-1.5">
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Sign In</span>
        </Link>
      </Button>
      <Button size="sm" asChild className="bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-sm hover:from-red-500 hover:to-orange-400">
        <Link href="/auth/register" className="flex items-center gap-1.5">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Register</span>
        </Link>
      </Button>
    </div>
  );
}

// ─── MAIN NAVBAR ─────────────────────────────────────────────────
export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = status === "authenticated" && session?.user;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          {/* Horizontal TKR wordmark */}
          <img src="/tunog-kalye-horizontal.png" alt="TKR" className="h-10 w-auto object-contain sm:h-12" />
          {/* Brand name text */}
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-white sm:text-xl">
              TUNOG KALYE<span className="text-red-400"> RADIO</span>
            </span>
          </div>
        </Link>

        {/* Desktop: Center nav + Auth */}
        <div className="hidden items-center gap-1 md:flex">
          <Link href="/#submit" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-red-400" title="Submit Music">
            <Mic2 className="h-4 w-4" />
          </Link>
          <Link href="/#sponsor" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-amber-400" title="Sponsor">
            <DollarSign className="h-4 w-4" />
          </Link>
          <Link href="/#donate" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-rose-400" title="Donate">
            <Heart className="h-4 w-4" />
          </Link>
          <Link href="/store" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-emerald-400" title="Merch Store">
            <ShoppingBag className="h-4 w-4" />
          </Link>

          <div className="mx-2 h-4 w-px bg-white/10" />

          {isAuthenticated ? <UserMenu /> : <AuthButtons />}
        </div>

        {/* Mobile: Hamburger + Auth buttons */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-slate-400 hover:text-white">
                <Link href="/auth/login">
                  <LogIn className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="sm" asChild className="h-8 bg-gradient-to-r from-red-600 to-orange-500 px-3 text-white">
                <Link href="/auth/register" className="text-xs font-bold">
                  Register
                </Link>
              </Button>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-[#0a0a0f] md:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-3 sm:px-6">
            <Link
              href="/#submit"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-red-400"
            >
              <Mic2 className="h-4 w-4" /> Submit Music
            </Link>
            <Link
              href="/#sponsor"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-amber-400"
            >
              <DollarSign className="h-4 w-4" /> Sponsor
            </Link>
            <Link
              href="/#donate"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-rose-400"
            >
              <Heart className="h-4 w-4" /> Donate
            </Link>
            <Link
              href="/store"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-emerald-400"
            >
              <ShoppingBag className="h-4 w-4" /> Merch Store
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
