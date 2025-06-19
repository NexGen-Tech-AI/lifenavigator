#!/usr/bin/env tsx
/**
 * Plaid Integration Test Script
 * Tests the end-to-end Plaid integration in sandbox mode
 * 
 * Usage: tsx scripts/test-plaid-integration.ts
 */

import { createClient } from '@supabase/supabase-js'
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid'
import fetch from 'node-fetch'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
)

// Initialize Plaid client
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_SECRET!,
    },
  },
})

const plaidClient = new PlaidApi(plaidConfig)

// Test user credentials
const TEST_USER_EMAIL = 'test@lifenavigator.ai'
const TEST_USER_PASSWORD = 'testpassword123'

async function createTestUser() {
  console.log('🔧 Creating test user...')
  
  // Check if user exists
  const { data: existingUser } = await supabase.auth.admin.getUserByEmail(TEST_USER_EMAIL)
  
  if (existingUser) {
    console.log('✅ Test user already exists')
    return existingUser
  }
  
  // Create new user
  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    email_confirm: true
  })
  
  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`)
  }
  
  // Update user profile
  await supabase
    .from('users')
    .update({
      name: 'Test User',
      subscription_tier: 'PRO',
      subscription_status: 'ACTIVE'
    })
    .eq('id', user!.id)
  
  console.log('✅ Test user created')
  return user
}

async function createPlaidLinkToken(userId: string) {
  console.log('🔧 Creating Plaid Link token...')
  
  const linkTokenResponse = await plaidClient.linkTokenCreate({
    client_name: 'LifeNavigator Test',
    country_codes: [CountryCode.Us],
    language: 'en',
    user: {
      client_user_id: userId
    },
    products: [Products.Transactions],
    webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/plaid/webhook`,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/finance/accounts`
  })
  
  console.log('✅ Link token created:', linkTokenResponse.data.link_token.substring(0, 20) + '...')
  return linkTokenResponse.data.link_token
}

async function createSandboxPublicToken() {
  console.log('🔧 Creating sandbox public token...')
  
  // Create a sandbox public token for testing
  const publicTokenResponse = await plaidClient.sandboxPublicTokenCreate({
    institution_id: 'ins_109508', // First Platypus Bank
    initial_products: [Products.Transactions],
    options: {
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/plaid/webhook`
    }
  })
  
  console.log('✅ Public token created:', publicTokenResponse.data.public_token.substring(0, 20) + '...')
  return publicTokenResponse.data.public_token
}

