-- =============================================
-- LIFENAVIGATOR DATABASE SCHEMA
-- =============================================
-- This migration creates a comprehensive, production-ready schema
-- with proper security, RLS policies, and performance optimizations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- For exclusion constraints

-- =============================================
-- CUSTOM TYPES AND ENUMS
-- =============================================

-- User subscription tiers
CREATE TYPE subscription_tier AS ENUM ('FREE', 'PRO', 'AI_AGENT', 'FAMILY');

-- Account types for financial accounts
CREATE TYPE account_type AS ENUM (
  'CHECKING', 'SAVINGS', 'CREDIT_CARD', 'LOAN', 'MORTGAGE',
  'INVESTMENT', 'RETIREMENT', 'CRYPTO', 'OTHER'
);

-- Transaction categories
CREATE TYPE transaction_category AS ENUM (
  'INCOME', 'HOUSING', 'TRANSPORTATION', 'FOOD', 'UTILITIES',
  'INSURANCE', 'HEALTHCARE', 'PERSONAL', 'ENTERTAINMENT',
  'EDUCATION', 'SHOPPING', 'INVESTMENT', 'OTHER'
);

-- Document types
CREATE TYPE document_type AS ENUM (
  'TAX_RETURN', 'W2', '1099', 'BANK_STATEMENT', 'INVESTMENT_STATEMENT',
  'INSURANCE_POLICY', 'MEDICAL_RECORD', 'RECEIPT', 'CONTRACT', 'OTHER'
);

-- Document processing status
CREATE TYPE processing_status AS ENUM (
  'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REQUIRES_REVIEW'
);

-- Health record types
CREATE TYPE health_record_type AS ENUM (
  'APPOINTMENT', 'LAB_RESULT', 'PRESCRIPTION', 'VACCINATION',
  'PROCEDURE', 'DIAGNOSIS', 'INSURANCE_CLAIM', 'OTHER'
);

-- Career status
CREATE TYPE career_status AS ENUM (
  'EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED', 'STUDENT', 'RETIRED'
);

-- =============================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  
  -- Subscription and account info
  subscription_tier subscription_tier DEFAULT 'FREE' NOT NULL,
  subscription_expires_at TIMESTAMPTZ,
  is_demo_account BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  -- Security fields
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret TEXT, -- Encrypted
  password_changed_at TIMESTAMPTZ DEFAULT NOW(),
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMPTZ,
  
  -- Preferences (JSONB for flexibility)
  preferences JSONB DEFAULT '{
    "theme": "light",
    "notifications": {
      "email": true,
      "push": false,
      "sms": false
    },
    "privacy": {
      "shareDataForInsights": true,
      "allowAnonymousAnalytics": true
    }
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT valid_phone CHECK (phone ~ '^\+?[1-9]\d{1,14}$' OR phone IS NULL)
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_subscription ON public.users(subscription_tier, subscription_expires_at);
CREATE INDEX idx_users_deleted ON public.users(deleted_at) WHERE deleted_at IS NOT NULL;

-- =============================================
-- FINANCIAL ACCOUNTS
-- =============================================

CREATE TABLE public.financial_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Account information
  name TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  account_type account_type NOT NULL,
  account_number_encrypted TEXT, -- Last 4 digits only, encrypted
  routing_number_encrypted TEXT, -- Encrypted
  
  -- Plaid integration
  plaid_account_id TEXT UNIQUE,
  plaid_access_token_encrypted TEXT, -- Encrypted
  plaid_item_id TEXT,
  
  -- Balance information
  current_balance DECIMAL(19, 4),
  available_balance DECIMAL(19, 4),
  credit_limit DECIMAL(19, 4),
  last_synced_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_manual BOOLEAN DEFAULT FALSE, -- Manual vs Plaid-connected
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT positive_balances CHECK (
    (current_balance IS NULL OR current_balance >= 0 OR account_type IN ('CREDIT_CARD', 'LOAN', 'MORTGAGE'))
  )
);

CREATE INDEX idx_financial_accounts_user ON public.financial_accounts(user_id, is_active);
CREATE INDEX idx_financial_accounts_plaid ON public.financial_accounts(plaid_item_id) WHERE plaid_item_id IS NOT NULL;

