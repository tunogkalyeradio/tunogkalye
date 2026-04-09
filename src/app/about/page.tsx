import Link from "next/link";
import {
  Radio, ArrowLeft, Shield, HandCoins, Users, Heart, Globe,
  Music, Mic2, Zap, Eye, Sparkles, Server, ShoppingBag, Send,
  ArrowRight, Star, CircleDot, Cpu, Cloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
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
                <Radio className="mr-1 h-3 w-3" /> OUR STORY
              </Badge>
              <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                About Tunog Kalye{" "}
                <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">Radio</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-slate-300">
                The premier grassroots broadcasting network for Filipino independent music. Born from the streets, powered by the community.
              </p>
            </div>
          </section>

          {/* OUR STORY */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <Sparkles className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Our Story</h2>
            </div>
            <div className="mx-auto max-w-3xl space-y-5 text-slate-300 leading-relaxed">
              <p>
                <span className="font-bold text-white">Tunog Kalye</span> literally means <span className="font-bold text-orange-400">&ldquo;street sound&rdquo;</span> in Tagalog — and that&apos;s exactly where we started. Born from the <em>kanto</em> (street corner), Tunog Kalye Radio was founded as a passion project with a singular mission: to give Filipino independent artists the global stage they deserve.
              </p>
              <p>
                We bridge two worlds — the golden era of 90s OPM alt-rock that shaped a generation, and today&apos;s modern indie movement that&apos;s redefining what Pinoy music can be. From grunge-inspired riffs to bedroom-produced lo-fi beats, we celebrate it all. If it&apos;s Filipino, independent, and authentic, it belongs on our airwaves.
              </p>
              <p>
                Based in <span className="font-bold text-white">Surrey, BC, Canada</span>, Tunog Kalye Radio reaches the Filipino diaspora worldwide — from Vancouver to Manila, Dubai to Toronto. We&apos;re not just a radio station; we&apos;re a growing community of artists, fans, and believers who know that the best music doesn&apos;t always come from major labels. Sometimes, it comes from the kanto.
              </p>
            </div>
          </section>

          {/* MISSION & VISION */}
          <section className="grid gap-6 md:grid-cols-2">
            <Card className="border-white/10 bg-[#12121a] hover:border-red-500/30 transition-colors">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 shadow-lg shadow-red-500/20">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-white">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 leading-relaxed">
                  To democratize Filipino independent music by providing a platform where every artist — signed or unsigned, professional or bedroom producer — can be heard globally. We believe music from the kanto deserves the same stage as music from the mainstream. No gatekeepers. No middlemen. Just music.
                </p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-[#12121a] hover:border-orange-500/30 transition-colors">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 shadow-lg shadow-amber-500/20">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-white">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 leading-relaxed">
                  A world where Filipino independent music thrives — where artists earn fairly, fans discover new music daily, and the community sustains itself through the Kanto Growth Loop. We envision a self-sustaining ecosystem where every stream, every share, and every purchase feeds back into the music.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* WHAT MAKES US DIFFERENT */}
          <section>
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">What Makes Us Different</h2>
              <p className="text-sm text-slate-500">We&apos;re not just another internet radio station. Here&apos;s why artists and fans choose the Kanto.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Shield,
                  gradient: "from-green-500 to-emerald-400",
                  shadow: "shadow-green-500/20",
                  title: "Open Kanto Policy",
                  desc: "100% copyright retention. We only ask for non-exclusive broadcasting rights. Your music is yours — always.",
                },
                {
                  icon: HandCoins,
                  gradient: "from-emerald-500 to-teal-400",
                  shadow: "shadow-emerald-500/20",
                  title: "Zero Commission",
                  desc: "We take no cuts from your merch sales, tips, or external revenue. What you earn is entirely yours.",
                },
                {
                  icon: Mic2,
                  gradient: "from-red-600 to-orange-500",
                  shadow: "shadow-red-500/20",
                  title: "Human-Curated",
                  desc: "Real DJs program every show — not algorithms. Every track is hand-picked for quality and vibe.",
                },
                {
                  icon: Zap,
                  gradient: "from-amber-500 to-yellow-400",
                  shadow: "shadow-amber-500/20",
                  title: "Kanto Growth Loop",
                  desc: "Play → notify → share → discover. Every aired song fuels community-driven discovery and growth.",
                },
                {
                  icon: Heart,
                  gradient: "from-rose-500 to-pink-400",
                  shadow: "shadow-rose-500/20",
                  title: "Community First",
                  desc: "The Kanto Fund redistributes revenue to top-charting artists. Supporting music isn't just a tagline.",
                },
                {
                  icon: Globe,
                  gradient: "from-cyan-500 to-blue-400",
                  shadow: "shadow-cyan-500/20",
                  title: "24/7 Global Reach",
                  desc: "Powered by Cloudflare CDN and Oracle Cloud. Filipino indie music, accessible anywhere in the world.",
                },
              ].map((item) => (
                <Card
                  key={item.title}
                  className="border-white/10 bg-[#12121a] transition-all duration-300 hover:border-white/20 hover:bg-[#14141f] hover:shadow-lg"
                >
                  <CardHeader>
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg ${item.shadow}`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* OUR TEAM */}
          <section className="rounded-2xl border border-white/10 bg-[#12121a] p-8 sm:p-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-500 shadow-lg shadow-red-500/20">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">Built by Music Lovers, for Music Lovers</h2>
            <p className="mx-auto max-w-2xl text-slate-400 leading-relaxed">
              Tunog Kalye Radio is powered by a small but passionate team of Filipino music enthusiasts, DJs, developers, and designers. We&apos;re volunteers, indie artists ourselves, and people who believe that the Filipino indie music scene deserves world-class infrastructure. No corporate overlords. Just people who love music.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Badge variant="outline" className="border-white/10 text-slate-400">
                <Star className="mr-1 h-3 w-3" /> Passionate
              </Badge>
              <Badge variant="outline" className="border-white/10 text-slate-400">
                <Music className="mr-1 h-3 w-3" /> Independent
              </Badge>
              <Badge variant="outline" className="border-white/10 text-slate-400">
                <Globe className="mr-1 h-3 w-3" /> Worldwide
              </Badge>
            </div>
          </section>

          {/* TECH STACK */}
          <section>
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">Powered By</h2>
              <p className="text-sm text-slate-500">The technology stack behind Tunog Kalye Radio.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: Radio, name: "Kanto Broadcast Engine", desc: "Radio Automation" },
                { icon: Server, name: "Oracle Cloud", desc: "Infrastructure" },
                { icon: Cloud, name: "Cloudflare CDN", desc: "Global Delivery" },
                { icon: Cpu, name: "Next.js", desc: "Hub & Store" },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-[#12121a] p-5 text-center transition-colors hover:border-white/20 hover:bg-[#14141f]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                    <tech.icon className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="text-sm font-bold text-white">{tech.name}</div>
                  <div className="text-xs text-slate-500">{tech.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-2xl border border-white/10 bg-[#12121a] p-8 sm:p-12 text-center">
            <h2 className="mb-3 text-3xl font-black tracking-tight">
              Join the <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">Kanto</span>
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-slate-400">
              Whether you&apos;re an artist looking for airplay, a fan who wants to support the scene, or a sponsor who believes in Filipino music — there&apos;s a place for you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-red-600 to-orange-500 px-6 font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400">
                <Send className="mr-2 h-5 w-5" /> Submit Your Music
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 bg-white/5 px-6 text-white hover:bg-white/10">
                <Heart className="mr-2 h-5 w-5 text-rose-400" /> Support the Kanto
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 bg-white/5 px-6 text-white hover:bg-white/10">
                <ShoppingBag className="mr-2 h-5 w-5 text-emerald-400" /> Browse Merch
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
              <Radio className="h-4 w-4 text-red-400" />
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
