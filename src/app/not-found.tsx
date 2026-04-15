import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Radio, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist. Return to Tunog Kalye Radio — the 24/7 Filipino indie music radio station.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] px-4 text-center">
      <div className="flex flex-col items-center gap-6">
        {/* 404 Number */}
        <div className="relative">
          <span className="text-[120px] font-black leading-none tracking-tighter text-white/5 sm:text-[180px]">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Radio className="h-16 w-16 text-red-500 sm:h-20 sm:w-20" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Page Not Found
          </h1>
          <p className="max-w-md text-sm text-slate-500">
            Looks like this page got lost on the way to the kanto. Don&apos;t worry — the music is still playing.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-gradient-to-r from-red-600 to-orange-500 px-6 font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
            <a href="https://tunogkalye.net/public/tunog-kalye" target="_blank" rel="noopener noreferrer">
              <Radio className="mr-2 h-4 w-4" />
              Listen Live
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
