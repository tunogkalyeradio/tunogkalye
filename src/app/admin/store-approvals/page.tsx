"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ArtistStoreApp {
  id: number;
  bandName: string;
  userId: number;
  city: string;
  genre: string | null;
  storeStatus: string;
  storeRejectedReason: string | null;
  createdAt: string;
  user?: { email: string; name: string };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
  REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  SUSPENDED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function StoreApprovalsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [artists, setArtists] = useState<ArtistStoreApp[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/store-approvals");
      if (res.ok) {
        const data = await res.json();
        setArtists(data.artists || []);
        setStats(data.stats || { pending: 0, approved: 0, rejected: 0 });
      } else {
        setError("Failed to load store applications.");
      }
    } catch {
      setError("Database may be unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/store-approvals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (res.ok) {
        setArtists((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, storeStatus: "APPROVED", storeRejectedReason: null }
              : a
          )
        );
        setStats((prev) => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          approved: prev.approved + 1,
        }));
      }
    } catch {
      // silently fail
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/store-approvals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason: rejectReason }),
      });
      if (res.ok) {
        setArtists((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, storeStatus: "REJECTED", storeRejectedReason: rejectReason }
              : a
          )
        );
        setStats((prev) => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          rejected: prev.rejected + 1,
        }));
        setRejectId(null);
        setRejectReason("");
      }
    } catch {
      // silently fail
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Store Approvals
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Review and manage artist store applications
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stats.pending}</p>
                <p className="text-xs text-slate-500">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stats.approved}</p>
                <p className="text-xs text-slate-500">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stats.rejected}</p>
                <p className="text-xs text-slate-500">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="bg-[#12121a] border border-white/10">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
          >
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
          >
            Approved ({stats.approved})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
          >
            Rejected ({stats.rejected})
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
          >
            All ({artists.length})
          </TabsTrigger>
        </TabsList>

        {["pending", "approved", "rejected", "all"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card className="border-white/10 bg-[#12121a]">
              <CardContent className="p-4">
                {(() => {
                  const filtered =
                    tab === "all"
                      ? artists
                      : artists.filter((a) => a.storeStatus === tab.toUpperCase());

                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <Store className="mb-3 h-10 w-10 text-slate-600" />
                        <p className="text-sm">No {tab} applications</p>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-slate-400">Band Name</TableHead>
                            <TableHead className="text-slate-400 hidden md:table-cell">Email</TableHead>
                            <TableHead className="text-slate-400 hidden lg:table-cell">City</TableHead>
                            <TableHead className="text-slate-400 hidden lg:table-cell">Genre</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-slate-400 hidden sm:table-cell">Date Applied</TableHead>
                            <TableHead className="text-slate-400">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map((artist) => (
                            <TableRow key={artist.id} className="border-white/5">
                              <TableCell className="font-medium text-white">
                                {artist.bandName}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-slate-400 text-xs">
                                {artist.user?.email || "-"}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell text-slate-400">
                                {artist.city}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell text-slate-400">
                                {artist.genre || "-"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={statusColors[artist.storeStatus] || statusColors.PENDING}
                                  variant="outline"
                                >
                                  {artist.storeStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-slate-500 text-xs">
                                {new Date(artist.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {processingId === artist.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                ) : artist.storeStatus === "PENDING" ? (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                      onClick={() => handleApprove(artist.id)}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                      onClick={() => setRejectId(artist.id)}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                ) : artist.storeRejectedReason ? (
                                  <span className="text-xs text-slate-500 max-w-[150px] truncate block" title={artist.storeRejectedReason}>
                                    {artist.storeRejectedReason}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-600">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Reject Dialog (inline) */}
      {rejectId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md border-white/10 bg-[#12121a] mx-4">
            <CardHeader>
              <CardTitle className="text-lg text-white">Reject Store Application</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Provide a reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 min-h-[100px]"
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  className="text-slate-400 hover:text-white"
                  onClick={() => {
                    setRejectId(null);
                    setRejectReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-500 text-white"
                  disabled={!rejectReason.trim() || processingId !== null}
                  onClick={() => handleReject(rejectId)}
                >
                  {processingId === rejectId ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Reject Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
