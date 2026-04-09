"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Loader2,
  Save,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  address: string | null;
  role: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressProvince, setAddressProvince] = useState("");
  const [addressPostal, setAddressPostal] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setName(data.user.name);
        setPhone(data.user.phone || "");

        // Parse address
        if (data.user.address) {
          try {
            const addr = JSON.parse(data.user.address);
            setAddressLine1(addr.line1 || "");
            setAddressCity(addr.city || "");
            setAddressProvince(addr.province || "");
            setAddressPostal(addr.postalCode || "");
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      const address = JSON.stringify({
        line1: addressLine1.trim(),
        city: addressCity.trim(),
        province: addressProvince.trim(),
        postalCode: addressPostal.trim(),
      });

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          address: [addressLine1, addressCity, addressProvince, addressPostal].some(
            (f) => f.trim()
          )
            ? address
            : null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
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
      const res = await fetch("/api/user/profile", {
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

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "TK";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your profile, shipping address, and account settings.
        </p>
      </div>

      {/* Profile Card */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader>
          <CardTitle className="text-base font-bold text-white">
            Profile Information
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Update your personal information visible on your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="flex h-16 w-16 items-center justify-center rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 text-xl font-bold text-white">
                  {initials}
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                id="avatar-upload"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) {
                    alert("File must be under 2MB");
                    return;
                  }
                  setUploadingAvatar(true);
                  try {
                    const formData = new FormData();
                    formData.append("image", file);
                    const uploadRes = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                    });
                    if (uploadRes.ok) {
                      const uploadData = await uploadRes.json();
                      const avatarUrl = uploadData.url;
                      // Save avatar URL to profile
                      const profileRes = await fetch("/api/user/profile", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ avatar: avatarUrl }),
                      });
                      if (profileRes.ok) {
                        const data = await profileRes.json();
                        setProfile(data.user);
                      }
                    }
                  } catch {
                    alert("Upload failed");
                  } finally {
                    setUploadingAvatar(false);
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("avatar-upload")?.click()}
                disabled={uploadingAvatar}
                className="border-white/10 bg-white/5 text-xs text-slate-400 hover:bg-white/10"
              >
                <Camera className="mr-1.5 h-3.5 w-3.5" />
                {uploadingAvatar ? "Uploading..." : "Upload Avatar"}
              </Button>
              <p className="mt-1 text-[11px] text-slate-600">
                JPG, PNG. Max 2MB.
              </p>
            </div>
          </div>

          <Separator className="bg-white/5" />

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">
              <User className="mr-1.5 inline h-3.5 w-3.5 text-slate-500" />
              Full Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">
              <Mail className="mr-1.5 inline h-3.5 w-3.5 text-slate-500" />
              Email Address
            </Label>
            <Input
              value={profile?.email || ""}
              disabled
              className="border-white/10 bg-white/5 text-slate-500"
            />
            <p className="text-[11px] text-slate-600">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">
              <Phone className="mr-1.5 inline h-3.5 w-3.5 text-slate-500" />
              Phone Number
            </Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+63 9XX XXX XXXX"
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
            />
          </div>

          {/* Role badge */}
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-500" />
            <span className="text-xs text-slate-500">Account Role:</span>
            <Badge className="border-white/10 bg-white/5 text-[10px] text-slate-300">
              {profile?.role === "ARTIST" ? "Artist / Band" : "Customer / Fan"}
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

      {/* Shipping Address */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader>
          <CardTitle className="text-base font-bold text-white">
            <MapPin className="mr-2 inline h-4 w-4 text-red-400" />
            Default Shipping Address
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Save an address for faster checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Street Address</Label>
            <Input
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="123 Main Street, Unit 4"
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">City</Label>
              <Input
                value={addressCity}
                onChange={(e) => setAddressCity(e.target.value)}
                placeholder="Quezon City"
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Province / Region</Label>
              <Input
                value={addressProvince}
                onChange={(e) => setAddressProvince(e.target.value)}
                placeholder="Metro Manila"
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Postal Code</Label>
              <Input
                value={addressPostal}
                onChange={(e) => setAddressPostal(e.target.value)}
                placeholder="1100"
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/30"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-600">
            This address will be pre-filled during checkout. You can always change
            it per order.
          </p>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader>
          <CardTitle className="text-base font-bold text-white">
            Change Password
          </CardTitle>
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
    </div>
  );
}
