import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

// Enhanced logging
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
        console.log("\n=== AUTHORIZE START ===");
        console.log("[AUTHORIZE] Credentials received:", {
          email: credentials?.email,
          hasPassword: !!credentials?.password
        });
        
        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTHORIZE] ❌ Missing credentials");
          return null;
        }

        try {
          console.log("[AUTHORIZE] Looking up user:", credentials.email);
          const user = await db.user.findUnique({
            where: { email: credentials.email }
          });
          console.log("[AUTHORIZE] User found:", !!user, user?.email);

          if (!user || !user.password) {
            console.log("[AUTHORIZE] ❌ User not found or no password");
            return null;
          }

          console.log("[AUTHORIZE] Comparing passwords...");
          const isPasswordValid = await compare(credentials.password, user.password);
          console.log("[AUTHORIZE] Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("[AUTHORIZE] ❌ Invalid password");
            return null;
          }

          console.log("[AUTHORIZE] ✅ Authentication successful for:", user.email);
          
          const authUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            setupCompleted: user.setupCompleted
          };
          
          console.log("[AUTHORIZE] ✅ Returning user object:", authUser);
          console.log("=== AUTHORIZE END ===\n");
          return authUser;
        } catch (error) {
          console.error("[AUTHORIZE] ❌ Auth error:", error);
          console.log("=== AUTHORIZE END (ERROR) ===\n");
          return null;
        }
      }
    })
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  callbacks: {
    async jwt({ token, user, account, profile, trigger }) {
      console.log("\n=== JWT CALLBACK START ===");
      console.log("[JWT] Inputs:", {
        hasUser: !!user,
        userEmail: user?.email,
        existingTokenEmail: token?.email,
        accountProvider: account?.provider,
        trigger
      });
      
      try {
        if (user) {
          console.log("[JWT] 🔄 Creating new token for user:", user.email);
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.setupCompleted = user.setupCompleted;
          
          console.log("[JWT] ✅ Token data set:", {
            id: token.id,
            email: token.email,
            name: token.name,
            setupCompleted: token.setupCompleted
          });
        } else {
          console.log("[JWT] 🔄 Refreshing existing token for:", token.email || "unknown");
        }
        
        // Ensure required fields are always present
        const finalToken = {
          ...token,
          id: token.id || "unknown",
          email: token.email || "unknown@example.com",
          name: token.name || "Unknown User"
        };
        
        console.log("[JWT] ✅ Final token:", {
          id: finalToken.id,
          email: finalToken.email,
          name: finalToken.name,
          iat: (finalToken as any).iat,
          exp: (finalToken as any).exp
        });
        
        console.log("=== JWT CALLBACK END ===\n");
        return finalToken;
        
      } catch (error) {
        console.error("[JWT] ❌ CRITICAL ERROR in JWT callback:", error);
        console.error("[JWT] Error stack:", (error as Error).stack);
        console.log("=== JWT CALLBACK END (ERROR) ===\n");
        // Return a minimal token to prevent complete failure
        return {
          id: user?.id || token?.id || "error",
          email: user?.email || token?.email || "error@example.com",
          name: user?.name || token?.name || "Error User"
        };
      }
    },
    
    async session({ session, token }) {
      console.log("\n=== SESSION CALLBACK START ===");
      console.log("[SESSION] Inputs:", {
        hasSession: !!session,
        hasToken: !!token,
        tokenEmail: token?.email,
        sessionUserEmail: session?.user?.email
      });
      
      try {
        if (!token) {
          console.error("[SESSION] ❌ No token provided to session callback!");
          throw new Error("No token provided to session callback");
        }
        
        console.log("[SESSION] 🔄 Building session from token:", {
          tokenId: token.id,
          tokenEmail: token.email,
          tokenName: token.name
        });
        
        // Ensure session.user exists
        if (!session.user) {
          session.user = {} as any;
        }
        
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.setupCompleted = token.setupCompleted as boolean;
        
        console.log("[SESSION] ✅ Final session:", {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          setupCompleted: session.user.setupCompleted
        });
        
        console.log("=== SESSION CALLBACK END ===\n");
        return session;
        
      } catch (error) {
        console.error("[SESSION] ❌ CRITICAL ERROR in session callback:", error);
        console.error("[SESSION] Error stack:", (error as Error).stack);
        console.log("=== SESSION CALLBACK END (ERROR) ===\n");
        throw error;
      }
    }
  },
  
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  },
  
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
  
  // Explicit cookie configuration for debugging
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
      console.error("[NEXTAUTH-ERROR]", code, metadata);
    },
    warn(code) {
      console.warn("[NEXTAUTH-WARN]", code);
    },
    debug(code, metadata) {
      console.log("[NEXTAUTH-DEBUG]", code, metadata);
    }
  },
  
  events: {
    async signIn(message) {
      console.log("[AUTH-EVENT] ✅ signIn event:", { 
        userId: message.user.id, 
        email: message.user.email,
        isNewUser: message.isNewUser,
        account: message.account?.provider
      });
    },
    async session(message) {
      console.log("[AUTH-EVENT] 📊 session event:", { 
        sessionToken: !!message.session,
        tokenEmail: message.token?.email
      });
    },
    async createUser(message) {
      console.log("[AUTH-EVENT] 👤 createUser event:", message.user);
    }
  }
};