import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { authOptions } from "../NextAuth";
import { db } from "@/lib/db";

// Demo account details for hardcoded authentication
const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "password";

// Create NextAuth handler with simplified setup
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
          // Basic validation
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          // Handle demo account with special case
          if (credentials.email === DEMO_EMAIL) {
            console.log("Demo login attempt detected");
            
            // First try to find the demo user in database
            try {
              const demoUser = await db.user.findUnique({
                where: { email: DEMO_EMAIL },
              });
              
              if (demoUser && demoUser.password) {
                console.log("Found demo user in database, validating password");
                const passwordValid = await compare(credentials.password, demoUser.password);
                
                if (passwordValid) {
                  console.log("Demo login successful via database");
                  return {
                    id: demoUser.id,
                    email: demoUser.email,
                    name: demoUser.name,
                    setupCompleted: true,
                  };
                } else {
                  console.log("Demo account password invalid");
                }
              } else {
                console.log("Demo user not found in database");
              }
            } catch (dbError) {
              console.error("Error checking demo user in database:", dbError);
            }
            
            // If password matches hardcoded demo, allow login regardless of DB
            if (credentials.password === DEMO_PASSWORD) {
              console.log("Demo login successful via hardcoded credentials");
              return {
                id: "demo-user-id",
                email: DEMO_EMAIL,
                name: "Demo User",
                setupCompleted: true,
              };
            }
            
            return null;
          }

          // Regular user authentication against database
          console.log(`Login attempt for: ${credentials.email}`);
          
          try {
            // Find user in database
            const user = await db.user.findUnique({
              where: { email: credentials.email },
            });

            if (!user || !user.password) {
              console.log("User not found or has no password");
              return null;
            }

            // Validate password
            const passwordValid = await compare(credentials.password, user.password);

            if (!passwordValid) {
              console.log("Invalid password");
              return null;
            }

            console.log(`Login successful for: ${user.email}`);
            return {
              id: user.id,
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              setupCompleted: user.setupCompleted || false,
            };
          } catch (dbError) {
            console.error("Database error during login:", dbError);
            return null;
          }
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
  debug: true, // Enable debugging
});

export { handler as GET, handler as POST };