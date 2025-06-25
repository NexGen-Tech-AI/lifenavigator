#!/usr/bin/env tsx

/**
 * Script to ensure demo account exists and is properly configured
 * Run with: npx tsx scripts/ensure-demo-account.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function ensureDemoAccount() {
  console.log('🔍 Checking for demo account...\n');

  const demoEmail = 'demo@lifenavigator.tech';
  const demoPassword = 'DemoPassword123';

  try {
    // Check if user exists
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existingUser = users.find(u => u.email === demoEmail);

    let userId: string;

    if (existingUser) {
      console.log('✓ Demo user already exists');
      userId = existingUser.id;
      
      // Update password to ensure it matches
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: demoPassword }
      );
      
      if (updateError) {
        console.error('❌ Error updating password:', updateError.message);
      } else {
        console.log('✓ Password updated successfully');
      }
    } else {
      console.log('📝 Creating demo user...');
      
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Demo User',
          username: 'demo_user'
        }
      });

      if (createError) {
        console.error('❌ Error creating user:', createError.message);
        process.exit(1);
      }

      userId = newUser.user.id;
      console.log('✓ Demo user created successfully');
    }

    // Ensure profile exists
    console.log('\n📝 Ensuring user profile...');
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: demoEmail,
        username: 'demo_user',
        full_name: 'Demo User',
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Error creating/updating profile:', profileError.message);
    } else {
      console.log('✓ User profile ready');
    }

    // Test login
    console.log('\n🔐 Testing login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword
    });

    if (signInError) {
      console.error('❌ Login test failed:', signInError.message);
    } else {
      console.log('✓ Login successful!');
    }

    console.log('\n✨ Demo account is ready!');
    console.log('📧 Email:', demoEmail);
    console.log('🔑 Password:', demoPassword);
    console.log('\n🚀 You can now login at: /auth/login');

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the script
ensureDemoAccount();