-- =============================================
-- TRANSACTIONS
-- =============================================

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.financial_accounts(id) ON DELETE CASCADE,
  
  -- Transaction details
  amount DECIMAL(19, 4) NOT NULL,
  currency_code CHAR(3) DEFAULT 'USD',
  transaction_date DATE NOT NULL,
  posted_date DATE,
  
  -- Description and categorization
  description TEXT NOT NULL,
  merchant_name TEXT,
  category transaction_category,
  subcategory TEXT,
  
  -- Plaid data
  plaid_transaction_id TEXT UNIQUE,
  plaid_category JSONB,
  
  -- User modifications
  user_description TEXT,
  user_category transaction_category,
  notes TEXT,
  tags TEXT[],
  
  -- Flags
  is_pending BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_account ON public.transactions(account_id, transaction_date DESC);
CREATE INDEX idx_transactions_category ON public.transactions(user_id, COALESCE(user_category, category));
CREATE INDEX idx_transactions_search ON public.transactions USING gin(
  to_tsvector('english', description || ' ' || COALESCE(merchant_name, '') || ' ' || COALESCE(notes, ''))
);

-- =============================================
-- DOCUMENTS
-- =============================================

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Document information
  name TEXT NOT NULL,
  document_type document_type NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- S3 storage
  s3_bucket TEXT NOT NULL,
  s3_key TEXT NOT NULL UNIQUE,
  s3_version_id TEXT,
  
  -- Encryption
  encryption_key_id TEXT NOT NULL, -- KMS key ID
  encrypted_metadata JSONB, -- Encrypted sensitive metadata
  
  -- Processing
  processing_status processing_status DEFAULT 'PENDING',
  ocr_text TEXT, -- Extracted text for search
  extracted_data JSONB, -- Structured data from OCR
  
  -- Organization
  folder_path TEXT DEFAULT '/',
  tags TEXT[],
  tax_year INT,
  
  -- Sharing
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with UUID[], -- Array of user IDs
  share_expires_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT valid_mime_type CHECK (mime_type ~ '^[a-zA-Z0-9][a-zA-Z0-9\/\-\+\.]*$'),
  CONSTRAINT valid_file_size CHECK (file_size_bytes > 0 AND file_size_bytes < 104857600) -- 100MB limit
);

CREATE INDEX idx_documents_user ON public.documents(user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_type ON public.documents(user_id, document_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_search ON public.documents USING gin(
  to_tsvector('english', name || ' ' || COALESCE(ocr_text, '') || ' ' || COALESCE(array_to_string(tags, ' '), ''))
);

-- =============================================
-- HEALTH RECORDS
-- =============================================

CREATE TABLE public.health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Record information
  record_type health_record_type NOT NULL,
  title TEXT NOT NULL,
  provider_name TEXT,
  provider_npi TEXT, -- National Provider Identifier
  
  -- Dates
  record_date DATE NOT NULL,
  next_due_date DATE,
  
  -- Details (encrypted)
  details_encrypted JSONB NOT NULL, -- Encrypted medical data
  
  -- Linked document
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_records_user ON public.health_records(user_id, record_date DESC);
CREATE INDEX idx_health_records_type ON public.health_records(user_id, record_type);
CREATE INDEX idx_health_records_due ON public.health_records(user_id, next_due_date) WHERE next_due_date IS NOT NULL;

-- =============================================
-- CAREER PROFILE
-- =============================================

CREATE TABLE public.career_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Current status
  status career_status NOT NULL,
  current_title TEXT,
  current_company TEXT,
  industry TEXT,
  years_experience INT DEFAULT 0,
  
  -- Career goals
  target_role TEXT,
  target_salary DECIMAL(12, 2),
  target_companies TEXT[],
  
  -- Skills and education
  skills TEXT[],
  certifications JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  
  -- Resume
  resume_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  linkedin_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_years_experience CHECK (years_experience >= 0 AND years_experience <= 100)
);

-- =============================================
-- INTEGRATIONS
-- =============================================

CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Integration details
  provider TEXT NOT NULL, -- 'plaid', 'google', 'coinbase', etc.
  account_id TEXT NOT NULL, -- External account ID
  
  -- OAuth tokens (encrypted)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Webhook
  webhook_url TEXT,
  webhook_secret_encrypted TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  error_count INT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_provider_account UNIQUE(user_id, provider, account_id)
);

CREATE INDEX idx_integrations_user ON public.integrations(user_id, provider) WHERE is_active = TRUE;

