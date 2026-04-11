"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Mic2, Radio, Heart, ChevronRight, ChevronLeft, Music, Send,
  CheckCircle2, DollarSign, TrendingUp, Users, Headphones, Globe,
  BarChart3, CreditCard, Coffee, Zap, Star, ArrowRight, Volume2,
  AlertCircle, Loader2, Clock, Mail, PartyPopper, Share2, Shield,
  CircleDot, HelpCircle, ChevronDown, Play, Pause, VolumeX, Volume1,
  X, ShoppingBag, ShieldCheck, Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────
type PathwayId = "home" | "submit" | "sponsor" | "donate";

interface FormData {
  bandName: string; realName: string; email: string;
  spotifyLink: string; soundcloudLink: string;
  city: string; genre: string; message: string;
}

// ─── Color Meta ───────────────────────────────────────────
const FM = {
  submit: { label: "Submit Your Music", btn: "bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white", dot: "bg-red-500", line: "bg-red-500/30" },
  sponsor: { label: "Sponsor My Station", btn: "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black", dot: "bg-amber-500", line: "bg-amber-500/30" },
  donate: { label: "Support the Station", btn: "bg-gradient-to-r from-rose-500 to-pink-400 hover:from-rose-400 hover:to-pink-300 text-white", dot: "bg-rose-500", line: "bg-rose-500/30" },
};

