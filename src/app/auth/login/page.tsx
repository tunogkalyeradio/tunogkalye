"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Radio, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// OAuth config
const GOOGLE_ENABLED = !!process.env.NEXT_PUBLIC_GOOGLE_ENABLED;
const FACEBOOK_ENABLED = !!process.env.NEXT_PUBLIC_FACEBOOK_ENABLED;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle error from URL (NextAuth redirects with error param)
  const urlError = searchParams.get("error");
  const displayError =
    error ||
    (urlError === "CredentialsSignin"
      ? "Invalid email or password"
      : urlError === "SessionRequired"
        ? "Please sign in to continue"
        : urlError
          ? "Authentication error. Please try again."
          : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Redirect on success
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4 py-12">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-red-600/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 shadow-lg shadow-red-500/20">
              <Radio className="h-6 w-6 text-white" />
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Welcome Back to{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              Tunog Kalye
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-white/10 bg-[#12121a] shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold text-white">Sign In</CardTitle>
            <CardDescription className="text-sm text-slate-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* OAuth Buttons */}
            {(GOOGLE_ENABLED || FACEBOOK_ENABLED) && (
              <div className="space-y-3 pb-2">
                <div className="grid gap-3">
                  {GOOGLE_ENABLED && (
                    <button
                      type="button"
                      onClick={() => signIn("google", { callbackUrl: callbackUrl || "/" })}
                      className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </button>
                  )}
                  {FACEBOOK_ENABLED && (
                    <button
                      type="button"
                      onClick={() => signIn("facebook", { callbackUrl: callbackUrl || "/" })}
                      className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Continue with Facebook
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-slate-500">or sign in with email</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {displayError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {displayError}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-white/10 bg-white/5 pr-10 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full bg-gradient-to-r from-red-600 to-orange-500 py-5 text-base font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t border-white/5 pt-6">
            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-red-400 transition-colors hover:text-red-300"
              >
                Create one
              </Link>
            </p>
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
          <Loader2 className="h-8 w-8 animate-spin text-red-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
