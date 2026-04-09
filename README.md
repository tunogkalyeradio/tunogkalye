# 🎵 Tunog Kalye Radio — Hub Platform

> **hub.tunogkalye.net** — The official community hub for Tunog Kalye Radio, a 24/7 Filipino indie music station broadcasting worldwide from Surrey BC, Canada.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-black)

---

## 📖 About

Tunog Kalye Radio is a grassroots Filipino indie music station built on the philosophy of **"Kanto"** — the street corner where raw talent meets community. Our hub platform serves as the central gateway for artists, fans, and sponsors to connect, support independent music, and shop artist merchandise.

### Core Principles

- **Open Kanto Policy** — Artists retain 100% of their copyright. We only ask for non-exclusive broadcast rights.
- **90/10 Revenue Split** — Artists earn 90% of every merch sale. Only 10% goes to the platform's Kanto Fund.
- **Zero Fees for Artists** — No listing fees, no monthly subscriptions, no hidden costs.
- **Community First** — Every purchase supports the artist directly and contributes to the Kanto Fund.

---

## 🏗️ Architecture

```
hub.tunogkalye.net (this repo — Vercel)
    ├── Marketing Funnels (Submit Music, Sponsor, Donate)
    ├── Merch Store (artist-sold products)
    ├── 3 Dashboards (Admin, Artist, Customer)
    ├── AI Chat Assistant (KALYE Bot)
    └── Content Pages (About, Kanto Fund, Terms, Privacy)

www.tunogkalye.net (AzuraCast — Oracle Cloud Free Tier)
    └── Live Radio Station (24/7 streaming)

video.tunogkalye.net (Dotcompal)
    └── Video Channel
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Server Components, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Database** | Prisma ORM + SQLite (dev) / Turso (production) |
| **Authentication** | NextAuth.js v4 (Credentials + JWT) |
| **Payments** | Stripe Connect (90/10 automatic split) |
| **AI Chat** | z-ai-web-dev-sdk (KALYE Bot) |
| **Email** | Resend |
| **Hosting** | Vercel (Free Tier) |
| **Radio** | AzuraCast on Oracle Cloud Free Tier |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/tunog-kalye-hub.git
cd tunog-kalye-hub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

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
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe (Phase 2 — payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_CLIENT_ID="ca_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (Phase 2 — notifications)
RESEND_API_KEY="re_..."

# Stream (AzuraCast)
NEXT_PUBLIC_STREAM_URL="https://www.tunogkalye.net/radio.mp3"
NEXT_PUBLIC_STATION_URL="https://www.tunogkalye.net"
NEXT_PUBLIC_EMBED_URL="https://www.tunogkalye.net/public/tunogkalye"
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Home — 3 funnels + hub landing
│   ├── layout.tsx                        # Root layout (AuthProvider + ChatWidget + LivePlayer)
│   ├── globals.css                       # Dark cinematic theme
│   ├── about/page.tsx                    # About Tunog Kalye Radio
│   ├── kanto-fund/page.tsx               # Kanto Fund explanation
│   ├── terms/page.tsx                    # Terms of Service
│   ├── privacy/page.tsx                  # Privacy Policy
│   │
│   ├── auth/
│   │   ├── login/page.tsx                # Sign in
│   │   ├── register/page.tsx             # Sign up (Fan or Artist)
│   │   └── error/page.tsx                # Auth error display
│   │
│   ├── store/                            # 🛒 Merch Store (public)
│   │   ├── page.tsx                      # Browse all products
│   │   ├── products/[id]/page.tsx        # Product detail
│   │   ├── artist/[id]/page.tsx          # Artist storefront
│   │   ├── checkout/page.tsx             # Checkout flow
│   │   └── checkout/success/page.tsx     # Order confirmation
│   │
│   ├── dashboard/                        # 👤 Customer/Fan Dashboard
│   │   ├── page.tsx                      # Overview + stats
│   │   ├── orders/page.tsx               # Order history
│   │   ├── orders/[id]/page.tsx          # Order detail + tracking
│   │   ├── cart/page.tsx                 # Shopping cart
│   │   ├── reviews/page.tsx              # My reviews
│   │   └── settings/page.tsx             # Profile + address
│   │
│   ├── artist/                           # 🎨 Artist/Musician Dashboard
│   │   ├── page.tsx                      # Overview + earnings chart
│   │   ├── products/page.tsx             # Manage products
│   │   ├── products/new/page.tsx         # Add product
│   │   ├── products/[id]/edit/page.tsx   # Edit product
│   │   ├── orders/page.tsx               # Manage orders + ship
│   │   ├── earnings/page.tsx             # Revenue analytics
│   │   ├── profile/page.tsx              # Artist profile editor
│   │   └── stripe/page.tsx               # Stripe Connect setup
│   │
│   ├── admin/                            # 🛡️ Admin Dashboard
│   │   ├── page.tsx                      # Platform overview
│   │   ├── artists/page.tsx              # Manage artists
│   │   ├── artists/[id]/page.tsx         # Artist detail
│   │   ├── products/page.tsx             # Manage products
│   │   ├── orders/page.tsx               # Manage orders
│   │   ├── orders/[id]/page.tsx          # Order detail
│   │   ├── revenue/page.tsx              # Revenue analytics
│   │   └── settings/page.tsx             # Platform settings
│   │
│   └── api/                              # 🔌 API Endpoints
│       ├── submit/route.ts               # Music submission
│       ├── sponsor/route.ts              # Sponsor inquiry
│       ├── donate/route.ts               # Donation
│       ├── chat/route.ts                 # KALYE Bot AI
│       ├── upload/route.ts               # Image upload
│       ├── cart/route.ts                 # Cart CRUD
│       ├── reviews/route.ts              # Reviews
│       ├── auth/[...nextauth]/route.ts   # NextAuth handler
│       ├── auth/register/route.ts        # Registration
│       ├── user/profile/route.ts         # User profile
│       ├── store/cart/route.ts           # Store cart
│       ├── store/cart/count/route.ts     # Cart count
│       ├── store/checkout/route.ts       # Place order
│       ├── artist/profile/route.ts       # Artist profile
│       ├── artist/products/route.ts      # Artist products CRUD
│       ├── artist/products/[id]/route.ts # Single product CRUD
│       ├── artist/orders/route.ts        # Artist orders
│       ├── stripe/connect/route.ts       # Stripe Connect onboarding
│       ├── stripe/connect/status/route.ts
│       ├── stripe/webhooks/route.ts      # Stripe webhooks
│       ├── admin/artists/[id]/verify/route.ts
│       ├── admin/products/[id]/toggle/route.ts
│       └── admin/orders/[id]/status/route.ts
│
├── components/
│   ├── auth-provider.tsx                 # SessionProvider wrapper
│   ├── chat-widget.tsx                   # KALYE Bot floating chat
│   ├── image-upload.tsx                  # Image upload component
│   ├── live-player-bar.tsx               # Sticky AzuraCast player
│   └── ui/                               # shadcn/ui components (30+)
│
├── hooks/
│   ├── use-toast.ts                      # Toast notifications
│   └── use-mobile.ts                     # Mobile detection
│
├── lib/
│   ├── prisma.ts                         # Prisma client singleton
│   ├── auth.ts                           # NextAuth configuration
│   ├── auth-utils.ts                     # Server-side auth helpers
│   ├── stripe.ts                         # Stripe server SDK
│   ├── stripe-client.ts                  # Stripe client utilities
│   ├── email.ts                          # Email templates (Resend)
│   ├── upload.ts                         # Upload configuration
│   ├── notify.ts                         # Notification helpers
│   ├── db.ts                             # Database utilities
│   ├── utils.ts                          # General utilities
│   └── stream.ts                         # AzuraCast stream config
│
├── middleware.ts                         # Route protection middleware
├── types/
│   └── next-auth.d.ts                    # NextAuth type extensions
│
prisma/
└── schema.prisma                         # Database schema (11 models)
```

