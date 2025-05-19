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

// Create a strong fallback secret for development and testing
const FALLBACK_SECRET = 'H9JK3yTrP8FDgmVZL6xW2cQbNsE4KuA7XYnGzM5pRvC1t0q';

// Define the NextAuth options for authentication
export const authOptions: AuthOptions = {
  // Use environment secret or fallback to strong dev secret
  secret: process.env.NEXTAUTH_SECRET || FALLBACK_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days for better persistence
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout', 
    error: '/auth/error',
    newUser: '/onboarding/interactive',
  },
  // Always enable debugging during development
  debug: process.env.NODE_ENV === 'development',
  // Use secure cookies based on environment - secure in production, less secure in development
  useSecureCookies: process.env.NODE_ENV === 'production', 
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production', // Secure in production
      },
    },
  },
};

export default authOptions;