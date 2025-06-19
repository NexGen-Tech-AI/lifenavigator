#!/usr/bin/env node
/**
 * Simple Plaid Integration Test
 * No external dependencies required
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    console.log('Please create a .env file in the project root');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

// Load environment variables
loadEnv();

console.log('🚀 Plaid Integration Configuration Check\n');

// Check Plaid configuration
console.log('1️⃣  Plaid Environment Variables:');
console.log('================================');

const plaidVars = {
  'PLAID_CLIENT_ID': process.env.PLAID_CLIENT_ID,
  'PLAID_SECRET': process.env.PLAID_SECRET,
  'PLAID_ENV': process.env.PLAID_ENV || 'sandbox'
};

let allPlaidVarsSet = true;
for (const [key, value] of Object.entries(plaidVars)) {
  if (value && value !== 'undefined') {
    console.log(`✅ ${key}: ${key.includes('SECRET') ? '***' + value.slice(-4) : value}`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
    allPlaidVarsSet = false;
  }
}

if (!allPlaidVarsSet) {
  console.log('\n⚠️  Missing Plaid configuration!');
  console.log('Add these to your .env file:');
  console.log('\nPLAID_CLIENT_ID=your_client_id_here');
  console.log('PLAID_SECRET=your_secret_here');
  console.log('PLAID_ENV=sandbox\n');
}

// Check Supabase configuration
console.log('\n2️⃣  Supabase Configuration:');
console.log('===========================');

const supabaseVars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY
};

let allSupabaseVarsSet = true;
for (const [key, value] of Object.entries(supabaseVars)) {
  if (value && value !== 'undefined') {
    console.log(`✅ ${key}: ${key.includes('KEY') ? '***' + value.slice(-8) : value}`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
    allSupabaseVarsSet = false;
  }
}

// Check app configuration
console.log('\n3️⃣  Application Configuration:');
console.log('==============================');

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
console.log(`✅ App URL: ${appUrl}`);

// Check required files
console.log('\n4️⃣  Required Files:');
console.log('===================');

const requiredFiles = [
  'src/app/api/v1/plaid/exchange/route.ts',
  'src/app/api/v1/plaid/webhook/route.ts',
  'src/app/api/v1/plaid/link/route.ts',
  'src/lib/supabase/client.ts',
  'src/lib/supabase/server.ts',
  'supabase/migrations/001_initial_schema.sql',
  'supabase/migrations/002_integrations_and_appointments.sql'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NOT FOUND`);
  }
});

// Integration test checklist
console.log('\n5️⃣  Integration Test Checklist:');
console.log('================================');

if (allPlaidVarsSet && allSupabaseVarsSet) {
  console.log('\n✅ Configuration looks good! You can now test the integration:\n');
  console.log('1. Start the development server:');
  console.log('   npm run dev\n');
  console.log('2. Sign in or create an account');
  console.log('3. Navigate to Dashboard > Finance > Accounts');
  console.log('4. Click "Connect Bank Account"');
  console.log('5. In Plaid Link (sandbox mode):');
  console.log('   - Choose any bank');
  console.log('   - Username: user_good');
  console.log('   - Password: pass_good');
  console.log('6. Select accounts and complete the flow\n');
  console.log('For webhook testing (optional):');
  console.log('1. Install ngrok: https://ngrok.com');
  console.log('2. Run: ngrok http 3000');
  console.log('3. Update NEXT_PUBLIC_APP_URL in .env with ngrok URL');
  console.log('4. Restart the dev server');
} else {
  console.log('\n❌ Please fix the configuration issues above before testing.');
}

console.log('\n📝 Additional Notes:');
console.log('====================');
console.log('- Plaid sandbox credentials are for testing only');
console.log('- Production requires approved Plaid account');
console.log('- Enable Supabase Vault for production token encryption');
console.log('- Review security policies before production deployment');

console.log('\n✨ Configuration check complete!');