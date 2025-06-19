#!/usr/bin/env node
/**
 * Plaid Integration Test Script (JavaScript version)
 * Tests the end-to-end Plaid integration in sandbox mode
 * 
 * Usage: node scripts/test-plaid-integration.js
 */

require('dotenv').config()

async function testPlaidIntegration() {
  console.log('🚀 Testing Plaid Integration\n')
  
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase environment variables')
    process.exit(1)
  }
  
  // Test 1: Check if Plaid environment variables are set
  console.log('1️⃣  Checking Plaid environment variables...')
  const requiredEnvVars = [
    'PLAID_CLIENT_ID',
    'PLAID_SECRET',
    'PLAID_ENV'
  ]
  
  let missingVars = []
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '))
    console.log('\nPlease add these to your .env file:')
    console.log('PLAID_CLIENT_ID=your_plaid_client_id')
    console.log('PLAID_SECRET=your_plaid_secret')
    console.log('PLAID_ENV=sandbox')
    process.exit(1)
  }
  
  console.log('✅ All Plaid environment variables are set')
  console.log('   Environment:', process.env.PLAID_ENV)
  
  // Test 2: Test API endpoint availability
  console.log('\n2️⃣  Testing API endpoints...')
  
  try {
    // Test if the server is running
    const healthResponse = await fetch(`${APP_URL}/api/auth/session`)
    if (!healthResponse.ok) {
      throw new Error('Server not responding')
    }
    console.log('✅ Server is running')
    
    // Test Plaid exchange endpoint (should return 401 without auth)
    const plaidResponse = await fetch(`${APP_URL}/api/v1/plaid/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    
    if (plaidResponse.status === 401) {
      console.log('✅ Plaid exchange endpoint requires authentication (expected)')
    } else if (plaidResponse.status === 500) {
      console.log('❌ Plaid exchange endpoint returned server error')
    }
    
  } catch (error) {
    console.error('❌ Could not connect to server. Is it running?')
    console.log('   Run: npm run dev')
    process.exit(1)
  }
  
  // Test 3: Check Supabase connection
  console.log('\n3️⃣  Testing Supabase connection...')
  
  try {
    const supabaseResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })
    
    if (supabaseResponse.ok) {
      console.log('✅ Supabase connection successful')
    } else {
      throw new Error('Supabase connection failed')
    }
  } catch (error) {
    console.error('❌ Could not connect to Supabase')
    console.log('   Check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }
  
  // Test 4: Verify database tables exist
  console.log('\n4️⃣  Checking database tables...')
  
  const requiredTables = [
    'users',
    'financial_accounts', 
    'transactions',
    'plaid_items',
    'plaid_webhook_events'
  ]
  
  for (const table of requiredTables) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=0`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'count=exact'
        }
      })
      
      if (response.ok) {
        console.log(`✅ Table '${table}' exists`)
      } else {
        console.log(`❌ Table '${table}' not found`)
      }
    } catch (error) {
      console.log(`❌ Error checking table '${table}'`)
    }
  }
  
  // Test 5: Generate test instructions
  console.log('\n5️⃣  Manual Test Instructions:')
  console.log('\nTo test the full Plaid integration:')
  console.log('1. Start the development server: npm run dev')
  console.log('2. Create a user account or use the demo account')
  console.log('3. Upgrade to PRO tier (required for Plaid)')
  console.log('4. Navigate to Dashboard > Finance > Accounts')
  console.log('5. Click "Connect Bank Account"')
  console.log('6. In Plaid Link sandbox mode:')
  console.log('   - Select any bank (e.g., "First Platypus Bank")')
  console.log('   - Username: user_good')
  console.log('   - Password: pass_good')
  console.log('7. Select accounts to connect')
  console.log('8. Verify accounts appear in the dashboard')
  
  console.log('\n✅ Plaid integration check complete!')
  console.log('\nNext steps:')
  console.log('- Set up Plaid webhook endpoint (if using ngrok for local testing)')
  console.log('- Test transaction syncing')
  console.log('- Verify error handling scenarios')
}

// Run the test
testPlaidIntegration().catch(console.error)