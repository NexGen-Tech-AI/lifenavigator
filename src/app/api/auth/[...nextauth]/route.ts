import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { hash } from "bcryptjs";
import { authOptions } from "../NextAuth";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

// Demo account details for direct check (fallback)
const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "password";
const DEMO_HASH = "$2a$12$J05Qe4.6ggwwj7ucEEiJ8e.tEgYiYiQaEvqA0.XBhdBVNJ/Z8EHwi"; // Hashed 'password'

// Ensure demo account exists in database on first run
async function ensureDemoAccount() {
  try {
    const existingUser = await db.user.findUnique({
      where: { email: DEMO_EMAIL },
    });
    
    if (!existingUser) {
      console.log("Creating demo account in database...");
      await db.user.create({
        data: {
          id: "demo-user-id",
          email: DEMO_EMAIL,
          name: "Demo User",
          password: DEMO_HASH,
          setupCompleted: true,
        },
      });
      console.log("Demo account created successfully");
    }
  } catch (error) {
    console.error("Failed to ensure demo account exists:", error);
    // Non-blocking - continue even if this fails
  }
}

// Try to create the demo account (don't await, let it run in background)
ensureDemoAccount();

// Create NextAuth handler with additional providers
export const handler = NextAuth({
  ...authOptions,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Special case for demo account
          if (credentials.email === DEMO_EMAIL && credentials.password === DEMO_PASSWORD) {
            // If demo account, return hardcoded user
            return {
              id: "demo-user-id",
              email: DEMO_EMAIL,
              name: "Demo User",
              setupCompleted: true,
            };
          }

          // Otherwise, check database
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            return null;
          }

          const passwordValid = await compare(credentials.password, user.password);

          if (!passwordValid) {
            return null;
          }

          // Update last login timestamp
          try {
            await db.user.update({
              where: { id: user.id },
              data: { lastLogin: new Date() },
            });
          } catch (error) {
            console.error("Failed to update last login time:", error);
            // Don't block login if update fails
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            setupCompleted: user.setupCompleted || false,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.setupCompleted = user.setupCompleted;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.setupCompleted = token.setupCompleted;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };