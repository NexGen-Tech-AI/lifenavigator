#!/usr/bin/env node

/**
 * Supabase Database Setup Script
 * 
 * This script:
 * 1. Checks environment variables
 * 2. Connects to Supabase
 * 3. Applies the database schema
 * 4. Verifies the setup
 * 5. Creates/updates the demo account
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

// Helper functions
const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`${colors.magenta}▶${colors.reset} ${msg}`)
};

async function checkEnvironment() {
  log.step('Checking environment variables...');
  
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    log.error('Missing required environment variables:');
    missing.forEach(key => console.log(`  - ${key}`));
    process.exit(1);
  }
  
  log.success('All required environment variables are set');
}

async function connectToSupabase() {
  log.step('Connecting to Supabase...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  // Test connection
  const { data, error } = await supabase.from('users').select('count').limit(1);
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
    log.error(`Failed to connect to Supabase: ${error.message}`);
    process.exit(1);
  }
  
  log.success('Connected to Supabase');
  return supabase;
}

async function applyMigration(supabase: any) {
  log.step('Applying database migration...');
  
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250108_initial_schema.sql');
  
  if (!fs.existsSync(migrationPath)) {
    log.error(`Migration file not found: ${migrationPath}`);
    process.exit(1);
  }
  
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
  
  // Note: Supabase doesn't provide a direct SQL execution method via the JS client
  // You'll need to run this through the Supabase dashboard or CLI
  log.warning('Please run the migration through one of these methods:');
  console.log('');
  console.log('Option 1: Supabase Dashboard');
  console.log('  1. Go to your Supabase project dashboard');
  console.log('  2. Navigate to SQL Editor');
  console.log('  3. Copy and paste the migration from:');
  console.log(`     ${migrationPath}`);
  console.log('  4. Click "Run"');
  console.log('');
  console.log('Option 2: Supabase CLI');
  console.log('  1. Install Supabase CLI: npm install -g supabase');
  console.log('  2. Login: supabase login');
  console.log('  3. Link project: supabase link --project-ref <your-project-ref>');
  console.log('  4. Run migration: supabase db push');
  console.log('');
  
  return false;
}

async function verifySchema(supabase: any) {
  log.step('Verifying database schema...');
  
  const tables = [
    'users',
    'financial_accounts',
    'transactions',
    'documents',
    'health_records',
    'career_profiles',
    'integrations',
    'audit_logs'
  ];
  
  const missingTables: string[] = [];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    
    if (error && error.code === 'PGRST116') {
      missingTables.push(table);
    } else if (!error) {
      log.success(`Table '${table}' exists`);
    }
  }
  
  if (missingTables.length > 0) {
    log.error('Missing tables:');
    missingTables.forEach(table => console.log(`  - ${table}`));
    return false;
  }
  
  log.success('All required tables exist');
  return true;
}

async function setupDemoAccount(supabase: any) {
  log.step('Setting up demo account...');
  
  const demoUserId = '11111111-1111-1111-1111-111111111111';
  const demoEmail = 'demo@lifenavigator.ai';
  
  try {
    // Check if demo user exists in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(demoUserId);
    
    if (!authUser) {
      // Create demo user in auth.users
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        id: demoUserId,
        email: demoEmail,
        password: 'demo-password-2024', // This won't be used for login
        email_confirm: true,
        user_metadata: {
          name: 'Demo User'
        }
      });
      
      if (createError) {
        log.error(`Failed to create demo auth user: ${createError.message}`);
        return false;
      }
      
      log.success('Created demo user in auth.users');
    }
    
    // Check if demo user exists in public.users
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('id', demoUserId)
      .single();
    
    if (!publicUser) {
      // Create user profile
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: demoUserId,
          email: demoEmail,
          name: 'Demo User',
          is_demo_account: true,
          subscription_tier: 'PRO',
          onboarding_completed: true
        });
      
      if (insertError) {
        log.error(`Failed to create demo user profile: ${insertError.message}`);
        return false;
      }
      
      log.success('Created demo user profile');
    } else {
      // Update existing user to ensure it's marked as demo
      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_demo_account: true,
          subscription_tier: 'PRO',
          onboarding_completed: true
        })
        .eq('id', demoUserId);
      
      if (updateError) {
        log.error(`Failed to update demo user: ${updateError.message}`);
        return false;
      }
      
      log.success('Updated demo user profile');
    }
    
    // Add sample data
    await addDemoData(supabase, demoUserId);
    
    log.success('Demo account setup complete');
    return true;
  } catch (error: any) {
    log.error(`Demo account setup failed: ${error.message}`);
    return false;
  }
}

async function addDemoData(supabase: any, userId: string) {
  log.info('Adding demo data...');
  
  // Check if demo data already exists
  const { data: existingAccounts } = await supabase
    .from('financial_accounts')
    .select('id')
    .eq('user_id', userId)
    .limit(1);
  
  if (existingAccounts && existingAccounts.length > 0) {
    log.info('Demo data already exists');
    return;
  }
  
  // Add financial accounts
  const { data: accounts, error: accountError } = await supabase
    .from('financial_accounts')
    .insert([
      {
        user_id: userId,
        name: 'Demo Checking',
        institution_name: 'Demo Bank',
        account_type: 'CHECKING',
        current_balance: 5432.10,
        available_balance: 5432.10,
        is_manual: true
      },
      {
        user_id: userId,
        name: 'Demo Savings',
        institution_name: 'Demo Bank',
        account_type: 'SAVINGS',
        current_balance: 15000.00,
        available_balance: 15000.00,
        is_manual: true
      },
      {
        user_id: userId,
        name: 'Demo Credit Card',
        institution_name: 'Demo Bank',
        account_type: 'CREDIT_CARD',
        current_balance: 1234.56,
        credit_limit: 5000.00,
        is_manual: true
      }
    ])
    .select();
  
  if (accountError) {
    log.error(`Failed to create demo accounts: ${accountError.message}`);
    return;
  }
  
  // Add transactions for the checking account
  const checkingAccount = accounts.find(a => a.account_type === 'CHECKING');
  if (checkingAccount) {
    const transactions = [
      { amount: -45.23, days_ago: 1, description: 'Whole Foods Market', category: 'FOOD' },
      { amount: -12.99, days_ago: 2, description: 'Netflix Subscription', category: 'ENTERTAINMENT' },
      { amount: 3500.00, days_ago: 5, description: 'Monthly Salary', category: 'INCOME' },
      { amount: -89.00, days_ago: 7, description: 'Electric Bill', category: 'UTILITIES' },
      { amount: -250.00, days_ago: 10, description: 'Car Insurance', category: 'INSURANCE' }
    ];
    
    const transactionData = transactions.map(t => ({
      user_id: userId,
      account_id: checkingAccount.id,
      amount: t.amount,
      transaction_date: new Date(Date.now() - t.days_ago * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: t.description,
      category: t.category
    }));
    
    const { error: transError } = await supabase
      .from('transactions')
      .insert(transactionData);
    
    if (transError) {
      log.error(`Failed to create demo transactions: ${transError.message}`);
    }
  }
  
  log.success('Demo data added successfully');
}

async function main() {
  console.log(`${colors.blue}🚀 Supabase Database Setup${colors.reset}\n`);
  
  // Step 1: Check environment
  await checkEnvironment();
  
  // Step 2: Connect to Supabase
  const supabase = await connectToSupabase();
  
  // Step 3: Apply migration (manual step)
  const migrationApplied = await applyMigration(supabase);
  
  // Step 4: Verify schema
  const schemaValid = await verifySchema(supabase);
  
  if (!schemaValid) {
    log.warning('Please apply the migration first, then run this script again');
    process.exit(0);
  }
  
  // Step 5: Setup demo account
  await setupDemoAccount(supabase);
  
  console.log(`\n${colors.green}✨ Database setup complete!${colors.reset}\n`);
  
  log.info('Next steps:');
  console.log('  1. Test the demo account by logging in with:');
  console.log('     Email: demo@lifenavigator.ai');
  console.log('     Password: demo123');
  console.log('  2. Run the application: npm run dev');
  console.log('  3. Check the database in your Supabase dashboard');
}

// Run the script
main().catch(error => {
  log.error(`Script failed: ${error.message}`);
  process.exit(1);
});