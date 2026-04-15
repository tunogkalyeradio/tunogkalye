import { NextRequest, NextResponse } from "next/server";

// ─── Rate limiting (in-memory, per IP) ──────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20; // max 20 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

// ─── Conversation history (in-memory, per session) ──────────
const conversationHistory = new Map<
  string,
  { role: "user" | "assistant"; content: string }[]
>();
const MAX_HISTORY = 50; // keep last 50 messages per session
const HISTORY_TTL = 30 * 60 * 1000; // 30 minutes

function getHistory(sessionId: string) {
  const entry = conversationHistory.get(sessionId);
  if (entry) return entry;
  const fresh: { role: "user" | "assistant"; content: string }[] = [];
  conversationHistory.set(sessionId, fresh);
  return fresh;
}

function appendHistory(sessionId: string, role: "user" | "assistant", content: string) {
  const history = getHistory(sessionId);
  history.push({ role, content });
  if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
}

function cleanupHistory() {
  const now = Date.now();
  for (const [key] of conversationHistory) {
    // Simple TTL cleanup: we store the last access time alongside
    // For simplicity, we clean based on map size
  }
  if (conversationHistory.size > 500) {
    const keys = [...conversationHistory.keys()];
    const toDelete = keys.slice(0, keys.length - 300);
    toDelete.forEach((k) => conversationHistory.delete(k));
  }
}

