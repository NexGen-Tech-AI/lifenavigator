/**
 * Plaid webhook handler
 * POST /api/v1/plaid/webhook - Handle Plaid webhook events
 */

import { NextRequest } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { prisma } from '@/lib/db-prod';
import { withErrorHandler, successResponse, errorResponse } from '@/lib/api/route-helpers';
import { decrypt, encrypt } from '@/lib/encryption/simple';
// import { DataSource } from '@prisma/client';
import crypto from 'crypto';

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

// Webhook verification
function verifyWebhookSignature(request: Request, body: string): boolean {
  if (!process.env.PLAID_WEBHOOK_SECRET) {
    console.warn('Plaid webhook secret not configured');
    return true; // Skip verification in development
  }
  
  const signature = request.headers.get('plaid-verification');
  if (!signature) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.PLAID_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  
  return signature === expectedSignature;
}

// POST /api/v1/plaid/webhook
export const POST = withErrorHandler(async (request: NextRequest) => {
  const bodyText = await request.text();
  
  // Verify webhook signature
  if (!verifyWebhookSignature(request, bodyText)) {
    return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
  }
  
  const body = JSON.parse(bodyText);
  const { webhook_type, webhook_code, item_id, error } = body;
  
  // Log webhook event
  await prisma.plaidWebhookEvent.create({
    data: {
      plaidItemId: item_id,
      webhookType: webhook_type,
      webhookCode: webhook_code,
      itemId: item_id,
      error: error || null,
      newTransactions: body.new_transactions || null,
      removedTransactions: body.removed_transactions || []
    }
  });
  
  // Handle different webhook types
  switch (webhook_type) {
    case 'TRANSACTIONS':
      await handleTransactionWebhook(webhook_code, body);
      break;
      
    case 'ITEM':
      await handleItemWebhook(webhook_code, body);
      break;
      
    case 'ACCOUNTS':
      await handleAccountWebhook(webhook_code, body);
      break;
      
    case 'HOLDINGS':
      await handleHoldingsWebhook(webhook_code, body);
      break;
      
    default:
      console.log(`Unhandled webhook type: ${webhook_type}`);
  }
  
  return successResponse({ received: true });
});

// Handle transaction webhooks
async function handleTransactionWebhook(code: string, body: any) {
  const { item_id, new_transactions, removed_transactions } = body;
  
  switch (code) {
    case 'INITIAL_UPDATE':
    case 'DEFAULT_UPDATE':
      // Sync new transactions
      if (new_transactions > 0) {
        await syncNewTransactions(item_id);
      }
      
      // Remove deleted transactions
      if (removed_transactions?.length > 0) {
        await prisma.transaction.deleteMany({
          where: {
            plaidTransactionId: { in: removed_transactions }
          }
        });
      }
      break;
      
    case 'TRANSACTIONS_REMOVED':
      // Remove transactions
      if (removed_transactions?.length > 0) {
        await prisma.transaction.deleteMany({
          where: {
            plaidTransactionId: { in: removed_transactions }
          }
        });
      }
      break;
  }
}

// Handle item webhooks
async function handleItemWebhook(code: string, body: any) {
  const { item_id, error } = body;
  
  switch (code) {
    case 'ERROR':
      // Update item with error
      await prisma.plaidItem.update({
        where: { itemId: item_id },
        data: {
          lastSyncError: error?.error_message || 'Unknown error',
          isActive: false
        }
      });
      
      // Notify user
      const plaidItem = await prisma.plaidItem.findUnique({
        where: { itemId: item_id },
        include: { user: true }
      });
      
      if (plaidItem) {
        await prisma.notification.create({
          data: {
            userId: plaidItem.userId,
            type: 'ACCOUNT_SYNC',
            title: 'Bank Connection Error',
            message: `There was an error syncing your ${plaidItem.institutionName} accounts. Please reconnect.`,
            data: { error, itemId: item_id },
            channels: ['in_app', 'email']
          }
        });
      }
      break;
      
    case 'PENDING_EXPIRATION':
      // Notify user to re-authenticate
      const expiringItem = await prisma.plaidItem.findUnique({
        where: { itemId: item_id },
        include: { user: true }
      });
      
      if (expiringItem) {
        await prisma.notification.create({
          data: {
            userId: expiringItem.userId,
            type: 'ACCOUNT_SYNC',
            title: 'Bank Connection Expiring',
            message: `Your ${expiringItem.institutionName} connection will expire soon. Please re-authenticate to continue syncing.`,
            data: { itemId: item_id },
            channels: ['in_app', 'email']
          }
        });
      }
      break;
      
    case 'USER_PERMISSION_REVOKED':
      // Deactivate item
      await prisma.plaidItem.update({
        where: { itemId: item_id },
        data: { isActive: false }
      });
      
      // Deactivate associated accounts
      await prisma.financialAccount.updateMany({
        where: { plaidItem: { itemId: item_id } },
        data: { isActive: false }
      });
      break;
  }
}

