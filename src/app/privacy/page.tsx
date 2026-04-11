"use client";

import Link from "next/link";
import { Radio, ArrowLeft, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  const sections = [
    {
      id: "information-we-collect",
      title: "1. Information We Collect",
      content: [
        "We collect information that you provide directly to us when you use the Hub or interact with Tunog Kalye Radio. This may include:",
        "Account Information: Your name, email address, and password when you create an account.",
        "Artist Profile Information: Band name, real name, genre, city/location, bio, social media links (Spotify, SoundCloud, Facebook, Instagram, TikTok), and profile image URL.",
        "Shipping Information: Your full name, shipping address (street, city, province, postal code), and phone number when you make a purchase from the Merch Store.",
        "Payment Information: We do not store credit card numbers or full payment details. Payment processing is handled securely by Stripe, Inc. We only receive transaction confirmation and masked payment information necessary to process orders.",
        "Music Submission Information: Band name, email, city, genre, streaming platform links, and any optional message you provide when submitting music.",
        "Communication Data: Information you provide when contacting us, filling out sponsorship inquiry forms, or leaving product reviews.",
      ],
    },
    {
      id: "how-we-use",
      title: "2. How We Use Your Information",
      content: [
        "We use the information we collect for the following purposes:",
        "Order Processing: To process and fulfill your merchandise orders, including communicating order status and shipping updates.",
        "Artist Verification: To verify artist identities and manage artist accounts, product listings, and store operations.",
        "Notifications: To send you notifications about your orders, submissions, account activity, and platform updates. You may opt out of non-essential notifications at any time.",
        "Customer Support: To respond to your inquiries, resolve disputes, and provide customer service.",
        "Kanto Fund Administration: To calculate and distribute quarterly Kanto Fund allocations to qualifying artists.",
        "Platform Improvement: To analyze usage patterns, improve the Hub's features and user experience, and prevent fraud or abuse.",
        "We will never sell your personal information to third parties.",
      ],
    },
    {
      id: "data-sharing",
      title: "3. Data Sharing",
      content: [
        "We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:",
        "Stripe (Payments): We share transaction-related information with Stripe, Inc. to process payments and manage payouts. Stripe is a PCI-compliant payment processor with its own privacy policy at stripe.com/privacy.",
        "Artists (Order Fulfillment): When you purchase merchandise, relevant order details (name, shipping address, and order contents) are shared with the artist responsible for fulfilling that order. This is necessary for the artist to ship your purchase.",
        "Artists (Kanto Fund): Aggregate and anonymized airplay and engagement data may be used to determine Kanto Fund distributions. Individual artist allocations are published in quarterly transparency reports.",
        "Legal Requirements: We may disclose your information if required to do so by law, in response to a valid legal request, or to protect the rights, property, or safety of Tunog Kalye Radio, our users, or the public.",
      ],
    },
    {
      id: "data-security",
      title: "4. Data Security",
      content: [
        "We take reasonable measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:",
        "SSL/TLS encryption for all data transmitted between your browser and our servers.",
        "Encrypted storage of sensitive data, including passwords (bcrypt hashing with 12 salt rounds).",
        "Secure authentication with JWT-based session management and role-based access control.",
        "Regular security reviews and updates to our infrastructure.",
        "While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.",
      ],
    },
    {
      id: "cookies",
      title: "5. Cookies",
      content: [
        "The Hub uses cookies and similar technologies for the following purposes:",
        "Essential Cookies: Required for authentication, session management, and core functionality. These cookies are necessary for the Hub to work properly and cannot be disabled. This includes NextAuth.js session cookies.",
        "Analytics Cookies (Optional): We may use analytics tools to understand how users interact with the Hub. These cookies are not essential and can be disabled through your browser settings. We respect Do Not Track (DNT) signals where possible.",
        "You can control and manage cookies through your browser settings. Disabling essential cookies may affect the Hub's functionality.",
      ],
    },
    {
      id: "your-rights",
      title: "6. Your Rights",
      content: [
        "You have the following rights regarding your personal information:",
        "Access: You can request a copy of the personal information we hold about you by contacting us at privacy@tunogkalye.net.",
        "Correction: You can update or correct your personal information through your account settings or by contacting us.",
        "Deletion: You can request deletion of your personal information. We will delete your data within 30 days, except where retention is necessary for legal, accounting, or legitimate business purposes (such as completed order records, which must be retained for tax compliance).",
        "To exercise any of these rights, please contact us at privacy@tunogkalye.net. We will respond to all legitimate requests within 30 days.",
      ],
    },
    {
      id: "artist-data",
      title: "7. Artist Data",
      content: [
        "Artists who create accounts on the Hub should be aware that certain information is public-facing:",
        "Artist Profiles: Your band name, genre, city, bio, social media links, and product listings are visible to all visitors of the Hub.",
        "Merch Listings: Product names, descriptions, images, prices, and categories are publicly displayed on the Store.",
        "Order Details: When fans purchase your merchandise, relevant order details (customer name, shipping address, and order contents) are shared with you for fulfillment purposes.",
        "Kanto Fund: Artists who receive Kanto Fund distributions may have their allocation amounts published in our quarterly transparency reports.",
        "You can control the visibility of your artist profile and product listings through your Artist Dashboard settings.",
      ],
    },
    {
      id: "third-party-services",
      title: "8. Third-Party Services",
      content: [
        "The Hub integrates with the following third-party services, each with their own privacy policies:",
        "Stripe, Inc. — Payment processing and artist payouts. Privacy Policy: stripe.com/privacy",
        "Vercel, Inc. — Hosting and infrastructure. Privacy Policy: vercel.com/legal/privacy-policy",
        "Cloudflare, Inc. — CDN, DNS, and security. Privacy Policy: cloudflare.com/privacypolicy",
        "We do not control and are not responsible for the privacy practices of these third-party services. We encourage you to review their privacy policies.",
      ],
    },
    {
      id: "childrens-privacy",
      title: "9. Children's Privacy",
      content: [
        "The Hub is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13.",
        "If you are a parent or guardian and believe that your child has provided us with personal information, please contact us at privacy@tunogkalye.net and we will take steps to delete such information.",
      ],
    },
    {
      id: "changes-to-privacy",
      title: "10. Changes to This Privacy Policy",
      content: [
        "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we make material changes, we will provide at least 30 days' notice through email notifications or notices on the Hub.",
        "Your continued use of the Hub after any changes to this Privacy Policy constitutes your acceptance of the updated policy.",
      ],
    },
    {
      id: "contact",
      title: "11. Contact",
      content: [
        "If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:",
        "Email: privacy@tunogkalye.net",
        "Tunog Kalye Radio is based in Surrey, BC, Canada. Our data practices comply with applicable Canadian federal and provincial privacy legislation, including the Personal Information Protection and Electronic Documents Act (PIPEDA).",
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
              <Shield className="h-5 w-5 text-red-400" />
            </div>
            <Badge variant="outline" className="border-white/10 text-slate-400">
              Legal
            </Badge>
          </div>
          <h1 className="mb-3 text-3xl font-black tracking-tight sm:text-4xl">
            Privacy{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">Policy</span>
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
