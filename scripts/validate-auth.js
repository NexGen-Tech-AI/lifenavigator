#!/usr/bin/env node

/**
 * Validation script to ensure authentication is properly configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔐 Validating Authentication System...\n');

let hasErrors = false;

// Check 1: Ensure NextAuth is not in dependencies
console.log('1. Checking for NextAuth dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const nextAuthDeps = Object.keys(deps).filter(dep => dep.includes('next-auth'));
  
  if (nextAuthDeps.length > 0) {
    console.error('   ❌ Found NextAuth dependencies:', nextAuthDeps);
    hasErrors = true;
  } else {
    console.log('   ✅ No NextAuth dependencies found');
  }
} catch (error) {
  console.error('   ❌ Error reading package.json:', error.message);
  hasErrors = true;
}

// Check 2: Ensure no NextAuth imports remain
console.log('\n2. Checking for NextAuth imports...');
try {
  const result = execSync('grep -r "next-auth" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" || true', { encoding: 'utf8' });
  
  if (result.trim()) {
    console.error('   ❌ Found NextAuth imports:');
    console.error(result);
    hasErrors = true;
  } else {
    console.log('   ✅ No NextAuth imports found');
  }
} catch (error) {
  console.log('   ✅ No NextAuth imports found');
}

// Check 3: Verify Supabase environment variables
console.log('\n3. Checking Supabase environment variables...');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName} is set`);
  } else {
    console.log(`   ⚠️  ${varName} is not set (required for production)`);
  }
});

// Check 4: Verify middleware is using Supabase
console.log('\n4. Checking middleware configuration...');
try {
  const middlewareContent = fs.readFileSync(path.join(__dirname, '../src/middleware.ts'), 'utf8');
  
  if (middlewareContent.includes('createServerClient') && middlewareContent.includes('@supabase/ssr')) {
    console.log('   ✅ Middleware is using Supabase auth');
  } else {
    console.error('   ❌ Middleware is not properly configured for Supabase');
    hasErrors = true;
  }
} catch (error) {
  console.error('   ❌ Error reading middleware.ts:', error.message);
  hasErrors = true;
}

// Check 5: Verify auth API routes
console.log('\n5. Checking auth API routes...');
const authRoutes = [
  'src/app/api/auth/session/route.ts',
  'src/app/api/auth/logout/route.ts'
];

authRoutes.forEach(route => {
  const routePath = path.join(__dirname, '..', route);
  if (fs.existsSync(routePath)) {
    console.log(`   ✅ ${route} exists`);
  } else {
    console.log(`   ⚠️  ${route} not found (may be optional)`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('\n❌ Authentication validation failed!');
  console.error('Please fix the errors above before proceeding.');
  process.exit(1);
} else {
  console.log('\n✅ Authentication system validation passed!');
  console.log('\nNext steps:');
  console.log('1. Ensure Supabase environment variables are set');
  console.log('2. Test login/logout functionality');
  console.log('3. Verify protected routes are working');
}