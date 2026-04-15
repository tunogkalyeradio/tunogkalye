"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, Pause, Volume1, Volume2, VolumeX, X, ExternalLink, Music2,
  Share2, ThumbsUp, ThumbsDown, Clock, Bell, Radio, ChevronUp, ChevronDown,
  MessageSquare, SkipForward, History, Send, Heart,
} from "lucide-react";
import Hls from "hls.js";

// ─── AzuraCast Stream Configuration ──────────────────────────
const STREAM_CONFIG = {
  hlsUrl: process.env.NEXT_PUBLIC_HLS_URL || "https://tunogkalye.net/hls/tunog-kalye/live.m3u8",
  mp3Url: process.env.NEXT_PUBLIC_STREAM_URL || "https://tunogkalye.net/listen/tunog-kalye/radio",
  nowPlayingApi: process.env.NEXT_PUBLIC_NOW_PLAYING_API || "https://tunogkalye.net/api/nowplaying/tunog-kalye",
  stationUrl: process.env.NEXT_PUBLIC_STATION_URL || "https://tunogkalye.net/public/tunog-kalye",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://tunogkalye.net",
  stationName: process.env.NEXT_PUBLIC_STATION_NAME || "Tunog Kalye Radio",
  requestApi: process.env.NEXT_PUBLIC_REQUEST_API || "https://tunogkalye.net/api/station/1/requests",
};

interface SongData {
  title: string;
  artist: string;
  art?: string;
  album?: string;
}

interface NowPlayingData {
  now_playing: {
    song: SongData;
    live?: { is_live: boolean; streamer_name?: string; };
    elapsed?: number;
    duration?: number;
    started_at?: string;
    unique_id?: string;
  };
  listeners: { current?: number; total?: number; unique?: number; };
  is_online?: boolean;
  song_history?: Array<{
    song: SongData;
    played_at: number;
    duration: number;
  }>;
}

interface SongHistoryEntry {
  song: SongData;
  played_at: number;
  duration: number;
}

// ─── Format time helper ───────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function timeAgo(timestamp: number): string {
  const diff = Math.floor(Date.now() / 1000 - timestamp);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Volume Slider Component ──────────────────────────────────
