import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Use Turso (libSQL) for production/preview, local SQLite for development
  const tursoUrl = process.env.STORAGE_TURSO_DATABASE_URL;
  const tursoToken = process.env.STORAGE_TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    // Production: Connect to Turso
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter } as any);
  }

  // Development: Local SQLite
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
}

export const db: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
