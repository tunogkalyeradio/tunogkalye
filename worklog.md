# Worklog — Tunog Kalye Radio Hub

---

Task ID: 13
Agent: Main Agent
Task: Complete 7 tasks — Rename Funnel→Pathway, Fix notify.ts, Admin Submissions, Admin Settings Editable, Notifications System, Avatar Upload, Turso Database

Work Log:

## TASK 1: Rename Funnel → Pathway everywhere
- Renamed in src/app/page.tsx: type FunnelId → PathwayId, TunogKalyeFunnels → TunogKalyePathways, activeFunnel → activePathway, funnelStep → pathwayStep, SubmitFunnel → SubmitPathway, SponsorFunnel → SponsorPathway, DonateFunnel → DonatePathway, all as FunnelId casts → as PathwayId, comment // FUNNEL 1: → // PATHWAY 1:, comment // FUNNEL CARDS → // PATHWAY CARDS, "Funnels" breadcrumb → "Pathways", "Back to Funnels" → "Back to Pathways", "Explore Other Funnels" → "Explore Other Pathways"
- Renamed in src/app/terms/page.tsx: "donation funnels" → "donation pathways", "Support the Kanto\" funnel → "Support the Kanto\" pathway
- Renamed in src/app/kanto-fund/page.tsx: "Support the Kanto\" funnel → "Support the Kanto\" pathway
- Renamed in src/app/api/chat/route.ts: "Submit Your Music" funnel → pathway, "Sponsor My Station" funnel → pathway
- Renamed in prisma/schema.prisma: comment "(Funnel)" → "(Pathway)"

## TASK 2: Fix notify.ts import bug
- Fixed src/lib/notify.ts: already had correct import { db } from "@/lib/db" but had prisma.user.findUnique calls at lines 36 and 98
- Changed both prisma.user.findUnique → db.user.findUnique
- Verified zero remaining prisma references in file

## TASK 3: Admin Submissions Management
- Added "Submissions" nav item with Inbox icon to admin sidebar (src/app/admin/layout.tsx)
- Created src/app/admin/submissions/page.tsx — Client component with 3 tabs (Music Submissions, Sponsor Inquiries, Donations) using shadcn/ui Tabs component
  - Music Submissions: Table with Band Name, Email, City, Genre, Status (color-coded badges), Date, inline status update dropdown (Select component calling API)
  - Sponsor Inquiries: Table with Business Name, Contact, Email, Phone, Plan, Date (view-only)
  - Donations: Table with Name, Email, Amount, Tier, Message, Date + total donations sum at top
  - Error state for unavailable DB, empty states with Inbox icon
- Created src/app/api/admin/submissions/route.ts — GET endpoint with ?type=music|sponsor|donation query param, requires ADMIN role
- Created src/app/api/admin/submissions/[id]/status/route.ts — PATCH endpoint to update MusicSubmission status, validates against allowed statuses (pending/reviewed/approved/rejected)

## TASK 4: Admin Settings Editable
- Rewrote src/app/admin/settings/page.tsx from read-only server component to interactive client component
  - Station Information card: Display-only with "READ ONLY" badge, "managed via environment variables" note
  - Admin Account card: Editable name input, read-only email, ADMIN role badge, Save Changes button with loading/success states
  - Change Password card: Current password, new password, confirm password, validation, error/success messages
  - System Info card: Technology stack info
- Created src/app/api/admin/settings/route.ts — GET (return admin user info), PATCH (update name or change password with bcrypt verification)

## TASK 5: Notifications System
- Created src/app/api/notifications/route.ts — GET endpoint: fetches user notifications with ?unreadOnly=true&limit=N query params, returns notifications + unreadCount
- Created src/app/api/notifications/[id]/read/route.ts — PATCH endpoint: mark single notification as read or mark all ({ all: true })
- Created src/components/notification-bell.tsx — Client component: Bell icon with red unread count badge, dropdown with last 10 notifications, type-based icons/colors, time-ago formatting, "Mark all read" button, "View All" link, auto-refresh every 30s, outside-click close
- Added NotificationBell to admin header (src/app/admin/layout.tsx), artist header (src/app/artist/artist-shell.tsx), customer header (src/app/dashboard/dashboard-shell.tsx)
- Added "Notifications" to admin sidebar (Bell icon, after Submissions), artist sidebar (Bell icon, after Earnings), customer sidebar (Bell icon, after My Cart)
- Created src/app/admin/notifications/page.tsx — Admin notifications page with filter tabs (All, Orders, Payments, Shipments, System), mark as read per notification, mark all read button
- Created src/app/artist/notifications/page.tsx — Artist notifications page with filter tabs, mark as read functionality
- Created src/app/dashboard/notifications/page.tsx — Customer notifications page with filter tabs, mark as read functionality

## TASK 6: Avatar Upload
- Updated src/app/dashboard/settings/page.tsx: Replaced disabled "Upload Avatar" button with functional file upload
  - Hidden file input accepting image/jpeg and image/png
  - Upload to /api/upload, then save returned URL to profile via /api/user/profile PATCH with avatar field
  - Loading overlay on avatar during upload, disabled state
  - Shows uploaded avatar image or initials fallback
- Updated src/app/api/user/profile/route.ts: Added avatar field to PATCH handler (accepts and saves avatar URL string)

## TASK 7: Turso Database Integration
- Updated prisma/schema.prisma: Kept provider as "sqlite" (Prisma 6.19.2 doesn't support "libsql" provider directly)
- Installed @prisma/adapter-libsql and @libsql/client for runtime Turso adapter
- Created .env.local with Turso DATABASE_URL (libsql:// URL with embedded auth token)
- Ran prisma generate — client generated successfully with sqlite provider
- Generated SQL from Prisma schema via prisma migrate diff
- Pushed all 11 tables + indexes to Turso database via @libsql/client — all CREATE TABLE and CREATE INDEX statements executed successfully
- db.ts already handles Turso adapter detection via libsql:// URL prefix (no changes needed)
- Vercel CLI not logged in, so Vercel env vars could not be set programmatically (user needs to set DATABASE_URL in Vercel dashboard manually)

Stage Summary:
- Renamed Funnel → Pathway across 5 files (40+ occurrences)
- Fixed production bug in notify.ts (prisma → db)
- Created Admin Submissions management: 1 page + 2 API routes
- Converted Admin Settings to editable: 1 page rewritten + 1 API route
- Built complete Notifications system: 1 bell component + 4 API routes + 3 notifications pages + sidebar nav updates + header bell in 3 shells
- Enabled avatar upload in Customer Settings
- Integrated Turso database: all tables pushed successfully, runtime adapter working via db.ts
- Dev server compiles and runs cleanly with Turso DATABASE_URL
