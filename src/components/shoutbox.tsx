"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, Send, X, Radio, Users } from "lucide-react";

interface ShoutMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  type: "user" | "system";
}

const POLL_INTERVAL = 5000; // 5 seconds

export default function Shoutbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ShoutMessage[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [showNameSetup, setShowNameSetup] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userCount, setUserCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFetchRef = useRef<number>(0);

  // Load saved username
  useEffect(() => {
    const saved = localStorage.getItem("tkr-shoutbox-name");
    if (saved) setUsername(saved);
  }, []);

  // Save username
  const saveUsername = useCallback((name: string) => {
    setUsername(name);
    localStorage.setItem("tkr-shoutbox-name", name);
    setShowNameSetup(false);
    inputRef.current?.focus();
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const since = lastFetchRef.current > 0 ? lastFetchRef.current : undefined;
      const url = since
        ? `/api/shoutbox?since=${since}&limit=50`
        : `/api/shoutbox?limit=50`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages((prev) => {
            // Merge: avoid duplicates by id
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = data.messages.filter((m: ShoutMessage) => !existingIds.has(m.id));
            const merged = [...prev, ...newMsgs].sort((a, b) => a.timestamp - b.timestamp);
            // Keep last 100
            return merged.slice(-100);
          });
          // Update last fetch timestamp
          if (data.messages.length > 0) {
            const lastTimestamp = Math.max(...data.messages.map((m: ShoutMessage) => m.timestamp));
            lastFetchRef.current = lastTimestamp;
          }
        }
        setUserCount(data.total || 0);
      }
    } catch {
      // silent
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && username) {
      const timer = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, username]);

  const sendMessage = async () => {
    const name = username.trim();
    const text = input.trim();

    if (!name) {
      setShowNameSetup(true);
      return;
    }
    if (!text || isSending) return;

    setIsSending(true);
    setInput("");

    try {
      const res = await fetch("/api/shoutbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
          lastFetchRef.current = data.message.timestamp;
        }
      }
    } catch {
      setInput(text); // Restore on error
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  // Collapsed floating button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-40 left-4 z-[90] flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1a2e] border border-white/10 text-slate-400 shadow-lg transition-all hover:scale-105 hover:border-white/20 hover:text-white"
        title="Open Shoutbox"
      >
        <MessageSquare className="h-5 w-5" />
        {!isOpen && messages.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-50" />
            <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[8px] font-bold text-white">
              <Radio className="h-2.5 w-2.5" />
            </span>
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-40 left-4 z-[90] w-[calc(100vw-2rem)] sm:left-4 sm:w-[340px] transition-all duration-300">
      <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12121a] shadow-2xl shadow-black/50"
        style={{ height: "min(460px, 65vh)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
              <MessageSquare className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">Shoutbox</span>
                <span className="flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
              </div>
              <span className="text-[10px] text-green-400">Live Chat</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white"
            >
              <X className={`h-3.5 w-3.5 transition-transform ${isMinimized ? "" : "rotate-0"}`} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`animate-in fade-in slide-in-from-bottom-1 duration-200 ${
                    msg.type === "system" ? "text-center" : ""
                  }`}
                >
                  {msg.type === "system" ? (
                    <div className="py-1">
                      <span className="text-[10px] text-slate-600">{msg.message}</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-[9px] font-bold text-blue-400">
                        {msg.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[11px] font-bold text-blue-300">{msg.username}</span>
                          <span className="text-[9px] text-slate-700">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p className="text-xs text-slate-300 break-words leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Username setup */}
            {showNameSetup && (
              <div className="border-t border-white/10 p-3 shrink-0 bg-white/5">
                <p className="mb-2 text-[10px] text-slate-500">Choose a display name for the shoutbox:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="Your name..."
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) saveUsername(val);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (input && input.value.trim()) saveUsername(input.value.trim());
                    }}
                    className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-medium text-white hover:bg-blue-400"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            {!showNameSetup && (
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="border-t border-white/10 p-3 shrink-0"
              >
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={username ? `Chat as ${username}...` : "Type a message..."}
                    disabled={isSending}
                    maxLength={200}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isSending}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white transition-all hover:bg-blue-400 disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
                {!username && (
                  <button
                    type="button"
                    onClick={() => setShowNameSetup(true)}
                    className="mt-1.5 text-[9px] text-slate-600 hover:text-slate-400 underline"
                  >
                    Set your display name
                  </button>
                )}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
