#!/bin/bash

# Quick Secure Setup for LifeNavigator
# This script provides a fast path to get Supabase running with security

set -e

echo "🚀 LifeNavigator Quick Secure Setup"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env from example${NC}"
    else
        echo -e "${RED}❌ No .env.example found${NC}"
        exit 1
    fi
fi

# Function to update .env
update_env() {
    local key=$1
    local value=$2
    
    if grep -q "^${key}=" .env; then
        sed -i.bak "s|^${key}=.*|${key}=${value}|" .env
    else
        echo "${key}=${value}" >> .env
    fi
}

echo "📋 Prerequisites:"
echo "1. Supabase account (https://app.supabase.com)"
echo "2. Node.js 18+ installed"
echo ""

# Quick check for Supabase config
if grep -q "NEXT_PUBLIC_SUPABASE_URL=your" .env || [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ]; then
    echo -e "${YELLOW}Supabase not configured. Let's set it up!${NC}"
    echo ""
    echo "Steps:"
    echo "1. Go to https://app.supabase.com"
    echo "2. Create a new project (or use existing)"
    echo "3. Go to Settings → API"
    echo ""
    read -p "Enter your Supabase URL: " supabase_url
    read -p "Enter your Supabase anon key: " supabase_anon
    read -p "Enter your Supabase service role key: " supabase_service
    
    update_env "NEXT_PUBLIC_SUPABASE_URL" "$supabase_url"
    update_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$supabase_anon"
    update_env "SUPABASE_SERVICE_ROLE_KEY" "$supabase_service"
    
    echo -e "${GREEN}✅ Supabase credentials saved${NC}"
fi

# Generate security keys
echo ""
echo "🔐 Generating security keys..."

# Only generate if not already set
if ! grep -q "^ENCRYPTION_KEY=" .env || grep -q "^ENCRYPTION_KEY=$" .env; then
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    update_env "ENCRYPTION_KEY" "$ENCRYPTION_KEY"
fi

if ! grep -q "^JWT_SECRET=" .env || grep -q "^JWT_SECRET=$" .env; then
    JWT_SECRET=$(openssl rand -base64 64)
    update_env "JWT_SECRET" "$JWT_SECRET"
fi

if ! grep -q "^SESSION_SECRET=" .env || grep -q "^SESSION_SECRET=$" .env; then
    SESSION_SECRET=$(openssl rand -base64 32)
    update_env "SESSION_SECRET" "$SESSION_SECRET"
fi

echo -e "${GREEN}✅ Security keys configured${NC}"

# Add security settings
echo ""
echo "🛡️ Configuring security settings..."

# Add security configs if not present
if ! grep -q "^NODE_ENV=" .env; then
    cat >> .env << 'EOF'

# Security Settings
NODE_ENV=development
SECURE_COOKIES=false
SESSION_TIMEOUT=900000
MAX_LOGIN_ATTEMPTS=5
MFA_ENABLED=false
AUDIT_LOGGING=true
EOF
fi

echo -e "${GREEN}✅ Security settings added${NC}"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --silent

# Create SQL setup file
echo ""
echo "💾 Creating database setup SQL..."

mkdir -p supabase/migrations

cat > supabase/migrations/setup.sql << 'EOF'
-- Run this in your Supabase SQL editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Import the schema from 001_initial_schema.sql first
-- Then run this for security setup:

-- Create demo user with secure password
DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  ) VALUES (
    gen_random_uuid(),
    'demo@lifenavigator.ai',
    crypt('Demo@Secure2024!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"name": "Demo User"}'::jsonb
  ) ON CONFLICT (email) DO UPDATE
    SET encrypted_password = EXCLUDED.encrypted_password
  RETURNING id INTO demo_user_id;

  -- Create user profile
  INSERT INTO public.users (
    id,
    email,
    name,
    is_demo_account,
    subscription_tier,
    subscription_status,
    onboarding_completed
  ) VALUES (
    demo_user_id,
    'demo@lifenavigator.ai',
    'Demo User',
    true,
    'PRO',
    'ACTIVE',
    true
  ) ON CONFLICT (id) DO UPDATE
    SET subscription_tier = EXCLUDED.subscription_tier,
        subscription_status = EXCLUDED.subscription_status;

  -- Create demo financial accounts
  INSERT INTO public.financial_accounts (
    user_id,
    account_name,
    account_type,
    institution_name,
    current_balance,
    data_source
  ) VALUES 
    (demo_user_id, 'Demo Checking', 'CHECKING', 'Demo Bank', 5420.50, 'MANUAL'),
    (demo_user_id, 'Demo Savings', 'SAVINGS', 'Demo Bank', 15750.00, 'MANUAL'),
    (demo_user_id, 'Demo Credit Card', 'CREDIT_CARD', 'Demo Card Inc', -1245.30, 'MANUAL')
  ON CONFLICT DO NOTHING;
END $$;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Users can view own data" ON public.users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own accounts" ON public.financial_accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
EOF

echo -e "${GREEN}✅ Database setup SQL created${NC}"

# Create test script
cat > test-setup.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSetup() {
  console.log('Testing Supabase connection...\n');
  
  try {
    // Test connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('❌ Tables not created yet. Please run the SQL migrations first.');
      console.log('\nNext steps:');
      console.log('1. Go to Supabase SQL Editor');
      console.log('2. Run supabase/migrations/001_initial_schema.sql');
      console.log('3. Run supabase/migrations/setup.sql');
      return;
    }
    
    if (error) throw error;
    
    console.log('✅ Database connection successful');
    
    // Test auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'demo@lifenavigator.ai',
      password: 'Demo@Secure2024!'
    });
    
    if (authError) {
      console.log('⚠️  Demo account not found. Run the SQL setup.');
    } else {
      console.log('✅ Demo account login successful');
      console.log('   Email: demo@lifenavigator.ai');
      console.log('   Password: Demo@Secure2024!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSetup();
EOF

echo ""
echo -e "${GREEN}🎉 Quick setup complete!${NC}"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Go to your Supabase SQL Editor"
echo "2. Run these SQL files in order:"
echo "   a) supabase/migrations/001_initial_schema.sql"
echo "   b) supabase/migrations/setup.sql"
echo ""
echo "3. Test your setup:"
echo "   node test-setup.js"
echo ""
echo "4. Start the development server:"
echo "   npm run dev"
echo ""
echo "5. Login with:"
echo "   Email: demo@lifenavigator.ai"
echo "   Password: Demo@Secure2024!"
echo ""
echo "For full security setup, run:"
echo "   ./scripts/setup-elite-security-supabase.sh"
echo ""