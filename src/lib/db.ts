import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { Adapter } from '@prisma/client/runtime/library';
import { PrismaPg } from '@prisma/adapter-pg';
import { applyEncryptionMiddleware } from './encryption/prisma-middleware';

// Prevent multiple instances of Prisma Client in development environment
// With Vercel serverless functions, we need a more robust approach to handle connection pooling

declare global {
  var cachedPrisma: PrismaClient;
  var connectionPool: Pool | null;
}

let prisma: PrismaClient;
let adapter: Adapter | undefined;

// Create connection pool
const createConnectionPool = () => {
  if (process.env.DATABASE_URL?.startsWith('postgresql')) {
    // Only create pool for PostgreSQL
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Create adapter
    adapter = new PrismaPg(pool);
    return pool;
  }
  return null;
};

// Initialize Prisma client with the appropriate configuration
if (process.env.NODE_ENV === 'production') {
  // In production, use connection pooling for PostgreSQL
  global.connectionPool = global.connectionPool || createConnectionPool();
  
  // Create a new PrismaClient instance with adapter if PostgreSQL
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'minimal',
    adapter: adapter,
  });
} else {
  // In development, reuse the same connection to avoid exhausting the DB connection limit
  if (!global.cachedPrisma) {
    global.connectionPool = global.connectionPool || createConnectionPool();
    
    global.cachedPrisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
      errorFormat: 'pretty',
      adapter: adapter,
    });
  }
  prisma = global.cachedPrisma;
}

// Apply field-level encryption middleware if encryption is enabled
if (process.env.ENABLE_FIELD_ENCRYPTION === 'true') {
  applyEncryptionMiddleware(prisma);
}

export { prisma };