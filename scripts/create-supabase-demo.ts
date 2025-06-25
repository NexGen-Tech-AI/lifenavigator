#!/usr/bin/env tsx
/**
 * Create demo account in Supabase
 * This script creates a demo user with pre-populated data
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function createDemoAccount() {
  try {
    console.log('🚀 Creating demo account in Supabase...')
    
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'demo@lifenavigator.tech',
      password: 'DemoPassword123',
      email_confirm: true,
      user_metadata: {
        name: 'Demo User'
      }
    })
    
    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log('ℹ️  Demo auth user already exists, continuing...')
        // Get existing user
        const { data: { users } } = await supabase.auth.admin.listUsers()
        const demoUser = users.find(u => u.email === 'demo@lifenavigator.tech')
        if (!demoUser) {
          throw new Error('Could not find demo user')
        }
        authData.user = demoUser
      } else {
        throw authError
      }
    } else {
      console.log('✅ Created demo auth user')
    }
    
    const userId = authData.user.id
    
    // 2. Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'demo@lifenavigator.ai',
        name: 'Demo User',
        subscription_tier: 'PRO',
        subscription_status: 'ACTIVE',
        is_demo_account: true,
        onboarding_completed: true
      })
    
    if (profileError && !profileError.message.includes('duplicate')) {
      throw profileError
    }
    console.log('✅ Created user profile')
    
    // 3. Create financial accounts
    const accounts = [
      { name: 'Primary Checking', type: 'CHECKING', institution: 'Chase Bank', balance: 5234.67 },
      { name: 'High Yield Savings', type: 'SAVINGS', institution: 'Marcus by Goldman Sachs', balance: 25000.00 },
      { name: 'Sapphire Reserve', type: 'CREDIT_CARD', institution: 'Chase', balance: -1234.56, credit_limit: 10000 },
      { name: 'Investment Account', type: 'INVESTMENT', institution: 'Vanguard', balance: 45678.90 },
      { name: 'Auto Loan', type: 'LOAN', institution: 'Toyota Financial', balance: -12345.67 },
      { name: 'Home Mortgage', type: 'MORTGAGE', institution: 'Wells Fargo', balance: -234567.89 }
    ]
    
    const { data: createdAccounts, error: accountsError } = await supabase
      .from('financial_accounts')
      .insert(
        accounts.map(acc => ({
          user_id: userId,
          account_name: acc.name,
          account_type: acc.type,
          institution_name: acc.institution,
          current_balance: acc.balance,
          available_balance: acc.type === 'CREDIT_CARD' ? (acc.credit_limit! + acc.balance) : acc.balance,
          credit_limit: acc.credit_limit,
          data_source: 'MANUAL',
          is_active: true
        }))
      )
      .select()
    
    if (accountsError) {
      console.warn('⚠️  Error creating accounts:', accountsError.message)
    } else {
      console.log(`✅ Created ${createdAccounts.length} financial accounts`)
    }
    
    // 4. Create sample transactions
    if (createdAccounts && createdAccounts.length > 0) {
      const checkingAccount = createdAccounts.find(a => a.account_type === 'CHECKING')
      const creditAccount = createdAccounts.find(a => a.account_type === 'CREDIT_CARD')
      
      if (checkingAccount && creditAccount) {
        const transactions = []
        const merchants = [
          { name: 'Whole Foods Market', amount: -89.45 },
          { name: 'Amazon.com', amount: -34.99 },
          { name: 'Starbucks', amount: -5.75 },
          { name: 'Target', amount: -125.30 },
          { name: 'Shell Gas Station', amount: -45.00 },
          { name: 'Netflix Subscription', amount: -15.99 },
          { name: 'Direct Deposit - Salary', amount: 3500.00 },
          { name: 'Uber', amount: -22.50 },
          { name: 'Restaurant - Chipotle', amount: -12.75 }
        ]
        
        // Generate 30 days of transactions
        for (let i = 0; i < 30; i++) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          
          // Add 1-3 transactions per day
          const numTransactions = Math.floor(Math.random() * 3) + 1
          for (let j = 0; j < numTransactions; j++) {
            const merchant = merchants[Math.floor(Math.random() * merchants.length)]
            const accountId = merchant.amount > 0 ? checkingAccount.id : 
              (Math.random() > 0.5 ? checkingAccount.id : creditAccount.id)
            
            transactions.push({
              user_id: userId,
              account_id: accountId,
              transaction_date: date.toISOString().split('T')[0],
              amount: merchant.amount,
              description: merchant.name,
              data_source: 'MANUAL'
            })
          }
        }
        
        const { error: transError } = await supabase
          .from('transactions')
          .insert(transactions)
        
        if (transError) {
          console.warn('⚠️  Error creating transactions:', transError.message)
        } else {
          console.log(`✅ Created ${transactions.length} transactions`)
        }
      }
    }
    
    // 5. Create budgets
    const budgets = [
      { name: 'Groceries', amount: 600, period: 'MONTHLY' },
      { name: 'Dining Out', amount: 400, period: 'MONTHLY' },
      { name: 'Transportation', amount: 300, period: 'MONTHLY' },
      { name: 'Entertainment', amount: 200, period: 'MONTHLY' },
      { name: 'Shopping', amount: 500, period: 'MONTHLY' }
    ]
    
    const { error: budgetsError } = await supabase
      .from('budgets')
      .insert(
        budgets.map(budget => ({
          user_id: userId,
          name: budget.name,
          amount: budget.amount,
          period: budget.period,
          start_date: new Date().toISOString().split('T')[0],
          is_active: true
        }))
      )
    
    if (budgetsError) {
      console.warn('⚠️  Error creating budgets:', budgetsError.message)
    } else {
      console.log(`✅ Created ${budgets.length} budgets`)
    }
    
    // 6. Create goals
    const goals = [
      {
        name: 'Emergency Fund',
        description: 'Build 6 months of expenses',
        target: 30000,
        current: 25000,
        type: 'SAVINGS',
        priority: 'HIGH'
      },
      {
        name: 'Vacation to Japan',
        description: 'Two week trip to Japan',
        target: 8000,
        current: 3200,
        type: 'SAVINGS',
        priority: 'MEDIUM'
      },
      {
        name: 'Pay Off Credit Cards',
        description: 'Eliminate all credit card debt',
        target: 5000,
        current: 1234.56,
        type: 'DEBT_PAYOFF',
        priority: 'HIGH'
      }
    ]
    
    const targetDate = new Date()
    targetDate.setFullYear(targetDate.getFullYear() + 1)
    
    const { error: goalsError } = await supabase
      .from('goals')
      .insert(
        goals.map(goal => ({
          user_id: userId,
          name: goal.name,
          description: goal.description,
          target_amount: goal.target,
          current_amount: goal.current,
          target_date: targetDate.toISOString().split('T')[0],
          goal_type: goal.type,
          priority: goal.priority
        }))
      )
    
    if (goalsError) {
      console.warn('⚠️  Error creating goals:', goalsError.message)
    } else {
      console.log(`✅ Created ${goals.length} goals`)
    }
    
    console.log('\n🎉 Demo account created successfully!')
    console.log('   Email: demo@lifenavigator.ai')
    console.log('   Password: demo123456')
    
  } catch (error) {
    console.error('❌ Error creating demo account:', error)
    process.exit(1)
  }
}

// Run the script
createDemoAccount()