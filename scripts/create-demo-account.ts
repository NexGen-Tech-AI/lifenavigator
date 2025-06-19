#!/usr/bin/env node
/**
 * Create demo account in Supabase
 * Run: npx tsx scripts/create-demo-account.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('📍 Supabase URL:', supabaseUrl)
console.log('🔑 Service Key:', supabaseServiceKey ? 'Found' : 'Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in .env.local')
  process.exit(1)
}

if (supabaseUrl.includes('your_project') || supabaseUrl.includes('YOUR_PROJECT')) {
  console.error('❌ Please update NEXT_PUBLIC_SUPABASE_URL in .env.local with your actual Supabase URL')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createDemoAccount() {
  console.log('🚀 Creating demo account...')
  
  const demoUserId = '11111111-1111-1111-1111-111111111111'
  const demoEmail = 'demo@lifenavigator.ai'
  const demoPassword = 'demo123'
  
  try {
    // First, check if user exists in auth.users
    const { data: existingAuthUser } = await supabase.auth.admin.getUserById(demoUserId)
    
    if (!existingAuthUser) {
      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        id: demoUserId,
        email: demoEmail,
        password: demoPassword,
        email_confirm: true,
        user_metadata: {
          name: 'Demo User',
          is_demo: true
        }
      })
      
      if (authError) {
        console.error('❌ Error creating auth user:', authError)
        return
      }
      
      console.log('✅ Created auth user')
    } else {
      console.log('✅ Auth user already exists')
    }
    
    // Check if user profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('id', demoUserId)
      .single()
    
    if (!existingProfile) {
      // First, ensure the auth user exists
      const { data: authUserCheck } = await supabase.auth.admin.getUserById(demoUserId)
      
      if (!authUserCheck) {
        console.error('❌ Auth user not found. Creating new auth user...')
        const { data: newAuthUser, error: newAuthError } = await supabase.auth.admin.createUser({
          id: demoUserId,
          email: demoEmail,
          password: demoPassword,
          email_confirm: true,
          user_metadata: {
            name: 'Demo User',
            is_demo: true
          }
        })
        
        if (newAuthError) {
          console.error('❌ Error creating auth user:', newAuthError)
          return
        }
        console.log('✅ Created auth user')
      }
      
      // Now create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: demoUserId,
          email: demoEmail,
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
      
      console.log('✅ Created user profile')
    } else {
      // Update existing profile to ensure it has pilot access
      const { error: updateError } = await supabase
        .from('users')
        .update({
          subscription_tier: 'PILOT',
          pilot_program: true,
          is_demo_account: true,
          onboarding_completed: true
        })
        .eq('id', demoUserId)
      
      if (updateError) {
        console.error('❌ Error updating user profile:', updateError)
        return
      }
      
      console.log('✅ Updated existing user profile')
    }
    
    // Create user preferences
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: demoUserId,
        theme: 'system',
        notifications: {
          email: true,
          push: false,
          sms: false
        },
        privacy: {
          shareDataForInsights: true,
          allowAnonymousAnalytics: false
        },
        onboarding_data: {
          completedSteps: ['welcome', 'profile', 'preferences', 'connect_accounts'],
          skippedSteps: []
        }
      })
    
    if (prefsError) {
      console.error('⚠️  Warning creating preferences:', prefsError)
    } else {
      console.log('✅ Created user preferences')
    }
    
    // Create demo financial accounts
    const demoAccounts = [
      {
        user_id: demoUserId,
        account_name: 'Demo Checking',
        account_type: 'CHECKING',
        institution_name: 'Demo Bank',
        current_balance: 5432.10,
        available_balance: 5432.10,
        data_source: 'MANUAL',
        is_active: true
      },
      {
        user_id: demoUserId,
        account_name: 'Demo Savings',
        account_type: 'SAVINGS',
        institution_name: 'Demo Bank',
        current_balance: 12500.00,
        available_balance: 12500.00,
        data_source: 'MANUAL',
        is_active: true
      },
      {
        user_id: demoUserId,
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
    ]
    
    // Check if accounts exist
    const { data: existingAccounts } = await supabase
      .from('financial_accounts')
      .select('id')
      .eq('user_id', demoUserId)
    
    if (!existingAccounts || existingAccounts.length === 0) {
      const { error: accountsError } = await supabase
        .from('financial_accounts')
        .insert(demoAccounts)
      
      if (accountsError) {
        console.error('❌ Error creating demo accounts:', accountsError)
      } else {
        console.log('✅ Created demo financial accounts')
      }
    } else {
      console.log('✅ Demo accounts already exist')
    }
    
    // Set initial feature usage limits for pilot tier
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)
    
    const endOfMonth = new Date(currentMonth)
    endOfMonth.setMonth(endOfMonth.getMonth() + 1)
    endOfMonth.setDate(0)
    
    const featureUsage = [
      {
        user_id: demoUserId,
        feature_key: 'plaid_integration',
        usage_count: 0,
        usage_limit: 3,
        period_start: currentMonth.toISOString(),
        period_end: endOfMonth.toISOString()
      },
      {
        user_id: demoUserId,
        feature_key: 'ai_insights',
        usage_count: 0,
        usage_limit: 10,
        period_start: currentMonth.toISOString(),
        period_end: endOfMonth.toISOString()
      },
      {
        user_id: demoUserId,
        feature_key: 'document_upload',
        usage_count: 0,
        usage_limit: 100,
        period_start: currentMonth.toISOString(),
        period_end: endOfMonth.toISOString()
      }
    ]
    
    const { error: usageError } = await supabase
      .from('feature_usage')
      .upsert(featureUsage, {
        onConflict: 'user_id,feature_key,period_start'
      })
    
    if (usageError) {
      console.error('⚠️  Warning setting feature usage:', usageError)
    } else {
      console.log('✅ Set feature usage limits')
    }
    
    console.log('\n✨ Demo account created successfully!')
    console.log('📧 Email:', demoEmail)
    console.log('🔐 Password:', demoPassword)
    console.log('🎯 Tier: PILOT (with demo data)')
    console.log('\n👉 You can now login with these credentials')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
createDemoAccount()