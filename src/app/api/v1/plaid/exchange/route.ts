/**
 * Plaid token exchange API
 * POST /api/v1/plaid/exchange - Exchange public token for access token and sync accounts
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { prisma } from '@/lib/db-prod';
import {
  withErrorHandler,
  requireSubscription,
  validateRequest,
  successResponse,
  errorResponse
} from '@/lib/api/route-helpers';
import { encrypt } from '@/lib/encryption/simple';
import { createSecurityAuditLog } from '@/lib/services/security-service';
// Define AccountType enum locally since it's not exported by @prisma/client
enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD = 'CREDIT_CARD',
  LOAN = 'LOAN',
  MORTGAGE = 'MORTGAGE',
  INVESTMENT = 'INVESTMENT',
  OTHER = 'OTHER'
}
// Define DataSource enum locally since it's not exported by @prisma/client
enum DataSource {
  PLAID = 'PLAID'
}

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Validation schema
const exchangeTokenSchema = z.object({
  publicToken: z.string(),
  institutionId: z.string(),
  institutionName: z.string(),
  accounts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    mask: z.string().optional(),
    type: z.string(),
    subtype: z.string()
  })).optional()
});

// POST /api/v1/plaid/exchange - Exchange public token
export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireSubscription(request, 'PRO');
  const data = await validateRequest(request, exchangeTokenSchema);
  
  try {
    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: data.publicToken
    });
    
    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;
    
    // Encrypt access token before storing
    const encryptedToken = await encrypt(accessToken);
    
    // Create or update PlaidItem
    const plaidItem = await prisma.plaidItem?.upsert({
      where: { itemId },
      create: {
        userId: user.id,
        accessToken: encryptedToken,
        itemId,
        institutionId: data.institutionId,
        institutionName: data.institutionName,
        isActive: true,
        webhookUrl: process.env.PLAID_WEBHOOK_URL
      },
      update: {
        accessToken: encryptedToken,
        isActive: true,
        lastSuccessfulSync: new Date()
      }
    });
    
    // Get accounts from Plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken
    });
    
    // Map Plaid account types to our types
    const mapAccountType = (type: string, subtype: string): AccountType => {
      if (type === 'depository') {
        return subtype === 'savings' ? AccountType.SAVINGS : AccountType.CHECKING;
      } else if (type === 'credit') {
        return AccountType.CREDIT_CARD;
      } else if (type === 'loan') {
        return subtype === 'mortgage' ? AccountType.MORTGAGE : AccountType.LOAN;
      } else if (type === 'investment') {
        return AccountType.INVESTMENT;
      }
      return AccountType.OTHER;
    };
    
    // Create or update accounts
    const createdAccounts = [];
    for (const plaidAccount of accountsResponse.data.accounts) {
      const accountType = mapAccountType(plaidAccount.type, plaidAccount.subtype || '');
      
      const account = await prisma.financialAccount.upsert({
        where: {
          plaidAccountId_plaidItemId: {
            plaidAccountId: plaidAccount.account_id,
            plaidItemId: plaidItem.id
          }
        },
        create: {
          userId: user.id,
          accountName: plaidAccount.name,
          accountType,
          institutionName: data.institutionName,
          institutionId: data.institutionId,
          accountNumber: plaidAccount.mask ? await encrypt(plaidAccount.mask) : null,
          currentBalance: plaidAccount.balances.current || 0,
          availableBalance: plaidAccount.balances.available || plaidAccount.balances.current || 0,
          creditLimit: plaidAccount.balances.limit || null,
          dataSource: DataSource.PLAID,
          plaidItemId: plaidItem.id,
          plaidAccountId: plaidAccount.account_id,
          currency: plaidAccount.balances.iso_currency_code || 'USD',
          isActive: true
        },
        update: {
          currentBalance: plaidAccount.balances.current || 0,
          availableBalance: plaidAccount.balances.available || plaidAccount.balances.current || 0,
          creditLimit: plaidAccount.balances.limit || null,
          lastSynced: new Date(),
          syncError: null
        }
      });
      
      createdAccounts.push(account);
    }
    
    // Sync initial transactions
    await syncTransactions(accessToken, user.id, plaidItem.id, createdAccounts);
    
    // Log successful connection
    await createSecurityAuditLog({
      userId: user.id,
      event: `Connected ${data.institutionName} via Plaid`,
      eventType: 'INTEGRATION_CONNECTED',
      metadata: {
        institutionId: data.institutionId,
        accountCount: createdAccounts.length
      }
    });
    
    // Update financial snapshot
    await updateFinancialSnapshot(user.id);
    
    return successResponse({
      accounts: createdAccounts.map(account => ({
        id: account.id,
        name: account.accountName,
        type: account.accountType,
        balance: account.currentBalance,
        mask: account.accountNumber ? '****' : null
      })),
      message: `Successfully connected ${createdAccounts.length} accounts from ${data.institutionName}`
    });
    
  } catch (error: any) {
    console.error('Plaid exchange error:', error);
    
    if (error.response?.data) {
      return errorResponse(
        error.response.data.error_message || 'Failed to connect accounts',
        error.response.data.error_code,
        400
      );
    }
    
    throw error;
  }
});

// Helper function to sync transactions
async function syncTransactions(
  accessToken: string,
  userId: string,
  plaidItemId: string,
  accounts: any[]
) {
  try {
    // Get transactions for the last 90 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    
    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    });
    
    const accountMap = new Map(accounts.map(a => [a.plaidAccountId, a.id]));
    
    // Create transactions
    for (const plaidTx of transactionsResponse.data.transactions) {
      const accountId = accountMap.get(plaidTx.account_id);
      if (!accountId) continue;
      
      // Check if transaction already exists
      const existing = await prisma.transaction.findUnique({
        where: { plaidTransactionId: plaidTx.transaction_id }
      });
      
      if (!existing) {
        // Find or create category
        let categoryId: string | undefined;
        if (plaidTx.category && plaidTx.category.length > 0) {
          const categoryName = plaidTx.category[plaidTx.category.length - 1];
          const category = await prisma.category.findFirst({
            where: {
              OR: [
                { userId, name: categoryName },
                { userId: null, name: categoryName, isSystem: true }
              ]
            }
          });
          categoryId = category?.id;


        }
        
        // Find or create merchant
        let merchantId: string | undefined;
        if (plaidTx.merchant_name) {
          const merchant = await prisma.merchant.upsert({
            where: {
              userId_name: {
                userId,
                name: plaidTx.merchant_name
              }
            },
            create: {
              userId,
              name: plaidTx.merchant_name,
              displayName: plaidTx.merchant_name
            },
            update: {}
          });
          merchantId = merchant.id;
        }
        
        await prisma.transaction.create({
          data: {
            userId,
            accountId,
            plaidTransactionId: plaidTx.transaction_id,
            transactionDate: new Date(plaidTx.date),
            postDate: plaidTx.authorized_date ? new Date(plaidTx.authorized_date) : null,
            amount: -plaidTx.amount, // Plaid uses positive for debits
            description: plaidTx.name,
            originalDescription: plaidTx.original_description || null,
            categoryId,
            merchantId,
            isPending: plaidTx.pending,
            dataSource: DataSource.PLAID,
            location: plaidTx.location?.city || null,
            tags: plaidTx.category || []
          }
        });
      }
    }
    
    return transactionsResponse.data.transactions.length;
  } catch (error) {
    console.error('Transaction sync error:', error);
    return 0;
  }
}

// Helper function to update financial snapshot
async function updateFinancialSnapshot(userId: string) {
  const accounts = await prisma.financialAccount.findMany({
    where: { userId, isActive: true }
  });
  
  const totalAssets = accounts
    .filter((a: any) => ['CHECKING', 'SAVINGS', 'INVESTMENT'].includes(a.accountType))
    .reduce((sum: number, a: any) => sum + a.currentBalance, 0);
  
  const totalLiabilities = accounts
    .filter((a: any) => ['CREDIT_CARD', 'LOAN', 'MORTGAGE'].includes(a.accountType))
    .reduce((sum: number, a: any) => sum + Math.abs(a.currentBalance), 0);
  
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
      monthlyIncome: 0,
      monthlyExpenses: 0,
      savingsRate: 0,
      accountBalances: accounts.map((a: any) => ({
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
      accountBalances: accounts.map((a: any) => ({
        accountId: a.id,
        accountName: a.accountName,
        balance: a.currentBalance
      }))
    }
  });
}