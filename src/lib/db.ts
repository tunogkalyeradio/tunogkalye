import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient, type Client } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const tursoUrl = process.env.STORAGE_TURSO_DATABASE_URL;
  const tursoToken = process.env.STORAGE_TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    // Create libsql client explicitly and pass to adapter
    const libsql: Client = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });

    const adapter = new PrismaLibSQL(libsql);

    return new PrismaClient({
      adapter,
      // Suppress the DATABASE_URL requirement since we're using the adapter
      datasources: {
        db: {
          url: tursoUrl,
        },
      },
    } as any);
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
