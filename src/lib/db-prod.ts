/**
 * Production database configuration with connection pooling and middleware
 */

import { PrismaClient } from '@prisma/client';
import { encryptionMiddleware } from './encryption/prisma-middleware';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL // Uses connection pooling
      }
    }
  });

// Apply encryption middleware for sensitive data
prisma.$use(encryptionMiddleware);

// Middleware for automatic timestamp updates
prisma.$use(async (params, next) => {
  if (params.model && ['create', 'createMany'].includes(params.action)) {
    if (!params.args.data.createdAt) {
      if (params.action === 'create') {
        params.args.data.createdAt = new Date();
      } else {
        params.args.data = params.args.data.map((item: any) => ({
          ...item,
          createdAt: item.createdAt || new Date()
        }));
      }
    }
  }

  if (params.model && ['update', 'updateMany', 'upsert'].includes(params.action)) {
    if (params.action === 'update' || params.action === 'upsert') {
      params.args.data.updatedAt = new Date();
    } else {
      params.args.data = {
        ...params.args.data,
        updatedAt: new Date()
      };
    }
  }

  return next(params);
});

// Middleware for soft deletes (if needed in future)
prisma.$use(async (params, next) => {
  // You can implement soft delete logic here if needed
  return next(params);
});

// Middleware for demo account protection
prisma.$use(async (params, next) => {
  const DEMO_EMAIL = process.env.DEMO_USER_EMAIL || "demo@example.com";
  
  // Prevent updates/deletes to demo user
  if (params.model === 'User') {
    if (params.action === 'update' || params.action === 'delete') {
      const user = await prisma.user.findUnique({
        where: params.args.where,
        select: { email: true, isDemoAccount: true }
      });
      
      if (user?.isDemoAccount || user?.email === DEMO_EMAIL) {
        throw new Error('Demo account cannot be modified');
      }
    }
    
    if (params.action === 'updateMany' || params.action === 'deleteMany') {
      // Check if demo user would be affected
      const demoUser = await prisma.user.findFirst({
        where: {
          AND: [
            params.args.where || {},
            { OR: [{ isDemoAccount: true }, { email: DEMO_EMAIL }] }
          ]
        }
      });
      
      if (demoUser) {
        throw new Error('Operation would affect demo account');
      }
    }
  }
  
  // Prevent modifications to demo user's data
  const protectedModels = [
    'FinancialAccount',
    'Transaction',
    'Budget',
    'Goal',
    'Insight',
    'Category',
    'Document'
  ];
  
  if (protectedModels.includes(params.model || '') && 
      ['update', 'updateMany', 'delete', 'deleteMany'].includes(params.action)) {
    
    // Get the demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
      select: { id: true }
    });
    
    if (demoUser) {
      // Check if operation would affect demo user's data
      let wouldAffectDemo = false;
      
      if (params.action === 'update' || params.action === 'delete') {
        const record = await (prisma as any)[params.model!].findUnique({
          where: params.args.where,
          select: { userId: true }
        });
        wouldAffectDemo = record?.userId === demoUser.id;
      } else {
        const records = await (prisma as any)[params.model!].findMany({
          where: params.args.where,
          select: { userId: true }
        });
        wouldAffectDemo = records.some((r: any) => r.userId === demoUser.id);
      }
      
      if (wouldAffectDemo) {
        throw new Error('Demo user data cannot be modified');
      }
    }
  }
  
  return next(params);
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Connection management for serverless
export async function disconnect() {
  await prisma.$disconnect();
}

// Health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Transaction helper with retry logic
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on specific errors
      if (
        error.code === 'P2002' || // Unique constraint
        error.code === 'P2003' || // Foreign key constraint
        error.code === 'P2025' || // Record not found
        error.message?.includes('Demo')
      ) {
        throw error;
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

// Batch operations helper
export async function batchOperation<T, R>(
  items: T[],
  operation: (batch: T[]) => Promise<R>,
  batchSize = 100
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const result = await operation(batch);
    results.push(result);
  }
  
  return results;
}

// Export types and enums
export type { PrismaClient } from '@prisma/client';
export * from '@prisma/client';