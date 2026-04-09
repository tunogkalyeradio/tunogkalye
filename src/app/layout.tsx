import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/components/auth-provider";
import ChatWidget from "@/components/chat-widget";
import LivePlayer from "@/components/live-player";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tunog Kalye Radio — Submit, Sponsor, Support",
  description:
    "The premier grassroots broadcasting network for Filipino independent music. Submit your music, become a sponsor, or support the Kanto.",
  keywords: [
    "Tunog Kalye",
    "OPM Radio",
    "Pinoy Indie Radio",
    "Filipino Music",
    "90s OPM",
    "Submit Music",
    "Filipino Radio",
    "Surrey BC Radio",
  ],
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <ChatWidget />
          <LivePlayer />
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