function VolumeSlider({ volume, onVolumeChange, onToggleMute }: {
  volume: number;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
}) {
  const [showSlider, setShowSlider] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        onClick={onToggleMute}
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
      <div
        className={`absolute left-full ml-1 flex items-center overflow-hidden transition-all duration-200 ${
          showSlider ? "w-24 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/10 accent-red-500 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
        />
      </div>
    </div>
  );
}

// ─── Sleep Timer Component ───────────────────────────────────
function SleepTimerDisplay({ timeLeft, isActive, onToggle, onSet }: {
  timeLeft: number | null;
  isActive: boolean;
  onToggle: () => void;
  onSet: (minutes: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const presets = [15, 30, 45, 60, 90, 120];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-lg p-2 transition-colors ${
          isActive
            ? "text-amber-400 bg-amber-400/10 hover:bg-amber-400/20"
            : "text-slate-400 hover:bg-white/10 hover:text-white"
        }`}
        title="Sleep Timer"
      >
        <Clock className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-48 rounded-xl border border-white/10 bg-[#1a1a2e] p-3 shadow-xl">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Sleep Timer
          </p>
          {isActive && timeLeft !== null ? (
            <div className="space-y-2">
              <p className="text-sm font-bold text-amber-400">{formatTime(timeLeft)}</p>
              <button
                onClick={() => { onToggle(); setIsOpen(false); }}
                className="w-full rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
              >
                Cancel Timer
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map((m) => (
                <button
                  key={m}
                  onClick={() => { onSet(m); setIsOpen(false); }}
                  className="rounded-lg bg-white/5 px-2 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {m}m
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Share Menu Component ─────────────────────────────────────
function ShareMenu({ song }: { song: SongData | null }) {
  const [isOpen, setIsOpen] = useState(false);

  const shareText = song
    ? `🎵 Now playing on ${STREAM_CONFIG.stationName}: "${song.title}" by ${song.artist}\n🎧 Listen live: ${STREAM_CONFIG.siteUrl}`
    : `🎧 Listen to ${STREAM_CONFIG.stationName} — 24/7 Filipino Indie Music\n🔊 ${STREAM_CONFIG.siteUrl}`;

  const shareUrl = STREAM_CONFIG.siteUrl;

  const shareTo = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareText).catch(() => {});
        setIsOpen(false);
        return;
      default:
        if (navigator.share) {
          navigator.share({ title: "Tunog Kalye Radio", text: shareText, url: shareUrl }).catch(() => {});
        }
        setIsOpen(false);
        return;
    }
    window.open(url, "_blank", "width=600,height=400");
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        title="Share"
      >
        <Share2 className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-44 rounded-xl border border-white/10 bg-[#1a1a2e] p-2 shadow-xl">
          {[
            { id: "native", label: "Share...", icon: Share2 },
            { id: "twitter", label: "Twitter / X", icon: Share2 },
            { id: "facebook", label: "Facebook", icon: Share2 },
            { id: "copy", label: "Copy Link", icon: Share2 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => shareTo(item.id)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Request Widget ───────────────────────────────────────────
function RequestWidget({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ title: string; artist: string; song_id: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [requestStatus, setRequestStatus] = useState<"idle" | "searching" | "submitting" | "success" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const searchSongs = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://tunogkalye.net/api/station/1/requests/search?q=${encodeURIComponent(q)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data || []);
      }
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const submitRequest = async (songId: string) => {
    setRequestStatus("submitting");
    try {
      const res = await fetch(STREAM_CONFIG.requestApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song_id: songId }),
      });
      if (res.ok) {
        setRequestStatus("success");
        setTimeout(onClose, 2000);
      } else {
        setRequestStatus("error");
      }
    } catch {
      setRequestStatus("error");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Request a Song</p>
        <button onClick={onClose} className="rounded p-1 text-slate-500 hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); searchSongs(e.target.value); }}
          placeholder="Search artist or song..."
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-red-500/50 focus:outline-none"
        />
      </div>
      {isSearching && (
        <div className="flex items-center justify-center py-4">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-red-500" />
        </div>
      )}
      {!isSearching && results.length > 0 && (
        <div className="max-h-40 space-y-1 overflow-y-auto">
          {results.slice(0, 8).map((r) => (
            <button
              key={r.song_id}
              onClick={() => submitRequest(r.song_id)}
              disabled={requestStatus === "submitting"}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-red-500/20">
                <Music2 className="h-3.5 w-3.5 text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">{r.title}</p>
                <p className="truncate text-[10px] text-slate-500">{r.artist}</p>
              </div>
              <Send className="ml-auto h-3 w-3 shrink-0 text-slate-600" />
            </button>
          ))}
        </div>
      )}
      {!isSearching && query.length >= 2 && results.length === 0 && (
        <p className="py-2 text-center text-xs text-slate-600">No results found</p>
      )}
      {requestStatus === "success" && (
        <p className="rounded-lg bg-green-500/10 px-3 py-2 text-center text-xs font-medium text-green-400">
          Request sent! It may take a few songs to play.
        </p>
      )}
      {requestStatus === "error" && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-xs font-medium text-red-400">
          Could not submit request. Try again later.
        </p>
      )}
    </div>
  );
}

// ─── Song History Widget ──────────────────────────────────────
function SongHistoryWidget({ history }: { history: SongHistoryEntry[] }) {
  if (!history.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Recently Played</p>
      <div className="max-h-60 space-y-1 overflow-y-auto">
        {history.slice(0, 8).map((entry, i) => (
          <div key={`${entry.played_at}-${i}`} className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-white/5">
              {entry.song.art ? (
                <img src={entry.song.art} alt="" className="h-full w-full object-cover" />
              ) : (
                <Music2 className="h-3.5 w-3.5 text-slate-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-300">{entry.song.title}</p>
              <p className="truncate text-[10px] text-slate-600">{entry.song.artist}</p>
            </div>
            <span className="shrink-0 text-[9px] text-slate-700">{timeAgo(entry.played_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Live Player Component ───────────────────────────────
export default function LivePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [isDismissed, setIsDismissed] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
  const [songHistory, setSongHistory] = useState<SongHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"loading" | "ok" | "error">("loading");
  const [showPanel, setShowPanel] = useState(false);
  const [panelTab, setPanelTab] = useState<"history" | "request">("history");
  const [votes, setVotes] = useState<Record<string, "up" | "down">>({});
  const [sleepTimeLeft, setSleepTimeLeft] = useState<number | null>(null);
  const [isSleepActive, setIsSleepActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Dismiss state
  useEffect(() => {
    if (sessionStorage.getItem("player-dismissed")) setIsDismissed(true);
  }, []);

  // Sleep timer countdown
  useEffect(() => {
    if (!isSleepActive || sleepTimeLeft === null) return;
    const interval = setInterval(() => {
      setSleepTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          // Timer expired — pause
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
          setIsSleepActive(false);
          if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSleepActive, sleepTimeLeft]);

  // Fetch now-playing data (includes song history)
  const fetchNowPlaying = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(STREAM_CONFIG.nowPlayingApi, {
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data: NowPlayingData = await res.json();
        if (data?.now_playing?.song) {
          setNowPlaying(data);
          setApiStatus("ok");
          // Extract song history
          if (data.song_history && Array.isArray(data.song_history)) {
            setSongHistory(
              data.song_history.map((h) => ({
                song: h.song,
                played_at: h.played_at,
                duration: h.duration,
              }))
            );
          }
          // Update Media Session metadata
          updateMediaSession(data);
        }
      }
    } catch {
      // silent
    }
  }, []);

  // Update Media Session API (lock screen controls, notification metadata)
  const updateMediaSession = useCallback((data: NowPlayingData) => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    const song = data.now_playing.song;
    const artwork = song.art
      ? [{ src: song.art, sizes: "512x512", type: "image/jpeg" }]
      : [{ src: "/tunog-kalye-horizontal.png", sizes: "512x512", type: "image/png" }];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${song.artist} — ${song.title}`,
      artist: song.artist,
      album: song.album || "Tunog Kalye Radio",
      artwork,
    });

    // Update position state if available
    if (data.now_playing.duration && data.now_playing.elapsed !== undefined) {
      navigator.mediaSession.setPositionState({
        duration: data.now_playing.duration,
        playbackRate: 1,
        position: data.now_playing.elapsed,
      });
    }
  }, []);

  // Media Session action handlers
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => {
      audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      // Radio — no previous track, restart current
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      // Radio — skip not available
    });
    navigator.mediaSession.setActionHandler("seekto", () => {
      // Live stream — seek not applicable
    });

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("seekto", null);
    };
  }, []);

  useEffect(() => {
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 10000); // Poll every 10s (was 15s)
    return () => clearInterval(interval);
  }, [fetchNowPlaying]);

  // Initialize HLS with MP3 fallback
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
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setTimeout(() => hls.startLoad(), 3000);
          } else {
            // Try MP3 fallback
            if (audioRef.current) {
              audioRef.current.src = STREAM_CONFIG.mp3Url;
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          }
        }
      });
      hlsRef.current = hls;
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (audioRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      audioRef.current.src = STREAM_CONFIG.hlsUrl;
    } else {
      // Direct MP3 fallback
      audioRef.current.src = STREAM_CONFIG.mp3Url;
    }
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

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
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

  const reopenPlayer = () => {
    setIsDismissed(false);
    sessionStorage.removeItem("player-dismissed");
    if (hlsRef.current) hlsRef.current.startLoad();
  };

  const vote = (direction: "up" | "down") => {
    const songId = nowPlaying?.now_playing?.unique_id || `${nowPlaying?.now_playing?.song?.artist}-${nowPlaying?.now_playing?.song?.title}`;
    setVotes((prev) => ({ ...prev, [songId]: prev[songId] === direction ? undefined : direction }));
  };

  const setSleepTimer = (minutes: number) => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    setSleepTimeLeft(minutes * 60);
    setIsSleepActive(true);
  };

  const cancelSleepTimer = () => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    setIsSleepActive(false);
    setSleepTimeLeft(null);
  };

  // Render: dismissed → floating reopen button
  if (isDismissed) {
    return (
      <button
        onClick={reopenPlayer}
        className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:shadow-xl sm:bottom-6 sm:right-6"
      >
        <Radio className="h-4 w-4" />
        <span>Listen Live</span>
      </button>
    );
  }

  const currentSong = nowPlaying?.now_playing?.song;
  const isOnline = nowPlaying?.is_online ?? true;
  const isLive = nowPlaying?.now_playing?.live?.is_live;
  const streamerName = nowPlaying?.now_playing?.live?.streamer_name;
  const listeners = nowPlaying?.listeners?.current;
  const progress = nowPlaying?.now_playing?.duration && nowPlaying?.now_playing?.elapsed
    ? (nowPlaying.now_playing.elapsed / nowPlaying.now_playing.duration) * 100
    : 0;
  const songId = nowPlaying?.now_playing?.unique_id || `${currentSong?.artist}-${currentSong?.title}`;
  const currentVote = votes[songId];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom duration-500">
      <audio ref={audioRef} preload="none" />

      {/* Expanded Panel (History, Requests) */}
      {showPanel && (
        <div className="border-t border-white/10 bg-[#0d0d14]">
          <div className="mx-auto max-w-7xl px-3 py-3 sm:px-5">
            {/* Panel tabs */}
            <div className="mb-3 flex gap-2">
              <button
                onClick={() => setPanelTab("history")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  panelTab === "history"
                    ? "bg-white/10 text-white"
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                }`}
              >
                <History className="h-3.5 w-3.5" />
                Recently Played
              </button>
              <button
                onClick={() => setPanelTab("request")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  panelTab === "request"
                    ? "bg-white/10 text-white"
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                }`}
              >
                <Send className="h-3.5 w-3.5" />
                Request a Song
              </button>
            </div>
            {panelTab === "history" ? (
              <SongHistoryWidget history={songHistory} />
            ) : (
              <RequestWidget onClose={() => setShowPanel(false)} />
            )}
          </div>
        </div>
      )}

      {/* Player bar */}
      <div className="border-t border-white/10 bg-[#0d0d14]/98 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-5">
          {/* LEFT: Album art + Station info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Album art or Logo */}
            <div className="relative shrink-0">
              {currentSong?.art ? (
                <img
                  src={currentSong.art}
                  alt={`${currentSong.artist} - ${currentSong.title}`}
                  className="h-10 w-10 rounded-lg object-cover sm:h-12 sm:w-12"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-600/20 to-orange-500/20 sm:h-12 sm:w-12">
                  <img src="/tunog-kalye-horizontal.png" alt="TKR" className="h-6 w-auto object-contain opacity-80" />
                </div>
              )}
              {isOnline && isPlaying && (
                <span className="absolute -right-0.5 -bottom-0.5 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                </span>
              )}
            </div>

            {/* Song info — visible on ALL screen sizes */}
            <div className="min-w-0 flex-1">
              {apiStatus === "ok" && currentSong ? (
                <>
                  {isLive && streamerName ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        <span className="mr-1">🔴</span>{streamerName}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400 uppercase">Live</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-white truncate sm:text-sm">{currentSong.artist}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {currentSong.title}{currentSong.album ? ` · ${currentSong.album}` : ""}
                      </p>
                    </div>
                  )}
                  {/* Progress bar — visible on all screens */}
                  {progress > 0 && (
                    <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-1000"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
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

            {/* Listeners */}
            {listeners !== undefined && listeners > 0 && (
              <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
                <Music2 className="h-3 w-3" />{listeners}
              </span>
            )}
          </div>

          {/* RIGHT: Controls */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Vote Up */}
            <button
              onClick={() => vote("up")}
              className={`rounded-lg p-2 transition-colors ${
                currentVote === "up"
                  ? "text-green-400 bg-green-400/10"
                  : "text-slate-500 hover:bg-white/10 hover:text-slate-300"
              }`}
              title="Like this song"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>

            {/* Vote Down */}
            <button
              onClick={() => vote("down")}
              className={`rounded-lg p-2 transition-colors ${
                currentVote === "down"
                  ? "text-red-400 bg-red-400/10"
                  : "text-slate-500 hover:bg-white/10 hover:text-slate-300"
              }`}
              title="Skip this song"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>

            {/* Volume slider */}
            <VolumeSlider
              volume={volume}
              onVolumeChange={handleVolumeChange}
              onToggleMute={toggleMute}
            />

            {/* Sleep Timer */}
            <SleepTimerDisplay
              timeLeft={sleepTimeLeft}
              isActive={isSleepActive}
              onToggle={cancelSleepTimer}
              onSet={setSleepTimer}
            />

            {/* Share */}
            <ShareMenu song={currentSong} />

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="ml-1 flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:from-red-500 hover:to-orange-400 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : isPlaying ? (
                <><Pause className="h-4 w-4" /><span className="hidden sm:inline">Pause</span></>
              ) : (
                <><Play className="h-4 w-4" /><span className="hidden sm:inline">Listen Live</span></>
              )}
            </button>

            {/* Expand/Collapse panel */}
            <button
              onClick={() => setShowPanel(!showPanel)}
              className={`rounded-lg p-2 transition-colors ${
                showPanel
                  ? "text-red-400 bg-red-400/10"
                  : "text-slate-500 hover:bg-white/10 hover:text-slate-300"
              }`}
              title={showPanel ? "Hide panel" : "Show history & requests"}
            >
              {showPanel ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>

            {/* Full Station */}
            <a
              href={STREAM_CONFIG.stationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition-colors hover:border-white/20 hover:text-white"
              title="Open full station"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Full Station</span>
            </a>

            {/* Error indicator */}
            {streamError && (
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                {streamError}
              </span>
            )}

            {/* Dismiss */}
            <button
              onClick={dismiss}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-white/10 hover:text-slate-400"
              title="Hide player"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Offline banner */}
        {!isOnline && apiStatus === "ok" && (
          <div className="border-t border-red-500/20 bg-red-500/10 px-4 py-1.5 text-center">
            <p className="text-[10px] font-medium text-red-400">
              Station is currently offline — check back soon!
            </p>
          </div>
        )}

        {/* Sleep timer active indicator */}
        {isSleepActive && sleepTimeLeft !== null && (
          <div className="border-t border-amber-500/20 bg-amber-500/5 px-4 py-1 text-center">
            <p className="text-[10px] font-medium text-amber-400">
              <Clock className="mr-1 inline h-3 w-3" />
              Sleep timer: {formatTime(sleepTimeLeft)} remaining
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
