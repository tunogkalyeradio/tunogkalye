---
Task ID: 1
Agent: Main Agent
Task: Add Sign In/Register/Sign Out to navbar, admin-configurable site settings, role-based dashboards

Work Log:
- Created SiteSetting Prisma model (key-value with label and group fields)
- Pushed schema to SQLite database with `bun run db:push`
- Created seed script and inserted 20 default site settings (general, sponsor, content groups)
- Created public API `/api/site-settings` returning all settings as key-value map
- Updated admin API `/api/admin/settings` to support PATCH with siteSettings object
- Built shared Navbar component at `src/components/navbar.tsx` with:
  - Sign In / Register buttons for unauthenticated users
  - User dropdown menu (avatar + name + role badge + dashboard link + sign out) for authenticated users
  - Role-based dashboard routing (ADMIN→/admin, ARTIST→/artist, CUSTOMER→/dashboard)
  - Mobile responsive hamburger menu
  - Desktop action icons (Submit, Sponsor, Donate, Store)
- Updated homepage `src/app/page.tsx` to use shared Navbar and fetch dynamic site settings
- Updated admin settings page `src/app/admin/settings/page.tsx` with:
  - Tabbed site settings editor (General, Sponsors & Partners, Content)
  - Each setting has editable input with label
  - Save button that PATCHes to admin API
  - "LIVE EDITABLE" badge to indicate real-time updates
- Updated login page with smart post-login redirect based on user role
- Ran `bunx prisma generate` to regenerate Prisma client
- Verified API returns correct data (20 settings)
- Verified homepage renders with Sign In/Register buttons in navbar

Stage Summary:
- Shared Navbar component created: `/home/z/my-project/src/components/navbar.tsx`
- Site settings API: `/home/z/my-project/src/app/api/site-settings/route.ts`
- Admin settings API updated: `/home/z/my-project/src/app/api/admin/settings/route.ts`
- Admin settings page updated: `/home/z/my-project/src/app/admin/settings/page.tsx`
- Homepage updated: `/home/z/my-project/src/app/page.tsx`
- Login page updated: `/home/z/my-project/src/app/auth/login/page.tsx`
- Prisma schema updated with SiteSetting model
- 20 default site settings seeded into database

---
Task ID: 2
Agent: Main Agent
Task: Dynamic sponsor banner for AzuraCast — admin can change restaurant/sponsor names without code changes

Work Log:
- Analyzed existing AzuraCast page at tunogkalye.net/public/tunog-kalye — found hardcoded `[Your Restaurant Name]` sponsor banner
- Added `sponsor_description_1/2/3` fields and `sponsor_enabled` toggle to seed data (prisma/seed-settings.ts)
- Created public API endpoint `/api/sponsor-widget` with CORS support for cross-origin AzuraCast requests
- Rewrote azuracast-custom-widget.html to be 100% dynamic — fetches sponsor data from Hub API
- Widget includes fallback: if API is unreachable, renders static banner without sponsors
- Seeded 24 default site settings to database (up from 20)

Stage Summary:
- New sponsor widget API: `/home/z/my-project/src/app/api/sponsor-widget/route.ts`
- Updated seed data: `/home/z/my-project/prisma/seed-settings.ts`
- Updated AzuraCast widget: `/home/z/my-project/download/azuracast-custom-widget.html`
- Admin can now manage sponsors at /admin/settings → "Sponsors & Partners" tab
- To deploy: paste new widget HTML into AzuraCast Station Pages → Custom HTML

---
Task ID: 3
Agent: Main Agent
Task: Fix admin login, registration, and KALYE Bot on production

Work Log:
- Diagnosed that production Turso database schema was out of sync (missing `provider` column, missing tables)
- Created `/api/setup/admin` endpoint with raw SQL for schema-safe admin account creation
- Fixed SQL syntax error in `/api/setup/route.ts` (Product foreign key quote typo)
- Added database migration support (non-destructive): adds missing columns + creates missing tables
- Added `provider` column to User table on Turso
- Created missing tables: KantoFundEntry, Tip, SiteSetting, Badge, UserBadge, DigitalPurchase
- Seeded 23 default site settings into production Turso database
- Created admin account: admin@tunogkalye.net / Tunog1990s! with ADMIN role on production
- Fixed KALYE Bot: rewrote `/api/chat/route.ts` with keyword-based fallback responses
  - Dynamic import of z-ai-web-dev-sdk (won't crash if unavailable)
  - 10 topic categories with detailed responses: music submission, merch, kanto fund, sponsor, stripe/payments, donations, registration, orders, reviews, greeting
  - Generic fallback for unrecognized topics
- Verified on production: admin login ✅, registration ✅, chat bot ✅

Stage Summary:
- Admin account created on production: admin@tunogkalye.net / Tunog1990s!
- Production database schema now fully in sync with Prisma schema
- Registration flow working on production
- KALYE Bot working with intelligent fallback responses
- Files modified: src/app/api/chat/route.ts, src/app/api/setup/admin/route.ts, src/app/api/setup/route.ts