// Handle account webhooks
async function handleAccountWebhook(code: string, body: any) {
  const { item_id, account_id } = body;
  
  switch (code) {
    case 'ACCOUNT_DISCONNECTED':
      // Deactivate account
      await prisma.financialAccount.updateMany({
        where: {
          plaidAccountId: account_id,
          plaidItem: { itemId: item_id }
        },
        data: { isActive: false }
      });
      break;
  }
}

// Handle holdings webhooks (for investment accounts)
async function handleHoldingsWebhook(code: string, body: any) {
  const { item_id } = body;
  
  switch (code) {
    case 'DEFAULT_UPDATE':
      // Sync investment holdings
      await syncInvestmentHoldings(item_id);
      break;
  }
}

// Sync new transactions for an item
async function syncNewTransactions(itemId: string) {
  try {
    const plaidItem = await prisma.plaidItem.findUnique({
      where: { itemId },
      include: {
        accounts: true
      }
    });
    
    if (!plaidItem || !plaidItem.isActive) return;
    
    // Decrypt access token
    const accessToken = await decrypt(plaidItem.accessToken);
    
    // Get latest cursor or use date-based sync
    const lastSync = plaidItem.lastSuccessfulSync || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: lastSync.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    });
    
    const accountMap = new Map(
      plaidItem.accounts
        .filter((a: { plaidAccountId: string | null }) => a.plaidAccountId !== null)
        .map((a: { plaidAccountId: string | null; id: string }) => [a.plaidAccountId as string, a.id])
    );
    
    // Process transactions
    for (const plaidTx of transactionsResponse.data.transactions) {
      const accountId = accountMap.get(plaidTx.account_id);
      if (!accountId) continue;
      
      // Check if transaction exists
      const existing = await prisma.transaction.findUnique({
        where: { plaidTransactionId: plaidTx.transaction_id }
      });

      



      if (!existing) {
        // Create transaction (similar to exchange endpoint)
        await createTransactionFromPlaid(plaidTx, accountId, plaidItem.userId);
      } else if (existing.isPending && !plaidTx.pending) {
        // Update pending transaction
        await prisma.transaction.update({
          where: { id: existing.id },
          data: {
            isPending: false,
            postDate: plaidTx.authorized_date ? new Date(plaidTx.authorized_date) : null
          }
        });
      }
    }
    
    // Update account balances
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken
    });
    
    for (const plaidAccount of accountsResponse.data.accounts) {
      await prisma.financialAccount.update({
        where: {
          plaidAccountId_plaidItemId: {
            plaidAccountId: plaidAccount.account_id,
            plaidItemId: plaidItem.id
          }
        },
        data: {
          currentBalance: plaidAccount.balances.current || 0,
          availableBalance: plaidAccount.balances.available || plaidAccount.balances.current || 0,
          creditLimit: plaidAccount.balances.limit || null,
          lastSynced: new Date()
        }
      });
    }
    
    // Update item sync status
    await prisma.plaidItem.update({
      where: { id: plaidItem.id },
      data: {
        lastSuccessfulSync: new Date(),
        lastSyncError: null
      }
    });
    
  } catch (error: any) {
    console.error('Transaction sync error:', error);
    
    await prisma.plaidItem.update({
      where: { itemId },
      data: {
        lastSyncError: error.message || 'Sync failed'
      }
    });
  }
}

// Create transaction from Plaid data
async function createTransactionFromPlaid(plaidTx: any, accountId: string, userId: string) {
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
      dataSource: 'PLAID',
      location: plaidTx.location?.city || null,
      latitude: plaidTx.location?.lat || null,
      longitude: plaidTx.location?.lon || null,
      tags: plaidTx.category || []
    }
  });
}

// Sync investment holdings (placeholder for future implementation)
async function syncInvestmentHoldings(itemId: string) {
  // This would sync investment holdings data
  // Implementation depends on specific requirements
  console.log(`Syncing holdings for item ${itemId}`);
}