#!/usr/bin/env node
/**
 * Simple build script that bypasses environment validation
 * for static export builds
 */

const { execSync } = require('child_process');

// Set environment variables
process.env.SKIP_ENV_VALIDATION = 'true';
process.env.DATABASE_URL = 'file:./prisma/dev.db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'placeholder-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'placeholder-service-role-key';
process.env.NODE_ENV = 'production';
process.env.ENABLE_FIELD_ENCRYPTION = 'false';

console.log('🔧 Setting up build environment...');

try {
  // Generate Prisma client
  console.log('🔄 Generating Prisma client...');
  execSync('pnpm prisma generate', { stdio: 'inherit' });
  
  // Build the Next.js application
  console.log('🏗️ Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}