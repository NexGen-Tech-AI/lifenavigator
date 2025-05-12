// app/api/auth/NextAuth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import type { OAuthConfig } from "next-auth/providers/oauth";
// import { compare } from 'bcrypt';

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
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req): Promise<any | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          // Import modules here to avoid circular dependencies
          const { prisma } = await import('@/lib/db');
          
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
          
          // Check if user exists and verify password
          if (!user || !user.password) {
            return null;
          }
          
          // Temporarily bypass password check for development
          // const isPasswordValid = await compare(credentials.password, user.password);

          // if (!isPasswordValid) {
          //   return null;
          // }

          // Just check if passwords match directly (only for development)
          if (credentials.password !== 'password123') {
            return null;
          }
          
          // Return user object without password
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            setupCompleted: user.setupCompleted
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID ?? '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET ?? '',
      version: "2.0", // Use API v2
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
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
        token.user = {
          id: user.id,
          setupCompleted: user.setupCompleted || false,
        };
        
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
      
      // If we already have a token but not the setupCompleted flag (for existing sessions)
      if (token.userId && !token.user?.setupCompleted) {
        // Fetch the user from the database to check setupCompleted status
        try {
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/users/${token.userId}`);
          if (res.ok) {
            const userData = await res.json();
            
            if (userData && userData.user) {
              if (!token.user) token.user = {};
              token.user.setupCompleted = userData.user.setupCompleted || false;
            }
          }
        } catch (error) {
          console.error('Error fetching user setup status:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // Add connected providers and user data to session for client-side use
      session.user.id = token.userId;
      
      // Add setupCompleted flag
      if (token.user) {
        session.user.setupCompleted = token.user.setupCompleted || false;
      }
      
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