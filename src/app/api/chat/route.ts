import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are KALYE Bot, the friendly AI assistant for Tunog Kalye Radio — the premier broadcasting network for Filipino independent music, based in Surrey, BC, Canada.

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
- Submit music via the "Submit Your Music" pathway — reviewed within 1 week by real DJs
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
- Contact via the "Sponsor My Station" pathway

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

// ─── Keyword-based fallback responses ─────────────────────────
const FALLBACK_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ["submit", "music", "song", "upload", "send music", "demo"],
    response:
      "Great question! 🎵 To submit your music to Tunog Kalye Radio:\n\n1. **Sign up** or log in at hub.tunogkalye.net\n2. Click **\"Submit Your Music\"** on the homepage\n3. Fill in your details: band name, real name, email, city, genre\n4. Add your Spotify/SoundCloud links\n5. Hit submit!\n\nOur real DJs will review your submission within **1 week**. Once approved, we'll email you when your song airs so you can share it with your fans! 📻\n\nRemember: You keep **100% of your copyrights** under our Open Kanto Policy.",
  },
  {
    keywords: ["merch", "store", "buy", "shop", "product", "t-shirt", "hoodie"],
    response:
      "Welcome to the Tunog Kalye merch store! 🛍️\n\n**For Buyers:**\n- Browse merch at hub.tunogkalye.net/store\n- Filter by category, search by name, sort by price\n- Add to cart and checkout with your shipping address\n- Track your orders in your Dashboard\n\n**For Artists:**\n- Go to your Artist Dashboard → Products\n- Add products with name, description, price, images, sizes & stock\n- Choose fulfillment: Self-delivery or Platform delivery\n- You earn **90%** of every sale — automatically deposited via Stripe Connect!\n\nZero commission on merch sold through external platforms. Only 10% on sales through our hub.",
  },
  {
    keywords: ["kanto fund", "fund", "revenue", "quarterly"],
    response:
      "The **Kanto Fund** is our way of giving back to the community! 💰\n\n- **10%** of all hub merch sales are pooled quarterly\n- Distributed to top-charting independent artists\n- Funds help pay for recording sessions, music videos, and live gigs\n- Fully transparent — artists can see how funds are allocated\n\nIt's our commitment to making sure the artists who make Tunog Kalye great also benefit from its success. Salamat sa musika! 🎶",
  },
  {
    keywords: ["sponsor", "advertise", "banner", "shoutout", "partner"],
    response:
      "Want to support Pinoy indie music and get your brand heard? 📢\n\nWe offer **3 sponsorship tiers**:\n\n🎸 **Shoutout** — $50/mo\n- On-air shoutouts during broadcasts\n\n📺 **Banner** — $100/mo\n- Website banner placement + on-air shoutouts\n\n⭐ **Premium** — $200/mo\n- Banner + shoutouts + sponsored hour segments\n\nClick **\"Sponsor My Station\"** on the homepage to get started, or email us at tunogkalye.net!",
  },
  {
    keywords: ["stripe", "payout", "payment", "earn", "money", "income"],
    response:
      "Great question about payments! 💳\n\n**For Artists:**\n- We use **Stripe Connect** for automatic payouts\n- You earn **90%** of every merch sale through the hub\n- Payouts are **auto-deposited** — no manual requests needed\n- Set up your Stripe account in Artist Dashboard → Stripe Connect\n\n**For Customers:**\n- Secure checkout powered by Stripe\n- We accept major credit/debit cards\n- All transactions are encrypted and safe\n\nNeed help? Check your Dashboard or contact our support team.",
  },
  {
    keywords: ["donate", "donation", "support", "tip", "give"],
    response:
      "Thank you for wanting to support Tunog Kalye Radio! 🙏\n\nWe have **4 donation tiers**:\n\n☕ **$5 — Coffee** — Fuel a DJ's shift\n🎙️ **$20 — An Hour** — Fund an hour of broadcast\n📡 **$50 — A Day** — Keep the station running for a day\n🏆 **$100 — Kanto Champion** — Become a station champion!\n\nClick **\"Donate\"** on the homepage to contribute. Every peso helps keep Filipino indie music on the air!",
  },
  {
    keywords: ["register", "sign up", "create account", "join"],
    response:
      "Joining Tunog Kalye Radio is easy and free! 🎉\n\n1. Go to hub.tunogkalye.net/auth/register\n2. Choose your role: **Fan/Customer** or **Artist/Band**\n3. Fill in your name, email, and password\n4. If you're an artist, add your band name and city\n5. Click **Create Account**!\n\nYou can also sign up with **Google** or **Facebook** if you prefer.\n\nWelcome to the Kanto! 🎵",
  },
  {
    keywords: ["order", "track", "shipping", "deliver"],
    response:
      "Here's how to manage your orders: 📦\n\n**Track an Order:**\n- Log in and go to **Dashboard → Orders**\n- You'll see real-time status: Pending → Paid → Processing → Shipped → Delivered\n\n**Order Issues:**\n- Contact the artist directly through the order page\n- Or reach out to Tunog Kalye support\n\nOrders from different artists may arrive separately depending on the fulfillment method chosen by each artist.",
  },
  {
    keywords: ["review", "rating", "feedback"],
    response:
      "We love hearing from our community! ⭐\n\n**Write a Review:**\n- Go to any product page in the Store\n- If you've purchased the item, you can leave a rating (1-5 stars) and a comment\n- Your reviews help other fans discover great merch and support artists!\n\nReviews can be found on each product page. Honest feedback helps our artists improve! 🎶",
  },
  {
    keywords: ["hello", "hi", "hey", "kamusta", "what's up"],
    response:
      "Kamusta! 🎵 Welcome to Tunog Kalye Radio — your home for Filipino independent music!\n\nI'm KALYE Bot, and I can help you with:\n- 🎵 Submitting your music\n- 🛍️ Browsing or selling merch\n- 💰 Donations and sponsorships\n- 📦 Order tracking\n- 🎸 Artist profiles and earnings\n\nJust ask me anything! What would you like to know?",
  },
];

