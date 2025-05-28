/**
 * Transactions management API
 * GET /api/v1/transactions - List transactions with filtering
 * POST /api/v1/transactions - Create manual transaction
 * POST /api/v1/transactions/bulk - Bulk import transactions
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db-prod';
import {
  withErrorHandler,
  requireAuth,
  validateRequest,
  successResponse,
  paginatedResponse,
  getPaginationParams,
  getQueryParams,
  NotFoundError,
  ValidationError
} from '@/lib/api/route-helpers';
import { DataSource } from '@prisma/client';

// Validation schemas
const createTransactionSchema = z.object({
  accountId: z.string(),
  transactionDate: z.string().datetime(),
  amount: z.number(),
  description: z.string().min(1).max(255),
  categoryId: z.string().optional(),
  merchantId: z.string().optional(),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  isPending: z.boolean().optional()
});

const bulkTransactionSchema = z.object({
  accountId: z.string(),
  transactions: z.array(z.object({
    date: z.string(),
    description: z.string(),
    amount: z.number(),
    category: z.string().optional(),
    notes: z.string().optional()
  }))
});

// GET /api/v1/transactions - List transactions
export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireAuth(request);
  const { page, pageSize, skip } = getPaginationParams(request);
  const params = getQueryParams(request);
  
  // Build filters
  const where: any = { userId: user.id };
  
  // Account filter
  if (params.accountId) {
    where.accountId = params.accountId;
  }
  
  // Date range filter
  if (params.startDate || params.endDate) {
    where.transactionDate = {};
    if (params.startDate) {
      where.transactionDate.gte = new Date(params.startDate);
    }
    if (params.endDate) {
      where.transactionDate.lte = new Date(params.endDate);
    }
  }
  
  // Amount range filter
  if (params.minAmount || params.maxAmount) {
    where.amount = {};
    if (params.minAmount) {
      where.amount.gte = parseFloat(params.minAmount);
    }
    if (params.maxAmount) {
      where.amount.lte = parseFloat(params.maxAmount);
    }
  }
  
  // Category filter
  if (params.categoryId) {
    where.categoryId = params.categoryId;
  }
  
  // Search filter
  if (params.search) {
    where.OR = [
      { description: { contains: params.search, mode: 'insensitive' } },
      { notes: { contains: params.search, mode: 'insensitive' } },
      { merchant: { name: { contains: params.search, mode: 'insensitive' } } }
    ];
  }
  
  // Pending filter
  if (params.isPending !== undefined) {
    where.isPending = params.isPending === 'true';
  }
  
  // Get transactions
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: {
            id: true,
            accountName: true,
            accountType: true,
            institutionName: true
          }
        },
        category: true,
        merchant: true,
        recurringTransaction: params.includeRecurring === 'true' ? true : false
      },
      orderBy: [
        { transactionDate: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: pageSize
    }),
    prisma.transaction.count({ where })
  ]);
  
  // Calculate summary if requested
  let summary = null;
  if (params.includeSummary === 'true') {
    const aggregates = await prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
      _avg: { amount: true },
      _min: { amount: true },
      _max: { amount: true }
    });
    
    const income = await prisma.transaction.aggregate({
      where: { ...where, amount: { gt: 0 } },
      _sum: { amount: true },
      _count: true
    });
    
    const expenses = await prisma.transaction.aggregate({
      where: { ...where, amount: { lt: 0 } },
      _sum: { amount: true },
      _count: true
    });
    
    summary = {
      total: total,
      totalAmount: aggregates._sum.amount || 0,
      averageAmount: aggregates._avg.amount || 0,
      minAmount: aggregates._min.amount || 0,
      maxAmount: aggregates._max.amount || 0,
      income: {
        total: income._sum.amount || 0,
        count: income._count
      },
      expenses: {
        total: Math.abs(expenses._sum.amount || 0),
        count: expenses._count
      },
      netFlow: (income._sum.amount || 0) + (expenses._sum.amount || 0)
    };
  }
  
  // Format response
  const response = paginatedResponse(transactions, page, pageSize, total);
  
  // Add summary if requested
  if (summary) {
    (response as any).body = JSON.stringify({
      ...JSON.parse(response.body),
      summary
    });
  }
  
  return response;
});

// POST /api/v1/transactions - Create manual transaction
export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireAuth(request);
  const data = await validateRequest(request, createTransactionSchema);
  
  // Verify account ownership
  const account = await prisma.financialAccount.findFirst({
    where: {
      id: data.accountId,
      userId: user.id
    }
  });
  
  if (!account) {
    throw new NotFoundError('Account not found');
  }
  
  // Create or find category
  let categoryId = data.categoryId;
  if (!categoryId && data.description) {
    // Try to auto-categorize based on description
    categoryId = await autoCategorize(user.id, data.description);
  }
  
  // Create or find merchant
  let merchantId = data.merchantId;
  if (!merchantId && data.description) {
    // Extract merchant from description
    const merchantName = extractMerchantName(data.description);
    if (merchantName) {
      const merchant = await prisma.merchant.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name: merchantName
          }
        },
        create: {
          userId: user.id,
          name: merchantName,
          displayName: merchantName
        },
        update: {}
      });
      merchantId = merchant.id;
    }
  }
  
  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: data.accountId,
      transactionDate: new Date(data.transactionDate),
      amount: data.amount,
      description: data.description,
      categoryId,
      merchantId,
      notes: data.notes,
      tags: data.tags || [],
      isPending: data.isPending || false,
      dataSource: DataSource.MANUAL
    },
    include: {
      account: {
        select: {
          accountName: true,
          accountType: true
        }
      },
      category: true,
      merchant: true
    }
  });
  
  // Update account balance if not pending
  if (!data.isPending) {
    await prisma.financialAccount.update({
      where: { id: data.accountId },
      data: {
        currentBalance: {
          increment: data.amount
        }
      }
    });
    
    // Update budget tracking
    if (categoryId) {
      await updateBudgetTracking(user.id, categoryId, data.amount);
    }
  }
  
  // Check for recurring pattern
  await checkRecurringPattern(user.id, transaction);
  
  return successResponse(transaction, 'Transaction created successfully', 201);
});

// POST /api/v1/transactions/bulk - Bulk import transactions
export async function POST_bulk(request: NextRequest) {
  return withErrorHandler(async (req: NextRequest) => {
    const user = await requireAuth(req);
    const data = await validateRequest(req, bulkTransactionSchema);
    
    // Verify account ownership
    const account = await prisma.financialAccount.findFirst({
      where: {
        id: data.accountId,
        userId: user.id
      }
    });
    
    if (!account) {
      throw new NotFoundError('Account not found');
    }
    
    // Process transactions in batches
    const results = {
      imported: 0,
      failed: 0,
      errors: [] as any[]
    };
    
    for (const txData of data.transactions) {
      try {
        // Parse and validate date
        const transactionDate = new Date(txData.date);
        if (isNaN(transactionDate.getTime())) {
          throw new Error('Invalid date format');
        }
        
        // Auto-categorize if category name provided
        let categoryId: string | undefined;
        if (txData.category) {
          const category = await prisma.category.findFirst({
            where: {
              userId: user.id,
              name: {
                equals: txData.category,
                mode: 'insensitive'
              }
            }
          });
          categoryId = category?.id;
        }
        
        // Create transaction
        await prisma.transaction.create({
          data: {
            userId: user.id,
            accountId: data.accountId,
            transactionDate,
            amount: txData.amount,
            description: txData.description,
            categoryId,
            notes: txData.notes,
            dataSource: DataSource.CSV_IMPORT
          }
        });
        
        results.imported++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: data.transactions.indexOf(txData) + 1,
          error: error.message
        });
      }
    }
    
    // Update account balance
    const balanceChange = data.transactions
      .filter((_, index) => !results.errors.some(e => e.row === index + 1))
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    await prisma.financialAccount.update({
      where: { id: data.accountId },
      data: {
        currentBalance: {
          increment: balanceChange
        }
      }
    });
    
    return successResponse(results, `Imported ${results.imported} transactions`);
  })(request);
}

// Helper functions
async function autoCategorize(userId: string, description: string): Promise<string | undefined> {
  // Simple rule-based categorization
  const rules = [
    { pattern: /grocery|supermarket|whole foods/i, category: 'Groceries' },
    { pattern: /restaurant|cafe|coffee|dining/i, category: 'Dining' },
    { pattern: /gas|fuel|shell|exxon/i, category: 'Transportation' },
    { pattern: /amazon|netflix|spotify|entertainment/i, category: 'Entertainment' },
    { pattern: /utilities|electric|water|internet/i, category: 'Utilities' },
    { pattern: /rent|mortgage/i, category: 'Housing' },
    { pattern: /salary|paycheck|deposit/i, category: 'Income' }
  ];
  
  for (const rule of rules) {
    if (rule.pattern.test(description)) {
      const category = await prisma.category.findFirst({
        where: {
          userId,
          name: rule.category
        }
      });
      return category?.id;
    }
  }
  
  return undefined;
}

function extractMerchantName(description: string): string | null {
  // Clean up common transaction description patterns
  let cleaned = description
    .replace(/\*\d+/g, '') // Remove masked card numbers
    .replace(/\d{2}\/\d{2}/g, '') // Remove dates
    .replace(/[#]\d+/g, '') // Remove reference numbers
    .trim();
  
  // Take first meaningful part
  const parts = cleaned.split(/\s{2,}|\s+-\s+/);
  return parts[0]?.trim() || null;
}

async function updateBudgetTracking(userId: string, categoryId: string, amount: number) {
  if (amount >= 0) return; // Only track expenses
  
  const now = new Date();
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      categoryId,
      isActive: true,
      startDate: { lte: now },
      OR: [
        { endDate: null },
        { endDate: { gte: now } }
      ]
    }
  });
  
  for (const budget of budgets) {
    await prisma.budget.update({
      where: { id: budget.id },
      data: {
        currentSpent: {
          increment: Math.abs(amount)
        },
        lastCalculated: now
      }
    });
    
    // Check if alert threshold reached
    const percentUsed = (budget.currentSpent + Math.abs(amount)) / budget.amount;
    if (budget.alertEnabled && percentUsed >= budget.alertThreshold) {
      await createBudgetAlert(userId, budget, percentUsed);
    }
  }
}

async function createBudgetAlert(userId: string, budget: any, percentUsed: number) {
  await prisma.notification.create({
    data: {
      userId,
      type: 'BUDGET_ALERT',
      title: `Budget Alert: ${budget.name}`,
      message: `You've used ${Math.round(percentUsed * 100)}% of your ${budget.name} budget`,
      data: {
        budgetId: budget.id,
        percentUsed,
        amount: budget.amount,
        spent: budget.currentSpent
      },
      channels: ['in_app', 'email']
    }
  });
}

async function checkRecurringPattern(userId: string, transaction: any) {
  // Look for similar transactions in the past
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const similar = await prisma.transaction.findMany({
    where: {
      userId,
      accountId: transaction.accountId,
      merchantId: transaction.merchantId,
      amount: {
        gte: transaction.amount * 0.9,
        lte: transaction.amount * 1.1
      },
      transactionDate: {
        gte: thirtyDaysAgo,
        lt: transaction.transactionDate
      }
    },
    orderBy: { transactionDate: 'desc' }
  });
  
  if (similar.length >= 2) {
    // Potential recurring transaction detected
    // This would trigger more sophisticated analysis in production
  }
}