"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Music, DollarSign, Heart, Inbox, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MusicSubmission {
  id: string;
  bandName: string;
  email: string;
  city: string;
  genre: string | null;
  status: string;
  createdAt: string;
}

interface SponsorInquiry {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string | null;
  plan: string | null;
  createdAt: string;
}

interface Donation {
  id: string;
  name: string | null;
  email: string | null;
  amount: number;
  tier: string;
  message: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  reviewed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function SubmissionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [musicSubmissions, setMusicSubmissions] = useState<MusicSubmission[]>([]);
  const [sponsorInquiries, setSponsorInquiries] = useState<SponsorInquiry[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [musicRes, sponsorRes, donationRes] = await Promise.all([
        fetch("/api/admin/submissions?type=music"),
        fetch("/api/admin/submissions?type=sponsor"),
        fetch("/api/admin/submissions?type=donation"),
      ]);

      if (musicRes.ok) {
        const data = await musicRes.json();
        setMusicSubmissions(data.submissions || []);
      }
      if (sponsorRes.ok) {
        const data = await sponsorRes.json();
        setSponsorInquiries(data.submissions || []);
      }
      if (donationRes.ok) {
        const data = await donationRes.json();
        setDonations(data.donations || []);
      }
    } catch {
      setError("Failed to load submissions. The database may be unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMusicSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status } : s))
        );
      }
    } catch {
      // silently fail
    } finally {
      setUpdatingId(null);
    }
  };

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);

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
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Submissions</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage music submissions, sponsor inquiries, and donations.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Tabs defaultValue="music">
        <TabsList className="bg-[#12121a] border border-white/10">
          <TabsTrigger value="music" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
            <Music className="mr-1.5 h-4 w-4" />
            Music Submissions
          </TabsTrigger>
          <TabsTrigger value="sponsor" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
            <DollarSign className="mr-1.5 h-4 w-4" />
            Sponsor Inquiries
          </TabsTrigger>
          <TabsTrigger value="donations" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
            <Heart className="mr-1.5 h-4 w-4" />
            Donations
          </TabsTrigger>
        </TabsList>

        {/* Music Submissions Tab */}
        <TabsContent value="music">
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">
                Music Submissions ({musicSubmissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {musicSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Inbox className="mb-3 h-10 w-10 text-slate-600" />
                  <p className="text-sm">No submissions yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-slate-400">Band Name</TableHead>
                        <TableHead className="text-slate-400">Email</TableHead>
                        <TableHead className="text-slate-400 hidden md:table-cell">City</TableHead>
                        <TableHead className="text-slate-400 hidden lg:table-cell">Genre</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-slate-400 hidden sm:table-cell">Date</TableHead>
                        <TableHead className="text-slate-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {musicSubmissions.map((sub) => (
                        <TableRow key={sub.id} className="border-white/5">
                          <TableCell className="font-medium text-white">{sub.bandName}</TableCell>
                          <TableCell className="text-slate-400">{sub.email}</TableCell>
                          <TableCell className="hidden md:table-cell text-slate-400">{sub.city}</TableCell>
                          <TableCell className="hidden lg:table-cell text-slate-400">{sub.genre || "-"}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[sub.status] || statusColors.pending} variant="outline">
                              {sub.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-slate-500 text-xs">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {updatingId === sub.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            ) : (
                              <Select
                                value={sub.status}
                                onValueChange={(val) => updateStatus(sub.id, val)}
                              >
                                <SelectTrigger className="h-8 w-[130px] border-white/10 bg-white/5 text-xs text-slate-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#12121a] border-white/10">
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="reviewed">Reviewed</SelectItem>
                                  <SelectItem value="approved">Approved</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
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
        </TabsContent>

        {/* Sponsor Inquiries Tab */}
        <TabsContent value="sponsor">
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">
                Sponsor Inquiries ({sponsorInquiries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sponsorInquiries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Inbox className="mb-3 h-10 w-10 text-slate-600" />
                  <p className="text-sm">No sponsor inquiries yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-slate-400">Business Name</TableHead>
                        <TableHead className="text-slate-400">Contact</TableHead>
                        <TableHead className="text-slate-400 hidden md:table-cell">Email</TableHead>
                        <TableHead className="text-slate-400 hidden lg:table-cell">Phone</TableHead>
                        <TableHead className="text-slate-400">Plan</TableHead>
                        <TableHead className="text-slate-400 hidden sm:table-cell">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sponsorInquiries.map((inq) => (
                        <TableRow key={inq.id} className="border-white/5">
                          <TableCell className="font-medium text-white">{inq.businessName}</TableCell>
                          <TableCell className="text-slate-400">{inq.contactName}</TableCell>
                          <TableCell className="hidden md:table-cell text-slate-400">{inq.email}</TableCell>
                          <TableCell className="hidden lg:table-cell text-slate-400">{inq.phone || "-"}</TableCell>
                          <TableCell>
                            {inq.plan ? (
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30" variant="outline">
                                {inq.plan}
                              </Badge>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-slate-500 text-xs">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Donations Tab */}
        <TabsContent value="donations">
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-white">
                  Donations ({donations.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Total:</span>
                  <span className="text-lg font-bold text-rose-400">
                    ${totalDonations.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Inbox className="mb-3 h-10 w-10 text-slate-600" />
                  <p className="text-sm">No donations yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-slate-400">Name</TableHead>
                        <TableHead className="text-slate-400 hidden md:table-cell">Email</TableHead>
                        <TableHead className="text-slate-400">Amount</TableHead>
                        <TableHead className="text-slate-400">Tier</TableHead>
                        <TableHead className="text-slate-400 hidden lg:table-cell">Message</TableHead>
                        <TableHead className="text-slate-400 hidden sm:table-cell">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donations.map((don) => (
                        <TableRow key={don.id} className="border-white/5">
                          <TableCell className="font-medium text-white">
                            {don.name || "Anonymous"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-400">
                            {don.email || "-"}
                          </TableCell>
                          <TableCell className="font-bold text-rose-400">
                            ${don.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30" variant="outline">
                              {don.tier}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-slate-400 text-xs max-w-[200px] truncate">
                            {don.message || "-"}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-slate-500 text-xs">
                            {new Date(don.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
