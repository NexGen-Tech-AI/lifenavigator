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
            return {
              id: "demo-user-id",
              email: DEMO_EMAIL,
              name: "Demo User",
              setupCompleted: true,
            };
          }

          // For any other accounts, reject for now
          // This effectively makes only the demo account work for testing
          console.log("Non-demo login attempted:", credentials.email);
          return null;
          
          /* The real database authentication logic would be here 
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

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image, 
            setupCompleted: user.setupCompleted || false,
          };
          */
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