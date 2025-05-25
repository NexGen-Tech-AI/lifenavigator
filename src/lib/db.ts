/**
 * Simplified database configuration
 * - Development: Always use mock DB
 * - Production: Always use PostgreSQL
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

// Simple mock user for development
const MOCK_USERS = [
  {
    id: 'demo-user-id',
    email: 'demo@example.com',
    name: 'Demo User',
    password: '$2b$12$PR/uuiyLYd50BCj5scwpl.z27HO4uv4CN5s2KnFLJ9pgkr1HCuLF2', // "password"
    setupCompleted: true,
    emailVerified: new Date(),
    image: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock database for development
class MockPrismaClient {
  user = {
    findUnique: async ({ where }: any) => {
      return MOCK_USERS.find(u => u.email === where.email || u.id === where.id) || null;
    },
    findMany: async () => MOCK_USERS,
    create: async ({ data }: any) => ({ ...data, id: `user-${Date.now()}` }),
    update: async ({ where, data }: any) => {
      const user = MOCK_USERS.find(u => u.id === where.id);
      return user ? { ...user, ...data } : null;
    }
  };
  
  // Stub other models to prevent errors
  account = { findMany: async () => [], create: async () => ({}) };
  session = { findMany: async () => [], create: async () => ({}) };
  verificationToken = { findMany: async () => [], create: async () => ({}) };
  
  $queryRaw = async () => [{ result: 2 }];
  $connect = async () => {};
  $disconnect = async () => {};
}

// Determine environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const forceMockDb = process.env.USE_MOCK_DB === 'true';

let db: PrismaClient | MockPrismaClient;

if (isDevelopment || forceMockDb) {
  console.log('🔧 Using mock database for development');
  db = new MockPrismaClient() as any;
} else {
  console.log('🚀 Using PostgreSQL for production');
  
  // In production, we must have database URLs
  if (!process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
    throw new Error('Database connection URL not found in production environment');
  }
  
  db = new PrismaClient({
    log: ['error', 'warn'],
  });
}

export { db };