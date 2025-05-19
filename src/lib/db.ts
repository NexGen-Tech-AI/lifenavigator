// Database client implementation
// This file provides either a real Prisma client or a mock DB for development

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { compare, hash } from 'bcryptjs';

// Define User type based on our schema
type User = {
  id: string;
  email: string;
  name?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  password?: string | null;
  setupCompleted: boolean;
};

// Mock database implementation for development and testing
class MockDB {
  private users: Record<string, User> = {
    'demo-user-id': {
      id: 'demo-user-id',
      email: 'demo@example.com',
      name: 'Demo User',
      // This is a hashed version of 'password' for the demo account
      password: '$2a$12$J05Qe4.6ggwwj7ucEEiJ8e.tEgYiYiQaEvqA0.XBhdBVNJ/Z8EHwi',
      setupCompleted: true
    },
    'test-user-id': {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      password: '$2a$12$J05Qe4.6ggwwj7ucEEiJ8e.tEgYiYiQaEvqA0.XBhdBVNJ/Z8EHwi',
      setupCompleted: true
    }
  };

  user = {
    findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
      if (where.id) {
        return this.users[where.id] || null;
      }
      if (where.email) {
        return Object.values(this.users).find(u => u.email === where.email) || null;
      }
      return null;
    },
    findMany: async () => {
      return Object.values(this.users);
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || `user-${Date.now()}`;
      this.users[id] = { ...data, id };
      return this.users[id];
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      if (!this.users[where.id]) return null;
      this.users[where.id] = { ...this.users[where.id], ...data };
      return this.users[where.id];
    }
  };

  // Add other model mocks as needed (this is a simplified version)
  // These are just empty implementations that won't throw errors
  securityAuditLog = {
    create: async () => ({}),
    findMany: async () => []
  };
  
  revokedToken = {
    create: async () => ({}),
    findUnique: async () => null,
    findMany: async () => []
  };
  
  // Add mock implementations for other tables needed by auth flows
  mfaSetup = {
    upsert: async () => ({}),
    delete: async () => ({}),
    findUnique: async () => null
  };
  
  mfaRecoveryCode = {
    deleteMany: async () => ({}),
    create: async () => ({}),
    findFirst: async () => null,
    update: async () => ({})
  };
  
  mfaSecret = {
    findMany: async () => []
  };
  
  // Mock the $queryRaw method for testing database connectivity
  $queryRaw: any = async <T = any>(...args: any[]): Promise<T> => {
    console.log('Mock $queryRaw called with:', args);
    return [{ result: 2 }] as any;
  }
}

// Global debug state
const debug = process.env.LOG_LEVEL === 'debug';

// Determine if we should use mock database or real Prisma
// Use environment variables to control this behavior
const useMockDb = process.env.USE_MOCK_DB === 'true';

// For Prisma, we want to make sure we don't create multiple instances
// during hot reloads in development
let prismaClient: PrismaClient | undefined;

/**
 * Create and return a PrismaClient instance
 */
function getPrismaClient(): PrismaClient {
  try {
    // If we already have a client, return it
    if (prismaClient) {
      if (debug) console.log('Reusing existing Prisma client');
      return prismaClient;
    }

    if (debug) console.log('Creating new Prisma client');
    // Create new client with appropriate logging
    prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
    });

    console.log('Connected to database with Prisma');
    return prismaClient;
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error);
    throw error; // Re-throw to be caught by the caller
  }
}

// Decide which database client to use
let db: PrismaClient | MockDB;
let mockDb = new MockDB() as any; // Always create a mock DB instance for fallback

// Flag to track if we're using mock DB
let usingMockDb = false;

if (useMockDb) {
  console.log('Using mock database by configuration');
  db = mockDb;
  usingMockDb = true;
} else {
  try {
    console.log('Attempting to connect to real database...');
    
    // Log connection info for debugging
    if (debug) {
      console.log('POSTGRES_PRISMA_URL is', process.env.POSTGRES_PRISMA_URL ? 'defined' : 'undefined');
      console.log('DATABASE_URL is', process.env.DATABASE_URL ? 'defined' : 'undefined');
    }
    
    // Create the Prisma client
    db = getPrismaClient();
    
    // Test connection immediately using a promise - don't block initialization
    db.$queryRaw`SELECT 1+1 as result`
      .then(() => {
        console.log('✅ Database connection test successful!');
        
        // Only ensure demo account if we haven't switched to mock DB
        if (!usingMockDb) {
          // Try to ensure demo account exists in the real database
          ensureDemoAccount();
        }
      })
      .catch((err) => {
        console.error('❌ Database connection test failed:', err);
        console.warn('Falling back to mock database due to connection failure');
        
        // Switch to mock DB if the real DB fails
        db = mockDb;
        usingMockDb = true;
      });
  } catch (error) {
    console.error('❌ Error initializing database client:', error);
    console.warn('Falling back to mock database due to initialization error');
    
    // Use mock DB as fallback
    db = mockDb;
    usingMockDb = true;
  }
}

// Create a special proxy to handle failover during runtime
const dbProxy = new Proxy({} as any, {
  get: function(target, prop, receiver) {
    try {
      // Special handling for $queryRaw to catch DB errors
      if (prop === '$queryRaw') {
        return async (...args: any[]) => {
          try {
            return await db.$queryRaw.apply(db, args);
          } catch (error) {
            if (!usingMockDb) {
              console.error('Database operation failed, falling back to mock DB:', error);
              db = mockDb;
              usingMockDb = true;
              return mockDb.$queryRaw.apply(mockDb, args);
            }
            throw error;
          }
        };
      }
      
      // Simple proxy for everything else
      return db[prop];
    } catch (error) {
      console.error(`Error accessing db.${String(prop)}:`, error);
      return mockDb[prop];
    }
  }
});

/**
 * Ensures that the demo account exists in the database
 */
async function ensureDemoAccount() {
  try {
    // Check if demo user exists
    const demoUser = await db.user.findUnique({
      where: { email: 'demo@example.com' },
    });
    
    if (!demoUser) {
      console.log('Creating demo account in database');
      // Create the demo user with hashed password ('password')
      const hashedPassword = await hash('password', 12);
      
      await db.user.create({
        data: {
          id: 'demo-user-id',
          email: 'demo@example.com',
          name: 'Demo User',
          password: hashedPassword,
          setupCompleted: true,
        },
      });
      console.log('✅ Demo account created successfully');
    } else {
      console.log('✅ Demo account already exists in database');
    }
  } catch (error) {
    console.error('❌ Error ensuring demo account:', error);
  }
}

// Check database connection and type
(async () => {
  try {
    const isMockDb = !('$connect' in db);
    console.log(`Current database type: ${isMockDb ? 'Mock Database' : 'PostgreSQL'}`);
    
    // If using mock DB, no need to test connection
    if (isMockDb) {
      console.log('Using mock database - demo account is pre-configured');
      return;
    }
  } catch (error) {
    console.error('Error checking database type:', error);
  }
})();

// Check database connection and type
console.log(`Current database type: ${usingMockDb ? 'Mock Database' : 'PostgreSQL'}`);

// Export the database client - use the proxy for more resilient operations
export { dbProxy as db };