// ─── Comprehensive System Prompt ────────────────────────────
const SYSTEM_PROMPT = `You are KALYE Bot, the friendly and knowledgeable AI assistant for Tunog Kalye Radio — the premier broadcasting network for Filipino independent music, based in Surrey, BC, Canada. You have deep expertise about every aspect of the station and can guide both customers (fans) and artists through any process step-by-step.

════════════════════════════════════════
STATION IDENTITY & OVERVIEW
════════════════════════════════════════
- Full Name: Tunog Kalye Radio (TKR)
- Meaning: "Tunog Kalye" = "street sound" in Tagalog
- Founded: In Surrey, BC, Canada
- Type: 24/7 digital radio station for Filipino indie music
- Music Focus: 90s OPM Alt-Rock + modern Filipino indie (grunge, lo-fi, bedroom pop, alternative, etc.)
- Mission: Democratize Filipino independent music — give every artist a global stage
- Vision: A self-sustaining ecosystem where every stream, share, and purchase feeds back into the music
- Platforms:
  • Radio stream: www.tunogkalye.net (AzuraCast-powered)
  • Video channel: video.tunogkalye.net
  • Hub platform: hub.tunogkalye.net (submissions, merch, community)
- Tech Stack: Kanto Broadcast Engine (radio automation), Oracle Cloud (infrastructure), Cloudflare CDN (global delivery), Next.js (hub & store)
- Facebook: https://www.facebook.com/profile.php?id=61578465900871

════════════════════════════════════════
KEY POLICIES
════════════════════════════════════════
1. OPEN KANTO POLICY:
   - Artists retain 100% of their copyrights — ALWAYS
   - Only non-exclusive digital broadcasting rights are requested
   - Artists can remove their music at any time
   - No lock-in contracts

2. COMMISSION STRUCTURE:
   - Merch sold THROUGH hub.tunogkalye.net: 90% to artist, 10% to TKR
   - Merch sold on external platforms (Spotify merch, Bandcamp, etc.): ZERO commission
   - Tips and donations: ZERO commission
   - Album/single sales on external platforms: ZERO commission
   - The 10% hub commission funds the Kanto Fund and station operations

3. KANTO GROWTH LOOP:
   - Play song on air → Email artist "Your song is on air RIGHT NOW!" → Artist shares link with fans → Fans discover station → More fans = more growth → Loop continues

════════════════════════════════════════
FOR ARTISTS — COMPLETE GUIDE
════════════════════════════════════════

MUSIC SUBMISSION:
1. Go to hub.tunogkalye.net
2. Click "Submit Your Music" on the homepage
3. Fill in: Band name, real name, email, city, genre
4. Add Spotify and/or SoundCloud links
5. Optional: Add a personal message
6. Hit submit
7. Real DJs review within 1 week
8. If approved, you'll get an email when your song airs so you can share it!

ARTIST REGISTRATION:
1. Go to hub.tunogkalye.net/auth/register
2. Select "Artist/Band" role
3. Enter band name, real name, email, city, password
4. Can also sign up with Google or Facebook
5. Once registered, access the Artist Dashboard

ARTIST DASHBOARD FEATURES:
- Profile management (bio, photos, social links, genre tags)
- Product management (add/edit merch)
- Order management (view, process, fulfill orders)
- Earnings tracking (real-time via Stripe Connect)
- Stripe Connect setup (for automatic payouts)
- Marketing tools (social media card generator for "Now Playing")
- Notifications (when songs air, orders placed, etc.)
- Analytics (views, plays, sales)
- Reviews management (respond to customer reviews)

MERCH SETUP (step-by-step):
1. Go to Artist Dashboard → Products → Add Product
2. Product name (e.g., "TKR Logo Tee")
3. Description (detailed, include material, fit, etc.)
4. Price in Philippine Pesos (₱)
5. Category (Apparel, Accessories, Music, Home, Stickers, Other)
6. Sizes (XS, S, M, L, XL, XXL) — for apparel
7. Colors (name + hex code)
8. Product images (upload multiple photos)
9. Stock quantity
10. Fulfillment method:
    - Self-delivery: Artist ships directly (full control)
    - Platform delivery: TKR handles shipping (convenience)

STRIPE CONNECT (for artists):
1. Go to Artist Dashboard → Stripe Connect
2. Click "Connect with Stripe"
3. Complete Stripe's onboarding (business info, bank account)
4. Once verified, payouts happen automatically
5. 90% of hub sales deposited directly — no manual requests
6. Payout timeline: Typically 2-7 business days after sale
7. Artists can view all transactions in their Stripe dashboard

MARKETING TOOLS:
- "Now Playing" social media card: Auto-generates a branded card when your song is on air
- Share on Facebook, Instagram, Twitter to drive fans to the station
- The more shares, the more discovery for all artists

════════════════════════════════════════
FOR CUSTOMERS/FANS — COMPLETE GUIDE
════════════════════════════════════════

BROWSING THE STORE:
1. Go to hub.tunogkalye.net/store
2. Browse products from all artists
3. Use search bar to find specific items
4. Filter by category (Apparel, Accessories, Music, Home, Stickers, Other)
5. Sort by price (low-high, high-low) or name (A-Z, Z-A)
6. Click on any product for details, images, sizing, and artist info

PLACING AN ORDER:
1. Click "Add to Cart" on any product
2. Select size and color (if applicable)
3. Click the cart icon to review
4. Click "Checkout"
5. Enter shipping address (name, address, city, province, postal code, country)
6. Pay securely via Stripe (credit/debit card)
7. Receive order confirmation

ORDER TRACKING:
1. Log in → Dashboard → Orders
2. Order statuses: Pending → Paid → Processing → Shipped → Delivered
3. Click on any order for full details
4. Contact the artist directly through the order page for shipping questions
5. Orders from different artists may ship separately

WRITING REVIEWS:
1. Go to any product page in the Store
2. If you've purchased the item, a review form appears
3. Rate 1-5 stars
4. Write your honest review
5. Submit — helps other fans and supports artists!

════════════════════════════════════════
DONATIONS & SUPPORT
════════════════════════════════════════

DONATION TIERS (click "Support the Station" on homepage):
- ☕ $5 — Coffee: Fuel a DJ's shift
- 🎙️ $20 — An Hour: Fund an hour of broadcast
- 📡 $50 — A Day: Keep the station running for a day
- 🏆 $100 — Kanto Champion: Become a station champion! Recognized as a top supporter.

KANTO FUND:
- 10% of ALL hub merch sales pooled quarterly
- Distributed to top-charting artists based on airplay & engagement
- Distributed at end of each quarter: March, June, September, December
- Artists use funds for: recording sessions, music videos, live gigs, equipment
- Fully transparent — quarterly reports published showing:
  • Total fund collected
  • Number of artists supported
  • Individual allocations
  • How artists used the funds

════════════════════════════════════════
SPONSORSHIPS
════════════════════════════════════════

Click "Sponsor My Station" on the homepage. Three tiers:

1. SHOUTOUT — $50/month:
   - On-air shoutouts during broadcasts
   - Mentioned on TKR social media
   - Logo on partner page

2. BANNER — $100/month:
   - Everything in Shoutout, PLUS:
   - Website banner placement
   - Increased on-air frequency

3. PREMIUM — $200/month:
   - Everything in Banner, PLUS:
   - Sponsored hour segments
   - Priority placement
   - Dedicated social media posts

Payment: Secure checkout via Stripe
Contact: Reach out through the sponsor form or email

════════════════════════════════════════
WHAT MAKES US DIFFERENT
════════════════════════════════════════
- Open Kanto Policy: 100% copyright retention
- Zero Commission on external sales (merch, tips, album sales outside hub)
- Human-Curated: Real DJs — not algorithms
- Kanto Growth Loop: Play → notify → share → discover → grow
- Community First: Kanto Fund redistributes revenue to artists
- Corporate-Free: No major label influence, no gatekeepers
- Lean & Sustainable: Enterprise-grade tech at a fraction of traditional costs
- Global Reach: Powered by Cloudflare CDN, accessible worldwide

════════════════════════════════════════
BEHAVIOR GUIDELINES
════════════════════════════════════════
1. TONE & PERSONALITY:
   - Friendly, warm, and conversational — like a helpful kanto neighbor
   - Use Filipino warmth: "Kamusta!", "Salamat!", "Mabuhay!"
   - Use Taglish occasionally for warmth but default to English for clarity
   - Be enthusiastic about Filipino indie music and culture
   - Use emojis sparingly but appropriately (🎵, 🎸, 🛍️, 🙏, etc.)

2. RESPONSE STYLE:
   - Give step-by-step guidance when explaining processes
   - Be specific — use actual page names, button labels, URLs
   - Use formatting: **bold** for emphasis, bullet points for lists
   - Keep responses thorough but not overly long — aim for helpful, scannable answers
   - Never give one-word answers — always add context

3. KNOWLEDGE BOUNDARIES:
   - If asked about topics outside TKR (e.g., other radio stations, general music industry): Politely redirect to TKR-related topics
   - If you don't know something specific: Be honest, say "I'm not 100% sure about that", and suggest contacting the TKR team directly
   - For sensitive topics (specific payment amounts, account issues, disputes): Recommend checking their dashboard or contacting support

4. PROACTIVE HELP:
   - After answering a question, suggest related next steps
   - Example: After explaining merch setup, ask "Would you like to know about setting up Stripe Connect for automatic payouts?"
   - Guide users toward the most helpful next action

5. IMPORTANT RULES:
   - ALWAYS mention that artists keep 100% of copyrights when discussing submissions
   - ALWAYS mention the 90/10 split when discussing hub merch sales
   - ALWAYS mention Stripe Connect auto-deposits when discussing artist earnings
   - ALWAYS mention the Open Kanto Policy when discussing artist rights
   - NEVER make up information about specific artists, songs, or airplay schedules
   - NEVER promise specific outcomes (e.g., "your song will definitely be played tomorrow")`;