-- =============================================
-- AUDIT LOG
-- =============================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Event details
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  request_id UUID,
  
  -- Changes
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes included below
);

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_logs_event ON public.audit_logs(event_category, event_type, created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND deleted_at IS NULL);

-- Financial accounts policies
CREATE POLICY "Users can view own accounts" ON public.financial_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own accounts" ON public.financial_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON public.financial_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON public.financial_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (is_shared = TRUE AND auth.uid() = ANY(shared_with) AND (share_expires_at IS NULL OR share_expires_at > NOW()))
  );

CREATE POLICY "Users can create own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Health records policies
CREATE POLICY "Users can view own health records" ON public.health_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own health records" ON public.health_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health records" ON public.health_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health records" ON public.health_records
  FOR DELETE USING (auth.uid() = user_id);

-- Career profiles policies
CREATE POLICY "Users can view own career profile" ON public.career_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own career profile" ON public.career_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own career profile" ON public.career_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Integrations policies
CREATE POLICY "Users can view own integrations" ON public.integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own integrations" ON public.integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON public.integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON public.integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Audit logs policies (read-only for users)
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_accounts_updated_at BEFORE UPDATE ON public.financial_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON public.health_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_profiles_updated_at BEFORE UPDATE ON public.career_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log user actions
CREATE OR REPLACE FUNCTION log_user_action()
RETURNS TRIGGER AS $$
DECLARE
    user_id_val UUID;
    entity_type_val TEXT;
    entity_id_val UUID;
    event_type_val TEXT;
    old_vals JSONB;
    new_vals JSONB;
BEGIN
    -- Determine user_id based on table
    CASE TG_TABLE_NAME
        WHEN 'users' THEN 
            user_id_val := COALESCE(NEW.id, OLD.id);
        ELSE
            user_id_val := COALESCE(NEW.user_id, OLD.user_id);
    END CASE;
    
    -- Set entity information
    entity_type_val := TG_TABLE_NAME;
    entity_id_val := COALESCE(NEW.id, OLD.id);
    
    -- Determine event type
    event_type_val := TG_OP || '_' || TG_TABLE_NAME;
    
    -- Get old and new values for updates
    IF TG_OP = 'UPDATE' THEN
        old_vals := to_jsonb(OLD);
        new_vals := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        old_vals := to_jsonb(OLD);
    ELSIF TG_OP = 'INSERT' THEN
        new_vals := to_jsonb(NEW);
    END IF;
    
    -- Insert audit log
    INSERT INTO public.audit_logs (
        user_id,
        event_type,
        event_category,
        description,
        entity_type,
        entity_id,
        old_values,
        new_values
    ) VALUES (
        user_id_val,
        event_type_val,
        TG_OP,
        TG_OP || ' on ' || TG_TABLE_NAME,
        entity_type_val,
        entity_id_val,
        old_vals,
        new_vals
    );
    
    RETURN NULL;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Apply audit triggers to sensitive operations
CREATE TRIGGER audit_users_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION log_user_action();

CREATE TRIGGER audit_financial_accounts_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.financial_accounts
    FOR EACH ROW EXECUTE FUNCTION log_user_action();

CREATE TRIGGER audit_documents_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION log_user_action();

CREATE TRIGGER audit_integrations_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.integrations
    FOR EACH ROW EXECUTE FUNCTION log_user_action();

-- =============================================
-- DEMO ACCOUNT SETUP
-- =============================================

-- Function to create demo account with sample data
CREATE OR REPLACE FUNCTION create_demo_account()
RETURNS void AS $$
DECLARE
    demo_user_id UUID;
    demo_account_id UUID;
