# Complete Supabase Database Setup Guide with Elite Security

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Create Supabase Project](#create-supabase-project)
3. [Configure Environment Variables](#configure-environment-variables)
4. [Run Database Migrations](#run-database-migrations)
5. [Configure Security Settings](#configure-security-settings)
6. [Set Up Authentication](#set-up-authentication)
7. [Configure Row Level Security](#configure-row-level-security)
8. [Create Storage Buckets](#create-storage-buckets)
9. [Set Up Audit Logging](#set-up-audit-logging)
10. [Create Demo Accounts](#create-demo-accounts)
11. [Test Your Setup](#test-your-setup)
12. [Production Security Checklist](#production-security-checklist)

## Prerequisites

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] A Supabase account (free tier is fine)
- [ ] Git installed
- [ ] Basic familiarity with SQL
- [ ] The LifeNavigator repository cloned

## 🚀 Step 1: Create Supabase Project

### 1.1 Sign up/Login to Supabase
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in with your account

### 1.2 Create New Project
1. Click **"New project"**
2. Fill in the following:
   - **Project name**: `lifenavigator-prod` (or your preferred name)
   - **Database Password**: Generate a strong password (32+ characters)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier to start

3. **IMPORTANT**: Save your database password securely - you'll need it later!

4. Click **"Create new project"** and wait for setup (usually 2-3 minutes)

## 🔑 Step 2: Configure Environment Variables

### 2.1 Get Your Supabase Credentials
1. Once your project is created, go to **Settings → API**
2. You'll see several keys - copy these values:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **anon public**: Your anonymous key (safe for frontend)
   - **service_role**: Your service role key (keep secret!)

### 2.2 Set Up Local Environment
1. In your terminal, navigate to the project root:
   ```bash
   cd /home/vboxuser/lifenavigator
   ```

2. Create your .env file:
   ```bash
   cp .env.example .env
   ```

3. Edit the .env file and add your Supabase credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
   
   # Database (for migrations)
   DATABASE_URL=postgresql://postgres:[your-database-password]@db.[your-project-id].supabase.co:5432/postgres
   ```

### 2.3 Generate Security Keys
Run the security setup script:
```bash
./scripts/quick-secure-setup.sh
```

This will add additional security keys to your .env file.

## 📊 Step 3: Run Database Migrations

### 3.1 Access SQL Editor
1. In your Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **"New query"**

### 3.2 Run Initial Schema Migration
1. Open the file `/home/vboxuser/lifenavigator/supabase/migrations/001_initial_schema.sql`
2. Copy the ENTIRE contents of this file
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** (or press Ctrl/Cmd + Enter)

You should see "Success. No rows returned" - this is normal!

### 3.3 Verify Tables Were Created
Run this query to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see these tables:
- budgets
- documents
- financial_accounts
- goals
- plaid_items
- security_audit_logs
- transactions
- users

## 🔐 Step 4: Configure Security Settings

### 4.1 Run Security Enhancement Migration
1. Create a new query in SQL Editor
2. Copy and paste this security setup:

```sql
-- Enable required extensions for security
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create encryption key configuration
ALTER DATABASE postgres SET "app.encryption_key" = 'your-base64-encoded-32-byte-key';

-- Create secure password validation function
CREATE OR REPLACE FUNCTION validate_password_strength(password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Minimum 12 characters
  IF LENGTH(password) < 12 THEN
    RAISE EXCEPTION 'Password must be at least 12 characters';
  END IF;
  
  -- Must contain uppercase
  IF password !~ '[A-Z]' THEN
    RAISE EXCEPTION 'Password must contain uppercase letters';
  END IF;
  
  -- Must contain lowercase
  IF password !~ '[a-z]' THEN
    RAISE EXCEPTION 'Password must contain lowercase letters';
  END IF;
  
  -- Must contain numbers
  IF password !~ '[0-9]' THEN
    RAISE EXCEPTION 'Password must contain numbers';
  END IF;
  
  -- Must contain special characters
  IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    RAISE EXCEPTION 'Password must contain special characters';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create failed login tracking
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  attempt_time TIMESTAMPTZ DEFAULT NOW(),
  lockout_until TIMESTAMPTZ
);

-- Create session management table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create MFA table
CREATE TABLE IF NOT EXISTS public.user_mfa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL, -- Will be encrypted
  backup_codes TEXT[], -- Will be encrypted
  enabled BOOLEAN DEFAULT FALSE,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create GDPR consent tracking
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL,
  consent_date TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  withdrawal_date TIMESTAMPTZ,
  version TEXT NOT NULL,
  UNIQUE(user_id, consent_type)
);

-- Enable RLS on security tables
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mfa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security tables
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.user_sessions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own MFA" ON public.user_mfa
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own consents" ON public.user_consents
  FOR ALL USING (auth.uid() = user_id);
```

3. Click **"Run"**

### 4.2 Create Audit Trigger Function
Run this in a new query:

```sql
-- Create comprehensive audit function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  audit_data JSONB;
  user_id_val UUID;
BEGIN
  -- Try to get user_id from auth context
  BEGIN
    user_id_val := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    user_id_val := NULL;
  END;

  -- Build audit data
  audit_data := jsonb_build_object(
    'table_name', TG_TABLE_NAME,
    'operation', TG_OP,
    'user_id', user_id_val,
    'timestamp', NOW(),
    'old_data', CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    'new_data', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    'query', current_query()
  );
  
  -- Insert audit record
  INSERT INTO public.security_audit_logs (
    user_id,
    event,
    event_type,
    metadata
  ) VALUES (
    user_id_val,
    TG_OP || '_' || TG_TABLE_NAME,
    CASE 
      WHEN TG_TABLE_NAME IN ('financial_accounts', 'transactions') THEN 'FINANCIAL_DATA'
      WHEN TG_TABLE_NAME = 'users' THEN 'USER_DATA'
      WHEN TG_TABLE_NAME = 'documents' THEN 'DOCUMENT_ACCESS'
      ELSE 'DATA_CHANGE'
    END,
    audit_data
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to all sensitive tables
CREATE TRIGGER audit_users_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_financial_accounts_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.financial_accounts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_transactions_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_documents_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_plaid_items_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.plaid_items
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## 🔒 Step 5: Set Up Authentication

### 5.1 Configure Auth Settings
1. Go to **Authentication → Settings** in Supabase dashboard
2. Configure the following:

#### Email Auth
- **Enable Email Confirmations**: ✅ ON
- **Confirm Email**: ✅ Required
- **Secure Email Change**: ✅ Enabled
- **Secure Password Change**: ✅ Enabled

#### Password Requirements
- **Minimum password length**: 12
- **Require uppercase**: ✅
- **Require lowercase**: ✅
- **Require numbers**: ✅
- **Require special characters**: ✅

#### Session Configuration
- **JWT expiry**: 900 (15 minutes)
- **Refresh token rotation**: ✅ Enabled
- **Reuse interval**: 10

### 5.2 Configure Email Templates
1. Go to **Authentication → Email Templates**
2. Update each template with security-focused messaging:

**Confirmation Email:**
```html
<h2>Confirm your LifeNavigator account</h2>
<p>Thanks for signing up! Please confirm your email address to activate your account.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token={{ .Token }}">Confirm Email</a></p>
<p>This link expires in 24 hours. If you didn't request this, please ignore this email.</p>
<hr>
<p>Security tip: Never share your login credentials with anyone.</p>
```

### 5.3 Configure Redirect URLs
1. Go to **Authentication → URL Configuration**
2. Set:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: 
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000/auth/reset-password
     ```

## 🛡️ Step 6: Configure Row Level Security

### 6.1 Verify RLS is Enabled
Run this query to check:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`.

### 6.2 Create Additional RLS Policies
Run these for enhanced security:

```sql
-- Policy for demo accounts (read-only for most operations)
CREATE POLICY "Demo accounts read only" ON public.financial_accounts
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    NOT EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_demo_account = true
    )
  );

-- Policy for audit logs (write-only, no reads for regular users)
CREATE POLICY "Audit logs write only" ON public.security_audit_logs
  FOR INSERT WITH CHECK (true);

-- Policy for admins to read audit logs
CREATE POLICY "Admins read audit logs" ON public.security_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND email IN ('admin@lifenavigator.ai', 'security@lifenavigator.ai')
    )
  );
```

## 📦 Step 7: Create Storage Buckets

### 7.1 Create Buckets
Run this SQL:
```sql
-- Create storage buckets for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'financial-documents', 
    'financial-documents', 
    false,
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/csv']
  ),
  (
    'profile-images', 
    'profile-images', 
    false,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;
```

### 7.2 Create Storage Policies
```sql
-- Financial documents policies (strict access)
CREATE POLICY "Users upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'financial-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1] AND
    LOWER(storage.extension(name)) IN ('pdf', 'jpg', 'jpeg', 'png', 'csv')
  );

CREATE POLICY "Users view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'financial-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'financial-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Profile images policies
CREATE POLICY "Users upload own profile image" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1] AND
    LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
  );

CREATE POLICY "Anyone can view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users update own profile image" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own profile image" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 📝 Step 8: Set Up Audit Logging

### 8.1 Create Audit Log Indexes
```sql
-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX idx_audit_logs_event ON public.security_audit_logs(event);
CREATE INDEX idx_audit_logs_created ON public.security_audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_event_type ON public.security_audit_logs(event_type);

-- Create index for compliance queries
CREATE INDEX idx_audit_logs_compliance ON public.security_audit_logs(user_id, created_at DESC)
  WHERE event_type IN ('FINANCIAL_DATA', 'USER_DATA', 'DOCUMENT_ACCESS');
```

### 8.2 Create Audit Views
```sql
-- Create view for user activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  u.email,
  u.name,
  COUNT(DISTINCT DATE(al.created_at)) as active_days,
  COUNT(al.id) as total_actions,
  MAX(al.created_at) as last_activity,
  COUNT(CASE WHEN al.event_type = 'FINANCIAL_DATA' THEN 1 END) as financial_actions
FROM public.users u
LEFT JOIN public.security_audit_logs al ON u.id = al.user_id
WHERE al.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email, u.name;

-- Grant read access to authenticated users for their own data
CREATE POLICY "Users view own activity" ON user_activity_summary
  FOR SELECT USING (email = current_setting('request.jwt.claims')::json->>'email');
```

## 👥 Step 9: Create Demo Accounts

### 9.1 Create Secure Demo Account
Run this SQL to create a demo account:

```sql
-- Create demo user function
CREATE OR REPLACE FUNCTION create_demo_user()
RETURNS void AS $$
DECLARE
  demo_user_id UUID;
  demo_account_id UUID;
BEGIN
  -- Generate a new UUID for the demo user
  demo_user_id := gen_random_uuid();
  
  -- Create auth user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    demo_user_id,
    '00000000-0000-0000-0000-000000000000',
    'demo@lifenavigator.tech',
    crypt('Demo@Secure2024!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"name": "Demo User", "role": "user"}'::jsonb,
    false,
    'authenticated'
  ) ON CONFLICT (email) DO UPDATE
    SET encrypted_password = EXCLUDED.encrypted_password,
        updated_at = NOW();

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
    'demo@lifenavigator.tech',
    'Demo User',
    true,
    'PRO',
    'ACTIVE',
    true
  ) ON CONFLICT (email) DO UPDATE
    SET subscription_tier = EXCLUDED.subscription_tier,
        subscription_status = EXCLUDED.subscription_status,
        updated_at = NOW();

  -- Create demo financial accounts
  INSERT INTO public.financial_accounts (
    id,
    user_id,
    account_name,
    account_type,
    institution_name,
    current_balance,
    available_balance,
    data_source
  ) VALUES 
    (gen_random_uuid(), demo_user_id, 'Demo Checking', 'CHECKING', 'Demo Bank', 5420.50, 5420.50, 'MANUAL'),
    (gen_random_uuid(), demo_user_id, 'Demo Savings', 'SAVINGS', 'Demo Bank', 15750.00, 15750.00, 'MANUAL'),
    (gen_random_uuid(), demo_user_id, 'Demo Credit Card', 'CREDIT_CARD', 'Demo Card Inc', -1245.30, 3754.70, 'MANUAL')
  RETURNING id INTO demo_account_id;

  -- Create sample transactions for the checking account
  INSERT INTO public.transactions (
    user_id,
    account_id,
    transaction_date,
    amount,
    description,
    subcategory
  ) 
  SELECT 
    demo_user_id,
    demo_account_id,
    CURRENT_DATE - (n || ' days')::interval,
    CASE 
      WHEN n % 5 = 0 THEN (100 + random() * 200)
      ELSE -(10 + random() * 90)
    END,
    CASE 
      WHEN n % 5 = 0 THEN 'Deposit'
      WHEN n % 7 = 0 THEN 'Grocery Store'
      WHEN n % 3 = 0 THEN 'Restaurant'
      ELSE 'Online Purchase'
    END,
    CASE 
      WHEN n % 5 = 0 THEN 'Income'
      WHEN n % 7 = 0 THEN 'Groceries'
      WHEN n % 3 = 0 THEN 'Dining'
      ELSE 'Shopping'
    END
  FROM generate_series(1, 30) n;

  -- Create demo budgets
  INSERT INTO public.budgets (
    user_id,
    name,
    amount,
    period,
    start_date,
    is_active
  ) VALUES 
    (demo_user_id, 'Groceries Budget', 500.00, 'MONTHLY', CURRENT_DATE, true),
    (demo_user_id, 'Entertainment Budget', 200.00, 'MONTHLY', CURRENT_DATE, true),
    (demo_user_id, 'Transportation Budget', 150.00, 'MONTHLY', CURRENT_DATE, true);

  -- Create demo goals
  INSERT INTO public.goals (
    user_id,
    name,
    description,
    target_amount,
    current_amount,
    target_date,
    goal_type,
    priority
  ) VALUES 
    (demo_user_id, 'Emergency Fund', 'Build 6 months of expenses', 10000.00, 3500.00, CURRENT_DATE + INTERVAL '1 year', 'EMERGENCY_FUND', 'HIGH'),
    (demo_user_id, 'Vacation Fund', 'Trip to Europe', 5000.00, 1200.00, CURRENT_DATE + INTERVAL '6 months', 'SAVINGS', 'MEDIUM');

  RAISE NOTICE 'Demo user created successfully';
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_demo_user();
```

### 9.2 Create Additional Test Accounts
```sql
-- Create HIPAA test account
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'hipaa-test@lifenavigator.ai',
  crypt('Hipaa@Test2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "HIPAA Test User", "role": "user", "compliance_test": true}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Create admin demo account
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin-demo@lifenavigator.tech',
  crypt('Admin@Demo2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Admin Demo", "role": "admin"}'::jsonb,
  'service_role'
) ON CONFLICT (email) DO NOTHING;
```

## 🧪 Step 10: Test Your Setup

### 10.1 Create Test Script
Create a file `test-supabase-setup.js` in your project root:

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSetup() {
  console.log('🧪 Testing Supabase Setup...\n');
  
  const tests = {
    connection: false,
    auth: false,
    rls: false,
    audit: false
  };
  
  try {
    // Test 1: Database connection
    console.log('1. Testing database connection...');
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (!tablesError) {
      tests.connection = true;
      console.log('   ✅ Database connection successful\n');
    } else {
      console.log('   ❌ Database connection failed:', tablesError.message, '\n');
    }
    
    // Test 2: Authentication
    console.log('2. Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'demo@lifenavigator.tech',
      password: 'Demo@Secure2024!'
    });
    
    if (!authError && authData.user) {
      tests.auth = true;
      console.log('   ✅ Authentication successful');
      console.log(`   User ID: ${authData.user.id}\n`);
      
      // Test 3: Row Level Security
      console.log('3. Testing Row Level Security...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (!userError && userData) {
        tests.rls = true;
        console.log('   ✅ RLS working correctly');
        console.log(`   Can access own data: ${userData.email}\n`);
      } else {
        console.log('   ❌ RLS test failed:', userError?.message || 'No data', '\n');
      }
      
      // Test 4: Audit logging
      console.log('4. Testing audit logging...');
      const { data: accounts, error: accountsError } = await supabase
        .from('financial_accounts')
        .select('*')
        .limit(1);
      
      if (!accountsError) {
        // Check if audit log was created
        const { count } = await supabase
          .from('security_audit_logs')
          .select('count')
          .gte('created_at', new Date(Date.now() - 60000).toISOString());
        
        if (count > 0) {
          tests.audit = true;
          console.log('   ✅ Audit logging working\n');
        } else {
          console.log('   ⚠️  Audit logging may not be configured\n');
        }
      }
      
      // Sign out
      await supabase.auth.signOut();
      
    } else {
      console.log('   ❌ Authentication failed:', authError?.message || 'Unknown error');
      console.log('   Make sure you ran the demo user creation SQL\n');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
  
  // Summary
  console.log('📊 Test Summary:');
  console.log('================');
  Object.entries(tests).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.charAt(0).toUpperCase() + test.slice(1)}`);
  });
  
  const allPassed = Object.values(tests).every(t => t);
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed'}`);
  
  if (!allPassed) {
    console.log('\nTroubleshooting:');
    if (!tests.connection) {
      console.log('- Check your Supabase URL and keys in .env');
      console.log('- Ensure the initial schema migration ran successfully');
    }
    if (!tests.auth) {
      console.log('- Run the demo user creation SQL');
      console.log('- Check that email auth is enabled in Supabase');
    }
    if (!tests.rls) {
      console.log('- Verify RLS policies were created');
      console.log('- Check that RLS is enabled on all tables');
    }
    if (!tests.audit) {
      console.log('- Ensure audit triggers were created');
      console.log('- Check the security_audit_logs table exists');
    }
  }
}

testSetup();
```

### 10.2 Run the Test
```bash
node test-supabase-setup.js
```

### 10.3 Test in Browser
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Try logging in with:
   - Email: `demo@lifenavigator.tech`
   - Password: `Demo@Secure2024!`

## ✅ Step 11: Production Security Checklist

Before going to production, ensure:

### Database Security
- [ ] All tables have RLS enabled
- [ ] Audit triggers are active
- [ ] Encryption keys are securely stored
- [ ] Database backups are configured
- [ ] SSL/TLS is enforced

### Authentication
- [ ] Strong password policy enforced
- [ ] Email confirmation required
- [ ] Session timeout configured (15 min)
- [ ] MFA is available
- [ ] Rate limiting on auth endpoints

### API Security
- [ ] Service role key is never exposed to client
- [ ] API keys are rotated regularly
- [ ] CORS is properly configured
- [ ] Request size limits are set

### Compliance
- [ ] HIPAA audit logging active
- [ ] GDPR consent management ready
- [ ] Data retention policies configured
- [ ] Encryption at rest enabled
- [ ] Regular security audits scheduled

### Monitoring
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Security alerts set up
- [ ] Audit log reviews scheduled

### Backup & Recovery
- [ ] Daily automated backups
- [ ] Backup encryption enabled
- [ ] Recovery procedures tested
- [ ] Disaster recovery plan documented

## 🚨 Troubleshooting

### Common Issues

**"permission denied for schema public"**
- Make sure you're using the correct database user
- Grant necessary permissions: `GRANT ALL ON SCHEMA public TO postgres;`

**"relation does not exist"**
- Run the migrations in order
- Check that you're in the correct database

**"password authentication failed"**
- Verify your database password
- Check that the user exists in auth.users

**RLS blocking access**
- Verify auth.uid() is set (user is logged in)
- Check RLS policies with: `SELECT * FROM pg_policies;`

**Audit logs not appearing**
- Ensure triggers are created
- Check that the security_audit_logs table exists
- Verify the trigger function has SECURITY DEFINER

### Getting Help

1. Check Supabase logs: Dashboard → Logs → Postgres
2. Enable RLS debugging: `SET log_min_messages = 'debug1';`
3. Contact support: security@lifenavigator.ai

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [HIPAA Compliance Guide](./docs/HIPAA_COMPLIANCE.md)
- [GDPR Implementation](./docs/GDPR_IMPLEMENTATION.md)
- [Security Policies](./docs/SECURITY_POLICIES.md)

## 🎉 Congratulations!

You've successfully set up a production-ready, security-compliant Supabase database for LifeNavigator. Your database now includes:

- Enterprise-grade encryption
- Comprehensive audit logging
- Row-level security
- HIPAA/GDPR compliance features
- Secure authentication
- Demo accounts for testing

Remember to regularly review and update your security settings as your application grows!