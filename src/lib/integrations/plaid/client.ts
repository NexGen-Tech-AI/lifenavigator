/**
 * Plaid Integration Client
 * Handles secure connection to Plaid API with encrypted token storage
 */

import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { env, isFeatureEnabled } from '@/lib/env';
import { encryptField, decryptField } from '@/lib/encryption/service';
import { createClient } from '@/lib/supabase/server';
import type { FinancialAccount, Integration } from '@/types/database';

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': env.PLAID_CLIENT_ID,
      'PLAID-SECRET': env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

// Plaid configuration
export const PLAID_PRODUCTS = [
  Products.Accounts,
  Products.Transactions,
  Products.Balance,
  Products.Identity,
  Products.Investments,
] as const;

export const PLAID_COUNTRY_CODES = [CountryCode.Us] as const;

/**
 * Creates a Link token for Plaid Link initialization
 */
export async function createLinkToken(userId: string, isUpdate = false, itemId?: string) {
  if (!isFeatureEnabled.plaid) {
    throw new Error('Plaid integration is not enabled');
  }

  try {
    const request = {
      user: { client_user_id: userId },
      client_name: 'LifeNavigator',
      products: PLAID_PRODUCTS as Products[],
      country_codes: PLAID_COUNTRY_CODES as CountryCode[],
      language: 'en',
      webhook: `${env.NEXT_PUBLIC_APP_URL}/api/v1/plaid/webhook`,
      redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/dashboard/finance/connections`,
      ...(isUpdate && itemId ? { access_token: await getDecryptedAccessToken(userId, itemId) } : {}),
    };

    const response = await plaidClient.linkTokenCreate(request);
    
    // Log link token creation
    const supabase = await createClient();
    await supabase.from('audit_logs').insert({
      user_id: userId,
      event_type: 'PLAID_LINK_TOKEN_CREATED',
      event_category: 'INTEGRATION',
      description: `Plaid Link token created for ${isUpdate ? 'update' : 'new connection'}`,
      new_values: { isUpdate, itemId },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating Plaid Link token:', error);
    throw new Error('Failed to create connection token');
  }
}

/**
 * Exchanges a public token for an access token and stores it securely
 */
export async function exchangePublicToken(
  userId: string,
  publicToken: string,
  metadata?: any
) {
  if (!isFeatureEnabled.plaid) {
    throw new Error('Plaid integration is not enabled');
  }

  const supabase = await createClient();

  try {
    // Exchange public token for access token
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const { access_token, item_id } = response.data;

    // Get item details
    const itemResponse = await plaidClient.itemGet({ access_token });
    const institution = await plaidClient.institutionsGetById({
      institution_id: itemResponse.data.item.institution_id!,
      country_codes: PLAID_COUNTRY_CODES as CountryCode[],
    });

    // Encrypt the access token
    const encryptedToken = await encryptField(access_token, {
      userId,
      tableName: 'integrations',
      fieldName: 'access_token_encrypted',
      operation: 'encrypt',
    });

    // Store integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .insert({
        user_id: userId,
        provider: 'plaid',
        account_id: item_id,
        access_token_encrypted: encryptedToken,
        webhook_url: `${env.NEXT_PUBLIC_APP_URL}/api/v1/plaid/webhook`,
        is_active: true,
      })
      .select()
      .single();

    if (integrationError) throw integrationError;

    // Get accounts
    const accountsResponse = await plaidClient.accountsGet({ access_token });
    
    // Store accounts
    const accountPromises = accountsResponse.data.accounts.map(async (account) => {
      // Encrypt sensitive account data
      const encryptedAccountNumber = account.mask
        ? await encryptField(account.mask, {
            userId,
            tableName: 'financial_accounts',
            fieldName: 'account_number_encrypted',
            operation: 'encrypt',
          })
        : null;

      return supabase.from('financial_accounts').insert({
        user_id: userId,
        name: account.name,
        institution_name: institution.data.institution.name,
        account_type: mapPlaidAccountType(account.type),
        account_number_encrypted: encryptedAccountNumber,
        plaid_account_id: account.account_id,
        plaid_item_id: item_id,
        current_balance: account.balances.current,
        available_balance: account.balances.available,
        credit_limit: account.balances.limit,
        is_manual: false,
      });
    });

    await Promise.all(accountPromises);

    // Fetch initial transactions
    await syncTransactions(userId, item_id, access_token);

    // Log successful connection
    await supabase.from('audit_logs').insert({
      user_id: userId,
      event_type: 'PLAID_ACCOUNT_CONNECTED',
      event_category: 'INTEGRATION',
      description: `Connected ${accountsResponse.data.accounts.length} accounts from ${institution.data.institution.name}`,
      entity_type: 'integrations',
      entity_id: integration.id,
      new_values: {
        institution: institution.data.institution.name,
        accountCount: accountsResponse.data.accounts.length,
      },
    });

    return {
      success: true,
      integration,
      accounts: accountsResponse.data.accounts.length,
    };
  } catch (error) {
    console.error('Error exchanging public token:', error);
    
    // Log failure
    await supabase.from('audit_logs').insert({
      user_id: userId,
      event_type: 'PLAID_CONNECTION_FAILED',
      event_category: 'INTEGRATION',
      description: 'Failed to connect Plaid account',
      new_values: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    throw new Error('Failed to connect account');
  }
}

/**
 * Syncs transactions for a Plaid item
 */
export async function syncTransactions(
  userId: string,
  itemId: string,
  accessToken?: string
) {
  const supabase = await createClient();

  try {
    // Get access token if not provided
    const token = accessToken || await getDecryptedAccessToken(userId, itemId);

    // Get sync cursor from last sync
    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('account_id', itemId)
      .single();

    let cursor = integration?.last_sync_at;
    let hasMore = true;
    let added = 0;
    let modified = 0;

    while (hasMore) {
      const request = cursor
        ? { access_token: token, cursor }
        : { access_token: token };

      const response = await plaidClient.transactionsSync(request);
      
      // Process added transactions
      for (const transaction of response.data.added) {
        const { data: account } = await supabase
          .from('financial_accounts')
          .select('id')
          .eq('plaid_account_id', transaction.account_id)
          .single();

        if (account) {
          await supabase.from('transactions').insert({
            user_id: userId,
            account_id: account.id,
            amount: Math.abs(transaction.amount),
            transaction_date: transaction.date,
            posted_date: transaction.authorized_date || transaction.date,
            description: transaction.name,
            merchant_name: transaction.merchant_name,
            category: mapPlaidCategory(transaction.category),
            plaid_transaction_id: transaction.transaction_id,
            plaid_category: transaction.category,
            is_pending: transaction.pending,
            currency_code: transaction.iso_currency_code || 'USD',
          });
          added++;
        }
      }

      // Process modified transactions
      for (const transaction of response.data.modified) {
        await supabase
          .from('transactions')
          .update({
            amount: Math.abs(transaction.amount),
            description: transaction.name,
            merchant_name: transaction.merchant_name,
            is_pending: transaction.pending,
            updated_at: new Date().toISOString(),
          })
          .eq('plaid_transaction_id', transaction.transaction_id);
        modified++;
      }

      // Process removed transactions
      for (const removedId of response.data.removed) {
        await supabase
          .from('transactions')
          .delete()
          .eq('plaid_transaction_id', removedId);
      }

      hasMore = response.data.has_more;
      cursor = response.data.next_cursor;
    }

    // Update sync status
    await supabase
      .from('integrations')
      .update({
        last_sync_at: new Date().toISOString(),
        last_error: null,
        error_count: 0,
      })
      .eq('account_id', itemId);

    // Update account balances
    await updateAccountBalances(token, userId);

    return { added, modified, removed: 0 };
  } catch (error) {
    console.error('Error syncing transactions:', error);
    
    // Update error status
    await supabase
      .from('integrations')
      .update({
        last_error: error instanceof Error ? error.message : 'Sync failed',
        error_count: integration?.error_count ? integration.error_count + 1 : 1,
      })
      .eq('account_id', itemId);

    throw error;
  }
}

/**
 * Updates account balances from Plaid
 */
async function updateAccountBalances(accessToken: string, userId: string) {
  const supabase = await createClient();

  try {
    const response = await plaidClient.accountsBalanceGet({ access_token: accessToken });

    for (const account of response.data.accounts) {
      await supabase
        .from('financial_accounts')
        .update({
          current_balance: account.balances.current,
          available_balance: account.balances.available,
          credit_limit: account.balances.limit,
          last_synced_at: new Date().toISOString(),
        })
        .eq('plaid_account_id', account.account_id)
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error('Error updating account balances:', error);
  }
}

/**
 * Gets decrypted access token for a Plaid item
 */
async function getDecryptedAccessToken(userId: string, itemId: string): Promise<string> {
  const supabase = await createClient();

  const { data: integration } = await supabase
    .from('integrations')
    .select('access_token_encrypted')
    .eq('user_id', userId)
    .eq('account_id', itemId)
    .eq('provider', 'plaid')
    .single();

  if (!integration?.access_token_encrypted) {
    throw new Error('Access token not found');
  }

  return decryptField(integration.access_token_encrypted, {
    userId,
    tableName: 'integrations',
    fieldName: 'access_token_encrypted',
    operation: 'decrypt',
  });
}

/**
 * Maps Plaid account type to our account type
 */
function mapPlaidAccountType(plaidType: string): string {
  const mapping: Record<string, string> = {
    depository: 'CHECKING',
    credit: 'CREDIT_CARD',
    loan: 'LOAN',
    investment: 'INVESTMENT',
    mortgage: 'MORTGAGE',
    brokerage: 'INVESTMENT',
    'cd': 'SAVINGS',
    'money market': 'SAVINGS',
    'savings': 'SAVINGS',
    'checking': 'CHECKING',
  };

  return mapping[plaidType.toLowerCase()] || 'OTHER';
}

/**
 * Maps Plaid category to our transaction category
 */
function mapPlaidCategory(plaidCategories?: string[] | null): string {
  if (!plaidCategories || plaidCategories.length === 0) return 'OTHER';

  const primaryCategory = plaidCategories[0].toLowerCase();
  
  const mapping: Record<string, string> = {
    'transfer': 'INCOME',
    'deposit': 'INCOME',
    'payment': 'OTHER',
    'food and drink': 'FOOD',
    'shops': 'SHOPPING',
    'recreation': 'ENTERTAINMENT',
    'service': 'PERSONAL',
    'healthcare': 'HEALTHCARE',
    'tax': 'OTHER',
    'interest': 'INCOME',
    'bank fees': 'OTHER',
  };

  for (const [key, value] of Object.entries(mapping)) {
    if (primaryCategory.includes(key)) {
      return value;
    }
  }

  return 'OTHER';
}

/**
 * Handles Plaid webhooks
 */
export async function handlePlaidWebhook(
  webhookType: string,
  webhookCode: string,
  itemId: string,
  error?: any
) {
  const supabase = await createClient();

  // Get integration
  const { data: integration } = await supabase
    .from('integrations')
    .select('user_id')
    .eq('account_id', itemId)
    .eq('provider', 'plaid')
    .single();

  if (!integration) {
    console.error('Integration not found for item:', itemId);
    return;
  }

  const userId = integration.user_id;

  switch (webhookType) {
    case 'TRANSACTIONS':
      if (webhookCode === 'SYNC_UPDATES_AVAILABLE') {
        await syncTransactions(userId, itemId);
      }
      break;

    case 'ITEM':
      if (webhookCode === 'ERROR') {
        await supabase
          .from('integrations')
          .update({
            is_active: false,
            last_error: error?.error_message || 'Item error',
          })
          .eq('account_id', itemId);
      }
      break;

    case 'HOLDINGS':
      if (webhookCode === 'DEFAULT_UPDATE') {
        // Handle investment updates
        console.log('Investment holdings updated for item:', itemId);
      }
      break;
  }

  // Log webhook
  await supabase.from('audit_logs').insert({
    user_id: userId,
    event_type: `PLAID_WEBHOOK_${webhookType}`,
    event_category: 'INTEGRATION',
    description: `Plaid webhook: ${webhookType}/${webhookCode}`,
    entity_type: 'integrations',
    new_values: { itemId, webhookCode, error },
  });
}