---

## 📊 Database Schema

The platform uses **11 Prisma models** organized into 5 domains:

### Funnel Models
| Model | Purpose |
|-------|---------|
| `MusicSubmission` | Artist music submissions from the Submit funnel |
| `SponsorInquiry` | Business sponsorship inquiries |
| `Donation` | Fan/supporter donations across 4 tiers |

### Auth & Users
| Model | Purpose |
|-------|---------|
| `User` | Core user with role-based access (ADMIN, ARTIST, CUSTOMER) |
| `ArtistProfile` | Extended artist profile with Stripe Connect and social links |

### E-Commerce
| Model | Purpose |
|-------|---------|
| `Product` | Merch items with images, sizes, colors, stock, fulfillment mode |
| `Order` | Orders with automatic 90/10 revenue split tracking |
| `OrderItem` | Per-item tracking with artist/platform revenue breakdown |
| `Cart` | Shopping cart with size selection |

### Community
| Model | Purpose |
|-------|---------|
| `Review` | 1-5 star product reviews |
| `Notification` | In-app notifications (order, payment, shipment, system) |

---

## 🎯 Key Features

### Marketing Funnels (3)
- **Submit Your Music** — 3-step funnel: Landing → Form → Thank You with timeline
- **Sponsor the Station** — 5-step funnel: Landing → Stats → Pricing (3 tiers) → Form → Thank You
- **Super Fan / Donate** — 4-step funnel: Landing → Tier Selection (4 tiers) → Checkout → Thank You

