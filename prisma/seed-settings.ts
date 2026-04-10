import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultSettings = [
  // General
  { key: "station_name", value: "Tunog Kalye Radio", label: "Station Name", group: "general" },
  { key: "station_tagline", value: "The Premier Grassroots Network for Filipino Independent Music", label: "Station Tagline", group: "general" },
  { key: "hero_subtitle", value: "Bridging 90s Pinoy Rock with modern indie. Curated by humans, not algorithms.", label: "Hero Subtitle", group: "general" },
  { key: "hero_badge", value: "24/7 GLOBAL BROADCAST", label: "Hero Badge Text", group: "general" },
  { key: "footer_text", value: "Tunog Kalye Radio © 2026. All rights reserved.", label: "Footer Copyright Text", group: "general" },
  { key: "footer_website", value: "tunogkalye.net", label: "Footer Website URL", group: "general" },
  { key: "footer_video", value: "video.tunogkalye.net", label: "Footer Video Hub URL", group: "general" },
  { key: "footer_location", value: "Surrey, BC, Canada", label: "Footer Location", group: "general" },

  // Sponsor
  { key: "sponsor_name_1", value: "", label: "Sponsor Name 1 (Restaurant/Business)", group: "sponsor" },
  { key: "sponsor_link_1", value: "", label: "Sponsor Link 1 (Website URL)", group: "sponsor" },
  { key: "sponsor_description_1", value: "", label: "Sponsor Tagline 1 (e.g. The best Pinoy food in Surrey!)", group: "sponsor" },
  { key: "sponsor_name_2", value: "", label: "Sponsor Name 2", group: "sponsor" },
  { key: "sponsor_link_2", value: "", label: "Sponsor Link 2", group: "sponsor" },
  { key: "sponsor_description_2", value: "", label: "Sponsor Tagline 2", group: "sponsor" },
  { key: "sponsor_name_3", value: "", label: "Sponsor Name 3", group: "sponsor" },
  { key: "sponsor_link_3", value: "", label: "Sponsor Link 3", group: "sponsor" },
  { key: "sponsor_description_3", value: "", label: "Sponsor Tagline 3", group: "sponsor" },
  { key: "sponsor_enabled", value: "true", label: "Show Sponsor Banner on Radio Page", group: "sponsor" },

  // Content
  { key: "submit_hero_title", value: "ATTENTION LOCAL PINOY BANDS", label: "Submit Page Hero Title", group: "content" },
  { key: "submit_hero_subtitle", value: "Get your music played on 24/7 Global Radio.", label: "Submit Page Hero Subtitle", group: "content" },
  { key: "stats_listeners", value: "24/7", label: "Stats: Live Listeners", group: "content" },
  { key: "stats_reach", value: "Worldwide", label: "Stats: Global Reach", group: "content" },
  { key: "stats_artists", value: "Growing", label: "Stats: Indie Artists", group: "content" },
  { key: "stats_commission", value: "0%", label: "Stats: Commission", group: "content" },
];

async function main() {
  console.log("Seeding default site settings...");

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { label: setting.label, group: setting.group },
      create: setting,
    });
  }

  console.log(`✅ Seeded ${defaultSettings.length} default site settings`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
