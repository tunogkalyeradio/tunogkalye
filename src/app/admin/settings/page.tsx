"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Radio,
  ShieldCheck,
  Info,
  User,
  Lock,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setName(data.user?.name || "");
        setEmail(data.user?.email || "");
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword) {
      setPasswordError("Current and new password are required");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changePassword: {
            currentPassword,
            newPassword,
          },
        }),
      });

      if (res.ok) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        const data = await res.json();
        setPasswordError(data.error || "Failed to change password");
      }
    } catch {
      setPasswordError("Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Admin panel settings and configuration
        </p>
      </div>

      {/* Station Info (display-only) */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-red-400" />
            <CardTitle className="text-base">Station Information</CardTitle>
          </div>
          <CardDescription className="flex items-center gap-1.5">
            Station settings managed via environment variables
            <Badge className="bg-white/5 text-[9px] text-slate-500 border-white/10" variant="outline">
              READ ONLY
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
            <div>
              <p className="text-sm font-medium text-white">Station Name</p>
              <p className="text-xs text-slate-500">Primary branding</p>
            </div>
            <span className="text-sm text-slate-300">Tunog Kalye Radio</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
            <div>
              <p className="text-sm font-medium text-white">Website</p>
              <p className="text-xs text-slate-500">Main hub URL</p>
            </div>
            <span className="text-sm text-red-400">hub.tunogkalye.net</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
            <div>
              <p className="text-sm font-medium text-white">Broadcast</p>
              <p className="text-xs text-slate-500">AzuraCast station</p>
            </div>
            <span className="text-sm text-slate-300">www.tunogkalye.net</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
            <div>
              <p className="text-sm font-medium text-white">Revenue Split</p>
              <p className="text-xs text-slate-500">Platform / Artist</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                10%
              </Badge>
              <span className="text-xs text-slate-500">/</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                90%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Account (editable) */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <CardTitle className="text-base">Admin Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">
              <User className="mr-1.5 inline h-3.5 w-3.5 text-slate-500" />
              Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Admin name"
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Email</Label>
            <Input
              value={email}
              disabled
              className="border-white/10 bg-white/5 text-slate-500"
            />
            <p className="text-[11px] text-slate-600">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-500" />
            <span className="text-xs text-slate-500">Role:</span>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              ADMIN
            </Badge>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={saveProfile}
              disabled={saving || !name.trim()}
              className="bg-gradient-to-r from-red-600 to-orange-500 text-sm font-bold text-white hover:from-red-500 hover:to-orange-400 disabled:opacity-50"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Saved!
                </>
              ) : saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-400" />
            <CardTitle className="text-base">Change Password</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
              />
            </div>
          </div>

          {passwordError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-xs text-green-400">
              Password changed successfully!
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={changePassword}
              disabled={
                savingPassword ||
                !currentPassword ||
                !newPassword ||
                newPassword !== confirmPassword
              }
              variant="outline"
              className="border-white/10 bg-white/5 text-sm text-white hover:bg-white/10 disabled:opacity-50"
            >
              {savingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-400" />
            <CardTitle className="text-base">System Info</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-slate-500">
          <p>Tunog Kalye Radio Hub — Admin Dashboard</p>
          <p>Built with Next.js 16, Prisma ORM, Tailwind CSS, shadcn/ui</p>
          <p>Revenue model: 10% platform cut, 90% artist payout per transaction</p>
        </CardContent>
      </Card>
    </div>
  );
}
