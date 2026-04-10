"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  ShieldCheck,
  ShieldX,
  CheckCircle2,
  XCircle,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Artist {
  id: number;
  bandName: string;
  realName: string;
  genre: string | null;
  city: string;
  isVerified: boolean;
  stripeOnboardingComplete: boolean;
  createdAt: string;
  user: {
    email: string;
    name: string;
  };
  _count: {
    products: number;
    orderItems: number;
  };
}

export default function ArtistsContent({ artists }: { artists: Artist[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [artistStates, setArtistStates] = useState<Record<number, Artist>>(
    Object.fromEntries(artists.map((a) => [a.id, a]))
  );

  const filteredArtists = Object.values(artistStates).filter((artist) => {
    const matchesSearch =
      search === "" ||
      artist.bandName.toLowerCase().includes(search.toLowerCase()) ||
      artist.realName.toLowerCase().includes(search.toLowerCase()) ||
      artist.city.toLowerCase().includes(search.toLowerCase()) ||
      artist.user.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && artist.isVerified) ||
      (statusFilter === "unverified" && !artist.isVerified);

    return matchesSearch && matchesStatus;
  });

  const toggleVerify = (artistId: number) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/artists/${artistId}/verify`, {
          method: "PATCH",
        });
        if (res.ok) {
          setArtistStates((prev) => ({
            ...prev,
            [artistId]: {
              ...prev[artistId],
              isVerified: !prev[artistId].isVerified,
            },
          }));
        }
      } catch {
        // silently fail
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Manage Artists
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {artists.length} total artists &middot;{" "}
            {artists.filter((a) => a.isVerified).length} verified
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search by name, city, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full border-white/10 bg-white/5 text-white sm:w-44">
                <Filter className="mr-2 h-4 w-4 text-slate-500" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#1a1a2e]">
                <SelectItem value="all">All Artists</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="unverified">Unverified Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Artists Table */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">
                    Band / Artist
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-500 md:table-cell">
                    Email
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-500 sm:table-cell">
                    City
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-500">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-center font-medium text-slate-500 sm:table-cell">
                    Products
                  </th>
                  <th className="hidden px-4 py-3 text-center font-medium text-slate-500 lg:table-cell">
                    Stripe
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredArtists.map((artist) => (
                  <tr
                    key={artist.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/20">
                          <Music className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {artist.bandName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {artist.realName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                      {artist.user.email}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 sm:table-cell">
                      {artist.city}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {artist.isVerified ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-white/20 text-slate-400">
                          <XCircle className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-center sm:table-cell">
                      <span className="text-slate-400">
                        {artist._count.products}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-center lg:table-cell">
                      {artist.stripeOnboardingComplete ? (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Connected
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-600">
                          Not set up
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/artists/${artist.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-slate-400 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVerify(artist.id)}
                          disabled={isPending}
                          className={`h-8 ${
                            artist.isVerified
                              ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                              : "text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          }`}
                          title={artist.isVerified ? "Unverify" : "Verify"}
                        >
                          {artist.isVerified ? (
                            <ShieldX className="h-4 w-4" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredArtists.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      {search || statusFilter !== "all"
                        ? "No artists match your filters"
                        : "No artists registered yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
