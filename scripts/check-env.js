#!/usr/bin/env node

/**
 * Environment Variable Checker
 * Run this to validate all required environment variables are set
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Required environment variables
const requiredVars = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL (https://xxx.supabase.co)',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anonymous key',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key',
  
  // AWS S3
  AWS_REGION: 'AWS region (e.g., us-east-1)',
  AWS_ACCESS_KEY_ID: 'AWS access key ID',
  AWS_SECRET_ACCESS_KEY: 'AWS secret access key',
  AWS_VAULT_BUCKET: 'S3 bucket name for document storage',
  AWS_KMS_KEY_ID: 'KMS key ID for encryption',
};

// Optional environment variables
const optionalVars = {
  // Plaid
  PLAID_CLIENT_ID: 'Plaid client ID (for financial integration)',
  PLAID_SECRET: 'Plaid secret key',
  PLAID_ENV: 'Plaid environment (sandbox/development/production)',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: 'Google OAuth client ID',
  GOOGLE_CLIENT_SECRET: 'Google OAuth client secret',
  
  // Stripe
  STRIPE_SECRET_KEY: 'Stripe secret key',
  STRIPE_WEBHOOK_SECRET: 'Stripe webhook secret',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'Stripe publishable key',
  
  // Other
  ENCRYPTION_KEY: 'Encryption key (32+ characters)',
  JWT_SECRET: 'JWT secret (32+ characters)',
};

console.log(`${colors.blue}🔍 Checking Environment Variables${colors.reset}\n`);

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envLocalPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath) && !fs.existsSync(envLocalPath)) {
  console.log(`${colors.red}❌ No .env or .env.local file found!${colors.reset}`);
  console.log('Create one of these files in the project root.\n');
}

// Check required variables
console.log(`${colors.yellow}Required Variables:${colors.reset}`);
let missingRequired = [];

for (const [key, description] of Object.entries(requiredVars)) {
  if (process.env[key]) {
    console.log(`${colors.green}✅ ${key}${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ ${key}${colors.reset} - ${description}`);
    missingRequired.push(key);
  }
}

// Check optional variables
console.log(`\n${colors.yellow}Optional Variables:${colors.reset}`);
let missingOptional = [];

for (const [key, description] of Object.entries(optionalVars)) {
  if (process.env[key]) {
    console.log(`${colors.green}✅ ${key}${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  ${key}${colors.reset} - ${description}`);
    missingOptional.push(key);
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (missingRequired.length === 0) {
  console.log(`${colors.green}✅ All required environment variables are set!${colors.reset}`);
} else {
  console.log(`${colors.red}❌ Missing ${missingRequired.length} required environment variables!${colors.reset}`);
  console.log('\nAdd these to your .env file:');
  missingRequired.forEach(key => {
    console.log(`${key}=your_value_here`);
  });
}

if (missingOptional.length > 0) {
  console.log(`\n${colors.yellow}⚠️  ${missingOptional.length} optional variables not set.${colors.reset}`);
  console.log('Some features may be disabled.');
}

// Check specific values
console.log('\n' + '='.repeat(50));
console.log(`${colors.blue}Validation Checks:${colors.reset}`);

// Check Supabase URL format
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co')) {
    console.log(`${colors.green}✅ Supabase URL format looks correct${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  Supabase URL might be incorrect${colors.reset}`);
  }
}

// Check AWS region
if (process.env.AWS_REGION) {
  const validRegions = ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1'];
  if (validRegions.includes(process.env.AWS_REGION)) {
    console.log(`${colors.green}✅ AWS region is valid${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  Unusual AWS region: ${process.env.AWS_REGION}${colors.reset}`);
  }
}

// Check Plaid environment
if (process.env.PLAID_ENV) {
  if (['sandbox', 'development', 'production'].includes(process.env.PLAID_ENV)) {
    console.log(`${colors.green}✅ Plaid environment is valid: ${process.env.PLAID_ENV}${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Invalid Plaid environment: ${process.env.PLAID_ENV}${colors.reset}`);
  }
}

// Exit with error if missing required vars
if (missingRequired.length > 0) {
  process.exit(1);
}