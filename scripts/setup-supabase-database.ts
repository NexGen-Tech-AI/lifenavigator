#!/usr/bin/env node
/**
 * Setup Supabase Database
 * Run migrations and create demo account
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import fs from 'fs'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigrations() {
  console.log('🚀 Setting up Supabase database...\n')
  
  try {
    // Read migration files
    const migration1 = fs.readFileSync('supabase/migrations/001_initial_schema.sql', 'utf8')
    const migration2 = fs.readFileSync('supabase/migrations/002_usage_tracking_and_tiers.sql', 'utf8')
    
    console.log('📋 Running migration 1: Initial schema...')
    console.log('⚠️  Please run these migrations in your Supabase SQL Editor:')
    console.log('   1. Go to: https://supabase.com/dashboard/project/dqiwbcbsnjpwjioomdcr/sql/new')
    console.log('   2. Copy and paste each migration file')
    console.log('   3. Click "Run" for each one')
    console.log('')
    console.log('Migration files:')
    console.log('   - supabase/migrations/001_initial_schema.sql')
    console.log('   - supabase/migrations/002_usage_tracking_and_tiers.sql')
    console.log('')
    console.log('After running migrations, execute:')
    console.log('   npx tsx scripts/create-demo-account.ts')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the setup
runMigrations()