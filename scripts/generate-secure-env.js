#!/usr/bin/env node

/**
 * Generate secure environment variables for LifeNavigator
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

// Generate a secure random string
function generateSecureString(length = 32) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

// Environment template
const envTemplate = `# ===================================
# LifeNavigator Environment Variables
# Generated: ${new Date().toISOString()}
# ===================================

# Supabase Configuration
# Get these from: https://app.supabase.com/project/YOUR_PROJECT/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# AWS Configuration (for document storage)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
AWS_VAULT_BUCKET=lifenavigator-vault-dev
AWS_KMS_KEY_ID=YOUR_KMS_KEY_ID
AWS_PROCESSING_BUCKET=lifenavigator-processing-dev

# Plaid Configuration (for financial integrations)
# Get these from: https://dashboard.plaid.com/account/keys
PLAID_CLIENT_ID=YOUR_PLAID_CLIENT_ID
PLAID_SECRET=YOUR_PLAID_SECRET
PLAID_ENV=sandbox
PLAID_WEBHOOK_SECRET=${generateSecureString(32)}

# Google OAuth (optional - for calendar/email integration)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Stripe Configuration (optional - for payments)
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY

# Coinbase Configuration (optional - for crypto)
COINBASE_API_KEY=YOUR_COINBASE_API_KEY
COINBASE_API_SECRET=YOUR_COINBASE_API_SECRET

# Security Keys (auto-generated)
ENCRYPTION_KEY=${generateSecureString(32)}
JWT_SECRET=${generateSecureString(32)}

# Demo Account (do not change)
DEMO_USER_ID=11111111-1111-1111-1111-111111111111
DEMO_USER_EMAIL=demo@lifenavigator.ai
DEMO_USER_PASSWORD=demo123
`;

// Production template
const prodTemplate = `# ===================================
# LifeNavigator PRODUCTION Environment
# Generated: ${new Date().toISOString()}
# ===================================
# SECURITY WARNING: Keep this file secret!

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROD_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PROD_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_PROD_SERVICE_ROLE_KEY

# Application URLs
NEXT_PUBLIC_APP_URL=https://lifenavigator.ai
NODE_ENV=production

# AWS Configuration (production)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_PROD_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_PROD_AWS_SECRET_KEY
AWS_VAULT_BUCKET=lifenavigator-vault-prod
AWS_KMS_KEY_ID=YOUR_PROD_KMS_KEY_ID
AWS_PROCESSING_BUCKET=lifenavigator-processing-prod

# Plaid Configuration (production)
PLAID_CLIENT_ID=YOUR_PROD_PLAID_CLIENT_ID
PLAID_SECRET=YOUR_PROD_PLAID_SECRET
PLAID_ENV=production
PLAID_WEBHOOK_SECRET=${generateSecureString(64)}

# Security Keys (production - extra long)
ENCRYPTION_KEY=${generateSecureString(64)}
JWT_SECRET=${generateSecureString(64)}

# Additional Production Security
RATE_LIMIT_AUTH=5:900000  # 5 attempts per 15 minutes
RATE_LIMIT_API=100:60000  # 100 requests per minute
SESSION_TIMEOUT=1800000  # 30 minutes
`;

// Main function
async function generateEnvFile() {
  console.log(`${colors.blue}🔐 LifeNavigator Environment Generator${colors.reset}\n`);

  const args = process.argv.slice(2);
  const isProd = args.includes('--prod') || args.includes('--production');
  
  const fileName = isProd ? '.env.production.local' : '.env.local';
  const template = isProd ? prodTemplate : envTemplate;
  
  const filePath = path.join(process.cwd(), fileName);
  
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`${colors.yellow}⚠️  ${fileName} already exists!${colors.reset}`);
    console.log('Do you want to overwrite it? (y/N): ');
    
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    
    const answer = await new Promise(resolve => {
      stdin.once('data', key => {
        stdin.setRawMode(false);
        stdin.pause();
        resolve(key);
      });
    });
    
    if (answer.toString().toLowerCase() !== 'y') {
      console.log(`${colors.red}❌ Cancelled${colors.reset}`);
      process.exit(0);
    }
  }
  
  // Write the file
  fs.writeFileSync(filePath, template);
  
  console.log(`${colors.green}✅ Created ${fileName}${colors.reset}\n`);
  
  // Instructions
  console.log(`${colors.magenta}📝 Next Steps:${colors.reset}\n`);
  console.log('1. Get your Supabase credentials:');
  console.log('   - Go to https://app.supabase.com');
  console.log('   - Open your project → Settings → API');
  console.log('   - Copy the URL and keys\n');
  
  console.log('2. Replace the placeholder values in ' + fileName);
  console.log('   - NEXT_PUBLIC_SUPABASE_URL');
  console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY\n');
  
  if (!isProd) {
    console.log('3. For AWS (optional for now):');
    console.log('   - Create an S3 bucket');
    console.log('   - Create a KMS key');
    console.log('   - Create an IAM user with appropriate permissions\n');
    
    console.log('4. For Plaid (optional for now):');
    console.log('   - Sign up at https://dashboard.plaid.com');
    console.log('   - Get your sandbox credentials\n');
  }
  
  console.log(`${colors.yellow}⚠️  Security Notes:${colors.reset}`);
  console.log('- Never commit .env files to git');
  console.log('- Keep SERVICE_ROLE_KEY absolutely secret');
  console.log('- Use different credentials for production');
  console.log('- Rotate keys regularly\n');
  
  // Also create a sample for easy copying
  const samplePath = path.join(process.cwd(), fileName + '.sample');
  const sampleContent = template.replace(/=.+$/gm, '=');
  fs.writeFileSync(samplePath, sampleContent);
  console.log(`${colors.green}✅ Also created ${fileName}.sample (safe to commit)${colors.reset}`);
}

// Run the generator
generateEnvFile().catch(console.error);