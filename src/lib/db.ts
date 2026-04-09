import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let _db: PrismaClient | null = null;

function createDb() {
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    });
    return client;
  } catch {
    return null;
  }
}

export const db = _db ?? createDb()!;

// Safe getter that returns null if DB is unavailable
export function getDb(): PrismaClient | null {
  if (!globalForPrisma.prisma) {
    const created = createDb();
    if (created) {
      globalForPrisma.prisma = created;
      return created;
    }
    return null;
  }
  return globalForPrisma.prisma;
}

if (process.env.NODE_ENV !== 'production') {
  if (globalForPrisma.prisma) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).prisma = globalForPrisma.prisma;
  }
}
