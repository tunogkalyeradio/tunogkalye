import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const tursoUrl = process.env.STORAGE_TURSO_DATABASE_URL;
  const tursoToken = process.env.STORAGE_TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    // PrismaLibSQL is a factory that expects a CONFIG OBJECT
    // It will create its own libsql client internally
    const config = { url: tursoUrl, authToken: tursoToken };
    const adapter = new PrismaLibSQL(config);

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
