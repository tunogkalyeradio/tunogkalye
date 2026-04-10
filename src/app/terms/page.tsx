"use client";

import Link from "next/link";
import { Radio, ArrowLeft, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      content: [
        "Welcome to Tunog Kalye Radio, accessible at hub.tunogkalye.net (the \"Hub\"). These Terms of Service (\"Terms\") govern your use of the Hub, including all features, services, and content provided therein.",
        "Tunog Kalye Radio is a broadcasting network and media platform dedicated to Filipino independent music. By accessing or using the Hub, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use the Hub.",
        "The Hub includes, but is not limited to: the merch store, music submission portal, artist dashboards, customer dashboards, infrastructure support pathways, sponsorship inquiry forms, and all associated content and functionality.",
      ],
    },
    {
      id: "account-registration",
      title: "2. Account Registration",
      content: [
        "To access certain features of the Hub (such as purchasing merch, managing an artist store, or accessing your dashboard), you must create an account.",
        "You must be at least 18 years of age to create an account and use the Hub. By creating an account, you represent and warrant that you are 18 years or older.",
        "You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. Providing false or misleading information may result in immediate account suspension or termination.",
        "You are responsible for safeguarding the password that you use to access the Hub and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.",
        "We reserve the right to disable any user account, at any time, in our sole discretion, for any or no reason, including if we believe that you have violated any provision of these Terms.",
      ],
    },
    {
      id: "artist-submissions",
      title: "3. Artist Submissions",
      content: [
        "Tunog Kalye Radio operates under the \"Open Kanto Policy\" — any independent Filipino artist or band may submit their music for consideration, regardless of label status, production quality, or experience level.",
        "Upon submission, you grant Tunog Kalye Radio non-exclusive digital broadcasting rights to your submitted music. This means we may play your music on our 24/7 radio stream, but you retain full ownership and all copyrights to your work.",
        "You retain 100% copyright ownership of all music you submit. There are no advance recoupment clauses, no territorial restrictions, and no minimum commitment periods. You are free to distribute your music on any other platform simultaneously.",
        "We reserve the right to approve or decline submissions at our discretion. Approval is based on quality, fit with our programming, and community standards. Not all submissions will be accepted for airplay.",
        "By submitting music, you represent and warrant that you are the original creator or authorized representative of the submitted work, and that the submission does not infringe upon any third-party rights.",
      ],
    },
    {
      id: "merch-store",
      title: "4. Merch Store",
      content: [
        "The Tunog Kalye Merch Store (the \"Store\") allows verified artists to sell merchandise directly to fans through hub.tunogkalye.net.",
        "Revenue Split: For each sale, 90% of the sale price (minus applicable taxes and payment processing fees) is transferred directly to the artist via Stripe Connect. The remaining 10% is allocated to the Kanto Fund, which is distributed quarterly to top-charting artists.",
        "Payouts: Artist payouts are processed automatically through Stripe Connect. Artists are responsible for configuring and maintaining their Stripe Connect account in good standing.",
        "Fulfillment: Artists may choose between self-delivery (the artist handles shipping and fulfillment directly) or platform fulfillment (where applicable). Fulfillment timelines and shipping costs are the responsibility of the artist unless otherwise specified.",
        "Product Listings: All product listings are subject to review. Tunog Kalye reserves the right to remove any product listing that violates these Terms or community standards.",
        "Returns and Refunds: Return and refund policies are determined by individual artists. Tunog Kalye acts as a platform and is not directly responsible for returns, refunds, or product quality disputes, though we will assist in resolving conflicts.",
      ],
    },
    {
      id: "user-conduct",
      title: "5. User Conduct",
      content: [
        "You agree not to engage in any of the following prohibited activities:",
        "Using the Hub for any unlawful purpose or in violation of any applicable laws or regulations.",
        "Posting, transmitting, or promoting spam, unsolicited messages, or fraudulent content.",
        "Uploading or selling counterfeit, unauthorized, or infringing merchandise through the Store.",
        "Impersonating any person or entity, or falsely claiming an affiliation with any person or entity.",
        "Interfering with or disrupting the Hub or servers or networks connected to the Hub.",
        "Harassing, threatening, intimidating, or impersonating other users or artists.",
        "We expect all users to treat each other with respect. Tunog Kalye Radio is a professional media platform that serves the Filipino independent music community.",
      ],
    },
    {
      id: "payment-terms",
      title: "6. Payment Terms",
      content: [
        "All payments on the Hub are processed securely through Stripe, Inc. (\"Stripe\"). Tunog Kalye Radio does not store, process, or have direct access to your full credit card or payment information.",
        "By making a purchase on the Hub, you agree to Stripe's Terms of Service and Privacy Policy, which are available at stripe.com.",
        "Prices are displayed in Philippine Pesos (₱) and are inclusive of applicable taxes unless otherwise stated. Shipping fees, where applicable, are calculated at checkout and are the responsibility of the buyer.",
        "Artist payouts are processed via Stripe Connect. Payout timing depends on Stripe's standard processing schedule and the artist's account configuration. Tunog Kalye is not liable for delays caused by Stripe's processing.",
        "Infrastructure support contributions made through the \"Support the Station\" pathway are non-refundable. Merchandise purchases follow the individual artist's return and refund policy.",
      ],
    },
    {
      id: "revenue-model",
      title: "7. Revenue Model and Financial Transparency",
      content: [
        "Tunog Kalye Radio operates as a lean, sustainable media business. We believe in full transparency about how we generate revenue and how funds are allocated. Our revenue model consists of the following pillars:",
        "B2B Local Sponsorships (Primary Revenue): We sell targeted audio advertisements and digital banner placements to local businesses, including Pinoy restaurants, real estate agents, event promoters, and other businesses targeting the Filipino-Canadian demographic. Sponsorship packages start at $50/month.",
        "Merchandise Store Revenue: For each merchandise sale on the Hub, 90% of the sale price (minus applicable taxes and payment processing fees) is transferred directly to the artist via Stripe Connect. The remaining 10% is allocated to the Kanto Fund.",
        "Infrastructure Support Contributions: Listeners may contribute toward server hosting (Oracle Cloud, Cloudflare CDN), bandwidth costs, and station maintenance through the \"Support the Station\" pathway. These contributions are strictly operational and are not the primary funding source for the platform.",
        "The Kanto Fund: 100% of the Kanto Fund pool (derived from merchandise sales) is distributed quarterly to top-charting independent artists. No portion of infrastructure support contributions or sponsorship revenue is diverted for personal use — all funds are reinvested into platform operations, artist development, and community growth.",
      ],
    },
    {
      id: "intellectual-property",
      title: "8. Intellectual Property",
      content: [
        "All content, features, and functionality of the Hub — including but not limited to text, graphics, logos, icons, images, audio, video, software, and the overall design — are the exclusive property of Tunog Kalye Radio and are protected by international copyright, trademark, and other intellectual property laws.",
        "Artists retain full ownership and copyright of all original works they submit, list, or sell through the Hub. By listing products, artists grant Tunog Kalye a limited, non-exclusive license to display product images and descriptions on the Hub for the purpose of facilitating sales.",
        "Tunog Kalye Radio's name, logo, branding, and the \"Tunog Kalye\" trademark are the exclusive property of Tunog Kalye Radio and may not be used without prior written consent.",
        "User-submitted reviews, comments, and feedback may be used by Tunog Kalye Radio for promotional purposes at our discretion.",
      ],
    },
    {
      id: "limitation-of-liability",
      title: "9. Limitation of Liability",
      content: [
        "To the fullest extent permitted by applicable law, Tunog Kalye Radio and its operators, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising out of or related to your use of the Hub.",
        "Tunog Kalye Radio does not guarantee uninterrupted or error-free operation of the Hub. We are not liable for any downtime, server errors, or technical issues.",
        "The Hub is provided \"as is\" and \"as available\" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.",
        "Tunog Kalye Radio acts as a platform connecting artists and fans. We are not a party to transactions between artists and buyers, and are not responsible for product quality, shipping delays, or disputes between artists and customers.",
      ],
    },
    {
      id: "changes-to-terms",
      title: "10. Changes to Terms",
      content: [
        "We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.",
        "By continuing to access or use the Hub after any revisions become effective, you agree to be bound by the revised Terms. If you do not agree to the new Terms, you must stop using the Hub.",
        "We will make reasonable efforts to notify users of significant changes, such as through email notifications or notices on the Hub.",
      ],
    },
    {
      id: "contact",
      title: "11. Contact Information",
      content: [
        "If you have any questions about these Terms of Service, please contact us at:",
        "Email: hello@tunogkalye.net",
        "Tunog Kalye Radio is based in Surrey, BC, Canada. These Terms shall be governed by and construed in accordance with the laws of British Columbia, Canada.",
      ],
    },
  ];

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-500">
                <Radio className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">
                TUNOG KALYE<span className="text-red-400"> RADIO</span>
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <FileText className="h-5 w-5 text-red-400" />
            </div>
            <Badge variant="outline" className="border-white/10 text-slate-400">
              Legal
            </Badge>
          </div>
          <h1 className="mb-3 text-3xl font-black tracking-tight sm:text-4xl">
            Terms of{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">Service</span>
          </h1>
          <p className="text-sm text-slate-500">Last updated: April 2026</p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="mb-4 text-lg font-bold text-white sm:text-xl">{section.title}</h2>
              <div className="space-y-3">
                {section.content.map((paragraph, i) => (
                  <p key={i} className="text-sm text-slate-400 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Scroll to top */}
        <div className="mt-16 text-center">
          <button
            onClick={scrollToTop}
            className="rounded-lg border border-white/10 bg-[#12121a] px-4 py-2 text-sm text-slate-400 transition-colors hover:border-white/20 hover:text-white"
          >
            ↑ Back to top
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-black/20 mt-auto">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
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