BEGIN
    -- Create demo user if not exists
    INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        '11111111-1111-1111-1111-111111111111',
        'demo@lifenavigator.ai',
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Demo User"}',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    demo_user_id := '11111111-1111-1111-1111-111111111111';
    
    -- Create user profile
    INSERT INTO public.users (id, email, name, is_demo_account, subscription_tier, onboarding_completed)
    VALUES (
        demo_user_id,
        'demo@lifenavigator.ai',
        'Demo User',
        TRUE,
        'PRO',
        TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
        is_demo_account = TRUE,
        subscription_tier = 'PRO',
        onboarding_completed = TRUE;
    
    -- Create demo financial accounts
    INSERT INTO public.financial_accounts (id, user_id, name, institution_name, account_type, current_balance, is_manual)
    VALUES 
        (uuid_generate_v4(), demo_user_id, 'Demo Checking', 'Demo Bank', 'CHECKING', 5432.10, TRUE),
        (uuid_generate_v4(), demo_user_id, 'Demo Savings', 'Demo Bank', 'SAVINGS', 15000.00, TRUE),
        (uuid_generate_v4(), demo_user_id, 'Demo Credit Card', 'Demo Bank', 'CREDIT_CARD', -1234.56, TRUE)
    ON CONFLICT DO NOTHING;
    
    -- Get a demo account ID for transactions
    SELECT id INTO demo_account_id FROM public.financial_accounts 
    WHERE user_id = demo_user_id AND account_type = 'CHECKING' LIMIT 1;
    
    -- Create demo transactions
    INSERT INTO public.transactions (user_id, account_id, amount, transaction_date, description, category)
    VALUES 
        (demo_user_id, demo_account_id, -45.23, CURRENT_DATE - INTERVAL '1 day', 'Whole Foods Market', 'FOOD'),
        (demo_user_id, demo_account_id, -12.99, CURRENT_DATE - INTERVAL '2 days', 'Netflix Subscription', 'ENTERTAINMENT'),
        (demo_user_id, demo_account_id, 3500.00, CURRENT_DATE - INTERVAL '5 days', 'Monthly Salary', 'INCOME'),
        (demo_user_id, demo_account_id, -89.00, CURRENT_DATE - INTERVAL '7 days', 'Electric Bill', 'UTILITIES'),
        (demo_user_id, demo_account_id, -250.00, CURRENT_DATE - INTERVAL '10 days', 'Car Insurance', 'INSURANCE')
    ON CONFLICT DO NOTHING;
    
    -- Create demo health record
    INSERT INTO public.health_records (user_id, record_type, title, provider_name, record_date, details_encrypted)
    VALUES (
        demo_user_id,
        'APPOINTMENT',
        'Annual Physical',
        'Demo Medical Center',
        CURRENT_DATE - INTERVAL '30 days',
        '{"encrypted": "demo_data"}'::jsonb
    )
    ON CONFLICT DO NOTHING;
    
    -- Create demo career profile
    INSERT INTO public.career_profiles (user_id, status, current_title, current_company, industry, years_experience, skills)
    VALUES (
        demo_user_id,
        'EMPLOYED',
        'Software Engineer',
        'Demo Tech Corp',
        'Technology',
        5,
        ARRAY['JavaScript', 'React', 'Node.js', 'PostgreSQL']
    )
    ON CONFLICT (user_id) DO UPDATE SET
        status = 'EMPLOYED',
        current_title = 'Software Engineer';
    
END;
$$ LANGUAGE plpgsql;

-- Execute demo account creation
SELECT create_demo_account();

-- =============================================
-- PERFORMANCE OPTIMIZATIONS
-- =============================================

-- Create partial indexes for common queries
CREATE INDEX idx_transactions_recent ON public.transactions(user_id, transaction_date DESC) 
WHERE transaction_date > CURRENT_DATE - INTERVAL '90 days';

CREATE INDEX idx_documents_unprocessed ON public.documents(processing_status, created_at) 
WHERE processing_status != 'COMPLETED';

-- Create composite indexes for complex queries
CREATE INDEX idx_financial_summary ON public.financial_accounts(user_id, account_type, is_active, current_balance);

-- =============================================
-- SECURITY FUNCTIONS
-- =============================================

-- Function to check if user is demo account (for blocking modifications)
CREATE OR REPLACE FUNCTION is_demo_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id AND is_demo_account = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to encrypt sensitive data (placeholder - implement with pgcrypto)
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT, key_id TEXT)
RETURNS TEXT AS $$
BEGIN
    -- In production, use pgcrypto with KMS-managed keys
    -- This is a placeholder that returns base64 encoded data
    RETURN encode(data::bytea, 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data (placeholder - implement with pgcrypto)
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data TEXT, key_id TEXT)
RETURNS TEXT AS $$
BEGIN
    -- In production, use pgcrypto with KMS-managed keys
    -- This is a placeholder that returns decoded data
    RETURN convert_from(decode(encrypted_data, 'base64'), 'UTF8');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- GRANTS FOR SUPABASE
-- =============================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to service role for admin operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================