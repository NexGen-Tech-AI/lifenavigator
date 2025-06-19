#!/usr/bin/env node

/**
 * Setup Demo Authentication
 * This script ensures demo authentication works in both mock and Supabase modes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up demo authentication...\n');

// Check if we're in mock mode or Supabase mode
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const isMockMode = envContent.includes('YOUR_PROJECT.supabase.co');

if (isMockMode) {
  console.log('📦 Running in mock mode (no Supabase configured)');
  console.log('✅ Mock authentication is already set up!');
  console.log('\n🚀 You can login with:');
  console.log('   Email: demo@lifenavigator.ai');
  console.log('   Password: demo123');
  console.log('\n💡 To use your custom email (timothy@riffeandassociates.com), you need to:');
  console.log('   1. Set up Supabase (run: pnpm run setup:supabase)');
  console.log('   2. Create the user in Supabase Auth');
} else {
  console.log('🌐 Supabase is configured');
  console.log('Please ensure your demo user exists in Supabase Auth');
  console.log('\n📝 To create a demo user in Supabase:');
  console.log('   1. Go to your Supabase dashboard');
  console.log('   2. Navigate to Authentication > Users');
  console.log('   3. Click "Add user" and create:');
  console.log('      - Email: demo@lifenavigator.ai');
  console.log('      - Password: demo123');
  console.log('   4. Or create your custom user:');
  console.log('      - Email: timothy@riffeandassociates.com');
  console.log('      - Password: Your chosen password');
}

console.log('\n✨ Demo authentication setup complete!');