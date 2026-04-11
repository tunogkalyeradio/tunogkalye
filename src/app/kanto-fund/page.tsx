import Link from "next/link";
import {
  ArrowLeft, HandCoins, ShoppingBag, Heart, CheckCircle2,
  ArrowRight, Shield, TrendingUp, Users, FileText, DollarSign,
  Mic2, CreditCard, Music, Video, Guitar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function KantoFundPage() {
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
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <img src="/tunog-kalye-horizontal.png" alt="Tunog Kalye Radio" className="h-8 w-auto object-contain" />
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-16">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-2xl border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-[#0a0a0f]/90 to-teal-950/60" />
            <div className="relative z-10 px-6 py-14 sm:px-12 sm:py-20 text-center">
              <Badge className="mb-4 border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 backdrop-blur-sm">
                <HandCoins className="mr-1 h-3 w-3" /> ARTIST EMPOWERMENT
              </Badge>
              <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                The Kanto{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Fund</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-slate-300">
                Empowering Filipino indie artists, one quarter at a time. A transparent, community-driven revenue-sharing model.
              </p>
            </div>
          </section>

          {/* WHAT IS IT? */}
          <section>
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <HandCoins className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What Is the Kanto Fund?</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                The Kanto Fund is our transparent revenue-sharing model. <span className="font-bold text-white">10% of all merchandise sales</span> on hub.tunogkalye.net is pooled quarterly and distributed to our top-charting independent artists. It&apos;s our way of making sure that when the community succeeds, the artists benefit directly — not just the platform.
              </p>
              <p className="mt-4 text-slate-300 leading-relaxed">
                Unlike traditional models where intermediaries take the lion&apos;s share, the Kanto Fund was designed to be simple, transparent, and fair. Every peso in the fund comes from merchandise purchases, and every peso goes back to the artists who make the music worth listening to.
              </p>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section>
            <div className="mb-10 text-center">
              <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">How It Works</h2>
              <p className="text-sm text-slate-500">A simple, transparent cycle from purchase to payout.</p>
            </div>
            <div className="relative mx-auto max-w-3xl">
              {/* Connecting line */}
              <div className="absolute left-6 top-14 bottom-14 w-0.5 bg-gradient-to-b from-emerald-500/50 via-teal-500/30 to-emerald-500/50 hidden sm:block" />

              <div className="space-y-8">
                {[
                  {
                    num: "01",
                    icon: ShoppingBag,
                    color: "bg-emerald-500",
                    title: "Fans Purchase Merch",
                    desc: "Fans browse and buy artist merchandise on hub.tunogkalye.net. Every shirt, hoodie, sticker, and poster sold contributes to the fund.",
                  },
                  {
                    num: "02",
                    icon: CreditCard,
                    color: "bg-teal-500",
                    title: "10% Goes to the Kanto Fund Pool",
                    desc: "For every sale, 90% goes instantly to the artist via Stripe Connect. The remaining 10% is pooled into the Kanto Fund.",
                  },
                  {
                    num: "03",
                    icon: TrendingUp,
                    color: "bg-cyan-500",
                    title: "Quarterly Distribution",
                    desc: "At the end of each quarter (March, June, September, December), the pooled fund is distributed to our top-charting artists based on airplay and engagement.",
                  },
                  {
                    num: "04",
                    icon: Music,
                    color: "bg-green-500",
                    title: "Artists Use the Funds",
                    desc: "Artists use their Kanto Fund allocations to invest in their craft: recording sessions, music videos, live gigs, new equipment, and more.",
                  },
                ].map((step) => (
                  <div key={step.num} className="relative flex gap-5">
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#12121a] border-2 border-white/10">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step.color}`}>
                        <step.icon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="pt-1">
                      <div className="mb-1 text-xs font-bold text-emerald-400 uppercase tracking-wider">Step {step.num}</div>
                      <div className="text-lg font-bold text-white mb-1">{step.title}</div>
                      <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* REVENUE BREAKDOWN */}
          <section>
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">Revenue Breakdown</h2>
              <p className="text-sm text-slate-500">Here&apos;s exactly where your money goes when you buy merch.</p>
            </div>
            <div className="mx-auto max-w-xl">
              <div className="rounded-2xl border border-white/10 bg-[#12121a] p-6 sm:p-8">
                <div className="mb-6 text-center">
                  <div className="text-sm text-slate-500 mb-1">For every ₱100 sale</div>
                  <div className="text-4xl font-black text-white">₱100.00</div>
                </div>

                {/* Artist portion */}
                <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                        <Users className="h-4 w-4 text-emerald-400" />
                      </div>
                      <span className="font-bold text-white">Artist (Instant Payout)</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-400">₱90</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Transferred instantly via Stripe Connect. No delays, no deductions.</p>
                </div>

                {/* Kanto Fund portion */}
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20">
                        <HandCoins className="h-4 w-4 text-cyan-400" />
                      </div>
                      <span className="font-bold text-white">Kanto Fund (Quarterly)</span>
                    </div>
                    <span className="text-2xl font-black text-cyan-400">₱10</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full w-[10%] rounded-full bg-gradient-to-r from-cyan-500 to-blue-400" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Pooled quarterly and distributed to top-charting independent artists.</p>
                </div>
              </div>
            </div>
          </section>

          {/* TRANSPARENCY PROMISE */}
          <section>
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">Transparency Promise</h2>
              <p className="text-sm text-slate-500">We believe in full transparency. Here&apos;s what we publish.</p>
            </div>
            <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl border border-white/10 bg-[#12121a] p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { icon: DollarSign, label: "Total Fund Collected", desc: "Exact amount pooled each quarter" },
                    { icon: Users, label: "Artists Supported", desc: "Number of artists who received distributions" },
                    { icon: TrendingUp, label: "Individual Allocations", desc: "How much each artist received" },
                    { icon: FileText, label: "Fund Usage Reports", desc: "How artists used their allocations" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                        <item.icon className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{item.label}</div>
                        <div className="text-xs text-slate-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                  <p className="text-sm text-amber-300">
                    <Shield className="mr-1.5 inline h-4 w-4" />
                    Quarterly reports will be published here as the fund grows. We&apos;re committed to transparency from day one.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* HOW ARTISTS USE THE FUNDS */}
          <section>
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">How Artists Use the Funds</h2>
              <p className="text-sm text-slate-500">The Kanto Fund fuels the next generation of Filipino indie music.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Mic2, title: "Recording Sessions", desc: "Studio time, mixing, mastering — professional-quality sound.", color: "from-red-600 to-orange-500" },
                { icon: Video, title: "Music Videos", desc: "Visual storytelling that brings songs to life on screen.", color: "from-purple-600 to-pink-500" },
                { icon: Music, title: "Live Gigs", desc: "Venue rentals, equipment transport, and live event production.", color: "from-cyan-500 to-blue-400" },
                { icon: Guitar, title: "Equipment", desc: "New instruments, gear, and tools to elevate their craft.", color: "from-amber-500 to-yellow-400" },
              ].map((item) => (
                <Card key={item.title} className="border-white/10 bg-[#12121a] transition-all duration-300 hover:border-white/20 hover:bg-[#14141f]">
                  <CardHeader className="pb-3">
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-base text-white">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* HOW TO CONTRIBUTE */}
          <section>
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">How to Contribute</h2>
              <p className="text-sm text-slate-500">Every merch purchase and sponsorship dollar strengthens the fund.</p>
            </div>
            <div className="mx-auto max-w-3xl space-y-4">
              {[
                {
                  icon: ShoppingBag,
                  title: "Buy Merch",
                  desc: "Every merch purchase on hub.tunogkalye.net automatically contributes 10% to the Kanto Fund. Shop for your favorite artist's gear and support the community at the same time.",
                },
                {
                  icon: Heart,
                  title: "Infrastructure Support",
                  desc: "Use the \"Support the Station\" pathway on our hub to contribute toward server hosting and bandwidth. A portion is allocated to the Kanto Fund pool.",
                },
                {
                  icon: CheckCircle2,
                  title: "Kanto Champion ($100+)",
                  desc: "Donors who contribute $100 or more are recognized as Kanto Champions — dedicated supporters who go above and beyond for Filipino indie music.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-xl border border-white/10 bg-[#12121a] p-5 transition-colors hover:border-white/20">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <item.icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="mb-1 font-bold text-white">{item.title}</div>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-2xl border border-white/10 bg-[#12121a] p-8 sm:p-12 text-center">
            <h2 className="mb-3 text-3xl font-black tracking-tight">
              Support the{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Fund</span>
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-slate-400">
              Every purchase you make directly supports Filipino indie artists. Together, we can build a sustainable future for independent OPM.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-400">
                <Heart className="mr-2 h-5 w-5" /> Support the Fund
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 bg-white/5 px-6 text-white hover:bg-white/10">
                <ShoppingBag className="mr-2 h-5 w-5" /> Browse Merch Store
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-black/20 mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <img src="/tunog-kalye-horizontal.png" alt="TKR" className="h-5 w-auto object-contain" />
              <span className="text-sm text-slate-500">Tunog Kalye Radio &copy; 2026. All rights reserved.</span>
            </div>
            <div className="flex gap-4 text-xs text-slate-600">
              <Link href="/about" className="transition-colors hover:text-slate-400">About</Link>
              <span className="text-slate-700">|</span>
              <Link href="/kanto-fund" className="transition-colors hover:text-slate-400">Kanto Fund</Link>
              <span className="text-slate-700">|</span>
              <Link href="/terms" className="transition-colors hover:text-slate-400">Terms</Link>
              <span className="text-slate-700">|</span>
              <Link href="/privacy" className="transition-colors hover:text-slate-400">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
