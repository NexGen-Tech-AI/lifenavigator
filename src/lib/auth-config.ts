

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

console.log("[AUTH-CONFIG] Initializing with:");
console.log("  - NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
console.log("  - NEXTAUTH_SECRET length:", process.env.NEXTAUTH_SECRET?.length || 0);
console.log("  - NEXTAUTH_SECRET preview:", process.env.NEXTAUTH_SECRET?.substring(0, 20) + "...");
console.log("  - NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("  - NODE_ENV:", process.env.NODE_ENV);

// Validate secret length
if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 32) {
  console.error("[AUTH-CONFIG] ❌ CRITICAL: NEXTAUTH_SECRET must be at least 32 characters long!");
  console.error(`[AUTH-CONFIG] Current length: ${process.env.NEXTAUTH_SECRET?.length || 0}`);
  console.error("[AUTH-CONFIG] This will cause session cookies to not be created!");
}

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("[AUTH-CONFIG] Authorize called with email:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH-CONFIG] Missing credentials");
          return null;
        }

        try {
          console.log("[AUTH-CONFIG] Looking up user:", credentials.email);
          const user = await db.user.findUnique({
            where: { email: credentials.email }
          });
          console.log("[AUTH-CONFIG] User found:", !!user, user?.email);

          if (!user || !user.password) {
            console.log("[AUTH-CONFIG] User not found or no password");
            return null;
          }

          console.log("[AUTH-CONFIG] Comparing passwords...");
          const isPasswordValid = await compare(credentials.password, user.password);
          console.log("[AUTH-CONFIG] Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("[AUTH-CONFIG] Invalid password");
            return null;
          }

          console.log("[AUTH-CONFIG] Authentication successful for:", user.email);
          
          const authUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            setupCompleted: user.setupCompleted
          };
          
          console.log("[AUTH-CONFIG] Returning user object:", authUser);
          return authUser;
        } catch (error) {
          console.error("[AUTH-CONFIG] Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("\n=== JWT CALLBACK START ===");
      console.log("[JWT] Input:", {
        hasUser: !!user,
        userEmail: user?.email,
        existingTokenEmail: token?.email,
        account: account?.provider
      });
      
      try {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.setupCompleted = user.setupCompleted;
          console.log("[JWT] Setting token data for new user:", user.email);
        }
        
        console.log("[JWT] ✅ Token result:", {
          id: token.id,
          email: token.email,
          name: token.name,
          exp: token.exp,
          iat: token.iat
        });
        
        console.log("=== JWT CALLBACK END ===\n");
        return token;
        
      } catch (error) {
        console.error("[JWT] ❌ Error in JWT callback:", error);
        console.log("=== JWT CALLBACK END (ERROR) ===\n");
        throw error;
      }
    },
    async session({ session, token }) {
      console.log("[AUTH-CONFIG] Session callback - token email:", token.email);
      
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.setupCompleted = token.setupCompleted as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: undefined // Let NextAuth handle domain
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  debug: true, // Enable debug for troubleshooting
  logger: {
    error(code, metadata) {
      console.error('[NEXTAUTH ERROR]', code, metadata)
    },
    warn(code) {
      console.warn('[NEXTAUTH WARN]', code)
    },
    debug(code, metadata) {
      console.log('[NEXTAUTH DEBUG]', code, metadata)
    }
  },
  events: {
    async signIn(message) {
      console.log('[AUTH-CONFIG] SignIn event:', { 
        userId: message.user.id, 
        email: message.user.email,
        isNewUser: message.isNewUser 
      });
    },
    async session(message) {
      console.log('[AUTH-CONFIG] Session event:', { 
        sessionToken: message.session,
        tokenData: message.token 
      });
    },
    async createUser(message) {
      console.log('[AUTH-CONFIG] CreateUser event:', message.user);
    }
  }
};