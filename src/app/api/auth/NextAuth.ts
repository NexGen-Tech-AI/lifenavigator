/**
 * NextAuth.js configuration
 */
import { AuthOptions } from 'next-auth';
import type { DefaultSession } from 'next-auth';

// Define custom session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      setupCompleted?: boolean;
    } & DefaultSession["user"];
  }
  
  interface User {
    id: string;
    setupCompleted?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    setupCompleted?: boolean;
  }
}

// Define the NextAuth options for authentication
export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'development-secret',
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    newUser: '/onboarding/interactive',
  },
  debug: process.env.NODE_ENV === 'development',
};

export default authOptions;