/**
 * Production-ready authentication configuration
 * Protects demo account and manages user tiers
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db-production";
import { compare } from "bcryptjs";
import { UserRole, SubscriptionTier } from "@prisma/client";
import { createSecurityAuditLog } from "@/lib/services/security-service";

// Demo account credentials (never change these)
const DEMO_EMAIL = process.env.DEMO_USER_EMAIL || "demo@example.com";
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || "password";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Check if it's the demo account
        if (credentials.email === DEMO_EMAIL && credentials.password === DEMO_PASSWORD) {
          // Return or create demo user
          let demoUser = await prisma.user.findUnique({
            where: { email: DEMO_EMAIL }
          });

          if (!demoUser) {
            demoUser = await createDemoUser();
          }

          await createSecurityAuditLog({
            userId: demoUser.id,
            event: "Demo account login",
            eventType: "LOGIN_SUCCESS",
            metadata: { demo: true }
          });

          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            subscriptionTier: demoUser.subscriptionTier,
            isDemoAccount: true
          };
        }

        // Regular user authentication
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            mfaSettings: true
          }
        });

        if (!user || !user.password) {
          await createSecurityAuditLog({
            event: "Failed login attempt",
            eventType: "LOGIN_FAILED",
            metadata: { email: credentials.email }
          });
          throw new Error("Invalid credentials");
        }

        // Check password
        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) {
          await createSecurityAuditLog({
            userId: user.id,
            event: "Failed login - invalid password",
            eventType: "LOGIN_FAILED"
          });
          throw new Error("Invalid credentials");
        }

        // Check if account is locked
        const lockoutStatus = await checkAccountLockout(user.id);
        if (lockoutStatus.isLocked) {
          throw new Error("Account is locked. Please try again later.");
        }

        // Log successful login
        await createSecurityAuditLog({
          userId: user.id,
          event: "Successful login",
          eventType: "LOGIN_SUCCESS"
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          isDemoAccount: user.isDemoAccount,
          requiresMfa: user.mfaSettings?.enabled || false
        };
      }
    }),
    // Google OAuth (for future implementation)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code"
              }
            }
          })
        ]
      : [])
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    newUser: "/onboarding"
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subscriptionTier = user.subscriptionTier;
        token.isDemoAccount = user.isDemoAccount;
        token.requiresMfa = user.requiresMfa;
      }

      // Handle OAuth account linking
      if (account?.provider && account.provider !== "credentials") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string }
        });
        
        if (dbUser) {
          token.role = dbUser.role;
          token.subscriptionTier = dbUser.subscriptionTier;
          token.isDemoAccount = dbUser.isDemoAccount;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.subscriptionTier = token.subscriptionTier as SubscriptionTier;
        session.user.isDemoAccount = token.isDemoAccount as boolean;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Prevent modifications to demo account
      if (user.email === DEMO_EMAIL && account?.provider !== "credentials") {
        return false; // Don't allow OAuth for demo account
      }

      return true;
    }
  },
  events: {
    async signOut({ token }) {
      if (token?.id) {
        await createSecurityAuditLog({
          userId: token.id as string,
          event: "User logged out",
          eventType: "LOGOUT"
        });
      }
    }
  }
};

/**
 * Create demo user with sample data
 */
async function createDemoUser() {
  const demoUser = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: "Demo User",
      role: UserRole.DEMO,
      subscriptionTier: SubscriptionTier.PRO, // Demo has Pro features
      isDemoAccount: true,
      onboardingCompleted: true,
      emailVerified: new Date(),
      password: await hashPassword(DEMO_PASSWORD)
    }
  });

  // Create sample financial data for demo user
  await createDemoFinancialData(demoUser.id);

  return demoUser;
}

/**
 * Create sample financial data for demo account
 */
