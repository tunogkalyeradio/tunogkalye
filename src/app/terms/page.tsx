import type { Metadata } from "next";
import TermsContent from "./terms-content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the Terms of Service for Tunog Kalye Radio Hub (hub.tunogkalye.net). Covers account registration, artist submissions, merch store policies, user conduct, payment terms, revenue model transparency, and intellectual property rights.",
  alternates: {
    canonical: "https://hub.tunogkalye.net/terms",
  },
  openGraph: {
    title: "Terms of Service | Tunog Kalye Radio",
    description:
      "Terms of Service for Tunog Kalye Radio Hub. Account registration, artist submissions, merch store, and more.",
    url: "https://hub.tunogkalye.net/terms",
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
