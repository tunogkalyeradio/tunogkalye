"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Heart,
  Plus,
  AlertCircle,
  DollarSign,
  PiggyBank,
  Users,
  Gift,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface FundEntry {
  id: number;
  source: string;
  description: string;
  amount: number;
  quarter: string;
  createdAt: string;
}

interface Summary {
  currentQuarter: string;
  currentQuarterTotal: number;
  allTimeTotal: number;
  sponsorshipTotal: number;
  donationTotal: number;
  otherTotal: number;
  entryCount: number;
}

interface QuarterBreakdown {
  quarter: string;
  total: number;
}

function getCurrentQuarter() {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${q}-${now.getFullYear()}`;
}

export default function KantoFundPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState<FundEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [quarterlyBreakdown, setQuarterlyBreakdown] = useState<QuarterBreakdown[]>([]);
  const [saving, setSaving] = useState(false);

  // Form
  const [formSource, setFormSource] = useState("Sponsorship");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/kanto-fund");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setSummary(data.summary || null);
        setQuarterlyBreakdown(data.quarterlyBreakdown || []);
      } else {
        setError("Failed to load fund data.");
      }
    } catch {
      setError("Database may be unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!formDescription.trim() || !formAmount || parseFloat(formAmount) <= 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/kanto-fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: formSource,
          description: formDescription.trim(),
          amount: parseFloat(formAmount),
          quarter: getCurrentQuarter(),
        }),
      });
      if (res.ok) {
        setFormDescription("");
        setFormAmount("");
        fetchData();
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Kanto Fund</h1>
          <p className="mt-1 text-sm text-slate-400">Track fund contributions and allocation</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  const maxQuarterly = Math.max(...quarterlyBreakdown.map((q) => q.total), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Kanto Fund</h1>
        <p className="mt-1 text-sm text-slate-400">
          Track contributions from sponsorships, donations, and other sources
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section 1: Manual Entry */}
        <Card className="border-white/10 bg-[#12121a]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-red-400" />
              <CardTitle className="text-base">Add Fund Entry</CardTitle>
            </div>
            <CardDescription className="text-slate-500">
              Manually record a new fund contribution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Source</Label>
              <Select value={formSource} onValueChange={setFormSource}>
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  <SelectItem value="Sponsorship">Sponsorship</SelectItem>
                  <SelectItem value="Donation">Donation</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Description</Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="border-white/10 bg-white/5 text-white"
                placeholder="e.g., Monthly sponsorship from ABC Corp"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Amount (₱)</Label>
              <Input
                type="number"
                step="0.01"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="border-white/10 bg-white/5 text-white"
                placeholder="0.00"
              />
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-2">
              <p className="text-xs text-slate-500">
                Quarter: <span className="text-white font-medium">{getCurrentQuarter()}</span>
              </p>
            </div>
            <Button
              onClick={handleAdd}
              disabled={saving || !formDescription.trim() || !formAmount || parseFloat(formAmount) <= 0}
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-500 hover:to-orange-400"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Entry
            </Button>
          </CardContent>
        </Card>

        {/* Section 2: Fund Overview */}
        <Card className="border-white/10 bg-[#12121a]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-red-400" />
              <CardTitle className="text-base">Fund Overview</CardTitle>
            </div>
            <CardDescription className="text-slate-500">
              Summary of the Kanto Fund
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <p className="text-xs text-slate-500">Current Quarter</p>
                    <p className="text-lg font-bold text-white">
                      {formatPeso(summary.currentQuarterTotal)}
                    </p>
                    <Badge className="mt-1 bg-red-500/20 text-red-400 border-red-500/30 text-[10px]" variant="outline">
                      {summary.currentQuarter}
                    </Badge>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <p className="text-xs text-slate-500">All-Time Total</p>
                    <p className="text-lg font-bold text-white">
                      {formatPeso(summary.allTimeTotal)}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">{summary.entryCount} entries</p>
                  </div>
                </div>

                <Separator className="bg-white/5" />

                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500">Breakdown by Source</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-sm text-slate-300">Sponsorships</span>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {formatPeso(summary.sponsorshipTotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="h-3.5 w-3.5 text-rose-400" />
                        <span className="text-sm text-slate-300">Donations</span>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {formatPeso(summary.donationTotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="text-sm text-slate-300">Other</span>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {formatPeso(summary.otherTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quarterly History Bar Chart */}
      {quarterlyBreakdown.length > 0 && (
        <Card className="border-white/10 bg-[#12121a]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-400" />
              <CardTitle className="text-base">Quarterly History</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-end gap-3 h-48">
              {[...quarterlyBreakdown].reverse().map((q) => {
                const height = Math.max((q.total / maxQuarterly) * 100, 3);
                return (
                  <div key={q.quarter} className="group flex flex-1 flex-col items-center gap-1">
                    <div className="flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-red-400">
                        {formatPeso(q.total)}
                      </span>
                    </div>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-red-600 to-orange-500"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[9px] text-slate-500">{q.quarter}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Entries Table */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">
            All Entries ({entries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <PiggyBank className="mb-3 h-10 w-10 text-slate-600" />
              <p className="text-sm">No fund entries yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent sticky top-0 bg-[#12121a]">
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-slate-400">Source</TableHead>
                    <TableHead className="text-slate-400">Description</TableHead>
                    <TableHead className="text-slate-400">Amount</TableHead>
                    <TableHead className="text-slate-400 hidden sm:table-cell">Quarter</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id} className="border-white/5">
                      <TableCell className="text-xs text-slate-500">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            entry.source === "Sponsorship"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : entry.source === "Donation"
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                              : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                          }
                          variant="outline"
                        >
                          {entry.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-300 max-w-[250px] truncate">
                        {entry.description}
                      </TableCell>
                      <TableCell className="font-bold text-white">
                        {formatPeso(entry.amount)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-slate-500 text-xs">
                        {entry.quarter}
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
