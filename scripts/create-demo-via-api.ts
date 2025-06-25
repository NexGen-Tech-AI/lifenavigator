#!/usr/bin/env node
/**
 * Create Demo Account via Supabase Admin API
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createDemoAccount() {
  console.log('🚀 Creating demo account via API...')
  
  try {
    // Step 1: Create auth user
    console.log('\n📝 Step 1: Creating auth user...')
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'demo@lifenavigator.tech',
      password: 'DemoPassword123',
      email_confirm: true,
      user_metadata: {
        name: 'Demo User'
      }
    })
    
    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('⚠️  Auth user already exists, continuing...')
        
        // Get the existing user
        const { data: users } = await supabase.auth.admin.listUsers()
        const existingUser = users?.users?.find(u => u.email === 'demo@lifenavigator.tech')
        
        if (existingUser) {
          await createUserProfile(existingUser.id)
        }
      } else {
        console.error('❌ Error creating auth user:', authError)
        return
      }
    } else {
      console.log('✅ Auth user created with ID:', authUser.user.id)
      await createUserProfile(authUser.user.id)
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

async function createUserProfile(userId: string) {
  console.log('\n📝 Step 2: Creating user profile...')
  
  // Create user profile
  const { error: profileError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email: 'demo@lifenavigator.ai',
      name: 'Demo User',
      subscription_tier: 'PILOT',
      subscription_status: 'ACTIVE',
      is_demo_account: true,
      onboarding_completed: true,
      pilot_program: true,
      referral_code: 'DEMO2024'
    })
  
  if (profileError) {
    console.error('❌ Error creating user profile:', profileError)
    return
  }
  
  console.log('✅ User profile created')
  
  // Create user preferences
  const { error: prefsError } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      theme: 'system',
      notifications: {
        email: true,
        push: false,
        sms: false
      },
      privacy: {
        shareDataForInsights: true,
        allowAnonymousAnalytics: false
      }
    })
  
  if (prefsError) {
    console.error('⚠️  Warning creating preferences:', prefsError)
  }
  
  // Create demo financial accounts
  console.log('\n📝 Step 3: Creating demo financial accounts...')
  const { data: accounts, error: accountsError } = await supabase
    .from('financial_accounts')
    .insert([
      {
        user_id: userId,
        account_name: 'Demo Checking',
        account_type: 'CHECKING',
        institution_name: 'Demo Bank',
        current_balance: 5432.10,
        available_balance: 5432.10,
        data_source: 'MANUAL',
        is_active: true
      },
      {
        user_id: userId,
        account_name: 'Demo Savings',
        account_type: 'SAVINGS',
        institution_name: 'Demo Bank',
        current_balance: 12500.00,
        available_balance: 12500.00,
        data_source: 'MANUAL',
        is_active: true
      },
      {
        user_id: userId,
        account_name: 'Demo Credit Card',
        account_type: 'CREDIT_CARD',
        institution_name: 'Demo Card Co',
        current_balance: -1234.56,
        available_balance: 3765.44,
        credit_limit: 5000.00,
        minimum_payment: 35.00,
        apr: 18.99,
        data_source: 'MANUAL',
        is_active: true
      }
    ])
    .select()
  
  if (accountsError) {
    console.error('❌ Error creating demo accounts:', accountsError)
  } else {
    console.log('✅ Created', accounts.length, 'demo financial accounts')
  }
  
  // Create feature usage
  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)
  
  const endOfMonth = new Date(currentMonth)
  endOfMonth.setMonth(endOfMonth.getMonth() + 1)
  endOfMonth.setDate(0)
  
  await supabase
    .from('feature_usage')
    .upsert([
      {
        user_id: userId,
        feature_key: 'plaid_integration',
        usage_count: 0,
        usage_limit: 3,
        period_start: currentMonth.toISOString(),
        period_end: endOfMonth.toISOString()
      },
      {
        user_id: userId,
        feature_key: 'ai_insights',
        usage_count: 0,
        usage_limit: 10,
        period_start: currentMonth.toISOString(),
        period_end: endOfMonth.toISOString()
      },
      {
        user_id: userId,
        feature_key: 'document_upload',
        usage_count: 0,
        usage_limit: 100,
        period_start: currentMonth.toISOString(),
        period_end: endOfMonth.toISOString()
      }
    ])
  
  console.log('\n✨ Demo account setup complete!')
  console.log('📧 Email: demo@lifenavigator.ai')
  console.log('🔐 Password: demo123')
  console.log('🎯 Tier: PILOT')
  console.log('\n👉 You can now login at http://localhost:3000')
}

// Run the script
createDemoAccount()