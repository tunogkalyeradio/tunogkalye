"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Radio, Loader2, AlertCircle, Eye, EyeOff,
  CheckCircle2, Music, User, ChevronLeft,
} from "lucide-react";
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

type RoleOption = "CUSTOMER" | "ARTIST";

// OAuth config
const GOOGLE_ENABLED = !!process.env.NEXT_PUBLIC_GOOGLE_ENABLED;
const FACEBOOK_ENABLED = !!process.env.NEXT_PUBLIC_FACEBOOK_ENABLED;

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<RoleOption>("CUSTOMER");
  const [bandName, setBandName] = useState("");
  const [city, setCity] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const inputClass =
    "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30";

  const validate = (): string | null => {
    if (!name.trim()) return "Name is required";
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    if (role === "ARTIST") {
      if (!bandName.trim()) return "Band name is required for artists";
      if (!city.trim()) return "City is required for artists";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          ...(role === "ARTIST" && {
            bandName: bandName.trim(),
            city: city.trim(),
          }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccess(data.message || "Account created! Redirecting to login...");

      // Redirect to login after a brief delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch {
      setError("Network error. Please check your connection and try again.");
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

      <div className="relative z-10 w-full max-w-lg">
        {/* Branding */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3 transition-opacity hover:opacity-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tunog-kalye-logo.png" alt="Tunog Kalye Radio" className="h-14 w-14 object-contain" />
          </Link>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Join{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              Tunog Kalye
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create your account and become part of the community
          </p>
        </div>

        {/* Register Card */}
        <Card className="border-white/10 bg-[#12121a] shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-sm text-slate-400">
              Fill in the details below to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* OAuth Quick Sign Up */}
            {(GOOGLE_ENABLED || FACEBOOK_ENABLED) && (
              <div className="space-y-3 pb-2">
                <div className="grid gap-3">
                  {GOOGLE_ENABLED && (
                    <button
                      type="button"
                      onClick={() => signIn("google", { callbackUrl: "/" })}
                      className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Sign up with Google
                    </button>
                  )}
                  {FACEBOOK_ENABLED && (
                    <button
                      type="button"
                      onClick={() => signIn("facebook", { callbackUrl: "/" })}
                      className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Sign up with Facebook
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-slate-500">or create account with email</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {success}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-slate-300">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-sm text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-sm text-slate-300">
                  I want to join as...
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("CUSTOMER")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      role === "CUSTOMER"
                        ? "border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <User
                      className={`h-6 w-6 ${
                        role === "CUSTOMER" ? "text-red-400" : "text-slate-500"
                      }`}
                    />
                    <div className="text-center">
                      <div
                        className={`text-sm font-bold ${
                          role === "CUSTOMER" ? "text-white" : "text-slate-400"
                        }`}
                      >
                        Fan / Customer
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Discover &amp; support artists
                      </div>
                    </div>
                    {role === "CUSTOMER" && (
                      <CheckCircle2 className="h-4 w-4 text-red-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("ARTIST")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      role === "ARTIST"
                        ? "border-orange-500/50 bg-orange-500/10 shadow-lg shadow-orange-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <Music
                      className={`h-6 w-6 ${
                        role === "ARTIST"
                          ? "text-orange-400"
                          : "text-slate-500"
                      }`}
                    />
                    <div className="text-center">
                      <div
                        className={`text-sm font-bold ${
                          role === "ARTIST"
                            ? "text-white"
                            : "text-slate-400"
                        }`}
                      >
                        Artist / Band
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Submit music &amp; sell merch
                      </div>
                    </div>
                    {role === "ARTIST" && (
                      <CheckCircle2 className="h-4 w-4 text-orange-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Artist-specific fields */}
              {role === "ARTIST" && (
                <div className="space-y-4 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-xs font-medium text-orange-400">
                    Artist Details
                  </p>
                  <div className="space-y-2">
                    <Label
                      htmlFor="bandName"
                      className="text-sm text-slate-300"
                    >
                      Band / Artist Name *
                    </Label>
                    <Input
                      id="bandName"
                      type="text"
                      placeholder="e.g., The Juan dela Cruz Band"
                      value={bandName}
                      onChange={(e) => setBandName(e.target.value)}
                      className={inputClass}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm text-slate-300">
                      City / Location *
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="e.g., Surrey, BC"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputClass}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-sm text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pr-10 ${inputClass}`}
                    disabled={isLoading}
                    autoComplete="new-password"
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm text-slate-300"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pr-10 ${inputClass}`}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400">
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !!success}
                className="w-full bg-gradient-to-r from-red-600 to-orange-500 py-5 text-base font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-400 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t border-white/5 pt-6">
            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-red-400 transition-colors hover:text-red-300"
              >
                Sign in
              </Link>
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-center text-xs text-slate-600 transition-colors hover:text-slate-400"
            >
              <ChevronLeft className="h-3 w-3" />
              Back to Tunog Kalye Radio
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
