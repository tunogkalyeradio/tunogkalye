"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Search,
  Loader2,
  MapPin,
  Music2,
  Send,
  CheckCircle2,
  DollarSign,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Artist {
  id: number;
  bandName: string;
  genre: string | null;
  city: string;
  imageUrl: string | null;
}

interface SentTip {
  id: number;
  amount: number;
  message: string | null;
  createdAt: string;
  artist: {
    bandName: string;
  };
}

const PRESET_AMOUNTS = [5, 10, 25, 50];

export default function TipPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tips, setTips] = useState<SentTip[]>([]);

  // Tip dialog state
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [amount, setAmount] = useState<string>("5");
  const [customAmount, setCustomAmount] = useState("");
  const [tipMessage, setTipMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [tipSuccess, setTipSuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [artistsRes, tipsRes] = await Promise.all([
        fetch("/api/tip"),
        fetch("/api/tip/sent"),
      ]);
      if (artistsRes.ok) {
        const data = await artistsRes.json();
        setArtists(data.artists || []);
      }
      if (tipsRes.ok) {
        const data = await tipsRes.json();
        setTips(data.tips || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredArtists = search.trim()
    ? artists.filter(
        (a) =>
          a.bandName.toLowerCase().includes(search.toLowerCase()) ||
          a.city.toLowerCase().includes(search.toLowerCase()) ||
          (a.genre && a.genre.toLowerCase().includes(search.toLowerCase()))
      )
    : artists;

  const openTipDialog = (artist: Artist) => {
    setSelectedArtist(artist);
    setAmount("5");
    setCustomAmount("");
    setTipMessage("");
    setTipSuccess(false);
    setDialogOpen(true);
  };

  const sendTip = async () => {
    if (!selectedArtist) return;
    const tipAmount = customAmount ? parseFloat(customAmount) : parseFloat(amount);
    if (isNaN(tipAmount) || tipAmount < 1) return;

    setSending(true);
    try {
      const res = await fetch("/api/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: selectedArtist.id,
          amount: tipAmount,
          message: tipMessage.trim() || undefined,
        }),
      });

      if (res.ok) {
        setTipSuccess(true);
        fetchData();
      }
    } catch {
      // ignore
    } finally {
      setSending(false);
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Support Artists
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Send a direct tip to your favorite Filipino indie artists. 100% goes to them.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Search artists by name, genre, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-600"
        />
      </div>

      {/* Artists Grid */}
      {filteredArtists.length === 0 ? (
        <Card className="border-white/10 bg-[#12121a]">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Heart className="h-8 w-8 text-slate-600" />
            <p className="text-sm text-slate-500">
              {search ? "No artists found matching your search." : "No verified artists yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredArtists.map((artist) => (
            <Card key={artist.id} className="border-white/10 bg-[#12121a]">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-lg font-bold text-white">
                  {artist.bandName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="truncate text-sm font-bold text-white">{artist.bandName}</h3>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    {artist.genre && (
                      <span className="flex items-center gap-1">
                        <Music2 className="h-3 w-3" />
                        {artist.genre}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {artist.city}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => openTipDialog(artist)}
                  className="shrink-0 bg-gradient-to-r from-red-600 to-orange-500 text-xs font-bold text-white hover:from-red-500 hover:to-orange-400"
                >
                  <Heart className="mr-1.5 h-3.5 w-3.5" />
                  Tip
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Tips */}
      {tips.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-white">Your Recent Tips</h2>
          <div className="space-y-2">
            {tips.slice(0, 10).map((tip) => (
              <div key={tip.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    {tip.artist.bandName}
                  </p>
                  {tip.message && (
                    <p className="mt-0.5 text-xs text-slate-500 truncate max-w-xs">
                      &ldquo;{tip.message}&rdquo;
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] text-slate-600">
                    {new Date(tip.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-sm font-bold text-green-400">
                  ${tip.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tip Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-white/10 bg-[#12121a] text-white sm:max-w-md">
          {tipSuccess ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Tip Sent!</h3>
                <p className="mt-1 text-sm text-slate-400">
                  100% of your tip goes directly to {selectedArtist?.bandName}.
                </p>
              </div>
              <Button
                onClick={() => setDialogOpen(false)}
                className="bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-500 hover:to-orange-400"
              >
                Done
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-400" />
                  Tip {selectedArtist?.bandName}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  100% goes directly to the artist via Stripe Connect. Zero commission.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {/* Preset amounts */}
                <div className="flex gap-2">
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setAmount(String(preset));
                        setCustomAmount("");
                      }}
                      className={`flex-1 rounded-lg border py-2.5 text-center text-sm font-bold transition-all ${
                        amount === String(preset) && !customAmount
                          ? "border-red-500/30 bg-red-500/10 text-red-400"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Custom Amount ($)</label>
                  <Input
                    type="number"
                    min="1"
                    max="500"
                    placeholder="Enter custom amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      if (e.target.value) setAmount("");
                    }}
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Message (optional)</label>
                  <Textarea
                    placeholder="Keep making great music!"
                    value={tipMessage}
                    onChange={(e) => setTipMessage(e.target.value)}
                    rows={2}
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                  />
                </div>

                <Button
                  onClick={sendTip}
                  disabled={sending || (!customAmount && !amount)}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-500 py-5 font-bold text-white hover:from-red-500 hover:to-orange-400 disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send Tip — ${customAmount || amount}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
