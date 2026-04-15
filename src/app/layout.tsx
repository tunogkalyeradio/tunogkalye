import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/components/auth-provider";
import ChatWidget from "@/components/chat-widget";
import LivePlayer from "@/components/live-player";
import Shoutbox from "@/components/shoutbox";
import PushNotificationManager from "@/components/push-notification-manager";

const SITE_URL = "https://hub.tunogkalye.net";
const SITE_NAME = "Tunog Kalye Radio";
const SITE_TAGLINE = "The Premier Broadcasting Network for Filipino Indie Music";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Tunog Kalye Radio is a 24/7 Filipino indie music radio station broadcasting worldwide from Surrey, BC, Canada. Submit your music, support independent OPM artists, and discover the best of Pinoy indie rock, alternative, and modern Filipino music. Zero artist commission. Corporate-free.",
  keywords: [
    // Core Brand
    "Tunog Kalye Radio",
    "Tunog Kalye",
    "TKR Radio",
    // Genre & Music
    "OPM Radio",
    "Pinoy Indie Radio",
    "Filipino Indie Music",
    "90s OPM",
    "OPM Alternative Rock",
    "Pinoy Rock Radio",
    "Filipino Music Streaming",
    "OPM Online Radio",
    "Pinoy Music",
    "Filipino Band Radio",
    // Actions
    "Submit Music Filipino Radio",
    "OPM Music Submission",
    "Pinoy Artist Radio Airplay",
    // Location & Diaspora
    "Filipino Radio Canada",
    "Surrey BC Radio",
    "Pinoy Diaspora Radio",
    "Filipino Canadian Radio",
    "Vancouver Filipino Radio",
    // Business
    "OPM Advertising",
    "Filipino Indie Broadcasting",
    "Filipino Music Merchandise",
    "OPM Merch Store",
    "Sponsor Filipino Radio",
    // Long-tail
    "listen to Filipino indie music online",
    "24/7 OPM radio station",
    "independent Filipino artist platform",
    "Filipino music radio no commission",
    "best OPM radio station",
    "Filipino indie artist submit music",
    "Pinoy radio station global",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Music",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "24/7 Filipino indie music radio station. Submit your OPM, support independent artists, and discover the best Pinoy music from Surrey, BC to the world. Zero commission.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tunog Kalye Radio — Filipino Indie Music Broadcasting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Filipino Indie Music Radio`,
    description:
      "24/7 Filipino indie music radio. Submit OPM, support independent Pinoy artists worldwide.",
    images: ["/og-image.png"],
    creator: "@tunogkalye",
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

// JSON-LD Structured Data
function JsonLd() {
  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: SITE_NAME,
            alternateName: "TKR Radio",
            url: SITE_URL,
            logo: `${SITE_URL}/tunog-kalye-horizontal.png`,
            description: "A 24/7 Filipino indie music radio station broadcasting worldwide from Surrey, BC, Canada. Zero artist commission. Corporate-free.",
            foundingLocation: {
              "@type": "Place",
              name: "Surrey, BC, Canada",
            },
            sameAs: [
              "https://www.facebook.com/profile.php?id=61578465900871",
            ],
            contactPoint: {
              "@type": "ContactPoint",
              email: "hello@tunogkalye.net",
              contactType: "customer support",
            },
          }),
        }}
      />
      {/* WebSite Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: SITE_NAME,
            url: SITE_URL,
            description: "Filipino indie music radio station with 24/7 global broadcasting, artist submissions, merch store, and zero commission for artists.",
            publisher: {
              "@id": `${SITE_URL}/#organization`,
            },
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/store?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      {/* RadioStation Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RadioStation",
            "@id": `${SITE_URL}/#radiostation`,
            name: SITE_NAME,
            url: SITE_URL,
            description: "24/7 Filipino independent music radio broadcasting from Surrey, BC, Canada to the world.",
            broadcaster: {
              "@id": `${SITE_URL}/#organization`,
            },
            inLanguage: "en",
            genre: ["OPM", "Filipino Indie", "Pinoy Rock", "Alternative Rock", "Indie Pop"],
            broadcastDisplayName: "Tunog Kalye Radio",
            broadcastAffiliateOf: {
              "@type": "Organization",
              name: "Tunog Kalye Radio",
            },
            areaServed: {
              "@type": "Place",
              name: "Worldwide",
            },
            sameAs: [
              "https://tunogkalye.net/public/tunog-kalye",
              "https://www.facebook.com/profile.php?id=61578465900871",
            ],
          }),
        }}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd />
        <meta name="geo.region" content="CA-BC" />
        <meta name="geo.placename" content="Surrey" />
        <meta name="geo.position" content="49.1044;-122.8024" />
        <meta name="ICBM" content="49.1044, -122.8024" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <ChatWidget />
          <Shoutbox />
          <PushNotificationManager />
          <LivePlayer />
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