async function createDemoFinancialData(userId: string) {
  // Create sample accounts
  const checkingAccount = await prisma.financialAccount.create({
    data: {
      userId,
      accountName: "Demo Checking",
      accountType: "CHECKING",
      institutionName: "Demo Bank",
      currentBalance: 5234.56,
      availableBalance: 5234.56,
      dataSource: "MANUAL",
      isActive: true
    }
  });

  const savingsAccount = await prisma.financialAccount.create({
    data: {
      userId,
      accountName: "Demo Savings",
      accountType: "SAVINGS",
      institutionName: "Demo Bank",
      currentBalance: 15678.90,
      availableBalance: 15678.90,
      dataSource: "MANUAL",
      isActive: true
    }
  });

  const creditCard = await prisma.financialAccount.create({
    data: {
      userId,
      accountName: "Demo Credit Card",
      accountType: "CREDIT_CARD",
      institutionName: "Demo Card Co",
      currentBalance: -1234.56,
      creditLimit: 10000,
      minimumPayment: 35,
      apr: 18.99,
      dataSource: "MANUAL",
      isActive: true
    }
  });

  // Create sample categories
  const categories = await prisma.category.createMany({
    data: [
      { name: "Groceries", userId, icon: "🛒", color: "#4CAF50" },
      { name: "Dining", userId, icon: "🍽️", color: "#FF9800" },
      { name: "Transportation", userId, icon: "🚗", color: "#2196F3" },
      { name: "Entertainment", userId, icon: "🎮", color: "#9C27B0" },
      { name: "Utilities", userId, icon: "💡", color: "#795548" }
    ]
  });

  // Create sample transactions
  const transactionData = [
    {
      userId,
      accountId: checkingAccount.id,
      transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      amount: -45.23,
      description: "Whole Foods Market",
      categoryId: (await prisma.category.findFirst({ where: { userId, name: "Groceries" } }))?.id
    },
    {
      userId,
      accountId: checkingAccount.id,
      transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      amount: -28.50,
      description: "Local Restaurant",
      categoryId: (await prisma.category.findFirst({ where: { userId, name: "Dining" } }))?.id
    },
    {
      userId,
      accountId: checkingAccount.id,
      transactionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      amount: 2500.00,
      description: "Salary Deposit",
    },
    {
      userId,
      accountId: creditCard.id,
      transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      amount: -89.99,
      description: "Amazon Purchase",
      categoryId: (await prisma.category.findFirst({ where: { userId, name: "Entertainment" } }))?.id
    }
  ];

  await prisma.transaction.createMany({ data: transactionData });

  // Create sample budget
  await prisma.budget.create({
    data: {
      userId,
      name: "Monthly Groceries",
      amount: 500,
      period: "MONTHLY",
      categoryId: (await prisma.category.findFirst({ where: { userId, name: "Groceries" } }))?.id,
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      currentSpent: 45.23
    }
  });

  // Create sample goal
  await prisma.goal.create({
    data: {
      userId,
      name: "Emergency Fund",
      description: "Build 6 months of expenses",
      targetAmount: 20000,
      currentAmount: 15678.90,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      goalType: "EMERGENCY_FUND",
      priority: "HIGH",
      accountId: savingsAccount.id
    }
  });

  // Create sample insights
  await prisma.insight.createMany({
    data: [
      {
        userId,
        type: "SAVINGS_OPPORTUNITY",
        category: "Finance",
        title: "Reduce Dining Expenses",
        description: "You spent 15% more on dining this month compared to your average. Consider cooking more meals at home to save approximately $150/month.",
        aiGenerated: true,
        confidence: 0.85
      },
      {
        userId,
        type: "GOAL_PROGRESS",
        category: "Goals",
        title: "Emergency Fund Progress",
        description: "Great job! You're 78% of the way to your emergency fund goal. At your current savings rate, you'll reach it in 3 months.",
        aiGenerated: true,
        confidence: 0.92
      }
    ]
  });
}

/**
 * Check if account is locked due to failed login attempts
 */
async function checkAccountLockout(userId: string): Promise<{ isLocked: boolean; minutesRemaining?: number }> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const recentFailedAttempts = await prisma.securityAuditLog.count({
    where: {
      userId,
      eventType: "LOGIN_FAILED",
      createdAt: { gte: fiveMinutesAgo }
    }
  });

  if (recentFailedAttempts >= 5) {
    // Check if there's a recent lockout
    const lockoutEvent = await prisma.securityAuditLog.findFirst({
      where: {
        userId,
        eventType: "ACCOUNT_LOCKED",
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } // 15 minute lockout
      },
      orderBy: { createdAt: "desc" }
    });

    if (lockoutEvent) {
      const lockoutExpiry = new Date(lockoutEvent.createdAt.getTime() + 15 * 60 * 1000);
      const minutesRemaining = Math.ceil((lockoutExpiry.getTime() - Date.now()) / (60 * 1000));
      
      if (minutesRemaining > 0) {
        return { isLocked: true, minutesRemaining };
      }
    } else {
      // Create lockout event
      await createSecurityAuditLog({
        userId,
        event: "Account locked due to failed login attempts",
        eventType: "ACCOUNT_LOCKED"
      });
      
      return { isLocked: true, minutesRemaining: 15 };
    }
  }

  return { isLocked: false };
}

/**
 * Hash password using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  const { hash } = await import("bcryptjs");
  return hash(password, 12);
}

// Type augmentation for NextAuth
declare module "next-auth" {
  interface User {
    role: UserRole;
    subscriptionTier: SubscriptionTier;
    isDemoAccount: boolean;
    requiresMfa?: boolean;
  }
  
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      subscriptionTier: SubscriptionTier;
      isDemoAccount: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    subscriptionTier: SubscriptionTier;
    isDemoAccount: boolean;
    requiresMfa?: boolean;
  }
}