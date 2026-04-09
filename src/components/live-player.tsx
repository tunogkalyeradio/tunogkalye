"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Radio, Play, Pause, Volume1, Volume2, VolumeX, X, Globe, ExternalLink, Music2 } from "lucide-react";

// ─── AzuraCast Stream Configuration ──────────────────────────
// All URLs configurable via environment variables
const STREAM_CONFIG = {
  // Direct audio stream URL (for the sticky player bar)
  audioUrl: process.env.NEXT_PUBLIC_STREAM_URL || "https://tunogkalye.net/radio/8000/radio.mp3",
  // AzuraCast Now-Playing API (public, no auth required)
  nowPlayingApi: process.env.NEXT_PUBLIC_NOW_PLAYING_API || "https://tunogkalye.net/api/nowplaying/tunog-kalye",
  // Link to the full AzuraCast station page
  stationUrl: process.env.NEXT_PUBLIC_STATION_URL || "https://tunogkalye.net/public/tunog-kalye",
  // Link to the main site
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://tunogkalye.net",
  // Station display name
  stationName: process.env.NEXT_PUBLIC_STATION_NAME || "Tunog Kalye Radio",
};

interface NowPlayingData {
  now_playing: {
    song: {
      title: string;
      artist: string;
      art?: string;
      album?: string;
    };
    live?: {
      is_live: boolean;
      streamer_name?: string;
    };
    elapsed?: number;
    duration?: number;
    started_at?: string;
    sh_id?: number;
  };
  listeners: {
    current?: number;
    total?: number;
    unique?: number;
  };
  station: {
    name?: string;
    shortcode?: string;
  };
  is_online?: boolean;
}

export default function LivePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [isDismissed, setIsDismissed] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeSliderRef = useRef<HTMLDivElement>(null);

  // Load dismiss state from sessionStorage
  useEffect(() => {
    const dismissed = sessionStorage.getItem("player-dismissed");
    if (dismissed) setIsDismissed(true);
  }, []);

  // Fetch now-playing data from AzuraCast API
  const fetchNowPlaying = useCallback(async () => {
    try {
      const res = await fetch(STREAM_CONFIG.nowPlayingApi, {
        cache: "no-store",
      });
      if (res.ok) {
        const data: NowPlayingData = await res.json();
        setNowPlaying(data);
        setError(null);
      }
    } catch {
      // Silently fail — stream may still work even if API is unreachable
      setError("Stream info unavailable");
    }
  }, []);

  // Initial fetch + polling every 15 seconds
  useEffect(() => {
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 15000);
    return () => clearInterval(interval);
  }, [fetchNowPlaying]);

  // Close volume slider when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (volumeSliderRef.current && !volumeSliderRef.current.contains(e.target as Node)) {
        setShowVolumeSlider(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => {
          setError("Unable to connect to stream");
          setIsLoading(false);
        });
    }
  };

  const handleVolumeChange = (val: number) => {
    if (!audioRef.current) return;
    const v = Math.max(0, Math.min(1, val));
    audioRef.current.volume = v;
    setVolume(v);
    if (v === 0) {
      setPrevVolume(prevVolume || 0.8);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (volume > 0) {
      setPrevVolume(volume);
      audioRef.current.volume = 0;
      setVolume(0);
    } else {
      const restore = prevVolume || 0.8;
      audioRef.current.volume = restore;
      setVolume(restore);
    }
  };

  const dismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("player-dismissed", "1");
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
  };

  if (isDismissed) return null;

  const currentSong = nowPlaying?.now_playing?.song;
  const isOnline = nowPlaying?.is_online ?? true;
  const isLive = nowPlaying?.now_playing?.live?.is_live;
  const streamerName = nowPlaying?.now_playing?.live?.streamer_name;
  const listeners = nowPlaying?.listeners?.current;
  const progress = nowPlaying?.now_playing?.duration && nowPlaying?.now_playing?.elapsed
    ? (nowPlaying.now_playing.elapsed / nowPlaying.now_playing.duration) * 100
    : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom duration-500">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={STREAM_CONFIG.audioUrl}
        preload="none"
        volume={volume}
      />

      {/* Main player bar */}
      <div className="border-t border-white/10 bg-[#0d0d14]/98 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-5">
          {/* LEFT: Now Playing Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Station icon with live indicator */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-500">
              <Radio className="h-5 w-5 text-white" />
              {isOnline && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
              )}
            </div>

            {/* Song info */}
            <div className="hidden sm:block min-w-0">
              {isLive && streamerName ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate">
                    🔴 {streamerName}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400 uppercase">
                    Live
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-white truncate">
                    {currentSong?.artist || "Tunog Kalye Radio"}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {currentSong?.title || "24/7 OPM"}
                    {currentSong?.album && ` · ${currentSong.album}`}
                  </p>
                </div>
              )}

              {/* Progress bar (thin line under song info) */}
              {progress > 0 && (
                <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-1000"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Mobile: just show station name */}
            <div className="sm:hidden min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-white">LIVE</span>
                <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              </div>
            </div>

            {/* Listener count */}
            {listeners !== undefined && listeners > 0 && (
              <span className="hidden lg:inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
                <Music2 className="h-3 w-3" />
                {listeners}
              </span>
            )}
          </div>

          {/* RIGHT: Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Volume control (desktop) */}
            <div className="relative hidden sm:block" ref={volumeSliderRef}>
              <button
                onClick={toggleMute}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                title={volume === 0 ? "Unmute" : "Mute"}
              >
                {volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              {showVolumeSlider && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-lg bg-[#1a1a2e] border border-white/10 p-2 shadow-xl">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="h-24 w-1.5 cursor-pointer appearance-none rounded-full bg-white/20 accent-red-500 [writing-mode:vertical-lr] [direction:rtl]"
                    onClick={() => setShowVolumeSlider(true)}
                  />
                </div>
              )}
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="absolute inset-0"
                aria-label="Volume slider"
              />
            </div>

            {/* Mobile mute toggle */}
            <button
              onClick={toggleMute}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white sm:hidden"
            >
              {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {/* Play/Pause button */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:from-red-500 hover:to-orange-400 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span className="hidden sm:inline">Listen Live</span>
                </>
              )}
            </button>

            {/* Full Station link (desktop) */}
            <a
              href={STREAM_CONFIG.stationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition-colors hover:border-white/20 hover:text-white"
              title="Open full AzuraCast station"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Full Station</span>
            </a>

            {/* Error indicator */}
            {error && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                {error}
              </span>
            )}

            {/* Dismiss button */}
            <button
              onClick={dismiss}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-white/10 hover:text-slate-400"
              title="Hide player (for this session)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div className="border-t border-red-500/20 bg-red-500/10 px-4 py-1.5 text-center">
            <p className="text-[10px] font-medium text-red-400">
              Station is currently offline — check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