### Merch Store
- Browse and filter products by category, artist, price
- Product detail pages with image gallery, size/color selectors
- Artist storefronts with profile and social links
- Cart management and checkout flow
- Revenue transparency: every product shows the 90/10 split

### Role-Based Dashboards
- **Customer Dashboard** — Order history, cart, reviews, settings
- **Artist Dashboard** — Product management, order fulfillment, earnings analytics, Stripe Connect setup
- **Admin Dashboard** — Platform-wide stats, artist verification, revenue analytics, Kanto Fund tracking

### AI Assistant
- **KALYE Bot** — Floating chat widget with 3 context modes (General, For Artists, For Fans)
- Taglish personality with station knowledge
- Suggested questions for quick guidance

### Live Radio Integration
- Sticky player bar streaming from AzuraCast
- "ON AIR" indicator
- Dismissible with session persistence

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
- **Admin artist verification** — artists must be approved before selling

---

## 💳 Payment Flow (Stripe Connect)

```
Customer purchases merch
        │
        ▼
Stripe PaymentIntent created (full amount)
        │
        ▼
Payment confirmed via webhook
        │
        ├── 90% → transferred to artist's Stripe Connect account
        │
        └── 10% → retained in platform account (Kanto Fund)
```

- Artists onboard via Stripe Connect (KYC verification)
- Automatic split payments — no manual payouts needed
- Artists can choose: **self-delivery** or **platform fulfillment** per product
- All transactions tracked with platform cut and artist cut per order item

---

## 🎨 Design System

### Theme
- **Dark cinematic** — Near-black backgrounds (`#0a0a0f`, `#12121a`)
- **Red/orange gradients** — Primary accent for CTAs and branding
- **Blue/purple accents** — Artist dashboard branding
- **Emerald/teal accents** — Kanto Fund and success states

### Typography
- Geist Sans / Geist Mono

### Components
- 30+ shadcn/ui components (Button, Card, Dialog, Table, Form, etc.)
- Custom components: ChatWidget, ImageUpload, LivePlayerBar

---

## 🚢 Deployment

### Vercel (Production)

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/your-org/tunog-kalye-hub.git
git push -u origin main

# 2. Connect to Vercel
# → Import repo at vercel.com/new
# → Set environment variables
# → Deploy

# 3. Configure custom domain
# → hub.tunogkalye.net → CNAME to cname.vercel-dns.com
```

### Production Database (Turso)

```bash
# Replace DATABASE_URL in Vercel env vars:
DATABASE_URL="libsql://tunog-kalye-hub-yourname.turso.io"
```

### AzuraCast Stream Configuration

Update these env vars to point to your AzuraCast instance:

```env
NEXT_PUBLIC_STREAM_URL="https://www.tunogkalye.net/radio.mp3"
NEXT_PUBLIC_STATION_URL="https://www.tunogkalye.net"
NEXT_PUBLIC_EMBED_URL="https://www.tunogkalye.net/public/tunogkalye"
```

---

## 📡 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/submit` | Submit music for airplay |
| POST | `/api/sponsor` | Send sponsorship inquiry |
| POST | `/api/donate` | Process donation |
| POST | `/api/chat` | Chat with KALYE Bot AI |
| GET | `/api/store/cart/count` | Get cart item count |

