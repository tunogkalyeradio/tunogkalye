import Link from "next/link";
import {
  Radio, ArrowLeft, Zap, Eye, Target, Layers, Users, DollarSign,
  Server, Megaphone, BarChart3, Shield, Lightbulb, Globe, Music,
  Mic2, ShoppingBag, MapPin, TrendingUp, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LeanCanvasPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Hub</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/tunog-kalye-logo.png" alt="Tunog Kalye Radio" className="h-10 w-10 object-contain" />
              <span className="text-sm font-bold tracking-tight">
                TUNOG KALYE<span className="text-red-400"> RADIO</span>
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-16">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-2xl border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-red-950/80 via-[#0a0a0f]/90 to-orange-950/60" />
            <div className="relative z-10 px-6 py-14 sm:px-12 sm:py-20 text-center">
              <Badge className="mb-4 border-red-500/30 bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400 backdrop-blur-sm">
                <Lightbulb className="mr-1 h-3 w-3" /> BUSINESS MODEL
              </Badge>
              <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                TKR Lean{" "}
                <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">Canvas</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-slate-300">
                The strategic blueprint behind Tunog Kalye Radio — a lean, sustainable media business built to scale independent Filipino music globally.
              </p>
            </div>
          </section>

          {/* LEAN CANVAS GRID */}
          <section>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              {/* 1. PROBLEM */}
              <Card className="border-red-500/20 bg-[#12121a] md:row-span-2 lg:row-span-1">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                    <Target className="h-5 w-5 text-red-400" />
                  </div>
                  <CardTitle className="text-lg text-white">1. Problem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-1 text-xs font-bold uppercase tracking-wider text-red-400">For Artists</div>
                    <p className="text-sm text-slate-400 leading-relaxed">Streaming algorithms bury niche genres (indie OPM). Traditional radio requires payola and steals copyrights. Current platforms take massive cuts of merch revenue.</p>
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-bold uppercase tracking-wider text-orange-400">For Fans</div>
                    <p className="text-sm text-slate-400 leading-relaxed">The Filipino diaspora feels culturally disconnected. No single curated hub exists that bridges 90s nostalgia with modern indie.</p>
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-400">For Sponsors</div>
                    <p className="text-sm text-slate-400 leading-relaxed">Mainstream local advertising (billboards, FM radio) is bloated, expensive, and untargeted towards the specific Pinoy demographic.</p>
                  </div>
                </CardContent>
              </Card>

              {/* 2. EXISTING ALTERNATIVES */}
              <Card className="border-white/10 bg-[#12121a]">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                    <Layers className="h-5 w-5 text-slate-400" />
                  </div>
                  <CardTitle className="text-lg text-white">2. Existing Alternatives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="mb-1 text-sm font-bold text-white">Spotify / YouTube</div>
                    <p className="text-xs text-slate-500 leading-relaxed">Algorithm-driven, zero curation, terrible payouts, encourages piracy.</p>
                  </div>
                  <div>
                    <div className="mb-1 text-sm font-bold text-white">Traditional PH Radio</div>
                    <p className="text-xs text-slate-500 leading-relaxed">Gated by major labels, relies on payola, ignores global diaspora.</p>
                  </div>
                  <div>
                    <div className="mb-1 text-sm font-bold text-white">Social Media (FB/IG)</div>
                    <p className="text-xs text-slate-500 leading-relaxed">Highly volatile reach, artists have to pay to boost posts.</p>
                  </div>
                </CardContent>
              </Card>

              {/* 3. UNIQUE VALUE PROPOSITION */}
              <Card className="border-orange-500/20 bg-[#12121a] lg:row-span-2">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 shadow-lg shadow-red-500/20">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg text-white">3. Unique Value Proposition</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    The premier grassroots broadcasting network for Filipino independent music. We provide enterprise-grade global reach with a strict 0% artist commission model, funded by hyper-targeted B2B sponsorships. No algorithms. No middlemen.
                  </p>
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">High-Level Concept</div>
                    <p className="text-sm text-white font-medium">&ldquo;NPR for Filipino Indie Music&rdquo; — meets — &ldquo;Anti-algorithm grassroots stage&rdquo;</p>
                  </div>
                  <div className="mt-4 space-y-2">
                    {["Enterprise-grade global reach at indie costs", "0% artist commission — always", "B2B-funded, not donation-dependent", "Human-curated, not algorithm-driven"].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-400" />
                        <span className="text-xs text-slate-400">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 4. SOLUTION */}
              <Card className="border-white/10 bg-[#12121a]">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Lightbulb className="h-5 w-5 text-emerald-400" />
                  </div>
                  <CardTitle className="text-lg text-white">4. Solution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10"><Radio className="h-3.5 w-3.5 text-red-400" /></div>
                    <div>
                      <div className="text-sm font-bold text-white">The Broadcast</div>
                      <p className="text-xs text-slate-500">24/7 human-curated streaming via the custom Kanto Broadcast Engine (Oracle/Cloudflare).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10"><ShoppingBag className="h-3.5 w-3.5 text-emerald-400" /></div>
                    <div>
                      <div className="text-sm font-bold text-white">The Hub</div>
                      <p className="text-xs text-slate-500">A proprietary e-commerce funnel (Vercel) routing 100% of merch/tip revenue directly to artists.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10"><Shield className="h-3.5 w-3.5 text-blue-400" /></div>
                    <div>
                      <div className="text-sm font-bold text-white">The Open Kanto Policy</div>
                      <p className="text-xs text-slate-500">Non-exclusive broadcasting rights. Artists keep 100% of their copyrights.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/10"><Globe className="h-3.5 w-3.5 text-purple-400" /></div>
                    <div>
                      <div className="text-sm font-bold text-white">The Pipeline</div>
                      <p className="text-xs text-slate-500">Strategic PH partnerships (YY Ent, Lily Records) to physically bridge artists to Canadian stages.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 5. CHANNELS */}
              <Card className="border-white/10 bg-[#12121a]">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                    <Megaphone className="h-5 w-5 text-cyan-400" />
                  </div>
                  <CardTitle className="text-lg text-white">5. Channels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="mb-1 text-sm font-bold text-white">Artist Network Effect</div>
                    <p className="text-xs text-slate-500">Artists share their &ldquo;Now Playing&rdquo; status — drives their fans to our site.</p>
                  </div>
                  <div>
                    <div className="mb-1 text-sm font-bold text-white">Nostalgia Marketing</div>
                    <p className="text-xs text-slate-500">TikTok/Reels using 90s OPM audio hooks to capture older demographic.</p>
                  </div>
                  <div>
                    <div className="mb-1 text-sm font-bold text-white">Physical Footprint</div>
                    <p className="text-xs text-slate-500">Live broadcasts from Narra Lounge (Surrey) and local Pinoy events.</p>
                  </div>
                  <div>
                    <div className="mb-1 text-sm font-bold text-white">SEO</div>
                    <p className="text-xs text-slate-500">Dominating long-tail search terms (&ldquo;90s OPM radio&rdquo;, &ldquo;Pinoy indie Surrey&rdquo;).</p>
                  </div>
                </CardContent>
              </Card>

              {/* 6. REVENUE STREAMS */}
              <Card className="border-amber-500/20 bg-[#12121a]">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                    <DollarSign className="h-5 w-5 text-amber-400" />
                  </div>
                  <CardTitle className="text-lg text-white">6. Revenue Streams</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400">Primary (B2B)</div>
                    <p className="mt-1 text-sm text-slate-300">Local Sponsorships — Audio shoutouts and website banner ads targeting Surrey Pinoy businesses.</p>
                  </div>
                  <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-orange-400">Secondary (B2B)</div>
                    <p className="mt-1 text-sm text-slate-300">Event Sponsorships — Pasko sa Surrey, YY Entertainment concert after-parties.</p>
                  </div>
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-400">Tertiary</div>
                    <p className="mt-1 text-sm text-slate-300">Infrastructure Support — Listener contributions for server hosting and station maintenance.</p>
                  </div>
                </CardContent>
              </Card>

              {/* 7. COST STRUCTURE */}
              <Card className="border-white/10 bg-[#12121a]">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                    <Server className="h-5 w-5 text-slate-400" />
                  </div>
                  <CardTitle className="text-lg text-white">7. Cost Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    <div>
                      <div className="text-sm font-bold text-white">Tech Infrastructure</div>
                      <p className="text-xs text-slate-500">Oracle Cloud (Free Tier), Cloudflare CDN, Vercel (Hub hosting), Domain fees. Extremely low overhead.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mic2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    <div>
                      <div className="text-sm font-bold text-white">Operational</div>
                      <p className="text-xs text-slate-500">Gear maintenance (Yamaha DM3, RodeCaster — already owned).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    <div>
                      <div className="text-sm font-bold text-white">Marketing</div>
                      <p className="text-xs text-slate-500">Targeted Facebook ad spend for specific local campaigns.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 8. KEY METRICS */}
              <Card className="border-white/10 bg-[#12121a]">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                    <BarChart3 className="h-5 w-5 text-green-400" />
                  </div>
                  <CardTitle className="text-lg text-white">8. Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="mb-1 text-sm font-bold text-white"><span className="text-green-400">Growth:</span> Artist Submissions</div>
                    <p className="text-xs text-slate-500">Number of new artist submissions via Hub funnel per week.</p>
                  </div>
                  <div>
                    <div className="mb-1 text-sm font-bold text-white"><span className="text-blue-400">Engagement:</span> Live Requests</div>
                    <p className="text-xs text-slate-500">Number of live song requests during peak &ldquo;Golden Window&rdquo; hours.</p>
                  </div>
                  <div>
                    <div className="mb-1 text-sm font-bold text-white"><span className="text-amber-400">Revenue:</span> Sponsor Retention</div>
                    <p className="text-xs text-slate-500">B2B Sponsor retention rate and average revenue per sponsor.</p>
                  </div>
                  <div>
                    <div className="mb-1 text-sm font-bold text-white"><span className="text-emerald-400">Volume:</span> Merch Throughput</div>
                    <p className="text-xs text-slate-500">Total $ amount of artist merch/tips routed through the Hub.</p>
                  </div>
                </CardContent>
              </Card>

              {/* 9. UNFAIR ADVANTAGE */}
              <Card className="border-purple-500/20 bg-[#12121a] lg:col-span-3">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg shadow-purple-500/20">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg text-white">9. Unfair Advantage</CardTitle>
                  <p className="text-xs text-slate-500">What competitors cannot easily copy.</p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-purple-400" />
                        <div className="text-sm font-bold text-white">Physical/Digital Bridge</div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">We aren&apos;t just a website; we have the Narra Lounge recording studio and venue infrastructure. No internet-only station can replicate a physical presence where artists record, perform, and connect with fans in person.</p>
                    </div>
                    <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-pink-400" />
                        <div className="text-sm font-bold text-white">Exclusive Talent Pipelines</div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">Direct backdoor access to artists via Andrew (Grin Dept/YY Ent) and Clem Castro (Lily Records). These relationships took years to build and cannot be bought or replicated by a competitor entering the market.</p>
                    </div>
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Server className="h-4 w-4 text-red-400" />
                        <div className="text-sm font-bold text-white">The Tech Stack Architecture</div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">Our custom &ldquo;Kanto Broadcast Engine&rdquo; setup runs enterprise-level global radio for practically $0 in server costs. Traditional stations cannot pivot to this without rewriting their entire business model from scratch.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </section>

          {/* CTA */}
          <section className="rounded-2xl border border-white/10 bg-[#12121a] p-8 sm:p-12 text-center">
            <h2 className="mb-3 text-3xl font-black tracking-tight">
              Partner with the{" "}
              <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">Kanto</span>
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-slate-400">
              Whether you&apos;re an artist, a sponsor, or an investor — Tunog Kalye Radio is built for sustainable, long-term growth.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/about">
                <Button size="lg" className="bg-gradient-to-r from-red-600 to-orange-500 px-6 font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400">
                  <Eye className="mr-2 h-5 w-5" /> Learn More About Us
                </Button>
              </Link>
              <Link href="/kanto-fund">
                <Button size="lg" variant="outline" className="border-white/20 bg-white/5 px-6 text-white hover:bg-white/10">
                  <DollarSign className="mr-2 h-5 w-5 text-emerald-400" /> View the Kanto Fund
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-black/20 mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-red-400" />
              <span className="text-sm text-slate-500">Tunog Kalye Radio &copy; 2026. All rights reserved.</span>
            </div>
            <div className="flex gap-4 text-xs text-slate-600">
              <Link href="/about" className="transition-colors hover:text-slate-400">About</Link>
              <span className="text-slate-700">|</span>
              <Link href="/lean-canvas" className="transition-colors hover:text-slate-400">Lean Canvas</Link>
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
    </div>
  );
}
