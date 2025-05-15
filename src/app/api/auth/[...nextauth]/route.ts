import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { authOptions } from "../NextAuth";

// Create a handler for the next-auth routes
const handler = NextAuth({
  ...authOptions,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is a simple authorization for development
        console.log("Auth attempt with:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password");
          return null;
        }

        // For development, accept demo login (hardcoded credentials)
        // Explicitly check for exact match, trimming any whitespace
        const email = credentials.email.trim();
        const password = credentials.password.trim();
        
        console.log("Checking credentials:", email, password);
        
        if (email === "demo@example.com" && password === "password") {
          console.log("Demo login successful");
          return {
            id: "demo-user-id",
            email: "demo@example.com",
            name: "Demo User",
            setupCompleted: true
          };
        }
        
        // For development, accept test login
        if (email === "test@example.com" && password === "password") {
          console.log("Test login successful");
          return {
            id: "test-user-id",
            email: "test@example.com",
            name: "Test User",
            setupCompleted: true
          };
        }
        
        console.log("Login failed - invalid credentials");
        return null;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // Add other providers as needed
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
      if (session.user) {
        session.user.id = token.id as string;
        session.user.setupCompleted = token.setupCompleted as boolean;
      }
      return session;
    }
  },
});

export { handler as GET, handler as POST };