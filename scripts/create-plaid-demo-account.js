#!/usr/bin/env node

/**
 * Create Plaid Demo Account
 * This script sets up a demo account specifically for Plaid integration testing
 */

const fs = require('fs');
const path = require('path');

console.log('🏦 Creating Plaid Demo Account Configuration...\n');

// Plaid demo account details
const plaidDemoAccount = {
  email: 'plaid-demo@lifenavigator.ai',
  password: 'plaid-demo-2024',
  name: 'Plaid Demo User',
  description: 'Demo account for testing Plaid integration'
};

// Update the mock client to include Plaid demo account
const mockClientPath = path.join(__dirname, '..', 'src', 'lib', 'supabase', 'mock-client.ts');
const mockClientContent = fs.readFileSync(mockClientPath, 'utf-8');

// Check if plaid demo account already exists
if (!mockClientContent.includes(plaidDemoAccount.email)) {
  console.log('📝 Adding Plaid demo account to mock authentication...');
  
  // Find the mockUsers object and add the new account
  const updatedContent = mockClientContent.replace(
    `'timothy@riffeandassociates.com': {
      id: 'timothy-user-id',
      email: 'timothy@riffeandassociates.com',
      app_metadata: {},
      user_metadata: { name: 'Timothy Riffe' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    }`,
    `'timothy@riffeandassociates.com': {
      id: 'timothy-user-id',
      email: 'timothy@riffeandassociates.com',
      app_metadata: {},
      user_metadata: { name: 'Timothy Riffe' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    },
    '${plaidDemoAccount.email}': {
      id: 'plaid-demo-user-id',
      email: '${plaidDemoAccount.email}',
      app_metadata: {},
      user_metadata: { name: '${plaidDemoAccount.name}' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    }`
  );
  
  // Add the login credentials
  const finalContent = updatedContent.replace(
    `// Accept Timothy's credentials for testing
        if (email === 'timothy@riffeandassociates.com' && password === 'Sushi!$#1') {`,
    `// Accept Timothy's credentials for testing
        if (email === 'timothy@riffeandassociates.com' && password === 'Sushi!$#1') {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('mock-auth', 'true');
            window.localStorage.setItem('mock-user-email', email);
          }
          return { data: { user: mockUsers[email], session: {} }, error: null };
        }
        
        // Accept Plaid demo credentials
        if (email === '${plaidDemoAccount.email}' && password === '${plaidDemoAccount.password}') {`
  );
  
  fs.writeFileSync(mockClientPath, finalContent);
  console.log('✅ Plaid demo account added to mock authentication');
} else {
  console.log('✅ Plaid demo account already exists');
}

console.log('\n🎉 Plaid Demo Account Created!');
console.log('\n📋 Account Details:');
console.log(`   Email: ${plaidDemoAccount.email}`);
console.log(`   Password: ${plaidDemoAccount.password}`);
console.log(`   Purpose: ${plaidDemoAccount.description}`);
console.log('\n💡 Next Steps:');
console.log('   1. Login with the Plaid demo account');
console.log('   2. Navigate to Settings > Integrations');
console.log('   3. Connect to Plaid sandbox account');
console.log('   4. Test financial data integration');
console.log('\n⚠️  Note: This account works in mock mode. For production:');
console.log('   - Set up Supabase authentication');
console.log('   - Create the user in Supabase Auth dashboard');
console.log('   - Configure Plaid API credentials in .env.local');