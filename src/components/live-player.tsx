"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume1, Volume2, VolumeX, X, ExternalLink, Music2 } from "lucide-react";
import Hls from "hls.js";

// ─── AzuraCast Stream Configuration ──────────────────────────
// Uses HLS (.m3u8) stream which works cross-origin with CORS headers.
// Falls back to direct MP3 stream on browsers that don't support HLS.
const STREAM_CONFIG = {
  // HLS stream — works cross-origin (AzuraCast sends Access-Control-Allow-Origin: *)
  hlsUrl: process.env.NEXT_PUBLIC_HLS_URL || "https://tunogkalye.net/hls/tunog-kalye/live.m3u8",
  // Fallback direct MP3 stream (may not work cross-origin)
  mp3Url: process.env.NEXT_PUBLIC_STREAM_URL || "https://tunogkalye.net/listen/tunog-kalye/radio",
  // AzuraCast Now-Playing API (works — already verified)
  nowPlayingApi: process.env.NEXT_PUBLIC_NOW_PLAYING_API || "https://tunogkalye.net/api/nowplaying/tunog-kalye",
  // Full station page
  stationUrl: process.env.NEXT_PUBLIC_STATION_URL || "https://tunogkalye.net/public/tunog-kalye",
  // Main site
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://tunogkalye.net",
  // Station name
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
  };
  listeners: {
    current?: number;
    total?: number;
    unique?: number;
  };
  is_online?: boolean;
}

export default function LivePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [isDismissed, setIsDismissed] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"loading" | "ok" | "error">("loading");

  // Dismiss state
  useEffect(() => {
    if (sessionStorage.getItem("player-dismissed")) setIsDismissed(true);
  }, []);

  // Fetch now-playing data
  const fetchNowPlaying = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(STREAM_CONFIG.nowPlayingApi, { cache: "no-store", signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data: NowPlayingData = await res.json();
        if (data?.now_playing?.song) {
          setNowPlaying(data);
          setApiStatus("ok");
        }
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 15000);
    return () => clearInterval(interval);
  }, [fetchNowPlaying]);

  // Initialize HLS
  useEffect(() => {
    if (typeof window === "undefined" || !audioRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 10,
        maxMaxBufferLength: 30,
      });
      hls.loadSource(STREAM_CONFIG.hlsUrl);
      hls.attachMedia(audioRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Ready to play
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setStreamError("Stream connection lost");
          setIsPlaying(false);
          // Try to recover
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setTimeout(() => hls.startLoad(), 3000);
          }
        }
      });
      hlsRef.current = hls;

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (audioRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS
      audioRef.current.src = STREAM_CONFIG.hlsUrl;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setStreamError(null);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          setStreamError(null);
        })
        .catch(() => {
          setIsLoading(false);
          setStreamError("Click again to start");
        });
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
    if (hlsRef.current) hlsRef.current.stopLoad();
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
      {/* Audio element for HLS */}
      <audio ref={audioRef} preload="none" />

      {/* Player bar */}
      <div className="border-t border-white/10 bg-[#0d0d14]/98 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-5">
          {/* LEFT: Station info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Logo */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-gradient-to-br from-red-600 to-orange-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/tunog-kalye-logo.png" alt="TKR" className="h-10 w-10 object-cover rounded-lg" />
              {isOnline && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
              )}
            </div>

            {/* Song info */}
            <div className="hidden sm:block min-w-0">
              {apiStatus === "ok" && currentSong ? (
                <>
                  {isLive && streamerName ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">🔴 {streamerName}</span>
                      <span className="inline-flex items-center rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400 uppercase">Live</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-white truncate">{currentSong.artist}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {currentSong.title}{currentSong.album ? ` · ${currentSong.album}` : ""}
                      </p>
                    </div>
                  )}
                  {progress > 0 && (
                    <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <p className="text-xs font-bold text-white">Tunog Kalye Radio</p>
                  <p className="text-[11px] text-slate-400">24/7 OPM Independent Music</p>
                </div>
              )}
            </div>

            {/* Mobile */}
            <div className="sm:hidden min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-white">LIVE</span>
                <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              </div>
            </div>

            {/* Listeners */}
            {listeners !== undefined && listeners > 0 && (
              <span className="hidden lg:inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
                <Music2 className="h-3 w-3" />{listeners}
              </span>
            )}
          </div>

          {/* RIGHT: Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mute */}
            <button onClick={toggleMute} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white" title={volume === 0 ? "Unmute" : "Mute"}>
              {volume === 0 ? <VolumeX className="h-4 w-4" /> : volume < 0.5 ? <Volume1 className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {/* Play/Pause */}
            <button onClick={togglePlay} disabled={isLoading} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:from-red-500 hover:to-orange-400 active:scale-95 disabled:opacity-70">
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : isPlaying ? (
                <><Pause className="h-4 w-4" /><span className="hidden sm:inline">Pause</span></>
              ) : (
                <><Play className="h-4 w-4" /><span className="hidden sm:inline">Listen Live</span></>
              )}
            </button>

            {/* Full Station */}
            <a href={STREAM_CONFIG.stationUrl} target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition-colors hover:border-white/20 hover:text-white" title="Open full station">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Full Station</span>
            </a>

            {/* Error */}
            {streamError && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />{streamError}
              </span>
            )}

            {/* Dismiss */}
            <button onClick={dismiss} className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-white/10 hover:text-slate-400" title="Hide player">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Offline banner */}
        {!isOnline && apiStatus === "ok" && (
          <div className="border-t border-red-500/20 bg-red-500/10 px-4 py-1.5 text-center">
            <p className="text-[10px] font-medium text-red-400">Station is currently offline — check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
