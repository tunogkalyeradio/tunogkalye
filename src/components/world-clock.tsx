"use client";

import { useState, useEffect } from "react";
import { Clock, Globe } from "lucide-react";

// ─── Timezone definitions ───────────────────────────────────
interface TimezoneInfo {
  id: string;
  city: string;
  country: string;
  tz: string;
  flag: string;
  abbr: string; // dynamic abbreviation based on DST
}

const TIMEZONES: TimezoneInfo[] = [
  { id: "yvr", city: "Vancouver", country: "Canada", tz: "America/Vancouver", flag: "\u{1F1E8}\u{1F1E6}", abbr: "" },
  { id: "mnl", city: "Manila", country: "Philippines", tz: "Asia/Manila", flag: "\u{1F1ED}\u{1F1F9}", abbr: "" },
  { id: "dxb", city: "Dubai", country: "UAE", tz: "Asia/Dubai", flag: "\u{1F1E6}\u{1F1EA}", abbr: "" },
];

// ─── Utility: get dynamic timezone abbreviation ──────────────
function getTimezoneAbbr(tz: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart?.value || tz;
  } catch {
    return tz;
  }
}

// ─── Utility: format time ───────────────────────────────────
function formatTime(tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());
  } catch {
    return "--:--";
  }
}

// ─── Single clock city display ──────────────────────────────
function CityClock({ info }: { info: TimezoneInfo }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 transition-colors hover:bg-white/[0.04]">
      <span className="text-sm leading-none" role="img" aria-label={info.country}>
        {info.flag}
      </span>
      <div className="flex flex-col leading-none">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
          {info.city}
        </span>
        <span className="text-xs font-semibold text-slate-200 tabular-nums">
          {formatTime(info.tz)}
        </span>
      </div>
      <span className="text-[9px] font-medium text-slate-600">
        {info.abbr}
      </span>
    </div>
  );
}

// ─── World Clock Bar ────────────────────────────────────────
export default function WorldClock() {
  const [mounted, setMounted] = useState(false);
  const [timezones, setTimezones] = useState(TIMEZONES);

  // Only render ticking clock on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Update abbreviations (some change with DST)
    const updateAbbrs = () => {
      setTimezones((prev) =>
        prev.map((tz) => ({ ...tz, abbr: getTimezoneAbbr(tz.tz) }))
      );
    };
    updateAbbrs();
    // Check abbreviations every minute (DST transitions are rare but possible)
    const interval = setInterval(updateAbbrs, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Tick every second to keep times accurate
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) {
    // Skeleton placeholder to prevent layout shift
    return (
      <div className="flex items-center gap-2" aria-hidden="true">
        <div className="h-5 w-12 animate-pulse rounded bg-white/5" />
        <div className="h-5 w-12 animate-pulse rounded bg-white/5" />
        <div className="h-5 w-12 animate-pulse rounded bg-white/5" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-2 lg:flex">
        {timezones.map((tz) => (
          <CityClock key={tz.id} info={tz} />
        ))}
      </div>
      {/* Compact version for tablets */}
      <div className="hidden items-center gap-1.5 md:flex lg:hidden">
        <Globe className="h-3.5 w-3.5 text-slate-500" />
        {timezones.map((tz, i) => (
          <span key={tz.id} className="flex items-center gap-1 text-[11px] text-slate-400">
            {i > 0 && <span className="text-slate-700">/</span>}
            <span className="font-medium">{formatTime(tz.tz)}</span>
            <span className="text-slate-600">{tz.city.slice(0, 3).toUpperCase()}</span>
          </span>
        ))}
      </div>
      {/* Mobile: just a clock icon with tooltip-like display */}
      <div className="flex items-center md:hidden">
        <Clock className="h-4 w-4 text-slate-500" />
      </div>
    </div>
  );
}