// ─── Build a smart fallback response ──────────────────────────
function getFallbackResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  // Find the best matching response
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const item of FALLBACK_RESPONSES) {
    const score = item.keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item.response;
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  // Generic fallback
  return `Thanks for reaching out! 🎵\n\nI'm not quite sure about that specific topic, but here's what I can help with:\n\n- 🎵 **Music Submissions** — How to get your songs on air\n- 🛍️ **Merch Store** — Buying or selling products\n- 💰 **Kanto Fund** — Revenue sharing for artists\n- 📢 **Sponsorships** — Partner with us\n- 💳 **Payments** — Stripe Connect, earnings, donations\n\nFeel free to ask about any of these, or contact the Tunog Kalye team directly at tunogkalye.net for more specific inquiries!`;
}

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

    // Get the last user message for fallback
    const lastUserMessage = [...messages]
      .reverse()
      .find((m: { role: string }) => m.role === "user")?.content || "";

    // Try AI SDK first
    try {
      // Dynamic import so it doesn't crash if the module isn't available
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();

      // Build system prompt with optional context override
      let systemContent = SYSTEM_PROMPT;
      if (context && CONTEXT_OVERRIDES[context]) {
        systemContent += CONTEXT_OVERRIDES[context];
      }

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

      const assistantMessage =
        completion?.choices?.[0]?.message?.content ||
        completion?.message?.content;

      if (assistantMessage) {
        return NextResponse.json({ message: assistantMessage });
      }
    } catch (aiError) {
      console.error("AI SDK error, using fallback:", aiError);
    }

    // Fallback: keyword-based response
    const fallbackResponse = getFallbackResponse(lastUserMessage);
    return NextResponse.json({ message: fallbackResponse });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
