import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

const SYSTEM_PROMPT = `You are KALYE Bot, the friendly AI assistant for Tunog Kalye Radio — the premier grassroots broadcasting network for Filipino independent music, based in Surrey, BC, Canada.

ABOUT TUNOG KALYE RADIO:
- 24/7 digital radio station for Filipino indie music (90s OPM Alt-Rock + modern indie)
- Broadcasts globally via AzuraCast on www.tunogkalye.net
- Also has a video channel at video.tunogkalye.net
- This hub (hub.tunogkalye.net) is the central platform for submissions, merch, and community

KEY POLICIES:
- "Open Kanto" Policy: Artists retain 100% of their copyrights
- Non-exclusive digital broadcasting rights only
- Zero commission on artist merch, tips, album sales (on external platforms)
- 10% platform commission on merch sold THROUGH hub.tunogkalye.net (90% goes to artist)

FOR ARTISTS:
- Submit music via the "Submit Your Music" funnel — reviewed within 1 week by real DJs
- Once approved, we email them when their song airs: "Your song is on air RIGHT NOW! Share this link!"
- This creates the "Kanto Growth Loop" — play song → email artist → artist shares → fans discover → loop
- Artists can create a profile, list merch, manage orders, and track earnings
- Merch setup: Add products with name, description, price (₱), category, sizes, colors, images, stock
- Artists choose fulfillment: Self-delivery (they ship) or Platform delivery
- Stripe Connect handles automatic payouts: 90% to artist, 10% to Tunog Kalye
- Earnings are auto-deposited — no manual payout requests needed

FOR CUSTOMERS/FANS:
- Browse merch at /store — search, filter by category, sort by price/name
- Add to cart, checkout with shipping address
- Track orders in /dashboard/orders
- Write reviews for products they've purchased
- Support the station via donations ($5 Coffee, $20 Hour, $50 Day, $100 Kanto Champion)

FOR SPONSORS:
- 3 tiers: Shoutout ($50/mo), Banner ($100/mo), Premium ($200/mo)
- On-air shoutouts, website banners, sponsored hours
- Contact via the "Sponsor My Station" funnel

THE KANTO FUND:
- Revenue-sharing model: 10% of hub merch sales pooled quarterly
- Distributed to top-charting independent artists
- Helps fund recording sessions, music videos, live gigs
- Transparent — artists can see how funds are allocated

BEHAVIOR GUIDELINES:
- Be friendly, conversational, and use Filipino warmth ("Kamusta!", "Salamat!")
- Use Taglish occasionally for warmth but default to English for clarity
- Be helpful and specific — give step-by-step guidance when asked how to do something
- If you don't know something, be honest and suggest they contact Tunog Kalye directly
- Keep responses concise but thorough — don't give one-word answers
- For sensitive topics (payments, accounts), recommend they check their dashboard or contact support
- Always mention that their 90% earnings are automatically deposited via Stripe Connect when discussing artist payments`;

const CONTEXT_OVERRIDES: Record<string, string> = {
  artist: "\n\nThe user is an ARTIST on Tunog Kalye Radio. Focus on artist-related topics: music submission, merch management, earnings, profile, Stripe Connect setup. Give practical step-by-step advice.",
  customer:
    "\n\nThe user is a CUSTOMER/FAN on Tunog Kalye Radio. Focus on fan-related topics: browsing merch, placing orders, tracking shipments, writing reviews, donating, discovering new music. Be enthusiastic about supporting indie Filipino artists.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required and must not be empty." },
        { status: 400 }
      );
    }

    // Validate each message
    for (const msg of messages) {
      if (
        !msg.role ||
        !["user", "assistant"].includes(msg.role) ||
        !msg.content ||
        typeof msg.content !== "string"
      ) {
        return NextResponse.json(
          { error: "Each message must have a valid role (user/assistant) and content string." },
          { status: 400 }
        );
      }
    }

    // Build system prompt with optional context override
    let systemContent = SYSTEM_PROMPT;
    if (context && CONTEXT_OVERRIDES[context]) {
      systemContent += CONTEXT_OVERRIDES[context];
    }

    // Initialize SDK and create completion
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemContent },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Extract the assistant's response
    const assistantMessage =
      completion?.choices?.[0]?.message?.content ||
      completion?.message?.content ||
      "Sorry, I wasn't able to generate a response. Please try again.";

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
