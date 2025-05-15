// Create a mock database for development
// This will be replaced with a real Prisma instance in production

// Mock user type matching our schema
type User = {
  id: string;
  email: string;
  name?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  password?: string | null;
  setupCompleted: boolean;
};

// Very simple in-memory mock database
class MockDB {
  private users: Record<string, User> = {
    'demo-user-id': {
      id: 'demo-user-id',
      email: 'demo@example.com',
      name: 'Demo User',
      setupCompleted: true
    },
    'test-user-id': {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
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
  
  // Mock the $queryRaw method for testing database connectivity
  $queryRaw: async <T = any>(...args: any[]) => {
    return [{ result: 2 }] as T;
  }
}

// Export the mock database instance
export const db = new MockDB();