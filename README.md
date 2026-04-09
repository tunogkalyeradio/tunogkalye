# 🎵 Tunog Kalye Radio — Hub Platform

> **hub.tunogkalye.net** — The official multi-vendor marketplace and community hub for Tunog Kalye Radio, a 24/7 Filipino indie music station broadcasting worldwide from Surrey BC, Canada.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-black)
![Pages](https://img.shields.io/badge/Pages-48-green)
![API Routes](https://img.shields.io/badge/API_Routes-39-blue)
![DB Models](https://img.shields.io/badge/DB_Models-16-orange)

---

## 📖 About

Tunog Kalye Radio is a grassroots Filipino indie music station built on the philosophy of **"Kanto"** — the street corner where raw talent meets community. Our hub platform is a full **media ecosystem** that serves as the central gateway for artists, fans, and sponsors to connect, discover music, and buy merchandise — all while ensuring artists keep 100% of their earnings.

### Core Principles

- **Open Kanto Policy** — Artists retain 100% of their copyright. We only require a non-exclusive digital broadcasting right. No advance recoupment, no territorial restrictions, no minimum commitments.
- **Zero Commission on Artist Sales** — When a fan buys an artist's merch, the payment goes through Stripe Connect and routes directly to the artist's bank account. Tunog Kalye takes exactly ₱0 from artist transactions.
- **Station Revenue = Sponsorships Only** — The platform earns money solely through station sponsorships and TKR's own official merch. 10% of sponsorship revenue is allocated to the Kanto Fund, which is distributed quarterly to top-charting independent artists.
- **Community First** — Every dollar spent by fans goes directly to the creators. The platform acts as a free digital storefront, not a middleman.
- **FILSCAP Compliant** — We operate as a legal broadcast entity. Artist songs playing on our station generate performance royalties for them through FILSCAP — free promotion plus royalties.

### How 0% Commission Works

```
Fan buys a $25 shirt from an artist on the Hub
        │
        ▼
Stripe processes the payment (~$1 processing fee)
        │
        ▼
Stripe Connect instantly routes $24 to the ARTIST'S bank account
        │
        ▼
$0 touches Tunog Kalye's bank account for this transaction
```

We never pool artist money. There is no monthly payout cycle. There is no accounting nightmare. The money splits at the source.

---

## 🏗️ Architecture

```
hub.tunogkalye.net (this repo — Vercel)
    ├── Multi-Vendor Marketplace (Stripe Connect — 0% commission)
    │   ├── Artist Stores (Physical + Digital products)
    │   ├── Station Merch (TKR official — revenue goes to station)
    │   ├── Guest Checkout (no account required)
    │   ├── Direct Tips (100% to artist)
    │   └── Digital Vault (downloads for albums/digital purchases)
    ├── Engagement Pathways (Submit Music, Sponsor, Donate)
    ├── 3 Role-Based Dashboards (Admin, Artist, Customer)
    ├── AI Chat Assistant (KALYE Bot)
    ├── Notification System (in-app bell + pages)
    ├── Content Moderation (flag/takedown system)
    ├── Supporter Badges (gamification)
    └── Content Pages (About, Kanto Fund, Terms, Privacy)

www.tunogkalye.net (AzuraCast — Oracle Cloud Free Tier)
    └── Live Radio Station (24/7 streaming)

video.tunogkalye.net (Dotcompal)
    └── Video Channel (Kanto Sessions, live performances)
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Server Components, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui (52 components) |
| **Database** | Prisma ORM + SQLite (dev) / Turso libsql (production) |
| **Authentication** | NextAuth.js v4 (Credentials + JWT) |
| **Payments** | Stripe Connect (multi-vendor split — 0% commission to artists) |
| **AI Chat** | z-ai-web-dev-sdk (KALYE Bot) |
| **Email** | Resend (transactional emails) |
| **Image Upload** | Local storage (Cloudinary/R2 planned) |
| **Hosting** | Vercel (serverless) |
| **Radio** | AzuraCast on Oracle Cloud Free Tier |
| **DNS** | Cloudflare → Vercel (hub.tunogkalye.net) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Git
- A Stripe Connect account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/tunogkalyeradio/tunogkalye.git
cd tunogkalye

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (see below)

# Set up database
npx prisma db push
npx prisma generate

# Start development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
# Database
DATABASE_URL="file:./db/custom.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe Connect (multi-vendor payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_CLIENT_ID="ca_..."

# Production URL (for sitemap, SEO, email links)
NEXT_PUBLIC_BASE_URL="https://hub.tunogkalye.net"

# Email (Resend)
RESEND_API_KEY="re_..."

# Stream (AzuraCast)
NEXT_PUBLIC_STREAM_URL="https://www.tunogkalye.net/radio/8000/radio.mp3"
NEXT_PUBLIC_STATION_URL="https://www.tunogkalye.net"
NEXT_PUBLIC_EMBED_URL="https://www.tunogkalye.net/public/tunogkalye/embed"
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx                            # Home — 3 pathways + hub landing + FAQ (12 items)
│   ├── layout.tsx                          # Root layout (AuthProvider + ChatWidget + LivePlayer)
│   ├── globals.css                         # Dark cinematic theme
│   ├── sitemap.ts                          # Dynamic sitemap generator
│   ├── robots.ts                           # Dynamic robots.txt
│   ├── about/page.tsx                      # About Tunog Kalye Radio
│   ├── kanto-fund/page.tsx                 # Kanto Fund explanation
│   ├── terms/page.tsx                      # Terms of Service
│   ├── privacy/page.tsx                    # Privacy Policy
│   │
│   ├── auth/
│   │   ├── login/page.tsx                  # Sign in
│   │   ├── register/page.tsx               # Sign up (Fan or Artist)
│   │   └── error/page.tsx                  # Auth error display
│   │
│   ├── store/                              # 🛒 Multi-Vendor Merch Store (public)
│   │   ├── page.tsx                        # Browse products + station merch section
│   │   ├── store-utils.ts                  # Shared constants/types (client-safe)
│   │   ├── store-page-client.tsx           # Product grid, filters, cart UI
│   │   ├── products/[id]/page.tsx          # Product detail with reviews
│   │   ├── products/[id]/product-detail-client.tsx
│   │   ├── artist/[id]/page.tsx            # Artist storefront + tip module
│   │   ├── artist/[id]/artist-store-client.tsx
│   │   ├── checkout/page.tsx               # Checkout (supports guest + auth)
│   │   └── checkout/success/page.tsx       # Order confirmation
│   │
│   ├── dashboard/                          # 👤 Customer/Fan Dashboard
│   │   ├── layout.tsx                      # Auth-gated wrapper
│   │   ├── dashboard-shell.tsx             # Sidebar + header shell
│   │   ├── page.tsx                        # Overview + stats + "Now Playing" card
│   │   ├── orders/page.tsx                 # Order history (tab filters)
│   │   ├── orders/[id]/page.tsx            # Order detail + visual status bar
│   │   ├── cart/page.tsx                   # Shopping cart (qty, size, remove)
│   │   ├── downloads/page.tsx              # 📦 Digital Vault — purchased downloads
│   │   ├── reviews/page.tsx                # My reviews + write review dialog
│   │   ├── tip/page.tsx                    # 💰 Direct Tip — send tips to artists
│   │   ├── notifications/page.tsx          # 🔔 Notification center
│   │   └── settings/page.tsx               # Profile, avatar, address, badges
│   │
│   ├── artist/                             # 🎨 Artist/Musician Dashboard
│   │   ├── layout.tsx                      # ARTIST role-gated wrapper
│   │   ├── artist-shell.tsx                # Sidebar + header shell
│   │   ├── page.tsx                        # Overview + Radio-to-Revenue widget
│   │   ├── products/page.tsx               # Manage products (search/filter)
│   │   ├── products/new/page.tsx           # Add product
│   │   ├── products/[id]/edit/page.tsx     # Edit product
│   │   ├── products/product-form.tsx       # Shared form (physical/digital toggle)
│   │   ├── orders/page.tsx                 # Manage orders + mark shipped
│   │   ├── earnings/page.tsx               # Revenue analytics + monthly breakdown
│   │   ├── profile/page.tsx                # Band info, social links, image
│   │   ├── stripe/page.tsx                 # Stripe Connect onboarding (store-aware)
│   │   ├── marketing/page.tsx              # 📢 Marketing asset generator + promo card
│   │   └── notifications/page.tsx          # 🔔 Notification center
│   │
│   ├── admin/                              # 🛡️ Admin Dashboard (Station Owner)
│   │   ├── layout.tsx                      # ADMIN role-gated wrapper
│   │   ├── page.tsx                        # Platform overview + revenue chart
│   │   ├── artists/page.tsx                # Manage artists + verify/unverify
│   │   ├── artists/[id]/page.tsx           # Artist detail + stats
│   │   ├── store-approvals/page.tsx        # ✅ Artist store application queue
│   │   ├── station-merch/page.tsx          # 🎽 TKR official merch CRUD
│   │   ├── products/page.tsx               # Manage all products
│   │   ├── orders/page.tsx                 # Manage orders + status updates
│   │   ├── orders/[id]/page.tsx            # Order detail + revenue breakdown
│   │   ├── revenue/page.tsx                # Revenue analytics + monthly chart
│   │   ├── payouts/page.tsx                # 💳 Stripe Connect routing oversight
│   │   ├── kanto-fund/page.tsx             # ❤️ Kanto Fund tracker + entry log
│   │   ├── moderation/page.tsx             # 🚩 Content moderation (flag/takedown)
│   │   ├── analytics/page.tsx              # 📊 Platform-wide analytics dashboard
│   │   ├── submissions/page.tsx            # 📨 Music/Sponsor/Donation submissions
│   │   ├── notifications/page.tsx          # 🔔 Notification center
│   │   └── settings/page.tsx               # Editable admin settings
│   │
│   └── api/                                # 🔌 API Endpoints (39 routes)
│       ├── auth/
│       │   ├── [...nextauth]/route.ts      # NextAuth handler
│       │   └── register/route.ts           # User registration
│       ├── submit/route.ts                 # Music submission pathway
│       ├── sponsor/route.ts                # Sponsor inquiry pathway
│       ├── donate/route.ts                 # Donation pathway
│       ├── chat/route.ts                   # KALYE Bot AI assistant
│       ├── upload/route.ts                 # Image/file upload
│       ├── cart/route.ts                   # Authenticated cart CRUD
│       ├── reviews/route.ts                # Product reviews
│       ├── notifications/
│       │   ├── route.ts                    # Get user notifications
│       │   └── [id]/read/route.ts          # Mark notification(s) read
│       ├── tip/
│       │   ├── route.ts                    # Send tip to artist
│       │   └── sent/route.ts               # Get user's tip history
│       ├── store/
│       │   ├── cart/route.ts               # Guest + auth cart (sessionId support)
│       │   ├── cart/count/route.ts         # Cart item count badge
│       │   └── checkout/route.ts           # Place order (guest + auth)
│       ├── artist/
│       │   ├── profile/route.ts            # Artist profile CRUD
│       │   ├── products/route.ts           # Artist products CRUD
│       │   ├── products/[id]/route.ts      # Single product CRUD
│       │   └── orders/route.ts             # Artist orders + mark shipped
│       ├── user/
│       │   ├── profile/route.ts            # User profile + avatar
│       │   └── badges/route.ts             # User badges + digital purchases
│       ├── stripe/
│       │   ├── connect/route.ts            # Stripe Connect onboarding
│       │   ├── connect/status/route.ts     # Check Stripe Connect status
│       │   └── webhooks/route.ts           # Stripe webhook handler
│       └── admin/
│           ├── artists/[id]/verify/route.ts
│           ├── products/[id]/toggle/route.ts
│           ├── orders/[id]/status/route.ts
│           ├── store-approvals/
│           │   ├── route.ts                # GET artists by store status
│           │   └── [id]/route.ts           # PATCH approve/reject store
│           ├── station-merch/
│           │   ├── route.ts                # GET/POST station merch
│           │   └── [id]/route.ts           # GET/PATCH/DELETE single product
│           ├── kanto-fund/route.ts         # GET/POST fund entries
│           ├── moderation/
│           │   ├── route.ts                # GET flagged + POST flag product
│           │   └── [id]/route.ts           # PATCH unflag/takedown/dismiss
│           ├── submissions/
│           │   ├── route.ts                # GET submissions (music/sponsor/donation)
│           │   └── [id]/status/route.ts    # PATCH update submission status
│           └── settings/route.ts           # GET/PATCH admin settings
│
├── components/
│   ├── auth-provider.tsx                   # SessionProvider wrapper
│   ├── chat-widget.tsx                     # KALYE Bot floating chat
│   ├── notification-bell.tsx               # 🔔 Bell icon with unread badge + dropdown
│   ├── image-upload.tsx                    # Image upload component
│   └── ui/                                # 52 shadcn/ui components
│
├── lib/
│   ├── db.ts                               # Prisma client singleton
│   ├── auth.ts                             # NextAuth configuration
│   ├── auth-utils.ts                       # Server-side auth helpers (requireAuth, requireRole)
│   ├── stripe.ts                           # Stripe server SDK
│   ├── stripe-client.ts                    # Stripe client utilities
│   ├── email.ts                            # Email templates (Resend)
│   ├── upload.ts                           # Upload configuration
│   ├── notify.ts                           # Notification creation + email dispatch
│   ├── utils.ts                            # General utilities (cn, etc.)
│
├── middleware.ts                            # Route protection middleware
├── types/
│   └── next-auth.d.ts                      # NextAuth type extensions
│
prisma/
└── schema.prisma                            # Database schema (16 models, 8 enums)
```

---

## 📊 Database Schema

The platform uses **16 Prisma models** organized into 7 domains with **8 enums**:

### Enums
| Enum | Values |
|------|--------|
| `UserRole` | `ADMIN`, `ARTIST`, `CUSTOMER` |
| `StoreStatus` | `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED` |
| `ProductType` | `PHYSICAL`, `DIGITAL` |
| `FulfillmentMode` | `ARTIST_SELF_DELIVERY`, `PLATFORM_DELIVERY` |
| `OrderStatus` | `PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| `OrderItemStatus` | `PENDING`, `SHIPPED`, `DELIVERED` |
| `NotificationType` | `ORDER`, `PAYMENT`, `SHIPMENT`, `SYSTEM` |
| `BadgeType` | `FIRST_PURCHASE`, `KANTO_CHAMPION`, `EARLY_SUPPORTER`, `TOP_SUPPORTER`, `SUBSCRIBER` |

### Pathway Models (Community Engagement)
| Model | Purpose |
|-------|---------|
| `MusicSubmission` | Artist music submissions with status tracking (pending → reviewed → approved/rejected) |
| `SponsorInquiry` | Business sponsorship inquiries with plan tier |
| `Donation` | Fan/supporter donations across multiple tiers |
| `KantoFundEntry` | Manual log of fund allocations (source, amount, quarter) |

### Auth & Users
| Model | Purpose |
|-------|---------|
| `User` | Core user with role-based access, avatar, shipping address |
| `ArtistProfile` | Extended artist profile with Stripe Connect, store status (`PENDING`→`APPROVED`), social links, cached sales/airplay stats |

### Multi-Vendor Marketplace
| Model | Purpose |
|-------|---------|
| `Product` | Merch items supporting physical + digital, station merch flag, content moderation flags, download URLs |
| `Order` | Orders supporting guest checkout (`customerId` optional), `guestEmail`/`guestName` |
| `OrderItem` | Per-item tracking with `isStationMerch` and `isDigital` flags |
| `Cart` | Session-based cart supporting both authenticated and guest users (`sessionId`) |

### Community & Gamification
| Model | Purpose |
|-------|---------|
| `Review` | 1–5 star product reviews with comments |
| `Notification` | In-app notifications with type filtering and read status |
| `DigitalPurchase` | Download vault entries with access codes, download limits, expiration |
| `Tip` | Direct artist support payments (100% via Stripe Connect) |
| `Badge` | Gamification badge definitions (First Purchase, Kanto Champion, etc.) |
| `UserBadge` | Earned badges per user with timestamp |

---

## 🎯 Key Features

### Engagement Pathways (3)
- **Submit Your Music** — 3-step pathway: Landing → Form → Thank You with "What Happens Next" timeline
- **Sponsor the Station** — 5-step pathway: Landing → Station Stats → Pricing (3 tiers) → Form → Thank You
- **Support the Kanto (Donate)** — 4-step pathway: Landing → Tier Selection → Checkout → Thank You

### Multi-Vendor Merch Store
- **Unified Cart** — Fan can put artist merch + station merch in the same cart, pay once, money splits automatically
- **Physical + Digital Products** — Artists sell shirts, hoodies, stickers AND digital albums, EPs, PDFs
- **Guest Checkout** — No account required to purchase (email + name only)
- **Product Type Badges** — Visual indicators: Digital (purple), Physical (blue), Official TKR (red)
- **Station Merch Section** — TKR's own official merch displayed prominently at top of store
- **Direct Tip Module** — "Just want to support? Tip them $5" button on every artist storefront (100% to artist)
- **Revenue Transparency** — "100% to artist. Zero commission." displayed throughout the store
- **Digital Vault** — Purchased digital items live forever in the customer's downloads page
- **Artist Storefronts** — Individual pages per artist with profile, social links, and product grid

### Role-Based Dashboards

#### 🛡️ Admin Dashboard (Station Owner View)
| Page | Purpose |
|------|---------|
| Dashboard | Platform overview — revenue, orders, artists, products, customers |
| Store Approvals | Review and approve/reject artist store applications |
| Station Merch | Full CRUD for TKR's own official merchandise |
| Artists | Manage artists — verify, view details, track stats |
| Products | Manage all products — toggle active, search, filter |
| Orders | Manage all orders — status updates, tracking |
| Revenue | Revenue analytics — monthly chart, per-artist breakdown |
| Payouts | Stripe Connect routing oversight — verify all artists are configured |
| Kanto Fund | Manual entry tracker — quarterly history, source breakdown, bar chart |
| Moderation | Content moderation — flag, take down, or dismiss products |
| Analytics | Platform-wide God View — sales trends, top artists/products, conversions |
| Submissions | Music submissions, sponsor inquiries, donation history |
| Notifications | Notification center |
| Settings | Editable admin profile and password |

#### 🎨 Artist Dashboard (Kanto Creator View)
| Page | Purpose |
|------|---------|
| Overview | Stats + Radio-to-Revenue widget (airplays, views, sales) + store status badge |
| My Merch | Product grid with search/filter, active toggle, delete |
| Add/Edit Product | Physical/Digital toggle, image upload, pricing, inventory |
| Orders | Order management with "Mark Shipped" and tracking input |
| Earnings | Revenue analytics — monthly breakdown, per-product ranking |
| Profile | Band info, genre, city, bio, social links, profile image |
| Marketing | 1-click promo card generator + copyable store link (3 gradient styles) |
| Stripe Setup | Store-status-aware onboarding with "$25 → $24 to you → $0 to TKR" visual |
| Notifications | Notification center |

#### 👤 Customer Dashboard (Kanto Supporter View)
| Page | Purpose |
|------|---------|
| Overview | Stats + "Now Playing" radio card + quick actions |
| My Orders | Tab-filtered order history with status badges |
| Order Detail | Visual status progress bar + tracking number |
| My Cart | Cart with quantity controls, size selector, order summary |
| Downloads | Digital Vault — purchased albums/files with download buttons |
| My Reviews | Written reviews + "Write Review" dialog |
| Support Artists | Direct tip module — browse artists, send tips with messages |
| Notifications | Notification center |
| Settings | Profile, avatar upload, shipping address, password, supporter badges |

### Supporter Badges (Gamification)
| Badge | Icon | How to Earn |
|-------|------|------------|
| First Purchase | 🛒 | Make your first purchase |
| Kanto Champion | 🏆 | Make 5+ purchases |
| Early Supporter | ⭐ | Register in the first 3 months |
| Top Supporter | 💎 | Spend ₱5,000+ total |
| Subscriber | 📻 | Subscribe to newsletter |

### AI Assistant
- **KALYE Bot** — Floating chat widget with 3 context modes (General, For Artists, For Fans)
- Taglish personality with deep station knowledge
- Suggested questions for quick guidance
- Answers questions about submissions, sponsorships, merch, and the Kanto Fund

### Live Radio Integration
- Sticky player bar streaming from AzuraCast
- "ON AIR" pulsing indicator
- Play/Pause + Mute controls
- "Full Station" link to www.tunogkalye.net
- Dismissible with session persistence

### Notification System
- 🔔 Bell icon with unread count badge in all 3 dashboard headers
- Dropdown with recent notifications (last 10)
- "Mark all as read" button
- Dedicated notification pages per dashboard with type filters
- Auto-generated on order, payment, shipment, and system events

---

## 🔐 Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────┐
│                     Middleware (JWT)                        │
├──────────────┬──────────────────┬───────────────────────────┤
│  /admin/*    │  /artist/*       │  /dashboard/*             │
│  ADMIN only  │  ARTIST only     │  Any authenticated user   │
└──────────────┴──────────────────┴───────────────────────────┘
```

- **Registration** with role selection (Fan/Customer or Artist/Band)
- **JWT-based sessions** with role injection
- **Server-side route protection** via `requireAuth()` and `requireRole()`
- **Multi-step artist onboarding** — register → admin approves store → connect Stripe → start selling
- **Guest access** — browse store, add to cart, checkout without an account

---

## 💳 Payment Architecture (Stripe Connect)

```
Fan adds items to cart (artist merch + station merch)
        │
        ▼
Checkout: Single payment for all items
        │
        ▼
Stripe PaymentIntent created with transfer_data
        │
        ├── Artist merch items → Transfer to artist's Connected Account
        │                          (100% minus Stripe processing fee)
        │
        └── Station merch items → Remains in platform account
                                   (revenue for Tunog Kalye Radio)
        │
        ▼
Direct Tips → 100% to artist's Connected Account
```

### Key Design Decisions
- **No money pooling** — Artist funds never touch Tunog Kalye's bank account
- **Instant routing** — Stripe Connect splits at checkout, not at payout time
- **Zero platform commission on artist sales** — The platform earns solely from station sponsorships and official TKR merch
- **Two fulfillment modes** — Artists choose per product: self-delivery or platform fulfillment
- **Guest checkout supported** — Lower friction, higher conversion

---

## 🎨 Design System

### Theme
- **Dark cinematic** — Near-black backgrounds (`#0a0a0f`, `#12121a`, `#0d0d14`)
- **Red/orange gradients** — Primary accent for CTAs and brand identity
- **Blue/purple accents** — Artist dashboard branding
- **Amber/yellow accents** — Tips and supporter features
- **Emerald/teal accents** — Kanto Fund and success states

### Typography
- Geist Sans / Geist Mono

### Components
- 52 shadcn/ui components (Button, Card, Dialog, Table, Form, Tabs, Badge, etc.)
- Custom components: ChatWidget, NotificationBell, ImageUpload, LivePlayerBar

---

## 🚢 Deployment

### Vercel (Production)

```bash
# 1. Deploy via Vercel CLI
npx vercel --prod

# 2. Or push to GitHub and connect at vercel.com/new
git push origin main

# 3. Set environment variables in Vercel dashboard:
# - DATABASE_URL (Turso libsql URL)
# - NEXTAUTH_SECRET
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# - NEXT_PUBLIC_BASE_URL=https://hub.tunogkalye.net
# - RESEND_API_KEY
```

### Custom Domain (Cloudflare → Vercel)

```
hub.tunogkalye.net  →  CNAME  →  cname.vercel-dns.com
```

### Production Database (Turso)

The platform uses Turso (distributed SQLite) for production. Set the `DATABASE_URL` in Vercel to your Turso connection string:

```bash
# Via Vercel CLI
echo "libsql://your-db.turso.io?authToken=your-token" | npx vercel env add DATABASE_URL production
```

### AzuraCast Stream Configuration

```env
NEXT_PUBLIC_STREAM_URL="https://www.tunogkalye.net/radio/8000/radio.mp3"
NEXT_PUBLIC_STATION_URL="https://www.tunogkalye.net"
NEXT_PUBLIC_EMBED_URL="https://www.tunogkalye.net/public/tunogkalye/embed"
```

---

## 🗺️ Full Route Map

### Public Pages (7)
| Route | Description |
|-------|-------------|
| `/` | Home — 3 Engagement Pathways + Hub Landing + FAQ (12 items) |
| `/about` | About Tunog Kalye Radio |
| `/kanto-fund` | Kanto Fund — Transparent Revenue Sharing |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/sitemap.xml` | Dynamic sitemap (auto-generated) |
| `/robots.txt` | Dynamic robots.txt (blocks /api/, /admin/) |

### Store (5)
| Route | Description |
|-------|-------------|
| `/store` | Browse merch + Official TKR Merch section |
| `/store/products/:id` | Product detail with reviews + type badges |
| `/store/artist/:id` | Artist storefront + tip module |
| `/store/checkout` | Checkout (guest + authenticated) |
| `/store/checkout/success` | Order confirmation |

### Auth (3)
| Route | Description |
|-------|-------------|
| `/auth/login` | Sign in |
| `/auth/register` | Create account (Fan or Artist) |
| `/auth/error` | Auth error display |

### Customer Dashboard — `/dashboard` (8)
| Route | Description |
|-------|-------------|
| `/dashboard` | Overview + stats + Now Playing |
| `/dashboard/orders` | Order history (tab filters) |
| `/dashboard/orders/:id` | Order detail + status tracker |
| `/dashboard/cart` | Shopping cart |
| `/dashboard/downloads` | Digital Vault (purchased files) |
| `/dashboard/tip` | Direct Tips to artists |
| `/dashboard/reviews` | My reviews + write review |
| `/dashboard/settings` | Profile, avatar, badges |
| `/dashboard/notifications` | Notification center |

### Artist Dashboard — `/artist` (9)
| Route | Description |
|-------|-------------|
| `/artist` | Overview + Radio-to-Revenue widget |
| `/artist/products` | Manage products |
| `/artist/products/new` | Add product (physical/digital) |
| `/artist/products/:id/edit` | Edit product |
| `/artist/orders` | Manage orders + ship |
| `/artist/earnings` | Revenue analytics |
| `/artist/profile` | Edit band profile |
| `/artist/stripe` | Stripe Connect setup |
| `/artist/marketing` | Promo card generator |
| `/artist/notifications` | Notification center |

### Admin Dashboard — `/admin` (14)
| Route | Description |
|-------|-------------|
| `/admin` | Platform overview + revenue chart |
| `/admin/store-approvals` | Artist store application queue |
| `/admin/station-merch` | TKR official merch CRUD |
| `/admin/artists` | Manage artists + verify |
| `/admin/artists/:id` | Artist detail |
| `/admin/products` | Manage all products |
| `/admin/orders` | Manage orders |
| `/admin/orders/:id` | Order detail |
| `/admin/revenue` | Revenue analytics |
| `/admin/payouts` | Stripe Connect oversight |
| `/admin/kanto-fund` | Fund tracker + quarterly history |
| `/admin/moderation` | Content moderation |
| `/admin/analytics` | Platform-wide God View |
| `/admin/submissions` | Music/Sponsor/Donation submissions |
| `/admin/notifications` | Notification center |
| `/admin/settings` | Admin settings (editable) |

---

## 📡 API Endpoints (39)

### Public (5)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/submit` | Submit music for airplay |
| POST | `/api/sponsor` | Send sponsorship inquiry |
| POST | `/api/donate` | Process donation |
| POST | `/api/chat` | Chat with KALYE Bot AI |
| GET | `/api/store/cart/count` | Get cart item count (badge) |

### Auth & User (7)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account (Fan or Artist) |
| GET | `/api/user/profile` | Get user profile |
| PATCH | `/api/user/profile` | Update profile + avatar |
| GET | `/api/user/badges` | Get earned badges + digital purchases |
| GET | `/api/notifications` | Get user notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification(s) read |
| GET | `/api/reviews` | Get user reviews |
| POST | `/api/reviews` | Submit review |

### Cart & Checkout (5)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/store/cart` | Get cart (guest via sessionId, auth via userId) |
| POST | `/api/store/cart` | Add to cart |
| PATCH | `/api/store/cart` | Update cart item |
| DELETE | `/api/store/cart` | Remove cart item |
| POST | `/api/store/checkout` | Place order (guest + auth) |

### Tips (2)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tip` | Send tip to artist (100% via Stripe) |
| GET | `/api/tip/sent` | Get user's tip history |

### Artist (6)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/artist/profile` | Get artist profile |
| PATCH | `/api/artist/profile` | Update profile |
| GET/POST | `/api/artist/products` | List/Create artist products |
| GET/PATCH/DELETE | `/api/artist/products/:id` | Single product CRUD |
| GET/PATCH | `/api/artist/orders` | List artist orders + mark shipped |
| POST | `/api/stripe/connect` | Start Stripe Connect onboarding |
| GET | `/api/stripe/connect/status` | Check Stripe Connect status |

### Admin (13)
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/admin/artists/:id/verify` | Verify/unverify artist |
| PATCH | `/api/admin/products/:id/toggle` | Activate/deactivate product |
| PATCH | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/store-approvals` | Get artists by store status |
| PATCH | `/api/admin/store-approvals/:id` | Approve/reject store application |
| GET/POST | `/api/admin/station-merch` | List/Create station merch |
| GET/PATCH/DELETE | `/api/admin/station-merch/:id` | Single station product CRUD |
| GET/POST | `/api/admin/kanto-fund` | Get/Create fund entries |
| GET/POST | `/api/admin/moderation` | Get flagged products / Flag product |
| PATCH | `/api/admin/moderation/:id` | Unflag/Takedown/Dismiss |
| GET | `/api/admin/submissions` | Get submissions (music/sponsor/donation) |
| PATCH | `/api/admin/submissions/:id/status` | Update submission status |
| GET/PATCH | `/api/admin/settings` | Get/Update admin settings |

### Webhooks (1)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stripe/webhooks` | Stripe event handler |

---

## 📝 Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## 📄 License

Proprietary — Tunog Kalye Radio. All rights reserved.

---

## 🤝 Contributing

This is an internal project for Tunog Kalye Radio. For questions or collaboration inquiries, reach out through the [Sponsor pathway](https://hub.tunogkalye.net) or email us at [hello@tunogkalye.net](mailto:hello@tunogkalye.net).