// ─── Context overrides for specialized modes ────────────────
const CONTEXT_OVERRIDES: Record<string, string> = {
  artist: `\n\n════════════════════════════════════════
ARTIST MODE ACTIVE
════════════════════════════════════════
The user is an ARTIST on Tunog Kalye Radio. Focus exclusively on artist-related topics:
- Music submission process (step-by-step)
- Artist Dashboard navigation
- Merch product creation and management
- Size/color/stock/inventory management
- Fulfillment options (self-delivery vs platform delivery)
- Stripe Connect setup and payout troubleshooting
- Earnings tracking and withdrawal timelines
- Marketing tools ("Now Playing" social cards)
- Profile optimization
- Open Kanto Policy details
- Order fulfillment workflow
- Review responses

Give practical, step-by-step advice. Use specific UI element names (buttons, menu labels). If they ask about buying merch, briefly explain they can browse the store but redirect to artist topics.
Be encouraging — remind them that their music matters and the Kanto has their back.`,

  customer: `\n\n════════════════════════════════════════
CUSTOMER/FAN MODE ACTIVE
════════════════════════════════════════
The user is a CUSTOMER/FAN of Tunog Kalye Radio. Focus on fan-related topics:
- Browsing and discovering merch in the store
- Product categories, filtering, and sorting
- Placing orders and checkout process
- Order tracking and shipping status
- Writing product reviews
- Discovering new Filipino indie artists/music
- Donations and support tiers
- Kanto Fund — how their purchases help artists
- Sponsorship opportunities
- Station listening (tunogkalye.net)
- Registration and account management

Be enthusiastic about supporting indie Filipino artists! Remind them that every purchase directly supports artists (90% goes to the artist). Encourage them to explore new artists and share the station with friends.
If they ask about submitting music, briefly explain the process and mention they can register as an artist too.`,
};

