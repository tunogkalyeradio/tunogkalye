import { requireRole } from "@/lib/auth-utils";
import {
  Settings,
  Radio,
  ShieldCheck,
  Info,
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

export default async function AdminSettingsPage() {
  const user = await requireRole("ADMIN");

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

      {/* Station Info */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-red-400" />
            <CardTitle className="text-base">Station Information</CardTitle>
          </div>
          <CardDescription>Tunog Kalye Radio hub configuration</CardDescription>
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

      {/* Admin Account */}
      <Card className="border-white/10 bg-[#12121a]">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <CardTitle className="text-base">Admin Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
            <div>
              <p className="text-sm font-medium text-white">Name</p>
              <p className="text-xs text-slate-500">Display name</p>
            </div>
            <span className="text-sm text-slate-300">{user.name}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
            <div>
              <p className="text-sm font-medium text-white">Email</p>
              <p className="text-xs text-slate-500">Login email</p>
            </div>
            <span className="text-sm text-slate-300">{user.email}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
            <div>
              <p className="text-sm font-medium text-white">Role</p>
              <p className="text-xs text-slate-500">Access level</p>
            </div>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              ADMIN
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
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