// ─── Progress Bar Component ──────────────────────────────
function ProgressBar({ steps, current, colors }: { steps: string[]; current: number; colors: { dot: string; line: string } }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-0">
      {steps.map((label, i) => {
        const num = i + 1;
        const isActive = num <= current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${isActive ? `${colors.dot} text-white shadow-lg` : "border border-white/20 bg-[#12121a] text-slate-500"}`}>
                {isActive && num < current ? <CheckCircle2 className="h-4 w-4" /> : num}
              </div>
              <span className={`hidden text-[10px] sm:block ${isActive ? "text-white font-medium" : "text-slate-600"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-1 h-0.5 w-6 sm:w-12 transition-all ${num < current ? colors.line : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Timeline Component (for Thank You pages) ────────────
function Timeline({ items, accentColor }: { items: { icon: React.ElementType; title: string; desc: string; time: string }[]; accentColor: string }) {
  return (
    <div className="space-y-4 text-left">
      {items.map((item, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accentColor}`}>
              <item.icon className="h-5 w-5 text-white" />
            </div>
            {i < items.length - 1 && <div className="w-0.5 flex-1 bg-white/10 mt-1" />}
          </div>
          <div className="pb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.time}</div>
            <div className="mt-0.5 text-sm font-bold text-white">{item.title}</div>
            <div className="mt-0.5 text-sm text-slate-400">{item.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── AzuraCast Stream Config ──────────────────────────
// Now managed globally via src/components/live-player.tsx
// Configure via NEXT_PUBLIC_STREAM_URL, NEXT_PUBLIC_NOW_PLAYING_API, etc.



// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function TunogKalyePathways() {
  const [activePathway, setActivePathway] = useState<PathwayId>("home");
  const [pathwayStep, setPathwayStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});

  // Detect hash fragments (#submit, #sponsor, #donate) from navbar links
  const handleHash = useCallback(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "submit" || hash === "sponsor" || hash === "donate") {
      setActivePathway(hash);
      setPathwayStep(1);
      setSubmitResult(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Clean up the hash so it doesn't re-trigger on refresh
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // Check hash on initial load
    handleHash();
    // Listen for hash changes (when navbar links are clicked while on homepage)
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [handleHash]);

  // Fetch site settings on mount
  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.settings) setSiteSettings(data.settings);
      })
      .catch(() => { /* silently use fallbacks */ });
  }, []);

  const navigateTo = useCallback((f: PathwayId) => {
    setActivePathway(f); setPathwayStep(1); setSubmitResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const goHome = useCallback(() => {
    setActivePathway("home"); setPathwayStep(1); setSubmitResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);



  const footerText = siteSettings.footer_text || "Tunog Kalye Radio \u00a9 2026. All rights reserved.";

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-white">
      {/* NAVBAR — shared component */}
      <Navbar />

      {/* MAIN */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {activePathway === "home" && <HomePage onSelect={navigateTo} siteSettings={siteSettings} />}
        {activePathway === "submit" && <SubmitPathway step={pathwayStep} setStep={setPathwayStep} goHome={goHome} isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting} submitResult={submitResult} setSubmitResult={setSubmitResult} />}
        {activePathway === "sponsor" && <SponsorPathway step={pathwayStep} setStep={setPathwayStep} goHome={goHome} isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting} submitResult={submitResult} setSubmitResult={setSubmitResult} />}
        {activePathway === "donate" && <DonatePathway step={pathwayStep} setStep={setPathwayStep} goHome={goHome} navigateTo={navigateTo} isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting} submitResult={submitResult} setSubmitResult={setSubmitResult} />}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-black/20 mt-auto pb-20">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <img src="/tunog-kalye-horizontal.png" alt="TKR" className="h-5 w-auto object-contain" />
              <span className="text-sm text-slate-500">{footerText}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
              <span>{siteSettings.footer_website || "tunogkalye.net"}</span><span className="text-slate-700">|</span>
              <span>{siteSettings.footer_video || "video.tunogkalye.net"}</span><span className="text-slate-700">|</span>
              <span>{siteSettings.footer_location || "Surrey, BC, Canada"}</span>
              <span className="hidden sm:inline text-slate-700">|</span>
              <Link href="/about" className="transition-colors hover:text-slate-400">About</Link>
              <span className="text-slate-700">|</span>
              <Link href="/kanto-fund" className="transition-colors hover:text-slate-400">Kanto Fund</Link>
              <span className="text-slate-700">|</span>
              <Link href="/terms" className="transition-colors hover:text-slate-400">Terms</Link>
              <span className="text-slate-700">|</span>
              <Link href="/privacy" className="transition-colors hover:text-slate-400">Privacy</Link>
              <span className="text-slate-700">|</span>
              <a href="https://www.facebook.com/profile.php?id=61578465900871" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-400">Facebook</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Live player is now global — see src/components/live-player.tsx & root layout */}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HOME PAGE (with dynamic site settings)
// ═══════════════════════════════════════════════════════════
function HomePage({ onSelect, siteSettings: settings }: { onSelect: (f: PathwayId) => void; siteSettings?: Record<string, string> }) {
  // Dynamic settings with hardcoded fallbacks
  const heroTagline = settings?.hero_tagline || "The Premier Broadcasting Network for Filipino Independent Music";
  const heroSubtitle = settings?.hero_subtitle || "Bridging 90s Pinoy Rock with modern indie. Curated by humans, not algorithms.";
  const statsListeners = settings?.stats_listeners || "24/7";
  const statsReach = settings?.stats_global_reach || "Worldwide";
  const statsArtists = settings?.stats_indie_artists || "Growing";
  const statsCommission = settings?.stats_commission || "0%";
  const footerText = settings?.footer_text || "Tunog Kalye Radio \u00a9 2026. All rights reserved.";

  return (
    <div className="flex flex-col gap-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/80 via-[#0a0a0f]/90 to-orange-950/60" />
        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: "url('/tunog-kalye-hero.jpg')" }} />
        <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-24 lg:py-28">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
            {/* Logo */}
            <img
              src="/tunog-kalye-horizontal.png"
              alt="Tunog Kalye Radio"
              className="h-20 w-auto object-contain sm:h-24"
            />
            <div className="flex-1 min-w-0">
              <Badge className="mb-3 border-red-500/30 bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400 backdrop-blur-sm">
                <Volume2 className="mr-1 h-3 w-3" /> 24/7 GLOBAL BROADCAST
              </Badge>
              <h1 className="mb-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                TUNOG KALYE{" "}
                <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">RADIO</span>
              </h1>
              <p className="mb-2 max-w-2xl text-lg text-slate-300 sm:text-xl">
                {heroTagline}
              </p>
              <p className="max-w-xl text-sm text-slate-500">
                {heroSubtitle}
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => onSelect("submit")} size="lg" className="bg-gradient-to-r from-red-600 to-orange-500 px-6 font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400">
              <Mic2 className="mr-2 h-5 w-5" /> Submit Your Music
            </Button>
            <Button onClick={() => onSelect("donate")} size="lg" variant="outline" className="border-white/20 bg-white/5 px-6 text-white hover:bg-white/10">
              <Heart className="mr-2 h-5 w-5 text-rose-400" /> Support the Station
            </Button>
          </div>
        </div>
      </section>

      {/* PATHWAY CARDS */}
      <section>
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">Choose Your Path</h2>
          <p className="text-sm text-slate-500">Whether you&apos;re an artist, a sponsor, or a fan — there&apos;s a place for you at the Kanto.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { id: "submit" as PathwayId, icon: Mic2, gradient: "from-red-600 to-orange-500", shadow: "shadow-red-500/20", border: "hover:border-red-500/40", title: "Submit Your Music", desc: "Get your music played on 24/7 global radio. We're always looking for fresh Filipino talent.", checks: ["100% copyright retained", "Non-exclusive broadcasting rights", "Reviewed within one week"], btn: FM.submit.btn },
            { id: "sponsor" as PathwayId, icon: DollarSign, gradient: "from-amber-500 to-yellow-400", shadow: "shadow-amber-500/20", border: "hover:border-amber-500/40", title: "Advertise With Us", desc: "Reach the Filipino-Canadian diaspora with high-ROI, targeted audio ads and banner placements.", checks: ["On-air shoutouts", "Website banner placement", "Plans from $50/month"], btn: FM.sponsor.btn },
            { id: "donate" as PathwayId, icon: Heart, gradient: "from-rose-500 to-pink-400", shadow: "shadow-rose-500/20", border: "hover:border-rose-500/40", title: "Support the Station", desc: "Fund the infrastructure that keeps independent OPM broadcasting 24/7. Contributions go strictly to server hosting and bandwidth.", checks: ["B2B sponsorships are our primary revenue", "Funds the Kanto Fund for artists", "Infrastructure support only"], btn: FM.donate.btn },
            { id: "store" as string, icon: ShoppingBag, gradient: "from-emerald-500 to-teal-400", shadow: "shadow-emerald-500/20", border: "hover:border-emerald-500/40", title: "Browse Merch Store", desc: "Support Filipino indie artists by buying their merch. 90% goes directly to them.", checks: ["Curated by artists", "Secure checkout", "Fast delivery"], btn: "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white", isLink: true, href: "/store" },
          ].map((card) => (
            <Card key={card.id} onClick={() => card.isLink ? undefined : onSelect(card.id as PathwayId)} className={`group cursor-pointer border-white/10 bg-[#12121a] transition-all duration-300 ${card.border} hover:bg-[#14141f] hover:shadow-lg hover:${card.shadow}`}>
              <CardHeader>
                <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg ${card.shadow}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-white">{card.title}</CardTitle>
                <CardDescription className="text-slate-400">{card.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-500">
                  {card.checks.map((c: string) => (
                    <li key={c} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />{c}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {(card as { isLink?: boolean; href?: string }).isLink ? (
                  <Link href={(card as { href: string }).href} className="w-full">
                    <Button className={`w-full font-bold ${(card as { btn: string }).btn}`}>
                      Shop Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button className={`w-full font-bold ${card.btn}`}>
                    {card.id === "submit" ? "Start Submission" : card.id === "sponsor" ? "View Ad Packages" : "Support Now"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">How It Works</h2>
          <p className="text-sm text-slate-500">From submission to airplay in four simple steps.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-4">
          {[
            { num: "01", icon: Send, title: "Submit", desc: "Fill out our quick form. Band name, email, links — that's it. Takes under 2 minutes.", color: "text-red-400", bg: "bg-red-500/10" },
            { num: "02", icon: Headphones, title: "We Review", desc: "Real DJs — not algorithms — listen to every single submission. Quality always wins.", color: "text-amber-400", bg: "bg-amber-500/10" },
            { num: "03", icon: Radio, title: "You Air", desc: "Your song goes live on 24/7 global radio. We email you the exact moment it plays.", color: "text-blue-400", bg: "bg-blue-500/10" },
            { num: "04", icon: TrendingUp, title: "You Grow", desc: "Share the moment with your fans. New listeners discover your music. The loop continues.", color: "text-green-400", bg: "bg-green-500/10" },
          ].map((s, i) => (
            <div key={s.num} className="relative text-center">
              <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${s.bg}`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div className="mb-1 text-xs font-bold text-slate-600">STEP {s.num}</div>
              <div className="mb-2 font-bold text-white">{s.title}</div>
              <p className="text-xs leading-relaxed text-slate-500">{s.desc}</p>
              {i < 3 && <div className="absolute right-0 top-7 hidden h-0.5 w-6 bg-white/10 sm:block" />}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-500">Got questions? We've got answers.</p>
        </div>
        <div className="mx-auto max-w-2xl">
          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: "Do I keep my copyright?", a: "Absolutely. You retain 100% of your copyrights at all times. We only ask for non-exclusive digital broadcasting rights, which means you can simultaneously distribute your music on Spotify, Apple Music, YouTube, or any other platform. There are no advance recoupment clauses, no territorial restrictions, and no minimum commitment periods." },
              { q: "How long until my song airs?", a: "Our team reviews every submission within one week. If your track is approved, we'll email you with the good news and schedule it into our rotation. Once approved, you'll typically hear your song on air within 2-3 days as our DJs program it into themed blocks and time slots." },
              { q: "What is the Kanto Fund?", a: "The Kanto Fund is our transparent revenue-sharing model. A dedicated percentage of all B2B advertising revenue and sponsorships is pooled quarterly and distributed directly to our top-charting independent artists. This fund helps artists pay for their next recording session, music video, or live gig — and we show exactly how the money is allocated." },
              { q: "How do sponsorships work?", a: "We offer three sponsorship tiers: Shoutout ($50/month) for daily on-air mentions, Banner ($100/month) which adds a website banner plus everything in Shoutout, and Premium ($200/month) for a sponsored hour, custom DJ intro, and exclusive category sponsorship. All plans include measurable metrics and can be cancelled anytime." },
              { q: "Who can submit music?", a: "Any independent Filipino artist or band can submit. You don't need to be signed to a label. You don't need a professional recording. If you're making Pinoy music — whether it's 90s alt-rock, modern indie, post-rock, or any genre — we want to hear it. Unsigned and independent artists are our priority." },
              { q: "Does Tunog Kalye take a commission from artist sales?", a: "Zero. Tunog Kalye takes absolutely no commission from artist merchandise, tips, album sales, or gig tickets. When fans discover an artist through our station and buy their merch or tip them directly, 100% of that money goes to the artist. This is a core principle of our platform." },
              { q: "I'm signed to a record label (or a digital distributor). Can I still submit my music?", a: "Yes, but with a quick check. Submitting to Tunog Kalye is for Non-Interactive Radio Broadcasting only. This is different from Digital Distribution (Spotify/Apple Music). Most independent label contracts allow radio play. However, out of respect for your label, please inform them you are submitting to a Canadian internet radio station. If your label manager has questions, tell them to email us at hello@tunogkalye.net. We are happy to clarify that we are a radio broadcaster, not a digital distributor." },
              { q: "Will putting my song on Tunog Kalye mess up my Spotify or YouTube monetization?", a: "Absolutely not. In fact, it does the opposite. We are a radio station. We do not take your digital distribution rights. We do not upload your songs to Spotify. When we play your song, the \"Now Playing\" widget shows your name, which drives fans to search for you on Spotify, which actually increases your stream count and revenue." },
              { q: "What exactly are you taking from me? What are my rights?", a: "We operate under the \"Open Kanto Policy.\" We require a Non-Exclusive Digital Broadcasting Right. This means: You own 100% of your copyright. You can sell your song, sign to a major label, or take it off our station at any time. We are simply borrowing it to play on our radio stream. That's it." },
              { q: "How does the 0% Commission on Merch actually work? Where does the money go?", a: "We don't touch your money. When a fan buys your shirt or album on our Hub, the payment goes through a secure system (Stripe Connect) that automatically routes the funds directly into your bank account or GCash. Tunog Kalye takes exactly 0 pesos. We act as your free digital storefront to reach the Canadian diaspora." },
              { q: "What about FILSCAP? I get royalties from them. Will this affect that?", a: "No, this actually helps you. Tunog Kalye operates as a legal broadcast entity. We handle the station-side licensing. If you are a FILSCAP member, your song playing on our station generates performance royalties for you through FILSCAP. You get free promotion and you collect your royalties. It's a win-win." },
              { q: "Can I upload my official Music Video to your Video Hub?", a: "To protect your label contracts, our Video Hub (video.tunogkalye.net) is strictly for exclusive live content — like our \"Kanto Sessions\" (live acoustic videos) or video podcasts. We do not host official music videos to avoid any copyright strikes on your YouTube channel or disputes with your label's visual rights." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-white/10 bg-[#12121a] px-6 data-[state=open]:border-white/20">
                <AccordionTrigger className="text-left text-sm font-bold text-white hover:text-slate-200">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-slate-400">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* STATS */}
      <section className="rounded-2xl border border-white/10 bg-[#12121a] p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: "Live Listeners", value: statsListeners, icon: Headphones },
            { label: "Global Reach", value: statsReach, icon: Globe },
            { label: "Indie Artists", value: statsArtists, icon: Music },
            { label: "Commission", value: statsCommission, icon: Star },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="mx-auto mb-2 h-5 w-5 text-red-400" />
              <div className="text-xl font-bold text-white sm:text-2xl">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PATHWAY 1: SUBMIT YOUR MUSIC
// ═══════════════════════════════════════════════════════════
function SubmitPathway({ step, setStep, goHome, isSubmitting, setIsSubmitting, submitResult, setSubmitResult }: {
  step: number; setStep: (s: number) => void; goHome: () => void;
  isSubmitting: boolean; setIsSubmitting: (b: boolean) => void;
  submitResult: { success: boolean; message: string } | null; setSubmitResult: (r: { success: boolean; message: string } | null) => void;
}) {
  const [form, setForm] = useState<FormData>({ bandName: "", realName: "", email: "", spotifyLink: "", soundcloudLink: "", city: "", genre: "", message: "" });
  const uf = (f: keyof FormData, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async () => {
    if (!form.bandName || !form.realName || !form.email || !form.city) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      setSubmitResult({ success: res.ok, message: data.message || data.error });
      if (res.ok) setStep(3);
    } catch { setSubmitResult({ success: false, message: "Network error. Please try again." }); } finally { setIsSubmitting(false); }
  };

  // STEP 1: LANDING
  if (step === 1) return (
    <div className="mx-auto max-w-3xl">
      <ProgressBar steps={["Hook", "Form", "Done"]} current={1} colors={FM.submit} />
      <div className="rounded-2xl border border-white/10 bg-[#12121a] overflow-hidden">
        <div className="relative px-6 py-12 sm:px-12 sm:py-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 to-orange-950/30" />
          <div className="relative z-10">
            <Badge className="mb-4 border-red-500/30 bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
              <Mic2 className="mr-1 h-3 w-3" /> ARTIST SUBMISSIONS OPEN
            </Badge>
            <h2 className="mb-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              ATTENTION LOCAL{" "}
              <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">PINOY BANDS</span>
            </h2>
            <p className="mb-6 text-xl text-slate-300">Get your music played on <span className="font-bold text-white">24/7 Global Radio</span>.</p>
            <div className="mx-auto mb-8 max-w-lg space-y-3 text-left">
              {["You keep 100% of your copyrights. Always.", "We only need non-exclusive digital broadcasting rights.", "Your song gets reviewed by real DJs, not algorithms.", "Once approved, we'll notify you the moment it airs."].map((item, i) => (
                <div key={i} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><span className="text-sm text-slate-300">{item}</span></div>
              ))}
            </div>
            <Button size="lg" onClick={() => setStep(2)} className="bg-gradient-to-r from-red-600 to-orange-500 px-8 text-lg font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400">
              <Send className="mr-2 h-5 w-5" /> Submit Your Demo Now
            </Button>
            <p className="mt-3 text-xs text-slate-600">Takes less than 2 minutes. We review every submission.</p>
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        {[{ n: "100+", l: "Artists in Queue" }, { n: "0", l: "Commission Taken" }, { n: "1 Week", l: "Review Time" }].map((s) => (
          <div key={s.l} className="rounded-xl border border-white/5 bg-[#12121a] p-4">
            <div className="text-xl font-bold text-red-400">{s.n}</div>
            <div className="text-xs text-slate-500">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // STEP 2: FORM
  if (step === 2) return (
    <div className="mx-auto max-w-2xl">
      <ProgressBar steps={["Hook", "Form", "Done"]} current={2} colors={FM.submit} />
      <Button variant="ghost" onClick={() => setStep(1)} className="mb-6 text-slate-400 hover:text-white">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back
      </Button>
      <div className="rounded-2xl border border-white/10 bg-[#12121a] p-6 sm:p-8">
        <h2 className="mb-1 text-2xl font-bold">Tell Us About Your Band</h2>
        <p className="mb-6 text-sm text-slate-400">Fill out the form below. Fields marked with * are required.</p>
        {submitResult && !submitResult.success && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />{submitResult.message}
          </div>
        )}
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label className="text-sm text-slate-300">Band Name *</Label><Input placeholder="e.g., The Juan dela Cruz Band" value={form.bandName} onChange={(e) => uf("bandName", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30" /></div>
            <div className="space-y-2"><Label className="text-sm text-slate-300">Your Real Name *</Label><Input placeholder="e.g., Maria Santos" value={form.realName} onChange={(e) => uf("realName", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30" /></div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Email Address *</Label>
            <Input type="email" placeholder="your.email@example.com" value={form.email} onChange={(e) => uf("email", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30" />
            <p className="text-xs text-slate-600">We&apos;ll email you when your song goes on air.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label className="text-sm text-slate-300">Spotify Link</Label><Input placeholder="https://open.spotify.com/..." value={form.spotifyLink} onChange={(e) => uf("spotifyLink", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30" /></div>
            <div className="space-y-2"><Label className="text-sm text-slate-300">SoundCloud Link</Label><Input placeholder="https://soundcloud.com/..." value={form.soundcloudLink} onChange={(e) => uf("soundcloudLink", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30" /></div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label className="text-sm text-slate-300">City / Location *</Label><Input placeholder="e.g., Surrey, BC" value={form.city} onChange={(e) => uf("city", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30" /></div>
            <div className="space-y-2"><Label className="text-sm text-slate-300">Genre</Label><Input placeholder="e.g., Alt-Rock, Indie, Post-Rock" value={form.genre} onChange={(e) => uf("genre", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30" /></div>
          </div>
          <div className="space-y-2"><Label className="text-sm text-slate-300">Message (Optional)</Label><Textarea placeholder="Tell us about your band, your music, or anything you want us to know..." rows={3} value={form.message} onChange={(e) => uf("message", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30" /></div>
          <div className="rounded-lg border border-white/5 bg-white/5 p-3 flex items-start gap-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            <p className="text-xs text-slate-500">Your data is safe. We only use your email to notify you about your submission status and when your song airs on Tunog Kalye Radio. We never sell or share your information.</p>
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting || !form.bandName || !form.realName || !form.email || !form.city} className="w-full bg-gradient-to-r from-red-600 to-orange-500 py-5 text-lg font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400 disabled:opacity-50">
            {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Submitting...</> : <><Send className="mr-2 h-5 w-5" />Submit My Demo</>}
          </Button>
        </div>
      </div>
    </div>
  );

  // STEP 3: THANK YOU
  return (
    <div className="mx-auto max-w-2xl">
      <ProgressBar steps={["Hook", "Form", "Done"]} current={3} colors={FM.submit} />
      <div className="rounded-2xl border border-green-500/20 bg-[#12121a] p-8 sm:p-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <Badge className="mb-3 border-green-500/30 bg-green-500/20 text-green-400">SUBMISSION RECEIVED</Badge>
        <h2 className="mb-2 text-3xl font-black text-white">WE GOT YOUR DEMO!</h2>
        <p className="mb-8 text-slate-300">Our team of DJs and curators will review your submission this week. If your track is a fit, you&apos;ll get an email from us with the good news.</p>
      </div>

      {/* What Happens Next */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#12121a] p-6 sm:p-8">
        <h3 className="mb-6 text-lg font-bold text-white">What Happens Next</h3>
        <Timeline accentColor="bg-red-500" items={[
          { icon: Clock, time: "This Week", title: "Our DJs Review Your Submission", desc: "Real humans — not algorithms — will listen to your track and evaluate its fit for our programming rotation." },
          { icon: Mail, time: "When Approved", title: "You Get the Good News", desc: "We'll email you at the address you provided. You'll know the exact date and time your song is scheduled to air." },
          { icon: Radio, time: "On Air", title: "Your Song Plays Globally", desc: "Your music reaches listeners across Canada, the Philippines, the Middle East, and beyond. We notify you the moment it plays." },
        ]} />
      </div>

      {/* Strategic Magic Callout */}
      <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
        <div className="flex items-start gap-3">
          <Zap className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <div className="mb-1 text-sm font-bold text-white">The Strategic Magic</div>
            <p className="text-sm text-slate-400">Once your song goes on air, we&apos;ll email you directly: <span className="font-bold text-red-400">&ldquo;Hey, your song is on air RIGHT NOW. Share this link with your fans!&rdquo;</span> Every artist becomes an active promoter of the station, creating a self-sustaining growth loop.</p>
          </div>
        </div>
      </div>

      {/* Social Sharing */}
      <div className="mt-6 rounded-xl border border-white/5 bg-[#12121a] p-5 text-center">
        <p className="mb-3 text-sm font-bold text-white">Share the Word!</p>
        <p className="mb-4 text-xs text-slate-500">Let your fans know you just submitted to the fastest-growing Filipino indie radio station.</p>
        <div className="flex justify-center gap-3">
          {["Facebook", "X / Twitter", "Instagram"].map((s) => (
            <button key={s} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400 transition-colors hover:border-white/20 hover:text-white">
              <Share2 className="mr-1.5 inline h-3 w-3" />{s}
            </button>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" className="bg-gradient-to-r from-red-600 to-orange-500 font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400">
          <Headphones className="mr-2 h-5 w-5" /> Listen to the Station Live
        </Button>
        <Button size="lg" variant="outline" onClick={goHome} className="border-white/20 bg-white/5 text-white hover:bg-white/10">
          Back to Pathways
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PATHWAY 2: SPONSOR MY STATION
// ═══════════════════════════════════════════════════════════
function SponsorPathway({ step, setStep, goHome, isSubmitting, setIsSubmitting, submitResult, setSubmitResult }: {
  step: number; setStep: (s: number) => void; goHome: () => void;
  isSubmitting: boolean; setIsSubmitting: (b: boolean) => void;
  submitResult: { success: boolean; message: string } | null; setSubmitResult: (r: { success: boolean; message: string } | null) => void;
}) {
  const [fd, setFd] = useState({ businessName: "", contactName: "", email: "", phone: "", plan: "" });
  const uf = (f: string, v: string) => setFd((p) => ({ ...p, [f]: v }));

  const handleSubmit = async () => {
    if (!fd.businessName || !fd.contactName || !fd.email) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/sponsor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fd) });
      const data = await res.json();
      setSubmitResult({ success: res.ok, message: data.message || data.error });
      if (res.ok) setStep(5);
    } catch { setSubmitResult({ success: false, message: "Network error. Please try again." }); } finally { setIsSubmitting(false); }
  };

  const sponsorSteps = ["Landing", "Proof", "Pricing", "Form", "Done"];

  // STEP 1: LANDING
  if (step === 1) return (
    <div className="mx-auto max-w-3xl">
      <ProgressBar steps={sponsorSteps} current={1} colors={FM.sponsor} />

      {/* ADVERTISING WITH PURPOSE */}
      <div className="mb-8 rounded-2xl border border-amber-500/20 bg-[#12121a] p-6 sm:p-8">
        <h3 className="mb-4 text-center text-lg font-bold text-white">Advertising with Purpose</h3>
        <p className="mb-5 text-center text-sm text-slate-400 leading-relaxed">
          When you advertise with a mainstream platform, 70% of your budget goes to corporate overhead. When you advertise with Tunog Kalye Radio, you are directly funding the Filipino-Canadian community.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Our Audience", value: "100% targeted", desc: "Filipino diaspora, OPM lovers, ages 25-55, primarily in Surrey/Vancouver but streaming globally." },
            { label: "Our Rates", value: "A fraction of mainstream", desc: "A fraction of mainstream radio because we don't have a corporate office to pay for." },
            { label: "Your ROI", value: "Un-skippable integration", desc: "Your ad isn't skipped in 5 seconds like on Spotify. It's integrated into a live, human-curated radio experience." },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-amber-500/10 bg-white/[0.02] p-4 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-500/70">{item.label}</div>
              <div className="mt-1 text-sm font-bold text-white">{item.value}</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#12121a] overflow-hidden">
        <div className="relative px-6 py-12 sm:px-12 sm:py-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-yellow-950/30" />
          <div className="relative z-10">
            <Badge className="mb-4 border-amber-500/30 bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
              <DollarSign className="mr-1 h-3 w-3" /> ADVERTISING OPPORTUNITY
            </Badge>
            <h2 className="mb-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              Partner with{" "}
              <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">Tunog Kalye Radio</span>
            </h2>
            <p className="mb-6 text-lg text-slate-300">Reach a highly targeted, loyal Filipino-Canadian audience <span className="font-bold text-white">24/7</span> — at a fraction of mainstream radio costs.</p>
            <div className="mx-auto mb-8 grid max-w-lg grid-cols-2 gap-4 text-left">
              {[
                { icon: Users, title: "Targeted Audience", desc: "Filipino-Canadian community and OPM enthusiasts worldwide" },
                { icon: BarChart3, title: "Measurable Results", desc: "Real-time listener stats and engagement metrics" },
                { icon: Globe, title: "Global Reach", desc: "Listeners across Canada, Middle East, Philippines, and beyond" },
                { icon: TrendingUp, title: "Affordable Plans", desc: "Starting from just $50/month for local businesses" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                  <div><div className="text-sm font-medium text-white">{item.title}</div><div className="text-xs text-slate-500">{item.desc}</div></div>
                </div>
              ))}
            </div>
            <Button size="lg" onClick={() => setStep(2)} className="bg-gradient-to-r from-amber-500 to-yellow-400 px-8 text-lg font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-300">
              See Our Packages <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // STEP 2: STATS & PROOF
  if (step === 2) return (
    <div className="mx-auto max-w-3xl">
      <ProgressBar steps={sponsorSteps} current={2} colors={FM.sponsor} />
      <Button variant="ghost" onClick={() => setStep(1)} className="mb-6 text-slate-400 hover:text-white"><ChevronLeft className="mr-1 h-4 w-4" />Back</Button>
      <h2 className="mb-2 text-2xl font-bold">Why Advertise With Us?</h2>
      <p className="mb-8 text-sm text-slate-400">Here&apos;s what Tunog Kalye Radio brings to the table.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: "Monthly Listeners", value: "Growing Daily", sub: "24/7 global stream with CDN delivery", icon: Headphones },
          { label: "Facebook Reach", value: "Filipino Diaspora", sub: "Active engagement across Canada & Middle East", icon: Users },
          { label: "Avg. Listen Duration", value: "45+ Minutes", sub: "Longer than typical internet radio", icon: BarChart3 },
          { label: "Content Quality", value: "Human-Curated", sub: "No algorithms. Real DJs, real music, real fans.", icon: Star },
        ].map((s) => (
          <Card key={s.label} className="border-white/10 bg-[#12121a]">
            <CardContent className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10"><s.icon className="h-5 w-5 text-amber-400" /></div>
              <div><div className="text-xs text-slate-500">{s.label}</div><div className="text-lg font-bold text-white">{s.value}</div><div className="text-xs text-slate-600">{s.sub}</div></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-white/10 bg-[#12121a] p-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Preview: Your Ad on Tunog Kalye</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-[#12121a] p-4">
            <div className="mb-2 text-xs text-slate-500">ON-AIR SHOUTOUT</div>
            <p className="text-sm text-slate-300">&ldquo;This hour of Tunog Kalye Radio is brought to you by <span className="font-bold text-amber-400">[Your Restaurant Name]</span>, serving the best Pinoy food in Surrey. Visit them at 123 King George Blvd!&rdquo;</p>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-[#12121a] p-4">
            <div className="mb-2 text-xs text-slate-500">WEBSITE BANNER</div>
            <div className="flex h-20 items-center justify-center rounded-md border border-amber-500/20 bg-amber-500/10">
              <span className="text-sm font-bold text-amber-400">Sponsored by [Your Business Name]</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 text-center">
        <Button size="lg" onClick={() => setStep(3)} className="bg-gradient-to-r from-amber-500 to-yellow-400 px-8 font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-300">
          View Pricing <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // STEP 3: PRICING
  if (step === 3) {
    const plans = [
      { name: "Shoutout", price: "$50", features: ["1 on-air shoutout per day", "Mentioned on our social media", "Logo on partner page"], popular: false },
      { name: "Banner", price: "$100", features: ["Everything in Shoutout", "Dedicated banner on tunogkalye.net", "Monthly listener report", "Priority scheduling"], popular: true },
      { name: "Premium", price: "$200", features: ["Everything in Banner", "Sponsored hour of radio", "Custom DJ intro for your brand", "Exclusive category sponsorship"], popular: false },
    ];
    return (
      <div className="mx-auto max-w-4xl">
        <ProgressBar steps={sponsorSteps} current={3} colors={FM.sponsor} />
        <Button variant="ghost" onClick={() => setStep(2)} className="mb-6 text-slate-400 hover:text-white"><ChevronLeft className="mr-1 h-4 w-4" />Back</Button>
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">Choose Your Package</h2>
          <p className="text-sm text-slate-400">Transparent pricing. No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative overflow-hidden border ${plan.popular ? "border-amber-500/50 bg-[#14141f] shadow-lg shadow-amber-500/10" : "border-white/10 bg-[#12121a]"}`}>
              {plan.popular && <div className="absolute right-0 top-0 bg-gradient-to-r from-amber-500 to-yellow-400 px-3 py-1 text-xs font-bold text-black">MOST POPULAR</div>}
              <CardHeader className="text-center">
                <CardTitle className="text-lg text-white">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1"><span className="text-3xl font-black text-amber-400">{plan.price}</span><span className="text-sm text-slate-500">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">{plan.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm text-slate-400"><CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />{f}</li>)}</ul>
              </CardContent>
              <CardFooter>
                <Button onClick={() => { uf("plan", plan.name); setStep(4); }} className={`w-full font-bold ${plan.popular ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:from-amber-400 hover:to-yellow-300" : "border-white/20 bg-white/5 text-white hover:bg-white/10"}`}>
                  {plan.popular ? "Get Started" : "Select Plan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // STEP 4: FORM
  if (step === 4) return (
    <div className="mx-auto max-w-xl">
      <ProgressBar steps={sponsorSteps} current={4} colors={FM.sponsor} />
      <Button variant="ghost" onClick={() => setStep(3)} className="mb-6 text-slate-400 hover:text-white"><ChevronLeft className="mr-1 h-4 w-4" />Back</Button>
      <div className="rounded-2xl border border-amber-500/20 bg-[#12121a] p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10"><CreditCard className="h-7 w-7 text-amber-400" /></div>
          <h2 className="text-2xl font-bold">Complete Your Inquiry</h2>
          <p className="text-sm text-slate-400">We&apos;ll be in touch within 24 hours to finalize your sponsorship.</p>
          {fd.plan && <Badge className="mt-2 border-amber-500/30 bg-amber-500/20 text-amber-400">{fd.plan} Plan</Badge>}
        </div>
        {submitResult && !submitResult.success && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{submitResult.message}</div>
        )}
        <div className="space-y-4">
          <div className="space-y-2"><Label className="text-sm text-slate-300">Business Name *</Label><Input placeholder="e.g., Max's Restaurant" value={fd.businessName} onChange={(e) => uf("businessName", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/30" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label className="text-sm text-slate-300">Contact Name *</Label><Input placeholder="Your full name" value={fd.contactName} onChange={(e) => uf("contactName", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/30" /></div>
            <div className="space-y-2"><Label className="text-sm text-slate-300">Email *</Label><Input type="email" placeholder="contact@business.com" value={fd.email} onChange={(e) => uf("email", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/30" /></div>
          </div>
          <div className="space-y-2"><Label className="text-sm text-slate-300">Phone (Optional)</Label><Input placeholder="(604) 555-1234" value={fd.phone} onChange={(e) => uf("phone", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/30" /></div>
          <Button onClick={handleSubmit} disabled={isSubmitting || !fd.businessName || !fd.contactName || !fd.email} className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 py-5 text-lg font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50">
            {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</> : <><CreditCard className="mr-2 h-5 w-5" />Submit Inquiry</>}
          </Button>
          <p className="text-center text-xs text-slate-600">We accept payments via Stripe and PayPal after inquiry confirmation.</p>
        </div>
      </div>
    </div>
  );

  // STEP 5: THANK YOU (NEWLY ADDED)
  return (
    <div className="mx-auto max-w-2xl">
      <ProgressBar steps={sponsorSteps} current={5} colors={FM.sponsor} />
      <div className="rounded-2xl border border-green-500/20 bg-[#12121a] p-8 sm:p-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <Badge className="mb-3 border-green-500/30 bg-green-500/20 text-green-400">INQUIRY RECEIVED</Badge>
        <h2 className="mb-2 text-3xl font-black text-white">INQUIRY RECEIVED!</h2>
        <p className="mb-2 text-slate-300">Thank you for your interest in advertising with Tunog Kalye Radio.</p>
        {fd.plan && <p className="mb-6 text-sm text-slate-500">Selected Plan: <span className="font-bold text-amber-400">{fd.plan}</span></p>}
      </div>

      {/* What Happens Next */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#12121a] p-6 sm:p-8">
        <h3 className="mb-6 text-lg font-bold text-white">What Happens Next</h3>
        <Timeline accentColor="bg-amber-500" items={[
          { icon: Mail, time: "Within 24 Hours", title: "Our Team Reviews Your Inquiry", desc: "A real person (not an automated system) will review your sponsorship request and business details." },
          { icon: Users, time: "This Week", title: "We Schedule a Discovery Call", desc: "We'll reach out to schedule a quick call to discuss your campaign goals, customize your ad creative, and set a launch date." },
          { icon: TrendingUp, time: "Go Live", title: "Your Ad Reaches Thousands", desc: "Your branded shoutout and/or banner goes live on Tunog Kalye Radio, reaching Filipino music lovers across the globe." },
        ]} />
      </div>

      {/* Summary */}
      <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3">
          <Star className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <div className="mb-1 text-sm font-bold text-white">Why Businesses Choose Us</div>
            <p className="text-sm text-slate-400">Tunog Kalye Radio reaches a highly engaged, passionate audience that mainstream platforms can't replicate. Our listeners don't just hear your ad — they <span className="font-bold text-amber-400">trust</span> it, because it comes from a station they love. This translates to higher conversion rates and stronger brand recall for your business.</p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={goHome} className="bg-gradient-to-r from-amber-500 to-yellow-400 font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-300">
          Explore Other Pathways
        </Button>
        <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
          <Globe className="mr-2 h-5 w-5" /> Visit tunogkalye.net
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PATHWAY 3: SUPER FAN / DONATIONS
// ═══════════════════════════════════════════════════════════
function DonatePathway({ step, setStep, goHome, navigateTo, isSubmitting, setIsSubmitting, submitResult, setSubmitResult }: {
  step: number; setStep: (s: number) => void; goHome: () => void; navigateTo: (f: PathwayId) => void;
  isSubmitting: boolean; setIsSubmitting: (b: boolean) => void;
  submitResult: { success: boolean; message: string } | null; setSubmitResult: (r: { success: boolean; message: string } | null) => void;
}) {
  const [tier, setTier] = useState<string | null>(null);
  const [info, setInfo] = useState({ name: "", email: "", message: "" });
  const uf = (f: string, v: string) => setInfo((p) => ({ ...p, [f]: v }));

  const tiers = [
    { id: "coffee", name: "Buy Us a Coffee", price: "$5", amt: 5, icon: Coffee, desc: "A small token that keeps the speakers buzzing. Every coffee fuels another hour of independent OPM on air.", color: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30", ic: "text-amber-400" },
    { id: "hour", name: "Sponsor an Hour", price: "$20", amt: 20, icon: Zap, desc: "Fund a full hour of commercial-free broadcasting. Your name appears on our \"Sponsored by\" on-air mention.", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", ic: "text-blue-400" },
    { id: "day", name: "Fund a Day", price: "$50", amt: 50, icon: Radio, desc: "Cover an entire day of streaming costs. You get a dedicated shoutout and your name on our website for 24 hours.", color: "from-purple-500/20 to-violet-500/20", border: "border-purple-500/30", ic: "text-purple-400" },
    { id: "kanto", name: "Kanto Champion", price: "$100", amt: 100, icon: Star, desc: "The ultimate fan tier. Your contribution goes directly to the Kanto Fund, supporting independent artists every quarter.", color: "from-rose-500/20 to-pink-500/20", border: "border-rose-500/30", ic: "text-rose-400" },
  ];

  const handleDonate = async () => {
    if (!tier) return;
    setIsSubmitting(true);
    try {
      const t = tiers.find((t) => t.id === tier);
      const res = await fetch("/api/donate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...info, amount: t?.amt || 5, tier }) });
      const data = await res.json();
      setSubmitResult({ success: res.ok, message: data.message || data.error });
      if (res.ok) setStep(4);
    } catch { setSubmitResult({ success: false, message: "Network error. Please try again." }); } finally { setIsSubmitting(false); }
  };

  const selectedTier = tiers.find((t) => t.id === tier);

  // STEP 1: LANDING
  if (step === 1) return (
    <div className="mx-auto max-w-3xl">
      <ProgressBar steps={["Support", "Choose", "Done"]} current={1} colors={FM.donate} />

      {/* HOW TUNOG KALYE SUSTAINS ITSELF */}
      <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-[#12121a] p-6 sm:p-8">
        <h3 className="mb-4 text-center text-lg font-bold text-white">How Tunog Kalye Sustains Itself</h3>
        <p className="mb-5 text-center text-sm text-slate-400 leading-relaxed">
          Traditional radio makes money by taking 50% of an artist&apos;s merch or charging them to play their music. We refuse to do that. Instead, Tunog Kalye operates on a modern, three-pillar business model:
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: DollarSign,
              title: "B2B Local Sponsorships",
              subtitle: "Primary Revenue",
              desc: "We sell highly targeted audio ads and digital banner placements to local businesses — Pinoy restaurants in Surrey, local real estate, event promoters. This is the engine that pays our operational costs and funds the Kanto Fund.",
              color: "from-amber-500 to-yellow-400",
              border: "border-amber-500/20",
              iconBg: "bg-amber-500/10",
              iconColor: "text-amber-400",
            },
            {
              icon: Server,
              title: "Community Infrastructure Support",
              subtitle: "Operational",
              desc: "For listeners who want to support the platform directly, these contributions go strictly toward server hosting (Oracle/Cloudflare), bandwidth, and studio maintenance. Every dollar is accounted for.",
              color: "from-blue-500 to-cyan-400",
              border: "border-blue-500/20",
              iconBg: "bg-blue-500/10",
              iconColor: "text-blue-400",
            },
            {
              icon: ShoppingBag,
              title: "E-Commerce Volume Pipeline",
              subtitle: "Volume Growth",
              desc: "While we take a strict 0% commission on artist merch, driving thousands of listeners through our Hub creates massive e-commerce volume, making us the most valuable digital partner for independent Pinoy artists.",
              color: "from-emerald-500 to-teal-400",
              border: "border-emerald-500/20",
              iconBg: "bg-emerald-500/10",
              iconColor: "text-emerald-400",
            },
          ].map((pillar) => (
            <div key={pillar.title} className={`rounded-xl border ${pillar.border} bg-white/[0.02] p-4 text-center`}>
              <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${pillar.iconBg}`}>
                <pillar.icon className={`h-5 w-5 ${pillar.iconColor}`} />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{pillar.subtitle}</div>
              <div className="mt-1 text-sm font-bold text-white">{pillar.title}</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#12121a] overflow-hidden">
        <div className="relative px-6 py-12 sm:px-12 sm:py-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-950/40 to-pink-950/30" />
          <div className="relative z-10">
            <Badge className="mb-4 border-rose-500/30 bg-rose-500/20 px-3 py-1 text-xs font-medium text-rose-400">
              <Heart className="mr-1 h-3 w-3" /> COMMUNITY SUPPORT
            </Badge>
            <h2 className="mb-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              Keep the{" "}
              <span className="bg-gradient-to-r from-rose-500 to-pink-400 bg-clip-text text-transparent">Transmitter Running</span>
            </h2>
            <p className="mb-6 text-lg text-slate-300">Support the infrastructure that keeps independent OPM on air, 24/7. Every contribution goes directly to server hosting, bandwidth, and station maintenance.</p>
            <div className="mx-auto mb-8 max-w-md space-y-3 text-left">
              {["B2B sponsorships fund our operations — we don't rely on donations to survive.", "The Kanto Fund redistributes sponsorship revenue to top-charting artists.", "Your infrastructure support keeps Oracle/Cloudflare servers running 24/7.", "Every supporter is recognized on air and on our website."].map((item, i) => (
                <div key={i} className="flex items-start gap-3"><Heart className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" /><span className="text-sm text-slate-300">{item}</span></div>
              ))}
            </div>
            <Button size="lg" onClick={() => setStep(2)} className="bg-gradient-to-r from-rose-500 to-pink-400 px-8 text-lg font-bold text-white shadow-lg shadow-rose-500/20 hover:from-rose-400 hover:to-pink-300">
              <Heart className="mr-2 h-5 w-5" /> Choose Your Support Tier
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // STEP 2: TIER SELECTION
  if (step === 2) return (
    <div className="mx-auto max-w-3xl">
      <ProgressBar steps={["Support", "Choose", "Done"]} current={2} colors={FM.donate} />
      <Button variant="ghost" onClick={() => setStep(1)} className="mb-6 text-slate-400 hover:text-white"><ChevronLeft className="mr-1 h-4 w-4" />Back</Button>
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">How Would You Like to Support?</h2>
        <p className="text-sm text-slate-400">Pick the tier that works for you. Every contribution matters.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tiers.map((t) => (
          <Card key={t.id} onClick={() => { setTier(t.id); setStep(3); }} className={`group cursor-pointer border transition-all duration-300 ${tier === t.id ? `${t.border} bg-gradient-to-br ${t.color} shadow-lg` : "border-white/10 bg-[#12121a] hover:border-white/20 hover:bg-[#14141f]"}`}>
            <CardContent className="flex items-start gap-4 p-6">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${t.color}`}><t.icon className={`h-6 w-6 ${t.ic}`} /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between"><div className="font-bold text-white">{t.name}</div><div className={`text-xl font-black ${t.ic}`}>{t.price}</div></div>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{t.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 rounded-xl border border-white/5 bg-[#12121a] p-4 text-center">
        <p className="text-xs text-slate-500">Secure payments processed via Stripe or PayPal. Your contribution goes strictly toward server hosting (Oracle/Cloudflare), bandwidth, and station maintenance.</p>
      </div>
    </div>
  );

  // STEP 3: CHECKOUT FORM
  if (step === 3) return (
    <div className="mx-auto max-w-xl">
      <ProgressBar steps={["Support", "Choose", "Done"]} current={3} colors={FM.donate} />
      <Button variant="ghost" onClick={() => setStep(2)} className="mb-6 text-slate-400 hover:text-white"><ChevronLeft className="mr-1 h-4 w-4" />Back</Button>
      {submitResult && !submitResult.success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{submitResult.message}</div>
      )}
      <div className="rounded-2xl border border-rose-500/20 bg-[#12121a] p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10"><Heart className="h-7 w-7 text-rose-400" /></div>
          <h2 className="text-2xl font-bold">Complete Your Support</h2>
          <p className="text-sm text-slate-400">Almost there! Your generosity keeps the Kanto alive.</p>
          {selectedTier && <Badge className="mt-2 border-rose-500/30 bg-rose-500/20 text-rose-400">{selectedTier.name} — {selectedTier.price}</Badge>}
        </div>
        <div className="space-y-4">
          <div className="space-y-2"><Label className="text-sm text-slate-300">Name (Optional — leave blank for anonymous)</Label><Input placeholder="Your name" value={info.name} onChange={(e) => uf("name", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-rose-500/50 focus:ring-rose-500/30" /></div>
          <div className="space-y-2"><Label className="text-sm text-slate-300">Email (Optional)</Label><Input type="email" placeholder="your.email@example.com" value={info.email} onChange={(e) => uf("email", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-rose-500/50 focus:ring-rose-500/30" /></div>
          <div className="space-y-2"><Label className="text-sm text-slate-300">Message (Optional)</Label><Textarea placeholder="Any message for the station or the artists?" rows={2} value={info.message} onChange={(e) => uf("message", e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-rose-500/50 focus:ring-rose-500/30" /></div>
          <Button onClick={handleDonate} disabled={isSubmitting || !tier} className="w-full bg-gradient-to-r from-rose-500 to-pink-400 py-5 text-lg font-bold text-white shadow-lg shadow-rose-500/20 hover:from-rose-400 hover:to-pink-300 disabled:opacity-50">
            {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</> : <><Heart className="mr-2 h-5 w-5" />Confirm Support — {selectedTier?.price}</>}
          </Button>
          <p className="text-center text-xs text-slate-600">Secure payment via Stripe or PayPal. Tax receipts available upon request.</p>
        </div>
      </div>
    </div>
  );

  // STEP 4: THANK YOU
  return (
    <div className="mx-auto max-w-2xl">
      <ProgressBar steps={["Support", "Choose", "Done"]} current={3} colors={FM.donate} />
      <div className="rounded-2xl border border-green-500/20 bg-[#12121a] p-8 sm:p-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10">
          <Heart className="h-10 w-10 text-rose-400" />
        </div>
        <Badge className="mb-3 border-rose-500/30 bg-rose-500/20 text-rose-400">SUPPORT CONFIRMED</Badge>
        <h2 className="mb-2 text-3xl font-black text-white">MARAMING SALAMAT!</h2>
        <p className="mb-2 text-slate-300">
          {selectedTier?.id === "kanto"
            ? "Your Kanto Champion contribution means the world. You're directly funding the next generation of Filipino indie artists."
            : selectedTier?.id === "day"
            ? "An entire day of OPM broadcasting is now funded thanks to you. The music never stops."
            : selectedTier?.id === "hour"
            ? "You just sponsored an hour of commercial-free OPM. That hour belongs to the fans."
            : "Your support keeps the speakers buzzing. Every coffee counts."}
        </p>
        {selectedTier && <p className="mb-4 text-sm text-slate-500">Your Contribution: <span className="font-bold text-rose-400">{selectedTier.name} ({selectedTier.price})</span></p>}
        {info.name && <p className="mb-6 text-sm text-slate-400">Supporter: <span className="font-medium text-white">{info.name}</span></p>}
        {!info.name && <div className="mb-6" />}
      </div>

      {/* What Happens Next */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#12121a] p-6 sm:p-8">
        <h3 className="mb-6 text-lg font-bold text-white">What Happens Next</h3>
        <Timeline accentColor="bg-rose-500" items={[
          { icon: Radio, time: "Immediately", title: "Your Name Joins Our Supporter Roll", desc: "Your name (or \"Anonymous\") will be mentioned on air as a Tunog Kalye supporter during our next broadcast." },
          { icon: Music, time: "This Quarter", title: "Kanto Fund Distributes to Artists", desc: "If you chose the Kanto Champion tier, your contribution goes directly into the next quarterly Kanto Fund distribution to top-charting indie artists." },
          { icon: Mail, time: "Ongoing", title: "You Receive Impact Updates", desc: "We'll send you periodic updates showing exactly which artists your support helped and how the Kanto Fund is making a difference." },
        ]} />
      </div>

      {/* Spread the Love */}
      <div className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
        <div className="flex items-start gap-3">
          <PartyPopper className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
          <div>
            <div className="mb-1 text-sm font-bold text-white">Spread the Love</div>
            <p className="text-sm text-slate-400">Know someone who loves OPM? Share Tunog Kalye Radio with them. Every new listener makes the Kanto stronger. <span className="font-bold text-rose-400">Music is better when it's shared.</span></p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" className="bg-gradient-to-r from-rose-500 to-pink-400 font-bold text-white shadow-lg shadow-rose-500/20 hover:from-rose-400 hover:to-pink-300">
          <Headphones className="mr-2 h-5 w-5" /> Listen Live Now
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigateTo("sponsor")} className="border-white/20 bg-white/5 text-white hover:bg-white/10">
          <DollarSign className="mr-2 h-5 w-5 text-amber-400" /> Become a Sponsor
        </Button>
        <Button size="lg" variant="outline" onClick={goHome} className="border-white/20 bg-white/5 text-white hover:bg-white/10">
          Back to Pathways
        </Button>
      </div>
    </div>
  );
}