### Authenticated
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| GET | `/api/user/profile` | Get user profile |
| PATCH | `/api/user/profile` | Update profile |
| GET | `/api/cart` | Get cart items |
| POST | `/api/cart` | Add to cart |
| PATCH | `/api/cart` | Update cart item |
| DELETE | `/api/cart` | Remove cart item |
| POST | `/api/store/checkout` | Place order |
| POST | `/api/store/cart` | Store cart (add to cart) |
| GET | `/api/reviews` | Get user reviews |
| POST | `/api/reviews` | Submit review |

### Artist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/artist/profile` | Get artist profile |
| PATCH | `/api/artist/profile` | Update profile |
| GET | `/api/artist/products` | List artist products |
| POST | `/api/artist/products` | Create product |
| GET | `/api/artist/products/:id` | Get single product |
| PATCH | `/api/artist/products/:id` | Update product |
| DELETE | `/api/artist/products/:id` | Delete product |
| GET | `/api/artist/orders` | List artist orders |
| PATCH | `/api/artist/orders` | Mark item shipped |
| POST | `/api/stripe/connect` | Start Stripe Connect |
| GET | `/api/stripe/connect/status` | Check Stripe status |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/admin/artists/:id/verify` | Verify/unverify artist |
| PATCH | `/api/admin/products/:id/toggle` | Activate/deactivate product |
| PATCH | `/api/admin/orders/:id/status` | Update order status |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stripe/webhooks` | Stripe event handler |

---

## 🗺️ Route Map

### Public Pages
| Route | Description |
|-------|-------------|
| `/` | Home — Funnels + Hub Landing |
| `/about` | About Tunog Kalye Radio |
| `/kanto-fund` | Kanto Fund — Revenue Sharing |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |

### Store
| Route | Description |
|-------|-------------|
| `/store` | Browse all merch |
| `/store/products/:id` | Product detail |
| `/store/artist/:id` | Artist storefront |
| `/store/checkout` | Checkout flow |
| `/store/checkout/success` | Order confirmation |

### Auth
| Route | Description |
|-------|-------------|
| `/auth/login` | Sign in |
| `/auth/register` | Create account |
| `/auth/error` | Auth error display |

### Customer Dashboard (`/dashboard`)
| Route | Description |
|-------|-------------|
| `/dashboard` | Overview + stats |
| `/dashboard/orders` | Order history |
| `/dashboard/orders/:id` | Order detail |
| `/dashboard/cart` | Shopping cart |
| `/dashboard/reviews` | My reviews |
| `/dashboard/settings` | Profile + address |

### Artist Dashboard (`/artist`)
| Route | Description |
|-------|-------------|
| `/artist` | Overview + earnings |
| `/artist/products` | Manage products |
| `/artist/products/new` | Add product |
| `/artist/products/:id/edit` | Edit product |
| `/artist/orders` | Manage orders |
| `/artist/earnings` | Revenue analytics |
| `/artist/profile` | Edit profile |
| `/artist/stripe` | Stripe Connect setup |

### Admin Dashboard (`/admin`)
| Route | Description |
|-------|-------------|
| `/admin` | Platform overview |
| `/admin/artists` | Manage artists |
| `/admin/artists/:id` | Artist detail |
| `/admin/products` | Manage products |
| `/admin/orders` | Manage orders |
| `/admin/orders/:id` | Order detail |
| `/admin/revenue` | Revenue analytics |
| `/admin/settings` | Platform settings |

---

## 📝 Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database (dev only)
```

---

## 📄 License

Proprietary — Tunog Kalye Radio. All rights reserved.

---

## 🤝 Contributing

This is an internal project for Tunog Kalye Radio. For questions or collaboration inquiries, reach out through the [Sponsor funnel](https://hub.tunogkalye.net) or email us at [info@tunogkalye.net](mailto:info@tunogkalye.net).
