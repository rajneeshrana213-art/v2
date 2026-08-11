import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pool: Pool;
  adapter: PrismaPg;
};

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({
    connectionString: 
      process.env.NEON_DATABASE_URL || 
      process.env.DATABASE_URL || 
      process.env.POSTGRES_PRISMA_URL || 
      process.env.POSTGRES_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

if (!globalForPrisma.adapter) {
  globalForPrisma.adapter = new PrismaPg(globalForPrisma.pool);
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: globalForPrisma.adapter,
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

