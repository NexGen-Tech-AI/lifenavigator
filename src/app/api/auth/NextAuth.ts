// app/api/auth/NextAuth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { OAuthConfig } from "next-auth/providers/oauth";

// Define the profile types for each provider
interface UdemyProfile {
  id: string;
  display_name: string;
  email: string;
  image_url: string;
}

interface CourseraProfile {
  id: string;
  name: string;
  email: string;
  photo_url: string;
}

// Custom providers for education platforms with proper type declarations
const educationProviders: Record<string, OAuthConfig<UdemyProfile | CourseraProfile>> = {
  udemy: {
    id: "udemy",
    name: "Udemy",
    type: "oauth" as const,
    authorization: "https://www.udemy.com/oauth2/authorize",
    token: "https://www.udemy.com/oauth2/token",
    userinfo: "https://www.udemy.com/api-2.0/users/me",
    clientId: process.env.UDEMY_CLIENT_ID ?? '',
    clientSecret: process.env.UDEMY_CLIENT_SECRET ?? '',
    profile(profile) {
      const udemyProfile = profile as UdemyProfile;
      return {
        id: udemyProfile.id,
        name: udemyProfile.display_name,
        email: udemyProfile.email,
        image: udemyProfile.image_url
      };
    },
  },
  coursera: {
    id: "coursera",
    name: "Coursera",
    type: "oauth" as const,
    authorization: "https://accounts.coursera.org/oauth2/v1/auth",
    token: "https://accounts.coursera.org/oauth2/v1/token",
    userinfo: "https://api.coursera.org/api/users/v1/me",
    clientId: process.env.COURSERA_CLIENT_ID ?? '',
    clientSecret: process.env.COURSERA_CLIENT_SECRET ?? '',
    profile(profile) {
      const courseraProfile = profile as CourseraProfile;
      return {
        id: courseraProfile.id,
        name: courseraProfile.name,
        email: courseraProfile.email,
        image: courseraProfile.photo_url
      };
    },
  },
  // Add more education providers as needed
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req): Promise<any | null> {
        // Implement your credentials auth logic
        // Return user object or null
        return null; // placeholder
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    // Add education providers dynamically
    ...Object.values(educationProviders),
  ],
  callbacks: {
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      // Initial sign in
      if (account && user) {
        // Store provider tokens in the JWT
        token.userId = user.id;
        
        if (account.provider && account.access_token) {
          // Store access tokens with provider as key
          if (!token.providers) token.providers = {};
          token.providers[account.provider] = {
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at,
            tokenType: account.token_type,
          };
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // Add connected providers to session for client-side use
      session.user.id = token.userId;
      
      // Add list of connected providers without exposing tokens
      if (token.providers) {
        session.connectedProviders = Object.keys(token.providers);
      } else {
        session.connectedProviders = [];
      }
      
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    newUser: '/auth/register'
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };