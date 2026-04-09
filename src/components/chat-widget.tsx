"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, Send, X, Bot, User, Radio } from "lucide-react";

// ─── Types ───────────────────────────────────────────────
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type ChatContext = "general" | "artist" | "customer";

// ─── Suggested Questions ─────────────────────────────────
const SUGGESTED_QUESTIONS: Record<ChatContext, string[]> = {
  general: [
    "How do I submit my music?",
    "How does the merch store work?",
    "What is the Kanto Fund?",
    "How do I become a sponsor?",
  ],
  artist: [
    "How do I submit my music?",
    "How do I set up my merch?",
    "How do I track my earnings?",
    "How does Stripe Connect work?",
  ],
  customer: [
    "How do I browse merch?",
    "How do I track my order?",
    "How do I write a review?",
    "How can I support the station?",
  ],
};

const WELCOME_MESSAGE =
  "Kamusta! 🎵 I'm KALYE Bot, your Tunog Kalye assistant. How can I help you today?";

// ─── Typing Indicator ────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-500">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-[#1a1a2e] px-4 py-3">
        <div className="flex items-center gap-1">
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

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

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: text.trim() };
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
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message || "Sorry, I couldn't generate a response.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Oops, something went wrong on my end. Please try again in a moment! 🙏",
        },
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
  };

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
        className={`fixed bottom-40 right-4 z-[90] w-[calc(100vw-2rem)] origin-bottom-right sm:right-6 sm:w-[380px] transition-all duration-300 ${
          isOpen
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 translate-y-2 opacity-0"
        }`}
        style={{ maxHeight: "520px" }}
      >
        <div className="flex h-[520px] max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12121a] shadow-2xl shadow-black/50">
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500">
                <Radio className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">KALYE Bot</span>
                  <span className="flex h-2 w-2 rounded-full bg-green-500">
                    <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75" />
                  </span>
                </div>
                <span className="text-[10px] text-green-400">Online</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ─── Context Tabs ─── */}
          <div className="flex border-b border-white/10">
            {[
              { id: "general" as ChatContext, label: "General" },
              { id: "artist" as ChatContext, label: "For Artists" },
              { id: "customer" as ChatContext, label: "For Fans" },
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
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── Messages Area ─── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome message */}
            {!hasStarted && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-500">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-[#1a1a2e] px-4 py-3">
                  <p className="text-sm leading-relaxed text-slate-200">
                    {WELCOME_MESSAGE}
                  </p>
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {!hasStarted && (
              <div className="space-y-2 pl-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                  Quick Questions
                </p>
                {SUGGESTED_QUESTIONS[context].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSuggestedClick(q)}
                    className="block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-xs text-slate-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
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
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-gradient-to-r from-red-600 to-orange-500 text-white"
                      : "rounded-bl-sm bg-[#1a1a2e] text-slate-200"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* ─── Input Area ─── */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 p-3"
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
