#!/usr/bin/env tsx

/**
 * Force logout script - clears all auth sessions
 * Run with: npx tsx scripts/force-logout.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function forceLogout() {
  console.log('🔄 Forcing logout...\n');
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Error during logout:', error.message);
    } else {
      console.log('✅ Successfully logged out!');
      console.log('\n📝 Next steps:');
      console.log('1. Clear your browser cookies for localhost:3000');
      console.log('2. Navigate to http://localhost:3000/auth/login');
      console.log('3. Login with new credentials:');
      console.log('   Email: demo@lifenavigator.tech');
      console.log('   Password: DemoPassword123');
    }
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
  }
}

forceLogout();