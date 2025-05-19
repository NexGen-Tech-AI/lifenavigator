import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { authOptions } from "../NextAuth";

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

          // Handle demo account - always allow this to work
          if (credentials.email === DEMO_EMAIL && credentials.password === DEMO_PASSWORD) {
            console.log("Demo login successful");
            try {
              // First try to find the demo user in the database
              const demoUser = await db.user.findUnique({
                where: { email: DEMO_EMAIL },
              });
              
              if (demoUser) {
                return {
                  id: demoUser.id,
                  email: demoUser.email,
                  name: demoUser.name,
                  setupCompleted: true,
                };
              }
            } catch (dbError) {
              console.error("Error accessing database for demo user:", dbError);
              // Fall back to hardcoded demo user if DB fails
            }

            // Return hardcoded demo user as fallback
            return {
              id: "demo-user-id",
              email: DEMO_EMAIL,
              name: "Demo User",
              setupCompleted: true,
            };
          }

          // The real database authentication logic for regular users
          console.log("Attempting database login for:", credentials.email);
          try {
            const user = await db.user.findUnique({
              where: { email: credentials.email },
            });

            if (!user || !user.password) {
              console.log("User not found or has no password");
              return null;
            }

            const passwordValid = await compare(credentials.password, user.password);

            if (!passwordValid) {
              console.log("Invalid password");
              return null;
            }

            console.log("Database login successful for:", user.email);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image, 
              setupCompleted: user.setupCompleted || false,
            };
          } catch (dbError) {
            console.error("Database error during login:", dbError);
            return null;
          }
        } catch (error) {
          console.error("Auth error:", error);
          // Return null on error
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
  debug: true, // Always enable debugging
});

export { handler as GET, handler as POST };