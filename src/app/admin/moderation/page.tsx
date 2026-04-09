"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  ShieldAlert,
  Search,
  Flag,
  AlertTriangle,
  EyeOff,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FlaggedProduct {
  id: number;
  name: string;
  category: string;
  isFlagged: boolean;
  flagReason: string | null;
  isActive: boolean;
  updatedAt: string;
  artist: { id: number; bandName: string };
}

interface SearchResult {
  id: number;
  name: string;
  artist: { bandName: string };
}

export default function ModerationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flaggedProducts, setFlaggedProducts] = useState<FlaggedProduct[]>([]);
  const [flaggedCount, setFlaggedCount] = useState(0);

  // Flag product form
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [flagProductId, setFlagProductId] = useState<number | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagging, setFlagging] = useState(false);

  // Actions
  const [actioningId, setActioningId] = useState<number | null>(null);

  const fetchFlagged = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/moderation");
      if (res.ok) {
        const data = await res.json();
        setFlaggedProducts(data.flaggedProducts || []);
        setFlaggedCount(data.flaggedCount || 0);
      } else {
        setError("Failed to load moderation data.");
      }
    } catch {
      setError("Database may be unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlagged();
  }, [fetchFlagged]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/moderation?search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.searchResults || []);
      }
    } catch {
      // silently fail
    } finally {
      setSearching(false);
    }
  };

  const handleFlag = async () => {
    if (!flagProductId || !flagReason.trim()) return;
    setFlagging(true);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: flagProductId, reason: flagReason.trim() }),
      });
      if (res.ok) {
        setFlagProductId(null);
        setFlagReason("");
        setSearchResults([]);
        setSearchQuery("");
        fetchFlagged();
      }
    } catch {
      // silently fail
    } finally {
      setFlagging(false);
    }
  };

  const handleAction = async (id: number, action: string) => {
    setActioningId(id);
    try {
      const res = await fetch(`/api/admin/moderation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setFlaggedProducts((prev) => {
          if (action === "unflag" || action === "dismiss") {
            return prev.filter((p) => p.id !== id);
          }
          if (action === "takedown") {
            return prev.map((p) =>
              p.id === id ? { ...p, isActive: false } : p
            );
          }
          return prev;
        });
        if (action === "unflag" || action === "dismiss") {
          setFlaggedCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch {
      // silently fail
    } finally {
      setActioningId(null);
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
          Content Moderation
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Flag and manage product content across the platform
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Flagged Count */}
      {flaggedCount > 0 && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-yellow-400" />
            <p className="text-sm text-yellow-400 font-medium">
              {flaggedCount} product(s) flagged for review
            </p>
          </div>
        </div>
      )}

      {/* Flag Product Section */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-orange-400" />
            <CardTitle className="text-base">Flag a Product</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="border-white/10 bg-white/5 text-white"
                placeholder="Search products by name..."
              />
            </div>
            <Button
              variant="outline"
              className="border-white/10 text-white hover:bg-white/10"
              onClick={handleSearch}
              disabled={searching}
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {searchResults.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setFlagProductId(r.id);
                    setSearchResults([]);
                  }}
                  className="w-full flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm transition-colors hover:bg-white/10"
                >
                  <span className="text-slate-300">{r.name}</span>
                  <span className="text-xs text-slate-500">{r.artist.bandName}</span>
                </button>
              ))}
            </div>
          )}

          {/* Flag Reason */}
          {flagProductId !== null && (
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3 space-y-3">
              <p className="text-xs font-medium text-orange-400">
                Flagging product ID #{flagProductId}
              </p>
              <div className="space-y-2">
                <Label className="text-sm text-slate-300">Reason for flagging</Label>
                <Textarea
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="border-white/10 bg-white/5 text-white min-h-[60px]"
                  placeholder="Describe the issue..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  className="text-slate-400 hover:text-white"
                  size="sm"
                  onClick={() => {
                    setFlagProductId(null);
                    setFlagReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-orange-600 hover:bg-orange-500 text-white"
                  size="sm"
                  disabled={!flagReason.trim() || flagging}
                  onClick={handleFlag}
                >
                  {flagging && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Flag Product
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flagged Products Table */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">
            Flagged Products ({flaggedCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {flaggedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <ShieldAlert className="mb-3 h-10 w-10 text-slate-600" />
              <p className="text-sm">No flagged products</p>
              <p className="text-xs text-slate-600">
                Use the form above to flag products for review
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-slate-400">Product</TableHead>
                    <TableHead className="text-slate-400 hidden md:table-cell">Artist</TableHead>
                    <TableHead className="text-slate-400 hidden sm:table-cell">Category</TableHead>
                    <TableHead className="text-slate-400">Flag Reason</TableHead>
                    <TableHead className="text-slate-400 hidden sm:table-cell">Date Flagged</TableHead>
                    <TableHead className="text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedProducts.map((product) => (
                    <TableRow key={product.id} className="border-white/5">
                      <TableCell className="font-medium text-white">
                        {product.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-slate-400">
                        {product.artist.bandName}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className="bg-white/10 text-slate-300 border-white/10" variant="outline">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-400 max-w-[200px] truncate" title={product.flagReason || undefined}>
                        {product.flagReason || "-"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-slate-500">
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {actioningId === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        ) : (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10"
                              onClick={() => handleAction(product.id, "unflag")}
                              title="Remove flag"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => handleAction(product.id, "takedown")}
                              title="Take down"
                            >
                              <EyeOff className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-slate-400 hover:text-white hover:bg-white/10"
                              onClick={() => handleAction(product.id, "dismiss")}
                              title="Dismiss"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
