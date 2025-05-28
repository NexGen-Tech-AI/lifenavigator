/**
 * Production database seeder
 * Creates demo account with sample data
 */

import { PrismaClient, UserRole, SubscriptionTier, AccountType, DataSource } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Demo account credentials (never change these)
const DEMO_EMAIL = process.env.DEMO_USER_EMAIL || 'demo@example.com';
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'password';

async function main() {
  console.log('🌱 Starting production database seed...');

  // Create demo user
  const hashedPassword = await hash(DEMO_PASSWORD, 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      password: hashedPassword,
      name: 'Demo User',
      role: UserRole.DEMO,
      subscriptionTier: SubscriptionTier.PRO,
      subscriptionStatus: 'ACTIVE',
      isDemoAccount: true,
      onboardingCompleted: true,
      emailVerified: new Date(),
      referralCode: 'DEMO2024'
    }
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create system categories
  const systemCategories = [
    { name: 'Income', icon: '💰', color: '#10B981', isSystem: true },
    { name: 'Housing', icon: '🏠', color: '#6366F1', isSystem: true },
    { name: 'Transportation', icon: '🚗', color: '#3B82F6', isSystem: true },
    { name: 'Food & Dining', icon: '🍽️', color: '#F59E0B', isSystem: true },
    { name: 'Shopping', icon: '🛍️', color: '#EC4899', isSystem: true },
    { name: 'Entertainment', icon: '🎮', color: '#8B5CF6', isSystem: true },
    { name: 'Healthcare', icon: '🏥', color: '#EF4444', isSystem: true },
    { name: 'Education', icon: '📚', color: '#14B8A6', isSystem: true },
    { name: 'Utilities', icon: '💡', color: '#78716C', isSystem: true },
    { name: 'Insurance', icon: '🛡️', color: '#0EA5E9', isSystem: true },
    { name: 'Savings', icon: '💎', color: '#22C55E', isSystem: true },
    { name: 'Investments', icon: '📈', color: '#6366F1', isSystem: true },
    { name: 'Other', icon: '📌', color: '#6B7280', isSystem: true }
  ];

  for (const category of systemCategories) {
    await prisma.category.upsert({
      where: { 
        userId_name: {
          userId: null,
          name: category.name
        }
      },
      update: {},
      create: category as any
    });
  }

  console.log('✅ Created system categories');

  // Create demo user categories
  const userCategories = [
    { userId: demoUser.id, name: 'Groceries', icon: '🛒', color: '#059669', parentId: null },
    { userId: demoUser.id, name: 'Restaurants', icon: '🍕', color: '#DC2626', parentId: null },
    { userId: demoUser.id, name: 'Coffee Shops', icon: '☕', color: '#92400E', parentId: null },
    { userId: demoUser.id, name: 'Gas', icon: '⛽', color: '#1E40AF', parentId: null },
    { userId: demoUser.id, name: 'Subscriptions', icon: '🔄', color: '#7C3AED', parentId: null }
  ];

  for (const category of userCategories) {
    await prisma.category.upsert({
      where: {
        userId_name: {
          userId: category.userId,
          name: category.name
        }
      },
      update: {},
      create: category
    });
  }

  console.log('✅ Created user categories');

  // Create demo financial accounts
  const checkingAccount = await prisma.financialAccount.create({
    data: {
      userId: demoUser.id,
      accountName: 'Main Checking',
      accountType: AccountType.CHECKING,
      institutionName: 'Chase Bank',
      currentBalance: 8543.21,
      availableBalance: 8543.21,
      dataSource: DataSource.MANUAL,
      currency: 'USD',
      isActive: true
    }
  });

  const savingsAccount = await prisma.financialAccount.create({
    data: {
      userId: demoUser.id,
      accountName: 'Emergency Savings',
      accountType: AccountType.SAVINGS,
      institutionName: 'Chase Bank',
      currentBalance: 25420.50,
      availableBalance: 25420.50,
      dataSource: DataSource.MANUAL,
      currency: 'USD',
      isActive: true
    }
  });

  const creditCard = await prisma.financialAccount.create({
    data: {
      userId: demoUser.id,
      accountName: 'Sapphire Reserve',
      accountType: AccountType.CREDIT_CARD,
      institutionName: 'Chase Bank',
      currentBalance: -2156.43,
      availableBalance: 17843.57,
      creditLimit: 20000,
      minimumPayment: 65,
      apr: 21.99,
      dataSource: DataSource.MANUAL,
      currency: 'USD',
      isActive: true
    }
  });

  const investmentAccount = await prisma.financialAccount.create({
    data: {
      userId: demoUser.id,
      accountName: 'Investment Portfolio',
      accountType: AccountType.INVESTMENT,
      institutionName: 'Vanguard',
      currentBalance: 125750.32,
      availableBalance: 125750.32,
      dataSource: DataSource.MANUAL,
      currency: 'USD',
      isActive: true
    }
  });

  console.log('✅ Created financial accounts');

  // Create sample transactions
  const now = new Date();
  const transactions = [
    // Income
    {
      userId: demoUser.id,
      accountId: checkingAccount.id,
      transactionDate: new Date(now.getFullYear(), now.getMonth(), 1),
      amount: 5500,
      description: 'Salary Deposit - Acme Corp',
      categoryId: await getCategoryId('Income'),
      dataSource: DataSource.MANUAL
    },
    {
      userId: demoUser.id,
      accountId: checkingAccount.id,
      transactionDate: new Date(now.getFullYear(), now.getMonth(), 15),
      amount: 5500,
      description: 'Salary Deposit - Acme Corp',
      categoryId: await getCategoryId('Income'),
      dataSource: DataSource.MANUAL
    },
    // Expenses
    {
      userId: demoUser.id,
      accountId: checkingAccount.id,
      transactionDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      amount: -125.43,
      description: 'Whole Foods Market',
      categoryId: await getCategoryId('Groceries', demoUser.id),
      dataSource: DataSource.MANUAL
    },
    {
      userId: demoUser.id,
      accountId: creditCard.id,
      transactionDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      amount: -45.23,
      description: 'Shell Gas Station',
      categoryId: await getCategoryId('Gas', demoUser.id),
      dataSource: DataSource.MANUAL
    },
    {
      userId: demoUser.id,
      accountId: creditCard.id,
      transactionDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      amount: -89.50,
      description: 'The Cheesecake Factory',
      categoryId: await getCategoryId('Restaurants', demoUser.id),
      dataSource: DataSource.MANUAL
    },
    {
      userId: demoUser.id,
      accountId: checkingAccount.id,
      transactionDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      amount: -1200,
      description: 'Rent Payment',
      categoryId: await getCategoryId('Housing'),
      dataSource: DataSource.MANUAL
    },
    {
      userId: demoUser.id,
      accountId: creditCard.id,
      transactionDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      amount: -15.99,
      description: 'Netflix Subscription',
      categoryId: await getCategoryId('Subscriptions', demoUser.id),
      dataSource: DataSource.MANUAL
    },
    // Transfer to savings
    {
      userId: demoUser.id,
      accountId: checkingAccount.id,
      transactionDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      amount: -500,
      description: 'Transfer to Savings',
      categoryId: await getCategoryId('Savings'),
      dataSource: DataSource.MANUAL
    }
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({ data: transaction });
  }

  console.log('✅ Created sample transactions');

  // Create budgets
  const budgets = [
    {
      userId: demoUser.id,
      name: 'Monthly Groceries',
      amount: 600,
      period: 'MONTHLY',
      categoryId: await getCategoryId('Groceries', demoUser.id),
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      currentSpent: 125.43,
      alertEnabled: true,
      alertThreshold: 0.8
    },
    {
      userId: demoUser.id,
      name: 'Dining Out',
      amount: 400,
      period: 'MONTHLY',
      categoryId: await getCategoryId('Restaurants', demoUser.id),
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      currentSpent: 89.50,
      alertEnabled: true,
      alertThreshold: 0.9
    },
    {
      userId: demoUser.id,
      name: 'Transportation',
      amount: 250,
      period: 'MONTHLY',
      categoryId: await getCategoryId('Transportation'),
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      currentSpent: 45.23,
      alertEnabled: true,
      alertThreshold: 0.8
    }
  ];

  for (const budget of budgets) {
    await prisma.budget.create({ data: budget as any });
  }

  console.log('✅ Created budgets');

  // Create goals
  const goals = [
    {
      userId: demoUser.id,
      name: 'Emergency Fund',
      description: 'Build 6 months of expenses',
      targetAmount: 30000,
      currentAmount: 25420.50,
      targetDate: new Date(now.getFullYear() + 1, now.getMonth(), 1),
      goalType: 'EMERGENCY_FUND',
      priority: 'HIGH',
      accountId: savingsAccount.id
    },
    {
      userId: demoUser.id,
      name: 'Dream Vacation',
      description: 'Trip to Japan',
      targetAmount: 5000,
      currentAmount: 1250,
      targetDate: new Date(now.getFullYear() + 1, 5, 1),
      goalType: 'SAVINGS',
      priority: 'MEDIUM'
    },
    {
      userId: demoUser.id,
      name: 'Pay Off Credit Card',
      description: 'Eliminate credit card debt',
      targetAmount: 2156.43,
      currentAmount: 0,
      targetDate: new Date(now.getFullYear(), now.getMonth() + 6, 1),
      goalType: 'DEBT_PAYOFF',
      priority: 'HIGH',
      accountId: creditCard.id
    }
  ];

  for (const goal of goals) {
    await prisma.goal.create({ data: goal as any });
  }

  console.log('✅ Created goals');

  // Create insights
  const insights = [
    {
      userId: demoUser.id,
      type: 'SPENDING_ALERT',
      category: 'Budget',
      title: 'Grocery Budget Alert',
      description: 'You\'ve spent $125.43 (21%) of your $600 grocery budget this month. You\'re on track to stay within budget.',
      aiGenerated: true,
      confidence: 0.92,
      isActionable: false,
      validFrom: now
    },
    {
      userId: demoUser.id,
      type: 'SAVINGS_OPPORTUNITY',
      category: 'Savings',
      title: 'Subscription Optimization',
      description: 'Review your subscriptions. You could save $45/month by switching to annual plans for Netflix and Spotify.',
      aiGenerated: true,
      confidence: 0.88,
      isActionable: true,
      actionUrl: '/dashboard/finance/transactions?category=subscriptions',
      validFrom: now
    },
    {
      userId: demoUser.id,
      type: 'GOAL_PROGRESS',
      category: 'Goals',
      title: 'Emergency Fund Progress',
      description: 'Great job! You\'re 85% of the way to your emergency fund goal. At your current savings rate, you\'ll reach it in 2 months.',
      aiGenerated: true,
      confidence: 0.95,
      isActionable: false,
      validFrom: now
    }
  ];

  for (const insight of insights) {
    await prisma.insight.create({ data: insight as any });
  }

  console.log('✅ Created insights');

  // Create a financial snapshot
  await prisma.financialSnapshot.create({
    data: {
      userId: demoUser.id,
      snapshotDate: new Date(now.setHours(0, 0, 0, 0)),
      totalAssets: checkingAccount.currentBalance + savingsAccount.currentBalance + investmentAccount.currentBalance,
      totalLiabilities: Math.abs(creditCard.currentBalance),
      netWorth: checkingAccount.currentBalance + savingsAccount.currentBalance + investmentAccount.currentBalance + creditCard.currentBalance,
      monthlyIncome: 11000,
      monthlyExpenses: 3000,
      savingsRate: 0.27,
      accountBalances: [
        { accountId: checkingAccount.id, accountName: 'Main Checking', balance: checkingAccount.currentBalance },
        { accountId: savingsAccount.id, accountName: 'Emergency Savings', balance: savingsAccount.currentBalance },
        { accountId: creditCard.id, accountName: 'Sapphire Reserve', balance: creditCard.currentBalance },
        { accountId: investmentAccount.id, accountName: 'Investment Portfolio', balance: investmentAccount.currentBalance }
      ],
      categorySpending: {}
    }
  });

  console.log('✅ Created financial snapshot');

  console.log('🎉 Production database seed completed!');
}

// Helper function to get category ID
async function getCategoryId(name: string, userId?: string): Promise<string | undefined> {
  const category = await prisma.category.findFirst({
    where: {
      name,
      OR: [
        { userId: userId || null },
        { userId: null, isSystem: true }
      ]
    }
  });
  return category?.id;
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });