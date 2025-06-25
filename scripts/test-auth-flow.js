#!/usr/bin/env node

/**
 * Test script to verify authentication flow is working
 */

const { execSync } = require('child_process');

console.log('🧪 Testing Authentication Flow\n');

console.log('1. Checking TypeScript compilation...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('   ✅ TypeScript compilation passed\n');
} catch (error) {
  console.error('   ❌ TypeScript compilation failed\n');
}

console.log('2. Running authentication tests...');
try {
  execSync('npm test -- --testPathPattern=auth', { stdio: 'inherit' });
  console.log('   ✅ Authentication tests passed\n');
} catch (error) {
  console.error('   ❌ Some authentication tests failed\n');
}

console.log('3. Checking middleware functionality...');
try {
  execSync('npm test -- --testPathPattern=middleware', { stdio: 'inherit' });
  console.log('   ✅ Middleware tests passed\n');
} catch (error) {
  console.error('   ❌ Some middleware tests failed\n');
}

console.log('\n✅ Authentication flow testing complete!');
console.log('\nTo fully test authentication:');
console.log('1. Set up Supabase environment variables');
console.log('2. Run: npm run dev');
console.log('3. Test login at: http://localhost:3000/auth/login');
console.log('4. Test demo account: demo@lifenavigator.tech / DemoPassword123');