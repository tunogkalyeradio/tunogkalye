"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, CheckCircle2, Download, Palette, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ArtistInfo {
  id: number;
  bandName: string;
  genre: string | null;
  city: string;
}

const GRADIENTS = [
  { id: "fire", name: "Fire", from: "from-red-600", via: "via-orange-500", to: "to-amber-400", accent: "text-orange-300" },
  { id: "ocean", name: "Ocean", from: "from-purple-700", via: "via-blue-600", to: "to-cyan-400", accent: "text-cyan-300" },
  { id: "forest", name: "Forest", from: "from-emerald-700", via: "via-teal-500", to: "to-green-400", accent: "text-green-300" },
];

export default function MarketingPage() {
  const [artist, setArtist] = useState<ArtistInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [copied, setCopied] = useState(false);

  const fetchArtist = useCallback(async () => {
    try {
      const res = await fetch("/api/artist/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.artistProfile) {
          setArtist({
            id: data.artistProfile.id,
            bandName: data.artistProfile.bandName,
            genre: data.artistProfile.genre,
            city: data.artistProfile.city,
          });
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtist();
  }, [fetchArtist]);

  const storeUrl = artist ? `hub.tunogkalye.net/store/artist/${artist.id}` : "";

  const copyStoreLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${storeUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = `https://${storeUrl}`;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const gradient = GRADIENTS[selectedGradient];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Share2 className="h-12 w-12 text-slate-600" />
        <h2 className="text-xl font-bold text-white">No Artist Profile</h2>
        <p className="text-sm text-slate-400">Complete your profile to access marketing tools.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Marketing Tools</h1>
        <p className="mt-1 text-sm text-slate-400">Generate promotional assets for your merch store</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Preview Card */}
        <Card className="border-white/10 bg-[#12121a]">
          <CardHeader>
            <CardTitle className="text-base text-white">Promo Card Preview</CardTitle>
            <CardDescription>Share this on social media or your website</CardDescription>
          </CardHeader>
          <CardContent>
            {/* The promo card itself */}
            <div
              id="promo-card"
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient.from} ${gradient.via} ${gradient.to} p-6 sm:p-8`}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                {/* Logo area */}
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                    <span className="text-sm font-black text-white">TKR</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                    Tunog Kalye Radio
                  </span>
                </div>

                {/* Header */}
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                    Now Playing on
                  </p>
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                    Tunog Kalye Radio
                  </p>
                </div>

                {/* Band Name */}
                <h2 className="text-3xl font-black text-white sm:text-4xl">
                  {artist.bandName}
                </h2>

                {/* Genre & City */}
                <div className="flex items-center gap-3">
                  {artist.genre && (
                    <Badge className="border-white/30 bg-white/10 text-xs text-white backdrop-blur-sm">
                      {artist.genre}
                    </Badge>
                  )}
                  <span className="text-xs text-white/70">{artist.city}</span>
                </div>

                {/* Store link */}
                <p className="mt-2 rounded-lg bg-black/30 px-4 py-2 text-xs font-mono text-white/90 backdrop-blur-sm">
                  hub.tunogkalye.net/store/artist/{artist.id}
                </p>

                {/* QR Code placeholder */}
                <div className="mt-2 flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-white/30 bg-white/10">
                  <span className="text-[10px] font-medium text-white/50">QR Code</span>
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-slate-500">
              Right-click the card above → &quot;Save as Image&quot; to download
            </p>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-6">
          {/* Style Selector */}
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <Palette className="h-4 w-4 text-purple-400" />
                Style Variation
              </CardTitle>
              <CardDescription>Choose a color theme for your promo card</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {GRADIENTS.map((g, idx) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGradient(idx)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
                      selectedGradient === idx
                        ? "border-white/30 bg-white/5"
                        : "border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className={`h-8 w-full rounded-lg bg-gradient-to-r ${g.from} ${g.to}`} />
                    <span className="text-xs font-medium text-slate-400">{g.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Copy Store Link */}
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader>
              <CardTitle className="text-base text-white">Share Your Store</CardTitle>
              <CardDescription>Share this link everywhere to drive fans to your merch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-slate-300">Your Store URL</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`https://${storeUrl}`}
                    className="border-white/10 bg-white/5 text-sm text-white"
                  />
                  <Button
                    onClick={copyStoreLink}
                    variant="outline"
                    className="shrink-0 border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-blue-500/10 bg-blue-500/5 p-3 text-xs text-blue-400">
                Share this link on Instagram, Facebook, Twitter, and in your music descriptions to drive merch sales.
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader>
              <CardTitle className="text-base text-white">Marketing Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-400">✓</span>
                  <span>Share the promo card when you release new merch</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-400">✓</span>
                  <span>Add your store link to your Spotify/Apple Music bio</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-400">✓</span>
                  <span>Mention &quot;Merch available at Tunog Kalye Hub&quot; during radio interviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-400">✓</span>
                  <span>Create Instagram Stories showing off your merch with the promo card</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