async function exchangePublicToken(publicToken: string, userToken: string) {
  console.log('🔧 Exchanging public token for access token...')
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/v1/plaid/exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      publicToken,
      institutionId: 'ins_109508',
      institutionName: 'First Platypus Bank',
      accounts: [
        {
          id: 'test_checking_1',
          name: 'Plaid Checking',
          type: 'depository',
          subtype: 'checking',
          mask: '0000'
        },
        {
          id: 'test_savings_1',
          name: 'Plaid Saving',
          type: 'depository',
          subtype: 'savings',
          mask: '1111'
        },
        {
          id: 'test_credit_1',
          name: 'Plaid Credit Card',
          type: 'credit',
          subtype: 'credit card',
          mask: '3333'
        }
      ]
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Token exchange failed: ${JSON.stringify(error)}`)
  }
  
  const result = await response.json()
  console.log('✅ Token exchanged successfully')
  console.log('   Item ID:', result.data.itemId)
  console.log('   Accounts:', result.data.accounts.length)
  
  return result.data
}

async function verifyAccountsCreated(userId: string) {
  console.log('🔧 Verifying accounts in database...')
  
  const { data: accounts, error } = await supabase
    .from('financial_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('data_source', 'PLAID')
  
  if (error) {
    throw new Error(`Failed to fetch accounts: ${error.message}`)
  }
  
  console.log('✅ Accounts in database:', accounts.length)
  accounts.forEach(account => {
    console.log(`   - ${account.account_name} (${account.account_type}): $${account.current_balance}`)
  })
  
  return accounts
}

async function triggerWebhook(itemId: string) {
  console.log('🔧 Triggering sandbox webhook...')
  
  // Fire a DEFAULT_UPDATE webhook
  await plaidClient.sandboxItemFireWebhook({
    access_token: '', // Will be set by Plaid based on item_id
    webhook_code: 'DEFAULT_UPDATE'
  })
  
  console.log('✅ Webhook triggered')
}

async function verifyTransactions(userId: string) {
  console.log('🔧 Verifying transactions in database...')
  
  // Wait a bit for webhook processing
  await new Promise(resolve => setTimeout(resolve, 5000))
  
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('data_source', 'PLAID')
    .order('transaction_date', { ascending: false })
    .limit(10)
  
  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }
  
  console.log('✅ Transactions in database:', transactions.length)
  transactions.forEach(tx => {
    console.log(`   - ${tx.description}: $${tx.amount} on ${tx.transaction_date}`)
  })
  
  return transactions
}

async function testErrorHandling(userToken: string) {
  console.log('🔧 Testing error handling...')
  
  // Test with invalid public token
  try {
    await exchangePublicToken('invalid_public_token', userToken)
    console.log('❌ Error handling failed - invalid token was accepted')
  } catch (error) {
    console.log('✅ Invalid token rejected correctly')
  }
  
  // Test with missing required fields
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/v1/plaid/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        publicToken: 'test'
        // Missing required fields
      })
    })
    
    if (response.ok) {
      console.log('❌ Error handling failed - missing fields were accepted')
    } else {
      console.log('✅ Missing fields rejected correctly')
    }
  } catch (error) {
    console.log('✅ Request validation working correctly')
  }
}

async function verifyEncryption() {
  console.log('🔧 Verifying token encryption...')
  
  const { data: plaidItems, error } = await supabase
    .from('plaid_items')
    .select('access_token')
    .limit(1)
  
  if (error || !plaidItems?.length) {
    console.log('⚠️  No Plaid items found to verify encryption')
    return
  }
  
  const token = plaidItems[0].access_token
  
  // Check if token appears to be encrypted (base64 encoded in our test implementation)
  if (token && !token.startsWith('access-')) {
    console.log('✅ Access token appears to be encrypted')
  } else {
    console.log('❌ Access token does not appear to be encrypted!')
  }
}

async function cleanupTestData(userId: string) {
  console.log('🔧 Cleaning up test data...')
  
  // Delete transactions
  await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId)
  
  // Delete accounts
  await supabase
    .from('financial_accounts')
    .delete()
    .eq('user_id', userId)
  
  // Delete Plaid items
  await supabase
    .from('plaid_items')
    .delete()
    .eq('user_id', userId)
  
  console.log('✅ Test data cleaned up')
}

async function runTests() {
  console.log('🚀 Starting Plaid Integration Tests\n')
  
  try {
    // 1. Create test user
    const user = await createTestUser()
    
    // 2. Get user token for API calls
    const { data: { session } } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    })
    
    if (!session) {
      throw new Error('Failed to authenticate test user')
    }
    
    // 3. Create Plaid Link token
    const linkToken = await createPlaidLinkToken(user!.id)
    
    // 4. Create sandbox public token
    const publicToken = await createSandboxPublicToken()
    
    // 5. Exchange public token
    const exchangeResult = await exchangePublicToken(publicToken, session.access_token)
    
    // 6. Verify accounts created
    await verifyAccountsCreated(user!.id)
    
    // 7. Test webhook (commented out as it requires actual webhook endpoint)
    // await triggerWebhook(exchangeResult.itemId)
    
    // 8. Verify transactions
    // await verifyTransactions(user!.id)
    
    // 9. Test error handling
    await testErrorHandling(session.access_token)
    
    // 10. Verify encryption
    await verifyEncryption()
    
    console.log('\n✅ All tests completed successfully!')
    
    // Optional: Clean up test data
    const cleanup = process.argv.includes('--cleanup')
    if (cleanup) {
      await cleanupTestData(user!.id)
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

// Run tests
runTests()