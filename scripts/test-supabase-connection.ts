#!/usr/bin/env node
/**
 * Test Supabase Connection
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🔍 Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? 'Found' : 'Missing')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test 1: Try to sign in
    console.log('\n📝 Test 1: Attempting to sign in...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'demo@lifenavigator.ai',
      password: 'demo123'
    })
    
    if (authError) {
      console.error('❌ Sign in failed:', authError.message)
    } else {
      console.log('✅ Sign in successful!')
      console.log('User ID:', authData.user?.id)
    }
    
    // Test 2: Check if users table exists
    console.log('\n📝 Test 2: Checking users table...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, subscription_tier')
      .limit(1)
    
    if (userError) {
      console.error('❌ Users table error:', userError.message)
    } else {
      console.log('✅ Users table accessible')
      console.log('Records found:', userData?.length || 0)
    }
    
    // Test 3: Check if demo user exists in users table
    console.log('\n📝 Test 3: Checking for demo user profile...')
    const { data: demoUser, error: demoError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'demo@lifenavigator.ai')
      .single()
    
    if (demoError) {
      console.error('❌ Demo user not found in users table:', demoError.message)
      console.log('💡 Run the fix-demo-account.sql script in Supabase SQL Editor')
    } else {
      console.log('✅ Demo user found!')
      console.log('- Email:', demoUser.email)
      console.log('- Tier:', demoUser.subscription_tier)
      console.log('- Pilot:', demoUser.pilot_program)
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testConnection()