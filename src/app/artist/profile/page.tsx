"use client";

import { useEffect, useState } from "react";
import {
  User,
  Loader2,
  Save,
  CheckCircle2,
  Clock,
} from "lucide-react";
import ImageUpload from "@/components/image-upload";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ArtistProfileData {
  bandName: string;
  realName: string;
  genre: string | null;
  city: string;
  bio: string | null;
  spotifyLink: string | null;
  soundcloudLink: string | null;
  socialLinks: string | null;
  imageUrl: string | null;
  isVerified: boolean;
  stripeOnboardingComplete: boolean;
}

function parseSocialLinks(socialLinks: string | null): Record<string, string> {
  if (!socialLinks) return {};
  try {
    return JSON.parse(socialLinks);
  } catch {
    return {};
  }
}

export default function ArtistProfilePage() {
  const [profile, setProfile] = useState<ArtistProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [bandName, setBandName] = useState("");
  const [realName, setRealName] = useState("");
  const [genre, setGenre] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [spotifyLink, setSpotifyLink] = useState("");
  const [soundcloudLink, setSoundcloudLink] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [otherLinks, setOtherLinks] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/artist/profile");
      if (res.ok) {
        const data: ArtistProfileData = await res.json();
        setProfile(data);
        setBandName(data.bandName);
        setRealName(data.realName);
        setGenre(data.genre || "");
        setCity(data.city);
        setBio(data.bio || "");
        setSpotifyLink(data.spotifyLink || "");
        setSoundcloudLink(data.soundcloudLink || "");
        setImageUrl(data.imageUrl || "");

        const social = parseSocialLinks(data.socialLinks);
        setFacebook(social.facebook || "");
        setInstagram(social.instagram || "");
        setTiktok(social.tiktok || "");
        setOtherLinks(social.other || "");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!bandName.trim() || !realName.trim() || !city.trim()) {
      setError("Band name, real name, and city are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    const socialLinks: Record<string, string> = {};
    if (facebook.trim()) socialLinks.facebook = facebook.trim();
    if (instagram.trim()) socialLinks.instagram = instagram.trim();
    if (tiktok.trim()) socialLinks.tiktok = tiktok.trim();
    if (otherLinks.trim()) socialLinks.other = otherLinks.trim();

    try {
      const res = await fetch("/api/artist/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bandName: bandName.trim(),
          realName: realName.trim(),
          genre: genre.trim() || null,
          city: city.trim(),
          bio: bio.trim() || null,
          spotifyLink: spotifyLink.trim() || null,
          soundcloudLink: soundcloudLink.trim() || null,
          socialLinks: Object.keys(socialLinks).length > 0 ? JSON.stringify(socialLinks) : null,
          imageUrl: imageUrl.trim() || null,
        }),
      });

      if (res.ok) {
        setSaved(true);
        const data = await res.json();
        setProfile(data);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Profile
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your artist profile and public information
          </p>
        </div>
        {profile?.isVerified && (
          <Badge className="border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400">
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Verified Artist
          </Badge>
        )}
      </div>

      {!profile?.isVerified && profile && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              Verification Pending
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Your account is awaiting verification by the Tunog Kalye admin
              team. You can still update your profile in the meantime.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          Profile saved successfully!
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <User className="h-4 w-4 text-blue-400" />
                Basic Info
              </CardTitle>
              <CardDescription>
                Your public artist information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">
                    Band Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={bandName}
                    onChange={(e) => setBandName(e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">
                    Real Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">Genre</Label>
                  <Input
                    placeholder="e.g., Alt-Rock, Indie, Post-Rock"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">
                    City <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Manila, QC"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-slate-300">Bio</Label>
                <Textarea
                  placeholder="Tell your fans about your band..."
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader>
              <CardTitle className="text-base text-white">
                Music & Social Links
              </CardTitle>
              <CardDescription>
                Where fans can find your music and follow you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">Spotify Link</Label>
                  <Input
                    placeholder="https://open.spotify.com/..."
                    value={spotifyLink}
                    onChange={(e) => setSpotifyLink(e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">
                    SoundCloud Link
                  </Label>
                  <Input
                    placeholder="https://soundcloud.com/..."
                    value={soundcloudLink}
                    onChange={(e) => setSoundcloudLink(e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">
                    Facebook Link
                  </Label>
                  <Input
                    placeholder="https://facebook.com/..."
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">
                    Instagram Link
                  </Label>
                  <Input
                    placeholder="https://instagram.com/..."
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">TikTok Link</Label>
                  <Input
                    placeholder="https://tiktok.com/@..."
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-300">
                    Other Link (YouTube, etc.)
                  </Label>
                  <Input
                    placeholder="https://..."
                    value={otherLinks}
                    onChange={(e) => setOtherLinks(e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Image */}
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader>
              <CardTitle className="text-base text-white">
                Profile Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={imageUrl}
                onChange={(url) => setImageUrl(typeof url === "string" ? url : url[0] || "")}
                label="Upload a profile photo"
                accent="blue"
              />
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="border-white/10 bg-[#12121a]">
            <CardHeader>
              <CardTitle className="text-base text-white">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Verification</span>
                <Badge
                  className={
                    profile?.isVerified
                      ? "border-green-500/30 bg-green-500/10 text-green-400"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  }
                >
                  {profile?.isVerified ? "Verified" : "Pending"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Stripe</span>
                <Badge
                  className={
                    profile?.stripeOnboardingComplete
                      ? "border-green-500/30 bg-green-500/10 text-green-400"
                      : "border-white/10 text-slate-400"
                  }
                >
                  {profile?.stripeOnboardingComplete
                    ? "Connected"
                    : "Not Connected"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-5 text-base font-bold text-white hover:from-blue-400 hover:to-purple-400 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
