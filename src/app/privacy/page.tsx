import type { Metadata } from "next";
import PrivacyContent from "./privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Tunog Kalye Radio Hub (hub.tunogkalye.net). Learn how we collect, use, and protect your personal information. Covers data security, cookies, your rights, artist data, and third-party services including Stripe and Cloudflare.",
  alternates: {
    canonical: "https://hub.tunogkalye.net/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Tunog Kalye Radio",
    description:
      "Privacy Policy for Tunog Kalye Radio Hub. Learn how we protect your data and privacy.",
    url: "https://hub.tunogkalye.net/privacy",
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
