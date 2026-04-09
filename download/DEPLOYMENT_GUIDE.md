# 🚀 Tunog Kalye Hub — Deployment Guide
## Deploying hub.tunogkalye.net on Vercel (FREE)

---

## Overview

```
www.tunogkalye.net      → AzuraCast (live radio on Oracle) — KEEP AS-IS
video.tunogkalye.net    → Dotcompal (video channel) — KEEP AS-IS  
hub.tunogkalye.net      → This Next.js app on Vercel — NEW (FREE)
```

---

## STEP 1: Push Code to GitHub

1. **Create a new GitHub repo** (e.g., `tunogkalye-hub`)
2. **Push this project** to that repo:
   ```bash
   cd /home/z/my-project
   git init
   git add .
   git commit -m "Initial commit: Tunog Kalye Hub - Funnels"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tunogkalye-hub.git
   git push -u origin main
   ```

> ⚠️ Make sure these files are NOT committed:
> - `.env*` files (already in .gitignore)
> - `node_modules/` (already in .gitignore)
> - `db/custom.db` (add to .gitignore if needed)

---

## STEP 2: Deploy to Vercel

1. **Go to** [vercel.com](https://vercel.com) and sign up (FREE)
2. Click **"Add New Project"**
3. **Import** your GitHub repo `tunogkalye-hub`
4. **Configure**:
   - Framework Preset: **Next.js** (auto-detected)
   - Build Command: `prisma generate && next build` (auto-detected from vercel.json)
   - Install Command: `npm install` (auto-detected)
   - Root Directory: `.` (leave as-is)
5. Click **"Deploy"** — wait ~2 minutes
6. ✅ You'll get a Vercel URL like `tunogkalye-hub.vercel.app`

---

## STEP 3: Connect hub.tunogkalye.net Domain

### In Vercel:
1. Go to your project → **Settings** → **Domains**
2. Add: `hub.tunogkalye.net`
3. Vercel will show DNS records to add

### In your DNS provider (wherever tunogkalye.net is registered):
Add a **CNAME record**:

| Type  | Name | Value                          |
|-------|------|--------------------------------|
| CNAME | hub  | cname.vercel-dns.com           |

> ⏱️ DNS can take up to 15 minutes to propagate. Vercel will auto-issue an SSL certificate.

---

## STEP 4: Set Up Database on Vercel

Vercel's free tier uses serverless functions. For the database, you have two options:

### Option A: Turso (FREE — Recommended)
Turso gives you a free SQLite database in the cloud, perfect for Prisma.

1. Sign up at [turso.tech](https://turso.tech)
2. Create a database: `turso db create tunogkalye-hub`
3. Get your connection URL: `turso db show tunogkalye-hub --url`
4. Create an auth token: `turso db tokens create tunogkalye-hub`
5. In Vercel → your project → **Settings** → **Environment Variables**, add:
   - `DATABASE_URL` = `libsql://tunogkalye-hub-YOURID.turso.io` (your Turso URL)
6. Update `prisma/schema.prisma` datasource to use `libsql` adapter

### Option B: Vercel Postgres (FREE tier available)
1. In Vercel → **Storage** → **Create Database** → **Postgres**
2. Connect it to your project
3. Update Prisma schema to use `postgresql`

---

## STEP 5: Configure AzuraCast Widget

1. **Copy the file** `azuracast-custom-widget.html` (included in download/)
2. In AzuraCast admin:
   - Go to **Administration** → **Station Pages** → **Custom HTML**
   - Paste the widget code
3. This adds "Submit Music", "Support", "Sponsor" buttons on your AzuraCast homepage

---

## STEP 6: Update Stream URLs (Important!)

In the file `src/app/page.tsx`, find the `STREAM_CONFIG` object near the top and update with your REAL AzuraCast URLs:

```javascript
const STREAM_CONFIG = {
  embedUrl: "https://www.tunogkalye.net/public/tunogkalye/embed",
  audioUrl: "https://www.tunogkalye.net/radio/8000/radio.mp3",  
  siteUrl: "https://www.tunogkalye.net",
};
```

### How to find your real stream URL:
1. Go to your AzuraCast admin
2. **Stations** → **Your Station** → **Mount Points**
3. Find your `.mp3` mount point — that's your `audioUrl`
4. The `embedUrl` format is: `https://www.tunogkalye.net/public/{station_shortname}/embed`

---

## STEP 7: Test Everything

After deployment, verify these work:

- [ ] `https://hub.tunogkalye.net` loads the funnel homepage
- [ ] "Submit Your Music" funnel works end-to-end
- [ ] "Sponsor My Station" funnel works end-to-end  
- [ ] "Support the Kanto" donation funnel works end-to-end
- [ ] Sticky live player at the bottom plays audio
- [ ] AzuraCast homepage shows the hub banner links
- [ ] Form submissions save to the database

---

## Cost Summary

| Service | Cost | Purpose |
|---------|------|---------|
| Vercel | **FREE** | Hosting the hub website |
| Turso | **FREE** (9GB storage) | Cloud database |
| AzuraCast | **FREE** | Already running on Oracle |
| Domain | Already owned | hub subdomain = free |

**Total monthly cost: $0**

---

## Future Features (Ready to Add)

The hub is built to be extensible. You can add:
- Artist dashboard / login
- Kanto Fund transparency page
- Blog / news section
- Events calendar
- Merch integration
- Listener stats dashboard
