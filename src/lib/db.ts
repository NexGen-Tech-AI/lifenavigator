import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development environment
// With Vercel serverless functions, we need a more robust approach to handle connection pooling

declare global {
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // In production, create a new PrismaClient instance for each request
  // This works well with Vercel's serverless functions
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'minimal',
  });
} else {
  // In development, reuse the same connection to avoid exhausting the DB connection limit
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
      errorFormat: 'pretty',
    });
  }
  prisma = global.cachedPrisma;
}

export { prisma };