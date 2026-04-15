"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, Send, X, Bot, User, Radio, Copy, Check,
  RotateCcw, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

type ChatContext = "general" | "artist" | "customer";

// ─── Suggested Questions (expanded) ──────────────────────
const SUGGESTED_QUESTIONS: Record<ChatContext, string[]> = {
  general: [
    "How do I submit my music?",
    "How does the merch store work?",
    "What is the Open Kanto Policy?",
    "How do I become a sponsor?",
    "What is the Kanto Fund?",
    "How much commission do you take?",
    "How do I listen to the station?",
    "How do I create an account?",
  ],
  artist: [
    "How do I submit my music?",
    "How do I set up my merch store?",
    "How do I track my earnings?",
    "How does Stripe Connect work?",
    "What is the Open Kanto Policy?",
    "How does order fulfillment work?",
    "How can I promote my music?",
    "What commission do you charge?",
  ],
  customer: [
    "How do I browse the merch store?",
    "How do I track my order?",
    "How do I write a review?",
    "How can I support the station?",
    "What payment methods do you accept?",
    "How do I create an account?",
    "What is the Kanto Fund?",
    "How do returns work?",
  ],
};

const WELCOME_MESSAGES: Record<ChatContext, string> = {
  general:
    "Kamusta! 🎵 I'm KALYE Bot, your Tunog Kalye assistant. I can help with music submissions, merch, donations, sponsorships, and more. How can I help you today?",
  artist:
    "Kamusta, artist! 🎸 I'm here to help you navigate Tunog Kalye Radio. Whether it's submitting tracks, setting up merch, or tracking earnings — ask me anything!",
  customer:
    "Kamusta! 🛍️ Welcome to Tunog Kalye Radio! I can help you find merch, track orders, discover new Filipino indie music, and more. What can I help you with?",
};

// ─── Simple Markdown Parser ──────────────────────────────
function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Empty line — close list and add break
    if (line.trim() === "") {
      if (inList) {
        nodes.push(<ul key={`ul-${i}`} className="my-1 ml-4 list-disc space-y-0.5" />);
        inList = false;
      }
      continue;
    }

    // Bullet list item
    if (line.match(/^[-•]\s/)) {
      if (!inList) {
        inList = true;
      }
      nodes.push(
        <span key={`li-${i}`} className="block ml-4 mb-0.5">
          <span className="mr-1.5">•</span>
          {renderInline(line.replace(/^[-•]\s/, ""))}
        </span>
      );
      continue;
    }

    // Numbered list item
    const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numberedMatch) {
      if (!inList) {
        inList = true;
      }
      nodes.push(
        <span key={`ol-${i}`} className="block ml-4 mb-0.5">
          <span className="mr-1 font-semibold text-slate-300">{numberedMatch[1]}.</span>
          {renderInline(numberedMatch[2])}
        </span>
      );
      continue;
    }

    // Close list if we were in one
    if (inList) {
      inList = false;
    }

    // Headers (## or ** at start)
    if (line.startsWith("## ")) {
      nodes.push(
        <div key={`h2-${i}`} className="mt-2 mb-1 text-sm font-bold text-white">
          {renderInline(line.replace("## ", ""))}
        </div>
      );
      continue;
    }

    // Regular paragraph
    nodes.push(
      <span key={`p-${i}`} className="block">
        {renderInline(line)}
      </span>
    );
  }

  // Close any trailing list
  if (inList) {
    nodes.push(<br key="ul-end" />);
  }

  return nodes;
}

