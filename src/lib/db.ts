// Database client implementation
// This file provides either a real Prisma client or a mock DB for development

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

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

// Mock database implementation for development environments
class MockDB {
  private users: Record<string, User> = {
    'demo-user-id': {
      id: 'demo-user-id',
      email: 'demo@example.com',
      name: 'Demo User',
      // For demo account, password is 'password' (no real hashing on mock)
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
  $queryRaw = async <T = any>(...args: any[]): Promise<T> => {
    return [{ result: 2 }] as T;
  }
}

// Determine if we should use mock database or real Prisma
// Use environment variables to control this behavior
const useMockDb = process.env.USE_MOCK_DB === 'true';

// For Prisma, we want to make sure we don't create multiple instances
// during hot reloads in development
let prismaClient: PrismaClient | undefined;

function getPrismaClient() {
  // If we already have a client, return it
  if (prismaClient) {
    return prismaClient;
  }

  try {
    // Create a new Prisma Client with appropriate logging based on environment
    prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Log successful connection
    if (process.env.NODE_ENV === 'development') {
      console.log('Connected to database with Prisma');
    }
    
    return prismaClient;
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error);
    
    // If there's an error initializing Prisma, fall back to mock DB
    console.warn('Falling back to mock database due to connection error');
    return new MockDB() as any;
  }
}

// Determine which database client to use
let db;
if (useMockDb) {
  console.log('Using mock database by configuration');
  db = new MockDB();
} else {
  try {
    db = getPrismaClient();
  } catch (error) {
    console.error('Error initializing database client:', error);
    console.warn('Falling back to mock database due to error');
    db = new MockDB();
  }
}

// Export the database client
export { db };