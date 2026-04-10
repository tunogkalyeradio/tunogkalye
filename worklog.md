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
