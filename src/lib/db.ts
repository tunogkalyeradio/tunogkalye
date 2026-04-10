import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const tursoUrl = process.env.STORAGE_TURSO_DATABASE_URL;
  const tursoToken = process.env.STORAGE_TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require("@prisma/adapter-libsql");

    // IMPORTANT: PrismaLibSQL is a factory that expects a CONFIG OBJECT, not a Client.
    // It will create its own libsql client internally using this config.
    // The factory's connect() method passes this config to libsql's createClient().
    const config = {
      url: tursoUrl,
      authToken: tursoToken,
    };

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
