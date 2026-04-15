import { NextRequest, NextResponse } from "next/server";

// In-memory shoutbox storage (simple implementation)
// For production, this should use a database with rate limiting
interface ShoutMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  type: "user" | "system";
}

const MAX_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 200;
const RATE_LIMIT_WINDOW = 10_000; // 10 seconds
const RATE_LIMIT_MAX = 5; // 5 messages per 10 seconds
const userRateLimits = new Map<string, { count: number; resetAt: number }>();

// Pre-populate with welcome messages
const messages: ShoutMessage[] = [
  {
    id: "sys-welcome",
    username: "TKR",
    message: "Welcome to the Tunog Kalye Radio shoutbox! 🎵 Chat with fellow listeners and DJs.",
    timestamp: Date.now() - 60000,
    type: "system",
  },
];

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = userRateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    userRateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

function cleanupOldMessages() {
  if (messages.length > MAX_MESSAGES) {
    messages.splice(0, messages.length - MAX_MESSAGES);
  }
}

// GET: Retrieve recent messages
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    let result = messages;
    if (since) {
      const sinceTime = parseInt(since, 10);
      result = messages.filter((m) => m.timestamp > sinceTime);
    }

    result = result.slice(-limit);

    return NextResponse.json({ messages: result, total: messages.length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST: Send a new message
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Slow down! You're sending messages too quickly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, message } = body;

    // Validate
    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    if (username.length > 30) {
      return NextResponse.json({ error: "Username too long (max 30 chars)" }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` },
        { status: 400 }
      );
    }

    // Sanitize — strip HTML
    const cleanUsername = username.trim().replace(/<[^>]*>/g, "").slice(0, 30);
    const cleanMessage = message.trim().replace(/<[^>]*>/g, "").slice(0, MAX_MESSAGE_LENGTH);

    const newMessage: ShoutMessage = {
      id: `shout-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      username: cleanUsername,
      message: cleanMessage,
      timestamp: Date.now(),
      type: "user",
    };

    messages.push(newMessage);
    cleanupOldMessages();

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
