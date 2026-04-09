"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Radio, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const errorMessages: Record<string, string> = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  SessionRequired: "Please sign in to continue.",
  Default: "An authentication error occurred.",
};

function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error") || "Default";
  const message = errorMessages[errorType] || errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-red-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500">
              <Radio className="h-6 w-6 text-white" />
            </div>
          </Link>
        </div>

        <Card className="border-white/10 bg-[#12121a]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <AlertCircle className="h-7 w-7 text-red-400" />
            </div>
            <CardTitle className="text-lg font-bold text-white">
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-slate-400">{message}</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400"
            >
              Try Again
            </Button>
            <Link
              href="/"
              className="text-center text-xs text-slate-600 transition-colors hover:text-slate-400"
            >
              &larr; Back to Tunog Kalye Radio
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
          <Loader2 className="h-8 w-8 animate-spin text-red-400" />
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
