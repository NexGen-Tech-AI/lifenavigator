/**
 * Individual account operations API
 * GET /api/v1/accounts/[id] - Get account details
 * PUT /api/v1/accounts/[id] - Update account
 * DELETE /api/v1/accounts/[id] - Delete account
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db-prod';
import {
  withErrorHandler,
  requireAuth,
  validateRequest,
  successResponse,
  NotFoundError,
  AuthorizationError,
  ConflictError
} from '@/lib/api/route-helpers';
import { AccountType } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

// Validation schemas
const updateAccountSchema = z.object({
  accountName: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  currentBalance: z.number().optional(),
  availableBalance: z.number().optional(),
  creditLimit: z.number().optional(),
  minimumPayment: z.number().optional(),
  apr: z.number().min(0).max(100).optional(),
  notes: z.string().max(500).optional()
});

// GET /api/v1/accounts/[id] - Get account details
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const user = await requireAuth(request);
  const { id } = params;
  
  const account = await prisma.financialAccount.findFirst({
    where: {
      id,
      userId: user.id
    },
    include: {
      manualAccount: true,
      plaidItem: {
        select: {
          institutionName: true,
          lastSuccessfulSync: true,
          lastSyncError: true
        }
      },
      _count: {
        select: {
          transactions: true,
          budgets: true,
          goals: true
        }
      }
    }
  });
  
  if (!account) {
    throw new NotFoundError('Account not found');
  }
  
  // Get recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    where: {
      accountId: id,
      userId: user.id
    },
    include: {
      category: true,
      merchant: true
    },
    orderBy: { transactionDate: 'desc' },
    take: 10
  });
  
  // Calculate statistics
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const stats = await prisma.transaction.aggregate({
    where: {
      accountId: id,
      userId: user.id,
      transactionDate: { gte: thirtyDaysAgo }
    },
    _sum: {
      amount: true
    },
    _count: true
  });
  
  const monthlyInflow = await prisma.transaction.aggregate({
    where: {
      accountId: id,
      userId: user.id,
      transactionDate: { gte: thirtyDaysAgo },
      amount: { gt: 0 }
    },
    _sum: {
      amount: true
    }
  });
  
  const monthlyOutflow = await prisma.transaction.aggregate({
    where: {
      accountId: id,
      userId: user.id,
      transactionDate: { gte: thirtyDaysAgo },
      amount: { lt: 0 }
    },
    _sum: {
      amount: true
    }
  });
  
  // Format response
  const response = {
    ...account,
    accountNumber: account.accountNumber ? '****' : null,
    routingNumber: null,
    recentTransactions,
    statistics: {
      transactionCount: account._count.transactions,
      budgetCount: account._count.budgets,
      goalCount: account._count.goals,
      last30Days: {
        transactionCount: stats._count,
        netFlow: stats._sum.amount || 0,
        inflow: monthlyInflow._sum.amount || 0,
        outflow: Math.abs(monthlyOutflow._sum.amount || 0)
      }
    }
  };
  
  return successResponse(response);
});

// PUT /api/v1/accounts/[id] - Update account
export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const user = await requireAuth(request);
  const { id } = params;
  const data = await validateRequest(request, updateAccountSchema);
  
  // Check ownership
  const account = await prisma.financialAccount.findFirst({
    where: {
      id,
      userId: user.id
    }
  });
  
  if (!account) {
    throw new NotFoundError('Account not found');
  }
  
  // Don't allow manual balance updates for connected accounts
  if (account.dataSource !== 'MANUAL' && 
      (data.currentBalance !== undefined || data.availableBalance !== undefined)) {
    throw new ConflictError('Cannot manually update balance for connected accounts');
  }
  
  // Update account
  const updatedAccount = await prisma.financialAccount.update({
    where: { id },
    data: {
      accountName: data.accountName,
      isActive: data.isActive,
      isHidden: data.isHidden,
      currentBalance: data.currentBalance,
      availableBalance: data.availableBalance,
      creditLimit: data.creditLimit,
      minimumPayment: data.minimumPayment,
      apr: data.apr
    }
  });
  
  // Update manual account notes if provided
  if (data.notes !== undefined && account.dataSource === 'MANUAL') {
    await prisma.manualAccount.upsert({
      where: { accountId: id },
      create: {
        accountId: id,
        notes: data.notes
      },
      update: {
        notes: data.notes
      }
    });
  }
  
  // Update financial snapshot if balance changed
  if (data.currentBalance !== undefined || data.availableBalance !== undefined) {
    await updateFinancialSnapshot(user.id);
  }
  
  return successResponse(updatedAccount, 'Account updated successfully');
});

// DELETE /api/v1/accounts/[id] - Delete account
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const user = await requireAuth(request);
  const { id } = params;
  
  // Check ownership
  const account = await prisma.financialAccount.findFirst({
    where: {
      id,
      userId: user.id
    },
    include: {
      _count: {
        select: {
          transactions: true,
          budgets: true,
          goals: true
        }
      }
    }
  });
  
  if (!account) {
    throw new NotFoundError('Account not found');
  }
  
  // Warn if account has related data
  const hasRelatedData = 
    account._count.transactions > 0 ||
    account._count.budgets > 0 ||
    account._count.goals > 0;
  
  if (hasRelatedData) {
    // Soft delete - just mark as inactive
    await prisma.financialAccount.update({
      where: { id },
      data: {
        isActive: false,
        isHidden: true
      }
    });
    
    return successResponse(
      { id, status: 'deactivated' },
      'Account deactivated. Related data preserved.'
    );
  } else {
    // Hard delete if no related data
    await prisma.financialAccount.delete({
      where: { id }
    });
    
    return successResponse(
      { id, status: 'deleted' },
      'Account deleted successfully'
    );
  }
});

// Helper function to update financial snapshot
async function updateFinancialSnapshot(userId: string) {
  // Same implementation as in the main accounts route
  // Could be extracted to a shared service
  const accounts = await prisma.financialAccount.findMany({
    where: { userId, isActive: true }
  });
  
  const totalAssets = accounts
    .filter(a => ['CHECKING', 'SAVINGS', 'INVESTMENT'].includes(a.accountType))
    .reduce((sum, a) => sum + a.currentBalance, 0);
  
  const totalLiabilities = accounts
    .filter(a => ['CREDIT_CARD', 'LOAN', 'MORTGAGE'].includes(a.accountType))
    .reduce((sum, a) => sum + Math.abs(a.currentBalance), 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  await prisma.financialSnapshot.upsert({
    where: {
      userId_snapshotDate: {
        userId,
        snapshotDate: today
      }
    },
    create: {
      userId,
      snapshotDate: today,
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      monthlyIncome: 0, // Will be calculated from transactions
      monthlyExpenses: 0, // Will be calculated from transactions
      savingsRate: 0,
      accountBalances: accounts.map(a => ({
        accountId: a.id,
        accountName: a.accountName,
        balance: a.currentBalance
      })),
      categorySpending: {}
    },
    update: {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      accountBalances: accounts.map(a => ({
        accountId: a.id,
        accountName: a.accountName,
        balance: a.currentBalance
      }))
    }
  });
}