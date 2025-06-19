#!/bin/bash

# LifeNavigator Supabase Setup Script
# This script helps set up the Supabase project with proper security

echo "🚀 LifeNavigator Supabase Setup"
echo "==============================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Creating .env from example..."
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo ""
fi

# Function to update .env file
update_env() {
    local key=$1
    local value=$2
    
    if grep -q "^${key}=" .env; then
        # Update existing
        sed -i.bak "s|^${key}=.*|${key}=${value}|" .env
    else
        # Add new
        echo "${key}=${value}" >> .env
    fi
}

echo "📋 Prerequisites:"
echo "1. Supabase account (https://app.supabase.com)"
echo "2. Google Cloud Console account"
echo "3. Node.js 18+ installed"
echo ""

read -p "Have you created a Supabase project? (y/n): " has_project

if [ "$has_project" != "y" ]; then
    echo ""
    echo "Please create a Supabase project first:"
    echo "1. Go to https://app.supabase.com"
    echo "2. Click 'New Project'"
    echo "3. Fill in:"
    echo "   - Project name: lifenavigator-prod"
    echo "   - Database Password: (save this!)"
    echo "   - Region: Choose closest to users"
    echo "4. Click 'Create Project'"
    echo ""
    echo "Run this script again after creating the project."
    exit 1
fi

echo ""
echo "🔧 Configuring Supabase..."
echo ""

# Get Supabase credentials
read -p "Enter your Supabase project URL (https://xxx.supabase.co): " supabase_url
read -p "Enter your Supabase anon key: " supabase_anon_key
read -p "Enter your Supabase service role key: " supabase_service_key
read -p "Enter your database password: " -s db_password
echo ""

# Update .env file
echo "Updating .env file..."
update_env "NEXT_PUBLIC_SUPABASE_URL" "$supabase_url"
update_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$supabase_anon_key"
update_env "SUPABASE_SERVICE_ROLE_KEY" "$supabase_service_key"

# Extract project ref from URL
project_ref=$(echo $supabase_url | sed -n 's|https://\([^.]*\)\.supabase\.co|\1|p')
update_env "SUPABASE_PROJECT_REF" "$project_ref"

# Create database URL
db_url="postgresql://postgres:${db_password}@db.${project_ref}.supabase.co:5432/postgres"
update_env "DATABASE_URL" "$db_url"

echo -e "${GREEN}✅ Environment variables updated${NC}"
echo ""

# Install Supabase CLI if not installed
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

# Login to Supabase
echo "Logging into Supabase..."
supabase login

# Link project
echo "Linking Supabase project..."
supabase link --project-ref $project_ref

# Create migration files directory
mkdir -p supabase/migrations

echo ""
echo "📊 Running database migrations..."
echo ""

# Run migrations
echo "1. Running initial schema..."
supabase db push < supabase/migrations/001_initial_schema.sql

echo ""
echo "2. Running integrations schema..."
supabase db push < supabase/migrations/002_integrations_and_appointments.sql

echo ""
echo -e "${GREEN}✅ Database migrations complete${NC}"

# Create SQL file for additional setup
cat > supabase/migrations/003_security_setup.sql << 'EOF'
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('financial-documents', 'financial-documents', false),
  ('profile-images', 'profile-images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for financial documents
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'financial-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'financial-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'financial-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create demo account
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  'demo-user-id-123',
  'demo@lifenavigator.ai',
  crypt('demo123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Demo User"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Create demo user profile
INSERT INTO public.users (
  id,
  email,
  name,
  is_demo_account,
  subscription_tier,
  subscription_status,
  onboarding_completed
) VALUES (
  'demo-user-id-123',
  'demo@lifenavigator.ai',
  'Demo User',
  true,
  'PRO',
  'ACTIVE',
  true
) ON CONFLICT (id) DO NOTHING;
EOF

echo ""
echo "3. Running security setup..."
supabase db push < supabase/migrations/003_security_setup.sql

echo ""
echo -e "${GREEN}✅ Security setup complete${NC}"

# Google OAuth setup reminder
echo ""
echo "🔐 Google OAuth Setup Required:"
echo "==============================="
echo ""
echo "1. Go to https://console.cloud.google.com"
echo "2. Create or select a project"
echo "3. Enable these APIs:"
echo "   - Gmail API"
echo "   - Google Calendar API"
echo "4. Create OAuth 2.0 credentials:"
echo "   - Type: Web application"
echo "   - Authorized redirect URIs:"
echo "     - http://localhost:3000/api/v1/integrations/google/callback"
echo "     - ${supabase_url}/api/v1/integrations/google/callback"
echo ""
read -p "Enter your Google Client ID: " google_client_id
read -p "Enter your Google Client Secret: " google_client_secret

update_env "GOOGLE_CLIENT_ID" "$google_client_id"
update_env "GOOGLE_CLIENT_SECRET" "$google_client_secret"

echo ""
echo -e "${GREEN}✅ Google OAuth configured${NC}"

# Create test script
cat > scripts/test-supabase-connection.js << 'EOF'
#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

async function testConnection() {
  console.log('Testing Supabase connection...\n')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    console.log('✅ Database connection successful')
    
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'demo@lifenavigator.ai',
      password: 'demo123'
    })
    
    if (authError) {
      console.log('⚠️  Demo account not accessible:', authError.message)
    } else {
      console.log('✅ Demo account login successful')
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
  }
}

require('dotenv').config()
testConnection()
EOF

chmod +x scripts/test-supabase-connection.js

echo ""
echo "🎯 Final Steps:"
echo "=============="
echo ""
echo "1. Test the connection:"
echo "   node scripts/test-supabase-connection.js"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Visit http://localhost:3000"
echo ""
echo "4. Login with demo account:"
echo "   Email: demo@lifenavigator.ai"
echo "   Password: demo123"
echo ""
echo -e "${GREEN}✅ Supabase setup complete!${NC}"
echo ""
echo "📚 Next steps:"
echo "- Configure Plaid integration"
echo "- Set up monitoring"
echo "- Enable advanced security features"
echo ""
echo "Need help? Check IMPLEMENTATION_ROADMAP.md"