function renderInline(text: string): React.ReactNode {
  // Process bold (**text**), inline code, and emojis
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(
          <span key={key++}>{remaining.slice(0, boldMatch.index)}</span>
        );
      }
      parts.push(
        <strong key={key++} className="font-semibold text-white">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // No more formatting — push rest
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

// ─── Timestamp Formatter ──────────────────────────────────
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

// ─── Typing Indicator ────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-500">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-[#1a1a2e] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// ─── Chat Widget ─────────────────────────────────────────
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [context, setContext] = useState<ChatContext>("general");
  const [hasStarted, setHasStarted] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [sessionId] = useState(() =>
    `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
  const [showMoreQuestions, setShowMoreQuestions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Detect scroll position for "scroll to bottom" button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setHasOpened(true);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Copy message to clipboard
  const copyMessage = useCallback(async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // Fallback: ignore
    }
  }, []);

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    setHasStarted(false);
    setInput("");
    inputRef.current?.focus();
  }, []);

  // Resend last message (regenerate response)
  const regenerateLastResponse = useCallback(async () => {
    if (messages.length < 2 || isLoading) return;
    // Remove last assistant message
    const trimmed = messages.slice(0, -1);
    setMessages(trimmed);
    // Resend the last user message
    const lastUserMsg = [...trimmed].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: trimmed,
            context,
            sessionId,
          }),
        });
        if (!res.ok) throw new Error("Failed to regenerate");
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message || "Sorry, I couldn't generate a response.", timestamp: Date.now() },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Oops, something went wrong. Please try again! 🙏", timestamp: Date.now() },
        ]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    }
  }, [messages, isLoading, context, sessionId]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setHasStarted(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          context,
          sessionId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        if (res.status === 429) {
          throw new Error("rate-limit");
        }
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message || "Sorry, I couldn't generate a response.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg =
        err instanceof Error && err.message === "rate-limit"
          ? "Slow down a bit! Please wait a moment before sending another message. 🕐"
          : "Oops, something went wrong on my end. Please try again in a moment! 🙏";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMsg, timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleSuggestedClick = (question: string) => {
    sendMessage(question);
  };

  const handleContextChange = (ctx: ChatContext) => {
    setContext(ctx);
    // Update welcome message when switching tabs (only if no messages yet)
    if (!hasStarted) {
      // Welcome message will use the new context
    }
  };

  // Get visible questions based on state
  const visibleQuestions = showMoreQuestions
    ? SUGGESTED_QUESTIONS[context]
    : SUGGESTED_QUESTIONS[context].slice(0, 4);
  const hasMoreQuestions = SUGGESTED_QUESTIONS[context].length > 4;

  return (
    <>
      {/* ─── Floating Bubble (collapsed) ─── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/40 sm:right-6"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            {!hasOpened && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-orange-500 text-[9px] font-bold">
                  1
                </span>
              </span>
            )}
          </>
        )}
      </button>

      {/* ─── Chat Panel (expanded) ─── */}
      <div
        ref={panelRef}
        className={`fixed bottom-40 right-4 z-[90] w-[calc(100vw-2rem)] origin-bottom-right sm:right-6 sm:w-[400px] transition-all duration-300 ${
          isOpen
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 translate-y-2 opacity-0"
        }`}
        style={{ maxHeight: "560px" }}
      >
        <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12121a] shadow-2xl shadow-black/50"
          style={{ height: "560px", maxHeight: "80vh" }}
        >
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500">
                <Radio className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">KALYE Bot</span>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                </div>
                <span className="text-[10px] text-green-400">Online • Ready to help</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {hasStarted && (
                <button
                  onClick={clearChat}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ─── Context Tabs ─── */}
          <div className="flex border-b border-white/10 shrink-0">
            {[
              { id: "general" as ChatContext, label: "General", emoji: "🎧" },
              { id: "artist" as ChatContext, label: "For Artists", emoji: "🎸" },
              { id: "customer" as ChatContext, label: "For Fans", emoji: "🛍️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleContextChange(tab.id)}
                className={`flex-1 px-3 py-2 text-[11px] font-medium transition-all ${
                  context === tab.id
                    ? "border-b-2 border-red-500 bg-white/5 text-white"
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                }`}
              >
                <span className="mr-1">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── Messages Area ─── */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 relative"
          >
            {/* Welcome message */}
            {!hasStarted && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-500">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[#1a1a2e] px-4 py-3">
                  <p className="text-sm leading-relaxed text-slate-200">
                    {WELCOME_MESSAGES[context]}
                  </p>
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {!hasStarted && (
              <div className="space-y-2 pl-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                  Popular Questions
                </p>
                {visibleQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSuggestedClick(q)}
                    className="block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-xs text-slate-300 transition-all hover:border-red-500/30 hover:bg-white/10 hover:text-white"
                  >
                    {q}
                  </button>
                ))}
                {hasMoreQuestions && (
                  <button
                    onClick={() => setShowMoreQuestions(!showMoreQuestions)}
                    className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-white/10 px-3 py-2 text-[10px] text-slate-500 transition-all hover:border-white/20 hover:text-slate-300"
                  >
                    {showMoreQuestions ? (
                      <>
                        <ChevronUp className="h-3 w-3" /> Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" /> More questions
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`group flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                {msg.role === "assistant" ? (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-500">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                )}

                {/* Bubble */}
                <div className="relative max-w-[85%]">
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "rounded-br-sm bg-gradient-to-r from-red-600 to-orange-500 text-white"
                        : "rounded-bl-sm bg-[#1a1a2e] text-slate-200"
                    }`}
                  >
                    <div className="text-sm leading-relaxed">
                      {msg.role === "assistant"
                        ? parseMarkdown(msg.content)
                        : msg.content}
                    </div>
                  </div>

                  {/* Timestamp + Actions */}
                  {msg.timestamp && (
                    <div
                      className={`mt-1 flex items-center gap-1 ${
                        msg.role === "user" ? "justify-end" : ""
                      }`}
                    >
                      <span className="text-[9px] text-slate-600">
                        {formatTime(msg.timestamp)}
                      </span>
                      {/* Copy button (visible on hover) */}
                      <button
                        onClick={() => copyMessage(msg.content, i)}
                        className="rounded p-0.5 text-slate-600 opacity-0 transition-all group-hover:opacity-100 hover:text-slate-300"
                        title="Copy message"
                      >
                        {copiedIdx === i ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                      {/* Regenerate button for last assistant message */}
                      {msg.role === "assistant" &&
                        i === messages.length - 1 &&
                        !isLoading && (
                          <button
                            onClick={regenerateLastResponse}
                            className="rounded p-0.5 text-slate-600 opacity-0 transition-all group-hover:opacity-100 hover:text-slate-300"
                            title="Regenerate response"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </button>
                        )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {showScrollBtn && hasStarted && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-[72px] right-5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#1a1a2e] text-slate-400 shadow-lg transition-all hover:bg-white/10 hover:text-white"
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}

          {/* ─── Input Area ─── */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 p-3 shrink-0"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/20 transition-all hover:from-red-500 hover:to-orange-400 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