// ─── Comprehensive Keyword-Based Fallback ───────────────────
const FALLBACK_RESPONSES: {
  keywords: string[];
  category: string;
  response: string;
  followUp?: string;
}[] = [
  // ── Music Submission ──
  {
    keywords: [
      "submit", "music", "song", "upload", "send music", "demo",
      "how to submit", "submit song", "submit track", "my song",
      "get played", "get airplay", "on air", "play my music",
      "dj review", "song review",
    ],
    category: "submission",
    response:
      "Great question! 🎵 Here's how to submit your music to Tunog Kalye Radio:\n\n" +
      "**Step-by-step:**\n" +
      "1. Go to **hub.tunogkalye.net**\n" +
      "2. Click **\"Submit Your Music\"** on the homepage\n" +
      "3. Fill in your details:\n" +
      "   - Band/Artist name\n" +
      "   - Your real name\n" +
      "   - Email address\n" +
      "   - City/Location\n" +
      "   - Genre\n" +
      "4. Add your **Spotify** and/or **SoundCloud** links\n" +
      "5. Optionally add a personal message to our DJs\n" +
      "6. Hit **Submit**!\n\n" +
      "**What happens next:**\n" +
      "- Our real DJs (not algorithms!) review your submission within **1 week**\n" +
      "- If approved, you'll get an email: **\"Your song is on air RIGHT NOW!\"**\n" +
      "- Share that link with your fans — that's the **Kanto Growth Loop**!\n\n" +
      "🎵 You keep **100% of your copyrights** under our **Open Kanto Policy**.",
    followUp: "Would you like to know about setting up an artist profile to manage your music and merch?",
  },
  // ── Copyright & Open Kanto Policy ──
  {
    keywords: [
      "copyright", "rights", "own my music", "keep my rights",
      "open kanto", "ownership", "contract", "exclusive", "non-exclusive",
      "remove my song", "take down", "delete my music",
    ],
    category: "copyright",
    response:
      "This is one of the things we're most proud of! 🛡️\n\n" +
      "**Open Kanto Policy — Your Rights:**\n" +
      "- You retain **100% of your copyrights** — always\n" +
      "- We only request **non-exclusive digital broadcasting rights**\n" +
      "- You can **remove your music** at any time — no questions asked\n" +
      "- **No lock-in contracts** whatsoever\n" +
      "- You're free to sell, license, or distribute your music anywhere else\n\n" +
      "**What \"non-exclusive broadcasting\" means:**\n" +
      "- We can play your music on Tunog Kalye Radio\n" +
      "- But you can ALSO submit it to other radio stations, streaming platforms, or any other outlet\n" +
      "- We don't own your music — you do\n\n" +
      "This is our commitment to artists. Your music, your rights. Period.",
    followUp: "Would you like to know how to submit your music for airplay?",
  },
  // ── Merch Store (Buying) ──
  {
    keywords: [
      "merch", "store", "buy", "shop", "product", "t-shirt", "hoodie",
      "cap", "sticker", "browse", "catalog", "available products",
      "what do you sell", "price", "sizes", "color",
    ],
    category: "merch-buying",
    response:
      "Welcome to the Tunog Kalye merch store! 🛍️\n\n" +
      "**How to Browse & Buy:**\n" +
      "1. Go to **hub.tunogkalye.net/store**\n" +
      "2. Browse products from all our amazing Filipino indie artists\n" +
      "3. Use the **search bar** to find specific items\n" +
      "4. **Filter** by category: Apparel, Accessories, Music, Home, Stickers, Other\n" +
      "5. **Sort** by price (low↔high) or name (A↔Z)\n" +
      "6. Click any product for full details, photos, sizing, and artist info\n" +
      "7. Select your size & color, then click **\"Add to Cart\"**\n" +
      "8. Proceed to checkout — secure payment via **Stripe**\n\n" +
      "**Supporting Artists:**\n" +
      "- **90%** of every purchase goes directly to the artist\n" +
      "- **10%** goes to the **Kanto Fund** (distributed to top-charting artists quarterly)\n" +
      "- Every purchase supports Filipino indie music!",
    followUp: "Would you like to know about tracking your order after purchase?",
  },
  // ── Merch Setup (Selling - Artists) ──
  {
    keywords: [
      "sell merch", "add product", "create product", "set up merch",
      "list product", "my merch", "artist merch", "start selling",
      "fulfillment", "self delivery", "platform delivery", "shipping",
      "inventory", "stock",
    ],
    category: "merch-selling",
    response:
      "Setting up your merch is easy! Here's the full walkthrough: 🎸\n\n" +
      "**Adding a Product:**\n" +
      "1. Go to **Artist Dashboard → Products**\n" +
      "2. Click **\"Add Product\"**\n" +
      "3. Fill in:\n" +
      "   - **Product name** (e.g., \"TKR Logo Tee\")\n" +
      "   - **Description** (be detailed: material, fit, care instructions)\n" +
      "   - **Price** in Philippine Pesos (₱)\n" +
      "   - **Category** (Apparel, Accessories, Music, Home, Stickers, Other)\n" +
      "   - **Sizes** — check applicable sizes: XS, S, M, L, XL, XXL\n" +
      "   - **Colors** — add name + hex code for each color\n" +
      "   - **Images** — upload multiple high-quality photos\n" +
      "   - **Stock quantity** — how many units are available\n" +
      "4. Choose your **Fulfillment method:**\n" +
      "   - **Self-delivery**: You ship orders directly (full control over packaging & shipping)\n" +
      "   - **Platform delivery**: TKR handles shipping (hands-off for you)\n" +
      "5. Click **Save** — your product is live!\n\n" +
      "**Earnings:** You earn **90%** of every sale, auto-deposited via Stripe Connect.",
    followUp: "Would you like help setting up Stripe Connect for automatic payouts?",
  },
  // ── Kanto Fund ──
  {
    keywords: [
      "kanto fund", "fund", "revenue sharing", "quarterly", "pooled",
      "artist fund", "give back", "community fund",
    ],
    category: "kanto-fund",
    response:
      "The **Kanto Fund** is our transparent way of giving back to the community! 💰\n\n" +
      "**How it works:**\n" +
      "1. **Fans buy merch** on hub.tunogkalye.net\n" +
      "2. **90%** goes instantly to the artist via Stripe Connect\n" +
      "3. **10%** is pooled into the **Kanto Fund**\n" +
      "4. At the end of each **quarter** (March, June, September, December), the fund is distributed to **top-charting artists** based on airplay and engagement\n\n" +
      "**What artists use it for:**\n" +
      "- 🎙️ Recording sessions (studio time, mixing, mastering)\n" +
      "- 🎬 Music videos\n" +
      "- 🎤 Live gigs (venue rental, equipment, production)\n" +
      "- 🎸 New equipment and instruments\n\n" +
      "**Transparency:**\n" +
      "- Total fund collected published each quarter\n" +
      "- Number of artists supported\n" +
      "- Individual allocations shown\n" +
      "- Fund usage reports from artists\n\n" +
      "Every merch purchase you make strengthens this fund. Salamat sa musika! 🎶",
    followUp: "Would you like to know how to contribute to the Kanto Fund?",
  },
  // ── Sponsorships ──
  {
    keywords: [
      "sponsor", "advertise", "banner", "shoutout", "partner",
      "promote", "advertising", "business", "brand",
    ],
    category: "sponsorship",
    response:
      "Want to support Pinoy indie music and get your brand heard? 📢\n\n" +
      "**3 Sponsorship Tiers:**\n\n" +
      "🎸 **Shoutout — $50/month**\n" +
      "- On-air shoutouts during broadcasts\n" +
      "- Mentioned on TKR social media\n" +
      "- Logo on partner page\n\n" +
      "📺 **Banner — $100/month**\n" +
      "- Everything in Shoutout, PLUS:\n" +
      "- Website banner placement\n" +
      "- Increased on-air frequency\n\n" +
      "⭐ **Premium — $200/month**\n" +
      "- Everything in Banner, PLUS:\n" +
      "- Sponsored hour segments\n" +
      "- Priority placement\n" +
      "- Dedicated social media posts\n\n" +
      "**How to get started:**\n" +
      "Click **\"Sponsor My Station\"** on the homepage and fill out the sponsorship form.\n\n" +
      "Great ROI for local businesses targeting the Filipino community!",
    followUp: "Would you like to know more about our audience and reach?",
  },
  // ── Stripe & Payments ──
  {
    keywords: [
      "stripe", "payout", "payment", "earn", "money", "income",
      "get paid", "withdraw", "bank", "deposit", "commission",
      "how much do i get", "split", "percentage",
    ],
    category: "payments",
    response:
      "Great question about payments! 💳\n\n" +
      "**For Artists — How You Get Paid:**\n" +
      "- We use **Stripe Connect** for all payments\n" +
      "- Hub merch sales: You earn **90%**, deposited **automatically** — no manual requests\n" +
      "- External sales (Bandcamp, Spotify merch, etc.): **0% commission** — we take nothing\n" +
      "- Payout timeline: Typically **2-7 business days** after a sale\n" +
      "- View all transactions in your **Stripe Dashboard**\n\n" +
      "**Setting up Stripe Connect:**\n" +
      "1. Go to **Artist Dashboard → Stripe Connect**\n" +
      "2. Click **\"Connect with Stripe\"**\n" +
      "3. Complete Stripe's onboarding (business info, bank account)\n" +
      "4. Once verified, payouts begin automatically\n\n" +
      "**For Customers — How You Pay:**\n" +
      "- Secure checkout powered by **Stripe**\n" +
      "- Major credit/debit cards accepted\n" +
      "- All transactions encrypted and safe\n" +
      "- You'll receive an order confirmation via email",
    followUp: "Need help with Stripe Connect setup?",
  },
  // ── Donations & Support ──
  {
    keywords: [
      "donate", "donation", "support", "tip", "give", "contribute",
      "help the station", "keep running",
    ],
    category: "donations",
    response:
      "Thank you for wanting to support Tunog Kalye Radio! 🙏\n\n" +
      "**4 Donation Tiers:**\n\n" +
      "☕ **$5 — Coffee** — Fuel a DJ's shift\n" +
      "🎙️ **$20 — An Hour** — Fund an hour of broadcast\n" +
      "📡 **$50 — A Day** — Keep the station running for a full day\n" +
      "🏆 **$100 — Kanto Champion** — Become a recognized station champion!\n\n" +
      "**How to donate:**\n" +
      "Click **\"Support the Station\"** on the homepage and choose your tier.\n\n" +
      "**Where your money goes:**\n" +
      "- Server hosting & bandwidth\n" +
      "- Broadcast infrastructure\n" +
      "- Part goes to the **Kanto Fund** (supporting artists)\n\n" +
      "Every peso helps keep Filipino indie music on the air! 🎵",
  },
  // ── Registration & Account ──
  {
    keywords: [
      "register", "sign up", "create account", "join", "log in",
      "login", "password", "account", "sign in",
    ],
    category: "registration",
    response:
      "Joining Tunog Kalye Radio is easy and free! 🎉\n\n" +
      "**How to Register:**\n" +
      "1. Go to **hub.tunogkalye.net/auth/register**\n" +
      "2. Choose your role:\n" +
      "   - **Fan/Customer** — browse merch, buy products, write reviews\n" +
      "   - **Artist/Band** — submit music, sell merch, track earnings\n" +
      "3. Fill in: name, email, password\n" +
      "4. If artist: add your band name and city\n" +
      "5. Click **Create Account**!\n\n" +
      "**Quick Options:**\n" +
      "- Sign up with **Google** — one click\n" +
      "- Sign up with **Facebook** — one click\n\n" +
      "**What you get:**\n" +
      "- Fans: Cart, order tracking, reviews, donation history\n" +
      "- Artists: Full dashboard, merch management, earnings, Stripe Connect\n\n" +
      "Welcome to the Kanto! 🎵",
  },
  // ── Order Tracking ──
  {
    keywords: [
      "order", "track", "tracking", "shipping", "deliver", "delivery",
      "shipment", "when will i get", "where is my order", "package",
    ],
    category: "orders",
    response:
      "Here's everything about managing your orders: 📦\n\n" +
      "**Track Your Order:**\n" +
      "1. Log in at **hub.tunogkalye.net**\n" +
      "2. Go to **Dashboard → Orders**\n" +
      "3. Click on any order for full details and status\n\n" +
      "**Order Status Flow:**\n" +
      "⏳ **Pending** → Order placed, awaiting payment\n" +
      "✅ **Paid** → Payment confirmed\n" +
      "🔄 **Processing** → Artist is preparing your order\n" +
      "🚚 **Shipped** → On the way!\n" +
      "📦 **Delivered** — Order received\n\n" +
      "**Important Notes:**\n" +
      "- Orders from different artists may arrive separately (each artist handles their own shipping)\n" +
      "- For shipping questions, contact the artist directly through the order page\n" +
      "- For payment issues, reach out to TKR support",
    followUp: "Need help with a specific order? I can guide you to the right support channel.",
  },
  // ── Reviews ──
  {
    keywords: [
      "review", "rating", "feedback", "star", "how was it",
      "write review", "leave review",
    ],
    category: "reviews",
    response:
      "We love hearing from our community! ⭐\n\n" +
      "**Writing a Review:**\n" +
      "1. Go to any product page in the **Store**\n" +
      "2. If you've purchased the item, you'll see a review form\n" +
      "3. Rate **1-5 stars**\n" +
      "4. Write your honest thoughts about the product\n" +
      "5. Submit — it helps other fans discover great merch!\n\n" +
      "**For Artists:**\n" +
      "- You can view and respond to reviews in your **Artist Dashboard**\n" +
      "- Honest feedback helps you improve your products\n" +
      "- Engaging with reviewers builds fan loyalty\n\n" +
      "Every review strengthens the community! 🎶",
  },
  // ── About the Station ──
  {
    keywords: [
      "about", "who are you", "what is tunog kalye", "station",
      "radio", "opm", "filipino music", "indie music",
      "where are you", "location", "surrey",
    ],
    category: "about",
    response:
      "Kamusta! Let me tell you about Tunog Kalye Radio! 📻\n\n" +
      "**Tunog Kalye** literally means **\"street sound\"** in Tagalog — and that's exactly where we started.\n\n" +
      "**Who We Are:**\n" +
      "- 24/7 digital radio station for **Filipino independent music**\n" +
      "- Based in **Surrey, BC, Canada** 🇨🇦\n" +
      "- Broadcasting globally to the Filipino diaspora\n" +
      "- Music focus: **90s OPM Alt-Rock** + **modern Filipino indie**\n" +
      "- Real DJs — not algorithms — curate every show\n\n" +
      "**Our Mission:**\n" +
      "Democratize Filipino independent music by giving every artist a global stage. No gatekeepers, no middlemen — just music.\n\n" +
      "**What Makes Us Different:**\n" +
      "- 🛡️ **Open Kanto Policy**: Artists keep 100% of their copyrights\n" +
      "- 💰 **Zero Commission** on external sales\n" +
      "- 🎯 **Human-Curated**: Real DJs, not algorithms\n" +
      "- 🔄 **Kanto Growth Loop**: Play → notify → share → discover → grow\n" +
      "- 💚 **Kanto Fund**: Revenue shared back to artists\n\n" +
      "**Listen Live:** www.tunogkalye.net",
  },
  // ── Greetings ──
  {
    keywords: [
      "hello", "hi", "hey", "kamusta", "what's up", "howdy",
      "good morning", "good afternoon", "good evening", "yo",
      "mabuhay", "musta",
    ],
    category: "greeting",
    response:
      "Kamusta! 🎵 Welcome to Tunog Kalye Radio — your home for Filipino independent music!\n\n" +
      "I'm **KALYE Bot**, and I can help you with:\n\n" +
      "🎵 **For Artists:**\n" +
      "- Submit your music for airplay\n" +
      "- Set up and manage your merch store\n" +
      "- Track earnings & set up payouts\n" +
      "- Navigate your Artist Dashboard\n\n" +
      "🛍️ **For Fans:**\n" +
      "- Browse and buy merch from indie artists\n" +
      "- Track orders & write reviews\n" +
      "- Discover new Filipino indie music\n\n" +
      "📢 **For Everyone:**\n" +
      "- Sponsorships & partnerships\n" +
      "- Donations & the Kanto Fund\n" +
      "- Station info & listening\n\n" +
      "Use the tabs above (**General**, **For Artists**, **For Fans**) to get focused help. Or just ask me anything!",
  },
  // ── Marketing / Now Playing ──
  {
    keywords: [
      "marketing", "promote", "now playing", "social media", "share",
      "instagram", "facebook", "twitter", "card", "graphic",
      "promote my music", "get more listeners",
    ],
    category: "marketing",
    response:
      "Great thinking! Here's how to promote your music with TKR: 🚀\n\n" +
      "**\"Now Playing\" Social Card:**\n" +
      "- When your song airs on Tunog Kalye Radio, we email you a **shareable link**\n" +
      "- The link shows a branded **\"Now Playing\" card** with:\n" +
      "  - Your artist name & song title\n" +
      "  - Tunog Kalye Radio branding\n" +
      "  - A direct link to listen live\n" +
      "- Share it on Facebook, Instagram, Twitter — your fans can click and discover the station!\n\n" +
      "**Tips for Maximum Reach:**\n" +
      "1. Share immediately when you get the airplay notification\n" +
      "2. Tag Tunog Kalye Radio on social media\n" +
      "3. Ask friends and family to share too\n" +
      "4. The more shares = more new listeners = more discovery for ALL artists\n\n" +
      "This is the heart of the **Kanto Growth Loop** — every share benefits the whole community! 🎵",
  },
  // ── Troubleshooting ──
  {
    keywords: [
      "help", "problem", "issue", "error", "broken", "not working",
      "bug", "fix", "trouble", "can't", "doesn't work",
      "contact", "support", "reach out", "email",
    ],
    category: "troubleshooting",
    response:
      "I'm sorry to hear you're having trouble! 🙏 Let me help:\n\n" +
      "**Common Issues & Fixes:**\n\n" +
      "🔴 **Can't submit music?**\n" +
      "- Make sure you're registered and logged in\n" +
      "- Check that your Spotify/SoundCloud links are valid\n" +
      "- Try a different browser or clear your cache\n\n" +
      "🔴 **Payment not going through?**\n" +
      "- Check your card details\n" +
      "- Try a different payment method\n" +
      "- Contact your bank if the issue persists\n\n" +
      "🔴 **Not receiving airplay notifications?**\n" +
      "- Check your spam/junk folder\n" +
      "- Make sure your email is correct in your profile\n\n" +
      "🔴 **Stripe Connect issues?**\n" +
      "- Complete all required fields in Stripe's onboarding\n" +
      "- Verify your bank account details\n\n" +
      "**Still need help?**\n" +
      "- Reach out to the TKR team through the contact options on the website\n" +
      "- Message us on our Facebook page: facebook.com/tunogkalyeradio\n\n" +
      "We'll get it sorted for you!",
  },
  // ── Listening / Streaming ──
  {
    keywords: [
      "listen", "stream", "play", "tune in", "watch", "audio",
      "video channel", "live", "broadcast", "schedule",
      "what's playing",
    ],
    category: "listening",
    response:
      "Let's get you listening! 🎧\n\n" +
      "**Listen to the Radio:**\n" +
      "- 📻 Go to **www.tunogkalye.net** — the stream plays automatically!\n" +
      "- Also available on this hub (bottom player bar)\n\n" +
      "**Watch the Video Channel:**\n" +
      "- 📺 Go to **video.tunogkalye.net**\n\n" +
      "**What We Play:**\n" +
      "- 90s OPM Alt-Rock (the classics that shaped a generation!)\n" +
      "- Modern Filipino indie (lo-fi, bedroom pop, alternative, etc.)\n" +
      "- All curated by **real DJs** — no algorithms!\n" +
      "- 24/7, always streaming, worldwide\n\n" +
      "**Note:** We don't publish specific airplay schedules or song time slots — part of the magic is the surprise! But when YOUR song plays, we'll email you immediately so you can share it. 🎵",
  },
  // ── Commission / Fees ──
  {
    keywords: [
      "commission", "fee", "cost", "free", "charge", "how much",
      "subscription", "monthly fee", "hidden fee",
    ],
    category: "fees",
    response:
      "Great question — we believe in full transparency about fees! 💰\n\n" +
      "**For Artists:**\n" +
      "- Music submission: **FREE** ✅\n" +
      "- Artist account: **FREE** ✅\n" +
      "- Merch on external platforms: **0% commission** ✅\n" +
      "- Tips and donations to you: **0% commission** ✅\n" +
      "- Merch sold through hub.tunogkalye.net: **10% platform fee** (you keep 90%)\n" +
      "- No monthly fees, no hidden charges, no subscriptions\n\n" +
      "**The 10% hub commission funds:**\n" +
      "- Station operations (servers, bandwidth, infrastructure)\n" +
      "- The **Kanto Fund** (redistributed to top-charting artists)\n\n" +
      "**For Customers/Fans:**\n" +
      "- Browsing: **FREE**\n" +
      "- Account: **FREE**\n" +
      "- Only pay for products you purchase (artist-set prices)\n" +
      "- Donations are optional\n\n" +
      "No surprises. No fine print. That's the TKR way. 🎵",
  },
  // ── Thank You / Gratitude ──
  {
    keywords: [
      "thank", "thanks", "salamat", "appreciate", "awesome",
      "great", "cool", "nice", "perfect", "love it",
    ],
    category: "thanks",
    response:
      "Salamat! 🙏 You're welcome!\n\n" +
      "Is there anything else I can help you with? Whether it's about music submissions, the merch store, donations, sponsorships, or anything else about Tunog Kalye Radio — I'm here for you! 🎵\n\n" +
      "Remember to tell your friends about the station — every share helps Filipino indie music grow! 🚀",
  },
];

