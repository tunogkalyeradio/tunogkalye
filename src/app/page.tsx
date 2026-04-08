"use client";

import { useState, useCallback } from "react";
import {
  Mic2,
  Radio,
  Heart,
  ChevronRight,
  ChevronLeft,
  Music,
  Send,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Users,
  Headphones,
  Globe,
  BarChart3,
  CreditCard,
  Coffee,
  Zap,
  Star,
  ArrowRight,
  ExternalLink,
  Volume2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ─── Types ───────────────────────────────────────────────
type FunnelId = "home" | "submit" | "sponsor" | "donate";
type FunnelStep = number;

interface FormData {
  bandName: string;
  realName: string;
  email: string;
  spotifyLink: string;
  soundcloudLink: string;
  city: string;
  genre: string;
  message: string;
}

// ─── Icons mapped to funnels ─────────────────────────────
const funnelMeta = {
  submit: {
    label: "Submit Your Music",
    icon: Mic2,
    color: "from-red-600 to-orange-500",
    hoverBorder: "hover:border-red-500/50",
    accent: "text-red-400",
    badge: "bg-red-500/20 text-red-400",
    ring: "ring-red-500/30",
    btnGradient: "bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400",
  },
  sponsor: {
    label: "Sponsor My Station",
    icon: DollarSign,
    color: "from-amber-500 to-yellow-400",
    hoverBorder: "hover:border-amber-500/50",
    accent: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-400",
    ring: "ring-amber-500/30",
    btnGradient: "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black",
  },
  donate: {
    label: "Support the Kanto",
    icon: Heart,
    color: "from-rose-500 to-pink-400",
    hoverBorder: "hover:border-rose-500/50",
    accent: "text-rose-400",
    badge: "bg-rose-500/20 text-rose-400",
    ring: "ring-rose-500/30",
    btnGradient: "bg-gradient-to-r from-rose-500 to-pink-400 hover:from-rose-400 hover:to-pink-300",
  },
};

// ═══════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════
export default function TunogKalyeFunnels() {
  const [activeFunnel, setActiveFunnel] = useState<FunnelId>("home");
  const [funnelStep, setFunnelStep] = useState<FunnelStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const navigateTo = useCallback((funnel: FunnelId) => {
    setActiveFunnel(funnel);
    setFunnelStep(1);
    setSubmitResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goHome = useCallback(() => {
    setActiveFunnel("home");
    setFunnelStep(1);
    setSubmitResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ─── NAVBAR ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={goHome}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-500">
              <Radio className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              TUNOG KALYE<span className="text-red-400"> RADIO</span>
            </span>
          </button>

          {activeFunnel !== "home" && (
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={goHome}
                className="text-slate-400 transition-colors hover:text-white"
              >
                Funnels
              </button>
              <ChevronRight className="h-4 w-4 text-slate-600" />
              <span className="font-medium text-white">
                {funnelMeta[activeFunnel as keyof typeof funnelMeta]?.label}
              </span>
              {funnelStep > 1 && (
                <>
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                  <span className="text-slate-400">Step {funnelStep}</span>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ─── MAIN CONTENT ───────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {activeFunnel === "home" && <HomePage onSelect={navigateTo} />}
        {activeFunnel === "submit" && (
          <SubmitFunnel
            step={funnelStep}
            setStep={setFunnelStep}
            goHome={goHome}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            submitResult={submitResult}
            setSubmitResult={setSubmitResult}
          />
        )}
        {activeFunnel === "sponsor" && (
          <SponsorFunnel
            step={funnelStep}
            setStep={setFunnelStep}
            goHome={goHome}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            submitResult={submitResult}
            setSubmitResult={setSubmitResult}
          />
        )}
        {activeFunnel === "donate" && (
          <DonateFunnel
            step={funnelStep}
            setStep={setFunnelStep}
            goHome={goHome}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            submitResult={submitResult}
            setSubmitResult={setSubmitResult}
          />
        )}
      </main>

      {/* ─── FOOTER ─────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-black/20 mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-red-400" />
              <span className="text-sm text-slate-500">
                Tunog Kalye Radio &copy; 2026. All rights reserved.
              </span>
            </div>
            <div className="flex gap-4 text-xs text-slate-600">
              <span>tunogkalye.net</span>
              <span className="text-slate-700">|</span>
              <span>video.tunogkalye.net</span>
              <span className="text-slate-700">|</span>
              <span>Surrey, BC, Canada</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════════════════════
function HomePage({ onSelect }: { onSelect: (f: FunnelId) => void }) {
  return (
    <div className="flex flex-col gap-12">
      {/* ─── HERO SECTION ──────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/80 via-[#0a0a0f]/90 to-orange-950/60" />
        {typeof window !== "undefined" && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: "url('/tunog-kalye-hero.jpg')" }}
          />
        )}
        <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-24 lg:py-28">
          <Badge className="mb-4 border-red-500/30 bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400 backdrop-blur-sm">
            <Volume2 className="mr-1 h-3 w-3" />
            24/7 GLOBAL BROADCAST
          </Badge>
          <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            TUNOG KALYE{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              RADIO
            </span>
          </h1>
          <p className="mb-2 max-w-2xl text-lg text-slate-300 sm:text-xl">
            The Premier Grassroots Broadcasting Network for Filipino Independent
            Music
          </p>
          <p className="max-w-xl text-sm text-slate-500">
            Bridging the golden era of 90s Pinoy Rock with the modern indie
            movement. Curated by humans, not algorithms.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              onClick={() => onSelect("submit")}
              size="lg"
              className="bg-gradient-to-r from-red-600 to-orange-500 px-6 font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400"
            >
              <Mic2 className="mr-2 h-5 w-5" />
              Submit Your Music
            </Button>
            <Button
              onClick={() => onSelect("donate")}
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
            >
              <Heart className="mr-2 h-5 w-5 text-rose-400" />
              Support the Station
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FUNNEL CARDS ───────────────────────────────── */}
      <section>
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Choose Your Path
          </h2>
          <p className="text-sm text-slate-500">
            Whether you&apos;re an artist, a sponsor, or a fan — there&apos;s a
            place for you at the Kanto.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Submit Music */}
          <Card
            onClick={() => onSelect("submit")}
            className={`group cursor-pointer border-white/10 bg-[#12121a] transition-all duration-300 hover:border-red-500/40 hover:bg-[#14141f] hover:shadow-lg hover:shadow-red-500/5`}
          >
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 shadow-lg shadow-red-500/20">
                <Mic2 className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-white">
                Submit Your Music
              </CardTitle>
              <CardDescription className="text-slate-400">
                Get your music played on 24/7 global radio. We&apos;re always
                looking for fresh Filipino talent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  100% copyright retained
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Non-exclusive broadcasting rights
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Reviewed within one week
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${funnelMeta.submit.btnGradient} font-bold text-white`}
              >
                Start Submission
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: Sponsor */}
          <Card
            onClick={() => onSelect("sponsor")}
            className={`group cursor-pointer border-white/10 bg-[#12121a] transition-all duration-300 hover:border-amber-500/40 hover:bg-[#14141f] hover:shadow-lg hover:shadow-amber-500/5`}
          >
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 shadow-lg shadow-amber-500/20">
                <DollarSign className="h-6 w-6 text-black" />
              </div>
              <CardTitle className="text-lg text-white">
                Sponsor My Station
              </CardTitle>
              <CardDescription className="text-slate-400">
                Reach the Filipino diaspora and 90s OPM lovers with targeted
                advertising.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  On-air shoutouts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Website banner placement
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Plans from $50/month
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${funnelMeta.sponsor.btnGradient} font-bold`}
              >
                View Packages
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Card 3: Donate */}
          <Card
            onClick={() => onSelect("donate")}
            className={`group cursor-pointer border-white/10 bg-[#12121a] transition-all duration-300 hover:border-rose-500/40 hover:bg-[#14141f] hover:shadow-lg hover:shadow-rose-500/5`}
          >
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-400 shadow-lg shadow-rose-500/20">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-white">
                Support the Kanto
              </CardTitle>
              <CardDescription className="text-slate-400">
                Keep independent OPM alive. Every contribution goes directly to
                the artists and the station.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Zero commission to artists
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Funds the Kanto Fund
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Starting from $5
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${funnelMeta.donate.btnGradient} font-bold text-white`}
              >
                Support Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* ─── STATS BAR ──────────────────────────────────── */}
      <section className="rounded-2xl border border-white/10 bg-[#12121a] p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: "Live Listeners", value: "24/7", icon: Headphones },
            { label: "Global Reach", value: "Worldwide", icon: Globe },
            { label: "Indie Artists", value: "Growing", icon: Music },
            { label: "Commission", value: "0%", icon: Star },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="mx-auto mb-2 h-5 w-5 text-red-400" />
              <div className="text-xl font-bold text-white sm:text-2xl">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FUNNEL 1: SUBMIT YOUR MUSIC
// ═══════════════════════════════════════════════════════════
function SubmitFunnel({
  step,
  setStep,
  goHome,
  isSubmitting,
  setIsSubmitting,
  submitResult,
  setSubmitResult,
}: {
  step: number;
  setStep: (s: number) => void;
  goHome: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (b: boolean) => void;
  submitResult: { success: boolean; message: string } | null;
  setSubmitResult: (r: { success: boolean; message: string } | null) => void;
}) {
  const [form, setForm] = useState<FormData>({
    bandName: "",
    realName: "",
    email: "",
    spotifyLink: "",
    soundcloudLink: "",
    city: "",
    genre: "",
    message: "",
  });

  const updateField = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.bandName || !form.realName || !form.email || !form.city) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setSubmitResult({ success: res.ok, message: data.message || data.error });
      if (res.ok) setStep(3);
    } catch {
      setSubmitResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Step 1: Hook / Landing ────────────────────────────
  if (step === 1) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-white/10 bg-[#12121a] overflow-hidden">
          <div className="relative px-6 py-12 sm:px-12 sm:py-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 to-orange-950/30" />
            <div className="relative z-10">
              <Badge className="mb-4 border-red-500/30 bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                <Mic2 className="mr-1 h-3 w-3" />
                ARTIST SUBMISSIONS OPEN
              </Badge>
              <h2 className="mb-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                ATTENTION LOCAL{" "}
                <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                  PINOY BANDS
                </span>
              </h2>
              <p className="mb-6 text-xl text-slate-300">
                Get your music played on{" "}
                <span className="font-bold text-white">24/7 Global Radio</span>.
              </p>

              <div className="mx-auto mb-8 max-w-lg space-y-3 text-left">
                {[
                  "You keep 100% of your copyrights. Always.",
                  "We only need non-exclusive digital broadcasting rights.",
                  "Your song gets reviewed by real DJs, not algorithms.",
                  "Once approved, we'll notify you the moment it airs.",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={() => setStep(2)}
                className="bg-gradient-to-r from-red-600 to-orange-500 px-8 text-lg font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400"
              >
                <Send className="mr-2 h-5 w-5" />
                Submit Your Demo Now
              </Button>
              <p className="mt-3 text-xs text-slate-600">
                Takes less than 2 minutes. We review every submission.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { num: "100+", label: "Artists in Queue" },
            { num: "0", label: "Commission Taken" },
            { num: "1 Week", label: "Review Time" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/5 bg-[#12121a] p-4">
              <div className="text-xl font-bold text-red-400">{s.num}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Step 2: Form ──────────────────────────────────────
  if (step === 2) {
    return (
      <div className="mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => setStep(1)}
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        <div className="rounded-2xl border border-white/10 bg-[#12121a] p-6 sm:p-8">
          <h2 className="mb-1 text-2xl font-bold">Tell Us About Your Band</h2>
          <p className="mb-6 text-sm text-slate-400">
            Fill out the form below. Fields marked with * are required.
          </p>

          {submitResult && !submitResult.success && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {submitResult.message}
            </div>
          )}

          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bandName" className="text-sm text-slate-300">
                  Band Name *
                </Label>
                <Input
                  id="bandName"
                  placeholder="e.g., The Juan dela Cruz Band"
                  value={form.bandName}
                  onChange={(e) => updateField("bandName", e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="realName" className="text-sm text-slate-300">
                  Your Real Name *
                </Label>
                <Input
                  id="realName"
                  placeholder="e.g., Maria Santos"
                  value={form.realName}
                  onChange={(e) => updateField("realName", e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-slate-300">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
              />
              <p className="text-xs text-slate-600">
                We&apos;ll email you when your song goes on air.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="spotifyLink" className="text-sm text-slate-300">
                  Spotify Link
                </Label>
                <Input
                  id="spotifyLink"
                  placeholder="https://open.spotify.com/..."
                  value={form.spotifyLink}
                  onChange={(e) => updateField("spotifyLink", e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soundcloudLink" className="text-sm text-slate-300">
                  SoundCloud Link
                </Label>
                <Input
                  id="soundcloudLink"
                  placeholder="https://soundcloud.com/..."
                  value={form.soundcloudLink}
                  onChange={(e) => updateField("soundcloudLink", e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm text-slate-300">
                  City / Location *
                </Label>
                <Input
                  id="city"
                  placeholder="e.g., Surrey, BC"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre" className="text-sm text-slate-300">
                  Genre
                </Label>
                <Input
                  id="genre"
                  placeholder="e.g., Alt-Rock, Indie, Post-Rock"
                  value={form.genre}
                  onChange={(e) => updateField("genre", e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm text-slate-300">
                Message (Optional)
              </Label>
              <Textarea
                id="message"
                placeholder="Tell us about your band, your music, or anything you want us to know..."
                rows={3}
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !form.bandName ||
                !form.realName ||
                !form.email ||
                !form.city
              }
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 py-5 text-lg font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Submit My Demo
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 3: Thank You ─────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="rounded-2xl border border-green-500/20 bg-[#12121a] p-8 sm:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="mb-2 text-3xl font-black text-white">
          WE GOT YOUR DEMO!
        </h2>
        <p className="mb-6 text-slate-300">
          Our team of DJs and curators will review your submission this week. If
          your track is a fit, you&apos;ll get an email from us with the good
          news.
        </p>

        <div className="mb-8 rounded-xl border border-white/5 bg-white/5 p-4">
          <p className="text-sm text-slate-400">
            <span className="font-bold text-white">The Strategic Magic:</span>{" "}
            Once your song goes on air, we&apos;ll email you directly so you can
            share it with all your fans. Every artist becomes a promoter of the
            station!
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-red-600 to-orange-500 font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400"
          >
            <Headphones className="mr-2 h-5 w-5" />
            Listen to the Station Live
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={goHome}
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            Back to Funnels
          </Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FUNNEL 2: SPONSOR MY STATION
// ═══════════════════════════════════════════════════════════
function SponsorFunnel({
  step,
  setStep,
  goHome,
  isSubmitting,
  setIsSubmitting,
  submitResult,
  setSubmitResult,
}: {
  step: number;
  setStep: (s: number) => void;
  goHome: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (b: boolean) => void;
  submitResult: { success: boolean; message: string } | null;
  setSubmitResult: (r: { success: boolean; message: string } | null) => void;
}) {
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    plan: "",
  });
  const updateField = (f: string, v: string) =>
    setFormData((p) => ({ ...p, [f]: v }));

  const handleInquiry = async () => {
    if (!formData.businessName || !formData.contactName || !formData.email) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setSubmitResult({ success: res.ok, message: data.message || data.error });
      if (res.ok) setStep(4);
    } catch {
      setSubmitResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Step 1: Landing ──────────────────────────────────
  if (step === 1) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-white/10 bg-[#12121a] overflow-hidden">
          <div className="relative px-6 py-12 sm:px-12 sm:py-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-yellow-950/30" />
            <div className="relative z-10">
              <Badge className="mb-4 border-amber-500/30 bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
                <DollarSign className="mr-1 h-3 w-3" />
                ADVERTISING OPPORTUNITY
              </Badge>
              <h2 className="mb-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                Advertise on{" "}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                  Tunog Kalye Radio
                </span>
              </h2>
              <p className="mb-6 text-lg text-slate-300">
                Reach the Filipino diaspora and 90s OPM lovers{" "}
                <span className="font-bold text-white">24/7</span>.
              </p>

              <div className="mx-auto mb-8 grid max-w-lg grid-cols-2 gap-4 text-left">
                {[
                  {
                    icon: Users,
                    title: "Targeted Audience",
                    desc: "Filipino-Canadian community and OPM enthusiasts worldwide",
                  },
                  {
                    icon: BarChart3,
                    title: "Measurable Results",
                    desc: "Real-time listener stats and engagement metrics",
                  },
                  {
                    icon: Globe,
                    title: "Global Reach",
                    desc: "Listeners across Canada, Middle East, Philippines, and beyond",
                  },
                  {
                    icon: TrendingUp,
                    title: "Affordable Plans",
                    desc: "Starting from just $50/month for local businesses",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-3"
                  >
                    <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <div>
                      <div className="text-sm font-medium text-white">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={() => setStep(2)}
                className="bg-gradient-to-r from-amber-500 to-yellow-400 px-8 text-lg font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-300"
              >
                See Our Packages
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 2: Stats ─────────────────────────────────────
  if (step === 2) {
    return (
      <div className="mx-auto max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => setStep(1)}
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        <h2 className="mb-2 text-2xl font-bold">Why Advertise With Us?</h2>
        <p className="mb-8 text-sm text-slate-400">
          Here&apos;s what Tunog Kalye Radio brings to the table.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              label: "Monthly Listeners",
              value: "Growing Daily",
              sub: "24/7 global stream with CDN delivery",
              icon: Headphones,
            },
            {
              label: "Facebook Reach",
              value: "Filipino Diaspora",
              sub: "Active engagement across Canada & Middle East",
              icon: Users,
            },
            {
              label: "Avg. Listen Duration",
              value: "45+ Minutes",
              sub: "Longer than typical internet radio",
              icon: BarChart3,
            },
            {
              label: "Content Quality",
              value: "Human-Curated",
              sub: "No algorithms. Real DJs, real music, real fans.",
              icon: Star,
            },
          ].map((s) => (
            <Card
              key={s.label}
              className="border-white/10 bg-[#12121a]"
            >
              <CardContent className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <s.icon className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                  <div className="text-lg font-bold text-white">{s.value}</div>
                  <div className="text-xs text-slate-600">{s.sub}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mock-up Preview */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-[#12121a] p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
            Preview: Your Ad on Tunog Kalye
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-[#12121a] p-4">
              <div className="mb-2 text-xs text-slate-500">ON-AIR SHOUTOUT</div>
              <p className="text-sm text-slate-300">
                &ldquo;This hour of Tunog Kalye Radio is brought to you by{" "}
                <span className="font-bold text-amber-400">
                  [Your Restaurant Name]
                </span>
                , serving the best Pinoy food in Surrey. Visit them at 123
                King George Blvd!&rdquo;
              </p>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-[#12121a] p-4">
              <div className="mb-2 text-xs text-slate-500">
                WEBSITE BANNER
              </div>
              <div className="flex h-20 items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/20">
                <span className="text-sm font-bold text-amber-400">
                  Sponsored by [Your Business Name]
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button
            size="lg"
            onClick={() => setStep(3)}
            className="bg-gradient-to-r from-amber-500 to-yellow-400 px-8 font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-300"
          >
            View Pricing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── Step 3: Pricing ───────────────────────────────────
  if (step === 3) {
    const plans = [
      {
        name: "Shoutout",
        price: "$50",
        period: "/month",
        features: [
          "1 on-air shoutout per day",
          "Mentioned on our social media",
          "Logo on partner page",
        ],
        popular: false,
      },
      {
        name: "Banner",
        price: "$100",
        period: "/month",
        features: [
          "Everything in Shoutout",
          "Dedicated banner on tunogkalye.net",
          "Monthly listener report",
          "Priority scheduling",
        ],
        popular: true,
      },
      {
        name: "Premium",
        price: "$200",
        period: "/month",
        features: [
          "Everything in Banner",
          "Sponsored hour of radio",
          "Custom DJ intro for your brand",
          "Exclusive category sponsorship",
        ],
        popular: false,
      },
    ];

    return (
      <div className="mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => setStep(2)}
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">Choose Your Package</h2>
          <p className="text-sm text-slate-400">
            Transparent pricing. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden border ${
                plan.popular
                  ? "border-amber-500/50 bg-[#14141f] shadow-lg shadow-amber-500/10"
                  : "border-white/10 bg-[#12121a]"
              }`}
            >
              {plan.popular && (
                <div className="absolute right-0 top-0 bg-gradient-to-r from-amber-500 to-yellow-400 px-3 py-1 text-xs font-bold text-black">
                  MOST POPULAR
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg text-white">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-black text-amber-400">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => {
                    updateField("plan", plan.name);
                    setStep(4);
                  }}
                  className={`w-full font-bold ${
                    plan.popular
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:from-amber-400 hover:to-yellow-300"
                      : "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {plan.popular ? (
                    "Get Started"
                  ) : (
                    "Select Plan"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ─── Step 4: Checkout / Inquiry Form ───────────────────
  return (
    <div className="mx-auto max-w-xl">
      <Button
        variant="ghost"
        onClick={() => setStep(3)}
        className="mb-6 text-slate-400 hover:text-white"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back
      </Button>

      <div className="rounded-2xl border border-amber-500/20 bg-[#12121a] p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
            <CreditCard className="h-7 w-7 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold">Complete Your Inquiry</h2>
          <p className="text-sm text-slate-400">
            We&apos;ll be in touch within 24 hours to finalize your sponsorship.
          </p>
          {formData.plan && (
            <Badge className="mt-2 border-amber-500/30 bg-amber-500/20 text-amber-400">
              {formData.plan} Plan
            </Badge>
          )}
        </div>

        {submitResult && !submitResult.success && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {submitResult.message}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Business Name *</Label>
            <Input
              placeholder="e.g., Max's Restaurant"
              value={formData.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/30"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Contact Name *</Label>
              <Input
                placeholder="Your full name"
                value={formData.contactName}
                onChange={(e) => updateField("contactName", e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Email *</Label>
              <Input
                type="email"
                placeholder="contact@business.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/30"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Phone (Optional)</Label>
            <Input
              placeholder="(604) 555-1234"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/30"
            />
          </div>

          <Button
            onClick={handleInquiry}
            disabled={
              isSubmitting ||
              !formData.businessName ||
              !formData.contactName ||
              !formData.email
            }
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 py-5 text-lg font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Submit Inquiry
              </>
            )}
          </Button>

          <p className="text-center text-xs text-slate-600">
            We accept payments via Stripe and PayPal after inquiry confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FUNNEL 3: SUPER FAN / DONATIONS
// ═══════════════════════════════════════════════════════════
function DonateFunnel({
  step,
  setStep,
  goHome,
  isSubmitting,
  setIsSubmitting,
  submitResult,
  setSubmitResult,
}: {
  step: number;
  setStep: (s: number) => void;
  goHome: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (b: boolean) => void;
  submitResult: { success: boolean; message: string } | null;
  setSubmitResult: (r: { success: boolean; message: string } | null) => void;
}) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [donorInfo, setDonorInfo] = useState({ name: "", email: "", message: "" });
  const updateField = (f: string, v: string) =>
    setDonorInfo((p) => ({ ...p, [f]: v }));

  const handleDonate = async () => {
    if (!selectedTier) return;
    setIsSubmitting(true);
    try {
      const tierAmounts: Record<string, number> = {
        coffee: 5,
        hour: 20,
        day: 50,
        kanto: 100,
      };
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...donorInfo,
          amount: tierAmounts[selectedTier] || 5,
          tier: selectedTier,
        }),
      });
      const data = await res.json();
      setSubmitResult({ success: res.ok, message: data.message || data.error });
      if (res.ok) setStep(3);
    } catch {
      setSubmitResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tiers = [
    {
      id: "coffee",
      name: "Buy Us a Coffee",
      price: "$5",
      icon: Coffee,
      description:
        "A small token that keeps the speakers buzzing. Every coffee fuels another hour of independent OPM on air.",
      color: "from-amber-500/20 to-orange-500/20",
      border: "border-amber-500/30",
      iconColor: "text-amber-400",
    },
    {
      id: "hour",
      name: "Sponsor an Hour",
      price: "$20",
      icon: Zap,
      description:
        "Fund a full hour of commercial-free broadcasting. Your name appears on our \"Sponsored by\" on-air mention.",
      color: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/30",
      iconColor: "text-blue-400",
    },
    {
      id: "day",
      name: "Fund a Day",
      price: "$50",
      icon: Radio,
      description:
        "Cover an entire day of streaming costs. You get a dedicated shoutout and your name on our website for 24 hours.",
      color: "from-purple-500/20 to-violet-500/20",
      border: "border-purple-500/30",
      iconColor: "text-purple-400",
    },
    {
      id: "kanto",
      name: "Kanto Champion",
      price: "$100",
      icon: Star,
      description:
        "The ultimate fan tier. Your contribution goes directly to the Kanto Fund, supporting independent artists every quarter.",
      color: "from-rose-500/20 to-pink-500/20",
      border: "border-rose-500/30",
      iconColor: "text-rose-400",
    },
  ];

  // ─── Step 1: Landing ──────────────────────────────────
  if (step === 1) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-white/10 bg-[#12121a] overflow-hidden">
          <div className="relative px-6 py-12 sm:px-12 sm:py-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-950/40 to-pink-950/30" />
            <div className="relative z-10">
              <Badge className="mb-4 border-rose-500/30 bg-rose-500/20 px-3 py-1 text-xs font-medium text-rose-400">
                <Heart className="mr-1 h-3 w-3" />
                COMMUNITY SUPPORT
              </Badge>
              <h2 className="mb-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                Keep the{" "}
                <span className="bg-gradient-to-r from-rose-500 to-pink-400 bg-clip-text text-transparent">
                  Kanto Alive
                </span>
              </h2>
              <p className="mb-6 text-lg text-slate-300">
                Support Independent OPM. Every dollar goes directly to the
                station and the artists who make the music you love.
              </p>

              <div className="mx-auto mb-8 max-w-md space-y-3 text-left">
                {[
                  "Zero commission. We don't take a cut from artists.",
                  "The Kanto Fund distributes directly to indie artists.",
                  "Your contribution keeps 24/7 OPM broadcasting alive.",
                  "Every supporter gets a shoutout on air.",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Heart className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={() => setStep(2)}
                className="bg-gradient-to-r from-rose-500 to-pink-400 px-8 text-lg font-bold text-white shadow-lg shadow-rose-500/20 hover:from-rose-400 hover:to-pink-300"
              >
                <Heart className="mr-2 h-5 w-5" />
                Choose Your Support Tier
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 2: Donation Options ─────────────────────────
  if (step === 2) {
    return (
      <div className="mx-auto max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => setStep(1)}
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">
            How Would You Like to Support?
          </h2>
          <p className="text-sm text-slate-400">
            Pick the tier that works for you. Every contribution matters.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              onClick={() => {
                setSelectedTier(tier.id);
                setStep(3);
              }}
              className={`group cursor-pointer border transition-all duration-300 ${
                selectedTier === tier.id
                  ? `${tier.border} bg-gradient-to-br ${tier.color} shadow-lg`
                  : "border-white/10 bg-[#12121a] hover:border-white/20 hover:bg-[#14141f]"
              }`}
            >
              <CardContent className="flex items-start gap-4 p-6">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tier.color}`}
                >
                  <tier.icon className={`h-6 w-6 ${tier.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white">{tier.name}</div>
                    <div className={`text-xl font-black ${tier.iconColor}`}>
                      {tier.price}
                    </div>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {tier.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-white/5 bg-[#12121a] p-4 text-center">
          <p className="text-xs text-slate-500">
            Secure payments processed via Stripe or PayPal. Tunog Kalye Radio
            is a passion project — every cent goes to keeping the music alive.
          </p>
        </div>
      </div>
    );
  }

  // ─── Step 3: Thank You ─────────────────────────────────
  if (step === 3 && submitResult?.success) {
    const tierName = tiers.find((t) => t.id === selectedTier)?.name || "Supporter";
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="rounded-2xl border border-rose-500/20 bg-[#12121a] p-8 sm:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10">
            <Heart className="h-10 w-10 text-rose-400" />
          </div>
          <h2 className="mb-2 text-3xl font-black text-white">
            MARAMING SALAMAT!
          </h2>
          <p className="mb-6 text-slate-300">
            Your {tierName} contribution means the world to us and to the
            independent Filipino artists whose music you help broadcast.
          </p>

          <div className="mb-8 rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-sm text-slate-400">
              <span className="font-bold text-white">What happens next:</span>{" "}
              Your name will be mentioned on air as a Tunog Kalye supporter. If
              you chose the Kanto Champion tier, your contribution goes directly
              to the next quarterly Kanto Fund distribution.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-rose-500 to-pink-400 font-bold text-white shadow-lg shadow-rose-500/20 hover:from-rose-400 hover:to-pink-300"
            >
              <Headphones className="mr-2 h-5 w-5" />
              Listen Live Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={goHome}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              Back to Funnels
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 3: Checkout Form ─────────────────────────────
  return (
    <div className="mx-auto max-w-xl">
      <Button
        variant="ghost"
        onClick={() => setStep(2)}
        className="mb-6 text-slate-400 hover:text-white"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back
      </Button>

      {submitResult && !submitResult.success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {submitResult.message}
        </div>
      )}

      <div className="rounded-2xl border border-rose-500/20 bg-[#12121a] p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10">
            <Heart className="h-7 w-7 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold">Complete Your Support</h2>
          <p className="text-sm text-slate-400">
            Almost there! Your generosity keeps the Kanto alive.
          </p>
          {selectedTier && (
            <Badge className="mt-2 border-rose-500/30 bg-rose-500/20 text-rose-400">
              {tiers.find((t) => t.id === selectedTier)?.name} —{" "}
              {tiers.find((t) => t.id === selectedTier)?.price}
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">
              Name (Optional — leave blank for anonymous)
            </Label>
            <Input
              placeholder="Your name"
              value={donorInfo.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-rose-500/50 focus:ring-rose-500/30"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Email (Optional)</Label>
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={donorInfo.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-rose-500/50 focus:ring-rose-500/30"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">
              Message (Optional)
            </Label>
            <Textarea
              placeholder="Any message for the station or the artists?"
              rows={2}
              value={donorInfo.message}
              onChange={(e) => updateField("message", e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-rose-500/50 focus:ring-rose-500/30"
            />
          </div>

          <Button
            onClick={handleDonate}
            disabled={isSubmitting || !selectedTier}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-400 py-5 text-lg font-bold text-white shadow-lg shadow-rose-500/20 hover:from-rose-400 hover:to-pink-300 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-5 w-5" />
                Confirm Donation —{" "}
                {tiers.find((t) => t.id === selectedTier)?.price}
              </>
            )}
          </Button>

          <p className="text-center text-xs text-slate-600">
            Secure payment via Stripe or PayPal. Tax receipts available upon
            request.
          </p>
        </div>
      </div>
    </div>
  );
}
