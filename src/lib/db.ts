import { PrismaClient } from '@prisma/client';

// For Turso / libSQL support
let libsqlAdapter: InstanceType<typeof import('@prisma/adapter-libsql').PrismaLibSQL> | null = null;

function createPrismaClient() {
  const url = process.env.DATABASE_URL || '';

  // If using Turso (libsql:// URL), use the driver adapter for serverless compatibility
  if (url.startsWith('libsql://')) {
    try {
      // Dynamic imports to avoid bundling libsql when using local SQLite
      const { PrismaLibSQL } = require('@prisma/adapter-libsql');
      const { createClient } = require('@libsql/client');

      const libsql = createClient({
        url: url,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });

      libsqlAdapter = new PrismaLibSQL(libsql);

      return new PrismaClient({
        adapter: libsqlAdapter,
        log: process.env.NODE_ENV === 'development' ? ['query'] : [],
      });
    } catch (err) {
      console.error('Failed to initialize Turso adapter, falling back to default:', err);
    }
  }

  // Local SQLite
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
};

export const db: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Safe getter that returns null if DB is unavailable
export function getDb(): PrismaClient | null {
  try {
    return db;
  } catch {
    return null;
  }
}