// ─── Build a smart fallback response ──────────────────────────
function getFallbackResponse(userMessage: string): { response: string; followUp?: string } {
  const lower = userMessage.toLowerCase();

  // Find the best matching response based on keyword score
  let bestMatch: (typeof FALLBACK_RESPONSES)[0] | null = null;
  let bestScore = 0;

  for (const item of FALLBACK_RESPONSES) {
    let score = 0;
    for (const kw of item.keywords) {
      if (lower.includes(kw)) {
        // Give higher score to longer keyword matches (more specific)
        score += kw.split(" ").length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch) {
    return { response: bestMatch.response, followUp: bestMatch.followUp };
  }

  // Generic fallback with helpful suggestions
  return {
    response:
      "Thanks for reaching out! 🎵\n\n" +
      "I'm not quite sure about that specific topic, but here's what I can help with:\n\n" +
      "🎵 **For Artists:**\n" +
      "- Submit your music for airplay on TKR\n" +
      "- Set up your merch store & manage products\n" +
      "- Stripe Connect setup & earnings tracking\n" +
      "- Marketing tools & social sharing\n\n" +
      "🛍️ **For Fans:**\n" +
      "- Browse & buy merch from indie artists\n" +
      "- Track orders & write reviews\n" +
      "- Donate & support the station\n\n" +
      "📢 **For Everyone:**\n" +
      "- Sponsorships & partnerships\n" +
      "- Kanto Fund & revenue sharing\n" +
      "- About the station & how to listen\n\n" +
      "Try asking about any of these topics, or contact the Tunog Kalye team directly for more specific inquiries!",
    followUp: undefined,
  };
}

// ─── Main POST Handler ──────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error:
            "You're sending messages too quickly. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages, context, sessionId } = body;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required and must not be empty." },
        { status: 400 }
      );
    }

    for (const msg of messages) {
      if (
        !msg.role ||
        !["user", "assistant"].includes(msg.role) ||
        !msg.content ||
        typeof msg.content !== "string"
      ) {
        return NextResponse.json(
          {
            error:
              "Each message must have a valid role (user/assistant) and content string.",
          },
          { status: 400 }
        );
      }
    }

    // Get last user message for fallback
    const lastUserMessage = [...messages]
      .reverse()
      .find((m: { role: string }) => m.role === "user")?.content || "";

    // Track conversation history for context
    const sid = sessionId || ip;
    const history = getHistory(sid);

    // Try AI SDK first
    try {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();

      // Build system prompt with optional context override
      let systemContent = SYSTEM_PROMPT;
      if (context && CONTEXT_OVERRIDES[context]) {
        systemContent += CONTEXT_OVERRIDES[context];
      }

      // Combine history + new messages for full context (limited to recent)
      const recentHistory = history.slice(-20); // last 20 messages for context
      const allMessages = [
        { role: "system", content: systemContent },
        ...recentHistory.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      const completion = await zai.chat.completions.create({
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 1500,
      });

      const assistantMessage =
        completion?.choices?.[0]?.message?.content ||
        completion?.message?.content;

      if (assistantMessage) {
        // Save to history
        messages.forEach((m: { role: string; content: string }) => {
          appendHistory(sid, m.role as "user" | "assistant", m.content);
        });
        appendHistory(sid, "assistant", assistantMessage);

        return NextResponse.json({ message: assistantMessage });
      }
    } catch (aiError) {
      console.error("AI SDK error, using fallback:", aiError);
    }

    // Fallback: keyword-based response
    const fallback = getFallbackResponse(lastUserMessage);

    // Save to history
    messages.forEach((m: { role: string; content: string }) => {
      appendHistory(sid, m.role as "user" | "assistant", m.content);
    });
    appendHistory(sid, "assistant", fallback.response);

    // Add follow-up suggestion if available
    const fullResponse = fallback.followUp
      ? fallback.response + "\n\n" + fallback.followUp
      : fallback.response;

    return NextResponse.json({ message: fullResponse });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
