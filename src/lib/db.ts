import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

function createPrismaClient() {
  const tursoUrl = process.env.STORAGE_TURSO_DATABASE_URL;
  const tursoToken = process.env.STORAGE_TURSO_AUTH_TOKEN;

  console.log("[DB] Creating Prisma client...");
  console.log("[DB] TURSO_URL available:", !!tursoUrl);
  console.log("[DB] TURSO_TOKEN available:", !!tursoToken);
  console.log("[DB] TURSO_URL prefix:", tursoUrl?.substring(0, 30));
  console.log("[DB] DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 30));

  if (tursoUrl && tursoToken) {
    console.log("[DB] Using Turso adapter");
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter } as any);
  }

  console.log("[DB] Using default SQLite client");
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
